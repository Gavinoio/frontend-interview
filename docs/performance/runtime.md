# 运行时性能优化

## 概述

运行时性能优化关注页面加载后的用户交互体验，包括**渲染性能**、**JavaScript 执行效率**、**内存管理**等方面。

---

## 一、渲染性能优化

### 1. 理解浏览器渲染流程

```javascript
/**
 * 浏览器渲染流程 (像素管道):
 *
 * JavaScript → Style → Layout → Paint → Composite
 *    (JS)      (样式)   (布局)   (绘制)   (合成)
 *
 * 不同操作触发不同阶段:
 * - 修改几何属性 (width/height/top/left): 触发 Layout → Paint → Composite
 * - 修改绘制属性 (color/background): 触发 Paint → Composite
 * - 修改 transform/opacity: 只触发 Composite
 */

// 查看哪些属性触发重排/重绘: csstriggers.com
```

### 2. 减少重排 (Reflow)

```javascript
// 触发重排的操作:
// - 修改 width, height, padding, margin, border
// - 修改 position, display, float
// - 修改字体大小
// - 获取布局信息: offsetWidth, clientWidth, scrollTop, getBoundingClientRect()

// ❌ 读写交替,每次都触发同步重排
function bad() {
  for (let i = 0; i < 100; i++) {
    const width = element.offsetWidth  // 读 → 强制重排
    element.style.width = width + 10 + 'px'  // 写
  }
}

// ✅ 批量读取,批量写入
function good() {
  // 批量读取
  const widths = []
  for (let i = 0; i < 100; i++) {
    widths.push(elements[i].offsetWidth)
  }

  // 批量写入
  for (let i = 0; i < 100; i++) {
    elements[i].style.width = widths[i] + 10 + 'px'
  }
}

// ✅ 使用 requestAnimationFrame
function animateWidth() {
  requestAnimationFrame(() => {
    element.style.width = element.offsetWidth + 10 + 'px'
    if (element.offsetWidth < 500) {
      animateWidth()
    }
  })
}

// ✅ 使用 DocumentFragment 批量操作 DOM
function batchAppend(items) {
  const fragment = document.createDocumentFragment()

  items.forEach(item => {
    const div = document.createElement('div')
    div.textContent = item.text
    fragment.appendChild(div)
  })

  container.appendChild(fragment)  // 只触发一次重排
}

// ✅ 使用 display: none 临时隐藏元素
function complexOperation() {
  element.style.display = 'none'  // 从渲染树移除

  // 多次 DOM 操作
  element.style.width = '100px'
  element.style.height = '100px'
  element.style.padding = '20px'
  element.innerHTML = '<div>content</div>'

  element.style.display = 'block'  // 重新渲染
}

// ✅ 使用 cloneNode
function cloneAndModify() {
  const clone = element.cloneNode(true)

  // 在克隆节点上操作
  clone.style.width = '100px'
  clone.querySelector('.child').textContent = 'new text'

  element.parentNode.replaceChild(clone, element)  // 一次重排
}
```

### 3. 使用 CSS 硬件加速

```javascript
// 触发 GPU 加速的属性:
// - transform
// - opacity
// - filter
// - will-change

// ❌ 使用 top/left (触发重排)
function animatePosition() {
  let left = 0
  setInterval(() => {
    left++
    element.style.left = left + 'px'
  }, 16)
}

// ✅ 使用 transform (只触发合成)
function animateTransform() {
  let x = 0
  function animate() {
    x++
    element.style.transform = `translateX(${x}px)`
    if (x < 500) {
      requestAnimationFrame(animate)
    }
  }
  requestAnimationFrame(animate)
}

// ✅ 使用 CSS 动画
.animated {
  animation: slide 1s ease-in-out;
}

@keyframes slide {
  from { transform: translateX(0); }
  to { transform: translateX(500px); }
}

// ✅ will-change 提示浏览器
.will-animate {
  will-change: transform, opacity;
}

// 注意: will-change 不要滥用
// - 只在动画开始前添加
// - 动画结束后移除
element.addEventListener('mouseenter', () => {
  element.style.willChange = 'transform'
})

element.addEventListener('animationend', () => {
  element.style.willChange = 'auto'
})
```

### 4. 优化 CSS 选择器

