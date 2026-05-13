# React 状态管理方案对比

## 概述

React 生态中有多种状态管理方案，从内置的 Context + useReducer 到第三方库 Redux、MobX、Zustand、Jotai、Recoil 等。本文对比分析各方案的特点和适用场景。

---

## 一、方案全览

| 方案 | 包大小 | 学习曲线 | 模式 | DevTools | TypeScript |
|------|--------|----------|------|----------|------------|
| Context + useReducer | 0 | 低 | Flux | React DevTools | 原生 |
| Redux Toolkit | ~11KB | 中 | Flux | Redux DevTools | 完整 |
| MobX | ~16KB | 中 | 响应式 | MobX DevTools | 完整 |
| Zustand | ~1KB | 低 | Flux | Redux DevTools | 完整 |
| Jotai | ~2KB | 低 | 原子化 | Jotai DevTools | 完整 |
| Recoil | ~22KB | 中 | 原子化 | Recoil DevTools | 完整 |
| Valtio | ~3KB | 低 | 代理 | Valtio DevTools | 完整 |

---

## 二、Context + useReducer

### 1. 基本用法

```jsx
import { createContext, useContext, useReducer } from 'react'

// 定义 Action 类型
const ActionTypes = {
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  SET_COUNT: 'SET_COUNT'
}

// Reducer
function counterReducer(state, action) {
  switch (action.type) {
    case ActionTypes.INCREMENT:
      return { ...state, count: state.count + 1 }
    case ActionTypes.DECREMENT:
      return { ...state, count: state.count - 1 }
    case ActionTypes.SET_COUNT:
      return { ...state, count: action.payload }
    default:
      return state
  }
}

// 初始状态
const initialState = { count: 0 }

// 创建 Context
const CounterContext = createContext(null)

// Provider 组件
export function CounterProvider({ children }) {
  const [state, dispatch] = useReducer(counterReducer, initialState)

  const actions = {
    increment: () => dispatch({ type: ActionTypes.INCREMENT }),
    decrement: () => dispatch({ type: ActionTypes.DECREMENT }),
    setCount: (value) => dispatch({ type: ActionTypes.SET_COUNT, payload: value })
  }

  return (
    <CounterContext.Provider value={{ state, ...actions }}>
      {children}
    </CounterContext.Provider>
  )
}

// 自定义 Hook
export function useCounter() {
  const context = useContext(CounterContext)
  if (!context) {
    throw new Error('useCounter must be used within CounterProvider')
  }
  return context
}

// 使用
function Counter() {
  const { state, increment, decrement } = useCounter()

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  )
}
```

### 2. 性能优化

```jsx
import { createContext, useContext, useReducer, useMemo, useCallback } from 'react'

// 分离 State 和 Dispatch Context 避免不必要渲染
const StateContext = createContext(null)
const DispatchContext = createContext(null)

function CounterProvider({ children }) {
  const [state, dispatch] = useReducer(counterReducer, initialState)

  // 稳定的 actions 引用
  const actions = useMemo(() => ({
    increment: () => dispatch({ type: 'INCREMENT' }),
    decrement: () => dispatch({ type: 'DECREMENT' })
  }), [])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={actions}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

// 只订阅状态
function useCounterState() {
  return useContext(StateContext)
}

// 只订阅 actions
function useCounterActions() {
  return useContext(DispatchContext)
}

// 按钮组件 - 只需要 actions，不会因为 state 变化而重渲染
function IncrementButton() {
  const { increment } = useCounterActions()
  console.log('Button rendered')
  return <button onClick={increment}>+</button>
}

// 显示组件 - 只需要 state
function CountDisplay() {
  const { count } = useCounterState()
  console.log('Display rendered')
  return <p>Count: {count}</p>
}
```

### 优缺点

```
优点:
- 无需安装依赖
- 学习成本低
- 适合简单场景

缺点:
- Context 变化会触发所有消费者重渲染
- 没有中间件支持
- 调试工具有限
- 大型应用难以维护
```

---

## 三、Redux Toolkit

### 1. 基本用法

```bash
npm install @reduxjs/toolkit react-redux
```

```javascript
// store/counterSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// 异步 Action
export const fetchCount = createAsyncThunk(
  'counter/fetchCount',
  async (amount) => {
    const response = await fetch(`/api/count?amount=${amount}`)
    return response.json()
  }
)

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0,
    status: 'idle',
    error: null
  },
  reducers: {
    increment: (state) => {
      state.value += 1  // Immer 允许直接修改
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCount.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchCount.fulfilled, (state, action) => {
        state.status = 'idle'
        state.value = action.payload
      })
      .addCase(fetchCount.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  }
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions
export default counterSlice.reducer
```

