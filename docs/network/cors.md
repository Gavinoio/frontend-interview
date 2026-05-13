# 跨域解决方案 【高频必考】

## 官方定义
跨域是指浏览器的同源策略限制，当一个请求的协议、域名、端口与当前页面不同时，就会产生跨域。同源策略是浏览器的安全机制，用于防止恶意网站读取其他网站的敏感数据。

## 白话解释
想象你住在小区A（当前网页），你想去小区B（其他域名）拿东西。保安（浏览器）会拦住你说"你不是B小区的人，不能进去拿"。跨域就是要找到合法的方式让保安放你进去。

---

## 同源策略

### 什么是同源？

| URL | 是否同源 | 原因 |
|-----|---------|------|
| `http://www.example.com/page1` | 基准URL | - |
| `http://www.example.com/page2` | ✅ 同源 | 路径不同，协议域名端口相同 |
| `https://www.example.com/page1` | ❌ 不同源 | 协议不同 (http vs https) |
| `http://api.example.com/page1` | ❌ 不同源 | 域名不同 (www vs api) |
| `http://www.example.com:8080/page1` | ❌ 不同源 | 端口不同 (80 vs 8080) |

### 同源策略限制的内容

1. **Cookie、LocalStorage、IndexedDB** 无法读取
2. **DOM** 无法获取（iframe）
3. **AJAX 请求** 无法发送（实际上请求发送了，但响应被拦截）

### 不受同源策略限制的标签

```html
<!-- 以下标签可以跨域加载资源 -->
<img src="跨域图片">
<link href="跨域CSS">
<script src="跨域JS"></script>
<video src="跨域视频"></video>
<audio src="跨域音频"></audio>
<iframe src="跨域页面"></iframe>  <!-- 但无法操作其 DOM -->
```

---

## 跨域解决方案

### 1. CORS（跨域资源共享）【最常用】

#### 官方定义
CORS（Cross-Origin Resource Sharing）是一个 W3C 标准，允许服务器声明哪些源站有权限访问哪些资源。

#### 白话解释
服务器告诉浏览器"这个网站我信任，让他过来吧"。

#### 简单请求 vs 预检请求

**简单请求需满足以下条件**：
1. 方法：GET、HEAD、POST
2. Content-Type：text/plain、multipart/form-data、application/x-www-form-urlencoded
3. 请求头只能包含：Accept、Accept-Language、Content-Language、Content-Type

**预检请求（Preflight）**：
```
浏览器                                 服务器
  │                                     │
  │──── OPTIONS /api/data ─────────────>│  预检请求
  │     Origin: http://example.com      │
  │     Access-Control-Request-Method   │
  │                                     │
  │<─── 200 OK ────────────────────────│  预检响应
  │     Access-Control-Allow-Origin     │
  │     Access-Control-Allow-Methods    │
  │                                     │
  │──── PUT /api/data ─────────────────>│  实际请求
  │                                     │
  │<─── 200 OK ────────────────────────│  实际响应
```

#### 服务端配置

```javascript
// Node.js Express
app.use((req, res, next) => {
  // 允许的源，* 表示所有，生产环境建议指定具体域名
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000')

  // 允许的请求方法
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')

  // 允许的请求头
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')

  // 允许携带 Cookie
  res.header('Access-Control-Allow-Credentials', 'true')

  // 预检请求缓存时间（秒）
  res.header('Access-Control-Max-Age', '86400')

  // 允许前端获取的响应头
  res.header('Access-Control-Expose-Headers', 'X-Custom-Header')

  // 预检请求直接返回
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }

  next()
})
```

```java
// Spring Boot
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(86400);
    }
}
```

```nginx
# Nginx 配置
location /api {
    add_header 'Access-Control-Allow-Origin' 'http://localhost:3000';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
    add_header 'Access-Control-Allow-Credentials' 'true';

    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Max-Age' 86400;
        return 204;
    }
}
```

#### 前端配置（携带 Cookie）

```javascript
// Fetch
fetch('http://api.example.com/data', {
  method: 'POST',
  credentials: 'include',  // 携带 Cookie
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})

// Axios
axios.defaults.withCredentials = true
axios.post('http://api.example.com/data', data)

// XMLHttpRequest
const xhr = new XMLHttpRequest()
xhr.withCredentials = true
xhr.open('POST', 'http://api.example.com/data')
xhr.send(data)
```

---

### 2. JSONP【面试必问】

#### 原理
利用 `<script>` 标签不受同源策略限制的特性，通过动态创建 script 标签请求数据。

#### 手写 JSONP

