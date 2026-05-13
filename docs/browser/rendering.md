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

## 面试题

::: details 1. 描述浏览器的渲染过程
<details>
<summary>点击查看答案</summary>

**渲染过程六个主要步骤**：

1. **构建 DOM 树**
   - 解析 HTML，将标签转换为 DOM 节点
   - 遇到 script 标签会暂停解析（除非 async/defer）

2. **构建 CSSOM 树**
   - 解析 CSS，构建样式规则树
   - CSS 解析会阻塞渲染

3. **构建渲染树**
   - 合并 DOM 和 CSSOM
   - 只包含可见节点（display: none 不包含）

4. **Layout（布局/回流）**
   - 计算每个节点的位置和大小
   - 从根节点递归计算

5. **Paint（绘制/重绘）**
   - 将节点转换为屏幕上的像素
   - 按照层级顺序绘制

6. **Composite（合成）**
   - 将多个绘制层合成
   - GPU 加速处理

**关键优化点**：
- CSS 放头部，JS 放底部或使用 defer
- 减少回流和重绘
- 使用 transform/opacity 做动画
- 合理使用合成层
:::

</details>

::: details 2. 什么是回流和重绘？如何优化？
<details>
<summary>点击查看答案</summary>

**回流（Reflow）**：
- 当元素的几何属性（大小、位置）改变时触发
- 需要重新计算布局
- 一定会触发重绘

**重绘（Repaint）**：
- 当元素的外观改变但不影响布局时触发
- 如颜色、背景等
- 不一定触发回流

**触发回流的操作**：
```javascript
// 1. 改变几何属性
width, height, padding, margin, border, top, left

// 2. 读取布局信息（强制同步布局）
offsetTop, offsetWidth, scrollTop, clientWidth
getComputedStyle(), getBoundingClientRect()

// 3. DOM 结构变化
添加/删除元素，改变内容
```

**优化策略**：
```javascript
// 1. 批量修改样式
element.style.cssText = 'width: 100px; height: 100px'
// 或使用 class
element.className = 'new-class'

// 2. 批量修改 DOM
const fragment = document.createDocumentFragment()
// 添加到 fragment，最后一次性插入

// 3. 避免强制同步布局
// 先读后写，不要交叉

// 4. 使用 transform 代替 top/left
// 5. 使用 requestAnimationFrame
// 6. 脱离文档流做动画
```
:::

</details>

::: details 3. CSS 加载会阻塞什么？
<details>
<summary>点击查看答案</summary>

**CSS 加载**：
- **不阻塞** DOM 解析
- **阻塞** DOM 渲染（需要 CSSOM 才能构建渲染树）
- **阻塞** 后面 JS 的执行（JS 可能依赖样式）

**原因**：
1. 渲染树需要 DOM + CSSOM 才能构建
2. JS 可能查询或修改样式，需要等 CSSOM 完成

**优化建议**：
```html
<!-- 关键 CSS 内联 -->
<style>
  /* 首屏关键样式 */
</style>

<!-- 非关键 CSS 异步加载 -->
<link rel="preload" href="style.css" as="style"
      onload="this.rel='stylesheet'">

<!-- 或使用 media 属性 -->
<link rel="stylesheet" href="print.css" media="print">
```
:::

</details>

::: details 4. 什么是合成层？如何创建？
<details>
<summary>点击查看答案</summary>

**合成层（Compositing Layer）**：
- 由 GPU 独立处理的图层
- transform/opacity 动画只需要合成，不触发回流重绘
- 性能更好

**创建合成层的方式**：
```css
/* 1. 3D 变换 */
transform: translateZ(0);
transform: translate3d(0, 0, 0);

/* 2. will-change */
will-change: transform;
will-change: opacity;

/* 3. opacity + 动画/过渡 */
opacity: 0.9;

/* 4. filter */
filter: blur(10px);

/* 5. 特定元素 */
video, canvas, iframe
```

**注意事项**：
- 合成层过多会消耗内存
- 可能导致"层爆炸"
- 只对需要动画的元素使用
- 动画结束后移除 will-change

```javascript
// 最佳实践
element.addEventListener('mouseenter', () => {
  element.style.willChange = 'transform'
})
element.addEventListener('animationend', () => {
  element.style.willChange = 'auto'
})
```
:::

</details>

::: details 5. defer 和 async 的区别
<details>
<summary>点击查看答案</summary>

```html
<!-- 普通 script -->
<script src="script.js"></script>
<!-- 阻塞 HTML 解析，下载并执行后继续 -->

<!-- defer -->
<script defer src="script.js"></script>
<!-- 并行下载，HTML 解析完后执行，在 DOMContentLoaded 之前 -->
<!-- 多个 defer 脚本按顺序执行 -->

<!-- async -->
<script async src="script.js"></script>
<!-- 并行下载，下载完立即执行（会阻塞 HTML 解析） -->
<!-- 多个 async 脚本不保证顺序 -->
```

