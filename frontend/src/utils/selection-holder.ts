/** 选择页 -> 表单页 的数据回传暂存
 *
 * 场景：新增/编辑页跳转到更深层级的选择页（材料/供应商/工号），
 * 选择完成后 router.back() 返回，表单页在 onActivated 中消费暂存值。
 * 替代方案：query 参数、Pinia、history.state 均可实现。
 */
const pendingSelectionMap = new Map<string, unknown>()

/**
 * 表单页跳选择页前的表单快照 key。
 * 未缓存表单页从选择页返回时会重新挂载（实例重建、已填内容丢失），而选择
 * 暂存"取出即删"只能回传本轮一个字段——多轮选择时先前字段依次丢失。
 * 表单页跳转前写入快照、返回挂载时先恢复快照再叠加本轮新选择即可闭环。
 */
export const ORDER_ADD_FORM_SNAPSHOT_KEY = 'order-add-form'

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

/** 清除某项暂存（如选择页"放弃新增"时清理表单快照，避免下次进入时复活旧表单） */
export const clearPendingSelection = (key: string) => {
  pendingSelectionMap.delete(key)
}
