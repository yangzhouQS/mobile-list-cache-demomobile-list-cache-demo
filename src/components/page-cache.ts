import {
  Comment,
  callWithAsyncErrorHandling,
  cloneVNode,
  defineComponent,
  ErrorCodes,
  getCurrentInstance,
  isVNode,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  queuePostFlushCb,
  setTransitionHooks,
  watch
} from 'vue'
import { useRoute } from 'vue-router'
import type { ComponentInternalInstance, PropType, VNode } from 'vue'
import { consumePageRefresh } from '../utils/page-cache-control'

/**
 * PageCache：路由级长期缓存组件（对齐 Vue 3.5 KeepAlive 内部实现）
 *
 * 与 vue-page-stack（按导航顺序的页面栈，页面常驻文档内堆叠）不同：
 * - 不追踪导航方式，push/back/go/replace 任意方式到达均生效
 * - 按路由 key（path 或 fullPath）长期缓存指定页面，离开时 DOM 移入
 *   文档外离屏容器（不拦截交互），到达时由渲染器 activate 移回并复用实例
 * - 到达时通过刷新标记（markPageRefresh）决定是否跳过缓存全新渲染
 *
 * 原理（与官方 KeepAlive 相同的内部通道）：组件标记 __isKeepAlive 骗过 Vue
 * 渲染器，使其把本组件当作 KeepAlive 容器——子 vnode 带
 * COMPONENT_SHOULD_KEEP_ALIVE(256) 被换下时走 ctx.deactivate（DOM 移入
 * 离屏容器 + 触发 onDeactivated）；复用缓存时把 el/component 拷贝到新 vnode
 * 并标 COMPONENT_KEPT_ALIVE(512)，挂载走 ctx.activate（DOM 移回 + 触发
 * onActivated）。
 *
 * 已移植的核心修复（对应 vue/core KeepAlive）：
 * - #7105 pruneCacheEntry 用 isSameVNodeType 判断当前实例，避免误卸载活跃实例
 * - #1621/#1511 命中渲染路径的 vnode 可能被克隆/规范化，统一在
 *   mounted/updated 中缓存 instance.subTree；Suspense 场景延迟到 resolve 后
 * - #11831 deactivate 时 invalidateMount 取消尚未执行的 mounted/activated 钩子
 * - #11717 不在缓存范围时清除 SHOULD_KEEP_ALIVE 标志，保证真实卸载
 * - LRU：keys 记录新鲜度，配合 max 淘汰最久未使用条目
 */

const SHAPE_FLAGS = {
  STATEFUL_COMPONENT: 4,
  SUSPENSE: 128,
  /** COMPONENT_SHOULD_KEEP_ALIVE：被换下时走 deactivate 而非真实卸载 */
  COMPONENT_SHOULD_KEEP_ALIVE: 256,
  /** COMPONENT_KEPT_ALIVE：挂载时走 ctx.activate 复用缓存实例 */
  COMPONENT_KEPT_ALIVE: 512
}

/** renderer MoveType：ENTER/LEAVE，与 move() 的 insertType 参数对应 */
const MOVE_TYPE = { ENTER: 0, LEAVE: 1 } as const

/** scheduler SchedulerJobFlags.DISPOSED（vue >= 3.5 生命周期钩子标志位） */
const SCHEDULER_JOB_DISPOSED = 1 << 3

/** include/exclude 匹配模式：字符串（逗号分隔）/ 正则 / 数组 */
export type RouteMatchPattern = string | RegExp | Array<string | RegExp>

/** Suspense 边界最小结构（内部接口，仅用于效果队列路由） */
interface SuspenseBoundaryLike {
  pendingBranch: boolean
  effects: Function[]
}

/**
 * 公开类型未暴露、但运行时存在的内部字段（与官方 KeepAlive 使用的
 * 渲染器内部通道一致）
 */
interface InternalComponentInstance extends Omit<ComponentInternalInstance, 'ctx'> {
  ctx: PageCacheSharedContext & { [key: string]: unknown }
  suspense: SuspenseBoundaryLike | null
  a: Function[] | null
  m: Function[] | null
  da: Function[] | null
}

interface PageCacheSharedContext {
  renderer?: {
    p: Function
    m: Function
    um: Function
    o: { createElement: (tag: string) => HTMLElement }
  }
  activate?: Function
  deactivate?: Function
}

/** 运行时存在但公开类型未标注的 vnode 内部字段 */
type InternalVNode = VNode & {
  ssContent?: VNode
  suspense?: SuspenseBoundaryLike | null
  slotScopeIds?: string[]
}

