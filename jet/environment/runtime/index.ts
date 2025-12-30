/**
 * @fileOverview Runtime
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
import { LegacyRuntime } from './runtime'
import { WebIntentDispatcher } from '../dispatching/base'
import { WebObjectGraph } from '../objectGraph'

export class WebRuntime extends LegacyRuntime {
  constructor(dispatcher: WebIntentDispatcher, objectGraph: WebObjectGraph) {
    super(dispatcher, objectGraph, {})
  }

  exportingService(name: string, service: any) {
    this.wrapServiceInValidation(service)
    const existingService = this.serviceWithName(name) || {}
    const newService = {
      ...existingService,
      ...service
    }
    return super.exportingService(name, newService)
  }

  exportingServiceName(name: string, functionName: string, implementation: any) {
    const service: any = {}
    service[functionName] = implementation
    this.exportingService(name, service)
  }
  wrapServiceInValidation(service: any) {
    return service
  }
}
