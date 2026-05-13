# 架构设计

前端架构设计是构建可维护、可扩展、高性能应用的关键。本文涵盖微前端架构、组件库设计、权限系统、状态管理架构等核心主题。

## 微前端架构

### 什么是微前端

微前端是一种将前端应用拆分为多个小型、独立、可独立部署的应用的架构模式。

```
┌─────────────────────────────────────────────────────────────────┐
│                          主应用（基座）                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │  导航    │  │  头部    │  │  侧边栏  │  │  公共组件 │           │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     子应用容器                            │   │
│  │   ┌─────────┐  ┌─────────┐  ┌─────────┐               │   │
│  │   │  订单系统 │  │  用户中心 │  │  数据分析 │               │   │
│  │   │ (Vue)   │  │ (React) │  │ (Angular)│               │   │
│  │   └─────────┘  └─────────┘  └─────────┘               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 适用场景

| 场景 | 适合微前端 | 不适合微前端 |
|------|----------|-------------|
| 项目规模 | 大型复杂项目 | 小型简单项目 |
| 团队结构 | 多团队协作 | 单一小团队 |
| 技术栈 | 需要多技术栈共存 | 统一技术栈 |
| 发布节奏 | 各模块独立发布 | 整体统一发布 |
| 历史包袱 | 需要渐进式重构 | 全新项目 |

### 主流方案对比

| 方案 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| qiankun | 基于 single-spa | 生态成熟，隔离性好 | 配置复杂 |
| Micro App | 基于 WebComponent | 接入简单，零依赖 | 社区相对较小 |
| Module Federation | Webpack 5 模块共享 | 模块级共享 | 依赖 Webpack 5 |
| iframe | 原生隔离 | 隔离性最好 | 通信复杂，体验差 |
| Web Components | 自定义元素 | 标准化 | 生态不成熟 |

### 架构设计要点

```javascript
// 主应用架构示例
class MicroFrontendContainer {
  constructor() {
    this.apps = new Map()
    this.currentApp = null
  }

  // 注册子应用
  registerApp(config) {
    this.apps.set(config.name, {
      ...config,
      status: 'NOT_LOADED'
    })
  }

  // 加载子应用
  async loadApp(name) {
    const app = this.apps.get(name)
    if (!app) throw new Error(`App ${name} not found`)

    if (app.status === 'NOT_LOADED') {
      // 加载资源
      await this.fetchAppResources(app)
      app.status = 'LOADED'
    }

    // 挂载应用
    await this.mountApp(app)
    this.currentApp = app
  }

  // 卸载当前应用
  async unloadCurrentApp() {
    if (this.currentApp) {
      await this.currentApp.unmount()
      this.currentApp = null
    }
  }

  // 应用间通信
  dispatch(event, data) {
    window.dispatchEvent(new CustomEvent(event, { detail: data }))
  }
}
```

### 子应用生命周期

```javascript
// 子应用需要导出的生命周期函数
export async function bootstrap() {
  // 初始化，只会执行一次
  console.log('子应用初始化')
}

export async function mount(props) {
  // 挂载时执行
  const { container, data, onGlobalStateChange } = props

  // 监听全局状态变化
  onGlobalStateChange((state) => {
    console.log('全局状态变化', state)
  })

  // 渲染应用
  render(container)
}

export async function unmount() {
  // 卸载时执行
  // 清理副作用
  cleanup()
}

