# H5 3D Demo

一个基于Vue 3 + Three.js的H5 3D演示项目，支持移动端访问。

## 项目特性

- 🎨 基于Vue 3 + TypeScript + Vite构建
- 🎮 集成Three.js实现3D粒子效果
- 📱 移动端适配优化
- 🚀 GitHub Pages自动部署
- 📊 响应式设计

## 技术栈

- **前端框架**: Vue 3
- **构建工具**: Vite
- **3D渲染**: Three.js
- **动画库**: GSAP
- **状态管理**: Pinia
- **路由**: Vue Router
- **类型检查**: TypeScript

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## GitHub Pages部署

项目已配置GitHub Actions自动部署到GitHub Pages。

### 部署步骤

1. **创建GitHub仓库**
   - 在GitHub上创建名为 `h53d-demo` 的私人仓库
   - 仓库URL: `https://github.com/YOUR_USERNAME/h53d-demo.git`

2. **推送代码**
   ```bash
   # 更新远程仓库URL（替换YOUR_USERNAME为你的GitHub用户名）
   git remote set-url origin https://github.com/YOUR_USERNAME/h53d-demo.git
   
   # 推送代码
   git push -u origin main
   ```

3. **启用GitHub Pages**
   - 进入仓库的 Settings > Pages
   - Source选择 "GitHub Actions"
   - 保存设置

4. **访问网站**
   - 部署完成后，网站将在以下地址可用：
   - `https://YOUR_USERNAME.github.io/h53d-demo/`

## 项目结构

```
src/
├── components/     # Vue组件
├── views/         # 页面视图
├── three/         # Three.js相关代码
├── utils/         # 工具函数
├── stores/        # Pinia状态管理
└── router/        # 路由配置
```

## 移动端优化

- 响应式设计适配各种屏幕尺寸
- 触摸事件优化
- 性能优化减少移动端卡顿
- 支持移动端手势操作

## 许可证

MIT License