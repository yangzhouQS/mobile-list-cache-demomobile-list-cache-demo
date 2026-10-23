import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Option } from './option.entity'

@Injectable()
export class OptionsService {
  constructor(
    @InjectRepository(Option)
    private readonly optionRepo: Repository<Option>
  ) {}

  /** 按字典类型查询可选项（material | supplier | staff），顺序稳定 */
  async findByType(type: string): Promise<Option[]> {
    const list = await this.optionRepo.find({
      where: { type },
      order: { id: 'ASC' }
    })
    if (list.length === 0) {
      throw new NotFoundException(`未知的字典类型：${type}`)
    }
    return list
  }
}
