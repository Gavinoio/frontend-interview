# uni-app 跨端开发

## 什么是 uni-app?

### 官方定义
uni-app 是一个使用 Vue.js 开发所有前端应用的框架,开发者编写一套代码,可发布到iOS、Android、Web(响应式)、各种小程序(微信/支付宝/百度/头条/飞书/QQ/快手/钉钉/淘宝)、快应用等多个平台。

### 核心特点

```javascript
/*
1. 一套代码,多端发布
   - 10+ 个平台
   - 降低开发成本

2. 基于 Vue.js
   - 熟悉的语法
   - 丰富的生态

3. 完整的组件库
   - 内置组件
   - 插件市场

4. 条件编译
   - 平台差异处理
   - 灵活的代码组织
*/
```

## 目录结构

```
uni-app项目
├── pages                // 页面文件
│   ├── index
│   │   └── index.vue
│   └── detail
│       └── detail.vue
├── components           // 组件
│   └── my-component.vue
├── static              // 静态资源
│   └── logo.png
├── uni_modules         // uni_modules 模块
├── App.vue             // 应用配置
├── main.js             // 入口文件
├── manifest.json       // 应用配置
└── pages.json          // 页面路由配置
```

## 核心配置

### pages.json

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页",
        "enablePullDownRefresh": true
      }
    },
    {
      "path": "pages/detail/detail",
      "style": {
        "navigationBarTitleText": "详情"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "uni-app",
    "navigationBarBackgroundColor": "#F8F8F8",
    "backgroundColor": "#F8F8F8"
  },
  "tabBar": {
    "color": "#7A7E83",
    "selectedColor": "#3cc51f",
    "borderStyle": "black",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "iconPath": "static/home.png",
        "selectedIconPath": "static/home-active.png",
        "text": "首页"
      },
      {
        "pagePath": "pages/my/my",
        "iconPath": "static/my.png",
        "selectedIconPath": "static/my-active.png",
        "text": "我的"
      }
    ]
  }
}
```

## 条件编译

### 平台判断

```vue
<template>
  <view>
    <!-- #ifdef MP-WEIXIN -->
    <view>微信小程序特有</view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view>H5特有</view>
    <!-- #endif -->

    <!-- #ifdef APP-PLUS -->
    <view>App特有</view>
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <view>除H5外的平台</view>
    <!-- #endif -->
  </view>
</template>

<script>
export default {
  onLoad() {
    // #ifdef MP-WEIXIN
    console.log('微信小程序')
    // #endif

    // #ifdef H5
    console.log('H5')
    // #endif
  }
}
</script>

<style>
/* #ifdef MP-WEIXIN */
.weixin-only {
  color: red;
}
/* #endif */

/* #ifdef H5 */
.h5-only {
  color: blue;
}
/* #endif */
</style>
```

### 组合条件

```javascript
// #ifdef MP-WEIXIN || MP-ALIPAY
console.log('微信或支付宝小程序')
// #endif

// #ifdef MP-WEIXIN && !H5
console.log('微信小程序且不是H5')
// #endif
```

## 生命周期

### 应用生命周期

```javascript
// App.vue
export default {
  onLaunch(options) {
    console.log('App Launch', options)
    // 应用启动
  },

  onShow(options) {
    console.log('App Show', options)
    // 应用显示
  },

  onHide() {
    console.log('App Hide')
    // 应用隐藏
  }
}
```

### 页面生命周期

```javascript
export default {
  onLoad(options) {
    console.log('Page Load', options)
    // 页面加载,接收参数
  },

  onShow() {
    console.log('Page Show')
    // 页面显示
  },

  onReady() {
    console.log('Page Ready')
    // 页面初次渲染完成
  },

  onHide() {
    console.log('Page Hide')
    // 页面隐藏
  },

  onUnload() {
    console.log('Page Unload')
    // 页面卸载
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('Pull Down Refresh')
    setTimeout(() => {
      uni.stopPullDownRefresh()
    }, 1000)
  },

  // 上拉加载
  onReachBottom() {
    console.log('Reach Bottom')
    this.loadMore()
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '分享标题',
      path: '/pages/index/index'
    }
  }
}
```

## 路由与导航

```javascript
// 跳转到非tabBar页面
uni.navigateTo({
  url: '/pages/detail/detail?id=123',
  success: (res) => {
    console.log('跳转成功')
  }
})

