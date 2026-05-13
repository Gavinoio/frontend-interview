# React 性能优化

React 应用的性能优化涉及减少不必要的渲染、优化组件结构和合理使用缓存。

## 理解 React 渲染机制

### 何时触发重新渲染

1. **State 变化**：组件自身 state 改变
2. **Props 变化**：父组件传递的 props 改变
3. **Context 变化**：订阅的 Context 值改变
4. **父组件重新渲染**：父组件渲染会触发所有子组件渲染

```jsx
function Parent() {
  const [count, setCount] = useState(0)

  console.log('Parent render')

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      {/* 即使 Child 的 props 没变，也会重新渲染 */}
      <Child name="Tom" />
    </div>
  )
}

function Child({ name }) {
  console.log('Child render')  // 每次点击都会打印
  return <p>Hello, {name}</p>
}
```

## React.memo

`React.memo` 是高阶组件，用于缓存组件，只在 props 变化时重新渲染。

### 基础用法

```jsx
const Child = React.memo(function Child({ name }) {
  console.log('Child render')
  return <p>Hello, {name}</p>
})

function Parent() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      {/* 现在只有 name 变化时才重新渲染 */}
      <Child name="Tom" />
    </div>
  )
}
```

### 自定义比较函数

```jsx
const UserCard = React.memo(
  function UserCard({ user, onClick }) {
    console.log('UserCard render')
    return (
      <div onClick={onClick}>
        <p>{user.name}</p>
        <p>{user.email}</p>
      </div>
    )
  },
  // 自定义比较函数
  (prevProps, nextProps) => {
    // 返回 true 表示不需要重新渲染
    return prevProps.user.id === nextProps.user.id
  }
)
```

### memo 失效的情况

```jsx
function Parent() {
  const [count, setCount] = useState(0)

  // ❌ 每次渲染都创建新对象，memo 失效
  const user = { name: 'Tom' }

  // ❌ 每次渲染都创建新函数，memo 失效
  const handleClick = () => console.log('clicked')

  return (
    <Child user={user} onClick={handleClick} />
  )
}

// ✅ 解决方案：使用 useMemo 和 useCallback
function Parent() {
  const [count, setCount] = useState(0)

  const user = useMemo(() => ({ name: 'Tom' }), [])
  const handleClick = useCallback(() => console.log('clicked'), [])

  return (
    <Child user={user} onClick={handleClick} />
  )
}
```

## useMemo

`useMemo` 用于缓存计算结果，只在依赖变化时重新计算。

### 缓存计算值

```jsx
function ProductList({ products, filter }) {
  // ✅ 只在 products 或 filter 变化时重新计算
  const filteredProducts = useMemo(() => {
    console.log('Filtering products...')
    return products.filter(p => p.category === filter)
  }, [products, filter])

  return (
    <ul>
      {filteredProducts.map(p => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  )
}
```

### 缓存引用值

```jsx
function Parent() {
  const [count, setCount] = useState(0)

  // ✅ 缓存对象引用，避免子组件不必要的渲染
  const config = useMemo(() => ({
    theme: 'dark',
    language: 'zh'
  }), [])

  // ✅ 缓存数组
  const items = useMemo(() => [1, 2, 3, 4, 5], [])

  return <Child config={config} items={items} />
}
```

### 何时使用 useMemo

```jsx
// ✅ 适合使用 useMemo
// 1. 计算开销大
const sortedList = useMemo(() => {
  return [...list].sort((a, b) => a.value - b.value)
}, [list])

// 2. 作为其他 Hook 的依赖
const memoizedValue = useMemo(() => ({ id: 1 }), [])
useEffect(() => {
  // 使用 memoizedValue
}, [memoizedValue])

// 3. 传递给 memo 包裹的子组件
const Child = React.memo(({ config }) => <div>{config.name}</div>)
const config = useMemo(() => ({ name: 'test' }), [])
<Child config={config} />

// ❌ 不需要使用 useMemo
// 1. 简单计算
const double = count * 2  // 直接计算即可

// 2. 原始值
const name = 'Tom'  // 原始值不需要缓存
```

## useCallback

`useCallback` 用于缓存函数引用，只在依赖变化时创建新函数。

### 基础用法

```jsx
function Parent() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')

  // ✅ 函数引用稳定，不会导致 Child 重新渲染
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])

  // ✅ 依赖 count，count 变化时创建新函数
  const handleIncrement = useCallback(() => {
    setCount(c => c + 1)
  }, [])  // 使用函数式更新，不需要依赖 count

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <Child onClick={handleClick} />
    </div>
  )
}

const Child = React.memo(({ onClick }) => {
  console.log('Child render')
  return <button onClick={onClick}>Click</button>
})
```

### 使用场景

