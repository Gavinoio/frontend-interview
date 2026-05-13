# 加载性能优化

## 概述

加载性能直接影响用户体验和业务指标。研究表明，页面加载时间每增加1秒，转化率下降7%。

---

## 一、资源优化

### 1. JavaScript 优化

```javascript
// 1. 代码压缩 (Terser)
// webpack.config.js
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,      // 移除 console
            drop_debugger: true,     // 移除 debugger
            pure_funcs: ['console.log', 'console.info']
          },
          mangle: true,              // 混淆变量名
          output: {
            comments: false          // 移除注释
          }
        },
        parallel: true,              // 多线程压缩
        extractComments: false
      })
    ]
  }
}

// 2. Tree Shaking
// package.json
{
  "sideEffects": false  // 或指定有副作用的文件
}

// webpack.config.js
module.exports = {
  mode: 'production',  // 生产模式自动开启 Tree Shaking
  optimization: {
    usedExports: true
  }
}

// 确保使用 ES Modules 导出
// ✅ 可以 Tree Shaking
export function add(a, b) { return a + b }
export function subtract(a, b) { return a - b }

// ❌ 无法 Tree Shaking
module.exports = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b
}

// 3. 按需引入
// ❌ 引入整个库
import _ from 'lodash'

// ✅ 只引入需要的函数
import debounce from 'lodash/debounce'

// ✅ 使用 babel-plugin-import
// babel.config.js
module.exports = {
  plugins: [
    ['import', {
      libraryName: 'antd',
      libraryDirectory: 'es',
      style: 'css'
    }]
  ]
}
```

### 2. CSS 优化

```javascript
// 1. CSS 压缩
// webpack.config.js
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css'
    })
  ],
  optimization: {
    minimizer: [
      new CssMinimizerPlugin()
    ]
  }
}

// 2. 关键 CSS 内联
// 使用 critical 库提取关键 CSS
const critical = require('critical')

critical.generate({
  inline: true,
  base: 'dist/',
  src: 'index.html',
  target: 'index-critical.html',
  width: 1300,
  height: 900
})

// 3. CSS 代码分割
// Vue 单文件组件自动分割
// React 使用 loadable-components
import loadable from '@loadable/component'

const AsyncComponent = loadable(() => import('./Component'), {
  fallback: <div>Loading...</div>
})

// 4. 移除无用 CSS
// 使用 PurgeCSS
const PurgeCSSPlugin = require('purgecss-webpack-plugin')
const glob = require('glob')

module.exports = {
  plugins: [
    new PurgeCSSPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
      safelist: {
        standard: [/^ant-/]  // 保留 ant-design 样式
      }
    })
  ]
}
```

### 3. 图片优化

```javascript
// 1. 图片压缩
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|webp)$/,
        use: [
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                quality: 65,
                progressive: true
              },
              pngquant: {
                quality: [0.65, 0.90],
                speed: 4
              },
              webp: {
                quality: 75
              }
            }
          }
        ]
      }
    ]
  }
}

// 2. 使用 WebP 格式
<picture>
  <source type="image/webp" srcset="image.webp">
  <source type="image/jpeg" srcset="image.jpg">
  <img src="image.jpg" alt="description">
</picture>

// 3. 响应式图片
<img
  srcset="
    image-320w.jpg 320w,
    image-480w.jpg 480w,
    image-800w.jpg 800w
  "
  sizes="
    (max-width: 320px) 280px,
    (max-width: 480px) 440px,
    800px
  "
  src="image-800w.jpg"
  alt="description"
>

// 4. 小图片 Base64 内联
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024  // 8KB 以下转 Base64
          }
        }
      }
    ]
  }
}

// 5. 雪碧图
// 使用 webpack-spritesmith
const SpritesmithPlugin = require('webpack-spritesmith')

module.exports = {
  plugins: [
    new SpritesmithPlugin({
      src: {
        cwd: path.resolve(__dirname, 'src/icons'),
        glob: '*.png'
      },
      target: {
        image: path.resolve(__dirname, 'src/assets/sprite.png'),
        css: path.resolve(__dirname, 'src/assets/sprite.css')
      }
    })
  ]
}
```

### 4. 字体优化

