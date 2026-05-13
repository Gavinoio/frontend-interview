# Web Workers 完全指南

## 概述

Web Workers 允许在后台线程中运行 JavaScript，实现真正的多线程编程。它能够执行耗时任务而不阻塞主线程，保持页面响应流畅。

## Web Workers 类型

```
┌─────────────────────────────────────────────────────────────┐
│                      Web Workers                            │
├─────────────────┬─────────────────┬─────────────────────────┤
│ Dedicated Worker│ Shared Worker   │ Service Worker          │
│ 专用 Worker     │ 共享 Worker     │ 服务 Worker             │
│ 一对一关系      │ 多页面共享      │ 离线缓存、推送          │
└─────────────────┴─────────────────┴─────────────────────────┘
```

## Dedicated Worker（专用 Worker）

### 基本使用

```javascript
// main.js - 主线程
const worker = new Worker('worker.js');

// 发送消息给 Worker
worker.postMessage({ type: 'start', data: [1, 2, 3, 4, 5] });

// 接收 Worker 消息
worker.onmessage = (event) => {
  console.log('收到结果:', event.data);
};

// 错误处理
worker.onerror = (error) => {
  console.error('Worker 错误:', error.message);
};

// 终止 Worker
worker.terminate();
```

```javascript
// worker.js - Worker 线程
self.onmessage = (event) => {
  const { type, data } = event.data;

  if (type === 'start') {
    // 执行耗时计算
    const result = data.map(n => n * n);
    // 返回结果给主线程
    self.postMessage(result);
  }
};

// Worker 也可以主动发消息
// self.postMessage('Worker 已就绪');

// Worker 内部终止自己
// self.close();
```

### 内联 Worker（Blob URL）

```javascript
// 不需要单独的 worker 文件
const workerCode = `
  self.onmessage = function(e) {
    const result = e.data * 2;
    self.postMessage(result);
  };
`;

const blob = new Blob([workerCode], { type: 'application/javascript' });
const worker = new Worker(URL.createObjectURL(blob));

worker.postMessage(10);
worker.onmessage = (e) => console.log(e.data); // 20

// 使用完后释放 URL
// URL.revokeObjectURL(blob);
```

### Worker 中可用的 API

```javascript
// Worker 线程中可用的 API
self.onmessage    // 接收消息
self.postMessage  // 发送消息
self.close        // 关闭 Worker
self.importScripts // 导入脚本

// 可用的 Web API
fetch             // 网络请求
XMLHttpRequest    // Ajax 请求
WebSocket         // WebSocket 连接
IndexedDB         // 本地数据库
setTimeout/setInterval  // 定时器
console           // 控制台输出
crypto            // 加密 API

// 不可用的 API（需要 DOM）
document          // ❌
window            // ❌
parent            // ❌
localStorage      // ❌
```

### 导入外部脚本

```javascript
// worker.js
// 同步加载脚本
importScripts('helper.js');
importScripts('lib1.js', 'lib2.js'); // 可以同时导入多个

// 使用导入的函数
const result = helperFunction(data);
```

## Shared Worker（共享 Worker）

多个页面/iframe 可以共享同一个 Worker 实例。

### 基本使用

```javascript
// main.js - 页面 A
const sharedWorker = new SharedWorker('shared-worker.js');

// 通过 port 通信
sharedWorker.port.start();

sharedWorker.port.postMessage('来自页面 A');

sharedWorker.port.onmessage = (event) => {
  console.log('收到:', event.data);
};
```

```javascript
// shared-worker.js
const connections = [];

self.onconnect = (event) => {
  const port = event.ports[0];
  connections.push(port);

  port.onmessage = (e) => {
    // 广播给所有连接
    connections.forEach(p => {
      p.postMessage(`广播: ${e.data}`);
    });
  };

  port.start();
};
```

### 使用场景

```javascript
// 1. 多标签页数据同步
// shared-worker.js
let sharedData = {};

self.onconnect = (event) => {
  const port = event.ports[0];

  port.onmessage = (e) => {
    const { action, key, value } = e.data;

    switch (action) {
      case 'get':
        port.postMessage({ key, value: sharedData[key] });
        break;
      case 'set':
        sharedData[key] = value;
        // 通知所有连接
        broadcastUpdate(key, value);
        break;
    }
  };

  port.start();
};

// 2. 共享 WebSocket 连接
let ws = null;
const ports = [];

self.onconnect = (event) => {
  const port = event.ports[0];
  ports.push(port);

  // 只创建一个 WebSocket 连接
  if (!ws) {
    ws = new WebSocket('wss://example.com/socket');
    ws.onmessage = (e) => {
      ports.forEach(p => p.postMessage(e.data));
    };
  }

  port.onmessage = (e) => {
    ws.send(e.data);
  };

  port.start();
};
```

