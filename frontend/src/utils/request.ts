/**
 * 极简 fetch 封装：统一 JSON 编解码与错误处理
 *
 * - 路径以 /api 前缀发出，vite dev 代理到 backend（http://localhost:3000）
 * - 非 2xx 抛 ApiError，message 取后端返回的 message（ValidationPipe 为数组）
 */

export class ApiError extends Error {
  /** HTTP 状态码；0 表示网络层失败（服务未启动/断网） */
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init
    })
  } catch {
    throw new ApiError(0, '网络异常，请确认后端服务已启动（backend: npm run start:dev）')
  }

  if (!res.ok) {
    let message = `请求失败（${res.status}）`
    try {
      const body = await res.json()
      if (Array.isArray(body.message)) {
        message = body.message.join('；')
      } else if (typeof body.message === 'string') {
        message = body.message
      }
    } catch {
      // 非 JSON 错误体：保留默认文案
    }
    throw new ApiError(res.status, message)
  }

  return (await res.json()) as T
}

export const httpGet = <T>(path: string): Promise<T> => request<T>(path)

export const httpPost = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) })

export const httpPut = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(path, { method: 'PUT', body: JSON.stringify(body) })

export const httpDelete = <T>(path: string): Promise<T> =>
  request<T>(path, { method: 'DELETE' })
