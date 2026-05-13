# 网络协议面试题精选

> 汇总 HTTP、TCP/UDP、WebSocket、跨域、网络安全、DNS、SSE 等高频面试题。

## HTTP 协议

::: details 1. HTTP/1.1、HTTP/2、HTTP/3 的核心区别？
| 特性 | HTTP/1.1 | HTTP/2 | HTTP/3 |
|------|---------|--------|--------|
| 传输协议 | TCP | TCP | QUIC（基于 UDP） |
| 多路复用 | 无（队头阻塞） | 有（同一连接并发） | 有（流级别隔离） |
| 头部压缩 | 无 | HPACK | QPACK |
| 服务器推送 | 无 | 支持 | 支持 |
| 队头阻塞 | 有 | TCP 层仍有 | 彻底解决 |
| 连接建立 | 1-RTT | 1-RTT | 0-RTT（已知服务器） |

---
:::

::: details 2. HTTPS 的工作原理？TLS 握手过程？
**HTTPS = HTTP + TLS**，通过非对称加密交换密钥，再用对称加密传输数据。

**TLS 1.3 握手（1-RTT）：**
1. Client Hello：发送支持的加密套件、随机数
2. Server Hello：选定加密套件、发送证书、随机数
3. 客户端验证证书（CA 链验证）
4. 双方用 ECDHE 算法生成会话密钥
5. 后续通信用对称加密（AES）

**为什么用非对称 + 对称混合加密？** 非对称加密安全但慢，只用于密钥交换；对称加密快，用于实际数据传输。

---
:::

::: details 3. HTTP 缓存机制？强缓存和协商缓存的区别？
**强缓存**（不请求服务器，直接用缓存）：
- `Cache-Control: max-age=3600`（优先级高）
- `Expires: Wed, 21 Oct 2025 07:28:00 GMT`（绝对时间，已过时）

**协商缓存**（请求服务器验证，未变化返回 304）：
- `ETag` / `If-None-Match`：基于内容哈希（精确，优先级高）
- `Last-Modified` / `If-Modified-Since`：基于修改时间（精度到秒）

**缓存位置优先级**：Service Worker → Memory Cache → Disk Cache → Push Cache

**常用策略**：
- HTML：`no-cache`（每次协商）
- JS/CSS（带 hash）：`max-age=31536000, immutable`（永久缓存）
- API：`no-store`（不缓存）

---
:::

::: details 4. HTTP 常见状态码？
| 状态码 | 含义 |
|--------|------|
| 200 | 成功 |
| 301 | 永久重定向（浏览器缓存新地址） |
| 302 | 临时重定向 |
| 304 | 协商缓存命中，内容未变 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 405 | 方法不允许 |
| 500 | 服务器内部错误 |
| 502 | 网关错误（上游服务异常） |
| 503 | 服务不可用 |

---
:::

::: details 5. GET 和 POST 的区别？
| 特性 | GET | POST |
|------|-----|------|
| 语义 | 获取资源 | 提交数据 |
| 参数位置 | URL 查询字符串 | 请求体 |
| 幂等性 | 幂等（多次结果相同） | 非幂等 |
| 缓存 | 可缓存 | 不可缓存 |
| 安全性 | 参数暴露在 URL | 相对安全 |
| 数据大小 | URL 有长度限制 | 无限制 |

**本质区别**：语义不同，GET 用于查询，POST 用于变更。

---
:::

::: details 6. Cookie、Session、Token（JWT）的区别？
| 特性 | Cookie | Session | JWT |
|------|--------|---------|-----|
| 存储位置 | 客户端 | 服务端 | 客户端 |
| 安全性 | 较低（可被篡改） | 较高 | 中（签名防篡改） |
| 服务端状态 | 无状态 | 有状态 | 无状态 |
| 扩展性 | 好 | 差（分布式需共享 Session） | 好 |
| 大小 | 4KB | 无限制 | 较大（含 payload） |

**JWT 结构**：`Header.Payload.Signature`，服务端用密钥签名，无需存储。

---
:::

## TCP/UDP

::: details 7. TCP 三次握手和四次挥手的过程？为什么？
**三次握手：**
```
客户端 → SYN(seq=x)          → 服务端  [SYN_SENT]
客户端 ← SYN+ACK(seq=y,ack=x+1) ← 服务端  [SYN_RCVD]
客户端 → ACK(ack=y+1)        → 服务端  [ESTABLISHED]
```
**为什么三次？** 确认双方的发送和接收能力都正常。两次不够（服务端无法确认客户端能收到），四次多余。

**四次挥手：**
```
客户端 → FIN → 服务端   （客户端不再发送数据）
客户端 ← ACK ← 服务端   （服务端确认，但可能还有数据要发）
客户端 ← FIN ← 服务端   （服务端数据发完，请求关闭）
客户端 → ACK → 服务端   （客户端确认，等待 2MSL 后关闭）
```
**为什么四次？** TCP 全双工，两个方向需要分别关闭，服务端的 ACK 和 FIN 不能合并（中间可能还有数据）。

