# Fiber 架构

## 概述

**官方定义**: Fiber 是 React 16 引入的新的协调（Reconciliation）引擎，是对 React 核心算法的重新实现，目的是实现增量渲染和可中断的更新。

**通俗理解**: 把 Fiber 想象成一个"任务调度器"。以前 React 更新组件时是一口气干完所有工作（同步），现在可以把工作拆成小块，干一会儿歇一会儿，有急事还能先去处理急事（优先级调度）。这样页面就不会因为复杂更新而卡住了。

## 为什么需要 Fiber？

### React 15 的问题

```javascript
// React 15 的递归更新（Stack Reconciler）
// 一旦开始就无法中断，必须完成整棵树的比较和更新

function updateComponent(component) {
  // 假设组件树很深
  // 整个过程是同步的，会阻塞主线程
  const newVdom = component.render()
  diff(oldVdom, newVdom)
  commit(patches)  // 更新 DOM
}

// 问题：
// 1. 如果组件树很大，更新时间超过 16ms，会导致掉帧
// 2. 用户输入、动画等高优先级任务被阻塞
// 3. 页面出现卡顿感
```

### Fiber 的解决方案

```
React 15 (Stack Reconciler)
├── 递归遍历组件树
├── 同步执行，不可中断
├── 一次性完成所有工作
└── 可能导致长时间阻塞

React 16+ (Fiber Reconciler)
├── 链表结构遍历
├── 可中断、可恢复
├── 时间切片（Time Slicing）
├── 优先级调度
└── 保持页面响应
```

## Fiber 节点结构

### 核心属性

```javascript
// Fiber 节点的结构（简化版）
interface FiberNode {
  // === 静态结构 ===
  tag: WorkTag,           // 组件类型标记（函数组件、类组件、DOM 元素等）
  type: any,              // 具体类型（div、span、MyComponent 等）
  key: null | string,     // key 属性

  // === 实例 ===
  stateNode: any,         // 对应的真实 DOM 节点或类组件实例

  // === 链表结构 ===
  return: Fiber | null,   // 父 Fiber
  child: Fiber | null,    // 第一个子 Fiber
  sibling: Fiber | null,  // 兄弟 Fiber
  index: number,          // 在兄弟中的位置

  // === 工作单元 ===
  pendingProps: any,      // 新的 props
  memoizedProps: any,     // 上次渲染的 props
  memoizedState: any,     // 上次渲染的 state（Hooks 链表）
  updateQueue: any,       // 更新队列

  // === 副作用 ===
  flags: Flags,           // 副作用标记（Placement、Update、Deletion）
  subtreeFlags: Flags,    // 子树的副作用标记
  deletions: Array<Fiber> | null,  // 需要删除的子节点

  // === 调度 ===
  lanes: Lanes,           // 优先级
  childLanes: Lanes,      // 子树优先级

  // === 双缓存 ===
  alternate: Fiber | null // 指向另一棵树中对应的 Fiber
}

// WorkTag 类型
const FunctionComponent = 0;
const ClassComponent = 1;
const HostRoot = 3;        // 根节点
const HostComponent = 5;   // DOM 元素
const HostText = 6;        // 文本节点
```

### 链表结构

```javascript
/*
组件树结构:
    App
   /   \
  A     B
 / \
C   D

转换为 Fiber 链表:

App (root)
 │ child
 ↓
 A ──sibling──> B
 │ child        │ return
 ↓              ↓
 C ──sibling──> D
                │ return
                ↓
               App

遍历顺序：深度优先
App → A → C → D → B
*/

// 遍历 Fiber 树的代码
function performUnitOfWork(fiber) {
  // 1. 处理当前 Fiber（beginWork）
  const next = beginWork(fiber)

  // 2. 如果有子节点，返回子节点
  if (next) {
    return next
  }

  // 3. 没有子节点，处理完成工作（completeWork）
  let completedWork = fiber
  while (completedWork) {
    completeWork(completedWork)

    // 4. 如果有兄弟节点，返回兄弟节点
    if (completedWork.sibling) {
      return completedWork.sibling
    }

    // 5. 没有兄弟节点，返回父节点继续处理
    completedWork = completedWork.return
  }
}
```

## 双缓存机制

### 工作原理

