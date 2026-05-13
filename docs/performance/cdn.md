# CDN 原理与优化

## 概述

CDN（Content Delivery Network，内容分发网络）是一种分布式网络架构，通过在全球各地部署边缘节点，将内容缓存到离用户最近的位置，从而加速内容分发、降低源站压力。

## CDN 基本原理

### 架构组成

```
                    ┌─────────────────────┐
                    │      源站服务器      │
                    │   (Origin Server)   │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │     CDN 调度系统     │
                    │   (智能 DNS/GSLB)   │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────┴───────┐    ┌────────┴────────┐    ┌───────┴───────┐
│   边缘节点 A   │    │    边缘节点 B    │    │   边缘节点 C   │
│   (北京)      │    │    (上海)       │    │   (广州)      │
└───────┬───────┘    └────────┬────────┘    └───────┬───────┘
        │                      │                      │
    用户群 A              用户群 B               用户群 C
```

### 请求流程

```
用户请求 static.example.com/image.png
              │
              ▼
        ┌────────────┐
        │  本地 DNS  │ ← 查询域名
        └─────┬──────┘
              │
              ▼
        ┌────────────┐
        │  CDN DNS   │ ← 返回最优边缘节点 IP
        │  (GSLB)    │   （基于地理位置、负载等）
        └─────┬──────┘
              │
              ▼
        ┌────────────┐
        │  边缘节点  │ ← 用户访问
        └─────┬──────┘
              │
       ┌──────┴──────┐
       │             │
   缓存命中      缓存未命中
       │             │
       ▼             ▼
    直接返回      回源请求
                     │
                     ▼
              ┌────────────┐
              │   源站     │
              └────────────┘
```

### GSLB（全局负载均衡）

```javascript
// GSLB 调度策略
const strategies = {
  // 1. 地理位置优先
  geographic: (userIP) => {
    const region = geoIP.lookup(userIP);
    return findNearestNode(region);
  },

  // 2. 负载均衡
  loadBalance: (nodes) => {
    return nodes.sort((a, b) => a.load - b.load)[0];
  },

  // 3. 网络延迟
  latency: async (userIP, nodes) => {
    const latencies = await Promise.all(
      nodes.map(node => measureLatency(userIP, node))
    );
    return nodes[latencies.indexOf(Math.min(...latencies))];
  },

  // 4. 综合策略
  combined: (userIP, nodes) => {
    // 权重计算：距离 40% + 负载 30% + 延迟 30%
    return nodes.map(node => ({
      node,
      score: calculateScore(node, userIP)
    })).sort((a, b) => b.score - a.score)[0].node;
  }
};
```

## CDN 缓存策略

### 缓存层级

```
L1 缓存（边缘节点）
    ↓ 未命中
L2 缓存（区域中心）
    ↓ 未命中
源站
```

### 缓存控制

```http
# 源站响应头控制 CDN 缓存

# 缓存 1 年
Cache-Control: public, max-age=31536000, immutable

# 缓存 1 小时
Cache-Control: public, max-age=3600

# 不缓存
Cache-Control: no-cache, no-store, must-revalidate

# CDN 可缓存，浏览器不缓存
Cache-Control: public, s-maxage=3600, max-age=0

# 使用 ETag 验证
ETag: "abc123"
Cache-Control: no-cache
```

### 缓存键（Cache Key）

```javascript
// CDN 缓存键通常包含
const cacheKey = {
  url: 'https://cdn.example.com/image.png',
  // 可选参数
  queryString: '?v=1.0',
  headers: {
    'Accept-Encoding': 'gzip',
    'Accept-Language': 'zh-CN'
  }
};

// 优化：忽略不必要的查询参数
// CDN 配置：忽略 utm_* 参数
'image.png?utm_source=google' → 'image.png'
```

### 缓存刷新

```javascript
// 1. URL 刷新（精确刷新）
cdnAPI.purge('https://cdn.example.com/image.png');

// 2. 目录刷新
cdnAPI.purgeDirectory('https://cdn.example.com/images/');

// 3. 正则刷新
cdnAPI.purgeRegex('https://cdn.example.com/*.css');

// 4. 版本号策略（推荐）
// 修改文件名而不是刷新缓存
'app.js' → 'app.abc123.js'
```

## 前端 CDN 最佳实践

### 静态资源上 CDN

```html
<!-- 本地资源 -->
<script src="/js/app.js"></script>

<!-- CDN 资源 -->
<script src="https://cdn.example.com/js/app.abc123.js"></script>

<!-- 公共库使用公共 CDN -->
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
```

### Webpack CDN 配置

