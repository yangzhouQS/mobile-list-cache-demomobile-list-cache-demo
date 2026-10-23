/**
 * PageCache 单元测试（参考 vue/core runtime-core/__tests__/components/KeepAlive.spec.ts）
 *
 * 覆盖：状态保留 / 生命周期 / vnode 钩子 / include 匹配 / 缓存修剪 /
 * LRU(max) / 硬刷新(markPageRefresh) / keyBy 维度 / DOM 离屏 /
 * 卸载清理 / 嵌套钩子 / 错误边界 / Transition / Suspense / vue-router 集成
 */
import {
  createApp,
  defineAsyncComponent,
  defineComponent,
  h,
  nextTick,
  onActivated,
  onDeactivated,
  ref,
  Suspense,
  Transition
} from 'vue'
import {
  createMemoryHistory,
  createRouter,
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  RouterView,
  useRoute
} from 'vue-router'
import { PageCache } from '../../src/components/page-cache'
import type { RouteMatchPattern } from '../../src/components/page-cache'
import { markPageRefresh } from '../../src/utils/page-cache-control'
import type { Component } from 'vue'

const timeout = (n: number = 0) => new Promise((r) => setTimeout(r, n))

/** 与官方 KeepAlive.spec 相同的可观测视图：五类生命周期钩子计数 + 可变状态 */
const createSpyView = (name: string) =>
  defineComponent({
    name,
    data() {
      return { msg: name }
    },
    methods: {
      bump() {
        this.msg += '!'
      }
    },
    render() {
      return h('div', [
        h('span', { class: 'view-msg' }, this.msg),
        h('button', { class: 'view-bump', onClick: this.bump }, 'bump')
      ])
    },
    created: vi.fn(),
    mounted: vi.fn(),
    activated: vi.fn(),
    deactivated: vi.fn(),
    unmounted: vi.fn()
  })

type SpyView = ReturnType<typeof createSpyView>

/** [created, mounted, activated, deactivated, unmounted] */
function assertHookCalls(view: SpyView, callCounts: number[]) {
  expect([
    (view.created as unknown as ReturnType<typeof vi.fn>).mock.calls.length,
    (view.mounted as unknown as ReturnType<typeof vi.fn>).mock.calls.length,
    (view.activated as unknown as ReturnType<typeof vi.fn>).mock.calls.length,
    (view.deactivated as unknown as ReturnType<typeof vi.fn>).mock.calls.length,
    (view.unmounted as unknown as ReturnType<typeof vi.fn>).mock.calls.length
  ]).toEqual(callCounts)
}

interface MountOptions {
  include?: RouteMatchPattern
  includeRef?: { value: RouteMatchPattern }
  exclude?: RouteMatchPattern
  excludeRef?: { value: RouteMatchPattern }
  max?: number | string
  keyBy?: 'path' | 'fullPath'
  views: Record<string, Component>
  initial?: string
  childProps?: Record<string, unknown>
  /** PageCache 的子节点包一层 Suspense（验证 PageCache > Suspense > async） */
  suspense?: boolean
  /** PageCache 外层包一层 Transition（文档推荐的 Transition > KeepAlive 顺序） */
  transition?: boolean | { mode?: 'out-in' }
  /** 传入 app.config.errorHandler，捕获生命周期钩子内抛出的错误 */
  onError?: (err: unknown) => void
  /** 子组件是否带 :key（默认按 route.fullPath 加 key） */
  childKey?: boolean
  /** 显式覆盖缓存 key（对应 PageCache 的 cacheKey prop） */
  cacheKey?: string
}

interface TestCtx {
  router: ReturnType<typeof createRouter>
  root: HTMLElement
  app: ReturnType<typeof createApp>
  nav: (path: string) => Promise<void>
  destroy: () => void
}

const mountedApps: Array<{ app: ReturnType<typeof createApp>; root: HTMLElement }> = []

