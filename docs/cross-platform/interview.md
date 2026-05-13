# 跨端开发面试题精选

> 汇总 uni-app、Taro、小程序原理等高频面试题。

## 跨端基础

### 1. 跨端开发的主流方案有哪些？各有什么优缺点？

| 方案 | 代表框架 | 原理 | 优点 | 缺点 |
|------|---------|------|------|------|
| **编译时转换** | uni-app、Taro | 将代码编译为各平台原生代码 | 性能接近原生 | 兼容性处理复杂 |
| **运行时适配** | React Native、Weex | JS 驱动原生组件渲染 | 接近原生体验 | 性能有损耗 |
| **WebView 渲染** | Ionic、Cordova | H5 + WebView | 开发成本低 | 性能较差 |
| **自绘引擎** | Flutter | 自己绘制 UI | 性能最好，一致性高 | 包体大，学习 Dart |

---

### 2. uni-app 和 Taro 如何选择？

| 特性 | uni-app | Taro |
|------|---------|------|
| 语法 | Vue 语法 | React/Vue 语法 |
| 生态 | DCloud 插件市场，组件丰富 | 社区活跃，npm 生态 |
| 支持平台 | 微信/支付宝/百度/抖音/H5/App | 微信/支付宝/百度/H5/RN |
| 性能 | 较好 | 较好 |
| 适合团队 | Vue 技术栈 | React 或 Vue 技术栈 |

**选型建议**：Vue 技术栈 → uni-app；React 技术栈 → Taro；需要 App 端 → uni-app（内置 App 支持更完善）

---

## 小程序原理

### 3. 小程序的双线程架构是什么？

小程序采用**渲染层（WebView）+ 逻辑层（JSCore）**双线程架构：

```
渲染层（WebView）：负责页面渲染，运行 WXML/WXSS
逻辑层（JSCore）：负责业务逻辑，运行 JS 代码
         ↕ 通过 Native 桥通信（异步）
```

**为什么这样设计？**
- 安全性：逻辑层无法直接操作 DOM，防止恶意代码
- 性能：渲染和逻辑分离，互不阻塞

**缺点**：通信是异步的，频繁的 setData 会有性能问题

---

### 4. 小程序的生命周期有哪些？

**应用生命周期（App）：**
- `onLaunch`：小程序初始化（只触发一次）
- `onShow`：小程序启动或从后台进入前台
- `onHide`：小程序进入后台

**页面生命周期（Page）：**
- `onLoad`：页面加载（可获取路由参数）
- `onShow`：页面显示
- `onReady`：页面初次渲染完成
- `onHide`：页面隐藏
- `onUnload`：页面卸载

**组件生命周期：**
- `created` → `attached` → `ready` → `detached`

---

### 5. 小程序 setData 的注意事项？

```javascript
// ❌ 频繁 setData（每次都触发渲染层更新）
for (let i = 0; i < 100; i++) {
    this.setData({ count: i });
}

// ✅ 合并 setData
this.setData({ count: 99 });

// ❌ 传递大量数据
this.setData({ largeList: [...10000items] });

// ✅ 只传变化的数据（使用路径语法）
this.setData({ 'list[0].name': 'new name' });

// ❌ 后台页面 setData（浪费资源）
// ✅ 在 onShow 中更新数据，onHide 时停止更新
```

**性能原则**：
1. 减少 setData 调用频率（合并更新）
2. 减少 setData 数据量（只传变化部分）
3. 避免后台页面 setData
4. 长列表用分页或虚拟列表

---

### 6. 小程序如何实现页面间通信？

```javascript
// 1. URL 参数（简单数据）
wx.navigateTo({ url: '/pages/detail?id=123' });
// 接收：onLoad(options) { options.id }

// 2. 全局数据（App.globalData）
getApp().globalData.userInfo = { name: '张三' };

// 3. 事件总线（EventBus）
// 4. 本地存储（wx.setStorageSync）
// 5. 页面栈通信（getCurrentPages）
const pages = getCurrentPages();
const prevPage = pages[pages.length - 2];
prevPage.setData({ result: 'success' });
```

---

## uni-app

### 7. uni-app 的条件编译是什么？

条件编译允许针对不同平台编写不同代码：

```javascript
// #ifdef MP-WEIXIN
// 只在微信小程序中编译
wx.login({ success: res => {} });
// #endif

// #ifdef H5
// 只在 H5 中编译
window.location.href = '/login';
// #endif

// #ifndef APP-PLUS
// 除 App 外的平台
console.log('非 App 平台');
// #endif
```

**常用平台标识**：`MP-WEIXIN`、`MP-ALIPAY`、`H5`、`APP-PLUS`、`MP`（所有小程序）

---

### 8. uni-app 的性能优化有哪些？

1. **减少 setData 频率**：合并数据更新，避免频繁触发
2. **长列表优化**：使用 `<recycle-list>`（微信）或虚拟列表
3. **图片优化**：懒加载（`lazy-load`）、WebP 格式、CDN
4. **分包加载**：将非首页内容放入分包，减少主包体积
5. **预加载**：`preloadPage` 提前加载下一页
6. **避免频繁获取节点信息**：缓存 `createSelectorQuery` 结果

---

## Taro

### 9. Taro 3.x 的运行时原理是什么？

Taro 3.x 采用**运行时适配**方案：

```
React/Vue 代码
    ↓ Taro 运行时
模拟 DOM/BOM 环境（taro-runtime）
    ↓
调用各平台 API（小程序 setData、H5 DOM 操作）
```

**与 Taro 1/2 的区别**：
- Taro 1/2：编译时转换（将 React 代码编译为小程序代码）
- Taro 3：运行时适配（在小程序环境中运行 React/Vue）

**优势**：支持 React Hooks、Vue 3 Composition API，更接近原生开发体验

---

### 10. 小程序分包加载如何配置？

```json
// app.json
{
  "pages": ["pages/index/index"],
  "subPackages": [
    {
      "root": "packageA",
      "pages": ["pages/detail/index", "pages/list/index"]
    },
    {
      "root": "packageB",
      "pages": ["pages/order/index"],
      "independent": true  // 独立分包，可独立运行
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["packageA"]  // 进入首页时预加载 packageA
    }
  }
}
```

**主包限制**：2MB；单个分包限制：2MB；总包限制：20MB（微信）