```css
/* CSS 选择器匹配是从右到左的 */

/* ❌ 性能较差 */
.header .nav ul li a { }
div.content > p.text { }

/* ✅ 性能更好 */
.nav-link { }
.content-text { }

/* 选择器性能排序 (从快到慢):
 * 1. ID 选择器: #id
 * 2. Class 选择器: .class
 * 3. 标签选择器: div
 * 4. 相邻兄弟选择器: div + p
 * 5. 子选择器: div > p
 * 6. 后代选择器: div p
 * 7. 通配符选择器: *
 * 8. 属性选择器: [type="text"]
 * 9. 伪类/伪元素: :hover, ::before
 */

/* ❌ 避免使用通配符 */
* { margin: 0; padding: 0; }

/* ✅ 使用 reset.css 或 normalize.css */
```

---

## 二、JavaScript 执行优化

### 1. 防抖 (Debounce)

```javascript
/**
 * 防抖: 在事件触发后延迟执行,如果在延迟期间再次触发,重新计时
 * 应用场景: 搜索框输入、窗口 resize、表单验证
 */
function debounce(fn, delay = 300, immediate = false) {
  let timer = null

  return function(...args) {
    const context = this

    if (timer) clearTimeout(timer)

    if (immediate) {
      // 立即执行版本
      const callNow = !timer
      timer = setTimeout(() => {
        timer = null
      }, delay)

      if (callNow) {
        fn.apply(context, args)
      }
    } else {
      // 延迟执行版本
      timer = setTimeout(() => {
        fn.apply(context, args)
      }, delay)
    }
  }
}

// 使用
const handleSearch = debounce((keyword) => {
  console.log('搜索:', keyword)
  // API 请求
}, 500)

input.addEventListener('input', (e) => handleSearch(e.target.value))

// 带取消功能
function debounceWithCancel(fn, delay) {
  let timer = null

  const debounced = function(...args) {
    if (timer) clearTimeout(timer)

    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }

  debounced.cancel = function() {
    clearTimeout(timer)
    timer = null
  }

  return debounced
}
```

### 2. 节流 (Throttle)

```javascript
/**
 * 节流: 在固定时间间隔内只执行一次
 * 应用场景: 滚动事件、鼠标移动、拖拽
 */

// 时间戳版本 (首次立即执行)
function throttleTimestamp(fn, delay) {
  let lastTime = 0

  return function(...args) {
    const now = Date.now()

    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

// 定时器版本 (首次延迟执行)
function throttleTimer(fn, delay) {
  let timer = null

  return function(...args) {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args)
        timer = null
      }, delay)
    }
  }
}

// 完整版本 (首尾都执行)
function throttle(fn, delay, options = {}) {
  let timer = null
  let lastTime = 0
  const { leading = true, trailing = true } = options

  return function(...args) {
    const now = Date.now()

    if (!lastTime && !leading) {
      lastTime = now
    }

    const remaining = delay - (now - lastTime)

    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      fn.apply(this, args)
      lastTime = now
    } else if (!timer && trailing) {
      timer = setTimeout(() => {
        fn.apply(this, args)
        lastTime = leading ? Date.now() : 0
        timer = null
      }, remaining)
    }
  }
}

// 使用
const handleScroll = throttle(() => {
  console.log('滚动位置:', window.scrollY)
}, 200)

window.addEventListener('scroll', handleScroll)
```

### 3. 时间切片 (Time Slicing)

```javascript
/**
 * 时间切片: 将长任务拆分成小任务,避免阻塞主线程
 */

// 使用 requestIdleCallback
function processWithIdleCallback(tasks) {
  let index = 0

  function doWork(deadline) {
    // deadline.timeRemaining() 返回当前帧剩余时间
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

// 使用 setTimeout 模拟
function processWithTimeout(tasks, chunkSize = 5) {
  let index = 0

  function doChunk() {
    const end = Math.min(index + chunkSize, tasks.length)

    while (index < end) {
      tasks[index]()
      index++
    }

    if (index < tasks.length) {
      setTimeout(doChunk, 0)  // 让出主线程
    }
  }

  doChunk()
}

// 使用 Generator
function* taskGenerator(tasks) {
  for (const task of tasks) {
    yield task()
  }
}

function runTasks(tasks, onProgress) {
  const gen = taskGenerator(tasks)
  let completed = 0

  function next() {
    const start = performance.now()

    while (performance.now() - start < 5) {  // 每帧处理 5ms
      const { done } = gen.next()

      if (done) return

      completed++
      onProgress?.(completed / tasks.length)
    }

    requestAnimationFrame(next)
  }

  requestAnimationFrame(next)
}

// 示例: 渲染大量数据
function renderLargeList(data) {
  const container = document.getElementById('list')
  const tasks = data.map(item => () => {
    const div = document.createElement('div')
    div.textContent = item.text
    container.appendChild(div)
  })

  processWithTimeout(tasks)
}
```