export async function update(props) {
  // 可选：更新时执行
  console.log('子应用更新', props)
}
```

## 组件库设计

### 设计原则

```
┌─────────────────────────────────────────────────────────────┐
│                     组件库设计原则                            │
├─────────────────────────────────────────────────────────────┤
│  1. 单一职责：每个组件只做一件事                               │
│  2. 可复用性：组件应该可以在不同场景下使用                      │
│  3. 可配置性：通过 props 和 slots 提供足够的定制能力            │
│  4. 可访问性：支持键盘导航和屏幕阅读器                         │
│  5. 可测试性：组件易于进行单元测试                             │
│  6. 文档完善：提供清晰的 API 文档和使用示例                     │
└─────────────────────────────────────────────────────────────┘
```

### 目录结构

```
packages/
├── components/              # 组件源码
│   ├── button/
│   │   ├── src/
│   │   │   ├── button.vue
│   │   │   ├── button.tsx      # 或 JSX 版本
│   │   │   ├── button.scss
│   │   │   └── types.ts
│   │   ├── __tests__/
│   │   │   └── button.spec.ts
│   │   └── index.ts
│   ├── input/
│   ├── select/
│   └── index.ts             # 统一导出
├── hooks/                   # 公共 hooks
│   ├── use-form-item/
│   └── use-namespace/
├── utils/                   # 工具函数
│   ├── dom.ts
│   └── validator.ts
├── styles/                  # 全局样式
│   ├── base.scss
│   └── variables.scss
├── locale/                  # 国际化
│   ├── en-US.ts
│   └── zh-CN.ts
└── docs/                    # 文档
    └── components/
        └── button.md
```

### 组件开发规范

```vue
<!-- Button.vue -->
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="nativeType"
    @click="handleClick"
  >
    <span v-if="loading" class="button-loading">
      <LoadingIcon />
    </span>
    <span v-if="$slots.icon && !loading" class="button-icon">
      <slot name="icon" />
    </span>
    <span class="button-content">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNamespace } from '@/hooks'
import type { ButtonProps, ButtonEmits } from './types'

defineOptions({
  name: 'MyButton'
})

const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'default',
  size: 'medium',
  nativeType: 'button',
  loading: false,
  disabled: false
})

const emit = defineEmits<ButtonEmits>()

const ns = useNamespace('button')

const buttonClasses = computed(() => [
  ns.b(),
  ns.m(props.type),
  ns.m(props.size),
  ns.is('loading', props.loading),
  ns.is('disabled', props.disabled)
])

const handleClick = (e: MouseEvent) => {
  if (props.loading || props.disabled) return
  emit('click', e)
}
</script>

<style lang="scss">
@use './button.scss';
</style>
```

```typescript
// types.ts
export interface ButtonProps {
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  nativeType?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
  icon?: string
}

export interface ButtonEmits {
  (e: 'click', event: MouseEvent): void
}
```

### 命名空间 Hook

```typescript
// hooks/use-namespace/index.ts
const defaultNamespace = 'my'
const statePrefix = 'is-'

export function useNamespace(block: string) {
  const namespace = defaultNamespace

  // 生成 BEM 类名
  const b = (blockSuffix = '') => {
    return blockSuffix
      ? `${namespace}-${block}-${blockSuffix}`
      : `${namespace}-${block}`
  }

  const e = (element: string) => {
    return `${namespace}-${block}__${element}`
  }

  const m = (modifier: string) => {
    return `${namespace}-${block}--${modifier}`
  }

  const be = (blockSuffix: string, element: string) => {
    return `${namespace}-${block}-${blockSuffix}__${element}`
  }

  const em = (element: string, modifier: string) => {
    return `${namespace}-${block}__${element}--${modifier}`
  }

  const is = (name: string, state: boolean) => {
    return state ? `${statePrefix}${name}` : ''
  }

  return {
    namespace,
    b,
    e,
    m,
    be,
    em,
    is
  }
}
```

### 按需加载配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  build: {
    lib: {
      entry: './packages/components/index.ts',
      name: 'MyUI',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
        // 保留目录结构，支持按需加载
        preserveModules: true,
        preserveModulesRoot: 'packages'
      }
    }
  }
})
```

### 主题定制

```scss
// styles/variables.scss
$colors: () !default;
$colors: map-merge(
  (
    'primary': #409eff,
    'success': #67c23a,
    'warning': #e6a23c,
    'danger': #f56c6c,
    'info': #909399
  ),
  $colors
);

$font-sizes: () !default;
$font-sizes: map-merge(
  (
    'small': 12px,
    'medium': 14px,
    'large': 16px
  ),
  $font-sizes
);

// CSS 变量方案
:root {
  --my-color-primary: #{map-get($colors, 'primary')};
  --my-color-success: #{map-get($colors, 'success')};
  --my-font-size-medium: #{map-get($font-sizes, 'medium')};
}
```

