# 浏览器 Observer API 详解

## 概述

Observer 模式是一种设计模式，用于在对象状态发生变化时通知观察者。在浏览器中，Observer API 提供了一系列原生接口，用于监听和响应各种变化事件，如 DOM 变化、元素交叉、尺寸改变等。

**Observer 模式的优势：**
- **异步执行**：不阻塞主线程，性能更好
- **批量处理**：将多次变化合并为一次回调
- **声明式**：相比事件监听更简洁，自动管理生命周期
- **高效**：浏览器底层优化，性能优于轮询或频繁事件监听

浏览器提供的五个主要 Observer API：
1. IntersectionObserver - 观察元素可见性
2. MutationObserver - 观察 DOM 变化
3. ResizeObserver - 观察元素尺寸变化
4. PerformanceObserver - 观察性能指标
5. ReportingObserver - 观察浏览器报告

---

## 1. IntersectionObserver（交叉观察器）

### 是什么

IntersectionObserver 用于异步观察目标元素与其祖先元素或顶级文档视口（viewport）的交叉状态变化。它能告诉你一个元素是否进入了可视区域。

**核心概念：**
- **目标元素（target）**：被观察的元素
- **根元素（root）**：参照物，默认为视口
- **交叉比例（intersection ratio）**：目标元素可见部分占总面积的比例

### 使用场景

1. **图片懒加载**：当图片即将进入视口时才加载
2. **无限滚动**：滚动到底部时自动加载更多内容
3. **广告曝光统计**：统计广告是否被用户看到
4. **动画触发**：元素进入视口时触发动画
5. **数据埋点**：统计内容曝光率

### API 详解

#### 构造函数

```javascript
const observer = new IntersectionObserver(callback, options)
```

#### callback 参数

```javascript
function callback(entries, observer) {
  entries.forEach(entry => {
    // entry 包含以下关键属性：

    // 目标元素
    console.log(entry.target)

    // 交叉比例 (0.0 - 1.0)
    console.log(entry.intersectionRatio)

    // 是否交叉（进入视口）
    console.log(entry.isIntersecting)

    // 目标元素的边界信息
    console.log(entry.boundingClientRect)

    // 根元素的边界信息
    console.log(entry.rootBounds)

    // 交叉区域的边界信息
    console.log(entry.intersectionRect)

    // 时间戳
    console.log(entry.time)
  })
}
```

#### options 配置项

```javascript
const options = {
  // root: 根元素，默认为浏览器视口
  // 必须是目标元素的祖先元素
  root: document.querySelector('.container'),

  // rootMargin: 根元素的外边距
  // 用于扩大或缩小根元素的判定范围
  // 语法类似 CSS margin: "top right bottom left"
  rootMargin: '0px 0px -100px 0px', // 提前 100px 触发

  // threshold: 触发回调的交叉比例阈值
  // 可以是单个数字或数字数组
  threshold: [0, 0.25, 0.5, 0.75, 1.0]
  // 0: 刚进入视口时触发
  // 0.5: 元素 50% 可见时触发
  // 1.0: 元素完全可见时触发
}
```

#### 实例方法

```javascript
// 开始观察元素
observer.observe(targetElement)

// 停止观察元素
observer.unobserve(targetElement)

// 停止所有观察
observer.disconnect()

// 获取所有观察条目的当前交叉状态
const entries = observer.takeRecords()
```

### 完整示例

#### 1. 图片懒加载

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .lazy-image {
      width: 100%;
      height: 400px;
      background: #f0f0f0;
      display: block;
    }
    .image-container {
      margin: 50px 0;
    }
  </style>
</head>
<body>
  <div class="image-container">
    <img
      class="lazy-image"
      data-src="https://example.com/image1.jpg"
      alt="图片1"
    >
  </div>
  <div class="image-container">
    <img
      class="lazy-image"
      data-src="https://example.com/image2.jpg"
      alt="图片2"
    >
  </div>

  <script>
    // 懒加载实现
    class LazyLoader {
      constructor() {
        this.images = document.querySelectorAll('img[data-src]')
        this.observer = this.createObserver()
        this.observe()
      }

      createObserver() {
        const options = {
          root: null, // 使用视口
          rootMargin: '50px', // 提前 50px 开始加载
          threshold: 0.01 // 只要有 1% 进入视口就触发
        }

        return new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadImage(entry.target)
              observer.unobserve(entry.target) // 加载后停止观察
            }
          })
        }, options)
      }

      loadImage(img) {
        const src = img.dataset.src
        if (!src) return

        // 创建新图片对象预加载
        const image = new Image()

        image.onload = () => {
          img.src = src
          img.classList.add('loaded')
          img.removeAttribute('data-src')
        }

        image.onerror = () => {
          console.error(`Failed to load image: ${src}`)
          img.classList.add('error')
        }

        image.src = src
      }

      observe() {
        this.images.forEach(img => {
          this.observer.observe(img)
        })
      }

      destroy() {
        this.observer.disconnect()
      }
    }

    // 使用
    const lazyLoader = new LazyLoader()
  </script>
</body>
</html>
```

#### 2. 无限滚动

```javascript
class InfiniteScroll {
  constructor(options) {
    this.container = options.container
    this.loadMore = options.loadMore
    this.loading = false
    this.page = 1

    this.createSentinel()
    this.createObserver()
  }

  // 创建哨兵元素
  createSentinel() {
    this.sentinel = document.createElement('div')
    this.sentinel.className = 'scroll-sentinel'
    this.sentinel.style.height = '1px'
    this.container.appendChild(this.sentinel)
  }

  createObserver() {
    const options = {
      root: null,
      rootMargin: '200px', // 距离底部 200px 时触发
      threshold: 0
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.loading) {
          this.load()
        }
      })
    }, options)

    this.observer.observe(this.sentinel)
  }

  async load() {
    this.loading = true

    try {
      const hasMore = await this.loadMore(this.page)
      this.page++

      if (!hasMore) {
        this.destroy()
      }
    } catch (error) {
      console.error('Load more failed:', error)
    } finally {
      this.loading = false
    }
  }

  destroy() {
    this.observer.disconnect()
    this.sentinel.remove()
  }
}

// 使用示例
const scroll = new InfiniteScroll({
  container: document.querySelector('.list'),
  loadMore: async (page) => {
    const response = await fetch(`/api/items?page=${page}`)
    const data = await response.json()

    // 渲染数据
    data.items.forEach(item => {
      const el = document.createElement('div')
      el.textContent = item.title
      document.querySelector('.list').appendChild(el)
    })

    return data.hasMore
  }
})
```

#### 3. 元素曝光统计

```javascript
class ExposureTracker {
  constructor(options = {}) {
    this.threshold = options.threshold || 0.5 // 50% 可见算曝光
    this.duration = options.duration || 1000 // 持续 1 秒算有效曝光
    this.exposedElements = new Map() // 记录已曝光元素
    this.timers = new Map() // 记录定时器

    this.createObserver()
  }

