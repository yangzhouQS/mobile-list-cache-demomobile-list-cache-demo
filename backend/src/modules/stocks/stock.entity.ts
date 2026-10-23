import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('stocks')
export class Stock {
  @PrimaryGeneratedColumn()
  id: number

  /** 库存编号：KC-YYYYMM-NNNN */
  @Column({ unique: true })
  stockCode: string

  @Column()
  materialName: string

  /** 库存数量（吨） */
  @Column({ type: 'real' })
  num: number

  @Column({ default: '吨' })
  unit: string

  /** 1号库 / 2号库 / 3号库 / 露天堆场 */
  @Column({ default: '1号库' })
  warehouse: string

  /** 最近更新时间（格式化字符串，前端直接展示） */
  @Column()
  updateDate: string
}
