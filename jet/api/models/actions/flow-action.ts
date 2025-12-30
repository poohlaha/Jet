/**
 * @fileOverview Flow Action
 * @date 2025-11-10
 * @author poohlaha
 * @description
 */
import { Action } from './base-action'

export class FlowBackAction extends Action {
  dismissal: any

  constructor(dismissal: any) {
    super('FlowBackAction')
    this.dismissal = dismissal
  }
}
/** @public */
export class FlowAction extends Action {
  page: any
  pageUrl: string
  pageData: any
  referrerData: any
  presentationContext: string
  animationBehavior: string
  origin: string

  constructor(flowPage: any, pageUrl: string) {
    super('FlowAction')
    this.$kind = 'flowAction'
    this.page = flowPage
    this.pageUrl = pageUrl
    this.pageData = null
    this.referrerData = undefined
    this.presentationContext = 'infer'
    this.animationBehavior = 'infer'
    this.origin = 'inapp'
  }
}
export function isFlowAction(action: Action) {
  return action.$kind === 'flowAction'
}
