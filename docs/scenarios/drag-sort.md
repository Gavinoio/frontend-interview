# 拖拽排序

## 概述

拖拽排序是前端开发中常见的交互需求，考察候选人对**拖拽事件**、**DOM 操作**、**动画效果**、**用户体验**等方面的掌握程度。

---

## 一、HTML5 拖拽 API

### 核心事件

```javascript
/**
 * HTML5 Drag and Drop API 事件:
 *
 * 拖拽源 (draggable 元素) 事件:
 * - dragstart: 开始拖拽时触发
 * - drag: 拖拽过程中持续触发
 * - dragend: 拖拽结束时触发
 *
 * 放置目标事件:
 * - dragenter: 拖拽元素进入目标区域
 * - dragover: 拖拽元素在目标区域内移动 (必须阻止默认行为)
 * - dragleave: 拖拽元素离开目标区域
 * - drop: 在目标区域释放
 */
```

### 基础实现

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .drag-list {
      list-style: none;
      padding: 0;
      width: 300px;
    }

    .drag-item {
      padding: 12px 16px;
      margin: 8px 0;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: move;
      transition: all 0.2s;
    }

    .drag-item:hover {
      background: #f5f5f5;
    }

    .drag-item.dragging {
      opacity: 0.5;
      background: #e3f2fd;
    }

    .drag-item.over {
      border-color: #1890ff;
      border-style: dashed;
    }
  </style>
</head>
<body>
  <ul class="drag-list">
    <li class="drag-item" draggable="true">项目 1</li>
    <li class="drag-item" draggable="true">项目 2</li>
    <li class="drag-item" draggable="true">项目 3</li>
    <li class="drag-item" draggable="true">项目 4</li>
    <li class="drag-item" draggable="true">项目 5</li>
  </ul>

  <script>
    const list = document.querySelector('.drag-list')
    let draggingItem = null

    // 绑定拖拽事件
    list.addEventListener('dragstart', (e) => {
      draggingItem = e.target
      e.target.classList.add('dragging')

      // 设置拖拽数据
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/html', e.target.innerHTML)

      // 延迟添加样式，避免瞬间闪烁
      setTimeout(() => {
        e.target.style.opacity = '0.5'
      }, 0)
    })

    list.addEventListener('dragend', (e) => {
      e.target.classList.remove('dragging')
      e.target.style.opacity = ''
      draggingItem = null

      // 移除所有 over 样式
      document.querySelectorAll('.over').forEach(item => {
        item.classList.remove('over')
      })
    })

    list.addEventListener('dragover', (e) => {
      e.preventDefault()  // 必须阻止默认行为才能触发 drop

      const target = e.target.closest('.drag-item')
      if (!target || target === draggingItem) return

      // 获取目标元素的位置信息
      const rect = target.getBoundingClientRect()
      const midY = rect.top + rect.height / 2

      // 根据鼠标位置决定插入位置
      if (e.clientY < midY) {
        // 插入到目标前面
        target.parentNode.insertBefore(draggingItem, target)
      } else {
        // 插入到目标后面
        target.parentNode.insertBefore(draggingItem, target.nextSibling)
      }
    })

    list.addEventListener('dragenter', (e) => {
      const target = e.target.closest('.drag-item')
      if (target && target !== draggingItem) {
        target.classList.add('over')
      }
    })

    list.addEventListener('dragleave', (e) => {
      const target = e.target.closest('.drag-item')
      if (target) {
        target.classList.remove('over')
      }
    })

    list.addEventListener('drop', (e) => {
      e.preventDefault()

      const target = e.target.closest('.drag-item')
      if (target) {
        target.classList.remove('over')
      }

      // 获取新顺序
      const items = [...list.querySelectorAll('.drag-item')]
      const order = items.map(item => item.textContent)
      console.log('新顺序:', order)
    })
  </script>
