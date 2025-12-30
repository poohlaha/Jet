/**
 * @fileOverview Dispatcher
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
import { DispatcherIntent, IntentController, IntentDispatcher } from './dispatcher'
import { WebObjectGraph } from '../../objectGraph'

export class WebIntentDispatcher {
  private dispatcher: IntentDispatcher

  constructor() {
    this.dispatcher = new IntentDispatcher()
  }

  register(controller: IntentController<unknown>) {
    this.dispatcher.register(controller)
  }

  async dispatch<I>(intent: DispatcherIntent<I>, objectGraph: WebObjectGraph): Promise<any> {
    const intentObjectGraph = await this.createIntentObjectGraphWithAsyncValues(objectGraph)
    return await this.dispatcher.dispatch(intent, intentObjectGraph)
  }

  controller(intent: DispatcherIntent<unknown>) {
    return this.dispatcher.controller(intent)
  }

  get registeredControllers() {
    return this.dispatcher.registeredControllers || []
  }

  async createIntentObjectGraphWithAsyncValues(objectGraph: WebObjectGraph) {
    return objectGraph
  }
}
