/**
 * @fileOverview 错误日志类型
 * @date 2025-11-07
 * @author poohlaha
 * @description
 */
export interface ErrorHub {
  captureException(exception: Error): Promise<void>
  captureMessage(message: string): Promise<void>
  reportLocalLogs?(): Promise<void> // 离线上报 recording logs
}

export type ValueOf<T> = T[keyof T]
