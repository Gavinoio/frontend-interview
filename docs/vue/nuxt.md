# Nuxt.js

## 概述

Nuxt.js 是基于 Vue.js 的服务端渲染（SSR）框架，它提供了开箱即用的服务端渲染、静态站点生成、自动路由等功能，大大简化了 Vue 应用的开发和部署。

### 什么是 SSR

**服务端渲染（Server-Side Rendering）**：在服务器端将 Vue 组件渲染成 HTML 字符串，直接发送到浏览器，最后在客户端"激活"为可交互的应用。

```
CSR（客户端渲染）流程：
浏览器 → 请求 HTML → 空白页面 → 加载 JS → 执行 JS → 渲染页面

SSR（服务端渲染）流程：
浏览器 → 请求 HTML → 完整页面（可见） → 加载 JS → 激活交互
```

### Nuxt 3 vs Nuxt 2

| 特性 | Nuxt 2 | Nuxt 3 |
|------|--------|--------|
| Vue 版本 | Vue 2 | Vue 3 |
| 构建工具 | Webpack | Vite / Webpack |
| 服务器引擎 | Connect | Nitro |
| TypeScript | 需配置 | 原生支持 |
| Composition API | 需安装插件 | 原生支持 |
| 自动导入 | 需配置 | 默认启用 |

## Nuxt 3 核心特性

### 1. 自动导入（Auto Imports）

Nuxt 3 自动导入 Vue API、组合式函数和组件，无需手动 import。

```vue
<script setup>
// 不需要导入 ref、computed、watch 等
const count = ref(0)
const double = computed(() => count.value * 2)

// 不需要导入 useState、useFetch 等
const { data } = await useFetch('/api/users')

// 不需要导入组件，直接使用
</script>

<template>
  <!-- 组件自动导入 -->
  <NuxtLink to="/about">关于</NuxtLink>
  <NuxtPage />
</template>
```

### 2. 文件系统路由

基于 `pages/` 目录结构自动生成路由：

```
pages/
├── index.vue          → /
├── about.vue          → /about
├── users/
│   ├── index.vue      → /users
│   ├── [id].vue       → /users/:id（动态路由）
│   └── [...slug].vue  → /users/*（捕获所有）
└── posts/
    └── [category]/
        └── [id].vue   → /posts/:category/:id
```

```vue
<!-- pages/users/[id].vue -->
<script setup>
const route = useRoute()
const userId = route.params.id

// 或使用 useAsyncData
const { data: user } = await useAsyncData(
  `user-${userId}`,
  () => $fetch(`/api/users/${userId}`)
)
</script>

<template>
  <div>
    <h1>用户详情：{{ userId }}</h1>
    <pre>{{ user }}</pre>
  </div>
</template>
```

### 3. 渲染模式

Nuxt 3 支持多种渲染模式：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 全局设置
  ssr: true, // 默认开启 SSR

  // 路由级别设置
  routeRules: {
    // SSR - 服务端渲染
    '/': { ssr: true },

    // SPA - 客户端渲染
    '/admin/**': { ssr: false },

    // SSG - 静态生成
    '/blog/**': { prerender: true },

    // ISR - 增量静态再生
    '/products/**': {
      isr: 60 // 60秒后重新生成
    },

    // SWR - 过期重新验证
    '/api/**': {
      swr: 3600 // 1小时
    }
  }
})
```

### 4. 数据获取

```vue
<script setup>
// 方式1：useFetch - 基于 $fetch 的封装
const { data, pending, error, refresh } = await useFetch('/api/users', {
  // 选项
  method: 'GET',
  query: { page: 1 },
  headers: { 'Authorization': 'Bearer token' },

  // 转换响应
  transform: (res) => res.data,

  // 缓存 key
  key: 'users-list',

  // 仅在客户端获取
  server: false,

  // 懒加载
  lazy: true,

  // 立即执行
  immediate: true
})

// 方式2：useAsyncData - 更灵活的数据获取
const { data: posts } = await useAsyncData(
  'posts', // 唯一 key
  () => $fetch('/api/posts'),
  {
    // 仅在路由参数变化时重新获取
    watch: [() => route.params.id]
  }
)

// 方式3：useLazyFetch - 非阻塞获取
const { data: comments, pending } = useLazyFetch('/api/comments')

// 方式4：$fetch - 直接请求（不缓存）
const submitForm = async (formData) => {
  const result = await $fetch('/api/submit', {
    method: 'POST',
    body: formData
  })
}
</script>

<template>
  <div>
    <div v-if="pending">加载中...</div>
    <div v-else-if="error">错误：{{ error.message }}</div>
    <div v-else>
      <div v-for="user in data" :key="user.id">
        {{ user.name }}
      </div>
    </div>
    <button @click="refresh">刷新</button>
  </div>
</template>
```

### 5. 状态管理

```vue
<script setup>
// 方式1：useState - 跨组件共享状态（SSR 友好）
const counter = useState('counter', () => 0)

// 方式2：组合式函数封装
// composables/useAuth.ts
export const useAuth = () => {
  const user = useState('user', () => null)
  const isLoggedIn = computed(() => !!user.value)

  const login = async (credentials) => {
    const { data } = await useFetch('/api/login', {
      method: 'POST',
      body: credentials
    })
    user.value = data.value
  }

  const logout = () => {
    user.value = null
    navigateTo('/login')
  }

  return {
    user,
    isLoggedIn,
    login,
    logout
  }
}