// 跳转到tabBar页面
uni.switchTab({
  url: '/pages/index/index'
})

// 关闭当前页面,跳转
uni.redirectTo({
  url: '/pages/detail/detail'
})

// 返回上一页
uni.navigateBack({
  delta: 1  // 返回的页面数
})

// 关闭所有页面,打开某页面
uni.reLaunch({
  url: '/pages/index/index'
})

// 预加载页面
uni.preloadPage({
  url: '/pages/detail/detail'
})
```

## API 使用

### 网络请求

```javascript
// 封装请求
class Request {
  constructor(baseURL) {
    this.baseURL = baseURL
  }

  request(options) {
    return new Promise((resolve, reject) => {
      uni.request({
        url: this.baseURL + options.url,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          'Authorization': uni.getStorageSync('token') || '',
          ...options.header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(res)
          }
        },
        fail: reject
      })
    })
  }

  get(url, data) {
    return this.request({ url, data, method: 'GET' })
  }

  post(url, data) {
    return this.request({ url, data, method: 'POST' })
  }
}

// 使用
const request = new Request('https://api.example.com')

request.get('/users', { page: 1 })
  .then(data => console.log(data))
  .catch(err => console.error(err))
```

### 数据缓存

```javascript
// 同步存储
uni.setStorageSync('key', 'value')
const value = uni.getStorageSync('key')
uni.removeStorageSync('key')
uni.clearStorageSync()

// 异步存储
uni.setStorage({
  key: 'user',
  data: { name: 'Alice', age: 18 },
  success: () => {
    console.log('存储成功')
  }
})

uni.getStorage({
  key: 'user',
  success: (res) => {
    console.log('用户信息:', res.data)
  }
})

// 封装存储工具
const Storage = {
  set(key, value) {
    try {
      uni.setStorageSync(key, JSON.stringify(value))
    } catch (e) {
      console.error('存储失败:', e)
    }
  },

  get(key) {
    try {
      const value = uni.getStorageSync(key)
      return value ? JSON.parse(value) : null
    } catch (e) {
      return null
    }
  },

  remove(key) {
    uni.removeStorageSync(key)
  },

  clear() {
    uni.clearStorageSync()
  }
}
```

### 文件上传

```javascript
// 选择图片
uni.chooseImage({
  count: 1,
  sizeType: ['compressed'],
  sourceType: ['album', 'camera'],
  success: (res) => {
    const tempFilePath = res.tempFilePaths[0]

    // 上传文件
    uni.uploadFile({
      url: 'https://api.example.com/upload',
      filePath: tempFilePath,
      name: 'file',
      formData: {
        user: 'test'
      },
      success: (uploadRes) => {
        console.log('上传成功:', uploadRes.data)
      }
    })
  }
})

// 封装上传
function uploadImage() {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: 1,
      success: (chooseRes) => {
        uni.showLoading({ title: '上传中' })

        uni.uploadFile({
          url: 'https://api.example.com/upload',
          filePath: chooseRes.tempFilePaths[0],
          name: 'file',
          success: (uploadRes) => {
            uni.hideLoading()
            const data = JSON.parse(uploadRes.data)
            resolve(data.url)
          },
          fail: (err) => {
            uni.hideLoading()
            reject(err)
          }
        })
      },
      fail: reject
    })
  })
}

// 使用
uploadImage()
  .then(url => {
    console.log('图片URL:', url)
  })
  .catch(err => {
    console.error('上传失败:', err)
  })
