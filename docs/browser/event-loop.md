# 事件循环 (Event Loop) 【超高频必考】

## 官方定义
事件循环是 JavaScript 运行时环境（浏览器/Node.js）用于协调事件、用户交互、脚本执行、渲染、网络请求等的机制。它使得单线程的 JavaScript 能够执行非阻塞操作。

## 白话解释
JavaScript 是单线程的，一次只能做一件事。但我们又需要处理网络请求、定时器、用户点击等异步任务。事件循环就像一个"调度员"，不断地检查"有没有任务要执行"，然后按照一定的优先级顺序执行它们。

---

## 核心概念

### 1. 调用栈 (Call Stack)

```javascript
function multiply(a, b) {
  return a * b
}

function square(n) {
  return multiply(n, n)
}

function printSquare(n) {
  const result = square(n)
  console.log(result)
}

printSquare(4)

// 调用栈变化：
// 1. [printSquare]
// 2. [printSquare, square]
// 3. [printSquare, square, multiply]
// 4. [printSquare, square]  // multiply 返回
// 5. [printSquare]          // square 返回
// 6. []                     // printSquare 返回
```

**白话解释**：调用栈就像一摞盘子，后放上去的要先拿走（后进先出）。函数调用时入栈，函数返回时出栈。

### 2. 宏任务 (Macro Task / Task)

| 宏任务类型 | 触发方式 |
|-----------|---------|
| script | 整体代码块 |
| setTimeout | 定时器 |
| setInterval | 定时器 |
| setImmediate | Node.js 特有 |
| I/O | 文件读写、网络请求 |
| UI rendering | 浏览器渲染 |
| requestAnimationFrame | 动画帧（有争议） |
| MessageChannel | 消息通道 |

### 3. 微任务 (Micro Task)

| 微任务类型 | 触发方式 |
|-----------|---------|
| Promise.then/catch/finally | Promise 回调 |
| async/await | async 函数中 await 之后的代码 |
| MutationObserver | DOM 变化监听 |
| process.nextTick | Node.js 特有（优先级最高） |
| queueMicrotask | 手动添加微任务 |

### 4. 事件循环执行顺序

```
┌─────────────────────────────────────┐
│           执行同步代码              │
│         （清空调用栈）              │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│         执行所有微任务              │
│    （清空微任务队列）               │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│        浏览器可能会渲染             │
│     （requestAnimationFrame）       │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│       执行一个宏任务                │
└─────────────────┬───────────────────┘
                  │
                  └──────► 回到第二步，继续循环
```

---

## 经典面试题

::: details 面试题 1：基础执行顺序【必考】
```javascript
console.log('1')

setTimeout(function() {
  console.log('2')
}, 0)

Promise.resolve().then(function() {
  console.log('3')
})

console.log('4')
```

<details>
<summary>点击查看答案</summary>

**输出顺序：1, 4, 3, 2**

**解析**：
1. `console.log('1')` - 同步代码，立即执行
2. `setTimeout` - 回调放入宏任务队列
3. `Promise.then` - 回调放入微任务队列
4. `console.log('4')` - 同步代码，立即执行
5. 同步代码执行完，检查微任务队列，执行 `console.log('3')`
6. 微任务清空，执行下一个宏任务 `console.log('2')`
:::

---

</details>

::: details 面试题 2：Promise 嵌套【高频】
```javascript
console.log('start')

setTimeout(() => {
  console.log('setTimeout')
}, 0)

new Promise((resolve) => {
  console.log('promise1')
  resolve()
}).then(() => {
  console.log('then1')
  new Promise((resolve) => {
    console.log('promise2')
    resolve()
  }).then(() => {
    console.log('then2')
  })
})

console.log('end')
```

<details>
<summary>点击查看答案</summary>

**输出顺序：start, promise1, end, then1, promise2, then2, setTimeout**

**解析**：
1. `start` - 同步
2. setTimeout 回调入宏任务队列
3. `promise1` - new Promise 的 executor 是同步执行的！
4. then1 回调入微任务队列
5. `end` - 同步
6. 执行微任务 then1，打印 `then1`
7. 执行 then1 内部代码，`promise2` 同步打印
8. then2 回调入微任务队列
9. 继续执行微任务 then2，打印 `then2`
10. 微任务清空，执行宏任务 `setTimeout`

