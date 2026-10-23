import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { formatCompactDate, formatDateTime } from '../common/date-format'
import { Option } from '../modules/options/option.entity'
import { Order } from '../modules/orders/order.entity'
import { Stock } from '../modules/stocks/stock.entity'

/** 每个列表固定种子 50 条（与前端分页演示的数据量预期一致） */
const SEED_COUNT = 50

/** 订单材料池（带展示单位） */
const ORDER_MATERIALS: Array<{ name: string; unit: string }> = [
  { name: '河沙-中粗', unit: '吨' },
  { name: '河沙-细', unit: '吨' },
  { name: '机制沙-细', unit: '吨' },
  { name: '碎石-5-10mm', unit: '吨' },
  { name: '碎石-10-20mm', unit: '吨' },
  { name: '钢筋-HRB400', unit: '吨' },
  { name: '水泥-PO42.5', unit: '吨' },
  { name: '混凝土-C30', unit: '方' }
]

const SUPPLIERS = [
  '宏发建材贸易有限公司',
  '中天物资集团有限公司',
  '鑫磊砂石供应站',
  '华宇钢铁供应链公司',
  '恒信水泥制品厂'
]

const STAFF = [
  { code: 'EMP1001', name: '张卫东' },
  { code: 'EMP1002', name: '李建国' },
  { code: 'EMP1003', name: '王振华' },
  { code: 'EMP1004', name: '赵永刚' },
  { code: 'EMP1005', name: '陈志强' }
]

const ORDER_STATUSES = ['已签收', '运输中', '待过磅']

const STOCK_MATERIALS: Array<{ name: string; unit: string }> = [
  { name: '螺纹钢-HRB400E-12mm', unit: '吨' },
  { name: '螺纹钢-HRB400E-25mm', unit: '吨' },
  { name: '盘螺-HRB400-8mm', unit: '吨' },
  { name: '碎石-10-20mm', unit: '吨' },
  { name: '中砂-II区', unit: '吨' },
  { name: '粉煤灰-F类II级', unit: '吨' }
]

const WAREHOUSES = ['1号库', '2号库', '3号库', '露天堆场']

/** 字典表（与原前端 mock 的 OPTION_MAP 一致） */
const OPTIONS: Array<{ type: string; code: string; name: string }> = [
  { type: 'material', code: 'M001', name: '河沙-中粗' },
  { type: 'material', code: 'M002', name: '河沙-细' },
  { type: 'material', code: 'M003', name: '机制沙-细' },
  { type: 'material', code: 'M004', name: '碎石-5-10mm' },
  { type: 'material', code: 'M005', name: '碎石-10-20mm' },
  { type: 'material', code: 'M006', name: '混凝土-C30' },
  { type: 'supplier', code: 'S001', name: '宏发建材贸易有限公司' },
  { type: 'supplier', code: 'S002', name: '中天物资集团有限公司' },
  { type: 'supplier', code: 'S003', name: '鑫磊砂石供应站' },
  { type: 'supplier', code: 'S004', name: '华宇钢铁供应链公司' },
  { type: 'staff', code: 'EMP1001', name: '张卫东' },
  { type: 'staff', code: 'EMP1002', name: '李建国' },
  { type: 'staff', code: 'EMP1003', name: '王振华' },
  { type: 'staff', code: 'EMP1004', name: '赵永刚' },
  { type: 'staff', code: 'EMP1005', name: '陈志强' }
]

/**
 * 确定性伪随机（LCG）：种子固定，重复播种得到同一批数据，便于 e2e/演示复现
 */
const createRng = (seed: number) => {
  let state = seed % 2147483647
  if (state <= 0) {
    state += 2147483646
  }
  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
}

/**
 * 首次启动播种：orders 50 条 / stocks 50 条 / options 字典。
 * 幂等——仅在对应表为空时插入，重启不重复。
 */
@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(Stock) private readonly stockRepo: Repository<Stock>,
    @InjectRepository(Option) private readonly optionRepo: Repository<Option>
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedOrders()
    await this.seedStocks()
    await this.seedOptions()
  }

  private async seedOrders(): Promise<void> {
    if ((await this.orderRepo.count()) > 0) {
      return
    }
    const rng = createRng(20260601)
    const now = Date.now()
    const orders: Order[] = []
    for (let i = 0; i < SEED_COUNT; i++) {
      // 按条目倒推创建时间：从 45 天前开始，每天约 1 条 + 伪随机小时偏移
      const created = new Date(
        now - (SEED_COUNT - i) * 21.5 * 3600 * 1000 - Math.floor(rng() * 9) * 3600 * 1000
      )
      const material = ORDER_MATERIALS[i % ORDER_MATERIALS.length]!
      const staff = STAFF[i % STAFF.length]!
      const order = this.orderRepo.create({
        // 新数据 id 大：倒推时间保证 id 升序 == 时间升序，与分页顺序一致
        orderCode: `GKSQD-${formatCompactDate(created)}-${String(i + 1).padStart(4, '0')}`,
        materialName: material.name,
        num: Math.round((12.5 + rng() * 448) * 100) / 100,
        unit: material.unit,
        status: ORDER_STATUSES[i % ORDER_STATUSES.length]!,
        supplierName: SUPPLIERS[i % SUPPLIERS.length]!,
        staffCode: staff.code,
        staffName: staff.name,
        createDate: formatDateTime(created)
      })
      orders.push(order)
    }
    await this.orderRepo.save(orders)
    Logger.log(`已播种订单 ${orders.length} 条`, 'SeedService')
  }

  private async seedStocks(): Promise<void> {
    if ((await this.stockRepo.count()) > 0) {
      return
    }
    const rng = createRng(20260901)
    const now = Date.now()
    const stocks: Stock[] = []
    for (let i = 0; i < SEED_COUNT; i++) {
      const updated = new Date(
        now - (SEED_COUNT - i) * 20 * 3600 * 1000 - Math.floor(rng() * 10) * 3600 * 1000
      )
      const material = STOCK_MATERIALS[i % STOCK_MATERIALS.length]!
      stocks.push(
        this.stockRepo.create({
          stockCode: `KC-${formatCompactDate(updated).slice(0, 6)}-${String(i + 1).padStart(4, '0')}`,
          materialName: material.name,
          num: Math.round((8.5 + rng() * 520) * 100) / 100,
          unit: material.unit,
          warehouse: WAREHOUSES[i % WAREHOUSES.length]!,
          updateDate: formatDateTime(updated)
        })
      )
    }
    await this.stockRepo.save(stocks)
    Logger.log(`已播种库存 ${stocks.length} 条`, 'SeedService')
  }

  private async seedOptions(): Promise<void> {
    if ((await this.optionRepo.count()) > 0) {
      return
    }
    await this.optionRepo.save(OPTIONS.map((item) => this.optionRepo.create(item)))
    Logger.log(`已播种字典 ${OPTIONS.length} 条`, 'SeedService')
  }
}
