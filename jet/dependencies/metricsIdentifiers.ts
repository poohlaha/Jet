/**
 * @fileOverview 提供 当前客户端/会话/用户的唯一标识，供日志、性能指标、埋点、统计分析 使用
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
export interface MetricsIdentifierKeyContext {
  type: string // 指标类型，例如 'page_view', 'click', 'api_request'
  key?: string // 可选 key，比如按钮 ID、页面 ID
  userId?: string // 可选用户 ID
  timestamp?: number // 可选时间戳
  [extra: string]: any // 允许额外扩展字段
}

export type JSONData = { [key: string]: string | number | boolean | null | JSONData | JSONData[] }

export class WebMetricsIdentifiers {
  private readonly sessionId: string = crypto.randomUUID()

  // 根据一个指标上下文（MetricsIdentifierKeyContext）返回对应的唯一标识, 用户 ID、会话 ID、设备 ID
  async getIdentifierForContext(_context: MetricsIdentifierKeyContext): Promise<string> {
    return this.sessionId // 每个会话唯一
  }

  // 接收一组上下文，返回一个 JSON 数据对象, 便于日志或埋点上报
  async getMetricsFieldsForContexts(_contexts: MetricsIdentifierKeyContext[]): Promise<JSONData> {
    return { sessionId: this.sessionId }
  }
}
