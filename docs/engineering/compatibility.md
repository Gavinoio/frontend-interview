# 浏览器兼容性

## 概述

浏览器兼容性是前端开发中的重要课题，涉及 JavaScript、CSS 和 HTML 各个层面。本文详细介绍如何处理各种兼容性问题。

---

## JavaScript 兼容性

### 1. Babel 转译

Babel 是最常用的 JavaScript 编译器，可以将 ES6+ 代码转换为向后兼容的版本。

```bash
npm install @babel/core @babel/preset-env -D
```

**babel.config.js 配置：**

```javascript
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        // 目标浏览器
        targets: {
          browsers: [
            '> 1%',           // 全球使用率大于 1%
            'last 2 versions', // 最近两个版本
            'not dead',        // 仍在维护的浏览器
            'not ie 11'        // 排除 IE11
          ]
        },
        // 按需引入 polyfill
        useBuiltIns: 'usage',
        corejs: 3,
        // 保留 ES modules
        modules: false
      }
    ]
  ]
};
```

**targets 配置详解：**

```javascript
// 方式 1：browserslist 查询语法
targets: '> 0.25%, not dead'

// 方式 2：指定具体浏览器版本
targets: {
  chrome: '58',
  firefox: '60',
  safari: '11',
  edge: '16',
  ios: '10',
  android: '4.4'
}

// 方式 3：Node.js 环境
targets: {
  node: 'current'
}

// 方式 4：支持 IE
targets: {
  ie: '11'  // 需要大量 polyfill
}
```

### 2. Polyfill 策略

**core-js 按需引入：**

```javascript
// useBuiltIns: 'usage' - 自动检测并引入需要的 polyfill

// 源代码
const arr = [1, 2, 3];
arr.includes(2);

// 转换后自动引入
import 'core-js/modules/es.array.includes';
const arr = [1, 2, 3];
arr.includes(2);
```

**常见需要 polyfill 的特性：**

```javascript
// ES6+
Promise, Map, Set, Symbol, WeakMap, WeakSet
Array.from, Array.of, Array.prototype.includes
Object.assign, Object.entries, Object.values
String.prototype.includes, String.prototype.padStart

// ES2017+
async/await (需要 regenerator-runtime)
Object.getOwnPropertyDescriptors

// ES2018+
Promise.prototype.finally
Rest/Spread 属性
异步迭代器

// ES2019+
Array.prototype.flat, Array.prototype.flatMap
Object.fromEntries
String.prototype.trimStart, String.prototype.trimEnd

// ES2020+
Promise.allSettled
可选链 (?.)
空值合并 (??)
BigInt
```

**手动引入 polyfill：**

```javascript
// 方式 1：全量引入（不推荐，体积大）
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// 方式 2：按需引入
import 'core-js/features/promise';
import 'core-js/features/array/includes';

// 方式 3：CDN 动态加载
<script src="https://polyfill.io/v3/polyfill.min.js?features=Promise,Array.prototype.includes"></script>
```

### 3. 特性检测

```javascript
// 推荐：特性检测（Feature Detection）
if ('IntersectionObserver' in window) {
  // 使用 IntersectionObserver
  const observer = new IntersectionObserver(callback);
} else {
  // 降级方案：使用 scroll 事件
  window.addEventListener('scroll', handleScroll);
}

// 不推荐：浏览器检测（Browser Detection）
// ❌ 脆弱，可能被修改
if (navigator.userAgent.includes('Chrome')) {
  // ...
}
```

**常见特性检测：**

```javascript
// ES6+ 特性
const supportsES6 = () => {
  try {
    new Function('(a = 0) => a');
    return true;
  } catch (e) {
    return false;
  }
};

// Promise
const supportsPromise = typeof Promise !== 'undefined';

// Fetch API
const supportsFetch = typeof fetch === 'function';

// CSS Grid（通过 JS 检测）
const supportsGrid = CSS.supports('display', 'grid');

// Web Components
const supportsCustomElements = 'customElements' in window;

// Service Worker
const supportsSW = 'serviceWorker' in navigator;

// WebP 图片格式
async function supportsWebP() {
  const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  const img = new Image();
  return new Promise(resolve => {
    img.onload = img.onerror = () => resolve(img.height === 1);
    img.src = webpData;
  });
}
```

### 4. 常见 JS 兼容问题

