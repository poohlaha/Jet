/**
 * @fileOverview 度量统计
 * @date 2025-11-07
 * @author poohlaha
 * @description 提供 metrics 接口（记录事件、计时）与一个 console 实现 consoleMetrics，用于性能度量与事件统计
 */
import { LoggerFactory, Logger } from '../../shared/logger/logger'
import { CONTEXT_NAME } from '../../config'

export interface Metrics {
  recordEvent(name: string, payload?: any): void
  asyncTime<T>(name: string, fn: () => Promise<T> | T): Promise<T>
}

const CONSOLE_METRICS_NAME = 'Metrics'

export class ConsoleMetrics {
  private readonly log: Logger

  constructor(logger: LoggerFactory) {
    this.log = logger.loggerFor(`[${CONTEXT_NAME} ${CONSOLE_METRICS_NAME}]`)
  }

  recordEvent(name: string, payload: any) {
    this.log.info(name, payload)
  }

  async asyncTime(name: string, fn: any) {
    const t0 = performance.now()
    try {
      const r = await fn()
      this.log.info(name, `${(performance.now() - t0).toFixed(2)}ms`)
      return r
    } catch (e) {
      this.log.error(name, 'failed', `${(performance.now() - t0).toFixed(2)}ms`)
      throw e
    }
  }
}