```css
/* 1. 字体文件格式优先级 */
@font-face {
  font-family: 'MyFont';
  src: url('myfont.woff2') format('woff2'),   /* 最优 */
       url('myfont.woff') format('woff'),
       url('myfont.ttf') format('truetype');
  font-display: swap;  /* 字体加载策略 */
}

/* 2. 字体子集化 */
/* 只包含需要的字符 */
/* 使用 fonttools 或在线工具生成子集 */
@font-face {
  font-family: 'MyFont';
  src: url('myfont-subset.woff2') format('woff2');
  unicode-range: U+4E00-9FFF;  /* 中文字符范围 */
}

/* 3. 预加载关键字体 */
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>

/* 4. font-display 选项 */
/*
  - auto: 浏览器默认行为
  - block: 短时间隐藏文本,然后显示后备字体
  - swap: 立即显示后备字体,字体加载后替换
  - fallback: 短时间不显示,显示后备字体,有限时间内替换
  - optional: 只有快速加载才使用自定义字体
*/
```

---

## 二、代码分割

### 1. 路由懒加载

```javascript
// Vue Router
const routes = [
  {
    path: '/home',
    component: () => import(/* webpackChunkName: "home" */ './views/Home.vue')
  },
  {
    path: '/about',
    component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
  },
  {
    path: '/dashboard',
    component: () => import(
      /* webpackChunkName: "dashboard" */
      /* webpackPrefetch: true */
      './views/Dashboard.vue'
    )
  }
]

// React Router
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

### 2. 组件懒加载

```vue
<!-- Vue 异步组件 -->
<script setup>
import { defineAsyncComponent } from 'vue'

// 基础用法
const AsyncComp = defineAsyncComponent(() =>
  import('./components/AsyncComp.vue')
)

// 高级用法
const AsyncCompWithOptions = defineAsyncComponent({
  loader: () => import('./components/HeavyComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,        // 显示 loading 前的延迟
  timeout: 10000,    // 超时时间
  suspensible: false
})
</script>

<template>
  <AsyncComp />
  <AsyncCompWithOptions />
</template>
```

```jsx
// React 懒加载
import React, { lazy, Suspense } from 'react'

// 基础用法
const LazyComponent = lazy(() => import('./LazyComponent'))

// 带命名导出的组件
const LazyNamedComponent = lazy(() =>
  import('./Module').then(module => ({
    default: module.NamedComponent
  }))
)

// 使用
function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  )
}

// 使用 @loadable/component (支持 SSR)
import loadable from '@loadable/component'

const LoadableComponent = loadable(() => import('./Component'), {
  fallback: <Loading />,
  timeout: 10000
})
```

### 3. Webpack 分包策略

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,          // 最小 20KB 才分割
      minChunks: 1,            // 被引用次数
      maxAsyncRequests: 30,    // 最大并行请求数
      maxInitialRequests: 30,
      cacheGroups: {
        // 第三方库
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          chunks: 'initial'
        },
        // UI 库单独打包
        antd: {
          test: /[\\/]node_modules[\\/]antd[\\/]/,
          name: 'antd',
          priority: 20
        },
        // 工具库
        utils: {
          test: /[\\/]node_modules[\\/](lodash|moment|dayjs)[\\/]/,
          name: 'utils',
          priority: 15
        },
        // 公共模块
        common: {
          minChunks: 2,
          name: 'common',
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },
    // 运行时代码单独打包
    runtimeChunk: {
      name: 'runtime'
    }
  }
}

// Vite 分包
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['element-plus'],
          'utils': ['lodash-es', 'dayjs']
        }
      }
    }
  }
}
```

---

## 三、缓存策略

### 1. HTTP 缓存

```javascript
// Nginx 配置
server {
    location / {
        # HTML 不缓存
        if ($request_filename ~* \.html$) {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
    }

    # 静态资源强缓存 (带 hash)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 接口
    location /api/ {
        add_header Cache-Control "no-cache";
    }
}

// Express 设置缓存头
app.use('/static', express.static('public', {
  maxAge: '1y',           // 强缓存 1 年
  immutable: true,
  etag: true
}))

app.get('/api/*', (req, res, next) => {
  res.set('Cache-Control', 'no-cache')
  next()
})
```

### 2. 文件指纹

