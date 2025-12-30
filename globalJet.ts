/**
 * @fileOverview 全局 Jet 类
 * @date 2025-11-10
 * @author poohlaha
 * @description
 */
import { Jet } from './jet/jet'

let jetInstance: Jet | null = null

export function setJet(jet: any) {
  jetInstance = jet
}

export function getJet() {
  return jetInstance
}
