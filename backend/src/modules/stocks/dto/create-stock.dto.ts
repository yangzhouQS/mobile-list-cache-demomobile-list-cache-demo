import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateStockDto {
  @IsString()
  @IsNotEmpty({ message: '材料名称不能为空' })
  materialName: string

  @IsNumber({}, { message: '数量必须是数字' })
  num: number

  @IsOptional()
  @IsString()
  unit?: string

  @IsOptional()
  @IsIn(['1号库', '2号库', '3号库', '露天堆场'], { message: '仓库必须是：1号库/2号库/3号库/露天堆场' })
  warehouse?: string
}
