# Node.js 基础

Node.js 是基于 Chrome V8 引擎的 JavaScript 运行时环境，让 JavaScript 可以在服务器端运行。

## 核心特点

- **单线程**：主线程是单线程，通过事件循环处理并发
- **非阻塞 I/O**：异步处理 I/O 操作，不阻塞主线程
- **事件驱动**：基于事件和回调机制
- **跨平台**：支持 Windows、Linux、macOS

## Node.js vs 浏览器

| 特性 | Node.js | 浏览器 |
|------|---------|--------|
| 全局对象 | `global` | `window` |
| 模块系统 | CommonJS / ES Module | ES Module |
| DOM/BOM | 无 | 有 |
| 文件系统 | 有 (fs) | 无（安全限制） |
| 网络能力 | 完整 (http, net, dgram) | 受限 (fetch, WebSocket) |
| 多线程 | Worker Threads | Web Workers |

---

## 高频面试题

::: details 1. Node.js 事件循环与浏览器事件循环的区别？
**一句话答案：** Node.js 事件循环分为 6 个阶段，有明确的执行顺序；浏览器事件循环只区分宏任务和微任务，每个宏任务后清空微任务队列。

**详细解答：**

**浏览器事件循环：**

```
┌─────────────────────────────────┐
│         宏任务队列               │
│  (setTimeout, setInterval,      │
│   I/O, UI rendering)            │
└─────────────┬───────────────────┘
              │ 取一个宏任务执行
              ▼
┌─────────────────────────────────┐
│         微任务队列               │
│  (Promise.then, MutationObserver│
│   queueMicrotask)               │
└─────────────┬───────────────────┘
              │ 清空所有微任务
              ▼
┌─────────────────────────────────┐
│         渲染更新                 │
│  (requestAnimationFrame, 重绘)  │
└─────────────────────────────────┘
```

**Node.js 事件循环（6 个阶段）：**

```
   ┌───────────────────────────┐
┌─>│        timers             │  执行 setTimeout/setInterval 回调
│  └───────────┬───────────────┘
│              │
│  ┌───────────▼───────────────┐
│  │     pending callbacks     │  执行延迟到下一个循环的 I/O 回调
│  └───────────┬───────────────┘
│              │
│  ┌───────────▼───────────────┐
│  │       idle, prepare       │  仅内部使用
│  └───────────┬───────────────┘
│              │
│  ┌───────────▼───────────────┐
│  │          poll             │  获取新的 I/O 事件，执行 I/O 回调
│  └───────────┬───────────────┘
│              │
│  ┌───────────▼───────────────┐
│  │         check             │  执行 setImmediate 回调
│  └───────────┬───────────────┘
│              │
│  ┌───────────▼───────────────┐
│  │     close callbacks       │  执行 close 事件回调
└──┴───────────────────────────┘
```

**关键区别：**

```javascript
// 浏览器中
setTimeout(() => console.log('timeout'), 0);
Promise.resolve().then(() => console.log('promise'));
// 输出: promise → timeout（微任务先于下一个宏任务）

// Node.js 中（取决于启动时机）
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
// 输出顺序不确定！

// 但在 I/O 回调中是确定的
const fs = require('fs');
fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});
// 输出: immediate → timeout（check 阶段在 timers 之前）
```

**process.nextTick vs Promise.then：**

```javascript
// Node.js 特有
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
// 输出: nextTick → promise

// nextTick 优先级最高，在当前阶段结束后立即执行
// 不属于事件循环的任何阶段
```

**面试回答模板：**

"Node.js 和浏览器的事件循环有几个关键区别：

首先，Node.js 的事件循环分为 6 个明确的阶段：timers、pending callbacks、idle/prepare、poll、check、close callbacks。每个阶段有特定的任务类型。

