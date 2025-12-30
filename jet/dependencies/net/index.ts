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
import { LOGGER_PREFIX_NAME } from '../../config'

// 在运行时从“特性系统 / 实验系统”中获取 ITFE（Internal Test Feature Experiments）值，用来决定网络请求里要不要加上某些实验参数
export interface FeaturesCallbacks {
  getITFEValues(): string[] | undefined
}

export class Net {
  private client: Client | null = null
  private featuresCallbacks?: FeaturesCallbacks
  private readonly logger: Logger

  constructor(loggerFactory: LoggerFactory, featuresCallbacks?: FeaturesCallbacks) {
    this.featuresCallbacks = featuresCallbacks
    this.logger = loggerFactory.loggerFor(`${LOGGER_PREFIX_NAME} Net`)
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

  /**
   * 添加中断功能
   */
  public abort() {
    this.client?.abort()
  }
}
