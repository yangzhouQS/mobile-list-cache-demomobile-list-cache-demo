import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { formatCompactDate, formatDateTime } from '../../common/date-format'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { Order } from './order.entity'

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>
  ) {}

  /** 分页查询：按 id 升序（与原 mock 的稳定顺序一致，加载更多顺序不跳变） */
  async findPage(pageNum: number, pageSize: number): Promise<{ list: Order[]; total: number }> {
    const [list, total] = await this.orderRepo.findAndCount({
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      order: { id: 'ASC' }
    })
    return { list, total }
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepo.findOneBy({ id })
    if (!order) {
      throw new NotFoundException(`订单 ${id} 不存在`)
    }
    return order
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepo.create({
      materialName: dto.materialName,
      num: dto.num,
      unit: dto.unit ?? '吨',
      status: dto.status ?? '待过磅',
      supplierName: dto.supplierName ?? null,
      staffCode: dto.staffCode ?? null,
      staffName: dto.staffName ?? null,
      orderCode: await this.nextOrderCode(),
      createDate: formatDateTime(new Date())
    })
    return this.orderRepo.save(order)
  }

  async update(id: number, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id)
    Object.assign(order, dto)
    return this.orderRepo.save(order)
  }

  async remove(id: number): Promise<{ id: number }> {
    const order = await this.findOne(id)
    await this.orderRepo.remove(order)
    return { id: order.id }
  }

  /** 生成单据编号：GKSQD-YYYYMMDD-NNNN（按当日已有单据数递增） */
  private async nextOrderCode(): Promise<string> {
    const prefix = `GKSQD-${formatCompactDate(new Date())}`
    const count = await this.orderRepo.count()
    return `${prefix}-${String(count + 1).padStart(4, '0')}`
  }
}
