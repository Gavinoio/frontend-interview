# 浏览器渲染原理

## 概述

**官方定义**: 浏览器渲染是指浏览器将 HTML、CSS 和 JavaScript 代码转换为用户可以看到并与之交互的网页的过程。

**通俗理解**: 浏览器渲染就像是一个工厂流水线，HTML 提供骨架，CSS 提供装饰，JavaScript 提供动态交互，最终在屏幕上绘制出你看到的网页。

## 渲染流程详解

### 完整渲染流程

```
URL → 网络请求 → HTML解析 → DOM树
                     ↓
              CSS解析 → CSSOM树
                     ↓
             DOM + CSSOM → 渲染树(Render Tree)
                     ↓
              Layout(布局/回流)
                     ↓
              Paint(绘制/重绘)
                     ↓
              Composite(合成)
                     ↓
              显示到屏幕
```

### 1. 构建 DOM 树

浏览器解析 HTML 文档，将其转换为 DOM（Document Object Model）树。

```javascript
// HTML 转换为 DOM 的过程
/*
字节 → 字符 → Token → Node → DOM

HTML:
<html>
  <head>
    <title>Page</title>
  </head>
  <body>
    <div class="container">
      <p>Hello</p>
    </div>
  </body>
</html>

DOM Tree:
document
└── html
    ├── head
    │   └── title
    │       └── "Page"
    └── body
        └── div.container
            └── p
                └── "Hello"
*/

// DOM 解析是增量的
// 解析器遇到 script 标签时会暂停（除非是 async/defer）
```

### 2. 构建 CSSOM 树

浏览器解析 CSS，构建 CSSOM（CSS Object Model）树。

```javascript
// CSS 转换为 CSSOM 的过程
/*
CSS:
body { font-size: 16px; }
.container { width: 100%; }
p { color: blue; }

CSSOM Tree:
document.styleSheets
└── CSSStyleSheet
    └── cssRules
        ├── body { font-size: 16px }
        ├── .container { width: 100% }
        └── p { color: blue }
*/

// CSSOM 构建会阻塞渲染
// 因为需要完整的样式信息才能正确渲染

// 可以通过以下方式优化：
// 1. 内联关键 CSS
// 2. 异步加载非关键 CSS
// 3. 减少 CSS 选择器复杂度
```

### 3. 构建渲染树（Render Tree）

将 DOM 和 CSSOM 合并，创建渲染树。

```javascript
/*
渲染树特点：
1. 只包含需要显示的节点
2. display: none 的元素不会出现在渲染树中
3. visibility: hidden 的元素会出现在渲染树中
4. head、script、meta 等元素不会出现

DOM Tree + CSSOM Tree → Render Tree

Render Tree 结构：
RenderObject
├── RenderBlock (body)
│   └── RenderBlock (div.container)
│       └── RenderInline (p)
│           └── RenderText ("Hello")
*/

// visibility: hidden vs display: none
// display: none - 不在渲染树中，不占空间
// visibility: hidden - 在渲染树中，占空间但不可见
```

### 4. Layout（布局/回流）

计算渲染树中每个节点的精确位置和大小。

```javascript
/*
布局计算内容：
1. 元素的位置（x, y 坐标）
2. 元素的尺寸（width, height）
3. 元素的边距（margin, padding, border）
4. 元素之间的相对位置

布局是一个递归过程：
1. 从根节点开始
2. 遍历子节点
3. 计算每个节点的几何信息
4. 累积到父节点
*/

// 触发回流的操作
const triggers = {
  // 1. 改变元素的几何属性
  geometric: [
    'width', 'height', 'padding', 'margin', 'border',
    'top', 'left', 'right', 'bottom',
    'font-size', 'line-height'
  ],

  // 2. 获取布局信息（强制同步布局）
  layout: [
    'offsetTop', 'offsetLeft', 'offsetWidth', 'offsetHeight',
    'scrollTop', 'scrollLeft', 'scrollWidth', 'scrollHeight',
    'clientTop', 'clientLeft', 'clientWidth', 'clientHeight',
    'getComputedStyle()', 'getBoundingClientRect()'
  ],

  // 3. DOM 结构变化
  dom: [
    '添加/删除元素',
    '改变元素位置',
    '改变元素内容'
  ]
}

// 回流一定会触发重绘，但重绘不一定触发回流
```

### 5. Paint（绘制/重绘）

将渲染树中的每个节点转换成屏幕上的实际像素。

