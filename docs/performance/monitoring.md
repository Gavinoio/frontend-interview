# 性能监控

性能监控是保障用户体验的重要手段，通过收集和分析性能指标，及时发现和解决性能问题。

## 核心性能指标

### Core Web Vitals

Google 提出的核心 Web 指标，用于衡量用户体验：

| 指标 | 全称 | 含义 | 良好标准 |
|------|------|------|----------|
| LCP | Largest Contentful Paint | 最大内容绘制 | ≤ 2.5s |
| FID | First Input Delay | 首次输入延迟 | ≤ 100ms |
| CLS | Cumulative Layout Shift | 累积布局偏移 | ≤ 0.1 |
| INP | Interaction to Next Paint | 交互到下一次绘制 | ≤ 200ms |

### 其他重要指标

| 指标 | 含义 | 说明 |
|------|------|------|
| FCP | First Contentful Paint | 首次内容绘制 |
| TTFB | Time to First Byte | 首字节时间 |
| TTI | Time to Interactive | 可交互时间 |
| TBT | Total Blocking Time | 总阻塞时间 |

## Performance API

### 获取页面加载性能

```javascript
// 使用 PerformanceNavigationTiming (推荐)
const [navigation] = performance.getEntriesByType('navigation')

const metrics = {
  // DNS 查询时间
  dns: navigation.domainLookupEnd - navigation.domainLookupStart,
  // TCP 连接时间
  tcp: navigation.connectEnd - navigation.connectStart,
  // SSL 握手时间
  ssl: navigation.secureConnectionStart > 0
    ? navigation.connectEnd - navigation.secureConnectionStart
    : 0,
  // TTFB
  ttfb: navigation.responseStart - navigation.requestStart,
  // 响应时间
  response: navigation.responseEnd - navigation.responseStart,
  // DOM 解析时间
  domParsing: navigation.domInteractive - navigation.responseEnd,
  // DOM 内容加载
  domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
  // 页面完全加载
  load: navigation.loadEventEnd - navigation.loadEventStart,
  // 总加载时间
  total: navigation.loadEventEnd - navigation.startTime
}

console.log('性能指标:', metrics)
```

### 获取资源加载性能

```javascript
// 获取所有资源的加载性能
const resources = performance.getEntriesByType('resource')

resources.forEach(resource => {
  console.log({
    name: resource.name,
    type: resource.initiatorType,  // script, css, img, fetch 等
    duration: resource.duration,
    size: resource.transferSize,
    protocol: resource.nextHopProtocol
  })
})

// 分析慢资源
const slowResources = resources
  .filter(r => r.duration > 1000)
  .sort((a, b) => b.duration - a.duration)

console.log('慢资源:', slowResources)
```

### 监听长任务

```javascript
// 监听超过 50ms 的长任务
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('长任务:', {
      duration: entry.duration,
      startTime: entry.startTime,
      name: entry.name
    })

    // 上报长任务
    reportLongTask(entry)
  }
})

observer.observe({ type: 'longtask', buffered: true })
```

## Web Vitals 采集

### 使用 web-vitals 库

```javascript
import { onLCP, onFID, onCLS, onINP, onFCP, onTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,  // 'good' | 'needs-improvement' | 'poor'
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType
  })

  // 使用 sendBeacon 确保数据发送
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/analytics', body)
  } else {
    fetch('/analytics', { body, method: 'POST', keepalive: true })
  }
}

// 监听各项指标
onLCP(sendToAnalytics)
onFID(sendToAnalytics)
onCLS(sendToAnalytics)
onINP(sendToAnalytics)
onFCP(sendToAnalytics)
onTTFB(sendToAnalytics)
```

### 手动采集 LCP

```javascript
const observer = new PerformanceObserver((list) => {
  const entries = list.getEntries()
  // LCP 可能会多次触发，取最后一个
  const lastEntry = entries[entries.length - 1]

  console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime)
  console.log('LCP Element:', lastEntry.element)
})

observer.observe({ type: 'largest-contentful-paint', buffered: true })
```

### 手动采集 CLS

```javascript
let clsValue = 0
let clsEntries = []

const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // 只计算非用户交互导致的布局偏移
    if (!entry.hadRecentInput) {
      clsValue += entry.value
      clsEntries.push(entry)
    }
  }
})

observer.observe({ type: 'layout-shift', buffered: true })

// 页面卸载时上报
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    console.log('CLS:', clsValue)
    reportCLS(clsValue, clsEntries)
  }
})
```

## 错误监控

### JavaScript 错误捕获

```javascript
// 全局错误捕获
window.onerror = function(message, source, lineno, colno, error) {
  reportError({
    type: 'js_error',
    message,
    source,
    lineno,
    colno,
    stack: error?.stack
  })
  return false  // 不阻止默认处理
}

// Promise 错误捕获
window.addEventListener('unhandledrejection', (event) => {
  reportError({
    type: 'promise_error',
    message: event.reason?.message || String(event.reason),
    stack: event.reason?.stack
  })
})

// 资源加载错误
window.addEventListener('error', (event) => {
  if (event.target !== window) {
    reportError({
      type: 'resource_error',
      tagName: event.target.tagName,
      src: event.target.src || event.target.href
    })
  }
}, true)
```

### Vue 错误处理

