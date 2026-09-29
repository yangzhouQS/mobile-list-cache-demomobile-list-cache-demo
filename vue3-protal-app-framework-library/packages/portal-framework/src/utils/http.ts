import crypto from "../utils/crypto-js";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import type { AxiosResponse, AxiosRequestConfig, AxiosInstance } from "axios";
import { GlobalToast } from "./global-toast";
// 常量 登录地址
const LOGIN_ADDRESS = document.location.origin + "/login.html";

/**
 * 请求上下文
 */
export interface RequestContext {
  tenantId?: number;
  tenantCode?: string;
  orgId?: number;
  userName?: string;
  userId?: number;
  applicationId?: number | string;
  batchId?: string;
}

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  loading?: boolean;
  cancel?: boolean;
}

const config = {
  // 默认地址请求地址，可在 .env.** 文件中修改
  baseURL: "",
  // 设置超时时间
  timeout: 30000,
  // 跨域时候允许携带凭证
  withCredentials: true
};

class RequestHttp {
  service: AxiosInstance;
  context: RequestContext;

  public constructor(config?: AxiosRequestConfig) {
    this.context = {};

    if (!config) config = {};
    config.validateStatus = function (status: number) {
      switch (status) {
        case 401:
        case 402:
        case 408:
          window.open(LOGIN_ADDRESS, "_self");
          return false;
      }
      return status > 100 && status < 300;
    };

    // instantiation
    this.service = axios.create(config);

    /**
     * @description 请求拦截器
     * 客户端发送请求 -> [请求拦截器] -> 服务器
     * token校验(JWT) : 接受服务器返回的 token,存储到 vuex/pinia/本地储存当中
     */
    this.service.interceptors.request.use(
      (config: CustomAxiosRequestConfig) => {
        /*const userStore = useUserStore();
        // 重复请求不需要取消，在 api 服务中通过指定的第三个参数: { cancel: false } 来控制
        config.cancel ??= true;
        config.cancel && axiosCanceler.addPending(config);
        // 当前请求不需要显示 loading，在 api 服务中通过指定的第三个参数: { loading: false } 来控制
        config.loading ??= true;
        config.loading && showFullScreenLoading();
        if (config.headers && typeof config.headers.set === "function") {
          config.headers.set("x-access-token", userStore.token);
        }*/

        const _context = this.context;
        // console.log("====_context====", this);
        Object.assign(config.headers, {
          "x-client-ajax": true,
          "x-org-id": _context.orgId ?? "",
          "x-user-name": crypto.encrypt(_context.userName) || "",
          "x-batch-id": _context.batchId ?? "",
          "x-application-id": _context.applicationId ?? "",
          "x-tenant-id": _context.tenantId ?? "",
          "x-tenant-code": _context.tenantCode ?? ""
        });
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    /**
     * @description 响应拦截器
     *  服务器换返回信息 -> [拦截统一处理] -> 客户端JS获取到信息
     */
    this.service.interceptors.response.use(
      (response: AxiosResponse & { config: CustomAxiosRequestConfig }) => {
        const { data /*, config*/ } = response;

        /*const userStore = useUserStore();
        axiosCanceler.removePending(config);
        config.loading && tryHideFullScreenLoading();
        // 登录失效
        if (data.code == ResultEnum.OVERDUE) {
          userStore.setToken("");
          router.replace(LOGIN_URL);
          ElMessage.error(data.msg);
          return Promise.reject(data);
        }
        // 全局错误信息拦截（防止下载文件的时候返回数据流，没有 code 直接报错）
        if (data.code && data.code !== ResultEnum.SUCCESS) {
          ElMessage.error(data.msg);
          return Promise.reject(data);
        }*/
        // 成功请求（在页面上除非特殊情况，否则不用处理失败逻辑）
        return data;
      },
      async (error: AxiosError) => {
        // 请求超时 && 网络错误单独判断，没有 response
        if (error.message.indexOf("timeout") !== -1) GlobalToast.error("请求超时！请您稍后重试");
        if (error.message.indexOf("Network Error") !== -1) GlobalToast.error("网络错误！请您稍后重试");
        // 根据服务器响应的错误状态码，做不同的处理
        // if (response) checkStatus(response.status);
        // 服务器结果都没有返回(可能服务器错误可能客户端断网)，断网处理:可以跳转到断网页面
        // if (!window.navigator.onLine) router.replace("/500");
        return Promise.reject(error);
      }
    );
  }

  /**
   * @description 常用请求方法封装
   */
  get<T>(url: string, params?: object, _object = {}): Promise<T> {
    if (!params) params = {};
    return this.service.get(url, Object.assign(params, _object));
  }
  post<T>(url: string, params?: object | string, _object = {}): Promise<T> {
    return this.service.post(url, params, _object);
  }
  put<T>(url: string, params?: object, _object = {}): Promise<T> {
    return this.service.put(url, params, _object);
  }
  delete<T>(url: string, params?: any, _object = {}): Promise<T> {
    return this.service.delete(url, { params, ..._object });
  }
  download(url: string, params?: object, _object = {}): Promise<BlobPart> {
    return this.service.post(url, params, { ..._object, responseType: "blob" });
  }
}

// 请求实例方法
export const $http = new RequestHttp(config);
