/** 日期补零：'2026-6-3' -> '2026-06-03' */
const pad = (value: number) => String(value).padStart(2, '0')

/**
 * 格式化为前端直接展示的时间串：YYYY-MM-DD HH:mm:ss
 * （与原前端 mock 的展示格式保持一致，列表/详情无需再格式化）
 */
export const formatDateTime = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
  `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`

/** 紧凑日期：YYYYMMDD（用于单据编号前缀） */
export const formatCompactDate = (date: Date): string =>
  `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