  createObserver() {
    const options = {
      threshold: this.threshold
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 元素进入视口
          this.startTracking(entry.target)
        } else {
          // 元素离开视口
          this.stopTracking(entry.target)
        }
      })
    }, options)
  }

  startTracking(element) {
    // 如果已经曝光过，不再统计
    if (this.exposedElements.has(element)) return

    // 设置定时器，持续可见一定时间后算曝光
    const timer = setTimeout(() => {
      this.reportExposure(element)
      this.exposedElements.set(element, Date.now())
    }, this.duration)

    this.timers.set(element, timer)
  }

  stopTracking(element) {
    // 清除定时器
    const timer = this.timers.get(element)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(element)
    }
  }

  reportExposure(element) {
    const id = element.dataset.trackId
    const type = element.dataset.trackType

    console.log('元素曝光:', { id, type, element })

    // 发送埋点数据
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'exposure',
        id,
        type,
        timestamp: Date.now()
      })
    })
  }

  observe(element) {
    this.observer.observe(element)
  }

  unobserve(element) {
    this.stopTracking(element)
    this.observer.unobserve(element)
  }

  destroy() {
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()
    this.observer.disconnect()
  }
}

// 使用示例
const tracker = new ExposureTracker({
  threshold: 0.5,
  duration: 1000
})

// 观察广告元素
document.querySelectorAll('.ad-item').forEach(ad => {
  tracker.observe(ad)
})
```

---

## 2. MutationObserver（DOM变化观察器）

### 是什么

MutationObserver 用于监听 DOM 树的变化，包括节点的增删、属性变化、文本内容变化等。它可以在 DOM 发生变化时异步执行回调函数。

**取代了旧的 Mutation Events：**
- Mutation Events 是同步的，会阻塞页面
- MutationObserver 是异步的，性能更好
- 可以批量处理多个变化

### 使用场景

1. **监听 DOM 变化**：检测第三方脚本插入的内容
2. **富文本编辑器**：实现撤销/重做功能
3. **第三方脚本检测**：检测恶意脚本注入
4. **微任务实现**：Vue 2.x 的 nextTick 降级方案
5. **表单验证**：监听表单内容变化
6. **虚拟滚动**：监听列表项的增删

### API 详解

#### 构造函数

```javascript
const observer = new MutationObserver(callback)
```

#### callback 参数

```javascript
function callback(mutations, observer) {
  mutations.forEach(mutation => {
    // mutation 包含以下属性：

    // 变化类型: 'attributes' | 'characterData' | 'childList'
    console.log(mutation.type)

    // 发生变化的节点
    console.log(mutation.target)

    // 新增的节点列表 (NodeList)
    console.log(mutation.addedNodes)

    // 删除的节点列表 (NodeList)
    console.log(mutation.removedNodes)

    // 下一个兄弟节点
    console.log(mutation.nextSibling)

    // 上一个兄弟节点
    console.log(mutation.previousSibling)

    // 变化的属性名 (type 为 'attributes' 时)
    console.log(mutation.attributeName)

    // 变化的命名空间 (type 为 'attributes' 时)
    console.log(mutation.attributeNamespace)

    // 旧值 (需要在配置中开启)
    console.log(mutation.oldValue)
  })
}
```

#### observe 方法配置项

```javascript
observer.observe(targetNode, {
  // 观察子节点的变化（增删）
  childList: true,

  // 观察属性变化
  attributes: true,

  // 观察文本内容变化
  characterData: true,

  // 观察所有后代节点（不仅是子节点）
  subtree: true,

  // 记录属性的旧值
  attributeOldValue: true,

  // 记录文本的旧值
  characterDataOldValue: true,

  // 只观察特定属性（数组）
  attributeFilter: ['class', 'style']
})
```

#### 实例方法

```javascript
// 开始观察
observer.observe(targetNode, config)

// 停止观察
observer.disconnect()

// 获取并清空记录队列
const mutations = observer.takeRecords()
```

### 完整示例

#### 1. 监听 DOM 变化

```javascript
class DOMWatcher {
  constructor(target, options = {}) {
    this.target = target
    this.onChange = options.onChange || (() => {})

    this.observer = new MutationObserver((mutations) => {
      this.handleMutations(mutations)
    })

    this.observe()
  }

  observe() {
    const config = {
      childList: true,      // 监听子节点变化
      attributes: true,     // 监听属性变化
      characterData: true,  // 监听文本变化
      subtree: true,        // 监听所有后代节点
      attributeOldValue: true,
      characterDataOldValue: true
    }

    this.observer.observe(this.target, config)
  }

  handleMutations(mutations) {
    mutations.forEach(mutation => {
      switch (mutation.type) {
        case 'childList':
          this.handleChildList(mutation)
          break
        case 'attributes':
          this.handleAttributes(mutation)
          break
        case 'characterData':
          this.handleCharacterData(mutation)
          break
      }
    })

    this.onChange(mutations)
  }

  handleChildList(mutation) {
    // 处理节点增删
    mutation.addedNodes.forEach(node => {
      console.log('Added node:', node)
    })

    mutation.removedNodes.forEach(node => {
      console.log('Removed node:', node)
    })
  }

  handleAttributes(mutation) {
    const { target, attributeName, oldValue } = mutation
    const newValue = target.getAttribute(attributeName)

    console.log('Attribute changed:', {
      element: target,
      attribute: attributeName,
      oldValue,
      newValue
    })
  }

  handleCharacterData(mutation) {
    const { target, oldValue } = mutation
    const newValue = target.textContent

    console.log('Text changed:', {
      node: target,
      oldValue,
      newValue
    })
  }

  destroy() {
    this.observer.disconnect()
  }
}

// 使用示例
const watcher = new DOMWatcher(document.body, {
  onChange: (mutations) => {
    console.log(`检测到 ${mutations.length} 个变化`)
  }
})
```

#### 2. 富文本编辑器的撤销/重做

```javascript
class UndoRedoManager {
  constructor(editor) {
    this.editor = editor
    this.history = []
    this.currentIndex = -1
    this.maxHistory = 50
    this.isUndoRedo = false

    this.createObserver()
    this.saveState() // 保存初始状态
  }

