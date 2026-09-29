/**
 * Tab 选项卡属性
 */
export interface TabPaneProps {
  /** tab 的唯一标识 */
  key?: string | number;
  /** tab 的标题 */
  title: string;
  /** tab 的内容（字符串） */
  content?: string;
  /** tab 的内容（函数返回 VNode） */
  slot?: () => any;
  /** 是否禁用 */
  disabled?: boolean;
  /** 角标数字 */
  badge?: number | string;
}

/**
 * Tab 切换事件参数
 */
export interface TabChangeEvent {
  /** 当前激活的索引 */
  index: number;
  /** 当前激活的 tab 项 */
  item: TabPaneProps;
}

/**
 * Tabs 组件属性
 */
export interface TabsProps {
  /** 当前激活的 tab 索引 */
  modelValue: number;
  /** tab 列表 */
  list: TabPaneProps[];
  /** 是否可滚动 */
  scrollable?: boolean;
  /** 是否显示底部边框 */
  bottomLine?: boolean;
  /** 激活时的颜色 */
  activeColor?: string;
  /** 未激活时的颜色 */
  inactiveColor?: string;
  /** 字体大小 */
  fontSize?: string;
  /** 是否加粗 */
  fontWeight?: boolean;
  /** 是否惰性渲染（只渲染当前激活的 tab） */
  lazy?: boolean;
}

/**
 * Tabs 组件事件
 */
export interface TabsEmits {
  /** 更新当前激活的 tab 索引 */
  (e: "update:modelValue", value: number): void;
  /** tab 切换时触发 */
  (e: "change", params: TabChangeEvent): void;
  /** tab 点击时触发 */
  (e: "click", params: TabChangeEvent): void;
}