其次，Node.js 有 setImmediate 和 process.nextTick 这两个特有的 API。setImmediate 在 check 阶段执行，而 process.nextTick 优先级最高，会在当前阶段结束后立即执行，甚至比 Promise.then 还早。

另外，浏览器每执行完一个宏任务就会清空微任务队列，然后可能进行渲染。而 Node.js 在每个阶段结束时清空微任务队列。

实际开发中，这个区别主要影响到定时器和 I/O 回调的执行顺序，需要特别注意。"

---
:::

::: details 2. CommonJS 和 ES Module 的区别？
**一句话答案：** CommonJS 是运行时同步加载，值的拷贝；ES Module 是编译时静态分析，值的引用，支持 Tree Shaking。

**详细解答：**

| 特性 | CommonJS | ES Module |
|------|----------|-----------|
| 加载时机 | 运行时 | 编译时（静态分析） |
| 加载方式 | 同步 | 异步 |
| 导出值 | 值的拷贝 | 值的引用（动态绑定） |
| this 指向 | 当前模块 | undefined |
| 循环依赖 | 可能得到未完成的导出 | 通过引用解决 |
| Tree Shaking | 不支持 | 支持 |
| 顶层 await | 不支持 | 支持 |

**CommonJS 示例：**

```javascript
// counter.js (CommonJS)
let count = 0;

function increment() {
  count++;
}

function getCount() {
  return count;
}

module.exports = {
  count,      // 导出的是值的拷贝
  increment,
  getCount
};

// main.js
const counter = require('./counter');

console.log(counter.count);  // 0
counter.increment();
console.log(counter.count);  // 0（仍然是 0！因为是值拷贝）
console.log(counter.getCount());  // 1（通过函数获取最新值）
```

**ES Module 示例：**

```javascript
// counter.mjs (ES Module)
export let count = 0;

export function increment() {
  count++;
}

// main.mjs
import { count, increment } from './counter.mjs';

console.log(count);  // 0
increment();
console.log(count);  // 1（值的引用，获取最新值）

// 注意：不能直接修改导入的绑定
// count = 10;  // ❌ 报错：Assignment to constant variable
```

**循环依赖对比：**

```javascript
// CommonJS 循环依赖
// a.js
console.log('a.js 开始');
exports.done = false;
const b = require('./b.js');  // 执行 b.js
console.log('在 a.js 中，b.done =', b.done);
exports.done = true;
console.log('a.js 结束');

// b.js
console.log('b.js 开始');
exports.done = false;
const a = require('./a.js');  // 获取 a.js 的未完成导出
console.log('在 b.js 中，a.done =', a.done);  // false（不完整的值）
exports.done = true;
console.log('b.js 结束');

// 执行 node a.js 输出：
// a.js 开始
// b.js 开始
// 在 b.js 中，a.done = false  ← 获取到未完成的值
// b.js 结束
// 在 a.js 中，b.done = true
// a.js 结束
```

```javascript
// ES Module 循环依赖
// a.mjs
console.log('a.mjs 开始');
export let done = false;
import { done as bDone } from './b.mjs';
console.log('在 a.mjs 中，b.done =', bDone);
done = true;
console.log('a.mjs 结束');

// b.mjs
console.log('b.mjs 开始');
export let done = false;
import { done as aDone } from './a.mjs';
console.log('在 b.mjs 中，a.done =', aDone);  // 引用，后续会更新
done = true;
console.log('b.mjs 结束');

// ES Module 通过引用解决循环依赖问题
// 但需要注意访问时机
```

**Node.js 中使用 ES Module：**

```javascript
// 方式1：使用 .mjs 扩展名
// file.mjs
export const name = 'ES Module';

// 方式2：package.json 设置 type
{
  "type": "module"  // 所有 .js 文件都按 ES Module 处理
}

// 方式3：在 CommonJS 中动态导入 ES Module
// main.cjs
async function loadModule() {
  const module = await import('./esm-module.mjs');
  console.log(module.default);
}
```