  createObserver() {
    this.observer = new MutationObserver((mutations) => {
      // 如果是撤销/重做操作触发的变化，不记录
      if (this.isUndoRedo) return

      // 合并短时间内的多次变化
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.saveState()
      }, 300)
    })

    const config = {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true,
      characterDataOldValue: true
    }

    this.observer.observe(this.editor, config)
  }

  saveState() {
    const state = this.editor.innerHTML

    // 如果内容没变化，不保存
    if (this.history[this.currentIndex] === state) return

    // 删除当前位置之后的历史
    this.history = this.history.slice(0, this.currentIndex + 1)

    // 添加新状态
    this.history.push(state)
    this.currentIndex++

    // 限制历史记录数量
    if (this.history.length > this.maxHistory) {
      this.history.shift()
      this.currentIndex--
    }

    console.log('State saved:', this.currentIndex, '/', this.history.length - 1)
  }

  undo() {
    if (this.currentIndex <= 0) return

    this.currentIndex--
    this.restore()
  }

  redo() {
    if (this.currentIndex >= this.history.length - 1) return

    this.currentIndex++
    this.restore()
  }

  restore() {
    this.isUndoRedo = true
    const state = this.history[this.currentIndex]
    this.editor.innerHTML = state

    // 下一个微任务重置标志
    Promise.resolve().then(() => {
      this.isUndoRedo = false
    })
  }

  canUndo() {
    return this.currentIndex > 0
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1
  }

  destroy() {
    this.observer.disconnect()
    clearTimeout(this.timer)
  }
}

// 使用示例
const editor = document.querySelector('.editor')
const undoRedoManager = new UndoRedoManager(editor)

// 绑定快捷键
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      undoRedoManager.undo()
    } else if (e.key === 'z' && e.shiftKey) {
      e.preventDefault()
      undoRedoManager.redo()
    }
  }
})
```

#### 3. 检测第三方脚本注入

```javascript
class ScriptDetector {
  constructor() {
    this.whitelist = new Set([
      'https://trusted-cdn.com',
      'https://analytics.google.com'
    ])

    this.createObserver()
  }

  createObserver() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          this.checkNode(node)
        })
      })
    })

    const config = {
      childList: true,
      subtree: true
    }

    this.observer.observe(document.documentElement, config)
  }

  checkNode(node) {
    // 检查 script 标签
    if (node.nodeName === 'SCRIPT') {
      this.checkScript(node)
    }

    // 检查子节点中的 script
    if (node.querySelectorAll) {
      node.querySelectorAll('script').forEach(script => {
        this.checkScript(script)
      })
    }
  }

  checkScript(script) {
    const src = script.src

    if (!src) {
      // 内联脚本
      console.warn('检测到内联脚本:', script.textContent.slice(0, 100))
      this.handleSuspiciousScript(script, 'inline')
      return
    }

    // 检查是否在白名单中
    const isWhitelisted = Array.from(this.whitelist).some(domain =>
      src.startsWith(domain)
    )

    if (!isWhitelisted) {
      console.warn('检测到可疑脚本:', src)
      this.handleSuspiciousScript(script, 'external')
    }
  }

  handleSuspiciousScript(script, type) {
    // 上报可疑脚本
    this.report({
      type,
      src: script.src,
      content: script.textContent?.slice(0, 200),
      timestamp: Date.now()
    })

    // 可以选择阻止执行
    // script.type = 'text/plain'
    // script.remove()
  }

  report(data) {
    console.log('上报可疑脚本:', data)

    fetch('/api/security/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  }

  destroy() {
    this.observer.disconnect()
  }
}

// 使用
const detector = new ScriptDetector()
```

#### 4. Vue nextTick 的 MutationObserver 实现

```javascript
// Vue 2.x 的 nextTick 实现（简化版）
class NextTick {
  constructor() {
    this.callbacks = []
    this.pending = false
    this.timerFunc = this.getTimerFunc()
  }

  getTimerFunc() {
    // 优先级：Promise > MutationObserver > setImmediate > setTimeout

    if (typeof Promise !== 'undefined') {
      return () => {
        Promise.resolve().then(this.flushCallbacks.bind(this))
      }
    }

    if (typeof MutationObserver !== 'undefined') {
      // 使用 MutationObserver 创建微任务
      let counter = 1
      const observer = new MutationObserver(this.flushCallbacks.bind(this))
      const textNode = document.createTextNode(String(counter))

      observer.observe(textNode, {
        characterData: true
      })

      return () => {
        counter = (counter + 1) % 2
        textNode.data = String(counter)
      }
    }

    if (typeof setImmediate !== 'undefined') {
      return () => {
        setImmediate(this.flushCallbacks.bind(this))
      }
    }

    return () => {
      setTimeout(this.flushCallbacks.bind(this), 0)
    }
  }

  nextTick(cb, ctx) {
    return new Promise((resolve) => {
      this.callbacks.push(() => {
        if (cb) {
          try {
            cb.call(ctx)
          } catch (e) {
            console.error(e)
          }
        }
        resolve()
      })

      if (!this.pending) {
        this.pending = true
        this.timerFunc()
      }
    })
  }

  flushCallbacks() {
    this.pending = false
    const copies = this.callbacks.slice(0)
    this.callbacks.length = 0

    copies.forEach(cb => cb())
  }
}

// 使用示例
const nextTick = new NextTick()

console.log('1')
nextTick.nextTick(() => {
  console.log('2')
})
console.log('3')
// 输出: 1 3 2
```

---

## 3. ResizeObserver（尺寸变化观察器）

### 是什么

ResizeObserver 用于监听元素尺寸的变化，当元素的内容区域（content box）、内边距区域（padding box）或边框区域（border box）发生变化时触发回调。

**优势：**
- 比 window.resize 更精确，只监听特定元素
- 避免循环监听和性能问题
- 支持多种盒模型

### 使用场景

1. **响应式组件**：组件根据容器尺寸自适应
2. **图表自适应**：图表随容器大小变化而重绘
3. **虚拟列表**：动态计算列表项高度
4. **文字截断**：根据容器宽度动态截断文字
5. **布局系统**：实现复杂的响应式布局

### API 详解

#### 构造函数

```javascript
const observer = new ResizeObserver(callback)
```

#### callback 参数

```javascript
function callback(entries, observer) {
  entries.forEach(entry => {
    // entry 包含以下属性：

    // 目标元素
    console.log(entry.target)

    // 元素的 DOMRectReadOnly 对象
    console.log(entry.contentRect)

    // borderBoxSize: 边框盒尺寸（数组）
    console.log(entry.borderBoxSize[0].inlineSize)  // 宽度
    console.log(entry.borderBoxSize[0].blockSize)   // 高度

    // contentBoxSize: 内容盒尺寸（数组）
    console.log(entry.contentBoxSize[0].inlineSize)
    console.log(entry.contentBoxSize[0].blockSize)

    // devicePixelContentBoxSize: 设备像素内容盒尺寸
    console.log(entry.devicePixelContentBoxSize)
  })
}
```

#### observe 方法

```javascript
// 开始观察元素
observer.observe(element, {
  // 观察的盒模型类型
  box: 'content-box' // 'content-box' | 'border-box' | 'device-pixel-content-box'
})

// 停止观察元素
observer.unobserve(element)

// 停止所有观察
observer.disconnect()
```

### 完整示例

#### 1. 响应式图表组件

```javascript
class ResponsiveChart {
  constructor(container, options = {}) {
    this.container = container
    this.options = options
    this.chart = null

    this.createObserver()
    this.initChart()
  }

  createObserver() {
    this.observer = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        const { width, height } = entry.contentRect

        console.log('容器尺寸变化:', { width, height })

        // 防抖处理
        clearTimeout(this.resizeTimer)
        this.resizeTimer = setTimeout(() => {
          this.handleResize(width, height)
        }, 100)
      })
    })

    this.observer.observe(this.container)
  }

  initChart() {
    const { width, height } = this.container.getBoundingClientRect()

    this.chart = {
      width,
      height,
      data: this.options.data || []
    }

    this.render()
  }

  handleResize(width, height) {
    if (!this.chart) return

    // 更新图表尺寸
    this.chart.width = width
    this.chart.height = height

    // 重新渲染
    this.render()
  }

  render() {
    const { width, height, data } = this.chart

    // 清空容器
    this.container.innerHTML = ''

    // 创建 SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', width)
    svg.setAttribute('height', height)
    svg.style.border = '1px solid #ccc'

    // 绘制示例数据
    data.forEach((value, index) => {
      const barWidth = width / data.length - 10
      const barHeight = (value / 100) * height
      const x = index * (width / data.length) + 5
      const y = height - barHeight

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', x)
      rect.setAttribute('y', y)
      rect.setAttribute('width', barWidth)
      rect.setAttribute('height', barHeight)
      rect.setAttribute('fill', '#4CAF50')

      svg.appendChild(rect)
    })

    this.container.appendChild(svg)

    console.log('图表已渲染:', { width, height })
  }

  updateData(data) {
    this.chart.data = data
    this.render()
  }

  destroy() {
    this.observer.disconnect()
    clearTimeout(this.resizeTimer)
  }
}

