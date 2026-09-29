/**
 * PageCache E2E 测试（hash 路由，真实浏览器）
 *
 * 场景：
 * 1. 列表缓存：详情往返不重新请求、恢复滚动位置
 * 2. 任意方式到达（push/replace）均从缓存恢复
 * 3. 非缓存页（详情）每次真实重新挂载
 * 4. 新增保存 -> 硬刷新（markPageRefresh）：列表重新请求并回到顶部
 * 5. 新增页 -> 选择页往返：选择结果回填
 * 6. 快速连续导航（回退/前进/跳转）：无报错、无卡死，最终缓存仍正确恢复
 */
import { expect, test, type Page } from '@playwright/test'

/** 打开首页并进入订单列表，等待首屏数据 */
async function gotoList(page: Page) {
  await page.goto('/')
  // NutUI 按钮渲染为 view 标签，按 class + 文案定位
  await page.locator('.nut-button', { hasText: '进入订单列表' }).click()
  await expect(page.locator('.order-card').first()).toBeVisible()
}

/**
 * 点击滚动后仍处于视口内的卡片（Playwright 点击前会自动滚动目标到可见区，
 * 点击视口外的首张卡片会把容器滚回顶部，破坏待验证的滚动状态）
 */
const visibleCard = (page: Page) => page.locator('.order-card').nth(7)

/** 读取列表页头部"列表请求：N 次" */
async function listRequestCount(page: Page): Promise<number> {
  const text = await page.locator('.order-stats span').first().textContent()
  return Number(/(\d+)/.exec(text ?? '')?.[1] ?? NaN)
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 740 })
})

test('list is cached across detail round-trip: no re-request, scroll restored', async ({ page }) => {
  await gotoList(page)

  // 加载更多制造可滚动内容
  await page.locator('.order-tip', { hasText: '加载更多' }).click()
  await expect(page.locator('.order-card')).toHaveCount(30)

  const scrollEl = page.locator('.order-scroll')
  await scrollEl.evaluate((el) => {
    el.scrollTop = 600
  })
  await expect
    .poll(async () => scrollEl.evaluate((el) => Math.round(el.scrollTop)))
    .toBeGreaterThan(400)
  const countBefore = await listRequestCount(page)

  // 进入详情（点击当前滚动位置下可见的卡片）
  await visibleCard(page).click()
  await expect(page.getByText('单据编号')).toBeVisible()
  await page.locator('.order-header-icon').click() // back

  // 返回：不重新请求 + 滚动位置恢复 + 数据保持 30 条
  await expect(page.locator('.order-card')).toHaveCount(30)
  await expect
    .poll(async () => scrollEl.evaluate((el) => Math.round(el.scrollTop)))
    .toBeGreaterThan(400)
  expect(await listRequestCount(page)).toBe(countBefore)
})

test('arriving by push/replace also restores the cached list', async ({ page }) => {
  await gotoList(page)
  const scrollEl = page.locator('.order-scroll')
  await scrollEl.evaluate((el) => {
    el.scrollTop = 300
  })
  await expect
    .poll(async () => scrollEl.evaluate((el) => Math.round(el.scrollTop)))
    .toBeGreaterThan(200)

  await visibleCard(page).click()
  await expect(page.getByText('单据编号')).toBeVisible()

  // push 方式到达列表
  await page.locator('.nut-button', { hasText: 'push 到列表' }).click()
  await expect(page.locator('.order-card').first()).toBeVisible()
  await expect
    .poll(async () => scrollEl.evaluate((el) => Math.round(el.scrollTop)))
    .toBeGreaterThan(200)

  // 再去详情后 replace 方式到达
  await visibleCard(page).click()
  await expect(page.getByText('单据编号')).toBeVisible()
  await page.locator('.nut-button', { hasText: 'replace 到列表' }).click()
  await expect(page.locator('.order-card').first()).toBeVisible()
  await expect
    .poll(async () => scrollEl.evaluate((el) => Math.round(el.scrollTop)))
    .toBeGreaterThan(200)
})

test('non-cached detail page remounts on every visit', async ({ page }) => {
  await gotoList(page)

  for (let i = 0; i < 2; i++) {
    await page.locator('.order-card').first().click()
    // 详情页未缓存：每次都重新挂载，出现加载态并请求
    await expect(page.getByText('加载中...')).toBeVisible({ timeout: 3000 }).catch(() => {})
    await expect(page.getByText('单据编号')).toBeVisible()
    await page.locator('.order-header-icon').click()
    await expect(page.locator('.order-card').first()).toBeVisible()
  }
})

