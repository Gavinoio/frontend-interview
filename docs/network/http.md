# HTTP/HTTPS 详解

## HTTP 协议详解

### HTTP 报文结构

```
请求报文:
GET /api/users HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
Accept: application/json
Cookie: session=abc123

[请求体]

响应报文:
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 123
Set-Cookie: token=xyz

{"data": "..."}
```

### HTTP/1.0 vs HTTP/1.1 vs HTTP/2 vs HTTP/3

| 特性 | HTTP/1.0 | HTTP/1.1 | HTTP/2 | HTTP/3 |
|------|----------|----------|--------|--------|
| 连接 | 短连接 | 长连接(Keep-Alive) | 多路复用 | 多路复用 |
| 队头阻塞 | 有 | 有 | 无(应用层) | 无 |
| 传输协议 | TCP | TCP | TCP | UDP(QUIC) |
| 头部压缩 | 无 | 无 | HPACK | QPACK |
| 服务器推送 | 无 | 无 | 支持 | 支持 |
| 二进制分帧 | 无 | 无 | 支持 | 支持 |

### HTTP/2 核心特性

```javascript
// 1. 多路复用 - 一个TCP连接处理多个请求
// HTTP/1.1: 6个并发连接
// HTTP/2: 1个连接,无限请求

// 2. 头部压缩
// 使用 HPACK 算法压缩头部

// 3. 服务器推送
// 服务器主动推送资源
Link: </style.css>; rel=preload; as=style

// 4. 二进制分帧
// 将数据分割成更小的帧
```

### HTTPS 握手详细过程

```javascript
/*
1. Client Hello
   客户端 → 服务器
   - 支持的TLS版本
   - 支持的加密套件列表
   - 客户端随机数(Client Random)

2. Server Hello
   服务器 → 客户端
   - 选择的TLS版本
   - 选择的加密套件
   - 服务器随机数(Server Random)
   - 服务器证书(包含公钥)

3. 客户端验证证书
   - 检查证书是否由可信CA签发
   - 检查证书是否过期
   - 检查域名是否匹配
   - 检查证书是否被吊销

4. Client Key Exchange
   客户端 → 服务器
   - 生成预主密钥(Pre-Master Secret)
   - 用服务器公钥加密
   - 发送给服务器

5. 生成会话密钥
   双方使用相同算法生成:
   Session Key = F(Client Random, Server Random, Pre-Master Secret)

6. Change Cipher Spec
   双方确认使用会话密钥加密通信

7. Finished
   双方发送加密的握手完成消息

8. 开始加密通信
   使用对称加密(AES)传输数据
*/

// 为什么要这么复杂?
/*
- 非对称加密(RSA): 安全但慢 → 用于交换密钥
- 对称加密(AES): 快但密钥交换不安全 → 用于数据传输
- 结合两者优势
*/
```

## HTTP 缓存详解

### 强缓存 vs 协商缓存

```javascript
// 完整流程
1. 浏览器发起请求
2. 检查是否有缓存
3. 有缓存:
   a. 检查强缓存(Cache-Control/Expires)
      - 未过期: 200 from disk cache
      - 已过期: 进入协商缓存
   b. 协商缓存(ETag/Last-Modified)
      - 304: 使用缓存
      - 200: 返回新内容
4. 无缓存: 正常请求

// Nginx 配置示例
location ~* \.(css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \.(jpg|png)$ {
    expires 30d;
    add_header Cache-Control "public";
}

location / {
    add_header Cache-Control "no-cache";
    etag on;
}
```

### 缓存最佳实践

```javascript
// 1. HTML: 协商缓存
Cache-Control: no-cache
ETag: "abc123"

// 2. 带hash的静态资源: 强缓存
// main.abc123.js
Cache-Control: max-age=31536000, immutable

// 3. 不带hash的静态资源: 短期强缓存
Cache-Control: max-age=86400

// 4. API接口: 不缓存
Cache-Control: no-store

// 5. 用户相关内容: 私有缓存
Cache-Control: private, max-age=3600
```

## 实战案例

### HTTP请求封装

```javascript
class HttpClient {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL;
    this.timeout = options.timeout || 10000;
    this.interceptors = {
      request: [],
      response: []
    };
  }

  // 请求拦截器
  useRequestInterceptor(fn) {
    this.interceptors.request.push(fn);
  }

  // 响应拦截器
  useResponseInterceptor(fn) {
    this.interceptors.response.push(fn);
  }

  async request(url, options = {}) {
    // 完整URL
    const fullURL = `${this.baseURL}${url}`;

    // 应用请求拦截器
    let config = { url: fullURL, ...options };
    for (const interceptor of this.interceptors.request) {
      config = await interceptor(config);
    }

    // 超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      let response = await fetch(config.url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // 应用响应拦截器
      for (const interceptor of this.interceptors.response) {
        response = await interceptor(response);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  get(url, options) {
    return this.request(url, { ...options, method: 'GET' });
  }

  post(url, data, options) {
    return this.request(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      body: JSON.stringify(data)
    });
  }

  put(url, data, options) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      body: JSON.stringify(data)
    });
  }

  delete(url, options) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

// 使用
const http = new HttpClient('https://api.example.com');

// 请求拦截: 添加token
http.useRequestInterceptor((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return config;
});

// 响应拦截: 统一错误处理
http.useResponseInterceptor(async (response) => {
  if (response.status === 401) {
    // 跳转登录
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
});

// 发起请求
const users = await http.get('/users');
const newUser = await http.post('/users', { name: 'Alice' });
```

## HTTP 方法详解

### 常用 HTTP 方法

```javascript
/*
方法       | 用途                 | 幂等性 | 安全性 | 请求体
---------|---------------------|-------|-------|-------
GET      | 获取资源             | 是     | 是     | 无
POST     | 创建资源             | 否     | 否     | 有
PUT      | 完整替换资源         | 是     | 否     | 有
PATCH    | 部分更新资源         | 否     | 否     | 有
DELETE   | 删除资源             | 是     | 否     | 可选
HEAD     | 获取响应头           | 是     | 是     | 无
OPTIONS  | 获取支持的方法       | 是     | 是     | 无

幂等性: 多次请求结果相同
安全性: 不修改服务器数据
*/

// RESTful API 设计示例
const api = {
  // 获取用户列表
  'GET /users': '返回所有用户',
  // 获取单个用户
  'GET /users/:id': '返回指定用户',
  // 创建用户
  'POST /users': '创建新用户，返回创建的用户',
  // 完整更新用户
  'PUT /users/:id': '替换整个用户对象',
  // 部分更新用户
  'PATCH /users/:id': '更新用户部分字段',
  // 删除用户
  'DELETE /users/:id': '删除指定用户'
}
```

### GET vs POST

```javascript
/*
        GET                          POST
----------------------------------------------------------
数据位置  URL查询字符串                请求体
数据大小  URL限制(约2KB-8KB)          理论无限制
缓存     可以被缓存                   默认不缓存
历史记录  保存在浏览器历史             不保存
书签     可以收藏                     不能收藏
编码     只支持ASCII                  支持多种编码
安全性   数据暴露在URL                相对更安全
幂等性   是                          否
*/

// GET 适用场景
// - 获取数据
// - 搜索查询
// - 分页请求

// POST 适用场景
// - 提交表单
// - 文件上传
// - 创建资源
// - 敏感数据传输
```

## HTTP 状态码

### 常见状态码分类

```javascript
/*
1xx - 信息响应
  100 Continue          继续请求
  101 Switching Protocols 协议切换(如 WebSocket)

2xx - 成功
  200 OK                请求成功
  201 Created           资源创建成功(POST)
  204 No Content        成功但无返回内容(DELETE)
  206 Partial Content   部分内容(断点续传)

3xx - 重定向
  301 Moved Permanently  永久重定向(GET)
  302 Found             临时重定向(可能改变方法)
  303 See Other         重定向到另一个URL(GET)
  304 Not Modified      资源未修改(协商缓存)
  307 Temporary Redirect 临时重定向(保持方法)
  308 Permanent Redirect 永久重定向(保持方法)

4xx - 客户端错误
  400 Bad Request       请求语法错误
  401 Unauthorized      未认证
  403 Forbidden         禁止访问
  404 Not Found         资源不存在
  405 Method Not Allowed 方法不允许
  408 Request Timeout   请求超时
  409 Conflict          资源冲突
  413 Payload Too Large 请求体过大
  414 URI Too Long      URL过长
  415 Unsupported Media Type 不支持的媒体类型
  429 Too Many Requests 请求过多(限流)

5xx - 服务器错误
  500 Internal Server Error 服务器内部错误
  501 Not Implemented   功能未实现
  502 Bad Gateway       网关错误
  503 Service Unavailable 服务不可用
  504 Gateway Timeout   网关超时
*/
```

