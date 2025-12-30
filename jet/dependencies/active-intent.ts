/**
 * @fileOverview Active Intent
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
import { WebObjectGraph } from '../environment/objectGraph'
import { WithPageIntent } from '../intents/page/page-intent'
import Utils, { isSome } from '../utils/utils'

export function withActiveIntent(objectGraph: WebObjectGraph, intent: WithPageIntent, callback: Function) {
  const objectGraphWithActiveIntent = objectGraph.addingActiveIntent({
    previewPlatform: intent.previewPlatform || ''
  })

  return callback(objectGraphWithActiveIntent)
}

export function unreachable(value: any) {
  throw new Error(`This method should never be called with value: ${value}`)
}

export class ActiveIntent {
  private readonly implementation: WithPageIntent
  private inferredPreviewPlatform: string | undefined

  constructor(implementation: WithPageIntent) {
    this.implementation = implementation
    this.inferredPreviewPlatform = undefined
  }

  setInferredPreviewPlatform(platform: string) {
    this.inferredPreviewPlatform = platform || ''
  }

  get previewPlatform() {
    if (!Utils.isBlank(this.inferredPreviewPlatform || '')) {
      return this.implementation.previewPlatform
    }

    return null
  }

  get platform() {
    if (isSome(this.previewPlatform)) {
      switch (this.previewPlatform) {
        case 'WindowsNT':
          return 'WindowsNT'
        case 'iPhone':
          return 'iPhone'
        case 'iPad':
          return 'iPad'
        case 'MacOS':
          return 'Mac'
        case 'AppleWatch':
          return 'AppleWatch'
        case 'AppleTV':
          return 'AppleTV'
        case 'Android':
          return 'Android'
        default:
          return 'Other'
      }
    }
    return undefined
  }
}
