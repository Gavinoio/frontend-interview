# React Hooks 原理与面试题 【高频必考】

## 官方定义
Hooks 是 React 16.8 引入的新特性，让你在不编写 class 的情况下使用 state 以及其他的 React 特性。

## 白话解释
以前写 React 组件必须用 class，现在用函数就能搞定状态管理、生命周期等功能。Hooks 就像是给函数组件装上了"插件"，让它拥有了 class 组件的能力。

---

## Hooks 基本原理

### Hooks 的存储结构

```javascript
// React 内部使用链表存储 Hooks
// 每个组件都有一个 fiber 节点，fiber.memoizedState 指向 hooks 链表

// 简化的 Hook 结构
const hook = {
  memoizedState: any,    // 存储的状态值
  baseState: any,        // 初始状态
  baseQueue: Update,     // 待处理的更新队列
  queue: UpdateQueue,    // 更新队列
  next: Hook | null      // 指向下一个 hook
}

// hooks 链表示意
fiber.memoizedState -> hook1 -> hook2 -> hook3 -> null
```

### 为什么 Hooks 不能在条件语句中使用？

```javascript
// ❌ 错误示例
function Component() {
  if (condition) {
    const [a, setA] = useState(0)  // Hook 1
  }
  const [b, setB] = useState(0)    // Hook 2

  // 第一次渲染：condition = true
  // hooks 链表：hook1(a) -> hook2(b)

  // 第二次渲染：condition = false
  // hooks 链表：hook1(b) -> ???
  // React 按顺序取值，导致 b 取到了 a 的值！
}

// ✅ 正确做法
function Component() {
  const [a, setA] = useState(0)
  const [b, setB] = useState(0)

  // 在 hook 内部使用条件
  useEffect(() => {
    if (condition) {
      // do something
    }
  }, [condition])
}
```

---

## 核心 Hooks 详解

### 1. useState

#### 基本用法

```jsx
const [state, setState] = useState(initialState)

// 直接设置新值
setState(newValue)

// 函数式更新（基于前一个状态）
setState(prevState => prevState + 1)

// 惰性初始化（复杂计算只执行一次）
const [state, setState] = useState(() => {
  return expensiveComputation()
})
```

#### useState 实现原理

```javascript
let hooks = []
let currentIndex = 0

function useState(initialValue) {
  const index = currentIndex

  // 如果是首次渲染，初始化 state
  if (hooks[index] === undefined) {
    hooks[index] = typeof initialValue === 'function'
      ? initialValue()
      : initialValue
  }

  const setState = (newValue) => {
    // 支持函数式更新
    hooks[index] = typeof newValue === 'function'
      ? newValue(hooks[index])
      : newValue

    // 触发重新渲染
    render()
  }

  currentIndex++
  return [hooks[index], setState]
}

// 每次渲染前重置 index
function render() {
  currentIndex = 0
  // 重新执行组件函数...
}
```

#### 面试题：useState 是同步还是异步的？

```jsx
function Counter() {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    setCount(count + 1)
    console.log(count)  // 输出 0，不是 1！

    setCount(count + 1)
    setCount(count + 1)
    console.log(count)  // 还是 0，最终 count 是 1
  }

  // 使用函数式更新
  const handleClick2 = () => {
    setCount(c => c + 1)
    setCount(c => c + 1)
    setCount(c => c + 1)
    // 最终 count 是 3
  }

  return <button onClick={handleClick}>{count}</button>
}
```

**答案**：
- React 18 之前：事件处理函数中是异步的（批量更新），setTimeout/原生事件中是同步的
- React 18 之后：所有更新都是异步的（Automatic Batching）

---

### 2. useEffect

#### 执行时机

```jsx
// 每次渲染后执行
useEffect(() => {
  console.log('每次渲染后')
})

// 首次渲染后执行
useEffect(() => {
  console.log('componentDidMount')
}, [])

// 依赖变化时执行
useEffect(() => {
  console.log('count 变化了')
}, [count])

// 清理函数（组件卸载或依赖变化前执行）
useEffect(() => {
  const timer = setInterval(() => {}, 1000)

  return () => {
    clearInterval(timer)  // 清理定时器
  }
}, [])
```

#### useEffect vs useLayoutEffect

```jsx
// useEffect - 异步执行，不阻塞渲染
useEffect(() => {
  // 浏览器绑
  // DOM 变更 -> 浏览器绘制 -> useEffect 执行
}, [])

// useLayoutEffect - 同步执行，阻塞渲染
useLayoutEffect(() => {
  // DOM 变更 -> useLayoutEffect 执行 -> 浏览器绘制
  // 适用于需要同步读取/修改 DOM 的场景
}, [])

// 使用场景示例
function Tooltip({ position }) {
  const ref = useRef()

  // ❌ 使用 useEffect 可能会闪烁
  useEffect(() => {
    ref.current.style.left = position.x + 'px'
  }, [position])

  // ✅ 使用 useLayoutEffect 避免闪烁
  useLayoutEffect(() => {
    ref.current.style.left = position.x + 'px'
  }, [position])

  return <div ref={ref}>Tooltip</div>
}
```

#### 常见陷阱：闭包问题

```jsx
function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count)  // 永远是 0！闭包陷阱
      setCount(count + 1) // 永远设置为 1
    }, 1000)

    return () => clearInterval(timer)
  }, [])  // 空依赖数组导致闭包

  // 解决方案1：添加依赖
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [count])  // 每次 count 变化重新创建定时器

  // 解决方案2：函数式更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1)  // 使用函数式更新
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 解决方案3：使用 ref
  const countRef = useRef(count)
  countRef.current = count

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(countRef.current)  // 始终是最新值
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return <div>{count}</div>
}
```

---

### 3. useRef

```jsx
function TextInput() {
  // 1. 获取 DOM 引用
  const inputRef = useRef(null)

  const focusInput = () => {
    inputRef.current.focus()
  }

  // 2. 保存可变值（不触发重渲染）
  const renderCount = useRef(0)
  renderCount.current++

  // 3. 保存前一个值
  const prevCount = useRef()
  useEffect(() => {
    prevCount.current = count
  }, [count])

  return <input ref={inputRef} />
}
```

#### useRef vs 普通变量

