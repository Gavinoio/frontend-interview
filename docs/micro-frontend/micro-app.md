# Micro App

Micro App 是京东零售推出的一款基于 Web Components 的微前端框架，具有零依赖、接入简单、功能丰富的特点。

## 核心特点

### 与其他方案对比

| 特性 | Micro App | qiankun | single-spa |
|------|-----------|---------|------------|
| 依赖 | 零依赖 | 较多 | 较少 |
| 接入成本 | 极低 | 中等 | 较高 |
| 隔离方案 | WebComponent | JS 沙箱 | 无 |
| 样式隔离 | 自动 | 需配置 | 需配置 |
| 预加载 | 支持 | 支持 | 需手动 |
| 静态资源处理 | 自动补全 | 需配置 | 需配置 |

### 核心优势

- **零依赖**：不依赖任何第三方库
- **接入简单**：像使用 iframe 一样简单
- **功能丰富**：支持 JS 沙箱、样式隔离、预加载等
- **兼容性好**：支持所有框架（React、Vue、Angular 等）

## 基本使用

### 安装

```bash
npm install @micro-zoe/micro-app
```

### 主应用配置

```javascript
// main.js
import microApp from '@micro-zoe/micro-app'

// 启动 micro-app
microApp.start({
  // 全局配置
  lifeCycles: {
    created() {
      console.log('子应用被创建')
    },
    beforemount() {
      console.log('子应用即将渲染')
    },
    mounted() {
      console.log('子应用已渲染')
    },
    unmount() {
      console.log('子应用已卸载')
    },
    error() {
      console.log('子应用加载出错')
    }
  },
  // 全局插件
  plugins: {
    modules: {
      'app1': [{
        loader(code) {
          // 处理子应用代码
          return code
        }
      }]
    }
  }
})
```

### 使用子应用

```vue
<!-- Vue 中使用 -->
<template>
  <div>
    <h1>主应用</h1>
    <!-- 使用 micro-app 标签加载子应用 -->
    <micro-app
      name="app1"
      url="http://localhost:3001/"
      baseroute="/app1"
    ></micro-app>
  </div>
</template>
```

```tsx
// React 中使用
import React from 'react'

// 需要声明 micro-app 元素类型
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'micro-app': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          name: string
          url: string
          baseroute?: string
        },
        HTMLElement
      >
    }
  }
}

function App() {
  return (
    <div>
      <h1>主应用</h1>
      <micro-app
        name="app1"
        url="http://localhost:3001/"
        baseroute="/app1"
      />
    </div>
  )
}
```

### 子应用配置

子应用不需要额外安装依赖，只需要做少量改造。

```javascript
// Vue 子应用 - main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 与基座进行数据交互
function handleMicroData() {
  // 监听基座数据变化
  window.microApp?.addDataListener((data) => {
    console.log('来自基座的数据', data)
  })
}

let app = null

// 将渲染操作放入 mount 函数
function mount() {
  app = createApp(App)
  app.use(router)
  app.mount('#app')
  handleMicroData()
}

// 将卸载操作放入 unmount 函数
function unmount() {
  app?.unmount()
  app = null
}

// 微前端环境下，注册 mount 和 unmount 方法
if (window.__MICRO_APP_ENVIRONMENT__) {
  window['micro-app-app1'] = { mount, unmount }
} else {
  // 非微前端环境直接渲染
  mount()
}
```

```javascript
// React 子应用 - index.js
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

let root = null

function mount() {
  root = ReactDOM.createRoot(document.getElementById('root'))
  root.render(<App />)

  // 监听基座数据
  window.microApp?.addDataListener((data) => {
    console.log('来自基座的数据', data)
  })
}

function unmount() {
  root?.unmount()
  root = null
}

if (window.__MICRO_APP_ENVIRONMENT__) {
  window['micro-app-react-app'] = { mount, unmount }
} else {
  mount()
}
```

### 子应用路由配置

```javascript
// Vue Router 配置
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  // 根据是否在微前端环境设置 base
  history: createWebHistory(
    window.__MICRO_APP_BASE_ROUTE__ || '/'
  ),
  routes: [
    // ...
  ]
})
```