**图示**：
```
普通:    HTML解析 → 下载 → 执行 → HTML解析继续

defer:   HTML解析 ────────────────→ 执行
         并行下载 ─────↑

async:   HTML解析 → ← 执行 → HTML解析继续
         并行下载 ↑
```

**使用场景**：
- `defer`：有依赖关系的脚本，需要操作 DOM
- `async`：独立的脚本，如统计分析
:::

</details>

::: details 6. 什么是关键渲染路径？如何优化？
<details>
<summary>点击查看答案</summary>

**关键渲染路径（Critical Rendering Path）**：
从接收 HTML、CSS、JavaScript 到渲染出第一个像素的过程。

**关键资源**：
- HTML
- 阻塞渲染的 CSS
- 阻塞解析的 JavaScript

**优化策略**：

1. **减少关键资源数量**
```html
<!-- 内联关键 CSS -->
<style>/* critical CSS */</style>

<!-- 异步加载非关键 CSS -->
<link rel="preload" href="style.css" as="style">

<!-- defer/async JavaScript -->
<script defer src="app.js"></script>
```

2. **减小关键资源大小**
```bash
# 压缩 HTML/CSS/JS
# Tree Shaking
# 代码分割
```

3. **缩短关键路径长度**
```html
<!-- 预加载关键资源 -->
<link rel="preload" href="critical.js" as="script">

<!-- 预连接第三方域名 -->
<link rel="preconnect" href="https://api.example.com">
```

4. **优化关键资源加载顺序**
- CSS 放 head
- JS 放底部或使用 defer
- 图片懒加载
:::

</details>

::: details 7. 如何分析和解决页面卡顿问题？
<details>
<summary>点击查看答案</summary>

**分析工具**：
1. Chrome Performance 面板
2. Lighthouse
3. Web Vitals

**常见卡顿原因及解决方案**：

1. **长任务阻塞主线程**
```javascript
// 问题：长循环阻塞
for (let i = 0; i < 1000000; i++) {
  // 耗时操作
}

// 解决：分片处理
function processChunk(data, index, callback) {
  const chunk = 1000
  const end = Math.min(index + chunk, data.length)

  for (let i = index; i < end; i++) {
    // 处理数据
  }

  if (end < data.length) {
    requestIdleCallback(() => processChunk(data, end, callback))
  } else {
    callback()
  }
}
```

2. **频繁回流重绘**
```javascript
// 问题：循环中读写交叉
elements.forEach(el => {
  el.style.width = container.offsetWidth + 'px'
})

// 解决：批量读，批量写
const width = container.offsetWidth
elements.forEach(el => {
  el.style.width = width + 'px'
})
```

3. **内存泄漏**
```javascript
// 检查：Performance Memory 面板
// 解决：及时清理引用、事件监听、定时器
```

4. **大量 DOM 操作**
```javascript
// 解决：虚拟列表、DocumentFragment
```

5. **动画性能差**
```css
/* 解决：使用 transform/opacity，启用 GPU 加速 */
.animate {
  will-change: transform;
  transform: translateX(100px);
}
```
:::

</details>

::: details 8. 浏览器一帧做了什么？
<details>
<summary>点击查看答案</summary>

**浏览器一帧（16.67ms at 60fps）的工作**：

```
输入事件 → JavaScript → rAF → 样式计算 → 布局 → 绘制 → 合成

1. Input events（输入事件处理）
   - 处理用户输入（click, scroll, touch 等）

2. JavaScript
   - 执行定时器回调
   - 执行 Promise 回调
   - 执行其他 JavaScript

3. requestAnimationFrame
   - 执行 rAF 回调

4. Style（样式计算）
   - 计算应用到元素的样式

5. Layout（布局）
   - 计算元素的位置和大小

6. Paint（绘制）
   - 记录绘制指令

7. Composite（合成）
   - 合成图层

8. requestIdleCallback（空闲时间）
   - 如果有剩余时间，执行 rIC 回调
```

**优化建议**：
- JavaScript 执行时间控制在 10ms 以内
- 避免强制同步布局
- 耗时操作放到 requestIdleCallback
- 使用 Web Worker 处理复杂计算

```javascript
// 利用空闲时间
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    doTask(tasks.pop())
  }
})
```
:::

---

</details>

## 高频面试题

::: details 1. 从输入 URL 到页面显示经历了什么？（经典题）
<details>
<summary>点击查看答案</summary>

#### 一句话答案
经历了DNS解析、TCP连接、HTTP请求、服务器响应、浏览器解析渲染这五个主要阶段。

#### 详细解答

**完整流程**：

