import { Router } from "vue-router";
import { IPublicTaskItemType } from "../workflow-types";

/**
 * 跳转到任务详情
 * @param router 路由实例参数
 * @param {IPublicTaskItemType} task
 * @param showPreviewDetail boolean
 */
export const flowTaskDetailRoute = (router: Router, task: IPublicTaskItemType, showPreviewDetail: boolean) => {
  router.push({
    path: "InnerFlowTaskDetail",
    query: {
      showPreviewDetail: `${showPreviewDetail}`,
      orgId: task.orgId,
      taskId: task.id,
      instanceId: task.instanceId,
      flowId: task.flowId
    }
  });
};

/**
 * 跳转到任务流程
 * @param router
 * @param {IPublicTaskItemType} task
 */
export const flowTaskProcessRoute = (router: Router, task: IPublicTaskItemType) => {
  router.push({
    path: "InnerFlowTaskProcess",
    query: {
      orgId: task.orgId,
      taskId: task.id,
      instanceId: task.instanceId,
      flowId: task.flowId
    }
  });
};

/**
 * 跳转到任务催办
 * @param router
 * @param {IPublicTaskItemType} task
 */
export const flowTaskUrgeRoute = (router: Router, task: IPublicTaskItemType) => {
  router.push({
    path: "InnerFlowTaskUrge",
    query: {
      orgId: task.orgId,
      taskId: task.id,
      instanceId: task.instanceId
      // flowId: task.flowId
    }
  });
};
