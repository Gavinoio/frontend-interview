# 数据结构

数据结构是计算机存储、组织数据的方式。掌握常用数据结构是解决算法问题的基础，也是前端面试的重要考点。

## 数组（Array）

数组是最基本的数据结构，存储在连续的内存空间中。

### 特点

- 随机访问：O(1)
- 插入/删除：O(n)（需要移动元素）
- 内存连续，缓存友好

### 常用操作

```javascript
// 创建数组
const arr = [1, 2, 3, 4, 5]
const arr2 = new Array(5).fill(0)  // [0, 0, 0, 0, 0]
const arr3 = Array.from({ length: 5 }, (_, i) => i)  // [0, 1, 2, 3, 4]

// 访问和修改
arr[0]           // 1
arr[0] = 10      // 修改

// 增删操作
arr.push(6)      // 尾部添加，返回新长度
arr.pop()        // 尾部删除，返回删除元素
arr.unshift(0)   // 头部添加，返回新长度
arr.shift()      // 头部删除，返回删除元素
arr.splice(1, 2) // 从索引1开始删除2个元素

// 查找
arr.indexOf(3)       // 返回索引，不存在返回-1
arr.includes(3)      // 返回布尔值
arr.find(x => x > 2) // 返回第一个满足条件的元素
arr.findIndex(x => x > 2) // 返回第一个满足条件的索引

// 遍历
arr.forEach((item, index) => console.log(item))
arr.map(x => x * 2)           // 返回新数组
arr.filter(x => x > 2)        // 过滤
arr.reduce((acc, cur) => acc + cur, 0)  // 归约

// 排序
arr.sort((a, b) => a - b)     // 升序
arr.sort((a, b) => b - a)     // 降序

// 其他
arr.slice(1, 3)    // 切片，返回新数组
arr.concat([6, 7]) // 合并
arr.reverse()      // 反转
arr.join(',')      // 转字符串
```

### 二维数组

```javascript
// 创建二维数组
const matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
]

// 正确创建 m x n 的二维数组
const m = 3, n = 4
const grid = Array.from({ length: m }, () => new Array(n).fill(0))

// 错误示范（所有行共享同一数组引用）
// const grid = new Array(m).fill(new Array(n).fill(0))

// 遍历二维数组
for (let i = 0; i < matrix.length; i++) {
  for (let j = 0; j < matrix[i].length; j++) {
    console.log(matrix[i][j])
  }
}
```

## 链表（Linked List）

链表由节点组成，每个节点包含数据和指向下一个节点的指针。

### 特点

- 插入/删除：O(1)（已知位置时）
- 查找：O(n)
- 内存不连续，灵活

### 单向链表

```javascript
// 节点定义
class ListNode {
  constructor(val, next = null) {
    this.val = val
    this.next = next
  }
}

// 链表类
class LinkedList {
  constructor() {
    this.head = null
    this.size = 0
  }

  // 头部插入
  prepend(val) {
    this.head = new ListNode(val, this.head)
    this.size++
  }

  // 尾部插入
  append(val) {
    const node = new ListNode(val)
    if (!this.head) {
      this.head = node
    } else {
      let current = this.head
      while (current.next) {
        current = current.next
      }
      current.next = node
    }
    this.size++
  }

  // 指定位置插入
  insertAt(val, index) {
    if (index < 0 || index > this.size) return false

    if (index === 0) {
      this.prepend(val)
      return true
    }

    const node = new ListNode(val)
    let current = this.head
    let prev = null
    let count = 0

    while (count < index) {
      prev = current
      current = current.next
      count++
    }

    node.next = current
    prev.next = node
    this.size++
    return true
  }

  // 删除指定位置
  removeAt(index) {
    if (index < 0 || index >= this.size) return null

    let current = this.head

    if (index === 0) {
      this.head = current.next
    } else {
      let prev = null
      let count = 0

      while (count < index) {
        prev = current
        current = current.next
        count++
      }

      prev.next = current.next
    }

    this.size--
    return current.val
  }

  // 查找
  find(val) {
    let current = this.head
    while (current) {
      if (current.val === val) return current
      current = current.next
    }
    return null
  }

  // 转数组
  toArray() {
    const result = []
    let current = this.head
    while (current) {
      result.push(current.val)
      current = current.next
    }
    return result
  }
}
```

### 双向链表

