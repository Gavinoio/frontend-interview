# 前端监控体系

## 概述

前端监控是保障应用质量的重要手段，包括错误监控、性能监控、用户行为监控等维度。本章节介绍如何构建完整的前端监控体系。

---

## 一、监控体系架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端监控体系                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  错误监控   │  │  性能监控   │  │  行为监控   │         │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤         │
│  │ JS 运行错误 │  │ 页面加载   │  │ PV/UV       │         │
│  │ 资源加载错误│  │ 资源加载   │  │ 点击事件   │         │
│  │ Promise 异常│  │ 接口性能   │  │ 页面访问路径│         │
│  │ 网络请求错误│  │ 渲染性能   │  │ 用户操作流  │         │
│  │ 框架错误   │  │ Core Web   │  │ 热力图      │         │
│  └─────────────┘  │ Vitals     │  └─────────────┘         │
│                   └─────────────┘                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    数据上报层                         │  │
│  │   Beacon API / fetch / img src / sendBeacon         │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               数据收集与存储                          │  │
│  │          (日志服务 / 时序数据库)                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │             数据分析与可视化                          │  │
│  │        (Grafana / Kibana / 自建平台)                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               告警与通知                              │  │
│  │      (邮件 / 钉钉 / 企业微信 / 短信)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、错误监控

### 1. JS 运行时错误

```javascript
// 全局错误监听
window.onerror = function(message, source, lineno, colno, error) {
  const errorInfo = {
    type: 'js_error',
    message: message,
    source: source,
    lineno: lineno,
    colno: colno,
    stack: error?.stack,
    timestamp: Date.now(),
    url: location.href,
    userAgent: navigator.userAgent
  }

  reportError(errorInfo)

  // 返回 true 阻止默认错误处理
  return false
}

// 使用 addEventListener (推荐)
window.addEventListener('error', (event) => {
  // 区分资源加载错误和 JS 错误
  if (event.target && (event.target.src || event.target.href)) {
    // 资源加载错误
    return
  }

  const errorInfo = {
    type: 'js_error',
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
    timestamp: Date.now()
  }

  reportError(errorInfo)
}, true)
```

### 2. 资源加载错误

```javascript
// 资源加载错误
window.addEventListener('error', (event) => {
  const target = event.target

  // 判断是否是资源加载错误
  if (target && (target.src || target.href)) {
    const errorInfo = {
      type: 'resource_error',
      tagName: target.tagName,
      resourceUrl: target.src || target.href,
      timestamp: Date.now(),
      url: location.href
    }

    reportError(errorInfo)
  }
}, true)  // 捕获阶段

// 监控特定资源
const originalImage = window.Image
window.Image = function(...args) {
  const img = new originalImage(...args)

  img.addEventListener('error', () => {
    reportError({
      type: 'image_error',
      src: img.src
    })
  })

  return img
}
```

### 3. Promise 异常

```javascript
// 未处理的 Promise 拒绝
window.addEventListener('unhandledrejection', (event) => {
  const errorInfo = {
    type: 'promise_error',
    reason: event.reason?.message || String(event.reason),
    stack: event.reason?.stack,
    timestamp: Date.now(),
    url: location.href
  }

  reportError(errorInfo)
})

// 处理过的 Promise 拒绝（可选）
window.addEventListener('rejectionhandled', (event) => {
  console.log('Promise rejection handled:', event.reason)
})
```

### 4. 网络请求错误

