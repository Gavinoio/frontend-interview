# 前端知识库

> 系统化的前端开发知识整理，助你提升技术能力

## 📚 项目简介

这是一个基于 VitePress 搭建的前端知识文档系统，涵盖了前端开发的各个核心领域，包括:

- 🟨 **JavaScript** - 核心语法、ES6+、异步编程、闭包、原型等
- 🔷 **TypeScript** - 类型系统、高级类型、泛型、工程实践
- 💚 **Vue** - 响应式原理、虚拟DOM、Composition API、生态系统
- ⚛️ **React** - Fiber架构、Hooks原理、状态管理、性能优化
- 🌐 **网络** - HTTP/HTTPS、跨域、WebSocket、网络安全
- 🖥️ **浏览器** - 渲染原理、事件循环、缓存、存储
- 🚀 **性能优化** - 加载优化、运行时优化、构建优化、监控
- 🛠️ **工程化** - Webpack、Vite、Babel、CI/CD、Monorepo
- 🧩 **微前端** - qiankun、Micro App、Module Federation
- 📱 **跨端开发** - uni-app、Taro、小程序原理
- 🤖 **AI与前端** - ChatGPT集成、AI辅助开发、大模型应用
- 🎯 **场景题** - 系统设计、问题排查、架构设计
- 💡 **算法** - 数据结构、常见算法、前端算法题

## 🚀 快速开始

### 安装依赖

```bash
cd frontend-interview
npm install
```

### 启动开发服务器

```bash
npm run docs:dev
```

访问 `http://localhost:5173` 查看文档

### 构建生产版本

```bash
npm run docs:build
```

### 预览生产构建

```bash
npm run docs:preview
```

## 📖 文档结构

```
frontend-interview/
├── docs/
│   ├── .vitepress/         # VitePress 配置
│   │   └── config.js       # 导航和侧边栏配置
│   ├── javascript/         # JavaScript 核心知识
│   │   ├── index.md
│   │   ├── data-types.md   # 数据类型与类型转换
│   │   ├── scope-closure.md # 作用域与闭包
│   │   ├── async.md        # 异步编程
│   │   └── ...
│   ├── typescript/         # TypeScript
│   ├── vue/                # Vue 框架
│   │   ├── index.md
│   │   ├── reactivity.md   # 响应式原理
│   │   └── ...
│   ├── react/              # React 框架
│   ├── network/            # 网络与HTTP
│   ├── browser/            # 浏览器原理
│   ├── performance/        # 性能优化
│   ├── engineering/        # 工程化
│   ├── micro-frontend/     # 微前端
│   ├── cross-platform/     # 跨端开发
│   ├── ai/                 # AI与前端
│   ├── scenarios/          # 场景题
│   ├── algorithm/          # 算法
│   └── index.md            # 首页
├── package.json
└── README.md
```

## ✨ 特色功能

### 1. 系统化的知识体系
- 按照技术栈分类组织
- 从基础到进阶,循序渐进
- 涵盖理论和实践

### 2. 通俗易懂的讲解
- **官方定义** + **通俗解释**
- 大量代码示例
- 实际应用场景

### 3. 丰富的代码示例
- 常见技术问题汇总
- 详细的答案解析
- 代码实现和原理讲解

### 4. 实战导向
- 真实项目场景
- 最佳实践总结
- 常见问题解决方案

### 5. 持续更新
- 跟进最新技术趋势
- 补充新的知识点
- 优化现有内容

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request!

### 如何贡献:

1. Fork 本仓库
2. 创建新分支: `git checkout -b feature/xxx`
3. 提交更改: `git commit -m 'Add some feature'`
4. 推送分支: `git push origin feature/xxx`
5. 提交 Pull Request

### 内容规范:

- 保持内容准确性和时效性
- 使用通俗易懂的语言
- 提供代码示例和实际应用
- 遵循现有的文档格式

## 📄 License

MIT License

## 🙏 致谢

感谢所有为前端技术发展做出贡献的开发者!

---

**开始你的学习之旅** → 运行 `npm run docs:dev` 启动文档站点

如有问题或建议,欢迎提 Issue!