```
1. URL 输入 → 浏览器进程处理
   ↓
2. DNS 解析 → 获取 IP 地址
   ↓
3. TCP 连接 → 三次握手建立连接
   ↓
4. 发送 HTTP 请求 → 服务器处理
   ↓
5. 服务器响应 → 返回 HTML
   ↓
6. 浏览器解析渲染
   ├─ 解析 HTML → DOM 树
   ├─ 解析 CSS → CSSOM 树
   ├─ 执行 JavaScript
   ├─ 构建渲染树
   ├─ Layout 布局
   ├─ Paint 绘制
   └─ Composite 合成
   ↓
7. 页面显示完成
   ↓
8. TCP 连接关闭 → 四次挥手
```

**各阶段详细说明**：

**第一阶段：URL 解析**
```javascript
// 1. 浏览器判断 URL 合法性
// 2. 检查 HSTS（强制 HTTPS）
// 3. 判断是否需要发起网络请求
//    - 检查缓存（强缓存）
//    - 检查 Service Worker
```

**第二阶段：DNS 解析**
```javascript
// DNS 查询顺序：
// 1. 浏览器 DNS 缓存
// 2. 操作系统 DNS 缓存
// 3. 路由器缓存
// 4. ISP DNS 服务器
// 5. 根域名服务器 → 顶级域名服务器 → 权威域名服务器

// 优化：DNS 预解析
// <link rel="dns-prefetch" href="https://api.example.com">
```

**第三阶段：TCP 连接**
```
三次握手：
客户端 → SYN → 服务器
客户端 ← SYN + ACK ← 服务器
客户端 → ACK → 服务器

HTTPS 还需要 TLS/SSL 握手：
1. Client Hello
2. Server Hello
3. 证书验证
4. 密钥交换
```

**第四阶段：HTTP 请求与响应**
```javascript
// 请求
GET /index.html HTTP/1.1
Host: www.example.com
User-Agent: Mozilla/5.0
Accept: text/html
Cookie: session=abc123

// 响应
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 1024
Cache-Control: max-age=3600

<!DOCTYPE html>
<html>...
```

**第五阶段：浏览器解析渲染**
```javascript
// 1. 解析 HTML → 构建 DOM 树
//    - 遇到 CSS：并行下载，阻塞渲染
//    - 遇到 JS：下载并执行，阻塞 DOM 解析（除非 async/defer）
//    - 遇到图片：异步下载，不阻塞

// 2. 解析 CSS → 构建 CSSOM 树

// 3. DOM + CSSOM → 渲染树

// 4. Layout（回流）
//    - 计算元素位置和大小

// 5. Paint（重绘）
//    - 绘制像素到屏幕

// 6. Composite（合成）
//    - 合成图层
```

**关键优化点**：

```javascript
// 1. DNS 优化
<link rel="dns-prefetch" href="https://api.example.com">

// 2. 连接优化
<link rel="preconnect" href="https://api.example.com">

// 3. 资源优化
<link rel="preload" href="critical.css" as="style">
<script defer src="app.js"></script>

// 4. 缓存优化
// 强缓存：Cache-Control, Expires
// 协商缓存：ETag, Last-Modified

// 5. 渲染优化
// - 关键 CSS 内联
// - JS 异步加载
// - 图片懒加载
// - 使用 CDN
```

#### 面试口语化回答模板

```
"这个问题我可以从网络请求和浏览器渲染两个大方面来说：

【网络请求阶段】
首先，当我们输入 URL 后，浏览器会先做 DNS 解析，把域名转换成 IP 地址。
这里会先查浏览器缓存、系统缓存，没有的话才会去 DNS 服务器查询。

接着是 TCP 三次握手建立连接，如果是 HTTPS 的话还要进行 TLS 握手。
连接建立后，浏览器就发送 HTTP 请求，服务器处理后返回 HTML 文档。

【浏览器渲染阶段】
浏览器拿到 HTML 后，会开始解析构建 DOM 树。在解析过程中：
- 遇到 CSS 会并行下载并构建 CSSOM 树，CSS 会阻塞渲染但不阻塞 DOM 解析
- 遇到 JS 会下载并执行，普通的 script 会阻塞 DOM 解析
- 遇到图片会异步下载，不会阻塞

当 DOM 和 CSSOM 都构建好后，会合并成渲染树，然后进行 Layout 计算元素位置，
Paint 绘制像素，最后 Composite 合成图层显示到屏幕上。

【优化建议】
实际开发中，我们可以：
- 使用 DNS 预解析、资源预加载来优化网络请求
- CSS 放头部并内联关键样式，JS 放底部或使用 defer
- 图片懒加载，使用 CDN
- 合理利用浏览器缓存

这样可以让页面尽快显示出来，提升用户体验。"
```
:::

</details>

::: details 2. 浏览器渲染流程是什么？
<details>
<summary>点击查看答案</summary>

#### 一句话答案
解析HTML生成DOM树，解析CSS生成CSSOM树，合并为渲染树，然后Layout布局、Paint绘制、Composite合成显示到屏幕。

#### 详细解答