```javascript
// webpack.config.js
module.exports = {
  output: {
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js'
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css'
    })
  ]
}

// 哈希类型:
// - [hash]: 整个项目的 hash,任何文件改变都会变
// - [chunkhash]: 基于 chunk 的 hash,同一 chunk 的文件 hash 相同
// - [contenthash]: 基于文件内容的 hash,推荐使用
```

### 3. Service Worker 缓存

```javascript
// sw.js
const CACHE_NAME = 'v1'
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js',
  '/images/logo.png'
]

// 安装
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  )
})

// 激活
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    })
  )
})

// 请求拦截
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 缓存命中
        if (response) {
          return response
        }

        // 请求网络
        return fetch(event.request)
          .then((response) => {
            // 检查响应是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // 克隆响应
            const responseToCache = response.clone()

            // 缓存响应
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
      })
  )
})

// 使用 Workbox (推荐)
// workbox-config.js
module.exports = {
  globDirectory: 'dist/',
  globPatterns: ['**/*.{html,js,css,png,jpg,svg}'],
  swDest: 'dist/sw.js',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\./,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 300
        }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60  // 30 天
        }
      }
    }
  ]
}
```

---

## 四、预加载与预连接

### 1. 资源预加载

```html
<!-- preload: 当前页面需要的关键资源 -->
<link rel="preload" href="critical.js" as="script">
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="hero.jpg" as="image">
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>

<!-- prefetch: 下一个页面可能需要的资源 -->
<link rel="prefetch" href="next-page.js" as="script">

<!-- prerender: 预渲染整个页面 -->
<link rel="prerender" href="https://example.com/next-page">
```

```javascript
// 动态预加载
function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = resolve
    img.onerror = reject
    img.src = src
  })
}

// 预加载下一页资源
function preloadNextPage(path) {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = path
  link.as = 'document'
  document.head.appendChild(link)
}

// Vue Router 预加载
router.beforeResolve((to, from, next) => {
  // 预加载目标路由的组件
  const matched = router.resolve(to).matched
  const componentsToPreload = matched
    .filter(record => typeof record.components.default === 'function')
    .map(record => record.components.default())

  Promise.all(componentsToPreload)
  next()
})

// Webpack 魔法注释
const Component = () => import(
  /* webpackPrefetch: true */
  /* webpackPreload: true */
  /* webpackChunkName: "my-component" */
  './MyComponent.vue'
)
```

### 2. DNS 预解析与预连接

```html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//api.example.com">
<link rel="dns-prefetch" href="//cdn.example.com">
<link rel="dns-prefetch" href="//analytics.example.com">

<!-- 预连接 (DNS + TCP + TLS) -->
<link rel="preconnect" href="https://api.example.com">
<link rel="preconnect" href="https://cdn.example.com" crossorigin>
```

```javascript
// 动态预连接
function preconnect(url) {
  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = url
  link.crossOrigin = 'anonymous'
  document.head.appendChild(link)
}

// 在空闲时预连接
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    preconnect('https://api.example.com')
    preconnect('https://cdn.example.com')
  })
}
```

---

## 五、CDN 加速

### 1. 静态资源 CDN

```javascript
// webpack.config.js
module.exports = {
  output: {
    publicPath: process.env.NODE_ENV === 'production'
      ? 'https://cdn.example.com/assets/'
      : '/'
  }
}

// vite.config.js
export default {
  base: process.env.NODE_ENV === 'production'
    ? 'https://cdn.example.com/'
    : '/'
}
```

### 2. 第三方库 CDN

```html
<!-- 使用 CDN 加载第三方库 -->
<script src="https://cdn.jsdelivr.net/npm/vue@3.3.4/dist/vue.global.prod.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vue-router@4.2.4/dist/vue-router.global.prod.js"></script>
```

```javascript
// webpack externals 配置
module.exports = {
  externals: {
    vue: 'Vue',
    'vue-router': 'VueRouter',
    axios: 'axios',
    lodash: '_'
  }
}

// html-webpack-plugin 注入 CDN
new HtmlWebpackPlugin({
  template: './index.html',
  cdn: {
    css: [],
    js: [
      'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js',
      'https://cdn.jsdelivr.net/npm/vue-router@4/dist/vue-router.global.prod.js'
    ]
  }
})

// index.html
<!DOCTYPE html>
<html>
<head>
  <% for (var i in htmlWebpackPlugin.options.cdn.css) { %>
    <link href="<%= htmlWebpackPlugin.options.cdn.css[i] %>" rel="stylesheet">
  <% } %>
</head>
<body>
  <div id="app"></div>
  <% for (var i in htmlWebpackPlugin.options.cdn.js) { %>
    <script src="<%= htmlWebpackPlugin.options.cdn.js[i] %>"></script>
  <% } %>
</body>
</html>
```