```javascript
// 问题 1：箭头函数 this 绑定
// ES6
const obj = {
  name: 'test',
  getName: () => this.name  // this 不指向 obj
};

// 兼容写法
const obj = {
  name: 'test',
  getName: function() { return this.name; }
};

// 问题 2：可选链和空值合并
// ES2020
const value = obj?.prop?.nested ?? 'default';

// 兼容写法
const value = obj && obj.prop && obj.prop.nested || 'default';

// 问题 3：Array.prototype.at()
// ES2022
const last = arr.at(-1);

// 兼容写法
const last = arr[arr.length - 1];

// 问题 4：structuredClone
// 现代浏览器
const clone = structuredClone(obj);

// 兼容写法
const clone = JSON.parse(JSON.stringify(obj));
```

---

## CSS 兼容性

### 1. PostCSS 与 Autoprefixer

```bash
npm install postcss autoprefixer -D
```

**postcss.config.js：**

```javascript
module.exports = {
  plugins: [
    require('autoprefixer')({
      // 使用 browserslist 配置
    })
  ]
};
```

**自动添加前缀示例：**

```css
/* 源代码 */
.box {
  display: flex;
  user-select: none;
  backdrop-filter: blur(10px);
}

/* Autoprefixer 转换后 */
.box {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
  -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
}
```

### 2. CSS 特性检测

**@supports 查询：**

```css
/* 检测 Grid 支持 */
.container {
  display: flex;  /* 降级方案 */
}

@supports (display: grid) {
  .container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 检测 CSS 变量支持 */
.element {
  color: #333;  /* 降级 */
}

@supports (--custom: property) {
  .element {
    color: var(--text-color);
  }
}

/* 检测 backdrop-filter */
.modal {
  background: rgba(0, 0, 0, 0.8);  /* 降级 */
}

@supports (backdrop-filter: blur(10px)) {
  .modal {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
  }
}

/* 否定检测 */
@supports not (display: grid) {
  .container {
    /* 使用 flexbox 或 float 布局 */
  }
}
```

### 3. 常见 CSS 兼容问题

**Flexbox 兼容：**

```css
.flex-container {
  display: -webkit-box;      /* 旧版 iOS Safari */
  display: -ms-flexbox;      /* IE10 */
  display: flex;

  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;

  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;

  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}

/* flex 子项 */
.flex-item {
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
}
```

**Grid 降级：**

```css
.grid-container {
  /* 降级方案 */
  display: flex;
  flex-wrap: wrap;
}

.grid-item {
  width: 33.33%;  /* 3 列 */
}

/* Grid 方案 */
@supports (display: grid) {
  .grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .grid-item {
    width: auto;
  }
}
```

**CSS 变量降级：**

```css
:root {
  --primary-color: #007bff;
}

.button {
  /* 降级：直接写值 */
  background: #007bff;
  /* 支持 CSS 变量的浏览器会覆盖 */
  background: var(--primary-color);
}
```

**渐变兼容：**

```css
.gradient {
  /* 降级：纯色 */
  background: #007bff;
  /* 旧版 webkit */
  background: -webkit-linear-gradient(left, #007bff, #00ff88);
  /* 标准语法 */
  background: linear-gradient(to right, #007bff, #00ff88);
}
```

### 4. 移动端适配

**viewport 单位兼容：**

```css
.full-height {
  /* 降级 */
  height: 100vh;
  /* iOS Safari 兼容 */
  height: -webkit-fill-available;
  /* 现代浏览器 dvh */
  height: 100dvh;
}

/* 安全区域适配 (刘海屏) */
.fixed-bottom {
  padding-bottom: 20px;
  padding-bottom: constant(safe-area-inset-bottom); /* iOS < 11.2 */
  padding-bottom: env(safe-area-inset-bottom);      /* iOS >= 11.2 */
}
```

**1px 边框问题：**

```css
/* 问题：Retina 屏 1px 看起来很粗 */

/* 方案 1：使用 0.5px */
.border {
  border: 1px solid #eee;
}

@media (-webkit-min-device-pixel-ratio: 2) {
  .border {
    border-width: 0.5px;
  }
}

/* 方案 2：使用 transform */
.border-bottom {
  position: relative;
}

.border-bottom::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: #eee;
  transform: scaleY(0.5);
  transform-origin: 0 100%;
}

/* 方案 3：使用 box-shadow */
.border {
  box-shadow: 0 0 0 0.5px #eee;
}
```

---

## HTML 兼容性

### 1. HTML5 语义化标签

```html
<!-- IE8 及以下不识别 HTML5 标签 -->
<!--[if lt IE 9]>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.min.js"></script>
<![endif]-->

<!-- 或使用 JS 创建元素 -->
<script>
  document.createElement('header');
  document.createElement('nav');
  document.createElement('main');
  document.createElement('article');
  document.createElement('section');
  document.createElement('aside');
  document.createElement('footer');
</script>
```