### 重定向详解

```javascript
/*
301 vs 302 vs 307 vs 308

301 Moved Permanently (HTTP/1.0)
- 永久重定向
- 浏览器可能将 POST 改为 GET
- 搜索引擎会更新索引

302 Found (HTTP/1.0)
- 临时重定向
- 浏览器可能将 POST 改为 GET
- 实际使用中行为不一致

307 Temporary Redirect (HTTP/1.1)
- 临时重定向
- 严格保持原请求方法
- 不允许改变请求方法

308 Permanent Redirect (HTTP/1.1)
- 永久重定向
- 严格保持原请求方法
*/

// Node.js 重定向示例
res.writeHead(301, { Location: 'https://new-url.com' });
res.end();

// Express 重定向
app.get('/old', (req, res) => {
  res.redirect(301, '/new');
});
```

## HTTP Headers

### 常用请求头

```javascript
/*
通用头部
  Cache-Control    缓存控制
  Connection       连接管理
  Date             创建时间

请求头部
  Accept           可接受的内容类型
  Accept-Encoding  可接受的编码(gzip, deflate)
  Accept-Language  可接受的语言
  Authorization    认证信息
  Cookie           Cookie数据
  Host             请求的主机
  If-Modified-Since 协商缓存
  If-None-Match    协商缓存(ETag)
  Origin           请求来源(CORS)
  Referer          来源页面
  User-Agent       客户端信息

响应头部
  Access-Control-* CORS相关
  Content-Type     内容类型
  Content-Length   内容长度
  Content-Encoding 内容编码
  ETag             资源标识
  Last-Modified    最后修改时间
  Location         重定向地址
  Set-Cookie       设置Cookie
  Cache-Control    缓存控制
*/

// Content-Type 常见值
const contentTypes = {
  'text/html': 'HTML文档',
  'text/plain': '纯文本',
  'text/css': 'CSS样式表',
  'application/json': 'JSON数据',
  'application/javascript': 'JavaScript',
  'application/xml': 'XML数据',
  'application/x-www-form-urlencoded': '表单数据',
  'multipart/form-data': '文件上传',
  'image/png': 'PNG图片',
  'image/jpeg': 'JPEG图片'
}
```

### Cookie 与 Session

```javascript
// Cookie 属性
/*
Set-Cookie: name=value;
  Domain=example.com;     作用域名
  Path=/;                 作用路径
  Expires=<date>;         过期时间(绝对)
  Max-Age=<seconds>;      过期时间(相对)
  Secure;                 仅HTTPS
  HttpOnly;               禁止JS访问
  SameSite=Strict|Lax|None; 跨站限制
*/

// 服务端设置 Cookie
res.setHeader('Set-Cookie', [
  'sessionId=abc123; HttpOnly; Secure; SameSite=Strict',
  'theme=dark; Max-Age=31536000; Path=/'
]);

// 客户端读取 Cookie
document.cookie; // 无法读取 HttpOnly 的 Cookie

// SameSite 属性
/*
Strict: 完全禁止第三方 Cookie
  - 从外部链接进入也不携带

Lax (默认): 宽松模式
  - GET 请求携带
  - POST/iframe/AJAX/Image 不携带

None: 允许第三方 Cookie
  - 必须同时设置 Secure
*/

// Session vs Cookie
/*
        Cookie                    Session
----------------------------------------------
存储位置  客户端                    服务端
安全性   不安全(可被篡改)          相对安全
大小限制  4KB                      无限制(服务端内存)
性能     不占服务器资源            占用服务器资源
跨域     受限                      依赖Cookie

实际应用通常结合使用:
- Cookie存储SessionID
- Session存储用户数据
*/
```

## TCP 与 HTTP

### TCP 三次握手

```javascript
/*
三次握手过程:

1. 客户端 → SYN → 服务端
   客户端发送 SYN 包(seq=x)
   客户端状态: CLOSED → SYN_SENT

2. 服务端 → SYN+ACK → 客户端
   服务端发送 SYN+ACK 包(seq=y, ack=x+1)
   服务端状态: LISTEN → SYN_RCVD

3. 客户端 → ACK → 服务端
   客户端发送 ACK 包(ack=y+1)
   客户端状态: SYN_SENT → ESTABLISHED
   服务端状态: SYN_RCVD → ESTABLISHED

为什么是三次?
- 两次: 服务端无法确认客户端收到响应
- 四次: 浪费资源，三次足够确认双向通信能力
*/
```

### TCP 四次挥手

```javascript
/*
四次挥手过程:

1. 客户端 → FIN → 服务端
   客户端请求断开连接
   客户端状态: ESTABLISHED → FIN_WAIT_1

2. 服务端 → ACK → 客户端
   服务端确认收到
   服务端状态: ESTABLISHED → CLOSE_WAIT
   客户端状态: FIN_WAIT_1 → FIN_WAIT_2

3. 服务端 → FIN → 客户端
   服务端也请求断开
   服务端状态: CLOSE_WAIT → LAST_ACK

4. 客户端 → ACK → 服务端
   客户端确认收到
   客户端状态: FIN_WAIT_2 → TIME_WAIT → CLOSED
   服务端状态: LAST_ACK → CLOSED

为什么是四次?
- TCP是全双工，需要双向都关闭
- 服务端可能还有数据要发送，不能立即关闭

TIME_WAIT 状态(2MSL):
- 确保最后一个ACK能到达服务端
- 让旧连接的数据包过期
*/
```

### Keep-Alive

```javascript
/*
HTTP/1.0: 默认短连接
  - 每次请求都要三次握手
  - 需要手动添加 Connection: keep-alive

HTTP/1.1: 默认长连接
  - Connection: keep-alive (默认)
  - 多个请求复用同一个TCP连接
  - Connection: close 关闭长连接

配置参数:
  Keep-Alive: timeout=5, max=100
  - timeout: 空闲超时时间(秒)
  - max: 最大请求数

Nginx 配置:
  keepalive_timeout 65;
  keepalive_requests 100;
*/
```

## WebSocket

### WebSocket 基础

```javascript
/*
WebSocket vs HTTP:
- HTTP: 请求-响应模式，单向通信
- WebSocket: 全双工通信，服务器可主动推送

WebSocket 连接过程:
1. 客户端发送 HTTP 升级请求
   GET /chat HTTP/1.1
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==
   Sec-WebSocket-Version: 13

2. 服务端响应
   HTTP/1.1 101 Switching Protocols
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Accept: HSmrc0sMlYUkAGmm5OPpG2HaGWk=

3. 建立 WebSocket 连接
*/

// 客户端使用
const ws = new WebSocket('wss://example.com/socket');

ws.onopen = () => {
  console.log('连接已建立');
  ws.send('Hello Server!');
};

ws.onmessage = (event) => {
  console.log('收到消息:', event.data);
};

ws.onerror = (error) => {
  console.error('WebSocket错误:', error);
};

ws.onclose = (event) => {
  console.log('连接已关闭', event.code, event.reason);
};

// 发送消息
ws.send('Hello');
ws.send(JSON.stringify({ type: 'message', data: 'Hello' }));

// 关闭连接
ws.close(1000, '正常关闭');

// 心跳保活
let heartbeatTimer;

function startHeartbeat() {
  heartbeatTimer = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }));
    }
  }, 30000);
}

function stopHeartbeat() {
  clearInterval(heartbeatTimer);
}
```

### WebSocket 封装