### 3. CDN 容灾

```javascript
// CDN 降级方案
const cdnUrls = {
  vue: [
    'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js',
    'https://unpkg.com/vue@3/dist/vue.global.prod.js',
    'https://cdnjs.cloudflare.com/ajax/libs/vue/3.3.4/vue.global.prod.min.js'
  ]
}

async function loadWithFallback(name) {
  const urls = cdnUrls[name]

  for (const url of urls) {
    try {
      await loadScript(url)
      console.log(`Loaded ${name} from ${url}`)
      return
    } catch (error) {
      console.warn(`Failed to load ${name} from ${url}`)
    }
  }

  throw new Error(`Failed to load ${name} from all CDN sources`)
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}
```

---

## 六、服务端优化

### 1. Gzip/Brotli 压缩

```javascript
// Nginx 配置
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml application/json
           application/javascript application/xml+rss
           application/atom+xml image/svg+xml;

# Brotli 压缩 (需要 nginx-brotli 模块)
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css text/xml application/json
             application/javascript application/xml+rss
             application/atom+xml image/svg+xml;

// Webpack 预压缩
const CompressionPlugin = require('compression-webpack-plugin')

module.exports = {
  plugins: [
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,  // 10KB 以上才压缩
      minRatio: 0.8
    }),
    new CompressionPlugin({
      filename: '[path][base].br',
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ]
}
```

### 2. HTTP/2

```javascript
// Nginx 配置 HTTP/2
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 服务端推送
    location / {
        http2_push /css/style.css;
        http2_push /js/app.js;
    }
}

// HTTP/2 优势:
// 1. 多路复用 - 单个连接多个请求
// 2. 头部压缩 - HPACK 压缩
// 3. 服务端推送 - 主动推送资源
// 4. 二进制传输 - 更高效
```

### 3. 边缘计算 (Edge)

```javascript
// Cloudflare Workers 示例
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const cache = caches.default
  let response = await cache.match(request)

  if (!response) {
    response = await fetch(request)

    // 缓存到边缘节点
    if (response.ok) {
      const responseClone = response.clone()
      event.waitUntil(cache.put(request, responseClone))
    }
  }

  return response
}

// Vercel Edge Functions
export const config = {
  runtime: 'edge'
}

export default async function handler(request) {
  // 在边缘节点执行
  return new Response('Hello from Edge!')
}
```

---

## 七、首屏优化实战

### 1. 骨架屏

```vue
<!-- SkeletonScreen.vue -->
<template>
  <div class="skeleton">
    <div class="skeleton-header">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-title"></div>
    </div>
    <div class="skeleton-content">
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  padding: 20px;
}

.skeleton-avatar,
.skeleton-title,
.skeleton-line {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.skeleton-title {
  width: 200px;
  height: 20px;
  margin-left: 20px;
}

.skeleton-line {
  height: 16px;
  margin: 10px 0;
}

.skeleton-line.short {
  width: 60%;
}
</style>

<!-- 使用 -->
<template>
  <SkeletonScreen v-if="loading" />
  <div v-else>
    <!-- 实际内容 -->
  </div>
</template>
```

### 2. SSR/SSG

```javascript
// Nuxt 3 SSR
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true,
  nitro: {
    prerender: {
      routes: ['/about', '/contact']
    }
  }
})

// Next.js SSR
export async function getServerSideProps(context) {
  const data = await fetchData()

  return {
    props: { data }
  }
}

// Next.js SSG
export async function getStaticProps() {
  const data = await fetchData()

  return {
    props: { data },
    revalidate: 60  // ISR: 60秒后重新生成
  }
}

// Vite SSR
// entry-server.js
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'

export async function render(url) {
  const app = createSSRApp(App)
  const html = await renderToString(app)
  return html
}
```

