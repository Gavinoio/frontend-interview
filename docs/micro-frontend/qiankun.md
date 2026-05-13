# qiankun 微前端框架详解

## qiankun 简介

### 什么是 qiankun?

**官方定义**: qiankun 是一个基于 single-spa 的微前端实现库,提供了更加开箱即用的 API,技术栈无关、并且支持样式隔离、JS 沙箱隔离。

**通俗理解**: qiankun 就像是一个"房东",管理多个"租客"(子应用):
- 提供公寓(主应用容器)
- 每个租客独立生活(应用隔离)
- 房东管理租客进出(路由匹配)
- 租客之间可以通信(状态共享)

## 核心特性

```javascript
/*
1. 简单易用
   - 基于single-spa封装
   - 开箱即用的API
   - 最少的配置

2. 技术栈无关
   - 主应用可以是任意框架
   - 子应用可以是任意框架
   - Vue、React、Angular混用

3. HTML Entry
   - 通过HTML入口加载子应用
   - 自动解析JS和CSS
   - 更灵活的资源加载

4. 样式隔离
   - Scoped CSS
   - Shadow DOM
   - 防止样式冲突

5. JS沙箱
   - 快照沙箱
   - 代理沙箱
   - 防止全局变量污染

6. 资源预加载
   - prefetch
   - 提升切换速度

7. 应用间通信
   - 全局状态管理
   - 发布订阅模式
*/
```

## 完整实战案例

### 主应用搭建

```javascript
// 1. 安装
npm install qiankun

// 2. 主应用入口 main.js
import { registerMicroApps, start, initGlobalState, setDefaultMountApp } from 'qiankun'

// 注册子应用
registerMicroApps([
  {
    name: 'vue-app',                    // 应用名称,必须唯一
    entry: '//localhost:8080',          // 应用入口
    container: '#subapp-viewport',      // 挂载节点
    activeRule: '/vue',                 // 激活路由
    props: {                            // 传递给子应用的数据
      data: { user: 'admin' },
      routerBase: '/vue'
    }
  },
  {
    name: 'react-app',
    entry: '//localhost:3000',
    container: '#subapp-viewport',
    activeRule: '/react',
    props: {
      data: { user: 'admin' },
      routerBase: '/react'
    }
  },
  {
    name: 'angular-app',
    entry: '//localhost:4200',
    container: '#subapp-viewport',
    activeRule: '/angular',
    props: {
      data: { user: 'admin' },
      routerBase: '/angular'
    }
  }
], {
  // 生命周期钩子 - 所有子应用共享
  beforeLoad: [
    app => {
      console.log('before load', app.name)
      return Promise.resolve()
    }
  ],
  beforeMount: [
    app => {
      console.log('before mount', app.name)
      return Promise.resolve()
    }
  ],
  afterMount: [
    app => {
      console.log('after mount', app.name)
      return Promise.resolve()
    }
  ],
  beforeUnmount: [
    app => {
      console.log('before unmount', app.name)
      return Promise.resolve()
    }
  ],
  afterUnmount: [
    app => {
      console.log('after unmount', app.name)
      return Promise.resolve()
    }
  ]
})

// 设置默认进入的子应用
setDefaultMountApp('/vue')

// 启动qiankun
start({
  // 预加载策略
  prefetch: true,  // 或 'all' | string[] | (apps) => apps

  // 沙箱配置
  sandbox: {
    strictStyleIsolation: false,       // 严格样式隔离(Shadow DOM)
    experimentalStyleIsolation: true,  // 实验性样式隔离(scoped)
    // speedy: false                   // 快速沙箱
  },

  // 单例模式(同时只能有一个子应用)
  singular: true,

  // 开启预加载
  prefetch: 'all',

  // 手动加载子应用
  // autoStart: false,

  // 全局错误处理
  errorHandler: (error) => {
    console.error('qiankun error:', error)
  }
})

// 3. 主应用 App.vue
<template>
  <div id="app">
    <!-- 主应用导航 -->
    <nav class="nav">
      <router-link to="/home">主应用首页</router-link>
      <router-link to="/vue">Vue子应用</router-link>
      <router-link to="/react">React子应用</router-link>
      <router-link to="/angular">Angular子应用</router-link>
    </nav>

    <!-- 主应用路由 -->
    <router-view v-if="$route.name"></router-view>

    <!-- 子应用容器 -->
    <div id="subapp-viewport"></div>
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    console.log('主应用已挂载')
  }
}
</script>

// 4. 主应用路由 router.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('./views/Home.vue')
  }
  // 注意: 不要添加 /vue、/react 等子应用路由
  // qiankun会自动处理
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

### Vue 子应用改造

```javascript
// 1. 安装依赖
npm install