**渲染流程图**：

```
HTML → DOM Tree ┐
                ├→ Render Tree → Layout → Paint → Composite → Display
CSS → CSSOM Tree┘
```

**六大步骤详解**：

**1. 构建 DOM 树**
```javascript
/*
字节 → 字符 → Token → Node → DOM

过程：
1. 字节流转换为字符（根据编码）
2. 词法分析，生成 Token（标签、文本、注释等）
3. Token 转换为 Node 对象
4. Node 构建成 DOM 树

特点：
- 增量解析（边下载边解析）
- 遇到 script 会暂停（除非 async/defer）
*/

// HTML
<html>
  <body>
    <div class="container">
      <p>Hello World</p>
    </div>
  </body>
</html>

// DOM Tree
document
└─ html
   └─ body
      └─ div.container
         └─ p
            └─ "Hello World"
```

**2. 构建 CSSOM 树**
```javascript
/*
CSS → 解析 → CSSOM

特点：
- 不能增量解析（需要完整样式信息）
- 会阻塞渲染
- 不阻塞 DOM 解析（但会阻塞 JS 执行）
*/

// CSS
body { font-size: 16px; }
.container { width: 100%; }
p { color: blue; }

// CSSOM Tree
document.styleSheets
└─ CSSStyleSheet
   └─ cssRules
      ├─ body { font-size: 16px }
      ├─ .container { width: 100% }
      └─ p { color: blue }
```

**3. 构建渲染树**
```javascript
/*
DOM Tree + CSSOM Tree = Render Tree

特点：
- 只包含可见节点
- display: none 不在渲染树中
- visibility: hidden 在渲染树中（占空间但不显示）
- head、script、meta 等不在渲染树中
*/

// Render Tree 结构
RenderObject (root)
└─ RenderBlock (body)
   └─ RenderBlock (div.container)
      └─ RenderInline (p)
         └─ RenderText ("Hello World")
```

**4. Layout（布局/回流）**
```javascript
/*
计算每个节点的：
1. 位置（x, y）
2. 尺寸（width, height）
3. 边距（margin, padding, border）

特点：
- 从根节点递归计算
- 相对定位、绝对定位计算方式不同
- 改变会导致重新 Layout（回流）
*/

// 触发回流的属性
const layoutProperties = [
  'width', 'height', 'padding', 'margin', 'border',
  'top', 'left', 'right', 'bottom',
  'font-size', 'line-height', 'text-align',
  'vertical-align', 'display', 'position', 'float'
]
```

**5. Paint（绘制/重绘）**
```javascript
/*
将渲染树转换为屏幕像素

绘制顺序：
1. 背景颜色
2. 背景图片
3. 边框
4. 子元素
5. 轮廓

特点：
- 分层绘制
- 改变外观会触发重绘
*/

// 只触发重绘的属性
const paintProperties = [
  'color', 'background', 'background-color',
  'background-image', 'border-color', 'border-style',
  'border-radius', 'visibility', 'box-shadow',
  'outline', 'text-decoration'
]
```

**6. Composite（合成）**
```javascript
/*
将多个绘制层合并显示到屏幕

合成层优势：
1. GPU 处理，性能好
2. transform/opacity 动画只需要合成，不触发回流重绘
3. 独立渲染，不影响其他层

创建合成层：
- transform: translateZ(0)
- will-change: transform
- video、canvas、iframe 元素
- opacity + 动画/过渡
*/

// 只触发合成的属性（性能最好）
const compositeProperties = [
  'transform',
  'opacity',
  'filter'
]
```

**关键点总结**：

```javascript
// 1. 阻塞关系
const blocking = {
  'CSS': '阻塞渲染，不阻塞 DOM 解析，阻塞 JS 执行',
  'JavaScript': '阻塞 DOM 解析，阻塞渲染',
  '图片': '不阻塞'
}

// 2. 性能影响
const performance = {
  '回流': '最慢，影响布局，一定触发重绘',
  '重绘': '较慢，只改变外观',
  '合成': '最快，GPU 加速'
}

// 3. 优化方向
const optimization = [
  '减少 DOM 深度',
  '避免复杂 CSS 选择器',
  '批量修改样式',
  '使用 transform/opacity 做动画',
  '合理使用合成层',
  '避免强制同步布局'
]
```

#### 面试口语化��答模板