```javascript
function jsonp(url, callbackName = 'callback') {
  return new Promise((resolve, reject) => {
    // 1. 创建全局回调函数
    const fnName = `jsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`

    window[fnName] = function(data) {
      resolve(data)
      // 清理
      document.body.removeChild(script)
      delete window[fnName]
    }

    // 2. 创建 script 标签
    const script = document.createElement('script')
    script.src = `${url}${url.includes('?') ? '&' : '?'}${callbackName}=${fnName}`

    script.onerror = function() {
      reject(new Error('JSONP request failed'))
      document.body.removeChild(script)
      delete window[fnName]
    }

    // 3. 添加超时处理
    const timeout = setTimeout(() => {
      reject(new Error('JSONP request timeout'))
      document.body.removeChild(script)
      delete window[fnName]
    }, 10000)

    // 修改回调函数，清除超时
    const originalFn = window[fnName]
    window[fnName] = function(data) {
      clearTimeout(timeout)
      originalFn(data)
    }

    // 4. 插入页面
    document.body.appendChild(script)
  })
}

// 使用
jsonp('http://api.example.com/data', 'cb')
  .then(data => console.log(data))
  .catch(err => console.error(err))
```

#### 服务端配合

```javascript
// Node.js
app.get('/api/data', (req, res) => {
  const callback = req.query.callback
  const data = { name: 'John', age: 30 }

  // 返回 JavaScript 代码
  res.type('application/javascript')
  res.send(`${callback}(${JSON.stringify(data)})`)
})
```

#### JSONP 的缺点

| 缺点 | 说明 |
|------|------|
| 只支持 GET | 无法使用 POST 等方法 |
| 安全性差 | 容易受到 XSS 攻击 |
| 错误处理困难 | 难以捕获 HTTP 错误状态码 |
| 需要服务端配合 | 服务端要返回特定格式 |

---

### 3. 代理服务器【开发最常用】

#### 原理
同源策略是浏览器的限制，服务器之间没有跨域问题。通过代理服务器转发请求。

```
浏览器 ──> 同源代理服务器 ──> 目标服务器
        （无跨域）        （服务器间无跨域）
```

#### Webpack Dev Server

```javascript
// webpack.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://api.example.com',
        changeOrigin: true,  // 修改请求头中的 Host
        pathRewrite: {
          '^/api': ''  // 重写路径
        },
        // 处理 HTTPS
        secure: false,
        // 自定义请求头
        headers: {
          'X-Custom-Header': 'value'
        }
      }
    }
  }
}
```

#### Vite 代理

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // WebSocket 代理
      '/socket.io': {
        target: 'ws://localhost:3000',
        ws: true
      }
    }
  }
}
```

#### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name www.example.com;

    # 静态资源
    location / {
        root /var/www/html;
        index index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://api.example.com/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

### 4. postMessage【iframe 跨域通信】

```javascript
// 父页面 http://parent.com
const iframe = document.getElementById('iframe')

// 发送消息
iframe.contentWindow.postMessage(
  { type: 'greeting', data: 'Hello from parent' },
  'http://child.com'  // 目标源
)

// 接收消息
window.addEventListener('message', (event) => {
  // 验证来源！
  if (event.origin !== 'http://child.com') return

  console.log('收到子页面消息:', event.data)
})
```

```javascript
// 子页面 http://child.com
// 接收消息
window.addEventListener('message', (event) => {
  // 验证来源！
  if (event.origin !== 'http://parent.com') return

  console.log('收到父页面消息:', event.data)

  // 回复消息
  event.source.postMessage(
    { type: 'response', data: 'Hello from child' },
    event.origin
  )
})
```

---

### 5. WebSocket

WebSocket 不受同源策略限制（但服务端可以检查 Origin）。

```javascript
const ws = new WebSocket('ws://other-domain.com/socket')

ws.onopen = () => {
  ws.send('Hello Server')
}

ws.onmessage = (event) => {
  console.log('收到消息:', event.data)
}
```

---

### 6. document.domain【已废弃】

> ⚠️ 此方法已被废弃，不建议使用

仅适用于主域相同的情况：

```javascript
// http://a.example.com
document.domain = 'example.com'

// http://b.example.com
document.domain = 'example.com'

