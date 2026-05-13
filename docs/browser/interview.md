# 浏览器原理面试题精选

> 汇总浏览器渲染、事件循环、缓存、存储、Observer API、PWA、Web Workers 等高频面试题。

## 渲染原理

### 1. 浏览器的完整渲染流程是什么？

```
HTML 解析 → DOM 树
CSS 解析  → CSSOM 树
              ↓
         合并 → 渲染树（Render Tree）
              ↓
         布局（Layout）：计算位置和尺寸
              ↓
         绘制（Paint）：填充像素
              ↓
         合成（Composite）：GPU 合并图层
```

**关键点：**
- `<script>` 会阻塞 HTML 解析（用 `defer`/`async` 避免）
- CSS 不阻塞 DOM 解析，但阻塞渲染（CSSOM 构建完才能合并渲染树）
- 图片等资源异步加载，不阻塞解析

---

### 2. 重排（Reflow）和重绘（Repaint）的区别？如何优化？

**重排**：元素几何属性变化（位置、尺寸），需要重新计算布局，代价高。
触发：改变 `width/height/margin/padding`、DOM 增删、字体大小、读取 `offsetWidth` 等。

**重绘**：元素外观变化但不影响布局，代价低。
触发：改变 `color/background/visibility`。

**重排一定触发重绘，重绘不一定触发重排。**

**优化：**
```javascript
// ❌ 多次触发重排
el.style.width = '100px';
el.style.height = '100px';

// ✅ 批量修改
el.style.cssText = 'width: 100px; height: 100px;';
// 或用 class
el.classList.add('new-style');

// ✅ 用 transform 代替 top/left（不触发重排，走合成层）
el.style.transform = 'translate(100px, 100px)';

// ✅ 读写分离，避免强制同步布局
const width = el.offsetWidth; // 先读
el.style.width = width + 10 + 'px'; // 再写
```

---

### 3. 什么是合成层？哪些属性会触发 GPU 加速？

合成层由 GPU 单独处理，不影响其他层，动画性能最好。

**触发合成层的属性：**
- `transform`（translate/rotate/scale）
- `opacity`
- `filter`
- `will-change: transform`

**注意**：过多合成层会占用大量 GPU 内存，不要滥用 `will-change`。

---

## 事件循环

### 4. 什么是事件循环（Event Loop）？执行顺序是什么？

JavaScript 单线程，通过事件循环处理异步任务。

**执行顺序：**
```
同步代码（Call Stack）
    ↓ 清空
微任务队列（全部执行）
    ↓ 清空
渲染（如需要）
    ↓
宏任务（取一个执行）
    ↓
微任务队列（全部执行）
    ↓ 循环...
```

**微任务**（优先级高）：`Promise.then/catch/finally`、`async/await`、`queueMicrotask`、`MutationObserver`

**宏任务**：`setTimeout`、`setInterval`、`setImmediate`（Node）、I/O、UI 渲染

---

### 5. 经典题：输出顺序

```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve()
    .then(() => console.log('3'))
    .then(() => console.log('4'));

console.log('5');

// 输出：1 5 3 4 2
```

**解析：** 同步 `1 5` → 微任务 `3 4` → 宏任务 `2`

---

### 6. async/await 在事件循环中的位置？

```javascript
async function fn() {
    console.log('A');
    await Promise.resolve();
    console.log('B'); // await 后的代码 = Promise.then 回调（微任务）
}

console.log('1');
fn();
console.log('2');

// 输出：1 A 2 B
```

`await` 后的代码相当于 `Promise.then` 的回调，进入微任务队列。

---

## 浏览器缓存

### 7. 强缓存和协商缓存的区别？

**强缓存**（命中时不发请求，状态码 200）：
- `Cache-Control: max-age=3600`（相对时间，优先级高）
- `Expires`（绝对时间，已过时）

**协商缓存**（发请求验证，未变化返回 304）：
- `ETag` / `If-None-Match`：内容哈希，精确（优先级高）
- `Last-Modified` / `If-Modified-Since`：修改时间，精度到秒

**缓存位置优先级**：Service Worker → Memory Cache（Tab 内） → Disk Cache → Push Cache

---

### 8. 如何设置不同资源的缓存策略？

```
HTML 文件：Cache-Control: no-cache（每次协商，确保获取最新入口）
JS/CSS（带 hash）：Cache-Control: max-age=31536000, immutable（永久缓存）
图片：Cache-Control: max-age=86400（缓存一天）
API 接口：Cache-Control: no-store（不缓存）
```

---

## 浏览器存储

### 9. Cookie、localStorage、sessionStorage、IndexedDB 的区别？