async function mountApp(options: MountOptions): Promise<TestCtx> {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: Object.entries(options.views).map(([path, component]) => ({
      path,
      component: component as any
    }))
  })
  await router.push(options.initial ?? Object.keys(options.views)[0])
  await router.isReady()

  const App = defineComponent({
    name: 'TestApp',
    setup() {
      const route = useRoute()
      return () =>
        h(RouterView, null, {
          default: ({ Component }: { Component: Component | null }) => {
            if (!Component) return null
            // PageCache 的子节点：可选包一层 Suspense（Suspense 在 PageCache 内部）
            const childProps = {
              ...(options.childKey === false ? {} : { key: route.fullPath }),
              ...(options.childProps ?? {})
            }
            const child = () =>
              options.suspense
                ? h(Suspense, null, () => [h(Component as any, childProps)])
                : h(Component as any, childProps)
            const pageCache = () =>
              h(
                PageCache,
                {
                  include: options.includeRef ? options.includeRef.value : options.include!,
                  exclude: options.excludeRef ? options.excludeRef.value : options.exclude,
                  max: options.max,
                  keyBy: options.keyBy,
                  cacheKey: options.cacheKey
                },
                () => [child()]
              )
            if (options.transition) {
              const tProps =
                typeof options.transition === 'object' ? options.transition : {}
              return h(Transition, { name: 'fade', ...tProps }, () => [pageCache()])
            }
            return pageCache()
          }
        })
    }
  })

  const app = createApp(App)
  app.use(router)
  app.config.warnHandler = () => {} // 静默测试期无关警告
  if (options.onError) {
    app.config.errorHandler = (err) => options.onError!(err)
  }
  const root = document.createElement('div')
  document.body.appendChild(root)
  app.mount(root)
  mountedApps.push({ app, root })
  await nextTick()

  return {
    router,
    root,
    app,
    nav: async (path) => {
      await router.push(path)
      await nextTick()
      await nextTick()
    },
    destroy: () => {
      app.unmount()
      root.remove()
    }
  }
}

/** 从任意页面 DOM 元素向上找到 PageCache 组件实例（读取 dev 期 __v_cache） */
function findPageCacheInstance(root: HTMLElement): any {
  const el = root.querySelector('.view-bump') as any
  let inst = el?.__vueParentComponent
  while (inst && inst.type?.name !== 'PageCache') {
    inst = inst.parent
  }
  return inst
}

beforeEach(() => {
  mountedApps.length = 0
})

afterEach(() => {
  while (mountedApps.length) {
    const { app, root } = mountedApps.pop()!
    app.unmount()
    root.remove()
  }
})

