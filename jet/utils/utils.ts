/**
 * @fileOverview Utils
 * @date 2023-12-05
 * @author poohlaha
 */

export default class Utils {
  /**
   * 检验字符串是否为空
   * @param str 要检查的值
   */
  static isBlank(str: string = ''): boolean {
    return str === undefined || str == null || /^[ ]+$/.test(str) || str.length === 0
  }

  /**
   * 判断对象是否为空
   * @param target JSON对象
   */
  static isObjectNull(target: { [K: string]: any } = {}): boolean {
    return !target || JSON.stringify(target) === '{}'
  }

  /**
   * 生成随机数
   */
  static generateUUID(): string {
    let random = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }

    return `${random() + random()}-${random()}-${random()}-${random()}-${random()}${random()}${random()}`
  }

  /**
   * 首字母转大写
   * @param str
   */
  static capitalizeFirstLetter(str: string = ''): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

export function isNothing(value: any): value is null | undefined {
  return value === undefined || value === null
}

export function isSome<T>(v: T | null | undefined): v is T {
  return !isNothing(v)
}

export function isAdamId(id: string) {
  return /^\d{1,19}$/.test(id)
}
