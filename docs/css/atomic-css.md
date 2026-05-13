# 原子化 CSS 框架

## 什么是原子化 CSS

### 概念解释

原子化 CSS（Atomic CSS）是一种 CSS 架构方法，它将样式拆分成最小的、不可再分的功能单元（原子类）。每个类名只负责一个单一的样式属性，通过组合多个原子类来构建复杂的 UI 组件。

例如：
```html
<!-- 传统 CSS -->
<div class="card">...</div>

<!-- 原子化 CSS -->
<div class="bg-white p-4 rounded-lg shadow-md">...</div>
```

### 与传统 CSS 的对比

| 对比维度 | 传统 CSS | 原子化 CSS |
|---------|---------|-----------|
| 类名语义 | 语义化（.card, .button） | 功能化（.p-4, .bg-blue） |
| CSS 文件大小 | 随项目增长而增长 | 趋于稳定（复用率高） |
| 命名成本 | 需要思考类名 | 无需命名 |
| 样式复用 | 通过继承和组合 | 通过类名组合 |
| 维护性 | 修改可能影响多处 | 修改局部，影响可控 |
| HTML 体积 | 较小 | 较大（类名多） |

### 优势和适用场景

**优势：**

1. **CSS 体积可控**：随着项目增长，CSS 文件大小趋于平稳
2. **无命名困扰**：不需要为每个组件想类名
3. **快速开发**：直接在 HTML 中编写样式，无需切换文件
4. **样式复用**：原子类天然可复用
5. **易于维护**：样式修改不会产生意外的副作用
6. **容易删除**：删除 HTML 即删除样式，无冗余 CSS

**适用场景：**

- 快速原型开发
- 中大型项目（样式复用率高）
- 组件化开发（React、Vue 等）
- 需要快速迭代的项目
- 团队协作项目（减少样式冲突）

## Tailwind CSS

### 简介

#### 什么是 Tailwind CSS

Tailwind CSS 是一个功能类优先的 CSS 框架，它提供了大量的实用工具类，让你可以直接在 HTML 中快速构建现代化的用户界面。它不像 Bootstrap 那样提供预设计的组件，而是提供底层的工具类，让开发者自由组合。

#### 核心理念（Utility-First）

Utility-First（功能优先）是 Tailwind 的核心理念：

```html
<!-- 传统方式 -->
<style>
  .btn-primary {
    background-color: #3490dc;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    font-weight: 700;
  }
</style>
<button class="btn-primary">按钮</button>

<!-- Tailwind 方式 -->
<button class="bg-blue-500 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">
  按钮
</button>
```

#### 安装和配置

**使用 npm/yarn：**

```bash
# 安装
npm install -D tailwindcss postcss autoprefixer

# 初始化配置文件
npx tailwindcss init -p
```

**配置 tailwind.config.js：**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**在 CSS 文件中引入：**

```css
/* main.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 核心特性

#### 响应式设计（sm/md/lg/xl/2xl）

Tailwind 使用移动优先的断点系统：

```html
<!-- 默认小屏幕单列，中等屏幕双列，大屏幕四列 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</div>
```

**断点对照表：**

| 断点 | 最小宽度 | CSS |
|-----|---------|-----|
| sm | 640px | @media (min-width: 640px) |
| md | 768px | @media (min-width: 768px) |
| lg | 1024px | @media (min-width: 1024px) |
| xl | 1280px | @media (min-width: 1280px) |
| 2xl | 1536px | @media (min-width: 1536px) |

#### 状态变体（hover/focus/active/disabled）

```html
<!-- Hover 状态 -->
<button class="bg-blue-500 hover:bg-blue-700 text-white">
  Hover Me
</button>

<!-- Focus 状态 -->
<input class="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">

<!-- Active 状态 -->
<button class="bg-blue-500 active:bg-blue-800">
  Click Me
</button>

<!-- Disabled 状态 -->
<button class="bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed" disabled>
  Disabled
</button>

<!-- 组合使用 -->
<a class="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
  Link
</a>
```

#### 暗色模式

Tailwind 支持两种暗色模式策略：

**1. 媒体查询策略（默认）：**

```js
// tailwind.config.js
module.exports = {
  darkMode: 'media', // 使用系统偏好
}
```

```html
<div class="bg-white dark:bg-gray-800 text-black dark:text-white">
  自动跟随系统主题
</div>
```

**2. 类名策略（推荐）：**

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class', // 通过类名控制
}
```

```html
<!-- 在根元素添加 dark 类 -->
<html class="dark">
  <body class="bg-white dark:bg-gray-900">
    <div class="text-gray-900 dark:text-white">
      通过切换 html 的 dark 类控制
    </div>
  </body>
</html>
```

