# 虚拟列表与无限滚动

## 概述

虚拟列表（Virtual List）和无限滚动（Infinite Scroll）是处理大量数据渲染的核心技术。面试中经常考察其原理和实现。

---

## 一、虚拟列表原理

### 什么是虚拟列表

虚拟列表是一种**只渲染可见区域**数据的优化技术。当列表有成千上万条数据时，只渲染用户看得见的几十条，大大减少 DOM 节点数量。

```
┌─────────────────────────────────────────┐
│              虚拟列表原理                  │
├─────────────────────────────────────────┤
│                                          │
│  ┌─────────────────────────────────┐    │
│  │    占位区域 (撑起滚动高度)         │    │
│  │    height: 总高度                 │    │
│  │                                   │    │
│  │  ┌───────────────────────────┐  │    │
│  │  │   可视区域                  │  │    │
│  │  │   (只渲染这部分数据)         │  │    │
│  │  │                            │  │    │
│  │  │   Item 10                  │  │    │
│  │  │   Item 11                  │  │    │
│  │  │   Item 12                  │  │    │
│  │  │   Item 13                  │  │    │
│  │  │   Item 14                  │  │    │
│  │  │                            │  │    │
│  │  └───────────────────────────┘  │    │
│  │                                   │    │
│  └─────────────────────────────────┘    │
│                                          │
└─────────────────────────────────────────┘
```

### 核心概念

```javascript
/**
 * 虚拟列表核心概念:
 *
 * 1. 可视区域 (Viewport): 用户能看到的区域
 * 2. 可视区域高度 (viewportHeight): 可视区域的高度
 * 3. 列表项高度 (itemHeight): 每个列表项的高度
 * 4. 列表总高度 (totalHeight): 所有数据的总高度
 * 5. 起始索引 (startIndex): 可视区域第一条数据的索引
 * 6. 结束索引 (endIndex): 可视区域最后一条数据的索引
 * 7. 偏移量 (offset): 可视区域距离顶部的距离
 * 8. 缓冲区 (buffer): 上下预渲染的额外数据
 */
```

---

## 二、定高虚拟列表

### 基础实现

