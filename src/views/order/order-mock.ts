/**
 * 订单模拟接口：用 setTimeout 模拟异步请求，演示列表缓存/刷新机制
 * requestStats 用于在界面上直观验证"是否重新请求"
 */
import { reactive } from 'vue'

export interface OrderItem {
  id: number
  orderCode: string
  materialName: string
  num: number
  unit: string
  status: string
  createDate: string
}

/** 测试观测指标：列表/详情累计请求次数 */
export const requestStats = reactive({
  listCount: 0,
  detailCount: 0
})

const PAGE_SIZE = 15
const TOTAL = 45

const MATERIAL_LIST = ['河沙-中粗-吨', '河沙-细-吨', '机制沙-细-吨', '碎石-5-10-吨', '钢筋-HRB400-吨']
const STATUS_LIST = ['已签收', '运输中', '待过磅']

const pad = (value: number) => String(value).padStart(4, '0')

const buildItem = (id: number): OrderItem => ({
  id,
  orderCode: `GKSQD-202406${pad(id)}`,
  materialName: MATERIAL_LIST[id % MATERIAL_LIST.length] ?? '',
  num: Number((id * 3.75 + 12.5).toFixed(2)),
  unit: '吨',
  status: STATUS_LIST[id % STATUS_LIST.length] ?? '',
  createDate: `2024-06-${pad(id % 30 + 1).slice(2)} 1${id % 9}:${pad(id % 60).slice(2)}:00`
})

/** 分页查询订单列表 */
export const fetchOrderPage = (pageNum: number, pageSize = PAGE_SIZE) => {
  requestStats.listCount += 1
  return new Promise<{ list: OrderItem[]; total: number }>((resolve) => {
    setTimeout(() => {
      const start = (pageNum - 1) * PAGE_SIZE + 1
      const end = Math.min(start + pageSize - 1, TOTAL)
      const list: OrderItem[] = []
      for (let id = start; id <= end; id++) {
        list.push(buildItem(id))
      }
      resolve({ list, total: TOTAL })
    }, 500)
  })
}

/** 查询单条订单 */
export const fetchOrderDetail = (id: number) => {
  requestStats.detailCount += 1
  return new Promise<OrderItem>((resolve) => {
    setTimeout(() => resolve(buildItem(id)), 300)
  })
}

/** 选择页可选项 */
export interface OptionItem {
  code: string
  name: string
}

const OPTION_MAP: Record<string, OptionItem[]> = {
  material: [
    { code: 'M001', name: '河沙-中粗-吨' },
    { code: 'M002', name: '河沙-细-吨' },
    { code: 'M003', name: '机制沙-细-吨' },
    { code: 'M004', name: '碎石-5-10-吨' },
    { code: 'M005', name: '钢筋-HRB400-吨' },
    { code: 'M006', name: '混凝土-C30-方' }
  ],
  supplier: [
    { code: 'S001', name: '宏发建材贸易有限公司' },
    { code: 'S002', name: '中天物资集团有限公司' },
    { code: 'S003', name: '鑫磊砂石供应站' },
    { code: 'S004', name: '华宇钢铁供应链公司' }
  ],
  staff: [
    { code: 'EMP1001', name: '张卫东' },
    { code: 'EMP1002', name: '李建国' },
    { code: 'EMP1003', name: '王振华' },
    { code: 'EMP1004', name: '赵永刚' },
    { code: 'EMP1005', name: '陈志强' }
  ]
}

export const SELECT_TYPE_TITLE_MAP: Record<string, string> = {
  material: '选择材料',
  supplier: '选择供应商',
  staff: '选择工号'
}

/** 查询选择页可选项 */
export const fetchSelectOptions = (type: string) => {
  return new Promise<OptionItem[]>((resolve) => {
    setTimeout(() => resolve(OPTION_MAP[type] ?? []), 300)
  })
}