**面试回答模板：**

"CommonJS 和 ES Module 的主要区别有以下几点：

第一，加载时机不同。CommonJS 是运行时加载，require 可以写在任何地方，根据代码执行到那里才加载。ES Module 是编译时静态分析，import 必须在模块顶层，这让打包工具可以做 Tree Shaking。

第二，导出值的本质不同。CommonJS 导出的是值的拷贝，模块内部变量变化不会影响已导出的值。ES Module 导出的是值的引用，也叫动态绑定，模块内部变量变化会实时反映到导入方。

第三，处理循环依赖的方式不同。CommonJS 可能获取到不完整的导出，ES Module 通过引用可以更好地处理，但仍需注意访问时机。

第四，ES Module 支持顶层 await，而 CommonJS 不支持。

在 Node.js 中，可以通过 .mjs 扩展名或 package.json 的 type 字段来使用 ES Module。"

---
:::

::: details 3. require 的查找规则是什么？
**一句话答案：** require 按照「核心模块 → 文件模块 → node_modules」的优先级查找，文件模块支持省略扩展名，会依次尝试 .js、.json、.node。

**详细解答：**

```javascript
require('xxx')
```

**查找顺序：**

```
1. 缓存检查
   └─ 已加载过则直接返回缓存

2. 核心模块（内置模块）
   └─ fs, path, http 等，优先级最高

3. 路径模块（以 / ./ ../ 开头）
   ├─ 精确文件匹配
   │   └─ require('./foo.js')
   ├─ 补全扩展名（按顺序尝试）
   │   ├─ .js
   │   ├─ .json
   │   └─ .node
   └─ 目录处理
       ├─ package.json 的 main 字段
       └─ index.js / index.json / index.node

4. node_modules 查找（向上递归）
   ├─ ./node_modules/xxx
   ├─ ../node_modules/xxx
   ├─ ../../node_modules/xxx
   └─ 直到根目录
```

**示例：**

```javascript
// 假设当前文件在 /home/user/project/src/index.js

// 1. 核心模块
const fs = require('fs');  // 直接加载内置模块

// 2. 相对路径
const foo = require('./foo');
// 查找顺序：
// /home/user/project/src/foo.js
// /home/user/project/src/foo.json
// /home/user/project/src/foo.node
// /home/user/project/src/foo/package.json (main 字段)
// /home/user/project/src/foo/index.js

// 3. node_modules
const lodash = require('lodash');
// 查找顺序：
// /home/user/project/src/node_modules/lodash
// /home/user/project/node_modules/lodash
// /home/user/node_modules/lodash
// /home/node_modules/lodash
// /node_modules/lodash
```

**模块缓存机制：**

```javascript
// 模块只会加载一次，后续 require 返回缓存
// a.js
console.log('a.js 被加载');
module.exports = { count: 0 };

// main.js
const a1 = require('./a');  // 输出: a.js 被加载
const a2 = require('./a');  // 不输出（使用缓存）

console.log(a1 === a2);  // true（同一个对象引用）

a1.count = 10;
console.log(a2.count);  // 10

// 清除缓存
delete require.cache[require.resolve('./a')];
const a3 = require('./a');  // 输出: a.js 被加载（重新加载）
```

---
:::

::: details 4. Node.js 中的 Stream 是什么？有哪些类型？
**一句话答案：** Stream 是处理流式数据的抽象接口，分为 Readable（可读流）、Writable（可写流）、Duplex（双工流）、Transform（转换流）四种类型，可以高效处理大文件而不会占用大量内存。

**详细解答：**

**为什么需要 Stream？**

```javascript
// 不使用 Stream：一次性读取整个文件到内存
const fs = require('fs');

// ❌ 大文件会占用大量内存，可能导致内存溢出
fs.readFile('huge-file.txt', (err, data) => {
  // data 是整个文件内容，可能几个 GB
  console.log(data);
});

// ✅ 使用 Stream：分块处理，内存占用小
const readStream = fs.createReadStream('huge-file.txt');
readStream.on('data', (chunk) => {
  // chunk 是一小块数据，默认 64KB
  console.log(`收到 ${chunk.length} 字节`);
});
```