```javascript
/*
绘制过程：
1. 背景颜色
2. 背景图片
3. 边框
4. 子元素
5. 轮廓

绘制是分层的，主要分为：
1. 普通图层
2. 合成图层（GPU加速）
*/

// 触发重绘的操作（不改变布局）
const repaintTriggers = [
  'color',
  'background-color',
  'background-image',
  'visibility',
  'border-color',
  'border-style',
  'border-radius',
  'outline',
  'box-shadow',
  'opacity'
]

// 优化：某些属性只触发合成，不触发重绘
const compositeOnly = [
  'transform',
  'opacity',
  'filter'
]
```

### 6. Composite（合成）

将多个绘制层合并成最终的屏幕图像。

```javascript
/*
合成层的优势：
1. 合成层由 GPU 处理
2. 不会触发回流和重绘
3. 动画更流畅

创建合成层的条件：
1. transform: translateZ(0) 或 translate3d()
2. will-change: transform
3. video, canvas, iframe 元素
4. position: fixed
5. 有 3D transform 的后代元素
6. 有合成层后代的元素
*/

// 创建合成层的方法
const element = document.querySelector('.animated')

// 方法1: 3D 变换
element.style.transform = 'translateZ(0)'

// 方法2: will-change
element.style.willChange = 'transform'

// 注意：过多合成层会消耗内存
// Chrome DevTools → Layers 面板可以查看合成层
```

## 回流与重绘优化

### 减少回流

```javascript
// 1. 批量修改样式
// Bad - 触发多次回流
element.style.width = '100px'
element.style.height = '100px'
element.style.margin = '10px'

// Good - 触发一次回流
element.style.cssText = 'width: 100px; height: 100px; margin: 10px'
// 或者使用 class
element.className = 'new-style'

// 2. 批量修改 DOM
// Bad - 每次插入都触发回流
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div')
  document.body.appendChild(div)
}

// Good - 使用 DocumentFragment
const fragment = document.createDocumentFragment()
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div')
  fragment.appendChild(div)
}
document.body.appendChild(fragment)

// 3. 避免强制同步布局
// Bad - 强制同步布局
function resizeAllParagraphs() {
  const paragraphs = document.querySelectorAll('p')
  for (let p of paragraphs) {
    p.style.width = box.offsetWidth + 'px' // 每次循环都读取 offsetWidth
  }
}

// Good - 先读取，后写入
function resizeAllParagraphs() {
  const paragraphs = document.querySelectorAll('p')
  const width = box.offsetWidth // 只读取一次
  for (let p of paragraphs) {
    p.style.width = width + 'px'
  }
}

// 4. 使用绝对定位脱离文档流
// 对于动画元素，使用 position: absolute/fixed
// 可以减少对其他元素的影响

// 5. 使用 transform 代替 top/left
// Bad - 触发回流
element.style.left = '100px'

// Good - 只触发合成
element.style.transform = 'translateX(100px)'
```

### 使用 requestAnimationFrame

```javascript
// requestAnimationFrame 在下一次重绘之前执行
// 可以批量处理 DOM 操作，减少重绘次数

// Bad - 可能在一帧内触发多次重绘
window.addEventListener('scroll', () => {
  element.style.top = window.scrollY + 'px'
})

// Good - 使用 rAF 优化
let ticking = false
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      element.style.top = window.scrollY + 'px'
      ticking = false
    })
    ticking = true
  }
})

// 动画示例
function animate() {
  // 更新动画状态
  element.style.transform = `translateX(${position}px)`
  position += 1

  if (position < 500) {
    requestAnimationFrame(animate)
  }
}
requestAnimationFrame(animate)
```

### CSS 动画优化

```css
/* 使用 GPU 加速的属性 */
.optimized-animation {
  /* 触发合成层，GPU 加速 */
  will-change: transform, opacity;

  /* 使用 transform 而不是改变位置 */
  transform: translateX(100px);

  /* 使用 opacity 而不是 visibility */
  opacity: 0.5;
}

/* 动画使用 transform */
@keyframes slide {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100px);
  }
}

/* 避免在动画中使用这些属性 */
.avoid-in-animation {
  /* 这些会触发回流 */
  width: 100px;
  height: 100px;
  margin: 10px;
  padding: 10px;
  left: 100px;
  top: 100px;
}
```

## 关键渲染路径优化

### 优化策略