```typescript
// 运行时主题切换
function setTheme(theme: Record<string, string>) {
  const root = document.documentElement
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--my-${key}`, value)
  })
}

// 使用
setTheme({
  'color-primary': '#722ed1',
  'color-success': '#52c41a'
})
```

## 权限系统

### 权限类型

```
┌─────────────────────────────────────────────────────────────┐
│                        权限系统分层                           │
├─────────────────────────────────────────────────────────────┤
│  路由权限：控制用户可访问的页面                                │
│  菜单权限：控制用户可见的菜单项                                │
│  按钮权限：控制页面内操作按钮的显示                            │
│  数据权限：控制用户可操作的数据范围                            │
│  字段权限：控制用户可见/可编辑的数据字段                        │
└─────────────────────────────────────────────────────────────┘
```

### 路由权限设计

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 静态路由（无需权限）
export const constantRoutes: RouteRecordRaw[] = [
  { path: '/login', component: () => import('@/views/login.vue') },
  { path: '/404', component: () => import('@/views/404.vue') }
]

// 动态路由（需要权限）
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    component: Layout,
    meta: { title: '仪表盘', icon: 'dashboard' },
    children: [
      {
        path: '',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '概览', roles: ['admin', 'user'] }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    meta: { title: '系统管理', icon: 'setting', roles: ['admin'] },
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/user.vue'),
        meta: { title: '用户管理', roles: ['admin'] }
      },
      {
        path: 'role',
        component: () => import('@/views/system/role.vue'),
        meta: { title: '角色管理', roles: ['admin'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

export default router
```

### 权限过滤

```typescript
// utils/permission.ts
import type { RouteRecordRaw } from 'vue-router'

// 检查是否有权限
function hasPermission(roles: string[], route: RouteRecordRaw): boolean {
  if (route.meta?.roles) {
    return roles.some(role => route.meta!.roles!.includes(role))
  }
  return true
}

// 过滤路由
export function filterAsyncRoutes(
  routes: RouteRecordRaw[],
  roles: string[]
): RouteRecordRaw[] {
  const res: RouteRecordRaw[] = []

  routes.forEach(route => {
    const tmp = { ...route }

    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}
```

### 路由守卫

```typescript
// router/guard.ts
import router from './index'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'

const whiteList = ['/login', '/404']

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  // 有 token
  if (userStore.token) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      // 判断是否已获取用户信息
      if (userStore.roles.length === 0) {
        try {
          // 获取用户信息
          await userStore.getUserInfo()

          // 生成可访问路由
          const accessRoutes = await permissionStore.generateRoutes(userStore.roles)

          // 动态添加路由
          accessRoutes.forEach(route => {
            router.addRoute(route)
          })

          // 重定向到目标路由
          next({ ...to, replace: true })
        } catch (error) {
          // 获取用户信息失败，清除 token 并跳转登录
          await userStore.logout()
          next(`/login?redirect=${to.path}`)
        }
      } else {
        next()
      }
    }
  } else {
    // 无 token
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})
```

### 按钮权限

```typescript
// directives/permission.ts
import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const userStore = useUserStore()
    const permissions = userStore.permissions

    if (value && value instanceof Array) {
      if (value.length > 0) {
        const hasPermission = permissions.some(permission => {
          return value.includes(permission)
        })

        if (!hasPermission) {
          el.parentNode?.removeChild(el)
        }
      }
    } else {
      throw new Error('需要权限数组，如 v-permission="[\'user:add\']"')
    }
  }
}

// 注册指令
app.directive('permission', permission)
```

```vue
<!-- 使用 -->
<template>
  <button v-permission="['user:add']">新增用户</button>
  <button v-permission="['user:edit']">编辑</button>
  <button v-permission="['user:delete']">删除</button>
</template>
```

### 权限 Hook