```javascript
class WebSocketClient {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      reconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      ...options
    };
    this.ws = null;
    this.reconnectAttempts = 0;
    this.handlers = new Map();
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('WebSocket 连接成功');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.emit('open');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'pong') return;
      this.emit('message', data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket 错误:', error);
      this.emit('error', error);
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket 关闭:', event.code);
      this.stopHeartbeat();
      this.emit('close', event);
      this.tryReconnect();
    };
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'ping' });
    }, this.options.heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
  }

  tryReconnect() {
    if (!this.options.reconnect) return;
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.log('达到最大重连次数');
      return;
    }

    this.reconnectAttempts++;
    console.log(`尝试重连 (${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, this.options.reconnectInterval);
  }

  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  on(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event).push(handler);
  }

  emit(event, data) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  close() {
    this.options.reconnect = false;
    this.ws.close();
  }
}

// 使用
const ws = new WebSocketClient('wss://api.example.com/ws');

ws.on('message', (data) => {
  console.log('收到消息:', data);
});

ws.send({ type: 'subscribe', channel: 'news' });
```

## 面试题

::: details 1. 说说 HTTPS 的工作原理
<details>
<summary>点击查看答案</summary>

**核心原理**: 非对称加密 + 对称加密

**详细过程**:
1. 客户端发起HTTPS请求
2. 服务器返回证书(包含公钥)
3. 客户端验证证书合法性
4. 客户端生成随机密钥,用公钥加密发送
5. 服务器用私钥解密,得到密钥
6. 双方使用这个密钥进行对称加密通信

**为什么不全程使用非对称加密?**
- 非对称加密性能差,不适合大量数据传输
- 只用于交换对称加密的密钥
- 数据传输使用对称加密(AES)

**CA证书的作用?**
- 防止中间人攻击
- 证明服务器身份真实性
- 由权威机构签发
:::

</details>

::: details 2. HTTP/2 相比 HTTP/1.1 有哪些优势?
<details>
<summary>点击查看答案</summary>

**核心优势**:

1. **多路复用**
   - HTTP/1.1: 一个TCP连接同时只能处理一个请求
   - HTTP/2: 一个TCP连接可以并发处理多个请求
   - 解决了队头阻塞问题

2. **头部压缩**
   - 使用HPACK算法压缩头部
   - 减少冗余数据传输

3. **服务器推送**
   - 服务器可以主动推送资源
   - 减少客户端请求次数

4. **二进制分帧**
   - HTTP/1.1是文本协议
   - HTTP/2是二进制协议,解析更高效

**实际性能提升**:
- 减少延迟30-40%
- 页面加载速度提升15-50%
:::

</details>

::: details 3. 如何实现请求取消?
<details>
<summary>点击查看答案</summary>

**使用 AbortController**:

```javascript
// 创建控制器
const controller = new AbortController();
const signal = controller.signal;

// 发起请求
fetch('/api/data', { signal })
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(error => {
    if (error.name === 'AbortError') {
      console.log('请求已取消');
    }
  });

// 取消请求
controller.abort();

// 实际应用: 搜索防抖
let controller = null;

function search(keyword) {
  // 取消上一次请求
  if (controller) {
    controller.abort();
  }

  controller = new AbortController();

  fetch(`/api/search?q=${keyword}`, { signal: controller.signal })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      controller = null;
    })
    .catch(error => {
      if (error.name !== 'AbortError') {
        console.error(error);
      }
    });
}
```
:::

</details>

::: details 4. 说说 GET 和 POST 的区别
<details>
<summary>点击查看答案</summary>

**本质区别**：语义不同
- GET：获取资源，幂等
- POST：提交数据，非幂等

**主要区别**：

| 特性 | GET | POST |
|------|-----|------|
| 数据位置 | URL 参数 | 请求体 |
| 数据长度 | URL 长度限制 | 理论无限制 |
| 安全性 | 数据暴露在URL | 相对安全 |
| 缓存 | 可缓存 | 默认不缓存 |
| 历史记录 | 保存在浏览器 | 不保存 |
| 书签 | 可收藏 | 不能收藏 |
| 幂等性 | 是 | 否 |
| 编码 | ASCII | 支持多种 |

**注意**：
- POST 不比 GET 更安全，都是明文传输
- 要真正安全需要使用 HTTPS
- RESTful 中按语义选择方法
:::

</details>

::: details 5. 说说 HTTP 缓存策略
<details>
<summary>点击查看答案</summary>

**两种缓存类型**：

1. **强缓存**
   - 不发请求，直接使用缓存
   - 响应码：200 (from disk/memory cache)
   - 相关头部：
     - `Expires`：过期时间（绝对时间）
     - `Cache-Control`：缓存控制（优先级更高）

```javascript
// Cache-Control 常用值
Cache-Control: max-age=31536000    // 缓存1年
Cache-Control: no-cache            // 需要验证
Cache-Control: no-store            // 不缓存
Cache-Control: public              // 可被代理缓存
Cache-Control: private             // 只能浏览器缓存
Cache-Control: immutable           // 不会变化
```

2. **协商缓存**
   - 发请求验证资源是否更新
   - 响应码：304 Not Modified
   - 相关头部：
     - `Last-Modified` / `If-Modified-Since`
     - `ETag` / `If-None-Match`（优先级更高）

**最佳实践**：
- HTML：协商缓存（no-cache）
- 带 hash 的静态资源：强缓存一年（immutable）
- 不带 hash 的静态资源：短期强缓存
- API：不缓存（no-store）
:::

</details>

::: details 6. 说说 TCP 三次握手和四次挥手
<details>
<summary>点击查看答案</summary>

**三次握手**（建立连接）：
```
1. 客户端 → SYN → 服务端     // 客户端请求连接
2. 服务端 → SYN+ACK → 客户端 // 服务端确认并请求连接
3. 客户端 → ACK → 服务端     // 客户端确认
```

为什么是三次？
- 确认双方的发送和接收能力
- 两次无法确认客户端的接收能力
- 防止已失效的请求报文突然传到服务端

**四次挥手**（断开连接）：
```
1. 客户端 → FIN → 服务端     // 客户端请求断开
2. 服务端 → ACK → 客户端     // 服务端确认
3. 服务端 → FIN → 客户端     // 服务端请求断开
4. 客户端 → ACK → 服务端     // 客户端确认
```

为什么是四次？
- TCP 是全双工，需要双向都关闭
- 服务端收到 FIN 后可能还有数据要发送
- 所以 ACK 和 FIN 分开发送

TIME_WAIT 状态：
- 持续 2MSL（最大报文生存时间）
- 确保最后的 ACK 到达服务端
- 让旧连接的数据包过期
:::

</details>

::: details 7. HTTP/1.1 的队头阻塞问题
<details>
<summary>点击查看答案</summary>

**什么是队头阻塞**：
- 同一个 TCP 连接中，前面的请求阻塞会影响后续请求
- HTTP/1.1 虽然支持 Pipeline，但响应必须按顺序

**HTTP/1.1 的解决方案**：
- 建立多个 TCP 连接（通常 6 个）
- 域名分片（资源放在多个域名）
- 合并请求（雪碧图、打包）

**HTTP/2 的解决方案**：
- 多路复用：一个 TCP 连接处理多个请求
- 二进制分帧：将数据分成帧，可以交错发送
- 流的概念：每个请求是一个流，互不影响

**HTTP/3 的解决方案**：
- 使用 QUIC 协议（基于 UDP）
- 完全解决队头阻塞
- 单个流丢包不影响其他流
:::

</details>

::: details 8. 说说 Cookie、Session、Token 的区别
<details>
<summary>点击查看答案</summary>

**Cookie**：
- 存储在客户端
- 每次请求自动携带
- 大小限制 4KB
- 可设置过期时间
- 安全性较低

**Session**：
- 存储在服务端
- 通过 Cookie 中的 SessionID 标识
- 大小无限制
- 占用服务器资源
- 安全性较高

**Token（JWT）**：
- 存储在客户端
- 需要手动携带（通常放 Header）
- 无状态，不占服务器资源
- 可携带用户信息
- 适合分布式系统

**选择建议**：
- 传统网站：Session + Cookie
- 前后端分离：Token（JWT）
- 移动端：Token（JWT）
- 需要用户状态：Session
- 无状态场景：Token

```javascript
// JWT 结构
// Header.Payload.Signature
// eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.xxx