</body>
</html>
```

---

## 二、封装可复用的拖拽排序

### JavaScript 类实现

```javascript
class DragSortable {
  constructor(options) {
    this.container = options.container
    this.itemSelector = options.itemSelector || '.drag-item'
    this.handleSelector = options.handleSelector  // 拖拽手柄
    this.animation = options.animation !== false
    this.animationDuration = options.animationDuration || 200
    this.onStart = options.onStart
    this.onEnd = options.onEnd
    this.onChange = options.onChange

    this.draggingItem = null
    this.placeholder = null
    this.startIndex = -1

    this.init()
  }

  init() {
    // 设置容器样式
    this.container.style.position = 'relative'

    // 绑定事件
    this.bindEvents()
  }

  bindEvents() {
    // 使用事件委托
    this.container.addEventListener('dragstart', this.handleDragStart.bind(this))
    this.container.addEventListener('dragend', this.handleDragEnd.bind(this))
    this.container.addEventListener('dragover', this.handleDragOver.bind(this))
    this.container.addEventListener('dragenter', this.handleDragEnter.bind(this))
    this.container.addEventListener('dragleave', this.handleDragLeave.bind(this))
    this.container.addEventListener('drop', this.handleDrop.bind(this))

    // 设置 draggable
    this.updateDraggable()
  }

  updateDraggable() {
    const items = this.getItems()

    items.forEach(item => {
      if (this.handleSelector) {
        // 使用拖拽手柄
        const handle = item.querySelector(this.handleSelector)
        if (handle) {
          handle.addEventListener('mousedown', () => {
            item.draggable = true
          })
          handle.addEventListener('mouseup', () => {
            item.draggable = false
          })
        }
      } else {
        item.draggable = true
      }
    })
  }

  getItems() {
    return [...this.container.querySelectorAll(this.itemSelector)]
  }

  handleDragStart(e) {
    const item = e.target.closest(this.itemSelector)
    if (!item) return

    this.draggingItem = item
    this.startIndex = this.getItems().indexOf(item)

    // 添加拖拽样式
    item.classList.add('dragging')

    // 设置拖拽效果
    e.dataTransfer.effectAllowed = 'move'

    // 创建占位符
    this.createPlaceholder(item)

    // 回调
    this.onStart?.({
      item,
      index: this.startIndex
    })

    // 延迟执行，避免闪烁
    requestAnimationFrame(() => {
      item.style.opacity = '0.5'
    })
  }

  handleDragEnd(e) {
    const item = e.target.closest(this.itemSelector)
    if (!item) return

    // 移除样式
    item.classList.remove('dragging')
    item.style.opacity = ''

    // 移除占位符
    this.removePlaceholder()

    // 获取新位置
    const endIndex = this.getItems().indexOf(item)

    // 回调
    this.onEnd?.({
      item,
      oldIndex: this.startIndex,
      newIndex: endIndex
    })

    // 如果位置改变，触发 onChange
    if (this.startIndex !== endIndex) {
      this.onChange?.({
        item,
        oldIndex: this.startIndex,
        newIndex: endIndex,
        items: this.getItems()
      })
    }

    this.draggingItem = null
    this.startIndex = -1
  }

  handleDragOver(e) {
    e.preventDefault()  // 必须阻止默认行为

    if (!this.draggingItem) return

    const target = e.target.closest(this.itemSelector)
    if (!target || target === this.draggingItem) return

    // 计算插入位置
    const rect = target.getBoundingClientRect()
    const midY = rect.top + rect.height / 2

    // 获取当前位置
    const items = this.getItems()
    const draggingIndex = items.indexOf(this.draggingItem)
    const targetIndex = items.indexOf(target)

    // 插入元素
    if (this.animation) {
      this.animateMove(target, e.clientY < midY ? 'before' : 'after')
    } else {
      if (e.clientY < midY) {
        this.container.insertBefore(this.draggingItem, target)
      } else {
        this.container.insertBefore(this.draggingItem, target.nextSibling)
      }
    }
  }

  handleDragEnter(e) {
    const target = e.target.closest(this.itemSelector)
    if (target && target !== this.draggingItem) {
      target.classList.add('over')
    }
  }

  handleDragLeave(e) {
    const target = e.target.closest(this.itemSelector)
    if (target) {
      target.classList.remove('over')
    }
  }

