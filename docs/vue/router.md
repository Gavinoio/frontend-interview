# Vue Router

Vue Router 是 Vue.js 官方的路由管理器，用于构建单页面应用的路由系统。

## 基本概念

### 安装

```bash
npm install vue-router@4
```

### 创建路由实例

```javascript
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

// 定义路由
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue')
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('@/views/User.vue'),
    props: true  // 将路由参数作为 props 传递
  },
  {
    // 404 页面
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // 滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
```

### 注册路由

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

## 路由模式

### History 模式

```javascript
import { createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes
})

// URL 形式: http://example.com/user/123
// 需要服务器配置支持
```

**Nginx 配置：**

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Hash 模式

```javascript
import { createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// URL 形式: http://example.com/#/user/123
// 不需要服务器配置，兼容性好
```

### Memory 模式

```javascript
import { createMemoryHistory } from 'vue-router'

const router = createRouter({
  history: createMemoryHistory(),
  routes
})

// 用于 SSR 或不需要 URL 的场景
```

## 路由导航

### 声明式导航

```vue
<template>
  <!-- 基本用法 -->
  <router-link to="/about">About</router-link>

  <!-- 命名路由 -->
  <router-link :to="{ name: 'User', params: { id: 123 } }">
    User 123
  </router-link>

  <!-- 带查询参数 -->
  <router-link :to="{ path: '/search', query: { q: 'vue' } }">
    Search
  </router-link>

  <!-- 替换当前记录 -->
  <router-link to="/about" replace>About</router-link>

  <!-- 自定义激活类名 -->
  <router-link
    to="/about"
    active-class="active"
    exact-active-class="exact-active"
  >
    About
  </router-link>

  <!-- 自定义标签 -->
  <router-link to="/about" custom v-slot="{ navigate, href, isActive }">
    <a :href="href" @click="navigate" :class="{ active: isActive }">
      About
    </a>
  </router-link>
</template>
```

### 编程式导航

```vue
<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 跳转到指定路径
function goToAbout() {
  router.push('/about')
}

// 命名路由 + 参数
function goToUser(id) {
  router.push({ name: 'User', params: { id } })
}

// 带查询参数
function search(query) {
  router.push({ path: '/search', query: { q: query } })
}

// 替换当前记录（不会留下历史记录）
function replaceToHome() {
  router.replace('/')
}

// 前进/后退
function goBack() {
  router.go(-1)
}

function goForward() {
  router.go(1)
}

// 获取当前路由信息
console.log(route.path)      // 当前路径
console.log(route.params)    // 路由参数
console.log(route.query)     // 查询参数
console.log(route.hash)      // hash 值
console.log(route.fullPath)  // 完整路径
console.log(route.matched)   // 匹配的路由记录
console.log(route.name)      // 路由名称
console.log(route.meta)      // 路由元信息
</script>
```

## 动态路由

### 路由参数

```javascript
const routes = [
  // 必选参数
  { path: '/user/:id', component: User },

  // 多个参数
  { path: '/user/:id/post/:postId', component: Post },

  // 可选参数
  { path: '/user/:id?', component: User },

  // 参数正则限制
  { path: '/user/:id(\\d+)', component: User },  // 只匹配数字

  // 可重复参数
  { path: '/articles/:ids+', component: Articles },    // 匹配 /articles/1/2/3
  { path: '/articles/:ids*', component: Articles },    // 匹配 /articles 或 /articles/1/2/3
]
```

### 获取参数

```vue
<script setup>
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import { watch } from 'vue'

const route = useRoute()

// 方式1: 直接访问
console.log(route.params.id)

// 方式2: 监听参数变化
watch(
  () => route.params.id,
  (newId, oldId) => {
    // 参数变化时执行
    fetchUser(newId)
  }
)

// 方式3: 路由守卫
onBeforeRouteUpdate((to, from) => {
  // 路由参数变化时触发
  if (to.params.id !== from.params.id) {
    fetchUser(to.params.id)
  }
})
</script>
```

