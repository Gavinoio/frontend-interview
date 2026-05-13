# 跨端开发方案对比

跨端开发是指使用一套代码构建多个平台的应用，包括小程序、H5、App 等。

## 主流方案概览

| 框架 | 技术栈 | 支持平台 | 出品方 | 特点 |
|------|--------|----------|--------|------|
| uni-app | Vue | 小程序/H5/App | DCloud | 生态丰富，上手简单 |
| Taro | React/Vue | 小程序/H5/RN | 京东 | 语法现代，插件系统强大 |
| React Native | React | iOS/Android | Meta | 原生体验，成熟稳定 |
| Flutter | Dart | iOS/Android/Web | Google | 高性能，自绘引擎 |
| Weex | Vue | iOS/Android | 阿里 | 接近原生，维护减少 |

## uni-app

### 简介

uni-app 是 DCloud 推出的跨端框架，基于 Vue.js，支持编译到多个平台。

### 支持平台

- 微信/支付宝/百度/字节/QQ/快手/京东小程序
- H5
- App（iOS/Android）
- 快应用

### 项目结构

```
├── pages/                # 页面
│   ├── index/
│   │   └── index.vue
│   └── user/
│       └── user.vue
├── components/           # 组件
├── static/               # 静态资源
├── store/                # Vuex
├── App.vue               # 应用入口
├── main.js               # 入口文件
├── manifest.json         # 应用配置
├── pages.json            # 页面配置
└── uni.scss              # 全局样式变量
```

### 基本示例

```vue
<template>
  <view class="container">
    <text class="title">{{ message }}</text>
    <button @click="handleClick">点击</button>
    <view v-for="item in list" :key="item.id">
      {{ item.name }}
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello uni-app',
      list: []
    }
  },
  onLoad(options) {
    // 页面加载
    console.log('页面参数:', options)
  },
  onShow() {
    // 页面显示
  },
  methods: {
    handleClick() {
      uni.showToast({
        title: '点击了',
        icon: 'success'
      })
    }
  }
}
</script>

<style>
.container {
  padding: 20rpx;
}
.title {
  font-size: 32rpx;
}
</style>
```

### 条件编译

```vue
<template>
  <!-- #ifdef MP-WEIXIN -->
  <text>微信小程序专属</text>
  <!-- #endif -->

  <!-- #ifdef H5 -->
  <text>H5 专属</text>
  <!-- #endif -->

  <!-- #ifndef APP-PLUS -->
  <text>非 App 平台</text>
  <!-- #endif -->
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
.special {
  color: green;
}
/* #endif */
</style>
```

### API 调用

```javascript
// 路由
uni.navigateTo({ url: '/pages/detail/detail?id=1' })
uni.redirectTo({ url: '/pages/login/login' })
uni.switchTab({ url: '/pages/home/home' })
uni.navigateBack({ delta: 1 })

// 网络请求
uni.request({
  url: 'https://api.example.com/data',
  method: 'GET',
  data: { page: 1 },
  success: (res) => {
    console.log(res.data)
  }
})

// 存储
uni.setStorageSync('token', 'xxx')
const token = uni.getStorageSync('token')

// 获取系统信息
const systemInfo = uni.getSystemInfoSync()
console.log(systemInfo.platform)
```

## Taro

### 简介

Taro 是京东推出的多端统一开发框架，支持 React、Vue 等主流框架。

### 支持平台

- 微信/支付宝/百度/字节/QQ/京东小程序
- H5
- React Native
- 快应用

### 项目结构

```
├── config/               # 配置
│   ├── index.js
│   ├── dev.js
│   └── prod.js
├── src/
│   ├── pages/            # 页面
│   ├── components/       # 组件
│   ├── services/         # API 服务
│   ├── store/            # 状态管理
│   ├── app.config.ts     # 应用配置
│   ├── app.tsx           # 应用入口
│   └── app.scss          # 全局样式
├── project.config.json   # 小程序配置
└── package.json
```

### 基本示例（React）

```tsx
import { View, Text, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro, { useLoad, useReady } from '@tarojs/taro'
import './index.scss'

export default function Index() {
  const [count, setCount] = useState(0)

  useLoad((options) => {
    console.log('页面加载', options)
  })

  useReady(() => {
    console.log('页面初次渲染完成')
  })

  const handleClick = () => {
    setCount(c => c + 1)
    Taro.showToast({
      title: '点击了',
      icon: 'success'
    })
  }

  return (
    <View className="container">
      <Text className="title">Count: {count}</Text>
      <Button onClick={handleClick}>增加</Button>
    </View>
  )
}
```

### 基本示例（Vue 3）

```vue
<template>
  <view class="container">
    <text class="title">Count: {{ count }}</text>
    <button @tap="handleClick">增加</button>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import Taro, { useLoad, useReady } from '@tarojs/taro'

const count = ref(0)

useLoad((options) => {
  console.log('页面加载', options)
})

useReady(() => {
  console.log('页面初次渲染完成')
})

const handleClick = () => {
  count.value++
  Taro.showToast({
    title: '点击了',
    icon: 'success'
  })
}
</script>
```

### 多端适配

