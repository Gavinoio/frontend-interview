# 前端高频场景题

## 概述

本文汇总前端面试中常见的场景题，涵盖版本更新、轮询、通信、白屏处理、Portal 等实际开发中的常见问题。

---

## 前端版本更新检测

### 轮询检测方案

```javascript
class VersionChecker {
  private currentVersion: string | null = null;
  private timer: number | null = null;
  private interval: number = 60000; // 1分钟检测一次

  constructor() {
    this.init();
  }

  private async init() {
    this.currentVersion = await this.fetchVersion();
    this.startPolling();

    // 页面可见性变化时检测
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.check();
      }
    });
  }

  private async fetchVersion(): Promise<string> {
    // 方案 1：请求 version.json
    const res = await fetch(`/version.json?t=${Date.now()}`);
    const data = await res.json();
    return data.version;

    // 方案 2：请求 index.html，提取 script src 中的 hash
    // const html = await (await fetch('/?t=' + Date.now())).text();
    // const match = html.match(/main\.([a-f0-9]+)\.js/);
    // return match ? match[1] : '';
  }

  private startPolling() {
    this.timer = window.setInterval(() => this.check(), this.interval);
  }

  private async check() {
    const newVersion = await this.fetchVersion();

    if (this.currentVersion && newVersion !== this.currentVersion) {
      this.notifyUpdate();
    }
  }

  private notifyUpdate() {
    // 方案 1：弹窗提示
    if (confirm('检测到新版本，是否刷新页面？')) {
      window.location.reload();
    }

    // 方案 2：全局通知组件
    // EventBus.emit('version-update');

    // 方案 3：Service Worker 更新
    // navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
  }

  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}

// 使用
new VersionChecker();
```

### Service Worker 方案

```javascript
// sw.js
const CACHE_NAME = 'app-v1.0.0';

self.addEventListener('install', (event) => {
  // 新版本安装时
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // 激活时清理旧缓存
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  // 通知页面更新
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: 'UPDATE_AVAILABLE' });
    });
  });
});

// 主页面
navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data.type === 'UPDATE_AVAILABLE') {
    // 提示用户更新
    showUpdateNotification();
  }
});
```

### 构建时注入版本号

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  plugins: [
    {
      name: 'version-plugin',
      closeBundle() {
        // 构建完成后生成 version.json
        const version = {
          version: process.env.npm_package_version,
          buildTime: new Date().toISOString()
        };
        fs.writeFileSync('dist/version.json', JSON.stringify(version));
      }
    }
  ]
});
```

---

## 轮询实现

### setInterval vs setTimeout

```javascript
// ❌ setInterval 问题
// 1. 请求时间不确定，可能堆积
// 2. 即使页面不可见也在执行
setInterval(async () => {
  await fetchData();  // 如果这个请求很慢...
}, 5000);              // 下一次仍会准时发起，导致堆积

// ✅ setTimeout 递归（推荐）
function poll() {
  setTimeout(async () => {
    await fetchData();
    poll();  // 请求完成后才开始下一次
  }, 5000);
}

// ✅ 更完善的实现
class Polling {
  private timer: number | null = null;
  private isRunning = false;

  constructor(
    private fn: () => Promise<void>,
    private interval: number = 5000
  ) {}

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.run();

    // 页面隐藏时暂停
    document.addEventListener('visibilitychange', this.handleVisibility);
  }

  private run = async () => {
    if (!this.isRunning) return;

    try {
      await this.fn();
    } catch (e) {
      console.error('Polling error:', e);
    }

    if (this.isRunning) {
      this.timer = window.setTimeout(this.run, this.interval);
    }
  };

  private handleVisibility = () => {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  };

  pause() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  resume() {
    if (this.isRunning && !this.timer) {
      this.run();
    }
  }

  stop() {
    this.isRunning = false;
    this.pause();
    document.removeEventListener('visibilitychange', this.handleVisibility);
  }
}