// 使用示例
fetch('/api/data', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```
:::

</details>

::: details 9. WebSocket 和 HTTP 的区别
<details>
<summary>点击查看答案</summary>

| 特性 | HTTP | WebSocket |
|------|------|-----------|
| 通信方式 | 请求-响应 | 全双工 |
| 连接 | 短连接/长连接 | 持久连接 |
| 服务器推送 | 不支持 | 支持 |
| 头部开销 | 每次都有 | 只有握手时 |
| 协议 | http/https | ws/wss |
| 状态 | 无状态 | 有状态 |

**WebSocket 特点**：
- 建立在 TCP 之上
- 握手阶段使用 HTTP
- 数据格式轻量
- 没有同源限制

**适用场景**：
- 即时通讯（聊天室）
- 实时数据（股票、游戏）
- 协同编辑
- 消息推送

```javascript
// 服务端推送替代方案对比
/*
1. 轮询（Polling）
   - 定时发送请求
   - 实时性差，资源浪费

2. 长轮询（Long Polling）
   - 请求挂起，有数据再返回
   - 实时性好，但连接消耗大

3. Server-Sent Events（SSE）
   - 服务端单向推送
   - 基于 HTTP，简单易用

4. WebSocket
   - 全双工通信
   - 性能最好，实时性最高
*/
```
:::

</details>

::: details 10. 如何实现大文件上传？
<details>
<summary>点击查看答案</summary>

**核心方案**：分片上传 + 断点续传

```javascript
class FileUploader {
  constructor(file, options = {}) {
    this.file = file;
    this.chunkSize = options.chunkSize || 5 * 1024 * 1024; // 5MB
    this.uploadedChunks = new Set();
  }

  // 计算文件哈希
  async calculateHash() {
    const spark = new SparkMD5.ArrayBuffer();
    const chunks = Math.ceil(this.file.size / this.chunkSize);

    for (let i = 0; i < chunks; i++) {
      const chunk = await this.readChunk(i);
      spark.append(chunk);
    }

    return spark.end();
  }

  // 读取分片
  readChunk(index) {
    return new Promise((resolve) => {
      const start = index * this.chunkSize;
      const end = Math.min(start + this.chunkSize, this.file.size);
      const blob = this.file.slice(start, end);

      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsArrayBuffer(blob);
    });
  }

  // 上传分片
  async uploadChunk(index, hash) {
    const chunk = this.file.slice(
      index * this.chunkSize,
      (index + 1) * this.chunkSize
    );

    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('index', index);
    formData.append('hash', hash);

    await fetch('/upload/chunk', {
      method: 'POST',
      body: formData
    });

    this.uploadedChunks.add(index);
  }

  // 检查已上传的分片
  async checkUploaded(hash) {
    const res = await fetch(`/upload/check?hash=${hash}`);
    const data = await res.json();
    data.uploaded.forEach(i => this.uploadedChunks.add(i));
    return data.uploaded;
  }

  // 合并分片
  async merge(hash) {
    await fetch('/upload/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash, filename: this.file.name })
    });
  }

  // 开始上传
  async upload() {
    const hash = await this.calculateHash();
    const chunks = Math.ceil(this.file.size / this.chunkSize);

    // 检查断点
    await this.checkUploaded(hash);

    // 并发上传
    const limit = 3;
    const pool = [];

    for (let i = 0; i < chunks; i++) {
      if (this.uploadedChunks.has(i)) continue;

      const task = this.uploadChunk(i, hash);
      pool.push(task);

      if (pool.length >= limit) {
        await Promise.race(pool);
        pool.splice(pool.findIndex(p => p.resolved), 1);
      }
    }

    await Promise.all(pool);
    await this.merge(hash);
  }
}
```

**关键点**：
1. 文件分片（Blob.slice）
2. 计算文件哈希（秒传、断点续传）
3. 并发控制
4. 断点续传（服务端记录已上传分片）
5. 合并分片
:::

</details>

## 高频面试题

::: details 1. GET 和 POST 请求的区别？
<details>
<summary>点击查看答案</summary>

**一句话答案**：GET 用于获取资源，参数在 URL 中；POST 用于提交数据，参数在请求体中。

**详细解答**：

| 对比维度 | GET | POST |
|---------|-----|------|
| **语义** | 获取资源（幂等） | 提交/创建资源（非幂等） |
| **参数位置** | URL 查询字符串 | 请求体（Body） |
| **数据大小** | 受 URL 长度限制（2-8KB） | 理论上无限制 |
| **安全性** | 参数暴露在 URL | 相对安全（需配合 HTTPS） |
| **缓存** | 可以被浏览器缓存 | 默认不缓存 |
| **历史记录** | 保存在浏览器历史 | 不保存 |
| **书签** | 可以添加书签 | 不能添加书签 |
| **编码** | 只支持 URL 编码（ASCII） | 支持多种编码 |
| **幂等性** | 是（多次请求结果相同） | 否（多次请求可能创建多个资源） |
| **数据类型** | 只能是字符串 | 可以是文本、二进制等 |

**常见误区**：
1. "GET 比 POST 不安全"：两者都是明文传输，真正安全需要 HTTPS
2. "GET 有长度限制，POST 没有"：GET 限制来自浏览器和服务器，不是协议本身
3. "POST 比 GET 慢"：GET 只发一个 TCP 包，POST 可能发两个（Header 和 Body），但在实际应用中差异很小

**使用场景**：
```javascript
// GET - 查询数据
fetch('/api/users?page=1&limit=10')

// POST - 创建数据
fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice', age: 25 })
})

// POST 用于敏感数据
fetch('/api/login', {
  method: 'POST',
  body: JSON.stringify({ username: 'user', password: 'pass' })
})
```

**面试口语化回答模板**：

> "GET 和 POST 的主要区别有几个方面：
>
> 首先是语义上，GET 用于获取资源，是幂等的，多次请求不会改变服务器状态；POST 用于提交数据或创建资源，是非幂等的。
>
> 其次是参数位置，GET 请求的参数放在 URL 的查询字符串里，比如 /api/users?id=1；POST 请求的参数放在请求体里，更适合传输大量数据。
>
> 关于数据大小，GET 受 URL 长度限制，一般是 2-8KB；POST 理论上没有限制，可以传输大文件。
>
> 在缓存方面，GET 请求可以被浏览器缓存，有利于性能优化；POST 请求默认不缓存。
>
> 最后，很多人说 GET 不安全，其实两者都是明文传输的，真正要安全需要用 HTTPS。
>
> 实际开发中，我会按照 RESTful 规范来选择：查询��据用 GET，创建数据用 POST，更新用 PUT，删除用 DELETE。"
:::

</details>

::: details 2. HTTP 和 HTTPS 的区别？
<details>
<summary>点击查看答案</summary>

**一句话答案**：HTTPS 是 HTTP 的安全版本，通过 SSL/TLS 加密传输数据，确保数据安全和完整性。

**详细解答**：

| 对比项 | HTTP | HTTPS |
|-------|------|-------|
| **协议** | 超文本传输协议 | HTTP + SSL/TLS |
| **端口** | 80 | 443 |
| **安全性** | 明文传输 | 加密传输 |
| **证书** | 不需要 | 需要 CA 证书 |
| **性能** | 快 | 稍慢（加密解密开销） |
| **SEO** | 普通 | 搜索引擎更友好 |
| **成本** | 无 | 需要购买证书（也有免费的） |

**HTTPS 工作原理**：

```
1. 客户端发起 HTTPS 请求
2. 服务器返回 SSL 证书（包含公钥）
3. 客户端验证证书有效性
   - 检查证书是否由可信 CA 签发
   - 检查证书是否过期
   - 检查域名是否匹配
4. 客户端生成随机对称密钥
5. 用服务器公钥加密对称密钥并发送
6. 服务器用私钥解密，获得对称密钥
7. 双方使用对称密钥进行加密通信
```

**为什么混合使用非对称加密和对称加密？**
- **非对称加密（RSA）**：安全但慢，用于交换密钥
- **对称加密（AES）**：快但密钥交换不安全，用于数据传输
- **结合优势**：既安全又高效

**HTTPS 的优势**：

1. **数据加密**：防止数据被窃取
2. **身份认证**：确认服务器身份，防止钓鱼网站
3. **数据完整性**：防止数据被篡改
4. **SEO 优势**：Google 优先收录 HTTPS 网站
5. **浏览器信任**：显示绿色锁标志

**HTTPS 的缺点**：

1. **性能开销**：SSL 握手需要额外的时间
2. **证书成本**：付费证书需要购买
3. **配置复杂**：需要正确配置服务器

**如何优化 HTTPS 性能**：

```javascript
// 1. 启用 HTTP/2（多路复用）
// 2. Session 复用
// 3. OCSP Stapling（在线证书状态协议）
// 4. 使用 CDN
// 5. 启用 HSTS（强制 HTTPS）

