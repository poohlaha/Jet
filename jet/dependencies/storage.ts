/**
 * @fileOverview LocalStorage ｜ SessionStorage
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
export class WebStorage implements Storage {
  constructor(private readonly native: any) {
    this.native = native
  }

  get length() {
    return this.native.length
  }

  clear(): void {
    this.native.clear()
  }

  getItem(key: string): string | null {
    return this.native.getItem(key)
  }

  setItem(key: string, value: string): void {
    this.native.setItem(key, value)
  }

  removeItem(key: string): void {
    this.native.removeItem(key)
  }

  key(index: number): string | null {
    return this.native.key(index)
  }
}
