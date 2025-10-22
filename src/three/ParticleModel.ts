import * as THREE from 'three'

export class ParticleModel {
  scene: THREE.Scene
  particles: THREE.Points | null = null
  particleGeometry: THREE.BufferGeometry | null = null
  particleMaterial: THREE.PointsMaterial | null = null
  particleCount: number = 3000
  rotationVelocity: THREE.Vector2 = new THREE.Vector2(0, 0)
  targetRotation: THREE.Vector2 = new THREE.Vector2(0, 0)

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.init()
  }

  init() {
    this.createParticleModel()
  }

  createParticleModel() {
    // 创建粒子几何体
    this.particleGeometry = new THREE.BufferGeometry()

    const positions = new Float32Array(this.particleCount * 3)
    const colors = new Float32Array(this.particleCount * 3)
    const sizes = new Float32Array(this.particleCount)

    // 创建球体形状的粒子分布
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3

      // 使用球坐标系创建均匀分布的球体
      const radius = 15 + Math.random() * 2
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)

      // 黑色粒子（模型1）
      const color = new THREE.Color()
      color.setRGB(0.1, 0.1, 0.1) // 深黑色

      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      // 粒子大小（更小）
      sizes[i] = Math.random() * 0.8 + 0.3
    }

    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    // 创建粒子纹理
    const texture = this.createParticleTexture()

    // 创建粒子材质（黑色粒子，不发光）
    this.particleMaterial = new THREE.PointsMaterial({
      size: 1.5, // 更小的粒子
      sizeAttenuation: true,
      map: texture,
      transparent: true,
      opacity: 0.9,
      vertexColors: true,
      blending: THREE.NormalBlending, // 改为普通混合，不发光
      depthWrite: false,
    })

    // 创建粒子系统
    this.particles = new THREE.Points(this.particleGeometry, this.particleMaterial)
    this.scene.add(this.particles)
  }

  // 创建粒子纹理
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

  // 处理滑动旋转
  handleSwipe(deltaX: number, deltaY: number) {
    // 将滑动距离转换为旋转速度
    this.targetRotation.x += deltaY * 0.01
    this.targetRotation.y += deltaX * 0.01
  }

  // 更新动画
  animate(time: number) {
    if (!this.particles) return

    // 平滑旋转
    this.rotationVelocity.x += (this.targetRotation.x - this.rotationVelocity.x) * 0.1
    this.rotationVelocity.y += (this.targetRotation.y - this.rotationVelocity.y) * 0.1

    // 应用旋转
    this.particles.rotation.x += this.rotationVelocity.x
    this.particles.rotation.y += this.rotationVelocity.y

    // 阻尼效果
    this.rotationVelocity.x *= 0.95
    this.rotationVelocity.y *= 0.95
    this.targetRotation.x *= 0.95
    this.targetRotation.y *= 0.95

    // 添加轻微的自动旋转
    this.particles.rotation.y += 0.001
  }

  dispose() {
    if (this.particleGeometry) this.particleGeometry.dispose()
    if (this.particleMaterial) this.particleMaterial.dispose()
    if (this.particles) this.scene.remove(this.particles)
  }
}