## Service Worker

Service Worker 是一种特殊的 Worker，主要用于离线缓存、消息推送和后台同步。

### 生命周期

```
注册(Register) → 安装(Install) → 激活(Activate) → 运行(Running)
                      ↓                  ↓
                 等待(Waiting)      空闲(Idle)
                                        ↓
                                   终止(Terminated)
```

### 注册 Service Worker

```javascript
// main.js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', {
    scope: '/' // 控制范围
  })
  .then(registration => {
    console.log('SW 注册成功:', registration.scope);

    // 监听更新
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        console.log('SW 状态:', newWorker.state);
      });
    });
  })
  .catch(error => {
    console.error('SW 注册失败:', error);
  });

  // 监听控制器变化
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('新的 Service Worker 已接管');
  });
}
```

### Service Worker 实现

```javascript
// sw.js
const CACHE_NAME = 'app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/images/logo.png'
];

// 安装事件 - 缓存资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存资源');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // 跳过等待，立即激活
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim()) // 立即接管所有页面
  );
});

// 拦截请求 - 缓存优先策略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存命中
        if (response) {
          return response;
        }

        // 缓存未命中，发起网络请求
        return fetch(event.request).then(response => {
          // 检查响应是否有效
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 克隆响应并缓存
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
  );
});
```

### 常见缓存策略

```javascript
// 1. 缓存优先（Cache First）
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});

// 2. 网络优先（Network First）
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});

// 3. 仅缓存（Cache Only）
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request));
});

// 4. 仅网络（Network Only）
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});

// 5. Stale While Revalidate（返回缓存同时更新）
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cached => {
        const fetched = fetch(event.request).then(response => {
          cache.put(event.request, response.clone());
          return response;
        });
        return cached || fetched;
      });
    })
  );
});
```

## 数据传输

### 结构化克隆

```javascript
// postMessage 使用结构化克隆算法
// 可传输的数据类型：
// - 基本类型（数字、字符串、布尔值）
// - Date、RegExp、Blob、File、FileList
// - ArrayBuffer、TypedArray
// - Map、Set
// - 普通对象和数组

// 不可传输的数据类型：
// - 函数
// - DOM 节点
// - 原型链（会丢失）
// - Symbol

worker.postMessage({
  name: '张三',
  date: new Date(),
  data: new Uint8Array([1, 2, 3]),
  map: new Map([['a', 1], ['b', 2]])
});
```

### Transferable Objects

```javascript
// 转移所有权，避免复制开销
const buffer = new ArrayBuffer(1024 * 1024); // 1MB

// 转移后，主线程无法再访问 buffer
worker.postMessage(buffer, [buffer]);
console.log(buffer.byteLength); // 0 - 已被转移

// Worker 中接收
self.onmessage = (e) => {
  const buffer = e.data;
  console.log(buffer.byteLength); // 1048576
};
```

```javascript
// 可转移的对象类型
// - ArrayBuffer
// - MessagePort
// - ImageBitmap
// - OffscreenCanvas

// 转移多个对象
const buffer1 = new ArrayBuffer(100);
const buffer2 = new ArrayBuffer(200);
worker.postMessage({ buf1: buffer1, buf2: buffer2 }, [buffer1, buffer2]);
```

### SharedArrayBuffer

```javascript
// 共享内存 - 主线程和 Worker 访问同一块内存
const sharedBuffer = new SharedArrayBuffer(1024);
const sharedArray = new Int32Array(sharedBuffer);

// 发送给 Worker（不会复制）
worker.postMessage(sharedBuffer);

// Worker 中
self.onmessage = (e) => {
  const sharedArray = new Int32Array(e.data);
  // 直接修改共享内存
  sharedArray[0] = 123;
};

// 使用 Atomics 保证线程安全
Atomics.store(sharedArray, 0, 100);    // 原子写入
Atomics.load(sharedArray, 0);          // 原子读取
Atomics.add(sharedArray, 0, 1);        // 原子加法
Atomics.compareExchange(sharedArray, 0, 100, 200); // CAS 操作
Atomics.wait(sharedArray, 0, 100);     // 等待值变化
Atomics.notify(sharedArray, 0, 1);     // 唤醒等待的线程
```

## 实战应用场景

### 1. 大数据处理

