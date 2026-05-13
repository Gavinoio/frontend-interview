# 性能优化面试题精选

> 汇总加载性能、运行时性能、构建优化、CDN、性能监控等高频面试题。

## 性能指标

::: details 1. 前端核心性能指标有哪些？
**Core Web Vitals（Google 核心指标）：**

| 指标 | 全称 | 含义 | 良好阈值 |
|------|------|------|---------|
| LCP | Largest Contentful Paint | 最大内容绘制时间 | ≤ 2.5s |
| FID | First Input Delay | 首次输入延迟 | ≤ 100ms |
| CLS | Cumulative Layout Shift | 累积布局偏移 | ≤ 0.1 |
| INP | Interaction to Next Paint | 交互到下一帧绘制（替代 FID） | ≤ 200ms |

**其他重要指标：**
- **FCP**（First Contentful Paint）：首次内容绘制，≤ 1.8s
- **TTFB**（Time to First Byte）：首字节时间，≤ 800ms
- **TTI**（Time to Interactive）：可交互时间

---
:::

::: details 2. 前端性能优化有哪些手段？
**加载阶段：**
- 资源压缩（Gzip/Brotli、代码压缩）
- 代码分割 + 路由懒加载
- 图片优化（WebP/AVIF、懒加载、响应式图片）
- HTTP 缓存策略（强缓存 + 协商缓存）
- CDN 加速
- 预加载（preload/prefetch/dns-prefetch）
- HTTP/2 多路复用

**渲染阶段：**
- 减少重排重绘（批量 DOM 操作、transform 代替 top/left）
- 虚拟列表（长列表优化）
- 防抖/节流
- Web Worker（耗时计算移出主线程）
- requestAnimationFrame（动画优化）

**构建阶段：**
- Tree Shaking（删除未使用代码）
- 代码分割（按路由/按需）
- 持久化缓存（文件名 hash）

---
:::

## 加载性能

::: details 3. 图片优化有哪些方案？
1. **格式选择**：WebP（比 JPEG 小 25-35%）、AVIF（更小）、SVG（图标/矢量）
2. **懒加载**：`loading="lazy"` 或 IntersectionObserver
3. **响应式图片**：`srcset` + `sizes` 按屏幕分辨率加载合适尺寸
4. **压缩**：构建时用 imagemin 压缩
5. **CDN 图片处理**：按需裁剪、格式转换
6. **预加载关键图片**：`<link rel="preload" as="image">`

---
:::

::: details 4. 代码分割和懒加载如何实现？
```javascript
// React 路由懒加载
const Home = lazy(() => import('./pages/Home'));

// Vue 路由懒加载
const routes = [
    { path: '/', component: () => import('./pages/Home.vue') }
];

// Webpack 魔法注释（命名 chunk）
const Chart = () => import(/* webpackChunkName: "chart" */ './Chart');

// Vite 自动代码分割（基于 ES Module 动态导入）
```

**分割策略：**
- 按路由分割（最常用）
- 按功能模块分割（大型组件库）
- 第三方库单独打包（vendor chunk）

---
:::

::: details 5. 预加载指令 preload、prefetch、dns-prefetch 的区别？
| 指令 | 时机 | 优先级 | 用途 |
|------|------|--------|------|
| `preload` | 当前页面立即需要 | 高 | 关键字体、首屏 CSS/JS |
| `prefetch` | 未来页面可能需要 | 低（空闲时） | 下一页资源 |
| `dns-prefetch` | 提前解析 DNS | 极低 | 第三方域名 |
| `preconnect` | 提前建立连接 | 中 | 关键第三方服务 |

```html
<link rel="preload" href="font.woff2" as="font" crossorigin>
<link rel="prefetch" href="/next-page.js">
<link rel="dns-prefetch" href="//cdn.example.com">
<link rel="preconnect" href="https://api.example.com">
```

---
:::

::: details 6. 首屏优化有哪些方案？
1. **SSR/SSG**：服务端渲染，直接返回 HTML，减少白屏时间
2. **骨架屏**：占位 UI，提升感知性能
3. **关键 CSS 内联**：首屏 CSS 内联到 HTML，避免阻塞渲染
4. **减少首屏 JS 体积**：代码分割，只加载首屏需要的代码
5. **资源优先级**：`<link rel="preload">` 提前加载关键资源
6. **HTTP/2 Server Push**：服务端主动推送关键资源

---
:::

## 运行时性能

::: details 7. 如何优化长列表渲染？
**虚拟列表（Virtual Scrolling）**：只渲染可视区域内的节点。

```javascript
// 核心思路
const visibleCount = Math.ceil(containerHeight / itemHeight);
const startIndex = Math.floor(scrollTop / itemHeight);
const endIndex = startIndex + visibleCount;
const visibleItems = allItems.slice(startIndex, endIndex);
// 用 padding/transform 撑开滚动区域
```

**推荐库**：`react-window`、`react-virtual`、`vue-virtual-scroller`

**不定高列表**：预估高度 + 渲染后更新实际高度，用 Map 缓存已知高度。

---
:::

