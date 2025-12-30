/**
 * @fileOverview Cookie
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
export class WebCookie {
  getCookie(name: string): string | null {
    if (typeof window.document === 'undefined') {
      return null
    }

    const prefix = `${name}=`
    const cookie = window.document.cookie
      .split(';')
      .map(value => value.trimStart())
      .filter(value => value.startsWith(prefix))[0]

    if (!cookie) {
      return null
    }

    return cookie.substr(prefix.length)
  }

  setCookie(name: string, value: string, domain: string = '', expires = 0, path = '/'): void {
    if (typeof window.document === 'undefined') {
      return undefined
    }

    const existingCookie = this.getCookie(name)
    let cookieValue = value

    if (existingCookie) {
      cookieValue = !existingCookie.includes(value) ? `${existingCookie}+${value}` : existingCookie
    }

    let cookieString = `${name}=${cookieValue}; path=${path}; domain=${domain};`

    if (expires) {
      const date = new Date()
      date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000)
      cookieString += ` expires=${date.toUTCString()};`
    }

    window.document.cookie = cookieString

    return undefined
  }

  clear(name: string, domain: string, path = '/'): void {
    if (typeof window.document === 'undefined') {
      return undefined
    }

    const existingCookie = this.getCookie(name)

    if (existingCookie) {
      this.setCookie(name, '', domain, -1, path)
    }

    return undefined
  }
}