```javascript
// main.js
const worker = new Worker('data-processor.js');

function processLargeData(data) {
  return new Promise((resolve, reject) => {
    worker.onmessage = (e) => resolve(e.data);
    worker.onerror = (e) => reject(e.error);
    worker.postMessage(data);
  });
}

// 处理 100 万条数据
const largeData = Array.from({ length: 1000000 }, (_, i) => ({ id: i, value: Math.random() }));
processLargeData(largeData).then(result => {
  console.log('处理完成:', result);
});
```

```javascript
// data-processor.js
self.onmessage = (e) => {
  const data = e.data;

  // 排序
  const sorted = data.sort((a, b) => a.value - b.value);

  // 过滤
  const filtered = sorted.filter(item => item.value > 0.5);

  // 聚合
  const sum = filtered.reduce((acc, item) => acc + item.value, 0);

  self.postMessage({
    count: filtered.length,
    sum: sum,
    average: sum / filtered.length
  });
};
```

### 2. 图像处理

```javascript
// main.js
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

const worker = new Worker('image-processor.js');

// 使用 Transferable 转移像素数据
worker.postMessage({
  width: canvas.width,
  height: canvas.height,
  buffer: imageData.data.buffer
}, [imageData.data.buffer]);

worker.onmessage = (e) => {
  const processedData = new ImageData(
    new Uint8ClampedArray(e.data.buffer),
    e.data.width,
    e.data.height
  );
  ctx.putImageData(processedData, 0, 0);
};
```

```javascript
// image-processor.js
self.onmessage = (e) => {
  const { width, height, buffer } = e.data;
  const data = new Uint8ClampedArray(buffer);

  // 灰度处理
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    data[i] = gray;     // R
    data[i + 1] = gray; // G
    data[i + 2] = gray; // B
    // data[i + 3] 是 Alpha，保持不变
  }

  self.postMessage({ width, height, buffer: data.buffer }, [data.buffer]);
};
```

### 3. 复杂计算

```javascript
// 斐波那契数列计算
// main.js
const worker = new Worker('fibonacci.js');

worker.postMessage(45); // 计算第 45 个斐波那契数

worker.onmessage = (e) => {
  console.log('结果:', e.data); // 1134903170
};
```

```javascript
// fibonacci.js
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

self.onmessage = (e) => {
  const result = fibonacci(e.data);
  self.postMessage(result);
};
```

### 4. Worker 池

```javascript
class WorkerPool {
  constructor(workerScript, size = navigator.hardwareConcurrency || 4) {
    this.workers = [];
    this.taskQueue = [];
    this.workerStatus = [];

    for (let i = 0; i < size; i++) {
      const worker = new Worker(workerScript);
      this.workers.push(worker);
      this.workerStatus.push('idle');

      worker.onmessage = (e) => {
        const { taskId, result } = e.data;
        this.resolveTask(taskId, result);
        this.workerStatus[i] = 'idle';
        this.processQueue();
      };
    }
  }

  exec(data) {
    return new Promise((resolve, reject) => {
      const task = {
        id: Date.now() + Math.random(),
        data,
        resolve,
        reject
      };

      this.taskQueue.push(task);
      this.processQueue();
    });
  }

  processQueue() {
    if (this.taskQueue.length === 0) return;

    const idleWorkerIndex = this.workerStatus.findIndex(s => s === 'idle');
    if (idleWorkerIndex === -1) return;

    const task = this.taskQueue.shift();
    this.workerStatus[idleWorkerIndex] = task.id;
    this.workers[idleWorkerIndex].postMessage({
      taskId: task.id,
      data: task.data
    });
  }

  resolveTask(taskId, result) {
    // 在实际实现中需要维护 task 引用
    // 这里简化处理
  }

  terminate() {
    this.workers.forEach(w => w.terminate());
  }
}

// 使用
const pool = new WorkerPool('worker.js', 4);
const tasks = Array.from({ length: 100 }, (_, i) => pool.exec(i));
Promise.all(tasks).then(results => console.log(results));
```

### 5. OffscreenCanvas

```javascript
// main.js
const canvas = document.getElementById('canvas');
const offscreen = canvas.transferControlToOffscreen();

const worker = new Worker('canvas-worker.js');
worker.postMessage({ canvas: offscreen }, [offscreen]);
```

```javascript
// canvas-worker.js
let ctx;

self.onmessage = (e) => {
  const { canvas } = e.data;
  ctx = canvas.getContext('2d');

  // 在 Worker 中绑定动画
  function draw() {
    ctx.fillStyle = 'red';
    ctx.fillRect(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      10, 10
    );
    requestAnimationFrame(draw);
  }

  draw();
};
```

## Worker 通信封装