```typescript
// hooks/usePermission.ts
import { useUserStore } from '@/stores/user'

export function usePermission() {
  const userStore = useUserStore()

  // 检查是否有某个权限
  const hasPermission = (permission: string | string[]): boolean => {
    const permissions = userStore.permissions

    if (typeof permission === 'string') {
      return permissions.includes(permission)
    }

    return permission.some(p => permissions.includes(p))
  }

  // 检查是否有某个角色
  const hasRole = (role: string | string[]): boolean => {
    const roles = userStore.roles

    if (typeof role === 'string') {
      return roles.includes(role)
    }

    return role.some(r => roles.includes(r))
  }

  return {
    hasPermission,
    hasRole
  }
}

// 使用
const { hasPermission, hasRole } = usePermission()

if (hasPermission('user:add')) {
  // 有权限
}
```

## 状态管理架构

### 状态分层

```
┌─────────────────────────────────────────────────────────────┐
│                        状态管理分层                           │
├─────────────────────────────────────────────────────────────┤
│  全局状态：用户信息、主题、国际化等                            │
│  页面状态：列表数据、筛选条件、分页等                          │
│  组件状态：表单数据、弹窗状态、loading 等                      │
│  服务端状态：API 数据、缓存等                                 │
└─────────────────────────────────────────────────────────────┘
```

### Pinia Store 设计

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { login, getUserInfo, logout } from '@/api/user'
import type { LoginParams, UserInfo } from '@/types'

interface UserState {
  token: string
  userInfo: UserInfo | null
  roles: string[]
  permissions: string[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token') || '',
    userInfo: null,
    roles: [],
    permissions: []
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => state.userInfo?.username || '',
    avatar: (state) => state.userInfo?.avatar || ''
  },

  actions: {
    async login(params: LoginParams) {
      const { token } = await login(params)
      this.token = token
      localStorage.setItem('token', token)
    },

    async getUserInfo() {
      const data = await getUserInfo()
      this.userInfo = data
      this.roles = data.roles
      this.permissions = data.permissions
      return data
    },

    async logout() {
      await logout()
      this.token = ''
      this.userInfo = null
      this.roles = []
      this.permissions = []
      localStorage.removeItem('token')
    },

    // 重置状态
    resetState() {
      this.$reset()
    }
  },

  // 持久化
  persist: {
    key: 'user',
    storage: localStorage,
    pick: ['token']
  }
})
```

### 模块化设计

```typescript
// stores/modules/app.ts
export const useAppStore = defineStore('app', {
  state: () => ({
    sidebar: {
      collapsed: false,
      width: 240
    },
    theme: 'light' as 'light' | 'dark',
    locale: 'zh-CN'
  }),

  actions: {
    toggleSidebar() {
      this.sidebar.collapsed = !this.sidebar.collapsed
    },

    setTheme(theme: 'light' | 'dark') {
      this.theme = theme
      document.documentElement.setAttribute('data-theme', theme)
    },

    setLocale(locale: string) {
      this.locale = locale
    }
  }
})

// stores/modules/permission.ts
export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [] as RouteRecordRaw[],
    addRoutes: [] as RouteRecordRaw[]
  }),

  actions: {
    async generateRoutes(roles: string[]) {
      const accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      this.addRoutes = accessedRoutes
      this.routes = constantRoutes.concat(accessedRoutes)
      return accessedRoutes
    }
  }
})
```

### 服务端状态管理（TanStack Query）

```typescript
// hooks/useUserQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { getUserList, createUser, updateUser, deleteUser } from '@/api/user'

// 获取用户列表
export function useUserList(params: Ref<UserListParams>) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getUserList(params.value),
    staleTime: 5 * 60 * 1000, // 5 分钟内数据不过期
    placeholderData: keepPreviousData
  })
}

// 创建用户
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // 创建成功后，使用户列表缓存失效
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

// 更新用户
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data, variables) => {
      // 乐观更新
      queryClient.setQueryData(['users', variables.id], data)
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}
```

## 错误处理架构

### 全局错误处理

```typescript
// utils/errorHandler.ts
import { App } from 'vue'
import { ElMessage } from 'element-plus'

