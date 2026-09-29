/**
 * 边properties配置属性
 */
interface IPublicFlowEdgeProperties {
  /**
   * 连线名称
   */
  lineName: string;

  /**
   * 流转方式
   * 1: 自动流转（直接流转下一节点）
   * 2: 审批流转（按照审批结果流转）
   * 3: 条件流转（按照字段条件流转）
   */
  transferMode: 1 | 2 | 3;

  /**
   * 连线显示文字
   */
  text: string;
  context: string;
  value: string;

  /**
   * 条件流转SQL, 条件配置
   * transferMode = 3
   */
  sqlWhere: string;

  /**
   * 待定:未知属性
   */
  customizeValues: [];
}

export type { IPublicFlowEdgeProperties };