#### 自定义配置（tailwind.config.js）

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx,vue}'],

  theme: {
    extend: {
      // 扩展颜色
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          900: '#0c4a6e',
        },
        brand: '#ff6b6b',
      },

      // 扩展间距
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },

      // 扩展字体
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },

      // 扩展断点
      screens: {
        '3xl': '1920px',
      },

      // 扩展动画
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },

  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
```

#### JIT 模式

JIT（Just-In-Time）模式是 Tailwind CSS 3.0+ 的默认编译模式，它按需生成样式，而不是预先生成所有可能的组合。

**优势：**

1. **更快的构建速度**：只生成用到的样式
2. **开发体验更好**：无需等待完整编译
3. **文件体积更小**：生产环境只包含使用的样式
4. **支持任意值**：可以使用任意值而不需要配置

**任意值示例：**

```html
<!-- 使用任意值 -->
<div class="top-[117px]">
<div class="bg-[#1da1f2]">
<div class="text-[14px]">
<div class="w-[762px]">

<!-- 使用 CSS 变量 -->
<div class="bg-[var(--brand-color)]">

<!-- 使用 calc -->
<div class="h-[calc(100vh-4rem)]">
```

### 常用类名

#### 布局（flex, grid, container）

```html
<!-- Flexbox -->
<div class="flex items-center justify-between">
  <div>Left</div>
  <div>Right</div>
</div>

<div class="flex flex-col md:flex-row gap-4">
  <div class="flex-1">Item 1</div>
  <div class="flex-1">Item 2</div>
</div>

<!-- Grid -->
<div class="grid grid-cols-3 gap-4">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Auto-responsive grid -->
</div>

<!-- Container -->
<div class="container mx-auto px-4">
  <!-- 响应式容器，自动居中 -->
</div>
```

#### 间距（p-4, m-4, space-x-4）

```html
<!-- Padding -->
<div class="p-4">所有方向 padding: 1rem</div>
<div class="px-4 py-2">水平 1rem，垂直 0.5rem</div>
<div class="pt-8 pb-4">顶部 2rem，底部 1rem</div>

<!-- Margin -->
<div class="m-4">所有方向 margin: 1rem</div>
<div class="mx-auto">水平居中</div>
<div class="mt-8 mb-4">顶部 2rem，底部 1rem</div>
<div class="-mt-4">负 margin</div>

<!-- Space Between -->
<div class="flex space-x-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<div class="flex flex-col space-y-2">
  <div>Row 1</div>
  <div>Row 2</div>
</div>
```

**间距比例：**

| 类名 | 值 | Rem | Pixels |
|-----|---|-----|--------|
| p-0 | 0 | 0 | 0px |
| p-1 | 0.25rem | 0.25rem | 4px |
| p-2 | 0.5rem | 0.5rem | 8px |
| p-4 | 1rem | 1rem | 16px |
| p-8 | 2rem | 2rem | 32px |
| p-16 | 4rem | 4rem | 64px |

#### 颜色（bg-blue-500, text-white）

```html
<!-- 背景色 -->
<div class="bg-blue-500">蓝色背景</div>
<div class="bg-gradient-to-r from-purple-500 to-pink-500">渐变背景</div>

<!-- 文字颜色 -->
<p class="text-gray-900">深灰色文字</p>
<p class="text-red-500">红色文字</p>

<!-- 边框颜色 -->
<div class="border border-gray-300">灰色边框</div>

<!-- 不透明度 -->
<div class="bg-blue-500 bg-opacity-50">半透明蓝色</div>
<div class="bg-blue-500/50">半透明蓝色（简写）</div>
```

**颜色深度：**

- 50: 最浅
- 100-900: 逐渐加深（每次 100）
- 950: 最深（部分颜色）

#### 字体（text-lg, font-bold）

```html
<!-- 字体大小 -->
<p class="text-xs">极小文字 (0.75rem)</p>
<p class="text-sm">小文字 (0.875rem)</p>
<p class="text-base">基础文字 (1rem)</p>
<p class="text-lg">大文字 (1.125rem)</p>
<p class="text-xl">特大文字 (1.25rem)</p>
<p class="text-2xl">2倍大 (1.5rem)</p>
<p class="text-4xl">4倍大 (2.25rem)</p>

<!-- 字重 -->
<p class="font-thin">100</p>
<p class="font-light">300</p>
<p class="font-normal">400</p>
<p class="font-medium">500</p>
<p class="font-semibold">600</p>
<p class="font-bold">700</p>
<p class="font-black">900</p>

<!-- 行高 -->
<p class="leading-none">行高 1</p>
<p class="leading-tight">行高 1.25</p>
<p class="leading-normal">行高 1.5</p>
<p class="leading-loose">行高 2</p>

<!-- 文本对齐 -->
<p class="text-left">左对齐</p>
<p class="text-center">居中</p>
<p class="text-right">右对齐</p>
<p class="text-justify">两端对齐</p>

