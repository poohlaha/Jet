/**
 * @fileOverview runtime 是整个 Intent → Action → Handler 流程的核心调度器
 * @date 2025-11-18
 * @author poohlaha
 * @description Runtime 就像一个总指挥，负责接收 intent，然后找到对应的 controller，最后返回 action 或直接执行 handler（经过 ActionDispatcher）
 * 它主要做三件事
 * 1. 接收并分发 Intent
 * 2. 调用对应 Controller
 * 3. 返回执行结果/action
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
    for (const memberName of Object.keys(service)) {
      const serviceFunction = service[memberName]
      if (serviceFunction instanceof Function) {
        service[memberName] = function validationThunk(...args: any[]) {
          const returnValue = serviceFunction.apply(this, args)
          if (returnValue instanceof Promise) {
            return returnValue.then(value => {
              // validation.recordValidationIncidents(value);
              return value
            })
          } else {
            // validation.recordValidationIncidents(returnValue);
            return returnValue
          }
        }
      }
    }
  }
}
