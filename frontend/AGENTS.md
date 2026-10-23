# AGENTS.md

面向在本仓库工作的 AI 编码代理的项目说明。人类开发者也可将其作为快速上手文档。

## 项目概述

移动端列表缓存演示项目（vue3 + vue-router + vite）。核心是自研路由级长期缓存组件
`PageCache`（对标 vue-page-stack / 官方 KeepAlive，但按路由 key 缓存、离屏存 DOM、
不拦截路由）。UI 库 NutUI 4。数据来源为 `../backend` 的 NestJS 12 + SQLite
真实接口（不再使用 JSON mock）。

## 常用命令

```bash
# 前端（frontend/）
npm run dev         # vite 开发服务器（端口 5175，/api 代理到 backend）
npm run build       # 生产构建
npm run test:unit   # vitest 单元测试（tests/unit）
npm run test:e2e    # Playwright e2e（自动拉起 vite dev server + backend API）
npm run test        # 单测 + e2e
npm run typecheck   # vue-tsc --noEmit（含 .vue 文件）

# 后端（backend/，NestJS 12 + better-sqlite3，端口 3000）
npm run start:dev   # watch 模式启动（首次自动播种 50 订单 + 50 库存 + 字典）
npm run start       # 编译并启动（e2e 的 webServer 使用此命令）
npm run build       # 生产构建
```

- e2e 依赖 chromium：首次运行需 `npx playwright install chromium`。
- e2e 配置 `reuseExistingServer`：本地已有 5175/3000 端口服务会直接复用。
- 后端 SQLite 文件在 `backend/data/app.db`（gitignore）；删除后重启即重新播种。

## 目录结构与关键文件

```
backend/                      # NestJS 12 + SQLite 接口服务（端口 3000）
  src/main.ts                 # 全局前缀 api、CORS、ValidationPipe
  src/app.module.ts           # TypeORM(better-sqlite3) + 业务模块 + 播种
  src/database/seed.service.ts# 首次启动播种：订单 50 / 库存 50 / 字典 15
  src/modules/orders/         # 订单 CRUD（含供应商/工号扩展字段）
  src/modules/stocks/         # 库存 CRUD（编辑自动刷新 updateDate）
  src/modules/options/        # 选择页字典（material/supplier/staff）
src/
  app.vue                     # PageCache 的实际使用现场（router-view v-slot 包裹）
  api/order.ts                # 订单/字典接口（fetchOrderPage/createOrder...）
  api/stock.ts                # 库存接口（fetchStockPage/updateStock...）
  components/page-cache.ts    # ★ 核心缓存组件（对齐 Vue 3.5 KeepAlive 内部实现）
  utils/request.ts            # 极简 fetch 封装（/api 前缀 + 错误处理）
  utils/page-cache-control.ts # markPageRefresh 等硬刷新标记（普通 Set，非响应式）
  utils/list-keep-alive.ts    # 列表页滚动保存/恢复 + 刷新标记（onActivated 钩子）
  utils/selection-holder.ts   # 跨页选择结果暂存（选择页 -> 表单页回填）
  router/index.ts             # hash 路由（order 平级 + stock 嵌套三级），懒加载
  views/
    order/                    # 平级路由页面（.vue）
    select/                   # 选择页（.vue）
    stock/                    # ★ 三级路由 TSX 模块（布局 + 列表/详情/编辑/报表）
tests/
  unit/page-cache.spec.ts     # 参照 vue/core KeepAlive.spec.ts 的 30 个用例
  unit/page-cache-control.spec.ts
  e2e/page-cache.e2e.spec.ts  # 9 个真实浏览器场景（含三级路由嵌套缓存两组）
```

组件详细文档见 `docs/page-cache.md`。

## PageCache 关键约束（改代码前必读）

1. **内部通道实现**：组件标记 `__isKeepAlive: true` 骗过渲染器，通过
   `instance.ctx.activate/deactivate` 与渲染器通信。渲染器内部字段通过
   `InternalComponentInstance` / `InternalVNode` 结构类型访问（公开类型未暴露，
   运行时存在）。若升级 vue 大版本，需对照 `libs/core` KeepAlive 重新核对。
2. **activate 内的 key 对齐**（page-cache.ts 中已注释）：官方 KeepAlive 缓存 key
   即 vnode.key；本组件 `keyBy='path'` 时 query 变化会以不同 key 的 vnode 复用
   同一实例，必须对齐旧 vnode.key，否则 patch 走卸载分支会崩溃。删除该段会复现
   单测 `keyBy=path` 用例与 e2e 的失败。
3. **include 匹配的是缓存 key**（keyBy=path 时为 route.path；keyBy=fullPath 时含
   query，字符串模式是精确匹配；传 cacheKey 覆盖时匹配覆盖后的 key）。fullPath
   维度下用正则（如 `/^\/one/`）。