// 使用示例
const chart = new ResponsiveChart(
  document.querySelector('.chart-container'),
  { data: [30, 60, 45, 80, 55, 70] }
)

// 更新数据
setTimeout(() => {
  chart.updateData([40, 70, 55, 90, 65, 80])
}, 2000)
```

#### 2. 容器查询（Container Queries）Polyfill

```javascript
class ContainerQuery {
  constructor() {
    this.containers = new Map()
    this.createObserver()
  }

  createObserver() {
    this.observer = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        const container = entry.target
        const { width } = entry.contentRect
        const queries = this.containers.get(container)

        if (queries) {
          this.applyQueries(container, width, queries)
        }
      })
    })
  }

  register(container, queries) {
    // queries 格式: { 'min-width: 600px': 'large', 'max-width: 599px': 'small' }
    this.containers.set(container, queries)
    this.observer.observe(container)

    // 立即应用一次
    const { width } = container.getBoundingClientRect()
    this.applyQueries(container, width, queries)
  }

  applyQueries(container, width, queries) {
    // 移除所有之前的类名
    Object.values(queries).forEach(className => {
      container.classList.remove(className)
    })

    // 应用匹配的类名
    Object.entries(queries).forEach(([query, className]) => {
      if (this.matchQuery(width, query)) {
        container.classList.add(className)
        console.log(`容器匹配查询 ${query}, 添加类名: ${className}`)
      }
    })
  }

  matchQuery(width, query) {
    // 简单解析查询字符串
    const minMatch = query.match(/min-width:\s*(\d+)px/)
    const maxMatch = query.match(/max-width:\s*(\d+)px/)

    if (minMatch && width < parseInt(minMatch[1])) {
      return false
    }

    if (maxMatch && width > parseInt(maxMatch[1])) {
      return false
    }

    return true
  }

  unregister(container) {
    this.observer.unobserve(container)
    this.containers.delete(container)
  }

  destroy() {
    this.observer.disconnect()
    this.containers.clear()
  }
}

// 使用示例
const cq = new ContainerQuery()

const container = document.querySelector('.responsive-container')
cq.register(container, {
  'min-width: 800px': 'container-large',
  'min-width: 500px and max-width: 799px': 'container-medium',
  'max-width: 499px': 'container-small'
})
```

#### 3. 虚拟列表动态高度计算

```javascript
class VirtualList {
  constructor(container, options = {}) {
    this.container = container
    this.items = options.items || []
    this.itemHeight = options.itemHeight || 50
    this.buffer = options.buffer || 3

    this.itemHeights = new Map() // 存储每个 item 的实际高度
    this.scrollTop = 0
    this.containerHeight = 0

    this.createObserver()
    this.init()
  }

  createObserver() {
    // 观察容器尺寸变化
    this.containerObserver = new ResizeObserver((entries) => {
      const { height } = entries[0].contentRect
      this.containerHeight = height
      this.render()
    })
    this.containerObserver.observe(this.container)

    // 观察列表项尺寸变化
    this.itemObserver = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        const item = entry.target
        const index = parseInt(item.dataset.index)
        const { height } = entry.contentRect

        // 更新高度缓存
        if (this.itemHeights.get(index) !== height) {
          this.itemHeights.set(index, height)
          this.updateOffsets()
        }
      })
    })
  }

  init() {
    this.container.style.position = 'relative'
    this.container.style.overflow = 'auto'

    // 创建滚动容器
    this.scrollContainer = document.createElement('div')
    this.scrollContainer.style.position = 'absolute'
    this.scrollContainer.style.width = '100%'
    this.container.appendChild(this.scrollContainer)

    // 监听滚动
    this.container.addEventListener('scroll', () => {
      this.scrollTop = this.container.scrollTop
      this.render()
    })

    this.render()
  }

  updateOffsets() {
    // 计算每个 item 的偏移量
    this.offsets = [0]
    for (let i = 0; i < this.items.length; i++) {
      const height = this.itemHeights.get(i) || this.itemHeight
      this.offsets.push(this.offsets[i] + height)
    }
  }

  getVisibleRange() {
    if (!this.offsets) {
      this.updateOffsets()
    }

    const start = this.scrollTop
    const end = start + this.containerHeight

    // 二分查找可见范围
    let startIndex = 0
    let endIndex = this.items.length - 1

    for (let i = 0; i < this.offsets.length; i++) {
      if (this.offsets[i] <= start) {
        startIndex = i
      }
      if (this.offsets[i] <= end) {
        endIndex = i
      }
    }

    // 添加缓冲
    startIndex = Math.max(0, startIndex - this.buffer)
    endIndex = Math.min(this.items.length - 1, endIndex + this.buffer)

    return { startIndex, endIndex }
  }

  render() {
    const { startIndex, endIndex } = this.getVisibleRange()

    // 清空当前渲染的项
    this.itemObserver.disconnect()
    this.scrollContainer.innerHTML = ''

    // 设置总高度
    const totalHeight = this.offsets ? this.offsets[this.offsets.length - 1] : this.items.length * this.itemHeight
    this.scrollContainer.style.height = `${totalHeight}px`

    // 渲染可见项
    for (let i = startIndex; i <= endIndex; i++) {
      const item = this.createItem(i)
      this.scrollContainer.appendChild(item)
      this.itemObserver.observe(item)
    }
  }

  createItem(index) {
    const item = document.createElement('div')
    item.dataset.index = index
    item.style.position = 'absolute'
    item.style.width = '100%'
    item.style.top = `${this.offsets ? this.offsets[index] : index * this.itemHeight}px`

    // 渲染内容
    item.innerHTML = this.items[index]

    return item
  }

  destroy() {
    this.containerObserver.disconnect()
    this.itemObserver.disconnect()
  }
}