### 4. Web Worker

```javascript
// 主线程
class WorkerPool {
  constructor(workerScript, poolSize = navigator.hardwareConcurrency || 4) {
    this.workers = []
    this.taskQueue = []
    this.workerStatus = []  // true = 空闲

    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript)
      this.workers.push(worker)
      this.workerStatus.push(true)

      worker.onmessage = (e) => {
        const { taskId, result, error } = e.data
        this.handleResult(i, taskId, result, error)
      }
    }
  }

  execute(task) {
    return new Promise((resolve, reject) => {
      const taskId = Date.now() + Math.random()
      const taskItem = { taskId, task, resolve, reject }

      // 找空闲 Worker
      const idleIndex = this.workerStatus.findIndex(status => status)

      if (idleIndex !== -1) {
        this.runTask(idleIndex, taskItem)
      } else {
        this.taskQueue.push(taskItem)
      }
    })
  }

  runTask(workerIndex, taskItem) {
    this.workerStatus[workerIndex] = false
    this.workers[workerIndex].taskItem = taskItem

    this.workers[workerIndex].postMessage({
      taskId: taskItem.taskId,
      task: taskItem.task
    })
  }

  handleResult(workerIndex, taskId, result, error) {
    const taskItem = this.workers[workerIndex].taskItem

    if (error) {
      taskItem.reject(error)
    } else {
      taskItem.resolve(result)
    }

    this.workerStatus[workerIndex] = true

    // 处理队列中的任务
    if (this.taskQueue.length > 0) {
      const nextTask = this.taskQueue.shift()
      this.runTask(workerIndex, nextTask)
    }
  }

  terminate() {
    this.workers.forEach(worker => worker.terminate())
  }
}

// worker.js
self.onmessage = async (e) => {
  const { taskId, task } = e.data

  try {
    // 执行计算密集型任务
    const result = await processTask(task)
    self.postMessage({ taskId, result })
  } catch (error) {
    self.postMessage({ taskId, error: error.message })
  }
}

function processTask(task) {
  // 复杂计算
  if (task.type === 'sort') {
    return task.data.sort((a, b) => a - b)
  }
  if (task.type === 'filter') {
    return task.data.filter(task.predicate)
  }
  // ...
}

// 使用
const pool = new WorkerPool('/worker.js', 4)

async function handleHeavyTask(data) {
  const result = await pool.execute({
    type: 'sort',
    data: data
  })
  console.log('排序结果:', result)
}
```

### 5. requestAnimationFrame

```javascript
/**
 * requestAnimationFrame 优势:
 * 1. 与浏览器刷新率同步 (通常 60fps)
 * 2. 页面不可见时自动暂停
 * 3. 浏览器会合并多次调用
 */

// 动画循环
function animate() {
  let start = null

  function frame(timestamp) {
    if (!start) start = timestamp
    const progress = timestamp - start

    // 更新动画
    const translateX = Math.min(progress / 10, 200)
    element.style.transform = `translateX(${translateX}px)`

    if (progress < 2000) {
      requestAnimationFrame(frame)
    }
  }

  requestAnimationFrame(frame)
}

// 帧率控制
function animateWithFPS(callback, fps = 60) {
  let lastTime = 0
  const interval = 1000 / fps

  function loop(currentTime) {
    const delta = currentTime - lastTime

    if (delta >= interval) {
      callback(currentTime)
      lastTime = currentTime - (delta % interval)
    }

    requestAnimationFrame(loop)
  }

  requestAnimationFrame(loop)
}

// 批量 DOM 更新
const updates = []

function scheduleUpdate(fn) {
  updates.push(fn)

  if (updates.length === 1) {
    requestAnimationFrame(flush)
  }
}

function flush() {
  const fns = updates.slice()
  updates.length = 0

  fns.forEach(fn => fn())
}

// 使用
scheduleUpdate(() => {
  element1.style.width = '100px'
})
scheduleUpdate(() => {
  element2.style.height = '200px'
})
// 会在同一帧执行
```

---

## 三、虚拟列表

### 1. 定高虚拟列表