```javascript
// 拦截 XMLHttpRequest
const originalXHROpen = XMLHttpRequest.prototype.open
const originalXHRSend = XMLHttpRequest.prototype.send

XMLHttpRequest.prototype.open = function(method, url, ...args) {
  this._monitorData = { method, url, startTime: Date.now() }
  return originalXHROpen.apply(this, [method, url, ...args])
}

XMLHttpRequest.prototype.send = function(body) {
  const xhr = this

  xhr.addEventListener('loadend', () => {
    const { method, url, startTime } = xhr._monitorData
    const duration = Date.now() - startTime

    if (xhr.status >= 400 || xhr.status === 0) {
      reportError({
        type: 'xhr_error',
        method,
        url,
        status: xhr.status,
        statusText: xhr.statusText,
        duration,
        timestamp: Date.now()
      })
    }

    // 也可以上报性能数据
    reportPerformance({
      type: 'xhr',
      method,
      url,
      status: xhr.status,
      duration
    })
  })

  return originalXHRSend.apply(this, [body])
}

// 拦截 fetch
const originalFetch = window.fetch

window.fetch = async function(input, init) {
  const startTime = Date.now()
  const url = typeof input === 'string' ? input : input.url
  const method = init?.method || 'GET'

  try {
    const response = await originalFetch(input, init)
    const duration = Date.now() - startTime

    if (!response.ok) {
      reportError({
        type: 'fetch_error',
        method,
        url,
        status: response.status,
        statusText: response.statusText,
        duration,
        timestamp: Date.now()
      })
    }

    reportPerformance({
      type: 'fetch',
      method,
      url,
      status: response.status,
      duration
    })

    return response
  } catch (error) {
    reportError({
      type: 'fetch_error',
      method,
      url,
      message: error.message,
      duration: Date.now() - startTime,
      timestamp: Date.now()
    })
    throw error
  }
}
```

### 5. 框架错误边界

```jsx
// React Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // 上报错误
    reportError({
      type: 'react_error',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now()
    })
  }

  render() {
    if (this.state.hasError) {
      return <div>页面出错了，请刷新重试</div>
    }
    return this.props.children
  }
}

// Vue 错误处理
app.config.errorHandler = (err, vm, info) => {
  reportError({
    type: 'vue_error',
    message: err.message,
    stack: err.stack,
    info: info,
    component: vm?.$options?.name,
    timestamp: Date.now()
  })
}

// Vue 警告处理
app.config.warnHandler = (msg, vm, trace) => {
  console.warn('Vue warning:', msg, trace)
}
```

### 6. 跨域脚本错误

```javascript
// 问题：跨域脚本错误只显示 "Script error."
// 解决方案：

// 1. 添加 crossorigin 属性
<script src="https://cdn.example.com/app.js" crossorigin="anonymous"></script>

// 2. 服务器配置 CORS
// Access-Control-Allow-Origin: *

// 3. 使用 try-catch 包装
function wrapFunction(fn) {
  return function(...args) {
    try {
      return fn.apply(this, args)
    } catch (error) {
      reportError({
        type: 'wrapped_error',
        message: error.message,
        stack: error.stack
      })
      throw error
    }
  }
}
```

---

## 三、性能监控

### 1. 页面加载性能

```javascript
// Performance API
function getPageLoadMetrics() {
  const timing = performance.timing
  const navigation = performance.getEntriesByType('navigation')[0]

  return {
    // DNS 查询
    dns: timing.domainLookupEnd - timing.domainLookupStart,

    // TCP 连接
    tcp: timing.connectEnd - timing.connectStart,

    // SSL 握手
    ssl: timing.connectEnd - timing.secureConnectionStart,

    // TTFB (首字节时间)
    ttfb: timing.responseStart - timing.requestStart,

    // 下载时间
    download: timing.responseEnd - timing.responseStart,

    // DOM 解析
    domParse: timing.domInteractive - timing.responseEnd,

    // DOM Ready
    domReady: timing.domContentLoadedEventEnd - timing.navigationStart,

    // 完全加载
    load: timing.loadEventEnd - timing.navigationStart,

    // 白屏时间
    whiteScreen: timing.domLoading - timing.navigationStart,

    // 首次渲染
    fp: performance.getEntriesByName('first-paint')[0]?.startTime,

    // 首次内容渲染
    fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
  }
}

// 页面加载完成后上报
window.addEventListener('load', () => {
  // 等待 load 事件完成
  setTimeout(() => {
    reportPerformance({
      type: 'page_load',
      metrics: getPageLoadMetrics(),
      url: location.href,
      timestamp: Date.now()
    })
  }, 0)
})
```

