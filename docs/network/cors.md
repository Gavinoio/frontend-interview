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

