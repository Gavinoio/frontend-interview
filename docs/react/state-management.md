# React 状态管理

状态管理是 React 应用中的重要话题，不同规模的应用需要不同的状态管理方案。

## 状态管理方案选择

| 场景 | 推荐方案 |
|------|---------|
| 组件内状态 | useState |
| 组件间共享（简单） | Context + useReducer |
| 中小型应用 | Zustand / Jotai |
| 大型应用 | Redux Toolkit |
| 服务端状态 | React Query / SWR |

## Context + useReducer

适合中小型应用的轻量级状态管理：

```jsx
import { createContext, useContext, useReducer } from 'react'

// 定义 reducer
const initialState = {
  user: null,
  theme: 'light',
  notifications: []
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'SET_THEME':
      return { ...state, theme: action.payload }
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      }
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          n => n.id !== action.payload
        )
      }
    default:
      return state
  }
}

// 创建 Context
const AppContext = createContext()

// Provider 组件
function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const actions = {
    setUser: (user) => dispatch({ type: 'SET_USER', payload: user }),
    setTheme: (theme) => dispatch({ type: 'SET_THEME', payload: theme }),
    addNotification: (notification) =>
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification }),
    removeNotification: (id) =>
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
  }

  return (
    <AppContext.Provider value={{ state, ...actions }}>
      {children}
    </AppContext.Provider>
  )
}

// 自定义 Hook
function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

// 使用
function UserInfo() {
  const { state, setUser } = useApp()

  return (
    <div>
      <p>用户: {state.user?.name}</p>
      <button onClick={() => setUser({ name: 'Tom' })}>
        设置用户
      </button>
    </div>
  )
}
```

## Redux Toolkit

现代 Redux 的推荐写法，大幅简化了样板代码：

### 安装

```bash
npm install @reduxjs/toolkit react-redux
```

### 创建 Slice

```javascript
// features/counter/counterSlice.js
import { createSlice } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0
  },
  reducers: {
    increment: (state) => {
      state.value += 1  // Immer 支持直接修改
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload
    }
  }
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions
export default counterSlice.reducer
```

### 配置 Store

```javascript
// store/index.js
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'
import userReducer from '../features/user/userSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer
  }
})
```

### 使用 Provider

```jsx
import { Provider } from 'react-redux'
import { store } from './store'

function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  )
}
```

### 组件中使用

```jsx
import { useSelector, useDispatch } from 'react-redux'
import { increment, decrement, incrementByAmount } from './counterSlice'

function Counter() {
  const count = useSelector((state) => state.counter.value)
  const dispatch = useDispatch()

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => dispatch(increment())}>+1</button>
      <button onClick={() => dispatch(decrement())}>-1</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
    </div>
  )
}
```

### 异步操作

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// 创建异步 thunk
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users')
      return response.json()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