**关键点**：new Promise 的 executor 函数是同步执行的！
:::

---

</details>

::: details 面试题 3：async/await 转换【字节高频】
```javascript
async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}

async function async2() {
  console.log('async2')
}

console.log('script start')

setTimeout(function() {
  console.log('setTimeout')
}, 0)

async1()

new Promise(function(resolve) {
  console.log('promise1')
  resolve()
}).then(function() {
  console.log('promise2')
})

console.log('script end')
```

<details>
<summary>点击查看答案</summary>

**输出顺序：**
```
script start
async1 start
async2
promise1
script end
async1 end
promise2
setTimeout
```

**关键理解 - await 的本质**：
```javascript
// 这段代码
async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}

// 等价于
function async1() {
  console.log('async1 start')
  Promise.resolve(async2()).then(() => {
    console.log('async1 end')
  })
}
```

**解析**：
1. `script start` - 同步
2. setTimeout 入宏任务队列
3. 执行 async1()，打印 `async1 start`
4. 执行 await async2()，打印 `async2`
5. await 后面的代码 `async1 end` 作为微任务入队
6. `promise1` - new Promise executor 同步执行
7. promise2 的回调入微任务队列
8. `script end` - 同步
9. 执行微任务：`async1 end`、`promise2`（按入队顺序）
10. 执行宏任务：`setTimeout`
:::

---

</details>

::: details 面试题 4：复杂嵌套【阿里】
```javascript
Promise.resolve().then(() => {
  console.log('then1')
  Promise.resolve().then(() => {
    console.log('then1-1')
  })
}).then(() => {
  console.log('then2')
})
```

<details>
<summary>点击查看答案</summary>

**输出顺序：then1, then1-1, then2**

**解析**：
1. 第一个 then 入微任务队列
2. 执行第一个 then，打印 `then1`
3. 内部的 then1-1 入微任务队列
4. 第一个 then 执行完，其返回的 Promise resolve，then2 入微任务队列
5. 此时微任务队列：[then1-1, then2]
6. 按顺序执行：`then1-1`、`then2`

**关键点**：Promise 的 then 返回新的 Promise，会在当前 then 执行完后才 resolve
:::

---

</details>

::: details 面试题 5：setTimeout 嵌套【腾讯】
```javascript
setTimeout(() => {
  console.log('timeout1')
  Promise.resolve().then(() => {
    console.log('promise1')
  })
}, 0)

setTimeout(() => {
  console.log('timeout2')
  Promise.resolve().then(() => {
    console.log('promise2')
  })
}, 0)
```

<details>
<summary>点击查看答案</summary>

**输出顺序：timeout1, promise1, timeout2, promise2**

**解析**：
1. 两个 setTimeout 回调都入宏任务队列
2. 执行第一个宏任务，打印 `timeout1`
3. promise1 入微任务队列
4. **当前宏任务执行完，先清空微任务队列**
5. 打印 `promise1`
6. 执行第二个宏任务，打印 `timeout2`
7. promise2 入微任务队列
8. 清空微任务，打印 `promise2`

**关键点**：每执行完一个宏任务，都要清空所有微任务
:::

---

</details>

::: details 面试题 6：requestAnimationFrame 的位置【高级】
```javascript
setTimeout(() => {
  console.log('setTimeout')
}, 0)

requestAnimationFrame(() => {
  console.log('rAF')
})

Promise.resolve().then(() => {
  console.log('promise')
})
```

<details>
<summary>点击查看答案</summary>

**可能的输出顺序**：
- 通常是：promise, rAF, setTimeout
- 或者：promise, setTimeout, rAF

**解析**：
1. `promise` 一定最先（微任务优先）
2. `rAF` 和 `setTimeout` 的顺序不确定

**rAF 的特殊性**：
- requestAnimationFrame 在渲染之前执行
- 但它既不是宏任务也不是微任务
- 它的执行时机取决于浏览器的渲染时机
- 通常在微任务之后、下一个宏任务之前
:::

---

</details>

