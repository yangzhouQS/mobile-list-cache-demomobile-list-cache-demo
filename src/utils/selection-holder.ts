/**
 * 选择页 -> 表单页 的数据回传暂存
 *
 * 场景：新增/编辑页跳转到更深层级的选择页（材料/供应商/工号），
 * 选择完成后 router.back() 返回，表单页在 onActivated 中消费暂存值。
 * 替代方案：query 参数、Pinia、history.state 均可实现。
 */
const pendingSelectionMap = new Map<string, unknown>()

/** 选择页调用：暂存选中的数据后 router.back() */
export const setPendingSelection = <T>(key: string, value: T) => {
  pendingSelectionMap.set(key, value)
}

/** 表单页在 onActivated 中调用：取出并清除暂存值 */
export const takePendingSelection = <T = unknown>(key: string): T | undefined => {
  const value = pendingSelectionMap.get(key)
  pendingSelectionMap.delete(key)
  return value as T | undefined
}