const asInternal = (i: ComponentInternalInstance | null): InternalComponentInstance =>
  i as unknown as InternalComponentInstance

const isSuspenseType = (type: unknown) =>
  (type as { __isSuspense?: boolean }).__isSuspense === true

const getInnerChild = (vnode: VNode): VNode =>
  vnode.shapeFlag & SHAPE_FLAGS.SUSPENSE ? (vnode as InternalVNode).ssContent! : vnode

/** 与 Vue 内部 isSameVNodeType 等价（未从 vue 公共入口导出） */
const isSameVNodeType = (n1: VNode, n2: VNode): boolean =>
  n1.type === n2.type && n1.key === n2.key

const resetShapeFlag = (vnode: VNode) => {
  vnode.shapeFlag &= ~SHAPE_FLAGS.COMPONENT_SHOULD_KEEP_ALIVE
  vnode.shapeFlag &= ~SHAPE_FLAGS.COMPONENT_KEPT_ALIVE
}

/** 与 Vue 内部 invokeVNodeHook 等价：以 (vnode) 为参数、实例为调用方触发 vnode 钩子 */
const invokeVNodeHook = (hook: Function, instance: ComponentInternalInstance | null, vnode: VNode) => {
  callWithAsyncErrorHandling(hook, instance, ErrorCodes.VNODE_HOOK, [vnode])
}

/** 与 scheduler 的 queuePostFlushCb 一致：支持数组展开 */
const invokeArrayFns = (fns: Function[]) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i]()
  }
}

/**
 * 对齐 renderer 的 invalidateMount：将尚未执行的 mounted/activated 钩子标记为
 * DISPOSED（vue >= 3.5）。deactivate 一个“挂载尚未完成”的组件时，避免其后
 * mounted/activated 再补触发（#11831）。旧版本无 flags 字段时为安全 no-op。
 */
const invalidateMount = (hooks: Function[] | null | undefined) => {
  if (!hooks) {
    return
  }
  for (let i = 0; i < hooks.length; i++) {
    const fn = hooks[i] as Function & { flags?: number }
    if (typeof fn.flags === 'number') {
      fn.flags |= SCHEDULER_JOB_DISPOSED
    }
  }
}

/** 对齐 KeepAlive 的 matches()：字符串（逗号分隔）/ 正则 / 数组 */
const matches = (pattern: RouteMatchPattern, key: string): boolean => {
  if (Array.isArray(pattern)) {
    return pattern.some((p) => matches(p, key))
  }
  if (typeof pattern === 'string') {
    return pattern.split(',').includes(key)
  }
  if (pattern instanceof RegExp) {
    pattern.lastIndex = 0
    return pattern.test(key)
  }
  return false
}

/** 对齐 renderer.queueEffectWithSuspense：Suspense 未决时效果进入其队列 */
const queueEffectInto = (
  suspense: SuspenseBoundaryLike | null,
  fn: Function | Function[]
) => {
  if (suspense && suspense.pendingBranch) {
    if (Array.isArray(fn)) {
      suspense.effects.push(...fn)
    } else {
      suspense.effects.push(fn)
    }
  } else {
    queuePostFlushCb(fn as never)
  }
}