### 3. 性能监控

```javascript
// 监控 LCP
new PerformanceObserver((list) => {
  const entries = list.getEntries()
  const lastEntry = entries[entries.length - 1]

  console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime)

  // 上报
  reportMetric('LCP', lastEntry.renderTime || lastEntry.loadTime)
}).observe({ entryTypes: ['largest-contentful-paint'] })

// 监控 FCP
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name === 'first-contentful-paint') {
      console.log('FCP:', entry.startTime)
      reportMetric('FCP', entry.startTime)
    }
  }
}).observe({ entryTypes: ['paint'] })

// 完整的性能监控
class PerformanceMonitor {
  constructor() {
    this.metrics = {}
    this.init()
  }

  init() {
    this.observeLCP()
    this.observeFCP()
    this.observeFID()
    this.observeCLS()
    this.observeNavigation()
  }

  observeLCP() {
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime
    }).observe({ entryTypes: ['largest-contentful-paint'] })
  }

  observeFCP() {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime
        }
      }
    }).observe({ entryTypes: ['paint'] })
  }

  observeFID() {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.metrics.fid = entry.processingStart - entry.startTime
      }
    }).observe({ entryTypes: ['first-input'] })
  }

  observeCLS() {
    let clsValue = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
      this.metrics.cls = clsValue
    }).observe({ entryTypes: ['layout-shift'] })
  }

  observeNavigation() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.timing

        this.metrics.ttfb = timing.responseStart - timing.requestStart
        this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart
        this.metrics.load = timing.loadEventEnd - timing.navigationStart
      }, 0)
    })
  }

  report() {
    console.log('Performance Metrics:', this.metrics)
    // 上报到监控系统
  }
}

const monitor = new PerformanceMonitor()
window.addEventListener('beforeunload', () => {
  monitor.report()
})
```

---

## 常见面试题

::: details 1. 首屏加载慢如何优化?
<details>
<summary>点击查看答案</summary>

**优化策略:**

1. **资源优化**
   - 代码压缩 (JS/CSS/HTML)
   - Tree Shaking
   - 图片优化 (WebP、压缩、懒加载)

2. **加载优化**
   - 路由懒加载
   - 组件懒加载
   - 代码分割 (splitChunks)
   - 预加载关键资源 (preload)

3. **缓存优化**
   - HTTP 缓存策略
   - Service Worker
   - 文件指纹 (contenthash)

4. **网络优化**
   - CDN 加速
   - Gzip/Brotli 压缩
   - HTTP/2
   - DNS 预解析

5. **渲染优化**
   - SSR/SSG
   - 骨架屏
   - 关键 CSS 内联

6. **监控分析**
   - Lighthouse 审计
   - 性能监控
   - 用户体验指标
:::

</details>

::: details 2. 如何实现按需加载?
<details>
<summary>点击查看答案</summary>

```javascript
// 1. 路由懒加载
const routes = [
  {
    path: '/home',
    component: () => import('./views/Home.vue')
  }
]

// 2. 组件懒加载
const AsyncComponent = defineAsyncComponent(() =>
  import('./components/AsyncComponent.vue')
)

// 3. 第三方库按需引入
import debounce from 'lodash/debounce'  // 而非 import _ from 'lodash'

// 4. 条件加载
if (needFeature) {
  const module = await import('./feature')
  module.init()
}

// 5. Webpack 魔法注释
const Component = () => import(
  /* webpackChunkName: "my-chunk" */
  /* webpackPrefetch: true */
  './Component.vue'
)
```
:::

---

</details>

## 总结

::: details 加载优化清单
**资源层面:**
- [ ] JavaScript 压缩和 Tree Shaking
- [ ] CSS 压缩和无用代码移除
- [ ] 图片压缩和格式优化 (WebP)
- [ ] 字体子集化

**加载层面:**
- [ ] 代码分割和懒加载
- [ ] 预加载关键资源
- [ ] DNS 预解析
- [ ] CDN 加速

**缓存层面:**
- [ ] HTTP 强缓存和协商缓存
- [ ] Service Worker
- [ ] 文件指纹

**服务器层面:**
- [ ] Gzip/Brotli 压缩
- [ ] HTTP/2
- [ ] SSR/SSG
:::
