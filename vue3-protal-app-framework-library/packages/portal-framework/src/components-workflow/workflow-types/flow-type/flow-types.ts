import { type IPublicFlowNodeProperties } from "./flow-node-type";
// import { type IPublicFlowEdgeProperties } from "./flow-edge-type";

/**
 * 流程属性设置
 * node-mp-approval-process-website\src\web-content\components\property-setting\set-install-dialog.vue
 */
/*
interface InnerFlowDesignProperties {
  /!**
   * 流程在哪个组织生效
   *!/
  orgId: number;
  orgName: string;
  tenantId: number;
  tenantCode: string;
  tenantName: string;

  /!**
   * 流程标题
   *!/
  flowName: string;

  organization: string;

  /!**
   * 流程数据备注
   *!/
  remark: string;

  /!**
   * 流程状态
   * TODO 启用和禁用是没有更新, 待确定
   *!/
  flowState: string;

  /!**
   * 系统消息
   * 使用系统消息提醒节点处理人、抄送人
   *!/
  systemMessage: boolean;

  /!**
   * 邮件消息
   * 使用邮件提醒节点处理人、抄送人
   *!/
  mailMessage: boolean;

  /!**
   * 使用短信提醒节点处理人、抄送人
   *!/
  noteMessage: boolean;

  /!**
   * 流程发起后允许撤回
   *!/
  startRecall: boolean;

  /!**
   * 流程结束后允许撤回
   *!/
  endRecall: boolean;

  /!**
   * 允许流程发起人催办
   *!/
  flowInitiator: boolean;

  /!**
   * 流程日志和流转图
   *!/
  flowLog: boolean;

  /!**
   * 关联表单名称
   *!/
  formName: "测试配置表单";

  /!**
   * 关联表单名称
   *!/
  flowFormName: string;

  /!**
   * 关联表单id
   *!/
  flowFormId: string;

  /!**
   * 产品编码
   *!/
  productCode: string;

  /!**
   * 模块名称
   *!/
  moduleName: string;

  /!**
   * 模块编码
   *!/
  moduleCode: string;
}
*/

interface Point {
  id?: string;
  x: number;
  y: number;
}

interface TextObject {
  /**
   * 文本内容
   */
  value: string;

  /**
   * 文本中心x轴坐标
   */
  x: number;

  /**
   * 文本中心y轴坐标
   */
  y: number;

  /**
   * 文本是否允许被拖动调整位置，保存时不会保存此属性
   */
  draggable: boolean;

  /**
   * 文本是否允许被双击编辑，保存时不会保存此属性
   */
  editable: boolean;
}

enum EEdgeType {
  polyline = "polyline",
  rect = "rect",
  start = "start",
  end = "end",
  branch = "branch"
}

/**
 * 节点边的配置
 * Doc: https://site.logic-flow.cn/docs/#/zh/api/edgeModelApi?id=数据属性
 */
/*interface IFlowEdgeData {
  /!**
   * 边 id
   *!/
  id: string;

  /!**
   * 边类型
   *!/
  type: EEdgeType;

  /!**
   * 节点连线的起始节点
   *!/
  sourceNodeId: string;

  /!**
   * 节点连线的结束节点
   *!/
  targetNodeId: string;

  /!**
   * 连线的开始坐标
   *!/
  startPoint: Point;

  /!**
   * 连线的结束坐标
   *!/
  endPoint: Point;

  /!**
   * 边文本
   *!/
  text: string | Record<string, any>;

  /!**
   * 连线集合
   * 控制边的轨迹，polyline和bezier有，line没有
   *!/
  pointsList: Point[];

  /!**
   * 节点元素属性配置
   * 边的自定义属性
   *!/
  properties: IPublicFlowEdgeProperties;
}*/

/**
 * 每个节点配置
 * https://site.logic-flow.cn/docs/#/zh/api/nodeModelApi?id=数据属性
 */
interface IPublicFlowNodeType extends Point {
  /**
   * 节点 id
   */
  id: string;

  /**
   * 节点连线
   */
  type: EEdgeType;

  /**
   * 节点文本
   */
  text: TextObject;

  /**
   * 节点业务自定义属性
   */
  properties: IPublicFlowNodeProperties;
}
/*
/!**
 * flowDesignJson 字段存储数据格式
 *!/
interface FlowDesignJsonType {
  /!**
   * 边线
   *!/
  lines: IFlowEdgeData[];

  /!**
   * 节点元素
   *!/
  steps: IPublicFlowNodeType[];

  /!**
   * 流程属性
   *!/
  properties: InnerFlowDesignProperties;
}

/!**
 * 流程引擎数据结构
 *!/
interface IPublicLogicFlowType {
  /!**
   * 边
   *!/
  edges: IFlowEdgeData[];

  /!**
   * 元素节点
   *!/
  nodes: IPublicFlowNodeType[];

  /!**
   * 流程附加属性
   *!/
  properties: InnerFlowDesignProperties;
}*/

export type { IPublicFlowNodeType };
