/**
 * @fileOverview 客户端设备信息
 * @date 2025-11-18
 * @author poohlaha
 * @description
 */
import Utils from '../utils/utils'
import { ENV } from '../types'

export type DeviceType = 'Web' | 'iPhone' | 'iPad' | 'Mac' | 'AppleWatch' | 'AppleTV' | 'Android' | 'other'

export type BuildType = ENV

interface Device {
  type: DeviceType
  platform: string
  isTouchDevice: boolean
  maxTouchPoints: number
}

interface Screen {
  width: number
  height: number
  availWidth: number
  availHeight: number
  devicePixelRatio: number
}

interface VersionInfo {
  value?: string
  build?: string // e.g Build/OPD3.170816.012
  source: 'ua' | 'feature' | 'unknown'
}

interface Os {
  name: string // e.g. iOS / Android(Pixel 2)
  version?: VersionInfo // e.g. 18.5 / 8.0
}

interface Browser {
  name: string
  version?: VersionInfo
  userAgent: string
}

interface Locale {
  language: string
  languages: readonly string[]
  timeZone: string
}

interface Hardware {
  cpuCores?: number
  memoryGB?: number
}

interface Network {
  online: boolean
}

interface Runtime {
  buildType: BuildType
  guid: string
}

export interface WebClientInfo {
  device: Device
  screen: Screen
  os: Os
  browser: Browser
  locale: Locale
  hardware: Hardware
  network: Network
  runtime: Runtime
}

export class WebClient {
  // 标记设备类型
  deviceType: DeviceType = 'Web'

  // 是否是真实 Web 客户端
  __isReallyWebClient = true as const

  // 客户端唯一 ID
  guid: string = 'xxx-xx-xxx'

  buildType: BuildType

  constructor(buildType: BuildType, guid?: string) {
    this.buildType = buildType
    this.guid = guid || Utils.generateUUID()
  }

  private detectBrowserVersionByFeature(): VersionInfo | undefined {
    if ('showOpenFilePicker' in window) {
      return { value: '>=102', source: 'feature' }
    }

    if ('trustedTypes' in window) {
      return { value: '>=88', source: 'feature' }
    }

    return undefined
  }

  private extractVersion(ua: string, regex: RegExp): string | undefined {
    const match = ua.match(regex)
    return match?.[1] || ''
  }

  private extractVersionInfo(ua: string, regex: RegExp): VersionInfo {
    const value = this.extractVersion(ua, regex) || ''

    if (!Utils.isBlank(value)) {
      // Build 信息
      const buildMatch = ua.match(/Build\/([\w.\\-]+)/i)
      const androidBuild = buildMatch?.[1] || ''

      // AppleWebKit 信息
      const webkitMatch = ua.match(/AppleWebKit\/([\d.]+)/i)
      const iosBuild = webkitMatch?.[1] || ''

      let build = ''
      if (!Utils.isBlank(androidBuild || '')) {
        build = `Build/${androidBuild || ''}`
      } else if (!Utils.isBlank(iosBuild || '')) {
        build = `AppleWebKit/${iosBuild || ''}`
      }

      return {
        value: value.replace(/_/g, '.'),
        build,
        source: 'ua'
      }
    }

    return {
      value: '',
      build: '',
      source: 'unknown'
    }
  }

  private detectBrowserName(ua: string): string {
    ua = ua.toLowerCase()

    if (ua.includes('chrome') && !ua.includes('edg')) {
      return 'Chrome'
    }

    if (ua.includes('safari') && !ua.includes('chrome')) {
      return 'Safari'
    }

    if (ua.includes('firefox')) {
      return 'Firefox'
    }

    if (ua.includes('edg')) {
      return 'Edge'
    }

    return 'Other'
  }

  private parseBrowser(ua: string): Browser {
    // 1. 先尝试 feature
    const featureVersion = this.detectBrowserVersionByFeature()
    if (featureVersion) {
      return {
        name: this.detectBrowserName(ua),
        version: featureVersion,
        userAgent: ua
      }
    }

    if (ua.includes('Chrome')) {
      return { name: 'Chrome', version: this.extractVersionInfo(ua, /Chrome\/([\d.]+)/), userAgent: ua } as Browser
    }

    if (ua.includes('Safari')) {
      return { name: 'Safari', version: this.extractVersionInfo(ua, /Version\/([\d.]+)/), userAgent: ua } as Browser
    }

    if (ua.includes('Firefox')) {
      return { name: 'Firefox', version: this.extractVersionInfo(ua, /Firefox\/([\d.]+)/), userAgent: ua } as Browser
    }

    return { name: 'Other', version: { value: '', source: 'unknown' }, userAgent: ua } as Browser
  }

  private parseOS(ua: string): Os {
    if (ua.includes('iPhone')) {
      return { name: 'iOS', version: this.extractVersionInfo(ua, /CPU (?:iPhone )?OS ([\d_]+)/i) } as Os
    }

    if (ua.includes('iPad')) {
      return { name: 'iPad', version: this.extractVersionInfo(ua, /CPU (?:iPhone )?OS ([\d_]+)/i) } as Os
    }

    if (ua.includes('Mac OS')) {
      return { name: 'MacOS', version: this.extractVersionInfo(ua, /Mac OS X ([\d_]+)/) } as Os
    }
    if (ua.includes('Windows NT')) {
      return { name: 'WindowsNT', version: this.extractVersionInfo(ua, /Windows NT ([\d.]+)/) }
    }
    if (ua.includes('Android')) {
      let name = 'Android'

      // 提取设备型号（用于 name 展示）
      const deviceMatch = ua.match(/Android [\d.]+;\s*([^;]+?)(?:\s*Build|\))/i)

      if (deviceMatch && !Utils.isBlank(deviceMatch[1])) {
        name = `Android(${deviceMatch[1].trim()})`
      }

      return { name, version: this.extractVersionInfo(ua, /Android ([\d.]+)/i) } as Os
    }

    return { name: 'Other', version: { value: '', source: 'unknown' } } as Os
  }

  get info(): WebClientInfo {
    return {
      device: {
        type: this.deviceType,
        platform: navigator.platform,
        isTouchDevice: 'ontouchstart' in window,
        maxTouchPoints: navigator.maxTouchPoints ?? 0
      },

      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        devicePixelRatio: window.devicePixelRatio
      },

      os: this.parseOS(navigator.userAgent),

      browser: this.parseBrowser(navigator.userAgent),

      locale: {
        language: navigator.language,
        languages: navigator.languages,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },

      hardware: {
        cpuCores: navigator.hardwareConcurrency,
        memoryGB: (navigator as any).deviceMemory
      },

      network: {
        online: navigator.onLine
      },

      runtime: {
        buildType: this.buildType,
        guid: this.guid
      }
    }
  }
}