```javascript
/*
双缓存（Double Buffering）：React 同时维护两棵 Fiber 树

1. current 树：当前屏幕上显示的内容对应的 Fiber 树
2. workInProgress 树：正在内存中构建的新 Fiber 树

它们通过 alternate 属性相互引用
*/

// 首次渲染
function createFiberRoot() {
  const root = {
    current: null,           // current 树
    finishedWork: null,      // 完成的 workInProgress 树
  }

  // 创建 rootFiber
  const rootFiber = createFiber(HostRoot, null)
  root.current = rootFiber

  return root
}

// 更新时的双缓存切换
function commitRoot(root) {
  const finishedWork = root.finishedWork

  // 切换 current 树
  // 原来的 workInProgress 树变成新的 current 树
  root.current = finishedWork
}

/*
首次渲染：
1. 构建 workInProgress 树
2. 渲染完成后，workInProgress 变为 current

更新渲染：
1. 基于 current 树创建 workInProgress 树（复用 Fiber 节点）
2. 在 workInProgress 树上进行更新
3. 渲染完成后，workInProgress 变为 current
4. 原来的 current 树变为下次更新的 workInProgress 树的基础
*/
```

### 双缓存的优势

```javascript
// 1. 快速切换
// 更新完成后只需要切换指针，而不是重新创建整棵树

// 2. 复用 Fiber 节点
function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate

  if (workInProgress === null) {
    // 首次渲染，创建新的 Fiber
    workInProgress = createFiber(current.tag, pendingProps)
    workInProgress.alternate = current
    current.alternate = workInProgress
  } else {
    // 更新时复用
    workInProgress.pendingProps = pendingProps
    workInProgress.flags = NoFlags
    workInProgress.subtreeFlags = NoFlags
    workInProgress.deletions = null
  }

  // 复用其他属性
  workInProgress.child = current.child
  workInProgress.memoizedProps = current.memoizedProps
  workInProgress.memoizedState = current.memoizedState

  return workInProgress
}
```

## 时间切片（Time Slicing）

### 原理

```javascript
// React 将渲染工作拆分成多个小任务
// 每个任务执行一小段时间后，检查是否需要让出主线程

// 使用 MessageChannel 实现调度（简化版）
const channel = new MessageChannel()
const port = channel.port2

channel.port1.onmessage = performWorkUntilDeadline

function schedulePerformWorkUntilDeadline() {
  port.postMessage(null)
}

// 每帧的时间切片（默认 5ms）
let frameInterval = 5

function performWorkUntilDeadline() {
  const currentTime = performance.now()

  // 计算截止时间
  let deadline = currentTime + frameInterval

  // 执行工作直到时间用完
  while (workInProgress && performance.now() < deadline) {
    workInProgress = performUnitOfWork(workInProgress)
  }

  // 如果还有工作，调度下一个时间切片
  if (workInProgress) {
    schedulePerformWorkUntilDeadline()
  }
}
```

### requestIdleCallback 的局限

```javascript
// React 没有使用 requestIdleCallback，原因：
// 1. 兼容性问题（Safari 不支持）
// 2. 触发频率不稳定（可能达不到 60fps）
// 3. 任务超时时间不可控

// React 自己实现了调度器（Scheduler）
// 使用 MessageChannel 实现类似效果，但更可控
```

## 优先级调度（Lanes）

### 优先级模型

```javascript
// React 18 使用 Lanes 模型表示优先级
// 每个 lane 是一个二进制位，可以组合多个优先级

const SyncLane = 0b0000000000000000000000000000001;  // 同步
const InputContinuousLane = 0b0000000000000000000000000000100;  // 连续输入
const DefaultLane = 0b0000000000000000000000000010000;  // 默认
const TransitionLane1 = 0b0000000000000000000000001000000;  // 过渡
const IdleLane = 0b0100000000000000000000000000000;  // 空闲

// 不同事件触发不同优先级
// 点击事件 → SyncLane（最高）
// 连续输入（拖拽、滚动） → InputContinuousLane
// setTimeout → DefaultLane
// useTransition → TransitionLane
// 空闲时任务 → IdleLane
```

### 优先级调度示例