```javascript
/**
 * 定高虚拟列表 (每个列表项高度相同)
 *
 * 核心公式:
 * - 总高度 = 数据总数 × 单项高度
 * - 起始索引 = Math.floor(滚动距离 / 单项高度)
 * - 偏移量 = 起始索引 × 单项高度
 */

class FixedHeightVirtualList {
  constructor(options) {
    this.container = options.container      // 容器元素
    this.data = options.data                // 数据源
    this.itemHeight = options.itemHeight    // 单项高度
    this.bufferSize = options.bufferSize || 5  // 缓冲区大小
    this.renderItem = options.renderItem    // 渲染函数

    this.scrollTop = 0
    this.init()
  }

  init() {
    // 创建 DOM 结构
    this.container.innerHTML = `
      <div class="virtual-list-phantom"></div>
      <div class="virtual-list-content"></div>
    `

    this.phantom = this.container.querySelector('.virtual-list-phantom')
    this.content = this.container.querySelector('.virtual-list-content')

    // 设置样式
    this.container.style.position = 'relative'
    this.container.style.overflow = 'auto'

    this.phantom.style.position = 'absolute'
    this.phantom.style.left = '0'
    this.phantom.style.top = '0'
    this.phantom.style.right = '0'

    this.content.style.position = 'absolute'
    this.content.style.left = '0'
    this.content.style.right = '0'
    this.content.style.top = '0'

    // 设置总高度
    this.updatePhantomHeight()

    // 监听滚动
    this.container.addEventListener('scroll', this.handleScroll.bind(this))

    // 首次渲染
    this.render()
  }

  // 计算可视区域数据
  getVisibleRange() {
    const viewportHeight = this.container.clientHeight

    // 起始索引
    let startIndex = Math.floor(this.scrollTop / this.itemHeight) - this.bufferSize
    startIndex = Math.max(0, startIndex)

    // 结束索引
    let endIndex = Math.ceil((this.scrollTop + viewportHeight) / this.itemHeight) + this.bufferSize
    endIndex = Math.min(this.data.length, endIndex)

    return { startIndex, endIndex }
  }

  // 计算偏移量
  getOffset(startIndex) {
    return startIndex * this.itemHeight
  }

  // 更新占位元素高度
  updatePhantomHeight() {
    const totalHeight = this.data.length * this.itemHeight
    this.phantom.style.height = `${totalHeight}px`
  }

  // 滚动处理
  handleScroll(e) {
    this.scrollTop = e.target.scrollTop
    this.render()
  }

  // 渲染可视区域
  render() {
    const { startIndex, endIndex } = this.getVisibleRange()
    const offset = this.getOffset(startIndex)

    // 设置偏移
    this.content.style.transform = `translateY(${offset}px)`

    // 渲染数据
    const visibleData = this.data.slice(startIndex, endIndex)
    this.content.innerHTML = visibleData
      .map((item, index) => this.renderItem(item, startIndex + index))
      .join('')
  }

  // 更新数据
  updateData(newData) {
    this.data = newData
    this.updatePhantomHeight()
    this.render()
  }

  // 滚动到指定索引
  scrollToIndex(index) {
    const offset = index * this.itemHeight
    this.container.scrollTop = offset
  }

  // 销毁
  destroy() {
    this.container.removeEventListener('scroll', this.handleScroll)
    this.container.innerHTML = ''
  }
}

// 使用示例
const virtualList = new FixedHeightVirtualList({
  container: document.getElementById('list'),
  data: Array.from({ length: 100000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`
  })),
  itemHeight: 50,
  bufferSize: 5,
  renderItem: (item, index) => `
    <div class="list-item" style="height: 50px; border-bottom: 1px solid #eee;">
      ${item.name}
    </div>
  `
})
```

### Vue 3 实现

```vue
<template>
  <div
    ref="containerRef"
    class="virtual-list-container"
    :style="{ height: containerHeight + 'px' }"
    @scroll="handleScroll"
  >
    <!-- 占位元素 -->
    <div
      class="virtual-list-phantom"
      :style="{ height: totalHeight + 'px' }"
    ></div>

    <!-- 内容区域 -->
    <div
      class="virtual-list-content"
      :style="{ transform: `translateY(${offset}px)` }"
    >
      <div
        v-for="item in visibleData"
        :key="item.id"
        class="virtual-list-item"
        :style="{ height: itemHeight + 'px' }"
      >
        <slot :item="item" :index="item._index"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  // 数据源
  data: {
    type: Array,
    required: true
  },
  // 单项高度
  itemHeight: {
    type: Number,
    default: 50
  },
  // 容器高度
  containerHeight: {
    type: Number,
    default: 400
  },
  // 缓冲区大小
  bufferSize: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['scroll'])

const containerRef = ref(null)
const scrollTop = ref(0)

// 总高度
const totalHeight = computed(() => {
  return props.data.length * props.itemHeight
})

// 可视区域能显示的数量
const visibleCount = computed(() => {
  return Math.ceil(props.containerHeight / props.itemHeight)
})

// 起始索引
const startIndex = computed(() => {
  const index = Math.floor(scrollTop.value / props.itemHeight) - props.bufferSize
  return Math.max(0, index)
})

// 结束索引
const endIndex = computed(() => {
  const index = startIndex.value + visibleCount.value + props.bufferSize * 2
  return Math.min(props.data.length, index)
})

// 偏移量
const offset = computed(() => {
  return startIndex.value * props.itemHeight
})

// 可视数据
const visibleData = computed(() => {
  return props.data.slice(startIndex.value, endIndex.value).map((item, index) => ({
    ...item,
    _index: startIndex.value + index
  }))
})

// 滚动处理
function handleScroll(e) {
  scrollTop.value = e.target.scrollTop
  emit('scroll', {
    scrollTop: scrollTop.value,
    startIndex: startIndex.value,
    endIndex: endIndex.value
  })
}

// 滚动到指定索引
function scrollToIndex(index) {
  if (containerRef.value) {
    containerRef.value.scrollTop = index * props.itemHeight
  }
}

// 滚动到顶部
function scrollToTop() {
  scrollToIndex(0)
}

// 滚动到底部
function scrollToBottom() {
  scrollToIndex(props.data.length - 1)
}

// 暴露方法
defineExpose({
  scrollToIndex,
  scrollToTop,
  scrollToBottom
})
</script>

<style scoped>
.virtual-list-container {
  position: relative;
  overflow: auto;
}

.virtual-list-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
}

.virtual-list-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}

