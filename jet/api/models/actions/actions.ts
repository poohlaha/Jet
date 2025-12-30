/**
 * @fileOverview Actions
 * @date 2025-12-26
 * @author poohlaha
 * @description
 */

import { Action } from '../actions/base-action'
import { ActionMetrics } from '../metrics/metrics'

export class ExternalUrlAction extends Action {
  url: string = ''
  isSensitive: boolean = true

  constructor(url: string, isSensitive: boolean = true, actionMetrics: ActionMetrics = new ActionMetrics()) {
    super('ExternalUrlAction', actionMetrics)
    this.url = url
    this.isSensitive = isSensitive
  }
}