```javascript
// store/index.js
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './counterSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(/* 自定义中间件 */),
  devTools: process.env.NODE_ENV !== 'production'
})

// TypeScript 类型
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

```jsx
// App.jsx
import { Provider, useSelector, useDispatch } from 'react-redux'
import { store } from './store'
import { increment, decrement, fetchCount } from './store/counterSlice'

function Counter() {
  const count = useSelector((state) => state.counter.value)
  const status = useSelector((state) => state.counter.status)
  const dispatch = useDispatch()

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
      <button
        onClick={() => dispatch(fetchCount(10))}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? '加载中...' : '异步获取'}
      </button>
    </div>
  )
}

function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  )
}
```

### 2. RTK Query (数据获取)

```javascript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['User', 'Post'],
  endpoints: (builder) => ({
    // 查询
    getUsers: builder.query({
      query: () => 'users',
      providesTags: ['User']
    }),

    getUserById: builder.query({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }]
    }),

    // 变更
    addUser: builder.mutation({
      query: (body) => ({
        url: 'users',
        method: 'POST',
        body
      }),
      invalidatesTags: ['User']
    }),

    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `users/${id}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }]
    })
  })
})

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useAddUserMutation,
  useUpdateUserMutation
} = api

// 使用
function UserList() {
  const { data: users, isLoading, error } = useGetUsersQuery()
  const [addUser] = useAddUserMutation()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error!</div>

  return (
    <div>
      {users.map(user => <div key={user.id}>{user.name}</div>)}
      <button onClick={() => addUser({ name: 'New User' })}>
        添加用户
      </button>
    </div>
  )
}
```

### 优缺点

```
优点:
- 官方维护，生态完善
- DevTools 强大
- 中间件系统灵活
- RTK Query 简化数据获取
- 可预测的状态更新

缺点:
- 相对较大的包体积
- 仍有一定样板代码
- 对简单场景可能过度设计
```

---

## 四、Zustand

### 1. 基本用法

```bash
npm install zustand
```

```javascript
import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'

// 基础 Store
const useCounterStore = create((set, get) => ({
  // 状态
  count: 0,

  // 同步 Actions
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),

  // 异步 Actions
  incrementAsync: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    set((state) => ({ count: state.count + 1 }))
  },

  // 使用 get() 获取当前状态
  doubleCount: () => get().count * 2
}))

// 使用
function Counter() {
  const { count, increment, decrement } = useCounterStore()

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  )
}

// 选择性订阅 - 避免不必要的重渲染
function CountDisplay() {
  const count = useCounterStore((state) => state.count)
  return <p>Count: {count}</p>
}

function Buttons() {
  // 只订阅 actions，状态变化不会触发重渲染
  const increment = useCounterStore((state) => state.increment)
  const decrement = useCounterStore((state) => state.decrement)

  return (
    <>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </>
  )
}
```

### 2. 中间件

```javascript
import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

const useStore = create(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          users: [],
          addUser: (user) => set((state) => {
            state.users.push(user)  // 使用 Immer，可以直接修改
          }),
          removeUser: (id) => set((state) => {
            state.users = state.users.filter(u => u.id !== id)
          })
        }))
      ),
      {
        name: 'user-storage',  // localStorage key
        partialize: (state) => ({ users: state.users })  // 只持久化部分状态
      }
    ),
    { name: 'UserStore' }  // DevTools 名称
  )
)

// 订阅状态变化
useStore.subscribe(
  (state) => state.users,
  (users, prevUsers) => {
    console.log('users changed:', users)
  }
)
```

### 3. TypeScript

```typescript
import { create } from 'zustand'

interface CounterState {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 })
}))

// 分离 State 和 Actions 类型
interface State {
  count: number
  users: User[]
}

interface Actions {
  increment: () => void
  addUser: (user: User) => void
}

const useStore = create<State & Actions>((set) => ({
  count: 0,
  users: [],
  increment: () => set((state) => ({ count: state.count + 1 })),
  addUser: (user) => set((state) => ({ users: [...state.users, user] }))
}))
```

### 4. 组件外使用

```javascript
// 组件外获取状态
const count = useCounterStore.getState().count

// 组件外更新状态
useCounterStore.setState({ count: 10 })

// 组件外调用 action
useCounterStore.getState().increment()

// 订阅状态
const unsubscribe = useCounterStore.subscribe(console.log)
```

