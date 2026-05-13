# 性能优化

## 概述

性能优化是前端工程师必须掌握的核心能力之一。面试中会重点考察你对**性能指标**、**优化手段**、**监控方案**的理解和实践经验。

## 性能指标

### Core Web Vitals (核心 Web 指标)

Google 提出的三个核心指标:

| 指标 | 全称 | 含义 | 目标值 |
|------|------|------|--------|
| **LCP** | Largest Contentful Paint | 最大内容绘制时间 | < 2.5s |
| **FID** | First Input Delay | 首次输入延迟 | < 100ms |
| **CLS** | Cumulative Layout Shift | 累积布局偏移 | < 0.1 |

### 其他重要指标

- **FCP** (First Contentful Paint): 首次内容绘制
- **TTI** (Time to Interactive): 可交互时间
- **TBT** (Total Blocking Time): 总阻塞时间
- **FPS** (Frames Per Second): 帧率

## 优化策略分类

### 1. 加载性能优化
- 资源优化(压缩、合并、CDN)
- 懒加载和预加载
- HTTP 缓存策略
- 代码分割
- 服务端渲染(SSR)

### 2. 运行时性能优化
- 虚拟列表
- 防抖和节流
- 减少重排重绘
- Web Worker
- requestAnimationFrame

### 3. 构建优化
- Tree Shaking
- 压缩和混淆
- 图片优化
- 依赖分析
- 打包体积分析

---

## 加载性能优化

### 资源压缩

```javascript
// Webpack 配置
module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      // JS 压缩
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,  // 移除 console
            pure_funcs: ['console.log']
          }
        }
      }),

      // CSS 压缩
      new CssMinimizerPlugin()
    ]
  },

  // Gzip 压缩
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,  // 10KB 以上才压缩
      minRatio: 0.8
    })
  ]
};
```

### 代码分割

```javascript
// 1. 路由懒加载
const routes = [
  {
    path: '/home',
    component: () => import('./views/Home.vue')  // 动态导入
  },
  {
    path: '/about',
    component: () => import('./views/About.vue')
  }
];

// 2. 组件懒加载
const HeavyComponent = defineAsyncComponent(() =>
  import('./components/HeavyComponent.vue')
);

// 3. 动态导入
button.addEventListener('click', async () => {
  const module = await import('./heavy-module.js');
  module.doSomething();
});

// 4. Webpack 魔法注释
import(
  /* webpackChunkName: "my-chunk" */
  /* webpackPrefetch: true */
  './module.js'
);
```

### 图片优化

```javascript
// 1. 图片懒加载
<img
  src="placeholder.jpg"
  data-src="real-image.jpg"
  class="lazy"
/>

<script>
const images = document.querySelectorAll('.lazy');

const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      imageObserver.unobserve(img);
    }
  });
});

images.forEach(img => imageObserver.observe(img));
</script>

// 2. 响应式图片
<picture>
  <source media="(min-width: 1200px)" srcset="large.jpg">
  <source media="(min-width: 768px)" srcset="medium.jpg">
  <img src="small.jpg" alt="responsive image">
</picture>

// 3. WebP 格式
<picture>
  <source type="image/webp" srcset="image.webp">
  <source type="image/jpeg" srcset="image.jpg">
  <img src="image.jpg" alt="image">
</picture>

// 4. 图片压缩配置
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: [
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: { quality: 65 },
              pngquant: { quality: [0.65, 0.90] }
            }
          }
        ]
      }
    ]
  }
};
```

### CDN 加速

```javascript
// 1. 静态资源 CDN
module.exports = {
  output: {
    publicPath: 'https://cdn.example.com/'
  }
};

// 2. 第三方库使用 CDN
<script src="https://cdn.jsdelivr.net/npm/vue@3.3.4/dist/vue.global.js"></script>

// Webpack 配置
module.exports = {
  externals: {
    vue: 'Vue',
    'vue-router': 'VueRouter'
  }
};
```

---

## 运行时性能优化

### 虚拟列表

```vue
<template>
  <div class="virtual-list" @scroll="handleScroll">
    <div class="list-phantom" :style="{ height: totalHeight + 'px' }"></div>
    <div class="list-content" :style="{ transform: `translateY(${offset}px)` }">
      <div
        v-for="item in visibleData"
        :key="item.id"
        class="list-item"
        :style="{ height: itemHeight + 'px' }"
      >
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  data: Array,
  itemHeight: { type: Number, default: 50 },
  visibleCount: { type: Number, default: 20 }
});

const scrollTop = ref(0);

// 总高度
const totalHeight = computed(() => props.data.length * props.itemHeight);

// 起始索引
const startIndex = computed(() => Math.floor(scrollTop.value / props.itemHeight));

// 结束索引
const endIndex = computed(() => startIndex.value + props.visibleCount);

// 可见数据
const visibleData = computed(() =>
  props.data.slice(startIndex.value, endIndex.value)
);

// 偏移量
const offset = computed(() => startIndex.value * props.itemHeight);

function handleScroll(e) {
  scrollTop.value = e.target.scrollTop;
}
</script>
```

### 防抖和节流