::: details 面试题 7：综合大题【大厂必考】
```javascript
console.log('1')

setTimeout(function() {
  console.log('2')
  new Promise(function(resolve) {
    console.log('3')
    resolve()
  }).then(function() {
    console.log('4')
  })
}, 0)

new Promise(function(resolve) {
  console.log('5')
  resolve()
}).then(function() {
  console.log('6')
})

setTimeout(function() {
  console.log('7')
  new Promise(function(resolve) {
    console.log('8')
    resolve()
  }).then(function() {
    console.log('9')
  })
}, 0)

console.log('10')
```

<details>
<summary>点击查看答案</summary>

**输出顺序：1, 5, 10, 6, 2, 3, 4, 7, 8, 9**

**详细解析**：

**第一轮（同步代码）**：
- 打印 `1`
- 第一个 setTimeout 入宏任务队列
- 打印 `5`（Promise executor 同步执行）
- then 回调（打印6）入微任务队列
- 第二个 setTimeout 入宏任务队列
- 打印 `10`

**第一轮微任务**：
- 打印 `6`

**第二轮（第一个 setTimeout）**：
- 打印 `2`
- 打印 `3`（Promise executor 同步）
- then 回调（打印4）入微任务队列
- 执行微任务：打印 `4`

**第三轮（第二个 setTimeout）**：
- 打印 `7`
- 打印 `8`
- 执行微任务：打印 `9`
:::

---

</details>

## Node.js 事件循环【进阶】

Node.js 的事件循环分为 6 个阶段：

```
   ┌───────────────────────────┐
┌─>│           timers          │ setTimeout, setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │ 系统操作回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │ 内部使用
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │ I/O 回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │ setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │ socket.close()
   └───────────────────────────┘
```

::: details Node.js 面试题
```javascript
setTimeout(() => {
  console.log('timeout')
}, 0)

setImmediate(() => {
  console.log('immediate')
})
```

<details>
<summary>点击查看答案</summary>

**输出顺序不确定！** 可能是 timeout, immediate 或 immediate, timeout

**原因**：setTimeout(fn, 0) 实际上至少是 1ms。如果事件循环进入 timers 阶段时，定时器还没到期，就会先执行 setImmediate。

**但如果在 I/O 回调中**：
```javascript
const fs = require('fs')

fs.readFile('file.txt', () => {
  setTimeout(() => console.log('timeout'), 0)
  setImmediate(() => console.log('immediate'))
})
// 输出顺序一定是：immediate, timeout
// 因为 I/O 回调在 poll 阶段执行，接下来是 check 阶段（setImmediate）
```
:::

---

</details>

## 常见面试问答

::: details Q1: 为什么 JavaScript 是单线程的？
**答**：
1. **历史原因**：JavaScript 最初设计用于浏览器，处理简单的表单验证和 DOM 操作
2. **避免复杂性**：如果多线程同时操作 DOM，会产生竞态条件，难以处理
3. **简化开发**：单线程模型让开发者不需要考虑线程同步、锁等问题
4. **现代补充**：Web Worker 可以开启新线程，但不能操作 DOM
:::

::: details Q2: 宏任务和微任务的区别？为什么要有微任务？
**答**：
1. **执行时机不同**：每个宏任务执行完，都要清空所有微任务
2. **来源不同**：宏任务来自浏览器/Node API，微任务来自 JS 引擎
3. **微任务的意义**：
   - 提供更细粒度的异步控制
   - Promise 需要在当前任务尽快执行回调
   - 避免 UI 渲染被打断
:::

::: details Q3: async/await 和 Promise 的执行顺序区别？
**答**：本质上 async/await 是 Promise 的语法糖，但要注意：

```javascript
// V8 引擎优化后，await 后面的代码相当于：
// Promise.resolve(xxx).then(() => { await 后面的代码 })

// 所以 await 后面的代码会作为微任务执行
```
:::

::: details Q4: 如何让 setTimeout 准时执行？
**答**：setTimeout 无法保证准时执行，因为：
1. 最小延迟时间限制（嵌套超过5层时最小4ms）
2. 如果调用栈有任务执行，会阻塞
3. 页面在后台时可能被节流

**解决方案**：
```javascript
// 使用 Web Worker 执行精确定时
// worker.js
setInterval(() => {
  postMessage('tick')
}, 1000)

// 主线程
const worker = new Worker('worker.js')
worker.onmessage = () => {
  // 精确的定时回调
}
```
:::

