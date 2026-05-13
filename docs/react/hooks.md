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