// Nginx 配置示例
/*
server {
  listen 443 ssl http2;
  server_name example.com;

  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;

  # Session 复用
  ssl_session_cache shared:SSL:10m;
  ssl_session_timeout 10m;

  # OCSP Stapling
  ssl_stapling on;
  ssl_stapling_verify on;

  # HSTS
  add_header Strict-Transport-Security "max-age=31536000" always;
}
*/
```

**面试口语化回答模板**：

> "HTTPS 就是 HTTP 加上 SSL/TLS 安全层，主要区别在于安全性。
>
> HTTP 是明文传输的，数据在网络中传输时可以被截获和查看；HTTPS 则是加密传输，即使被截获也无法解密。
>
> HTTPS 的工作原理是这样的：首先服务器会给客户端发送一个 SSL 证书，客户端验证证书的合法性后，生成一个随机密钥，用证书里的公钥加密发送给服务器。服务器用私钥解密得到这个密钥，之后双方就用这个密钥进行对称加密通信。
>
> 为什么不全程用非对称加密呢？因为非对称加密虽然安全但是很慢，只适合用来交换密钥；真正传输数据时用的是对称加密，又快又安全。
>
> HTTPS 的优势很明显：数据加密、身份认证、防止篡改，而且搜索引擎更喜欢 HTTPS 网站。缺点就是有一定的性能开销，不过通过启用 HTTP/2、Session 复用等优化手段，性能影响可以降到很低。
>
> 现在基本上所有网站都在用 HTTPS，像 Let's Encrypt 还提供免费证书，所以部署成本也不高。"
:::

</details>

::: details 3. HTTP 状态码有哪些？常见的 200、301、302、304、400、401、403、404、500 是什么意思？
<details>
<summary>点击查看答案</summary>

**一句话答案**：HTTP 状态码分为 5 类（1xx 信息、2xx 成功、3xx 重定向、4xx 客户端错误、5xx 服务器错误），用于表示请求的处理结果。

**详细解答**：

**状态码分类**：

| 分类 | 说明 |
|-----|------|
| **1xx** | 信息响应（请求已接收，继续处理） |
| **2xx** | 成功（请求已成功处理） |
| **3xx** | 重定向（需要进一步操作） |
| **4xx** | 客户端错误（请求有错误） |
| **5xx** | 服务器错误（服务器处理失败） |

**常见状态码详解**：

**200 OK - 成功**
```javascript
// 请求成功，服务器返回数据
GET /api/users → 200 OK
{
  "users": [...]
}
```

**301 Moved Permanently - 永久重定向**
```javascript
// 资源永久移动，浏览器会缓存新地址
// 搜索引擎会更新索引
GET http://example.com → 301 → https://example.com

// 场景：
// - HTTP 升级到 HTTPS
// - 旧域名跳转到新域名
// - 网站迁移

// Nginx 配置
/*
server {
  listen 80;
  server_name example.com;
  return 301 https://example.com$request_uri;
}
*/
```

**302 Found - 临时重定向**
```javascript
// 资源临时移动，浏览器不缓存
// 搜索引擎不更新索引
GET /old-page → 302 → /new-page

// 场景：
// - 临时维护页面
// - A/B 测试
// - 登录跳转

// Express 示例
app.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect(302, '/dashboard');
  }
});
```

**304 Not Modified - 未修改（协商缓存）**
```javascript
// 资源未修改，使用缓存
GET /style.css
If-None-Match: "abc123"
→ 304 Not Modified

// 流程：
// 1. 客户端发送 ETag 或 Last-Modified
// 2. 服务器验证资源是否修改
// 3. 未修改返回 304
// 4. 客户端使用本地缓存

// 好处：节省带宽，提升性能
```

**400 Bad Request - 请求错误**
```javascript
// 请求语法错误或参数无效
POST /api/users
{
  "age": "abc" // 应该是数字
}
→ 400 Bad Request

// 常见场景：
// - 参数类型错误
// - 必填参数缺失
// - JSON 格式错误
// - 请求体过大
```

**401 Unauthorized - 未认证**
```javascript
// 需要身份认证
GET /api/profile
→ 401 Unauthorized
{
  "error": "请先登录"
}

// 处理方式：
// - 跳转到登录页
// - 刷新 Token
// - 提示用户登录

// 前端处理
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response.status === 401) {
      window.location.href = '/login';
    }
  }
);
```

**403 Forbidden - 禁止访问**
```javascript
// 没有权限访问资源
GET /api/admin/users
→ 403 Forbidden
{
  "error": "权限不足"
}

// 401 vs 403：
// - 401：你是谁？请先登录
// - 403：我知道你是谁，但你没有权限

// 场景：
// - 访问需要特殊权限的资源
// - IP 被封禁
// - 防盗链
```

**404 Not Found - 资源不存在**
```javascript
// 请求的资源不存在
GET /api/users/999 → 404 Not Found

// 前端处理：显示 404 页面
// 后端处理：返回友好提示

// Express 示例
app.use((req, res) => {
  res.status(404).json({
    error: '页面不存在'
  });
});
```

**500 Internal Server Error - 服务器错误**
```javascript
// 服务器内部错误
GET /api/data → 500 Internal Server Error

// 常见原因：
// - 代码异常
// - 数据库连接失败
// - 未捕获的异常

// 处理方式：
// - 记录错误日志
// - 返回友好提示
// - 监控告警

// Express 错误处理
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: '服务器错误，请稍后重试'
  });
});
```

**其他重要状态码**：

| 状态码 | 含义 | 说明 |
|-------|------|------|
| **201** | Created | 创建成功（POST） |
| **204** | No Content | 成功但无返回内容（DELETE） |
| **206** | Partial Content | 部分内容（断点续传） |
| **307** | Temporary Redirect | 临时重定向（保持方法） |
| **308** | Permanent Redirect | 永久重定向（保持方法） |
| **405** | Method Not Allowed | 方法不允许 |
| **429** | Too Many Requests | 请求过多（限流） |
| **502** | Bad Gateway | 网关错误 |
| **503** | Service Unavailable | 服务不可用 |
| **504** | Gateway Timeout | 网关超时 |

**重定向状态码对比**：

```javascript
/*
301 vs 302 vs 307 vs 308

301 - 永久重定向（可能改变方法）
  ✓ 浏览器缓存
  ✓ SEO 更新
  ✗ POST 可能变 GET

302 - 临时重定向（可能改变方法）
  ✗ 不缓存
  ✗ SEO 不更新
  ✗ POST 可能变 GET

307 - 临时重定向（保持方法）
  ✗ 不缓存
  ✓ 严格保持原方法

308 - 永久重定向（保持方法）
  ✓ 浏览器缓存
  ✓ 严格保持原方法
*/
```

**面试口语化回答模板**：

> "HTTP 状态码分为 5 大类：1xx 是信息响应，2xx 是成功，3xx 是重定向，4xx 是客户端错误，5xx 是服务器错误。
>
> 我重点说几个最常见的：
>
> 200 是最常见的，表示请求成功。
>
> 301 和 302 都是重定向，区别是 301 是永久重定向，浏览器会缓存新地址，搜索引擎也会更新索引，常用于 HTTP 升级到 HTTPS；302 是临时重定向，不会缓存，常用于登录跳转。
>
> 304 是协商缓存相关的，表示资源没有修改，直接用缓存就行，可以节省带宽。
>
> 400 是请求错误，比如参数类型不对或者格式不对。
>
> 401 和 403 容易混淆，401 是未认证，需要先登录；403 是已认证但没权限，就是你登录了但权限不够。我记忆的方式是：401 问'你是谁'，403 说'我知道你是谁，但你不能访问'。
>
> 404 大家都熟悉，就是资源不存在。
>
> 500 是服务器内部错误，通常是代码出 bug 了或者数据库连接失败。我们线上项目都会做全局错误处理，捕获 500 错误并记录日志，方便排查问题。"
:::

</details>

::: details 4. HTTP 缓存机制？强缓存和协商缓存？
<details>
<summary>点击查看答案</summary>

**一句话答案**：HTTP 缓存分为强缓存（直接使用缓存）和协商缓存（询问服务器是否可用缓存），目的是减少网络请求，提升性能。

**详细解答**：

**缓存完整流程**：

```
1. 浏览器发起请求
2. 检查是否有缓存
   ├─ 无缓存 → 发起请求 → 获取资源 → 存入缓存
   └─ 有缓存
       ├─ 检查强缓存
       │   ├─ 未过期 → 200 (from cache) ✓
       │   └─ 已过期 → 进入协商缓存
       └─ 协商缓存
           ├─ 304 Not Modified → 使用缓存 ✓
           └─ 200 OK → 返回新资源 → 更新缓存