<!-- 文本装饰 -->
<p class="underline">下划线</p>
<p class="line-through">删除线</p>
<p class="no-underline">无装饰</p>
```

#### 边框（border, rounded-lg）

```html
<!-- 边框宽度 -->
<div class="border">1px 边框</div>
<div class="border-2">2px 边框</div>
<div class="border-4">4px 边框</div>
<div class="border-t">仅顶部边框</div>
<div class="border-x-2">左右边框 2px</div>

<!-- 圆角 -->
<div class="rounded">圆角 0.25rem</div>
<div class="rounded-md">中等圆角 0.375rem</div>
<div class="rounded-lg">大圆角 0.5rem</div>
<div class="rounded-xl">特大圆角 0.75rem</div>
<div class="rounded-full">完全圆形</div>
<div class="rounded-t-lg">仅顶部圆角</div>

<!-- 阴影 -->
<div class="shadow-sm">小阴影</div>
<div class="shadow">默认阴影</div>
<div class="shadow-md">中等阴影</div>
<div class="shadow-lg">大阴影</div>
<div class="shadow-xl">特大阴影</div>
<div class="shadow-2xl">超大阴影</div>
<div class="shadow-none">无阴影</div>
```

### 代码示例

#### 卡片组件

```html
<!-- 基础卡片 -->
<div class="max-w-sm rounded overflow-hidden shadow-lg">
  <img class="w-full" src="/img/card-top.jpg" alt="Sunset in the mountains">
  <div class="px-6 py-4">
    <div class="font-bold text-xl mb-2">卡片标题</div>
    <p class="text-gray-700 text-base">
      这是卡片的描述内容，可以包含多行文字。
    </p>
  </div>
  <div class="px-6 pt-4 pb-2">
    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
      #标签1
    </span>
    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
      #标签2
    </span>
  </div>
</div>

<!-- 交互式卡片 -->
<div class="max-w-sm rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white">
  <div class="relative">
    <img class="w-full h-48 object-cover" src="/img/product.jpg" alt="Product">
    <div class="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 m-2 rounded-md text-sm font-semibold">
      SALE
    </div>
  </div>
  <div class="p-6">
    <h3 class="font-bold text-xl mb-2 text-gray-800">产品名称</h3>
    <p class="text-gray-600 text-sm mb-4">
      产品的详细描述信息...
    </p>
    <div class="flex items-center justify-between">
      <span class="text-2xl font-bold text-gray-900">$99.99</span>
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200">
        加入购物车
      </button>
    </div>
  </div>
</div>
```

#### 导航栏

```html
<!-- 响应式导航栏 -->
<nav class="bg-white shadow-lg">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <!-- Logo -->
      <div class="flex items-center">
        <img class="h-8 w-auto" src="/logo.svg" alt="Logo">
        <span class="ml-2 text-xl font-bold text-gray-800">Brand</span>
      </div>

      <!-- Desktop Menu -->
      <div class="hidden md:flex items-center space-x-8">
        <a href="#" class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
          首页
        </a>
        <a href="#" class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
          产品
        </a>
        <a href="#" class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
          关于
        </a>
        <a href="#" class="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
          登录
        </a>
      </div>

      <!-- Mobile menu button -->
      <div class="md:hidden flex items-center">
        <button class="text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile Menu -->
  <div class="md:hidden">
    <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
      <a href="#" class="text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">
        首页
      </a>
      <a href="#" class="text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">
        产品
      </a>
      <a href="#" class="text-gray-700 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">
        关于
      </a>
    </div>
  </div>
</nav>
```

#### 表单

```html
<!-- 登录表单 -->
<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <!-- Header -->
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        登录您的账户
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        或
        <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
          注册新账户
        </a>
      </p>
    </div>

    <!-- Form -->
    <form class="mt-8 space-y-6" action="#" method="POST">
      <div class="rounded-md shadow-sm space-y-4">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            邮箱地址
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="请输入邮箱"
          >
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            密码
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="请输入密码"
          >
        </div>
      </div>

      <!-- Remember & Forgot -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          >
          <label for="remember-me" class="ml-2 block text-sm text-gray-900">
            记住我
          </label>
        </div>

        <div class="text-sm">
          <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
            忘记密码？
          </a>
        </div>
      </div>

      <!-- Submit Button -->
      <div>
        <button
          type="submit"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          登录
        </button>
      </div>
    </form>
  </div>