// 组件中使用
function UserList() {
  const { list, loading, error } = useSelector((state) => state.users)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <ul>
      {list.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

## Zustand

轻量级状态管理库，API 简洁：

### 安装

```bash
npm install zustand
```

### 创建 Store

```javascript
import { create } from 'zustand'

const useStore = create((set, get) => ({
  // 状态
  count: 0,
  user: null,

  // 同步操作
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  setUser: (user) => set({ user }),

  // 异步操作
  fetchUser: async (id) => {
    const response = await fetch(`/api/users/${id}`)
    const user = await response.json()
    set({ user })
  },

  // 获取其他状态
  doubleCount: () => get().count * 2
}))

export default useStore
```

### 组件中使用

```jsx
import useStore from './store'

function Counter() {
  // 只订阅需要的状态，避免不必要的重渲染
  const count = useStore((state) => state.count)
  const increment = useStore((state) => state.increment)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
    </div>
  )
}

function User() {
  const user = useStore((state) => state.user)
  const fetchUser = useStore((state) => state.fetchUser)

  useEffect(() => {
    fetchUser(1)
  }, [fetchUser])

  return <div>{user?.name}</div>
}
```

### 中间件

```javascript
import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

const useStore = create(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 }))
      }),
      {
        name: 'counter-storage',  // localStorage key
        partialize: (state) => ({ count: state.count })  // 只持久化 count
      }
    )
  )
)
```

## Jotai

原子化状态管理，类似 Recoil：

### 安装

```bash
npm install jotai
```

### 基本用法

```jsx
import { atom, useAtom } from 'jotai'

// 创建原子状态
const countAtom = atom(0)
const userAtom = atom(null)

// 派生状态
const doubleCountAtom = atom((get) => get(countAtom) * 2)

// 只写原子
const incrementAtom = atom(
  null,
  (get, set) => set(countAtom, get(countAtom) + 1)
)

// 组件中使用
function Counter() {
  const [count, setCount] = useAtom(countAtom)
  const [doubleCount] = useAtom(doubleCountAtom)

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {doubleCount}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </div>
  )
}
```

### 异步原子

```jsx
const userAtom = atom(async () => {
  const response = await fetch('/api/user')
  return response.json()
})

function User() {
  const [user] = useAtom(userAtom)  // Suspense 自动处理 loading

  return <div>{user.name}</div>
}

// 使用时需要 Suspense
<Suspense fallback={<Loading />}>
  <User />
</Suspense>
```

## React Query

专门处理服务端状态的库：

### 安装

```bash
npm install @tanstack/react-query
```

### 配置

```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5分钟内数据保持新鲜
      refetchOnWindowFocus: false
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserList />
    </QueryClientProvider>
  )
}
```

### 查询数据

```jsx
import { useQuery } from '@tanstack/react-query'

function UserList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json())
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <button onClick={() => refetch()}>刷新</button>
      <ul>
        {data.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  )
}

// 带参数的查询
function UserDetail({ userId }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(res => res.json()),
    enabled: !!userId  // 条件查询
  })

  return <div>{user?.name}</div>
}
```

### 变更数据

```jsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

function CreateUser() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (newUser) =>
      fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser)
      }).then(res => res.json()),

    onSuccess: () => {
      // 使缓存失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate({ name: 'New User' })
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? '创建中...' : '创建用户'}
      </button>
      {mutation.isError && <p>Error: {mutation.error.message}</p>}
    </form>
  )
}
```

### 乐观更新

```jsx
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    // 取消进行中的查询
    await queryClient.cancelQueries({ queryKey: ['todos'] })

    // 保存旧数据
    const previousTodos = queryClient.getQueryData(['todos'])

    // 乐观更新
    queryClient.setQueryData(['todos'], (old) =>
      old.map(todo =>
        todo.id === newTodo.id ? newTodo : todo
      )
    )

    return { previousTodos }
  },
  onError: (err, newTodo, context) => {
    // 回滚
    queryClient.setQueryData(['todos'], context.previousTodos)
  },
  onSettled: () => {
    // 重新获取
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  }
})
```

## 状态管理最佳实践

### 1. 按功能拆分状态

```javascript
// 不好：所有状态放一起
const useStore = create((set) => ({
  user: null,
  todos: [],
  theme: 'light',
  notifications: [],
  // ...太多了
}))

// 好：按功能模块拆分
const useUserStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user })
}))

const useTodoStore = create((set) => ({
  todos: [],
  addTodo: (todo) => set((state) => ({
    todos: [...state.todos, todo]
  }))
}))
```

### 2. 区分服务端状态和客户端状态

```javascript
// 服务端状态：用 React Query
const { data: users } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers
})

// 客户端状态：用 Zustand
const useUIStore = create((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({
    sidebarOpen: !state.sidebarOpen
  }))
}))
```

### 3. 选择性订阅

```javascript
// 不好：订阅整个 store
const state = useStore()

// 好：只订阅需要的部分
const count = useStore((state) => state.count)
const increment = useStore((state) => state.increment)
```

## 常见面试题

::: details 1. Redux 和 Context 的区别？
- Redux 有中间件、DevTools、性能优化
- Context 适合简单场景，值变化会导致所有消费者重渲染
- Redux 可以通过 selector 精确订阅
:::

::: details 2. 什么时候使用全局状态？
- 多个不相关组件需要共享的数据
- 用户登录信息、主题设置
- 需要跨页面持久化的数据
- 避免过度使用，能用 props 解决就用 props
:::

::: details 3. Redux Toolkit 相比传统 Redux 有什么优势？
- 内置 Immer，可以直接修改状态
- createSlice 自动生成 action creators
- configureStore 自动配置中间件
- 大幅减少样板代码
:::

::: details 4. React Query 和 Redux 的区别？
- React Query 专注于服务端状态（缓存、同步）
- Redux 是通用状态管理
- React Query 自动处理 loading、error、缓存失效
- 两者可以配合使用
:::