```javascript
class DoublyListNode {
  constructor(val) {
    this.val = val
    this.prev = null
    this.next = null
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null
    this.tail = null
    this.size = 0
  }

  // 头部插入
  prepend(val) {
    const node = new DoublyListNode(val)
    if (!this.head) {
      this.head = this.tail = node
    } else {
      node.next = this.head
      this.head.prev = node
      this.head = node
    }
    this.size++
  }

  // 尾部插入
  append(val) {
    const node = new DoublyListNode(val)
    if (!this.tail) {
      this.head = this.tail = node
    } else {
      node.prev = this.tail
      this.tail.next = node
      this.tail = node
    }
    this.size++
  }

  // 删除节点
  remove(node) {
    if (node.prev) {
      node.prev.next = node.next
    } else {
      this.head = node.next
    }

    if (node.next) {
      node.next.prev = node.prev
    } else {
      this.tail = node.prev
    }

    this.size--
    return node.val
  }

  // 移动到头部
  moveToHead(node) {
    if (node === this.head) return

    this.remove(node)
    node.prev = null
    node.next = this.head

    if (this.head) {
      this.head.prev = node
    }
    this.head = node

    if (!this.tail) {
      this.tail = node
    }
    this.size++
  }
}
```

## 栈（Stack）

栈是一种后进先出（LIFO）的数据结构。

### 实现

```javascript
class Stack {
  constructor() {
    this.items = []
  }

  // 入栈
  push(item) {
    this.items.push(item)
  }

  // 出栈
  pop() {
    if (this.isEmpty()) return undefined
    return this.items.pop()
  }

  // 查看栈顶
  peek() {
    if (this.isEmpty()) return undefined
    return this.items[this.items.length - 1]
  }

  // 是否为空
  isEmpty() {
    return this.items.length === 0
  }

  // 栈大小
  size() {
    return this.items.length
  }

  // 清空
  clear() {
    this.items = []
  }
}
```

### 应用场景

```javascript
// 1. 括号匹配
function isValidParentheses(s) {
  const stack = []
  const map = { '(': ')', '[': ']', '{': '}' }

  for (const char of s) {
    if (map[char]) {
      stack.push(char)
    } else {
      if (map[stack.pop()] !== char) {
        return false
      }
    }
  }

  return stack.length === 0
}

// 2. 计算后缀表达式
function evalRPN(tokens) {
  const stack = []

  for (const token of tokens) {
    if (['+', '-', '*', '/'].includes(token)) {
      const b = stack.pop()
      const a = stack.pop()
      switch (token) {
        case '+': stack.push(a + b); break
        case '-': stack.push(a - b); break
        case '*': stack.push(a * b); break
        case '/': stack.push(Math.trunc(a / b)); break
      }
    } else {
      stack.push(parseInt(token))
    }
  }

  return stack.pop()
}

// 3. 单调栈 - 下一个更大元素
function nextGreaterElement(nums) {
  const result = new Array(nums.length).fill(-1)
  const stack = []  // 存储索引

  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[i] > nums[stack[stack.length - 1]]) {
      const index = stack.pop()
      result[index] = nums[i]
    }
    stack.push(i)
  }

  return result
}

// 4. 浏览器前进后退
class BrowserHistory {
  constructor(homepage) {
    this.backStack = [homepage]
    this.forwardStack = []
  }

  visit(url) {
    this.backStack.push(url)
    this.forwardStack = []  // 清空前进栈
  }

  back(steps) {
    while (steps-- > 0 && this.backStack.length > 1) {
      this.forwardStack.push(this.backStack.pop())
    }
    return this.backStack[this.backStack.length - 1]
  }

  forward(steps) {
    while (steps-- > 0 && this.forwardStack.length > 0) {
      this.backStack.push(this.forwardStack.pop())
    }
    return this.backStack[this.backStack.length - 1]
  }
}
```

## 队列（Queue）

队列是一种先进先出（FIFO）的数据结构。

### 基本队列

```javascript
class Queue {
  constructor() {
    this.items = []
  }

  // 入队
  enqueue(item) {
    this.items.push(item)
  }

  // 出队
  dequeue() {
    if (this.isEmpty()) return undefined
    return this.items.shift()
  }

  // 查看队首
  front() {
    if (this.isEmpty()) return undefined
    return this.items[0]
  }

  // 是否为空
  isEmpty() {
    return this.items.length === 0
  }

  // 队列大小
  size() {
    return this.items.length
  }
}
```