```jsx
function Component() {
  // ❌ 普通变量每次渲染都会重置
  let count = 0

  // ✅ useRef 的值在渲染间保持
  const countRef = useRef(0)

  const handleClick = () => {
    count++           // 下次渲染又变成 0
    countRef.current++ // 值会保留
  }
}
```

---

### 4. useMemo 和 useCallback

#### useMemo - 缓存计算结果

```jsx
function ExpensiveComponent({ list, filter }) {
  // ❌ 每次渲染都重新计算
  const filteredList = list.filter(item => item.type === filter)

  // ✅ 只有依赖变化时才重新计算
  const filteredList = useMemo(() => {
    return list.filter(item => item.type === filter)
  }, [list, filter])

  return <div>{filteredList.map(...)}</div>
}
```

#### useCallback - 缓存函数引用

```jsx
function Parent() {
  const [count, setCount] = useState(0)

  // ❌ 每次渲染都创建新函数，导致子组件重渲染
  const handleClick = () => {
    console.log('clicked')
  }

  // ✅ 函数引用保持不变
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])

  // ✅ 如果需要访问 state，添加依赖
  const handleClickWithCount = useCallback(() => {
    console.log(count)
  }, [count])

  return <Child onClick={handleClick} />
}

// 子组件使用 memo 才能受益于 useCallback
const Child = React.memo(({ onClick }) => {
  console.log('Child render')
  return <button onClick={onClick}>Click</button>
})
```

#### 什么时候使用？

```jsx
// ✅ 使用 useMemo 的场景
// 1. 计算量大的操作
const sorted = useMemo(() => expensiveSort(items), [items])

// 2. 保持引用相等（作为其他 hook 的依赖）
const config = useMemo(() => ({ a: 1, b: 2 }), [])
useEffect(() => {
  // config 引用不变，effect 不会重复执行
}, [config])

// ✅ 使用 useCallback 的场景
// 1. 传递给使用 memo 的子组件
// 2. 作为其他 hook 的依赖

// ❌ 不需要使用的场景
// 1. 简单的计算
const doubled = count * 2  // 不需要 useMemo

// 2. 没有传递给子组件的函数
const handleLocalClick = () => {}  // 不需要 useCallback
```

---

### 5. useContext

```jsx
// 创建 Context
const ThemeContext = createContext('light')

// Provider
function App() {
  const [theme, setTheme] = useState('dark')

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Child />
    </ThemeContext.Provider>
  )
}

// Consumer - 使用 useContext
function Child() {
  const { theme, setTheme } = useContext(ThemeContext)

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      当前主题: {theme}
    </button>
  )
}
```

#### Context 性能优化

```jsx
// ❌ value 每次渲染都是新对象，导致所有消费者重渲染
function App() {
  const [user, setUser] = useState({})
  const [theme, setTheme] = useState('light')

  return (
    <AppContext.Provider value={{ user, theme, setUser, setTheme }}>
      <Child />
    </AppContext.Provider>
  )
}

// ✅ 使用 useMemo 缓存 value
function App() {
  const [user, setUser] = useState({})
  const [theme, setTheme] = useState('light')

  const value = useMemo(() => ({
    user, theme, setUser, setTheme
  }), [user, theme])

  return (
    <AppContext.Provider value={value}>
      <Child />
    </AppContext.Provider>
  )
}

// ✅ 更好的方案：拆分 Context
const UserContext = createContext()
const ThemeContext = createContext()
```

---

### 6. useReducer

```jsx
// 定义 reducer
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 }
    case 'decrement':
      return { count: state.count - 1 }
    case 'reset':
      return { count: action.payload }
    default:
      throw new Error()
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 })

  return (
    <div>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset', payload: 0 })}>Reset</button>
    </div>
  )
}
```

#### useState vs useReducer

| 场景 | useState | useReducer |
|------|----------|------------|
| 简单状态 | ✅ 推荐 | 过度设计 |
| 复杂状态逻辑 | 难以维护 | ✅ 推荐 |
| 多个相关状态 | 需要多个 useState | ✅ 统一管理 |
| 状态更新依赖前一个状态 | 可以，但繁琐 | ✅ 更清晰 |

---

## 自定义 Hooks

### 常用自定义 Hooks

#### useToggle

```jsx
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue(v => !v)
  }, [])

  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return [value, { toggle, setTrue, setFalse }]
}

// 使用
const [isOpen, { toggle, setTrue, setFalse }] = useToggle()
```

#### useLocalStorage

```jsx
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    setStoredValue(prev => {
      const newValue = typeof value === 'function' ? value(prev) : value
      window.localStorage.setItem(key, JSON.stringify(newValue))
      return newValue
    })
  }, [key])

  return [storedValue, setValue]
}

// 使用
const [user, setUser] = useLocalStorage('user', null)
```

#### useDebounce

```jsx
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// 使用
function SearchInput() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 500)

  useEffect(() => {
    if (debouncedQuery) {
      fetchSearchResults(debouncedQuery)
    }
  }, [debouncedQuery])
}
```

#### usePrevious

```jsx
function usePrevious(value) {
  const ref = useRef()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

// 使用
function Counter() {
  const [count, setCount] = useState(0)
  const prevCount = usePrevious(count)

  return (
    <div>
      Now: {count}, Before: {prevCount}
    </div>
  )
}
```

#### useRequest（简化版）

```jsx
function useRequest(fetchFn, options = {}) {
  const { manual = false, defaultParams = [] } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const run = useCallback(async (...params) => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchFn(...params)
      setData(result)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchFn])

  useEffect(() => {
    if (!manual) {
      run(...defaultParams)
    }
  }, [])

  return { data, loading, error, run }
}

// 使用
const { data, loading, error, run } = useRequest(fetchUserList)
const { run: createUser } = useRequest(createUserApi, { manual: true })
```

---

## 经典面试题

::: details 面试题 1：说说 Hooks 的实现原理？
<details>
<summary>点击查看答案</summary>

1. **存储方式**：Hooks 以链表形式存储在组件对应的 Fiber 节点上
2. **调用顺序**：React 按照 Hooks 的调用顺序来匹配状态，所以不能在条件语句中使用
3. **两个阶段**：
   - mount 阶段：创建 hook 链表
   - update 阶段：按顺序读取并更新 hooks

