import { $http } from "../../utils";
import { ObjectLiteral, ResulType } from "../workflow-types";
import { useContext } from "../../hooks/useContext";
import { getFlowTaskField } from "../../hooks/task-hook";

export const flowTaskApiHelper = {
  /**
   * 流程任务执行,流转过程调用
   * @param {Record<string, any>} params
   * @returns {Promise<unknown>}
   */
  executeTask: async (params: Record<string, any>) => {
    params.userInfo = getUserInfo();
    return await $http.post("/flow/flow-helper/execute-task", params);
  },

  /**
   * 获取流程的表单配置
   * @example params {
   *     "tenantId": 10001,
   *     "flowId": "JeE0Ey0LT1uTgIf8QLKOI",
   *     "orgId": 971365888684544,
   *     "instanceId": "1741228363870720",
   *     "taskId": "952d333f-9397-4f93-8099-b6dee4dd8708",
   *     "platform": "pc",
   *     "userInfo": {
   *         "id": 761023283016704,
   *         "userName": "###"
   *     }
   * }
   * @param params
   * @return {*}
   */
  queryFlowPage: async (params: Record<string, any>) => {
    params.userInfo = getUserInfo();
    return await $http.post("/flow/flow-helper/flow-page", params);
  },

  /**
   * 查看任务审批流过程
   * @param {Record<string, any>} params
   * @returns {Promise<unknown>}
   */
  getFlowProcess: async (params: Record<string, any>) => {
    params.userInfo = getUserInfo();
    return await $http.post("/flow/flow-helper/flow-process", params);
  },

  /**
   * 查看流程的处理过程,流程详情查看
   * @example params example {
   *     "tenantId": 10001,
   *     "taskId": "952d333f-9397-4f93-8099-b6dee4dd8708",
   *     "orgId": 971365888684544,
   *     "userInfo": {
   *         "id": 761023283016704,
   *         "userName": "###"
   *     }
   * }
   * @param params
   * @return {*}
   */
  taskPreview: async (params: Record<string, any>) => {
    params.userInfo = getUserInfo();
    return await $http.post("/flow/flow-helper/task-preview", params);
  },

  /**
   * 流程撤回
   * @param {Record<string, any>} params
   * @returns {Promise<unknown>}
   */
  canCancelSubmit: async (params: Record<string, any>) => {
    params.userInfo = getUserInfo();
    return await $http.post("/flow/flow-helper/flow-cancel-submit", params);
  },

  /**
   * 获取下一步流转配置
   * @param {Record<string, any>} params
   * @returns {Promise<unknown>}
   */
  getConfigNextStep: async (params: Record<string, any>) => {
    params.userInfo = getUserInfo();
    return await $http.post("/flow/flow-helper/task-next-step", params);
  },

  /**
   * 任务抄送
   * @param {Record<string, any>} params
   * @returns {Promise<unknown>}
   */
  buttonTaskCopyFor: async (params: Record<string, any>) => {
    params.userInfo = getUserInfo();
    return await $http.post("/flow/flow-helper/task-copy-for", params);
  },

  /**
   * 驳回判断接口
   * @param {Record<string, any>} params
   * @returns {Promise<unknown>}
   */
  getBackStep: async (params: Record<string, any>) => {
    params.userInfo = getUserInfo();
    return await $http.post("/flow/flow-helper/task-back-step", params);
  },

  /**
   * 查询任务信息，流程和配置信息
   * @param params
   * @return {any}
   */
  queryTaskInfo(params: ObjectLiteral) {
    return $http.get(`/flow/flow-helper/task-info`, params);
  },

  /**
   * 根据条件灵活查询任务表数据
   * @param {ObjectLiteral} params
   * @return {any}
   */
  getTaskParams(params: ObjectLiteral, opt: ObjectLiteral = {}) {
    return $http.post(`/flow/flow-task/task-params`, params, opt);
  },

  /**
   * 任务条件查询任务参数
   * @param params
   * @return {any}
   */
  queryTaskParams: (params: ObjectLiteral) => {
    params.select = getFlowTaskField().map(field => {
      return `f_flow_task.${field}`;
    });
    return $http.post("/flow/flow-task/query-task-condititon", params);
  },

  /**
   * 流程18.查询当前租户可以使用的流程模型
   * @param tenantId
   * @param orgId
   * @return {Promise<unknown>}
   */
  queryDesignParams: (tenantId, orgId) => {
    return $http.get(`/flow/flow-helper/design-params?tenantId=${tenantId}&orgId=${orgId}`);
  },

  /**
   * 查看任务附件
   * @param {ObjectLiteral} params
   * @return {any}
   */
  queryTaskAttachment(params: ObjectLiteral) {
    return $http.post("/flow/file-attachment/getMany", params);
  },

  /**
   * 文件下载
   * @param {ObjectLiteral} params
   * @return {Promise<unknown>}
   */
  fileDownload(params: ObjectLiteral) {
    return $http.post("/shared-data/fs/accesses", params);
  },

  /**
   * 查询任务统计
   *
   * @param {ObjectLiteral} params
   * @return {Promise<unknown>}
   */
  queryTaskSum(params: ObjectLiteral): Promise<
    ResulType<{
      waitManage: number; // 待办数量
      meStart: number; // 我发起的数量
      aboutMe: number; // 我参与的数量
    }>
  > {
    return $http.post("/flow/flow-helper/task-sum", params);
  }
};

/**
 * 获取当前登录用户信息
 * @return {{id: any, userName: any}}
 */
export function getUserInfo() {
  const ctx = useContext();
  return {
    id: ctx.userId,
    userName: ctx.userName
  };
}
