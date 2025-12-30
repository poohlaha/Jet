/**
 * @fileOverview
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
import { WebIntentDispatcher } from '../dispatching/base'
import { WebObjectGraph } from '../objectGraph'
import { DispatcherIntent } from '../dispatching/base/dispatcher'

export class Runtime {
  private dispatcher: WebIntentDispatcher
  private objectGraph: WebObjectGraph

  constructor(dispatcher: WebIntentDispatcher, objectGraph: WebObjectGraph) {
    this.dispatcher = dispatcher
    this.objectGraph = objectGraph
  }

  async dispatch(intent: DispatcherIntent<unknown>) {
    return await this.dispatcher.dispatch(intent, this.objectGraph)
  }
}

export class LegacyRuntime extends Runtime {
  private services: Record<string, any> = {}

  constructor(dispatcher: WebIntentDispatcher, objectGraph: WebObjectGraph, services: Record<string, any> = {}) {
    super(dispatcher, objectGraph)
    this.services = services
  }

  serviceWithName(name: string) {
    return this.services[name]
  }

  exportingService(name: string, service: any) {
    this.services[name] = service
    return this
  }
}