// 使用
const polling = new Polling(
  async () => {
    const data = await fetchStatus();
    updateUI(data);
  },
  3000
);

polling.start();
// polling.stop();
```

### requestAnimationFrame 方案

```javascript
// 适合高频更新的场景
function pollWithRAF(fn: () => void) {
  let lastTime = 0;
  const interval = 5000;

  function loop(currentTime: number) {
    if (currentTime - lastTime >= interval) {
      fn();
      lastTime = currentTime;
    }
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
```

---

## iframe 与标签页通信

### 父子 iframe 通信

```javascript
// 父页面
const iframe = document.getElementById('myIframe') as HTMLIFrameElement;

// 向 iframe 发送消息
iframe.contentWindow?.postMessage(
  { type: 'PARENT_MESSAGE', data: 'Hello' },
  'https://child-domain.com'  // 目标源，可以用 '*' 但不安全
);

// 接收 iframe 消息
window.addEventListener('message', (event) => {
  // 验证来源
  if (event.origin !== 'https://child-domain.com') return;

  console.log('收到消息:', event.data);
});

// -----------------------------
// iframe 内页面
// 向父页面发送消息
window.parent.postMessage(
  { type: 'CHILD_MESSAGE', data: 'Hello from iframe' },
  'https://parent-domain.com'
);

// 接收父页面消息
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://parent-domain.com') return;

  console.log('收到父页面消息:', event.data);
});
```

### iframe 能否获取父页面 window？

```javascript
// 同源情况下：可以
// iframe 内访问父页面
window.parent.document.getElementById('xxx');  // ✅ 同源可以

// 跨域情况下：不可以
// iframe 内访问父页面
window.parent.document;  // ❌ 跨域报错：Blocked by CORS

// 只能通过 postMessage 通信
```

### 标签页之间通信

```javascript
// 方案 1：BroadcastChannel（同源）
const channel = new BroadcastChannel('my-channel');

// 发送消息
channel.postMessage({ type: 'UPDATE', data: 'new data' });

// 接收消息
channel.addEventListener('message', (event) => {
  console.log('收到消息:', event.data);
});

// 关闭
channel.close();

// -----------------------------
// 方案 2：localStorage 事件（同源）
// 页面 A
localStorage.setItem('message', JSON.stringify({
  type: 'UPDATE',
  data: 'new data',
  timestamp: Date.now()
}));

// 页面 B
window.addEventListener('storage', (event) => {
  if (event.key === 'message' && event.newValue) {
    const message = JSON.parse(event.newValue);
    console.log('收到消息:', message);
  }
});

// -----------------------------
// 方案 3：SharedWorker（同源）
// shared-worker.js
const connections = [];

self.onconnect = (e) => {
  const port = e.ports[0];
  connections.push(port);

  port.onmessage = (event) => {
    // 广播给所有连接
    connections.forEach((p) => {
      p.postMessage(event.data);
    });
  };
};

// 页面中使用
const worker = new SharedWorker('shared-worker.js');
worker.port.start();

worker.port.postMessage({ type: 'HELLO' });

worker.port.onmessage = (event) => {
  console.log('收到:', event.data);
};
```

---

## React/Vue 挂载前白屏处理

### 在 index.html 中添加 Loading

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* 全屏 loading 样式 */
    #app-loading {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      z-index: 9999;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #1890ff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* 应用挂载后隐藏 */
    #app-loading.hidden {
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
    }
  </style>
</head>
<body>
  <!-- Loading 占位 -->
  <div id="app-loading">
    <div class="spinner"></div>
  </div>

  <!-- Vue/React 挂载点 -->
  <div id="app"></div>

  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

```typescript
// Vue 3
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

app.mount('#app');

// 挂载完成后隐藏 loading
document.getElementById('app-loading')?.classList.add('hidden');

// 或者在 App.vue 的 onMounted 中
onMounted(() => {
  document.getElementById('app-loading')?.classList.add('hidden');
});
```

```tsx
// React
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('app')!);

root.render(<App />);