```javascript
// 简化原理
let workInProgressHook = null
let firstWorkInProgressHook = null

function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null,
    baseState: null,
    next: null
  }

  if (workInProgressHook === null) {
    firstWorkInProgressHook = workInProgressHook = hook
  } else {
    workInProgressHook = workInProgressHook.next = hook
  }

  return workInProgressHook
}
```
:::

---

</details>

::: details 面试题 2：useEffect 和 useLayoutEffect 的区别？
<details>
<summary>点击查看答案</summary>

| 特性 | useEffect | useLayoutEffect |
|------|-----------|-----------------|
| 执行时机 | DOM 更新后，浏览器绑制后 | DOM 更新后，浏览器绘制前 |
| 是否阻塞渲染 | 否 | 是 |
| 使用场景 | 大多数副作用 | 需要同步读取/修改 DOM |

**执行顺序**：
```
DOM 变更 -> useLayoutEffect -> 浏览器绘制 -> useEffect
```

**使用建议**：
- 默认使用 useEffect
- 只有在需要同步操作 DOM、避免闪烁时才用 useLayoutEffect
:::

---

</details>

::: details 面试题 3：为什么不能在循环、条件或嵌套函数中调用 Hooks？
<details>
<summary>点击查看答案</summary>

React 使用**调用顺序**来关联 Hook 和其存储的状态。如果 Hook 的调用顺序在不同渲染间发生变化，React 就无法正确匹配状态。

```javascript
// 假设有这样的代码
if (condition) {
  useState('A')  // Hook 1
}
useState('B')    // Hook 2

// 第一次渲染 condition = true:
// Hook 链表: [A] -> [B]

// 第二次渲染 condition = false:
// Hook 链表: [B] -> ???
// React 认为第一个 Hook 应该是 A，但实际调用的是 B
```

**解决方案**：
- 将条件判断放在 Hook 内部
- 使用多个独立的 Hook
:::

---

</details>

::: details 面试题 4：如何用 Hooks 模拟生命周期？
<details>
<summary>点击查看答案</summary>

```jsx
// componentDidMount
useEffect(() => {
  console.log('mounted')
}, [])

// componentDidUpdate
const mounted = useRef(false)
useEffect(() => {
  if (mounted.current) {
    console.log('updated')
  } else {
    mounted.current = true
  }
})

// componentWillUnmount
useEffect(() => {
  return () => {
    console.log('will unmount')
  }
}, [])

// shouldComponentUpdate
// 使用 React.memo 包裹组件

// getDerivedStateFromProps
// 在渲染期间直接更新 state
function Component({ value }) {
  const [prevValue, setPrevValue] = useState(value)
  const [derived, setDerived] = useState(compute(value))

  if (value !== prevValue) {
    setPrevValue(value)
    setDerived(compute(value))
  }
}
```
:::

---

</details>

::: details 面试题 5：React 18 的 useTransition 和 useDeferredValue？
<details>
<summary>点击查看答案</summary>

**useTransition** - 标记非紧急更新

```jsx
function SearchResults() {
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleChange = (e) => {
    // 紧急更新：输入框立即响应
    setQuery(e.target.value)

    // 非紧急更新：可以被中断
    startTransition(() => {
      setSearchResults(filterData(e.target.value))
    })
  }

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending ? <Loading /> : <Results />}
    </div>
  )
}
```

**useDeferredValue** - 延迟显示新值

```jsx
function SearchResults({ query }) {
  // query 变化时，deferredQuery 会延迟更新
  const deferredQuery = useDeferredValue(query)

  // 可以用来显示旧数据的同时加载新数据
  const isStale = query !== deferredQuery

  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      <Results query={deferredQuery} />
    </div>
  )
}
```
:::

---

</details>

::: details 面试题 6：手写一个 useUpdate（强制更新）
<details>
<summary>点击查看答案</summary>

```jsx
function useUpdate() {
  const [, setState] = useState({})

  return useCallback(() => {
    setState({})  // 每次传入新对象触发更新
  }, [])
}

// 使用
function Component() {
  const forceUpdate = useUpdate()

  return <button onClick={forceUpdate}>Force Update</button>
}

// 或者使用 useReducer
function useUpdate() {
  const [, dispatch] = useReducer(x => x + 1, 0)
  return dispatch
}
```
:::

---

</details>

::: details 面试题 7：useEffect 的依赖数组为空和不传的区别？
<details>
<summary>点击查看答案</summary>

```jsx
// 不传依赖数组：每次渲染后都执行
useEffect(() => {
  console.log('每次渲染后')
})

// 空数组：只在 mount 时执行一次
useEffect(() => {
  console.log('只在 mount 时')
}, [])

// 有依赖：依赖变化时执行
useEffect(() => {
  console.log('count 变化时')
}, [count])
```
:::

---

</details>

## 总结速记

```
1. Hooks 用链表存储，按顺序匹配，不能在条件中使用
2. useState 更新是异步的（批量更新）
3. useEffect 在渲染后异步执行，useLayoutEffect 同步执行
4. useRef 保存可变值，不触发渲染
5. useMemo 缓存值，useCallback 缓存函数
6. 自定义 Hook 以 use 开头，可以调用其他 Hook
7. React 18 引入 useTransition、useDeferredValue 处理并发
```

---

## 高频面试题

::: details 面试题 1：React Hooks 的使用规则是什么？
#### 一句话答案
只在最顶层调用 Hooks，只在 React 函数中调用 Hooks。

#### 详细解答

React Hooks 有两条核心规则：

**规则一：只在最顶层调用 Hooks**
- 不要在循环、条件或嵌套函数中调用 Hooks
- 确保 Hooks 在每次渲染时都以相同的顺序被调用

**规则二：只在 React 函数中调用 Hooks**
- 在 React 函数组件中调用 Hooks
- 在自定义 Hooks 中调用其他 Hooks
- 不要在普通的 JavaScript 函数中调用