```javascript
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackCdnPlugin = require('webpack-cdn-plugin');

module.exports = {
  output: {
    publicPath: 'https://cdn.example.com/',
    filename: '[name].[contenthash:8].js'
  },

  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    lodash: '_'
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    }),
    new WebpackCdnPlugin({
      modules: [
        {
          name: 'react',
          var: 'React',
          path: 'umd/react.production.min.js'
        },
        {
          name: 'react-dom',
          var: 'ReactDOM',
          path: 'umd/react-dom.production.min.js'
        }
      ],
      publicPath: '/node_modules'
    })
  ]
};
```

### Vite CDN 配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { Plugin as importToCDN } from 'vite-plugin-cdn-import';

export default defineConfig({
  base: 'https://cdn.example.com/',

  plugins: [
    importToCDN({
      modules: [
        {
          name: 'react',
          var: 'React',
          path: 'https://unpkg.com/react@18/umd/react.production.min.js'
        },
        {
          name: 'react-dom',
          var: 'ReactDOM',
          path: 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js'
        }
      ]
    })
  ],

  build: {
    rollupOptions: {
      output: {
        // 分包策略
        manualChunks: {
          vendor: ['lodash', 'axios']
        }
      }
    }
  }
});
```

### CDN 回退策略

```html
<!-- 主 CDN 失败时回退到备用 CDN 或本地 -->
<script src="https://cdn1.example.com/react.min.js"></script>
<script>
  window.React || document.write('<script src="https://cdn2.example.com/react.min.js"><\/script>');
</script>
<script>
  window.React || document.write('<script src="/local/react.min.js"><\/script>');
</script>
```

```javascript
// 动态加载带回退
function loadScript(primary, fallbacks) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = primary;

    script.onload = resolve;
    script.onerror = () => {
      if (fallbacks.length > 0) {
        loadScript(fallbacks[0], fallbacks.slice(1))
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error('All CDN sources failed'));
      }
    };

    document.head.appendChild(script);
  });
}

// 使用
loadScript(
  'https://cdn1.example.com/lib.js',
  ['https://cdn2.example.com/lib.js', '/local/lib.js']
);
```

## CDN 优化策略

### 1. 文件指纹

```javascript
// webpack
output: {
  filename: '[name].[contenthash:8].js',
  chunkFilename: '[name].[contenthash:8].chunk.js'
}

// 好处：
// 1. 文件内容变化才会改变文件名
// 2. 可以设置超长缓存时间
// 3. 自动实现缓存失效
```

### 2. 压缩优化

```nginx
# Nginx 配置
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1024;
gzip_comp_level 6;

# Brotli 压缩（更优）
brotli on;
brotli_types text/plain text/css application/json application/javascript;
```

```javascript
// 前端检测压缩支持
const acceptEncoding = request.headers['accept-encoding'];
if (acceptEncoding.includes('br')) {
  // 返回 Brotli 压缩
} else if (acceptEncoding.includes('gzip')) {
  // 返回 Gzip 压缩
}
```

### 3. HTTP/2 优化

```javascript
// HTTP/2 特性
const http2Benefits = {
  multiplexing: '多路复用，单连接并行请求',
  headerCompression: 'HPACK 头部压缩',
  serverPush: '服务器推送',
  streamPriority: '请求优先级'
};

// HTTP/2 下的优化调整
// 1. 不再需要域名分片
// 2. 不再需要合并文件（可以但收益降低）
// 3. 可以使用更细粒度的代码分割
```

### 4. 预加载优化

```html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//cdn.example.com">

<!-- 预连接 -->
<link rel="preconnect" href="https://cdn.example.com" crossorigin>

<!-- 预加载关键资源 -->
<link rel="preload" href="https://cdn.example.com/critical.css" as="style">
<link rel="preload" href="https://cdn.example.com/hero.jpg" as="image">

<!-- 预获取（空闲时加载） -->
<link rel="prefetch" href="https://cdn.example.com/next-page.js">
```

### 5. 图片 CDN 优化

```html
<!-- 使用图片 CDN 处理 -->
<!-- 原图 -->
<img src="https://cdn.example.com/image.jpg">

<!-- 调整尺寸 -->
<img src="https://cdn.example.com/image.jpg?w=300&h=200">

<!-- 格式转换 -->
<img src="https://cdn.example.com/image.jpg?format=webp">

<!-- 质量压缩 -->
<img src="https://cdn.example.com/image.jpg?quality=80">

<!-- 综合处理 -->
<img src="https://cdn.example.com/image.jpg?w=300&format=webp&quality=80">
```

```javascript
// 响应式图片 + CDN
function getOptimizedImageUrl(src, width) {
  const cdnBase = 'https://cdn.example.com';
  const params = new URLSearchParams({
    w: width,
    format: 'webp',
    quality: 80
  });
  return `${cdnBase}${src}?${params}`;
}

// 使用
<img
  src={getOptimizedImageUrl('/image.jpg', 300)}
  srcSet={`
    ${getOptimizedImageUrl('/image.jpg', 300)} 300w,
    ${getOptimizedImageUrl('/image.jpg', 600)} 600w,
    ${getOptimizedImageUrl('/image.jpg', 900)} 900w
  `}
  sizes="(max-width: 600px) 300px, (max-width: 900px) 600px, 900px"
