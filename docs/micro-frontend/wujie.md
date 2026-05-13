# 无界 (Wujie) 微前端框架

## 官方定义
无界微前端是一款基于 Web Components + iframe 的微前端框架，具备极低的成本接入现有系统，拥有成本低、速度快、原生隔离、功能强等一系列优点。

## 白话解释
想象一下：qiankun 是把子应用「搬进」主应用的房子里，而 wujie 是给每个子应用一个「独立的房间（iframe）」，但房间的门窗（Web Components）和主屋相连，既保证了隔离，又能方便沟通。

---

## 核心特性

### 1. 基于 iframe 的天然隔离

**官方解释**：
使用 iframe 作为 JS 沙箱，DOM 隔离天然完美，不会出现样式污染和 JS 全局变量冲突问题。

**白话解释**：
每个子应用运行在独立的 iframe 里，就像每个人有自己独立的房间，互不干扰。

```javascript
// iframe 沙箱的本质
const sandbox = document.createElement('iframe')
sandbox.src = 'about:blank'
document.body.appendChild(sandbox)

// 子应用的 JS 运行在 iframe 的 window 中
sandbox.contentWindow.eval(subAppCode)
```

### 2. 基于 Web Components 的 DOM 渲染

**官方解释**：
将子应用的 DOM 渲染到 Web Components 容器中，实现样式隔离和 DOM 隔离。

**白话解释**：
虽然 JS 在 iframe 里运行，但 DOM 却通过 Web Components 显示在主应用中，这样就既有隔离又有好的用户体验。

```javascript
// Web Components 容器
class WujieApp extends HTMLElement {
  constructor() {
    super()
    // 创建 Shadow DOM 实现样式隔离
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    // 子应用的 DOM 将渲染到这里
    this.shadowRoot.innerHTML = '<div id="app"></div>'
  }
}

customElements.define('wujie-app', WujieApp)
```

### 3. iframe 与 Web Components 的通信

```javascript
// Wujie 的核心架构
class WujieCore {
  constructor(options) {
    this.name = options.name
    this.url = options.url

    // 1. 创建 iframe 沙箱
    this.iframe = this.createIframe()

    // 2. 创建 Web Components 容器
    this.shadowRoot = this.createShadowRoot()

    // 3. 劫持 iframe 的 document 操作
    this.patchIframe()
  }

  createIframe() {
    const iframe = document.createElement('iframe')
    iframe.src = 'about:blank'
    // 隐藏 iframe，只用于 JS 执行
    iframe.style.display = 'none'
    document.body.appendChild(iframe)
    return iframe
  }

  createShadowRoot() {
    const container = document.createElement('wujie-app')
    this.el.appendChild(container)
    return container.shadowRoot
  }

  patchIframe() {
    const iframeWindow = this.iframe.contentWindow
    const iframeDocument = this.iframe.contentDocument

    // 劫持 document.querySelector 等方法
    // 让它们操作 Shadow DOM 而不是 iframe 的 DOM
    const originalQuerySelector = iframeDocument.querySelector.bind(iframeDocument)
    iframeDocument.querySelector = (selector) => {
      return this.shadowRoot.querySelector(selector) || originalQuerySelector(selector)
    }

    // 劫持 document.body
    Object.defineProperty(iframeDocument, 'body', {
      get: () => this.shadowRoot.querySelector('body') || this.shadowRoot
    })
  }
}
```

---

## 快速开始

### 安装

```bash
npm install wujie wujie-vue3  # Vue 3
# 或
npm install wujie wujie-vue2  # Vue 2
# 或
npm install wujie wujie-react  # React
```

### Vue 3 中使用

```vue
<!-- 主应用 App.vue -->
<template>
  <div id="app">
    <nav>
      <router-link to="/">首页</router-link>
      <router-link to="/vue-app">Vue 子应用</router-link>
      <router-link to="/react-app">React 子应用</router-link>
    </nav>

    <!-- 子应用容器 -->
    <WujieVue
      v-if="currentApp === 'vue'"
      name="vue-app"
      :url="vueAppUrl"
      :props="{ token: userToken }"
      @dataChange="handleDataChange"
    />

    <WujieVue
      v-if="currentApp === 'react'"
      name="react-app"
      :url="reactAppUrl"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import WujieVue from 'wujie-vue3'
import { useRoute } from 'vue-router'

const route = useRoute()
const vueAppUrl = 'http://localhost:8001'
const reactAppUrl = 'http://localhost:8002'
const userToken = ref('xxx-token')

const currentApp = computed(() => {
  if (route.path.startsWith('/vue-app')) return 'vue'
  if (route.path.startsWith('/react-app')) return 'react'
  return null
})

const handleDataChange = (data) => {
  console.log('子应用数据变化:', data)
}
</script>
```

### 预加载优化

```javascript
// main.js
import { preloadApp } from 'wujie'

// 应用启动时预加载子应用
preloadApp({
  name: 'vue-app',
  url: 'http://localhost:8001',
  exec: true  // 预执行 JS
})

preloadApp({
  name: 'react-app',
  url: 'http://localhost:8002'
})
```

---

## 通信机制

### 1. Props 传递

```javascript
// 主应用传递数据
<WujieVue
  name="sub-app"
  :url="subAppUrl"
  :props="{
    userInfo: currentUser,
    token: authToken,
    theme: currentTheme
  }"
/>

// 子应用接收
// Vue 子应用
const props = window.$wujie?.props || {}
console.log(props.userInfo, props.token)

// React 子应用
function App() {
  const props = window.$wujie?.props || {}
  return <div>用户: {props.userInfo?.name}</div>
}
```

### 2. EventBus 事件通信