```javascript
import { useState, useTransition } from 'react'

function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()

  function handleChange(e) {
    // 高优先级：立即更新输入框
    setQuery(e.target.value)

    // 低优先级：可以被中断的结果更新
    startTransition(() => {
      setResults(searchItems(e.target.value))
    })
  }

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {results.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

// 用户输入时：
// 1. query 立即更新（高优先级）
// 2. results 更新被标记为 transition（低优先级）
// 3. 如果用户继续输入，results 更新会被中断
// 4. 等用户停止输入后，才完成 results 更新
```

## 渲染流程

### 完整流程

```
触发更新（setState、useState）
    ↓
调度阶段（Scheduler）
├── 创建更新对象
├── 计算优先级
└── 调度任务
    ↓
协调阶段（Reconciler）- 可中断
├── beginWork（递）
│   ├── 创建/复用 Fiber 节点
│   ├── 标记副作用（flags）
│   └── 返回子节点
├── completeWork（归）
│   ├── 创建 DOM 节点
│   └── 收集副作用
└── 构建副作用链表
    ↓
提交阶段（Renderer）- 同步执行
├── Before Mutation（执行 getSnapshotBeforeUpdate）
├── Mutation（DOM 操作）
│   ├── Placement（插入）
│   ├── Update（更新）
│   └── Deletion（删除）
└── Layout（执行 useLayoutEffect）
```

### 代码流程

```javascript
// 1. 调度阶段
function scheduleUpdateOnFiber(fiber, lane) {
  // 标记更新优先级
  markUpdateLaneFromFiberToRoot(fiber, lane)

  // 调度任务
  ensureRootIsScheduled(root)
}

// 2. 协调阶段 - beginWork
function beginWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case FunctionComponent:
      return updateFunctionComponent(current, workInProgress, renderLanes)
    case ClassComponent:
      return updateClassComponent(current, workInProgress, renderLanes)
    case HostComponent:
      return updateHostComponent(current, workInProgress)
    // ...
  }
}

// 3. 协调阶段 - completeWork
function completeWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case HostComponent:
      // 创建或更新 DOM 节点
      if (current === null) {
        // 首次渲染：创建 DOM
        const instance = createInstance(workInProgress.type, workInProgress.pendingProps)
        workInProgress.stateNode = instance
      } else {
        // 更新：标记需要更新的属性
        updateHostComponent(current, workInProgress)
      }
      break
    // ...
  }
}

// 4. 提交阶段
function commitRoot(root) {
  const finishedWork = root.finishedWork

  // Before Mutation 阶段
  commitBeforeMutationEffects(finishedWork)

  // Mutation 阶段（DOM 操作）
  commitMutationEffects(finishedWork)

  // 切换 current 树
  root.current = finishedWork

  // Layout 阶段
  commitLayoutEffects(finishedWork)
}
```

## Diff 算法优化

### 三个假设

```javascript
// React 的 Diff 算法基于三个假设：

// 1. 不同类型的元素产生不同的树
<div><Counter /></div>  →  <span><Counter /></span>
// 直接销毁旧树，创建新树（不复用）

// 2. 通过 key 标识元素是否需要复用
<ul>
  <li key="a">A</li>    →  <ul>
  <li key="b">B</li>        <li key="b">B</li>  // 复用
</ul>                       <li key="a">A</li>  // 复用
                          </ul>

// 3. 同层比较
// 不会跨层级比较和移动节点
// 如果节点跨层级移动，会先删除再创建
```

### 单节点 Diff

```javascript
function reconcileSingleElement(returnFiber, currentFirstChild, element) {
  const key = element.key
  let child = currentFirstChild

  // 遍历旧的子节点
  while (child !== null) {
    if (child.key === key) {
      // key 相同
      if (child.elementType === element.type) {
        // type 也相同，可以复用
        deleteRemainingChildren(returnFiber, child.sibling)
        const existing = useFiber(child, element.props)
        existing.return = returnFiber
        return existing
      } else {
        // type 不同，删除所有旧节点
        deleteRemainingChildren(returnFiber, child)
        break
      }
    } else {
      // key 不同，删除当前节点，继续找
      deleteChild(returnFiber, child)
    }
    child = child.sibling
  }

  // 没找到可复用的，创建新节点
  const created = createFiberFromElement(element)
  created.return = returnFiber
  return created
}
```

### 多节点 Diff

