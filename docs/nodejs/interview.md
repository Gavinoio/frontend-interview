# Node.js 面试题精选

> 汇总 Node.js 事件循环、模块系统、核心 API、框架对比等高频面试题。

## 核心原理

### 1. Node.js 事件循环与浏览器事件循环的区别？

**浏览器事件循环**：宏任务 → 清空微任务 → 渲染 → 下一个宏任务

**Node.js 事件循环**分为 6 个阶段，按顺序循环执行：

```
timers        → 执行 setTimeout/setInterval 回调
pending I/O   → 执行上一轮延迟的 I/O 回调
idle/prepare  → 内部使用
poll          → 获取新的 I/O 事件（核心阶段）
check         → 执行 setImmediate 回调
close         → 执行关闭事件回调（如 socket.on('close')）
```

**微任务**（每个阶段切换前清空）：`process.nextTick`（优先级最高）> `Promise.then`

```javascript
setTimeout(() => console.log('setTimeout'), 0);
setImmediate(() => console.log('setImmediate'));
Promise.resolve().then(() => console.log('Promise'));
process.nextTick(() => console.log('nextTick'));

// 输出：nextTick → Promise → setTimeout → setImmediate
// （setTimeout 和 setImmediate 顺序在 I/O 回调中是确定的：setImmediate 先）
```

---

### 2. process.nextTick 和 setImmediate 的区别？

- `process.nextTick`：在当前操作完成后、事件循环继续前立即执行，优先级最高
- `setImmediate`：在 check 阶段执行，在 I/O 事件回调之后

```javascript
// 在 I/O 回调中，setImmediate 总是先于 setTimeout 执行
fs.readFile('file', () => {
    setTimeout(() => console.log('timeout'), 0);
    setImmediate(() => console.log('immediate'));
    // 输出：immediate → timeout
});
```

**推荐**：用 `setImmediate` 代替 `process.nextTick`，避免递归调用 `nextTick` 导致 I/O 饥饿。

---

### 3. Node.js 如何处理高并发？

Node.js 是单线程的，但通过以下机制处理高并发：

1. **非阻塞 I/O**：I/O 操作（文件读写、网络请求）异步执行，不阻塞主线程
2. **事件循环**：主线程通过事件循环不断处理回调
3. **libuv 线程池**：底层用 4 个线程（默认）处理文件 I/O、DNS 等阻塞操作
4. **Cluster 模块**：多进程利用多核 CPU
5. **Worker Threads**：CPU 密集型任务移到工作线程

**适合场景**：I/O 密集型（API 服务、实时应用）
**不适合场景**：CPU 密集型（图像处理、大量计算）

---

### 4. CommonJS 和 ES Module 在 Node.js 中的区别？

| 特性 | CommonJS | ES Module |
|------|---------|-----------|
| 语法 | `require/module.exports` | `import/export` |
| 加载时机 | 运行时（同步） | 编译时（异步） |
| 输出 | 值的拷贝 | 值的引用（live binding） |
| 循环依赖 | 返回不完整对象 | 可以处理（但需注意） |
| 文件扩展名 | `.js`（默认） | `.mjs` 或 `package.json` 中 `"type": "module"` |
| `__dirname` | 有 | 无（用 `import.meta.url` 替代） |

---

### 5. Node.js 的 Stream 是什么？有哪几种类型？

Stream 是处理流式数据的抽象接口，避免将大文件全部加载到内存。

**四种类型：**
- **Readable**：可读流（`fs.createReadStream`）
- **Writable**：可写流（`fs.createWriteStream`）
- **Duplex**：双工流，可读可写（`net.Socket`）
- **Transform**：转换流，读写时可修改数据（`zlib.createGzip`）

```javascript
// 管道：高效处理大文件
const readable = fs.createReadStream('large-file.txt');
const writable = fs.createWriteStream('output.txt');
const gzip = zlib.createGzip();

readable.pipe(gzip).pipe(writable); // 边读边压缩边写，内存占用极低
```

---

