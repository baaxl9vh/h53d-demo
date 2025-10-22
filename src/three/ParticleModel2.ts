import * as THREE from 'three'

export class ParticleModel2 {
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

    // 创建人物/动物形状的粒子分布（简化的人形）
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3

      // 创建人形轮廓
      const shape = this.generateHumanoidShape()

      positions[i3] = shape.x
      positions[i3 + 1] = shape.y
      positions[i3 + 2] = shape.z

      // 黑色粒子（与模型1一致）
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
      blending: THREE.NormalBlending, // 普通混合，不发光
      depthWrite: false,
    })

    // 创建粒子系统
    this.particles = new THREE.Points(this.particleGeometry, this.particleMaterial)
    this.scene.add(this.particles)
  }

  // 生成人形轮廓
  generateHumanoidShape(): { x: number; y: number; z: number } {
    const rand = Math.random()

    if (rand < 0.15) {
      // 头部 (15%)
      return {
        x: (Math.random() - 0.5) * 4,
        y: 8 + (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2,
      }
    } else if (rand < 0.25) {
      // 颈部 (10%)
      return {
        x: (Math.random() - 0.5) * 1,
        y: 6 + (Math.random() - 0.5) * 1,
        z: (Math.random() - 0.5) * 1,
      }
    } else if (rand < 0.45) {
      // 躯干 (20%)
      return {
        x: (Math.random() - 0.5) * 6,
        y: (Math.random() - 0.5) * 4,
        z: (Math.random() - 0.5) * 3,
      }
    } else if (rand < 0.6) {
      // 左臂 (15%)
      return {
        x: -4 + (Math.random() - 0.5) * 2,
        y: 2 + (Math.random() - 0.5) * 3,
        z: (Math.random() - 0.5) * 2,
      }
    } else if (rand < 0.75) {
      // 右臂 (15%)
      return {
        x: 4 + (Math.random() - 0.5) * 2,
        y: 2 + (Math.random() - 0.5) * 3,
        z: (Math.random() - 0.5) * 2,
      }
    } else if (rand < 0.85) {
      // 左腿 (10%)
      return {
        x: -2 + (Math.random() - 0.5) * 1,
        y: -4 + (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 1,
      }
    } else {
      // 右腿 (15%)
      return {
        x: 2 + (Math.random() - 0.5) * 1,
        y: -4 + (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 1,
      }
    }
  }

  // 创建粒子纹理
  createParticleTexture(): THREE.Texture {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32

    const ctx = canvas.getContext('2d')!
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = canvas.width / 2

    // 创建简单的圆形纹理
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)')
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