</div>
```

#### 响应式布局

```html
<!-- 响应式网格布局 -->
<div class="container mx-auto px-4 py-8">
  <!-- 标题 -->
  <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 text-gray-900">
    响应式产品展示
  </h1>

  <!-- 产品网格 -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <!-- 产品卡片 -->
    <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
      <img src="/product1.jpg" alt="Product" class="w-full h-48 object-cover rounded-t-lg">
      <div class="p-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">产品标题</h3>
        <p class="text-gray-600 text-sm mb-4 line-clamp-2">
          产品描述文字...
        </p>
        <div class="flex items-center justify-between">
          <span class="text-xl font-bold text-blue-600">$99</span>
          <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors">
            购买
          </button>
        </div>
      </div>
    </div>

    <!-- 重复更多卡片... -->
  </div>

  <!-- 两列布局：侧边栏 + 主内容 -->
  <div class="mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
    <!-- 侧边栏 (移动端全宽，桌面端占1列) -->
    <aside class="lg:col-span-1 bg-gray-50 p-6 rounded-lg">
      <h2 class="text-xl font-bold mb-4">分类</h2>
      <ul class="space-y-2">
        <li><a href="#" class="text-blue-600 hover:underline">电子产品</a></li>
        <li><a href="#" class="text-blue-600 hover:underline">家居用品</a></li>
        <li><a href="#" class="text-blue-600 hover:underline">服装配饰</a></li>
      </ul>
    </aside>

    <!-- 主内容 (移动端全宽，桌面端占3列) -->
    <main class="lg:col-span-3">
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-2xl font-bold mb-4">主要内容区域</h2>
        <p class="text-gray-700 leading-relaxed">
          这里是主要内容区域，在移动端会显示在侧边栏下方，
          在桌面端会显示在侧边栏右侧，占据更多空间。
        </p>
      </div>
    </main>
  </div>
</div>
```

### 优缺点分析

**优点：**

1. **生态系统成熟**
   - 完善的文档和教程
   - 丰富的插件系统
   - 大量的社区资源和模板

2. **开发效率高**
   - 无需命名 CSS 类
   - 快速原型开发
   - 直观的类名系统

3. **可维护性好**
   - 样式与 HTML 紧密结合
   - 删除 HTML 即删除样式
   - 减少 CSS 冗余

4. **性能优秀**
   - JIT 模式按需生成
   - 生产环境自动压缩
   - Tree-shaking 移除未使用样式

5. **自定义能力强**
   - 灵活的配置系统
   - 支持自定义工具类
   - 可扩展的设计系统

**缺点：**

1. **HTML 类名冗长**
   - 复杂组件类名可能很长
   - HTML 可读性降低
   - 代码审查不够直观

2. **学习曲线**
   - 需要记忆大量类名
   - 初期开发速度慢
   - 需要理解命名规则

3. **样式复用困难**
   - 重复的类名组合
   - 需要配合组件化解决
   - 或使用 `@apply` 指令

4. **调试相对困难**
   - DevTools 中看到的都是工具类
   - 不如语义化类名直观
   - 需要适应新的调试方式

5. **团队协作挑战**
   - 需要团队统一规范
   - 新成员学习成本
   - 可能产生不一致的实现

## UnoCSS

### 简介

#### 什么是 UnoCSS

UnoCSS 是一个即时按需的原子化 CSS 引擎，而不是一个传统的 CSS 框架。它由 Anthony Fu 开发，设计理念是提供极致的灵活性和性能，让开发者可以完全自定义自己的原子化 CSS 解决方案。

#### 即时原子化引擎

UnoCSS 的核心特点是"即时"（Instant）：

```js
// 传统方式：预生成所有可能的类
// bg-red-100, bg-red-200, ..., bg-blue-100, bg-blue-200...

// UnoCSS：扫描代码，只生成使用的类
// 你用了 bg-red-500，它就只生成这一个
```

**工作原理：**

1. 扫描源代码
2. 提取类名
3. 按需生成 CSS
4. 极致的性能和体积优化

#### 与 Tailwind 的关系

UnoCSS 可以看作是 Tailwind CSS 的精神继承者，但有本质区别：

| 对比项 | Tailwind CSS | UnoCSS |
|-------|-------------|--------|
| 定位 | CSS 框架 | CSS 引擎 |
| 预设 | 固定的工具类集合 | 完全可定制的预设 |
| 性能 | 快（JIT 模式） | 更快（5-200 倍） |
| 灵活性 | 通过配置扩展 | 完全可编程 |
| 体积 | 中等 | 极小 |
| 兼容性 | 可使用 preset-wind | 原生支持多种预设 |

### 核心特性

#### 预设系统

UnoCSS 通过预设系统提供灵活的配置：

```typescript
// uno.config.ts
import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(), // Tailwind / Windi CSS 预设
    presetAttributify(), // 属性化模式
    presetIcons(), // 图标预设
  ],
})
```

**主要预设：**

1. **@unocss/preset-uno**
   - 默认预设，包含常用工具类
   - 兼容 Tailwind CSS 和 Windi CSS

2. **@unocss/preset-wind**
   - 完全兼容 Tailwind CSS
   - 适合从 Tailwind 迁移的项目

3. **@unocss/preset-icons**
   - 直接使用任何图标集
   - 支持 100+ 图标库

```html
<!-- 使用图标预设 -->
<div class="i-carbon-sun"></div>
<div class="i-mdi-account"></div>
<div class="i-heroicons-outline-home"></div>
```

4. **@unocss/preset-attributify**
   - 属性化模式，将类名拆分为属性

```html
<!-- 传统方式 -->
<div class="bg-blue-500 text-white p-4 rounded-lg"></div>

