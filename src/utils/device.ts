/**
 * 设备检测工具
 */
export class DeviceDetector {
  static isMobile(): boolean {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  }

  static isIOS(): boolean {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent)
  }

  static isAndroid(): boolean {
    return /Android/i.test(navigator.userAgent)
  }

  static getDevicePixelRatio(): number {
    return Math.min(window.devicePixelRatio || 1, 2)
  }

  static getPerformanceLevel(): 'low' | 'medium' | 'high' {
    const isMobile = this.isMobile()
    const cores = navigator.hardwareConcurrency || 2
    const memory = (navigator as any).deviceMemory || 4

    if (isMobile) {
      if (cores <= 4 || memory <= 2) return 'low'
      if (cores <= 6 || memory <= 4) return 'medium'
      return 'high'
    } else {
      if (cores <= 2 || memory <= 4) return 'medium'
      return 'high'
    }
  }

  static getParticleCount(): number {
    // 背景粒子数量固定为100左右
    return 100
  }

  static supportsWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      )
    } catch (e) {
      return false
    }
  }
}