### 2. Core Web Vitals

```javascript
// 使用 web-vitals 库
import { onLCP, onFID, onCLS, onFCP, onTTFB, onINP } from 'web-vitals'

function sendToAnalytics(metric) {
  reportPerformance({
    type: 'web_vitals',
    name: metric.name,
    value: metric.value,
    rating: metric.rating,  // good / needs-improvement / poor
    id: metric.id,
    navigationType: metric.navigationType,
    timestamp: Date.now()
  })
}

// LCP - 最大内容渲染 (应 < 2.5s)
onLCP(sendToAnalytics)

// FID - 首次输入延迟 (应 < 100ms)
onFID(sendToAnalytics)

// CLS - 累计布局偏移 (应 < 0.1)
onCLS(sendToAnalytics)

// FCP - 首次内容渲染
onFCP(sendToAnalytics)

// TTFB - 首字节时间
onTTFB(sendToAnalytics)

// INP - 交互到下一次绘制 (取代 FID)
onINP(sendToAnalytics)

// 手动实现 LCP 监控
const lcpObserver = new PerformanceObserver((entryList) => {
  const entries = entryList.getEntries()
  const lastEntry = entries[entries.length - 1]

  reportPerformance({
    type: 'lcp',
    value: lastEntry.renderTime || lastEntry.loadTime,
    element: lastEntry.element?.tagName,
    url: lastEntry.url
  })
})

lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

// 手动实现 CLS 监控
let clsValue = 0
const clsObserver = new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    if (!entry.hadRecentInput) {
      clsValue += entry.value
    }
  }
})

clsObserver.observe({ type: 'layout-shift', buffered: true })

// 页面离开时上报 CLS
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    reportPerformance({ type: 'cls', value: clsValue })
  }
})
```

### 3. 资源加载性能

```javascript
// 监控资源加载
const resourceObserver = new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    // 过滤上报请求本身
    if (entry.name.includes('report')) continue

    reportPerformance({
      type: 'resource',
      name: entry.name,
      initiatorType: entry.initiatorType,  // script/link/img/fetch/xmlhttprequest
      duration: entry.duration,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize,
      // 详细时间
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      request: entry.responseStart - entry.requestStart,
      response: entry.responseEnd - entry.responseStart
    })
  }
})

resourceObserver.observe({ type: 'resource', buffered: true })

// 慢资源告警
function checkSlowResources() {
  const resources = performance.getEntriesByType('resource')

  resources.forEach(resource => {
    if (resource.duration > 3000) {  // 超过 3 秒
      reportError({
        type: 'slow_resource',
        name: resource.name,
        duration: resource.duration,
        initiatorType: resource.initiatorType
      })
    }
  })
}
```

### 4. 长任务监控

```javascript
// 长任务监控 (> 50ms)
const longTaskObserver = new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    reportPerformance({
      type: 'long_task',
      duration: entry.duration,
      startTime: entry.startTime,
      attribution: entry.attribution?.map(attr => ({
        containerType: attr.containerType,
        containerSrc: attr.containerSrc,
        containerId: attr.containerId,
        containerName: attr.containerName
      }))
    })
  }
})

longTaskObserver.observe({ type: 'longtask', buffered: true })

// 帧率监控
let lastFrameTime = performance.now()
let frameCount = 0
let fps = 60

function measureFPS() {
  frameCount++
  const now = performance.now()
  const delta = now - lastFrameTime

  if (delta >= 1000) {
    fps = Math.round((frameCount * 1000) / delta)
    frameCount = 0
    lastFrameTime = now

    // FPS 过低告警
    if (fps < 30) {
      reportPerformance({
        type: 'low_fps',
        fps: fps,
        timestamp: Date.now()
      })
    }
  }

  requestAnimationFrame(measureFPS)
}

requestAnimationFrame(measureFPS)
```

