/**
 * @fileOverview Actions Base Action
 * @date 2025-12-26
 * @author poohlaha
 * @description
 */
import { ViewModel } from '../base'
import { ActionMetrics } from '../metrics/metrics'

export class Action extends ViewModel {
  title: string | null
  artwork: any = null
  presentationStyle: Array<any>
  actionClass: string
  $kind: string
  actionMetrics: ActionMetrics

  constructor(actionClass: string = '', actionMetrics = new ActionMetrics()) {
    super()
    this.title = null
    this.artwork = null
    this.presentationStyle = []
    this.actionClass = actionClass
    this.$kind = actionClass
    this.actionMetrics = actionMetrics
  }
}