---
:::

::: details 8. TCP 和 UDP 的区别？各适用什么场景？
| 特性 | TCP | UDP |
|------|-----|-----|
| 连接 | 面向连接 | 无连接 |
| 可靠性 | 可靠（重传、排序、流控） | 不可靠 |
| 速度 | 较慢 | 快 |
| 头部开销 | 20 字节 | 8 字节 |
| 适用场景 | HTTP、文件传输、邮件 | 视频直播、DNS、游戏、WebRTC |

---
:::

## 跨域

::: details 9. 什么是同源策略？跨域有哪些解决方案？
**同源**：协议 + 域名 + 端口完全相同。同源策略限制：Cookie/DOM 访问、AJAX 请求。

**解决方案：**

| 方案 | 原理 | 适用场景 |
|------|------|---------|
| **CORS** | 服务端设置响应头允许跨域 | 最通用，推荐 |
| **代理服务器** | 同源代理转发请求 | 开发环境（Vite/Webpack proxy） |
| **JSONP** | 利用 `<script>` 不受同源限制 | 仅 GET，已过时 |
| **postMessage** | 跨窗口通信 | iframe 通信 |
| **WebSocket** | 不受同源策略限制 | 实时通信 |

---
:::

::: details 10. CORS 简单请求和预检请求的区别？
**简单请求**（直接发送）：
- 方法：GET / POST / HEAD
- Content-Type：`text/plain` / `multipart/form-data` / `application/x-www-form-urlencoded`

**预检请求**（先发 OPTIONS）：
- 其他方法（PUT、DELETE）或自定义请求头
- Content-Type 为 `application/json` 等

**服务端关键响应头：**
```
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400  // 预检结果缓存时间
```

---
:::

## 网络安全

::: details 11. XSS 攻击的类型和防御？
**三种类型：**
- **存储型**：恶意脚本存入数据库，所有用户访问时执行（最危险）
- **反射型**：恶意脚本在 URL 中，服务端反射到响应
- **DOM 型**：前端 JS 直接操作 DOM 注入脚本

**防御：**
1. **输出转义**：`<` → `&lt;`，`>` → `&gt;`（最重要）
2. **使用安全 API**：`textContent` 代替 `innerHTML`
3. **CSP**：`Content-Security-Policy` 限制脚本来源
4. **HttpOnly Cookie**：防止 JS 读取 Cookie

---
:::

::: details 12. CSRF 攻击原理和防御？
**原理**：攻击者诱导用户访问恶意页面，利用用户已登录的 Cookie 发起伪造请求。

**防御：**
1. **CSRF Token**：请求中携带服务端生成的随机 Token，攻击者无法获取
2. **SameSite Cookie**：`SameSite=Strict/Lax` 限制第三方携带 Cookie
3. **验证 Origin/Referer**：检查请求来源
4. **双重 Cookie**：将 Token 同时放在 Cookie 和请求参数中

**XSS vs CSRF**：XSS 是注入脚本攻击用户，CSRF 是伪造用户请求攻击服务器。

---
:::

## DNS

::: details 13. DNS 解析的完整流程？
```
浏览器缓存 → OS 缓存 → hosts 文件 → 本地 DNS 服务器
    → 根域名服务器（.）→ 顶级域名服务器（.com）→ 权威 DNS 服务器
```

**递归查询 vs 迭代查询：**
- 递归：客户端只问本地 DNS，本地 DNS 负责完成整个查询
- 迭代：本地 DNS 逐级查询，每次返回下一级地址

**DNS 预解析优化：**
```html
<link rel="dns-prefetch" href="//cdn.example.com">
```

---
:::

## WebSocket 与 SSE

::: details 14. WebSocket 和 HTTP 的区别？
| 特性 | HTTP | WebSocket |
|------|------|-----------|
| 通信方式 | 请求-响应（单向） | 全双工（双向） |
| 连接 | 短连接（HTTP/1.1 可复用） | 长连接 |
| 服务端推送 | 不支持 | 支持 |
| 协议 | `http://` | `ws://` / `wss://` |
| 握手 | HTTP 请求 | HTTP Upgrade（101） |

**适用场景**：聊天室、实时协作、游戏、股票行情。

---
:::

::: details 15. SSE、WebSocket、轮询如何选择？
| 方案 | 方向 | 协议 | 适用场景 |
|------|------|------|---------|
| 短轮询 | 客户端拉取 | HTTP | 简单场景，实时性要求低 |
| 长轮询 | 客户端拉取 | HTTP | 实时性要求中等 |
| SSE | 服务端推送（单向） | HTTP | 消息推送、AI 流式输出 |
| WebSocket | 双向 | WS | 聊天、实时协作、游戏 |

**SSE 优势**：基于 HTTP，自动重连，实现简单，支持 HTTP/2 多路复用。
:::