```jsx
// ❌ 错误示例
function Component({ condition }) {
  // 错误1：在条件语句中使用 Hook
  if (condition) {
    const [count, setCount] = useState(0)
  }

  // 错误2：在循环中使用 Hook
  for (let i = 0; i < 3; i++) {
    useEffect(() => {}, [])
  }

  // 错误3：在嵌套函数中使用 Hook
  const handleClick = () => {
    const [value, setValue] = useState(0)  // 不允许
  }

  return null
}

// ✅ 正确示例
function Component({ condition }) {
  // 正确1：始终调用 Hook
  const [count, setCount] = useState(0)

  // 正确2：在 Hook 内部使用条件
  useEffect(() => {
    if (condition) {
      // 条件逻辑放在 Hook 内部
    }
  }, [condition])

  // 正确3：使用多个独立的 Hook
  const [value1, setValue1] = useState(0)
  const [value2, setValue2] = useState(0)
  const [value3, setValue3] = useState(0)

  return <div>{count}</div>
}

// ✅ 自定义 Hook（以 use 开头）
function useCustomHook() {
  const [state, setState] = useState(0)
  useEffect(() => {
    // 可以在自定义 Hook 中调用其他 Hooks
  }, [])

  return [state, setState]
}
```

**为什么有这些规则？**

```javascript
// React 内部使用链表存储 Hooks
// 每个组件的 Hooks 按调用顺序存储

// 第一次渲染
useState('name')     // Hook 1
useState(0)          // Hook 2
useEffect(() => {})  // Hook 3

// 如果在条件中使用 Hook
if (condition) {
  useState('name')   // 有时是 Hook 1
}
useState(0)          // 有时是 Hook 1，有时是 Hook 2

// React 无法确定哪个 state 对应哪个 Hook
// 导致状态错乱
```

**ESLint 插件**

```bash
# 安装 ESLint 插件自动检查规则
npm install eslint-plugin-react-hooks --save-dev
```

```json
// .eslintrc.json
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",      // 检查 Hooks 规则
    "react-hooks/exhaustive-deps": "warn"        // 检查 effect 依赖
  }
}
```

#### 面试口语化回答模板

> "React Hooks 主要有两条使用规则。第一条是只在最顶层调用 Hooks，不能在循环、条件或嵌套函数中使用，因为 React 依赖 Hooks 的调用顺序来匹配状态，如果顺序变了就会出问题。第二条是只在 React 函数组件或自定义 Hooks 中调用，不能在普通 JavaScript 函数里用。
>
> 实际开发中，我们会配合 eslint-plugin-react-hooks 插件来自动检查这些规则，它会在你违反规则时给出警告或错误提示，帮助我们避免常见问题。"

---
:::

::: details 面试题 2：useState 和 useReducer 的区别？
#### 一句话答案
useState 适合简单状态，useReducer 适合复杂状态逻辑或多个相关状态。

#### 详细解答

**useState - 简单状态管理**

```jsx
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(c => c + 1)}>+1 (函数式)</button>
    </div>
  )
}
```

**useReducer - 复杂状态管理**

```jsx
// 1. 定义 reducer 函数
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 }
    case 'decrement':
      return { count: state.count - 1 }
    case 'incrementBy':
      return { count: state.count + action.payload }
    case 'reset':
      return { count: 0 }
    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}

// 2. 使用 useReducer
function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 })

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+1</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-1</button>
      <button onClick={() => dispatch({ type: 'incrementBy', payload: 5 })}>+5</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  )
}
```

**核心区别对比**

| 维度 | useState | useReducer |
|------|----------|------------|
| **适用场景** | 简单独立的状态 | 复杂的状态逻辑 |
| **状态更新** | 直接设置新值 | 通过 action 描述如何更新 |
| **多个相关状态** | 需要多个 useState | 统一在 reducer 中管理 |
| **状态更新逻辑** | 分散在组件各处 | 集中在 reducer 函数中 |
| **可测试性** | 较难测试 | reducer 是纯函数，易测试 |
| **代码可读性** | 简单直观 | 复杂但结构清晰 |

**实际场景对比**

```jsx
// 场景1：简单的表单状态 - 使用 useState
function SimpleForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  return (
    <form>
      <input value={name} onChange={e => setName(e.target.value)} />
      <input value={email} onChange={e => setEmail(e.target.value)} />
    </form>
  )
}

// 场景2：复杂的表单状态 - 使用 useReducer
function formReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'SET_ERROR':
      return { ...state, errors: { ...state.errors, [action.field]: action.error } }
    case 'SUBMIT':
      return { ...state, isSubmitting: true }
    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitting: false, isSuccess: true }
    case 'SUBMIT_FAILURE':
      return { ...state, isSubmitting: false, error: action.error }
    case 'RESET':
      return action.initialState
    default:
      return state
  }
}

function ComplexForm() {
  const initialState = {
    name: '',
    email: '',
    password: '',
    errors: {},
    isSubmitting: false,
    isSuccess: false,
    error: null
  }

  const [state, dispatch] = useReducer(formReducer, initialState)

  const handleChange = (field) => (e) => {
    dispatch({ type: 'SET_FIELD', field, value: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch({ type: 'SUBMIT' })

    try {
      await submitForm(state)
      dispatch({ type: 'SUBMIT_SUCCESS' })
    } catch (error) {
      dispatch({ type: 'SUBMIT_FAILURE', error })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={state.name} onChange={handleChange('name')} />
      <input value={state.email} onChange={handleChange('email')} />
      <input value={state.password} onChange={handleChange('password')} />
      {state.error && <div>{state.error}</div>}
      <button disabled={state.isSubmitting}>
        {state.isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
```

**useState 转 useReducer 的改造**

```jsx
// 使用 useState（多个相关状态）
function TodoList() {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text, done: false }])
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }
}

// 使用 useReducer（统一管理）
function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, { id: Date.now(), text: action.text, done: false }]
      }
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.id ? { ...todo, done: !todo.done } : todo
        )
      }
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.id)
      }
    case 'SET_FILTER':
      return { ...state, filter: action.filter }
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading }
    default:
      return state
  }
}

function TodoList() {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    filter: 'all',
    isLoading: false
  })

  const addTodo = (text) => {
    dispatch({ type: 'ADD_TODO', text })
  }

  const toggleTodo = (id) => {
    dispatch({ type: 'TOGGLE_TODO', id })
  }

  const deleteTodo = (id) => {
    dispatch({ type: 'DELETE_TODO', id })
  }
}
```

**何时选择 useReducer？**

1. 状态逻辑复杂，包含多个子值
2. 下一个状态依赖于之前的状态
3. 有多个相关的状态需要一起更新
4. 状态更新逻辑需要复用或测试
5. 想要更清晰的状态更新追踪（类似 Redux）

