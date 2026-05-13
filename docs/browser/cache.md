# 浏览器缓存

## 概述

浏览器缓存是一种性能优化机制，通过存储已获取的资源副本，避免重复请求，提高页面加载速度。

## 缓存类型总览

```
浏览器缓存
├── HTTP 缓存
│   ├── 强缓存（不发请求）
│   │   ├── Cache-Control
│   │   └── Expires
│   └── 协商缓存（发请求验证）
│       ├── ETag / If-None-Match
│       └── Last-Modified / If-Modified-Since
├── 浏览器存储
│   ├── localStorage
│   ├── sessionStorage
│   ├── IndexedDB
│   └── Cookie
└── 应用缓存
    ├── Service Worker
    └── Application Cache (已废弃)
```

## 强缓存

强缓存命中时，浏览器直接使用本地缓存，不会发送请求到服务器。

### Cache-Control

```javascript
// HTTP 响应头
Cache-Control: max-age=31536000

// 常用指令
Cache-Control: max-age=3600        // 缓存有效期 3600 秒
Cache-Control: no-cache            // 每次使用前必须验证
Cache-Control: no-store            // 不缓存任何内容
Cache-Control: private             // 仅浏览器可缓存
Cache-Control: public              // 浏览器和代理都可缓存
Cache-Control: immutable           // 资源永不变化
Cache-Control: must-revalidate     // 过期后必须验证

// 组合使用
Cache-Control: public, max-age=31536000, immutable
Cache-Control: private, no-cache
```

### Expires

```javascript
// HTTP 响应头（HTTP/1.0）
Expires: Wed, 21 Oct 2025 07:28:00 GMT

// 缺点：
// 1. 使用绝对时间，受客户端时间影响
// 2. 如果客户端时间不准确，缓存可能失效

// 优先级：Cache-Control > Expires
// 如果同时存在，Cache-Control 生效
```

### 强缓存判断流程

```javascript
// 伪代码
function checkStrongCache(request, cachedResponse) {
  const cacheControl = cachedResponse.headers['cache-control'];
  const expires = cachedResponse.headers['expires'];
  const date = cachedResponse.headers['date'];

  // 1. 检查 Cache-Control
  if (cacheControl) {
    if (cacheControl.includes('no-store')) {
      return { useCachedResponse: false };
    }
    if (cacheControl.includes('no-cache')) {
      return { useCachedResponse: false, needValidation: true };
    }

    const maxAge = parseMaxAge(cacheControl);
    if (maxAge) {
      const cacheTime = new Date(date).getTime();
      const now = Date.now();
      const age = (now - cacheTime) / 1000;

      if (age < maxAge) {
        return { useCachedResponse: true };  // 强缓存命中
      }
    }
  }

  // 2. 检查 Expires
  if (expires) {
    const expiresTime = new Date(expires).getTime();
    if (Date.now() < expiresTime) {
      return { useCachedResponse: true };  // 强缓存命中
    }
  }

  return { useCachedResponse: false, needValidation: true };
}
```

## 协商缓存

强缓存未命中时，浏览器会发送请求到服务器验证缓存是否可用。

### ETag / If-None-Match

```javascript
// 第一次请求，服务器返回 ETag
HTTP/1.1 200 OK
ETag: "33a64df551425fcc55e4d42a148795d9"
Content-Type: text/html

// 第二次请求，浏览器带上 If-None-Match
GET /index.html HTTP/1.1
If-None-Match: "33a64df551425fcc55e4d42a148795d9"

// 服务器验证
// 1. ETag 相同 -> 返回 304 Not Modified（使用缓存）
// 2. ETag 不同 -> 返回 200 和新内容
```

```javascript
// ETag 生成方式
// 1. 基于内容哈希
const crypto = require('crypto');
const content = fs.readFileSync('file.html');
const etag = crypto.createHash('md5').update(content).digest('hex');

// 2. 基于修改时间和大小
const stats = fs.statSync('file.html');
const etag = \`"\${stats.mtime.getTime()}-\${stats.size}"\`;

// ETag 类型
// 强 ETag: "abc123"  - 内容完全一致
// 弱 ETag: W/"abc123" - 语义一致（允许微小差异）
```

### Last-Modified / If-Modified-Since

```javascript
// 第一次请求，服务器返回 Last-Modified
HTTP/1.1 200 OK
Last-Modified: Wed, 21 Oct 2024 07:28:00 GMT
Content-Type: text/html

// 第二次请求，浏览器带上 If-Modified-Since
GET /index.html HTTP/1.1
If-Modified-Since: Wed, 21 Oct 2024 07:28:00 GMT

// 服务器验证
// 1. 文件未修改 -> 返回 304 Not Modified
// 2. 文件已修改 -> 返回 200 和新内容
```

```javascript
// Last-Modified 的缺点：
// 1. 精度只到秒级，1秒内多次修改无法识别
// 2. 只要修改时间变了就会重新请求，即使内容没变
// 3. 服务器无法准确获取修改时间（如动态生成的内容）

// ETag vs Last-Modified
// 优先级：ETag > Last-Modified
// ETag 更精确，但计算有开销
```

