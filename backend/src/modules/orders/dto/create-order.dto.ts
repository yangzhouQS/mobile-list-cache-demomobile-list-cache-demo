import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: '材料名称不能为空' })
  materialName: string

  @IsNumber({}, { message: '数量必须是数字' })
  num: number

  @IsOptional()
  @IsString()
  unit?: string

  @IsOptional()
  @IsIn(['已签收', '运输中', '待过磅'], { message: '状态必须是：已签收/运输中/待过磅' })
  status?: string

  @IsOptional()
  @IsString()
  supplierName?: string

  @IsOptional()
  @IsString()
  staffCode?: string

  @IsOptional()
  @IsString()
  staffName?: string
}
