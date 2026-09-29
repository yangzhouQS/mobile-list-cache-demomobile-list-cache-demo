import dayjs from 'dayjs';
// 时间处理
export const formatDate = (val = new Date(), format = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs(val).format(format);
};

export const getUrlParameters = function (url: string): any {
  // 移除hash部分
  if (url.indexOf('#') > 0) {
    url = url.split('#')[0];
  }
  return JSON.parse(`{"${decodeURI(url.split('?')[1]).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"')}"}`);
};