```
"浏览器渲染主要分为六个步骤：

【解析阶段】
首先是解析 HTML 构建 DOM 树，同时解析 CSS 构建 CSSOM 树。
这里需要注意的是，CSS 的解析会阻塞渲染，因为需要完整的样式信息才能正确渲染页面。
而普通的 script 标签会阻塞 DOM 解析，所以我们通常把 JS 放在底部或者使用 defer。

【构建渲染树】
当 DOM 和 CSSOM 都准备好后，会合并成渲染树。
渲染树只包含需要显示的节点，像 display: none 的元素就不会出现在渲染树中。

【布局和绘制】
接下来是 Layout 阶段，也叫回流，会计算每个元素的位置和大小。
然后是 Paint 阶段，也叫重绘，会把元素绘制成实际的像素。

【合成显示】
最后是 Composite 合成阶段，会把多个绘制层合并，最终显示到屏幕上。
这个阶段由 GPU 处理，性能很好。

【性能优化】
从性能角度来说，回流的代价最大，重绘次之，合成最快。
所以我们做动画的时候，优先使用 transform 和 opacity，
它们只触发合成，不会引起回流和重绘，性能最好。

另外，要避免频繁修改样式导致多次回流，可以批量修改或者用 class 一次性修改。"
```
:::

</details>

::: details 3. 重排和重绘的区别？如何减少？
<details>
<summary>点击查看答案</summary>

#### 一句话答案
重排是元素几何属性改变需要重新计算布局，重绘是外观改变但不影响布局；减少方法是批量修改、避免强制同步布局、使用transform代替位置属性。

#### 详细解答

**核心区别**：

| 对比项 | 重排（Reflow/回流） | 重绘（Repaint） |
|--------|-------------------|----------------|
| **定义** | 元素几何属性改变，重新计算布局 | 元素外观改变，不影响布局 |
| **触发条件** | 改变大小、位置、显示/隐藏 | 改变颜色、背景、边框样式 |
| **性能影响** | 很大（需要重新计算布局） | 较小（只需要重新绘制） |
| **关系** | 一定触发重绘 | 不一定触发重排 |
| **处理线程** | 主线程 | 主线程 |

**触发重排的操作**：

```javascript
// 1. 改变几何属性
const reflowProperties = [
  // 盒模型相关
  'width', 'height',
  'padding', 'margin', 'border',

  // 定位相关
  'top', 'left', 'right', 'bottom',
  'position', 'float', 'clear',

  // 文字相关
  'font-size', 'font-family', 'font-weight',
  'line-height', 'text-align', 'vertical-align',
  'white-space', 'word-wrap',

  // 显示相关
  'display', 'overflow', 'min-height'
]

// 2. 读取布局信息（强制同步布局）
const reflowAPIs = [
  'offsetTop', 'offsetLeft', 'offsetWidth', 'offsetHeight',
  'scrollTop', 'scrollLeft', 'scrollWidth', 'scrollHeight',
  'clientTop', 'clientLeft', 'clientWidth', 'clientHeight',
  'getComputedStyle()',
  'getBoundingClientRect()',
  'scrollIntoView()',
  'scrollTo()'
]

// 3. DOM 结构改变
// - 添加/删除元素
// - 改变元素内容
// - 改变元素顺序
// - 修改 class 列表

// 4. 浏览器窗口变化
window.addEventListener('resize', () => {
  // 触发重排
})
```

**只触发重绘的操作**：

```javascript
// 只改变外观，不影响布局
const repaintProperties = [
  'color',
  'background', 'background-color', 'background-image',
  'border-color', 'border-style', 'border-radius',
  'visibility',
  'outline', 'outline-color', 'outline-style',
  'box-shadow',
  'text-decoration'
]

// 注意：这些属性只触发合成，性能最好
const compositeOnlyProperties = [
  'transform',
  'opacity',
  'filter'
]
```

**优化策略**：

**1. 批量修改样式**
```javascript
// ❌ 差 - 触发多次重排
element.style.width = '100px'
element.style.height = '100px'
element.style.margin = '10px'

// ✅ 好 - 触发一次重排
// 方法1：cssText
element.style.cssText = 'width: 100px; height: 100px; margin: 10px;'

// 方法2：class
element.className = 'new-style'

// 方法3：setAttribute
element.setAttribute('style', 'width: 100px; height: 100px;')
```

**2. 批量修改 DOM**
```javascript
// ❌ 差 - 每次插入都触发重排
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div')
  div.textContent = i
  document.body.appendChild(div) // 触发重排
}

// ✅ 好 - 使用 DocumentFragment
const fragment = document.createDocumentFragment()
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div')
  div.textContent = i
  fragment.appendChild(div) // 不触发重排
}
document.body.appendChild(fragment) // 只触发一次重排

// ✅ 好 - 使用 innerHTML（适合简单结构）
const html = Array.from({ length: 100 }, (_, i) => `<div>${i}</div>`).join('')
container.innerHTML = html
```