// 现在可以互相访问
```

---

## 经典面试题

::: details 面试题 1：CORS 的简单请求和预检请求的区别？
<details>
<summary>点击查看答案</summary>

**简单请求**：
- 方法：GET、HEAD、POST
- Content-Type：text/plain、multipart/form-data、application/x-www-form-urlencoded
- 无自定义请求头
- 直接发送请求，响应时检查 CORS 头

**预检请求**：
- 不满足简单请求条件时触发
- 先发送 OPTIONS 请求
- 服务器确认允许后，再发送实际请求
- 可通过 Access-Control-Max-Age 缓存预检结果
:::

---

</details>

::: details 面试题 2：为什么 form 表单可以跨域提交，但 AJAX 不行？
<details>
<summary>点击查看答案</summary>

**关键区别**：

1. **form 表单提交**：
   - 提交后页面会跳转/刷新
   - 浏览器无法获取响应内容
   - 不会泄露数据给原页面

2. **AJAX 请求**：
   - 页面不跳转
   - JavaScript 可以获取响应内容
   - 可能泄露目标服务器的数据

**同源策略保护的是数据读取**，而不是请求发送。form 表单无法读取响应，所以不受限制。
:::

---

</details>

::: details 面试题 3：如何解决跨域时 Cookie 无法携带的问题？
<details>
<summary>点击查看答案</summary>

**前端配置**：
```javascript
// Fetch
fetch(url, { credentials: 'include' })

// Axios
axios.defaults.withCredentials = true

// XMLHttpRequest
xhr.withCredentials = true
```

**服务端配置**：
```javascript
// 必须设置
res.header('Access-Control-Allow-Credentials', 'true')

// 注意：此时 Access-Control-Allow-Origin 不能是 *
// 必须指定具体域名
res.header('Access-Control-Allow-Origin', 'http://example.com')
```

**Cookie 设置**：
```javascript
// Cookie 需要设置 SameSite 属性
Set-Cookie: token=xxx; SameSite=None; Secure
```
:::

---

</details>

::: details 面试题 4：Access-Control-Allow-Origin 能设置多个域名吗？
<details>
<summary>点击查看答案</summary>

**不能直接设置多个**，只能是：
- 单个具体域名：`http://example.com`
- 通配符：`*`（但不能携带 Cookie）

**解决方案 - 动态设置**：
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://www.example.com',
  'http://admin.example.com'
]

app.use((req, res, next) => {
  const origin = req.headers.origin

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
  }

  res.header('Access-Control-Allow-Credentials', 'true')
  next()
})
```
:::

---

</details>

::: details 面试题 5：手写一个完整的 JSONP
<details>
<summary>点击查看答案</summary>

```javascript
function jsonp({ url, params = {}, callbackKey = 'callback', timeout = 10000 }) {
  return new Promise((resolve, reject) => {
    // 生成唯一回调函数名
    const callbackName = `jsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`

    // 构建 URL
    const queryString = Object.entries({ ...params, [callbackKey]: callbackName })
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
    const fullUrl = `${url}${url.includes('?') ? '&' : '?'}${queryString}`

    // 创建 script 标签
    const script = document.createElement('script')
    script.src = fullUrl

    // 清理函数
    const cleanup = () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
      delete window[callbackName]
      clearTimeout(timer)
    }

    // 超时处理
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error('JSONP request timeout'))
    }, timeout)

    // 定义回调函数
    window[callbackName] = (data) => {
      cleanup()
      resolve(data)
    }

    // 错误处理
    script.onerror = () => {
      cleanup()
      reject(new Error('JSONP request failed'))
    }

    // 插入 script
    document.head.appendChild(script)
  })
}

// 使用示例
jsonp({
  url: 'http://api.example.com/data',
  params: { id: 1, name: 'test' },
  callbackKey: 'cb',
  timeout: 5000
})
  .then(data => console.log(data))
  .catch(err => console.error(err))