### 优化队列（避免 shift 的 O(n) 复杂度）

```javascript
class OptimizedQueue {
  constructor() {
    this.items = {}
    this.head = 0
    this.tail = 0
  }

  enqueue(item) {
    this.items[this.tail] = item
    this.tail++
  }

  dequeue() {
    if (this.isEmpty()) return undefined
    const item = this.items[this.head]
    delete this.items[this.head]
    this.head++
    return item
  }

  front() {
    return this.items[this.head]
  }

  isEmpty() {
    return this.tail === this.head
  }

  size() {
    return this.tail - this.head
  }
}
```

### 双端队列

```javascript
class Deque {
  constructor() {
    this.items = []
  }

  // 头部添加
  addFront(item) {
    this.items.unshift(item)
  }

  // 尾部添加
  addRear(item) {
    this.items.push(item)
  }

  // 头部删除
  removeFront() {
    return this.items.shift()
  }

  // 尾部删除
  removeRear() {
    return this.items.pop()
  }

  // 查看头部
  peekFront() {
    return this.items[0]
  }

  // 查看尾部
  peekRear() {
    return this.items[this.items.length - 1]
  }

  isEmpty() {
    return this.items.length === 0
  }

  size() {
    return this.items.length
  }
}
```

### 优先队列（最小堆实现）

```javascript
class MinHeap {
  constructor() {
    this.heap = []
  }

  // 获取父节点索引
  getParentIndex(i) {
    return Math.floor((i - 1) / 2)
  }

  // 获取左子节点索引
  getLeftChildIndex(i) {
    return 2 * i + 1
  }

  // 获取右子节点索引
  getRightChildIndex(i) {
    return 2 * i + 2
  }

  // 交换
  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]]
  }

  // 上浮
  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = this.getParentIndex(index)
      if (this.heap[parentIndex] <= this.heap[index]) break
      this.swap(parentIndex, index)
      index = parentIndex
    }
  }

  // 下沉
  bubbleDown(index) {
    const length = this.heap.length
    while (true) {
      let smallest = index
      const leftIndex = this.getLeftChildIndex(index)
      const rightIndex = this.getRightChildIndex(index)

      if (leftIndex < length && this.heap[leftIndex] < this.heap[smallest]) {
        smallest = leftIndex
      }

      if (rightIndex < length && this.heap[rightIndex] < this.heap[smallest]) {
        smallest = rightIndex
      }

      if (smallest === index) break

      this.swap(index, smallest)
      index = smallest
    }
  }

  // 插入
  push(val) {
    this.heap.push(val)
    this.bubbleUp(this.heap.length - 1)
  }

  // 弹出最小值
  pop() {
    if (this.heap.length === 0) return undefined
    if (this.heap.length === 1) return this.heap.pop()

    const min = this.heap[0]
    this.heap[0] = this.heap.pop()
    this.bubbleDown(0)
    return min
  }

  // 查看最小值
  peek() {
    return this.heap[0]
  }

  size() {
    return this.heap.length
  }

  isEmpty() {
    return this.heap.length === 0
  }
}
```

## 树（Tree）

树是一种层级结构的数据结构，由节点和边组成。

### 二叉树