// 2. src/main.js
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import routes from './router'

let instance = null
let router = null

// 渲染函数
function render(props = {}) {
  const { container, routerBase } = props

  // 创建路由
  router = createRouter({
    history: createWebHistory(window.__POWERED_BY_QIANKUN__ ? routerBase : '/'),
    routes
  })

  // 创建应用
  instance = createApp(App)
  instance.use(router)

  // 挂载
  instance.mount(container ? container.querySelector('#app') : '#app')
}

// 独立运行环境
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

// qiankun生命周期 - bootstrap
export async function bootstrap() {
  console.log('[vue] vue app bootstraped')
}

// qiankun生命周期 - mount
export async function mount(props) {
  console.log('[vue] props from main framework', props)

  // 接收主应用数据
  props.onGlobalStateChange((state, prev) => {
    // state: 变更后的状态; prev 变更前的状态
    console.log('[vue] 主应用状态变化:', state, prev)
  })

  // 修改主应用状态
  props.setGlobalState({ user: 'from vue app' })

  render(props)
}

// qiankun生命周期 - unmount
export async function unmount() {
  console.log('[vue] vue app unmount')
  instance.unmount()
  instance._container.innerHTML = ''
  instance = null
  router = null
}

// qiankun生命周期 - update (可选)
export async function update(props) {
  console.log('[vue] vue app update', props)
}

// 3. vue.config.js
const { defineConfig } = require('@vue/cli-service')
const packageName = require('./package.json').name

module.exports = defineConfig({
  // 开发服务器配置
  devServer: {
    port: 8080,
    headers: {
      // 允许跨域(重要!)
      'Access-Control-Allow-Origin': '*'
    }
  },

  // Webpack配置
  configureWebpack: {
    output: {
      // 打包为库模式
      library: `${packageName}-[name]`,
      libraryTarget: 'umd',

      // 防止jsonp函数冲突
      chunkLoadingGlobal: `webpackJsonp_${packageName}`
    }
  }
})

// 4. 路由配置 router/index.js
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('../views/User.vue')
  }
]

export default routes

// 5. public-path.js (重要!)
if (window.__POWERED_BY_QIANKUN__) {
  // 动态设置publicPath
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
}

// 在main.js最顶部引入
import './public-path'
```

### React 子应用改造

```javascript
// 1. src/index.js
import './public-path'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

let root = null

function render(props) {
  const { container, routerBase } = props

  root = ReactDOM.createRoot(
    container ? container.querySelector('#root') : document.getElementById('root')
  )

  root.render(
    <BrowserRouter basename={window.__POWERED_BY_QIANKUN__ ? routerBase : '/'}>
      <App />
    </BrowserRouter>
  )
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  render({})
}

// qiankun生命周期
export async function bootstrap() {
  console.log('[react] react app bootstraped')
}

export async function mount(props) {
  console.log('[react] props from main framework', props)
  render(props)
}

export async function unmount(props) {
  console.log('[react] react app unmount')
  root.unmount()
  root = null
}

// 2. config-overrides.js (使用react-app-rewired)
const { override, addWebpackPlugin } = require('customize-cra')
const packageName = require('./package.json').name

