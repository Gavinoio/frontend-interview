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

