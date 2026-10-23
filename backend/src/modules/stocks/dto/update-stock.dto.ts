import { PartialType } from '@nestjs/mapped-types'
import { CreateStockDto } from './create-stock.dto'

/** 编辑为部分字段更新：num / warehouse 等 */
export class UpdateStockDto extends PartialType(CreateStockDto) {}