module.exports = {
  webpack: override(
    (config) => {
      config.output.library = `${packageName}-[name]`
      config.output.libraryTarget = 'umd'
      config.output.chunkLoadingGlobal = `webpackJsonp_${packageName}`
      config.output.globalObject = 'window'
      return config
    }
  ),

  devServer: (configFunction) => {
    return (proxy, allowedHost) => {
      const config = configFunction(proxy, allowedHost)
      config.headers = {
        'Access-Control-Allow-Origin': '*'
      }
      return config
    }
  }
}

// 3. package.json
{
  "scripts": {
    "start": "react-app-rewired start",
    "build": "react-app-rewired build"
  },
  "devDependencies": {
    "react-app-rewired": "^2.2.1",
    "customize-cra": "^1.0.0"
  }
}
```

## 应用间通信

### 1. initGlobalState (推荐)

```javascript
// 主应用
import { initGlobalState, MicroAppStateActions } from 'qiankun'

// 初始化全局状态
const actions: MicroAppStateActions = initGlobalState({
  user: { name: 'admin', role: 'admin' },
  token: 'xxx-token-xxx',
  theme: 'light'
})

// 监听状态变化
actions.onGlobalStateChange((state, prev) => {
  console.log('主应用监听到状态变化:', state, prev)

  // 根据状态更新UI
  if (state.theme !== prev.theme) {
    document.body.className = state.theme
  }
})

// 修改状态
actions.setGlobalState({
  user: { name: 'user1', role: 'user' }
})

// 卸载
actions.offGlobalStateChange()

// 子应用
export async function mount(props) {
  // 监听全局状态
  props.onGlobalStateChange((state, prev) => {
    console.log('子应用监听到状态变化:', state, prev)

    // 更新子应用状态
    store.commit('SET_USER', state.user)
  }, true)  // true表示立即执行一次回调

  // 修改全局状态
  props.setGlobalState({
    token: 'new-token'
  })
}
```

### 2. Props 通信

```javascript
// 主应用
registerMicroApps([
  {
    name: 'vue-app',
    entry: '//localhost:8080',
    container: '#subapp-viewport',
    activeRule: '/vue',
    props: {
      // 静态数据
      data: {
        user: { name: 'admin' },
        apiUrl: 'https://api.example.com'
      },

      // 方法
      methods: {
        getUserInfo: () => {
          return fetch('/api/user').then(res => res.json())
        },
        logout: () => {
          console.log('logout')
        }
      },

      // 事件总线
      eventBus: new Vue()
    }
  }
])

// 子应用接收
export async function mount(props) {
  const { data, methods, eventBus } = props

  console.log('用户信息:', data.user)

  // 调用主应用方法
  const userInfo = await methods.getUserInfo()

  // 使用事件总线
  eventBus.$on('update-user', (user) => {
    console.log('更新用户:', user)
  })

  eventBus.$emit('child-ready')
}
```

### 3. 自定义事件总线

```javascript
// 创建事件总线 eventBus.js
class EventBus {
  constructor() {
    this.events = {}
  }

  // 订阅事件
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  // 取消订阅
  off(event, callback) {
    if (!this.events[event]) return

    if (callback) {
      this.events[event] = this.events[event].filter(cb => cb !== callback)
    } else {
      delete this.events[event]
    }
  }

  // 触发事件
  emit(event, data) {
    if (!this.events[event]) return

    this.events[event].forEach(callback => {
      callback(data)
    })
  }

  // 只订阅一次
  once(event, callback) {
    const wrapper = (data) => {
      callback(data)
      this.off(event, wrapper)
    }
    this.on(event, wrapper)
  }
}

// 导出单例
export default new EventBus()

// 主应用使用
import eventBus from './eventBus'

registerMicroApps([
  {
    name: 'vue-app',
    entry: '//localhost:8080',
    container: '#subapp-viewport',
    activeRule: '/vue',
    props: { eventBus }
  }
])