```vue
<template>
  <div
    class="virtual-list"
    ref="containerRef"
    @scroll="handleScroll"
  >
    <!-- 撑开滚动区域 -->
    <div class="phantom" :style="{ height: totalHeight + 'px' }"></div>

    <!-- 可见内容 -->
    <div class="content" :style="{ transform: `translateY(${offset}px)` }">
      <div
        v-for="item in visibleItems"
        :key="item.id"
        class="item"
        :style="{ height: itemHeight + 'px' }"
      >
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  data: Array,
  itemHeight: { type: Number, default: 50 },
  bufferCount: { type: Number, default: 5 }
})

const containerRef = ref(null)
const scrollTop = ref(0)
const containerHeight = ref(0)

// 总高度
const totalHeight = computed(() => props.data.length * props.itemHeight)

// 可见数量
const visibleCount = computed(() =>
  Math.ceil(containerHeight.value / props.itemHeight)
)

// 起始索引
const startIndex = computed(() =>
  Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.bufferCount)
)

// 结束索引
const endIndex = computed(() =>
  Math.min(
    props.data.length,
    startIndex.value + visibleCount.value + 2 * props.bufferCount
  )
)

// 可见项
const visibleItems = computed(() =>
  props.data.slice(startIndex.value, endIndex.value)
)

// 偏移量
const offset = computed(() => startIndex.value * props.itemHeight)

// 滚动处理
function handleScroll(e) {
  scrollTop.value = e.target.scrollTop
}

onMounted(() => {
  containerHeight.value = containerRef.value.clientHeight
})
</script>

<style scoped>
.virtual-list {
  position: relative;
  height: 100%;
  overflow: auto;
}

.phantom {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.item {
  box-sizing: border-box;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  padding: 0 16px;
}
</style>
```

### 2. 不定高虚拟列表

```javascript
class VariableHeightVirtualList {
  constructor(options) {
    this.container = options.container
    this.data = options.data
    this.estimatedHeight = options.estimatedHeight || 50
    this.bufferCount = options.bufferCount || 5
    this.renderItem = options.renderItem

    // 位置缓存
    this.positions = this.data.map((_, index) => ({
      index,
      top: index * this.estimatedHeight,
      bottom: (index + 1) * this.estimatedHeight,
      height: this.estimatedHeight
    }))

    this.init()
  }

  init() {
    // 创建 DOM 结构
    this.container.style.position = 'relative'
    this.container.style.overflow = 'auto'

    this.phantom = document.createElement('div')
    this.phantom.style.position = 'absolute'
    this.phantom.style.top = '0'
    this.phantom.style.left = '0'
    this.phantom.style.right = '0'
    this.phantom.style.height = this.getTotalHeight() + 'px'

    this.content = document.createElement('div')
    this.content.style.position = 'absolute'
    this.content.style.top = '0'
    this.content.style.left = '0'
    this.content.style.right = '0'

    this.container.appendChild(this.phantom)
    this.container.appendChild(this.content)

    // 绑定滚动事件
    this.container.addEventListener('scroll', this.handleScroll.bind(this))

    // 初始渲染
    this.render()
  }

  // 获取总高度
  getTotalHeight() {
    return this.positions[this.positions.length - 1]?.bottom || 0
  }

  // 二分查找起始索引
  findStartIndex(scrollTop) {
    let left = 0
    let right = this.positions.length - 1

    while (left < right) {
      const mid = Math.floor((left + right) / 2)

      if (this.positions[mid].bottom <= scrollTop) {
        left = mid + 1
      } else {
        right = mid
      }
    }

    return left
  }

  // 滚动处理
  handleScroll(e) {
    const scrollTop = e.target.scrollTop
    this.render(scrollTop)
  }

  // 渲染
  render(scrollTop = 0) {
    const containerHeight = this.container.clientHeight

    // 计算可见范围
    const startIndex = Math.max(0, this.findStartIndex(scrollTop) - this.bufferCount)
    let endIndex = startIndex

    let totalHeight = 0
    while (endIndex < this.data.length && totalHeight < containerHeight + this.bufferCount * this.estimatedHeight) {
      totalHeight += this.positions[endIndex].height
      endIndex++
    }

    // 渲染可见项
    this.content.innerHTML = ''
    const fragment = document.createDocumentFragment()

    for (let i = startIndex; i < endIndex; i++) {
      const item = this.data[i]
      const el = this.renderItem(item, i)
      el.setAttribute('data-index', i)
      fragment.appendChild(el)
    }

    this.content.appendChild(fragment)

    // 设置偏移
    const offset = this.positions[startIndex]?.top || 0
    this.content.style.transform = `translateY(${offset}px)`

    // 更新实际高度
    this.updatePositions()
  }

  // 更新位置信息
  updatePositions() {
    const nodes = this.content.children

    for (const node of nodes) {
      const index = +node.getAttribute('data-index')
      const actualHeight = node.offsetHeight

      if (this.positions[index].height !== actualHeight) {
        const diff = actualHeight - this.positions[index].height

        this.positions[index].height = actualHeight
        this.positions[index].bottom += diff

        // 更新后续所有项的位置
        for (let i = index + 1; i < this.positions.length; i++) {
          this.positions[i].top += diff
          this.positions[i].bottom += diff
        }
      }
    }

    // 更新总高度
    this.phantom.style.height = this.getTotalHeight() + 'px'
  }
}

// 使用
const list = new VariableHeightVirtualList({
  container: document.getElementById('list'),
  data: items,
  estimatedHeight: 80,
  renderItem: (item, index) => {
    const div = document.createElement('div')
    div.className = 'list-item'
    div.innerHTML = `<h3>${item.title}</h3><p>${item.content}</p>`
    return div
  }
})
```