// 使用示例
const items = Array.from({ length: 10000 }, (_, i) =>
  `<div style="padding: ${Math.random() * 20 + 10}px">Item ${i + 1}</div>`
)

const list = new VirtualList(
  document.querySelector('.virtual-list'),
  { items }
)
```

---

## 4. PerformanceObserver（性能观察器）

### 是什么

PerformanceObserver 用于监听和收集浏览器性能指标，可以观察各种性能条目（Performance Entries），如页面加载、资源加载、用户交互等性能数据。

**性能条目类型（entryTypes）：**
- `navigation` - 页面导航
- `resource` - 资源加载
- `mark` - 性能标记
- `measure` - 性能测量
- `paint` - 绘制时间（FP、FCP）
- `largest-contentful-paint` - 最大内容绘制（LCP）
- `first-input` - 首次输入延迟（FID）
- `layout-shift` - 布局偏移（CLS）
- `longtask` - 长任务

### 使用场景

1. **性能监控**：实时收集页面性能数据
2. **Web Vitals 采集**：收集 LCP、FID、CLS 等核心指标
3. **资源加载监控**：监控 JS、CSS、图片等资源加载时间
4. **用户体验监控**：监控用户交互响应时间
5. **性能优化**：定位性能瓶颈

### API 详解

#### 构造函数

```javascript
const observer = new PerformanceObserver(callback)
```

#### callback 参数

```javascript
function callback(list, observer) {
  // list 是 PerformanceObserverEntryList 对象

  // 获取所有条目
  const entries = list.getEntries()

  // 按类型获取条目
  const paintEntries = list.getEntriesByType('paint')

  // 按名称获取条目
  const markEntries = list.getEntriesByName('my-mark')

  entries.forEach(entry => {
    console.log('Performance entry:', {
      name: entry.name,
      type: entry.entryType,
      startTime: entry.startTime,
      duration: entry.duration
    })
  })
}
```

#### observe 方法

```javascript
// 观察特定类型的性能条目
observer.observe({
  entryTypes: ['paint', 'largest-contentful-paint', 'first-input']
})

// 观察单一类型（新语法）
observer.observe({
  type: 'layout-shift',
  buffered: true  // 包含之前已存在的条目
})

// 停止观察
observer.disconnect()

// 获取并清空缓冲的条目
const entries = observer.takeRecords()
```

#### 支持的 entryTypes

```javascript
// 检查浏览器支持的类型
const supportedTypes = PerformanceObserver.supportedEntryTypes
console.log(supportedTypes)
// ['navigation', 'resource', 'mark', 'measure', 'paint', ...]
```

### 完整示例

#### 1. Web Vitals 采集

```javascript
class WebVitals {
  constructor(options = {}) {
    this.onReport = options.onReport || console.log
    this.metrics = {
      FCP: null,  // First Contentful Paint
      LCP: null,  // Largest Contentful Paint
      FID: null,  // First Input Delay
      CLS: null,  // Cumulative Layout Shift
      TTFB: null  // Time to First Byte
    }

    this.clsScore = 0
    this.observers = []

    this.observeFCP()
    this.observeLCP()
    this.observeFID()
    this.observeCLS()
    this.observeTTFB()
  }

  // First Contentful Paint
  observeFCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()

