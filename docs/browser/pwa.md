# PWA 渐进式 Web 应用

## 概述

PWA (Progressive Web App) 是一种可以提供类似原生应用体验的 Web 应用技术。它结合了 Web 和原生应用的优点，具有可安装、离线可用、推送通知等特性。

---

## 一、PWA 核心特性

### 1. 核心能力

| 特性 | 说明 | 技术实现 |
|------|------|----------|
| 可安装 | 添加到主屏幕 | Web App Manifest |
| 离线可用 | 无网络也能访问 | Service Worker + Cache API |
| 推送通知 | 接收推送消息 | Push API + Notification API |
| 后台同步 | 离线操作延后同步 | Background Sync API |
| 性能优越 | 快速加载和响应 | 缓存策略 + 预加载 |

### 2. PWA 检测清单

```javascript
/**
 * PWA 必要条件:
 * 1. HTTPS (或 localhost)
 * 2. 有效的 Web App Manifest
 * 3. 注册了 Service Worker
 * 4. 响应式设计
 * 5. 离线可用
 */

// 检测是否支持 PWA
const isPWASupported = () => {
  return 'serviceWorker' in navigator &&
         'PushManager' in window &&
         'Notification' in window
}
```

---

## 二、Web App Manifest

### 1. 基本配置

```json
// manifest.json
{
  "name": "My PWA Application",
  "short_name": "MyPWA",
  "description": "一个示例 PWA 应用",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3498db",
  "orientation": "portrait-primary",
  "scope": "/",
  "lang": "zh-CN",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "shortcuts": [
    {
      "name": "新建",
      "short_name": "新建",
      "description": "创建新内容",
      "url": "/new",
      "icons": [{ "src": "/icons/new.png", "sizes": "192x192" }]
    }
  ],
  "categories": ["productivity", "utilities"],
  "prefer_related_applications": false
}
```

### 2. 在 HTML 中引用

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <!-- Manifest 链接 -->
  <link rel="manifest" href="/manifest.json">

  <!-- 主题色 -->
  <meta name="theme-color" content="#3498db">

  <!-- iOS 支持 -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="MyPWA">
  <link rel="apple-touch-icon" href="/icons/icon-152x152.png">

  <!-- Windows 磁贴 -->
  <meta name="msapplication-TileImage" content="/icons/icon-144x144.png">
  <meta name="msapplication-TileColor" content="#3498db">
</head>
<body>
  <!-- 应用内容 -->
</body>
</html>
```

### 3. display 模式

```javascript
/**
 * display 可选值:
 *
 * fullscreen - 全屏，隐藏所有浏览器 UI
 * standalone - 独立应用，隐藏地址栏（最常用）
 * minimal-ui - 最小 UI，保留导航按钮
 * browser    - 普通浏览器模式
 */

// 检测当前 display 模式
const getDisplayMode = () => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone'
  }
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen'
  }
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui'
  }
  return 'browser'
}

// 监听 display 模式变化
window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
  console.log('Display mode changed:', e.matches ? 'standalone' : 'browser')
})
```

---

## 三、Service Worker

### 1. 生命周期

```
          ┌─────────────────────────────────────┐
          │                                     │
          ▼                                     │
    ┌──────────┐    ┌───────────┐    ┌──────────┴───┐
    │ 解析中   │───▶│ 安装中    │───▶│ 已安装/等待  │
    │ Parsed   │    │ Installing │    │ Installed    │
    └──────────┘    └───────────┘    └──────────────┘
                         │                   │
                         │ 失败              │ 激活
                         ▼                   ▼
                    ┌──────────┐       ┌───────────┐
                    │ 冗余     │◀──────│ 激活中    │
                    │ Redundant │       │ Activating│
                    └──────────┘       └───────────┘
                         ▲                   │
                         │                   │
                         │              ┌────▼────┐
                         └──────────────│ 已激活  │
                                        │ Activated│
                                        └─────────┘