<!-- 属性化模式 -->
<div
  bg="blue-500"
  text="white"
  p="4"
  rounded="lg"
></div>
```

#### 属性模式

属性模式让 HTML 更加清晰可读：

```html
<!-- 基础用法 -->
<button
  bg="blue-500 hover:blue-700"
  text="white sm"
  font="bold"
  py="2"
  px="4"
  rounded
>
  按钮
</button>

<!-- 响应式 -->
<div
  grid="~ cols-1 md:cols-2 lg:cols-4"
  gap="4"
>
  <div>Item</div>
</div>

<!-- 值属性 -->
<div
  m="x-auto"
  p="t-4 b-2 x-6"
  text="center lg"
  font="bold"
>
  内容
</div>
```

#### 变体组

变体组功能可以减少重复的前缀：

```html
<!-- 传统写法 -->
<div class="hover:bg-blue-500 hover:text-white hover:scale-110">

<!-- 变体组写法 -->
<div class="hover:(bg-blue-500 text-white scale-110)">

<!-- 复杂示例 -->
<div class="
  dark:(bg-gray-800 text-white border-gray-700)
  lg:(grid grid-cols-3 gap-8)
  hover:(shadow-xl scale-105)
">
  内容
</div>
```

#### 快捷方式

快捷方式允许你定义常用的类名组合：

```typescript
// uno.config.ts
export default defineConfig({
  shortcuts: {
    // 静态快捷方式
    'btn': 'px-4 py-2 rounded font-semibold bg-blue-500 text-white hover:bg-blue-700',
    'btn-green': 'px-4 py-2 rounded font-semibold bg-green-500 text-white hover:bg-green-700',

    // 动态快捷方式
    'btn': 'px-4 py-2 rounded font-semibold transition-colors',

    // 使用数组
    'card': [
      'bg-white',
      'rounded-lg',
      'shadow-md',
      'p-6',
      'hover:shadow-xl',
      'transition-shadow',
    ],

    // 使用函数（动态）
    'btn-color': ([, color]) => `bg-${color}-500 hover:bg-${color}-700 text-white`,
  },
})
```

```html
<!-- 使用快捷方式 -->
<button class="btn">默认按钮</button>
<button class="btn-green">绿色按钮</button>
<div class="card">卡片内容</div>
<button class="btn-color-red">红色按钮</button>
```

#### 图标支持

UnoCSS 的图标预设是杀手级特性：

```bash
# 安装
npm i -D @unocss/preset-icons @iconify-json/[collection-name]

# 或安装所有图标集（不推荐，体积大）
npm i -D @iconify/json
```

```typescript
// uno.config.ts
import { defineConfig, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetIcons({
      scale: 1.2, // 缩放
      warn: true, // 警告缺失的图标
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
})
```

```html
<!-- 使用图标 -->
<div class="i-carbon-sun"></div>
<div class="i-mdi-github text-2xl"></div>
<div class="i-heroicons-outline-home text-blue-500"></div>

<!-- 自定义颜色和大小 -->
<div class="i-carbon-user text-red-500 text-3xl"></div>

<!-- 在按钮中使用 -->
<button class="flex items-center gap-2">
  <div class="i-carbon-save"></div>
  <span>保存</span>
</button>
```

**常用图标集：**

- `@iconify-json/carbon` - Carbon Design
- `@iconify-json/mdi` - Material Design Icons
- `@iconify-json/heroicons` - Heroicons
- `@iconify-json/tabler` - Tabler Icons
- `@iconify-json/lucide` - Lucide Icons

### 配置示例

```typescript
// uno.config.ts
import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  // 预设
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/',
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'Inter:400,600,800',
        mono: 'Fira Code',
      },
    }),
  ],

  // 快捷方式
  shortcuts: {
    'btn': 'px-4 py-2 rounded inline-block bg-blue-500 text-white cursor-pointer hover:bg-blue-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50',
    'btn-sm': 'text-sm px-3 py-1',
    'btn-lg': 'text-lg px-6 py-3',
    'card': 'bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow',
    'input': 'border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500',
  },

  // 自定义规则
  rules: [
    // 自定义规则：m-<num>px -> margin: <num>px
    [/^m-(\d+)px$/, ([, d]) => ({ margin: `${d}px` })],

    // 自定义规则：grid-<num> -> grid-template-columns: repeat(<num>, 1fr)
    [/^grid-(\d+)$/, ([, d]) => ({ 'grid-template-columns': `repeat(${d}, 1fr)` })],

    // 自定义规则：text-shadow
    ['text-shadow', { 'text-shadow': '0 2px 4px rgba(0,0,0,0.1)' }],
  ],

  // 主题
  theme: {
    colors: {
      primary: {
        DEFAULT: '#3490dc',
        dark: '#2779bd',
      },
      secondary: '#ffed4e',
    },
    breakpoints: {
      xs: '320px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },

  // 转换器
  transformers: [
    transformerDirectives(), // 启用 @apply, @screen 等指令
    transformerVariantGroup(), // 启用变体组功能
  ],

  // 安全列表（始终包含这些类）
  safelist: [
    'i-carbon-sun',
    'i-carbon-moon',
  ],

  // 提取器配置
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
      ],
    },
  },
})
```

**Vite 项目中使用：**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    UnoCSS(),
  ],
})
```