describe('PageCache', () => {
  test('should preserve state', async () => {
    const one = createSpyView('one')
    const two = createSpyView('two')
    const ctx = await mountApp({
      include: ['/one', '/two'],
      views: { '/one': one, '/two': two },
      initial: '/one'
    })

    expect(ctx.root.textContent).toContain('one')
    ;(ctx.root.querySelector('.view-bump') as HTMLElement).click()
    await nextTick()
    expect(ctx.root.textContent).toContain('one!')

    await ctx.nav('/two')
    expect(ctx.root.textContent).toContain('two')

    await ctx.nav('/one')
    expect(ctx.root.textContent).toContain('one!')
    assertHookCalls(one, [1, 1, 2, 1, 0])
    assertHookCalls(two, [1, 1, 1, 1, 0])
  })

  test('should call correct lifecycle hooks', async () => {
    const one = createSpyView('one')
    const two = createSpyView('two')
    const ctx = await mountApp({
      include: ['/one', '/two'],
      views: { '/one': one, '/two': two },
      initial: '/one'
    })
    assertHookCalls(one, [1, 1, 1, 0, 0])

    await ctx.nav('/two')
    assertHookCalls(one, [1, 1, 1, 1, 0])
    assertHookCalls(two, [1, 1, 1, 0, 0])

    await ctx.nav('/one')
    assertHookCalls(one, [1, 1, 2, 1, 0])
    assertHookCalls(two, [1, 1, 1, 1, 0])
  })

  test('should call correct vnode hooks', async () => {
    const onVnodeMounted = vi.fn()
    const onVnodeUnmounted = vi.fn()
    const one = createSpyView('one')
    const two = createSpyView('two')
    const ctx = await mountApp({
      include: ['/one', '/two'],
      views: { '/one': one, '/two': two },
      initial: '/one',
      childProps: { onVnodeMounted, onVnodeUnmounted }
    })

    expect(onVnodeMounted).toHaveBeenCalledTimes(1)
    await ctx.nav('/two')
    // 离开缓存页 one：触发 onVnodeUnmounted；挂载 two：触发 onVnodeMounted
    expect(onVnodeUnmounted).toHaveBeenCalledTimes(1)
    expect(onVnodeMounted).toHaveBeenCalledTimes(2)
    await ctx.nav('/one')
    // 激活缓存实例 one：触发 onVnodeMounted
    expect(onVnodeMounted).toHaveBeenCalledTimes(3)
  })

  test('should match include by comma string / regex / mixed array', async () => {
    for (const include of ['/one,/two', /^\/(one|two)$/, ['/one', /two/]] as RouteMatchPattern[]) {
      const one = createSpyView('one')
      const two = createSpyView('two')
      const ctx = await mountApp({
        include,
        views: { '/one': one, '/two': two },
        initial: '/one'
      })
      await ctx.nav('/two')
      await ctx.nav('/one')
      assertHookCalls(one, [1, 1, 2, 1, 0])
      assertHookCalls(two, [1, 1, 1, 1, 0])
      ctx.destroy()
    }
  })

  test('should not cache routes not in include', async () => {
    const one = createSpyView('one')
    const two = createSpyView('two')
    const ctx = await mountApp({
      include: ['/one'],
      views: { '/one': one, '/two': two },
      initial: '/one'
    })

    await ctx.nav('/two')
    await ctx.nav('/one')
    await ctx.nav('/two')
    // two 每次真实挂载/卸载，不留缓存（最后一次到达仍活跃）
    assertHookCalls(two, [2, 2, 0, 0, 1])
    assertHookCalls(one, [1, 1, 2, 2, 0])
  })

  test('exclude takes precedence over include', async () => {
    const one = createSpyView('one')
    const two = createSpyView('two')
    const ctx = await mountApp({
      include: ['/one', '/two'],
      exclude: ['/two'],
      views: { '/one': one, '/two': two },
      initial: '/one'
    })

    await ctx.nav('/two')
    await ctx.nav('/one')
    await ctx.nav('/two')
    assertHookCalls(two, [2, 2, 0, 0, 1])
    assertHookCalls(one, [1, 1, 2, 2, 0])
  })

  test('prunes cache on include change', async () => {
    const one = createSpyView('one')
    const two = createSpyView('two')
    const includeRef = ref<RouteMatchPattern>(['/one', '/two'])
    const ctx = await mountApp({
      includeRef,
      views: { '/one': one, '/two': two },
      initial: '/one'
    })

    await ctx.nav('/two')
    assertHookCalls(one, [1, 1, 1, 1, 0])

    // 从 include 移除 /one：缓存实例被修剪卸载
    includeRef.value = ['/two']
    await nextTick()
    await nextTick()
    assertHookCalls(one, [1, 1, 1, 1, 1])

    // 再次到达：全新实例（已不在 include，挂载不再触发 activated）
    await ctx.nav('/one')
    assertHookCalls(one, [2, 2, 1, 1, 1])
  })

  test('prunes cache on exclude change', async () => {
    const one = createSpyView('one')
    const two = createSpyView('two')
    const excludeRef = ref<RouteMatchPattern>([])
    const ctx = await mountApp({
      include: ['/one', '/two'],
      excludeRef,
      views: { '/one': one, '/two': two },
      initial: '/one'
    })

    await ctx.nav('/two')
    assertHookCalls(two, [1, 1, 1, 0, 0])

    // exclude 收紧：当前活跃实例不立即卸载（离开时才真实卸载）
    excludeRef.value = ['/two']
    await nextTick()
    await nextTick()
    assertHookCalls(two, [1, 1, 1, 0, 0])

    await ctx.nav('/one')
    assertHookCalls(two, [1, 1, 1, 0, 1])

    await ctx.nav('/two')
    assertHookCalls(two, [2, 2, 1, 0, 1])
  })

  test('should not prune current active instance on include change', async () => {
    const one = createSpyView('one')
    const two = createSpyView('two')
    const includeRef = ref<RouteMatchPattern>(['/one', '/two'])
    const ctx = await mountApp({
      includeRef,
      views: { '/one': one, '/two': two },
      initial: '/one'
    })

    // 停留在 /one 时移出 include：不立即卸载
    includeRef.value = ['/two']
    await nextTick()
    await nextTick()
    assertHookCalls(one, [1, 1, 1, 0, 0])

    // 离开时真实卸载（deactivate 不触发，官方 KeepAlive 同款行为）
    await ctx.nav('/two')
    assertHookCalls(one, [1, 1, 1, 0, 1])
  })

  test('max: prunes least recently used entry', async () => {
    const a = createSpyView('a')
    const b = createSpyView('b')
    const c = createSpyView('c')
    const ctx = await mountApp({
      include: ['/a', '/b', '/c'],
      max: 2,
      views: { '/a': a, '/b': b, '/c': c },
      initial: '/a'
    })

    await ctx.nav('/b')
    await ctx.nav('/a') // a 命中变最新，b 成为最旧
    await ctx.nav('/c') // 超出 max=2：淘汰 b
    assertHookCalls(b, [1, 1, 1, 1, 1])
    assertHookCalls(a, [1, 1, 2, 2, 0])
    assertHookCalls(c, [1, 1, 1, 0, 0])

    // b 重新进入：淘汰的是 a（当前最久未使用）
    await ctx.nav('/b')
    assertHookCalls(b, [2, 2, 2, 1, 1])
    assertHookCalls(a, [1, 1, 2, 2, 1])
    assertHookCalls(c, [1, 1, 1, 1, 0])
  })

  test('markPageRefresh: next arrival renders fresh and replaces cache entry', async () => {
    const one = createSpyView('one')
    const two = createSpyView('two')
    const ctx = await mountApp({
      include: ['/one', '/two'],
      views: { '/one': one, '/two': two },
      initial: '/one'
    })

    ;(ctx.root.querySelector('.view-bump') as HTMLElement).click()
    await ctx.nav('/two')

    markPageRefresh('/one')
    await ctx.nav('/one')
    // 旧实例卸载，全新实例挂载，旧状态丢失
    assertHookCalls(one, [2, 2, 2, 1, 1])
    expect(ctx.root.textContent).toContain('one')
    expect(ctx.root.textContent).not.toContain('one!')

    // 新实例进入缓存
    await ctx.nav('/two')
    await ctx.nav('/one')
    assertHookCalls(one, [2, 2, 3, 2, 1])
    expect(ctx.root.textContent).not.toContain('one!')
  })

  test('keyBy=path: query change reuses the same instance', async () => {
    const one = createSpyView('one')
    const two = createSpyView('two')
    const ctx = await mountApp({
      include: ['/one'],
      keyBy: 'path',
      views: { '/one': one, '/two': two },
      initial: '/one?x=1'
    })
    assertHookCalls(one, [1, 1, 1, 0, 0])

    await ctx.nav('/one?x=2')
    // 同 path 不同 query：同一实例 deactivate->activate，不重建
    assertHookCalls(one, [1, 1, 2, 1, 0])

    await ctx.nav('/two')
    await ctx.nav('/one?x=1')
    assertHookCalls(one, [1, 1, 3, 2, 0])
  })

  test('keyBy=fullPath: query change creates a separate cached instance', async () => {
    const one = createSpyView('one')
    const ctx = await mountApp({
      // fullPath 维度下 include 需按完整地址匹配（字符串精确或正则前缀）
      include: [/^\/one/],
      keyBy: 'fullPath',
      views: { '/one': one, '/two': createSpyView('two') },
      initial: '/one?x=1'
    })

    await ctx.nav('/one?x=2')
    assertHookCalls(one, [2, 2, 2, 1, 0])

    const pc = findPageCacheInstance(ctx.root)
    expect(pc.__v_cache.size).toBe(2)

    // x=2 实例的可变状态保留在其自身缓存条目中
    ;(ctx.root.querySelector('.view-bump') as HTMLElement).click()
    await nextTick()
    expect(ctx.root.textContent).toContain('one!')
    await ctx.nav('/one?x=1')
    expect(ctx.root.textContent).not.toContain('one!')
    await ctx.nav('/one?x=2')
    expect(ctx.root.textContent).toContain('one!')
    assertHookCalls(one, [2, 2, 4, 3, 0])
  })

  test('deactivated DOM is moved off-document (no overlay blocking)', async () => {
    const one = createSpyView('one')
    const two = createSpyView('two')
    const ctx = await mountApp({
      include: ['/one'],
      views: { '/one': one, '/two': two },
      initial: '/one'
    })

    const oneEl = ctx.root.querySelector('.view-msg')!.parentElement!
    expect(oneEl.isConnected).toBe(true)

    await ctx.nav('/two')
    // 离屏容器不在文档中：缓存页面不可能遮挡/拦截交互
    expect(oneEl.isConnected).toBe(false)
    expect(ctx.root.contains(oneEl)).toBe(false)

    await ctx.nav('/one')
    expect(oneEl.isConnected).toBe(true)
  })

  test('unmounting PageCache unmounts all cached instances', async () => {
    const one = createSpyView('one')
    const two = createSpyView('two')
    const ctx = await mountApp({
      include: ['/one', '/two'],
      views: { '/one': one, '/two': two },
      initial: '/one'
    })
    await ctx.nav('/two')
    ctx.destroy()
    // one（离屏缓存）与 two（当前活跃，补触发 deactivated）都被真实卸载
    assertHookCalls(one, [1, 1, 1, 1, 1])
    assertHookCalls(two, [1, 1, 1, 1, 1])
  })

  test('descendant onActivated/onDeactivated hooks fire', async () => {
    const childA = vi.fn()
    const childD = vi.fn()
    const one = defineComponent({
      name: 'one',
      setup() {
        onActivated(childA)
        onDeactivated(childD)
        return () => h('div', { class: 'view-one' }, 'one')
      }
    })
    const ctx = await mountApp({
      include: ['/one'],
      views: { '/one': one, '/two': createSpyView('two') },
      initial: '/one'
    })

    expect(childA).toHaveBeenCalledTimes(1)
    await ctx.nav('/two')
    expect(childD).toHaveBeenCalledTimes(1)
    await ctx.nav('/one')
    expect(childA).toHaveBeenCalledTimes(2)
  })

  test('error thrown in activated hook does not break subsequent renders', async () => {
    const errors: unknown[] = []
    const one = defineComponent({
      name: 'one',
      setup() {
        onActivated(() => {
          throw new Error('boom')
        })
        return () => h('div', { class: 'view-one' }, 'one')
      }
    })
    const two = createSpyView('two')
    const ctx = await mountApp({
      include: ['/one', '/two'],
      views: { '/one': one, '/two': two },
      initial: '/one',
      onError: (err) => errors.push(err)
    })

    await ctx.nav('/two')
    await ctx.nav('/one')
    // 激活钩子抛错由 errorHandler 捕获，不影响后续导航
    expect(ctx.root.textContent).toContain('one')
    expect(errors.length).toBeGreaterThan(0)
    await ctx.nav('/two')
    expect(ctx.root.textContent).toContain('two')
  })

  test('works under Transition wrapper (instance reused after leave/enter)', async () => {
    const one = createSpyView('one')
    const two = createSpyView('two')
    const ctx = await mountApp({
      include: ['/one', '/two'],
      transition: true,
      views: { '/one': one, '/two': two },
      initial: '/one'
    })

    ;(ctx.root.querySelector('.view-bump') as HTMLElement).click()
    await nextTick()
    await ctx.nav('/two')
    await timeout(30)
    await ctx.nav('/one')
    await timeout(30)

    assertHookCalls(one, [1, 1, 2, 1, 0])
    expect(ctx.root.textContent).toContain('one!')
  })

  test('caches async component after Suspense resolves', async () => {
    const lazyLoaded = createSpyView('lazy-loaded')
    let loadCount = 0
    const lazyRoute = defineAsyncComponent(() => {
      loadCount += 1
      return new Promise<Component>((resolve) => {
        setTimeout(() => resolve(lazyLoaded as any), 10)
      })
    })
    const two = createSpyView('two')
    const ctx = await mountApp({
      include: ['/lazy', '/two'],
      suspense: true,
      views: { '/lazy': lazyRoute, '/two': two },
      initial: '/two'
    })

    await ctx.nav('/lazy')
    await timeout(50) // 等待异步组件 resolve + suspense 换枝
    await nextTick()
    expect(loadCount).toBe(1)
    expect(ctx.root.textContent).toContain('lazy-loaded')

    await ctx.nav('/two')
    await nextTick()
    // 离开：缓存实例不卸载
    expect((lazyLoaded.unmounted as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(0)

    await ctx.nav('/lazy')
    await timeout(50)
    // 从缓存恢复：loader 不重跑、实例不重建
    expect(loadCount).toBe(1)
    expect((lazyLoaded.created as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1)
    expect(ctx.root.textContent).toContain('lazy-loaded')
  })

  test('vue-router: leave guards re-register through deactivate/activate without leaking', async () => {
    const leaveGuard = vi.fn(() => true)
    const updateGuard = vi.fn(() => true)
    const one = defineComponent({
      name: 'one',
      setup() {
        onBeforeRouteLeave(leaveGuard)
        onBeforeRouteUpdate(updateGuard)
        return () => h('div', { class: 'view-one' }, 'one')
      }
    })
    const ctx = await mountApp({
      include: ['/one'],
      views: { '/one': one, '/two': createSpyView('two') },
      initial: '/one'
    })

    await ctx.nav('/two')
    expect(leaveGuard).toHaveBeenCalledTimes(1)

    await ctx.nav('/one')
    await ctx.nav('/two')
    // 若激活时重复注册守卫，这里会被调用 2 次共 3
    expect(leaveGuard).toHaveBeenCalledTimes(2)

    // 回到 /one 后同路由 query 变化：update 守卫正常触发
    await ctx.nav('/one')
    await ctx.nav('/one?x=1')
    expect(updateGuard).toHaveBeenCalledTimes(1)
  })

  test('exposes cache map in dev for tests/devtools', async () => {
    const ctx = await mountApp({
      include: ['/one'],
      views: { '/one': createSpyView('one'), '/two': createSpyView('two') },
      initial: '/one'
    })
    const pc = findPageCacheInstance(ctx.root)
    expect(pc).toBeTruthy()
    expect(pc.__v_cache.size).toBe(1)
    await ctx.nav('/one')
    expect(pc.__v_cache.size).toBe(1)
  })

  test('warns and cleans stale entry when unkeyed child spans multiple cache keys', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const shared = createSpyView('shared')
      const ctx = await mountApp({
        include: ['/a', '/b'],
        childKey: false,
        views: { '/a': shared, '/b': shared },
        initial: '/a'
      })
      const pc = findPageCacheInstance(ctx.root)
      expect(pc.__v_cache.size).toBe(1)

      // 同组件不加 key 跨路由：原地更新复用实例，旧 key 条目被清理并告警
      await ctx.nav('/b')
      expect(pc.__v_cache.size).toBe(1)
      expect(warnSpy).toHaveBeenCalled()
      expect((shared.created as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1)

      await ctx.nav('/a')
      expect(pc.__v_cache.size).toBe(1)
      expect((shared.created as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1)
    } finally {
      warnSpy.mockRestore()
    }
  })

  test('cacheKey prop overrides route-derived key (same component reuses one entry)', async () => {
    const shared = createSpyView('shared')
    const ctx = await mountApp({
      // cacheKey 覆盖时 include 匹配的是覆盖后的 key
      include: ['/fixed'],
      cacheKey: '/fixed',
      views: { '/a': shared, '/b': shared },
      initial: '/a'
    })

    ;(ctx.root.querySelector('.view-bump') as HTMLElement).click()
    await ctx.nav('/b')
    // 同一 key + 同一组件：跨路由复用同一实例（activate 内 key 对齐）
    assertHookCalls(shared, [1, 1, 2, 1, 0])
    expect(ctx.root.textContent).toContain('shared!')
  })

  test('cache entry is not reused across different component types', async () => {
    const one = createSpyView('one')
    const two = createSpyView('two')
    const ctx = await mountApp({
      include: ['/fixed'],
      cacheKey: '/fixed',
      views: { '/one': one, '/two': two },
      initial: '/one'
    })

    await ctx.nav('/two')
    // 类型不匹配：one 的旧条目被清理。清理时 one 是当前活跃实例（resetShapeFlag
    // 语义），离开走真实 unmount（deactivated 不触发），two 全新挂载
    assertHookCalls(one, [1, 1, 1, 0, 1])
    assertHookCalls(two, [1, 1, 1, 0, 0])

    await ctx.nav('/one')
    assertHookCalls(two, [1, 1, 1, 0, 1])
    assertHookCalls(one, [2, 2, 2, 0, 1])
  })

  test('max=1 keeps only the latest entry', async () => {
    const a = createSpyView('a')
    const b = createSpyView('b')
    const ctx = await mountApp({
      include: ['/a', '/b'],
      max: 1,
      views: { '/a': a, '/b': b },
      initial: '/a'
    })

    await ctx.nav('/b')
    // 进入 b 即淘汰 a：max=1 下修剪的是当前活跃条目（对齐官方 resetShapeFlag
    // 语义）——离开走真实 unmount，deactivated 不触发
    assertHookCalls(a, [1, 1, 1, 0, 1])
    await ctx.nav('/a')
    // 回到 a 又淘汰 b，a 全新渲染
    assertHookCalls(a, [2, 2, 2, 0, 1])
    assertHookCalls(b, [1, 1, 1, 0, 1])
  })

  test('in-place include mutation (splice) prunes cache', async () => {
    const one = createSpyView('one')
    const two = createSpyView('two')
    const includeRef = ref<RouteMatchPattern>(['/one', '/two'])
    const ctx = await mountApp({
      includeRef,
      views: { '/one': one, '/two': two },
      initial: '/one'
    })

    await ctx.nav('/two')
    // 原地变异（而非整体替换）也要触发修剪
    ;(includeRef.value as string[]).splice(1)
    await nextTick()
    await nextTick()
    // 当前活跃实例不立即卸载
    assertHookCalls(two, [1, 1, 1, 0, 0])

    await ctx.nav('/one')
    assertHookCalls(two, [1, 1, 1, 0, 1])
    await ctx.nav('/two')
    assertHookCalls(two, [2, 2, 1, 0, 1])
  })

  test('error thrown in deactivated hook does not break navigation', async () => {
    const errors: unknown[] = []
    const one = defineComponent({
      name: 'one',
      setup() {
        onDeactivated(() => {
          throw new Error('deactivate-boom')
        })
        return () => h('div', { class: 'view-one' }, 'one')
      }
    })
    const two = createSpyView('two')
    const ctx = await mountApp({
      include: ['/one', '/two'],
      views: { '/one': one, '/two': two },
      initial: '/one',
      onError: (err) => errors.push(err)
    })

    await ctx.nav('/two')
    expect(ctx.root.textContent).toContain('two')
    expect(errors.length).toBeGreaterThan(0)

    await ctx.nav('/one')
    expect(ctx.root.textContent).toContain('one')
    await ctx.nav('/two')
    expect(ctx.root.textContent).toContain('two')
  })

  test('unmounting releases all cached DOM nodes', async () => {
    const one = createSpyView('one')
    const two = createSpyView('two')
    const ctx = await mountApp({
      include: ['/one', '/two'],
      views: { '/one': one, '/two': two },
      initial: '/one'
    })
    const oneInner = ctx.root.querySelector('.view-msg')!.parentElement!
    await ctx.nav('/two')
    const twoInner = ctx.root.querySelector('.view-msg')!.parentElement!
    // one 已离屏（不在文档中），two 活跃
    expect(oneInner.isConnected).toBe(false)
    expect(twoInner.isConnected).toBe(true)

    ctx.destroy()
    expect(twoInner.isConnected).toBe(false)
  })

  test('keyBy=fullPath with max prunes LRU across query variants', async () => {
    const one = createSpyView('one')
    const ctx = await mountApp({
      include: [/^\/one/],
      keyBy: 'fullPath',
      max: 2,
      views: { '/one': one, '/two': createSpyView('two') },
      initial: '/one?x=1'
    })

    await ctx.nav('/one?x=2')
    await ctx.nav('/one?x=3') // 超出 max=2：淘汰最旧的 x=1
    const pc = findPageCacheInstance(ctx.root)
    expect(pc.__v_cache.size).toBe(2)

    // x=1 已被淘汰：全新渲染；x=1 重新进入又淘汰 x=2（累计卸载 2 次）
    await ctx.nav('/one?x=1')
    assertHookCalls(one, [4, 4, 4, 3, 2])
  })

  test('same-flush double navigation settles on the final route without errors', async () => {
    const one = createSpyView('one')
    const two = createSpyView('two')
    const three = createSpyView('three')
    const ctx = await mountApp({
      include: ['/one', '/two', '/three'],
      views: { '/one': one, '/two': two, '/three': three },
      initial: '/one'
    })

    // 不 await 第一次跳转，同 flush 内二次跳转（第一次被取消）
    await Promise.allSettled([
      ctx.router.push('/two').catch(() => undefined),
      ctx.router.push('/three')
    ])
    await nextTick()
    await nextTick()

    expect(ctx.root.textContent).toContain('three')
    // 中途被取代的导航不应留下半渲染状态
    await ctx.nav('/one')
    expect(ctx.root.textContent).toContain('one')
    assertHookCalls(one, [1, 1, 2, 1, 0])
  })
})
