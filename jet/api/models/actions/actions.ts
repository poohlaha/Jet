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
  external: boolean = false
  replace: boolean = false
  navigate: boolean = false

  constructor(url: string = '', external: boolean = false, replace: boolean = false, navigate: boolean = false, actionMetrics: ActionMetrics = new ActionMetrics()) {
    super('ExternalUrlAction', actionMetrics)
    this.url = url
    this.external = external
    this.replace = replace
    this.navigate = navigate
  }

  getReplace() {
    return this.replace
  }

  getNavigate() {
    return this.navigate
  }

  getUrl() {
    return this.url
  }

  getExternal() {
    return this.external
  }
}
