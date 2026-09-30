import { defineComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useListKeepAlive } from '../../utils/list-keep-alive'
import { fetchStockPage, stockRequestStats } from './stock-mock'
import type { StockItem } from './stock-mock'

/**
 * 库存列表（二级路由 · TSX）
 *
 * 被布局内的嵌套 PageCache 长期缓存（cacheKey = route.path = /stock/list），
 * 三级页面（详情/编辑）返回时保持滚动位置与数据。
 */
export default defineComponent({
  name: 'StockList',
  setup() {
    const router = useRouter()

    const scrollRef = ref<HTMLElement | null>(null)
    const stockList = ref<StockItem[]>([])
    const total = ref(0)
    const pageNum = ref(1)
    const isLoading = ref(false)
    const currentScrollTop = ref(0)

    const fetchList = async () => {
      isLoading.value = true
      try {
        const { list, total: sum } = await fetchStockPage(1)
        pageNum.value = 1
        stockList.value = list
        total.value = sum
      } finally {
        isLoading.value = false
      }
    }

    const loadMore = async () => {
      if (isLoading.value || stockList.value.length >= total.value) {
        return
      }
      isLoading.value = true
      try {
        const { list } = await fetchStockPage(pageNum.value + 1)
        pageNum.value += 1
        stockList.value = stockList.value.concat(list)
      } finally {
        isLoading.value = false
      }
    }

    const handleScroll = () => {
      currentScrollTop.value = Math.round(scrollRef.value?.scrollTop ?? 0)
    }

    useListKeepAlive({
      listKey: 'stock-list',
      getScrollEl: () => scrollRef.value,
      onRefresh: async () => {
        await fetchList()
        currentScrollTop.value = 0
      }
    })

    onMounted(fetchList)

    const goDetail = (id: number) => {
      router.push(`/stock/list/detail/${id}`)
    }

    const goEdit = (id: number) => {
      router.push(`/stock/list/edit/${id}`)
    }

    return () => (
      <div class="stock-page">
        <div class="stock-stats">
          <span>列表请求：{stockRequestStats.listCount} 次</span>
          <span>当前滚动：{currentScrollTop.value} px</span>
          <span>
            已加载：{stockList.value.length} / {total.value} 条
          </span>
        </div>

        <div ref={scrollRef} class="stock-scroll" onScroll={handleScroll}>
          {stockList.value.map((item) => (
            <div class="stock-card" key={item.id} onClick={() => goDetail(item.id)}>
              <div class="stock-card-row">
                <div class="stock-card-code">{item.stockCode}</div>
                <div class="stock-card-warehouse">{item.warehouse}</div>
              </div>
              <div class="stock-card-row">
                <div class="stock-card-name">{item.materialName}</div>
                <div class="stock-card-num">
                  {item.num} {item.unit}
                </div>
              </div>
              <div class="stock-card-row">
                <div class="stock-card-date">{item.updateDate}</div>
                <div
                  class="stock-card-btn"
                  onClick={(event) => {
                    event.stopPropagation()
                    goEdit(item.id)
                  }}
                >
                  编辑
                </div>
              </div>
            </div>
          ))}

          {isLoading.value ? (
            <div class="stock-tip">加载中...</div>
          ) : stockList.value.length < total.value ? (
            <div class="stock-tip" onClick={loadMore}>
              加载更多
            </div>
          ) : (
            <div class="stock-tip">没有更多了</div>
          )}
        </div>
      </div>
    )
  }
})