  handleDrop(e) {
    e.preventDefault()

    // 移除 over 样式
    this.getItems().forEach(item => {
      item.classList.remove('over')
    })
  }

  // 创建占位符
  createPlaceholder(item) {
    this.placeholder = document.createElement('div')
    this.placeholder.className = 'drag-placeholder'
    this.placeholder.style.cssText = `
      height: ${item.offsetHeight}px;
      margin: ${getComputedStyle(item).margin};
      border: 2px dashed #ccc;
      border-radius: 4px;
      background: #f5f5f5;
    `
  }

  removePlaceholder() {
    if (this.placeholder && this.placeholder.parentNode) {
      this.placeholder.parentNode.removeChild(this.placeholder)
    }
    this.placeholder = null
  }

  // 动画移动
  animateMove(target, position) {
    const items = this.getItems()

    // 记录移动前的位置
    const oldPositions = new Map()
    items.forEach(item => {
      oldPositions.set(item, item.getBoundingClientRect())
    })

    // 执行 DOM 移动
    if (position === 'before') {
      this.container.insertBefore(this.draggingItem, target)
    } else {
      this.container.insertBefore(this.draggingItem, target.nextSibling)
    }

    // 计算并应用动画
    items.forEach(item => {
      if (item === this.draggingItem) return

      const oldRect = oldPositions.get(item)
      const newRect = item.getBoundingClientRect()

      const deltaX = oldRect.left - newRect.left
      const deltaY = oldRect.top - newRect.top

      if (deltaX === 0 && deltaY === 0) return

      // 使用 FLIP 动画
      item.style.transform = `translate(${deltaX}px, ${deltaY}px)`
      item.style.transition = 'none'

      requestAnimationFrame(() => {
        item.style.transition = `transform ${this.animationDuration}ms ease`
        item.style.transform = ''
      })
    })
  }

  // 获取排序数据
  getSortedData() {
    return this.getItems().map((item, index) => ({
      element: item,
      index
    }))
  }

  // 重新排序
  reorder(fromIndex, toIndex) {
    const items = this.getItems()
    const item = items[fromIndex]

    if (!item || fromIndex === toIndex) return

    if (toIndex > fromIndex) {
      this.container.insertBefore(item, items[toIndex]?.nextSibling || null)
    } else {
      this.container.insertBefore(item, items[toIndex])
    }
  }

  // 销毁
  destroy() {
    this.container.removeEventListener('dragstart', this.handleDragStart)
    this.container.removeEventListener('dragend', this.handleDragEnd)
    this.container.removeEventListener('dragover', this.handleDragOver)
    this.container.removeEventListener('dragenter', this.handleDragEnter)
    this.container.removeEventListener('dragleave', this.handleDragLeave)
    this.container.removeEventListener('drop', this.handleDrop)

    this.getItems().forEach(item => {
      item.draggable = false
    })
  }
}

// 使用示例
const sortable = new DragSortable({
  container: document.querySelector('.drag-list'),
  itemSelector: '.drag-item',
  handleSelector: '.drag-handle',  // 可选：拖拽手柄
  animation: true,
  animationDuration: 200,

  onStart: ({ item, index }) => {
    console.log('开始拖拽:', index)
  },

  onEnd: ({ item, oldIndex, newIndex }) => {
    console.log('拖拽结束:', oldIndex, '->', newIndex)
  },

  onChange: ({ oldIndex, newIndex, items }) => {
    console.log('顺序改变:', items.map(i => i.textContent))
  }
})
```

---

## 三、Vue 3 实现

### 组合式 API 实现

```vue
<template>
  <ul ref="listRef" class="drag-list">
    <li
      v-for="(item, index) in list"
      :key="item.id"
      :class="['drag-item', { dragging: dragIndex === index }]"
      :draggable="true"
      @dragstart="handleDragStart($event, index)"
      @dragend="handleDragEnd"
      @dragover="handleDragOver($event, index)"
      @dragenter="handleDragEnter($event, index)"
      @dragleave="handleDragLeave($event)"
      @drop="handleDrop($event, index)"
    >
      <span class="drag-handle">⋮⋮</span>
      <span class="drag-content">{{ item.name }}</span>
    </li>
  </ul>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const list = ref([...props.modelValue])
