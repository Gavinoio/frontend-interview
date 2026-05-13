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