### Props 传递

```javascript
const routes = [
  // 布尔模式: params 作为 props
  {
    path: '/user/:id',
    component: User,
    props: true
  },

  // 对象模式: 静态 props
  {
    path: '/about',
    component: About,
    props: { title: 'About Page' }
  },

  // 函数模式: 自定义 props
  {
    path: '/search',
    component: Search,
    props: (route) => ({
      query: route.query.q,
      page: parseInt(route.query.page) || 1
    })
  }
]
```

```vue
<!-- User.vue -->
<script setup>
// 直接接收 props，而不是从 route.params 获取
defineProps({
  id: {
    type: String,
    required: true
  }
})
</script>
```

## 嵌套路由

```javascript
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      // 默认子路由
      {
        path: '',
        name: 'UserHome',
        component: UserHome
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: UserProfile
      },
      {
        path: 'posts',
        name: 'UserPosts',
        component: UserPosts
      },
      {
        path: 'settings',
        name: 'UserSettings',
        component: UserSettings,
        // 嵌套路由的嵌套
        children: [
          { path: 'account', component: AccountSettings },
          { path: 'privacy', component: PrivacySettings }
        ]
      }
    ]
  }
]
```

```vue
<!-- User.vue -->
<template>
  <div class="user">
    <h2>User {{ $route.params.id }}</h2>
    <nav>
      <router-link :to="{ name: 'UserProfile' }">Profile</router-link>
      <router-link :to="{ name: 'UserPosts' }">Posts</router-link>
    </nav>
    <!-- 子路由出口 -->
    <router-view />
  </div>
</template>
```

## 命名视图

```javascript
const routes = [
  {
    path: '/',
    components: {
      default: Main,
      sidebar: Sidebar,
      header: Header
    }
  },
  {
    path: '/settings',
    components: {
      default: Settings,
      sidebar: SettingsSidebar
    }
  }
]
```

```vue
<!-- App.vue -->
<template>
  <header>
    <router-view name="header" />
  </header>
  <aside>
    <router-view name="sidebar" />
  </aside>
  <main>
    <router-view />  <!-- 默认视图 -->
  </main>
</template>
```

## 路由守卫

### 全局守卫

```javascript
const router = createRouter({ ... })

// 全局前置守卫
router.beforeEach(async (to, from) => {
  const isAuthenticated = await checkAuth()

  // 需要登录但未登录
  if (to.meta.requiresAuth && !isAuthenticated) {
    // 重定向到登录页，保存原目标
    return {
      path: '/login',
      query: { redirect: to.fullPath }
    }
  }

  // 已登录访问登录页
  if (to.path === '/login' && isAuthenticated) {
    return '/'
  }

  // 返回 false 取消导航
  // 返回 undefined 或 true 继续导航
})

// 全局解析守卫（在组件内守卫和异步路由组件被解析之后）
router.beforeResolve(async (to) => {
  if (to.meta.requiresCamera) {
    try {
      await askForCameraPermission()
    } catch (error) {
      return false
    }
  }
})

// 全局后置钩子（不接收 next）
router.afterEach((to, from, failure) => {
  // 可以用于分析、更改页面标题等
  document.title = to.meta.title || 'My App'

  // 检测导航失败
  if (failure) {
    console.error('Navigation failed:', failure)
  }
})
```

### 路由独享守卫

```javascript
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from) => {
      // 只在进入该路由时触发
      if (!hasAdminAccess()) {
        return '/403'
      }
    }
  },
  {
    path: '/users/:id',
    component: UserDetails,
    // 也可以是数组
    beforeEnter: [validateId, fetchUser]
  }
]

function validateId(to) {
  if (!/^\d+$/.test(to.params.id)) {
    return '/404'
  }
}

async function fetchUser(to) {
  try {
    await store.dispatch('fetchUser', to.params.id)
  } catch {
    return '/404'
  }
}
```

