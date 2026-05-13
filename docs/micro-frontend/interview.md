# 微前端面试题精选

> 汇总微前端架构、qiankun、wujie、Micro App、Module Federation 等高频面试题。

## 微前端基础

### 1. 什么是微前端？解决了什么问题？

**定义**：将单体前端应用拆分为多个独立的、可独立开发和部署的小型前端应用，通过一个主应用（基座）将它们组合在一起。

**解决的问题：**
- 巨石应用代码耦合严重，构建部署慢
- 多团队协作困难，技术栈被锁定
- 历史遗留系统难以升级改造
- 不同业务模块无法独立发布

**核心优势：**
- 技术栈无关（React、Vue、Angular 可共存）
- 独立开发、独立部署
- 增量升级（逐步替换旧系统）
- 故障隔离（子应用崩溃不影响主应用）

---

### 2. 微前端的核心技术挑战是什么？

1. **JS 隔离**：子应用的全局变量、事件监听不能污染主应用
2. **CSS 隔离**：子应用样式不能影响主应用或其他子应用
3. **路由管理**：主应用和子应用的路由协同
4. **应用通信**：主子应用、子应用之间的数据传递
5. **资源加载**：子应用的静态资源路径处理

---

### 3. 主流微前端框架对比？如何选型？

| 框架 | 隔离方案 | 接入成本 | 隔离强度 | 适用场景 |
|------|---------|---------|---------|---------|
| **qiankun** | Proxy 沙箱 + Scoped CSS | 中 | 中 | 成熟稳定，生态好 |
| **wujie** | iframe + WebComponent | 低 | 高（天然隔离） | 隔离要求严格 |
| **Micro App** | WebComponent + Proxy | 低 | 中 | 接入简单，零依赖 |
| **Module Federation** | 无沙箱 | 低 | 无 | 模块共享，非完整微前端 |

**选型建议：**
- 新项目、隔离要求高 → **wujie**
- 成熟团队、需要完整生态 → **qiankun**
- 快速接入、改造成本低 → **Micro App**
- 只需模块共享、不需隔离 → **Module Federation**

---

## qiankun

### 4. qiankun 的生命周期有哪些？

子应用需要导出三个生命周期函数：

```javascript
// 子应用 main.js
let app = null;

export async function bootstrap() {
    // 只在第一次加载时执行，初始化操作
}

export async function mount(props) {
    // 每次挂载时执行，渲染子应用
    app = createApp(App);
    app.mount(props.container?.querySelector('#app') || '#app');
}

export async function unmount() {
    // 每次卸载时执行，清理资源
    app?.unmount();
    app = null;
}
```

---

### 5. qiankun 的 JS 沙箱有哪几种？

| 沙箱类型 | 原理 | 适用场景 |
|---------|------|---------|
| **SnapshotSandbox** | 激活时保存 window 快照，卸载时恢复 | 不支持 Proxy 的旧浏览器 |
| **LegacySandbox** | Proxy 代理 window，单例模式 | 单个子应用 |
| **ProxySandbox** | 每个子应用独立的 Proxy 对象 | 多个子应用同时运行（默认） |

**ProxySandbox 核心原理**：创建一个 fakeWindow 对象，用 Proxy 拦截 get/set，子应用的全局变量操作都在 fakeWindow 上，不影响真实 window。

---

### 6. qiankun 应用间如何通信？

```javascript
// 主应用：初始化全局状态
import { initGlobalState } from 'qiankun';
const actions = initGlobalState({ user: null, token: '' });

// 监听状态变化
actions.onGlobalStateChange((state, prev) => {
    console.log('状态变化', state);
});

// 修改状态
actions.setGlobalState({ user: { name: '张三' } });

// 子应用：通过 props 接收 actions
export async function mount(props) {
    props.onGlobalStateChange((state) => {
        store.commit('setUser', state.user);
    });
    props.setGlobalState({ token: 'xxx' });
}
```

**其他通信方式**：自定义 EventBus、URL 参数、共享 localStorage。