// 在 App 组件中
useEffect(() => {
  document.getElementById('app-loading')?.classList.add('hidden');
}, []);
```

### 骨架屏方案

```html
<div id="app">
  <!-- 骨架屏 HTML，会被 Vue/React 替换 -->
  <div class="skeleton">
    <div class="skeleton-header"></div>
    <div class="skeleton-content">
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>
  </div>
</div>

<style>
  .skeleton-line {
    height: 20px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    margin-bottom: 10px;
    border-radius: 4px;
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
</style>
```

---

## Portal - 组件挂载到指定 DOM

### React Portal

```tsx
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';

// 基础用法
function Modal({ children, isOpen, onClose }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
}

// 封装 Portal 组件
function Portal({ children, container = document.body }) {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // 创建容器
    const div = document.createElement('div');
    container.appendChild(div);
    setMountNode(div);

    return () => {
      container.removeChild(div);
    };
  }, [container]);

  if (!mountNode) return null;

  return createPortal(children, mountNode);
}

// 使用
function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>打开弹窗</button>

      <Portal>
        {isOpen && (
          <div className="modal">
            <p>这个弹窗挂载到 body 上</p>
            <button onClick={() => setIsOpen(false)}>关闭</button>
          </div>
        )}
      </Portal>
    </div>
  );
}
```

### Vue Teleport

```vue
<template>
  <button @click="isOpen = true">打开弹窗</button>

  <!-- Teleport 到 body -->
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click="isOpen = false">
      <div class="modal-content" @click.stop>
        <p>这个弹窗挂载到 body 上</p>
        <button @click="isOpen = false">关闭</button>
      </div>
    </div>
  </Teleport>

  <!-- Teleport 到指定选择器 -->
  <Teleport to="#modals">
    <div v-if="showTooltip" class="tooltip">
      提示内容
    </div>
  </Teleport>

  <!-- 禁用 Teleport -->
  <Teleport :disabled="isMobile" to="body">
    <div class="popup">
      移动端不 teleport
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';

const isOpen = ref(false);
const showTooltip = ref(false);
const isMobile = ref(window.innerWidth < 768);
</script>
```

---

## watch 与 watchEffect

### 基本区别

```typescript
import { ref, watch, watchEffect } from 'vue';

const count = ref(0);
const name = ref('');

// watch：显式指定依赖
watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} -> ${newVal}`);
});

// watch 多个源
watch([count, name], ([newCount, newName], [oldCount, oldName]) => {
  console.log('count 或 name 变化');
});

// watchEffect：自动收集依赖
watchEffect(() => {
  console.log(`count is: ${count.value}`);  // 自动追踪 count
});
```

### watchEffect 坑点：异步代码中的依赖

```typescript
// ❌ 坑：异步代码前的依赖才会被收集
watchEffect(async () => {
  console.log(count.value);  // ✅ 会被收集

  await someAsyncOperation();

  console.log(name.value);   // ❌ 不会被收集！
});

// 原因：Vue 的依赖收集是同步的，await 之后的代码在下一个微任务执行
// 此时 watchEffect 的依赖收集已经结束

// ✅ 解决方案 1：在 await 前访问所有依赖
watchEffect(async () => {
  // 先同步访问所有需要追踪的响应式数据
  const countVal = count.value;
  const nameVal = name.value;

  await someAsyncOperation();

  // 使用之前保存的值
  console.log(countVal, nameVal);
});

// ✅ 解决方案 2：使用 watch 显式声明依赖
watch([count, name], async ([newCount, newName]) => {
  await someAsyncOperation();
  console.log(newCount, newName);
});

// ✅ 解决方案 3：拆分为多个 watcher
watchEffect(() => {
  console.log(count.value);
});

watchEffect(() => {
  console.log(name.value);
});
```

### watch 的 immediate 和 deep

