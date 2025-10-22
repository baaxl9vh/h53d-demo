<template>
  <div class="particle-container">
    <!-- Three.js Canvas -->
    <canvas ref="canvasRef" class="particle-canvas"></canvas>

    <!-- 欢迎界面 -->
    <div v-if="!started" class="welcome-screen">
      <div class="welcome-content">
        <h1 class="title">粒子交互原型</h1>
        <p class="subtitle">Particle Interaction Demo</p>
        <button class="start-button" @click="handleStart">开始体验</button>
        <p class="hint">{{ isMobile ? '向下滑动切换模型' : '向下滚动切换模型' }}</p>
      </div>
    </div>

    <!-- 信息面板 -->
    <div v-if="started" class="info-panel">
      <div class="info-item">
        <span class="label">粒子数量:</span>
        <span class="value">{{ particleCount }}</span>
      </div>
      <div class="info-item">
        <span class="label">FPS:</span>
        <span class="value">{{ fps }}</span>
      </div>
      <div class="info-item">
        <span class="label">滚动进度:</span>
        <span class="value">{{ scrollProgress }}%</span>
      </div>
    </div>

    <!-- 提示文字 -->
    <div v-if="started" class="interaction-hint">
      {{ isMobile ? '向下滑动切换模型' : '向下滚动切换模型' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ParticleSystem } from '@/three/ParticleSystem'
import { ParticleModel } from '@/three/ParticleModel'
import { ParticleModel2 } from '@/three/ParticleModel2'
import { ScrollController } from '@/three/ScrollController'
import { DeviceDetector } from '@/utils/device'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const started = ref(false)
const particleCount = ref(0)
const fps = ref(60)
const deviceType = ref('')
const isMobile = ref(false)
const scrollProgress = ref(0) // 添加滚动进度显示

let particleSystem: ParticleSystem | null = null
let particleModel1: ParticleModel | null = null
let particleModel2: ParticleModel2 | null = null
let scrollController: ScrollController | null = null
let animationId: number | null = null
let lastTime = 0
let frameCount = 0
let fpsLastUpdate = 0

// 滑动控制（已移除，现在使用滚动控制）
// let touchStartX = 0
// let touchStartY = 0
// let lastTouchX = 0
// let lastTouchY = 0

const handleStart = () => {
  started.value = true

  // 延迟初始化，确保 DOM 已更新
  setTimeout(() => {
    if (canvasRef.value) {
      initParticleSystem()
    }
  }, 100)
}

const initParticleSystem = () => {
  if (!canvasRef.value) return

  // 创建粒子系统（背景粒子）
  particleSystem = new ParticleSystem(canvasRef.value)
  particleCount.value = particleSystem.particleCount

  // 创建两个粒子模型
  if (particleSystem.scene) {
    particleModel1 = new ParticleModel(particleSystem.scene)
    particleModel2 = new ParticleModel2(particleSystem.scene)

    // 创建滚动控制器
    scrollController = new ScrollController(
      particleModel1.particles,
      particleModel2.particles,
      particleSystem.camera,
      (progress) => {
        scrollProgress.value = Math.round(progress * 100)
      },
    )
  }

  // 检测设备
  isMobile.value = DeviceDetector.isMobile()
  const level = DeviceDetector.getPerformanceLevel()
  deviceType.value = isMobile.value ? `移动端 (${level})` : `桌面端 (${level})`

  // 开始动画循环
  animate()
}

// 滑动监听已移除，现在使用GSAP滚动控制

const animate = () => {
  const currentTime = performance.now()

  // 计算 FPS
  frameCount++
  if (currentTime - fpsLastUpdate >= 1000) {
    fps.value = Math.round((frameCount * 1000) / (currentTime - fpsLastUpdate))
    frameCount = 0
    fpsLastUpdate = currentTime
  }

  // 更新粒子系统（背景粒子）
  if (particleSystem) {
    particleSystem.animate(currentTime)
  }

  // 更新粒子模型（立体图形）
  if (particleModel1) {
    particleModel1.animate(currentTime)
  }
  if (particleModel2) {
    particleModel2.animate(currentTime)
  }

  lastTime = currentTime
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  // 可以在这里预加载资源或做其他初始化
})

onUnmounted(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }
  if (particleSystem) {
    particleSystem.dispose()
  }
  if (particleModel1) {
    particleModel1.dispose()
  }
  if (particleModel2) {
    particleModel2.dispose()
  }
  if (scrollController) {
    scrollController.destroy()
  }
})
</script>

<style scoped>
.particle-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  /* 移动端更精确的视口高度 */
  overflow: hidden;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%);
}

.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 2;
}

/* 欢迎屏幕 */
.welcome-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 14, 39, 0.9);
  backdrop-filter: blur(10px);
  z-index: 10;
  animation: fadeIn 0.5s ease-out;
}

.welcome-content {
  text-align: center;
  padding: 2rem;
  max-width: 90%;
}

.title {
  font-size: clamp(2rem, 8vw, 4rem);
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: slideUp 0.8s ease-out;
}

.subtitle {
  font-size: clamp(0.9rem, 3vw, 1.2rem);
  color: #a0a0a0;
  margin: 0 0 3rem 0;
  letter-spacing: 0.1em;
  animation: slideUp 0.8s ease-out 0.1s both;
}

.start-button {
  padding: 1rem 3rem;
  font-size: clamp(1rem, 3vw, 1.2rem);
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  animation: slideUp 0.8s ease-out 0.2s both;
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.start-button:active {
  transform: translateY(0);
}

.hint {
  margin-top: 2rem;
  font-size: clamp(0.8rem, 2.5vw, 1rem);
  color: #666;
  animation: slideUp 0.8s ease-out 0.3s both;
}

/* 信息面板 */
.info-panel {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 10px;
  color: #ffffff;
  font-size: 0.9rem;
  z-index: 5;
  animation: fadeIn 0.5s ease-out;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #a0a0a0;
}

.value {
  color: #667eea;
  font-weight: 600;
}

/* 交互提示 */
.interaction-hint {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-size: clamp(0.8rem, 2.5vw, 1rem);
  text-align: center;
  animation: pulse 2s ease-in-out infinite;
  z-index: 5;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .info-panel {
    font-size: 0.75rem;
    padding: 0.75rem;
  }

  .info-item {
    gap: 0.5rem;
  }

  .interaction-hint {
    bottom: 1rem;
    padding: 0 1rem;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .start-button:hover {
    transform: none;
  }

  .start-button:active {
    transform: scale(0.95);
  }
}
</style>