// Vue 错误处理
export function setupErrorHandler(app: App) {
  // 全局错误处理
  app.config.errorHandler = (err, vm, info) => {
    console.error('Vue Error:', err, info)
    reportError({
      type: 'vue',
      error: err,
      info,
      componentName: vm?.$options?.name
    })
  }

  // 全局警告处理
  app.config.warnHandler = (msg, vm, trace) => {
    console.warn('Vue Warning:', msg, trace)
  }

  // JS 运行时错误
  window.onerror = (message, source, lineno, colno, error) => {
    console.error('Runtime Error:', { message, source, lineno, colno, error })
    reportError({
      type: 'runtime',
      message,
      source,
      lineno,
      colno,
      error
    })
    return true
  }

  // Promise 未捕获错误
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Rejection:', event.reason)
    reportError({
      type: 'promise',
      reason: event.reason
    })
    event.preventDefault()
  })

  // 资源加载错误
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      console.error('Resource Error:', event.target)
      reportError({
        type: 'resource',
        target: event.target
      })
    }
  }, true)
}

// 错误上报
function reportError(errorInfo: any) {
  // 发送到错误监控服务
  fetch('/api/error/report', {
    method: 'POST',
    body: JSON.stringify({
      ...errorInfo,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    })
  }).catch(console.error)
}
```

### API 错误处理

```typescript
// utils/request.ts
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000
})

// 错误码映射
const errorMessages: Record<number, string> = {
  400: '请求参数错误',
  401: '登录已过期，请重新登录',
  403: '没有权限访问',
  404: '请求的资源不存在',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务暂时不可用',
  504: '网关超时'
}

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data

    // 业务错误码处理
    if (code !== 0) {
      ElMessage.error(message || '请求失败')

      // 特殊错误码处理
      if (code === 10001) {
        // token 过期
        const userStore = useUserStore()
        userStore.logout()
        router.push('/login')
      }

      return Promise.reject(new Error(message))
    }

    return data
  },
  (error) => {
    // HTTP 错误处理
    if (error.response) {
      const { status, data } = error.response
      const message = data?.message || errorMessages[status] || '请求失败'
      ElMessage.error(message)

      // 401 跳转登录
      if (status === 401) {
        const userStore = useUserStore()
        userStore.logout()
        router.push('/login')
      }
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请稍后重试')
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }

    return Promise.reject(error)
  }
)

export default request
```

### 错误边界组件

```vue
<!-- components/ErrorBoundary.vue -->
<template>
  <slot v-if="!hasError" />
  <div v-else class="error-boundary">
    <slot name="error" :error="error" :reset="reset">
      <div class="error-content">
        <h2>出错了</h2>
        <p>{{ error?.message || '未知错误' }}</p>
        <button @click="reset">重试</button>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  hasError.value = true
  error.value = err
  return false // 阻止错误继续传播
})

const reset = () => {
  hasError.value = false
  error.value = null
}
</script>
```

## 性能优化架构

### 组件懒加载

```typescript
// router/index.ts
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/dashboard/index.vue'),
    // 命名 chunk
    // component: () => import(/* webpackChunkName: "dashboard" */ '@/views/dashboard/index.vue')
  }
]

// 异步组件
import { defineAsyncComponent } from 'vue'

const AsyncModal = defineAsyncComponent({
  loader: () => import('@/components/Modal.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
```

### 虚拟列表

```vue
<!-- components/VirtualList.vue -->
<template>
  <div
    ref="containerRef"
    class="virtual-list"
    :style="{ height: `${containerHeight}px` }"
    @scroll="handleScroll"
  >
    <div :style="{ height: `${totalHeight}px` }">
      <div :style="{ transform: `translateY(${offset}px)` }">
        <div
          v-for="item in visibleItems"
          :key="item.id"
          :style="{ height: `${itemHeight}px` }"
        >
          <slot :item="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  items: any[]
  itemHeight: number
  containerHeight: number
}>()

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)

const visibleCount = computed(() => {
  return Math.ceil(props.containerHeight / props.itemHeight) + 1
})

const startIndex = computed(() => {
  return Math.floor(scrollTop.value / props.itemHeight)
})

const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, startIndex.value + visibleCount.value)
})

