import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

/** 选择页字典（材料 / 供应商 / 工号） */
@Entity('options')
export class Option {
  @PrimaryGeneratedColumn()
  id: number

  /** 字典类型：material | supplier | staff */
  @Column()
  type: string

  @Column()
  code: string

  @Column()
  name: string
}
