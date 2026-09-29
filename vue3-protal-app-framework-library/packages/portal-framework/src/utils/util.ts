import dayjs from "dayjs";

// 时间处理
export const formatDate = (val?: string | Date, format = "YYYY-MM-DD HH:mm:ss") => {
  if (!val) {
    val = new Date();
  }
  return dayjs(val).format(format);
};

export const getUrlParameters = function (url: string): any {
  // 移除hash部分
  if (url.indexOf("#") > 0) {
    url = url.split("#")[0];
  }
  return JSON.parse(`{"${decodeURI(url.split("?")[1]).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"')}"}`);
};

/**
 * 异常错误解析
 * @param error
 * @param errorTip
 * @return {*|string}
 */
export const errorMessage = (error: any, errorTip = "处理失败") => {
  if (error && error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }

  return errorTip;
};

/**
 * 分页参数类
 */
export class QueryParams {
  conditionLambda = "";
  conditionValue = {};
  orderBy = {};
  tableName = "";

  /**
   * 页偏移
   * @type {number}
   */
  skip = 0;

  /**
   * 页大小
   * @type {number}
   */
  take = 10;

  /**
   * 查询字段
   */
  select = [];

  constructor(params) {
    this.conditionLambda = params.conditionLambda ?? "";
    this.conditionValue = params.conditionValue ?? {};
    this.orderBy = params.orderBy ?? {};
    this.tableName = params.tableName ?? "";
    this.skip = params.skip ?? 0;
    this.take = params.take ?? 20;
    if (Array.isArray(params.select) && params.tableName) {
      this.select = params.select.map((field: string) => {
        return `${params.tableName}.${field}`;
      });
    }
  }

  mappingParams(params: Record<string, any>) {
    this.skip = params.offset;
    this.take = params.limit;
  }
}