```

### 2. 注册 Service Worker

```javascript
// main.js - 注册 Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('SW 注册成功:', registration.scope)

      // 监听更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        console.log('发现新版本 SW')

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // 有新版本可用
              console.log('新版本已安装，等待激活')
              // 可以提示用户刷新
              showUpdateNotification()
            } else {
              // 首次安装
              console.log('内容已缓存，可离线使用')
            }
          }
        })
      })
    } catch (error) {
      console.error('SW 注册失败:', error)
    }
  })
}

// 监听控制器变化（SW 激活后）
navigator.serviceWorker.addEventListener('controllerchange', () => {
  console.log('SW 控制器已更新')
  // 可选：自动刷新页面
  // window.location.reload()
})
```

### 3. Service Worker 基本结构

```javascript
// sw.js
const CACHE_NAME = 'my-pwa-cache-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/app.js',
  '/icons/icon-192x192.png',
  '/offline.html'
]

// 安装事件 - 预缓存静态资源
self.addEventListener('install', (event) => {
  console.log('[SW] 安装中...')

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] 预缓存静态资源')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        // 跳过等待，立即激活
        return self.skipWaiting()
      })
  )
})

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] 激活中...')

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] 删除旧缓存:', name)
              return caches.delete(name)
            })
        )
      })
      .then(() => {
        // 立即接管所有页面
        return self.clients.claim()
      })
  )
})

// 拦截请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 缓存命中
        if (response) {
          return response
        }
        // 网络请求
        return fetch(event.request)
      })
  )
})
```

---

## 四、缓存策略

### 1. Cache First (缓存优先)

```javascript
/**
 * 适用场景: 静态资源（CSS、JS、图片）
 * 优点: 快速响应，离线可用
 * 缺点: 可能返回旧内容
 */
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        return fetch(event.request).then((response) => {
          // 缓存新资源
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone)
            })
          }
          return response
        })
      })
  )
})
```

### 2. Network First (网络优先)

```javascript
/**
 * 适用场景: API 请求、经常变化的内容
 * 优点: 内容最新
 * 缺点: 离线时依赖缓存
 */
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 更新缓存
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone)
        })
        return response
      })
      .catch(() => {
        // 网络失败，使用缓存
        return caches.match(event.request)
      })
  )
})
```

### 3. Stale While Revalidate (先用缓存，后台更新)

```javascript
/**
 * 适用场景: 新闻、社交动态等
 * 优点: 快速响应 + 内容更新
 * 缺点: 首次显示可能是旧内容
 */
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone())
          return networkResponse
        })

        // 返回缓存，同时后台更新
        return cachedResponse || fetchPromise
      })
    })
  )
})
```

### 4. Network Only (仅网络)

```javascript
/**
 * 适用场景: 实时性要求高的请求（支付、登录）
 */
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request))
})
```

### 5. Cache Only (仅缓存)

```javascript
/**
 * 适用场景: 应用 Shell、离线页面
 */
self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request))
})
```

### 6. 完整策略实现

```javascript
// sw.js - 根据请求类型选择策略
const CACHE_NAME = 'my-pwa-v1'
const API_CACHE = 'api-cache-v1'

// 静态资源 - Cache First
const cacheFirst = async (request) => {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    return caches.match('/offline.html')
  }
}

// API 请求 - Network First
const networkFirst = async (request) => {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    return cachedResponse || new Response(
      JSON.stringify({ error: 'Network unavailable' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// Stale While Revalidate
const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)

  const fetchPromise = fetch(request).then((networkResponse) => {
    cache.put(request, networkResponse.clone())
    return networkResponse
  }).catch(() => cachedResponse)

  return cachedResponse || fetchPromise
}

// 请求拦截
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // API 请求
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request))
    return
  }

  // 静态资源
  if (request.destination === 'image' ||
      request.destination === 'script' ||
      request.destination === 'style') {
    event.respondWith(cacheFirst(request))
    return
  }

  // HTML 页面
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
    return
  }

  // 默认
  event.respondWith(staleWhileRevalidate(request))
})
```

---

## 五、Workbox 工具库

### 1. 安装配置

```bash
npm install workbox-webpack-plugin --save-dev
# 或
npm install workbox-build --save-dev
```

### 2. Webpack 集成

```javascript
// webpack.config.js
const { GenerateSW, InjectManifest } = require('workbox-webpack-plugin')