### 5. 内存监控

```javascript
// 内存监控 (仅 Chrome 支持)
function getMemoryInfo() {
  if (performance.memory) {
    return {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      usageRatio: performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit
    }
  }
  return null
}

// 定期检查内存
setInterval(() => {
  const memory = getMemoryInfo()
  if (memory && memory.usageRatio > 0.9) {
    reportError({
      type: 'memory_warning',
      ...memory,
      timestamp: Date.now()
    })
  }
}, 30000)

// 页面离开时上报内存峰值
let maxMemory = 0
setInterval(() => {
  const memory = getMemoryInfo()
  if (memory) {
    maxMemory = Math.max(maxMemory, memory.usedJSHeapSize)
  }
}, 5000)

window.addEventListener('beforeunload', () => {
  reportPerformance({
    type: 'memory_peak',
    maxMemory: maxMemory
  })
})
```

---

## 四、用户行为监控

### 1. PV/UV 统计

```javascript
// 页面访问统计
function trackPageView() {
  const pageViewData = {
    type: 'page_view',
    url: location.href,
    referrer: document.referrer,
    title: document.title,
    timestamp: Date.now(),
    // 用户标识
    userId: getUserId(),
    sessionId: getSessionId(),
    // 设备信息
    screenWidth: screen.width,
    screenHeight: screen.height,
    devicePixelRatio: window.devicePixelRatio,
    userAgent: navigator.userAgent
  }

  reportBehavior(pageViewData)
}

// 生成用户 ID
function getUserId() {
  let userId = localStorage.getItem('_uid')
  if (!userId) {
    userId = 'u_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('_uid', userId)
  }
  return userId
}

// 生成会话 ID
function getSessionId() {
  let sessionId = sessionStorage.getItem('_sid')
  if (!sessionId) {
    sessionId = 's_' + Math.random().toString(36).substr(2, 9)
    sessionStorage.setItem('_sid', sessionId)
  }
  return sessionId
}

// SPA 路由变化监听
let lastUrl = location.href

// History API
const originalPushState = history.pushState
const originalReplaceState = history.replaceState

history.pushState = function(...args) {
  originalPushState.apply(this, args)
  onUrlChange()
}

history.replaceState = function(...args) {
  originalReplaceState.apply(this, args)
  onUrlChange()
}

window.addEventListener('popstate', onUrlChange)

function onUrlChange() {
  if (location.href !== lastUrl) {
    lastUrl = location.href
    trackPageView()
  }
}

// Hash 路由
window.addEventListener('hashchange', () => {
  trackPageView()
})
```

### 2. 点击事件监控

```javascript
// 点击事件监控
document.addEventListener('click', (event) => {
  const target = event.target

  // 获取元素路径
  const path = getElementPath(target)

  const clickData = {
    type: 'click',
    path: path,
    tagName: target.tagName,
    className: target.className,
    id: target.id,
    text: target.innerText?.substring(0, 100),
    href: target.href,
    // 点击位置
    pageX: event.pageX,
    pageY: event.pageY,
    timestamp: Date.now()
  }

  reportBehavior(clickData)
}, true)

// 获取元素路径
function getElementPath(element) {
  const path = []
  let current = element

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase()

    if (current.id) {
      selector += '#' + current.id
    } else if (current.className) {
      selector += '.' + current.className.split(' ').join('.')
    }

    path.unshift(selector)
    current = current.parentElement
  }

  return path.join(' > ')
}

// 自动埋点 - data-track 属性
document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-track]')
  if (target) {
    const trackData = JSON.parse(target.dataset.track)
    reportBehavior({
      type: 'track_click',
      ...trackData,
      timestamp: Date.now()
    })
  }
})

// 使用
<button data-track='{"event": "buy", "productId": "123"}'>
  立即购买
</button>
```

