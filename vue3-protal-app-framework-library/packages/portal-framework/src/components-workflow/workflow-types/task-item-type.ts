interface IPublicTaskItemType {
  id: string;
  createdAt: string;
  creatorId: string;
  creatorName: string;
  modifiedAt: string;
  modifierId: string;
  modifierName: string;
  isRemoved: boolean;
  version: number;
  tenantCode: string;
  tenantId: number;
  tenantName: string;
  orgId: number;
  orgName: string;
  prevId: string;
  prevStepId: string;
  flowId: string;
  flowName: string;
  stepId: string;
  stepName: string;
  flowGroupId: string;
  instanceId: string;
  oriInstanceId?: any;
  instanceCode: string;
  taskType: number;
  taskTitle: string;
  flowSenderId: string;
  flowSenderName: string;
  flowReceiveId: string;
  flowReceiveName: string;
  flowReceiveTime: string;
  flowOpenTime: string;
  flowCompletedTime: string;
  flowComment: string;
  flowCustomizeComment: string;
  flowOption: string;
  isSign: number;
  attachKeys: string;
  sortCode: number;
  status: number;
  taskExecuteType: number;
  flowStepSortCode: number;
  flowOtherType: number;
  remark: string;
  isFinished: boolean;
}

/**
 * 任务列表接口查询任务返回结果
 */
interface QueryTaskResultType {
  count: number;
  result: IPublicTaskItemType[];
}

export type { QueryTaskResultType, IPublicTaskItemType };