::: details Q5: 说说 requestIdleCallback 和 requestAnimationFrame 的区别？
**答**：
| 特性 | requestAnimationFrame | requestIdleCallback |
|------|----------------------|---------------------|
| 执行时机 | 下次重绘之前 | 浏览器空闲时 |
| 用途 | 动画、DOM 操作 | 低优先级任务 |
| 频率 | 每帧执行（60fps=16.6ms） | 不确定 |
| 兼容性 | 好 | 一般 |

---
:::

## 手写简易事件循环

```javascript
// 简化版事件循环模拟
class EventLoop {
  constructor() {
    this.macroTaskQueue = []
    this.microTaskQueue = []
  }

  // 添加宏任务
  addMacroTask(task) {
    this.macroTaskQueue.push(task)
  }

  // 添加微任务
  addMicroTask(task) {
    this.microTaskQueue.push(task)
  }

  // 执行所有微任务
  flushMicroTasks() {
    while (this.microTaskQueue.length > 0) {
      const task = this.microTaskQueue.shift()
      task()
    }
  }

  // 运行事件循环
  run() {
    while (this.macroTaskQueue.length > 0) {
      // 执行一个宏任务
      const macroTask = this.macroTaskQueue.shift()
      macroTask()

      // 执行所有微任务
      this.flushMicroTasks()
    }
  }
}

// 使用示例
const loop = new EventLoop()

loop.addMacroTask(() => {
  console.log('macro 1')
  loop.addMicroTask(() => console.log('micro 1'))
  loop.addMicroTask(() => console.log('micro 2'))
})

loop.addMacroTask(() => {
  console.log('macro 2')
})

loop.run()
// 输出：macro 1, micro 1, micro 2, macro 2
```

---

## 总结速记

```
1. 同步代码先执行
2. 微任务优先于宏任务
3. 每个宏任务执行完，清空所有微任务
4. Promise executor 是同步的
5. await 后面的代码是微任务
6. Node.js 有 6 个阶段，process.nextTick 优先级最高
```

---

## 高频面试题汇总

::: details 面试题 1：什么是事件循环？
#### 一句话答案
事件循环是 JavaScript 处理异步任务的调度机制，让单线程的 JS 能够执行非阻塞操作。

#### 详细解答

**核心概念**：
- JavaScript 是单线程语言，一次只能做一件事
- 事件循环负责协调同步任务、异步任务、微任务和宏任务的执行顺序
- 它不断循环检查任务队列，按优先级调度执行

**执行流程**：
1. 执行同步代码，清空调用栈
2. 执行所有微任务队列中的任务
3. 浏览器可能进行渲染（如果需要）
4. 执行一个宏任务
5. 回到步骤 2，循环往复

**为什么需要事件循环**：
- 避免耗时操作（如网络请求、文件读写）阻塞主线程
- 保持 UI 响应，提升用户体验
- 实现异步编程模式

#### 面试口语化回答模板

> "事件循环是 JavaScript 处理异步任务的机制。因为 JS 是单线程的，所以需要一个调度机制来处理异步任务。
>
> 简单说就是：先执行同步代码，然后清空微任务队列，再取一个宏任务执行，然后又清空微任务，如此循环。
>
> 比如我执行一段代码，先把 console.log 这些同步的执行完，然后看看有没有 Promise.then 这些微任务，全部执行完，然后再执行一个 setTimeout 宏任务，执行完又去清空微任务。这样就能让 JavaScript 单线程也能处理异步操作，不会卡住页面。"

---
:::

::: details 面试题 2：宏任务和微任务的区别？
#### 一句话答案
微任务优先级高于宏任务，每个宏任务执行完都要清空所有微任务，微任务主要是 Promise 和 async/await，宏任务主要是 setTimeout 和 I/O。

#### 详细解答

**核心区别**：

| 维度 | 宏任务 (Macro Task) | 微任务 (Micro Task) |
|------|---------------------|---------------------|
| **优先级** | 低 | 高 |
| **执行时机** | 每次取一个执行 | 清空整个队列 |
| **来源** | 浏览器/Node API | JS 引擎 |
| **常见类型** | setTimeout、setInterval、I/O、UI rendering | Promise.then、async/await、MutationObserver |

