import { getCurrentInstance as _getCurrentInstance } from "vue";
import { parse as qsParse, stringify as qsStringify } from "qs";
import { MenuType } from "../types";

export function getCurrentInstance(name: string, message?: string) {
  const vm = _getCurrentInstance();

  if (!vm) {
    throw new Error(`[AppFramework] ${name} ${message || "must be called from inside a setup function"}`);
  }

  return vm;
}

export function toKebabCase(str = "") {
  if (toKebabCase.cache.has(str)) return toKebabCase.cache.get(str)!;
  const kebab = str
    .replace(/[^a-z]/gi, "-")
    .replace(/\B([A-Z])/g, "-$1")
    .toLowerCase();
  toKebabCase.cache.set(str, kebab);
  return kebab;
}

toKebabCase.cache = new Map<string, string>();

export function getSearchUrlParams() {
  // const searchStr = `${location.search}`.replace(/\?/g, "");
  return qsParse(location.search, { ignoreQueryPrefix: true });
}

/**
 * 解析组织机构类型参数
 * @param node
 * @return {string}
 */
export const nodeIconClass = (node: any) => {
  const { extType } = node;
  let cls = "icon iconfont ";
  switch (extType) {
    case "group":
      cls += "icongroup";
      break;
    case "command":
      cls += "iconcommand";
      break;
    case "company":
      cls += "iconcompany";
      break;
    case "specialized":
      cls += "iconspecialized";
      break;
    case "department":
      cls += "icondepartment";
      break;
    case "folder":
      cls += "iconfolder";
      break;
    case "project":
      cls += "iconproject";
      break;
    case "production":
      cls += "iconproduction";
      break;
    default:
      cls += "el-icon-detail";
      break;
  }
  return cls;
};

/**
 * 重定向
 * @param {string} applicationId
 * @param {string} orgId
 * @param {string} url
 */
export function goRedirect(applicationId: string, orgId: string, url = location.pathname) {
  let searchStr = location.search.replace(/\?/g, "");
  const searchParams = qsParse(searchStr);

  // 删除applicationId和orgId参数
  delete searchParams.applicationId;
  delete searchParams.orgId;
  // window.addEventListener("load", () => {
  //   const state = {
  //     title: orgId,
  //     url: "${url}?${qsStringify(searchParams)}&applicationId=${applicationId}&orgId=${orgId}"
  //   };
  //   window.history.pushState(state, "", `?${qsStringify(searchParams)}&applicationId=${applicationId}&orgId=${orgId}`);
  // });
  // window.addEventListener(
  //   "popstate",
  //   function (event) {
  //     console.log("URL已变化，当前URL：", window.location.href);
  //   },
  //   true
  // );
  // window.location.href = `${url}?${qsStringify(searchParams)}&applicationId=${applicationId}&orgId=${orgId}`;
  window.location.replace(`${url}?${qsStringify(searchParams)}&applicationId=${applicationId}&orgId=${orgId}`);
}

export function openMenu(menu: MenuType) {
  if (!menu) {
    // console.log("menu参数不完整", menu);
    return;
  }
  const searchParams = getSearchUrlParams();
  searchParams.moduleId = menu.moduleId;
  window.location.href = `${menu.url}?${qsStringify(searchParams)}`;
}