---

## 四、内存优化

### 1. 避免内存泄漏

```javascript
// 1. 及时清除定时器
class Component {
  constructor() {
    this.timer = setInterval(() => {
      this.update()
    }, 1000)
  }

  destroy() {
    clearInterval(this.timer)
    this.timer = null
  }
}

// 2. 移除事件监听
class ScrollHandler {
  constructor() {
    this.handleScroll = this.handleScroll.bind(this)
    window.addEventListener('scroll', this.handleScroll)
  }

  handleScroll() {
    // ...
  }

  destroy() {
    window.removeEventListener('scroll', this.handleScroll)
  }
}

// 3. 使用 WeakMap / WeakSet
// 弱引用,不阻止垃圾回收
const cache = new WeakMap()

function memoize(obj, key, compute) {
  if (!cache.has(obj)) {
    cache.set(obj, new Map())
  }

  const objCache = cache.get(obj)

  if (!objCache.has(key)) {
    objCache.set(key, compute())
  }

  return objCache.get(key)
}

// 4. 及时解除闭包引用
function createHandler() {
  const hugeData = new Array(1000000).fill('x')

  // ❌ 整个 hugeData 都被保留
  return () => console.log(hugeData[0])

  // ✅ 只保留需要的数据
  const firstItem = hugeData[0]
  return () => console.log(firstItem)
}

// 5. 避免循环引用
const obj1 = {}
const obj2 = {}
obj1.ref = obj2
obj2.ref = obj1

// 清除引用
function cleanup() {
  obj1.ref = null
  obj2.ref = null
}
```

### 2. 对象池

```javascript
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.pool = []

    // 预创建对象
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn())
    }
  }

  // 获取对象
  acquire() {
    return this.pool.length > 0
      ? this.pool.pop()
      : this.createFn()
  }

  // 归还对象
  release(obj) {
    this.resetFn(obj)
    this.pool.push(obj)
  }

  // 清空池
  clear() {
    this.pool = []
  }
}

// 使用示例: 粒子系统
const particlePool = new ObjectPool(
  // 创建
  () => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    color: '#fff'
  }),
  // 重置
  (particle) => {
    particle.x = 0
    particle.y = 0
    particle.vx = 0
    particle.vy = 0
    particle.life = 0
  },
  100
)

// 获取粒子
const particle = particlePool.acquire()
particle.x = Math.random() * canvas.width
particle.y = Math.random() * canvas.height
particle.life = 100

// 粒子死亡时归还
if (particle.life <= 0) {
  particlePool.release(particle)
}
```

### 3. 大数据处理

```javascript
// 分片处理
async function processLargeArray(data, processor, chunkSize = 1000) {
  const results = []

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)
    const chunkResults = chunk.map(processor)
    results.push(...chunkResults)

    // 让出主线程
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  return results
}

// 使用流式处理
function* processWithGenerator(data) {
  for (const item of data) {
    yield processItem(item)
  }
}

// 使用 Web Worker 处理
const worker = new Worker('data-processor.js')

worker.postMessage({ type: 'process', data: largeData })

worker.onmessage = (e) => {
  const { chunk, progress, done } = e.data

  if (done) {
    console.log('处理完成')
  } else {
    updateProgress(progress)
    displayChunk(chunk)
  }
}
```

---