#### 面试口语化回答模板

> "useState 和 useReducer 的主要区别在于适用场景和状态管理方式。useState 更适合简单的、独立的状态，比如一个开关、一个输入框的值。它的 API 简单直接，直接调用 setState 就能更新状态。
>
> useReducer 更适合复杂的状态逻辑，特别是当你有多个相关的状态，或者状态更新逻辑比较复杂的时候。它通过 dispatch 发送 action 来描述发生了什么，然后在 reducer 函数里集中处理状态更新逻辑。这样做的好处是状态更新逻辑更清晰、更容易测试，也更容易追踪状态变化。
>
> 我在项目中遇到复杂表单或者购物车这种场景时，会选择 useReducer，因为它能让代码更好维护。简单场景还是用 useState，不要过度设计。"

---
:::

::: details 面试题 3：useEffect 和 useLayoutEffect 的区别？
#### 一句话答案
useEffect 在浏览器绘制后异步执行，useLayoutEffect 在浏览器绘制前同步执行。

#### 详细解答

**执行时机的根本区别**

```
渲染流程：
React 更新 DOM → useLayoutEffect 执行 → 浏览器绘制 → useEffect 执行

具体来说：
1. React 执行你的组件代码，得到新的 JSX
2. React 更新 DOM（此时用户还看不到）
3. useLayoutEffect 同步执行（阻塞渲染）
4. 浏览器绘制到屏幕（用户看到新界面）
5. useEffect 异步执行（不阻塞渲染）
```

**useEffect - 异步执行，不阻塞渲染**

```jsx
function Component() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log('useEffect 执行')
    // 在浏览器绘制后执行
    // 不会阻塞页面更新
  }, [count])

  console.log('组件渲染')

  return <div>{count}</div>
}

// 执行顺序：
// 1. 组件渲染
// 2. 浏览器绘制
// 3. useEffect 执行
```

**useLayoutEffect - 同步执行，阻塞渲染**

```jsx
function Component() {
  const [count, setCount] = useState(0)

  useLayoutEffect(() => {
    console.log('useLayoutEffect 执行')
    // 在浏览器绘制前执行
    // 会阻塞页面更新
  }, [count])

  console.log('组件渲染')

  return <div>{count}</div>
}

// 执行顺序：
// 1. 组件渲染
// 2. useLayoutEffect 执行
// 3. 浏览器绘制
```

**实际场景对比**

**场景1：测量 DOM 尺寸**

```jsx
// ❌ 使用 useEffect - 会闪烁
function Tooltip({ children }) {
  const [tooltipHeight, setTooltipHeight] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const { height } = ref.current.getBoundingClientRect()
    setTooltipHeight(height)
  }, [])

  return (
    <div
      ref={ref}
      style={{
        // 首次渲染 tooltipHeight = 0，显示在上方
        // useEffect 执行后 tooltipHeight 有值，跳到下方
        // 用户会看到闪烁
        top: tooltipHeight > 100 ? -tooltipHeight : 'auto'
      }}
    >
      {children}
    </div>
  )
}

// ✅ 使用 useLayoutEffect - 不会闪烁
function Tooltip({ children }) {
  const [tooltipHeight, setTooltipHeight] = useState(0)
  const ref = useRef(null)

  useLayoutEffect(() => {
    const { height } = ref.current.getBoundingClientRect()
    setTooltipHeight(height)
    // 在浏览器绘制前就计算好位置
    // 用户只会看到最终结果
  }, [])

  return (
    <div
      ref={ref}
      style={{
        top: tooltipHeight > 100 ? -tooltipHeight : 'auto'
      }}
    >
      {children}
    </div>
  )
}
```

**场景2：动画初始化**

```jsx
// ❌ 使用 useEffect - 动画可能有延迟
function AnimatedBox({ isOpen }) {
  const ref = useRef(null)

  useEffect(() => {
    if (isOpen) {
      // 浏览器已经绘制了，再开始动画
      // 可能看到短暂的静止
      ref.current.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(100px)' }
      ], { duration: 300 })
    }
  }, [isOpen])

  return <div ref={ref}>Box</div>
}

// ✅ 使用 useLayoutEffect - 动画流畅
function AnimatedBox({ isOpen }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    if (isOpen) {
      // 在浏览器绘制前设置动画
      // 动画立��开始，无延迟
      ref.current.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(100px)' }
      ], { duration: 300 })
    }
  }, [isOpen])

  return <div ref={ref}>Box</div>
}
```

**场景3：滚动位置恢复**

```jsx
// ✅ 使用 useLayoutEffect
function ScrollRestoration() {
  const ref = useRef(null)
  const scrollPosition = useRef(0)

  useLayoutEffect(() => {
    // 在浏览器绘制前恢复滚动位置
    // 用户看不到滚动条跳动
    ref.current.scrollTop = scrollPosition.current
  }, [])

  const handleScroll = () => {
    scrollPosition.current = ref.current.scrollTop
  }

  return <div ref={ref} onScroll={handleScroll}>...</div>
}
```

**性能对比**

```jsx
// useEffect - 不阻塞渲染，性能更好
function Component() {
  useEffect(() => {
    // 耗时操作不会影响页面渲染
    doExpensiveWork()
  }, [])

  return <div>Content</div>
}

// useLayoutEffect - 阻塞渲染，可能影响性能
function Component() {
  useLayoutEffect(() => {
    // 耗时操作会延迟页面显示
    // 用户会感觉卡顿
    doExpensiveWork()  // ⚠️ 避免在这里做耗时操作
  }, [])

  return <div>Content</div>
}
```

**选择指南**

```jsx
// ✅ 使用 useEffect 的场景（99% 的情况）
useEffect(() => {
  // 1. 数据请求
  fetchData()

  // 2. 订阅事件
  window.addEventListener('resize', handler)

  // 3. 手动修改 DOM（不影响布局）
  document.title = 'New Title'

  // 4. 日志记录
  analytics.track('page_view')
}, [])

// ✅ 使用 useLayoutEffect 的场景（少数情况）
useLayoutEffect(() => {
  // 1. 测量 DOM 尺寸
  const rect = ref.current.getBoundingClientRect()

  // 2. 同步修改 DOM 样式（避免闪烁）
  ref.current.style.top = calculatePosition()

  // 3. 需要在绘制前读取/修改 DOM
  const scrollHeight = ref.current.scrollHeight
}, [])
```

