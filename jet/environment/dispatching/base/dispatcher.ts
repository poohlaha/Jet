/**
 * @fileOverview 调度器负责接收意图并调用已注册的控制器来处理该意图的类型。
 * @date 2025-11-18
 * @author poohlaha
 * @description 采用者可以创建项目特定的调度器，该调度器可以组合 `IntentDispatcher`, 以添加额外的功能
 * ```
 * const intent: SomeIntent = {
 *  $kind: "SomeIntent",
 *  field: "some value"
 * };
 * const dispatcher = new IntentDispatcher();
 * const promise = dispatcher.dispatch(intent)
 * ```
 */
import { isNothing } from '../../../utils/utils'
import { WebObjectGraph } from '../../objectGraph'

export interface DispatcherIntent<T> {
  $kind: string
  $pageIntentInstrumentation?: T
}

export interface StaticIntent<R = unknown> extends DispatcherIntent<R> {
  $kind: '$static'
  $data: R
}

export interface IntentController<T> {
  $intentKind: string
  perform(intent: DispatcherIntent<T>, objectGraph: WebObjectGraph): Promise<any> | any
}

export function isIntentController<I = unknown>(controller: I): boolean {
  return typeof controller === 'object' && controller !== null && typeof (controller as any).perform === 'function'
}

export class IntentDispatcher {
  private dispatchableMap: Record<string, IntentController<unknown>> = {}

  constructor() {
    this.dispatchableMap = {}
  }

  register(dispatchable: IntentController<unknown>) {
    if (isNothing(dispatchable.$intentKind)) {
      throw new Error('Dispatcher cannot register a controller without an $intentKind')
    }

    if (dispatchable.$intentKind in this.dispatchableMap) {
      throw new Error(`Dispatcher already has a controller registered for ${dispatchable.$intentKind}`)
    }

    this.dispatchableMap[dispatchable.$intentKind] = dispatchable
  }

  async dispatch<I>(intent: DispatcherIntent<I>, objectGraph: WebObjectGraph) {
    // —— static intent 特殊处理
    if (intent.$kind === '$static') {
      const data = (intent as StaticIntent).$data
      if (data === undefined) {
        throw new Error('StaticIntent<R> contains no data')
      }
      return data
    }

    const controller = this.dispatchableMap[intent.$kind]
    if (isNothing(controller) || !isIntentController(controller)) {
      throw new Error(`No controller registered to handle ${intent.$kind}`)
      return
    }

    return await controller.perform(intent, objectGraph)
  }

  controller(intent: DispatcherIntent<unknown>) {
    return this.dispatchableMap[intent.$kind]
  }

  get registeredControllers() {
    return Object.values(this.dispatchableMap)
  }
}
