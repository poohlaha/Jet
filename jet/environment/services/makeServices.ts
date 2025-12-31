/**
 * @fileOverview Make Service
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
import { WebRuntime } from '../runtime'
import { Jet } from '../../jet'
import { registerService as registerNetworkService } from './network-service'
import { registerService as registerCookieService } from './cookie-service'
import { registerService as registerMemoryService } from './memory-service'
import { registerService as registerStorageService } from './storage-service'
import { registerService as registerStoreService } from './store-service'

export function makeServices(jet: Jet, runtime: WebRuntime) {
  registerNetworkService(jet, runtime)
  registerCookieService(jet, runtime)
  registerMemoryService(jet, runtime)
  registerStorageService(jet, runtime)
  registerStoreService(jet, runtime)
}