export const PageCache = defineComponent({
  name: 'PageCache',
  __isKeepAlive: true,
  props: {
    /** 需要长期缓存的路由 key 列表（与 keyBy 对应：path 或 fullPath） */
    include: {
      type: [String, RegExp, Array] as PropType<RouteMatchPattern>,
      required: true
    },
    /** 排除的路由 key（优先于 include 命中） */
    exclude: {
      type: [String, RegExp, Array] as PropType<RouteMatchPattern>,
      default: undefined
    },
    /** 缓存上限（LRU，超出淘汰最久未访问的条目） */
    max: {
      type: [Number, String] as PropType<number | string>,
      default: undefined
    },
    /** 缓存 key 维度：path=同路径共享一个实例（query 变化不新建）；fullPath=按完整地址 */
    keyBy: {
      type: String as PropType<'path' | 'fullPath'>,
      default: 'path'
    }
  },
  setup(props, { slots }) {
    const instance = asInternal(getCurrentInstance())
    const sharedContext = instance.ctx
    const route = useRoute()

    // 内部渲染器未注册（SSR）：直接透出子节点
    if (!sharedContext.renderer) {
      return () => {
        const children = slots.default?.()
        return children && children.length === 1 ? children[0] : children
      }
    }

    /** 路由 key -> 已缓存 vnode（长期保留，仅受 include/max 控制淘汰） */
    const cache = new Map<string, VNode>()
    /** LRU 新鲜度记录（最近访问的 key 排到末尾） */
    const keys = new Set<string>()
    let current: VNode | null = null
    let pendingCacheKey: string | null = null

    const parentSuspense = (instance.suspense ?? null) as SuspenseBoundaryLike | null
    const {
      renderer: {
        p: patch,
        m: move,
        um: _unmount,
        o: { createElement }
      }
    } = sharedContext
    const storageContainer = createElement('div')

    if (import.meta.env?.DEV) {
      // 对齐官方 KeepAlive 的 devtools/测试观察口
      ;(instance as unknown as { __v_cache: Map<string, VNode> }).__v_cache = cache
    }

    /** 对齐 renderer.queuePostRenderEffect：Suspense 未决时进入其效果队列 */
    const queuePostEffect = (fn: Function | Function[]) => {
      queueEffectInto(parentSuspense, fn)
    }

    sharedContext.activate = (
      vnode: VNode,
      container: HTMLElement,
      anchor: unknown,
      namespace: unknown,
      optimized: boolean
    ) => {
      const componentInstance = asInternal(vnode.component)
      move(vnode, container, anchor, MOVE_TYPE.ENTER, parentSuspense)
      // 官方 KeepAlive 的缓存 key 就是 vnode.key，activate 内 patch 的新旧
      // vnode 必然同型同 key；本组件按路由 key 缓存（keyBy=path 时 query 变化
      // 会以不同 key 的 vnode 复用同一实例），此处对齐旧 vnode 的 key，使
      // patch 走"组件更新"而非"卸载重挂"（否则会错误触发 deactivate 分支）
      if (
        componentInstance.vnode.type === vnode.type &&
        componentInstance.vnode.key !== vnode.key
      ) {
        componentInstance.vnode.key = vnode.key
      }
      // props 可能已变化：patch 到当前 vnode
      patch(
        componentInstance.vnode,
        vnode,
        container,
        anchor,
        componentInstance,
        parentSuspense,
        namespace,
        (vnode as InternalVNode).slotScopeIds,
        optimized
      )
      queuePostEffect(() => {
        componentInstance.isDeactivated = false
        if (componentInstance.a) {
          invokeArrayFns(componentInstance.a)
        }
        const vnodeHook = vnode.props?.onVnodeMounted as Function | undefined
        if (vnodeHook) {
          invokeVNodeHook(vnodeHook, asInternal(componentInstance.parent), vnode)
        }
      })
    }

    sharedContext.deactivate = (vnode: VNode) => {
      const componentInstance = asInternal(vnode.component)
      // 取消尚未执行的 mounted/activated（#11831）
      invalidateMount(componentInstance.m)
      invalidateMount(componentInstance.a)

      move(vnode, storageContainer, null, MOVE_TYPE.LEAVE, parentSuspense)
      queuePostEffect(() => {
        if (componentInstance.da) {
          invokeArrayFns(componentInstance.da)
        }
        const vnodeHook = vnode.props?.onVnodeUnmounted as Function | undefined
        if (vnodeHook) {
          invokeVNodeHook(vnodeHook, asInternal(componentInstance.parent), vnode)
        }
        componentInstance.isDeactivated = true
      })
    }

    const unmount = (vnode: VNode) => {
      // 重置标志位，使其可以被真实卸载
      resetShapeFlag(vnode)
      _unmount(vnode, instance, parentSuspense, true)
    }

    const pruneCacheEntry = (key: string) => {
      const cached = cache.get(key)
      if (cached && (!current || !isSameVNodeType(cached, current))) {
        // 非当前活跃实例：直接卸载缓存实例
        unmount(cached)
      } else if (current) {
        // 当前活跃实例不能立即卸载，先重置标志，待其离开时真实卸载
        resetShapeFlag(current)
      }
      cache.delete(key)
      keys.delete(key)
    }

    // include/exclude 变化后修剪缓存（post 时机保证 current 已更新）
    watch(
      () => [props.include, props.exclude],
      ([include, exclude]) => {
        const stale: string[] = []
        cache.forEach((_vnode, key) => {
          const matched =
            (include ? matches(include, key) : true) &&
            !(exclude && matches(exclude, key))
          if (!matched) {
            stale.push(key)
          }
        })
        for (const key of stale) {
          pruneCacheEntry(key)
        }
      },
      { flush: 'post', deep: true }
    )

    // 渲染后缓存子树
    const cacheSubtree = () => {
      if (pendingCacheKey == null) {
        return
      }
      const subTree = instance.subTree
      if (isSuspenseType(subTree.type)) {
        // Suspense 未 resolve 前不能缓存占位内容，延迟到该 Suspense
        // resolve 之后（对齐官方 queuePostRenderEffect(cb, subTree.suspense)）
        const suspense = (subTree as InternalVNode).suspense ?? null
        queueEffectInto(suspense, () => {
          const vnode = getInnerChild(subTree)
          if (vnode.component) {
            cache.set(pendingCacheKey!, vnode)
          }
        })
      } else {
        cache.set(pendingCacheKey, getInnerChild(subTree))
      }
    }
    onMounted(cacheSubtree)
    onUpdated(cacheSubtree)

    onBeforeUnmount(() => {
      cache.forEach((cached) => {
        const vnode = getInnerChild(instance.subTree)
        if (cached.type === vnode.type && cached.key === vnode.key) {
          // 当前活跃实例随容器一起卸载：仅重置标志，但补触发 deactivated 钩子
          resetShapeFlag(vnode)
          const da = asInternal(vnode.component)?.da
          if (da) {
            queuePostEffect(da)
          }
          return
        }
        unmount(cached)
      })
      cache.clear()
      keys.clear()
    })

    return () => {
      pendingCacheKey = null

      if (!slots.default) {
        current = null
        return null
      }

      const children = slots.default()
      const rawVNode = children[0]
      if (
        children.length > 1 ||
        !isVNode(rawVNode) ||
        (!(rawVNode.shapeFlag & SHAPE_FLAGS.STATEFUL_COMPONENT) &&
          !(rawVNode.shapeFlag & SHAPE_FLAGS.SUSPENSE))
      ) {
        if (import.meta.env?.DEV && children.length > 1) {
          console.warn('[PageCache] should contain exactly one component child.')
        }
        current = null
        return children.length > 1 ? children : rawVNode
      }

      let vnode = getInnerChild(rawVNode)
      // #6028 Suspense ssContent 可能是注释占位节点，跳过缓存
      if (vnode.type === Comment) {
        current = null
        return vnode
      }

      const cacheKey = props.keyBy === 'fullPath' ? route.fullPath : route.path
      const included =
        matches(props.include, cacheKey) &&
        !(props.exclude && matches(props.exclude, cacheKey))

      if (!included) {
        // 不在缓存范围：清掉标志位，走正常挂载/卸载（#11717）
        vnode.shapeFlag &= ~SHAPE_FLAGS.COMPONENT_SHOULD_KEEP_ALIVE
        current = vnode
        return rawVNode
      }

      let cachedVNode = cache.get(cacheKey)

      if (cachedVNode && consumePageRefresh(cacheKey)) {
        // 到达时决定不用缓存：清除旧实例（卸载需延迟到 post，渲染期不能同步卸载），
        // 本次全新渲染并覆盖缓存条目
        const stale = cachedVNode
        cache.delete(cacheKey)
        keys.delete(cacheKey)
        if (!current || !isSameVNodeType(stale, current)) {
          queuePostFlushCb(() => unmount(stale))
        } else {
          // 正停留在该页面时标记刷新：重置标志使离开时真实卸载
          resetShapeFlag(stale)
        }
        cachedVNode = undefined
      }

      // 命中的 vnode 可能被复用（vnode.el 存在），后续要修改它，必须克隆
      if (vnode.el) {
        vnode = cloneVNode(vnode)
        if (rawVNode.shapeFlag & SHAPE_FLAGS.SUSPENSE) {
          ;(rawVNode as InternalVNode).ssContent = vnode
        }
      }
      // #1511 返回的 vnode 可能因 attr 透传/scopeId 被再次克隆，真正挂载的
      // 是规范化后的 instance.subTree，因此不直接缓存当前 vnode，而是记录
      // pendingCacheKey 在 mounted/updated 中缓存
      pendingCacheKey = cacheKey

      if (cachedVNode) {
        // 拷贝挂载状态，复用缓存实例
        vnode.el = cachedVNode.el
        vnode.component = cachedVNode.component
        if (vnode.transition) {
          setTransitionHooks(vnode, vnode.transition)
        }
        vnode.shapeFlag |= SHAPE_FLAGS.COMPONENT_KEPT_ALIVE
        // LRU：标记为最新
        keys.delete(cacheKey)
        keys.add(cacheKey)
      } else {
        keys.add(cacheKey)
        // LRU：超出上限淘汰最久未访问条目
        if (props.max && keys.size > parseInt(String(props.max), 10)) {
          pruneCacheEntry(keys.values().next().value!)
        }
      }
      // 避免被真实卸载
      vnode.shapeFlag |= SHAPE_FLAGS.COMPONENT_SHOULD_KEEP_ALIVE

      current = vnode
      return isSuspenseType(rawVNode.type) ? rawVNode : vnode
    }
  }
})