```javascript
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val
    this.left = left
    this.right = right
  }
}

// 二叉树遍历
class BinaryTree {
  // 前序遍历（根-左-右）
  preorder(root) {
    const result = []
    const traverse = (node) => {
      if (!node) return
      result.push(node.val)
      traverse(node.left)
      traverse(node.right)
    }
    traverse(root)
    return result
  }

  // 前序遍历（迭代）
  preorderIterative(root) {
    if (!root) return []
    const result = []
    const stack = [root]

    while (stack.length) {
      const node = stack.pop()
      result.push(node.val)
      if (node.right) stack.push(node.right)
      if (node.left) stack.push(node.left)
    }

    return result
  }

  // 中序遍历（左-根-右）
  inorder(root) {
    const result = []
    const traverse = (node) => {
      if (!node) return
      traverse(node.left)
      result.push(node.val)
      traverse(node.right)
    }
    traverse(root)
    return result
  }

  // 中序遍历（迭代）
  inorderIterative(root) {
    const result = []
    const stack = []
    let current = root

    while (current || stack.length) {
      while (current) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()
      result.push(current.val)
      current = current.right
    }

    return result
  }

  // 后序遍历（左-右-根）
  postorder(root) {
    const result = []
    const traverse = (node) => {
      if (!node) return
      traverse(node.left)
      traverse(node.right)
      result.push(node.val)
    }
    traverse(root)
    return result
  }

  // 层序遍历（BFS）
  levelOrder(root) {
    if (!root) return []
    const result = []
    const queue = [root]

    while (queue.length) {
      const level = []
      const size = queue.length

      for (let i = 0; i < size; i++) {
        const node = queue.shift()
        level.push(node.val)
        if (node.left) queue.push(node.left)
        if (node.right) queue.push(node.right)
      }

      result.push(level)
    }

    return result
  }

  // 计算树的深度
  maxDepth(root) {
    if (!root) return 0
    return 1 + Math.max(this.maxDepth(root.left), this.maxDepth(root.right))
  }

  // 判断是否平衡
  isBalanced(root) {
    const getHeight = (node) => {
      if (!node) return 0
      const left = getHeight(node.left)
      const right = getHeight(node.right)
      if (left === -1 || right === -1 || Math.abs(left - right) > 1) {
        return -1
      }
      return 1 + Math.max(left, right)
    }
    return getHeight(root) !== -1
  }
}
```

### 二叉搜索树（BST）

```javascript
class BST {
  constructor() {
    this.root = null
  }

  // 插入
  insert(val) {
    const node = new TreeNode(val)
    if (!this.root) {
      this.root = node
      return
    }

    let current = this.root
    while (true) {
      if (val < current.val) {
        if (!current.left) {
          current.left = node
          return
        }
        current = current.left
      } else {
        if (!current.right) {
          current.right = node
          return
        }
        current = current.right
      }
    }
  }

  // 查找
  search(val) {
    let current = this.root
    while (current) {
      if (val === current.val) return current
      if (val < current.val) {
        current = current.left
      } else {
        current = current.right
      }
    }
    return null
  }

  // 删除
  delete(val) {
    this.root = this._deleteNode(this.root, val)
  }

  _deleteNode(node, val) {
    if (!node) return null

    if (val < node.val) {
      node.left = this._deleteNode(node.left, val)
    } else if (val > node.val) {
      node.right = this._deleteNode(node.right, val)
    } else {
      // 找到要删除的节点
      if (!node.left) return node.right
      if (!node.right) return node.left

      // 有两个子节点，找右子树的最小值
      let minNode = node.right
      while (minNode.left) {
        minNode = minNode.left
      }
      node.val = minNode.val
      node.right = this._deleteNode(node.right, minNode.val)
    }

    return node
  }

  // 最小值
  findMin() {
    if (!this.root) return null
    let current = this.root
    while (current.left) {
      current = current.left
    }
    return current.val
  }

  // 最大值
  findMax() {
    if (!this.root) return null
    let current = this.root
    while (current.right) {
      current = current.right
    }
    return current.val
  }
}
```

## 哈希表（Hash Table）

哈希表通过哈希函数将键映射到存储位置，实现快速查找。

### Map 和 Set

```javascript
// Map - 键值对集合
const map = new Map()

map.set('name', 'Alice')
map.set('age', 25)
map.get('name')        // 'Alice'
map.has('name')        // true
map.delete('age')
map.size               // 1
map.clear()

// 遍历
map.forEach((value, key) => console.log(key, value))
for (const [key, value] of map) {
  console.log(key, value)
}

// Set - 唯一值集合
const set = new Set()

set.add(1)
set.add(2)
set.add(1)  // 重复，不会添加
set.has(1)  // true
set.delete(1)
set.size    // 1

// 数组去重
const arr = [1, 2, 2, 3, 3, 3]
const unique = [...new Set(arr)]  // [1, 2, 3]

// 交集
const setA = new Set([1, 2, 3])
const setB = new Set([2, 3, 4])
const intersection = new Set([...setA].filter(x => setB.has(x)))

// 并集
const union = new Set([...setA, ...setB])

// 差集
const difference = new Set([...setA].filter(x => !setB.has(x)))
```

### 简单哈希表实现