**四种 Stream 类型：**

```javascript
const { Readable, Writable, Duplex, Transform } = require('stream');
const fs = require('fs');
const zlib = require('zlib');
const net = require('net');

// 1. Readable - 可读流（数据源）
// 例如：fs.createReadStream, http.IncomingMessage, process.stdin
const readable = fs.createReadStream('input.txt');
readable.on('data', (chunk) => console.log(chunk));
readable.on('end', () => console.log('读取完成'));

// 2. Writable - 可写流（数据目标）
// 例如：fs.createWriteStream, http.ServerResponse, process.stdout
const writable = fs.createWriteStream('output.txt');
writable.write('Hello ');
writable.write('World');
writable.end();  // 结束写入

// 3. Duplex - 双工流（可读可写，读写独立）
// 例如：net.Socket, TCP 连接
const socket = new net.Socket();
// socket 既可读也可写，但读写的数据是独立的

// 4. Transform - 转换流（可读可写，输出是输入的转换）
// 例如：zlib.createGzip, crypto.createCipher
const gzip = zlib.createGzip();
// 输入数据 → 压缩转换 → 输出压缩后的数据
```

**pipe 管道：**

```javascript
const fs = require('fs');
const zlib = require('zlib');

// 读取文件 → 压缩 → 写入新文件
fs.createReadStream('input.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('input.txt.gz'))
  .on('finish', () => console.log('压缩完成'));

// 相当于
const readable = fs.createReadStream('input.txt');
const gzip = zlib.createGzip();
const writable = fs.createWriteStream('input.txt.gz');

readable.on('data', (chunk) => {
  gzip.write(chunk);
});
readable.on('end', () => {
  gzip.end();
});
gzip.on('data', (chunk) => {
  writable.write(chunk);
});
gzip.on('end', () => {
  writable.end();
});
```

**自定义 Stream：**

```javascript
const { Readable, Writable, Transform } = require('stream');

// 自定义可读流
class CounterStream extends Readable {
  constructor(max) {
    super();
    this.max = max;
    this.current = 0;
  }

  _read() {
    if (this.current <= this.max) {
      this.push(String(this.current++));
    } else {
      this.push(null);  // 结束流
    }
  }
}

const counter = new CounterStream(5);
counter.on('data', (chunk) => console.log(chunk.toString()));
// 输出: 0 1 2 3 4 5

// 自定义转换流
class UpperCaseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
}

process.stdin
  .pipe(new UpperCaseTransform())
  .pipe(process.stdout);
```

---
:::

::: details 5. Buffer 是什么？和 String 有什么区别？
**一句话答案：** Buffer 是 Node.js 用于处理二进制数据的类，在 V8 堆外分配内存；String 是 JavaScript 原生类型，只能处理 UTF-16 编码的文本数据。

**详细解答：**

```javascript
// Buffer 创建
const buf1 = Buffer.alloc(10);           // 创建 10 字节，填充 0
const buf2 = Buffer.alloc(10, 1);        // 创建 10 字节，填充 1
const buf3 = Buffer.allocUnsafe(10);     // 创建 10 字节，不初始化（更快但可能包含旧数据）
const buf4 = Buffer.from([1, 2, 3]);     // 从数组创建
const buf5 = Buffer.from('Hello');       // 从字符串创建（默认 UTF-8）
const buf6 = Buffer.from('Hello', 'utf16le');  // 指定编码

// Buffer 与 String 转换
const buf = Buffer.from('你好世界');
console.log(buf);           // <Buffer e4 bd a0 e5 a5 bd e4 b8 96 e7 95 8c>
console.log(buf.length);    // 12（字节数，UTF-8 中文 3 字节）
console.log(buf.toString()); // 你好世界

const str = '你好世界';
console.log(str.length);    // 4（字符数）

// Buffer 操作
const buf = Buffer.alloc(10);

// 写入
buf.write('Hi');
buf.writeInt32BE(12345, 2);  // 在偏移 2 处写入 32 位整数（大端序）

// 读取
const num = buf.readInt32BE(2);  // 读取 32 位整数

// 切片（共享内存）
const slice = buf.slice(0, 5);
slice[0] = 0xFF;  // 会影响原 buf

// 拷贝（不共享内存）
const copy = Buffer.alloc(5);
buf.copy(copy, 0, 0, 5);

// 拼接
const combined = Buffer.concat([buf1, buf2, buf3]);
```