### 协商缓存验证流程

```javascript
// 服务器端验证逻辑
function validateCache(request, resource) {
  const ifNoneMatch = request.headers['if-none-match'];
  const ifModifiedSince = request.headers['if-modified-since'];

  // 1. 验证 ETag
  if (ifNoneMatch) {
    const currentEtag = generateEtag(resource);
    if (ifNoneMatch === currentEtag) {
      return { status: 304 };  // 返回 304
    }
  }

  // 2. 验证 Last-Modified
  if (ifModifiedSince) {
    const lastModified = resource.mtime;
    if (new Date(ifModifiedSince) >= lastModified) {
      return { status: 304 };  // 返回 304
    }
  }

  // 缓存无效，返回新内容
  return {
    status: 200,
    body: resource.content,
    headers: {
      'ETag': generateEtag(resource),
      'Last-Modified': resource.mtime.toUTCString()
    }
  };
}
```

## 缓存策略实践

### 常见缓存策略

```javascript
// 1. HTML 文件：不缓存或短时间缓存
Cache-Control: no-cache
// 或
Cache-Control: max-age=0, must-revalidate

// 2. CSS/JS 文件（带哈希）：长期缓存
// 文件名: app.a1b2c3d4.js
Cache-Control: public, max-age=31536000, immutable

// 3. 图片/字体：长期缓存
Cache-Control: public, max-age=31536000

// 4. API 响应：通常不缓存
Cache-Control: no-store
// 或针对特定接口
Cache-Control: private, max-age=60
```

### Webpack 缓存配置

```javascript
// webpack.config.js
module.exports = {
  output: {
    // 内容哈希，内容变化时文件名变化
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js'
  },

  optimization: {
    // 提取运行时代码
    runtimeChunk: 'single',

    // 分割代码
    splitChunks: {
      cacheGroups: {
        // 第三方库单独打包，很少变化
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};
```

### Nginx 缓存配置

```nginx
# HTML 文件 - 不缓存
location ~* \.html$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}

# 静态资源 - 长期缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
}

# API 接口 - 不缓存
location /api/ {
    add_header Cache-Control "no-store";
}
```

## 缓存位置

### 缓存读取顺序

```
1. Service Worker
2. Memory Cache（内存缓存）
3. Disk Cache（硬盘缓存）
4. Push Cache（HTTP/2 推送缓存）
5. 网络请求
```

### Memory Cache vs Disk Cache

```javascript
// Memory Cache
// - 存储在内存中，读取速度快
// - 页面关闭后清除
// - 容量小，适合小文件
// - 预加载的资源通常进入 Memory Cache

// Disk Cache
// - 存储在硬盘中，读取速度较慢
// - 持久化存储，页面关闭后保留
// - 容量大
// - 大文件、CSS 通常进入 Disk Cache

// 浏览器会自动判断资源放入哪个缓存
// - 当前页面使用的 JS/图片 -> Memory Cache
// - 大文件、不常用资源 -> Disk Cache
```

### 查看缓存来源

```javascript
// Chrome DevTools -> Network 面板
// Size 列显示：
// - (memory cache) - 来自内存缓存
// - (disk cache) - 来自硬盘缓存
// - (ServiceWorker) - 来自 Service Worker
// - 具体大小 - 从网络获取
```

## 缓存问题与解决方案

### 问题1：缓存不更新

```javascript
// 原因：浏览器使用了旧的缓存文件
// 解决：文件名加哈希

// 错误做法
<script src="app.js"></script>

// 正确做法
<script src="app.a1b2c3d4.js"></script>

// 或使用版本号
<script src="app.js?v=1.2.3"></script>
```

### 问题2：更新不一致

```javascript
// 原因：HTML 缓存了，但引用的资源更新了
// 解决：HTML 不缓存

// Nginx 配置
location /index.html {
    add_header Cache-Control "no-cache";
}
```

### 问题3：用户强制刷新

```javascript
// 普通刷新（F5）：使用协商缓存
// 强制刷新（Ctrl+F5）：跳过缓存，重新请求

// 请求头区别
// 普通刷新: Cache-Control: max-age=0
// 强制刷新: Cache-Control: no-cache, Pragma: no-cache
```

## Service Worker 缓存

```javascript
// 注册 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// sw.js
const CACHE_NAME = 'my-cache-v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js'
];

// 安装时缓存资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 拦截请求
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存命中，返回缓存
        if (response) {
          return response;
        }
        // 缓存未命中，网络请求
        return fetch(event.request);
      })
  );
});

// 更新缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});
```

### 缓存策略

```javascript
// 1. Cache First（缓存优先）
// 适用于不经常变化的资源
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});

// 2. Network First（网络优先）
// 适用于需要最新数据的请求
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});

// 3. Stale While Revalidate（返回缓存同时更新）
// 平衡速度和新鲜度
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