```typescript
// main.ts
import 'virtual:uno.css'
```

### 代码示例

```html
<!-- 基础示例 -->
<div class="
  flex items-center justify-between
  p-4 m-2
  bg-gradient-to-r from-blue-500 to-purple-500
  rounded-lg shadow-lg
  hover:(shadow-2xl scale-105)
  transition-all duration-300
">
  <span class="text-white font-bold">UnoCSS Card</span>
  <div class="i-carbon-arrow-right text-white text-2xl"></div>
</div>

<!-- 属性化模式 -->
<div
  flex="~ col md:row"
  items="center"
  justify="between"
  p="4"
  bg="white dark:gray-800"
  border="~ gray-200 dark:gray-700"
  rounded="lg"
  shadow="md hover:xl"
  transition="all duration-300"
>
  <h3 text="xl" font="bold" class="dark:text-white">标题</h3>
  <button
    px="4"
    py="2"
    bg="blue-500 hover:blue-700"
    text="white"
    rounded
    transition="colors"
  >
    点击
  </button>
</div>

<!-- 使用快捷方式 -->
<div class="card">
  <h2 class="text-2xl font-bold mb-4">卡片标题</h2>
  <p class="text-gray-600 mb-4">卡片内容</p>
  <button class="btn">按钮</button>
</div>

<!-- 图标示例 -->
<div class="flex gap-4 text-2xl">
  <div class="i-carbon-sun text-yellow-500"></div>
  <div class="i-carbon-moon text-blue-500"></div>
  <div class="i-mdi-github text-gray-800"></div>
  <div class="i-heroicons-outline-home text-green-500"></div>
</div>

<!-- 响应式网格 -->
<div class="
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
  gap-4 p-4
">
  <div class="card">卡片 1</div>
  <div class="card">卡片 2</div>
  <div class="card">卡片 3</div>
</div>

<!-- 变体组复杂示例 -->
<div class="
  group
  relative overflow-hidden
  bg-white
  rounded-xl
  shadow-lg
  transition-all duration-300
  hover:(shadow-2xl scale-105)
  dark:(bg-gray-800 border border-gray-700)
">
  <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
  <div class="relative p-6">
    <div class="flex items-center gap-3 mb-4">
      <div class="i-carbon-data-vis-4 text-3xl text-blue-500"></div>
      <h3 class="text-xl font-bold dark:text-white">数据可视化</h3>
    </div>
    <p class="text-gray-600 dark:text-gray-300">
      使用 UnoCSS 快速构建美观的界面
    </p>
  </div>
</div>
```

### 优缺点分析

**优点：**

1. **性能极佳**
   - 启动速度快 5-200 倍（相比 Tailwind JIT）
   - 热更新速度极快
   - 按需生成，零额外开销

2. **体积极小**
   - 核心包不到 5KB
   - 只生成使用的样式
   - 无运行时依赖

3. **灵活性极强**
   - 完全可编程的 API
   - 自定义规则简单
   - 支持任意预设组合

4. **图标集成优秀**
   - 内置图标预设
   - 支持 100+ 图标库
   - 使用简单，按需加载

5. **属性化模式**
   - HTML 更清晰
   - 更好的可读性
   - 可选功能，不强制使用

6. **工具生态**
   - VS Code 插件支持
   - DevTools 支持
   - Inspector 工具

**缺点：**

1. **生态相对较小**
   - 社区规模小于 Tailwind
   - 第三方资源较少
   - 模板和示例不够丰富

2. **学习资源有限**
   - 中文文档相对较少
   - 教程和课程不多
   - 需要一定的学习成本

3. **配置复杂度**
   - 高度自定义需要配置
   - 自定义规则需要学习
   - 对新手不够友好

4. **团队采用风险**
   - 相对较新的项目
   - 团队熟悉度低
   - 可能需要培训

5. **兼容性考虑**
   - 需要构建工具支持
   - 某些老项目迁移成本高

## Tailwind CSS vs UnoCSS 对比

### 详细对比表格

