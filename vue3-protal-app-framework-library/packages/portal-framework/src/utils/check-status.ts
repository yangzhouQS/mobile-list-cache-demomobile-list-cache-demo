import { GlobalToast } from "./global-toast";

/**
 * @description: 校验网络请求状态码
 * @param {Number} status
 * @return void
 */
export function checkStatus(status: number) {
  switch (status) {
    case 400:
      GlobalToast.error("请求失败！请您稍后重试");
      break;
    case 401:
      GlobalToast.error("登录失效！请您重新登录");
      break;
    case 403:
      GlobalToast.error("当前账号无权限访问！");
      break;
    case 404:
      GlobalToast.error("你所访问的资源不存在！");
      break;
    case 405:
      GlobalToast.error("请求方式错误！请您稍后重试");
      break;
    case 408:
      GlobalToast.error("请求超时！请您稍后重试");
      break;
    case 500:
      GlobalToast.error("服务异常！");
      break;
    case 502:
      GlobalToast.error("网关错误！");
      break;
    case 503:
      GlobalToast.error("服务不可用！");
      break;
    case 504:
      GlobalToast.error("网关超时！");
      break;
    default:
      GlobalToast.error("请求失败！");
  }
}