```tsx
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'

function Component() {
  // 获取当前环境
  const env = Taro.getEnv()

  // 环境判断
  if (process.env.TARO_ENV === 'weapp') {
    // 微信小程序
  }

  if (process.env.TARO_ENV === 'h5') {
    // H5
  }

  return (
    <View>
      {process.env.TARO_ENV === 'weapp' && <View>微信专属</View>}
      {process.env.TARO_ENV === 'h5' && <View>H5 专属</View>}
    </View>
  )
}
```

## React Native

### 简介

React Native 是 Meta（原 Facebook）推出的移动端跨平台框架，使用 JavaScript 和 React 构建原生应用。

### 架构

```
JavaScript 代码
      ↓
  JavaScript 引擎 (Hermes/JSC)
      ↓
  Bridge / JSI (新架构)
      ↓
  Native Modules
      ↓
  iOS / Android 原生组件
```

### 新架构（Fabric + TurboModules）

- **Fabric**：新的渲染系统，支持同步渲染
- **TurboModules**：新的原生模块系统，按需加载
- **JSI**：JavaScript Interface，替代 Bridge

### 基本示例

```tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList
} from 'react-native'

export default function App() {
  const [count, setCount] = useState(0)
  const [items, setItems] = useState([
    { id: '1', title: 'Item 1' },
    { id: '2', title: 'Item 2' }
  ])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Count: {count}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setCount(c => c + 1)}
      >
        <Text style={styles.buttonText}>增加</Text>
      </TouchableOpacity>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.title}</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 20
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center'
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  }
})
```

### 平台特定代码

```tsx
// Button.ios.tsx
export default function Button() {
  return <IOSButton />
}

// Button.android.tsx
export default function Button() {
  return <AndroidButton />
}

// 使用
import Button from './Button'  // 自动选择正确的文件

// Platform API
import { Platform } from 'react-native'

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    ...Platform.select({
      ios: { shadowColor: 'black' },
      android: { elevation: 4 }
    })
  }
})
```

## Flutter

### 简介

Flutter 是 Google 推出的跨平台 UI 框架，使用 Dart 语言，采用自绘引擎 Skia。

### 架构

```
Dart 代码 (Widget)
      ↓
  Flutter Framework
      ↓
  Skia 渲染引擎
      ↓
  平台 Canvas
```

### 基本示例

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      home: HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _count = 0;

  void _increment() {
    setState(() {
      _count++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Home')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Count: $_count', style: TextStyle(fontSize: 24)),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: _increment,
              child: Text('增加'),
            ),
          ],
        ),
      ),
    );
  }
}
```

## 方案对比

### 性能对比

| 框架 | 渲染方式 | 性能 | 包体积 |
|------|----------|------|--------|
| uni-app | WebView/原生 | 中等 | 小 |
| Taro | WebView/原生 | 中等 | 小 |
| React Native | 原生组件 | 较好 | 中等 |
| Flutter | 自绘引擎 | 最好 | 较大 |

### 开发体验

| 框架 | 热重载 | 调试工具 | 生态 |
|------|--------|----------|------|
| uni-app | 支持 | HBuilder | 丰富 |
| Taro | 支持 | 各平台工具 | 丰富 |
| React Native | 支持 | Flipper | 丰富 |
| Flutter | 支持 | DevTools | 增长中 |

### 适用场景

| 场景 | 推荐方案 |
|------|----------|
| 小程序为主 | uni-app / Taro |
| React 技术栈 | Taro / React Native |
| Vue 技术栈 | uni-app / Taro |
| 高性能要求 | Flutter / React Native |
| 快速迭代 | uni-app |
| 原生体验 | React Native / Flutter |

## 选型建议

### 选择 uni-app

- 团队熟悉 Vue
- 需要快速上线
- 以小程序为主要平台
- 需要丰富的插件市场

### 选择 Taro

- 团队熟悉 React
- 需要灵活的架构
- 需要强大的插件系统
- 希望代码更现代化

### 选择 React Native

- 团队熟悉 React
- 主要做 App
- 需要接近原生的体验
- 需要成熟的社区支持

### 选择 Flutter

- 追求最佳性能
- UI 一致性要求高
- 愿意学习 Dart
- 需要自定义 UI

## 常见面试题

::: details 1. 跨端开发的原理是什么？
不同框架有不同实现：
- **编译时转换**：uni-app/Taro 将代码编译为各平台代码
- **运行时桥接**：React Native 通过 Bridge 调用原生组件
- **自绘引擎**：Flutter 使用 Skia 自己绘制 UI
:::

::: details 2. uni-app 和 Taro 如何实现多端？
通过编译时转换：
- 将框架代码转换为目标平台代码
- 使用条件编译处理平台差异
- 封装统一 API 适配各平台
:::

::: details 3. React Native 新架构有什么改进？
- **JSI**：替代 Bridge，支持同步调用
- **Fabric**：新渲染系统，性能更好
- **TurboModules**：按需加载原生模块
- **Codegen**：类型安全的原生接口
:::

::: details 4. 如何选择跨端方案？
考虑因素：
- 目标平台：小程序为主还是 App 为主
- 团队技术栈：Vue 还是 React
- 性能要求：普通应用还是高性能应用
- 开发效率：快速迭代还是长期维护
:::
