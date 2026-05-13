# 问题排查与调试

## 概述

问题排查能力是高级工程师的核心能力之一。面试中会考察你对**内存泄漏**、**页面卡顿**、**白屏问题**、**网络问题**等的定位和解决能力。

---

## 一、内存泄漏排查

### 什么是内存泄漏?

内存泄漏是指程序申请的内存没有被释放，导致内存占用不断增加，最终可能导致浏览器崩溃或页面卡顿。

### 常见内存泄漏场景

```javascript
// 1. 闭包引用
function createLeak() {
  const hugeData = new Array(1000000).fill('x')

  return function() {
    // 虽然只用了一个值,但整个 hugeData 都被保留
    console.log(hugeData[0])
  }
}

const leak = createLeak()  // hugeData 无法被回收

// 解决: 及时解除引用
function createNoLeak() {
  const hugeData = new Array(1000000).fill('x')
  const firstItem = hugeData[0]  // 只保留需要的数据

  return function() {
    console.log(firstItem)
  }
}

// 2. 定时器未清除
let timer = setInterval(() => {
  const dom = document.getElementById('myElement')
  if (dom) {
    dom.innerHTML = Date.now()
  }
  // 即使元素被移除,定时器仍在运行
}, 1000)

// 解决: 组件卸载时清除
onUnmounted(() => {
  clearInterval(timer)
})

// 3. 事件监听未移除
const handler = () => console.log('scroll')
window.addEventListener('scroll', handler)

// 解决: 组件卸载时移除监听
onUnmounted(() => {
  window.removeEventListener('scroll', handler)
})

// 4. DOM 引用
const elements = {
  button: document.getElementById('button'),
  image: document.getElementById('image')
}

function removeButton() {
  document.body.removeChild(elements.button)
  // elements.button 仍然引用着 DOM 节点
}

// 解决: 移除 DOM 时同时清除引用
function removeButton() {
  document.body.removeChild(elements.button)
  elements.button = null
}

// 5. console.log 保留引用
const hugeObject = { data: new Array(1000000).fill('x') }
console.log(hugeObject)  // Chrome DevTools 会保留引用

// 解决: 生产环境移除 console.log
if (process.env.NODE_ENV === 'production') {
  console.log = () => {}
}

// 6. 全局变量污染
function leak() {
  // 忘记 var/let/const,变成全局变量
  leakedVariable = 'I am global'
}

// 解决: 使用严格模式
'use strict'
function noLeak() {
  leakedVariable = 'error'  // ReferenceError
}

// 7. Map/Set 存储大对象
const cache = new Map()

function addToCache(key, value) {
  cache.set(key, value)
  // 缓存无限增长
}

// 解决: 使用 WeakMap 或设置缓存上限
const cache = new WeakMap()  // key 被回收时,value 也会被回收

// 或者限制缓存大小
const MAX_CACHE_SIZE = 100
function addToCache(key, value) {
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value
    cache.delete(firstKey)
  }
  cache.set(key, value)
}

// 8. Vue/React 组件中的内存泄漏
// Vue
export default {
  mounted() {
    this.observer = new IntersectionObserver(this.handleIntersect)
    this.observer.observe(this.$el)

    window.addEventListener('resize', this.handleResize)
  },

  // 忘记清理
  beforeUnmount() {
    this.observer.disconnect()
    window.removeEventListener('resize', this.handleResize)
  }
}

// React
useEffect(() => {
  const observer = new IntersectionObserver(handleIntersect)
  observer.observe(ref.current)

  window.addEventListener('resize', handleResize)

  // 清理函数
  return () => {
    observer.disconnect()
    window.removeEventListener('resize', handleResize)
  }
}, [])
```

### Chrome DevTools 排查方法

