# 小程序原理

小程序是一种运行在宿主应用（如微信、支付宝）中的轻量级应用，具有独特的双线程架构。

## 双线程架构

### 架构概述

```
┌─────────────────────────────────────────────┐
│                   小程序                      │
├──────────────────┬──────────────────────────┤
│    渲染层         │         逻辑层            │
│   (WebView)      │       (JSCore)           │
│                  │                          │
│  WXML + WXSS     │     JavaScript           │
│      ↓           │          ↓               │
│    渲染          │       执行逻辑            │
└──────────────────┴──────────────────────────┘
          ↑                    ↑
          └────────────────────┘
                  Native
               (微信客户端)
```

### 为什么采用双线程

1. **安全性**：JS 运行在独立沙箱，无法操作 DOM，避免 XSS 攻击
2. **性能**：渲染和逻辑分离，互不阻塞
3. **管控**：便于平台审核和管控代码行为
4. **体验**：避免 JS 阻塞页面渲染

### 渲染层

- 使用 WebView 渲染页面
- 每个页面使用单独的 WebView
- 负责 WXML 解析和 WXSS 样式渲染
- 不执行任何 JavaScript 代码

### 逻辑层

- 使用 JSCore（iOS）或 V8（Android）
- 所有页面共享一个 JS 运行环境
- 执行业务逻辑和数据处理
- 无法直接操作 DOM

### 通信机制

```
渲染层(WebView)  ←→  Native  ←→  逻辑层(JSCore)

1. 用户操作 → 渲染层 → Native → 逻辑层
2. 数据更新 → 逻辑层 → Native → 渲染层
```

```javascript
// 数据传递示例
Page({
  data: {
    message: 'Hello'
  },
  handleTap() {
    // setData 触发渲染层更新
    // 数据通过 Native 层传递给 WebView
    this.setData({
      message: 'World'
    })
  }
})
```

## 生命周期

### 应用生命周期

```javascript
// app.js
App({
  onLaunch(options) {
    // 小程序初始化（全局只触发一次）
    console.log('启动参数:', options)
  },

  onShow(options) {
    // 小程序启动或从后台进入前台
    console.log('场景值:', options.scene)
  },

  onHide() {
    // 小程序从前台进入后台
  },

  onError(msg) {
    // 脚本错误或 API 调用失败
    console.error(msg)
  },

  onPageNotFound(res) {
    // 页面不存在
    wx.redirectTo({
      url: '/pages/404/404'
    })
  },

  onUnhandledRejection(res) {
    // 未处理的 Promise 拒绝
    console.error(res.reason)
  },

  onThemeChange(res) {
    // 系统主题变化
    console.log(res.theme)  // 'dark' | 'light'
  }
})
```

### 页面生命周期

```javascript
Page({
  data: {
    list: []
  },

  onLoad(options) {
    // 页面加载（只触发一次）
    // options 包含页面参数
    console.log('页面参数:', options)
    this.fetchData()
  },

  onShow() {
    // 页面显示
    // 每次页面显示都会触发
  },

  onReady() {
    // 页面初次渲染完成（只触发一次）
    // 可以获取页面节点信息
  },

  onHide() {
    // 页面隐藏
    // 当 navigateTo 或 tab 切换时触发
  },

  onUnload() {
    // 页面卸载
    // 当 redirectTo 或 navigateBack 时触发
  },

  onPullDownRefresh() {
    // 下拉刷新
    this.fetchData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    // 上拉触底
    this.loadMore()
  },

  onPageScroll(e) {
    // 页面滚动
    console.log('滚动位置:', e.scrollTop)
  },

  onShareAppMessage() {
    // 用户点击分享
    return {
      title: '分享标题',
      path: '/pages/index/index'
    }
  },

  onShareTimeline() {
    // 分享到朋友圈
    return {
      title: '分享标题'
    }
  },

  onAddToFavorites() {
    // 收藏
    return {
      title: '收藏标题'
    }
  },

  onResize(res) {
    // 屏幕旋转
    console.log(res.size)
  },

  onTabItemTap(item) {
    // tab 点击
    console.log(item.index, item.pagePath, item.text)
  }
})
```