module.exports = {
  plugins: [
    // 方式1: 自动生成 SW
    new GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.example\.com/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 300
            }
          }
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30 天
            }
          }
        }
      ]
    }),

    // 方式2: 注入自定义 SW
    new InjectManifest({
      swSrc: './src/sw.js',
      swDest: 'sw.js'
    })
  ]
}
```

### 3. 使用 Workbox 模块

```javascript
// sw.js - 使用 Workbox
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js')

const { precacheAndRoute, cleanupOutdatedCaches } = workbox.precaching
const { registerRoute } = workbox.routing
const { CacheFirst, NetworkFirst, StaleWhileRevalidate } = workbox.strategies
const { ExpirationPlugin } = workbox.expiration
const { CacheableResponsePlugin } = workbox.cacheableResponse

// 预缓存
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// 图片 - Cache First
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60
      })
    ]
  })
)

// API - Network First
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60
      })
    ]
  })
)

// 静态资源 - Stale While Revalidate
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources'
  })
)

// 页面导航 - Network First
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] })
    ]
  })
)
```

### 4. Vite 集成

```javascript
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'My PWA',
        short_name: 'MyPWA',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24
              }
            }
          }
        ]
      }
    })
  ]
}
```

---

## 六、推送通知

### 1. 请求通知权限

```javascript
// 请求通知权限
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('浏览器不支持通知')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

// 显示本地通知
function showNotification(title, options = {}) {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body: options.body || '',
      icon: options.icon || '/icons/icon-192x192.png',
      badge: options.badge || '/icons/badge.png',
      tag: options.tag || 'default',
      data: options.data || {},
      actions: options.actions || [],
      requireInteraction: options.requireInteraction || false
    })

    notification.onclick = (event) => {
      event.preventDefault()
      window.focus()
      notification.close()
    }

    return notification
  }
}
```

### 2. 推送订阅

```javascript
// 获取推送订阅
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready

  // 检查现有订阅
  let subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    // 创建新订阅
    const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY'
    const convertedKey = urlBase64ToUint8Array(vapidPublicKey)

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey
    })
  }

  // 发送订阅到服务器
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  })

  return subscription
}

// 取消订阅
async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()

  if (subscription) {
    await subscription.unsubscribe()
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint })
    })
  }
}

// Base64 转 Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
```

### 3. Service Worker 处理推送

```javascript
// sw.js - 处理推送消息
self.addEventListener('push', (event) => {
  console.log('[SW] 收到推送消息')

  let data = { title: '新通知', body: '您有新消息' }

  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data.body = event.data.text()
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now()
    },
    actions: [
      { action: 'open', title: '查看' },
      { action: 'close', title: '关闭' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// 处理通知点击
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 通知被点击', event.action)

  event.notification.close()

  if (event.action === 'close') {
    return
  }

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // 查找已打开的窗口
        for (const client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        // 打开新窗口
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// 处理通知关闭
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] 通知被关闭')
  // 可以发送统计数据
})
```

### 4. 服务端推送 (Node.js)

```javascript
// server.js
const webpush = require('web-push')

// 配置 VAPID
webpush.setVapidDetails(
  'mailto:your@email.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

// 存储订阅
const subscriptions = new Map()

// 保存订阅
app.post('/api/push/subscribe', (req, res) => {
  const subscription = req.body
  subscriptions.set(subscription.endpoint, subscription)
  res.status(201).json({ message: '订阅成功' })
})

// 发送推送
async function sendPushNotification(subscription, payload) {
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    )
  } catch (error) {
    if (error.statusCode === 410) {
      // 订阅已过期，删除
      subscriptions.delete(subscription.endpoint)
    }
    throw error
  }
}