**3. 避免强制同步布局**
```javascript
// ❌ 差 - 强制同步布局（读写交叉）
function resizeAllParagraphs() {
  const paragraphs = document.querySelectorAll('p')
  for (let p of paragraphs) {
    // 每次循环都读取布局信息��触发重排
    p.style.width = box.offsetWidth + 'px'
  }
}

// ✅ 好 - 先读后写（批量读，批量写）
function resizeAllParagraphs() {
  const paragraphs = document.querySelectorAll('p')
  const width = box.offsetWidth // 只读取一次
  for (let p of paragraphs) {
    p.style.width = width + 'px'
  }
}

// 读写分离示例
// ❌ 差
div.style.width = div.offsetWidth + 10 + 'px' // 读→写→读→写
div.style.height = div.offsetHeight + 10 + 'px'

// ✅ 好
const width = div.offsetWidth   // 读
const height = div.offsetHeight // 读
div.style.width = width + 10 + 'px'   // 写
div.style.height = height + 10 + 'px' // 写
```

**4. 使用 transform 代替位置属性**
```javascript
// ❌ 差 - 触发重排
element.style.left = '100px'
element.style.top = '100px'

// ✅ 好 - 只触发合成
element.style.transform = 'translate(100px, 100px)'

// 动画对比
// ❌ 差
@keyframes slideLeft {
  from { left: 0; }
  to { left: 100px; }
}

// ✅ 好
@keyframes slideTransform {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}
```

**5. 脱离文档流**
```javascript
// 对于需要频繁操作的元素，使其脱离文档流
element.style.position = 'absolute' // 或 fixed
// 这样修改该元素不会影响其他元素的布局

// 或者临时隐藏元素
element.style.display = 'none' // 脱离渲染树
// 进行批量修改...
element.style.display = 'block' // 重新显示（一次重排）
```

**6. 使用 requestAnimationFrame**
```javascript
// ❌ 差 - 可能在一帧内触发多次重排
window.addEventListener('scroll', () => {
  element.style.top = window.scrollY + 'px'
})

// ✅ 好 - 在下一帧统一处理
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
```

**7. 启用 GPU 加速**
```javascript
// 创建合成层，使用 GPU 处理
element.style.transform = 'translateZ(0)' // 或 translate3d(0,0,0)
element.style.willChange = 'transform'

// 注意：不要滥用，过多合成层会消耗内存
```

**8. 使用虚拟列表**
```javascript
// 对于长列表，只渲染可见区域
// 使用 react-virtualized、vue-virtual-scroller 等库
```

**检测工具**：

```javascript
// Chrome DevTools

// 1. Performance 面板
// 查看 Layout（紫色）和 Paint（绿色）时间

// 2. Rendering 面板
// - Paint flashing: 高亮重绘区域（绿色闪烁）
// - Layout Shift Regions: 显示布局偏移（蓝色）

// 3. Layers 面板
// 查看合成层数量和原因
```

#### 面试口语化回答模板

```
"重排和重绘是浏览器渲染过程中两个重要的概念：

【核心区别】
重排，也叫回流（Reflow），是指元素的几何属性发生改变，
比如宽高、位置等，浏览器需要重新计算元素的位置和大小，这个过程代价比较大。

重绘（Repaint）是指元素的外观发生改变，比如颜色、背景等，
但不影响布局，只需要重新绘制，代价相对较小。

重要的是，重排一定会触发重绘，但重绘不一定触发重排。

【触发条件】
触发重排的常见操作有：
- 修改宽高、padding、margin 等几何属性
- 读取布局信息，像 offsetWidth、scrollTop 等，会强制浏览器同步计算
- 添加删除 DOM 节点
- 改变窗口大小

只触发重绘的操作有：
- 修改颜色、背景色
- 修改 border-color、visibility 等

【优化方法】
实际开发中，我主要从这几个方面优化：

1. 批量修改样式
用 className 或 cssText 一次性修改，而不是逐个修改样式属性。

2. 批量操作 DOM
使用 DocumentFragment 或者先 display: none，批量修改后再显示。

3. 避免强制同步布局
不要在循环中读写交叉，应该先批量读取，再批量写入。

4. 使用 transform 代替 top/left
transform 只触发合成，不会触发重排重绘，性能最好。

5. 对频繁变化的元素使用绝对定位
让它脱离文档流，减少对其他元素的影响。

6. 使用 requestAnimationFrame
把 DOM 操作放在下一帧执行，避免频繁触发。

【工具检测】
可以用 Chrome DevTools 的 Performance 面板查看重排重绘的时间，
Rendering 面板可以高亮显示重绘区域，帮助我们找到性能瓶颈。"
```
:::

</details>

::: details 4. CSS 加载会阻塞什么？JS 加载会阻塞什么?
<details>
<summary>点击查看答案</summary>

#### 一句话答案
CSS加载不阻塞DOM解析但阻塞渲染和JS执行；普通JS加载会阻塞DOM解析和渲染，async不阻塞解析但阻塞执行时的渲染，defer不阻塞解析且延迟执行。

#### 详细解答

**CSS 加载的阻塞行为**：

