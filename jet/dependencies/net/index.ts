// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//   /!\ DO NOT MODIFY THIS FILE /!\
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 使用 Web API Request 发送页面请求
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//   /!\ DO NOT MODIFY THIS FILE /!\
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * @fileOverview request
 * @doc https://developer.mozilla.org/zh-CN/docs/Web/API/Request
 * @date 2023-12-05
 * @author poohlaha
 */
import { HttpResponse, IHttpRequestFetchProps, IHttpRequestProps } from './types'
import { Client } from './client'
import { Logger, LoggerFactory } from '../../shared/logger/logger'
import { CONTEXT_NAME } from '../../config'
import Utils from '../../utils/utils'

// 在运行时从“特性系统 / 实验系统”中获取 ITFE（Internal Test Feature Experiments）值，用来决定网络请求里要不要加上某些实验参数
export interface FeaturesCallbacks {
  getITFEValues(): string[] | undefined
}

export class Net {
  private client: Client | null = null
  private featuresCallbacks?: FeaturesCallbacks
  private readonly logger: Logger
  private requests = new Map<string, Promise<any>>()
  private cache = new Map<string, any>()

  constructor(loggerFactory: LoggerFactory, featuresCallbacks?: FeaturesCallbacks) {
    this.featuresCallbacks = featuresCallbacks
    this.logger = loggerFactory.loggerFor(`${CONTEXT_NAME} Net`)
  }

  /**
   * 发送请求
   * @param props
   * @param fetchProps
   */
  // @ts-ignore
  public async send(props: IHttpRequestProps, fetchProps?: IHttpRequestFetchProps): Promise<HttpResponse> {
    this.client = new Client()
    return await this.client.send(props, fetchProps, this.logger, this.featuresCallbacks)
  }

  public async once(props: IHttpRequestProps, fetchProps?: IHttpRequestFetchProps): Promise<any> {
    const data = Utils.deepCopy(props.data || {})
    delete data.requestId

    const key = props.url + JSON.stringify(data || {})

    // 1. 已有结果
    if (this.cache.has(key)) {
      const res = this.cache.get(key)
      // props.success?.(res)
      this.cache.delete(key) // 一次性
      return Promise.resolve(res)
    }

    // 2. 正在请求中(并发去重)
    if (this.requests.has(key)) {
      const promise = this.requests.get(key)!
      promise.then(res => props.success?.(res)).catch(err => props.failed?.(err))
      return promise
    }

    // 3. 新的请求
    const promise = new Promise((resolve, reject) => {
      this.client = new Client()
      this.client.send(
        {
          ...props,
          success: (res: any) => {
            this.cache.set(key, res)
            props.success?.(res)
            resolve(res)
          },
          failed: (res: any) => {
            props.failed?.(res)
            reject(res)
          }
        },
        fetchProps,
        this.logger,
        this.featuresCallbacks
      )
    })

    this.requests.set(key, promise)

    promise.finally(() => {
      this.requests.delete(key)
    })

    return promise
  }

  /**
   * 添加中断功能
   */
  public abort() {
    this.client?.abort()
  }
}