### 组件内守卫

```vue
<script setup>
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

// 离开当前路由前
onBeforeRouteLeave((to, from) => {
  const hasUnsavedChanges = checkUnsavedChanges()
  if (hasUnsavedChanges) {
    const answer = window.confirm('有未保存的更改，确定离开吗？')
    if (!answer) return false
  }
})

// 当前路由改变（如参数变化）
onBeforeRouteUpdate((to, from) => {
  // 仅当路由参数变化时触发
  if (to.params.id !== from.params.id) {
    fetchData(to.params.id)
  }
})
</script>
```

### Options API 组件守卫

```javascript
export default {
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的路由被确认前调用
    // 不能访问 this
    next(vm => {
      // 通过 vm 访问组件实例
      vm.fetchData()
    })
  },

  beforeRouteUpdate(to, from) {
    // 路由改变但组件被复用时调用
    // 可以访问 this
    this.fetchData(to.params.id)
  },

  beforeRouteLeave(to, from) {
    // 离开该组件路由时调用
    // 可以访问 this
    if (this.hasUnsavedChanges) {
      return window.confirm('确定离开？')
    }
  }
}
```

### 守卫执行顺序

```
1. 导航触发
2. 失活组件的 beforeRouteLeave
3. 全局 beforeEach
4. 重用组件的 beforeRouteUpdate
5. 路由配置的 beforeEnter
6. 解析异步路由组件
7. 激活组件的 beforeRouteEnter
8. 全局 beforeResolve
9. 导航确认
10. 全局 afterEach
11. DOM 更新
12. beforeRouteEnter 中 next 回调
```

## 路由元信息

```javascript
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      title: '管理后台'
    },
    children: [
      {
        path: 'users',
        component: AdminUsers,
        meta: {
          requiresAuth: true,
          roles: ['admin', 'manager'],
          title: '用户管理'
        }
      }
    ]
  }
]

// 在守卫中使用
router.beforeEach((to, from) => {
  // to.meta 只包含当前路由的 meta
  // to.matched 包含所有匹配的路由记录

  // 检查是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated()) {
      return '/login'
    }
  }

  // 检查角色权限
  const requiredRoles = to.meta.roles
  if (requiredRoles && !hasRoles(requiredRoles)) {
    return '/403'
  }

  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
})
```

## 路由懒加载

```javascript
const routes = [
  {
    path: '/dashboard',
    // 基本懒加载
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/admin',
    // 带 webpackChunkName（Webpack）
    component: () => import(/* webpackChunkName: "admin" */ '@/views/Admin.vue')
  },
  {
    path: '/settings',
    // 带加载组件和错误组件
    component: defineAsyncComponent({
      loader: () => import('@/views/Settings.vue'),
      loadingComponent: LoadingSpinner,
      errorComponent: ErrorDisplay,
      delay: 200,
      timeout: 3000
    })
  }
]

// 路由分组
const AdminModule = () => import('@/views/admin/index.vue')
const AdminUsers = () => import('@/views/admin/Users.vue')
const AdminSettings = () => import('@/views/admin/Settings.vue')
```

## 动态路由

### 添加/删除路由

```javascript
const router = createRouter({ ... })

// 添加路由
router.addRoute({
  path: '/new-page',
  name: 'NewPage',
  component: () => import('@/views/NewPage.vue')
})

// 添加嵌套路由
router.addRoute('ParentRoute', {
  path: 'child',
  name: 'ChildRoute',
  component: () => import('@/views/Child.vue')
})

// 删除路由
// 方式1: 通过名称
router.removeRoute('NewPage')

// 方式2: addRoute 返回的函数
const removeRoute = router.addRoute({ ... })
removeRoute()

// 方式3: 添加同名路由会覆盖

// 检查路由是否存在
router.hasRoute('NewPage')

// 获取所有路由
router.getRoutes()
```

### 权限路由示例

