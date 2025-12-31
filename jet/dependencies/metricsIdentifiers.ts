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

  async getIdentifierForContext(context: MetricsIdentifierKeyContext): Promise<string> {
    return `${context.type}|${context.key || 'default'}|${context.userId || 'anon'}|${this.sessionId}`
  }

  // 使用 type + key + userId + sessionId 生成 traceId
  async getMetricsFieldsForContexts(contexts: MetricsIdentifierKeyContext[]): Promise<JSONData> {
    const fields: JSONData = { sessionId: this.sessionId }
    contexts.forEach(context => {
      // const timestamp = context.timestamp ?? Date.now()
      fields[context.key || context.type] =
        `${context.type}|${context.key || 'default'}|${context.userId || 'anon'}|${this.sessionId}`
    })
    return fields
  }
}
