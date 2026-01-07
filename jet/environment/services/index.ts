/**
 * @fileOverview Service Enter
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
import { IHttpRequestFetchProps, IHttpRequestProps } from '../../dependencies/net/types'
import { CookieIntent } from '../../api/intents/cookie/cookie-intent'
import { MemoryIntent } from '../../api/intents/memory/memory-intent'
import { StorageIntent } from '../../api/intents/storage/storage-intent'

export interface Service {
  NetworkService: {
    request(payload: IHttpRequestProps, fetchProps?: IHttpRequestFetchProps, key?: string): Promise<any>
  }

  CookieService: {
    set(params: CookieIntent): Promise<void>
    get(key: string): Promise<string | undefined>
    clear(params: CookieIntent): Promise<void>
  }

  MemoryService: {
    set(params: MemoryIntent): Promise<void>
    get(key: string): Promise<string | undefined>
    remove(key: string): Promise<void>
    clear(): Promise<void>
  }

  StorageService: {
    setLocal(params: StorageIntent): Promise<void>
    getLocal(key: string): Promise<any>
    removeLocal(key: string): Promise<void>
    clearLocal(): Promise<void>
    setSession(params: StorageIntent): Promise<void>
    getSession(key: string): Promise<any>
    removeSession(key: string): Promise<void>
    clearSession(): Promise<void>
  }

  StoreService: {
    [storeName: string]: any
  }
}
