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
import type { PropType, VNode } from 'vue'
import { consumePageRefresh } from '../utils/page-cache-control'

/**
 * PageCache：路由级长期缓存组件（参考 vue-page-stack / Vue KeepAlive 实现）
 *
 * 与 vue-page-stack（按导航顺序的页面栈）不同：
 * - 不追踪导航方式，push/back/go/replace 任意方式到达均生效
 * - 按路由 key（path 或 fullPath）长期缓存指定页面，弹栈/离开不销毁
 * - 到达时通过刷新标记（markPageRefresh）决定是否跳过缓存全新渲染
 *
 * 原理：组件标记 __isKeepAlive 骗过 Vue 渲染器，使其把本组件当作 KeepAlive
 * 容器——子 vnode 带 SHOULD_KEEP_ALIVE(256) 被换下时走 ctx.deactivate（DOM 移入
 * 离屏容器 + 触发 onDeactivated）；复用缓存时把 el/component 拷贝到新 vnode 并
 * 标 KEPT_ALIVE(512)，挂载走 ctx.activate（DOM 移回 + 触发 onActivated）。
 */

const SHAPE_FLAGS = {
  STATEFUL_COMPONENT: 4,
  SUSPENSE: 128,
  /** COMPONENT_SHOULD_KEEP_ALIVE：被换下时走 deactivate 而非真实卸载 */
  COMPONENT_SHOULD_KEEP_ALIVE: 256,
  /** COMPONENT_KEPT_ALIVE：挂载时走 ctx.activate 复用缓存实例 */
  COMPONENT_KEPT_ALIVE: 512
}

const isSuspenseType = (type: unknown) => (type as { __isSuspense?: boolean }).__isSuspense === true

const getInnerChild = (vnode: VNode): VNode =>
  vnode.shapeFlag & SHAPE_FLAGS.SUSPENSE ? vnode.ssContent : vnode

const resetShapeFlag = (vnode: VNode) => {
  vnode.shapeFlag &= ~SHAPE_FLAGS.COMPONENT_SHOULD_KEEP_ALIVE
  vnode.shapeFlag &= ~SHAPE_FLAGS.COMPONENT_KEPT_ALIVE
}

/** 与 Vue 内部 invokeVNodeHook 等价：以 (vnode) 为参数、实例为调用方触发 vnode 钩子 */
const invokeVNodeHook = (hook: Function, instance: unknown, vnode: VNode) => {
  callWithAsyncErrorHandling(hook, instance, ErrorCodes.VNODE_HOOK, [vnode])
}