### Promise 风格封装

```javascript
// worker-wrapper.js
class WorkerWrapper {
  constructor(workerScript) {
    this.worker = new Worker(workerScript);
    this.callbacks = new Map();
    this.messageId = 0;

    this.worker.onmessage = (e) => {
      const { id, result, error } = e.data;
      const callback = this.callbacks.get(id);

      if (callback) {
        if (error) {
          callback.reject(new Error(error));
        } else {
          callback.resolve(result);
        }
        this.callbacks.delete(id);
      }
    };
  }

  call(method, ...args) {
    return new Promise((resolve, reject) => {
      const id = this.messageId++;
      this.callbacks.set(id, { resolve, reject });
      this.worker.postMessage({ id, method, args });
    });
  }

  terminate() {
    this.worker.terminate();
  }
}

// 使用
const worker = new WorkerWrapper('api-worker.js');
const result = await worker.call('calculate', 1, 2, 3);
```

```javascript
// api-worker.js
const api = {
  calculate(a, b, c) {
    return a + b + c;
  },

  async fetchData(url) {
    const response = await fetch(url);
    return response.json();
  }
};

self.onmessage = async (e) => {
  const { id, method, args } = e.data;

  try {
    const result = await api[method](...args);
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
};
```

### Comlink 库

```javascript
// 使用 Comlink 简化 Worker 通信
// npm install comlink

// worker.js
import * as Comlink from 'comlink';

const api = {
  calculate(a, b) {
    return a + b;
  },

  async heavyTask(data) {
    // 耗时操作
    return processData(data);
  }
};

Comlink.expose(api);

// main.js
import * as Comlink from 'comlink';

const worker = new Worker('worker.js');
const api = Comlink.wrap(worker);

// 像调用本地函数一样调用 Worker
const result = await api.calculate(1, 2); // 3
```

## 常见问题与解决方案

### 1. Worker 加载跨域脚本

```javascript
// 问题：Worker 不能直接加载跨域脚本
// 解决：使用 fetch 获取后创建 Blob URL

async function createCrossOriginWorker(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Worker(URL.createObjectURL(blob));
}
```

### 2. 调试 Worker

```javascript
// 在 Worker 中使用 console
self.onmessage = (e) => {
  console.log('Worker 收到:', e.data);
  // Chrome DevTools 的 Sources 面板可以调试 Worker
};

// 主线程监听错误
worker.onerror = (error) => {
  console.error('Worker 错误:', error.message, error.filename, error.lineno);
};
```

### 3. Worker 中使用模块

```javascript
// 使用模块 Worker（需要浏览器支持）
const worker = new Worker('worker.js', { type: 'module' });

// worker.js
import { helper } from './helper.js';
// ...
```

## 面试常见问题

::: details 1. Web Worker 有哪些限制？
- 无法访问 DOM
- 无法访问 window、document、parent
- 无法使用 localStorage
- 受同源策略限制
- 无法使用 alert、confirm
:::

::: details 2. 如何在 Worker 和主线程之间高效传输大数据？
- 使用 Transferable Objects 转移所有权
- 使用 SharedArrayBuffer 共享内存
- 分块传输大数据
:::

::: details 3. Dedicated Worker、Shared Worker、Service Worker 的区别？
| 特性 | Dedicated Worker | Shared Worker | Service Worker |
|------|-----------------|---------------|----------------|
| 关联页面 | 单个页面 | 多个页面 | 所有页面 |
| 生命周期 | 页面关闭终止 | 所有连接关闭终止 | 独立于页面 |
| 主要用途 | 计算密集任务 | 跨页面通信 | 离线缓存、推送 |
| API | postMessage | port.postMessage | fetch 拦截 |
:::

::: details 4. 为什么 Worker 不能操作 DOM？
- DOM 不是线程安全的
- 多线程同时操作 DOM 会导致竞态条件
- 简化了浏览器的实现
:::

::: details 5. 如何实现 Worker 池？
关键点：
- 维护固定数量的 Worker
- 任务队列管理
- 空闲 Worker 调度
- 错误处理和重试
:::

## 总结

Web Workers 是前端实现多线程的重要手段：

1. **Dedicated Worker**：适合单页面的计算密集型任务
2. **Shared Worker**：适合多标签页共享数据和连接
3. **Service Worker**：适合离线缓存、消息推送
4. **数据传输**：使用 Transferable Objects 或 SharedArrayBuffer 优化大数据传输
5. **最佳实践**：Worker 池、Promise 封装、模块化

掌握 Web Workers 能够显著提升 Web 应用的性能和用户体验。
