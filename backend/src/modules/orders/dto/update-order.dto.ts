import { PartialType } from '@nestjs/mapped-types'
import { CreateOrderDto } from './create-order.dto'

/** 编辑为部分字段更新：materialName / num / status 等 */
export class UpdateOrderDto extends PartialType(CreateOrderDto) {}