**对比总结**

| 特性 | useEffect | useLayoutEffect |
|------|-----------|-----------------|
| **执行时机** | 浏览器绘制后 | 浏览器绘制前 |
| **是否阻塞渲染** | 否（异步） | 是（同步） |
| **适用场景** | 大多数副作用 | 需要同步读取/修改 DOM |
| **性能影响** | 不影响渲染性能 | 可能延迟页面显示 |
| **是否会闪烁** | 可能（DOM 操作时） | 不会 |
| **SSR** | 兼容性好 | 服务端会警告 |

#### 面试口语化回答模板

> "useEffect 和 useLayoutEffect 的核心区别在于执行时机。useEffect 是在浏览器完成绘制之后异步执行的，不会阻塞页面更新，性能更好，适合大多数场景，比如数据请求、事件监听等。
>
> useLayoutEffect 是在浏览器绘制之前同步执行的，会阻塞渲染。它的使用场景比较特殊，主要是在需要同步读取或修改 DOM 布局的时候，比如测量元素尺寸、计算位置、避免布局闪烁等。
>
> 我的使用原则是：默认使用 useEffect，只有在出现视觉闪烁或者需要在渲染前同步操作 DOM 时才改用 useLayoutEffect。因为 useLayoutEffect 会阻塞渲染，如果里面有耗时操作，用户会感觉页面卡顿。"

---
:::

::: details 面试题 4：useMemo 和 useCallback 的区别？
#### 一句话答案
useMemo 缓存计算结果（值），useCallback 缓存函数引用。

#### 详细解答

**基本概念**

```jsx
// useMemo - 返回缓存的值
const memoizedValue = useMemo(() => {
  return computeExpensiveValue(a, b)
}, [a, b])

// useCallback - 返回缓存的函数
const memoizedCallback = useCallback(() => {
  doSomething(a, b)
}, [a, b])

// 实际上 useCallback 是 useMemo 的语法糖
useCallback(fn, deps) === useMemo(() => fn, deps)
```

**useMemo - 缓存计算结果**

```jsx
function ProductList({ products, category, sortOrder }) {
  // ❌ 没有使用 useMemo - 每次渲染都重新计算
  const filteredProducts = products
    .filter(p => p.category === category)
    .sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price)

  // 即使 products、category、sortOrder 都没变
  // 组件重渲染时（比如父组件状态变化）还是会重新计算

  // ✅ 使用 useMemo - 只在依赖变化时重新计算
  const filteredProducts = useMemo(() => {
    console.log('重新计算...')
    return products
      .filter(p => p.category === category)
      .sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price)
  }, [products, category, sortOrder])

  // 依赖没变时，直接返回缓存的结果

  return <div>{filteredProducts.map(p => <div key={p.id}>{p.name}</div>)}</div>
}
```

**useCallback - 缓存函数引用**

```jsx
function Parent() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')

  // ❌ 没有使用 useCallback - 每次渲染都创建新函数
  const handleClick = () => {
    console.log('clicked')
  }
  // Parent 重渲染时，handleClick 是新的函数引用
  // 即使函数内容相同，也会导致子组件重渲染

  // ✅ 使用 useCallback - 函数引用保持不变
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])
  // 依赖数组为空，handleClick 引用永远不变

  // ✅ 如果函数内部使用了 state，需要添加依赖
  const handleClickWithCount = useCallback(() => {
    console.log('count:', count)
  }, [count])
  // count 变化时才创建新函数

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <MemoizedChild onClick={handleClick} />
    </div>
  )
}

// 子组件必须用 React.memo 包裹，useCallback 才有意义
const MemoizedChild = React.memo(({ onClick }) => {
  console.log('Child render')
  return <button onClick={onClick}>Click Me</button>
})

// 如果子组件没用 memo，即使用了 useCallback 也没用
function RegularChild({ onClick }) {
  console.log('Child render')  // 父组件每次渲染都会执行
  return <button onClick={onClick}>Click Me</button>
}
```

**实际场景对比**

**场景1：列表过滤与排序**

```jsx
function DataTable({ data, filters }) {
  // useMemo 缓存计算结果
  const processedData = useMemo(() => {
    console.log('Processing data...')

    let result = data

    // 过滤
    if (filters.search) {
      result = result.filter(item =>
        item.name.includes(filters.search)
      )
    }

    // 排序
    if (filters.sortBy) {
      result = [...result].sort((a, b) =>
        a[filters.sortBy] > b[filters.sortBy] ? 1 : -1
      )
    }

    return result
  }, [data, filters])
  // 只有 data 或 filters 变化时才重新计算

  return <table>{processedData.map(...)}</table>
}
```

**场景2：表单事件处理**

```jsx
function Form() {
  const [formData, setFormData] = useState({ name: '', email: '' })

  // useCallback 缓存事件处理函数
  const handleNameChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, name: e.target.value }))
  }, [])  // 使用函数式更新，无需依赖 formData

  const handleEmailChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, email: e.target.value }))
  }, [])

  const handleSubmit = useCallback(async () => {
    await submitForm(formData)
  }, [formData])  // 依赖 formData，因为需要使用它的值

  return (
    <form>
      <MemoInput value={formData.name} onChange={handleNameChange} />
      <MemoInput value={formData.email} onChange={handleEmailChange} />
      <MemoButton onClick={handleSubmit}>Submit</MemoButton>
    </form>
  )
}

const MemoInput = React.memo(({ value, onChange }) => {
  console.log('Input render')
  return <input value={value} onChange={onChange} />
})
```