.virtual-list-item {
  box-sizing: border-box;
}
</style>
```

### React 实现

```jsx
import React, { useState, useRef, useMemo, useCallback, useImperativeHandle, forwardRef } from 'react'

const FixedVirtualList = forwardRef(({
  data,
  itemHeight = 50,
  containerHeight = 400,
  bufferSize = 5,
  renderItem
}, ref) => {
  const containerRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)

  // 计算属性
  const totalHeight = data.length * itemHeight
  const visibleCount = Math.ceil(containerHeight / itemHeight)

  const startIndex = useMemo(() => {
    const index = Math.floor(scrollTop / itemHeight) - bufferSize
    return Math.max(0, index)
  }, [scrollTop, itemHeight, bufferSize])

  const endIndex = useMemo(() => {
    const index = startIndex + visibleCount + bufferSize * 2
    return Math.min(data.length, index)
  }, [startIndex, visibleCount, bufferSize, data.length])

  const offset = startIndex * itemHeight

  const visibleData = useMemo(() => {
    return data.slice(startIndex, endIndex)
  }, [data, startIndex, endIndex])

  // 滚动处理
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
  }, [])

  // 暴露方法
  useImperativeHandle(ref, () => ({
    scrollToIndex: (index) => {
      if (containerRef.current) {
        containerRef.current.scrollTop = index * itemHeight
      }
    },
    scrollToTop: () => {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0
      }
    },
    scrollToBottom: () => {
      if (containerRef.current) {
        containerRef.current.scrollTop = totalHeight
      }
    }
  }))

  return (
    <div
      ref={containerRef}
      style={{
        height: containerHeight,
        position: 'relative',
        overflow: 'auto'
      }}
      onScroll={handleScroll}
    >
      {/* 占位元素 */}
      <div
        style={{
          height: totalHeight,
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0
        }}
      />

      {/* 内容区域 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          transform: `translateY(${offset}px)`
        }}
      >
        {visibleData.map((item, index) => (
          <div
            key={item.id || startIndex + index}
            style={{ height: itemHeight }}
          >
            {renderItem(item, startIndex + index)}
          </div>
        ))}
      </div>
    </div>
  )
})

// 使用示例
function App() {
  const listRef = useRef(null)

  const data = useMemo(() =>
    Array.from({ length: 100000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`
    }))
  , [])

  return (
    <div>
      <button onClick={() => listRef.current?.scrollToIndex(50000)}>
        滚动到第 50000 项
      </button>

      <FixedVirtualList
        ref={listRef}
        data={data}
        itemHeight={50}
        containerHeight={400}
        renderItem={(item, index) => (
          <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
            {item.name}
          </div>
        )}
      />
    </div>
  )
}
```

---

## 三、动态高度虚拟列表

### 核心挑战

```javascript
/**
 * 动态高度虚拟列表的挑战:
 *
 * 1. 无法提前知道每项的准确高度
 * 2. 无法直接计算总高度
 * 3. 无法通过简单公式计算偏移量
 *
 * 解决方案:
 * 1. 预估高度: 初始使用预估高度
 * 2. 动态更新: 渲染后测量真实高度并缓存
 * 3. 位置缓存: 维护每项的位置信息数组
 * 4. 二分查找: 通过位置信息快速定位起始索引
 */
```

### 实现方案

```javascript
class DynamicHeightVirtualList {
  constructor(options) {
    this.container = options.container
    this.data = options.data
    this.estimatedHeight = options.estimatedHeight || 50  // 预估高度
    this.bufferSize = options.bufferSize || 5
    this.renderItem = options.renderItem

    this.scrollTop = 0
    this.positions = []  // 位置信息缓存

    this.init()
  }

  init() {
    // 初始化位置信息
    this.initPositions()

    // 创建 DOM 结构
    this.container.innerHTML = `
      <div class="virtual-list-phantom"></div>
      <div class="virtual-list-content"></div>
    `

    this.phantom = this.container.querySelector('.virtual-list-phantom')
    this.content = this.container.querySelector('.virtual-list-content')

    // 设置样式
    this.container.style.position = 'relative'
    this.container.style.overflow = 'auto'

    this.phantom.style.position = 'absolute'
    this.phantom.style.left = '0'
    this.phantom.style.top = '0'
    this.phantom.style.right = '0'

    this.content.style.position = 'absolute'
    this.content.style.left = '0'
    this.content.style.right = '0'
    this.content.style.top = '0'

    // 设置总高度
    this.updatePhantomHeight()

    // 监听滚动
    this.container.addEventListener('scroll', this.handleScroll.bind(this))

    // 首次渲染
    this.render()
  }

  // 初始化位置信息 (使用预估高度)
  initPositions() {
    this.positions = this.data.map((item, index) => ({
      index,
      height: this.estimatedHeight,
      top: index * this.estimatedHeight,
      bottom: (index + 1) * this.estimatedHeight
    }))
  }

  // 更新位置信息 (渲染后测量真实高度)
  updatePositions() {
    const items = this.content.querySelectorAll('.virtual-list-item')

    items.forEach((item) => {
      const index = parseInt(item.dataset.index)
      const rect = item.getBoundingClientRect()
      const height = rect.height
      const oldHeight = this.positions[index].height

      // 高度有变化才更新
      if (oldHeight !== height) {
        const diff = height - oldHeight

        // 更新当前项
        this.positions[index].height = height
        this.positions[index].bottom = this.positions[index].top + height

        // 更新后续所有项的位置
        for (let i = index + 1; i < this.positions.length; i++) {
          this.positions[i].top = this.positions[i - 1].bottom
          this.positions[i].bottom = this.positions[i].top + this.positions[i].height
        }
      }
    })

    // 更新总高度
    this.updatePhantomHeight()
  }

  // 二分查找起始索引
  getStartIndex(scrollTop) {
    let low = 0
    let high = this.positions.length - 1
    let result = 0

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const midBottom = this.positions[mid].bottom

      if (midBottom === scrollTop) {
        return mid + 1
      } else if (midBottom < scrollTop) {
        low = mid + 1
      } else {
        high = mid - 1
        result = mid
      }
    }

    return result
  }

  // 获取可视区域范围
  getVisibleRange() {
    const viewportHeight = this.container.clientHeight

    // 起始索引 (二分查找)
    let startIndex = this.getStartIndex(this.scrollTop) - this.bufferSize
    startIndex = Math.max(0, startIndex)

    // 结束索引
    let endIndex = startIndex
    let accHeight = 0

    while (endIndex < this.positions.length && accHeight < viewportHeight) {
      accHeight += this.positions[endIndex].height
      endIndex++
    }

    endIndex += this.bufferSize
    endIndex = Math.min(this.positions.length, endIndex)

    return { startIndex, endIndex }
  }

  // 获取偏移量
  getOffset(startIndex) {
    return startIndex > 0 ? this.positions[startIndex].top : 0
  }

  // 更新占位元素高度
  updatePhantomHeight() {
    const totalHeight = this.positions.length > 0
      ? this.positions[this.positions.length - 1].bottom
      : 0
    this.phantom.style.height = `${totalHeight}px`
  }

  // 滚动处理
  handleScroll(e) {
    this.scrollTop = e.target.scrollTop
    this.render()
  }

  // 渲染
  render() {
    const { startIndex, endIndex } = this.getVisibleRange()
    const offset = this.getOffset(startIndex)

    // 设置偏移
    this.content.style.transform = `translateY(${offset}px)`

    // 渲染数据
    const visibleData = this.data.slice(startIndex, endIndex)
    this.content.innerHTML = visibleData
      .map((item, index) => `
        <div class="virtual-list-item" data-index="${startIndex + index}">
          ${this.renderItem(item, startIndex + index)}
        </div>
      `)
      .join('')

    // 渲染后更新位置信息
    requestAnimationFrame(() => {
      this.updatePositions()
    })
  }

  // 滚动到指定索引
  scrollToIndex(index) {
    if (index >= 0 && index < this.positions.length) {
      this.container.scrollTop = this.positions[index].top
    }
  }
}
```

### Vue 3 动态高度实现

```vue
<template>
  <div
    ref="containerRef"
    class="virtual-list"
    :style="{ height: containerHeight + 'px' }"
    @scroll="handleScroll"
  >
    <div
      class="phantom"
      :style="{ height: totalHeight + 'px' }"
    ></div>

    <div
      class="content"
      :style="{ transform: `translateY(${offset}px)` }"
    >
      <div
        v-for="(item, idx) in visibleData"
        :key="item.id"
        :ref="el => setItemRef(el, idx)"
        class="list-item"
        :data-index="startIndex + idx"
      >
        <slot :item="item" :index="startIndex + idx"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUpdated, nextTick } from 'vue'