### 3. 页面停留时间

```javascript
// 页面停留时间
const pageEnterTime = Date.now()
let pageActiveTime = 0
let lastActiveTime = Date.now()
let isActive = true

// 监听页面可见性
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    if (isActive) {
      pageActiveTime += Date.now() - lastActiveTime
    }
    isActive = false
  } else {
    lastActiveTime = Date.now()
    isActive = true
  }
})

// 页面离开时上报
window.addEventListener('beforeunload', () => {
  if (isActive) {
    pageActiveTime += Date.now() - lastActiveTime
  }

  const totalTime = Date.now() - pageEnterTime

  reportBehavior({
    type: 'page_leave',
    url: location.href,
    totalTime: totalTime,
    activeTime: pageActiveTime,
    timestamp: Date.now()
  })
})
```

### 4. 滚动深度监控

```javascript
// 滚动深度监控
let maxScrollDepth = 0

function getScrollDepth() {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
  const clientHeight = document.documentElement.clientHeight

  return Math.round((scrollTop + clientHeight) / scrollHeight * 100)
}

// 节流处理
let scrollTimer = null
window.addEventListener('scroll', () => {
  if (scrollTimer) return

  scrollTimer = setTimeout(() => {
    const depth = getScrollDepth()
    maxScrollDepth = Math.max(maxScrollDepth, depth)
    scrollTimer = null
  }, 200)
})

// 页面离开时上报
window.addEventListener('beforeunload', () => {
  reportBehavior({
    type: 'scroll_depth',
    maxDepth: maxScrollDepth,
    url: location.href
  })
})

// 滚动深度里程碑
const depthMilestones = [25, 50, 75, 100]
const reportedMilestones = new Set()

window.addEventListener('scroll', () => {
  const depth = getScrollDepth()

  depthMilestones.forEach(milestone => {
    if (depth >= milestone && !reportedMilestones.has(milestone)) {
      reportedMilestones.add(milestone)
      reportBehavior({
        type: 'scroll_milestone',
        milestone: milestone,
        url: location.href
      })
    }
  })
})
```

### 5. 表单行为监控

```javascript
// 表单行为监控
function trackFormBehavior(form) {
  const formId = form.id || form.name || 'unknown'
  const startTime = Date.now()
  const fieldInteractions = {}

  // 字段聚焦
  form.addEventListener('focusin', (event) => {
    const field = event.target
    if (field.name) {
      fieldInteractions[field.name] = {
        focusTime: Date.now(),
        changeCount: 0
      }
    }
  })

  // 字段失焦
  form.addEventListener('focusout', (event) => {
    const field = event.target
    if (field.name && fieldInteractions[field.name]) {
      fieldInteractions[field.name].blurTime = Date.now()
      fieldInteractions[field.name].duration =
        fieldInteractions[field.name].blurTime - fieldInteractions[field.name].focusTime
    }
  })

  // 字段修改
  form.addEventListener('input', (event) => {
    const field = event.target
    if (field.name && fieldInteractions[field.name]) {
      fieldInteractions[field.name].changeCount++
    }
  })

  // 表单提交
  form.addEventListener('submit', () => {
    reportBehavior({
      type: 'form_submit',
      formId: formId,
      duration: Date.now() - startTime,
      fieldInteractions: fieldInteractions
    })
  })

  // 表单放弃
  window.addEventListener('beforeunload', () => {
    if (Object.keys(fieldInteractions).length > 0) {
      reportBehavior({
        type: 'form_abandon',
        formId: formId,
        duration: Date.now() - startTime,
        fieldInteractions: fieldInteractions
      })
    }
  })
}

// 自动监控所有表单
document.querySelectorAll('form').forEach(trackFormBehavior)
```

---

## 五、数据上报

### 1. 上报方式对比