```javascript
// 处理两种情况：
// 1. 节点更新（key 和 type 都相同）
// 2. 节点新增、删除、移动

function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
  // 第一轮遍历：处理更新
  for (let i = 0; i < newChildren.length; i++) {
    const newChild = newChildren[i]
    const oldFiber = oldFiberMap.get(newChild.key)

    if (oldFiber && canReuse(oldFiber, newChild)) {
      // 可以复用
      const newFiber = useFiber(oldFiber, newChild.props)
      // ...
    } else {
      // 不可复用，跳出第一轮
      break
    }
  }

  // 第二轮遍历：处理新增、删除、移动
  // 将剩余的旧节点放入 Map
  const existingChildren = mapRemainingChildren(returnFiber, oldFiber)

  // 遍历剩余的新节点
  for (; newIdx < newChildren.length; newIdx++) {
    const newChild = newChildren[newIdx]
    const newFiber = updateFromMap(existingChildren, newChild)

    if (newFiber) {
      // 判断是否需要移动
      if (oldIndex < lastPlacedIndex) {
        // 需要移动
        newFiber.flags |= Placement
      } else {
        lastPlacedIndex = oldIndex
      }
    }
  }

  // 删除剩余的旧节点
  existingChildren.forEach(child => deleteChild(returnFiber, child))
}
```

## 常见面试题

::: details 1. 什么是 React Fiber？解决了什么问题？
<details>
<summary>点击查看答案</summary>

**一句话答案**: Fiber 是 React 16 引入的新架构，将渲染工作拆分成可中断的小任务，解决了大型应用更新时的卡顿问题。

**详细答案**:

**解决的问题**:
- React 15 使用递归更新，一旦开始无法中断
- 大组件树更新时可能超过 16ms，导致掉帧
- 用户输入等高优先级任务被阻塞

**Fiber 的解决方案**:
1. **可中断的渲染**: 将递归改为循环，可以随时中断
2. **时间切片**: 将工作拆分到多帧完成
3. **优先级调度**: 高优先级任务可以打断低优先级任务

**口语化回答**:
"Fiber 是 React 16 的新架构，主要解决页面卡顿问题。以前 React 更新是一口气干完的，组件多的话会卡。现在有了 Fiber，更新可以分成小块来做，做一会儿歇一会儿，还能让用户输入这种急事先处理。原理是把组件树从树结构改成链表结构，这样遍历的时候可以随时停下来。"
:::

</details>

::: details 2. Fiber 和 Virtual DOM 的区别？
<details>
<summary>点击查看答案</summary>

**一句话答案**: Virtual DOM 是 UI 的轻量描述，Fiber 是工作单元和调度单元。

**对比**:

| 特性 | Virtual DOM | Fiber |
|------|-------------|-------|
| 定义 | UI 的 JS 对象表示 | 工作单元（包含更多信息） |
| 结构 | 树结构 | 链表结构 |
| 目的 | 减少 DOM 操作 | 实现可中断渲染 |
| 包含信息 | type、props、children | 状态、副作用、优先级等 |

```javascript
// Virtual DOM
{
  type: 'div',
  props: { className: 'container' },
  children: []
}

// Fiber
{
  type: 'div',
  pendingProps: { className: 'container' },
  memoizedProps: { className: 'container' },
  stateNode: DOM节点,
  return: 父Fiber,
  child: 子Fiber,
  sibling: 兄弟Fiber,
  flags: 副作用标记,
  lanes: 优先级
}
```

**口语化回答**:
"Virtual DOM 就是用 JS 对象来描述 UI 长什么样。Fiber 可以看作是 Virtual DOM 的升级版，除了描述 UI，还包含了调度需要的信息，比如优先级、副作用、指向父节点和兄弟节点的指针。Fiber 的链表结构是实现可中断渲染的关键。"
:::

</details>

::: details 3. 什么是双缓存机制？
<details>
<summary>点击查看答案</summary>

**一句话答案**: React 同时维护两棵 Fiber 树，current 树对应当前显示的内容，workInProgress 树是正在构建的新树。

**工作流程**:
1. 首次渲染：构建 workInProgress 树，完成后变成 current 树
2. 更新时：基于 current 树创建新的 workInProgress 树
3. 更新完成：workInProgress 和 current 互换

**优势**:
- 快速切换：只需改变指针
- 节点复用：通过 alternate 指针复用 Fiber 节点
- 渲染与显示分离：构建过程不影响当前显示

