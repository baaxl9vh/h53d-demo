import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'

// 注册GSAP插件
gsap.registerPlugin(ScrollTrigger)

export class ScrollController {
  private particleModel1: THREE.Points | null = null
  private particleModel2: THREE.Points | null = null
  private camera: THREE.PerspectiveCamera
  private onProgressChange?: (progress: number) => void

  constructor(
    particleModel1: THREE.Points | null,
    particleModel2: THREE.Points | null,
    camera: THREE.PerspectiveCamera,
    onProgressChange?: (progress: number) => void,
  ) {
    this.particleModel1 = particleModel1
    this.particleModel2 = particleModel2
    this.camera = camera
    this.onProgressChange = onProgressChange

    // 延迟初始化，确保DOM已加载
    setTimeout(() => {
      this.initScrollTrigger()
    }, 100)
  }

  // 辅助函数：设置材质透明度
  private setMaterialOpacity(material: THREE.Material | THREE.Material[] | null, opacity: number) {
    if (material && !Array.isArray(material)) {
      ;(material as THREE.Material).opacity = opacity
    }
  }

  initScrollTrigger() {
    // 检查DOM元素是否存在
    const scrollContent = document.querySelector('.scroll-content')
    if (!scrollContent) {
      console.warn('Scroll content element not found, retrying...')
      setTimeout(() => {
        this.initScrollTrigger()
      }, 100)
      return
    }

    console.log('Initializing ScrollTrigger...')

    // 初始化模型状态
    this.initModelStates()

    // 创建滚动触发器
    ScrollTrigger.create({
      trigger: '.scroll-content',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1, // 平滑跟随滚动
      onUpdate: (self) => {
        this.updateScrollProgress(self.progress)
      },
    })

    console.log('ScrollTrigger created, instances:', ScrollTrigger.getAll().length)

    // 添加水平滑动忽略
    this.setupHorizontalSwipeIgnore()
  }

  setupHorizontalSwipeIgnore() {
    let touchStartY = 0
    let touchStartX = 0

    // 触摸开始
    document.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length > 0 && e.touches[0]) {
          touchStartY = e.touches[0].clientY
          touchStartX = e.touches[0].clientX
        }
      },
      { passive: true },
    )

    // 触摸移动 - 忽略水平滑动
    document.addEventListener(
      'touchmove',
      (e) => {
        if (e.touches.length > 0 && e.touches[0]) {
          const touchY = e.touches[0].clientY
          const touchX = e.touches[0].clientX

          const deltaY = touchStartY - touchY
          const deltaX = touchStartX - touchX

          // 如果水平滑动距离大于垂直滑动距离，阻止默认行为
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            e.preventDefault()
          }
        }
      },
      { passive: false },
    )
  }

  initModelStates() {
    if (!this.particleModel1 || !this.particleModel2) return

    // 模型1初始状态（正常大小，正面）
    this.particleModel1.position.set(0, 0, 0)
    this.particleModel1.scale.set(1, 1, 1)
    this.particleModel1.rotation.set(0, 0, 0)

    // 模型2初始状态（很小，侧面）
    this.particleModel2.position.set(0, 0, 0)
    this.particleModel2.scale.set(0.1, 0.1, 0.1)
    this.particleModel2.rotation.set(0, Math.PI / 2, 0) // 侧面

    // 设置透明度
    this.setMaterialOpacity(this.particleModel2.material, 0)
    if (this.particleModel2.material && !Array.isArray(this.particleModel2.material)) {
      ;(this.particleModel2.material as THREE.Material).transparent = true
    }
  }

  updateScrollProgress(progress: number) {
    if (!this.particleModel1 || !this.particleModel2) return

    // 通知进度变化
    if (this.onProgressChange) {
      this.onProgressChange(progress)
    }

    // 进度分段
    // 0-0.4: 模型1正常显示
    // 0.4-0.6: 模型1前移放大并完全消失
    // 0.6-0.8: 模型2出现并放大
    // 0.8-1: 模型2正常显示

    if (progress <= 0.4) {
      // 阶段1: 模型1正常显示
      this.particleModel1.scale.set(1, 1, 1)
      this.particleModel1.position.set(0, 0, 0)
      this.particleModel1.rotation.set(0, 0, 0)
      this.setMaterialOpacity(this.particleModel1.material, 1)

      // 模型2完全隐藏
      this.particleModel2.scale.set(0.1, 0.1, 0.1)
      this.setMaterialOpacity(this.particleModel2.material, 0)
    } else if (progress <= 0.6) {
      // 阶段2: 模型1前移放大并完全消失
      const phase2Progress = (progress - 0.4) / 0.2

      // 模型1前移放大并消失
      const model1Scale = 1 + phase2Progress * 2 // 放大到3倍
      const model1Z = phase2Progress * 50 // 前移
      const model1Opacity = 1 - phase2Progress // 逐渐透明

      this.particleModel1.scale.set(model1Scale, model1Scale, model1Scale)
      this.particleModel1.position.set(0, 0, model1Z)
      this.setMaterialOpacity(this.particleModel1.material, model1Opacity)

      // 模型2保持隐藏
      this.particleModel2.scale.set(0.1, 0.1, 0.1)
      this.setMaterialOpacity(this.particleModel2.material, 0)
    } else if (progress <= 0.8) {
      // 阶段3: 模型2出现并放大
      const phase3Progress = (progress - 0.6) / 0.2

      // 模型1完全消失
      this.particleModel1.scale.set(3, 3, 3)
      this.setMaterialOpacity(this.particleModel1.material, 0)

      // 模型2从小到大并旋转到正面
      const model2Scale = 0.1 + phase3Progress * 0.9 // 从0.1到1
      const model2Opacity = phase3Progress // 逐渐显示
      const model2RotationY = Math.PI / 2 - (phase3Progress * Math.PI) / 2 // 从侧面到正面

      this.particleModel2.scale.set(model2Scale, model2Scale, model2Scale)
      this.particleModel2.rotation.set(0, model2RotationY, 0)
      this.setMaterialOpacity(this.particleModel2.material, model2Opacity)
    } else {
      // 阶段4: 模型2正常显示
      // 模型1保持隐藏
      this.particleModel1.scale.set(3, 3, 3)
      this.setMaterialOpacity(this.particleModel1.material, 0)

      // 模型2正常显示
      this.particleModel2.scale.set(1, 1, 1)
      this.particleModel2.rotation.set(0, 0, 0)
      this.setMaterialOpacity(this.particleModel2.material, 1)
    }
  }

  // 手动控制滚动进度（用于测试）
  setProgress(progress: number) {
    this.updateScrollProgress(progress)
  }

  // 销毁
  destroy() {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
  }
}