```javascript
/**
 * 排查步骤:
 *
 * 1. 打开 Chrome DevTools → Memory 面板
 *
 * 2. 拍摄快照 (Heap snapshot)
 *    - 操作前拍摄快照 A
 *    - 执行可疑操作
 *    - 操作后拍摄快照 B
 *
 * 3. 比较快照
 *    - 选择快照 B
 *    - 切换到 "Comparison" 视图
 *    - 选择对比快照 A
 *    - 查看新增的对象
 *
 * 4. 分析对象
 *    - 找到大量重复或未释放的对象
 *    - 查看 "Retainers" 面板,了解谁在引用这个对象
 *
 * 5. Performance 面板
 *    - 录制内存变化
 *    - 观察内存是否持续增长
 *    - 查看 JS Heap 曲线
 *
 * 6. 强制垃圾回收
 *    - 点击 "Collect garbage" 按钮
 *    - 如果内存没有下降,说明有泄漏
 */

// 代码层面的内存监控
class MemoryMonitor {
  constructor() {
    this.baseline = null
    this.samples = []
  }

  // 记录基准
  recordBaseline() {
    if (performance.memory) {
      this.baseline = performance.memory.usedJSHeapSize
    }
  }

  // 检查内存增长
  checkGrowth() {
    if (!performance.memory || !this.baseline) return null

    const current = performance.memory.usedJSHeapSize
    const growth = current - this.baseline
    const growthMB = (growth / 1024 / 1024).toFixed(2)

    this.samples.push({
      timestamp: Date.now(),
      current,
      growth,
      growthMB
    })

    return {
      baseline: this.baseline,
      current,
      growth: growthMB + 'MB'
    }
  }

  // 分析趋势
  analyzeTrend() {
    if (this.samples.length < 3) return null

    const recentSamples = this.samples.slice(-10)
    const avgGrowth = recentSamples.reduce((sum, s) => sum + s.growth, 0) / recentSamples.length

    return {
      trend: avgGrowth > 0 ? 'increasing' : 'stable',
      averageGrowth: (avgGrowth / 1024 / 1024).toFixed(2) + 'MB'
    }
  }
}

// 使用
const monitor = new MemoryMonitor()
monitor.recordBaseline()

// 每分钟检查一次
setInterval(() => {
  const result = monitor.checkGrowth()
  console.log('内存变化:', result)

  const trend = monitor.analyzeTrend()
  if (trend?.trend === 'increasing') {
    console.warn('检测到内存持续增长,可能存在泄漏!')
  }
}, 60000)
```

---

## 二、页面卡顿排查

### 卡顿原因

```javascript
/**
 * 页面卡顿常见原因:
 *
 * 1. JavaScript 执行时间过长
 *    - 复杂计算
 *    - 大量 DOM 操作
 *    - 同步 IO
 *
 * 2. 频繁的重排重绘
 *    - 修改几何属性
 *    - 读写交替
 *
 * 3. 内存占用过高
 *    - 内存泄漏
 *    - 大数据量
 *
 * 4. 第三方库性能问题
 *    - 未优化的库
 *    - 重复初始化
 */
```

### Performance 面板分析

```javascript
/**
 * Performance 面板使用:
 *
 * 1. 录制
 *    - 点击 Record 开始录制
 *    - 执行卡顿操作
 *    - 点击 Stop 停止录制
 *
 * 2. 分析 Main 线程
 *    - 红色区域: 长任务 (> 50ms)
 *    - 查看调用栈,找到耗时函数
 *
 * 3. 分析帧率
 *    - 查看 Frames 行
 *    - 红色帧 = 掉帧
 *    - 目标: 60fps (每帧 16.67ms)
 *
 * 4. 分析 Layout/Paint
 *    - 紫色: Layout (重排)
 *    - 绿色: Paint (重绘)
 *    - 合成: Composite
 */

// 代码层面的性能监控
class PerformanceMonitor {
  constructor() {
    this.longTasks = []
    this.fps = []
    this.init()
  }

  init() {
    // 监控长任务
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.longTasks.push({
            startTime: entry.startTime,
            duration: entry.duration,
            name: entry.name
          })

          if (entry.duration > 100) {
            console.warn('检测到长任务:', entry.duration + 'ms')
          }
        }
      })

      observer.observe({ entryTypes: ['longtask'] })
    }

    // 监控 FPS
    this.monitorFPS()
  }

  monitorFPS() {
    let lastTime = performance.now()
    let frameCount = 0

    const loop = () => {
      const now = performance.now()
      frameCount++

      if (now - lastTime >= 1000) {
        const fps = Math.round(frameCount * 1000 / (now - lastTime))
        this.fps.push({ timestamp: now, fps })

        if (fps < 30) {
          console.warn('FPS 过低:', fps)
        }

        frameCount = 0
        lastTime = now
      }

      requestAnimationFrame(loop)
    }

    requestAnimationFrame(loop)
  }

  // 获取报告
  getReport() {
    return {
      longTasks: this.longTasks.slice(-20),
      fps: this.fps.slice(-60),
      averageFPS: this.fps.length
        ? Math.round(this.fps.reduce((sum, f) => sum + f.fps, 0) / this.fps.length)
        : null
    }
  }
}
```

