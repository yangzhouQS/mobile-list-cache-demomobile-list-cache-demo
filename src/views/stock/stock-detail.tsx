import { defineComponent, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchStockDetail } from './stock-mock'
import type { StockItem } from './stock-mock'

/**
 * 库存详情（三级路由 · TSX）
 * 返回二级列表时保持位置，不重新请求（嵌套 PageCache 缓存命中）
 */
export default defineComponent({
  name: 'StockDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()

    const isLoading = ref(true)
    const stockInfo = ref<StockItem>({
      id: 0,
      stockCode: '',
      materialName: '',
      num: 0,
      unit: '吨',
      warehouse: '',
      updateDate: ''
    })

    onMounted(async () => {
      const id = Number(route.params.id)
      stockInfo.value = await fetchStockDetail(id)
      isLoading.value = false
    })

    const goBack = () => {
      router.back()
    }

    return () => (
      <div class="stock-page">
        {isLoading.value ? (
          <div class="stock-tip">加载中...</div>
        ) : (
          <div class="stock-detail">
            <div class="stock-info-row">
              <div class="stock-info-label">库存编号</div>
              <div class="stock-info-value">{stockInfo.value.stockCode}</div>
            </div>
            <div class="stock-info-row">
              <div class="stock-info-label">材料名称</div>
              <div class="stock-info-value">{stockInfo.value.materialName}</div>
            </div>
            <div class="stock-info-row">
              <div class="stock-info-label">库存数量</div>
              <div class="stock-info-value">
                {stockInfo.value.num} {stockInfo.value.unit}
              </div>
            </div>
            <div class="stock-info-row">
              <div class="stock-info-label">存放仓库</div>
              <div class="stock-info-value">{stockInfo.value.warehouse}</div>
            </div>
            <div class="stock-info-row">
              <div class="stock-info-label">更新时间</div>
              <div class="stock-info-value">{stockInfo.value.updateDate}</div>
            </div>
            <div class="stock-tip">返回列表后保持进入前的位置，不重新请求</div>
            <nut-button block type="primary" onClick={goBack}>
              back 返回列表
            </nut-button>
            <div class="stock-nav-row">
              <nut-button size="small" onClick={() => router.push('/stock/list')}>
                push 到列表
              </nut-button>
              <nut-button size="small" onClick={() => router.replace('/stock/list')}>
                replace 到列表
              </nut-button>
            </div>
          </div>
        )}
      </div>
    )
  }
})