      entries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.FCP = entry.startTime
          this.report('FCP', entry.startTime)
          observer.disconnect()
        }
      })
    })

    observer.observe({ type: 'paint', buffered: true })
    this.observers.push(observer)
  }

  // Largest Contentful Paint
  observeLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]

      this.metrics.LCP = lastEntry.startTime
      this.report('LCP', lastEntry.startTime)
    })

    observer.observe({ type: 'largest-contentful-paint', buffered: true })
    this.observers.push(observer)

    // LCP 在用户首次交互后就不再更新，所以监听交互事件
    const stopObserving = () => {
      observer.disconnect()
      this.finalizeMetric('LCP')
    }

    ;['keydown', 'click'].forEach(type => {
      window.addEventListener(type, stopObserving, { once: true, capture: true })
    })
  }

  // First Input Delay
  observeFID() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()

      entries.forEach(entry => {
        // FID 是 processingStart - startTime
        const fid = entry.processingStart - entry.startTime
        this.metrics.FID = fid
        this.report('FID', fid)
        observer.disconnect()
      })
    })

    observer.observe({ type: 'first-input', buffered: true })
    this.observers.push(observer)
  }

  // Cumulative Layout Shift
  observeCLS() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()

      entries.forEach(entry => {
        // 只统计没有用户输入的布局偏移
        if (!entry.hadRecentInput) {
          this.clsScore += entry.value
          this.metrics.CLS = this.clsScore
          this.report('CLS', this.clsScore)
        }
      })
    })

    observer.observe({ type: 'layout-shift', buffered: true })
    this.observers.push(observer)

    // 页面卸载时上报最终 CLS
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.finalizeMetric('CLS')
      }
    })
  }

  // Time to First Byte
  observeTTFB() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()

      entries.forEach(entry => {
        if (entry.entryType === 'navigation') {
          const ttfb = entry.responseStart - entry.requestStart
          this.metrics.TTFB = ttfb
          this.report('TTFB', ttfb)
          observer.disconnect()
        }
      })
    })

    observer.observe({ type: 'navigation', buffered: true })
    this.observers.push(observer)
  }

  report(metric, value) {
    console.log(`${metric}:`, value, 'ms')

    this.onReport({
      metric,
      value,
      rating: this.getRating(metric, value),
      timestamp: Date.now()
    })
  }

  finalizeMetric(metric) {
    const value = this.metrics[metric]
    if (value !== null) {
      console.log(`${metric} (final):`, value, 'ms')
    }
  }

  getRating(metric, value) {
    // 根据 Web Vitals 标准判断性能等级
    const thresholds = {
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      TTFB: { good: 800, poor: 1800 }
    }

    const threshold = thresholds[metric]
    if (!threshold) return 'unknown'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// 使用示例
const vitals = new WebVitals({
  onReport: (data) => {
    // 上报到分析平台
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  }
})
```

#### 2. 资源加载监控

```javascript
class ResourceMonitor {
  constructor() {
    this.resources = []
    this.createObserver()
  }

  createObserver() {
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()

      entries.forEach(entry => {
        this.analyzeResource(entry)
      })
    })

    this.observer.observe({ type: 'resource', buffered: true })
  }

  analyzeResource(entry) {
    const resource = {
      name: entry.name,
      type: this.getResourceType(entry),
      duration: entry.duration,
      size: entry.transferSize || 0,
      startTime: entry.startTime,

      // 详细时间分解
      timing: {
        dns: entry.domainLookupEnd - entry.domainLookupStart,
        tcp: entry.connectEnd - entry.connectStart,
        ssl: entry.secureConnectionStart ? entry.connectEnd - entry.secureConnectionStart : 0,
        ttfb: entry.responseStart - entry.requestStart,
        download: entry.responseEnd - entry.responseStart,
        total: entry.responseEnd - entry.startTime
      },

      // 缓存状态
      cached: entry.transferSize === 0 && entry.decodedBodySize > 0,

      // 协议
      protocol: entry.nextHopProtocol
    }

    this.resources.push(resource)
    this.checkPerformance(resource)
  }

  getResourceType(entry) {
    const initiatorType = entry.initiatorType
    const name = entry.name.toLowerCase()

    if (initiatorType === 'img' || /\.(png|jpg|jpeg|gif|svg|webp)/.test(name)) {
      return 'image'
    }
    if (initiatorType === 'script' || name.endsWith('.js')) {
      return 'script'
    }
    if (initiatorType === 'css' || name.endsWith('.css')) {
      return 'stylesheet'
    }
    if (initiatorType === 'xmlhttprequest' || initiatorType === 'fetch') {
      return 'xhr'
    }

    return initiatorType || 'other'
  }

  checkPerformance(resource) {
    // 检查加载时间过长的资源
    if (resource.duration > 3000) {
      console.warn('慢速资源:', resource.name, resource.duration + 'ms')
      this.reportSlowResource(resource)
    }

    // 检查大文件
    if (resource.size > 1024 * 1024) { // 1MB
      console.warn('大文件:', resource.name, (resource.size / 1024 / 1024).toFixed(2) + 'MB')
    }

    // 检查未缓存的静态资源
    if (!resource.cached && ['image', 'script', 'stylesheet'].includes(resource.type)) {
      console.info('未缓存资源:', resource.name)
    }
  }

  reportSlowResource(resource) {
    fetch('/api/performance/slow-resource', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: resource.name,
        type: resource.type,
        duration: resource.duration,
        size: resource.size,
        timing: resource.timing,
        timestamp: Date.now()
      })
    })
  }

  getReport() {
    // 按类型分组统计
    const byType = this.resources.reduce((acc, resource) => {
      if (!acc[resource.type]) {
        acc[resource.type] = {
          count: 0,
          totalSize: 0,
          totalDuration: 0,
          cached: 0
        }
      }

      acc[resource.type].count++
      acc[resource.type].totalSize += resource.size
      acc[resource.type].totalDuration += resource.duration
      if (resource.cached) acc[resource.type].cached++

      return acc
    }, {})

    return {
      total: this.resources.length,
      byType,
      slowest: this.resources.sort((a, b) => b.duration - a.duration).slice(0, 10),
      largest: this.resources.sort((a, b) => b.size - a.size).slice(0, 10)
    }
  }

  destroy() {
    this.observer.disconnect()
  }
}

// 使用示例
const monitor = new ResourceMonitor()

// 页面加载完成后查看报告
window.addEventListener('load', () => {
  setTimeout(() => {
    console.log('资源加载报告:', monitor.getReport())
  }, 1000)
})
```

#### 3. 长任务监控

```javascript
class LongTaskMonitor {
  constructor(options = {}) {
    this.threshold = options.threshold || 50 // 超过 50ms 算长任务
    this.onLongTask = options.onLongTask || console.warn
    this.tasks = []

    this.createObserver()
  }

