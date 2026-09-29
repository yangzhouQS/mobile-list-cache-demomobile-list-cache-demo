# PageCache 路由级长期缓存组件

`src/components/page-cache.ts` — 对齐 Vue 3.5 官方 KeepAlive 内部实现的路由级缓存组件，
为移动端"列表 → 详情/编辑 → 返回保持状态"场景设计。

## 为什么不用现成方案

| 方案 | 问题 |
|---|---|
| vue-page-stack | 页面栈堆叠在文档内，快速导航/transition 中断后状态不同步，旧页面浮层挡住点击，历史上出现过"卡死"；拦截路由导航，与其它守卫叠加易出边界问题 |
| 官方 `<keep-alive>` | 按组件 key 缓存，不感知路由；路由级缓存需要使用方自行拼 key、自行管理 include |

PageCache 复用官方 KeepAlive 的渲染器内部通道（`__isKeepAlive` 标记 +
`ctx.activate/deactivate`），DOM 由渲染器统一调度，离屏页面移出文档——
vue-page-stack 的遮挡类卡死根因不存在；同时按路由 key 缓存，任意到达方式
（push / back / go / replace）均生效。

## Props

| Prop | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| `include` | `string \| RegExp \| Array<string \| RegExp>` | 是 | — | 需要缓存的路由 key 白名单。字符串为逗号分隔精确匹配，正则做前缀/模糊匹配 |
| `exclude` | 同上 | 否 | — | 排除名单，优先于 include 命中 |
| `max` | `number \| string` | 否 | — | 缓存条目上限，超出按 LRU 淘汰最久未访问的条目 |
| `keyBy` | `'path' \| 'fullPath'` | 否 | `'path'` | 缓存 key 维度 |

**include 匹配的是缓存 key**：

- `keyBy='path'`（默认）：key 为 `route.path`，query 变化复用同一实例；
- `keyBy='fullPath'`：key 含 query，每个完整地址独立缓存。此时 include 用字符串
  是精确匹配（含 query），一般用正则：`include: [/^\/order-list/]`。

## 基本用法

```vue
<router-view v-slot="{ Component }">
  <page-cache :include="cacheRoutes">
    <component :is="Component" :key="$route.fullPath"></component>
  </page-cache>
</router-view>
```

```ts
import { PageCache } from './components/page-cache'

// path 维度白名单（本项目实际用法）
const cacheRoutes = ['/order-list']

// 更完整的配置示例
// <page-cache :include="/^\/(order|stock)-list/" exclude="/stock-list-preview" :max="8">
```

子组件的 `:key="$route.fullPath"` 是推荐写法：同路径 query 变化时组件仍复用缓存实例
（keyBy=path），不同路径天然区分。

## 配套工具

### page-cache-control（硬刷新标记）

```ts
markPageRefresh('/order-list')   // 标记：下一次到达该路由时跳过缓存全新渲染
consumePageRefresh(path)         // 组件内部在 render 期消费（勿手动调用）
clearPageRefresh()               // 清空全部标记
```

Set 刻意非响应式：render 期消费副作用若用 reactive 会造成递归更新。

### list-keep-alive（列表页滚动/刷新钩子）

```ts
useListKeepAlive({
  listKey: 'order-list',
  getScrollEl: () => scrollRef.value,   // 缺省用 window 滚动
  onRefresh: () => fetchList()          // 收到刷新标记时执行
})
```

- 路由离开守卫时保存 scrollTop（此时 DOM 尚未移动，读数准确；onDeactivated
  时读到的已是 0，这是刻意不用它的原因）；
- onActivated 时：有 `markListRefresh` 标记 → onRefresh + 回顶；否则恢复滚动位置。

### backToList（受控返回）

```ts
backToList(router, { listKey: 'order-list', routePath: '/order-list', refresh })
```

- `refresh: false`：返回保持位置（详情/取消返回）
- `refresh: true`：复用缓存实例，触发 onRefresh 拉新数据（编辑保存，开关可控）
- `refresh: 'hard'`：打 markPageRefresh，下次到达跳过缓存全新渲染（新增保存）

### selection-holder（跨页回填）

选择页 `setPendingSelection(type, option)` 后 `router.back()`；表单页在
onMounted + onActivated 双路径 `takePendingSelection(type)` 消费。

## 行为语义（与官方 KeepAlive 一致）

1. **生命周期**：首次挂载触发 mounted + activated；离开缓存页触发 deactivated
   （不 unmount）；再次到达触发 activated（不重新 mounted）。
2. **不在 include 的页面**：正常挂载/卸载，挂载**不触发** activated。
3. **include/exclude 收紧修剪**：离屏缓存实例立即 unmount；当前活跃实例只重置
   标志位，离开时走真实 unmount（deactivated 不触发）。
4. **max/LRU**：每次命中会把 key 标记为最新，超限淘汰最久未访问条目。
5. **markPageRefresh 到达**：旧缓存实例 unmount、全新实例挂载并覆盖缓存条目。
6. **keyBy=path + query 变化**：同实例 deactivate → activate 一对钩子，状态保留。
7. **vnode 钩子**：deactivate 触发 `onVnodeUnmounted`、activate 触发
   `onVnodeMounted`（vue-router RouterView 依赖此行为清理/回填实例引用）。
8. **容器卸载**：所有缓存实例真实 unmount，当前活跃实例补触发 deactivated。

## 与 vue-router / Transition / Suspense 的协作

- vue-router 的 `onBeforeRouteUpdate/onBeforeRouteLeave` 在页面 deactivate 时
  注销、activate 时重注册（vue-router 内部行为），单测覆盖了"不重复注册"。
- Transition：按官方推荐顺序 `Transition > PageCache > component` 使用即可，
  `setTransitionHooks` 已处理（单测覆盖）。
- Suspense：`PageCache > Suspense > 异步组件` 场景下，延迟到 Suspense resolve
  后才缓存真实内容（对齐官方 #1621 修复）。

## 注意事项

1. **不要**与 `<keep-alive>` 或 vue-page-stack 叠用包裹同一 router-view。
2. 缓存页面常驻实例：`window/document` 级监听器、定时器必须在 onDeactivated
   清理、onActivated 重建，否则会累积（KeepAlive 类方案共同约束）。
3. 无 max 时缓存条目数 = include 命中的路由数，路由级白名单下天然有界；
   fullPath 维度 + 正则 include 时建议配合 max。
4. 组件依赖 Vue 渲染器内部字段（公开类型未暴露，运行时存在），升级 vue 大版本
   需对照 `libs/core/packages/runtime-core/src/components/KeepAlive.ts` 复核。
5. 开发环境下实例暴露 `__v_cache`（Map），可用于测试/调试观察缓存态。

## 测试

```bash
npm run test:unit   # tests/unit/page-cache.spec.ts：21 个用例（生命周期/修剪/LRU/
                    # 硬刷新/keyBy/离屏 DOM/Transition/Suspense/vue-router 守卫）
npm run test:e2e    # tests/e2e/page-cache.e2e.spec.ts：6 个真实浏览器场景
                    # （缓存往返/滚动恢复/push/replace/硬刷新/表单回填/快速导航无卡死）
```

单元测试脚手架与断言工具（`mountApp` / `assertHookCalls` / `findPageCacheInstance`）
位于 spec 文件顶部，新用例直接复用；编写注意事项见根目录 AGENTS.md。