| 方式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| Image | 跨域支持好 | 只能 GET，数据量限制 | 简单埋点 |
| fetch | 灵活，支持 POST | 可能被取消 | 常规上报 |
| sendBeacon | 页面卸载可靠 | 不支持自定义 Header | 离开页面上报 |
| XMLHttpRequest | 兼容性好 | 繁琐 | 兼容老浏览器 |

### 2. 上报实现

```javascript
class Reporter {
  constructor(options = {}) {
    this.url = options.url || '/api/report'
    this.queue = []
    this.maxQueueSize = options.maxQueueSize || 10
    this.flushInterval = options.flushInterval || 5000
    this.retryCount = options.retryCount || 3

    this.init()
  }

  init() {
    // 定时上报
    setInterval(() => this.flush(), this.flushInterval)

    // 页面卸载时上报
    window.addEventListener('beforeunload', () => {
      this.flush(true)
    })

    // 页面隐藏时上报
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush(true)
      }
    })
  }

  // 添加数据到队列
  add(data) {
    this.queue.push({
      ...data,
      timestamp: Date.now(),
      url: location.href,
      userId: getUserId(),
      sessionId: getSessionId()
    })

    // 队列满时立即上报
    if (this.queue.length >= this.maxQueueSize) {
      this.flush()
    }
  }

  // 批量上报
  flush(useBeacon = false) {
    if (this.queue.length === 0) return

    const data = [...this.queue]
    this.queue = []

    if (useBeacon && navigator.sendBeacon) {
      // 使用 Beacon API
      const blob = new Blob([JSON.stringify(data)], {
        type: 'application/json'
      })
      navigator.sendBeacon(this.url, blob)
    } else {
      // 使用 fetch
      this.sendWithFetch(data)
    }
  }

  async sendWithFetch(data, retryCount = 0) {
    try {
      await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        keepalive: true  // 允许页面卸载后继续请求
      })
    } catch (error) {
      // 重试
      if (retryCount < this.retryCount) {
        setTimeout(() => {
          this.sendWithFetch(data, retryCount + 1)
        }, 1000 * Math.pow(2, retryCount))
      } else {
        // 存储到本地，下次访问时重试
        this.saveToLocal(data)
      }
    }
  }

  // 本地存储失败的数据
  saveToLocal(data) {
    try {
      const failedData = JSON.parse(localStorage.getItem('_failed_reports') || '[]')
      failedData.push(...data)
      // 限制存储数量
      if (failedData.length > 100) {
        failedData.splice(0, failedData.length - 100)
      }
      localStorage.setItem('_failed_reports', JSON.stringify(failedData))
    } catch (e) {
      console.error('Failed to save reports:', e)
    }
  }

  // 重发本地存储的数据
  resendLocal() {
    try {
      const failedData = JSON.parse(localStorage.getItem('_failed_reports') || '[]')
      if (failedData.length > 0) {
        this.sendWithFetch(failedData)
        localStorage.removeItem('_failed_reports')
      }
    } catch (e) {
      console.error('Failed to resend reports:', e)
    }
  }
}

// 全局实例
const reporter = new Reporter({
  url: 'https://monitor.example.com/api/report'
})

// 上报方法
function reportError(data) {
  reporter.add({ category: 'error', ...data })
}

function reportPerformance(data) {
  reporter.add({ category: 'performance', ...data })
}

function reportBehavior(data) {
  reporter.add({ category: 'behavior', ...data })
}
```

### 3. 数据压缩

```javascript
// 使用 pako 压缩
import pako from 'pako'

function compressData(data) {
  const jsonStr = JSON.stringify(data)
  const compressed = pako.gzip(jsonStr)
  return btoa(String.fromCharCode.apply(null, compressed))
}

// 上报压缩数据
async function sendCompressed(data) {
  const compressed = compressData(data)

  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Encoding': 'gzip'
    },
    body: compressed
  })
}
```

---

## 六、采样与降噪

### 1. 采样策略