### 优缺点

```
优点:
- 极小的包体积 (~1KB)
- 几乎零学习成本
- 无需 Provider
- 组件外可用
- TypeScript 友好
- 支持 Redux DevTools

缺点:
- 生态相对较小
- 没有内置的数据获取方案
```

---

## 五、Jotai

### 1. 基本用法

```bash
npm install jotai
```

```javascript
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'

// 原子状态
const countAtom = atom(0)
const textAtom = atom('hello')

// 派生状态（只读）
const doubleCountAtom = atom((get) => get(countAtom) * 2)

// 可写派生状态
const incrementAtom = atom(
  null,  // 不需要读取
  (get, set) => set(countAtom, get(countAtom) + 1)
)

// 异步派生状态
const userAtom = atom(async (get) => {
  const response = await fetch(`/api/user`)
  return response.json()
})

// 使用
function Counter() {
  const [count, setCount] = useAtom(countAtom)
  const doubleCount = useAtomValue(doubleCountAtom)

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {doubleCount}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  )
}

// 分离读写
function IncrementButton() {
  const increment = useSetAtom(incrementAtom)
  return <button onClick={increment}>+</button>
}

function CountDisplay() {
  const count = useAtomValue(countAtom)
  return <p>Count: {count}</p>
}
```

### 2. 原子组合

```javascript
import { atom, useAtom } from 'jotai'
import { atomWithStorage, atomWithReset, RESET } from 'jotai/utils'

// 持久化存储
const themeAtom = atomWithStorage('theme', 'light')

// 可重置原子
const formAtom = atomWithReset({
  name: '',
  email: '',
  message: ''
})

function Form() {
  const [form, setForm] = useAtom(formAtom)

  const handleReset = () => setForm(RESET)

  return (
    <form>
      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <button type="button" onClick={handleReset}>重置</button>
    </form>
  )
}

// 原子家族 - 动态创建原子
import { atomFamily } from 'jotai/utils'

const todoAtomFamily = atomFamily((id) => atom({ id, text: '', done: false }))

function Todo({ id }) {
  const [todo, setTodo] = useAtom(todoAtomFamily(id))
  return <div>{todo.text}</div>
}

// 选择器
import { selectAtom } from 'jotai/utils'

const userAtom = atom({ name: 'John', age: 30 })
const nameAtom = selectAtom(userAtom, (user) => user.name)  // 只订阅 name
```

### 3. 异步操作

```javascript
import { atom, useAtom } from 'jotai'
import { loadable, atomWithQuery } from 'jotai/utils'

// 异步原子
const userAtom = atom(async () => {
  const res = await fetch('/api/user')
  return res.json()
})

// 使用 Suspense
function User() {
  const [user] = useAtom(userAtom)  // 会触发 Suspense
  return <div>{user.name}</div>
}

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <User />
    </Suspense>
  )
}

// 不使用 Suspense - loadable
const loadableUserAtom = loadable(userAtom)

function User() {
  const [userLoadable] = useAtom(loadableUserAtom)

  if (userLoadable.state === 'loading') return <div>Loading...</div>
  if (userLoadable.state === 'hasError') return <div>Error!</div>
  return <div>{userLoadable.data.name}</div>
}

// 配合 TanStack Query
import { atomWithQuery } from 'jotai-tanstack-query'

const userQueryAtom = atomWithQuery(() => ({
  queryKey: ['user'],
  queryFn: async () => {
    const res = await fetch('/api/user')
    return res.json()
  }
}))
```

### 优缺点

```
优点:
- 极小包体积 (~2KB)
- 原子化，细粒度更新
- 天然支持 Suspense
- 无需 Provider（可选）
- 组合性强

缺点:
- 大量原子需要管理
- 调试相对困难
- 概念较新
```

---

## 六、MobX

### 1. 基本用法

```bash
npm install mobx mobx-react-lite
```

```javascript
import { makeAutoObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'

// Store 类
class CounterStore {
  count = 0
  loading = false

  constructor() {
    makeAutoObservable(this)
  }

  increment() {
    this.count++
  }

  decrement() {
    this.count--
  }

  async incrementAsync() {
    this.loading = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    runInAction(() => {
      this.count++
      this.loading = false
    })
  }

  // 计算属性
  get doubleCount() {
    return this.count * 2
  }
}

// 创建实例
const counterStore = new CounterStore()

// 使用 observer 包裹组件
const Counter = observer(() => {
  return (
    <div>
      <p>Count: {counterStore.count}</p>
      <p>Double: {counterStore.doubleCount}</p>
      <button onClick={() => counterStore.increment()}>+</button>
      <button onClick={() => counterStore.decrement()}>-</button>
      <button
        onClick={() => counterStore.incrementAsync()}
        disabled={counterStore.loading}
      >
        {counterStore.loading ? 'Loading...' : 'Async +'}
      </button>
    </div>
  )
})
```