```

## 性能优化

### 分包加载

```json
// pages.json
{
  "pages": [
    {
      "path": "pages/index/index"
    }
  ],
  "subPackages": [
    {
      "root": "pages-sub",
      "pages": [
        {
          "path": "detail/detail"
        }
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pages-sub"]
    }
  }
}
```

### 图片优化

```vue
<template>
  <!-- 懒加载 -->
  <image
    :src="imageUrl"
    mode="aspectFill"
    lazy-load
    @load="onImageLoad"
    @error="onImageError"
  ></image>
</template>

<script>
export default {
  data() {
    return {
      imageUrl: ''
    }
  },

  methods: {
    onImageLoad() {
      console.log('图片加载成功')
    },

    onImageError() {
      // 加载失败,使用默认图
      this.imageUrl = '/static/default.png'
    }
  }
}
</script>
```

### 长列表优化

```vue
<template>
  <scroll-view
    scroll-y
    :scroll-top="scrollTop"
    @scrolltolower="loadMore"
  >
    <view v-for="item in list" :key="item.id">
      {{ item.title }}
    </view>
  </scroll-view>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      page: 1,
      loading: false
    }
  },

  methods: {
    async loadMore() {
      if (this.loading) return

      this.loading = true
      const data = await this.fetchData(this.page)
      this.list.push(...data)
      this.page++
      this.loading = false
    }
  }
}
</script>
```

## 常见问题

### 1. 如何实现跨端兼容?

```javascript
// 使用条件编译
// #ifdef MP-WEIXIN
wx.scanCode()
// #endif

// #ifdef H5
// H5 使用第三方库
// #endif

// 封装统一接口
const scan = {
  // #ifdef MP-WEIXIN
  scanCode() {
    return new Promise((resolve, reject) => {
      wx.scanCode({
        success: resolve,
        fail: reject
      })
    })
  }
  // #endif

  // #ifdef H5
  scanCode() {
    // H5 实现
  }
  // #endif
}
```

### 2. 如何调试?

```javascript
// 1. 使用 console.log
console.log('调试信息')

// 2. 使用 HBuilderX 真机调试

// 3. 小程序开发者工具调试

// 4. Chrome DevTools (H5)

// 5. vconsole
// #ifdef H5
import VConsole from 'vconsole'
new VConsole()
// #endif
```

## 组件通信

### 父子组件通信

```vue
<!-- 父组件 -->
<template>
  <child-component
    :message="parentMsg"
    @childEvent="handleChildEvent"
  />
</template>

<script>
export default {
  data() {
    return {
      parentMsg: 'Hello from parent'
    }
  },

  methods: {
    handleChildEvent(data) {
      console.log('收到子组件事件:', data)
    }
  }
}
</script>

<!-- 子组件 -->
<template>
  <view @click="sendToParent">
    {{ message }}
  </view>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      default: ''
    }
  },

  methods: {
    sendToParent() {
      this.$emit('childEvent', { data: 'Hello from child' })
    }
  }
}
</script>
```

### 全局事件总线

```javascript
// utils/event-bus.js
class EventBus {
  constructor() {
    this.events = {}
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data))
    }
  }

  off(event, callback) {
    if (this.events[event]) {
      if (callback) {
        this.events[event] = this.events[event].filter(cb => cb !== callback)
      } else {
        delete this.events[event]
      }
    }
  }
}

export default new EventBus()

// 使用
import EventBus from '@/utils/event-bus'

// 页面A - 发送事件
EventBus.emit('userLogin', { userId: 123 })

// 页面B - 监听事件
export default {
  onLoad() {
    EventBus.on('userLogin', this.handleLogin)
  },

  onUnload() {
    EventBus.off('userLogin', this.handleLogin)
  },

  methods: {
    handleLogin(data) {
      console.log('用户登录:', data)
    }
  }
}
```

### Vuex 状态管理

```javascript
// store/index.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    user: null,
    token: uni.getStorageSync('token') || ''
  },

  getters: {
    isLogin: state => !!state.token,
    userName: state => state.user?.name || '未登录'
  },

  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      uni.setStorageSync('token', token)
    },

    SET_USER(state, user) {
      state.user = user
    },

    LOGOUT(state) {
      state.token = ''
      state.user = null
      uni.removeStorageSync('token')
    }
  },

  actions: {
    async login({ commit }, { username, password }) {
      try {
        const res = await uni.request({
          url: '/api/login',
          method: 'POST',
          data: { username, password }
        })

        commit('SET_TOKEN', res.data.token)
        commit('SET_USER', res.data.user)

        return res.data
      } catch (error) {
        throw error
      }
    },

    logout({ commit }) {
      commit('LOGOUT')
      uni.reLaunch({ url: '/pages/login/login' })
    }
  }
})