**场景3：作为 useEffect 的依赖**

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  // ❌ 没有使用 useCallback - 无限循环
  const fetchUser = () => {
    fetch(`/api/users/${userId}`).then(setUser)
  }

  useEffect(() => {
    fetchUser()
  }, [fetchUser])  // fetchUser 每次都是新的，导致无限循环

  // ✅ 使用 useCallback - 避免无限循环
  const fetchUser = useCallback(() => {
    fetch(`/api/users/${userId}`).then(setUser)
  }, [userId])  // 只有 userId 变化时才重新创建函数

  useEffect(() => {
    fetchUser()
  }, [fetchUser])  // fetchUser 引用稳定，effect 不会重复执行
}
```

**场景4：配置对象**

```jsx
function Chart({ data }) {
  // ❌ 普通对象 - 每次渲染都是新对象
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    }
  }

  useEffect(() => {
    // options 每次都变，effect 重复执行
  }, [options])

  // ✅ 使用 useMemo - 保持引用稳定
  const options = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    }
  }), [])  // 空依赖，options 永远不变

  useEffect(() => {
    // options 引用稳定，effect 只执行一次
  }, [options])

  return <ChartComponent data={data} options={options} />
}
```

**何时使用？何时不使用？**

```jsx
// ✅ 应该使用 useMemo 的场景
// 1. 计算量大的操作
const expensiveResult = useMemo(() => {
  return hugeArray.reduce((acc, item) => {
    // 复杂计算...
  }, {})
}, [hugeArray])

// 2. 引用类型作为 useEffect/useMemo 的依赖
const config = useMemo(() => ({ a: 1, b: 2 }), [])
useEffect(() => {}, [config])

// 3. 需要传递给使用了 React.memo 的子组件的对象/数组
const data = useMemo(() => [1, 2, 3], [])
<MemoChild data={data} />

// ❌ 不需要使用 useMemo 的场景
// 1. 简单��计算
const doubled = count * 2  // 不需要 useMemo

// 2. 基本类型的值
const text = useMemo(() => 'hello', [])  // 多此一举

// ✅ 应该使用 useCallback 的场景
// 1. 传递给使用了 React.memo 的子组件
const handleClick = useCallback(() => {}, [])
<MemoChild onClick={handleClick} />

// 2. 作为 useEffect/useMemo 等 Hook 的依赖
const fetchData = useCallback(() => {}, [userId])
useEffect(() => { fetchData() }, [fetchData])

// 3. 自定义 Hook 返回的函数
function useCustomHook() {
  const doSomething = useCallback(() => {}, [])
  return { doSomething }
}

// ❌ 不需要使用 useCallback 的场景
// 1. 没有传递给子组件的函数
const handleLocalClick = () => {}  // 本地使用，不需要 useCallback

// 2. 子组件没有使用 React.memo
<RegularChild onClick={handleClick} />  // Child 没 memo，useCallback 无意义
```

**性能陷阱**

```jsx
// ⚠️ 过度使用反而降低性能
function Component({ value }) {
  // ❌ 简单计算用 useMemo，反而更慢
  const doubled = useMemo(() => value * 2, [value])
  // useMemo 本身有开销，简单计算不值得

  // ✅ 直接计算更快
  const doubled = value * 2

  // ❌ 不必要的 useCallback
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])

  // 如果没有传给 memo 子组件，没必要用 useCallback
  return <button onClick={handleClick}>Click</button>
}
```

**对比总结**

| 维度 | useMemo | useCallback |
|------|---------|-------------|
| **返回值** | 缓存的计算结果 | 缓存的函数 |
| **语法** | `useMemo(() => value, deps)` | `useCallback(fn, deps)` |
| **使用场景** | 复杂计算、保持对象引用 | 传递给子组件的回调函数 |
| **本质** | 缓存值 | 缓存函数（useMemo 的语法糖） |
| **何时重新创建** | 依赖变化时重新计算 | 依赖变化时重新创建函数 |
| **配合使用** | React.memo、其他 Hook 依赖 | React.memo |

#### 面试口语化回答模板

> "useMemo 和 useCallback 都是 React 提供的性能优化 Hook，主要区别是缓存的内容不同。useMemo 缓存的是计算结果，返回一个值；useCallback 缓存的是函数引用，返回一个函数。实际上 useCallback 就是 useMemo 的语法糖。
>
> 我一般在这几种场景下使用它们：useMemo 用在计算量大的操作，或者需要保持对象、数组引用稳定的时候；useCallback 主要用在传递给子组件的回调函数，但前提是子组件用了 React.memo 包裹，否则没有意义。
>
> 使用时要注意避免过度优化，简单的计算直接写就行，不要什么都用 useMemo 包一层，反而会因为 Hook 本身的开销降低性能。"

---
:::

::: details 面试题 5：如何自定义 Hook？
#### 一句话答案
自定义 Hook 是以 use 开头的函数，内部可以调用其他 Hooks，用于复用状态逻辑。

#### 详细解答

**自定义 Hook 的基本规则**

1. 函数名必须以 `use` 开头（React 规范）
2. 可以调用其他 Hooks（useState、useEffect 等）
3. 可以返回任何值（状态、函数、对象等）
4. 遵循 Hooks 的使用规则

**基础示例：从简单到复杂**

**示例1：useToggle - 开关状态管理**

```jsx
// 最简单的自定义 Hook
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue(v => !v)
  }, [])

  return [value, toggle]
}

// 使用
function Modal() {
  const [isOpen, toggleOpen] = useToggle(false)

  return (
    <div>
      <button onClick={toggleOpen}>Toggle Modal</button>
      {isOpen && <div>Modal Content</div>}
    </div>
  )
}

// 增强版：返回更多控制方法
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => setValue(v => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return [value, { toggle, setTrue, setFalse, setValue }]
}