```javascript
// 主应用
import { bus } from 'wujie'

// 监听子应用事件
bus.$on('sub-app-event', (data) => {
  console.log('收到子应用消息:', data)
})

// 向子应用发送事件
bus.$emit('main-app-event', { type: 'refresh' })
```

```javascript
// 子应用
const { bus } = window.$wujie

// 向主应用发送事件
bus.$emit('sub-app-event', {
  action: 'updateCart',
  data: { count: 5 }
})

// 监听主应用事件
bus.$on('main-app-event', (data) => {
  if (data.type === 'refresh') {
    location.reload()
  }
})
```

### 3. Window 通信

```javascript
// 主应用注入方法到子应用
<WujieVue
  name="sub-app"
  :url="subAppUrl"
  :props="{
    // 传递方法
    showDialog: (msg) => {
      ElMessageBox.alert(msg)
    },
    navigate: (path) => {
      router.push(path)
    }
  }"
/>

// 子应用调用
window.$wujie.props.showDialog('操作成功')
window.$wujie.props.navigate('/dashboard')
```

---

## 生命周期

```javascript
import { startApp } from 'wujie'

startApp({
  name: 'sub-app',
  url: 'http://localhost:8001',
  el: '#container',

  // 生命周期钩子
  beforeLoad: (appWindow) => {
    console.log('子应用开始加载', appWindow)
  },

  beforeMount: (appWindow) => {
    console.log('子应用开始挂载')
  },

  afterMount: (appWindow) => {
    console.log('子应用挂载完成')
  },

  beforeUnmount: (appWindow) => {
    console.log('子应用开始卸载')
  },

  afterUnmount: (appWindow) => {
    console.log('子应用卸载完成')
  },

  activated: (appWindow) => {
    console.log('子应用激活（keep-alive）')
  },

  deactivated: (appWindow) => {
    console.log('子应用失活（keep-alive）')
  }
})
```

---

## 运行模式

### 1. 单例模式（默认）

```javascript
// 子应用只会渲染一个实例
startApp({
  name: 'single-app',
  url: 'http://localhost:8001',
  el: '#container'
})
```

### 2. 保活模式（keep-alive）

```javascript
// 子应用切换时保持状态，不销毁实例
startApp({
  name: 'keep-alive-app',
  url: 'http://localhost:8001',
  el: '#container',
  alive: true  // 开启保活模式
})

// 切换到其他子应用时，该子应用会被隐藏而非销毁
// 再次切换回来时，状态保持不变
```

### 3. 重建模式

```javascript
// 每次切换都重新创建实例
startApp({
  name: 'rebuild-app',
  url: 'http://localhost:8001',
  el: '#container',
  alive: false,  // 关闭保活
  sync: false    // 关闭路由同步（避免状态残留）
})
```

---

## 路由同步

```javascript
startApp({
  name: 'sub-app',
  url: 'http://localhost:8001',
  el: '#container',

  // 开启路由同步
  sync: true,

  // 路由前缀
  prefix: {
    // 子应用内部路由 /home 会映射为主应用 /sub-app/home
    '/': '/sub-app'
  }
})
```

```javascript
// 完整的路由配置示例
// 主应用路由
const routes = [
  { path: '/', component: Home },
  {
    path: '/sub-app/:pathMatch(.*)*',
    component: SubAppContainer
  }
]

// SubAppContainer.vue
<template>
  <WujieVue
    name="sub-app"
    :url="subAppUrl"
    sync
  />
</template>
```

---

## 子应用适配

### Vue 子应用

```javascript
// main.js - 几乎无需改动
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 判断是否在 wujie 环境中
if (window.__POWERED_BY_WUJIE__) {
  let app

  window.__WUJIE_MOUNT = () => {
    app = createApp(App)
    app.use(router)
    app.mount('#app')
  }

  window.__WUJIE_UNMOUNT = () => {
    app?.unmount()
  }

  // 如果 wujie 已经准备好，立即执行挂载
  window.__WUJIE.mount()
} else {
  // 独立运行
  createApp(App).use(router).mount('#app')
}
```

### React 子应用

```javascript
// index.js
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

let root = null

if (window.__POWERED_BY_WUJIE__) {
  window.__WUJIE_MOUNT = () => {
    root = ReactDOM.createRoot(document.getElementById('root'))
    root.render(<App />)
  }

  window.__WUJIE_UNMOUNT = () => {
    root?.unmount()
  }

  window.__WUJIE.mount()
} else {
  root = ReactDOM.createRoot(document.getElementById('root'))
  root.render(<App />)
}
```

---

## Wujie vs Qiankun 对比

| 特性 | Wujie | Qiankun |
|------|-------|---------|
| JS 沙箱 | iframe（原生隔离） | Proxy/快照（模拟隔离） |
| CSS 隔离 | Shadow DOM | CSS 前缀/Shadow DOM |
| 接入成本 | 极低 | 较低 |
| 性能 | 更好（预加载+预执行） | 良好 |
| 兼容性 | 需要支持 Web Components | 更广泛 |
| 子应用通信 | Props + EventBus | Props + Actions |
| 保活能力 | 原生支持 | 需要额外配置 |
| Vite 支持 | 原生支持 | 需要插件 |

### 何时选择 Wujie

1. **需要完美隔离**：子应用之间完全独立，不能有任何冲突
2. **存量项目接入**：老项目不想改造太多代码
3. **使用 Vite**：Vite 项目接入 qiankun 有兼容问题
4. **需要保活能力**：频繁切换子应用需要保持状态

### 何时选择 Qiankun

1. **需要更广泛的浏览器兼容性**
2. **团队已有 qiankun 经验**
3. **子应用需要深度集成主应用**

---