export default store

// main.js
import store from './store'
Vue.prototype.$store = store

// 页面中使用
export default {
  computed: {
    isLogin() {
      return this.$store.getters.isLogin
    },
    userName() {
      return this.$store.getters.userName
    }
  },

  methods: {
    async login() {
      try {
        await this.$store.dispatch('login', {
          username: 'test',
          password: '123456'
        })
        uni.showToast({ title: '登录成功' })
      } catch (error) {
        uni.showToast({ title: '登录失败', icon: 'none' })
      }
    }
  }
}
```

---

## 插件开发

### 自定义组件

```vue
<!-- components/custom-button/custom-button.vue -->
<template>
  <button
    :class="['custom-btn', `custom-btn--${type}`, { 'custom-btn--disabled': disabled }]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'CustomButton',

  props: {
    type: {
      type: String,
      default: 'primary',
      validator: value => ['primary', 'success', 'warning', 'danger'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    handleClick(e) {
      if (!this.disabled) {
        this.$emit('click', e)
      }
    }
  }
}
</script>

<style scoped>
.custom-btn {
  padding: 20rpx 40rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.custom-btn--primary {
  background-color: #007aff;
  color: #fff;
}

.custom-btn--success {
  background-color: #4cd964;
  color: #fff;
}

.custom-btn--disabled {
  opacity: 0.6;
}
</style>
```

### 自定义插件

```javascript
// plugins/toast.js
const Toast = {
  install(Vue) {
    Vue.prototype.$toast = {
      success(title, duration = 2000) {
        uni.showToast({
          title,
          icon: 'success',
          duration
        })
      },

      error(title, duration = 2000) {
        uni.showToast({
          title,
          icon: 'none',
          duration
        })
      },

      loading(title = '加载中...') {
        uni.showLoading({
          title,
          mask: true
        })
      },

      hide() {
        uni.hideLoading()
      }
    }
  }
}

export default Toast

// main.js
import Toast from './plugins/toast'
Vue.use(Toast)

// 使用
this.$toast.success('操作成功')
this.$toast.error('操作失败')
this.$toast.loading('处理中...')
this.$toast.hide()
```

---

## 真机调试

### 开发环境配置

```javascript
// config/env.js
const env = process.env.NODE_ENV

const config = {
  development: {
    baseURL: 'http://localhost:3000',
    uploadURL: 'http://localhost:3000/upload'
  },
  production: {
    baseURL: 'https://api.example.com',
    uploadURL: 'https://api.example.com/upload'
  }
}

export default config[env]

// 使用
import config from '@/config/env'

uni.request({
  url: config.baseURL + '/api/users'
})
```

### 调试工具

```javascript
// utils/logger.js
class Logger {
  constructor() {
    this.isDev = process.env.NODE_ENV === 'development'
  }

  log(...args) {
    if (this.isDev) {
      console.log('[LOG]', ...args)
    }
  }

  error(...args) {
    if (this.isDev) {
      console.error('[ERROR]', ...args)
    }
  }

  warn(...args) {
    if (this.isDev) {
      console.warn('[WARN]', ...args)
    }
  }

  // 性能监控
  time(label) {
    if (this.isDev) {
      console.time(label)
    }
  }

  timeEnd(label) {
    if (this.isDev) {
      console.timeEnd(label)
    }
  }
}

export default new Logger()

// 使用
import logger from '@/utils/logger'

logger.log('页面加载')
logger.time('数据请求')
// ... 请求数据
logger.timeEnd('数据请求')
```

---

## nvue 原生渲染

### nvue 与 vue 的区别

```vue
<!-- nvue 页面 -->
<template>
  <!-- nvue 使用 <div> 而不是 <view> -->
  <div class="container">
    <text class="title">{{ title }}</text>

    <!-- nvue 的列表使用 list 和 cell -->
    <list>
      <cell v-for="item in list" :key="item.id">
        <text>{{ item.name }}</text>
      </cell>
    </list>

    <!-- nvue 使用 <image> 标签 -->
    <image :src="imageUrl" style="width: 750rpx; height: 400rpx;"></image>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: 'nvue 页面',
      list: [],
      imageUrl: ''
    }
  },

  // nvue 不支持的生命周期
  // created() {},  // ❌ 不支持
  // mounted() {},  // ❌ 不支持

  // nvue 支持的生命周期
  beforeCreate() {}, // ✅ 支持
  onLoad() {},       // ✅ 支持
  onReady() {}       // ✅ 支持
}
</script>

