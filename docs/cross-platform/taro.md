# Taro

Taro 是京东凹凸实验室推出的多端统一开发框架，支持使用 React、Vue 等主流框架开发小程序、H5、React Native 等多端应用。

## 简介

### 特点

- **多端运行**：一套代码，多端编译
- **框架支持**：React、Vue 2、Vue 3、Preact
- **现代语法**：支持 TypeScript、JSX/TSX
- **丰富生态**：大量组件库和插件

### 支持平台

- 微信小程序
- 支付宝小程序
- 百度智能小程序
- 字节跳动小程序
- QQ 小程序
- 京东小程序
- H5
- React Native
- 快应用

## 快速开始

### 创建项目

```bash
# 安装 CLI
npm install -g @tarojs/cli

# 创建项目
taro init myApp

# 选择配置
# ✔ 请输入项目名称 myApp
# ✔ 请输入项目介绍 A Taro project
# ✔ 请选择框架 React
# ✔ 请选择 TypeScript Yes
# ✔ 请选择 CSS 预处理器 Sass
# ✔ 请选择模板 默认模板

# 进入项目
cd myApp

# 开发
npm run dev:weapp    # 微信小程序
npm run dev:h5       # H5
npm run dev:alipay   # 支付宝小程序

# 构建
npm run build:weapp
npm run build:h5
```

### 项目结构

```
├── config/                 # 配置
│   ├── index.js           # 主配置
│   ├── dev.js             # 开发配置
│   └── prod.js            # 生产配置
├── src/
│   ├── pages/             # 页面
│   │   └── index/
│   │       ├── index.tsx
│   │       ├── index.scss
│   │       └── index.config.ts
│   ├── components/        # 组件
│   ├── services/          # API 服务
│   ├── store/             # 状态管理
│   ├── utils/             # 工具函数
│   ├── app.tsx            # 应用入口
│   ├── app.scss           # 全局样式
│   └── app.config.ts      # 应用配置
├── project.config.json    # 小程序配置
├── package.json
└── tsconfig.json
```

## 配置

### 应用配置

```typescript
// src/app.config.ts
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/user/index',
    'pages/detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'Taro App',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999',
    selectedColor: '#1890ff',
    backgroundColor: '#fff',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/home.png',
        selectedIconPath: 'assets/home-active.png'
      },
      {
        pagePath: 'pages/user/index',
        text: '我的',
        iconPath: 'assets/user.png',
        selectedIconPath: 'assets/user-active.png'
      }
    ]
  },
  // 分包配置
  subPackages: [
    {
      root: 'pages/sub',
      pages: ['detail/index', 'list/index']
    }
  ],
  // 预加载
  preloadRule: {
    'pages/index/index': {
      network: 'all',
      packages: ['pages/sub']
    }
  }
})
```

### 页面配置

```typescript
// src/pages/index/index.config.ts
export default definePageConfig({
  navigationBarTitleText: '首页',
  enablePullDownRefresh: true,
  onReachBottomDistance: 50,
  usingComponents: {
    'custom-component': '../../components/custom/index'
  }
})
```

### 项目配置

```javascript
// config/index.js
const config = {
  projectName: 'myApp',
  date: '2024-1-1',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',

  plugins: [],

  defineConstants: {},

  copy: {
    patterns: [],
    options: {}
  },

  framework: 'react',

  compiler: {
    type: 'webpack5',
    prebundle: {
      enable: true
    }
  },

  // 小程序配置
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {}
      },
      url: {
        enable: true,
        config: {
          limit: 1024
        }
      },
      cssModules: {
        enable: true,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    webpackChain(chain) {
      // 自定义 webpack 配置
    }
  },

  // H5 配置
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {}
      },
      cssModules: {
        enable: false
      }
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
```

## React 开发

### 函数组件

```tsx
import { View, Text, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro, { useLoad, useReady, useDidShow, useDidHide } from '@tarojs/taro'
import './index.scss'

interface Props {
  title?: string
}

export default function Index({ title = '首页' }: Props) {
  const [count, setCount] = useState(0)
  const [list, setList] = useState<string[]>([])

  // 页面加载
  useLoad((options) => {
    console.log('页面参数:', options)
  })

  // 页面初次渲染完成
  useReady(() => {
    console.log('页面渲染完成')
  })

  // 页面显示
  useDidShow(() => {
    console.log('页面显示')
  })

  // 页面隐藏
  useDidHide(() => {
    console.log('页面隐藏')
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const res = await Taro.request({
      url: 'https://api.example.com/data'
    })
    setList(res.data)
  }

  const handleClick = () => {
    setCount(c => c + 1)
    Taro.showToast({
      title: '点击了',
      icon: 'success'
    })
  }

  const goToDetail = (id: number) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${id}`
    })
  }

  return (
    <View className="container">
      <Text className="title">{title}</Text>
      <Text className="count">Count: {count}</Text>
      <Button onClick={handleClick}>增加</Button>

      <View className="list">
        {list.map((item, index) => (
          <View
            key={index}
            className="item"
            onClick={() => goToDetail(index)}
          >
            {item}
          </View>
        ))}
      </View>
    </View>
  )
}
```

### 类组件

```tsx
import { Component } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'