**口语化回答**:
"双缓存就像画画用两块画布，一块在展示，另一块在画新的。React 维护两棵 Fiber 树，current 是当前展示的，workInProgress 是正在构建的。更新的时候在 workInProgress 上操作，完成后它们角色互换。这样做的好处是构建过程不影响当前显示，而且 Fiber 节点可以复用，不用每次都重新创建。"
:::

</details>

::: details 4. React 的渲染流程是怎样的？
<details>
<summary>点击查看答案</summary>

**三个阶段**:

1. **调度阶段（Scheduler）**
   - 创建更新对象
   - 计算优先级
   - 调度任务

2. **协调阶段（Reconciler）** - 可中断
   - beginWork：创建/复用 Fiber，标记副作用
   - completeWork：创建 DOM，收集副作用
   - 构建副作用链表

3. **提交阶段（Renderer）** - 同步执行
   - Before Mutation：getSnapshotBeforeUpdate
   - Mutation：DOM 操作
   - Layout：useLayoutEffect

**口语化回答**:
"React 渲染分三个阶段。第一是调度阶段，决定什么时候更新、优先级是多少。第二是协调阶段，也叫 render 阶段，这个阶段可中断，会遍历 Fiber 树，计算出哪些节点需要更新，标记副作用。第三是提交阶段，也叫 commit 阶段，这个阶段同步执行，真正操作 DOM，执行生命周期和副作用。"
:::

</details>

::: details 5. 为什么 React 的 key 很重要？
<details>
<summary>点击查看答案</summary>

**一句话答案**: key 用于 Diff 算法中识别元素，决定是否可以复用节点。

**关键点**:
1. key 相同 + type 相同 = 可以复用
2. key 不同 = 销毁旧节点，创建新节点
3. 没有 key = 使用索引，可能导致问题

**不推荐使用索引作为 key**:

```jsx
// ❌ 使用索引作为 key
{items.map((item, index) => (
  <Item key={index} data={item} />
))}

// 问题：删除第一项时
// 原来：[A(key=0), B(key=1), C(key=2)]
// 删除 A 后：[B(key=0), C(key=1)]
// React 认为 key=0 的元素从 A 变成了 B，会触发不必要的更新

// ✅ 使用唯一 ID
{items.map(item => (
  <Item key={item.id} data={item} />
))}
```

**口语化回答**:
"key 是 React Diff 算法用来识别元素的标识。React 比较新旧节点时，先看 key 是否相同，再看 type 是否相同，都相同才会复用。不建议用数组索引作为 key，因为增删操作会导致索引变化，让 React 认为元素变了，触发不必要的更新，甚至出现状态错乱的 bug。最好用数据的唯一 ID 作为 key。"
:::

</details>

::: details 6. useTransition 和 useDeferredValue 有什么区别？
<details>
<summary>点击查看答案</summary>

**一句话答案**: useTransition 用于标记低优先级的状态更新，useDeferredValue 用于延迟更新某个值。

**对比**:

| 特性 | useTransition | useDeferredValue |
|------|---------------|------------------|
| 控制对象 | 状态更新函数 | 某个值 |
| 使用场景 | 控制 setState | 延迟响应 props/state |
| 返回值 | [isPending, startTransition] | 延迟后的值 |

```jsx
// useTransition - 控制状态更新
function SearchPage() {
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleChange(e) {
    setQuery(e.target.value)  // 高优先级
    startTransition(() => {
      setSearchResults(search(e.target.value))  // 低优先级
    })
  }

  return <div>{isPending ? 'Loading...' : <Results />}</div>
}

// useDeferredValue - 延迟值
function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query)

  // query 变化时，deferredQuery 会延迟更新
  // 可以用于避免频繁重新渲染
  const results = useMemo(() => search(deferredQuery), [deferredQuery])

  return <ul>{results.map(...)}</ul>
}
```

**口语化回答**:
"useTransition 是用来标记低优先级更新的，比如搜索框输入要立即响应，但搜索结果可以慢一点。useDeferredValue 是延迟某个值的更新，通常用于组件接收的 props。简单说，useTransition 是'我控制什么时候更新'，useDeferredValue 是'这个值可以晚点用新的'。"
:::

</details>
