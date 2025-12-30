/**
 * @fileOverview Storage Intent
 * @date 2025-11-10
 * @author poohlaha
 * @description
 */
import { IntentController } from '../../environment/dispatching/base/dispatcher'
import { StorageIntent } from '../intents/storage/storage-intent'
import { WebObjectGraph } from '../../environment/objectGraph'

export const LocalStorageSetIntentController: IntentController<StorageIntent> = {
  $intentKind: 'LocalStorageSetIntent',

  // @ts-ignore
  async perform(intent: StorageIntent, objectGraph: WebObjectGraph) {
    const localStorage = objectGraph.localStorage
    localStorage.setItem(intent.key, intent.value)
  }
}

export const LocalStorageGetIntentController: IntentController<StorageIntent> = {
  $intentKind: 'LocalStorageGetIntent',

  // @ts-ignore
  async perform(intent: StorageIntent, objectGraph: WebObjectGraph): any {
    const localStorage = objectGraph.localStorage
    return localStorage.getItem(intent.key)
  }
}

export const LocalStorageRemoveIntentController: IntentController<StorageIntent> = {
  $intentKind: 'LocalStorageRemoveIntent',

  // @ts-ignore
  async perform(intent: StorageIntent, objectGraph: WebObjectGraph) {
    const localStorage = objectGraph.localStorage
    localStorage.removeItem(intent.key)
  }
}

export const LocalStorageClearIntentController: IntentController<StorageIntent> = {
  $intentKind: 'LocalStorageClearIntent',

  // @ts-ignore
  async perform(intent: StorageIntent, objectGraph: WebObjectGraph) {
    const localStorage = objectGraph.localStorage
    localStorage.clear()
  }
}

export const SessionStorageSetIntentController: IntentController<StorageIntent> = {
  $intentKind: 'SessionStorageSetIntent',

  // @ts-ignore
  async perform(intent: StorageIntent, objectGraph: WebObjectGraph) {
    const sessionStorage = objectGraph.sessionStorage
    sessionStorage.setItem(intent.key, intent.value)
  }
}

export const SessionStorageGetIntentController: IntentController<StorageIntent> = {
  $intentKind: 'SessionStorageGetIntent',

  // @ts-ignore
  async perform(intent: StorageIntent, objectGraph: WebObjectGraph): any {
    const sessionStorage = objectGraph.sessionStorage
    return sessionStorage.getItem(intent.key)
  }
}

export const SessionStorageRemoveIntentController: IntentController<StorageIntent> = {
  $intentKind: 'SessionStorageRemoveIntent',

  // @ts-ignore
  async perform(intent: StorageIntent, objectGraph: WebObjectGraph) {
    const sessionStorage = objectGraph.sessionStorage
    sessionStorage.removeItem(intent.key)
  }
}

export const SessionStorageClearIntentController: IntentController<StorageIntent> = {
  $intentKind: 'SessionStorageClearIntent',

  // @ts-ignore
  async perform(intent: StorageIntent, objectGraph: WebObjectGraph) {
    const sessionStorage = objectGraph.sessionStorage
    sessionStorage.clear()
  }
}