### 组件生命周期

```javascript
Component({
  // 组件属性
  properties: {
    title: {
      type: String,
      value: '',
      observer(newVal, oldVal) {
        // 属性变化时触发（不推荐使用）
      }
    }
  },

  // 组件数据
  data: {
    count: 0
  },

  // 生命周期
  lifetimes: {
    created() {
      // 组件实例创建
      // 此时 data 已���始化，但不能调用 setData
    },

    attached() {
      // 组件进入页面节点树
      // 可以调用 setData
    },

    ready() {
      // 组件布局完成
      // 可以获取节点信息
    },

    moved() {
      // 组件在节点树中移动
    },

    detached() {
      // 组件从页面节点树移除
      // 清理工作
    },

    error(err) {
      // 组件方法抛出错误
    }
  },

  // 页面生命周期（组件所在页面）
  pageLifetimes: {
    show() {
      // 页面显示
    },
    hide() {
      // 页面隐藏
    },
    resize(size) {
      // 页面尺寸变化
    }
  },

  // 监听器
  observers: {
    'title': function(newVal) {
      // 推荐使用 observers 代替 observer
    },
    'count, title': function(count, title) {
      // 监听多个属性
    },
    '**': function() {
      // 监听所有属性变化
    }
  },

  // 方法
  methods: {
    handleTap() {
      this.setData({ count: this.data.count + 1 })
      this.triggerEvent('change', { count: this.data.count })
    }
  }
})
```

### 生命周期执行顺序

```
App.onLaunch
    ↓
App.onShow
    ↓
Component.created (所有组件)
    ↓
Component.attached (所有组件)
    ↓
Page.onLoad
    ↓
Page.onShow
    ↓
Component.ready (所有组件)
    ↓
Page.onReady
```

## setData 原理

### 工作流程

```
setData({ key: value })
        ↓
逻辑层序列化数据 (JSON.stringify)
        ↓
通过 Native 传递
        ↓
渲染层反序列化 (JSON.parse)
        ↓
Diff 对比虚拟 DOM
        ↓
更新真实 DOM
```

### 性能优化

```javascript
// ❌ 不好：频繁 setData
for (let i = 0; i < 100; i++) {
  this.setData({ count: i })
}

// ✅ 好：合并更新
this.setData({ count: 99 })

// ❌ 不好：传递大量数据
this.setData({
  list: hugeList  // 包含大量数据
})

// ✅ 好：只更新需要的数据
this.setData({
  'list[0].name': 'new name',
  'list[1].status': true
})

// ❌ 不好：后台页面更新
onHide() {
  // 页面隐藏时仍在 setData
  this.timer = setInterval(() => {
    this.setData({ time: Date.now() })
  }, 1000)
}

// ✅ 好：控制更新时机
onHide() {
  clearInterval(this.timer)
}
onShow() {
  this.timer = setInterval(() => {
    this.setData({ time: Date.now() })
  }, 1000)
}
```

### 数据路径更新

```javascript
// 更新对象属性
this.setData({
  'user.name': 'Tom',
  'user.age': 25
})

// 更新数组元素
this.setData({
  'list[0]': { id: 1, name: 'new' },
  'list[1].name': 'updated'
})

// 动态路径
const index = 0
const key = 'name'
this.setData({
  [`list[${index}].${key}`]: 'value'
})

// 添加数组元素
const newItem = { id: 4, name: 'item4' }
this.setData({
  list: [...this.data.list, newItem]
})

// 或使用 concat
this.setData({
  [`list[${this.data.list.length}]`]: newItem
})
```

## 事件系统

### 事件类型

```xml
<!-- 冒泡事件使用 bind -->
<view bindtap="handleTap">点击</view>

<!-- 阻止冒泡使用 catch -->
<view catchtap="handleTap">点击不冒泡</view>

<!-- 互斥事件使用 mut-bind -->
<view mut-bind:tap="handleTap">互斥点击</view>

<!-- 捕获阶段 capture-bind -->
<view capture-bind:tap="handleTap">捕获</view>

<!-- 捕获阶段阻止 capture-catch -->
<view capture-catch:tap="handleTap">捕获并阻止</view>
```

