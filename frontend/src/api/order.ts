/**
 * 订单接口：对接 backend NestJS（/api/orders、/api/options）
 *
 * requestStats 是测试观测指标（界面"列表请求：N 次"），在客户端 API 层计数，
 * 缓存命中不经过本层即可直观验证"是否重新请求"。
 */
import { reactive } from 'vue'
import { httpDelete, httpGet, httpPost, httpPut } from '../utils/request'

export interface OrderItem {
  id: number
  orderCode: string
  materialName: string
  num: number
  unit: string
  status: string
  createDate: string
  /** 以下为后端扩展字段（创建时写入，列表/详情返回） */
  supplierName: string | null
  staffCode: string | null
  staffName: string | null
}

/** 选择页可选项 */
export interface OptionItem {
  code: string
  name: string
}

export interface PageResult<T> {
  list: T[]
  total: number
}

/** 新增/编辑订单入参（后端 CreateOrderDto / UpdateOrderDto 的前端投影） */
export interface SaveOrderPayload {
  materialName: string
  num: number
  unit?: string
  status?: string
  supplierName?: string
  staffCode?: string
  staffName?: string
}

/** 测试观测指标：列表/详情累计请求次数 */
export const requestStats = reactive({
  listCount: 0,
  detailCount: 0
})

export const SELECT_TYPE_TITLE_MAP: Record<string, string> = {
  material: '选择材料',
  supplier: '选择供应商',
  staff: '选择工号'
}

/** 分页查询订单列表 */
export const fetchOrderPage = async (pageNum: number, pageSize = 15): Promise<PageResult<OrderItem>> => {
  requestStats.listCount += 1
  return httpGet<PageResult<OrderItem>>(`/orders?pageNum=${pageNum}&pageSize=${pageSize}`)
}

/** 查询单条订单 */
export const fetchOrderDetail = async (id: number): Promise<OrderItem> => {
  requestStats.detailCount += 1
  return httpGet<OrderItem>(`/orders/${id}`)
}

/** 新增订单（保存成功后由调用方 backToList 触发列表硬刷新） */
export const createOrder = (payload: SaveOrderPayload): Promise<OrderItem> =>
  httpPost<OrderItem>('/orders', payload)

/** 编辑订单（部分字段更新） */
export const updateOrder = (id: number, payload: Partial<SaveOrderPayload>): Promise<OrderItem> =>
  httpPut<OrderItem>(`/orders/${id}`, payload)

/** 删除订单 */
export const deleteOrder = (id: number): Promise<{ id: number }> =>
  httpDelete<{ id: number }>(`/orders/${id}`)

/** 查询选择页可选项（material | supplier | staff） */
export const fetchSelectOptions = (type: string): Promise<OptionItem[]> =>
  httpGet<OptionItem[]>(`/options/${type}`)