**执行顺序规则**：
```
执行栈清空 → 清空所有微任务 → 取一个宏任务执行 → 清空所有微任务 → 取下一个宏任务...
```

**为什么要有微任务**：
1. **更快的响应**：Promise 回调需要尽快执行，不能等到下一个宏任务
2. **批量更新**：多个状态变化可以在一次微任务清空时统一处理
3. **避免渲染阻塞**：微任务在渲染前执行，可以做 DOM 计算而不触发多次渲染

**实际例子**：
```javascript
console.log('1')  // 同步

setTimeout(() => console.log('2'), 0)  // 宏任务

Promise.resolve().then(() => console.log('3'))  // 微任务

console.log('4')  // 同步

// 输出：1, 4, 3, 2
// 执行顺序：同步(1,4) → 微任务(3) → 宏任务(2)
```

#### 面试口语化回答模板

> "宏任务和微任务最大的区别就是执行时机和优先级。
>
> 微任务优先级更高，每执行完一个宏任务，就要把所有微任务清空。比如说，执行完一个 setTimeout，就要把所有 Promise.then 执行完，才会执行下一个 setTimeout。
>
> 常见的微任务主要是 Promise.then、catch、finally，还有 async/await。宏任务主要是 setTimeout、setInterval、I/O 操作这些。
>
> 为什么要有微任务呢？主要是为了让 Promise 这种异步操作能更快响应。比如我发了个请求，数据回来了，我希望 then 里的回调尽快执行，而不是等到下一个 setTimeout 才执行。这样用户体验会更好。"

---
:::

::: details 面试题 3：说说下面代码的输出顺序（经典题）
#### 题目

```javascript
console.log('1')

setTimeout(function() {
  console.log('2')
  new Promise(function(resolve) {
    console.log('3')
    resolve()
  }).then(function() {
    console.log('4')
  })
}, 0)

new Promise(function(resolve) {
  console.log('5')
  resolve()
}).then(function() {
  console.log('6')
})

setTimeout(function() {
  console.log('7')
  new Promise(function(resolve) {
    console.log('8')
    resolve()
  }).then(function() {
    console.log('9')
  })
}, 0)

console.log('10')
```

#### 一句话答案
输出顺序是：1, 5, 10, 6, 2, 3, 4, 7, 8, 9

#### 详细解答

**执行过程拆解**：

**第一阶段 - 执行同步代码**：
```
1. 打印 '1'                    ✓
2. 第一个 setTimeout → 宏任务队列 [setTimeout1]
3. 打印 '5'（Promise executor 同步执行！）
4. then 回调 → 微任务队列 [then-6]
5. 第二个 setTimeout → 宏任务队列 [setTimeout1, setTimeout2]
6. 打印 '10'                   ✓
```
**此时输出**：1, 5, 10

**第二阶段 - 清空微任务队列**：
```
执行 then-6：打印 '6'          ✓
```
**此时输出**：1, 5, 10, 6

**第三阶段 - 执行第一个宏任务（setTimeout1）**：
```
1. 打印 '2'                    ✓
2. 打印 '3'（Promise executor 同步！）
3. then 回调 → 微任务队列 [then-4]
4. 立即清空微任务：打印 '4'   ✓
```
**此时输出**：1, 5, 10, 6, 2, 3, 4

**第四阶段 - 执行第二个宏任务（setTimeout2）**：
```
1. 打印 '7'                    ✓
2. 打印 '8'
3. 清空微任务：打印 '9'        ✓
```
**最终输出**：1, 5, 10, 6, 2, 3, 4, 7, 8, 9

**关键点总结**：
1. **new Promise 的 executor 函数是同步执行的** - 这是最容易出错的点
2. **每个宏任务执行完，立即清空所有微任务** - 不是等所有宏任务执行完
3. **同步代码 → 微任务 → 宏任务** - 执行优先级

#### 面试口语化回答模板

