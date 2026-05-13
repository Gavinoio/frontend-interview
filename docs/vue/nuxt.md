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

## 常见面试题

::: details 1. SSR 和 CSR 的区别？各有什么优缺点？
<details>
<summary>点击查看答案</summary>

**一句话答案**：SSR 在服务器渲染 HTML，首屏快、SEO 好；CSR 在浏览器渲染，交互性强、服务器压力小。

| 特性 | SSR | CSR |
|------|-----|-----|
| 首屏加载 | 快（直接返回 HTML） | 慢（需等 JS 执行） |
| SEO | 友好 | 不友好 |
| 服务器压力 | 大 | 小 |
| 交互体验 | 需要激活 | 天然支持 |
| 开发复杂度 | 高 | 低 |

**口语化回答**：
"SSR 就是服务器把页面渲染好再发给浏览器，用户能立刻看到内容，搜索引擎也能抓取到，首屏体验好。缺点是服务器压力大，每个请求都要渲染。CSR 是浏览器下载 JS 后自己渲染，服务器只需返回空 HTML 和 JS，压力小，但首屏白屏时间长，对 SEO 不友好。现代框架一般用混合方案，首屏 SSR，后续交互 CSR。"
:::

</details>

::: details 2. Nuxt 3 中 useFetch 和 useAsyncData 的区别？
<details>
<summary>点击查看答案</summary>

**一句话答案**：`useFetch` 是 `useAsyncData` + `$fetch` 的封装，更简洁；`useAsyncData` 更灵活，可用于任何异步操作。

```javascript
// useFetch - 简洁，适合 API 请求
const { data } = await useFetch('/api/users')

// useAsyncData - 灵活，可用于任何异步
const { data } = await useAsyncData('key', async () => {
  const users = await $fetch('/api/users')
  const posts = await $fetch('/api/posts')
  return { users, posts }
})
```

**口语化回答**：
"useFetch 是 Nuxt 封装好的数据获取方法，内部用的是 useAsyncData 加 $fetch，适合简单的 API 请求。useAsyncData 更灵活，可以处理任何异步操作，比如并发请求、数据转换等。两者都会自动处理 SSR 数据序列化，避免重复请求。如果只是简单的 GET 请求，用 useFetch；如果需要更复杂的逻辑，用 useAsyncData。"
:::

</details>

::: details 3. Nuxt 3 的渲染模式有哪些？
<details>
<summary>点击查看答案</summary>

**一句话答案**：SSR（服务端渲染）、CSR/SPA（客户端渲染）、SSG（静态生成）、ISR（增量静态再生）。

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/': { ssr: true },           // SSR
    '/admin/**': { ssr: false },  // SPA
    '/blog/**': { prerender: true }, // SSG
    '/products/**': { isr: 60 }   // ISR
  }
})
```

**口语化回答**：
"Nuxt 3 支持四种渲染模式：
1. **SSR** - 每次请求服务器渲染，适合动态内容
2. **SPA** - 纯客户端渲染，适合后台管理系统
3. **SSG** - 构建时生成静态 HTML，适合博客、文档
4. **ISR** - 增量静态再生，结合了 SSG 和 SSR 的优点，页面定期更新

Nuxt 3 的强大之处是可以在路由级别配置不同的渲染模式，一个项目可以混合使用。"
:::

</details>

::: details 4. Nuxt 3 的自动导入是如何实现的？
<details>
<summary>点击查看答案</summary>

**一句话答案**：通过 `unimport` 库扫描特定目录，在编译时自动注入 import 语句。

**原理**：
1. Nuxt 在启动时扫描 `components/`、`composables/`、`utils/` 等目录
2. 收集所有导出的函数和组件
3. 使用 `unimport` 库，在编译时分析代码中使用的标识符
4. 自动在文件顶部注入相应的 import 语句

```javascript
// 编译前
const count = ref(0)

// 编译后
import { ref } from 'vue'
const count = ref(0)
```

**口语化回答**：
"Nuxt 的自动导入是编译时实现的，不是运行时魔法。它在构建时扫描指定目录，收集所有导出，然后分析你的代码用了哪些变量，自动在编译结果里加上 import 语句。这样源码更简洁，但编译后还是标准的 ES 模块。Vue 的 API、Nuxt 的组合式函数、自定义组件和工具函数都能自动导入。"
:::

</details>

::: details 5. Nuxt 3 中如何处理 SEO？
<details>
<summary>点击查看答案</summary>

**一句话答案**：使用 `useHead`、`useSeoMeta` 或 `<Head>` 组件设置 meta 标签。

```vue
<script setup>
// 方式1：useHead
useHead({
  title: '页面标题',
  meta: [
    { name: 'description', content: '描述' }
  ]
})

// 方式2：useSeoMeta（推荐）
useSeoMeta({
  title: '页面标题',
  description: '页面描述',
  ogImage: '/og-image.jpg'
})

