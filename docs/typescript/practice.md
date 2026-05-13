# TypeScript 工程实践

本章介绍 TypeScript 在实际项目中的配置和最佳实践。

## tsconfig.json 配置

### 基础配置

```json
{
  "compilerOptions": {
    // 编译目标
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],

    // 模块解析
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    // 严格模式
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,

    // 输出配置
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    // 路径映射
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    },

    // 其他
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Vue 项目配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "jsxImportSource": "vue",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### React 项目配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

### 常用配置项解释

| 配置项 | 说明 |
|--------|------|
| `strict` | 开启所有严格检查 |
| `noImplicitAny` | 禁止隐式 any |
| `strictNullChecks` | 严格空值检查 |
| `esModuleInterop` | 支持 CommonJS 默认导入 |
| `skipLibCheck` | 跳过声明文件检查，加快编译 |
| `isolatedModules` | 每个文件作为独立模块 |
| `noEmit` | 不生成输出文件（由打包工具处理） |

## 类型声明文件

### .d.ts 文件

```typescript
// types/global.d.ts

// 声明全局变量
declare const API_URL: string
declare const __DEV__: boolean

// 声明全局函数
declare function log(message: string): void

// 扩展 Window 对象
declare global {
  interface Window {
    myApp: {
      version: string
      init(): void
    }
  }
}

export {}
```

### 声明模块

```typescript
// types/modules.d.ts

// 声明 CSS 模块
declare module '*.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.scss' {
  const classes: { [key: string]: string }
  export default classes
}

// 声明图片资源
declare module '*.png' {
  const src: string
  export default src
}

declare module '*.svg' {
  import type { FunctionComponent, SVGProps } from 'react'
  const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>
  export default ReactComponent
}

// 声明 JSON
declare module '*.json' {
  const value: any
  export default value
}
```

### 声明 Vue 组件

```typescript
// types/vue.d.ts
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

### 扩展第三方库类型

```typescript
// types/axios.d.ts
import 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    showLoading?: boolean
    retry?: number
  }
}

// types/vue-router.d.ts
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    roles?: string[]
  }
}
```

## 实用工具类型

### 内置工具类型

```typescript
interface User {
  id: number
  name: string
  email: string
  age: number
}

// Partial - 所有属性变为可选
type PartialUser = Partial<User>
// { id?: number; name?: string; email?: string; age?: number }

// Required - 所有属性变为必填
type RequiredUser = Required<PartialUser>
// { id: number; name: string; email: string; age: number }

// Readonly - 所有属性变为只读
type ReadonlyUser = Readonly<User>
// { readonly id: number; readonly name: string; ... }

// Pick - 选择部分属性
type UserBasic = Pick<User, 'id' | 'name'>
// { id: number; name: string }

// Omit - 排除部分属性
type UserWithoutEmail = Omit<User, 'email'>
// { id: number; name: string; age: number }

// Record - 创建对象类型
type UserMap = Record<string, User>
// { [key: string]: User }

// Exclude - 从联合类型中排除
type T1 = Exclude<'a' | 'b' | 'c', 'a'>  // 'b' | 'c'

// Extract - 从联合类型中提取
type T2 = Extract<'a' | 'b' | 'c', 'a' | 'd'>  // 'a'

// NonNullable - 排除 null 和 undefined
type T3 = NonNullable<string | null | undefined>  // string

// ReturnType - 获取函数返回类型
function getUser() { return { name: 'Tom', age: 25 } }
type UserReturn = ReturnType<typeof getUser>
// { name: string; age: number }

// Parameters - 获取函数参数类型
function createUser(name: string, age: number) {}
type Params = Parameters<typeof createUser>
// [string, number]

// Awaited - 获取 Promise 的解析类型
type T4 = Awaited<Promise<string>>  // string
```

### 自定义工具类型

```typescript
// DeepPartial - 深度可选
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// DeepReadonly - 深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

// Nullable - 可为 null
type Nullable<T> = T | null

// ValueOf - 获取对象值的联合类型
type ValueOf<T> = T[keyof T]

const STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error'
} as const

type Status = ValueOf<typeof STATUS>  // 'pending' | 'success' | 'error'

// 获取数组元素类型
type ArrayElement<T> = T extends (infer U)[] ? U : never
type E = ArrayElement<string[]>  // string

// 函数第一个参数类型
type FirstArg<T> = T extends (first: infer F, ...args: any[]) => any ? F : never
```