const props = defineProps({
  data: { type: Array, required: true },
  estimatedHeight: { type: Number, default: 80 },
  containerHeight: { type: Number, default: 400 },
  bufferSize: { type: Number, default: 5 }
})

const containerRef = ref(null)
const scrollTop = ref(0)
const positions = ref([])
const itemRefs = ref([])

// 初始化位置信息
function initPositions() {
  positions.value = props.data.map((item, index) => ({
    index,
    height: props.estimatedHeight,
    top: index * props.estimatedHeight,
    bottom: (index + 1) * props.estimatedHeight
  }))
}

// 保存元素引用
function setItemRef(el, idx) {
  if (el) {
    itemRefs.value[idx] = el
  }
}

// 更新位置信息
function updatePositions() {
  itemRefs.value.forEach((item, idx) => {
    if (!item) return

    const index = parseInt(item.dataset.index)
    const height = item.getBoundingClientRect().height
    const oldHeight = positions.value[index]?.height

    if (oldHeight !== height && positions.value[index]) {
      const diff = height - oldHeight
      positions.value[index].height = height
      positions.value[index].bottom = positions.value[index].top + height

      for (let i = index + 1; i < positions.value.length; i++) {
        positions.value[i].top = positions.value[i - 1].bottom
        positions.value[i].bottom = positions.value[i].top + positions.value[i].height
      }
    }
  })
}

