/**
 * @fileOverview Base Modal
 * @date 2025-12-26
 * @author poohlaha
 * @description
 */
export class Model {
  // @ts-ignore
  private $incidents: any

  constructor() {
    this.$incidents = undefined
  }

  isValid() {
    return true
  }
}

export class ViewModel extends Model {
  impressionMetrics: any

  constructor(impressionMetrics = null) {
    super()
    this.impressionMetrics = impressionMetrics
  }
}