```javascript
// 采样配置
const samplingConfig = {
  error: 1,        // 错误 100% 采集
  performance: 0.1, // 性能 10% 采集
  behavior: 0.5    // 行为 50% 采集
}

function shouldSample(category) {
  const rate = samplingConfig[category] || 1
  return Math.random() < rate
}

// 条件采样
function conditionalSampling(data) {
  // 错误全量采集
  if (data.category === 'error') return true

  // 高价值用户全量采集
  if (isVIPUser()) return true

  // 特定页面全量采集
  if (isImportantPage()) return true

  // 其他按比例采样
  return shouldSample(data.category)
}
```

### 2. 错误去重

```javascript
// 错误去重
const reportedErrors = new Map()
const ERROR_REPORT_LIMIT = 10  // 同一错误最多上报 10 次

function shouldReportError(error) {
  const key = `${error.message}_${error.source}_${error.lineno}`

  if (!reportedErrors.has(key)) {
    reportedErrors.set(key, 1)
    return true
  }

  const count = reportedErrors.get(key)
  if (count < ERROR_REPORT_LIMIT) {
    reportedErrors.set(key, count + 1)
    return true
  }

  return false
}

// 定期清理
setInterval(() => {
  reportedErrors.clear()
}, 3600000)  // 1 小时清理一次
```

### 3. 节流上报

```javascript
// 节流上报
function throttleReport(fn, interval = 1000) {
  let lastTime = 0
  let pending = null

  return function(...args) {
    const now = Date.now()

    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    } else if (!pending) {
      pending = setTimeout(() => {
        pending = null
        lastTime = Date.now()
        fn.apply(this, args)
      }, interval - (now - lastTime))
    }
  }
}

const throttledReport = throttleReport(reportPerformance, 1000)
```

---

## 七、监控平台

### 1. Sentry 集成

```javascript
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://xxx@sentry.io/xxx',
  environment: process.env.NODE_ENV,
  release: 'my-app@1.0.0',
  integrations: [
    new Sentry.BrowserTracing({
      tracingOrigins: ['localhost', 'api.example.com']
    }),
    new Sentry.Replay()
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
})

// 手动上报
Sentry.captureException(new Error('Something went wrong'))

Sentry.captureMessage('Something happened', 'info')

// 添加上下文
Sentry.setUser({ id: userId, email: userEmail })

Sentry.setTag('page', 'checkout')

Sentry.setContext('order', {
  orderId: '123',
  amount: 99.99
})
```

### 2. 自定义监控平台

```javascript
// 监控 SDK 完整实现
class MonitorSDK {
  constructor(options) {
    this.appId = options.appId
    this.reportUrl = options.reportUrl
    this.userId = this.getUserId()
    this.sessionId = this.getSessionId()

    this.init()
  }

  init() {
    this.initErrorMonitor()
    this.initPerformanceMonitor()
    this.initBehaviorMonitor()
  }

  initErrorMonitor() {
    // JS 错误
    window.addEventListener('error', (e) => {
      if (e.target && (e.target.src || e.target.href)) {
        this.reportResourceError(e)
      } else {
        this.reportJSError(e)
      }
    }, true)

    // Promise 错误
    window.addEventListener('unhandledrejection', (e) => {
      this.reportPromiseError(e)
    })
  }

  initPerformanceMonitor() {
    // 页面加载完成后采集
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.reportPageLoad()
        this.reportWebVitals()
      }, 0)
    })
  }

  initBehaviorMonitor() {
    // PV
    this.reportPV()

    // 点击
    document.addEventListener('click', (e) => {
      this.reportClick(e)
    }, true)

    // 页面停留
    window.addEventListener('beforeunload', () => {
      this.reportPageLeave()
    })
  }

  // ... 具体实现方法
}

// 使用
const monitor = new MonitorSDK({
  appId: 'my-app',
  reportUrl: 'https://monitor.example.com/api/report'
})
```

---

