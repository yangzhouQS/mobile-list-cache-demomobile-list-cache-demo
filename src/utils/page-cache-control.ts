/**
 * PageCache 路由级长期缓存的刷新控制
 *
 * 与缓存组件配套的"到达决策"：
 * - 页面正常到达 -> 优先从缓存恢复实例（push/back/go/replace 均不受影响）
 * - markPageRefresh(path) 后的"下一次到达" -> 跳过缓存，全新渲染并替换缓存条目
 */

const refreshRouteSet = new Set<string>()

/** 标记某路由下次到达时不用缓存（全新渲染） */
export const markPageRefresh = (routePath: string) => {
  refreshRouteSet.add(routePath)
}

/** 消费刷新标记：返回下次到达是否需要全新渲染 */
export const consumePageRefresh = (routePath: string) => refreshRouteSet.delete(routePath)

/** 清空所有刷新标记 */
export const clearPageRefresh = () => refreshRouteSet.clear()
