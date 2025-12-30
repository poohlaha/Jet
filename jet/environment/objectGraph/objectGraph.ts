/**
 * @fileOverview Object Graph
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
import {
  ACTIVE_INTENT_TYPE,
  CLIENT_TYPE,
  CONSOLE_TYPE,
  COOKIE_TYPE,
  DISPATCHER_TYPE,
  LOCAL_STORAGE_TYPE,
  MEMORY_TYPE,
  METRICS_IDENTIFIERS_TYPE,
  NAVIGATE_TYPE,
  NET_TYPE,
  PROPERTIES_TYPE,
  ROUTER_TYPE,
  SESSION_STORAGE_TYPE,
  TREATMENT_STORE_TYPE,
  USER_TYPE
} from './types'
import { Net } from '../../dependencies/net'
import { WebClient, WebClientInfo } from '../../dependencies/client'
import { WebMetricsIdentifiers } from '../../dependencies/metricsIdentifiers'
import { WebConsole } from '../../dependencies/console'
import { WebStorage } from '../../dependencies/storage'
import { WebMemory } from '../../dependencies/memory'
import { WebCookie } from '../../dependencies/cookie'
import { ActiveIntent } from '../../dependencies/active-intent'
import { WithPageIntent } from '../../api/intents/page/page-intent'
import { isNothing } from '../../utils/utils'

export class ObjectGraph {
  private _members: Record<string, any> = {}
  private readonly name: string

  constructor(name: string) {
    this.name = name
  }

  adding(type: { name: string }, member: any): this {
    const clone = this.clone()
    clone._members[type.name] = member
    return clone
  }

  removing(type: { name: string }): this {
    const clone = this.clone()
    delete clone._members[type.name]
    return clone
  }

  optional<T>(type: { name: string }): T | undefined {
    return this._members[type.name]
  }

  required<T>(type: { name: string }): T {
    const member = this._members[type.name]
    if (isNothing(member)) {
      const candidates = Object.keys(this._members).sort().join(', ')

      throw new Error(`No member with type ${type.name} found in ${this.name}. Candidates ${candidates}`)
    }

    return member
  }

  private clone(): this {
    const ctor = this.constructor as any
    const clone = new ctor(this.name) as this

    for (const [typeName, member] of Object.entries(this._members)) {
      clone._members[typeName] = member
    }

    return clone
  }
}

export function inject<T>(type: { name: string }, objectGraph: ObjectGraph): T {
  return objectGraph.required<T>(type)
}

export class AppObjectGraph extends ObjectGraph {
  addingNetwork(network: Net) {
    return this.adding(NET_TYPE, network)
  }

  addingClient(client: WebClient) {
    return this.adding(CLIENT_TYPE, client)
  }

  addingConsole(console: WebConsole) {
    return this.adding(CONSOLE_TYPE, console)
  }

  addingProperties(properties: { [K: string]: any }) {
    return this.adding(PROPERTIES_TYPE, properties)
  }

  addingMetricsIdentifiers(metricsIdentifiers: WebMetricsIdentifiers) {
    return this.adding(METRICS_IDENTIFIERS_TYPE, metricsIdentifiers)
  }

  addingLocalStorage(local: WebStorage) {
    return this.adding(LOCAL_STORAGE_TYPE, local)
  }

  addingSessionStorage(session: WebStorage) {
    return this.adding(SESSION_STORAGE_TYPE, session)
  }

  addingMemory(memory: WebMemory) {
    return this.adding(MEMORY_TYPE, memory)
  }

  addingCookie(cookie: WebCookie) {
    return this.adding(COOKIE_TYPE, cookie)
  }

  addingUser(user: { [K: string]: any }) {
    return this.adding(USER_TYPE, user)
  }

  addingActiveIntent(implementation: WithPageIntent) {
    const previewPlatform = this.client.os.name || ''
    return this.adding(ACTIVE_INTENT_TYPE, new ActiveIntent({ ...implementation, previewPlatform }))
  }

  addingTreatmentStore(treatmentStore: { [K: string]: any } = {}) {
    return this.adding(TREATMENT_STORE_TYPE, treatmentStore)
  }

  get console(): WebConsole {
    return this.required(CONSOLE_TYPE)
  }

  get treatmentStore() {
    return this.optional(TREATMENT_STORE_TYPE)
  }

  get activeIntent(): any {
    return this.optional(ACTIVE_INTENT_TYPE) || {}
  }

  get client(): WebClientInfo {
    return (this.required(CLIENT_TYPE) as WebClient).info || {}
  }

  get memory(): WebMemory {
    return this.required(MEMORY_TYPE)
  }

  get localStorage(): WebMemory {
    return this.required(LOCAL_STORAGE_TYPE)
  }

  get sessionStorage(): WebMemory {
    return this.required(SESSION_STORAGE_TYPE)
  }

  get cookie(): WebCookie {
    return this.required(COOKIE_TYPE)
  }

  get user() {
    return this.required(USER_TYPE)
  }

  get network() {
    return this.required(NET_TYPE)
  }

  get metricsIdentifiers() {
    return this.required(METRICS_IDENTIFIERS_TYPE)
  }

  get dispatcher() {
    return this.required(DISPATCHER_TYPE)
  }

  get router() {
    return this.required(ROUTER_TYPE)
  }

  get navigate() {
    return this.optional(NAVIGATE_TYPE)
  }
}