### 2. React Context 集成

```javascript
import { createContext, useContext } from 'react'
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react-lite'

// 创建多个 Store
class UserStore {
  user = null

  constructor() {
    makeAutoObservable(this)
  }

  setUser(user) {
    this.user = user
  }
}

class TodoStore {
  todos = []

  constructor() {
    makeAutoObservable(this)
  }

  addTodo(text) {
    this.todos.push({ id: Date.now(), text, done: false })
  }
}

// 根 Store
class RootStore {
  userStore = new UserStore()
  todoStore = new TodoStore()
}

// Context
const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  return (
    <StoreContext.Provider value={new RootStore()}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  return useContext(StoreContext)
}

// 使用
const TodoList = observer(() => {
  const { todoStore } = useStore()

  return (
    <ul>
      {todoStore.todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  )
})
```

### 3. 装饰器语法

```javascript
import { makeObservable, observable, action, computed } from 'mobx'

class CounterStore {
  @observable count = 0

  constructor() {
    makeObservable(this)
  }

  @action
  increment() {
    this.count++
  }

  @computed
  get doubleCount() {
    return this.count * 2
  }
}
```

### 优缺点

```
优点:
- 响应式，自动追踪依赖
- 最小化重渲染
- 可变数据，直觉操作
- 适合复杂业务逻辑

缺点:
- 包体积较大 (~16KB)
- 需要理解响应式原理
- 调试不如 Redux 直观
- 可能过度使用
```

---

## 七、Valtio

### 1. 基本用法

```bash
npm install valtio
```

```javascript
import { proxy, useSnapshot } from 'valtio'

// 创建代理状态
const state = proxy({
  count: 0,
  users: []
})

// 直接修改状态
function increment() {
  state.count++
}

function addUser(user) {
  state.users.push(user)
}

// 使用
function Counter() {
  const snap = useSnapshot(state)

  return (
    <div>
      <p>Count: {snap.count}</p>
      <button onClick={increment}>+</button>
    </div>
  )
}

// 派生状态
import { derive } from 'valtio/utils'

const derived = derive({
  doubleCount: (get) => get(state).count * 2
})

function Display() {
  const snap = useSnapshot(derived)
  return <p>Double: {snap.doubleCount}</p>
}
```

### 2. 订阅和操作

```javascript
import { proxy, subscribe, snapshot } from 'valtio'
import { subscribeKey, proxyMap, proxySet } from 'valtio/utils'

const state = proxy({ count: 0, name: 'John' })

// 订阅所有变化
const unsubscribe = subscribe(state, () => {
  console.log('state changed:', snapshot(state))
})

// 订阅特定 key
subscribeKey(state, 'count', () => {
  console.log('count changed:', state.count)
})

// 代理 Map 和 Set
const userMap = proxyMap([['1', { name: 'John' }]])
const tagSet = proxySet(['react', 'vue'])
```

### 优缺点

```
优点:
- 极简 API
- 直接修改状态
- 自动追踪使用
- 支持 DevTools

缺点:
- 依赖 Proxy (不支持 IE)
- 生态较小
- 概念较新
```

---

## 八、方案选择指南

### 决策流程

```
1. 项目规模如何？
   - 小型项目 → Zustand / Jotai
   - 中大型项目 → Redux Toolkit / MobX

2. 团队熟悉度？
   - 熟悉 Redux → Redux Toolkit
   - 熟悉 Vue/响应式 → MobX / Valtio
   - 新团队 → Zustand

3. 数据获取需求？
   - 需要缓存管理 → RTK Query / TanStack Query
   - 简单获取 → 各方案都可以

4. 包体积敏感？
   - 是 → Zustand / Jotai / Valtio
   - 否 → 任意

5. 需要时间旅行调试？
   - 是 → Redux Toolkit
   - 否 → 任意
```

### 场景推荐

| 场景 | 推荐方案 |
|------|----------|
| 简单应用 | Zustand |
| 企业级应用 | Redux Toolkit |
| 复杂业务逻辑 | MobX |
| 组件级状态 | Jotai |
| 快速原型 | Valtio |
| 多框架共享 | Zustand |

---

