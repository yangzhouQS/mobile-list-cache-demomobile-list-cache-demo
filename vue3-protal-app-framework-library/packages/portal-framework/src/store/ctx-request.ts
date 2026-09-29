import { $http } from "../utils";
import { getSearchUrlParams } from "../utils/helpers";
import { appStore } from "./frame-store";
import { MenuType, ModuleContextType, OrgNodeType } from "../types";
import { GlobalToast } from "../utils";

/**
 * 初始化上下文
 */
export function appInitContext(queryParams?: Record<string, any>): Promise<any> {
  const searchParams = getSearchUrlParams() as any;

  const params = {
    applicationId: searchParams.applicationId,
    orgId: searchParams.orgId,
    moduleId: searchParams.moduleId
  };
  if (params.orgId && isNaN(Number(params.orgId))) {
    params.orgId = parseInt(params.orgId, 36);
  }

  if (params.applicationId && isNaN(Number(params.applicationId))) {
    params.applicationId = parseInt(params.applicationId, 36);
  }

  if (queryParams) {
    Object.assign(params, queryParams);
  }

  $http.context.applicationId = params.applicationId; // http上下文赋值

  if (params.orgId) {
    $http.context.orgId = params.orgId as number; // http上下文赋值
  }

  // /services/module-context
  // /services/application-context
  return new Promise((resolve, reject) => {
    $http
      .get("/services/module-context", { params })
      .then((ctxData: ModuleContextType) => {
        const store = appStore();
        ctxData.extType = ctxData.orgExtType;
        store.setContext(ctxData);
        $http.context.tenantId = ctxData.tenantId;
        $http.context.batchId = ctxData.batchId;
        $http.context.orgId = ctxData.orgId;
        $http.context.tenantCode = ctxData.tenantCode;
        $http.context.userName = ctxData.userName;
        Promise.all([getOrgRoot(), mobileMenu(ctxData.orgId), getLastProject(ctxData.orgId)])
          .then(() => {
            resolve({});
          })
          .catch(error => {
            reject(error);
          });
      })
      .catch(error => {
        console.log(error);
        if (error.response && error.response.data) {
          let { code, desc } = error.response.data;
          if (code === "module_access_denied") {
            GlobalToast.warn(desc);
            // 跳转至无权限页面
            // window.open(location.origin)
            // commit('setAuth', false)
            reject(error.response.data);
          }
        } else if (error.request) {
          console.log(error.request);
          GlobalToast.warn(error.message || "上下文加载失败");
        } else {
          console.log("Error", error.message);
        }

        reject(error);
      });
  });
}

/**
 * 获取组织根节点
 * @return {Promise<void>}
 */
function getOrgRoot(): Promise<any> {
  const store = appStore();

  // 获取根节点
  const params = {
    preset: "tree",
    offset: 0,
    limit: 21
  };

  return new Promise(resolve => {
    $http.get("/services/org-nodes", { params }).then(async orgRoot => {
      if (Array.isArray(orgRoot) && orgRoot.length > 0) {
        let orgRootNode = orgRoot[0] as any;
        // orgRootNode.childNodes = []
        orgRootNode.expanded = true;
        orgRootNode.accessible = orgRoot[0].isValid;

        // 获取根节点下的第一级子节点
        orgRootNode.children = await loadMoreOrgNodes(orgRootNode, 10);

        orgRootNode.disabled = !orgRootNode.isValid;

        if (Array.isArray(orgRootNode.children)) {
          orgRootNode.children = orgRootNode.children.map((item: any) => {
            item.disabled = !item.isValid;
            return item;
          });
        }

        // 设置根节点数据
        store.setOrgRoot(orgRootNode);

        resolve(orgRootNode);
      }
    });
  });
}

/**
 * 获取移动菜单并保存到应用状态中
 *
 * 从服务器获取移动菜单数据，并将其保存到应用状态中。
 *
 * @returns 返回一个 Promise，当请求成功时解析为 undefined，请求失败时拒绝并抛出错误。
 */
export async function mobileMenu(orgId: number) {
  const store = appStore();
  $http
    .get("/services/menus")
    .then((result: MenuType[]) => {
      store.setMobileMenu(result, orgId);
    })
    .catch(error => {
      console.log(error);
    });
}

/**
 * 加载树形结构子节点
 * @param {OrgNodeType} node
 * @return {Promise<any>}
 */
export async function toggleOrgNode(node: OrgNodeType): Promise<any> {
  const store = appStore();
  const params = {
    preset: "tree",
    // productId: state.productId,
    parent: node.id,
    limit: 10,
    offset: 0,
    applicationId: store.applicationId
  };
  return await $http.get("/services/org-nodes", { params });
}

/**
 * 组织机构平行搜索查询接口
 * @return {Promise<any>}
 */
export function searchOrgNodes({ key = "" }): Promise<any> {
  const store = appStore();
  return $http.get("/services/org-nodes", {
    params: {
      preset: "search",
      key: key,
      // productId: state.sid,
      applicationId: store.applicationId
    }
  });
}

/**
 * 平行分页查询组织节点
 * @param {OrgNodeType} node 当前节点对象
 * @param limit 页大小
 * @return {Promise<void>}
 */
export async function loadMoreOrgNodes(node: OrgNodeType, limit = 10): Promise<any> {
  const store = appStore();
  const params = {
    preset: "tree",
    parent: node.id,
    limit: limit,
    offset: node.offset || 0,
    applicationId: store.applicationId
  };

  const children = await $http.get("/services/org-nodes", { params });
  if (Array.isArray(children)) {
    for (const child of children) {
      if (child.isValid === false) {
        child.disabled = true;
      }
    }
  }
  return children;
}

/**
 * 查询上级项目
 * @return {Promise<void>}
 */
function getLastProject(orgId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    $http
      .get("/cbaseinfo/organizations-type", {
        params: {
          extType: "project",
          orgType: "project",
          orgId: orgId, // 10001, // portal.$context.orgId,
          type: 0
        }
      })
      .then((result: any) => {
        if (result && result.orgId) {
          appStore().setLastProject(result);
          resolve(result);
        } else {
          resolve(null);
        }
      })
      .catch(error => {
        reject(error);
      });
  });
}