```jsx
// 1. 传递给 memo 组件
const MemoChild = React.memo(({ onSubmit }) => { ... })

function Parent() {
  const handleSubmit = useCallback((data) => {
    submitData(data)
  }, [])

  return <MemoChild onSubmit={handleSubmit} />
}

// 2. 作为 useEffect 依赖
function SearchResults({ query }) {
  const fetchResults = useCallback(async () => {
    const data = await api.search(query)
    setResults(data)
  }, [query])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])
}

// 3. 自定义 Hook 中
function useDebounce(callback, delay) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  return useCallback((...args) => {
    // 使用 ref 避免依赖 callback
    setTimeout(() => callbackRef.current(...args), delay)
  }, [delay])
}
```

## 懒加载

### React.lazy

```jsx
import { lazy, Suspense } from 'react'

// 懒加载组件
const Dashboard = lazy(() => import('./Dashboard'))
const Settings = lazy(() => import('./Settings'))
const Profile = lazy(() => import('./Profile'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Suspense>
  )
}
```

### 命名导出的懒加载

```jsx
// utils.js
export const HeavyComponent = () => { ... }

// 懒加载命名导出
const HeavyComponent = lazy(() =>
  import('./utils').then(module => ({
    default: module.HeavyComponent
  }))
)
```

### 预加载

```jsx
const Dashboard = lazy(() => import('./Dashboard'))

// 预加载函数
const preloadDashboard = () => import('./Dashboard')

function Sidebar() {
  return (
    <nav>
      {/* 鼠标悬停时预加载 */}
      <Link
        to="/dashboard"
        onMouseEnter={preloadDashboard}
      >
        Dashboard
      </Link>
    </nav>
  )
}
```

## 虚拟列表

对于长列表，只渲染可视区域内的元素：

### 使用 react-window

```jsx
import { FixedSizeList as List } from 'react-window'

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  )

  return (
    <List
      height={400}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  )
}
```

### 使用 react-virtualized

```jsx
import { List, AutoSizer } from 'react-virtualized'

function VirtualList({ items }) {
  const rowRenderer = ({ index, key, style }) => (
    <div key={key} style={style}>
      {items[index].name}
    </div>
  )

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          width={width}
          rowCount={items.length}
          rowHeight={50}
          rowRenderer={rowRenderer}
        />
      )}
    </AutoSizer>
  )
}
```

## 状态优化

### 状态下沉

将状态放到需要它的最小组件中：

```jsx
// ❌ 状态提升过高，导致整个 App 重新渲染
function App() {
  const [inputValue, setInputValue] = useState('')

  return (
    <div>
      <Header />
      <Sidebar />
      <input
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
      />
      <Content />
    </div>
  )
}

// ✅ 状态下沉到需要的组件
function App() {
  return (
    <div>
      <Header />
      <Sidebar />
      <SearchInput />  {/* 状态在这里管理 */}
      <Content />
    </div>
  )
}

function SearchInput() {
  const [inputValue, setInputValue] = useState('')
  return (
    <input
      value={inputValue}
      onChange={e => setInputValue(e.target.value)}
    />
  )
}
```

### 拆分 Context

```jsx
// ❌ 单一大 Context，任何值变化都触发所有消费者更新
const AppContext = createContext()

function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState('light')
  const [notifications, setNotifications] = useState([])

  return (
    <AppContext.Provider value={{
      user, setUser,
      theme, setTheme,
      notifications, setNotifications
    }}>
      {children}
    </AppContext.Provider>
  )
}

// ✅ 拆分为多个 Context
const UserContext = createContext()
const ThemeContext = createContext()
const NotificationContext = createContext()

function AppProvider({ children }) {
  return (
    <UserProvider>
      <ThemeProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ThemeProvider>
    </UserProvider>
  )
}
```

## 避免不必要的渲染

### 使用 children 模式

```jsx
// ❌ ExpensiveComponent 会随 Parent 状态变化而重新渲染
function Parent() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <ExpensiveComponent />
    </div>
  )
}

// ✅ 将 ExpensiveComponent 作为 children 传入
function Parent({ children }) {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      {children}
    </div>
  )
}

function App() {
  return (
    <Parent>
      <ExpensiveComponent />  {/* 不会重新渲染 */}
    </Parent>
  )
}
```

### 使用 key 重置组件

```jsx
function UserProfile({ userId }) {
  // 使用 key 在 userId 变化时重置组件状态
  return <Profile key={userId} userId={userId} />
}

function Profile({ userId }) {
  const [isEditing, setIsEditing] = useState(false)
  // userId 变化时，整个组件重新挂载，isEditing 重置为 false
  return <div>...</div>
}
```

## 性能分析工具

### React DevTools Profiler

```jsx
// 使用 Profiler 组件测量渲染性能
import { Profiler } from 'react'

function onRenderCallback(
  id,              // Profiler 的 id
  phase,           // "mount" | "update"
  actualDuration,  // 本次渲染耗时
  baseDuration,    // 不使用 memo 时的预估耗时
  startTime,       // 开始渲染的时间
  commitTime       // 提交更新的时间
) {
  console.log({ id, phase, actualDuration })
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Main />
    </Profiler>
  )
}
```

### 使用 why-did-you-render

```javascript
// wdyr.js
import React from 'react'

if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render')
  whyDidYouRender(React, {
    trackAllPureComponents: true
  })
}

// 在入口文件顶部引入
import './wdyr'
```