```

**1. 强缓存（不发请求）**

强缓存通过两个 Header 控制：

**Expires（HTTP/1.0）**
```javascript
// 绝对过期时间
Expires: Wed, 21 Oct 2025 07:28:00 GMT

// 缺点：
// - 依赖客户端时间
// - 客户端时间不准会失效
```

**Cache-Control（HTTP/1.1，优先级更高）**
```javascript
// 常用指令
Cache-Control: max-age=31536000      // 缓存 1 年
Cache-Control: no-cache              // 需要协商缓存
Cache-Control: no-store              // 不缓存
Cache-Control: public                // 可被任何缓存（代理、CDN）
Cache-Control: private               // 只能浏览器缓存
Cache-Control: immutable             // 资源永不改变
Cache-Control: must-revalidate       // 缓存过期必须验证

// 组合使用
Cache-Control: public, max-age=31536000, immutable

// 响应状态
200 OK (from disk cache)   // 从磁盘缓存读取
200 OK (from memory cache) // 从内存缓存读取
```

**2. 协商缓存（需要发请求验证）**

协商缓存通过两组 Header 控制：

**Last-Modified / If-Modified-Since（基于时间）**
```javascript
// 首次请求
GET /style.css
← 200 OK
  Last-Modified: Wed, 21 Oct 2024 07:28:00 GMT

// 再次请求
GET /style.css
  If-Modified-Since: Wed, 21 Oct 2024 07:28:00 GMT
← 304 Not Modified （使用缓存）
或
← 200 OK （返回新资源）

// 缺点：
// - 精度只到秒
// - 文件内容未变但修改时间变了会重新请求
```

**ETag / If-None-Match（基于内容，优先级更高）**
```javascript
// 首次请求
GET /style.css
← 200 OK
  ETag: "abc123"

// 再次请求
GET /style.css
  If-None-Match: "abc123"
← 304 Not Modified （内容未变）
或
← 200 OK （内容改变）
  ETag: "def456"

// ETag 生成方式：
// - 文件内容 Hash（MD5）
// - 文件大小 + 修改时间
// - 其他自定义算法
```

**缓存策略对比**：

| 缓存类型 | 是否发请求 | 响应码 | Header |
|---------|----------|--------|--------|
| **强缓存** | 否 | 200 (from cache) | Cache-Control / Expires |
| **协商缓存** | 是（验证） | 304 | ETag / Last-Modified |

**最佳实践**：

```javascript
/*
1. HTML 文件 - 协商缓存
   - 需要及时更新
   - 设置 no-cache，每次验证
*/
Cache-Control: no-cache
ETag: "abc123"

/*
2. 带 hash 的静态资源（main.abc123.js）
   - 文件名变化才会重新请求
   - 强缓存 + immutable
*/
Cache-Control: public, max-age=31536000, immutable

/*
3. 不带 hash 的静态资源（logo.png）
   - 短期强缓存
*/
Cache-Control: public, max-age=86400

/*
4. API 接口 - 不缓存
   - 数据实时性要求高
*/
Cache-Control: no-store

/*
5. 用户相关数据 - 私有缓存
   - 不能被 CDN 缓存
*/
Cache-Control: private, max-age=3600
```

**Nginx 配置示例**：

```nginx
# 带 hash 的静态资源 - 强缓存一年
location ~* \.(js|css)$ {
  if ($request_filename ~* \.[a-f0-9]{8,}\.(js|css)$) {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}

# 图片资源 - 缓存 30 天
location ~* \.(jpg|jpeg|png|gif|webp)$ {
  expires 30d;
  add_header Cache-Control "public";
}

# HTML - 协商缓存
location ~* \.html$ {
  add_header Cache-Control "no-cache";
  etag on;
}

# API - 不缓存
location /api/ {
  add_header Cache-Control "no-store";
}
```

**实战案例**：

```javascript
// 构建工具生成带 hash 的文件名
// webpack.config.js
module.exports = {
  output: {
    filename: '[name].[contenthash:8].js',
    // 输出：main.a1b2c3d4.js
  }
}

// HTML 引用
<script src="/js/main.a1b2c3d4.js"></script>

// 好处：
// 1. 文件内容变化 → hash 变化 → 重新请求
// 2. 文件内容不变 → hash 不变 → 使用缓存
// 3. 可以设置超长缓存时间
```

**强制刷新的方式**：

```javascript
/*
1. 普通刷新（F5 / Ctrl+R）
   - 跳过强缓存
   - 触发协商缓存

2. 强制刷新（Ctrl+F5 / Ctrl+Shift+R）
   - 跳过所有缓存
   - 请求头添加：Cache-Control: no-cache

3. 清除缓存
   - 浏览器开发者工具
   - 代码：caches.delete('cache-name')
*/
```

**面试口语化回答模板**：

> "HTTP 缓存主要分为强缓存和协商缓存两种。
>
> 强缓存就是直接使用本地缓存，不发请求。它通过 Cache-Control 和 Expires 控制，Cache-Control 的优先级更高。比如设置 Cache-Control: max-age=31536000，资源就会缓存一年，期间访问都不会发请求，直接从本地缓存读取，显示 200 from cache。
>
> 协商缓存是需要向服务器验证资源是否过期。它有两组 Header：一组是 Last-Modified 和 If-Modified-Since，基于修改时间判断；另一组是 ETag 和 If-None-Match，基于文件内容的 hash 值判断，精度更高，优先级也更高。如果资源没变，服务器返回 304，浏览器继续用缓存；如果变了，返回 200 和新内容。
>
> 在实际项目中，我们通常这样配置：
>
> HTML 文件用协商缓存，设置 no-cache，保证能及时更新。
>
> 带 hash 的 JS、CSS 文件用强缓存一年加 immutable，因为文件名变了才会重新请求，不用担心更新问题。
>
> 图片等静态资源短期强缓存，比如 30 天。
>
> API 接口设置 no-store，完全不缓存，保证数据实时性。
>
> 这样既能充分利用缓存提升性能，又不会影响更新。"
:::

</details>

::: details 5. Cookie、Session、Token 的区别？
<details>
<summary>点击查看答案</summary>

**一句话答案**：Cookie 存在客户端、Session 存在服务端、Token 是无状态的身份凭证，三者都用于身份认证，但存储位置、安全性和适用场景不同。

**详细解答**：

**三者对比**：

| 对比项 | Cookie | Session | Token（JWT） |
|-------|--------|---------|-------------|
| **存储位置** | 客户端（浏览器） | 服务端（内存/数据库） | 客户端（localStorage/sessionStorage） |
| **大小限制** | 4KB | 无限制 | 取决于存储位置 |
| **性能** | 不占服务器资源 | 占用服务器内存 | 不占服务器资源 |
| **安全性** | 较低（可被篡改） | 较高 | 较高（签名验证） |
| **跨域** | 受限（可配置） | 依赖 Cookie | 不受限 |
| **扩展性** | - | 差（难以分布式） | 好（无状态） |
| **自动携带** | 是 | 通过 Cookie 携带 SessionID | 否（需手动添加） |

**1. Cookie 详解**：

```javascript
// Cookie 属性
/*
Set-Cookie: name=value;
  Domain=example.com;        // 作用域名
  Path=/;                    // 作用路径
  Expires=<date>;            // 绝对过期时间
  Max-Age=<seconds>;         // 相对过期时间
  Secure;                    // 仅 HTTPS
  HttpOnly;                  // 禁止 JS 访问
  SameSite=Strict|Lax|None;  // 跨站限制
*/

// 服务端设置 Cookie
// Node.js
res.setHeader('Set-Cookie',
  'sessionId=abc123; HttpOnly; Secure; SameSite=Strict; Max-Age=3600'
);

// Express
res.cookie('token', 'abc123', {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 3600000
});

// 客户端读取 Cookie
document.cookie;
// 输出：name=value; theme=dark
// 注意：无法读取 HttpOnly 的 Cookie

// 客户端设置 Cookie
document.cookie = 'theme=dark; max-age=31536000; path=/';

// SameSite 属性详解
/*
Strict: 完全禁止第三方 Cookie
  - 从外部链接进入也不携带
  - 适合银行等高安全场景

Lax（默认）: 宽松模式
  - GET 请求携带（导航到目标网站）
  - POST/AJAX 不携带
  - 平衡安全和可用性

None: 允许第三方 Cookie
  - 必须同时设置 Secure
  - 适合跨域场景
*/
```

**2. Session 详解**：

```javascript
// Session 工作流程
/*
1. 用户登录
2. 服务器创建 Session，存储用户信息
3. 服务器返回 SessionID（通过 Cookie）
4. 后续请求自动携带 SessionID
5. 服务器根据 SessionID 查找 Session
*/

// Express + express-session
const session = require('express-session');

app.use(session({
  secret: 'your-secret-key',    // 签名密钥
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    maxAge: 1000 * 60 * 60 * 24  // 1 天
  },
  store: new RedisStore({        // 使用 Redis 存储
    client: redisClient
  })
}));