const totalHeight = computed(() => {
  return props.items.length * props.itemHeight
})

const offset = computed(() => {
  return startIndex.value * props.itemHeight
})

const handleScroll = () => {
  scrollTop.value = containerRef.value?.scrollTop || 0
}
</script>
```

### 缓存策略

```typescript
// utils/cache.ts
class LRUCache<T> {
  private cache = new Map<string, T>()
  private maxSize: number

  constructor(maxSize: number) {
    this.maxSize = maxSize
  }

  get(key: string): T | undefined {
    if (this.cache.has(key)) {
      // 移到末尾（最近使用）
      const value = this.cache.get(key)!
      this.cache.delete(key)
      this.cache.set(key, value)
      return value
    }
    return undefined
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // 删除最久未使用的项
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  clear(): void {
    this.cache.clear()
  }
}

// API 缓存
const apiCache = new LRUCache<any>(100)

export async function cachedFetch(url: string, options?: RequestInit) {
  const cacheKey = `${url}-${JSON.stringify(options)}`

  const cached = apiCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const response = await fetch(url, options)
  const data = await response.json()

  apiCache.set(cacheKey, data)
  return data
}
```

## 常见面试题

::: details 1. 如何设计一个可扩展的前端架构？
**核心原则：**
- **分层设计**：UI 层、业务逻辑层、数据层分离
- **模块化**：按功能/业务拆分模块，降低耦合
- **标准化**：统一的代码规范、组件规范、API 规范
- **可配置**：通过配置驱动功能，减少硬编码
- **可测试**：业务逻辑可独立测试
:::

::: details 2. 微前端架构如何处理公共依赖？
- **externals**：将公共库打包为 external，由主应用统一提供
- **Module Federation**：运行时共享依赖
- **NPM 包**：将公共依赖封装为 NPM 包
- **CDN**：通过 CDN 加载公共库
:::

::: details 3. 如何设计一个权限系统？
```
1. 权限模型：RBAC（基于角色的访问控制）
2. 权限类型：路由权限 + 菜单权限 + 按钮权限 + 数据权限
3. 实现方式：
   - 路由权限：路由守卫 + 动态路由
   - 菜单权限：根据权限过滤菜单
   - 按钮权限：自定义指令 + Hooks
   - 数据权限：后端接口控制
```
:::

::: details 4. 组件库设计需要考虑哪些方面？
- **API 设计**：简洁、一致、可扩展
- **样式方案**：CSS 变量、主题定制、样式隔离
- **可访问性**：ARIA 属性、键盘导航
- **国际化**：多语言支持
- **按需加载**：Tree Shaking、独立打包
- **文档建设**：API 文档、使用示例、最佳实践
- **测试覆盖**：单元测试、E2E 测试
:::

::: details 5. 前端错误监控如何设计？
```javascript
// 错误类型
1. JS 运行时错误：window.onerror
2. Promise 错误：unhandledrejection
3. 资源加载错误：addEventListener('error', ..., true)
4. Vue 错误：app.config.errorHandler
5. 网络请求错误：axios 拦截器

// 错误信息
- 错误类型、消息、堆栈
- 发生时间、页面 URL
- 用户信息、设备信息
- 上下文信息（组件名、操作路径）

// 上报策略
- 采样上报：避免海量错误
- 聚合上报：相同错误合并
- 延迟上报：批量发送
```
:::

::: details 6. 如何优化大型前端项目的构建性能？
- **代码分割**：路由懒加载、动态导入
- **缓存优化**：持久化缓存、增量构建
- **并行处理**：多线程构建
- **Tree Shaking**：移除无用代码
- **按需编译**：只编译变更模块
- **外部化依赖**：externals、CDN
:::