const dragIndex = ref(-1)
const overIndex = ref(-1)

// 监听 props 变化
watch(() => props.modelValue, (val) => {
  list.value = [...val]
}, { deep: true })

// 拖拽开始
function handleDragStart(e, index) {
  dragIndex.value = index

  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', index)

  // 设置拖拽图像
  const dragImage = e.target.cloneNode(true)
  dragImage.style.opacity = '0.8'
  document.body.appendChild(dragImage)
  e.dataTransfer.setDragImage(dragImage, 0, 0)
  setTimeout(() => document.body.removeChild(dragImage), 0)
}

// 拖拽结束
function handleDragEnd() {
  dragIndex.value = -1
  overIndex.value = -1
}

// 拖拽经过
function handleDragOver(e, index) {
  e.preventDefault()

  if (dragIndex.value === index) return

  const rect = e.target.getBoundingClientRect()
  const midY = rect.top + rect.height / 2

  // 交换位置
  if (e.clientY < midY && index < dragIndex.value) {
    moveItem(dragIndex.value, index)
  } else if (e.clientY > midY && index > dragIndex.value) {
    moveItem(dragIndex.value, index)
  }
}

// 进入目标
function handleDragEnter(e, index) {
  overIndex.value = index
}

// 离开目标
function handleDragLeave(e) {
  // 防止子元素触发
  if (!e.currentTarget.contains(e.relatedTarget)) {
    overIndex.value = -1
  }
}

// 放置
function handleDrop(e, index) {
  e.preventDefault()
  overIndex.value = -1
}

// 移动元素
function moveItem(fromIndex, toIndex) {
  const item = list.value.splice(fromIndex, 1)[0]
  list.value.splice(toIndex, 0, item)
  dragIndex.value = toIndex

  // 更新父组件
  emit('update:modelValue', [...list.value])
  emit('change', {
    item,
    oldIndex: fromIndex,
    newIndex: toIndex,
    list: [...list.value]
  })
}
</script>

<style scoped>
.drag-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.drag-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin: 8px 0;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  cursor: move;
  transition: all 0.2s;
}

.drag-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.drag-item.dragging {
  opacity: 0.5;
  background: #e6f7ff;
}

.drag-handle {
  margin-right: 12px;
  color: #999;
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}
</style>
```

### 使用 Composable 封装

```javascript
// composables/useDragSort.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useDragSort(listRef, options = {}) {
  const {
    itemSelector = '.drag-item',
    handleSelector = null,
    animation = true,
    onStart,
    onEnd,
    onChange
  } = options

  const dragging = ref(false)
  const dragIndex = ref(-1)

  let draggingElement = null
  let startIndex = -1

  function handleDragStart(e) {
    const item = e.target.closest(itemSelector)
    if (!item) return

    // 如果有手柄，检查是否从手柄开始拖拽
    if (handleSelector) {
      const handle = item.querySelector(handleSelector)
      if (!handle?.contains(e.target)) {
        e.preventDefault()
        return
      }
    }

    draggingElement = item
    dragIndex.value = getIndex(item)
    startIndex = dragIndex.value
    dragging.value = true

    e.dataTransfer.effectAllowed = 'move'

    item.classList.add('dragging')

    onStart?.({ item, index: startIndex })
  }

  function handleDragEnd(e) {
    const item = e.target.closest(itemSelector)
    if (!item) return

    item.classList.remove('dragging')

    const endIndex = getIndex(item)

    onEnd?.({
      item,
      oldIndex: startIndex,
      newIndex: endIndex
    })

    if (startIndex !== endIndex) {
      onChange?.({
        item,
        oldIndex: startIndex,
        newIndex: endIndex
      })
    }

    dragging.value = false
    dragIndex.value = -1
    draggingElement = null
  }

  function handleDragOver(e) {
    e.preventDefault()

    if (!draggingElement) return

    const target = e.target.closest(itemSelector)
    if (!target || target === draggingElement) return

    const rect = target.getBoundingClientRect()
    const midY = rect.top + rect.height / 2

    const container = listRef.value

    if (e.clientY < midY) {
      container.insertBefore(draggingElement, target)
    } else {
      container.insertBefore(draggingElement, target.nextSibling)
    }

    dragIndex.value = getIndex(draggingElement)
  }

  function getIndex(element) {
    const items = listRef.value.querySelectorAll(itemSelector)
    return Array.from(items).indexOf(element)
  }

  function bindEvents() {
    const container = listRef.value
    if (!container) return

    container.addEventListener('dragstart', handleDragStart)
    container.addEventListener('dragend', handleDragEnd)
    container.addEventListener('dragover', handleDragOver)
  }

  function unbindEvents() {
    const container = listRef.value
    if (!container) return

    container.removeEventListener('dragstart', handleDragStart)
    container.removeEventListener('dragend', handleDragEnd)
    container.removeEventListener('dragover', handleDragOver)
  }

  onMounted(() => {
    bindEvents()
  })

  onUnmounted(() => {
    unbindEvents()
  })

  return {
    dragging,
    dragIndex
  }
}

