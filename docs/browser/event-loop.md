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