```html
<!-- 1. 优化 CSS 加载 -->
<!-- 关键 CSS 内联 -->
<head>
  <style>
    /* 首屏关键样式 */
    .hero { ... }
    .nav { ... }
  </style>
  <!-- 非关键 CSS 异步加载 -->
  <link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
</head>

<!-- 2. 优化 JavaScript 加载 -->
<!-- defer: 并行下载，DOMContentLoaded 之前执行 -->
<script defer src="app.js"></script>

<!-- async: 并行下载，下载完立即执行 -->
<script async src="analytics.js"></script>

<!-- 3. 预加载关键资源 -->
<link rel="preload" href="critical.js" as="script">
<link rel="preload" href="hero.jpg" as="image">

<!-- 4. 预连接第三方域名 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://analytics.example.com">
```

### 资源加载时序

```javascript
/*
资源加载优先级（从高到低）：

1. HTML
2. CSS（阻塞渲染）
3. 同步 JavaScript（阻塞解析）
4. 预加载资源
5. 图片
6. async/defer JavaScript
7. prefetch 资源

阻塞关系：
1. CSS 阻塞渲染（但不阻塞 DOM 解析）
2. JavaScript 阻塞 DOM 解析（除非 async/defer）
3. JavaScript 执行需要等待 CSSOM 构建完成

优化目标：
1. 减少关键资源数量
2. 减小关键资源大小
3. 缩短关键路径长度
*/

// 检测首次内容绘制时间
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name === 'first-contentful-paint') {
      console.log('FCP:', entry.startTime)
    }
  }
})
observer.observe({ entryTypes: ['paint'] })

// 关键性能指标
const metrics = {
  // FCP - 首次内容绘制
  FCP: 'first-contentful-paint',
  // LCP - 最大内容绘制
  LCP: 'largest-contentful-paint',
  // FID - 首次输入延迟
  FID: 'first-input-delay',
  // CLS - 累积布局偏移
  CLS: 'cumulative-layout-shift',
  // TTI - 可交互时间
  TTI: 'time-to-interactive',
  // TTFB - 首字节时间
  TTFB: 'time-to-first-byte'
}
```

## 图层与合成

### 图层类型

```javascript
/*
1. 普通图层（Paint Layer）
   - 默认情况下，元素在普通图层
   - 回流/重绘会影响整个图层

2. 合成图层（Compositing Layer）
   - 由 GPU 独立处理
   - transform/opacity 动画只需要合成，非常高效
*/

// 查看元素是否创建合成层
// Chrome DevTools → More tools → Layers

// 创建合成层的方式
const compositeStyles = {
  // 显式创建
  willChange: 'transform',
  transform: 'translateZ(0)',
  transform: 'translate3d(0, 0, 0)',

  // 隐式创建
  backfaceVisibility: 'hidden',
  perspective: 1000,

  // 特定元素
  // video, canvas, iframe
}

// 合成层过多的问题
/*
1. 每个合成层都需要额外内存
2. 层爆炸（Layer Explosion）会导致性能问题
3. 使用 will-change 时要谨慎
*/

// 最佳实践
// 只对需要动画的元素使用 will-change
element.addEventListener('mouseenter', () => {
  element.style.willChange = 'transform'
})
element.addEventListener('animationend', () => {
  element.style.willChange = 'auto'
})
```

### 渲染层叠上下文

```javascript
/*
层叠上下文的创建条件：
1. 根元素 <html>
2. position: relative/absolute + z-index 不为 auto
3. position: fixed/sticky
4. flex/grid 容器的子元素 + z-index 不为 auto
5. opacity < 1
6. transform 不为 none
7. filter 不为 none
8. will-change 指定了以上属性
*/

// 层叠顺序（从后到前）
const stackingOrder = [
  '1. 形成层叠上下文的元素的背景和边框',
  '2. z-index < 0 的子元素',
  '3. 标准流中的块级盒子',
  '4. 浮动盒子',
  '5. 标准流中的行内盒子',
  '6. z-index: 0 / auto 的定位元素',
  '7. z-index > 0 的定位元素'
]
```

## 浏览器渲染进程

### 多进程架构

```javascript
/*
Chrome 多进程架构：

1. Browser Process（浏览器进程）
   - 负责 UI、网络请求、文件访问等
   - 只有一个

2. Renderer Process（渲染进程）
   - 负责页面渲染
   - 每个 tab 通常有独立的渲染进程
   - 包含多个线程

3. GPU Process（GPU 进程）
   - 负责 GPU 任务
   - 所有进程共享

4. Plugin Process（插件进程）
   - 负责运行插件
*/

// 渲染进程的线程
const rendererThreads = {
  'GUI 渲染线程': '负责渲染页面，解析 HTML/CSS，构建 DOM/CSSOM/渲染树',
  'JS 引擎线程': '负责执行 JavaScript',
  '事件触发线程': '管理事件循环和事件队列',
  '定时器线程': '处理 setTimeout/setInterval',
  '异步 HTTP 请求线程': '处理 XMLHttpRequest'
}

// GUI 渲染线程与 JS 引擎线程互斥
// 这就是为什么长时间运行的 JS 会阻塞页面渲染
```