### 事件对象

```javascript
Page({
  handleTap(e) {
    // 事件类型
    console.log(e.type)  // 'tap'

    // 触发组件的 id
    console.log(e.currentTarget.id)

    // 触发组件的 dataset
    console.log(e.currentTarget.dataset)

    // 事件源组件
    console.log(e.target.id)

    // 触摸点信息
    console.log(e.touches)
    console.log(e.changedTouches)

    // 时间戳
    console.log(e.timeStamp)

    // 自定义数据
    console.log(e.detail)

    // 标记
    console.log(e.mark)
  }
})
```

### 自定义组件事件

```javascript
// 子组件
Component({
  methods: {
    handleClick() {
      // 触发自定义事件
      this.triggerEvent('myevent', {
        data: 'some data'
      }, {
        bubbles: true,  // 是否冒泡
        composed: true  // 是否穿越组件边界
      })
    }
  }
})

// 父组件
<child bind:myevent="handleChildEvent" />

Page({
  handleChildEvent(e) {
    console.log(e.detail.data)  // 'some data'
  }
})
```

## 页面间通信

### URL 参数

```javascript
// 页面 A
wx.navigateTo({
  url: '/pages/detail/detail?id=123&name=test'
})

// 页面 B
Page({
  onLoad(options) {
    console.log(options.id)    // '123'
    console.log(options.name)  // 'test'
  }
})
```

### EventChannel

```javascript
// 页面 A
wx.navigateTo({
  url: '/pages/pageB/pageB',
  events: {
    // 监听 B 页面发送的事件
    acceptDataFromPageB(data) {
      console.log(data)
    }
  },
  success(res) {
    // 向 B 页面发送数据
    res.eventChannel.emit('acceptDataFromPageA', {
      data: 'from A'
    })
  }
})

// 页面 B
Page({
  onLoad() {
    const eventChannel = this.getOpenerEventChannel()

    // 监听 A 页面发送的事件
    eventChannel.on('acceptDataFromPageA', (data) => {
      console.log(data)
    })

    // 向 A 页面发送数据
    eventChannel.emit('acceptDataFromPageB', {
      data: 'from B'
    })
  }
})
```

### 全局数据

```javascript
// app.js
App({
  globalData: {
    userInfo: null,
    token: ''
  }
})

// 其他页面
const app = getApp()
console.log(app.globalData.userInfo)
app.globalData.token = 'xxx'
```

### 本地存储

```javascript
// 同步
wx.setStorageSync('key', 'value')
const value = wx.getStorageSync('key')
wx.removeStorageSync('key')
wx.clearStorageSync()

// 异步
wx.setStorage({
  key: 'key',
  data: 'value',
  success() {}
})

wx.getStorage({
  key: 'key',
  success(res) {
    console.log(res.data)
  }
})
```

### 页面栈通信

```javascript
// 获取页面栈
const pages = getCurrentPages()
const prevPage = pages[pages.length - 2]

// 调用上一页面的方法
prevPage.updateData({ newData: 'xxx' })

// 或直接修改数据
prevPage.setData({ key: 'value' })
```

## WXS

WXS（WeiXin Script）是小程序的脚本语言，运行在渲染层。

### 基本语法

```xml
<!-- 内联 WXS -->
<wxs module="utils">
  var formatPrice = function(price) {
    return '¥' + (price / 100).toFixed(2)
  }

  module.exports = {
    formatPrice: formatPrice
  }
</wxs>

<text>{{ utils.formatPrice(price) }}</text>

<!-- 外联 WXS -->
<wxs src="./utils.wxs" module="utils" />
```

```javascript
// utils.wxs
var formatDate = function(timestamp) {
  var date = getDate(timestamp)
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  return year + '-' + month + '-' + day
}

module.exports = {
  formatDate: formatDate
}
```