/>
```

## 多 CDN 策略

### 主备切换

```javascript
class MultiCDN {
  constructor(cdnList) {
    this.cdnList = cdnList;
    this.currentIndex = 0;
    this.healthCheck();
  }

  getCurrentCDN() {
    return this.cdnList[this.currentIndex];
  }

  async healthCheck() {
    setInterval(async () => {
      for (let i = 0; i < this.cdnList.length; i++) {
        const isHealthy = await this.checkHealth(this.cdnList[i]);
        if (isHealthy && i !== this.currentIndex) {
          // 切换到更优的 CDN
          if (i < this.currentIndex) {
            this.currentIndex = i;
          }
          break;
        }
      }
    }, 30000);
  }

  async checkHealth(cdn) {
    try {
      const start = Date.now();
      await fetch(`${cdn}/health`, { method: 'HEAD' });
      const latency = Date.now() - start;
      return latency < 1000;
    } catch {
      return false;
    }
  }
}
```

### 智能路由

```javascript
// 根据资源类型选择 CDN
const cdnRouter = {
  static: 'https://static-cdn.example.com',    // 静态资源
  image: 'https://image-cdn.example.com',      // 图片
  video: 'https://video-cdn.example.com',      // 视频
  api: 'https://api-cdn.example.com'           // API 加速
};

function getCDNUrl(path, type = 'static') {
  return `${cdnRouter[type]}${path}`;
}
```

## 常见问题与解决

### 跨域问题

```nginx
# CDN 配置 CORS
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods 'GET, OPTIONS';
add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With';
```

```html
<!-- 字体资源需要 crossorigin -->
<link rel="stylesheet" href="https://cdn.example.com/fonts.css" crossorigin>

<!-- 脚本资源获取详细错误信息 -->
<script src="https://cdn.example.com/app.js" crossorigin="anonymous"></script>
```

### 缓存不更新

```javascript
// 方案 1：文件指纹
// app.js → app.abc123.js

// 方案 2：查询参数
// app.js?v=1.0.0

// 方案 3：主动刷新
await cdnAPI.purge('https://cdn.example.com/app.js');

// 方案 4：版本目录
// /v1/app.js → /v2/app.js
```

### 劫持与安全

```html
<!-- SRI (Subresource Integrity) -->
<script
  src="https://cdn.example.com/app.js"
  integrity="sha384-xxxxx"
  crossorigin="anonymous"
></script>

<!-- 生成 integrity -->
<!-- openssl dgst -sha384 -binary app.js | openssl base64 -A -->
```

```javascript
// 运行时验证
async function loadScriptWithIntegrity(url, expectedHash) {
  const response = await fetch(url);
  const content = await response.text();
  const actualHash = await crypto.subtle.digest(
    'SHA-384',
    new TextEncoder().encode(content)
  );

  if (hashToBase64(actualHash) !== expectedHash) {
    throw new Error('Integrity check failed');
  }

  const script = document.createElement('script');
  script.textContent = content;
  document.head.appendChild(script);
}
```

## 面试常见问题

::: details 1. CDN 的工作原理？
CDN 通过在全球部署边缘节点，将内容缓存到离用户最近的位置。用户请求时，通过智能 DNS（GSLB）将请求路由到最优节点，实现就近访问、加速分发。
:::

::: details 2. CDN 缓存命中率如何提高？
- 合理设置缓存时间
- 使用文件指纹实现永久缓存
- 规范化 URL（忽略无关参数）
- 预热热点资源
- 合理设置缓存层级
:::

::: details 3. 如何处理 CDN 故障？
```javascript
// 1. 多 CDN 备份
// 2. 回退到源站
// 3. 本地兜底资源
// 4. 实时监控告警
```
:::

::: details 4. CDN 和 HTTP 缓存的区别？
- HTTP 缓存在浏览器本地，CDN 缓存在边缘节点
- HTTP 缓存只服务单用户，CDN 缓存服务所有用户
- HTTP 缓存通过请求头控制，CDN 缓存可通过控制台管理
:::

::: details 5. 如何选择 CDN 服务商？
考虑因素：
- 节点覆盖范围
- 带宽和性能
- 功能特性（图片处理、HTTPS等）
- 价格和计费方式
- 技术支持
:::

## 总结

CDN 是前端性能优化的重要基础设施：

1. **原理理解**：GSLB 调度、边缘缓存、回源机制
2. **缓存策略**：合理的 Cache-Control、文件指纹
3. **前端实践**：静态资源 CDN 化、公共库外链
4. **优化技巧**：压缩、HTTP/2、预加载
5. **安全保障**：HTTPS、SRI 校验、多 CDN 容灾

掌握 CDN 原理和优化策略，是构建高性能 Web 应用的必备技能。