### 优化方案

```javascript
// 1. 使用 requestIdleCallback 处理非紧急任务
function processInChunks(tasks) {
  let index = 0

  function doWork(deadline) {
    while (index < tasks.length && deadline.timeRemaining() > 0) {
      tasks[index]()
      index++
    }

    if (index < tasks.length) {
      requestIdleCallback(doWork)
    }
  }

  requestIdleCallback(doWork)
}

// 2. 时间切片
function timeSlice(tasks, chunkSize = 5) {
  let index = 0

  return new Promise((resolve) => {
    function processChunk() {
      const chunk = tasks.slice(index, index + chunkSize)
      chunk.forEach(task => task())
      index += chunkSize

      if (index < tasks.length) {
        // 让出主线程
        setTimeout(processChunk, 0)
      } else {
        resolve()
      }
    }

    processChunk()
  })
}

// 3. Web Worker 处理复杂计算
// main.js
const worker = new Worker('worker.js')

worker.postMessage({ type: 'heavyCalculation', data: hugeArray })

worker.onmessage = (e) => {
  const result = e.data
  updateUI(result)
}

// worker.js
self.onmessage = (e) => {
  const { type, data } = e.data

  if (type === 'heavyCalculation') {
    // 在 Worker 中进行计算,不阻塞主线程
    const result = data.map(item => expensiveCalculation(item))
    self.postMessage(result)
  }
}

// 4. 虚拟滚动处理大列表 (见场景题 index.md)

// 5. 减少重排重绘
// ❌ 读写交替
for (let i = 0; i < 100; i++) {
  el.style.width = el.offsetWidth + 10 + 'px'  // 强制同步布局
}

// ✅ 批量读,批量写
const widths = []
for (let i = 0; i < 100; i++) {
  widths.push(els[i].offsetWidth)  // 批量读
}
for (let i = 0; i < 100; i++) {
  els[i].style.width = widths[i] + 10 + 'px'  // 批量写
}

// 6. 使用 transform 代替 top/left
// ❌ 触发重排
element.style.left = '100px'
element.style.top = '100px'

// ✅ 只触发合成
element.style.transform = 'translate(100px, 100px)'

// 7. 使用 will-change 提示浏览器
.animated-element {
  will-change: transform, opacity;
}

// 8. 防抖节流 (见 handwriting.md)
```

---

## 三、白屏问题排查

### 白屏原因分析

```javascript
/**
 * 白屏常见原因:
 *
 * 1. JavaScript 错误
 *    - 语法错误
 *    - 运行时错误
 *    - 框架错误
 *
 * 2. 资源加载失败
 *    - JS 文件 404
 *    - CSS 文件加载失败
 *    - 网络超时
 *
 * 3. 路由配置错误
 *    - 路径不匹配
 *    - 懒加载失败
 *
 * 4. CSS 问题
 *    - 全局样式覆盖
 *    - display: none
 *
 * 5. 服务端问题
 *    - API 返回错误
 *    - 服务器宕机
 */
```

### 排查步骤

