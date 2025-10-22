import * as THREE from 'three'
import { DeviceDetector } from '../utils/device'

export class ParticleSystem {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  particles: THREE.Points | null = null
  particleGeometry: THREE.BufferGeometry | null = null
  particleMaterial: THREE.PointsMaterial | null = null
  particleCount: number
  mouse: THREE.Vector2 = new THREE.Vector2()
  targetMouse: THREE.Vector2 = new THREE.Vector2()

  constructor(canvas: HTMLCanvasElement) {
    this.particleCount = DeviceDetector.getParticleCount()

    // 初始化场景
    this.scene = new THREE.Scene()

    // 初始化相机
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.z = 50

    // 初始化渲染器
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !DeviceDetector.isMobile(),
      alpha: true,
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(DeviceDetector.getDevicePixelRatio())

    this.init()
  }

  init() {
    this.createParticles()
    this.setupEventListeners()
  }

  createParticles() {
    // 创建粒子几何体
    this.particleGeometry = new THREE.BufferGeometry()

    const positions = new Float32Array(this.particleCount * 3)
    const colors = new Float32Array(this.particleCount * 3)
    const sizes = new Float32Array(this.particleCount)
    const velocities = new Float32Array(this.particleCount * 3)

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3

      // 随机位置
      positions[i3] = (Math.random() - 0.5) * 100
      positions[i3 + 1] = (Math.random() - 0.5) * 100
      positions[i3 + 2] = (Math.random() - 0.5) * 50

      // 颜色渐变（淡淡的蓝紫色，作为背景）
      const color = new THREE.Color()
      const hue = 0.55 + Math.random() * 0.15 // 蓝色到紫色
      color.setHSL(hue, 0.3, 0.4) // 降低饱和度和亮度
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      // 随机大小
      sizes[i] = Math.random() * 2 + 0.5

      // 随机速度
      velocities[i3] = (Math.random() - 0.5) * 0.02
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02
    }

    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    this.particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))

    // 创建粒子纹理
    const texture = this.createParticleTexture()

    // 创建粒子材质（背景粒子，更淡）
    this.particleMaterial = new THREE.PointsMaterial({
      size: 2,
      sizeAttenuation: true,
      map: texture,
      transparent: true,
      opacity: 0.3, // 降低透明度
      alphaTest: 0.01,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    // 创建粒子系统
    this.particles = new THREE.Points(this.particleGeometry, this.particleMaterial)
    this.scene.add(this.particles)
  }

  // 创建粒子纹理（简单的圆形光晕）
  createParticleTexture(): THREE.Texture {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64

    const ctx = canvas.getContext('2d')!
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = canvas.width / 2

    // 创建径向渐变
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onResize())

    // 鼠标移动事件
    window.addEventListener('mousemove', (e) => {
      this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1
      this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    })

    // 触摸移动事件
    window.addEventListener(
      'touchmove',
      (e) => {
        if (e.touches.length > 0 && e.touches[0]) {
          this.targetMouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1
          this.targetMouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1
        }
      },
      { passive: true },
    )
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  animate(time: number) {
    if (!this.particles || !this.particleGeometry) return

    const positionAttr = this.particleGeometry.attributes.position
    if (!positionAttr) return

    const positions = positionAttr.array as Float32Array

    // 平滑鼠标移动
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3

      // 粒子浮动效果
      const currentY = positions[i3 + 1]
      if (currentY !== undefined) {
        positions[i3 + 1] = currentY + Math.sin(time * 0.001 + i) * 0.02
      }

      // 粒子旋转
      const x = positions[i3]
      const z = positions[i3 + 2]
      if (x !== undefined && z !== undefined) {
        const angle = Math.atan2(z, x) + 0.0003
        const distance = Math.sqrt(x * x + z * z)

        positions[i3] = Math.cos(angle) * distance
        positions[i3 + 2] = Math.sin(angle) * distance
      }

      // 鼠标交互 - 粒子被鼠标吸引或排斥
      const px = positions[i3]
      const py = positions[i3 + 1]
      if (px !== undefined && py !== undefined) {
        const dx = this.mouse.x * 30 - px
        const dy = this.mouse.y * 30 - py
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 20) {
          const force = (20 - dist) / 20
          positions[i3] = px - dx * force * 0.1
          positions[i3 + 1] = py - dy * force * 0.1
        }
      }

      // 边界检查
      const checkX = positions[i3]
      const checkY = positions[i3 + 1]
      if (checkX !== undefined && Math.abs(checkX) > 60) {
        positions[i3] = (Math.random() - 0.5) * 100
      }
      if (checkY !== undefined && Math.abs(checkY) > 60) {
        positions[i3 + 1] = (Math.random() - 0.5) * 100
      }
    }

    positionAttr.needsUpdate = true

    // 相机轻微移动
    this.camera.position.x = this.mouse.x * 2
    this.camera.position.y = this.mouse.y * 2

    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    if (this.particleGeometry) this.particleGeometry.dispose()
    if (this.particleMaterial) this.particleMaterial.dispose()
    if (this.particles) this.scene.remove(this.particles)
    this.renderer.dispose()
  }
}