```
:::

---

</details>

::: details 面试题 6：CORS 预检请求失败会怎样？
<details>
<summary>点击查看答案</summary>

1. **浏览器不会发送实际请求**
2. **控制台显示 CORS 错误**
3. **AJAX 的 onerror 会被触发**
4. **无法获取详细错误信息**（安全原因）

**常见失败原因**：
- 服务端没有处理 OPTIONS 请求
- Access-Control-Allow-Methods 没有包含请求方法
- Access-Control-Allow-Headers 没有包含自定义请求头
- Access-Control-Allow-Origin 配置错误
:::

---

</details>

::: details 面试题 7：跨域请求真的发出去了吗？
<details>
<summary>点击查看答案</summary>

**是的，请求发出去了！**

同源策略是浏览器的安全机制，它：
- **不阻止请求发送**
- **阻止响应被 JavaScript 读取**

可以通过以下方式验证：
1. 服务端日志可以看到请求
2. 浏览器 Network 面板可以看到请求（状态码可能是 200）
3. 但 JavaScript 无法读取响应

**这就是为什么 CSRF 攻击是可能的** - 请求确实发送了，只是浏览器不让 JS 读取响应。
:::

---

</details>

## 跨域解决方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| CORS | 标准、功能强大 | 需要服务端支持 | 生产环境首选 |
| JSONP | 兼容性好 | 只支持 GET，不安全 | 老项目、第三方API |
| 代理 | 无需服务端改动 | 增加服务器负担 | 开发环境 |
| postMessage | 灵活 | 需要双方配合 | iframe 通信 |
| WebSocket | 双向通信 | 需要服务端支持 | 实时通信 |

---

## 总结速记

```
1. 同源 = 协议 + 域名 + 端口 都相同
2. CORS 是标准方案，分简单请求和预检请求
3. 简单请求：GET/HEAD/POST + 普通 Content-Type
4. 携带 Cookie 需要双端配置，Origin 不能是 *
5. JSONP 利用 script 标签，只能 GET
6. 开发环境用代理，生产环境用 CORS
7. 跨域请求会发出，但响应被拦截
```

---

## 高频面试题

::: details 面试题 1：什么是跨域？为什么会有跨域问题？
#### 一句话答案
跨域是浏览器的同源策略导致的，当请求的协议、域名、端口与当前页面任意一个不同时，浏览器会阻止 JavaScript 读取响应数据，以防止恶意网站窃取其他网站的敏感信息。

#### 详细解答

**什么是跨域**：

跨域（Cross-Origin）是指浏览器不允许当前页面的脚本访问非同源的资源。同源需要满足三个条件：
1. **协议相同**（http/https）
2. **域名相同**（包括子域名）
3. **端口相同**（默认 http:80, https:443）

**为什么会有跨域问题**：

浏览器实施同源策略（Same-Origin Policy）的目的是保护用户信息安全：

1. **防止 CSRF 攻击**：恶意网站无法读取其他网站的响应数据
2. **保护 Cookie**：防止恶意网站读取其他域的 Cookie
3. **防止 DOM 查询**：iframe 无法访问不同源页面的 DOM

**示例说明**：

```javascript
// 当前页面：http://www.example.com

// ✅ 同源 - 只是路径不同
fetch('http://www.example.com/api/data')

// ❌ 跨域 - 协议不同
fetch('https://www.example.com/api/data')

// ❌ 跨域 - 域名不同
fetch('http://api.example.com/data')

// ❌ 跨域 - 端口不同
fetch('http://www.example.com:8080/api/data')
```

**同源策略的限制范围**：

```javascript
// 1. 限制 Cookie、LocalStorage、IndexedDB 的读取
localStorage.getItem('token') // 只能访问同源的存储

// 2. 限制 DOM 的访问
const iframe = document.getElementById('myIframe')
iframe.contentWindow.document // 跨域 iframe 无法访问

// 3. 限制 AJAX 请求的响应读取
fetch('http://other-domain.com/api')
  .then(res => res.json()) // 跨域时会报错
```

**不受同源策略限制的情况**：

```html
<!-- 以下资源可以跨域加载 -->
<img src="http://other-domain.com/image.jpg">
<link rel="stylesheet" href="http://other-domain.com/style.css">
<script src="http://other-domain.com/script.js"></script>
<video src="http://other-domain.com/video.mp4"></video>
<iframe src="http://other-domain.com/page.html"></iframe>
<!-- 但无法通过 JS 读取这些资源的内容或操作其 DOM -->
```

**重要理解**：

跨域请求其实**已经发出并到达服务器**，服务器也正常返回了响应。问题在于**浏览器拦截了响应数据，不让 JavaScript 读取**。这是浏览器的安全机制，不是服务器的限制。

```javascript
// 这个请求实际上发送了
fetch('http://api.other-domain.com/data')
  .then(res => res.json())
  .catch(err => {
    // 浏览器控制台错误：
    // Access to fetch at 'http://api.other-domain.com/data'
    // from origin 'http://www.example.com' has been blocked by CORS policy
    console.error(err)
  })

// 服务器日志：✅ 收到请求，返回 200
// 浏览器：❌ 拦截响应，JavaScript 读取失败
```

#### 面试口语化回答模板

```
面试官：什么是跨域？为什么会有跨域问题？

我：跨域是浏览器的同源策略造成的一个安全限制。

首先解释一下什么是同源：同源要求协议、域名、端口三者完全相同。
比如我当前页面是 http://www.example.com，如果我请求 https://www.example.com，
虽然只是协议从 http 变成了 https，这也算跨域。
再比如从 www.example.com 请求 api.example.com，虽然都是 example.com 域，
但子域名不同，这也是跨域。

那为什么会有跨域限制呢？这是浏览器的安全机制，主要为了保护用户数据。