> "这道题我按执行顺序来说：
>
> 首先执行同步代码，打印 1，然后 setTimeout 进宏任务队列。接着遇到 Promise，注意 new Promise 里面的函数是立即执行的，所以打印 5，然后 then 进微任务队列。再遇到第二个 setTimeout 进宏任务队列，最后打印 10。此时同步代码执行完了，输出是 1, 5, 10。
>
> 接下来清空微任务队列，执行 then，打印 6。
>
> 然后执行第一个宏任务，也就是第一个 setTimeout。打印 2，接着又是一个 Promise，打印 3，then 进微任务队列。注意这里要立即清空微任务，所以打印 4。
>
> 最后执行第二个 setTimeout，打印 7, 8, 9。
>
> 所以完整输出是：1, 5, 10, 6, 2, 3, 4, 7, 8, 9。
>
> 关键点就是记住 Promise 的 executor 是同步的，还有每个宏任务执行完都要清空微任务。"

---
:::

::: details 面试题 4：async/await 和 Promise 的执行顺序
#### 题目

```javascript
async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}

async function async2() {
  console.log('async2')
}

console.log('script start')

setTimeout(function() {
  console.log('setTimeout')
}, 0)

async1()

new Promise(function(resolve) {
  console.log('promise1')
  resolve()
}).then(function() {
  console.log('promise2')
})

console.log('script end')
```

#### 一句话答案
输出顺序是：script start, async1 start, async2, promise1, script end, async1 end, promise2, setTimeout

#### 详细解答

**关键理解 - await 的本质转换**：

```javascript
// 原始代码
async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}

// 等价于
function async1() {
  console.log('async1 start')
  return Promise.resolve(async2()).then(() => {
    console.log('async1 end')
  })
}
```

**执行过程详解**：

**第一轮 - 同步代码**：
```
1. 打印 'script start'                    ✓
2. setTimeout → 宏任务队列
3. 执行 async1()：
   - 打印 'async1 start'                  ✓
   - 执行 await async2()：
     * 调用 async2()，打印 'async2'        ✓
     * await 后面的代码包装成微任务
   - 'async1 end' → 微任务队列 [async1-end]
4. new Promise：
   - 打印 'promise1'（executor 同步！）     ✓
   - then 回调 → 微任务队列 [async1-end, promise2]
5. 打印 'script end'                      ✓
```
**此时输出**：script start, async1 start, async2, promise1, script end

**第二轮 - 清空微任务**：
```
按入队顺序执行：
1. 打印 'async1 end'                      ✓
2. 打印 'promise2'                        ✓
```
**此时输出**：script start, async1 start, async2, promise1, script end, async1 end, promise2

**第三轮 - 执行宏任务**：
```
打印 'setTimeout'                          ✓
```
**最终输出**：script start, async1 start, async2, promise1, script end, async1 end, promise2, setTimeout

**核心要点**：
1. **async 函数内部，await 前面的代码是同步执行的**
2. **await 等待的异步操作会立即执行（如果是函数调用）**
3. **await 后面的代码会作为微任务，等价于 Promise.then**
4. **微任务按照入队顺序执行**

**常见误区**：
```javascript
// 误区：认为 await 会阻塞后续代码
async function test() {
  await fn()
  console.log('1')  // 这不是同步代码，而是微任务！
}

// 正确理解：相当于
function test() {
  return Promise.resolve(fn()).then(() => {
    console.log('1')
  })
}
```

#### 面试口语化回答模板

> "这道题的关键是理解 async/await 的执行机制。
>
> 首先执行同步代码，打印 script start，然后 setTimeout 进宏任务队列。接着调用 async1 函数，打印 async1 start，然后遇到 await。
>
> 这里要注意，await async2() 会先执行 async2 函数，所以打印 async2。然后 await 后面的代码，也就是 'async1 end' 这一行，会被包装成微任务，相当于 Promise.then。
>
> 继续执行，遇到 new Promise，打印 promise1，然后 then 进微任务队列。最后打印 script end。此时同步代码执行完。
>
> 接下来清空微任务队列，按入队顺序，先打印 async1 end，再打印 promise2。
>
> 最后执行宏任务，打印 setTimeout。
>
> 所以完整输出是：script start, async1 start, async2, promise1, script end, async1 end, promise2, setTimeout。
>
> 总结一下，await 前面的代码是同步执行的，await 后面的代码相当于 Promise.then，会作为微任务执行。这是 async/await 和 Promise 最大的关联。"

---
:::

## 面试技巧总结