| 特性 | Cookie | localStorage | sessionStorage | IndexedDB |
|------|--------|-------------|----------------|-----------|
| 大小 | 4KB | 5-10MB | 5-10MB | 几百MB+ |
| 生命周期 | 可设置过期时间 | 永久 | 标签页关闭清除 | 永久 |
| 随请求发送 | ✅ | ❌ | ❌ | ❌ |
| 作用域 | 同源 + 路径 | 同源 | 同源 + 同标签页 | 同源 |
| 适用场景 | 认证 Token | 用户偏好 | 临时表单数据 | 大量结构化数据 |

---

### 10. Cookie 的重要属性有哪些？

```
HttpOnly：禁止 JS 访问（防 XSS 窃取）
Secure：仅 HTTPS 传输
SameSite=Strict/Lax/None：控制跨站携带（防 CSRF）
Domain：指定可访问的域名
Path：指定可访问的路径
Expires/Max-Age：过期时间
```

---

## Observer API

### 11. IntersectionObserver 有什么用？

监听元素与视口（或指定容器）的交叉状态，异步触发，性能好。

**常见应用：**
- 图片懒加载
- 无限滚动
- 曝光埋点（广告可见性统计）
- 滚动动画触发

```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.src = entry.target.dataset.src; // 懒加载
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 }); // 10% 可见时触发

document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
```

---

### 12. MutationObserver、ResizeObserver、PerformanceObserver 各有什么用？

| Observer | 监听内容 | 典型用途 |
|----------|---------|---------|
| `MutationObserver` | DOM 结构/属性变化 | 监听第三方 DOM 变化、富文本编辑器 |
| `ResizeObserver` | 元素尺寸变化 | 响应式组件、图表自适应 |
| `PerformanceObserver` | 性能指标（LCP、FID 等） | 性能监控、Core Web Vitals |
| `IntersectionObserver` | 元素可见性 | 懒加载、曝光统计 |

---

## Web Workers

### 13. Web Workers 的三种类型和使用场景？

| 类型 | 关系 | 适用场景 |
|------|------|---------|
| Dedicated Worker | 一对一 | CPU 密集型计算（图像处理、加密） |
| Shared Worker | 多页面共享 | 跨标签页共享数据 |
| Service Worker | 代理网络请求 | 离线缓存、PWA、请求拦截 |

**Worker 限制：** 不能访问 DOM、`window`、`document`，可以使用 `fetch`、`IndexedDB`、`WebSocket`。

**通信方式：** `postMessage` / `onmessage`，传递数据会被结构化克隆（深拷贝）。

---

## PWA

### 14. PWA 的核心特性是什么？

1. **可安装**：通过 Web App Manifest 配置，可添加到主屏幕
2. **离线可用**：Service Worker 缓存资源，断网可访问
3. **推送通知**：Push API + Notification API
4. **后台同步**：Background Sync API

**必要条件：** HTTPS + 有效的 manifest.json + 注册 Service Worker

---

### 15. Service Worker 的生命周期？

```
注册（register）
    ↓
安装（install）：缓存静态资源
    ↓
激活（activate）：清理旧缓存
    ↓
运行（fetch/push/sync）：拦截请求、处理推送
```

**更新机制：** 新 SW 安装后等待旧 SW 控制的页面全部关闭才激活，可用 `skipWaiting()` 强制激活。

---

## 综合题

### 16. 从输入 URL 到页面显示，发生了什么？

1. **URL 解析**：解析协议、域名、路径、参数
2. **DNS 解析**：浏览器缓存 → OS 缓存 → 本地 DNS → 递归查询
3. **TCP 三次握手**：建立连接
4. **TLS 握手**（HTTPS）：证书验证、密钥协商
5. **发送 HTTP 请求**
6. **服务器响应**：返回 HTML
7. **浏览器解析渲染**：
   - 解析 HTML → DOM 树
   - 解析 CSS → CSSOM 树
   - 合并 → 渲染树 → 布局 → 绘制 → 合成
8. **加载子资源**：JS/CSS/图片等
9. **执行 JS**，触发 DOMContentLoaded / load 事件

---

### 17. 浏览器的多进程架构是什么？

现代浏览器（Chrome）采用多进程架构：

| 进程 | 职责 |
|------|------|
| 浏览器主进程 | UI、地址栏、书签、网络请求协调 |
| 渲染进程（每个 Tab） | HTML/CSS/JS 解析渲染，沙箱隔离 |
| GPU 进程 | 处理 GPU 任务，合成图层 |
| 网络进程 | 网络请求 |
| 插件进程 | 浏览器插件 |

**优势：** 一个 Tab 崩溃不影响其他 Tab；安全沙箱隔离。
