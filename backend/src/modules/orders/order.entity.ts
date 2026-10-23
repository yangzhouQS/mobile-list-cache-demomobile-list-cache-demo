import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number

  /** 单据编号：GKSQD-YYYYMMDD-NNNN，创建时自动生成 */
  @Column({ unique: true })
  orderCode: string

  @Column()
  materialName: string

  /** 数量（吨）：sqlite REAL 存小数 */
  @Column({ type: 'real' })
  num: number

  @Column({ default: '吨' })
  unit: string

  /** 已签收 / 运输中 / 待过磅 */
  @Column({ default: '待过磅' })
  status: string

  @Column({ type: 'varchar', nullable: true })
  supplierName: string | null

  @Column({ type: 'varchar', nullable: true })
  staffCode: string | null

  @Column({ type: 'varchar', nullable: true })
  staffName: string | null

  /** 出库时间（格式化字符串，前端直接展示） */
  @Column()
  createDate: string
}