// 监听子应用事件
eventBus.on('child-event', (data) => {
  console.log('收到子应用事件:', data)
})

// 子应用使用
export async function mount(props) {
  const { eventBus } = props

  // 发送事件给主应用
  eventBus.emit('child-event', { message: 'hello from child' })

  // 监听主应用事件
  eventBus.on('main-event', (data) => {
    console.log('收到主应用事件:', data)
  })
}
```

## 样式隔离方案

### 1. Scoped CSS (实验性)

```javascript
start({
  sandbox: {
    experimentalStyleIsolation: true
  }
})

// 原理: 给子应用的样式选择器添加特殊属性
// 原始: .button { color: red; }
// 转换: div[data-qiankun-子应用名] .button { color: red; }
```

### 2. Shadow DOM (严格隔离)

```javascript
start({
  sandbox: {
    strictStyleIsolation: true
  }
})

// 原理: 将子应用包裹在Shadow DOM中
// 完全隔离,但可能导致:
// - 弹窗等全局组件样式失效
// - 部分第三方库样式问题
```

### 3. CSS Modules

```vue
<!-- 子应用组件 -->
<template>
  <div :class="$style.container">
    <button :class="$style.button">按钮</button>
  </div>
</template>

<style module>
.container {
  padding: 20px;
}

.button {
  color: red;
}
</style>
```

### 4. CSS-in-JS

```jsx
// React子应用
import styled from 'styled-components'

const Button = styled.button`
  color: red;
  padding: 10px 20px;
`

function App() {
  return <Button>按钮</Button>
}
```

### 5. 命名空间

```scss
// 主应用
.main-app {
  .header { color: blue; }
  .content { padding: 20px; }
}

// 子应用1
.vue-app {
  .header { color: red; }
  .content { padding: 10px; }
}

// 子应用2
.react-app {
  .header { color: green; }
  .content { padding: 15px; }
}
```

## JS 沙箱隔离

### 1. 快照沙箱 (SnapshotSandbox)

```javascript
// 原理: 激活时记录window快照,失活时恢复
class SnapshotSandbox {
  constructor() {
    this.proxy = window
    this.modifyPropsMap = {}  // 记录修改的属性
  }

  active() {
    // 保存快照
    this.windowSnapshot = {}
    for (const prop in window) {
      this.windowSnapshot[prop] = window[prop]
    }

    // 恢复上次修改
    Object.keys(this.modifyPropsMap).forEach(prop => {
      window[prop] = this.modifyPropsMap[prop]
    })
  }

  inactive() {
    // 记录修改的属性
    for (const prop in window) {
      if (window[prop] !== this.windowSnapshot[prop]) {
        this.modifyPropsMap[prop] = window[prop]

        // 恢复原始值
        window[prop] = this.windowSnapshot[prop]
      }
    }
  }
}

// 使用
const sandbox = new SnapshotSandbox()
sandbox.active()
window.city = 'Beijing'  // 修改window
sandbox.inactive()  // 恢复window,但记录了修改
console.log(window.city)  // undefined

sandbox.active()  // 再次激活
console.log(window.city)  // 'Beijing' - 恢复修改
```

### 2. 代理沙箱 (ProxySandbox)

```javascript
// 原理: 使用Proxy代理window,完全隔离
class ProxySandbox {
  constructor() {
    this.running = false

    const fakeWindow = Object.create(null)
    const proxy = new Proxy(fakeWindow, {
      get: (target, prop) => {
        // 优先从fakeWindow取
        if (prop in target) {
          return target[prop]
        }

        // 否则从真实window取
        const value = window[prop]

        // 绑定函数的this
        if (typeof value === 'function') {
          return value.bind(window)
        }

        return value
      },

      set: (target, prop, value) => {
        if (this.running) {
          target[prop] = value
        }
        return true
      },

      has: (target, prop) => {
        return prop in target || prop in window
      }
    })

    this.proxy = proxy
  }

  active() {
    this.running = true
  }