```javascript
// 防抖: 延迟执行,多次触发只执行最后一次
function debounce(fn, delay = 300) {
  let timer = null;

  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 使用场景: 搜索输入
const search = debounce((keyword) => {
  console.log('搜索:', keyword);
}, 500);

input.addEventListener('input', (e) => search(e.target.value));

// 节流: 固定时间内只执行一次
function throttle(fn, delay = 300) {
  let lastTime = 0;

  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

// 使用场景: 滚动事件
const handleScroll = throttle(() => {
  console.log('滚动位置:', window.scrollY);
}, 200);

window.addEventListener('scroll', handleScroll);
```

### 减少重排重绘

```javascript
// ❌ 多次重排重绘
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.style.width = '100px';
  div.style.height = '100px';
  document.body.appendChild(div);
}

// ✅ 批量操作,减少重排
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.style.width = '100px';
  div.style.height = '100px';
  fragment.appendChild(div);
}
document.body.appendChild(fragment);

// ✅ 使用 transform 代替 top/left
// ❌ 触发重排
element.style.left = '100px';

// ✅ 只触发重绘
element.style.transform = 'translateX(100px)';

// ✅ 读写分离
// ❌ 读写交替,触发强制重排
div.style.width = div.offsetWidth + 10 + 'px';
div.style.height = div.offsetHeight + 10 + 'px';

// ✅ 先读后写
const width = div.offsetWidth;
const height = div.offsetHeight;
div.style.width = width + 10 + 'px';
div.style.height = height + 10 + 'px';
```

### requestAnimationFrame

```javascript
// ❌ 使用 setInterval
let left = 0;
setInterval(() => {
  left += 1;
  element.style.left = left + 'px';
}, 16);

// ✅ 使用 requestAnimationFrame
let left = 0;
function animate() {
  left += 1;
  element.style.left = left + 'px';

  if (left < 100) {
    requestAnimationFrame(animate);
  }
}
requestAnimationFrame(animate);
```

---

## 性能监控

### Performance API

```javascript
// 1. 获取性能指标
const perfData = window.performance.timing;

const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
const firstPaintTime = perfData.responseEnd - perfData.fetchStart;

console.log('页面加载时间:', pageLoadTime);
console.log('DOM 解析时间:', domReadyTime);

// 2. 监控资源加载
const resources = window.performance.getEntriesByType('resource');
resources.forEach(resource => {
  console.log(`${resource.name}: ${resource.duration}ms`);
});

// 3. 监控 FCP、LCP
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('LCP:', entry.renderTime || entry.loadTime);
  }
}).observe({ entryTypes: ['largest-contentful-paint'] });

// 4. 自定义性能标记
performance.mark('start');
// ... 执行代码
performance.mark('end');
performance.measure('操作耗时', 'start', 'end');

const measures = performance.getEntriesByType('measure');
console.log(measures[0].duration);
```

### 错误监控

```javascript
// 全局错误捕获
window.addEventListener('error', (event) => {
  console.error('错误:', event.error);

  // 上报错误
  fetch('/api/log', {
    method: 'POST',
    body: JSON.stringify({
      message: event.error.message,
      stack: event.error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent
    })
  });
});

// Promise 错误捕获
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 错误:', event.reason);
});

// Vue 错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue 错误:', err, info);
};
```

---

## 实战案例

### 首屏优化

```javascript
// 1. 关键 CSS 内联
<style>
  /* 首屏关键样式内联到 HTML */
  .header { ... }
  .hero { ... }
</style>

// 2. 预加载关键资源
<link rel="preload" href="critical.js" as="script">
<link rel="preload" href="hero-image.jpg" as="image">

// 3. DNS 预解析
<link rel="dns-prefetch" href="https://api.example.com">

// 4. 骨架屏
<div class="skeleton">
  <div class="skeleton-header"></div>
  <div class="skeleton-content"></div>
</div>

// 5. SSR 服务端渲染
// server.js
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';

app.get('*', async (req, res) => {
  const app = createSSRApp({...});
  const html = await renderToString(app);
  res.send(`
    <!DOCTYPE html>
    <html>
      <body>
        <div id="app">${html}</div>
        <script src="/client.js"></script>
      </body>
    </html>
  `);
});
```

### 长列表优化

```javascript
// 1. 分页加载
const pageSize = 20;
let currentPage = 1;

async function loadMore() {
  const data = await fetchData(currentPage, pageSize);
  list.value.push(...data);
  currentPage++;
}

// 2. 无限滚动
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadMore();
  }
});

observer.observe(loadMoreTrigger);

// 3. 虚拟滚动(见上文虚拟列表)
```

---

## 总结

### 优化清单

**加载优化**:
- ✅ 资源压缩(Gzip、Brotli)
- ✅ 代码分割和懒加载
- ✅ 图片优化(WebP、懒加载、CDN)
- ✅ HTTP 缓存(强缓存、协商缓存)
- ✅ 预加载、预连接

**运行时优化**:
- ✅ 虚拟列表
- ✅ 防抖节流
- ✅ 减少重排重绘
- ✅ 使用 Web Worker
- ✅ requestAnimationFrame

**构建优化**:
- ✅ Tree Shaking
- ✅ 压缩和混淆
- ✅ 打包分析
- ✅ 按需引入

**监控**:
- ✅ Performance API
- ✅ 错误监控
- ✅ 用户行为追踪

### 面试加分项
- 有实际的性能优化案例和数据对比
- 了解性能指标的具体含义
- 能手写虚拟列表、防抖节流等工具
- 熟悉性能监控工具(Lighthouse、WebPageTest)

---