### 2. 表单兼容

```html
<!-- placeholder 兼容 -->
<input type="text" placeholder="请输入" />
<script>
  // IE9 不支持 placeholder
  if (!('placeholder' in document.createElement('input'))) {
    // polyfill 处理
  }
</script>

<!-- 日期选择器兼容 -->
<input type="date" id="date" />
<script>
  // 检测是否支持
  const input = document.createElement('input');
  input.type = 'date';
  if (input.type !== 'date') {
    // 使用第三方日期选择器
  }
</script>
```

---

## 工程化配置

### 1. browserslist 配置

```json
// package.json
{
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead",
    "not ie <= 11"
  ]
}
```

```javascript
// .browserslistrc
# 注释
> 1%
last 2 versions
not dead
not ie <= 11

# 开发环境
[development]
last 1 chrome version
last 1 firefox version

# 生产环境
[production]
> 0.2%
not dead
not op_mini all
```

### 2. Vite 配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    legacy({
      // 需要兼容的浏览器
      targets: ['defaults', 'not IE 11'],
      // 为旧浏览器生成传统 chunks
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      // 现代浏览器的 polyfill
      modernPolyfills: true
    })
  ],
  build: {
    // ES2015 (ES6) 转换目标
    target: 'es2015',
    // CSS 兼容目标
    cssTarget: 'chrome80'
  }
});
```

### 3. Webpack 配置

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                useBuiltIns: 'usage',
                corejs: 3
              }]
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['autoprefixer']
              }
            }
          }
        ]
      }
    ]
  }
};
```

---

## 常见面试题

::: details 1. 如何支持旧版浏览器？
**JS 层面：**
- 使用 Babel 转译 ES6+ 语法
- 使用 core-js 或 polyfill.io 提供 polyfill
- 使用特性检测而非浏览器检测
- 配置合适的 browserslist

**CSS 层面：**
- 使用 Autoprefixer 添加前缀
- 使用 @supports 进行特性检测
- 提供降级方案
- 避免使用太新的 CSS 特性
:::

::: details 2. Babel 和 Polyfill 的区别？
```javascript
// Babel：语法转换
// 将新语法转换为旧语法
const fn = (a = 1) => a + 1;
// ↓ 转换为
var fn = function(a) {
  a = a === undefined ? 1 : a;
  return a + 1;
};

// Polyfill：API 补充
// 在运行时添加缺失的 API
// 如 Promise、Array.prototype.includes
// Polyfill 会修改原型或全局对象
```
:::

::: details 3. useBuiltIns 的三种模式？
```javascript
// 'false'：不引入 polyfill（默认）
// 需要手动引入 core-js

// 'entry'：在入口处全量引入
// 根据 targets 引入所有可能需要的 polyfill
import 'core-js/stable';
// ↓ 转换为很多具体的 import

// 'usage'：按需引入（推荐）
// 根据代码中实际使用的特性引入
const arr = [1, 2, 3].includes(1);
// ↓ 自动添加
import 'core-js/modules/es.array.includes';
```
:::

::: details 4. 如何检测用户浏览器是否支持某个特性？
```javascript
// JS 特性检测
function checkSupport() {
  return {
    promise: typeof Promise !== 'undefined',
    fetch: typeof fetch === 'function',
    intersectionObserver: 'IntersectionObserver' in window,
    webp: checkWebPSupport(),
    serviceWorker: 'serviceWorker' in navigator,
    cssGrid: CSS.supports('display', 'grid'),
    cssVariables: CSS.supports('--custom', 'value')
  };
}

// 动态加载 polyfill
async function loadPolyfills() {
  const polyfills = [];

  if (!('IntersectionObserver' in window)) {
    polyfills.push(
      import('intersection-observer')
    );
  }

  if (!('fetch' in window)) {
    polyfills.push(
      import('whatwg-fetch')
    );
  }

  await Promise.all(polyfills);
}
```

---
:::

## 总结

| 技术 | 作用 | 使用场景 |
|------|------|---------|
| Babel | JS 语法转换 | ES6+ 语法兼容 |
| core-js | JS API polyfill | 新 API 兼容 |
| Autoprefixer | CSS 前缀添加 | CSS 属性兼容 |
| @supports | CSS 特性检测 | 渐进增强 |
| browserslist | 目标浏览器配置 | 统一工具链配置 |
| @vitejs/plugin-legacy | Vite 旧浏览器支持 | 生产环境兼容 |