// 使用示例
// <script setup>
// import { ref } from 'vue'
// import { useDragSort } from '@/composables/useDragSort'
//
// const listRef = ref(null)
// const list = ref([...])
//
// const { dragging, dragIndex } = useDragSort(listRef, {
//   itemSelector: '.item',
//   handleSelector: '.handle',
//   onChange: ({ oldIndex, newIndex }) => {
//     const item = list.value.splice(oldIndex, 1)[0]
//     list.value.splice(newIndex, 0, item)
//   }
// })
// </script>
```

---

## 四、React 实现

```jsx
import React, { useState, useRef, useCallback } from 'react'
import './DragSort.css'

function DragSortList({ items, onReorder, renderItem }) {
  const [dragIndex, setDragIndex] = useState(-1)
  const [overIndex, setOverIndex] = useState(-1)
  const dragItem = useRef(null)
  const dragOverItem = useRef(null)

  const handleDragStart = useCallback((e, index) => {
    dragItem.current = index
    setDragIndex(index)

    e.dataTransfer.effectAllowed = 'move'

    // 延迟设置透明度，避免拖拽图像也变透明
    setTimeout(() => {
      e.target.style.opacity = '0.5'
    }, 0)
  }, [])

  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = ''
    setDragIndex(-1)
    setOverIndex(-1)

    // 触发重排
    if (dragItem.current !== null && dragOverItem.current !== null) {
      if (dragItem.current !== dragOverItem.current) {
        onReorder(dragItem.current, dragOverItem.current)
      }
    }

    dragItem.current = null
    dragOverItem.current = null
  }, [onReorder])

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault()

    if (dragItem.current === index) return

    dragOverItem.current = index
    setOverIndex(index)
  }, [])

  const handleDragEnter = useCallback((e, index) => {
    if (dragItem.current === index) return
    setOverIndex(index)
  }, [])

  const handleDragLeave = useCallback((e) => {
    // 防止子元素触发
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setOverIndex(-1)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
  }, [])

  return (
    <ul className="drag-sort-list">
      {items.map((item, index) => (
        <li
          key={item.id}
          className={`drag-sort-item ${
            dragIndex === index ? 'dragging' : ''
          } ${
            overIndex === index ? 'over' : ''
          }`}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnter={(e) => handleDragEnter(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {renderItem ? renderItem(item, index) : item.name}
        </li>
      ))}
    </ul>
  )
}

// 使用自定义 Hook 封装
function useDragSort(initialItems) {
  const [items, setItems] = useState(initialItems)

  const handleReorder = useCallback((fromIndex, toIndex) => {
    setItems(prevItems => {
      const newItems = [...prevItems]
      const [removed] = newItems.splice(fromIndex, 1)
      newItems.splice(toIndex, 0, removed)
      return newItems
    })
  }, [])

  return {
    items,
    setItems,
    handleReorder
  }
}

// 使用示例
function App() {
  const { items, handleReorder } = useDragSort([
    { id: 1, name: '项目 1' },
    { id: 2, name: '项目 2' },
    { id: 3, name: '项目 3' },
    { id: 4, name: '项目 4' },
    { id: 5, name: '项目 5' }
  ])

  return (
    <DragSortList
      items={items}
      onReorder={handleReorder}
      renderItem={(item, index) => (
        <div className="item-content">
          <span className="handle">⋮⋮</span>
          <span>{item.name}</span>
        </div>
      )}
    />
  )
}

export default App
```

---

## 五、触摸设备支持

### 使用 Touch 事件

```javascript
class TouchDragSort {
  constructor(options) {
    this.container = options.container
    this.itemSelector = options.itemSelector || '.drag-item'
    this.onChange = options.onChange

    this.draggingItem = null
    this.startY = 0
    this.startIndex = -1
    this.clone = null

    this.init()
  }

  init() {
    this.container.addEventListener('touchstart', this.handleTouchStart.bind(this))
    this.container.addEventListener('touchmove', this.handleTouchMove.bind(this))
    this.container.addEventListener('touchend', this.handleTouchEnd.bind(this))
  }

  handleTouchStart(e) {
    const item = e.target.closest(this.itemSelector)
    if (!item) return

    this.draggingItem = item
    this.startY = e.touches[0].clientY
    this.startIndex = this.getIndex(item)

    // 创建克隆元素
    this.clone = item.cloneNode(true)
    this.clone.classList.add('drag-clone')
    this.clone.style.cssText = `
      position: fixed;
      top: ${item.getBoundingClientRect().top}px;
      left: ${item.getBoundingClientRect().left}px;
      width: ${item.offsetWidth}px;
      pointer-events: none;
      z-index: 1000;
      opacity: 0.8;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `
    document.body.appendChild(this.clone)

    // 添加样式
    item.classList.add('dragging')
    item.style.opacity = '0.3'
  }

  handleTouchMove(e) {
    if (!this.draggingItem) return

    e.preventDefault()  // 防止页面滚动

    const touch = e.touches[0]
    const deltaY = touch.clientY - this.startY

    // 移动克隆元素
    this.clone.style.transform = `translateY(${deltaY}px)`

    // 查找目标位置
    const target = this.findTarget(touch.clientX, touch.clientY)
    if (target && target !== this.draggingItem) {
      const targetIndex = this.getIndex(target)
      const currentIndex = this.getIndex(this.draggingItem)

      if (targetIndex !== currentIndex) {
        // 移动元素
        if (targetIndex > currentIndex) {
          target.parentNode.insertBefore(this.draggingItem, target.nextSibling)
        } else {
          target.parentNode.insertBefore(this.draggingItem, target)
        }
      }
    }
  }

  handleTouchEnd(e) {
    if (!this.draggingItem) return

    // 移除克隆元素
    if (this.clone && this.clone.parentNode) {
      this.clone.parentNode.removeChild(this.clone)
    }
    this.clone = null

    // 移除样式
    this.draggingItem.classList.remove('dragging')
    this.draggingItem.style.opacity = ''

    // 获取新位置
    const endIndex = this.getIndex(this.draggingItem)

    if (this.startIndex !== endIndex) {
      this.onChange?.({
        item: this.draggingItem,
        oldIndex: this.startIndex,
        newIndex: endIndex
      })
    }

    this.draggingItem = null
    this.startIndex = -1
  }

  findTarget(x, y) {
    const items = this.container.querySelectorAll(this.itemSelector)

    for (const item of items) {
      if (item === this.draggingItem) continue

      const rect = item.getBoundingClientRect()
      if (y >= rect.top && y <= rect.bottom) {
        return item
      }
    }

    return null
  }

  getIndex(element) {
    const items = [...this.container.querySelectorAll(this.itemSelector)]
    return items.indexOf(element)
  }

  destroy() {
    this.container.removeEventListener('touchstart', this.handleTouchStart)
    this.container.removeEventListener('touchmove', this.handleTouchMove)
    this.container.removeEventListener('touchend', this.handleTouchEnd)
  }
}
```

### 统一的拖拽处理

```javascript
// 使用 Pointer Events API 统一处理鼠标和触摸
class PointerDragSort {
  constructor(options) {
    this.container = options.container
    this.itemSelector = options.itemSelector
    this.onChange = options.onChange

    this.draggingItem = null
    this.startY = 0
    this.startIndex = -1

    this.init()
  }

  init() {
    this.container.addEventListener('pointerdown', this.handlePointerDown.bind(this))
    this.container.addEventListener('pointermove', this.handlePointerMove.bind(this))
    this.container.addEventListener('pointerup', this.handlePointerUp.bind(this))
    this.container.addEventListener('pointercancel', this.handlePointerUp.bind(this))
  }

  handlePointerDown(e) {
    const item = e.target.closest(this.itemSelector)
    if (!item) return

    this.draggingItem = item
    this.startY = e.clientY
    this.startIndex = this.getIndex(item)

    // 捕获指针
    item.setPointerCapture(e.pointerId)

    item.classList.add('dragging')
  }

  handlePointerMove(e) {
    if (!this.draggingItem) return

    // 查找目标
    const target = this.findTarget(e.clientX, e.clientY)
    if (target && target !== this.draggingItem) {
      const targetRect = target.getBoundingClientRect()
      const midY = targetRect.top + targetRect.height / 2

      if (e.clientY < midY) {
        this.container.insertBefore(this.draggingItem, target)
      } else {
        this.container.insertBefore(this.draggingItem, target.nextSibling)
      }
    }
  }

  handlePointerUp(e) {
    if (!this.draggingItem) return

    this.draggingItem.classList.remove('dragging')
    this.draggingItem.releasePointerCapture(e.pointerId)

    const endIndex = this.getIndex(this.draggingItem)

    if (this.startIndex !== endIndex) {
      this.onChange?.({
        item: this.draggingItem,
        oldIndex: this.startIndex,
        newIndex: endIndex
      })
    }

    this.draggingItem = null
  }

  findTarget(x, y) {
    const items = this.container.querySelectorAll(this.itemSelector)

    for (const item of items) {
      if (item === this.draggingItem) continue

      const rect = item.getBoundingClientRect()
      if (y >= rect.top && y <= rect.bottom) {
        return item
      }
    }

    return null
  }

  getIndex(element) {
    return [...this.container.querySelectorAll(this.itemSelector)].indexOf(element)
  }
}
```

---

## 六、FLIP 动画优化

### 实现平滑动画

```javascript
/**
 * FLIP 动画技术:
 * F - First: 记录初始位置
 * L - Last: 记录最终位置
 * I - Invert: 计算位移差
 * P - Play: 播放动画
 */

function animateWithFLIP(container, itemSelector) {
  const items = container.querySelectorAll(itemSelector)

  // First: 记录初始位置
  const firstPositions = new Map()
  items.forEach(item => {
    firstPositions.set(item, item.getBoundingClientRect())
  })

  // 返回动画执行函数
  return function playAnimation() {
    items.forEach(item => {
      const first = firstPositions.get(item)
      const last = item.getBoundingClientRect()

      // Invert: 计算位移
      const deltaX = first.left - last.left
      const deltaY = first.top - last.top

      if (deltaX === 0 && deltaY === 0) return

      // 先设置到原位置
      item.style.transform = `translate(${deltaX}px, ${deltaY}px)`
      item.style.transition = 'none'

      // Play: 触发动画
      requestAnimationFrame(() => {
        item.style.transition = 'transform 200ms ease'
        item.style.transform = ''
      })
    })
  }
}

// 使用示例
const container = document.querySelector('.drag-list')
const playAnimation = animateWithFLIP(container, '.drag-item')

// DOM 操作后执行动画
container.insertBefore(dragItem, targetItem)
playAnimation()
```

---