**实际应用场景：**

```javascript
const fs = require('fs');
const crypto = require('crypto');

// 1. 文件处理
const fileBuffer = fs.readFileSync('image.png');
console.log(fileBuffer.length);  // 文件大小（字节）

// 2. 网络通信
const net = require('net');
const server = net.createServer((socket) => {
  socket.on('data', (buffer) => {
    // 接收的是 Buffer
    console.log(buffer.toString());
  });
});

// 3. 加密
const hash = crypto.createHash('sha256');
hash.update(Buffer.from('password'));
console.log(hash.digest('hex'));

// 4. Base64 编码/解码
const base64 = Buffer.from('Hello World').toString('base64');
console.log(base64);  // SGVsbG8gV29ybGQ=
const original = Buffer.from(base64, 'base64').toString();
console.log(original);  // Hello World
```

---
:::

::: details 6. Node.js 如何处理高并发？
**一句话答案：** Node.js 通过单线程事件循环 + 非阻塞 I/O + 线程池的架构处理高并发，主线程不阻塞，I/O 操作由 libuv 线程池异步处理。

**详细解答：**

```
                    ┌──────────────────┐
                    │   Node.js 进程   │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────▼─────────┐         ┌────────▼────────┐
    │  主线程（V8 引擎） │         │   libuv 线程池  │
    │  - JavaScript 执行 │         │   - 文件 I/O    │
    │  - 事件循环        │         │   - DNS 查询    │
    │  - 回调处理        │         │   - 压缩加密    │
    └─────────┬─────────┘         │   - 默认 4 线程 │
              │                    └────────┬────────┘
              │                             │
              │     ┌───────────────────────┘
              │     │ 完成后通知主线程
              ▼     ▼
    ┌─────────────────────────┐
    │     操作系统内核         │
    │  - 网络 I/O（epoll/kqueue）│
    │  - 非阻塞 socket         │
    └─────────────────────────┘
```

**处理 CPU 密集型任务：**

```javascript
// 问题：CPU 密集型任务会阻塞事件循环
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// ❌ 阻塞主线程
app.get('/fib', (req, res) => {
  const result = fibonacci(40);  // 耗时操作
  res.json({ result });
});

// ✅ 方案1：Worker Threads
const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
  app.get('/fib', (req, res) => {
    const worker = new Worker(__filename, {
      workerData: { n: 40 }
    });
    worker.on('message', (result) => {
      res.json({ result });
    });
  });
} else {
  const { n } = require('worker_threads').workerData;
  const result = fibonacci(n);
  parentPort.postMessage(result);
}

// ✅ 方案2：子进程
const { fork } = require('child_process');

app.get('/fib', (req, res) => {
  const child = fork('./fib-worker.js');
  child.send({ n: 40 });
  child.on('message', (result) => {
    res.json({ result });
  });
});

// ✅ 方案3：Cluster 多进程
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // 主进程：创建工作进程
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // 工作进程：运行服务器
  const http = require('http');
  http.createServer((req, res) => {
    res.end('Hello');
  }).listen(8000);
}
```

---
:::