```javascript
// 静态路由（无需权限）
const constantRoutes = [
  { path: '/login', component: Login },
  { path: '/404', component: NotFound }
]

// 动态路由（需要权限）
const asyncRoutes = [
  {
    path: '/admin',
    component: Admin,
    meta: { roles: ['admin'] }
  },
  {
    path: '/editor',
    component: Editor,
    meta: { roles: ['admin', 'editor'] }
  }
]

// 根据用户角色过滤路由
function filterRoutes(routes, roles) {
  return routes.filter(route => {
    if (route.meta?.roles) {
      return route.meta.roles.some(role => roles.includes(role))
    }
    return true
  })
}

// 登录后动态添加路由
async function setupRoutes(userRoles) {
  const accessibleRoutes = filterRoutes(asyncRoutes, userRoles)

  accessibleRoutes.forEach(route => {
    router.addRoute(route)
  })

  // 添加 404 兜底路由（必须最后添加）
  router.addRoute({
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  })
}
```

## 导航失败处理

```javascript
import { NavigationFailureType, isNavigationFailure } from 'vue-router'

// 处理导航结果
const result = await router.push('/admin')

if (result) {
  // 导航失败
  if (isNavigationFailure(result, NavigationFailureType.aborted)) {
    console.log('导航被中止')
  }
  if (isNavigationFailure(result, NavigationFailureType.cancelled)) {
    console.log('导航被取消')
  }
  if (isNavigationFailure(result, NavigationFailureType.duplicated)) {
    console.log('重复导航')
  }
} else {
  // 导航成功
}

// 全局处理
router.afterEach((to, from, failure) => {
  if (failure) {
    sendToAnalytics(to, from, failure)
  }
})
```

## 过渡动效

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade'" mode="out-in">
      <keep-alive :include="cachedViews">
        <component :is="Component" :key="route.path" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const cachedViews = computed(() => {
  return route.matched
    .filter(r => r.meta.keepAlive)
    .map(r => r.name)
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}
</style>
```

## 滚动行为

```javascript
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 浏览器后退/前进时恢复位置
    if (savedPosition) {
      return savedPosition
    }

    // 滚动到锚点
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }

    // 不同路由滚动到顶部
    if (to.path !== from.path) {
      return { top: 0, behavior: 'smooth' }
    }

    // 延迟滚动（等待过渡动画）
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ top: 0 })
      }, 300)
    })
  }
})
```

## 常见面试题

::: details 1. History 模式和 Hash 模式的区别？
| 特性 | History 模式 | Hash 模式 |
|------|-------------|----------|
| URL 形式 | `/user/123` | `/#/user/123` |
| 实现原理 | HTML5 History API | URL hash |
| 服务器配置 | 需要配置 | 不需要 |
| SEO | 支持 | 不友好 |
| 兼容性 | IE10+ | 所有浏览器 |
:::

::: details 2. 路由守卫的执行顺序？
完整的导航解析流程：
1. 触发导航
2. 失活组件的 `beforeRouteLeave`
3. 全局 `beforeEach`
4. 重用组件的 `beforeRouteUpdate`
5. 路由配置的 `beforeEnter`
6. 解析异步路由组件
7. 激活组件的 `beforeRouteEnter`
8. 全局 `beforeResolve`
9. 导航确认
10. 全局 `afterEach`
11. DOM 更新
:::

::: details 3. 如何实现路由懒加载？
```javascript
// 使用动态 import
const routes = [
  {
    path: '/about',
    component: () => import('@/views/About.vue')
  }
]
```
:::

::: details 4. 如何实现权限路由？
1. 定义静态路由和动态路由
2. 登录后根据用户角色过滤动态路由
3. 使用 `router.addRoute()` 动态添加路由
4. 在全局守卫中进行权限验证
:::

::: details 5. `$route` 和 `$router` 的区别？
- `$route`：当前路由信息对象（path、params、query 等）
- `$router`：路由实例，用于导航操作（push、replace、go 等）
:::