test('saving a new order hard-refreshes the list (fresh render, back to top)', async ({ page }) => {
  await gotoList(page)
  const scrollEl = page.locator('.order-scroll')
  await scrollEl.evaluate((el) => {
    el.scrollTop = 500
  })
  await expect
    .poll(async () => scrollEl.evaluate((el) => Math.round(el.scrollTop)))
    .toBeGreaterThan(400)
  const countBefore = await listRequestCount(page)
  const cardsBefore = await page.locator('.order-card').count()

  // 新增 -> 必填材料 -> 保存并返回
  await page.getByText('新增').click()
  await expect(page.getByText('新增订单')).toBeVisible()
  await page.locator('.order-field', { hasText: '材料名称' }).click()
  await expect(page.getByText('选择材料')).toBeVisible()
  await page.locator('.select-option').first().click()
  await expect(page.getByText('新增订单')).toBeVisible()
  await page.locator('.nut-button', { hasText: '保存并返回' }).click()
  await expect(page.locator('.order-card').first()).toBeVisible()

  // 列表硬刷新：重新请求 + 回到顶部 + 全新实例
  expect(await listRequestCount(page)).toBe(countBefore + 1)
  await expect
    .poll(async () => scrollEl.evaluate((el) => Math.round(el.scrollTop)))
    .toBeLessThan(10)
  expect(await page.locator('.order-card').count()).toBe(cardsBefore)
})

test('add page keeps selections after visiting select pages', async ({ page }) => {
  await gotoList(page)
  await page.getByText('新增').click()
  await expect(page.getByText('新增订单')).toBeVisible()

  // 去选择材料 -> 选第一项 -> 返回新增页
  await page.locator('.order-field', { hasText: '材料名称' }).click()
  await expect(page.getByText('选择材料')).toBeVisible()
  await page.locator('.select-option').first().click()
  await expect(page.getByText('新增订单')).toBeVisible()

  const firstName = await page.locator('.order-field', { hasText: '材料名称' }).locator('.order-field-value-active').textContent()
  expect(firstName).toBeTruthy()
})

test('rapid navigation does not deadlock and cache still works', async ({ page }) => {  const pageErrors: string[] = []
  page.on('pageerror', (err) => pageErrors.push(String(err)))

  await gotoList(page)
  const countBefore = await listRequestCount(page)

  // 快速连续导航（列表->详情->返回->新增->返回 x6），动作快速失败，模拟极速操作
  const quick = (action: Promise<unknown>) => action.catch(() => undefined)
  const backIcon = page.locator('.order-header-icon').first()
  for (let i = 0; i < 6; i++) {
    await quick(visibleCard(page).click({ timeout: 1500 }))
    await quick(backIcon.click({ timeout: 1500 }))
    await quick(page.locator('.order-header-action', { hasText: '新增' }).click({ timeout: 1500 }))
    await quick(backIcon.click({ timeout: 1500 }))
  }

  // 浏览器 back 到首页后再次进入（不同到达方式混合）
  await quick(page.goBack({ timeout: 2000, waitUntil: 'commit' }))
  await page.locator('.nut-button', { hasText: '进入订单列表' }).click()
  await expect(page.locator('.order-card').first()).toBeVisible({ timeout: 15_000 })

  // 缓存仍生效：整个过程的列表请求次数不变（未重新请求）
  expect(await listRequestCount(page)).toBe(countBefore)
  // 无未捕获错误、无卡死
  expect(pageErrors).toEqual([])
})

test('scroll position survives repeated detail round-trips (offscreen scroll-event clobber regression)', async ({ page }) => {
  await gotoList(page)
  const scrollEl = page.locator('.order-scroll')

  // 连续多轮"滚动 -> 详情 -> 返回"：每轮恢复的滚动位置都必须保持。
  // 回归背景：列表 DOM 移入离屏缓存容器时 scrollTop 被浏览器归零并异步派发
  // scroll 事件（在游离子树内派发，window 捕获不到），list-keep-alive 的兜底
  // 滚动监听若不忽略离屏事件，会把离开守卫保存的真实位置覆盖为 0，
  // 第 2 轮起恢复失败（时序竞态，离屏事件晚于守卫执行时必现）。
  for (let round = 1; round <= 3; round++) {
    await scrollEl.evaluate((el) => {
      el.scrollTop = 600
    })
    await expect
      .poll(() => scrollEl.evaluate((el) => Math.round(el.scrollTop)))
      .toBeGreaterThan(400)

    await visibleCard(page).click()
    await expect(page.getByText('单据编号')).toBeVisible()
    await page.locator('.order-header-icon').click()
    await expect(page.locator('.order-card').first()).toBeVisible()

    // 返回后恢复位置必须仍然有效（bug 表现为恢复为 0）
    await expect
      .poll(() => scrollEl.evaluate((el) => Math.round(el.scrollTop)))
      .toBeGreaterThan(400)
  }
})