```javascript
// 1. 检查控制台错误
window.addEventListener('error', (event) => {
  console.error('错误:', event.error)

  // 区分 JS 错误和资源加载错误
  if (event.target && (event.target.src || event.target.href)) {
    console.error('资源加载失败:', event.target.src || event.target.href)
  }
}, true)

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise 错误:', event.reason)
})

// 2. 检查网络请求
// Network 面板查看:
// - 红色请求 = 失败
// - Waterfall 查看加载顺序
// - 检查关键资源是否加载成功

// 3. 代码层面的白屏检测
class WhiteScreenDetector {
  constructor(options = {}) {
    this.threshold = options.threshold || 5000  // 检测时间
    this.checkPoints = options.checkPoints || 17  // 采样点数
    this.callback = options.callback
  }

  check() {
    setTimeout(() => {
      const wrapperElements = [
        'body',
        '#app',
        '#root',
        '.main-content'
      ]

      // 采样点检测
      let emptyPoints = 0
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      for (let i = 1; i <= this.checkPoints; i++) {
        const x = viewportWidth * (i / (this.checkPoints + 1))
        const y = viewportHeight / 2

        const element = document.elementFromPoint(x, y)

        if (!element || element.tagName === 'HTML' || element.tagName === 'BODY') {
          emptyPoints++
        }
      }

      // 超过 50% 的点为空,判定为白屏
      const isWhiteScreen = emptyPoints > this.checkPoints * 0.5

      if (isWhiteScreen) {
        this.callback?.({
          type: 'white_screen',
          emptyPoints,
          totalPoints: this.checkPoints,
          timestamp: Date.now()
        })
      }

      return isWhiteScreen
    }, this.threshold)
  }
}

// 使用
const detector = new WhiteScreenDetector({
  threshold: 5000,
  callback: (data) => {
    console.error('检测到白屏:', data)
    // 上报错误
    reportError(data)
  }
})

detector.check()

// 4. 骨架屏降级
function showSkeleton() {
  document.getElementById('app').innerHTML = `
    <div class="skeleton">
      <div class="skeleton-header"></div>
      <div class="skeleton-content"></div>
    </div>
  `
}

// 如果 JS 加载失败,显示骨架屏
setTimeout(() => {
  if (!window.__APP_LOADED__) {
    showSkeleton()
  }
}, 3000)

// 5. Vue 错误边界
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue 错误:', err, info)

  // 显示错误页面
  if (info.includes('render')) {
    showErrorPage(err)
  }
}

// 6. React 错误边界
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('React 错误:', error, errorInfo)
    reportError({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage error={this.state.error} />
    }
    return this.props.children
  }
}
```

### 预防措施

```javascript
// 1. 关键资源预加载
<link rel="preload" href="/static/js/app.js" as="script">
<link rel="preload" href="/static/css/app.css" as="style">

// 2. 资源加载失败重试
function loadScript(src, retries = 3) {
  return new Promise((resolve, reject) => {
    function attempt(retriesLeft) {
      const script = document.createElement('script')
      script.src = src

      script.onload = resolve
      script.onerror = () => {
        if (retriesLeft > 0) {
          console.warn(`加载失败,重试 (${retries - retriesLeft + 1}/${retries}):`, src)
          attempt(retriesLeft - 1)
        } else {
          reject(new Error(`Failed to load script: ${src}`))
        }
      }

      document.head.appendChild(script)
    }

    attempt(retries)
  })
}

// 3. CDN 容灾
const cdnList = [
  'https://cdn1.example.com',
  'https://cdn2.example.com',
  'https://cdn3.example.com'
]

async function loadWithFallback(path) {
  for (const cdn of cdnList) {
    try {
      await loadScript(cdn + path)
      return
    } catch (error) {
      console.warn(`CDN ${cdn} 加载失败:`, error)
    }
  }
  throw new Error('All CDN failed')
}

// 4. 服务端渲染 (SSR) 首屏
// 首屏直出 HTML,即使 JS 加载失败也能显示内容

// 5. 增量静态再生 (ISR)
// Next.js / Nuxt.js 支持
```

---

## 四、网络问题排查

### 常见网络问题

```javascript
/**
 * 网络问题类型:
 *
 * 1. 请求超时
 * 2. 跨域问题 (CORS)
 * 3. DNS 解析失败
 * 4. SSL 证书问题
 * 5. 代理配置错误
 * 6. 请求被拦截
 */
```

### 排查方法

