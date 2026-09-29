import { defineStore } from "pinia";
import { reactive, computed, toRefs } from "vue";
import { filter } from "lodash";
import { MenuType, ModuleContextType, OrgNodeType } from "../types";

export const appStore = defineStore(location.pathname, () => {
  const state = reactive({
    $context: {
      batchId: "",
      userId: -1,
      userName: "",
      userSource: "",
      tenantId: -1,
      tenantCode: "",
      tenantLogo: "",
      tenantName: "",
      applicationId: "",
      applicationLogo: "",
      applicationTitle: "",
      extraMenus: [],
      orgId: -1,
      fullId: "",
      orgType: "",
      orgExtType: "",
      parentId: -1,
      orgName: "",
      orgShortName: "",
      orgFullName: "",
      applicationMode: "",
      moduleId: "",
      moduleName: "",
      moduleUrl: "",
      permissions: [],
      productCode: null,
      moduleCode: "",
      multiTenant: false,
      growingIOProjectId: "",
      licenseMode: "",
      features: [],
      workflowEngine: ""
    } as ModuleContextType,
    queryParams: {
      applicationId: "",
      moduleId: "",
      orgId: "",
      moduleUrl: ""
    },
    __menus: [] as MenuType[],
    __orgMenuCache: {} as Record<number, MenuType[]>,
    rawMenus: [] as MenuType[],
    orgRoot: {
      id: 0,
      fullId: "",
      fullName: "",
      name: "",
      shortName: "",
      orgType: "",
      extType: "",
      sort: 0,
      isLeaf: false,
      isValid: false,
      offset: 0
    } as OrgNodeType,
    configSetting: {
      namespaceCode: "sysConfig"
    },
    lastProject: {} as Record<string, any>,
    isRefresh: false,
    loading: false,
    isAuth: true,
    categorysList: {
      items: [] as any[]
    }
  });
  const cache = window.sessionStorage || {
    getItem(key) {
      return this[key]
    },
    setItem(key, value) {
      this[key] = value
    },
    removeItem(key) {
      delete this[key]
    }
  }
  function setQueryParams(queryParams: any) {
    state.queryParams = Object.assign(state.queryParams, queryParams);
  }

  function setContext(ctxConfig: ModuleContextType) {
    state.$context = Object.assign(state.$context, ctxConfig) as ModuleContextType;
  }

  function setOrgRoot(orgData: OrgNodeType) {
    Object.assign(state.orgRoot, orgData);
  }

  function setMobileMenu(menus: MenuType[], orgId: number) {
    state.__orgMenuCache[orgId] = menus;
    state.__menus = filter(menus, (menu: MenuType) => !menu.isDefault);
    state.rawMenus = menus;
  }

  function setLastProject(projectData: any) {
    if (projectData.fullId) {
      Object.assign(state.$context, {
        lastProject: projectData
      });
    }
    state.lastProject = projectData;
  }

  function setCategorysList(projectData: any) {
    state.categorysList = projectData;
  }

  function setFullId(fullData: any) {
    Object.assign(state.$context, fullData);
  }

  function setIsRefresh(refreshVal: boolean) {
    state.isRefresh = refreshVal;
  }

  function setLoading(loading: boolean) {
    state.loading = loading;
  }

  const permissions = computed(() => state.$context.permissions);
  const applicationId = computed(() => state.$context.applicationId);
  const tenantId = computed(() => state.$context.tenantId);
  const tenantName = computed(() => state.$context.tenantName);
  const tenantCode = computed(() => state.$context.tenantCode);
  const orgId = computed(() => state.$context.orgId);
  const orgName = computed(() => state.$context.orgName);
  const userId = computed(() => state.$context.userId);
  const userName = computed(() => state.$context.userName);
  const loadingState = computed(() => state.loading);
  const menus = computed(() => state.__orgMenuCache[state.$context.orgId] || state.__menus || []);
  const user = computed(() => ({
    id: state.$context.userId,
    name: state.$context.userName
  }));
  const currentOrg = computed(() => ({
    id: state.$context.orgId,
    name: state.$context.orgName,
    shortName: state.$context.orgShortName,
    orgType: state.$context.orgType,
    extType: state.$context.orgExtType,
    orgExtType: state.$context.orgExtType
  }));
  const clPrinter = computed(() => {
    // 1. 从缓存获取
    const clPrintBridge = cache.getItem('clPrintBridge');
    const clPrint = cache.getItem('clPrinter');

    // 2. 不满足条件直接返回 null 或 undefined
    if (typeof clPrintBridge !== 'string' || typeof clPrint !== 'string') {
      return null;
    }

    try {
      // 3. 安全解析 JSON
      const printBridge = JSON.parse(clPrintBridge);
      const print = JSON.parse(clPrint);

      // 4. 实例化云打印机
      const cloudPrinter = new window.printCore.PrintCore();
      cloudPrinter.putCloudStatus(true);

      // 5. 拼接桥接索引（安全取值）
      const bridgeCode = printBridge?.code;
      const bridgeName = printBridge?.name;
      const printCode = print?.code;
      if (!bridgeCode || !bridgeName || !printCode) {
        return null;
      }
      cloudPrinter.setBridgeIndex(`${bridgeCode};${bridgeName},${printCode}`);
      // 6. 正确返回实例
      return cloudPrinter;
    } catch (err) {
      console.error('云打印机初始化失败：', err);
      return null;
    }
  });
  const printModel = computed(() => {
    return cache.getItem("printModel") ?? "0";
  });
  return {
    ...toRefs(state),
    setQueryParams,
    setContext,
    setOrgRoot,
    setMobileMenu,
    setLastProject,
    setCategorysList,
    setFullId,
    setIsRefresh,
    setLoading,
    cache,
    permissions,
    applicationId,
    tenantId,
    tenantName,
    tenantCode,
    orgId,
    orgName,
    userId,
    userName,
    loadingState,
    menus,
    user,
    currentOrg,
    clPrinter,
    printModel
  };
});