// 使用增强版
function Component() {
  const [isVisible, { toggle, setTrue, setFalse }] = useToggle()

  return (
    <div>
      <button onClick={toggle}>Toggle</button>
      <button onClick={setTrue}>Show</button>
      <button onClick={setFalse}>Hide</button>
    </div>
  )
}
```

**示例2：useLocalStorage - 持久化状态**

```jsx
function useLocalStorage(key, initialValue) {
  // 惰性初始化：从 localStorage 读取
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  // 包装 setState，同时更新 localStorage
  const setValue = useCallback((value) => {
    try {
      // 支持函数式更新
      const valueToStore = value instanceof Function
        ? value(storedValue)
        : value

      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}

// 使用
function UserSettings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light')
  const [language, setLanguage] = useLocalStorage('language', 'zh')

  return (
    <div>
      <select value={theme} onChange={e => setTheme(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <p>当前主题: {theme}</p>
    </div>
  )
}
```

**示例3：useDebounce - 防抖值**

```jsx
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // 设置定时器
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // 清理函数：值变化时清除上一个定时器
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

// 使用：搜索输入框
function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // 只在防抖后的值变化时请求
  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchSearchResults(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm])

  return (
    <input
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

**示例4：useFetch - 数据请求**

```jsx
function useFetch(url, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 使用 useCallback 避免 effect 重复执行
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url, options)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const json = await response.json()
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [url, options])

  // 自动请求
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // 返回数据和重新请求的方法
  return { data, loading, error, refetch: fetchData }
}

// 使用
function UserList() {
  const { data, loading, error, refetch } = useFetch('/api/users')

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {data?.map(user => <li key={user.id}>{user.name}</li>)}
      </ul>
    </div>
  )
}

// 增强版：支持手动请求和参数
function useRequest(fetchFn, options = {}) {
  const { manual = false, defaultParams = [] } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(!manual)
  const [error, setError] = useState(null)

  const run = useCallback(async (...params) => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchFn(...params)
      setData(result)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchFn])

  // 非手动模式下自动执行
  useEffect(() => {
    if (!manual) {
      run(...defaultParams)
    }
  }, [manual, run, defaultParams])

  return {
    data,
    loading,
    error,
    run,
    mutate: setData  // 手动修改数据
  }
}

// 使用增强版
function UserProfile() {
  // 自动请求
  const { data: user, loading } = useRequest(
    () => fetchUser(userId),
    { defaultParams: [userId] }
  )

  // 手动请求
  const { run: updateUser, loading: updating } = useRequest(
    updateUserAPI,
    { manual: true }
  )

  const handleUpdate = async () => {
    await updateUser({ name: 'New Name' })
  }
}
```

**示例5：useWindowSize - 监听窗口大小**

```jsx
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    // 处理函数
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    // 添加事件监听
    window.addEventListener('resize', handleResize)

    // 清理函数：移除事件监听
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])  // 空依赖，只在 mount/unmount 时执行

  return windowSize
}

// 使用
function ResponsiveComponent() {
  const { width, height } = useWindowSize()

  return (
    <div>
      {width < 768 ? (
        <MobileView />
      ) : (
        <DesktopView />
      )}
      <p>窗口大小: {width} x {height}</p>
    </div>
  )
}
```

**示例6：useInterval - 声明式定时器**

```jsx
function useInterval(callback, delay) {
  const savedCallback = useRef()

  // 记住最新的 callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // 设置定时器
  useEffect(() => {
    // delay 为 null 时不启动定时器
    if (delay === null) return

    const tick = () => {
      savedCallback.current()
    }

    const id = setInterval(tick, delay)

    // 清理定时器
    return () => clearInterval(id)
  }, [delay])
}

// 使用
function Counter() {
  const [count, setCount] = useState(0)
  const [delay, setDelay] = useState(1000)
  const [isRunning, setIsRunning] = useState(true)

  useInterval(() => {
    setCount(count + 1)
  }, isRunning ? delay : null)

  return (
    <div>
      <h1>{count}</h1>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? 'Pause' : 'Start'}
      </button>
      <input
        type="number"
        value={delay}
        onChange={e => setDelay(Number(e.target.value))}
      />
    </div>
  )
}
```

**示例7：usePrevious - 获取前一个值**

```jsx
function usePrevious(value) {
  const ref = useRef()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

// 使用
function Counter() {
  const [count, setCount] = useState(0)
  const prevCount = usePrevious(count)

  return (
    <div>
      <p>Now: {count}</p>
      <p>Before: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  )
}

// 增强版：对比变化
function useCompare(value) {
  const prevValue = usePrevious(value)

  return {
    current: value,
    previous: prevValue,
    hasChanged: value !== prevValue
  }
}
```

**示例8：useEventListener - 事件监听**

```jsx
function useEventListener(eventName, handler, element = window) {
  const savedHandler = useRef()

  // 更新 ref.current 的值
  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    // 确保元素支持 addEventListener
    const isSupported = element && element.addEventListener
    if (!isSupported) return

    // 创建事件处理器，调用存储的函数
    const eventListener = (event) => savedHandler.current(event)

    // 添加事件监听
    element.addEventListener(eventName, eventListener)

    // 清理函数
    return () => {
      element.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element])
}

// 使用
function Component() {
  const [coords, setCoords] = useState({ x: 0, y: 0 })

  useEventListener('mousemove', (e) => {
    setCoords({ x: e.clientX, y: e.clientY })
  })

  return <div>鼠标位置: {coords.x}, {coords.y}</div>
}
```

**自定义 Hook 的最佳实践**

```jsx
// 1. 命名规范：必须以 use 开头
function useMyHook() {}  // ✅
function myHook() {}     // ❌

// 2. 可以返回任何值
function useUser() {
  // 返回数组（类似 useState）
  return [user, setUser]

  // 返回对象（更灵活，可扩展）
  return { user, loading, error, refetch }

  // 返回单个值
  return user
}

// 3. 组合其他 Hooks
function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const prevUser = usePrevious(user)  // 使用其他自定义 Hook

  useEffect(() => {
    // ...
  }, [])

  return { user, loading, prevUser }
}

// 4. 处理清理逻辑
function useSubscription(url) {
  useEffect(() => {
    const subscription = subscribe(url)

    // 返回清理函数
    return () => {
      subscription.unsubscribe()
    }
  }, [url])
}

// 5. 参数设计
function useRequest(
  fetchFn,                    // 必需参数
  options = {}                // 可选参数（使用默认值）
) {
  const {
    manual = false,           // 解构 + 默认值
    onSuccess,                // 可选回调
    onError
  } = options

  // ...
}
```

#### 面试口语化回答模板

> "自定义 Hook 是 React 提供的一种代码复用机制，本质就是一个以 use 开头的函数，内部可以调用其他 Hooks。它的作用是提取组件逻辑，让多个组件共享状态逻辑。
>
> 写自定义 Hook 主要遵循几个原则：第一，函数名必须以 use 开头，这是 React 的规范；第二，内部可以调用其他 Hooks，比如 useState、useEffect 等；第三，可以返回任何值，可以是数组、对象或者单个值，看具体需求。
>
> 我在项目中常用的自定义 Hook 有：useToggle 管理开关状态、useDebounce 做输入防抖、useRequest 封装数据请求、useLocalStorage 做数据持久化等。写自定义 Hook 的关键是找到可复用的状态逻辑，然后抽取出来，让代码更干净、更易维护。"
:::