```typescript
// immediate：立即执行一次
watch(
  count,
  (newVal) => {
    console.log(newVal);
  },
  { immediate: true }  // 初始化时立即执行
);

// deep：深度监听
const obj = ref({ a: { b: 1 } });

// 默认不会触发
watch(obj, () => {
  console.log('obj changed');
});
obj.value.a.b = 2;  // 不触发

// 使用 deep
watch(
  obj,
  () => {
    console.log('obj changed');
  },
  { deep: true }
);
obj.value.a.b = 2;  // 触发

// 或者监听具体路径
watch(
  () => obj.value.a.b,
  (newVal) => {
    console.log('obj.a.b changed:', newVal);
  }
);
```

---

## 按钮权限控制

### Vue 自定义指令

```typescript
// directives/permission.ts
import type { Directive } from 'vue';

// 假设这是从 store 获取的用户权限
const userPermissions = ['user:read', 'user:write', 'order:read'];

export const vPermission: Directive = {
  mounted(el, binding) {
    const { value } = binding;

    if (!value) return;

    const permissions = Array.isArray(value) ? value : [value];
    const hasPermission = permissions.some((p) => userPermissions.includes(p));

    if (!hasPermission) {
      // 方案 1：移除元素
      el.parentNode?.removeChild(el);

      // 方案 2：隐藏元素
      // el.style.display = 'none';

      // 方案 3：禁用按钮
      // el.disabled = true;
      // el.classList.add('is-disabled');
    }
  }
};

// 注册
app.directive('permission', vPermission);

// 使用
<template>
  <button v-permission="'user:write'">编辑</button>
  <button v-permission="['user:delete', 'admin']">删除</button>
</template>
```

### Vue Hook 方案

```typescript
// composables/usePermission.ts
import { computed } from 'vue';
import { useUserStore } from '@/stores/user';

export function usePermission() {
  const userStore = useUserStore();

  const hasPermission = (permission: string | string[]) => {
    const permissions = Array.isArray(permission) ? permission : [permission];
    return permissions.some((p) => userStore.permissions.includes(p));
  };

  return {
    hasPermission
  };
}

// 使用
<template>
  <button v-if="hasPermission('user:write')">编辑</button>
  <button v-if="hasPermission(['user:delete', 'admin'])">删除</button>
</template>

<script setup>
import { usePermission } from '@/composables/usePermission';

const { hasPermission } = usePermission();
</script>
```

### 指令 vs Hook 的区别

| 特性 | 自定义指令 | Hook |
|------|-----------|------|
| 语法 | `v-permission="'xxx'"` | `v-if="hasPermission('xxx')"` |
| DOM 操作 | 直接操作 DOM | 通过 v-if 控制 |
| 响应式 | 需要手动处理 updated | 自动响应式 |
| 逻辑复用 | 只能用于模板 | 可在 JS 中使用 |
| 组合性 | 较弱 | 可与其他逻辑组合 |

**推荐：**
- 简单的显示/隐藏：使用指令
- 需要在 JS 中判断或组合其他逻辑：使用 Hook

---

## ECharts 体积优化

### 按需引入

```typescript
// 全量引入（不推荐）
// import * as echarts from 'echarts';

// 按需引入
import * as echarts from 'echarts/core';

// 引入需要的图表
import { BarChart, LineChart, PieChart } from 'echarts/charts';

// 引入组件
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent
} from 'echarts/components';

// 引入渲染器
import { CanvasRenderer } from 'echarts/renderers';
// import { SVGRenderer } from 'echarts/renderers';

// 注册
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer
]);

export default echarts;
```

### 体积对比

```
全量引入：~1MB
按需引入（基础图表）：~300KB
按需引入（精简）：~150KB
```

### 其他优化

```javascript
// 1. 使用 SVG 渲染器（适合小数据量）
import { SVGRenderer } from 'echarts/renderers';

// 2. 懒加载
const loadECharts = () => import('./echarts-config');

// 3. CDN 外部化
// vite.config.js
export default {
  build: {
    rollupOptions: {
      external: ['echarts'],
      output: {
        globals: {
          echarts: 'echarts'
        }
      }
    }
  }
};

// index.html
<script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
```

---