// 登录接口
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // 验证用户
  if (validate(username, password)) {
    // 存储用户信息到 Session
    req.session.userId = user.id;
    req.session.username = user.name;
    res.json({ success: true });
  }
});

// 获取用户信息
app.get('/profile', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: '未登录' });
  }

  res.json({
    userId: req.session.userId,
    username: req.session.username
  });
});

// 登出
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Session 存储方式
/*
1. 内存存储（默认）
   - 重启丢失
   - 不适合生产环境

2. Redis（推荐）
   - 性能好
   - 支持分布式
   - 可持久化

3. 数据库
   - 持久化
   - 性能较低
*/
```

**3. Token（JWT）详解**：

```javascript
// JWT 结构：Header.Payload.Signature
// eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsImV4cCI6MTYzOTk5OTk5OX0.xxx

// Header（算法和类型）
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload（数据）
{
  "userId": 1,
  "username": "alice",
  "role": "admin",
  "iat": 1639900000,  // 签发时间
  "exp": 1639999999   // 过期时间
}

// Signature（签名，防止篡改）
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)

// Node.js 使用 jsonwebtoken
const jwt = require('jsonwebtoken');
const SECRET = 'your-secret-key';

// 登录：生成 Token
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (validate(username, password)) {
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.name,
        role: user.role
      },
      SECRET,
      { expiresIn: '7d' }  // 7 天过期
    );

    res.json({ token });
  }
});

// 验证 Token 中间件
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: '未提供 Token' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;  // 将用户信息挂载到 req
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token 无效或已过期' });
  }
};

// 受保护的接口
app.get('/profile', authMiddleware, (req, res) => {
  res.json({
    userId: req.user.userId,
    username: req.user.username,
    role: req.user.role
  });
});

// 前端使用
// 存储 Token
localStorage.setItem('token', token);