### 6. Node.js 中如何处理未捕获的异常？

```javascript
// 1. 同步异常：try/catch
try {
    JSON.parse('invalid json');
} catch (e) {
    console.error(e);
}

// 2. Promise 未捕获
process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的 Promise 拒绝:', reason);
    // 生产环境建议优雅退出
    process.exit(1);
});

// 3. 未捕获的同步异常
process.on('uncaughtException', (err) => {
    console.error('未捕获的异常:', err);
    // 必须退出，进程状态已不可信
    process.exit(1);
});
```

**最佳实践**：使用 PM2 等进程管理工具，崩溃后自动重启。

---

### 7. Node.js 的 Buffer 是什么？

Buffer 是用于处理二进制数据的类，在处理文件、网络数据时使用。

```javascript
// 创建 Buffer
const buf1 = Buffer.from('Hello', 'utf8');
const buf2 = Buffer.alloc(10); // 分配 10 字节，初始化为 0

// 转换
buf1.toString('utf8');   // 'Hello'
buf1.toString('hex');    // '48656c6c6f'
buf1.toString('base64'); // 'SGVsbG8='

// 常用场景：文件上传、图片处理、加密
```

---

## 模块与包管理

### 8. Node.js 模块加载机制是什么？

```
require('module')
    ↓
1. 缓存检查（已加载则直接返回）
    ↓
2. 核心模块（fs、path 等，直接返回）
    ↓
3. 路径解析：
   - 以 ./ 或 ../ 开头 → 文件模块
   - 否则 → node_modules 逐级向上查找
    ↓
4. 文件扩展名尝试：.js → .json → .node
    ↓
5. 加载并缓存
```

**循环依赖**：CommonJS 返回已执行部分的不完整对象，需要注意。

---

## 框架对比

### 9. Express、Koa、Fastify、NestJS 如何选择？

| 框架 | 特点 | 性能（req/s） | 适用场景 |
|------|------|-------------|---------|
| **Express** | 轻量灵活，生态最成熟 | ~35k | 小型项目、快速原型 |
| **Koa** | async/await 原生，洋葱模型，无内置中间件 | ~50k | 中型项目，喜欢轻量 |
| **Fastify** | 性能极高，Schema 验证，插件系统完善 | ~65k | 高性能 API 服务 |
| **NestJS** | TypeScript 原生，模块化，企业级 | ~30k | 大型项目，团队协作 |

**选型建议：**
- 快速开发、小团队 → Express / Koa
- 高性能 API → Fastify
- 大型企业项目、TypeScript → NestJS

---

### 10. Koa 的洋葱模型是什么？

Koa 中间件按照注册顺序形成"洋葱"结构，请求从外到内穿过所有中间件，响应从内到外返回。

```javascript
const Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next) => {
    console.log('1 进');
    await next(); // 执行下一个中间件
    console.log('1 出');
});

app.use(async (ctx, next) => {
    console.log('2 进');
    await next();
    console.log('2 出');
});

app.use(async (ctx) => {
    console.log('3 处理');
    ctx.body = 'Hello';
});

// 输出：1进 → 2进 → 3处理 → 2出 → 1出
```

**应用**：日志记录、错误处理、鉴权、响应时间统计等都可以用中间件实现。

---

### 11. Node.js 如何实现多进程？

```javascript
// Cluster 模块：利用多核 CPU
const cluster = require('cluster');
const os = require('os');

if (cluster.isPrimary) {
    // 主进程：创建工作进程
    const numCPUs = os.cpus().length;
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork(); // 自动重启
    });
} else {
    // 工作进程：启动 HTTP 服务
    require('./app');
}
```

**Worker Threads**（CPU 密集型任务）：
```javascript
const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
    const worker = new Worker(__filename);
    worker.on('message', (result) => console.log('结果:', result));
    worker.postMessage({ data: [1, 2, 3] });
} else {
    parentPort.on('message', ({ data }) => {
        const result = data.reduce((a, b) => a + b, 0);
        parentPort.postMessage(result);
    });
}
```
