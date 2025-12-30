import { Intent } from '../../../types'
import { stableStringify } from './server-data'

export class PrefetchedIntents {
  static empty(): PrefetchedIntents {
    return new PrefetchedIntents(new Map())
  }

  private intents: Map<string, unknown>

  private constructor(intents: Map<string, unknown>) {
    this.intents = intents
  }

  get<I extends Intent<unknown>>(intent: I): any | undefined {
    if (this.intents.size === 0) {
      return
    }

    let subject: string | void
    try {
      subject = stableStringify(intent)
    } catch (e) {
      return
    }

    const data = this.intents.get(subject)

    this.intents.delete(subject)

    return data as any
  }
}
