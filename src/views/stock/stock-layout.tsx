import { defineComponent } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { PageCache } from '../../components/page-cache'
import './stock.less'

/**
 * 库存模块一级布局（TSX）
 *
 * 嵌套路由下的缓存要点：
 * - 顶层 app.vue 的 PageCache 渲染的是本布局（route.path 是叶子完整路径，
 *   与渲染组件不对应），因此 /stock* 不进顶层 include，由本布局内的
 *   嵌套 PageCache 按叶子 route.path 缓存列表页
 * - 嵌套 PageCache 的生命周期绑定在本布局上：离开 /stock 模块（布局卸载）
 *   时嵌套缓存随之清理；模块内三级页面往返不受影响
 */
export default defineComponent({
  name: 'StockLayout',
  setup() {
    const route = useRoute()
    const router = useRouter()

    /** 本模块内需要长期缓存的叶子路由（path 维度） */
    const cacheRoutes = ['/stock/list']

    const isReport = () => route.path.startsWith('/stock/report')

    const toggleReport = () => {
      router.push(isReport() ? '/stock/list' : '/stock/report')
    }

    return () => (
      <div class="stock-layout">
        <div class="stock-header">
          <div class="stock-header-icon" onClick={() => history.back()}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </div>
          <div class="stock-header-title">库存管理（三级路由 · TSX）</div>
          <div
            class={['stock-header-action', { 'stock-header-action-active': isReport() }]}
            onClick={toggleReport}
          >
            {isReport() ? '回列表' : '报表'}
          </div>
        </div>

        <div class="stock-body">
          <RouterView>
            {{
              default: ({ Component }: { Component: unknown }) => {
                if (!Component) {
                  return null
                }
                return (
                  <PageCache include={cacheRoutes}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(() => {
                      const Comp = Component as any
                      return <Comp key={route.fullPath} />
                    })()}
                  </PageCache>
                )
              }
            }}
          </RouterView>
        </div>
      </div>
    )
  }
})