举个例子，假如我登录了银行网站 bank.com，浏览器里有我的登录态 Cookie。
这时候我访问了一个恶意网站 evil.com，如果没有同源策略的话，
evil.com 的脚本就可以直接用我的 Cookie 去请求 bank.com 的接口，
获取我的账户信息，甚至进行转账操作。

有了同源策略后，evil.com 虽然可以发请求到 bank.com，
但是浏览器会拦截响应，不让 evil.com 的 JavaScript 读取响应内容，
这样就保护了用户的数据安全。

需要注意的是，跨域请求其实是发出去了的，服务器也返回了数据，
只是浏览器出于安全考虑，不让 JavaScript 读取响应。
这也是为什么我们在浏览器的 Network 面板能看到跨域请求，
但在代码里却拿不到数据的原因。

当然，有些资源是不受限制的，比如 img、script、link 标签，
因为这些标签加载的资源不会被 JavaScript 直接读取内容，
所以不存在数据泄露的风险。
```

---
:::

::: details 面试题 2：解决跨域的方案有哪些？
#### 一句话答案
常见的跨域解决方案有 CORS（生产首选）、JSONP（只支持 GET）、代理服务器（开发常用）、postMessage（iframe 通信）和 WebSocket（不受限制）。

#### 详细解答

#### 方案 1：CORS（生产环境首选）

**原理**：服务器通过设置响应头告诉浏览器允许跨域访问。

**服务端配置**：

```javascript
// Node.js Express
app.use((req, res, next) => {
  // 允许的源（生产环境应指定具体域名）
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000')

  // 允许的 HTTP 方法
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')

  // 允许的请求头
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // 允许携带凭证（Cookie）
  res.header('Access-Control-Allow-Credentials', 'true')

  // 预检请求缓存时间
  res.header('Access-Control-Max-Age', '86400')

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }

  next()
})
```

**前端配置（携带 Cookie）**：

```javascript
// Fetch API
fetch('http://api.example.com/data', {
  method: 'POST',
  credentials: 'include', // 携带 Cookie
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  },
  body: JSON.stringify({ name: 'John' })
})

// Axios
axios.defaults.withCredentials = true
axios.post('http://api.example.com/data', { name: 'John' })
```

**注意事项**：
- 携带 Cookie 时，`Access-Control-Allow-Origin` 不能设为 `*`，必须指定具体域名
- Cookie 需要设置 `SameSite=None; Secure` 属性

#### 方案 2：JSONP（兼容老浏览器）

**原理**：利用 `<script>` 标签不受同源策略限制的特性。

**手写 JSONP 实现**：

```javascript
function jsonp({ url, params = {}, callbackKey = 'callback', timeout = 10000 }) {
  return new Promise((resolve, reject) => {
    // 1. 生成唯一回调函数名
    const callbackName = `jsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`

    // 2. 构建请求 URL
    const queryString = Object.entries({ ...params, [callbackKey]: callbackName })
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    const fullUrl = `${url}?${queryString}`

    // 3. 创建 script 标签
    const script = document.createElement('script')
    script.src = fullUrl

    // 4. 清理函数
    const cleanup = () => {
      script.parentNode?.removeChild(script)
      delete window[callbackName]
      clearTimeout(timer)
    }

    // 5. 超时处理
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error('JSONP timeout'))
    }, timeout)

    // 6. 定义全局回调
    window[callbackName] = (data) => {
      cleanup()
      resolve(data)
    }

    // 7. 错误处理
    script.onerror = () => {
      cleanup()
      reject(new Error('JSONP failed'))
    }

    // 8. 发起请求
    document.head.appendChild(script)
  })
}

// 使用示例
jsonp({
  url: 'http://api.example.com/data',
  params: { id: 1 }
})
  .then(data => console.log(data))
  .catch(err => console.error(err))
```

**服务端配合**：

```javascript
// Node.js
app.get('/api/data', (req, res) => {
  const callback = req.query.callback
  const data = { name: 'John', age: 30 }

  // 返回可执行的 JavaScript 代码
  res.type('application/javascript')
  res.send(`${callback}(${JSON.stringify(data)})`)
})

// 返回内容：jsonp_123456_abc({ "name": "John", "age": 30 })
```

**JSONP 缺点**：
- 只支持 GET 请求
- 存在 XSS 安全风险
- 错误处理困难
- 需要服务端配合

#### 方案 3：代理服务器（开发环境常用）

**原理**：同源策略是浏览器的限制，服务器之间通信不受限制。

**Vite 开发代理**：

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://api.example.com',
        changeOrigin: true, // 修改请求头中的 Host
        rewrite: (path) => path.replace(/^\/api/, ''),
        // 配置 HTTPS
        secure: false,
        // 自定义请求头
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('X-Custom-Header', 'value')
          })
        }
      }
    }
  }
}
```

