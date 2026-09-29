import { IPublicFlowNodeType } from "./flow-types";
import { IPublicTaskItemType } from "../task-item-type";
import ISignConfigType from "../../workflow-utils/flow-event-utils";
import { ICurrentSignatureConfigType } from "../../flow-signature/types";

export enum EButtonClick {
  submit = "submit",
  goBack = "goBack",
  stop = "stop",
  copyFor = "copyFor",
  complete = "complete",
  copyForComplete = "copyForComplete",
  flowProcess = "flowProcess",

  // 触发审批意见按钮
  commentButton = "commentButton"
  // print = 'print',
  // intelligentAudit = 'intelligentAudit',
  // contractManagement = 'contractManagement',
  // intelligentComparison = 'intelligentComparison',
}

interface IPublicFlowButtonDataType {
  id: string;

  /**
   * 按钮功能
   */
  buttonClick: EButtonClick;

  /**
   * 按钮描述
   */
  buttonDescription: string;

  /**
   * 按钮图表
   */
  buttonIcon?: string | null;

  /**
   * 按钮显示名称
   */
  buttonTitle: string | null;
}

/**
 * 按钮处理页面参数结构
 */
interface IPublicFlowPageConfigType {
  flowStepButtons: IPublicFlowButtonDataType[];
  flowDesignJson: string;
  stepModel: IPublicFlowNodeType;
  task: IPublicTaskItemType;

  // 节点属性
  attachment: boolean; // 附件管理是否显示
  commentDisplay: boolean; // 处理说明是否显示
  flowOption: string; // 处理说明是否显示，显示时填写的文字说明
  commentRequired: number; // 处理说明是否必填

  // 自定义结果处理
  isCustomizeComment: boolean; // 是否允许自定义
  flowCustomizeComment: string; // 自定义选择的结果
  isTaskPreview: boolean; // 是否为预览，不显示顶部操作按钮行
  showFlowProcessButton: boolean; // 任务完成是否展示处理流程进度的按钮

  // 签名相关
  signatureOptions: ISignConfigType[]; // 签名配置
  showFlowSignature: boolean;

  // 当前签章配置
  currentSignatureConfig: ICurrentSignatureConfigType;
  signaturePreviewUrl: string;
}

export type { IPublicFlowButtonDataType, IPublicFlowPageConfigType };