### Webpack/Vite 配置

```javascript
// webpack.config.js（子应用）
module.exports = {
  output: {
    // 允许跨域访问
    publicPath: 'http://localhost:3001/'
  },
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}

// vite.config.js（子应用）
export default {
  base: 'http://localhost:3001/',
  server: {
    cors: true,
    origin: 'http://localhost:3001'
  }
}
```

## 数据通信

### 主应用向子应用发送数据

```vue
<template>
  <micro-app
    name="app1"
    url="http://localhost:3001/"
    :data="microAppData"
  ></micro-app>
</template>

<script setup>
import { ref } from 'vue'
import microApp from '@micro-zoe/micro-app'

const microAppData = ref({
  type: 'init',
  user: { name: 'Tom', id: 1 }
})

// 方式一：通过 data 属性
const updateData = () => {
  microAppData.value = { type: 'update', msg: 'hello' }
}

// 方式二：通过 setData 方法
const sendData = () => {
  microApp.setData('app1', { type: 'push', data: 'new data' })
}
</script>
```

### 子应用接收数据

```javascript
// 方式一：监听 datachange 事件
window.addEventListener('datachange', (e) => {
  console.log('收到数据', e.detail.data)
})

// 方式二：使用 microApp 对象
window.microApp?.addDataListener((data) => {
  console.log('收到数据', data)
}, true)  // true 表示立即执行一次回调

// 方式三：直接获取数据
const data = window.microApp?.getData()
```

### 子应用向主应用发送数据

```javascript
// 子应用发送
window.microApp?.dispatch({
  type: 'action',
  payload: { msg: 'hello from child' }
})
```

```vue
<!-- 主应用接收 -->
<template>
  <micro-app
    name="app1"
    url="http://localhost:3001/"
    @datachange="handleDataChange"
  ></micro-app>
</template>

<script setup>
import microApp from '@micro-zoe/micro-app'

// 方式一：事件监听
const handleDataChange = (e) => {
  console.log('子应用数据', e.detail.data)
}

// 方式二：addDataListener
microApp.addDataListener('app1', (data) => {
  console.log('子应用数据', data)
})

// 方式三：直接获取
const childData = microApp.getData('app1')
</script>
```

### 全局数据通信

```javascript
// 设置全局数据（任何地方）
import microApp from '@micro-zoe/micro-app'
microApp.setGlobalData({ user: { name: 'Tom' } })

// 主应用监听全局数据
microApp.addGlobalDataListener((data) => {
  console.log('全局数据变化', data)
})

// 子应用监听全局数据
window.microApp?.addGlobalDataListener((data) => {
  console.log('全局数据变化', data)
})

// 子应用设置全局数据
window.microApp?.setGlobalData({ token: 'xxx' })
```

## JS 沙箱

### 沙箱类型

```vue
<template>
  <!-- 默认沙箱：with + Proxy -->
  <micro-app name="app1" url="..."></micro-app>

  <!-- 关闭沙箱 -->
  <micro-app name="app2" url="..." :inline="true" disableSandbox></micro-app>

  <!-- iframe 沙箱（更强隔离） -->
  <micro-app name="app3" url="..." iframe></micro-app>
</template>
```

### 沙箱原理

```javascript
// Micro App 沙箱简化实现
class Sandbox {
  constructor() {
    this.proxyWindow = {}
    this.active = false
  }

  // 创建代理
  createProxy() {
    return new Proxy(window, {
      get: (target, key) => {
        // 优先从沙箱取值
        if (key in this.proxyWindow) {
          return this.proxyWindow[key]
        }
        return target[key]
      },
      set: (target, key, value) => {
        // 设置到沙箱
        this.proxyWindow[key] = value
        return true
      }
    })
  }

  // 激活沙箱
  start() {
    this.active = true
  }

  // 关闭沙箱
  stop() {
    this.active = false
  }
}
```

### 沙箱逃逸场景

