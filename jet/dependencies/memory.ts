/**
 * @fileOverview 持久化或缓存数据
 * @date 2025-11-18
 * @author poohlaha
 * @description
 * WebStorage 只在内存里保存数据，不会持久化到磁盘或 localStorage
 * 所以刷新页面后数据会丢失
 */

export class WebMemory extends Map<string, any> implements Storage {
  // 返回存储的条目数量: Map.size
  get length() {
    return this.size
  }

  // 返回 key 对应的值，如果没有则返回 null
  getItem(key: string): string | null {
    return this.get(key) ?? null
  }

  // 获取指定索引的 key(未实现)
  key(_index: number): string | null {
    throw new Error('Method not implemented.')
  }

  // 删除指定 key
  removeItem(key: string): void {
    this.delete(key)
  }

  // 清空
  clearItem(): void {
    this.clear()
  }

  // 设置 key 的值
  setItem(key: string, value: any): void {
    this.set(key, value)
  }

  // 存储字符串数据
  storeString(aString: string, key: string): void {
    this.set(key, aString)
  }

  // 读取字符串数据，如果没有则返回 <null>
  retrieveString(key: string): string {
    return this.get(key) ?? ''
  }
}
