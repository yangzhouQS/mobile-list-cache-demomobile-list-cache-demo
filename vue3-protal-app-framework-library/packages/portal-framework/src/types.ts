import { Component } from "vue";
import { RouteRecordRaw } from "vue-router";

type Data = Record<string, unknown>;

/**
 * 创建框架的参数
 */
export interface CreateFrameworkOptions {
  rootComponent: Component;
  rootProps?: Data | null;

  /**
   * 路由配置
   */
  routes: Readonly<RouteRecordRaw[]>;

  /**
   * 低代码使用，加载指定应用组织的上下文
   */
  queryParams?: {
    applicationId: number;
    orgId: number;
    moduleId?: number;
  };
}

/**
 * 框架的上下文参数
 */
export interface AppContextType {
  batchId: string;
  userId: number;
  userName: string;
  userSource: string;
  tenantId: number;
  tenantName: string;
  applicationId: string;
  extraMenus: any[];
  permissions: string[];
  orgId: number;
  orgType: string;
  orgExtType: string;
  extType: string;
  parentId: number;
  orgName: string;
  orgShortName: string;
  orgFullName: string;
  applicationMode?: any;
  multiTenant: boolean;
  growingIOProjectId: string;
  features: string[];
  workflowEngine: string;
}

/**
 * /services/module-context 接口返回类型
 */
export interface ModuleContextType {
  batchId: string;
  userId: number;
  userName: string;
  userSource: string;
  tenantId: number;
  tenantCode: string;
  tenantLogo: string;
  tenantName: string;
  applicationId: string;
  applicationLogo: string;
  applicationTitle: string;
  extraMenus: any[];
  orgId: number;
  fullId: string;
  orgType: string;
  orgExtType: string;
  parentId: number;
  orgName: string;
  orgShortName: string;
  orgFullName: string;
  applicationMode: string;
  moduleId: string;
  moduleName: string;
  moduleUrl: string;
  permissions: string[];
  productCode?: any;
  moduleCode: string;
  multiTenant: boolean;
  growingIOProjectId: string;
  licenseMode: string;
  features: string[];
  workflowEngine: string;
  [key: string]: any;
}

/**
 * 组织节点类型
 */
export interface OrgNodeType {
  id: number;
  fullId: string;
  fullName: string;
  name: string;
  shortName: string;
  orgType: string;
  extType: string;
  sort: number;
  isLeaf: boolean;
  isValid: boolean;
  project?: OrgNodeProject;

  offset: number;
}

/**
 * 菜单类型
 */
export interface MenuType {
  id: string;
  icon: string;
  url: string;
  code: string;
  menuId: string;
  aliasName: string;
  sortNum: number;
  parentId: string;
  moduleId: string;
  isDisabled: boolean;
  isDefault: boolean;
  originalId?: any;
  orgId: number;
  urlParams?: any;
  applicationType: string;
  moduleType: string;
  isNewWindow: boolean;
  productCode?: any;
}

export interface OrgNodeProject {
  shortName: string;
}

export type TypeTreeViewParams = {
  done: (children: any[]) => void;
  fail: () => void;
  key: number | string; // data数据唯一key
  data: Record<string, any>; // 加载更多节点原始数据
  node: Record<string, any>; // 格式化后节点数据
  paginationParams: {
    // 分页信息
    limit: number;
    draw: number;
    offset: number;
    order: any[];
    condtionItems: any[];
  };
};