**Nginx 生产代理**：

```nginx
server {
    listen 80;
    server_name www.example.com;

    # 前端静态资源
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://api-server.com/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**请求流程**：

```
浏览器 → 同源代理服务器 → 目标服务器
      (无跨域)         (服务器间无跨域)
```

#### 方案 4：postMessage（iframe 通信）

**使用场景**：不同源的 iframe 之间通信。

```javascript
// 父页面 http://parent.com
const iframe = document.getElementById('myIframe')

// 发送消息
iframe.contentWindow.postMessage(
  { type: 'greeting', data: 'Hello' },
  'http://child.com' // 目标源，必须指定
)

// 接收消息
window.addEventListener('message', (event) => {
  // 安全检查：验证来源
  if (event.origin !== 'http://child.com') return

  console.log('收到消息：', event.data)
  console.log('来源：', event.origin)
  console.log('源窗口：', event.source)
})
```

```javascript
// 子页面 http://child.com
window.addEventListener('message', (event) => {
  // 安全检查
  if (event.origin !== 'http://parent.com') return

  console.log('收到父页面消息：', event.data)

  // 回复消息
  event.source.postMessage(
    { type: 'response', data: 'Hello back' },
    event.origin
  )
})
```

#### 方案 5：WebSocket（双向通信）

**原理**：WebSocket 协议不受同源策略限制。

```javascript
// 建立 WebSocket 连接（可跨域）
const ws = new WebSocket('ws://other-domain.com:8080')

ws.onopen = () => {
  console.log('连接成功')
  ws.send(JSON.stringify({ type: 'hello' }))
}

ws.onmessage = (event) => {
  console.log('收到消息：', JSON.parse(event.data))
}

ws.onerror = (error) => {
  console.error('连接错误：', error)
}

ws.onclose = () => {
  console.log('连接关闭')
}
```

**服务端可以验证 Origin**：

```javascript
// Node.js ws 库
const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', (ws, req) => {
  const origin = req.headers.origin

  // 验证来源
  if (origin !== 'http://trusted-domain.com') {
    ws.close()
    return
  }

  ws.on('message', (message) => {
    console.log('收到消息：', message)
    ws.send('收到了')
  })
})
```

#### 方案对比总结

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| CORS | W3C 标准，功能完整 | 需要服务端支持，IE10+ | 生产环境首选 |
| JSONP | 兼容性好（IE6+） | 只支持 GET，安全性差 | 老浏览器、只读接口 |
| 代理 | 前端无需改动 | 增加服务器开销 | 开发环境、生产 Nginx |
| postMessage | 双向通信，安全 | 只适用于窗口间 | iframe、窗口通信 |
| WebSocket | 实时双向通信 | 需要服务端支持 | 聊天、推送等实时场景 |

#### 面试口语化回答模板

```
面试官：解决跨域的方案有哪些？

我：解决跨域主要有以下几种方案，我按使用场景来说：

1. 生产环境首选 CORS
这是 W3C 标准，通过服务器设置响应头来允许跨域。
服务端需要设置 Access-Control-Allow-Origin 等响应头，
前端如果要携带 Cookie，还需要设置 credentials: 'include'。
这个方案功能最完整，支持所有 HTTP 方法，是目前主流的解决方案。

2. 开发环境常用代理
比如 Vite 或 Webpack 的 devServer 配置 proxy，
原理很简单，同源策略是浏览器的限制，服务器之间通信不受限制。
浏览器请求同源的代理服务器，代理服务器再转发给真实的 API 服务器。
生产环境也可以用 Nginx 做反向代理。

3. 老项目可能用 JSONP
利用 script 标签不受同源策略限制的特性，
通过动态创建 script 标签来请求数据，服务器返回一段执行回调函数的代码。
但它有很大局限性：只支持 GET 请求，而且有 XSS 安全风险，
现在基本不用了，除非要兼容很老的浏览器。

4. iframe 通信用 postMessage
如果是不同域的 iframe 之间需要通信，可以用 window.postMessage API，
它可以安全地实现跨域消息传递，接收方要验证消息来源的 origin。

5. 实时通信用 WebSocket
WebSocket 协议本身不受同源策略限制，
适合需要双向实时通信的场景，比如聊天室、实时推送等。