::: details 回答事件循环题目的万能公式
1. **先说概念**："这道题考查的是事件循环的执行顺序..."
2. **列出队列**："我先把任务分类：同步代码、微任务、宏任务..."
3. **逐步推演**："首先执行同步代码...然后清空微任务...最后执行宏任务..."
4. **强调关键点**："这里要注意 Promise 的 executor 是同步执行的..."
5. **给出答案**："所以最终输出顺序是..."
:::

::: details 常见追问及应对
**追问 1**："如果把 setTimeout 改成 0ms，会立即执行吗？"
> "不会。setTimeout 最小延迟在规范中是 4ms（嵌套5层以上），而且即使是 0ms，也要等到当前宏任务执行完、微任务清空后才会执行。"

**追问 2**："Promise.then 一定比 setTimeout 先执行吗？"
> "是的。因为 then 是微任务，setTimeout 是宏任务，微任务的优先级永远高于宏任务。每个宏任务执行完都要清空所有微任务。"

**追问 3**："async 函数返回的是什么？"
> "async 函数永远返回一个 Promise 对象。如果 return 一个值，会自动包装成 Promise.resolve(value)；如果抛出错误，会变成 Promise.reject(error)。"

**追问 4**："requestAnimationFrame 是宏任务还是微任务？"
> "都不是。rAF 是一个独立的任务队列，在微任务之后、渲染之前执行，用于动画优化。它的执行时机取决于浏览器的渲染时机，通常是每秒 60 次，也就是每 16.6ms 一次。"
:::

::: details 答题注意事项
1. **不要死记硬背输出结果** - 面试官可能会改题目，要理解原理
2. **画图辅助说明** - 画出任务队列的变化过程更清晰
3. **提到浏览器和 Node.js 的差异** - 展示知识广度
4. **举实际应用场景** - 比如"防抖函数就利用了微任务的特性"
5. **保持口语化** - 不要背书式回答，要像讲故事一样流畅

---
:::

## 实战应用场景

::: details 场景 1：控制异步任务执行顺序
```javascript
// 需求：依次加载 3 张图片，每张加载完后再加载下一张
async function loadImagesSequentially(urls) {
  for (const url of urls) {
    await loadImage(url)
    console.log(`${url} loaded`)
  }
}

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = resolve
    img.src = url
  })
}
```
:::

::: details 场景 2：批量处理数据，避免阻塞 UI
```javascript
// 需求：处理 10000 条数据，但不能阻塞页面
async function processBigData(data) {
  const chunkSize = 100
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)
    processChunk(chunk)
    // 让出控制权，避免长时间占用主线程
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}
```
:::

::: details 场景 3：利用微任务优先级实现状态批量更新
```javascript
// 需求：多次状态变更只触发一次 DOM 更新
class Store {
  constructor() {
    this.state = {}
    this.listeners = []
    this.pending = false
  }

  setState(newState) {
    Object.assign(this.state, newState)
    if (!this.pending) {
      this.pending = true
      // 使用微任务批量通知
      queueMicrotask(() => {
        this.listeners.forEach(fn => fn(this.state))
        this.pending = false
      })
    }
  }
}
```

---
:::

## 延伸知识

::: details 浏览器渲染时机
事件循环与浏览器渲染的关系：
```
同步代码 → 微任务 → [可能渲染] → 宏任务 → 微任务 → [可能渲染] → ...
```

- 浏览器会在适当的时机插入渲染（通常 60fps，每 16.6ms）
- requestAnimationFrame 在渲染前执行
- requestIdleCallback 在浏览器空闲时执行
:::

::: details Performance API 测试
```javascript
// 测试微任务和宏任务的执行时间差
console.time('macro')
setTimeout(() => {
  console.timeEnd('macro')  // 约 4-5ms
}, 0)

console.time('micro')
Promise.resolve().then(() => {
  console.timeEnd('micro')  // 约 0.1ms 以内
})
```
:::

::: details Node.js 中的 process.nextTick
```javascript
// Node.js 中优先级最高的微任务
console.log('1')

Promise.resolve().then(() => console.log('2'))

process.nextTick(() => console.log('3'))

console.log('4')

// 输出：1, 4, 3, 2
// nextTick 比 Promise 优先级还高
```
:::