::: details 7. npm、yarn、pnpm 的区别？
**一句话答案：** npm 是 Node.js 官方包管理器，yarn 解决了早期 npm 的确定性和性能问题，pnpm 通过硬链接和符号链接实现了最高效的磁盘空间利用和安装速度。

**详细解答：**

| 特性 | npm | yarn | pnpm |
|------|-----|------|------|
| 锁文件 | package-lock.json | yarn.lock | pnpm-lock.yaml |
| 安装速度 | 中等 | 快 | 最快 |
| 磁盘空间 | 重复安装 | 重复安装 | 硬链接共享 |
| node_modules 结构 | 扁平化 | 扁平化 | 非扁平（更严格） |
| 幽灵依赖 | 存在 | 存在 | 不存在 |
| Monorepo 支持 | npm workspaces | yarn workspaces | pnpm workspaces |

**幽灵依赖问题：**

```javascript
// package.json 只声明了 express
{
  "dependencies": {
    "express": "^4.18.0"
  }
}

// npm/yarn 扁平化 node_modules 结构
node_modules/
├── express/
├── body-parser/     ← express 的依赖，被提升到顶层
├── cookie/          ← 被提升
└── ...

// ❌ 幽灵依赖：可以使用未声明的包
const bodyParser = require('body-parser');  // 能用，但有风险！

// pnpm 的 node_modules 结构
node_modules/
├── .pnpm/                    ← 所有包的实际存储
│   ├── express@4.18.0/
│   │   └── node_modules/
│   │       ├── express/      ← 实际代码
│   │       └── body-parser → ../.pnpm/body-parser@1.x/...
│   └── body-parser@1.x/
└── express → .pnpm/express@4.18.0/node_modules/express

// ✅ pnpm 中：只能访问直接声明的依赖
const bodyParser = require('body-parser');  // 报错！
```

**常用命令对比：**

```bash
# 安装所有依赖
npm install          # npm
yarn                 # yarn
pnpm install         # pnpm

# 添加依赖
npm install lodash
yarn add lodash
pnpm add lodash

# 添加开发依赖
npm install -D jest
yarn add -D jest
pnpm add -D jest

# 全局安装
npm install -g typescript
yarn global add typescript
pnpm add -g typescript

# 运行脚本
npm run dev
yarn dev
pnpm dev

# 清除缓存
npm cache clean --force
yarn cache clean
pnpm store prune
```

---
:::

::: details 8. package.json 中的重要字段？
**一句话答案：** package.json 是项目的配置文件，重要字段包括 name、version、main、module、exports、type、scripts、dependencies、devDependencies、peerDependencies 等。

**详细解答：**

```json
{
  // 基础信息
  "name": "my-package",           // 包名（npm 发布时必须唯一）
  "version": "1.0.0",             // 版本号（遵循 semver 规范）
  "description": "A sample package",
  "keywords": ["sample", "demo"],
  "author": "Your Name <email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/user/repo.git"
  },

  // 入口配置
  "main": "./dist/index.cjs",      // CommonJS 入口
  "module": "./dist/index.mjs",    // ES Module 入口（bundler 识别）
  "browser": "./dist/index.umd.js", // 浏览器入口
  "types": "./dist/index.d.ts",    // TypeScript 类型声明

  // Node.js 12.7+ 的现代入口配置
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./utils": {
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    }
  },

  // 模块类型
  "type": "module",  // "module" = ES Module, "commonjs" = CommonJS（默认）

  // 脚本
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest",
    "lint": "eslint src",
    "prepare": "husky install",      // npm install 后自动运行
    "prepublishOnly": "npm run build" // npm publish 前自动运行
  },

  // 依赖
  "dependencies": {
    "lodash": "^4.17.21"    // 生产依赖
  },
  "devDependencies": {
    "vite": "^5.0.0"        // 开发依赖
  },
  "peerDependencies": {
    "react": ">=16.8.0"     // 宿主环境需要提供的依赖
  },
  "optionalDependencies": {
    "fsevents": "^2.3.0"    // 可选依赖，安装失败不报错
  },

  // 版本范围
  // ^4.17.21 = 4.x.x（主版本锁定）
  // ~4.17.21 = 4.17.x（次版本锁定）
  // 4.17.21 = 精确版本
  // >=4.0.0 <5.0.0 = 范围
  // * = 任意版本

  // 环境要求
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },

  // 文件配置
  "files": [
    "dist",
    "README.md"
  ],  // npm publish 时包含的文件

  // bin 命令
  "bin": {
    "my-cli": "./bin/cli.js"
  },

  // Monorepo 工作区
  "workspaces": [
    "packages/*"
  ],

  // 浏览器兼容性（供 Babel/Autoprefixer 等工具使用）
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead"
  ],

  // 其他配置
  "sideEffects": false,  // 标记无副作用，支持 Tree Shaking
  "private": true        // 私有包，防止意外发布
}
```

