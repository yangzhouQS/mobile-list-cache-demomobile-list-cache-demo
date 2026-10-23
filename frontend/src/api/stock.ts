/**
 * 库存接口：对接 backend NestJS（/api/stocks）
 * stockRequestStats 是测试观测指标（库存列表页"列表请求：N 次"）
 */
import { reactive } from 'vue'
import { httpDelete, httpGet, httpPost, httpPut } from '../utils/request'

export interface StockItem {
  id: number
  stockCode: string
  materialName: string
  num: number
  unit: string
  warehouse: string
  updateDate: string
}

export interface PageResult<T> {
  list: T[]
  total: number
}

/** 新增/编辑库存入参（后端 CreateStockDto / UpdateStockDto 的前端投影） */
export interface SaveStockPayload {
  materialName: string
  num: number
  unit?: string
  warehouse?: string
}

/** 测试观测指标：库存列表累计请求次数 */
export const stockRequestStats = reactive({
  listCount: 0
})

/** 分页查询库存列表 */
export const fetchStockPage = async (pageNum: number, pageSize = 15): Promise<PageResult<StockItem>> => {
  stockRequestStats.listCount += 1
  return httpGet<PageResult<StockItem>>(`/stocks?pageNum=${pageNum}&pageSize=${pageSize}`)
}

/** 查询单条库存 */
export const fetchStockDetail = async (id: number): Promise<StockItem> => {
  return httpGet<StockItem>(`/stocks/${id}`)
}

/** 新增库存 */
export const createStock = (payload: SaveStockPayload): Promise<StockItem> =>
  httpPost<StockItem>('/stocks', payload)

/** 编辑库存（部分字段更新，后端会刷新 updateDate） */
export const updateStock = (id: number, payload: Partial<SaveStockPayload>): Promise<StockItem> =>
  httpPut<StockItem>(`/stocks/${id}`, payload)

/** 删除库存 */
export const deleteStock = (id: number): Promise<{ id: number }> =>
  httpDelete<{ id: number }>(`/stocks/${id}`)
