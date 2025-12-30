/**
 * @fileOverview 定义 ObjectGraph 类型
 * @date 2025-11-19
 * @author poohlaha
 * @description
 */
import { makeMetaType } from './maketype'

export const BAG_TYPE = makeMetaType('jet-engine:bag')

export const NET_TYPE = makeMetaType('jet-engine:net')

export const CLIENT_TYPE = makeMetaType('jet-engine:client')

export const CONSOLE_TYPE = makeMetaType('jet-engine:console-wrapper')

export const PROPERTIES_TYPE = makeMetaType('jet-engine:properties')

export const METRICS_IDENTIFIERS_TYPE = makeMetaType('jet-engine:metricsIdentifiers')

export const LOCAL_STORAGE_TYPE = makeMetaType('jet-engine:local-storage')

export const SESSION_STORAGE_TYPE = makeMetaType('jet-engine:session-storage')

export const COOKIE_TYPE = makeMetaType('jet-engine:cookie')

export const MEMORY_TYPE = makeMetaType('jet-engine:memory')

export const USER_TYPE = makeMetaType('jet-engine:user')

export const RANDOM_TYPE = makeMetaType('jet-engine:random')

export const ACTIVE_INTENT_TYPE = makeMetaType('jet-engine:active-intent')

export const ROUTER_TYPE = makeMetaType('router')
export const NAVIGATE_TYPE = makeMetaType('navigate')

export const DISPATCHER_TYPE = makeMetaType('dispatcher')

export const TREATMENT_STORE_TYPE = makeMetaType('jet-engine:treatment-store')

export const EXPERIMENT_CACHE_TYPE = makeMetaType('jet-engine:experiment-cache')