interface State {
  count: number
}

export default class Index extends Component<{}, State> {
  state = {
    count: 0
  }

  componentDidMount() {
    console.log('组件挂载')
  }

  componentDidShow() {
    console.log('页面显示')
  }

  componentDidHide() {
    console.log('页面隐藏')
  }

  handleClick = () => {
    this.setState({ count: this.state.count + 1 })
  }

  render() {
    return (
      <View className="container">
        <Text>Count: {this.state.count}</Text>
        <Button onClick={this.handleClick}>增加</Button>
      </View>
    )
  }
}
```

## Vue 3 开发

### 页面组件

```vue
<template>
  <view class="container">
    <text class="title">{{ title }}</text>
    <text class="count">Count: {{ count }}</text>
    <button @tap="handleClick">增加</button>

    <view class="list">
      <view
        v-for="(item, index) in list"
        :key="index"
        class="item"
        @tap="goToDetail(index)"
      >
        {{ item }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro, { useLoad, useReady, useDidShow, useDidHide } from '@tarojs/taro'

interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '首页'
})

const count = ref(0)
const list = ref<string[]>([])

// 页面生命周期
useLoad((options) => {
  console.log('页面参数:', options)
  fetchData()
})

useReady(() => {
  console.log('页面渲染完成')
})

useDidShow(() => {
  console.log('页面显示')
})

useDidHide(() => {
  console.log('页面隐藏')
})

// 方法
const fetchData = async () => {
  const res = await Taro.request({
    url: 'https://api.example.com/data'
  })
  list.value = res.data
}

const handleClick = () => {
  count.value++
  Taro.showToast({
    title: '点击了',
    icon: 'success'
  })
}

const goToDetail = (id: number) => {
  Taro.navigateTo({
    url: `/pages/detail/index?id=${id}`
  })
}
</script>

<style lang="scss">
.container {
  padding: 20px;

  .title {
    font-size: 32px;
    font-weight: bold;
  }

  .count {
    margin: 20px 0;
  }

  .list {
    .item {
      padding: 20px;
      border-bottom: 1px solid #eee;
    }
  }
}
</style>
```

## 路由导航

### 基本导航

```typescript
import Taro from '@tarojs/taro'

// 保留当前页面，跳转到新页面
Taro.navigateTo({
  url: '/pages/detail/index?id=1&name=test'
})

// 关闭当前页面，跳转到新页面
Taro.redirectTo({
  url: '/pages/login/index'
})

// 关闭所有页面，打开新页面
Taro.reLaunch({
  url: '/pages/index/index'
})

// 跳转到 tabBar 页面
Taro.switchTab({
  url: '/pages/home/index'
})

// 返回上一页
Taro.navigateBack({
  delta: 1
})

// 获取页面参数
import { useRouter } from '@tarojs/taro'

function Page() {
  const router = useRouter()
  console.log(router.params.id)
}
```

### 页面间通信

```typescript
// 页面 A - 发送数据
Taro.navigateTo({
  url: '/pages/pageB/index',
  events: {
    // 接收 B 页面的数据
    fromPageB(data) {
      console.log('收到 B 页面数据:', data)
    }
  },
  success(res) {
    // 发送数据给 B 页面
    res.eventChannel.emit('fromPageA', { data: 'from A' })
  }
})

// 页面 B - 接收数据
import { useLoad, getCurrentInstance } from '@tarojs/taro'

function PageB() {
  useLoad(() => {
    const instance = getCurrentInstance()
    const eventChannel = instance.page?.getOpenerEventChannel()

    // 接收 A 页面数据
    eventChannel?.on('fromPageA', (data) => {
      console.log('收到 A 页面数据:', data)
    })

    // 发送数据给 A 页面
    eventChannel?.emit('fromPageB', { data: 'from B' })
  })
}
```

## API 调用

### 网络请求

```typescript
import Taro from '@tarojs/taro'

// 基本请求
const res = await Taro.request({
  url: 'https://api.example.com/data',
  method: 'GET',
  data: {
    page: 1,
    size: 10
  },
  header: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  }
})

console.log(res.data)