// 请求时携带 Token
fetch('/api/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// Axios 拦截器
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Token 刷新机制**：

```javascript
// 双 Token 方案
/*
Access Token: 短期（15 分钟）
  - 用于 API 请求
  - 存储在内存或 localStorage

Refresh Token: 长期（7 天）
  - 仅用于刷新 Access Token
  - 存储在 httpOnly Cookie（更安全）
*/

// 登录返回双 Token
app.post('/login', (req, res) => {
  const accessToken = jwt.sign(payload, SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });

  res.cookie('refreshToken', refreshToken, { httpOnly: true });
  res.json({ accessToken });
});

// 刷新 Token
app.post('/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      SECRET,
      { expiresIn: '15m' }
    );
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: 'Refresh Token 无效' });
  }
});

// 前端自动刷新
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response.status === 401) {
      // Token 过期，尝试刷新
      const { data } = await axios.post('/refresh');
      localStorage.setItem('token', data.accessToken);

      // 重新发起原请求
      error.config.headers.Authorization = `Bearer ${data.accessToken}`;
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
```

**使用场景选择**：

```javascript
/*
Cookie + Session（传统网站）
  ✓ 服务端控制强
  ✓ 可随时销毁
  ✗ 不利于分布式
  ✗ 移动端支持差

  适合：企业内部系统、传统 Web 应用

Token（JWT）（现代应用）
  ✓ 无状态，易扩展
  ✓ 跨域友好
  ✓ 移动端友好
  ✗ 无法主动销毁（需等过期）
  ✗ Payload 不能存敏感信息

  适合：前后端分离、微服务、移动端

混合方案
  - Session 存储敏感信息
  - Token 用于 API 认证
  - 结合各自优势
*/
```

**安全注意事项**：

```javascript
// 1. Cookie 安全
- 设置 HttpOnly（防止 XSS）
- 设置 Secure（仅 HTTPS）
- 设置 SameSite（防止 CSRF）
- 不存储敏感信息

// 2. Session 安全
- 使用安全的 SessionID 生成算法
- 定期更新 SessionID
- 设置合理的过期时间
- 使用 Redis 等安全存储

// 3. Token 安全
- 使用强密钥
- 设置合理的过期时间
- HTTPS 传输
- 不在 Payload 存敏感信息
- 考虑使用 Refresh Token
- 实现 Token 黑名单（如需主动销毁）
```

**面试口语化回答模板**：

> "Cookie、Session 和 Token 都是用来做身份认证的，但实现方式和适用场景不同。
>
> Cookie 是存在客户端浏览器的，大小限制 4KB，每次请求会自动携带。它的安全性比较低，容易被篡改，所以一般不直接存敏感信息。我们可以通过设置 HttpOnly 防止 JS 读取，设置 Secure 限制只在 HTTPS 传输，设置 SameSite 防止 CSRF 攻击。
>
> Session 是存在服务端的，比如存在 Redis 里。工作流程是用户登录后，服务器创建一个 Session 保存用户信息，然后把 SessionID 通过 Cookie 返回给客户端。后续请求会自动携带这个 SessionID，服务器根据它查找对应的 Session。Session 的优点是安全、可控，缺点是占用服务器资源，在分布式系统中需要做 Session 共享。
>
> Token，特别是 JWT，是无状态的。登录后服务器生成一个 Token 返回给客户端，客户端存在 localStorage，每次请求手动放在 Header 里。Token 的格式是 Header.Payload.Signature，通过签名保证不被篡改。它的优点是无状态、易扩展、跨域友好，非常适合前后端分离和微服务架构。缺点是无法主动销毁，只能等它过期，所以一般会设置比较短的过期时间，再配合 Refresh Token 实现自动刷新。
>
> 在实际项目中，传统 Web 应用我会用 Session，前后端分离项目我会用 JWT。有时候也会混合使用，比如 Session 存敏感信息，Token 用于 API 认证。"
:::

</details>

::: details 6. 浏览器每次请求都会携带 Cookie 吗？
<details>
<summary>点击查看答案</summary>

**一句话答案**：不是每次都会携带，取决于 Cookie 的 Domain、Path、Secure、SameSite 等属性设置。

**详细解答**：

**Cookie 携带的条件**：

Cookie 需要同时满足以下所有条件才会被携带：

**1. Domain（域名）匹配**

```javascript
// 设置 Cookie
Set-Cookie: token=abc; Domain=example.com

// 携带规则：
https://example.com         ✓ 携带
https://www.example.com     ✓ 携带（子域名）
https://api.example.com     ✓ 携带（子域名）
https://other.com           ✗ 不携带（不同域名）

// 如果不设置 Domain，默认只在当前域名
Set-Cookie: token=abc  // 未设置 Domain

https://example.com         ✓ 携带
https://www.example.com     ✗ 不携带

// 注意：无法设置其他域名的 Cookie
// example.com 无法设置 other.com 的 Cookie
```

**2. Path（路径）匹配**

```javascript
// 设置 Cookie
Set-Cookie: token=abc; Path=/api

// 携带规则：
https://example.com/api         ✓ 携带
https://example.com/api/users   ✓ 携带（子路径）
https://example.com/            ✗ 不携带（不匹配）
https://example.com/home        ✗ 不携带（不匹配）

// 默认 Path=/
Set-Cookie: token=abc; Path=/

// 所有路径都携带
https://example.com/            ✓ 携带
https://example.com/api         ✓ 携带
https://example.com/home        ✓ 携带
```

**3. Secure（HTTPS）限制**

```javascript
// 设置 Secure 属性
Set-Cookie: token=abc; Secure

// 携带规则：
https://example.com     ✓ 携带（HTTPS）
http://example.com      ✗ 不携带（HTTP）

// 不设置 Secure，HTTP 和 HTTPS 都携带
Set-Cookie: token=abc

https://example.com     ✓ 携带
http://example.com      ✓ 携带
```

**4. SameSite（跨站限制）**

```javascript
// Strict: 完全禁止第三方 Cookie
Set-Cookie: session=abc; SameSite=Strict

/*
场景 1：用户在 a.com
  → 直接访问 b.com                    ✗ 不携带
  → 在 b.com 内部跳转                 ✓ 携带

场景 2：用户在 a.com，点击链接到 b.com
  → GET 请求（导航）                  ✗ 不携带
  → POST 请求                        ✗ 不携带
  → AJAX 请求                        ✗ 不携带
*/

// Lax（默认）: 宽松模式
Set-Cookie: session=abc; SameSite=Lax

/*
场景 1：用户在 a.com
  → 点击链接到 b.com（GET 导航）      ✓ 携带
  → 在 b.com 内部跳转                ✓ 携带

场景 2：跨站请求
  → POST 表单提交                    ✗ 不携带
  → AJAX 请求                       ✗ 不携带
  → <img> 图片请求                   ✗ 不携带
  → <iframe> 嵌入                   ✗ 不携带
*/

// None: 允许第三方 Cookie（必须配合 Secure）
Set-Cookie: session=abc; SameSite=None; Secure

/*
所有场景都携带（需要 HTTPS）
  → 跨域 AJAX                        ✓ 携带
  → 第三方网站嵌入                   ✓ 携带
  → 所有跨站请求                     ✓ 携带
*/
```

**5. Cookie 是否过期**

```javascript
// 已过期的 Cookie 不会携带
Set-Cookie: token=abc; Max-Age=3600  // 1 小时后过期

// 1 小时内：✓ 携带
// 1 小时后：✗ 不携带（已删除）
```

**6. Cookie 大小限制**

```javascript
// 单个 Cookie 限制：4KB
// 单个域名 Cookie 总数：20-50 个

// 超出限制的 Cookie 不会被设置和携带
```

**实际场景分析**：

```javascript
// 场景 1：同站请求
/*
网站：https://example.com
Cookie：token=abc; Path=/; SameSite=Lax

用户操作：
  1. 访问首页 /                       ✓ 携带
  2. 点击链接到 /about                ✓ 携带
  3. AJAX 请求 /api/data              ✓ 携带
  4. 加载图片 /images/logo.png        ✓ 携带
*/

// 场景 2：跨站请求（Strict）
/*
网站 A：https://a.com（Cookie: SameSite=Strict）
网站 B：https://b.com

用户在 b.com：
  1. 点击链接到 a.com                 ✗ 不携带
  2. 表单提交到 a.com                 ✗ 不携带
  3. AJAX 请求 a.com                 ✗ 不携带

用户直接访问 a.com 后：
  1. 在 a.com 内跳转                  ✓ 携带
*/

// 场景 3：跨站请求（Lax）
/*
网站 A：https://a.com（Cookie: SameSite=Lax）
网站 B：https://b.com

用户在 b.com：
  1. <a> 链接导航到 a.com（GET）      ✓ 携带
  2. 表单提交到 a.com（POST）         ✗ 不携带
  3. AJAX 请求 a.com                 ✗ 不携带
  4. <img> 加载 a.com 图片            ✗ 不携带
*/

// 场景 4：跨站请求（None）
/*
网站 A：https://a.com（Cookie: SameSite=None; Secure）
网站 B：https://b.com

用户在 b.com：
  1. 所有类型的请求                   ✓ 都携带（HTTPS）
  2. HTTP 请求                       ✗ 不携带（必须 HTTPS）
*/

// 场景 5：跨域 API 请求
/*
前端：https://web.example.com
API：https://api.example.com

默认情况：
  fetch('https://api.example.com/data')  ✗ 不携带

需要设置：
*/
// 前端
fetch('https://api.example.com/data', {
  credentials: 'include'  // 携带 Cookie
});

// 后端
res.setHeader('Access-Control-Allow-Credentials', 'true');
res.setHeader('Access-Control-Allow-Origin', 'https://web.example.com');
// 注意：不能用通配符 *
```

**如何控制 Cookie 携带**：

```javascript
// 1. 前端控制（fetch）
// 不携带（默认）
fetch('/api/data')

// 同源携带
fetch('/api/data', {
  credentials: 'same-origin'
})

// 总是携带
fetch('/api/data', {
  credentials: 'include'
})

// 2. 前端控制（axios）
// 总是携带
axios.defaults.withCredentials = true;

// 单个请求携带
axios.get('/api/data', {
  withCredentials: true
});

// 3. 后端控制（CORS）
// 允许携带 Cookie
res.setHeader('Access-Control-Allow-Credentials', 'true');
// 必须指定具体源，不能用 *
res.setHeader('Access-Control-Allow-Origin', 'https://example.com');

// 4. Cookie 属性控制
// 限制跨站携带
Set-Cookie: token=abc; SameSite=Strict

// 允许跨站携带
Set-Cookie: token=abc; SameSite=None; Secure

// 仅 HTTPS 携带
Set-Cookie: token=abc; Secure
```

**常见问题**：

```javascript
// 问题 1：为什么跨域请求不携带 Cookie？
/*
原因：
  1. 默认 credentials: 'same-origin'
  2. 服务端未设置 CORS 相关头

解决：
  - 前端：credentials: 'include'
  - 后端：Access-Control-Allow-Credentials: true
*/

// 问题 2：为什么 SameSite=None 不生效？
/*
原因：
  - 必须同时设置 Secure
  - 必须在 HTTPS 环境

解决：
  Set-Cookie: token=abc; SameSite=None; Secure
*/

// 问题 3：子域名如何共享 Cookie？
/*
设置：
  Set-Cookie: token=abc; Domain=.example.com

生效范围：
  - example.com         ✓
  - www.example.com     ✓
  - api.example.com     ✓
  - sub.example.com     ✓
*/

// 问题 4：如何防止 CSRF 攻击？
/*
方案 1：SameSite Cookie
  Set-Cookie: session=abc; SameSite=Strict

方案 2：CSRF Token
  - 服务端生成随机 Token
  - 前端每次请求携带
  - 服务端验证

方案 3：验证 Origin/Referer
  - 检查请求来源
*/
```

**面试口语化回答模板**：

> "浏览器并不是每次请求都会携带 Cookie，需要满足多个条件。
>
> 首先是域名和路径要匹配。Cookie 的 Domain 和 Path 属性决定了它在哪些 URL 下会被携带。比如设置 Domain=example.com，那在所有子域名下都会携带；设置 Path=/api，只有 /api 开头的路径才会携带。
>
> 其次是 Secure 属性，如果设置了，Cookie 只会在 HTTPS 下携带，HTTP 不会携带。
>
> 最重要的是 SameSite 属性，它有三个值：
>
> Strict 是最严格的，完全禁止第三方 Cookie，即使从其他网站点链接过来都不会携带。
>
> Lax 是默认值，相对宽松一些，允许通过链接导航携带，但 POST 请求、AJAX 请求、图片加载都不会携带。
>
> None 是允许所有跨站请求携带，但必须同时设置 Secure，只在 HTTPS 下生效。
>
> 另外，跨域请求默认不携带 Cookie，需要前端设置 credentials: 'include'，后端设置 Access-Control-Allow-Credentials: true。
>
> 在实际项目中，为了安全性，我们一般会设置 SameSite=Strict 或 Lax，同时配合 HttpOnly 和 Secure，这样可以有效防止 CSRF 和 XSS 攻击。"
:::

</details>