```javascript
/*
CSS 加载：
✅ 不阻塞：DOM 解析
❌ 阻塞：DOM 渲染（Render）
❌ 阻塞：后续 JavaScript 执行

原因：
1. 渲染树 = DOM + CSSOM，需要等 CSSOM 构建完成
2. JavaScript 可能查询或修改样式，需要等 CSSOM 完成
*/

// 示例
<!DOCTYPE html>
<html>
<head>
  <!-- CSS 加载中... -->
  <link rel="stylesheet" href="slow-loading.css"> <!-- 3秒 -->

  <script>
    // 这段 JS 必须等待 CSS 加载完成才能执行
    // 因为可能需要查询样式信息
    console.log(getComputedStyle(document.body).fontSize)
  </script>
</head>
<body>
  <!-- DOM 会继续解析 -->
  <div>这段 HTML 会被解析，但不会渲染显示</div>
  <!-- 直到 CSS 加载完成，才会渲染 -->
</body>
</html>
```

**CSS 阻塞详细说明**：

```javascript
// 1. CSS 不阻塞 DOM 解析
// 浏览器会继续解析 HTML，构建 DOM 树
document.addEventListener('DOMContentLoaded', () => {
  // DOM 解析完成就触发（不等 CSS）
  console.log('DOM Ready')
})

// 2. CSS 阻塞渲染
// 页面不会显示任何内容，直到 CSS 加载完成
// 避免 FOUC (Flash of Unstyled Content)

// 3. CSS 阻塞后续 JS 执行
<link rel="stylesheet" href="style.css">
<script>
  // 这段 JS 需要等待 style.css 加载完成
  // 因为 JS 可能依赖样式信息
</script>

// 4. CSS 不阻塞后续资源下载
<link rel="stylesheet" href="style.css">
<script src="app.js"></script> <!-- 会并行下载 -->
<img src="image.jpg">           <!-- 会并行下载 -->
```

**JS 加载的阻塞行为**：

```javascript
/*
普通 <script>：
❌ 阻塞：DOM 解析
❌ 阻塞：DOM 渲染
❌ 阻塞：后续资源下载（HTTP/1.1，HTTP/2 不阻塞）

<script async>：
✅ 不阻塞：DOM 解析（下载时）
❌ 阻塞：DOM 解析（执行时）
❌ 阻塞：DOM 渲染（执行时）

<script defer>：
✅ 不阻塞：DOM 解析
✅ 不阻塞：资源下载
❌ 延迟执行：在 DOMContentLoaded 之前，按顺序执行
*/
```

**JS 加载对比表**：

| 属性 | DOM解析 | 下载时机 | 执行时机 | 执行顺序 | 使用场景 |
|------|---------|---------|---------|---------|---------|
| **无属性** | 阻塞 | 立即下载 | 立即执行 | 按顺序 | 需要立即执行的脚本 |
| **async** | 不阻塞 | 并行下载 | 下载完立即执行 | 不保证顺序 | 独立脚本（统计、广告） |
| **defer** | 不阻塞 | 并行下载 | DOM解析完后执行 | 按顺序 | 需要操作 DOM 的脚本 |
| **type="module"** | 不阻塞 | 并行下载 | DOM解析完后执行 | 按依赖顺序 | ES6 模块 |

**详细示例**：

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 1. 普通 script：阻塞 DOM 解析 -->
  <script src="blocking.js"></script>
  <!-- HTML 解析暂停，下载并执行 JS，然后继续 -->

  <!-- 2. async script：不阻塞 DOM 解析 -->
  <script async src="async.js"></script>
  <!-- 并行下载，下载完立即执行（会暂停 DOM 解析） -->

  <!-- 3. defer script：不阻塞 DOM 解析 -->
  <script defer src="defer.js"></script>
  <!-- 并行下载，DOM 解析完后按顺序执行 -->
</head>
<body>
  <div>Content</div>

  <!-- 4. 底部的普通 script -->
  <script src="bottom.js"></script>
  <!-- 此时 DOM 已解析完成，不影响首屏渲染 -->
</body>
</html>
```

**时序图**：

```
普通 script:
HTML解析 → [暂停] 下载JS → 执行JS → [继续] HTML解析

async script:
HTML解析 ─────────────────────────────→
并行下载 ────→ [暂停HTML] 执行JS → [继续]

defer script:
HTML解析 ─────────────────────────────→ [执行JS]
并行下载 ──────────────────────→↑
```

**优化策略**：

**1. CSS 优化**
```html
<!-- ✅ 关键 CSS 内联 -->
<style>
  /* 首屏关键样式 */
  .header { ... }
  .hero { ... }
</style>

<!-- ✅ 非关键 CSS 异步加载 -->
<link rel="preload" href="non-critical.css" as="style"
      onload="this.rel='stylesheet'">

<!-- ✅ 按媒体查询分离 CSS -->
<link rel="stylesheet" href="print.css" media="print">
<link rel="stylesheet" href="mobile.css" media="(max-width: 768px)">