4. **勿与 `<keep-alive>` 或 vue-page-stack 叠用**包裹同一 router-view。
5. `utils/page-cache-control.ts` 的 Set 刻意不做成响应式：PageCache 在 render 中
   窥探 `hasPageRefresh`、渲染提交后消费 `consumePageRefresh`，改成 reactive
   会导致递归更新。
6. **两类自动防护勿删**：缓存条目与子组件类型不匹配时按未命中清理（防跨组件
   复用实例导致 activate patch 崩溃）；未加 :key 的子组件跨路由复用时清理旧
   key 条目并 dev 告警（防多缓存条目别名同一实例）。
7. **嵌套路由下顶层 router-view 的 key 必须用 rootKey 策略**（app.vue）：
   `matched.length > 1 ? matched[0].path : fullPath`。若统一用 fullPath，
   三级页面切换时 key 变化会把布局组件（连同其内部的嵌套 PageCache 与全部
   叶子缓存）卸载重建——列表缓存失效（已实测踩坑）。单级路由保持 fullPath
   语义不变。TSX 嵌套写法参考 `views/stock/stock-layout.tsx`。
8. **嵌套 PageCache 的生命周期绑定在宿主布局上**：离开该模块（布局卸载）时
   叶子缓存随之清空，重进模块列表重新挂载——这是"模块级缓存随布局存亡"的
   预期语义，非 bug；如需跨模块保留，把布局纳入顶层 PageCache 并配 cacheKey。

## 代码与提交约定

- TS strict；无独立 lint 配置，以 typecheck 为准。
- 注释使用中文，解释"为什么"并标注对应的 vue/core issue 号（如 #7105、#11831）。
- 不主动提交；提交信息跟随仓库既有风格（当前无历史，用简洁祈使句英文或中文均可）。

## 测试编写注意事项

**单元测试**（vitest + happy-dom，globals 已开）：
- 用 `mountApp()` 测试脚手架（memory history 路由 + PageCache 包裹），位于
  `tests/unit/page-cache.spec.ts` 顶部，新用例直接复用。
- 生命周期断言用 `assertHookCalls(view, [created, mounted, activated, deactivated, unmounted])`。
- 注意官方语义边界：不在 include 的页面挂载**不触发** activated；include 修剪
  当前活跃页面时，离开走真实 unmount（deactivated 不触发）。
- `findPageCacheInstance(root)` 可拿到组件实例读取 dev 期 `__v_cache` 断言缓存态。

**E2E 测试**（Playwright，已踩过的坑）：
1. NutUI 组件渲染为 `<view>` 自定义标签而非 `<button>`：`getByRole('button')`
   匹配不到，用 `page.locator('.nut-button', { hasText: '...' })`。
2. Playwright 点击前会把目标自动滚动进可视区：验证"滚动位置恢复"类场景时，
   必须点击滚动后仍可见的卡片（`visibleCard(page)` 即 nth(7)），点首张卡片会把
   容器滚回顶部污染断言。
3. 快速导航用例不可用 `page.goBack()` 连按——会退出 SPA 历史到 about:blank；
   循环导航用页头返回按钮（router.back），并在 `page.goto` 断言前保持 SPA 内跳转。
4. Transition `mode="out-in"` 在 happy-dom 下离场永远不完成（官方 KeepAlive
   同样卡住，环境限制），单测只覆盖 default 模式，out-in 需真实浏览器验证。
5. **真实点击 `nut-switch` 后紧接着点击按钮，按钮 click 偶发不触发**（无 JS
   报错、无 console 输出，页面停在原地；元素合成 click 无此问题）。两次点击间
   加 `waitForTimeout(300)` 规避，勿删。

## 其它

- 数据接口：`src/api/order.ts`、`src/api/stock.ts` 对接 backend（订单/库存各播种
  50 条，分页 pageSize=15）。界面上"列表请求：N 次"来自 `requestStats`/
  `stockRequestStats`（客户端 API 层计数），是 e2e 验证缓存命中的观测点。
- e2e 会对真实库产生写入（新增 1 条订单、编辑 1 条库存数值），属预期；需要干净
  数据时删除 `backend/data/app.db` 重启即可重新播种。

## 浏览器 MCP（辅助测试验证）

项目根 `kilo.json` 注册了 Playwright MCP（`npx @playwright/mcp@latest`），
提供真实浏览器操作能力（导航/截图/快照/console/network），用于：

- 复现 e2e 失败现场（配合 `npx playwright show-trace` 之外的手动复验）；
- 目测验证 PageCache 行为（滚动恢复、离屏 DOM、快速导航）；
- 查看 dev server 控制台与网络请求（`http://localhost:5175`，`npm run dev` 拉起）。

使用约定：

- MCP 定位是**辅助验证**，不是回归手段；可回归的结论必须落成
  `tests/e2e` 用例（快照/console 类只读工具已配置为自动放行，交互类默认询问）。
- 浏览器复用本仓库已安装的 chromium（`npx playwright install chromium`）。
- MCP 运行产物目录 `.playwright-mcp/` 已在 `.gitignore` 中，勿提交。
- 配置修改（`kilo.json`）需重启会话后生效。