实际项目中，我们一般是开发环境用代理，生产环境用 CORS，
这样前后端分离的话配置起来比较方便。
```

---
:::

::: details 面试题 3：CORS 是怎么工作的？简单请求和预检请求的区别？
#### 一句话答案
CORS 通过服务器设置响应头来告诉浏览器允许跨域访问；简单请求直接发送，预检请求会先发送 OPTIONS 请求询问服务器是否允许，得到许可后再发送实际请求。

#### 详细解答

#### CORS 工作原理

CORS（Cross-Origin Resource Sharing，跨域资源共享）是一套浏览器和服务器之间的协商机制：

1. **浏览器自动添加 Origin 请求头**，表明请求来自哪个源
2. **服务器检查 Origin，设置响应头**，告诉浏览器是否允许
3. **浏览器检查响应头**，决定是否允许 JavaScript 读取响应

#### 简单请求（Simple Request）

**触发条件（需同时满足）**：

1. **请求方法**是以下之一：
   - `GET`
   - `HEAD`
   - `POST`

2. **请求头**仅包含以下字段：
   - `Accept`
   - `Accept-Language`
   - `Content-Language`
   - `Content-Type`（仅限以下三种值）
     - `text/plain`
     - `multipart/form-data`
     - `application/x-www-form-urlencoded`

**简单请求流程**：

```
浏览器                                服务器
  │                                    │
  │──── GET /api/data ────────────────>│
  │     Origin: http://example.com     │
  │     (自动添加)                      │
  │                                    │
  │<─── 200 OK ────────────────────────│
  │     Access-Control-Allow-Origin:   │
  │     http://example.com             │
  │     (服务器添加)                    │
  │                                    │
 允许 JavaScript 读取响应
```

**示例代码**：

```javascript
// 前端 - 简单请求
fetch('http://api.example.com/data', {
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data))
```

```javascript
// 服务端 - Node.js
app.get('/data', (req, res) => {
  // 检查来源
  const origin = req.headers.origin

  if (origin === 'http://example.com') {
    // 允许该源访问
    res.header('Access-Control-Allow-Origin', origin)
  }

  res.json({ name: 'John', age: 30 })
})
```

#### 预检请求（Preflight Request）

**触发条件（满足任一）**：

1. **请求方法**是：
   - `PUT`
   - `DELETE`
   - `CONNECT`
   - `OPTIONS`
   - `TRACE`
   - `PATCH`

2. **Content-Type** 是：
   - `application/json`
   - `application/xml`
   - `text/xml`
   - 其他自定义类型

3. **包含自定义请求头**：
   - `Authorization`
   - `X-Custom-Header`
   - 等自定义头

**预检请求流程**：

```
浏览器                                      服务器
  │                                          │
  │──── OPTIONS /api/data ──────────────────>│  预检请求
  │     Origin: http://example.com           │
  │     Access-Control-Request-Method: PUT   │
  │     Access-Control-Request-Headers:      │
  │       Content-Type, Authorization        │
  │                                          │
  │<─── 204 No Content ──────────────────────│  预检响应
  │     Access-Control-Allow-Origin:         │
  │       http://example.com                 │
  │     Access-Control-Allow-Methods:        │
  │       GET, POST, PUT, DELETE             │
  │     Access-Control-Allow-Headers:        │
  │       Content-Type, Authorization        │
  │     Access-Control-Max-Age: 86400        │
  │                                          │
  │──── PUT /api/data ───────────────────────>│  实际请求
  │     Origin: http://example.com           │
  │     Content-Type: application/json       │
  │     Authorization: Bearer token          │
  │     Body: { "name": "John" }             │
  │                                          │
  │<─── 200 OK ──────────────────────────────│  实际响应
  │     Access-Control-Allow-Origin:         │
  │       http://example.com                 │
  │     { "success": true }                  │
  │                                          │
 允许 JavaScript 读取响应
```

**示例代码**：

```javascript
// 前端 - 触发预检请求
fetch('http://api.example.com/user', {
  method: 'PUT', // 非简单请求方法
  headers: {
    'Content-Type': 'application/json', // 非简单请求 Content-Type
    'Authorization': 'Bearer token123'  // 自定义请求头
  },
  body: JSON.stringify({ name: 'John' })
})
.then(res => res.json())
.then(data => console.log(data))
```

```javascript
// 服务端 - Node.js 处理预检和实际请求
app.use((req, res, next) => {
  const origin = req.headers.origin

  // 设置允许的源
  if (['http://localhost:3000', 'http://example.com'].includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
  }

  // 设置允许的方法
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')

  // 设置允许的请求头
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Custom-Header')

  // 设置允许携带凭证
  res.header('Access-Control-Allow-Credentials', 'true')

  // 设置预检请求缓存时间（秒）
  res.header('Access-Control-Max-Age', '86400') // 24小时

  // 预检请求直接返回 200/204
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }

  next()
})