---

### 7. qiankun 常见问题如何解决？

**子应用资源 404：**
```javascript
// 设置 publicPath，让子应用知道自己的资源路径
if (window.__POWERED_BY_QIANKUN__) {
    __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

**样式污染：**
- 主应用：`{ sandbox: { strictStyleIsolation: true } }` 开启 Shadow DOM
- 或使用 CSS Modules / CSS-in-JS / BEM 命名规范

**子应用路由 404：**
- History 模式需要配置 `base`，或服务端配置 fallback

---

## wujie（无界）

### 8. wujie 的核心原理是什么？

wujie 将 **iframe** 和 **WebComponent** 结合：
- **iframe**：提供天然的 JS 隔离（独立的 window、document）
- **WebComponent（Shadow DOM）**：渲染子应用的 DOM，提供 CSS 隔离
- **Proxy 劫持**：将 iframe 中对 document 的操作代理到 Shadow DOM

```
子应用 JS 运行在 iframe 中（JS 隔离）
子应用 DOM 渲染在 Shadow DOM 中（CSS 隔离）
通过 Proxy 桥接两者
```

---

### 9. wujie 的三种运行模式？

| 模式 | 特点 | 适用场景 |
|------|------|---------|
| **重建模式**（默认） | 每次切换重新创建/销毁 | 普通场景 |
| **保活模式**（alive） | 切换时隐藏而非销毁，保留状态 | 频繁切换、需要保留状态 |
| **单例模式**（singleton） | 全局只有一个实例 | 资源受限场景 |

**保活模式**：子应用切走时 DOM 隐藏（`display: none`），切回时直接显示，状态完全保留，适合复杂表单、视频播放等场景。

---

## Micro App

### 10. Micro App 的接入方式和核心特点？

```html
<!-- 主应用：像使用 HTML 标签一样接入子应用 -->
<micro-app name="app1" url="http://localhost:3001/"></micro-app>
```

```javascript
// 主应用：注册
import microApp from '@micro-zoe/micro-app';
microApp.start();
```

**核心特点：**
- 基于 WebComponent，接入只需一行代码
- 零依赖，不依赖 single-spa
- 自动样式隔离（Scoped CSS）
- 支持 iframe 沙箱（更强隔离）

**数据通信：**
```javascript
// 主应用向子应用发送数据
microApp.setData('app1', { token: 'xxx' });

// 子应用接收
window.microApp.addDataListener((data) => console.log(data));
```

---

## Module Federation

### 11. Module Federation 的核心概念是什么？

Webpack 5 的模块联邦允许多个独立构建的应用在运行时共享代码。

**核心角色：**
- **Host**：消费远程模块的应用
- **Remote**：暴露模块供其他应用使用
- **Shared**：多个应用共享的依赖（如 React、Vue）

```javascript
// Remote 应用（暴露模块）
new ModuleFederationPlugin({
    name: 'remoteApp',
    filename: 'remoteEntry.js',
    exposes: {
        './Button': './src/components/Button',
    },
    shared: { react: { singleton: true } }
})

// Host 应用（消费模块）
new ModuleFederationPlugin({
    remotes: {
        remoteApp: 'remoteApp@http://localhost:3001/remoteEntry.js',
    },
    shared: { react: { singleton: true } }
})

// 使用远程模块
const Button = lazy(() => import('remoteApp/Button'));
```

---

### 12. Module Federation 和 qiankun 的区别？

| 特性 | Module Federation | qiankun |
|------|-----------------|---------|
| 定位 | 模块共享 | 完整微前端框架 |
| JS 隔离 | 无 | 有（Proxy 沙箱） |
| CSS 隔离 | 无 | 有 |
| 路由管理 | 无 | 有 |
| 适用场景 | 组件库共享、代码复用 | 完整的子应用集成 |

**Module Federation 不是完整的微前端方案**，它解决的是模块共享问题，没有沙箱隔离。两者可以结合使用：qiankun 做应用集成，Module Federation 做模块共享。