### 渲染流水线

```javascript
/*
渲染流水线（Rendering Pipeline）：

1. Parse（解析）
   Input: HTML, CSS
   Output: DOM, CSSOM

2. Style（样式计算）
   Input: DOM, CSSOM
   Output: Computed Styles

3. Layout（布局）
   Input: DOM with Styles
   Output: Layout Tree

4. Paint（绘制）
   Input: Layout Tree
   Output: Paint Records

5. Composite（合成）
   Input: Paint Records
   Output: Compositor Frame

每个阶段的优化都很重要！
*/

// 使用 Performance 面板分析渲染性能
// Main 线程的任务：
const mainThreadTasks = [
  'Parse HTML',
  'Parse Stylesheet',
  'Evaluate Script',
  'Recalculate Style',
  'Layout',
  'Update Layer Tree',
  'Paint',
  'Composite Layers'
]
```

## 性能分析工具

### Chrome DevTools

```javascript
// 1. Performance 面板
/*
录制页面性能：
- Main: JavaScript 执行和渲染任务
- Compositor: 合成任务
- GPU: GPU 任务
- Network: 网络请求
- Frames: 帧率

关注指标：
- Long Tasks（超过 50ms 的任务）
- Layout Shift
- First Paint
- Largest Contentful Paint
*/

// 2. Lighthouse
/*
评分维度：
- Performance（性能）
- Accessibility（可访问性）
- Best Practices（最佳实践）
- SEO
- PWA

性能指标：
- FCP（首次内容绘制）
- LCP（最大内容绘制）
- TTI（可交互时间）
- TBT（总阻塞时间）
- CLS（累积布局偏移）
*/

// 3. Rendering 面板
/*
调试选项：
- Paint flashing: 高亮重绘区域
- Layout Shift Regions: 显示布局偏移
- Layer borders: 显示图层边界
- FPS meter: 显示帧率
*/

// 4. Layers 面板
/*
查看：
- 合成层数量
- 合成层原因
- 内存占用
*/
```

### 性能监控代码

```javascript
// 监控关键性能指标
class PerformanceMonitor {
  constructor() {
    this.metrics = {}
    this.init()
  }

  init() {
    // 监控 LCP
    this.observeLCP()
    // 监控 FID
    this.observeFID()
    // 监控 CLS
    this.observeCLS()
    // 监控长任务
    this.observeLongTasks()
  }

  observeLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.metrics.LCP = lastEntry.startTime
      console.log('LCP:', lastEntry.startTime)
    })
    observer.observe({ type: 'largest-contentful-paint', buffered: true })
  }

  observeFID() {
    const observer = new PerformanceObserver((list) => {
      const entry = list.getEntries()[0]
      this.metrics.FID = entry.processingStart - entry.startTime
      console.log('FID:', this.metrics.FID)
    })
    observer.observe({ type: 'first-input', buffered: true })
  }

  observeCLS() {
    let clsScore = 0
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsScore += entry.value
        }
      }
      this.metrics.CLS = clsScore
      console.log('CLS:', clsScore)
    })
    observer.observe({ type: 'layout-shift', buffered: true })
  }

  observeLongTasks() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('Long Task:', entry.duration, 'ms')
      }
    })
    observer.observe({ type: 'longtask', buffered: true })
  }

  getMetrics() {
    // 获取 Navigation Timing
    const timing = performance.getEntriesByType('navigation')[0]

    return {
      ...this.metrics,
      // DNS 查询时间
      DNS: timing.domainLookupEnd - timing.domainLookupStart,
      // TCP 连接时间
      TCP: timing.connectEnd - timing.connectStart,
      // TTFB
      TTFB: timing.responseStart - timing.requestStart,
      // DOM 解析时间
      DOMParse: timing.domInteractive - timing.responseEnd,
      // DOM 完成时间
      DOMComplete: timing.domComplete - timing.domInteractive,
      // 页面加载时间
      Load: timing.loadEventEnd - timing.navigationStart
    }
  }
}

// 使用
const monitor = new PerformanceMonitor()
window.addEventListener('load', () => {
  setTimeout(() => {
    console.log(monitor.getMetrics())
  }, 3000)
})
```