```javascript
// 以下情况可能逃逸沙箱

// 1. 直接操作 document
document.title = 'xxx'  // 会影响主应用

// 2. 使用 eval
eval('window.xxx = 1')  // 可能影响主应用

// 3. 访问原生对象原型
Array.prototype.myMethod = () => {}  // 影响所有应用

// 解决方案：使用 iframe 沙箱
<micro-app name="app1" url="..." iframe></micro-app>
```

## 样式隔离

### 默认隔离

Micro App 默认使用 `scoped` 样式隔离，会自动添加前缀。

```css
/* 原始样式 */
.container { color: red; }

/* 转换后 */
micro-app[name=app1] .container { color: red; }
```

### 禁用样式隔离

```vue
<template>
  <!-- 禁用样式隔离 -->
  <micro-app
    name="app1"
    url="..."
    disableScopecss
  ></micro-app>
</template>
```

### shadowDOM 隔离

```vue
<template>
  <!-- 使用 shadowDOM（更强隔离） -->
  <micro-app
    name="app1"
    url="..."
    shadowDOM
  ></micro-app>
</template>
```

### 样式穿透

```css
/* 主应用样式穿透到子应用 */

/* 方式一：/deep/ */
/deep/ .child-class {
  color: red;
}

/* 方式二：::v-deep */
::v-deep .child-class {
  color: red;
}

/* 方式三：全局样式 */
:global(.child-class) {
  color: red;
}
```

## 路由系统

### 路由配置

```vue
<!-- 主应用路由配置 -->
<template>
  <router-view />
  <!-- 子应用容器 -->
  <micro-app
    v-if="showMicroApp"
    :name="microAppName"
    :url="microAppUrl"
    :baseroute="baseroute"
  ></micro-app>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const showMicroApp = computed(() => {
  return route.path.startsWith('/app1') || route.path.startsWith('/app2')
})

const microAppName = computed(() => {
  if (route.path.startsWith('/app1')) return 'app1'
  if (route.path.startsWith('/app2')) return 'app2'
  return ''
})

const microAppUrl = computed(() => {
  const urls = {
    app1: 'http://localhost:3001/',
    app2: 'http://localhost:3002/'
  }
  return urls[microAppName.value] || ''
})

const baseroute = computed(() => {
  if (route.path.startsWith('/app1')) return '/app1'
  if (route.path.startsWith('/app2')) return '/app2'
  return '/'
})
</script>
```

### 主应用路由

```javascript
// router/index.js
const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/app1/:pathMatch(.*)*',
    component: MicroAppContainer,
    meta: { microApp: 'app1' }
  },
  {
    path: '/app2/:pathMatch(.*)*',
    component: MicroAppContainer,
    meta: { microApp: 'app2' }
  }
]
```

### 子应用路由同步

```javascript
// 子应用监听路由变化并通知主应用
router.afterEach((to) => {
  // 通知主应用路由变化
  window.microApp?.dispatch({
    type: 'route-change',
    path: to.fullPath
  })
})

// 主应用监听并同步 URL
microApp.addDataListener('app1', (data) => {
  if (data.type === 'route-change') {
    // 同步到浏览器地址栏
    history.pushState(null, '', `/app1${data.path}`)
  }
})
```

### keep-alive 支持

```vue
<template>
  <!-- 保持子应用状态 -->
  <micro-app
    name="app1"
    url="..."
    keep-alive
  ></micro-app>
</template>
```

## 预加载

### 配置预加载

```javascript
import microApp from '@micro-zoe/micro-app'

// 全局配置预加载
microApp.start({
  preFetchApps: [
    { name: 'app1', url: 'http://localhost:3001/' },
    { name: 'app2', url: 'http://localhost:3002/' }
  ]
})

// 手动预加载
microApp.preFetch([
  { name: 'app3', url: 'http://localhost:3003/' }
])
```

### 预加载时机

```javascript
// 延迟预加载
microApp.start({
  preFetchApps: [
    { name: 'app1', url: '...', level: 1 },  // 立即预加载
    { name: 'app2', url: '...', level: 2 },  // 空闲时预加载
    { name: 'app3', url: '...', level: 3 }   // 低优先级预加载
  ],
  // 全局配置预加载等级
  'prefetch-level': 2
})
```

## 静态资源处理