```javascript
// 1. 请求耗时分析
async function fetchWithTiming(url, options = {}) {
  const timing = {
    start: performance.now(),
    stages: {}
  }

  try {
    // DNS + 连接时间
    timing.stages.connectionStart = performance.now() - timing.start

    const response = await fetch(url, {
      ...options,
      // 禁用缓存以准确测量
      cache: 'no-store'
    })

    timing.stages.responseStart = performance.now() - timing.start

    const data = await response.json()

    timing.stages.responseEnd = performance.now() - timing.start
    timing.total = timing.stages.responseEnd

    console.log('请求耗时分析:', {
      url,
      timing,
      status: response.status
    })

    return { data, timing }

  } catch (error) {
    timing.error = error.message
    timing.total = performance.now() - timing.start

    console.error('请求失败:', { url, timing, error })
    throw error
  }
}

// 2. 使用 Resource Timing API
function analyzeResourceTiming(url) {
  const entries = performance.getEntriesByName(url)

  if (entries.length === 0) {
    console.log('未找到资源:', url)
    return null
  }

  const entry = entries[entries.length - 1]

  return {
    // DNS 解析
    dns: entry.domainLookupEnd - entry.domainLookupStart,
    // TCP 连接
    tcp: entry.connectEnd - entry.connectStart,
    // SSL 握手
    ssl: entry.secureConnectionStart > 0
      ? entry.connectEnd - entry.secureConnectionStart
      : 0,
    // 请求时间
    request: entry.responseStart - entry.requestStart,
    // 响应时间
    response: entry.responseEnd - entry.responseStart,
    // 总时间
    total: entry.duration
  }
}

// 3. 网络状态监控
class NetworkMonitor {
  constructor() {
    this.online = navigator.onLine
    this.connectionType = this.getConnectionType()
    this.init()
  }

  init() {
    // 监听在线状态
    window.addEventListener('online', () => {
      this.online = true
      console.log('网络已连接')
    })

    window.addEventListener('offline', () => {
      this.online = false
      console.warn('网络已断开')
    })

    // 监听连接变化
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        this.connectionType = this.getConnectionType()
        console.log('网络类型变化:', this.connectionType)
      })
    }
  }

  getConnectionType() {
    if ('connection' in navigator) {
      const conn = navigator.connection
      return {
        type: conn.effectiveType,  // 4g, 3g, 2g, slow-2g
        downlink: conn.downlink,   // 下行带宽 Mbps
        rtt: conn.rtt,             // 往返时间 ms
        saveData: conn.saveData    // 省流模式
      }
    }
    return null
  }

  // 检测网络质量
  async measureNetworkQuality() {
    const testUrl = '/api/ping'  // 小的测试接口
    const results = []

    // 多次测试取平均
    for (let i = 0; i < 3; i++) {
      const start = performance.now()
      try {
        await fetch(testUrl, { cache: 'no-store' })
        results.push(performance.now() - start)
      } catch {
        results.push(Infinity)
      }
    }

    const avgLatency = results.filter(r => r !== Infinity)
      .reduce((a, b) => a + b, 0) / results.length

    return {
      avgLatency: Math.round(avgLatency),
      quality: avgLatency < 100 ? 'good' : avgLatency < 300 ? 'fair' : 'poor'
    }
  }
}

// 4. 跨域问题排查
/**
 * CORS 错误常见原因:
 *
 * 1. 服务端未设置 Access-Control-Allow-Origin
 * 2. 预检请求 (OPTIONS) 未正确处理
 * 3. 携带凭证时配置不当
 *
 * 检查步骤:
 * 1. Network 面板查看请求
 * 2. 检查 Response Headers
 * 3. 确认 OPTIONS 请求是否成功
 */

// 正确的 CORS 配置 (后端)
/*
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
*/

// 前端携带凭证
fetch(url, {
  credentials: 'include'  // 或 'same-origin'
})

// 5. 请求重试机制
async function fetchWithRetry(url, options = {}, retries = 3) {
  const { timeout = 10000, ...fetchOptions } = options

  for (let i = 0; i < retries; i++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return response

    } catch (error) {
      clearTimeout(timeoutId)

      const isLastRetry = i === retries - 1
      const isRetryable = error.name === 'AbortError' ||
                          error.message.includes('fetch')

      if (isLastRetry || !isRetryable) {
        throw error
      }

      // 指数退避
      const delay = Math.pow(2, i) * 1000
      console.warn(`请求失败,${delay}ms 后重试 (${i + 1}/${retries}):`, error.message)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
```