// 封装请求
export const request = <T>(options: Taro.request.Option): Promise<T> => {
  return new Promise((resolve, reject) => {
    Taro.request({
      ...options,
      success(res) {
        if (res.statusCode === 200) {
          resolve(res.data as T)
        } else {
          reject(res)
        }
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

// 使用
interface User {
  id: number
  name: string
}

const user = await request<User>({
  url: '/api/user',
  method: 'GET'
})
```

### 数据缓存

```typescript
// 同步
Taro.setStorageSync('token', 'xxx')
const token = Taro.getStorageSync('token')
Taro.removeStorageSync('token')
Taro.clearStorageSync()

// 异步
await Taro.setStorage({ key: 'user', data: { name: 'Tom' } })
const res = await Taro.getStorage({ key: 'user' })
console.log(res.data)
```

### 交互反馈

```typescript
// Toast
Taro.showToast({
  title: '成功',
  icon: 'success',
  duration: 2000
})

// Loading
Taro.showLoading({ title: '加载中...' })
// ... 操作
Taro.hideLoading()

// Modal
const res = await Taro.showModal({
  title: '提示',
  content: '确定删除吗？',
  confirmText: '确定',
  cancelText: '取消'
})

if (res.confirm) {
  console.log('用户点击确定')
}

// ActionSheet
const res = await Taro.showActionSheet({
  itemList: ['选项1', '选项2', '选项3']
})
console.log('选择了:', res.tapIndex)
```

## 多端适配

### 环境判断

```typescript
// 获取环境
const env = process.env.TARO_ENV
// 'weapp' | 'alipay' | 'h5' | 'rn' | 'swan' | 'tt' | 'qq' | 'jd'

// 条件判断
if (process.env.TARO_ENV === 'weapp') {
  // 微信小程序专属代码
}

if (process.env.TARO_ENV === 'h5') {
  // H5 专属代码
}
```

### 条件编译

```tsx
// React
function Component() {
  return (
    <View>
      {process.env.TARO_ENV === 'weapp' && (
        <Text>微信小程序专属</Text>
      )}
      {process.env.TARO_ENV === 'h5' && (
        <Text>H5 专属</Text>
      )}
    </View>
  )
}

// 文件级别
// index.weapp.tsx  - 微信小程序
// index.h5.tsx     - H5
// index.tsx        - 默认

// 样式
// index.weapp.scss
// index.h5.scss
// index.scss
```

### 统一接口

```typescript
// 创建统一接口
// utils/platform.ts
export const getPlatformInfo = () => {
  const env = process.env.TARO_ENV

  if (env === 'weapp') {
    return Taro.getSystemInfoSync()
  }

  if (env === 'h5') {
    return {
      platform: 'web',
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    }
  }

  return null
}

// 使用
const info = getPlatformInfo()
```

## 状态管理

### 使用 Zustand

```typescript
// store/index.ts
import { create } from 'zustand'

interface UserState {
  user: { name: string; age: number } | null
  setUser: (user: { name: string; age: number }) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null })
}))

// 使用
import { useUserStore } from '@/store'

function Profile() {
  const { user, setUser } = useUserStore()

  return (
    <View>
      <Text>{user?.name}</Text>
      <Button onClick={() => setUser({ name: 'Tom', age: 25 })}>
        设置用户
      </Button>
    </View>
  )
}
```

### 使用 Redux Toolkit

```typescript
// store/index.ts
import { configureStore, createSlice } from '@reduxjs/toolkit'

const userSlice = createSlice({
  name: 'user',
  initialState: { user: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
    },
    clearUser: (state) => {
      state.user = null
    }
  }
})

export const { setUser, clearUser } = userSlice.actions

export const store = configureStore({
  reducer: {
    user: userSlice.reducer
  }
})

// app.tsx
import { Provider } from 'react-redux'
import { store } from './store'

function App({ children }) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}

// 使用
import { useSelector, useDispatch } from 'react-redux'
import { setUser } from '@/store'

function Profile() {
  const user = useSelector(state => state.user.user)
  const dispatch = useDispatch()

  return (
    <View>
      <Text>{user?.name}</Text>
      <Button onClick={() => dispatch(setUser({ name: 'Tom' }))}>
        设置用户
      </Button>
    </View>
  )
}
```

## 插件系统

### 使用插件

```javascript
// config/index.js
const config = {
  plugins: [
    // 使用 Taro 插件
    '@tarojs/plugin-html',
    '@tarojs/plugin-http',

    // 带配置的插件
    ['@tarojs/plugin-mock', {
      host: 'localhost',
      port: 9527
    }]
  ]
}
```

### 常用插件

```bash
# HTML 标签支持
npm install @tarojs/plugin-html

# 请求拦截
npm install @tarojs/plugin-http

# Mock 数据
npm install @tarojs/plugin-mock

# 图片压缩
npm install @tarojs/plugin-imagemin
```

## 性能优化

### 虚拟列表

```tsx
import { VirtualList } from '@tarojs/components'

function LongList() {
  const [list, setList] = useState<Item[]>([])

  const renderItem = ({ item, index }) => (
    <View className="item" key={index}>
      {item.name}
    </View>
  )

  return (
    <VirtualList
      height={500}
      itemHeight={50}
      itemCount={list.length}
      renderItem={renderItem}
    />
  )
}
```

### 预加载

```typescript
// app.config.ts
export default defineAppConfig({
  preloadRule: {
    'pages/index/index': {
      network: 'all',
      packages: ['pages/sub']  // 预加载分包
    }
  }
})

// 代码预加载
Taro.preloadPage({
  url: '/pages/detail/index'
})
```

### 懒加载

```tsx
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