```javascript
class HashTable {
  constructor(size = 53) {
    this.keyMap = new Array(size)
  }

  // 哈希函数
  _hash(key) {
    let total = 0
    const PRIME = 31
    for (let i = 0; i < Math.min(key.length, 100); i++) {
      const char = key[i]
      const value = char.charCodeAt(0) - 96
      total = (total * PRIME + value) % this.keyMap.length
    }
    return total
  }

  set(key, value) {
    const index = this._hash(key)
    if (!this.keyMap[index]) {
      this.keyMap[index] = []
    }
    // 检查是否已存在
    for (const pair of this.keyMap[index]) {
      if (pair[0] === key) {
        pair[1] = value
        return
      }
    }
    this.keyMap[index].push([key, value])
  }

  get(key) {
    const index = this._hash(key)
    if (this.keyMap[index]) {
      for (const pair of this.keyMap[index]) {
        if (pair[0] === key) {
          return pair[1]
        }
      }
    }
    return undefined
  }

  has(key) {
    return this.get(key) !== undefined
  }

  delete(key) {
    const index = this._hash(key)
    if (this.keyMap[index]) {
      const idx = this.keyMap[index].findIndex(pair => pair[0] === key)
      if (idx !== -1) {
        this.keyMap[index].splice(idx, 1)
        return true
      }
    }
    return false
  }

  keys() {
    const result = []
    for (const bucket of this.keyMap) {
      if (bucket) {
        for (const pair of bucket) {
          result.push(pair[0])
        }
      }
    }
    return result
  }

  values() {
    const result = []
    for (const bucket of this.keyMap) {
      if (bucket) {
        for (const pair of bucket) {
          result.push(pair[1])
        }
      }
    }
    return result
  }
}
```

## 图（Graph）

图由顶点和边组成，用于表示多对多的关系。

### 邻接表表示

```javascript
class Graph {
  constructor() {
    this.adjacencyList = new Map()
  }

  // 添加顶点
  addVertex(vertex) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, [])
    }
  }

  // 添加边（无向图）
  addEdge(v1, v2) {
    this.addVertex(v1)
    this.addVertex(v2)
    this.adjacencyList.get(v1).push(v2)
    this.adjacencyList.get(v2).push(v1)
  }

  // 添加边（有向图）
  addDirectedEdge(from, to) {
    this.addVertex(from)
    this.addVertex(to)
    this.adjacencyList.get(from).push(to)
  }

  // 删除边
  removeEdge(v1, v2) {
    this.adjacencyList.set(v1,
      this.adjacencyList.get(v1).filter(v => v !== v2)
    )
    this.adjacencyList.set(v2,
      this.adjacencyList.get(v2).filter(v => v !== v1)
    )
  }

  // 删除顶点
  removeVertex(vertex) {
    for (const neighbor of this.adjacencyList.get(vertex)) {
      this.removeEdge(vertex, neighbor)
    }
    this.adjacencyList.delete(vertex)
  }

  // 深度优先搜索（DFS）
  dfs(start) {
    const result = []
    const visited = new Set()

    const traverse = (vertex) => {
      if (!vertex) return
      visited.add(vertex)
      result.push(vertex)

      for (const neighbor of this.adjacencyList.get(vertex)) {
        if (!visited.has(neighbor)) {
          traverse(neighbor)
        }
      }
    }

    traverse(start)
    return result
  }

  // DFS 迭代版本
  dfsIterative(start) {
    const result = []
    const visited = new Set()
    const stack = [start]

    while (stack.length) {
      const vertex = stack.pop()
      if (!visited.has(vertex)) {
        visited.add(vertex)
        result.push(vertex)

        for (const neighbor of this.adjacencyList.get(vertex)) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor)
          }
        }
      }
    }

    return result
  }

  // 广度优先搜索（BFS）
  bfs(start) {
    const result = []
    const visited = new Set([start])
    const queue = [start]

    while (queue.length) {
      const vertex = queue.shift()
      result.push(vertex)

      for (const neighbor of this.adjacencyList.get(vertex)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push(neighbor)
        }
      }
    }

    return result
  }

  // 检测环（有向图）
  hasCycle() {
    const visited = new Set()
    const recursionStack = new Set()

    const dfs = (vertex) => {
      visited.add(vertex)
      recursionStack.add(vertex)

      for (const neighbor of (this.adjacencyList.get(vertex) || [])) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true
        } else if (recursionStack.has(neighbor)) {
          return true
        }
      }

      recursionStack.delete(vertex)
      return false
    }

    for (const vertex of this.adjacencyList.keys()) {
      if (!visited.has(vertex)) {
        if (dfs(vertex)) return true
      }
    }

    return false
  }
}
```

