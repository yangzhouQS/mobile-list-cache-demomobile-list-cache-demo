import { defineComponent, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { backToList } from '../../utils/list-keep-alive'
import { fetchStockDetail } from './stock-mock'
import type { StockItem } from './stock-mock'

/**
 * 库存编辑（三级路由 · TSX）
 * 演示嵌套 PageCache 下的两种受控返回：软刷新（复用实例刷数据）与硬刷新（跳过缓存重建）
 */
export default defineComponent({
  name: 'StockEdit',
  setup() {
    const route = useRoute()
    const router = useRouter()

    const isSaving = ref(false)
    const isHardRefresh = ref(false)
    const stockInfo = ref<StockItem | null>(null)

    const formData = reactive({ num: '' })

    onMounted(async () => {
      const id = Number(route.params.id)
      stockInfo.value = await fetchStockDetail(id)
      formData.num = String(stockInfo.value.num)
    })

    const handleSave = async () => {
      if (!formData.num) {
        return
      }
      isSaving.value = true
      try {
        // TODO: 调用保存接口
        await new Promise((resolve) => setTimeout(resolve, 500))
        backToList(router, {
          listKey: 'stock-list',
          routePath: '/stock/list',
          refresh: isHardRefresh.value ? 'hard' : true
        })
      } finally {
        isSaving.value = false
      }
    }

    const goBack = () => {
      router.back()
    }

    return () => (
      <div class="stock-page">
        <div class="stock-edit">
          <div class="stock-field">
            <div class="stock-field-label">库存编号</div>
            <div class="stock-field-value">{stockInfo.value?.stockCode ?? '...'}</div>
          </div>
          <div class="stock-field">
            <div class="stock-field-label">材料名称</div>
            <div class="stock-field-value">{stockInfo.value?.materialName ?? '...'}</div>
          </div>
          <div class="stock-field">
            <div class="stock-field-label">库存数量（吨）</div>
            <input
              class="stock-field-input"
              type="digit"
              v-model={formData.num}
              placeholder="请输入数量"
            />
          </div>

          <div class="stock-switch-row">
            <div class="stock-switch-label">保存后硬刷新（跳过缓存重建实例）</div>
            <nut-switch v-model={isHardRefresh.value} />
          </div>
          <div class="stock-tip">
            默认关闭：复用缓存实例仅重新请求数据；开启后下次到达全新渲染
          </div>

          <nut-button block type="primary" loading={isSaving.value} onClick={handleSave}>
            保存并返回
          </nut-button>
          <nut-button block onClick={goBack} style={{ 'margin-top': '12px' }}>
            取消返回（保持位置）
          </nut-button>
        </div>
      </div>
    )
  }
})