  inactive() {
    this.running = false
  }
}

// 使用
const sandbox = new ProxySandbox()
sandbox.active()

;(function(window) {
  window.city = 'Beijing'
  console.log(window.city)  // 'Beijing'
}).call(sandbox.proxy, sandbox.proxy)

console.log(window.city)  // undefined - 真实window未污染
```

## 常见问题和解决方案

### 1. 子应用资源加载404

```javascript
// 问题: 子应用的图片、字体等资源加载失败

// 解决: 设置publicPath
// public-path.js
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
}

// 或者在vue.config.js中配置
module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? 'https://cdn.example.com/vue-app/'
    : '//localhost:8080'
}
```

### 2. 子应用路由404

```javascript
// 问题: 刷新页面后子应用路由404

// 解决1: 主应用使用history路由,nginx配置
location / {
  try_files $uri $uri/ /index.html;
}

// 解决2: 子应用使用base
const router = createRouter({
  history: createWebHistory(
    window.__POWERED_BY_QIANKUN__ ? '/vue' : '/'
  ),
  routes
})
```

### 3. 子应用间跳转

```javascript
// 问题: 如何从一个子应用跳转到另一个子应用?

// 解决: 使用history.pushState
// 在vue-app中跳转到react-app
window.history.pushState(null, '', '/react/home')

// 或者封装路由工具
export function navigate(path) {
  window.history.pushState(null, '', path)
}

// 使用
navigate('/react/home')
```

### 4. 全局状态冲突

```javascript
// 问题: 子应用的Vuex/Redux状态冲突

// 解决: 使用命名空间
// Vuex
const store = new Vuex.Store({
  modules: {
    vueApp: {  // 命名空间
      namespaced: true,
      state: {},
      mutations: {}
    }
  }
})

// Redux
const store = createStore(
  combineReducers({
    reactApp: reducer  // 命名空间
  })
)
```

### 5. 第三方库全局污染

```javascript
// 问题: Element Plus、Ant Design等全局注册组件

// 解决: 按需引入,避免全局注册
// ❌ 全局注册
app.use(ElementPlus)

// ✅ 按需引入
import { ElButton, ElInput } from 'element-plus'
app.component('ElButton', ElButton)
app.component('ElInput', ElInput)
```

## 性能优化

### 1. 预加载策略

```javascript
start({
  // 预加载所有子应用
  prefetch: 'all',

  // 预加载指定子应用
  prefetch: ['vue-app', 'react-app'],

  // 自定义预加载逻辑
  prefetch: (apps) => {
    // 只预加载用户有权限的应用
    return apps.filter(app => hasPermission(app.name))
  }
})
```

### 2. 手动加载

```javascript
import { loadMicroApp } from 'qiankun'

// 手动加载子应用
const microApp = loadMicroApp({
  name: 'vue-app',
  entry: '//localhost:8080',
  container: '#subapp-container',
  props: { data: {} }
})

// 手动卸载
microApp.unmount()

// 应用场景: 弹窗、标签页等
```

### 3. 按需加载子应用

```javascript
// 只在需要时注册子应用
function registerApp(name, config) {
  if (!window.qiankunApps) {
    window.qiankunApps = []
  }

  if (!window.qiankunApps.includes(name)) {
    registerMicroApps([config])
    window.qiankunApps.push(name)
  }
}