  createObserver() {
    // 检查浏览器是否支持
    if (!PerformanceObserver.supportedEntryTypes.includes('longtask')) {
      console.warn('浏览器不支持 longtask 监控')
      return
    }

    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()

      entries.forEach(entry => {
        this.handleLongTask(entry)
      })
    })

    this.observer.observe({ type: 'longtask', buffered: true })
  }

  handleLongTask(entry) {
    const task = {
      name: entry.name,
      duration: entry.duration,
      startTime: entry.startTime,
      attribution: entry.attribution?.[0]?.name || 'unknown'
    }

    this.tasks.push(task)

    console.warn('检测到长任务:', {
      duration: task.duration.toFixed(2) + 'ms',
      startTime: task.startTime.toFixed(2) + 'ms',
      attribution: task.attribution
    })

    this.onLongTask(task)
  }

  getReport() {
    return {
      totalTasks: this.tasks.length,
      totalBlockingTime: this.tasks.reduce((sum, task) => {
        // 只计算超过 50ms 的部分
        return sum + Math.max(0, task.duration - 50)
      }, 0),
      longestTask: this.tasks.reduce((max, task) =>
        task.duration > max.duration ? task : max
      , { duration: 0 }),
      tasks: this.tasks
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// 使用示例
const longTaskMonitor = new LongTaskMonitor({
  onLongTask: (task) => {
    // 上报长任务
    if (task.duration > 100) {
      fetch('/api/performance/long-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      })
    }
  }
})

// 查看报告
setTimeout(() => {
  console.log('长任务报告:', longTaskMonitor.getReport())
}, 5000)
```

---

## 5. ReportingObserver（报告观察器）

### 是什么

ReportingObserver 用于收集浏览器生成的各种报告，包括：
- **Deprecation（弃用警告）**：使用已弃用的 API
- **Intervention（干预）**：浏览器阻止某些操作
- **Crash（崩溃）**：页面崩溃报告

这个 API 可以帮助开发者及时发现代码中使用的过时 API 和潜在问题。

### 使用场景

1. **监控代码弃用警告**：检测项目中使用的已弃用 API
2. **浏览器干预检测**：了解浏览器阻止了哪些操作
3. **兼容性问题排查**：提前发现兼容性问题
4. **代码质量监控**：确保代码使用最新的最佳实践

### API 详解

#### 构造函数

```javascript
const observer = new ReportingObserver(callback, options)
```

#### callback 参数

```javascript
function callback(reports, observer) {
  reports.forEach(report => {
    // report 包含以下属性：

    // 报告类型: 'deprecation' | 'intervention' | 'crash'
    console.log(report.type)

    // 报告的 URL
    console.log(report.url)

    // 报告主体
    console.log(report.body)
    // {
    //   id: 'string',              // 报告 ID
    //   message: 'string',         // 描述信息
    //   sourceFile: 'string',      // 源文件
    //   lineNumber: number,        // 行号
    //   columnNumber: number       // 列号
    // }
  })
}
```

#### options 配置

```javascript
const options = {
  // 报告类型，可以是数组
  types: ['deprecation', 'intervention'],

  // 是否包含之前缓冲的报告
  buffered: true
}
```

#### 实例方法

```javascript
// 开始观察
observer.observe()

// 停止观察
observer.disconnect()

// 获取并清空缓冲的报告
const reports = observer.takeRecords()
```

### 完整示例

#### 1. 监控弃用 API 和浏览器干预

```javascript
class DeprecationMonitor {
  constructor(options = {}) {
    this.onReport = options.onReport || console.warn
    this.reports = []

    this.createObserver()
  }

  createObserver() {
    // 检查浏览器支持
    if (typeof ReportingObserver === 'undefined') {
      console.warn('浏览器不支持 ReportingObserver')
      return
    }

    this.observer = new ReportingObserver((reports) => {
      reports.forEach(report => {
        this.handleReport(report)
      })
    }, {
      types: ['deprecation', 'intervention'],
      buffered: true
    })

    this.observer.observe()
  }

  handleReport(report) {
    const reportData = {
      type: report.type,
      url: report.url,
      id: report.body.id,
      message: report.body.message,
      sourceFile: report.body.sourceFile,
      lineNumber: report.body.lineNumber,
      columnNumber: report.body.columnNumber,
      timestamp: Date.now()
    }

    this.reports.push(reportData)

    if (report.type === 'deprecation') {
      console.warn('弃用警告:', reportData.message)
      console.warn('位置:', `${reportData.sourceFile}:${reportData.lineNumber}:${reportData.columnNumber}`)
    } else if (report.type === 'intervention') {
      console.warn('浏览器干预:', reportData.message)
    }

    this.onReport(reportData)
  }

  getReport() {
    const deprecations = this.reports.filter(r => r.type === 'deprecation')
    const interventions = this.reports.filter(r => r.type === 'intervention')

    return {
      total: this.reports.length,
      deprecations: {
        count: deprecations.length,
        items: deprecations
      },
      interventions: {
        count: interventions.length,
        items: interventions
      },
      byId: this.groupById()
    }
  }

  groupById() {
    return this.reports.reduce((acc, report) => {
      const id = report.id
      if (!acc[id]) {
        acc[id] = {
          id,
          type: report.type,
          message: report.message,
          count: 0,
          locations: []
        }
      }

      acc[id].count++
      acc[id].locations.push({
        file: report.sourceFile,
        line: report.lineNumber,
        column: report.columnNumber
      })

      return acc
    }, {})
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// 使用示例
const deprecationMonitor = new DeprecationMonitor({
  onReport: (report) => {
    // 上报到监控平台
    fetch('/api/monitoring/deprecation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    })
  }
})

// 查看报告
setTimeout(() => {
  console.log('弃用报告:', deprecationMonitor.getReport())
}, 3000)

// 触发弃用警告的示例代码
// document.write('test')  // 已弃用
// window.webkitStorageInfo  // 已弃用
```

#### 2. 完整的监控系统

```javascript
class BrowserReportingSystem {
  constructor() {
    this.reports = {
      deprecation: [],
      intervention: [],
      crash: []
    }

    this.init()
  }

  init() {
    if (typeof ReportingObserver === 'undefined') {
      console.warn('ReportingObserver not supported')
      return
    }

    // 创建观察器
    this.observer = new ReportingObserver((reports) => {
      this.processReports(reports)
    }, {
      types: ['deprecation', 'intervention'],
      buffered: true
    })

    this.observer.observe()

    // 页面卸载时上报
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.sendBatch()
      }
    })
  }

  processReports(reports) {
    reports.forEach(report => {
      const type = report.type
      const data = {
        id: report.body.id,
        message: report.body.message,
        url: report.url,
        sourceFile: report.body.sourceFile,
        lineNumber: report.body.lineNumber,
        columnNumber: report.body.columnNumber,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      }

      this.reports[type].push(data)

      // 实时展示
      this.displayReport(type, data)
    })

    // 批量上报（防抖）
    clearTimeout(this.batchTimer)
    this.batchTimer = setTimeout(() => {
      this.sendBatch()
    }, 5000)
  }

  displayReport(type, data) {
    const color = type === 'deprecation' ? '#ff9800' : '#f44336'

    console.group(`%c${type.toUpperCase()}`, `color: ${color}; font-weight: bold`)
    console.log('Message:', data.message)
    console.log('Location:', `${data.sourceFile}:${data.lineNumber}:${data.columnNumber}`)
    console.log('ID:', data.id)
    console.groupEnd()
  }

  sendBatch() {
    const hasReports = Object.values(this.reports).some(arr => arr.length > 0)

    if (!hasReports) return

    const payload = {
      deprecations: this.reports.deprecation,
      interventions: this.reports.intervention,
      crashes: this.reports.crash,
      meta: {
        url: location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      }
    }

    // 使用 sendBeacon 确保数据发送
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
    navigator.sendBeacon('/api/reports', blob)

    // 清空已上报的数据
    this.reports = {
      deprecation: [],
      intervention: [],
      crash: []
    }
  }

  getSummary() {
    return {
      deprecations: this.reports.deprecation.length,
      interventions: this.reports.intervention.length,
      crashes: this.reports.crash.length,
      details: this.reports
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect()
    }
    clearTimeout(this.batchTimer)
  }
}

// 使用示例
const reportingSystem = new BrowserReportingSystem()

// 查看摘要
console.log('报告摘要:', reportingSystem.getSummary())
```

---

## Observer 对比总结表

| Observer | 观察对象 | 主要用途 | 回调时机 | 性能影响 | 兼容性 |
|----------|---------|---------|---------|---------|--------|
| **IntersectionObserver** | 元素与视口/父元素的交叉状态 | 图片懒加载、无限滚动、曝光统计、动画触发 | 元素进入/离开视口时 | 低（异步） | Chrome 51+ |
| **MutationObserver** | DOM 树的变化 | 监听 DOM 变化、富文本编辑器、第三方脚本检测 | DOM 变化后（微任务） | 中（大量变化时） | Chrome 26+ |
| **ResizeObserver** | 元素尺寸变化 | 响应式组件、图表自适应、虚拟列表 | 元素尺寸改变后 | 低（异步） | Chrome 64+ |
| **PerformanceObserver** | 性能指标 | 性能监控、Web Vitals、资源加载监控 | 性能条目生成时 | 极低 | Chrome 52+ |
| **ReportingObserver** | 浏览器报告 | 弃用警告、浏览器干预检测 | 报告生成时 | 极低 | Chrome 69+ |

### 共同特点

1. **异步执行**：所有 Observer 都是异步的，不会阻塞主线程
2. **批量处理**：将多次变化合并为一次回调，提高性能
3. **声明式**：相比事件监听更简洁，自动管理生命周期
4. **可取消**：都提供 `disconnect()` 方法停止观察

### 使用建议

- **IntersectionObserver**：替代 scroll 事件进行可见性检测
- **MutationObserver**：替代 MutationEvents，监听 DOM 变化
- **ResizeObserver**：替代 window.resize 监听元素尺寸
- **PerformanceObserver**：替代直接读取 performance API
- **ReportingObserver**：开发阶段启用，生产环境可选

---

## 面试题

::: details 1. IntersectionObserver 如何实现图片懒加载？
**答案：**

图片懒加载的核心思路是：先不设置 img 的 src，将真实 URL 存在 data-src 中，当图片进入视口时再加载。

```javascript
// 1. HTML 结构
<img data-src="real-image.jpg" alt="图片">

// 2. 创建 Observer
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target
      const src = img.dataset.src

      // 加载图片
      img.src = src

      // 加载完成后停止观察
      img.onload = () => {
        img.removeAttribute('data-src')
        observer.unobserve(img)
      }
    }
  })
}, {
  rootMargin: '50px' // 提前 50px 加载
})