::: details 8. 防抖和节流的区别？各适用什么场景？
**防抖（Debounce）**：最后一次触发后延迟执行，期间重复触发会重置计时器。
- 适用：搜索框输入、窗口 resize 结束后、表单验证

**节流（Throttle）**：固定时间间隔内最多执行一次。
- 适用：滚动事件、鼠标移动、按钮防重复点击

```javascript
// 防抖
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// 节流（时间戳版）
function throttle(fn, interval) {
    let lastTime = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastTime >= interval) {
            lastTime = now;
            fn.apply(this, args);
        }
    };
}
```

---
:::

::: details 9. 什么是时间切片（Time Slicing）？
将耗时任务拆分为小片段，利用 `requestIdleCallback` 或 `MessageChannel` 在浏览器空闲时执行，避免阻塞主线程。

```javascript
function processInChunks(items, chunkSize = 100) {
    let index = 0;
    function processChunk() {
        const end = Math.min(index + chunkSize, items.length);
        for (; index < end; index++) {
            process(items[index]);
        }
        if (index < items.length) {
            requestIdleCallback(processChunk); // 空闲时继续
        }
    }
    requestIdleCallback(processChunk);
}
```

React 的 Fiber 架构本质上就是时间切片的实现。

---
:::

## 构建优化

::: details 10. 什么是 Tree Shaking？如何确保它生效？
Tree Shaking 基于 ES Module 的静态分析，在构建时删除未被引用的代码（dead code）。

**生效条件：**
1. 使用 ES Module（`import/export`），不能用 CommonJS（`require`）
2. 生产模式构建（Webpack `mode: 'production'`）
3. 第三方库支持 ESM（`package.json` 中有 `module` 字段）

**配置 `sideEffects`：**
```json
// package.json
{
  "sideEffects": false,          // 所有文件无副作用，可安全 tree-shake
  "sideEffects": ["*.css", "*.scss"]  // 仅这些文件有副作用
}
```

---
:::

::: details 11. Webpack 和 Vite 的构建优化各有哪些手段？
**Webpack 优化：**
- `SplitChunksPlugin`：提取公共代码
- `TerserPlugin`：JS 压缩
- `CssMinimizerPlugin`：CSS 压缩
- `cache: { type: 'filesystem' }`：持久化缓存
- `thread-loader`：多线程构建
- `externals`：CDN 引入大型库，不打包

**Vite 优化：**
- `build.rollupOptions.output.manualChunks`：手动分包
- `build.minify: 'esbuild'`（默认，极快）
- `vite-plugin-compression`：Gzip/Brotli 压缩
- `@vitejs/plugin-legacy`：兼容旧浏览器

---
:::

## CDN

::: details 12. CDN 的工作原理是什么？
1. 用户请求资源 → DNS 解析到 GSLB（全局负载均衡）
2. GSLB 根据用户地理位置、节点负载，返回最近的 CDN 边缘节点 IP
3. 用户访问边缘节点：
   - **命中缓存**：直接返回
   - **未命中**：回源到源站获取，缓存后返回
4. 后续请求直接从边缘节点获取

**优势**：减少网络延迟、分担源站压力、提高可用性

---
:::

::: details 13. 静态资源如何配置 CDN 缓存策略？
```
JS/CSS（带 hash）：Cache-Control: max-age=31536000, immutable
  → 文件内容变化时 hash 变化，URL 变化，自动失效

HTML：Cache-Control: no-cache
  → 每次协商，确保获取最新入口文件

图片：Cache-Control: max-age=86400
  → 缓存一天，平衡新鲜度和性能
```

**文件指纹**：构建时在文件名中加入内容 hash（如 `app.a1b2c3.js`），实现长期缓存 + 自动更新。

---
:::

## 性能监控

::: details 14. 如何采集 Core Web Vitals 指标？
```javascript
import { onLCP, onFID, onCLS, onINP, onFCP, onTTFB } from 'web-vitals';

onLCP(metric => report(metric));
onFID(metric => report(metric));
onCLS(metric => report(metric));

function report({ name, value, rating }) {
    // rating: 'good' | 'needs-improvement' | 'poor'
    navigator.sendBeacon('/analytics', JSON.stringify({ name, value, rating }));
}
```

**Performance API 手动采集：**
```javascript
const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
        if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
        }
    });
});
observer.observe({ entryTypes: ['largest-contentful-paint'] });
```

---
:::

::: details 15. 前端错误监控如何实现？
```javascript
// JS 运行时错误
window.addEventListener('error', (e) => {
    report({ type: 'js', message: e.message, stack: e.error?.stack });
});

// Promise 未捕获错误
window.addEventListener('unhandledrejection', (e) => {
    report({ type: 'promise', message: e.reason?.message });
});

// 资源加载错误
window.addEventListener('error', (e) => {
    if (e.target instanceof HTMLImageElement || e.target instanceof HTMLScriptElement) {
        report({ type: 'resource', src: e.target.src });
    }
}, true); // 捕获阶段

// 数据上报（页面卸载时用 sendBeacon 保证发送）
window.addEventListener('beforeunload', () => {
    navigator.sendBeacon('/report', JSON.stringify(errorQueue));
});
```
:::