<style>
/* nvue 只支持部分 CSS，类似 React Native */
.container {
  flex: 1;
  background-color: #ffffff;
}

.title {
  font-size: 32px;
  color: #333333;
}

/* ❌ 不支持的 CSS */
/* .box:hover {} */
/* .box::before {} */
/* .box + .box {} */
</style>
```

### nvue 使用场景

```javascript
/*
何时使用 nvue:

1. 长列表滚动性能要求高
   - 商品列表
   - 聊天消息列表
   - 新闻资讯列表

2. 复杂动画
   - 视频播放页
   - 直播页面
   - 富交互页面

3. 地图相关
   - 地图展示
   - 位置选择

4. 原生功能
   - 需要调用原生插件
   - 性能要求极高的页面

何时使用 vue:
1. 普通页面
2. 表单页面
3. 详情页
4. 简单列表
*/
```

---

## 小程序特性

### 自定义导航栏

```json
// pages.json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationStyle": "custom"
      }
    }
  ]
}
```

```vue
<!-- pages/index/index.vue -->
<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <text class="navbar-title">首页</text>
      </view>
    </view>

    <!-- 页面内容 -->
    <view class="page-content" :style="{ paddingTop: navBarHeight + 'px' }">
      <!-- 内容 -->
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 0,
      navBarHeight: 44
    }
  },

  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight

    // #ifdef MP-WEIXIN
    // 微信小程序获取胶囊按钮位置
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
    this.navBarHeight = menuButtonInfo.height + (menuButtonInfo.top - this.statusBarHeight) * 2
    // #endif
  }
}
</script>

<style scoped>
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background-color: #ffffff;
}

.navbar-content {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
```

### 分享功能

```javascript
export default {
  // 分享给朋友
  onShareAppMessage(options) {
    console.log('分享来源:', options.from)

    return {
      title: '分享标题',
      path: '/pages/index/index?id=123',
      imageUrl: '/static/share.png'
    }
  },

  // 分享到朋友圈（仅微信小程序支持）
  onShareTimeline() {
    return {
      title: '分享到朋友圈',
      query: 'id=123',
      imageUrl: '/static/share.png'
    }
  },

  // 自定义分享
  methods: {
    customShare() {
      // #ifdef MP-WEIXIN
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      })
      // #endif
    }
  }
}
```

### 订阅消息

```javascript
// 订阅消息
async subscribeMessage() {
  try {
    // #ifdef MP-WEIXIN
    const res = await uni.requestSubscribeMessage({
      tmplIds: ['template-id-1', 'template-id-2']
    })

    console.log('订阅结果:', res)

    // 检查订阅状态
    if (res['template-id-1'] === 'accept') {
      console.log('用户同意订阅')
      // 可以发送订阅消息
    }
    // #endif
  } catch (error) {
    console.error('订阅失败:', error)
  }
}
```

### 小程序码生成

```javascript
// 后端 Node.js 示例
const axios = require('axios')

