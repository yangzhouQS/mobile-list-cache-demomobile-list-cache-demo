/**
 * 节点数据结构注释
 */
interface IPublicFlowNodeProperties {
  /**
   * 和步骤名称 stepName一致
   */
  text: string; //

  name: string; // 节点名称

  userId: number;

  /**
   * 未知属性,前端未发现使用
   */
  region: string; //

  type: string; //

  /**
   * 流转类型
   * 0: 根据条件判断
   * 1: 单选一个步骤
   * @example FlowTypeOptions
   */
  flowType: number; // 流转类型

  /**
   * 退回类型
   * 0: 退回到前一步
   * 1: 退回到第一步
   * 1: 退回到某一步
   */
  backType: number; // 退回类型

  /**
   * 退回策略
   * 0: 不能退回
   * 1: 根据处理策略退回
   * 2: 一人退回全部退回
   * 3: 所有人退回才退回
   */
  backPolicy: number; // 退回策略
  backStep: IStepType; // 退回类型为退回到某一步选择的步骤

  /**
   * 抄送
   * 1:无
   * 2:有
   */
  carbonCopy: number; // 抄送
  opinion: string; // 有抄送
  step: "1";

  /**
   * 节点限时处理
   * @deprecated("字段暂时未使用")
   */
  node: string;

  /**
   * 步骤处理按钮
   */
  buttons: IButtonAttr[];
  stepType: "normal"; // 步骤类型
  stepName: string; // 步骤名称
  dynamic: "预留";
  dynamicField: "预留";

  /**
   * 意见栏是否显示
   */
  commentDisplay: boolean; // 意见栏是否显示

  /**
   * 上传附件
   */
  attachment: false; // 附件
  signatureType: string;

  /**
   * 会签
   */
  countersign: boolean;

  /**
   * 签批意见
   * 1:无意见栏
   * 2:有意见栏无签章
   * 3:有意见栏有签章
   */
  sign: "1";

  CounterSignaturePolicy: string;
  CounterSignaturePercentage: number;

  /**
   * 处理策略
   * 1:一人同意即可
   * 0:所有人必须处理
   * 2:依据人数比例
   * 3:按选择人员顺序处理
   * - 独立处理
   */
  handlePolicy: number; // 处理策略  0所有人必须处理 1一人同意即可 2依据人数比例 3独立处理  4 按选择人员顺序处理

  /**
   * 依据人数比例
   */
  handlePercentage: number;

  /**
   * 自定义结果
   */
  isCustomizeComment: false; // 是否自定义审批结果

  /**
   * 自定义结果tag
   */
  customizeComments: any[]; // 自定义审批结果字典
  stopRemark: string;
  /**
   * 处理者类型
   * 0:所有人
   * 1:发起者
   * '':指定处理者
   */
  handType: 0 | 1 | "";

  /**
   * 步骤处理人 id
   * u_xx 用户
   * r_xx 角色
   * p_xx 岗位
   */
  handler: string; // 步骤处理人，可以是人，可以是角色，可以是岗位

  /**
   * 处理人姓名 A,B,C,
   */
  user: string; // 处理人

  /**
   * 抄送人id
   * u_xx 用户
   * r_xx 角色
   * p_xx 岗位
   */
  copyHandler: string;

  /**
   * 抄送人名称字符串
   */
  copyUser: string;
}

/**
 * 返回节点类型
 */
interface IStepType {
  stepId: string;
  stepName: string;
}

/**
 * 按钮配置属性
 */
interface IButtonAttr {
  id: string;

  /**
   * 按钮功能
   */
  buttonClick: string;

  /**
   * 按钮描述
   */
  buttonDescription: string;

  /**
   * 按钮图表
   */
  buttonIcon?: string | null;
}

export type { IPublicFlowNodeProperties, IButtonAttr };
