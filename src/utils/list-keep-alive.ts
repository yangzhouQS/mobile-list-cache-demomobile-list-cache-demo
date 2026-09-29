import { nextTick, onActivated, onBeforeUnmount, onMounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import type { Router } from 'vue-router'
import { markPageRefresh } from './page-cache-control'

/**
 * 列表页缓存控制工具
 *
 * 配合 vue-page-stack（或 keep-alive）使用：
 * - 列表页不销毁，路由返回时恢复滚动位置
 * - 通过刷新标记控制"返回列表时是否重新请求数据"：
 *   新增保存后 -> markListRefresh -> 列表自动刷新回到顶部
 *   详情/编辑查看返回 -> 不打标记 -> 列表保持进入前的位置和数据
 */

const refreshFlagMap = new Map<string, boolean>()
const scrollPosMap = new Map<string, number>()

/** 标记某列表需要刷新（新增/编辑保存成功后调用） */
export const markListRefresh = (listKey: string) => {
  refreshFlagMap.set(listKey, true)
}

/** 消费刷新标记：返回是否需要刷新并清除标记 */
export const consumeListRefresh = (listKey: string) => {
  const needRefresh = refreshFlagMap.get(listKey) === true
  refreshFlagMap.delete(listKey)
  return needRefresh
}

/** 重置某列表记录的滚动位置（配合缓存实例重建场景回到顶部） */
export const resetListScroll = (listKey: string) => {
  scrollPosMap.set(listKey, 0)
}

export type BackRefreshMode =
  | boolean
  /** 跳过页面缓存全新渲染（需配合 PageCache 的 markPageRefresh） */
  | 'hard'

/** 返回列表页；refresh 决定返回后行为（false=保持位置 / true=复用实例刷新数据 / 'hard'=全新渲染） */
export const backToList = (
  router: Router,
  options: { listKey: string; routePath?: string; refresh?: BackRefreshMode }
) => {
  const { listKey, routePath, refresh = false } = options
  if (refresh === 'hard') {
    if (routePath) {
      markPageRefresh(routePath)
    }
    resetListScroll(listKey)
  } else if (refresh) {
    markListRefresh(listKey)
  }
  router.back()
}

export interface UseListKeepAliveOptions {
  /** 列表唯一标识，与 markListRefresh/backToList 中使用的 listKey 一致 */
  listKey: string
  /** 获取列表滚动容器；缺省使用页面滚动（window） */
  getScrollEl?: () => HTMLElement | null
  /** 需要刷新时回调：内部应重置分页并重新请求数据 */
  onRefresh: () => void | Promise<void>
}

/**
 * 列表页缓存钩子：
 * - 路由离开守卫时（DOM 尚未移动）记录滚动位置
 * - 回到列表时：
 *   - 有刷新标记 -> 执行 onRefresh 重新请求并回到顶部
 *   - 无刷新标记 -> 恢复离开前的滚动位置
 *
 * 注意：不能依赖 onDeactivated 读取 scrollTop——keep-alive/vue-page-stack
 * 停用页面时会先把 DOM 移入缓存容器，移动瞬间 scrollTop 即被重置。
 */
export const useListKeepAlive = (options: UseListKeepAliveOptions) => {
  const { listKey, getScrollEl, onRefresh } = options

  const getScrollTarget = (): HTMLElement | Window => {
    const el = getScrollEl?.()
    return el ?? window
  }

  const getScrollTop = () => {
    const target = getScrollTarget()
    return target === window ? window.scrollY : (target as HTMLElement).scrollTop
  }

  const setScrollTop = (top: number) => {
    const target = getScrollTarget()
    if (target === window) {
      window.scrollTo(0, top)
    } else {
      ;(target as HTMLElement).scrollTop = top
    }
  }

  /** 主方案：路由离开守卫中保存，此时滚动容器 DOM 尚未移动 */
  onBeforeRouteLeave(() => {
    scrollPosMap.set(listKey, getScrollTop())
  })

  /** 兜底：滚动过程持续记录（也用于离开守卫未触发的边界场景） */
  const handleScrollEvent = () => {
    scrollPosMap.set(listKey, getScrollTop())
  }

  onMounted(() => {
    const target = getScrollTarget()
    target.addEventListener('scroll', handleScrollEvent, { passive: true })
  })

  onBeforeUnmount(() => {
    const target = getScrollTarget()
    target.removeEventListener('scroll', handleScrollEvent)
  })

  onActivated(async () => {
    if (consumeListRefresh(listKey)) {
      await onRefresh()
      await nextTick()
      setScrollTop(0)
      scrollPosMap.set(listKey, 0)
    } else {
      await nextTick()
      setScrollTop(scrollPosMap.get(listKey) ?? 0)
    }
  })
}
