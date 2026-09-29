/**
 * 分页参数类型
 */
export type ConditionParams = {
  conditionLambda?: string
  conditionValue?: object
  orderBy?: object
  tableName?: string
  skip?: number
  take?: number
}

/**
 * 分页参数类
 */
export class QueryParams {
  conditionLambda: string
  conditionValue: object
  orderBy: object
  tableName: string
  skip?: number
  take?: number

  constructor(params: ConditionParams) {
    this.conditionLambda = params.conditionLambda || ''
    this.conditionValue = params.conditionValue || {}
    this.orderBy = params.orderBy || {}
    this.tableName = params.tableName || ''
    this.skip = params.skip || 0
    this.take = params.take || 10
  }
}
