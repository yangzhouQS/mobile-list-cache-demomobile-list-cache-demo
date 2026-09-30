/**
 * 库存模块模拟接口：三级路由 + TSX 组件演示
 */
import { reactive } from 'vue'

export interface StockItem {
  id: number
  stockCode: string
  materialName: string
  num: number
  unit: string
  warehouse: string
  updateDate: string
}

/** 测试观测指标：库存列表累计请求次数 */
export const stockRequestStats = reactive({
  listCount: 0
})

const PAGE_SIZE = 15
const TOTAL = 45

const MATERIAL_LIST = ['螺纹钢-HRB400E-12mm', '螺纹钢-HRB400E-25mm', '盘螺-HRB400-8mm', '碎石-10-20mm', '中砂-II区', '粉煤灰-F类II级']
const WAREHOUSE_LIST = ['1号库', '2号库', '3号库', '露天堆场']

const pad = (value: number) => String(value).padStart(4, '0')

const buildItem = (id: number): StockItem => ({
  id,
  stockCode: `KC-2024${pad(id)}`,
  materialName: MATERIAL_LIST[id % MATERIAL_LIST.length] ?? '',
  num: Number((id * 17.25 + 8.5).toFixed(2)),
  unit: '吨',
  warehouse: WAREHOUSE_LIST[id % WAREHOUSE_LIST.length] ?? '',
  updateDate: `2024-06-${pad(id % 30 + 1).slice(2)} 0${id % 9 + 1}:${pad(id % 60).slice(2)}:00`
})

/** 分页查询库存列表 */
export const fetchStockPage = (pageNum: number, pageSize = PAGE_SIZE) => {
  stockRequestStats.listCount += 1
  return new Promise<{ list: StockItem[]; total: number }>((resolve) => {
    setTimeout(() => {
      const start = (pageNum - 1) * PAGE_SIZE + 1
      const end = Math.min(start + pageSize - 1, TOTAL)
      const list: StockItem[] = []
      for (let id = start; id <= end; id++) {
        list.push(buildItem(id))
      }
      resolve({ list, total: TOTAL })
    }, 500)
  })
}

/** 查询单条库存 */
export const fetchStockDetail = (id: number) => {
  return new Promise<StockItem>((resolve) => {
    setTimeout(() => resolve(buildItem(id)), 300)
  })
}