| 特性 | Tailwind CSS | UnoCSS |
|------|-------------|--------|
| **性能** | 快（JIT 模式） | 极快（5-200 倍） |
| **启动时间** | 1-3 秒 | <100ms |
| **热更新速度** | 快 | 极快（几乎即时） |
| **体积** | ~40KB（核心） | <5KB（核心） |
| **构建体积** | 按需生成，已优化 | 更小，极致优化 |
| **灵活性** | 通过配置扩展 | 完全可编程 |
| **自定义规则** | 支持，通过插件 | 原生支持，更简单 |
| **预设系统** | 固定框架 | 可组合预设 |
| **生态系统** | 非常成熟 | 快速发展中 |
| **插件数量** | 100+ 官方和社区插件 | 20+ 预设和插件 |
| **社区规模** | 超大 | 中等 |
| **学习曲线** | 中等 | 中等到陡峭 |
| **文档质量** | 优秀 | 良好 |
| **中文文档** | 完善 | 基本完善 |
| **VS Code 支持** | 官方插件，功能完善 | 官方插件，功能丰富 |
| **图标支持** | 需要第三方库 | 内置，100+ 图标集 |
| **属性化模式** | 不支持 | 原生支持 |
| **变体组** | 不支持 | 原生支持 |
| **快捷方式** | 通过 @apply | 原生配置 |
| **框架支持** | Vue/React/Angular/Svelte | Vue/React/Angular/Svelte |
| **构建工具** | PostCSS | Vite/Webpack/Rollup |
| **配置文件** | tailwind.config.js | uno.config.ts |
| **TypeScript** | 类型支持 | 原生 TS，类型完善 |
| **运行时** | 无 | 无 |
| **兼容性** | 可从 v2 升级到 v3 | 向后兼容 |
| **迁移难度** | 中等（从其他框架） | 简单（从 Tailwind） |
| **团队采用** | 广泛采用，风险低 | 新兴技术，需评估 |
| **企业支持** | Tailwind Labs | 开源社区 |
| **更新频率** | 稳定更新 | 活跃更新 |
| **稳定性** | 非常稳定 | 稳定 |
| **浏览器支持** | 现代浏览器 | 现代浏览器 |
| **SSR 支持** | 完善 | 完善 |
| **价格** | 免费（UI 库收费） | 完全免费 |

### 性能对比

```
冷启动时间：
Tailwind JIT: ~1000ms
UnoCSS:       ~50ms

热更新时间：
Tailwind JIT: ~50ms
UnoCSS:       ~5ms

构建时间（1000个组件）：
Tailwind:     ~3s
UnoCSS:       ~0.5s

最终 CSS 体积：
Tailwind:     ~15KB (gzipped)
UnoCSS:       ~12KB (gzipped)
```

### 如何选择

#### 适合使用 Tailwind 的场景

1. **大型企业项目**
   - 需要稳定可靠的解决方案
   - 团队已熟悉 Tailwind
   - 有大量现有 Tailwind 资源

2. **需要丰富生态**
   - 需要大量第三方插件
   - 使用 Tailwind UI 等商业产品
   - 需要大量社区模板

3. **团队技能考虑**
   - 团队成员熟悉 Tailwind
   - 不想投入学习成本
   - 需要快速上手

4. **长期维护项目**
   - 需要长期技术支持
   - 担心新技术的稳定性
   - 企业风险控制要求

5. **现有项目迁移**
   - 已有 Tailwind 项目
   - 迁移成本高
   - 不急于优化性能

#### 适合使用 UnoCSS 的场景

1. **性能敏感项目**
   - 需要极致的构建性能
   - 大型应用，组件数量多
   - 开发体验要求高

2. **高度定制需求**
   - 需要自定义大量规则
   - 设计系统复杂
   - 需要灵活的配置

3. **新项目**
   - 从零开始的项目
   - 可以尝试新技术
   - 团队愿意学习

4. **需要图标集成**
   - 大量使用图标
   - 需要多个图标库
   - 希望简化图标使用

5. **Vue 生态**
   - Vue 3 项目
   - Vite 构建工具
   - Nuxt 3 项目

6. **追求极致优化**
   - 对体积和性能有极致要求
   - 喜欢探索新技术
   - 技术驱动的团队

#### 决策流程图

```
开始
├─ 是否为新项目？
│  ├─ 是 → 团队愿意学习新技术？
│  │      ├─ 是 → 考虑 UnoCSS
│  │      └─ 否 → 使用 Tailwind
│  └─ 否 → 已使用 Tailwind？
│         ├─ 是 → 性能是否是瓶颈？
│         │      ├─ 是 → 评估迁移到 UnoCSS
│         │      └─ 否 → 继续使用 Tailwind
│         └─ 否 → 需要快速上手？
│                ├─ 是 → 使用 Tailwind
│                └─ 否 → 对比选择
```

## 原子化 CSS 最佳实践