// 使用
const { user, isLoggedIn, login, logout } = useAuth()
</script>
```

### 6. 中间件（Middleware）

```typescript
// middleware/auth.ts - 路由中间件
export default defineNuxtRouteMiddleware((to, from) => {
  const { isLoggedIn } = useAuth()

  // 未登录跳转到登录页
  if (!isLoggedIn.value && to.path !== '/login') {
    return navigateTo('/login')
  }
})

// middleware/auth.global.ts - 全局中间件（文件名包含 .global）
export default defineNuxtRouteMiddleware((to, from) => {
  console.log('全局中间件：', to.path)
})
```

```vue
<!-- 页面中使用中间件 -->
<script setup>
definePageMeta({
  middleware: 'auth',
  // 或多个中间件
  middleware: ['auth', 'admin']
})
</script>
```

### 7. 服务器端（Server）

Nuxt 3 使用 Nitro 作为服务器引擎：

```typescript
// server/api/users.ts - API 路由
export default defineEventHandler(async (event) => {
  // 获取查询参数
  const query = getQuery(event)

  // 获取请求体
  const body = await readBody(event)

  // 获取路由参数
  const id = event.context.params?.id

  // 返回数据
  return {
    users: [
      { id: 1, name: '张三' },
      { id: 2, name: '李四' }
    ]
  }
})

// server/api/users/[id].ts - 动态 API 路由
export default defineEventHandler((event) => {
  const id = event.context.params?.id
  return { id, name: `用户 ${id}` }
})

// server/api/users.post.ts - POST 请求
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // 创建用户逻辑
  return { success: true, user: body }
})
```

```typescript
// server/middleware/log.ts - 服务器中间件
export default defineEventHandler((event) => {
  console.log(`[${new Date().toISOString()}] ${event.node.req.url}`)
})

// server/plugins/db.ts - 服务器插件
export default defineNitroPlugin((nitroApp) => {
  // 数据库连接等初始化
  console.log('数据库已连接')
})
```

### 8. 插件系统

```typescript
// plugins/api.ts - 客户端插件
export default defineNuxtPlugin((nuxtApp) => {
  // 提供全局方法
  return {
    provide: {
      formatDate: (date: Date) => {
        return new Intl.DateTimeFormat('zh-CN').format(date)
      },
      api: {
        get: (url: string) => $fetch(url),
        post: (url: string, data: any) => $fetch(url, { method: 'POST', body: data })
      }
    }
  }
})

// 使用插件
const { $formatDate, $api } = useNuxtApp()
console.log($formatDate(new Date()))
```

### 9. 布局系统

```vue
<!-- layouts/default.vue -->
<template>
  <div class="layout">
    <header>
      <nav>
        <NuxtLink to="/">首页</NuxtLink>
        <NuxtLink to="/about">关于</NuxtLink>
      </nav>
    </header>

    <main>
      <slot />
    </main>

    <footer>
      © 2024 My App
    </footer>
  </div>
</template>

<!-- layouts/admin.vue -->
<template>
  <div class="admin-layout">
    <aside>侧边栏</aside>
    <main>
      <slot />
    </main>
  </div>
</template>

<!-- pages/admin/dashboard.vue - 使用特定布局 -->
<script setup>
definePageMeta({
  layout: 'admin'
})
</script>
```

### 10. SEO 优化

```vue
<script setup>
// 方式1：useHead
useHead({
  title: '页面标题',
  meta: [
    { name: 'description', content: '页面描述' },
    { name: 'keywords', content: '关键词1, 关键词2' },
    { property: 'og:title', content: 'OG 标题' },
    { property: 'og:description', content: 'OG 描述' }
  ],
  link: [
    { rel: 'canonical', href: 'https://example.com/page' }
  ],
  script: [
    { src: 'https://example.com/script.js', async: true }
  ]
})

// 方式2：useSeoMeta - 更简洁的 SEO 设置
useSeoMeta({
  title: '页面标题',
  description: '页面描述',
  ogTitle: 'OG 标题',
  ogDescription: 'OG 描述',
  ogImage: 'https://example.com/image.jpg',
  twitterCard: 'summary_large_image'
})
</script>

<!-- 方式3：组件方式 -->
<template>
  <div>
    <Head>
      <Title>页面标题</Title>
      <Meta name="description" content="页面描述" />
    </Head>
  </div>
</template>
```

## Nuxt 3 项目结构

```
my-nuxt-app/
├── .nuxt/              # 构建产物（自动生成）
├── .output/            # 生产构建输出
├── assets/             # 需要构建工具处理的资源
│   ├── css/
│   └── images/
├── components/         # 自动导入的组件
│   ├── AppHeader.vue
│   └── ui/
│       └── Button.vue  # <UiButton />
├── composables/        # 自动导入的组合式函数
│   ├── useAuth.ts
│   └── useApi.ts
├── content/            # Nuxt Content 模块内容
├── layouts/            # 布局组件
│   ├── default.vue
│   └── admin.vue
├── middleware/         # 路由中间件
│   └── auth.ts
├── pages/              # 页面（自动生成路由）
│   ├── index.vue
│   └── users/
│       └── [id].vue
├── plugins/            # 插件
│   └── api.ts
├── public/             # 静态资源（不经过构建）
│   └── favicon.ico
├── server/             # 服务端代码
│   ├── api/            # API 路由
│   ├── middleware/     # 服务器中间件
│   └── plugins/        # 服务器插件
├── utils/              # 工具函数（自动导入）
├── app.vue             # 应用入口
├── nuxt.config.ts      # Nuxt 配置
├── package.json
└── tsconfig.json
```