// 批量推送
async function broadcastPush(payload) {
  const promises = []
  for (const subscription of subscriptions.values()) {
    promises.push(sendPushNotification(subscription, payload))
  }
  await Promise.allSettled(promises)
}

// 使用示例
app.post('/api/notify', async (req, res) => {
  await broadcastPush({
    title: '新消息',
    body: req.body.message,
    url: '/messages'
  })
  res.json({ message: '推送已发送' })
})
```

---

## 七、后台同步

### 1. Background Sync API

```javascript
// main.js - 注册后台同步
async function registerBackgroundSync(tag) {
  const registration = await navigator.serviceWorker.ready

  if ('sync' in registration) {
    try {
      await registration.sync.register(tag)
      console.log('后台同步已注册:', tag)
    } catch (error) {
      console.error('后台同步注册失败:', error)
    }
  }
}

// 离线时保存数据
async function saveForSync(data) {
  // 保存到 IndexedDB
  await saveToIndexedDB('sync-queue', data)
  // 注册同步
  await registerBackgroundSync('sync-data')
}

// 使用示例
form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const data = new FormData(form)

  try {
    await fetch('/api/submit', {
      method: 'POST',
      body: data
    })
  } catch (error) {
    // 离线时保存待同步
    await saveForSync(Object.fromEntries(data))
    showMessage('数据已保存，将在网络恢复后自动提交')
  }
})
```

### 2. Service Worker 处理同步

```javascript
// sw.js
self.addEventListener('sync', (event) => {
  console.log('[SW] 后台同步触发:', event.tag)

  if (event.tag === 'sync-data') {
    event.waitUntil(syncData())
  }
})

async function syncData() {
  const db = await openIndexedDB('sync-queue')
  const items = await getAllFromDB(db)

  for (const item of items) {
    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      })

      // 成功后删除
      await deleteFromDB(db, item.id)
    } catch (error) {
      console.error('同步失败:', error)
      // 保留数据，下次重试
      throw error
    }
  }
}
```

### 3. Periodic Background Sync

```javascript
// 周期性后台同步（有限支持）
async function registerPeriodicSync() {
  const registration = await navigator.serviceWorker.ready

  if ('periodicSync' in registration) {
    try {
      await registration.periodicSync.register('content-sync', {
        minInterval: 24 * 60 * 60 * 1000 // 最小间隔 24 小时
      })
    } catch (error) {
      console.error('周期同步注册失败:', error)
    }
  }
}

// sw.js
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(updateContent())
  }
})

async function updateContent() {
  const cache = await caches.open('content-cache')
  await cache.add('/api/latest-content')
}
```

---

## 八、安装提示

### 1. 自定义安装提示

```javascript
// 保存安装事件
let deferredPrompt = null

window.addEventListener('beforeinstallprompt', (e) => {
  // 阻止默认提示
  e.preventDefault()
  // 保存事件
  deferredPrompt = e
  // 显示自定义安装按钮
  showInstallButton()
})

// 显示安装按钮
function showInstallButton() {
  const installBtn = document.getElementById('install-btn')
  installBtn.style.display = 'block'

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return

    // 显示安装提示
    deferredPrompt.prompt()

    // 等待用户响应
    const { outcome } = await deferredPrompt.userChoice
    console.log('用户选择:', outcome)

    // 清除事件
    deferredPrompt = null
    installBtn.style.display = 'none'
  })
}

// 监听安装完成
window.addEventListener('appinstalled', () => {
  console.log('PWA 已安装')
  deferredPrompt = null
  // 隐藏安装按钮
  document.getElementById('install-btn').style.display = 'none'
  // 发送统计
  analytics.track('pwa_installed')
})
```

### 2. 检测是否已安装

```javascript
// 检测是否在 PWA 模式下运行
function isRunningAsPWA() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true ||
         document.referrer.includes('android-app://')
}

// 检测是否可以安装
function canInstall() {
  return deferredPrompt !== null
}

