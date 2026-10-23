import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { formatDateTime } from '../../common/date-format'
import { CreateStockDto } from './dto/create-stock.dto'
import { UpdateStockDto } from './dto/update-stock.dto'
import { Stock } from './stock.entity'

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepo: Repository<Stock>
  ) {}

  /** 分页查询：按 id 升序（与原 mock 的稳定顺序一致） */
  async findPage(pageNum: number, pageSize: number): Promise<{ list: Stock[]; total: number }> {
    const [list, total] = await this.stockRepo.findAndCount({
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      order: { id: 'ASC' }
    })
    return { list, total }
  }

  async findOne(id: number): Promise<Stock> {
    const stock = await this.stockRepo.findOneBy({ id })
    if (!stock) {
      throw new NotFoundException(`库存 ${id} 不存在`)
    }
    return stock
  }

  async create(dto: CreateStockDto): Promise<Stock> {
    const stock = this.stockRepo.create({
      materialName: dto.materialName,
      num: dto.num,
      unit: dto.unit ?? '吨',
      warehouse: dto.warehouse ?? '1号库',
      stockCode: await this.nextStockCode(),
      updateDate: formatDateTime(new Date())
    })
    return this.stockRepo.save(stock)
  }

  async update(id: number, dto: UpdateStockDto): Promise<Stock> {
    const stock = await this.findOne(id)
    Object.assign(stock, dto)
    // 编辑保存后刷新"最近更新时间"（列表页展示该字段）
    stock.updateDate = formatDateTime(new Date())
    return this.stockRepo.save(stock)
  }

  async remove(id: number): Promise<{ id: number }> {
    const stock = await this.findOne(id)
    await this.stockRepo.remove(stock)
    return { id: stock.id }
  }

  /** 生成库存编号：KC-YYYYMM-NNNN（按当月已有记录数递增） */
  private async nextStockCode(): Promise<string> {
    const now = new Date()
    const prefix = `KC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
    const count = await this.stockRepo.count()
    return `${prefix}-${String(count + 1).padStart(4, '0')}`
  }
}