// 二分查找起始索引
function getStartIndex(scrollTop) {
  let low = 0
  let high = positions.value.length - 1
  let result = 0

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const midBottom = positions.value[mid].bottom

    if (midBottom === scrollTop) {
      return mid + 1
    } else if (midBottom < scrollTop) {
      low = mid + 1
    } else {
      high = mid - 1
      result = mid
    }
  }

  return result
}

// 计算属性
const totalHeight = computed(() => {
  return positions.value.length > 0
    ? positions.value[positions.value.length - 1].bottom
    : 0
})

const startIndex = computed(() => {
  const index = getStartIndex(scrollTop.value) - props.bufferSize
  return Math.max(0, index)
})

const endIndex = computed(() => {
  let end = startIndex.value
  let accHeight = 0

  while (end < positions.value.length && accHeight < props.containerHeight) {
    accHeight += positions.value[end].height
    end++
  }

  end += props.bufferSize
  return Math.min(positions.value.length, end)
})

const offset = computed(() => {
  return startIndex.value > 0 ? positions.value[startIndex.value].top : 0
})

const visibleData = computed(() => {
  return props.data.slice(startIndex.value, endIndex.value)
})

// 滚动处理
function handleScroll(e) {
  scrollTop.value = e.target.scrollTop
}

// 初始化
watch(() => props.data, () => {
  initPositions()
}, { immediate: true })

// 渲染后更新位置
onUpdated(() => {
  nextTick(() => {
    updatePositions()
  })
})

// 暴露方法
defineExpose({
  scrollToIndex: (index) => {
    if (containerRef.value && positions.value[index]) {
      containerRef.value.scrollTop = positions.value[index].top
    }
  }
})
</script>

<style scoped>
.virtual-list {
  position: relative;
  overflow: auto;
}

.phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
}

.content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}
</style>
```

---

## 四、无限滚动

### 基础实现

```javascript
/**
 * 无限滚动 (Infinite Scroll)
 *
 * 原理: 监听滚动事件,当接近底部时自动加载更多数据
 *
 * 核心逻辑:
 * scrollTop + clientHeight >= scrollHeight - threshold
 */

class InfiniteScroll {
  constructor(options) {
    this.container = options.container
    this.loadMore = options.loadMore       // 加载更多的回调
    this.threshold = options.threshold || 100  // 触发阈值
    this.loading = false
    this.noMore = false

    this.init()
  }

  init() {
    this.container.addEventListener('scroll', this.handleScroll.bind(this))
  }

  handleScroll() {
    if (this.loading || this.noMore) return

    const { scrollTop, clientHeight, scrollHeight } = this.container

    // 接近底部时触发
    if (scrollTop + clientHeight >= scrollHeight - this.threshold) {
      this.triggerLoadMore()
    }
  }

  async triggerLoadMore() {
    this.loading = true
    this.showLoading()

    try {
      const hasMore = await this.loadMore()

      if (!hasMore) {
        this.noMore = true
        this.showNoMore()
      }
    } catch (error) {
      console.error('加载失败:', error)
      this.showError()
    } finally {
      this.loading = false
      this.hideLoading()
    }
  }