### 组件抽象

虽然原子化 CSS 提倡直接在 HTML 中使用工具类，但在实际项目中，我们仍然需要组件抽象来避免重复。

#### 1. 使用组件框架

```vue
<!-- Button.vue -->
<template>
  <button
    :class="[
      'px-4 py-2 rounded font-semibold transition-colors',
      variantClasses[variant],
      sizeClasses[size],
      disabled && 'opacity-50 cursor-not-allowed'
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  disabled: Boolean
})

const variantClasses = {
  primary: 'bg-blue-500 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-500 hover:bg-gray-700 text-white',
  danger: 'bg-red-500 hover:bg-red-700 text-white'
}

const sizeClasses = {
  sm: 'text-sm px-3 py-1',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-6 py-3'
}
</script>

<!-- 使用 -->
<Button variant="primary" size="lg">大号主按钮</Button>
<Button variant="danger" size="sm" disabled>小号禁用按钮</Button>
```

#### 2. 使用 @apply 指令

```css
/* components.css */
@layer components {
  .btn {
    @apply px-4 py-2 rounded font-semibold transition-colors;
  }

  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-700 text-white;
  }

  .btn-secondary {
    @apply bg-gray-500 hover:bg-gray-700 text-white;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow;
  }

  .input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  }
}
```

```html
<!-- 使用抽象后的类 -->
<button class="btn btn-primary">主按钮</button>
<div class="card">卡片内容</div>
<input type="text" class="input" placeholder="输入框">
```

#### 3. 使用快捷方式（UnoCSS）

```typescript
// uno.config.ts
export default defineConfig({
  shortcuts: {
    // 按钮系列
    'btn-base': 'px-4 py-2 rounded font-semibold transition-colors cursor-pointer',
    'btn-primary': 'btn-base bg-blue-500 hover:bg-blue-700 text-white',
    'btn-secondary': 'btn-base bg-gray-500 hover:bg-gray-700 text-white',

    // 输入框
    'input-base': 'w-full px-3 py-2 border rounded-md focus:outline-none transition-colors',
    'input-normal': 'input-base border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
    'input-error': 'input-base border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200',

    // 布局
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',

    // 卡片
    'card': 'bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow',
  }
})
```

### 与组件库结合

#### 1. 自定义组件库主题

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // 品牌色
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  },
  // 如果使用 Element Plus 等组件库
  content: [
    './src/**/*.{vue,js,ts}',
    './node_modules/element-plus/**/*.{js,ts,vue}', // 扫描组件库
  ],
}
```

#### 2. 包装组件库组件

```vue
<!-- MyButton.vue -->
<template>
  <el-button
    :class="customClasses"
    v-bind="$attrs"
  >
    <slot />
  </el-button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  customStyle: String
})

const customClasses = computed(() => {
  return [
    'shadow-md hover:shadow-lg transition-all',
    props.customStyle
  ]
})
</script>
```

#### 3. 混合使用策略

```vue
<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- 使用组件库 -->
    <el-form class="bg-white rounded-lg shadow-md p-6">
      <!-- 用 Tailwind 增强样式 -->
      <el-form-item class="mb-6">
        <el-input
          class="focus:ring-2 focus:ring-blue-500 rounded-md"
          placeholder="请输入"
        />
      </el-form-item>

      <!-- 完全自定义的按钮 -->
      <button class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
        提交
      </button>
    </el-form>
  </div>
</template>
```

### 性能优化

#### 1. 按需加载

```js
// tailwind.config.js
module.exports = {
  // 只扫描需要的文件
  content: [
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './public/index.html',
    // 不扫描 node_modules（除非必要）
  ],

  // 生产环境优化
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: ['./src/**/*.{vue,js,ts,jsx,tsx}'],
  },
}
```

#### 2. 使用 PurgeCSS

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    process.env.NODE_ENV === 'production' &&
      require('@fullhuman/postcss-purgecss')({
        content: ['./src/**/*.{vue,js,ts,jsx,tsx}'],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
      })
  ]
}
```

#### 3. 代码分割

```js
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router'],
          'ui': ['element-plus'],
        }
      }
    }
  }
}
```

#### 4. 懒加载样式

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// 异步加载重组件
const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)
</script>
```

#### 5. 避免过度嵌套

```html
<!-- 不推荐：过度嵌套 -->
<div class="flex">
  <div class="w-full">
    <div class="p-4">
      <div class="text-center">
        内容
      </div>
    </div>
  </div>
</div>

<!-- 推荐：扁平化 -->
<div class="flex w-full p-4 text-center">
  内容
</div>
```

#### 6. 使用生产构建

```bash
# 开发环境
npm run dev

# 生产构建
npm run build

# 构建分析
npm run build -- --report
```

#### 7. 监控和优化

```js
// 使用 webpack-bundle-analyzer
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
    })
  ]
}
```