// 3. 观察所有图片
document.querySelectorAll('img[data-src]').forEach(img => {
  imageObserver.observe(img)
})
```

**优势：**
- 自动化管理，无需手动监听 scroll
- 性能好，异步执行
- 可配置提前加载距离（rootMargin）

---
:::

::: details 2. MutationObserver 和 Vue 的 nextTick 有什么关系？
**答案：**

Vue 2.x 的 `nextTick` 使用了微任务队列，优先级为：
1. **Promise.then** （首选）
2. **MutationObserver** （降级方案）
3. **setImmediate** （仅 IE）
4. **setTimeout** （最后兜底）

**MutationObserver 实现微任务：**

```javascript
const callbacks = []
let pending = false

// 创建文本节点
const textNode = document.createTextNode('0')

// 创建观察器
const observer = new MutationObserver(() => {
  // 微任务中执行所有回调
  const copies = callbacks.slice(0)
  callbacks.length = 0
  pending = false
  copies.forEach(cb => cb())
})

// 观察文本节点
observer.observe(textNode, { characterData: true })

function nextTick(cb) {
  callbacks.push(cb)

  if (!pending) {
    pending = true
    // 触发 MutationObserver（微任务）
    textNode.data = String(Math.random())
  }
}
```

**为什么用 MutationObserver？**
- 在不支持 Promise 的环境中，MutationObserver 可以创建微任务
- 微任务在 DOM 更新后、浏览器渲染前执行，正好适合 nextTick 的需求

---
:::

::: details 3. 如何用 PerformanceObserver 监控页面性能？
**答案：**

监控页面性能需要采集多个指标，包括：

```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = {}
    this.init()
  }

  init() {
    // 1. 监控 FCP（首次内容绘制）
    this.observePaint()

    // 2. 监控 LCP（最大内容绘制）
    this.observeLCP()

    // 3. 监控 FID（首次输入延迟）
    this.observeFID()

    // 4. 监控 CLS（累积布局偏移）
    this.observeCLS()

    // 5. 监控资源加载
    this.observeResource()

    // 6. 监控长任务
    this.observeLongTask()
  }

  observePaint() {
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.FCP = entry.startTime
          console.log('FCP:', entry.startTime)
        }
      })
    }).observe({ type: 'paint', buffered: true })
  }

  observeLCP() {
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.metrics.LCP = lastEntry.startTime
      console.log('LCP:', lastEntry.startTime)
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  }

  observeFID() {
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        const fid = entry.processingStart - entry.startTime
        this.metrics.FID = fid
        console.log('FID:', fid)
      })
    }).observe({ type: 'first-input', buffered: true })
  }

  observeCLS() {
    let clsScore = 0
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value
          this.metrics.CLS = clsScore
          console.log('CLS:', clsScore)
        }
      })
    }).observe({ type: 'layout-shift', buffered: true })
  }

  observeResource() {
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.duration > 1000) {
          console.warn('慢速资源:', entry.name, entry.duration)
        }
      })
    }).observe({ type: 'resource', buffered: true })
  }

  observeLongTask() {
    if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
      new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          console.warn('长任务:', entry.duration, 'ms')
        })
      }).observe({ type: 'longtask', buffered: true })
    }
  }

  getMetrics() {
    return this.metrics
  }
}

// 使用
const monitor = new PerformanceMonitor()
window.addEventListener('load', () => {
  setTimeout(() => {
    console.log('性能指标:', monitor.getMetrics())
  }, 3000)
})
```

---
:::

::: details 4. 这些 Observer 相比传统的事件监听有什么优势？
**答案：**

| 对比维度 | Observer API | 传统事件监听 |
|---------|-------------|------------|
| **性能** | 异步执行，批量处理 | 同步执行，频繁触发 |
| **精确度** | 专门针对特定场景优化 | 需要额外计算判断 |
| **代码复杂度** | 简洁，声明式 | 复杂，需要防抖节流 |
| **内存管理** | 自动管理生命周期 | 需要手动解绑 |
| **浏览器优化** | 底层优化 | 依赖开发者优化 |

**具体示例：**

**1. IntersectionObserver vs scroll 事件**

```javascript
// 传统方式：scroll 事件
window.addEventListener('scroll', throttle(() => {
  const rect = element.getBoundingClientRect()
  if (rect.top < window.innerHeight) {
    // 进入视口
  }
}, 100))

// Observer 方式
new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    // 进入视口
  }
}).observe(element)
```

**优势：**
- 不需要手动计算位置
- 不需要防抖/节流
- 性能更好（浏览器底层优化）

**2. ResizeObserver vs window.resize**

```javascript
// 传统方式
window.addEventListener('resize', debounce(() => {
  const width = element.offsetWidth
  // 处理尺寸变化
}, 200))

// Observer 方式
new ResizeObserver((entries) => {
  const width = entries[0].contentRect.width
  // 处理尺寸变化
}).observe(element)
```

**优势：**
- 只监听特定元素，不是整个窗口
- 自动批量处理
- 无需防抖

**总结：**
Observer API 是浏览器提供的现代化解决方案，专门针对特定场景优化，比传统事件监听更高效、更简洁、更易维护。
:::