---

## 五、调试技巧汇总

### Chrome DevTools 技巧

```javascript
// 1. 条件断点
// 右键断点 → "Edit breakpoint" → 输入条件
// 例如: i === 100

// 2. 日志断点 (Logpoint)
// 右键断点 → "Add logpoint"
// 不中断执行,只输出日志

// 3. XHR/Fetch 断点
// Sources 面板 → XHR/fetch Breakpoints
// 添加 URL 包含的关键字

// 4. DOM 变化断点
// Elements 面板 → 右键元素 → "Break on"
// - subtree modifications
// - attribute modifications
// - node removal

// 5. 事件监听断点
// Sources 面板 → Event Listener Breakpoints
// 选择要断点的事件类型

// 6. 黑盒脚本 (Blackbox)
// 右键脚本 → "Blackbox script"
// 调试时跳过第三方库代码

// 7. 代码覆盖率
// Coverage 面板 (Ctrl+Shift+P → Coverage)
// 查看代码使用情况

// 8. 性能标记
performance.mark('start-task')
// 执行任务
performance.mark('end-task')
performance.measure('task-duration', 'start-task', 'end-task')

// 9. console 高级用法
console.table(data)           // 表格显示
console.group('Group')        // 分组
console.groupEnd()
console.time('timer')         // 计时
console.timeEnd('timer')
console.trace()               // 调用栈
console.assert(condition, 'message')  // 断言

// 10. 复制变量到剪贴板
copy(someVariable)  // 控制台中使用

// 11. 获取选中的 DOM 元素
$0  // 最近选中的元素
$1  // 上一个选中的元素

// 12. 监控元素
monitor(fn)       // 监控函数调用
monitorEvents(el) // 监控元素事件
unmonitor(fn)
unmonitorEvents(el)

// 13. 查找 DOM 元素
$('selector')     // document.querySelector
$$('selector')    // document.querySelectorAll

// 14. 模拟网络状况
// Network 面板 → 节流选项
// - Offline
- Slow 3G
- Fast 3G
// - Custom (自定义延迟、带宽)
```

### 调试最佳实践

```javascript
// 1. 善用 Source Map
// 生产环境上传 source map 到错误监控平台
// 本地开发保持 source map 开启

// 2. 添加有意义的日志
function processOrder(order) {
  console.log('[Order] Processing:', {
    orderId: order.id,
    userId: order.userId,
    amount: order.amount
  })

  // ...处理逻辑

  console.log('[Order] Completed:', {
    orderId: order.id,
    result: 'success'
  })
}

// 3. 使用调试工具类
class Debugger {
  static enabled = process.env.NODE_ENV === 'development'

  static log(module, message, data = {}) {
    if (!this.enabled) return

    console.log(`[${module}] ${message}`, data)
  }

  static warn(module, message, data = {}) {
    console.warn(`[${module}] ${message}`, data)
  }

  static error(module, message, error) {
    console.error(`[${module}] ${message}`, error)

    // 生产环境上报
    if (!this.enabled) {
      reportError({ module, message, error })
    }
  }

  static time(label) {
    if (this.enabled) {
      console.time(label)
    }
  }

  static timeEnd(label) {
    if (this.enabled) {
      console.timeEnd(label)
    }
  }
}

// 使用
Debugger.log('Auth', '用户登录', { userId: 123 })
Debugger.time('API call')
await api.fetchData()
Debugger.timeEnd('API call')

// 4. 错误边界隔离
// 将应用分成多个错误边界,一个模块崩溃不影响其他模块

// 5. 保持调试代码整洁
// 使用 ESLint 规则禁止 console 进入生产代码
// "no-console": ["error", { allow: ["warn", "error"] }]
```

---