### 响应 touchmove

```xml
<wxs module="bindingx">
  var bindTouchMove = function(event, instance) {
    var touch = event.touches[0]
    instance.setStyle({
      transform: 'translateX(' + touch.pageX + 'px)'
    })
    return false  // 阻止冒泡
  }

  module.exports = {
    bindTouchMove: bindTouchMove
  }
</wxs>

<view
  change:touchmove="{{ bindingx.bindTouchMove }}"
  style="width: 100px; height: 100px; background: red;"
/>
```

## 性能优化

### setData 优化

```javascript
// 1. 合并 setData
// ❌
this.setData({ a: 1 })
this.setData({ b: 2 })

// ✅
this.setData({ a: 1, b: 2 })

// 2. 路径更新
// ❌
const list = this.data.list
list[0].name = 'new name'
this.setData({ list })

// ✅
this.setData({ 'list[0].name': 'new name' })

// 3. 控制数据量
// ❌
this.setData({
  list: this.data.list.concat(newList)  // 传递整个列表
})

// ✅ 只传递新增数据
newList.forEach((item, index) => {
  this.setData({
    [`list[${this.data.list.length + index}]`]: item
  })
})
```

### 长列表优化

```javascript
// 使用虚拟列表或分批渲染
Component({
  data: {
    displayList: [],
    fullList: []
  },

  methods: {
    loadList(list) {
      this.data.fullList = list
      this.renderBatch(0)
    },

    renderBatch(startIndex) {
      const batchSize = 20
      const endIndex = Math.min(
        startIndex + batchSize,
        this.data.fullList.length
      )

      const batch = this.data.fullList.slice(startIndex, endIndex)

      this.setData({
        displayList: this.data.displayList.concat(batch)
      }, () => {
        if (endIndex < this.data.fullList.length) {
          wx.nextTick(() => {
            this.renderBatch(endIndex)
          })
        }
      })
    }
  }
})
```

### 预加载

```javascript
// 预加载下一页数据
Page({
  onLoad() {
    // 加载当前页数据
    this.loadCurrentPage()

    // 预加载下一页
    this.preloadNextPage()
  },

  preloadNextPage() {
    // 使用 wx.request 但不更新页面
    wx.request({
      url: '/api/next-page',
      success: (res) => {
        this.nextPageData = res.data
      }
    })
  },

  goToNextPage() {
    wx.navigateTo({
      url: '/pages/next/next',
      success: (res) => {
        res.eventChannel.emit('preloadData', this.nextPageData)
      }
    })
  }
})
```

## 常见面试题

::: details 1. 小程序为什么采用双线程架构？
- **安全**：JS 无法操作 DOM，避免安全风险
- **性能**：渲染和逻辑分离，互不阻塞
- **管控**：便于平台审核代码
- **体验**：避免 JS 阻塞渲染
:::

::: details 2. setData 的性能问题和优化方案？
**问题：**
- 数据需要序列化传输
- 传输大量数据耗时
- 频繁调用导致性能下降

**优化：**
- 合并多次 setData
- 使用路径更新减少数据量
- 避免后台页面 setData
- 控制单次传输数据大小
:::

::: details 3. 小程序和 H5 的区别？
| 特性 | 小程序 | H5 |
|------|--------|-----|
| 运行环境 | 微信客户端 | 浏览器 |
| 渲染 | 双线程 | 单线程 |
| DOM 操作 | 不支持 | 支持 |
| API | 微信 API | Web API |
| 审核 | 需要 | 不需要 |
| 入口 | 扫码/搜索 | URL |
:::

::: details 4. 如何优化小程序的首屏渲染？
- 减少首屏数据量
- 使用骨架屏
- 数据预拉取
- 分包加载
- 合理使用缓存
- 图片懒加载
:::

::: details 5. WXS 的作用是什么？
- 运行在渲染层，减少通信开销
- 适合处理频繁的视图更新（如手势响应）
- 用于数据格式化等轻量计算
- 提高渲染性能
:::
