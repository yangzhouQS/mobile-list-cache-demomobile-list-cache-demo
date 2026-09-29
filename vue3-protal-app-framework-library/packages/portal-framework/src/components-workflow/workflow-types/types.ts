/**
 * listItem类型
 */
interface IPublicListItemType<T = any> {
  item: T;
  index: number;
}

/**
 * 接口查询返回类型
 */
interface ResulType<T = any> {
  code: number;
  result: T;
  status: "success" | "error";
  message?: string;
  tasks?: any;
  deviceId?: any;
}

interface UserDataType {
  id: number;
  name: string;
  phoneNumber: string;
}

export type { IPublicListItemType, ResulType, UserDataType };