### 自动补全

Micro App 会自动补全子应用的静态资源路径。

```html
<!-- 子应用原始代码 -->
<img src="/logo.png" />

<!-- 转换后 -->
<img src="http://localhost:3001/logo.png" />
```

### 手动配置

```javascript
// 子应用 webpack 配置
module.exports = {
  output: {
    publicPath: process.env.NODE_ENV === 'production'
      ? 'https://cdn.example.com/app1/'
      : 'http://localhost:3001/'
  }
}
```

### 资源共享

```javascript
// 主应用配置全局资源
microApp.start({
  globalAssets: {
    js: ['https://cdn.example.com/common.js'],
    css: ['https://cdn.example.com/common.css']
  }
})
```

## 插件系统

### 全局插件

```javascript
microApp.start({
  plugins: {
    // 全局插件
    global: [{
      // 处理 JS
      loader(code, url) {
        console.log('加载 JS:', url)
        return code
      },
      // 处理 HTML
      processHtml(code, url) {
        return code.replace(/oldText/g, 'newText')
      }
    }],
    // 特定应用插件
    modules: {
      'app1': [{
        loader(code, url) {
          // 只处理 app1 的代码
          return code
        }
      }]
    }
  }
})
```

### 代码转换

```javascript
microApp.start({
  plugins: {
    modules: {
      'app1': [{
        loader(code, url) {
          // 替换子应用中的特定代码
          if (url.includes('main.js')) {
            return code.replace(
              'process.env.API_URL',
              '"https://api.example.com"'
            )
          }
          return code
        }
      }]
    }
  }
})
```

## 错误处理

### 生命周期错误

```vue
<template>
  <micro-app
    name="app1"
    url="..."
    @created="onCreated"
    @beforemount="onBeforeMount"
    @mounted="onMounted"
    @unmount="onUnmount"
    @error="onError"
  ></micro-app>
</template>

<script setup>
const onCreated = () => {
  console.log('子应用创建完成')
}

const onError = (e) => {
  console.error('子应用加载失败', e)
  // 显示错误页面或降级方案
}
</script>
```

### 全局错误处理

```javascript
microApp.start({
  lifeCycles: {
    error(e) {
      console.error('微应用错误', e)
      // 上报错误
      errorReport.send({
        type: 'micro-app-error',
        error: e
      })
    }
  }
})
```

### 资源加载错误

```javascript
// 监听资源加载失败
window.addEventListener('error', (e) => {
  if (e.target !== window) {
    // 资源加载失败
    console.error('资源加载失败', e.target.src || e.target.href)
  }
}, true)
```

## 性能优化

### 按需加载

```vue
<template>
  <!-- 路由匹配时才加载 -->
  <micro-app
    v-if="route.path.startsWith('/app1')"
    name="app1"
    url="..."
  ></micro-app>
</template>
```

### 预加载优化

```javascript
// 根据用户行为预加载
document.getElementById('app1-link').addEventListener('mouseenter', () => {
  microApp.preFetch([
    { name: 'app1', url: 'http://localhost:3001/' }
  ])
})
```

### 缓存策略

```javascript
// 子应用 nginx 配置
location / {
  # HTML 不缓存
  if ($request_filename ~* .*\.html$) {
    add_header Cache-Control "no-cache, no-store";
  }

  # 静态资源长期缓存
  if ($request_filename ~* .*\.(js|css|png|jpg|gif)$) {
    add_header Cache-Control "max-age=31536000";
  }
}
```

## 常见问题

### 跨域问题

```javascript
// 子应用开发服务器配置
// webpack
devServer: {
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
}

// vite
server: {
  cors: true
}

// nginx
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
```

### 子应用静态资源 404

```javascript
// 确保子应用 publicPath 配置正确
// webpack.config.js
module.exports = {
  output: {
    publicPath: 'http://localhost:3001/'
  }
}

// vite.config.js
export default {
  base: 'http://localhost:3001/'
}
```

### 子应用样式污染

```vue
<!-- 使用 shadowDOM 完全隔离 -->
<micro-app
  name="app1"
  url="..."
  shadowDOM
></micro-app>
```