## Vue 中的 TypeScript

### 组件 Props 类型

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  items: string[]
  user: {
    name: string
    age: number
  }
  onChange?: (value: string) => void
}

// 使用 withDefaults 设置默认值
const props = withDefaults(defineProps<Props>(), {
  count: 0,
  items: () => []
})

// 使用 props
console.log(props.title)
</script>
```

### Emits 类型

```vue
<script setup lang="ts">
interface Emits {
  (e: 'update', value: string): void
  (e: 'delete', id: number): void
  (e: 'change', payload: { old: string; new: string }): void
}

const emit = defineEmits<Emits>()

// 触发事件
emit('update', 'new value')
emit('delete', 123)
</script>
```

### Ref 类型

```vue
<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// 基础类型自动推断
const count = ref(0)  // Ref<number>

// 复杂类型需要显式声明
interface User {
  name: string
  age: number
}

const user = ref<User | null>(null)

// reactive 类型
const state = reactive<{
  list: string[]
  loading: boolean
}>({
  list: [],
  loading: false
})

// computed 类型
const double = computed<number>(() => count.value * 2)
</script>
```

### 模板引用类型

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

// DOM 元素引用
const inputRef = ref<HTMLInputElement | null>(null)

// 组件引用
import MyComponent from './MyComponent.vue'
const componentRef = ref<InstanceType<typeof MyComponent> | null>(null)

onMounted(() => {
  inputRef.value?.focus()
  componentRef.value?.someMethod()
})
</script>

<template>
  <input ref="inputRef" />
  <MyComponent ref="componentRef" />
</template>
```

## React 中的 TypeScript

### 组件 Props 类型

```tsx
interface ButtonProps {
  text: string
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  onClick?: () => void
  children?: React.ReactNode
}

// 函数组件
const Button: React.FC<ButtonProps> = ({
  text,
  variant = 'primary',
  disabled = false,
  onClick,
  children
}) => {
  return (
    <button
      className={variant}
      disabled={disabled}
      onClick={onClick}
    >
      {text}
      {children}
    </button>
  )
}

// 或者不使用 React.FC
function Button(props: ButtonProps) {
  // ...
}
```

### Hooks 类型

```tsx
import { useState, useRef, useCallback, useMemo } from 'react'

function Example() {
  // useState
  const [count, setCount] = useState<number>(0)
  const [user, setUser] = useState<User | null>(null)

  // useRef
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // useCallback
  const handleClick = useCallback((id: number) => {
    console.log(id)
  }, [])

  // useMemo
  const doubled = useMemo<number>(() => count * 2, [count])

  return <div>{count}</div>
}
```

### 事件处理

```tsx
function Form() {
  // 输入事件
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value)
  }

  // 表单提交
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  // 鼠标事件
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log(e.clientX, e.clientY)
  }

  // 键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // ...
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </form>
  )
}
```

### 自定义 Hook

```tsx
import { useState, useEffect } from 'react'

interface FetchResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

function useFetch<T>(url: string): FetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [url])

  return { data, loading, error }
}

// 使用
interface User {
  id: number
  name: string
}

function UserList() {
  const { data, loading, error } = useFetch<User[]>('/api/users')

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {data?.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  )
}
```

## API 请求类型

### 定义接口类型

```typescript
// types/api.ts

// 通用响应结构
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 分页数据
interface Pagination<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 用户相关
interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

interface LoginParams {
  username: string
  password: string
}

interface LoginResult {
  token: string
  user: User
}

// API 函数
async function login(params: LoginParams): Promise<ApiResponse<LoginResult>> {
  return request.post('/auth/login', params)
}

async function getUsers(page: number): Promise<ApiResponse<Pagination<User>>> {
  return request.get('/users', { params: { page } })
}
```

### Axios 封装

```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

class Request {
  private instance: AxiosInstance

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config)

    // 请求拦截
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      }
    )

    // 响应拦截
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { code, message, data } = response.data
        if (code !== 0) {
          return Promise.reject(new Error(message))
        }
        return data
      }
    )
  }

  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config)
  }

  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config)
  }
}

export const request = new Request({
  baseURL: '/api',
  timeout: 10000
})
```