// 动态标题
const { data: post } = await useFetch('/api/post/1')
useHead({
  title: () => post.value?.title || '加载中'
})
</script>
```

**口语化回答**：
"Nuxt 3 提供了 useHead 和 useSeoMeta 两个组合式函数处理 SEO。useSeoMeta 更直观，专门为 SEO 设计，支持 title、description、Open Graph、Twitter Card 等常用属性。因为是 SSR，这些 meta 标签会在服务端渲染到 HTML 里，搜索引擎可以直接抓取。还可以结合动态数据，比如文章标题，实现每个页面独立的 SEO 配置。"
:::

</details>

::: details 6. Nuxt 3 的 Nitro 服务器有什么特点？
<details>
<summary>点击查看答案</summary>

**一句话答案**：Nitro 是 Nuxt 3 的服务器引擎，支持多平台部署、自动代码分割、边缘渲染。

**核心特点**：
1. **跨平台部署**：Node.js、Deno、Cloudflare Workers、Vercel、Netlify 等
2. **自动代码分割**：API 路由按需加载
3. **热模块替换**：开发时服务端 HMR
4. **自动生成类型**：API 路由的类型提示
5. **边缘渲染**：支持 Edge Functions

```typescript
// server/api/hello.ts
export default defineEventHandler((event) => {
  return { message: 'Hello Nitro!' }
})
```

**口语化回答**：
"Nitro 是 Nuxt 3 全新的服务器引擎，最大的特点是跨平台。同一套代码可以部署到 Node.js、Vercel、Cloudflare Workers 等不同平台，Nitro 会自动适配。它还支持边缘渲染，可以把渲染逻辑部署到 CDN 边缘节点，进一步提升性能。开发体验也很好，服务端代码支持热更新，API 路由有完整的类型提示。"
:::

</details>

::: details 7. Nuxt 2 和 Nuxt 3 的主要区别？
<details>
<summary>点击查看答案</summary>

**一句话答案**：Nuxt 3 基于 Vue 3，使用 Vite 构建，原生支持 TypeScript，自动导入，新的服务器引擎 Nitro。

| 特性 | Nuxt 2 | Nuxt 3 |
|------|--------|--------|
| Vue 版本 | Vue 2 | Vue 3 |
| 构建工具 | Webpack | Vite（默认） |
| 服务器 | Connect | Nitro |
| TypeScript | 需配置 | 原生支持 |
| Composition API | 插件 | 原生 |
| 自动导入 | 需配置 | 默认开启 |
| 数据获取 | asyncData/fetch | useFetch/useAsyncData |

**口语化回答**：
"Nuxt 3 是完全重写的版本，主要变化有：
1. 基于 Vue 3，支持 Composition API 和 setup 语法
2. 默认用 Vite 构建，开发体验更好
3. 原生支持 TypeScript，类型提示完善
4. 自动导入默认开启，代码更简洁
5. 新的服务器引擎 Nitro，支持多平台部署
6. 数据获取改用 useFetch/useAsyncData，更符合 Vue 3 风格

迁移的话主要是把 Options API 改成 Composition API，asyncData 改成 useAsyncData。"
:::

</details>

::: details 8. 如何在 Nuxt 3 中实现登录鉴权？
<details>
<summary>点击查看答案</summary>

**一句话答案**：使用 useState 存储用户状态，中间件检查权限，服务端验证 token。

```typescript
// composables/useAuth.ts
export const useAuth = () => {
  const user = useState('user', () => null)
  const token = useCookie('token')

  const login = async (credentials) => {
    const { data } = await useFetch('/api/auth/login', {
      method: 'POST',
      body: credentials
    })
    token.value = data.value.token
    user.value = data.value.user
  }

  const logout = () => {
    token.value = null
    user.value = null
    navigateTo('/login')
  }

  const isLoggedIn = computed(() => !!user.value)

  return { user, token, login, logout, isLoggedIn }
}

// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn } = useAuth()
  if (!isLoggedIn.value && to.path !== '/login') {
    return navigateTo('/login')
  }
})

// server/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // 验证用户...
  const token = generateToken(user)
  return { token, user }
})
```

**口语化回答**：
"Nuxt 3 的鉴权流程是：
1. 用 useState 存储用户状态，这个状态在 SSR 时会序列化到客户端
2. 用 useCookie 管理 token，它会自动处理服务端和客户端的 cookie
3. 创建路由中间件检查登录状态，未登录跳转登录页
4. 服务端 API 验证 token，返回用户信息

关键是 useState 和 useCookie 都是 SSR 友好的，状态能正确地在服务端和客户端同步。"
:::

</details>

## 总结

::: details Nuxt 3 核心知识点
| 概念 | 说明 |
|------|------|
| 自动导入 | Vue API、组合式函数、组件无需手动导入 |
| 文件路由 | 基于 pages 目录自动生成路由 |
| 数据获取 | useFetch、useAsyncData、$fetch |
| 状态管理 | useState 实现跨组件共享状态 |
| 中间件 | 路由中间件和服务器中间件 |
| 服务器 | Nitro 引擎，server 目录下的 API 路由 |
| SEO | useHead、useSeoMeta 设置 meta 标签 |
| 渲染模式 | SSR、CSR、SSG、ISR 可混合使用 |
:::

::: details 面试重点
1. SSR vs CSR 的区别和优缺点
2. Nuxt 3 的数据获取方式
3. 渲染模式的选择
4. 自动导入的实现原理
5. Nuxt 2 vs Nuxt 3 的区别
6. Nitro 服务器的特点
:::