  showLoading() {
    // 显示加载中状态
  }

  hideLoading() {
    // 隐藏加载中状态
  }

  showNoMore() {
    // 显示没有更多数据
  }

  showError() {
    // 显示加载失败
  }

  // 重置状态 (用于刷新)
  reset() {
    this.loading = false
    this.noMore = false
  }

  destroy() {
    this.container.removeEventListener('scroll', this.handleScroll)
  }
}
```

### 使用 IntersectionObserver

```javascript
/**
 * 使用 IntersectionObserver 实现无限滚动
 *
 * 优势:
 * 1. 性能更好,不需要监听 scroll 事件
 * 2. 更准确的可见性检测
 * 3. 原生支持,无需节流
 */

class InfiniteScrollObserver {
  constructor(options) {
    this.container = options.container
    this.loadMore = options.loadMore
    this.loading = false
    this.noMore = false

    this.init()
  }

  init() {
    // 创建加载触发器元素
    this.sentinel = document.createElement('div')
    this.sentinel.className = 'infinite-scroll-sentinel'
    this.sentinel.style.height = '1px'
    this.container.appendChild(this.sentinel)

    // 创建 Observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.triggerLoadMore()
          }
        })
      },
      {
        root: this.container,
        rootMargin: '100px',  // 提前 100px 触发
        threshold: 0
      }
    )

    this.observer.observe(this.sentinel)
  }

  async triggerLoadMore() {
    if (this.loading || this.noMore) return

    this.loading = true

    try {
      const hasMore = await this.loadMore()

      if (!hasMore) {
        this.noMore = true
        this.observer.disconnect()
      }
    } catch (error) {
      console.error('加载失败:', error)
    } finally {
      this.loading = false
    }
  }

  reset() {
    this.loading = false
    this.noMore = false

    if (this.observer) {
      this.observer.observe(this.sentinel)
    }
  }

  destroy() {
    this.observer?.disconnect()
    this.sentinel?.remove()
  }
}
```

### Vue 3 无限滚动组合式函数

```javascript
// composables/useInfiniteScroll.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useInfiniteScroll(options) {
  const {
    fetchData,
    threshold = 100,
    immediate = true
  } = options

  const loading = ref(false)
  const finished = ref(false)
  const error = ref(null)
  const list = ref([])
  const page = ref(1)

  let containerRef = null
  let observer = null
  let sentinelEl = null

  // 加载数据
  async function loadMore() {
    if (loading.value || finished.value) return

    loading.value = true
    error.value = null

    try {
      const result = await fetchData(page.value)

      if (result.data.length === 0) {
        finished.value = true
      } else {
        list.value = [...list.value, ...result.data]
        page.value++

        if (!result.hasMore) {
          finished.value = true
        }
      }
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  // 刷新
  function refresh() {
    list.value = []
    page.value = 1
    finished.value = false
    error.value = null
    loadMore()
  }

  // 设置容器
  function setContainer(el) {
    containerRef = el

    if (!el) return

    // 创建哨兵元素
    sentinelEl = document.createElement('div')
    sentinelEl.style.height = '1px'
    el.appendChild(sentinelEl)

    // 创建 Observer
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      {
        root: el,
        rootMargin: `${threshold}px`,
        threshold: 0
      }
    )

    observer.observe(sentinelEl)
  }

  // 清理
  function cleanup() {
    observer?.disconnect()
    sentinelEl?.remove()
  }

  onMounted(() => {
    if (immediate) {
      loadMore()
    }
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    list,
    loading,
    finished,
    error,
    loadMore,
    refresh,
    setContainer
  }
}

// 使用示例
// <script setup>
// import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
//
// const { list, loading, finished, setContainer } = useInfiniteScroll({
//   fetchData: async (page) => {
//     const res = await api.getList({ page, pageSize: 20 })
//     return {
//       data: res.list,
//       hasMore: res.list.length === 20
//     }
//   }
// })
// </script>
//
// <template>
//   <div ref="el => setContainer(el)" class="list-container">
//     <div v-for="item in list" :key="item.id">{{ item.name }}</div>
//     <div v-if="loading">加载中...</div>
//     <div v-if="finished">没有更多了</div>
//   </div>
// </template>
```

---

## 五、虚拟列表 + 无限滚动

### 组合使用

```vue
<template>
  <VirtualList
    :data="list"
    :item-height="80"
    :container-height="500"
    @scroll="handleScroll"
  >
    <template #default="{ item }">
      <div class="item">{{ item.name }}</div>
    </template>
  </VirtualList>

  <div v-if="loading" class="loading">加载中...</div>
  <div v-if="finished" class="finished">没有更多了</div>
</template>

<script setup>
import { ref } from 'vue'
import VirtualList from './VirtualList.vue'

const list = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)