async function generateQRCode(scene, page) {
  // 获取 access_token
  const tokenRes = await axios.get(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
  )

  const accessToken = tokenRes.data.access_token

  // 生成小程序码
  const qrRes = await axios.post(
    `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`,
    {
      scene: scene,           // 场景值
      page: page,             // 页面路径
      width: 430,             // 宽度
      auto_color: false,      // 自动配置线条颜色
      line_color: { r: 0, g: 0, b: 0 }
    },
    { responseType: 'arraybuffer' }
  )

  return Buffer.from(qrRes.data, 'binary')
}

// 使用
const qrCode = await generateQRCode('id=123', 'pages/detail/detail')
```

---

## 性能优化进阶

### 图片懒加载

```vue
<template>
  <scroll-view scroll-y @scroll="onScroll">
    <view
      v-for="item in list"
      :key="item.id"
      class="item"
      :data-index="index"
    >
      <image
        v-if="item.visible"
        :src="item.image"
        mode="aspectFill"
        lazy-load
      ></image>
      <view v-else class="placeholder"></view>
    </view>
  </scroll-view>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      scrollTop: 0
    }
  },

  methods: {
    onScroll(e) {
      this.scrollTop = e.detail.scrollTop
      this.checkVisible()
    },

    checkVisible() {
      const query = uni.createSelectorQuery().in(this)

      query.selectViewport().scrollOffset()
      query.selectAll('.item').boundingClientRect()

      query.exec((res) => {
        const viewport = res[0]
        const items = res[1]

        items.forEach((item, index) => {
          const visible = item.top < viewport.height && item.bottom > 0
          this.$set(this.list[index], 'visible', visible)
        })
      })
    }
  }
}
</script>
```

### 防抖节流

```javascript
// utils/debounce.js
export function debounce(fn, delay = 300) {
  let timer = null

  return function(...args) {
    if (timer) clearTimeout(timer)

    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

export function throttle(fn, delay = 300) {
  let lastTime = 0

  return function(...args) {
    const now = Date.now()

    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

// 使用
import { debounce, throttle } from '@/utils/debounce'

export default {
  methods: {
    // 搜索防抖
    onSearchInput: debounce(function(e) {
      this.search(e.detail.value)
    }, 500),

    // 滚动节流
    onScroll: throttle(function(e) {
      console.log('滚动位置:', e.detail.scrollTop)
    }, 200)
  }
}
```

### 数据预加载

```javascript
// 页面预加载
export default {
  onLoad() {
    // 预加载下一页
    this.preloadNextPage()
  },

  methods: {
    preloadNextPage() {
      // 预加载页面
      uni.preloadPage({
        url: '/pages/detail/detail'
      })

      // 预请求数据
      this.prefetchData()
    },

    async prefetchData() {
      try {
        const data = await this.fetchData()
        // 存储到缓存
        uni.setStorageSync('prefetch-data', data)
      } catch (error) {
        console.error('预加载失败:', error)
      }
    }
  }
}

// 下一页使用预加载的数据
export default {
  onLoad() {
    // 先从缓存获取
    const cachedData = uni.getStorageSync('prefetch-data')

    if (cachedData) {
      this.data = cachedData
      uni.removeStorageSync('prefetch-data')
    } else {
      this.fetchData()
    }
  }
}
```

### setData 优化

```javascript
export default {
  data() {
    return {
      list: []
    }
  },

  methods: {
    // ❌ 不好的做法 - 频繁 setData
    badUpdate() {
      for (let i = 0; i < 100; i++) {
        this.list.push({ id: i })  // 每次都会触发视图更新
      }
    },

    // ✅ 好的做法 - 批量更新
    goodUpdate() {
      const newList = []
      for (let i = 0; i < 100; i++) {
        newList.push({ id: i })
      }
      this.list = newList  // 只触发一次视图更新
    },

    // ✅ 更好的做法 - 使用 $nextTick
    betterUpdate() {
      this.list = this.list.concat(newData)

      this.$nextTick(() => {
        // 数据已更新，DOM 已渲染
        console.log('渲染完成')
      })
    }
  }
}
```

---

