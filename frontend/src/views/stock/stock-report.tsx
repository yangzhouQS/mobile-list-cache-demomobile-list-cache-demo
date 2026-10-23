import { defineComponent } from 'vue'

/**
 * 库存报表（二级路由 · TSX）：同层切换页，验证布局复用与嵌套 PageCache 透传
 */
export default defineComponent({
  name: 'StockReport',
  setup() {
    return () => (
      <div class="stock-page">
        <div class="stock-report">
          <div class="stock-report-title">库存汇总报表</div>
          <div class="stock-report-row">
            <div class="stock-report-label">钢材类库存</div>
            <div class="stock-report-value">1,286.50 吨</div>
          </div>
          <div class="stock-report-row">
            <div class="stock-report-label">砂石类库存</div>
            <div class="stock-report-value">3,452.00 吨</div>
          </div>
          <div class="stock-report-row">
            <div class="stock-report-label">辅料类库存</div>
            <div class="stock-report-value">126.75 吨</div>
          </div>
          <div class="stock-tip">切换回列表时仍从嵌套缓存恢复（不重新请求）</div>
        </div>
      </div>
    )
  }
})