export const PageCache = defineComponent({
  name: 'PageCache',
  __isKeepAlive: true,
  props: {
    /** 需要长期缓存的路由 key 列表（与 keyBy 对应：path 或 fullPath） */
    include: {
      type: Array as PropType<string[]>,
      required: true
    },
    /** 缓存 key 维度：path=同路径共享一个实例（query 变化不新建）；fullPath=按完整地址 */
    keyBy: {
      type: String as PropType<'path' | 'fullPath'>,
      default: 'path'
    }
  },
  setup(props, { slots }) {
    const instance = getCurrentInstance()
    const sharedContext = instance!.ctx
    const route = useRoute()

    if (!sharedContext.renderer) {
      return () => {
        const children = slots.default?.()
        return children && children.length === 1 ? children[0] : children
      }
    }

    /** 路由 key -> 已缓存 vnode（长期保留，不随导航清理） */
    const cache = new Map<string, VNode>()
    let current: VNode | null = null
    let pendingCacheKey: string | null = null

    const parentSuspense = instance!.suspense
    const {
      renderer: {
        p: patch,
        m: move,
        um: _unmount,
        o: { createElement }
      }
    } = sharedContext
    const storageContainer = createElement('div')

    sharedContext.activate = (vnode: VNode, container: HTMLElement, anchor: unknown, namespace: unknown, optimized: boolean) => {
      const componentInstance = vnode.component!
      move(vnode, container, anchor, 0, parentSuspense)
      patch(
        componentInstance.vnode,
        vnode,
        container,
        anchor,
        componentInstance,
        parentSuspense,
        namespace,
        vnode.slotScopeIds,
        optimized
      )
      queuePostFlushCb(() => {
        componentInstance.isDeactivated = false
        if (componentInstance.a) {
          for (const hook of componentInstance.a) hook()
        }
        const vnodeHook = vnode.props?.onVnodeMounted as Function | undefined
        if (vnodeHook) {
          invokeVNodeHook(vnodeHook, componentInstance.parent, vnode)
        }
      })
    }

    sharedContext.deactivate = (vnode: VNode) => {
      const componentInstance = vnode.component!
      move(vnode, storageContainer, null, 1, parentSuspense)
      queuePostFlushCb(() => {
        if (componentInstance.da) {
          for (const hook of componentInstance.da) hook()
        }
        const vnodeHook = vnode.props?.onVnodeUnmounted as Function | undefined
        if (vnodeHook) {
          invokeVNodeHook(vnodeHook, componentInstance.parent, vnode)
        }
        componentInstance.isDeactivated = true
      })
    }

    const unmountCached = (vnode: VNode) => {
      resetShapeFlag(vnode)
      _unmount(vnode, instance, parentSuspense, true)
    }

    const cacheSubtree = () => {
      if (pendingCacheKey != null) {
        cache.set(pendingCacheKey, getInnerChild(instance!.subTree))
      }
    }
    onMounted(cacheSubtree)
    onUpdated(cacheSubtree)

    onBeforeUnmount(() => {
      cache.forEach(cached => {
        if (cached === current) {
          resetShapeFlag(cached)
          return
        }
        unmountCached(cached)
      })
      cache.clear()
    })

    watch(
      () => props.include,
      () => {
        cache.forEach((cached, key) => {
          if (props.include.includes(key)) {
            return
          }
          cache.delete(key)
          if (cached === current) {
            resetShapeFlag(cached)
          } else {
            queuePostFlushCb(() => unmountCached(cached))
          }
        })
      },
      { flush: 'post', deep: true }
    )

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
        current = null
        return children.length > 1 ? children : rawVNode
      }

      let vnode = getInnerChild(rawVNode)
      if (vnode.type === Comment) {
        current = null
        return vnode
      }

      const cacheKey = props.keyBy === 'fullPath' ? route.fullPath : route.path

      if (!props.include.includes(cacheKey)) {
        // 不在缓存范围：清掉标志位，走正常挂载/卸载
        vnode.shapeFlag &= ~SHAPE_FLAGS.COMPONENT_SHOULD_KEEP_ALIVE
        current = vnode
        return rawVNode
      }

      let cachedVNode = cache.get(cacheKey)
      if (cachedVNode && consumePageRefresh(cacheKey)) {
        // 到达时决定不用缓存：清除旧实例，本次全新渲染并覆盖缓存条目
        cache.delete(cacheKey)
        if (cachedVNode === current) {
          resetShapeFlag(cachedVNode)
        } else {
          const stale = cachedVNode
          queuePostFlushCb(() => unmountCached(stale))
        }
        cachedVNode = undefined
      }

      if (vnode.el) {
        vnode = cloneVNode(vnode)
        if (rawVNode.shapeFlag & SHAPE_FLAGS.SUSPENSE) {
          rawVNode.ssContent = vnode
        }
      }
      pendingCacheKey = cacheKey

      if (cachedVNode) {
        vnode.el = cachedVNode.el
        vnode.component = cachedVNode.component
        if (vnode.transition) {
          setTransitionHooks(vnode, vnode.transition)
        }
        vnode.shapeFlag |= SHAPE_FLAGS.COMPONENT_KEPT_ALIVE
      }
      vnode.shapeFlag |= SHAPE_FLAGS.COMPONENT_SHOULD_KEEP_ALIVE
      current = vnode
      return isSuspenseType(rawVNode.type) ? rawVNode : vnode
    }
  }
})
