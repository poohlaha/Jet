/**
 * @fileOverview Metrics
 * @date 2025-12-26
 * @author poohlaha
 * @description
 */
import { Model } from '../base'

export class ActionMetrics extends Model {
  data: Array<any> = []
  custom: { [K: string]: any } = {}

  constructor(events: Array<any> = []) {
    super()
    this.data = events || []
    this.custom = {}
  }
  addMetricsData(data: any) {
    this.data.push(data)
  }
  addManyMetricsData(dataArray: Array<any>) {
    for (const data of dataArray) {
      this.addMetricsData(data)
    }
  }
  clearAll() {
    this.data.length = 0
  }
}