// 获取安装状态
async function getInstallState() {
  if (isRunningAsPWA()) {
    return 'installed'
  }
  if (canInstall()) {
    return 'installable'
  }
  return 'not-installable'
}
```

---

## 九、离线页面

### 1. 创建离线页面

```html
<!-- offline.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>离线 - My PWA</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
      text-align: center;
      padding: 20px;
    }
    .offline-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    h1 {
      color: #333;
      margin-bottom: 10px;
    }
    p {
      color: #666;
      margin-bottom: 20px;
    }
    button {
      padding: 12px 24px;
      font-size: 16px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #2980b9;
    }
  </style>
</head>
<body>
  <div class="offline-icon">📡</div>
  <h1>您已离线</h1>
  <p>请检查您的网络连接后重试</p>
  <button onclick="location.reload()">重试</button>

  <script>
    // 监听网络恢复
    window.addEventListener('online', () => {
      location.reload()
    })
  </script>
</body>
</html>
```

### 2. Service Worker 返回离线页面

```javascript
// sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/offline.html')
        })
    )
  }
})
```

---

## 十、性能优化

### 1. App Shell 模式

```javascript
/**
 * App Shell 模式:
 * 将应用的基础结构（Shell）与内容分离
 * Shell 预缓存，内容动态加载
 */

// 预缓存 Shell
const APP_SHELL = [
  '/',
  '/index.html',
  '/styles/app-shell.css',
  '/scripts/app-shell.js',
  '/icons/logo.svg'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('app-shell-v1')
      .then((cache) => cache.addAll(APP_SHELL))
  )
})

// HTML 结构
// index.html
<body>
  <!-- App Shell - 预缓存 -->
  <header id="header">
    <nav><!-- 导航 --></nav>
  </header>

  <main id="content">
    <!-- 动态内容 - 网络加载 -->
    <div class="loading">加载中...</div>
  </main>

  <footer id="footer">
    <!-- 页脚 -->
  </footer>
</body>
```

### 2. 预加载关键资源

```html
<!-- 预加载 -->
<link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
<link rel="preload" href="/styles/critical.css" as="style">
<link rel="preload" href="/scripts/app.js" as="script">

<!-- 预连接 -->
<link rel="preconnect" href="https://api.example.com">
<link rel="dns-prefetch" href="https://cdn.example.com">
```

### 3. 智能预缓存

```javascript
// 基于用户行为预缓存
self.addEventListener('message', (event) => {
  if (event.data.type === 'PREFETCH') {
    const urls = event.data.urls
    caches.open('prefetch-cache').then((cache) => {
      urls.forEach((url) => {
        fetch(url).then((response) => {
          if (response.ok) {
            cache.put(url, response)
          }
        })
      })
    })
  }
})

// 页面中触发预缓存
const prefetchUrls = ['/about', '/products', '/contact']
navigator.serviceWorker.controller?.postMessage({
  type: 'PREFETCH',
  urls: prefetchUrls
})
```

---

## 十一、调试与测试

### 1. Chrome DevTools

```javascript
/**
 * Application 面板:
 * - Manifest: 查看 manifest 配置
 * - Service Workers: 管理 SW 生命周期
 * - Storage: 管理缓存和存储
 *
 * Network 面板:
 * - Offline: 模拟离线
 * - Throttling: 模拟慢网络
 *
 * Lighthouse:
 * - PWA 审计评分
 */

// 调试日志
self.addEventListener('fetch', (event) => {
  console.log('[SW] Fetch:', event.request.url)
})
```

### 2. 常用调试命令

```javascript
// 强制更新 SW
navigator.serviceWorker.getRegistration().then((reg) => {
  reg?.update()
})

// 注销 SW
navigator.serviceWorker.getRegistrations().then((registrations) => {
  registrations.forEach((reg) => reg.unregister())
})

// 清除缓存
caches.keys().then((names) => {
  names.forEach((name) => caches.delete(name))
})

// 查看缓存内容
caches.open('my-cache').then((cache) => {
  cache.keys().then((keys) => console.log(keys))
})
```

---