**peerDependencies 详解：**

```json
// 组件库 my-react-component 的 package.json
{
  "name": "my-react-component",
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  }
}

// 用户项目
// npm 7+ 会自动安装 peerDependencies
// 如果版本不匹配会警告
```

---
:::

::: details 9. Node.js 如何调试？
**一句话答案：** Node.js 调试方式包括 console.log、内置调试器（node inspect）、Chrome DevTools（node --inspect）、VS Code 调试器等。

**详细解答：**

```bash
# 1. 内置调试器
node inspect app.js
# 命令：cont(c), next(n), step(s), out(o), repl, watch('expr')

# 2. Chrome DevTools 调试
node --inspect app.js        # 默认 9229 端口
node --inspect-brk app.js    # 在第一行断点

# 打开 Chrome，访问 chrome://inspect
# 或者直接访问 devtools://devtools/bundled/...

# 3. VS Code 调试
# launch.json 配置
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Program",
      "program": "${workspaceFolder}/app.js",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Process",
      "port": 9229
    }
  ]
}
```

**性能分析：**

```bash
# CPU 性能分析
node --prof app.js
node --prof-process isolate-*.log > processed.txt

# 内存分析
node --expose-gc app.js
# 在代码中手动触发 GC
global.gc();

# 堆快照
const v8 = require('v8');
const fs = require('fs');

const snapshotFile = `heap-${Date.now()}.heapsnapshot`;
const snapshot = v8.writeHeapSnapshot(snapshotFile);
```

---
:::

## 核心模块

::: details fs 文件系统
```javascript
const fs = require('fs');
const fsPromises = require('fs/promises');  // Promise 版本

// 同步读取
const content = fs.readFileSync('file.txt', 'utf8');

// 异步读取（回调）
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// 异步读取（Promise）
const data = await fsPromises.readFile('file.txt', 'utf8');

// 写入文件
fs.writeFileSync('output.txt', 'Hello World');
await fsPromises.writeFile('output.txt', 'Hello World');

// 追加内容
fs.appendFileSync('log.txt', 'New log entry\n');

// 检查文件是否存在
const exists = fs.existsSync('file.txt');

// 获取文件信息
const stats = fs.statSync('file.txt');
console.log(stats.isFile());       // true
console.log(stats.isDirectory());  // false
console.log(stats.size);           // 文件大小（字节）
console.log(stats.mtime);          // 修改时间

// 目录操作
fs.mkdirSync('new-folder', { recursive: true });  // 递归创建
fs.readdirSync('folder');  // 读取目录内容
fs.rmdirSync('folder', { recursive: true });  // 递归删除

// 监听文件变化
fs.watch('file.txt', (eventType, filename) => {
  console.log(`${filename} ${eventType}`);
});
```
:::