// 初始加载
loadMore()

async function loadMore() {
  if (loading.value || finished.value) return

  loading.value = true

  try {
    const res = await api.getList({ page: page.value, pageSize: 50 })

    list.value = [...list.value, ...res.data]
    page.value++

    if (res.data.length < 50) {
      finished.value = true
    }
  } finally {
    loading.value = false
  }
}

function handleScroll({ startIndex, endIndex }) {
  // 当滚动到接近底部时加载更多
  if (endIndex >= list.value.length - 10) {
    loadMore()
  }
}
</script>
```

---

## 六、性能优化技巧

### 1. 使用 ResizeObserver 处理容器尺寸变化

```javascript
// 监听容器尺寸变化
const resizeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect
    // 重新计算可视区域
    this.viewportHeight = height
    this.render()
  }
})

resizeObserver.observe(this.container)
```

### 2. 使用 requestAnimationFrame 优化滚动

```javascript
let ticking = false

function handleScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      // 执行渲染逻辑
      this.render()
      ticking = false
    })
    ticking = true
  }
}
```

### 3. 使用 CSS contain 优化

```css
.virtual-list-item {
  contain: content;  /* 限制重排重绘范围 */
}
```

### 4. 使用 will-change 提示浏览器

```css
.virtual-list-content {
  will-change: transform;
}
```

---

## 常见面试题

::: details 1. 虚拟列表的原理是什么？
<details>
<summary>点击查看答案</summary>

**核心原理：**

虚拟列表只渲染可见区域的数据，通过以下方式实现：

1. **计算可见范围**：根据滚动位置和容器高度计算起始/结束索引
2. **占位元素**：使用一个占位元素撑起总高度，保持滚动条正常
3. **偏移定位**：通过 transform 定位可见内容
4. **动态更新**：滚动时重新计算并渲染可见数据

**性能优势：**
- DOM 节点数量恒定（只有可见区域的数量）
- 内存占用减少
- 渲染性能提升
:::

</details>

::: details 2. 动态高度的虚拟列表如何实现？
<details>
<summary>点击查看答案</summary>

**实现要点：**

1. **预估高度**：初始使用预估高度计算位置
2. **位置缓存**：维护每项的 top/bottom/height 信息
3. **动态更新**：渲染后测量真实高度，更新位置缓存
4. **二分查找**：使用二分查找快速定位起始索引

```javascript
// 位置信息结构
positions = [
  { index: 0, height: 80, top: 0, bottom: 80 },
  { index: 1, height: 60, top: 80, bottom: 140 },
  // ...
]
```
:::

</details>

::: details 3. 虚拟列表有哪些优化技巧？
<details>
<summary>点击查看答案</summary>

**优化技巧：**

1. **缓冲区**：上下各预渲染几条数据，避免滚动时白屏
2. **节流/RAF**：使用 requestAnimationFrame 优化滚动回调
3. **CSS contain**：限制重排重绘范围
4. **will-change**：提示浏览器做 GPU 加速
5. **位置缓存**：避免重复计算
6. **分页加载**：配合无限滚动，避免一次性加载过多数据
7. **滚动锚定**：防止滚动位置跳动
:::

---

</details>

## 总结

::: details 选型建议
| 场景 | 推荐方案 |
|------|---------|
| 列表项高度固定 | 定高虚拟列表 |
| 列表项高度不固定 | 动态高度虚拟列表 |
| 数据量不大（< 1000） | 普通列表 + 懒加载 |
| 分页加载 | 无限滚动 |
| 大数据量 + 分页 | 虚拟列表 + 无限滚动 |
:::

::: details 常用库推荐
- **Vue**: `vue-virtual-scroller`, `vue-virtual-scroll-list`
- **React**: `react-window`, `react-virtualized`, `react-virtual`
- **通用**: `virtual-list`, `clusterize.js`
:::