// 实际业务接口
app.put('/user', (req, res) => {
  const { name } = req.body
  res.json({ success: true, message: `Updated user: ${name}` })
})
```

#### 简单请求 vs 预检请求对比

| 对比项 | 简单请求 | 预检请求 |
|-------|---------|---------|
| **请求次数** | 1 次 | 2 次（OPTIONS + 实际请求） |
| **请求方法** | GET、HEAD、POST | PUT、DELETE、PATCH 等 |
| **Content-Type** | 三种简单类型 | application/json 等 |
| **自定义请求头** | 不允许 | 允许 |
| **性能** | 更快 | 多一次请求，稍慢 |
| **缓存** | 无需缓存 | 可通过 Max-Age 缓存 |
| **适用场景** | 简单的数据获取 | RESTful API、需要认证的请求 |

#### 预检请求优化

**问题**：每次请求都要先发 OPTIONS，性能开销大。

**解决方案**：使用 `Access-Control-Max-Age` 缓存预检结果。

```javascript
// 服务端设置缓存时间
res.header('Access-Control-Max-Age', '86400') // 24小时内不再发预检请求

// 或者更长时间
res.header('Access-Control-Max-Age', '7200') // 2小时
```

**效果**：

```
第一次请求：OPTIONS + PUT（2 次请求）
24 小时内再次请求：PUT（1 次请求，跳过 OPTIONS）
```

#### 常见 CORS 响应头详解

```javascript
// 1. 必需：允许的源
res.header('Access-Control-Allow-Origin', 'http://example.com')
// 不能是 * 如果要携带 Cookie

// 2. 允许的方法（预检需要）
res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')

// 3. 允许的请求头（预检需要）
res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

// 4. 允许携带 Cookie
res.header('Access-Control-Allow-Credentials', 'true')

// 5. 预检缓存时间
res.header('Access-Control-Max-Age', '86400')

// 6. 允许前端访问的响应头
res.header('Access-Control-Expose-Headers', 'X-Total-Count, X-Page-Number')
// 默认只能访问 6 个基本响应头：
// Cache-Control、Content-Language、Content-Type、
// Expires、Last-Modified、Pragma
```

#### 实际应用示例

```javascript
// 完整的 Express CORS 中间件
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://www.example.com'
]

app.use((req, res, next) => {
  const origin = req.headers.origin

  // 动态设置允许的源
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Credentials', 'true')
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  res.header('Access-Control-Max-Age', '86400')
  res.header('Access-Control-Expose-Headers', 'X-Total-Count')

  // OPTIONS 请求快速响应
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }

  next()
})
```

#### 面试口语化回答模板

```
面试官：CORS 是怎么工作的？简单请求和预检请求的区别？

我：CORS 的工作原理其实是浏览器和服务器之间的一种协商机制。

当我们发起跨域请求时，浏览器会自动在请求头里加上 Origin 字段，
告诉服务器"我是从哪个源发起的请求"。
服务器收到后，检查这个 Origin 是否在白名单里，
如果允许的话，就在响应头里设置 Access-Control-Allow-Origin，
浏览器看到这个响应头，才会允许 JavaScript 读取响应数据。

CORS 请求分为两种：简单请求和预检请求。

简单请求需要同时满足几个条件：
1. 方法只能是 GET、HEAD 或 POST
2. Content-Type 只能是三种简单类型，比如 application/x-www-form-urlencoded
3. 不能有自定义请求头

简单请求只需要发一次请求，浏览器直接发送，然后检查响应头是否允许。

但现在前后端分离的项目，一般都用 JSON 格式传数据，
Content-Type 是 application/json，
而且经常需要加 Authorization 这种自定义请求头，
这些都不满足简单请求的条件，所以会触发预检请求。

预检请求会先发一个 OPTIONS 请求，问服务器"我想用 PUT 方法，
带 application/json 和 Authorization 请求头，你允许吗？"
服务器如果允许，就返回对应的 Allow-Methods 和 Allow-Headers。
浏览器确认允许后，才会发送真正的请求。

这样一来，预检请求就是两次网络请求，会有性能开销。
不过可以通过 Access-Control-Max-Age 来缓存预检结果，
比如设置 86400 秒，就是 24 小时内不用再发预检请求了。

实际开发中，我们一般会在服务端统一处理 CORS，
判断一下请求方法，如果是 OPTIONS 就直接返回 204，
这样可以快速响应预检请求，减少性能损耗。
```
:::