```javascript
// Vue 3
app.config.errorHandler = (err, instance, info) => {
  reportError({
    type: 'vue_error',
    message: err.message,
    stack: err.stack,
    info,
    componentName: instance?.$options?.name
  })
}

// 警告处理
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('Vue Warning:', msg, trace)
}
```

### React 错误边界

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    reportError({
      type: 'react_error',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>
    }
    return this.props.children
  }
}

// 使用
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

## 用户行为监控

### PV / UV 统计

```javascript
function trackPageView() {
  const data = {
    type: 'pv',
    url: location.href,
    referrer: document.referrer,
    title: document.title,
    timestamp: Date.now(),
    // 用户标识
    userId: getUserId(),
    sessionId: getSessionId()
  }

  sendBeacon('/analytics/pv', data)
}

// 页面加载时
trackPageView()

// SPA 路由变化时
window.addEventListener('popstate', trackPageView)
// 或使用路由钩子
router.afterEach(() => trackPageView())
```

### 点击行为追踪

```javascript
document.addEventListener('click', (event) => {
  const target = event.target

  // 获取元素路径
  const path = getElementPath(target)

  sendBeacon('/analytics/click', {
    type: 'click',
    path,
    tagName: target.tagName,
    className: target.className,
    id: target.id,
    text: target.innerText?.slice(0, 50),
    position: { x: event.clientX, y: event.clientY },
    timestamp: Date.now()
  })
}, true)

function getElementPath(element) {
  const path = []
  while (element && element !== document.body) {
    let selector = element.tagName.toLowerCase()
    if (element.id) {
      selector += `#${element.id}`
    } else if (element.className) {
      selector += `.${element.className.split(' ').join('.')}`
    }
    path.unshift(selector)
    element = element.parentElement
  }
  return path.join(' > ')
}
```

## 性能监控 SDK 设计

```javascript
class PerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      reportUrl: '/analytics',
      sampleRate: 1,  // 采样率
      ...options
    }

    this.init()
  }

  init() {
    // 采样判断
    if (Math.random() > this.options.sampleRate) return

    this.observePerformance()
    this.observeErrors()
    this.observeResources()
    this.observeLongTasks()
  }

  observePerformance() {
    // 页面加载完成后采集
    if (document.readyState === 'complete') {
      this.collectNavigationMetrics()
    } else {
      window.addEventListener('load', () => {
        // 延迟采集确保数据完整
        setTimeout(() => this.collectNavigationMetrics(), 0)
      })
    }

    // Web Vitals
    this.observeWebVitals()
  }

  observeWebVitals() {
    // LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.report('lcp', lastEntry.renderTime || lastEntry.loadTime)
    }).observe({ type: 'largest-contentful-paint', buffered: true })

    // FID
    new PerformanceObserver((list) => {
      const entry = list.getEntries()[0]
      this.report('fid', entry.processingStart - entry.startTime)
    }).observe({ type: 'first-input', buffered: true })

    // CLS
    let clsValue = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
    }).observe({ type: 'layout-shift', buffered: true })

    // 页面隐藏时上报 CLS
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.report('cls', clsValue)
      }
    })
  }

  collectNavigationMetrics() {
    const [navigation] = performance.getEntriesByType('navigation')
    if (!navigation) return

    this.report('navigation', {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ttfb: navigation.responseStart - navigation.requestStart,
      domReady: navigation.domContentLoadedEventEnd - navigation.startTime,
      load: navigation.loadEventEnd - navigation.startTime
    })
  }

  observeErrors() {
    window.onerror = (message, source, lineno, colno, error) => {
      this.report('error', {
        type: 'js',
        message,
        source,
        lineno,
        colno,
        stack: error?.stack
      })
    }

    window.addEventListener('unhandledrejection', (event) => {
      this.report('error', {
        type: 'promise',
        message: String(event.reason)
      })
    })
  }

  observeResources() {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 3000) {
          this.report('slow_resource', {
            name: entry.name,
            type: entry.initiatorType,
            duration: entry.duration
          })
        }
      }
    }).observe({ type: 'resource', buffered: true })
  }

  observeLongTasks() {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.report('long_task', {
          duration: entry.duration,
          startTime: entry.startTime
        })
      }
    }).observe({ type: 'longtask' })
  }

  report(type, data) {
    const payload = {
      type,
      data,
      url: location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    }

    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.options.reportUrl, JSON.stringify(payload))
    } else {
      fetch(this.options.reportUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true
      })
    }
  }
}

// 使用
new PerformanceMonitor({
  reportUrl: 'https://analytics.example.com/collect',
  sampleRate: 0.1  // 10% 采样
})
```

## 数据上报策略

### sendBeacon

```javascript
// 推荐：不阻塞页面卸载
navigator.sendBeacon('/analytics', JSON.stringify(data))
```

### 批量上报

```javascript
class Reporter {
  constructor() {
    this.queue = []
    this.timer = null
  }

  add(data) {
    this.queue.push(data)

    // 达到阈值立即上报
    if (this.queue.length >= 10) {
      this.flush()
      return
    }

    // 定时上报
    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), 5000)
    }
  }

  flush() {
    if (this.queue.length === 0) return

    const data = this.queue.splice(0)
    clearTimeout(this.timer)
    this.timer = null

    navigator.sendBeacon('/analytics/batch', JSON.stringify(data))
  }
}
```

### 页面卸载时上报

```javascript
// 监听页面隐藏
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    reporter.flush()
  }
})

// 监听页面卸载
window.addEventListener('pagehide', () => {
  reporter.flush()
})
```