::: details path 路径
```javascript
const path = require('path');

// 拼接路径（自动处理分隔符）
path.join('/home', 'user', 'file.txt');  // /home/user/file.txt
path.join('/home', '../etc', 'passwd');  // /etc/passwd

// 解析为绝对路径
path.resolve('src', 'index.js');  // /current/working/dir/src/index.js
path.resolve('/home', 'user');    // /home/user

// 路径信息
const filePath = '/home/user/project/index.js';
path.dirname(filePath);   // /home/user/project
path.basename(filePath);  // index.js
path.basename(filePath, '.js');  // index
path.extname(filePath);   // .js

// 解析路径
path.parse(filePath);
// { root: '/', dir: '/home/user/project', base: 'index.js', ext: '.js', name: 'index' }

// 格式化路径对象
path.format({ dir: '/home/user', base: 'file.txt' });  // /home/user/file.txt

// 相对路径
path.relative('/home/user/project', '/home/user/docs');  // ../docs

// 平台相关
path.sep;      // 路径分隔符：'/' (Unix) 或 '\' (Windows)
path.delimiter; // 环境变量分隔符：':' (Unix) 或 ';' (Windows)

// __dirname 和 __filename
console.log(__dirname);   // 当前文件所在目录的绝对路径
console.log(__filename);  // 当前文件的绝对路径

// ES Module 中获取 __dirname
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```
:::

::: details http 服务器
```javascript
const http = require('http');

// 创建服务器
const server = http.createServer((req, res) => {
  // 请求信息
  console.log(req.method);      // GET, POST, etc.
  console.log(req.url);         // 请求路径
  console.log(req.headers);     // 请求头

  // 读取请求体
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });
  req.on('end', () => {
    console.log('请求体:', body);

    // 发送响应
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Hello World' }));
  });
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});

// 发送 HTTP 请求
const options = {
  hostname: 'api.example.com',
  port: 443,
  path: '/users',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(JSON.parse(data));
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.end();
```
:::

::: details events 事件
```javascript
const EventEmitter = require('events');

// 创建事件发射器
const emitter = new EventEmitter();

// 监听事件
emitter.on('greet', (name) => {
  console.log(`Hello, ${name}!`);
});

// 只监听一次
emitter.once('connect', () => {
  console.log('Connected!');
});

// 触发事件
emitter.emit('greet', 'World');  // Hello, World!
emitter.emit('connect');         // Connected!
emitter.emit('connect');         // （不输出，因为只监听一次）

// 移除监听器
const handler = () => console.log('event');
emitter.on('event', handler);
emitter.removeListener('event', handler);

// 自定义事件类
class MyEmitter extends EventEmitter {
  constructor() {
    super();
    this.data = [];
  }

  addItem(item) {
    this.data.push(item);
    this.emit('itemAdded', item);
  }
}

const myEmitter = new MyEmitter();
myEmitter.on('itemAdded', (item) => {
  console.log(`New item: ${item}`);
});
myEmitter.addItem('Apple');  // New item: Apple
```
:::

::: details child_process 子进程
```javascript
const { exec, execFile, spawn, fork } = require('child_process');

// exec - 执行 shell 命令（有缓冲区限制）
exec('ls -la', (error, stdout, stderr) => {
  if (error) {
    console.error(`执行错误: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});

// execFile - 执行可执行文件（不经过 shell，更安全）
execFile('node', ['--version'], (error, stdout) => {
  console.log(`Node.js 版本: ${stdout}`);
});

// spawn - 流式处理，适合大量数据
const ls = spawn('ls', ['-la']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`子进程退出码: ${code}`);
});

// fork - 专门用于创建 Node.js 子进程
// parent.js
const child = fork('./child.js');

child.on('message', (msg) => {
  console.log('收到子进程消息:', msg);
});

child.send({ hello: 'world' });

// child.js
process.on('message', (msg) => {
  console.log('收到父进程消息:', msg);
  process.send({ received: true });
});
```
:::
