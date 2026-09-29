export interface Category {
  id: string;
  name: string;
  fullName: string;
  code: string;
  paramsValue: /*string | number | boolean | */ Record<string, any>;
  category: Category;
}
export interface Configs {
  [key: string]: object;
}

export interface TableItems {
  id: string;
  modelId: string;
  modelName: string;
  moduleId: string;
  remark: string;
  tableCode: string;
}
export interface ConfigSetting {
  namespaceId: string;
  namespaceCode: string;
  namespaceName: string;
  category: Category[];
  tenantId: number | null;
  tenantCode: string;
  tenantName: string;
  orgId: number | null;
  orgFullId: string;
  orgName: string;
  orgFullName: string;
  userId: number | null;
  userName: string;
  phoneNumber: string;
  configs: Configs;
  isReload: boolean;
  attrCollection: string[];
  global: boolean;
  moduleId: string;
  ylModuleId: string;
  moduleName: string;
  tableItems?: TableItems[];
  printData?: object[];
  exportData?: object[];
  messageConfig: any;
}

export interface Namespace {
  id: string;
  name: string;
  code: string;
}

export interface Attr {
  code: string;
  name: string;
}
// 配置项界面化
interface position {
  spanNum: number; // 布局栏数
}
interface SelectDefaultProps {
  label: string;
  value: string | number;
}
interface ElementConfig {
  disabled: boolean; // 禁用状态
  placeholder: string; // 占位文字
  clearable: boolean; // 清除按钮显示
  // ComInput
  type: string; // 文本框类型text,textarea,number和其他原生 input 的 type 值;日期选择器year/month/date/dates/datetime
  maxlength: string | number; // 长度限制
  minlength: string | number; // 长度限制
  style: object;
  // ComInputNumber
  max: number; // 最大值
  label: string;
  value: string;
  min: number; // 最小值
  precision: number; // 小数位
  step: number; // 定义递增递减的步进控制
  // ComCheckbox
  trueLabel: string | number | boolean; // 选中时的值
  falseLabel: string | number | boolean; // 没有选中时的值
  // ComDatePicker
  format: string; // 显示和值日期格式化
  isRead?: any;
  // ComSelect
  multiple: boolean; // 多选
  defaultProps: SelectDefaultProps;
  data: []; // 下拉框内容
  // ComJsonEdit
  defaultMode: string; // 默认模式code、tree、form、view
}
interface EventConfig {
  isOn: boolean;
  init: () => void;
  change: () => void;
}
/**
 * 配置属性
 */
export interface ElementOption {
  label: string; // 配置名称（form-item的label）
  labelWidth: string; // label区域的宽度
  comp: string; // 组件名称
  position: position; // 布局
  elementConfig: ElementConfig; // UI界面配置
  eventConfig: EventConfig;
}

// 单个配置项
export interface Config {
  value: any;
  id: string;
  configUi: ElementOption;
  paramsKey: string;
  attributeList: string;
  showTool: boolean;
  remark: string;
  isNest: boolean;
  editable: { isEnable: boolean | number; value: boolean | number };
  content: string;
  isRead: boolean;
  isHasConfig: boolean;
  isCurrentConfig: boolean | number;
}
