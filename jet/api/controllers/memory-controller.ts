/**
 * @fileOverview Memory Controller
 * @date 2025-11-10
 * @author poohlaha
 * @description
 */
import { IntentController } from '../../environment/dispatching/base/dispatcher'
import { MemoryIntent } from '../intents/memory/memory-intent'
import { WebObjectGraph } from '../../environment/objectGraph'

export const MemorySetIntentController: IntentController<MemoryIntent> = {
  $intentKind: 'MemorySetIntent',

  // @ts-ignore
  async perform(intent: MemoryIntent, objectGraph: WebObjectGraph) {
    const memory = objectGraph.memory
    memory.setItem(intent.key, intent.value)
  }
}

export const MemoryGetIntentController: IntentController<MemoryIntent> = {
  $intentKind: 'MemoryGetIntent',

  // @ts-ignore
  async perform(intent: MemoryIntent, objectGraph: WebObjectGraph): any {
    const memory = objectGraph.memory
    return memory.getItem(intent.key)
  }
}

export const MemoryRemoveIntentController: IntentController<MemoryIntent> = {
  $intentKind: 'MemoryRemoveIntent',

  // @ts-ignore
  async perform(intent: MemoryIntent, objectGraph: WebObjectGraph): any {
    const memory = objectGraph.memory
    return memory.removeItem(intent.key)
  }
}

export const MemoryClearIntentController: IntentController<MemoryIntent> = {
  $intentKind: 'MemoryClearIntent',

  // @ts-ignore
  async perform(intent: MemoryIntent, objectGraph: WebObjectGraph): any {
    const memory = objectGraph.memory
    return memory.clearItem()
  }
}