// 路由守卫中按需注册
router.beforeEach((to, from, next) => {
  if (to.path.startsWith('/vue')) {
    registerApp('vue-app', {
      name: 'vue-app',
      entry: '//localhost:8080',
      container: '#subapp-viewport',
      activeRule: '/vue'
    })
  }
  next()
})
```

## 常见面试题

::: details 1. qiankun的实现原理是什么?
<details>
<summary>点击查看答案</summary>

**核心原理**:

1. **HTML Entry**
   - 通过fetch获取子应用HTML
   - 解析HTML,提取JS和CSS
   - 执行JS,渲染页面

2. **JS沙箱**
   - 快照沙箱: 激活时记录window快照,失活时恢复
   - 代理沙箱: 使用Proxy代理fakeWindow
   - 隔离全局变量,防止污染

3. **样式隔离**
   - Scoped CSS: 给选择器添加属性
   - Shadow DOM: 使用Shadow DOM完全隔离

4. **路由劫持**
   - 监听路由变化
   - 匹配activeRule
   - 加载/卸载对应子应用

5. **资源加载**
   - import-html-entry解析HTML
   - 执行JS代码
   - 插入CSS样式

**关键代码**:
```javascript
// 1. 加载子应用
fetch(entry)
  .then(html => parseHTML(html))
  .then(({ scripts, styles }) => {
    // 2. 执行脚本
    execScripts(scripts, sandbox.proxy)

    // 3. 插入样式
    appendStyles(styles)

    // 4. 调用生命周期
    await app.bootstrap()
    await app.mount()
  })
```
:::

</details>

::: details 2. 如何解决子应用间样式冲突?
<details>
<summary>点击查看答案</summary>

**解决方案**:

1. **qiankun内置方案**
```javascript
// Scoped CSS
start({
  sandbox: {
    experimentalStyleIsolation: true
  }
})

// Shadow DOM
start({
  sandbox: {
    strictStyleIsolation: true
  }
})
```

2. **CSS Modules**
```vue
<style module>
.button { color: red; }
</style>
```

3. **CSS-in-JS**
```javascript
const Button = styled.button`
  color: red;
`
```

4. **命名空间**
```scss
.vue-app {
  .button { color: red; }
}

.react-app {
  .button { color: blue; }
}
```

5. **BEM规范**
```scss
.vue-app__button { color: red; }
.react-app__button { color: blue; }
```

**推荐方案**:
- 开发: experimentalStyleIsolation
- 生产: CSS Modules + 命名空间
:::

</details>

::: details 3. qiankun如何实现应用间通信?
<details>
<summary>点击查看答案</summary>

**三种方式**:

1. **initGlobalState (推荐)**
```javascript
// 主应用
const actions = initGlobalState({ user: 'admin' })

actions.onGlobalStateChange((state, prev) => {
  console.log(state, prev)
})

actions.setGlobalState({ user: 'user1' })

// 子应用
props.onGlobalStateChange((state, prev) => {
  console.log(state, prev)
})

props.setGlobalState({ user: 'user2' })
```

2. **Props传递**
```javascript
// 主应用
registerMicroApps([{
  name: 'vue-app',
  entry: '//localhost:8080',
  container: '#subapp',
  activeRule: '/vue',
  props: {
    data: { user: 'admin' },
    methods: {
      getUserInfo: () => {}
    }
  }
}])

// 子应用
export async function mount(props) {
  const { data, methods } = props
}
```

3. **自定义事件总线**
```javascript
// 创建事件总线
class EventBus {
  on(event, callback) {}
  emit(event, data) {}
  off(event, callback) {}
}

const eventBus = new EventBus()

// 传递给子应用
registerMicroApps([{
  props: { eventBus }
}])
```

**最佳实践**:
- 全局状态: initGlobalState
- 方法调用: Props
- 事件通知: EventBus
:::

</details>

## 总结

::: details 核心要点
1. **技术栈无关**: 可以混用各种框架
2. **HTML Entry**: 更灵活的资源加载方式
3. **样式隔离**: Scoped CSS、Shadow DOM
4. **JS沙箱**: 快照沙箱、代理沙箱
5. **应用通信**: initGlobalState、Props、EventBus
:::

::: details 面试加分项
- 能说出qiankun的实现原理
- 了解沙箱隔离机制
- 掌握样式隔离方案
- 有实际项目经验
- 知道如何优化性能
:::

::: details 最佳实践
- 合理使用样式隔离方案
- 统一技术栈降低维护成本
- 做好应用间通信设计
- 注意性能优化
- 完善错误监控
:::