<!-- ✅ 使用 CDN -->
<link rel="stylesheet" href="https://cdn.example.com/style.css">
```

**2. JS 优化**
```html
<!-- ✅ 非关键 JS 使用 defer -->
<script defer src="app.js"></script>

<!-- ✅ 独立 JS 使用 async -->
<script async src="analytics.js"></script>

<!-- ✅ 预加载关键 JS -->
<link rel="preload" href="critical.js" as="script">

<!-- ✅ 动态加载非关键 JS -->
<script>
  // 延迟加载
  window.addEventListener('load', () => {
    const script = document.createElement('script')
    script.src = 'non-critical.js'
    document.body.appendChild(script)
  })
</script>

<!-- ✅ 使用 ES6 模块 -->
<script type="module" src="main.js"></script>
<!-- 相当于自带 defer -->
```

**3. 资源加载优先级**
```html
<!-- 预连接 -->
<link rel="preconnect" href="https://api.example.com">

<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="https://fonts.googleapis.com">

<!-- 预加载关键资源 -->
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="hero.jpg" as="image">
<link rel="preload" href="font.woff2" as="font" crossorigin>

<!-- 预获取未来可能需要的资源 -->
<link rel="prefetch" href="next-page.js">
```

**实际案例分析**：

```html
<!DOCTYPE html>
<html>
<head>
  <!-- ❌ 差的做法 -->
  <script src="jquery.js"></script>        <!-- 阻塞 -->
  <script src="app.js"></script>           <!-- 阻塞 -->
  <link rel="stylesheet" href="style.css"> <!-- 阻塞渲染 -->

  <!-- ✅ 好的做法 -->
  <style>
    /* 关键 CSS 内联 */
    .header { height: 60px; background: #000; }
  </style>
  <link rel="preload" href="style.css" as="style"
        onload="this.rel='stylesheet'">
  <script defer src="app.js"></script>
</head>
<body>
  <div class="header">Header</div>

  <!-- 非关键 JS 放底部 -->
  <script async src="analytics.js"></script>
</body>
</html>
```

**性能指标影响**：

```javascript
// CSS 阻塞影响的指标
const cssMetrics = {
  'FCP': 'First Contentful Paint - CSS 阻塞渲染会延迟 FCP',
  'LCP': 'Largest Contentful Paint - 影响最大内容绘制',
  'TTI': 'Time to Interactive - 延迟可交互时间'
}

// JS 阻塞影响的指标
const jsMetrics = {
  'FCP': 'First Contentful Paint - JS 阻塞 DOM 解析会延迟 FCP',
  'TTI': 'Time to Interactive - JS 执行时间直接影响 TTI',
  'TBT': 'Total Blocking Time - 长任务阻塞主线程',
  'FID': 'First Input Delay - JS 执行影响交互响应'
}

// 测量工具
// 1. Chrome DevTools → Performance
// 2. Lighthouse
// 3. WebPageTest
```

#### 面试口语化回答模板

```
"这是一个很经典的问题，涉及到浏览器的渲染机制：

【CSS 加载的阻塞行为】
CSS 加载有三个关键特点：

1. 不阻塞 DOM 解析
浏览器会继续解析 HTML，构建 DOM 树，这个过程不会停下来。

2. 阻塞 DOM 渲染
虽然 DOM 解析不停，但渲染会等待。因为渲染树需要 DOM + CSSOM，
必须等 CSS 加载并解析完成后才能渲染，这样可以避免页面闪烁。

3. 阻塞后续 JS 执行
如果 CSS 后面有 JS，这个 JS 必须等 CSS 加载完才能执行，
因为 JS 可能需要查询样式信息，像 getComputedStyle 这些 API。

【JS 加载的阻塞行为】
JS 的情况更复杂一些，取决于怎么引入：

1. 普通 script 标签
会阻塞 DOM 解析，浏览器遇到后会停下来，下载并执行 JS，
然后才继续解析后面的 HTML。这就是为什么我们通常把 JS 放在 body 底部。

2. async 属性
下载时不阻塞 DOM 解析，但下载完会立即执行，执行时会阻塞。
多个 async 脚本不保证执行顺序，适合独立的脚本，比如统计代码。

3. defer 属性
下载时不阻塞 DOM 解析，而且会等到 DOM 解析完成后才执行。
多个 defer 脚本会按顺序执行，适合需要操作 DOM 的脚本。

【优化建议】
实际开发中，我会这样优化：

CSS 方面：
- 关键 CSS 内联到 HTML 里
- 非关键 CSS 用 preload 异步加载
- 按媒体查询拆分 CSS

JS 方面：
- 非关键 JS 使用 defer
- 独立脚本使用 async
- 或者把 JS 放在 body 底部
- 大的 JS 文件做代码分割和懒加载

这样可以让首屏尽快显示出来，提升用户体验。
可以用 Lighthouse 工具来检测，它会给出具体的优化建议。"
```
:::

</details>
