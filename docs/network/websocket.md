# WebSocket

## 什么是 WebSocket

WebSocket 是一种在单个 TCP 连接上进行**全双工通信**的协议。它允许服务端主动向客户端推送数据，实现真正的双向实时通信。

### 通俗解释

传统 HTTP 就像发短信：你发一条，对方回一条，每次都是独立的。

WebSocket 就像打电话：连接建立后，双方可以随时说话，不需要每次都重新拨号。

## WebSocket vs HTTP

| 特性 | HTTP | WebSocket |
|------|------|-----------|
| 通信方式 | 请求-响应（单向） | 全双工（双向） |
| 连接 | 短连接（用完即关） | 长连接（持续保持） |
| 开销 | 每次请求都有完整头部 | 建立后数据帧很小 |
| 服务端推送 | 不支持（需轮询） | 原生支持 |
| 协议 | http:// / https:// | ws:// / wss:// |

## 基本使用

### 客户端

```javascript
// 创建 WebSocket 连接
const ws = new WebSocket('ws://localhost:8080')

// 连接成功
ws.onopen = () => {
  console.log('连接成功')
  ws.send('Hello Server!')
}

// 收到消息
ws.onmessage = (event) => {
  console.log('收到消息:', event.data)

  // 如果是 JSON 数据
  const data = JSON.parse(event.data)
  console.log(data)
}

// 连接关闭
ws.onclose = (event) => {
  console.log('连接关闭', event.code, event.reason)
}

// 连接错误
ws.onerror = (error) => {
  console.error('WebSocket 错误:', error)
}

// 发送消息
ws.send('Hello')
ws.send(JSON.stringify({ type: 'chat', content: 'Hi' }))

// 主动关闭连接
ws.close()
```

### 服务端（Node.js）

```javascript
const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', (ws) => {
  console.log('客户端已连接')

  // 收到消息
  ws.on('message', (message) => {
    console.log('收到:', message.toString())

    // 回复消息
    ws.send('服务端收到: ' + message)

    // 广播给所有客户端
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString())
      }
    })
  })

  ws.on('close', () => {
    console.log('客户端断开连接')
  })
})
```

## 连接状态

WebSocket 实例有 `readyState` 属性表示当前状态：

```javascript
const ws = new WebSocket('ws://localhost:8080')

// 0: CONNECTING - 正在连接
// 1: OPEN - 已连接，可以通信
// 2: CLOSING - 正在关闭
// 3: CLOSED - 已关闭

if (ws.readyState === WebSocket.OPEN) {
  ws.send('消息')
}
```

## 心跳保活机制

长连接可能因为网络问题断开，需要心跳机制来检测和保活：

```javascript
class WebSocketClient {
  constructor(url) {
    this.url = url
    this.ws = null
    this.heartbeatTimer = null
    this.reconnectTimer = null
    this.reconnectCount = 0
    this.maxReconnect = 5
  }

  connect() {
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      console.log('连接成功')
      this.reconnectCount = 0
      this.startHeartbeat()
    }

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'pong') {
        console.log('收到心跳响应')
        return
      }
      // 处理其他消息
      this.onMessage(data)
    }

    this.ws.onclose = () => {
      console.log('连接关闭')
      this.stopHeartbeat()
      this.reconnect()
    }

    this.ws.onerror = (error) => {
      console.error('连接错误', error)
    }
  }

  // 心跳检测
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // 每 30 秒发送一次心跳
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // 断线重连
  reconnect() {
    if (this.reconnectCount >= this.maxReconnect) {
      console.log('达到最大重连次数')
      return
    }

    this.reconnectCount++
    console.log(`第 ${this.reconnectCount} 次重连...`)

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, 3000) // 3 秒后重连
  }

  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  close() {
    this.stopHeartbeat()
    clearTimeout(this.reconnectTimer)
    this.ws.close()
  }

  onMessage(data) {
    // 子类重写或外部设置
    console.log('收到消息:', data)
  }
}

// 使用
const client = new WebSocketClient('ws://localhost:8080')
client.connect()
```

## React 中使用 WebSocket

```jsx
import { useEffect, useRef, useState, useCallback } from 'react'

function useWebSocket(url) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const wsRef = useRef(null)

  useEffect(() => {
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
    }

    ws.onmessage = (event) => {
      setLastMessage(JSON.parse(event.data))
    }

    ws.onclose = () => {
      setIsConnected(false)
    }

    return () => {
      ws.close()
    }
  }, [url])

  const sendMessage = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  return { isConnected, lastMessage, sendMessage }
}

// 使用
function ChatRoom() {
  const { isConnected, lastMessage, sendMessage } = useWebSocket('ws://localhost:8080')
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (lastMessage) {
      setMessages(prev => [...prev, lastMessage])
    }
  }, [lastMessage])

  return (
    <div>
      <p>状态: {isConnected ? '已连接' : '未连接'}</p>
      <button onClick={() => sendMessage({ text: 'Hello' })}>
        发送消息
      </button>
      <ul>
        {messages.map((msg, i) => (
          <li key={i}>{msg.text}</li>
        ))}
      </ul>
    </div>
  )
}
```

## 适用场景

WebSocket 适合以下场景：

| 场景 | 说明 |
|------|------|
| 即时聊天 | 多人聊天室、客服系统 |
| 实时协作 | 在线文档协同编辑 |
| 游戏 | 多人在线游戏 |
| 实时数据 | 股票行情、体育比分 |
| 消息推送 | 系统通知、订单状态更新 |
| 物联网 | 设备状态监控 |

## WebSocket 握手过程

WebSocket 建立连接时，先通过 HTTP 进行握手升级：

```
// 客户端请求
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

// 服务端响应
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

握手成功后，连接从 HTTP 协议升级为 WebSocket 协议。

## 常见面试题

::: details 1. WebSocket 和 HTTP 的区别？
- HTTP 是无状态的请求-响应模式，WebSocket 是有状态的全双工通信
- HTTP 每次通信都需要完整的请求头，WebSocket 建立连接后数据帧很小
- HTTP 不支持服务端主动推送，WebSocket 支持双向通信
:::

::: details 2. WebSocket 如何保持连接？
- 心跳机制：定期发送 ping/pong 帧
- 服务端和客户端都可以发送心跳
- 超时未收到响应则认为连接断开，触发重连
:::

::: details 3. WebSocket 断线重连怎么实现？
```javascript
function createWebSocket(url) {
  let ws = new WebSocket(url)

  ws.onclose = () => {
    // 延迟重连，避免频繁重连
    setTimeout(() => {
      ws = createWebSocket(url)
    }, 3000)
  }

  return ws
}
```
:::

::: details 4. WebSocket 和 Socket 的区别？
- Socket 是 TCP/IP 协议的抽象，是传输层的概念
- WebSocket 是应用层协议，基于 TCP，专为浏览器设计
- WebSocket 需要先通过 HTTP 握手，然后升级协议
:::

::: details 5. 如何处理 WebSocket 的安全问题？
- 使用 wss:// 协议（WebSocket over TLS）
- 验证 Origin 头，防止跨站 WebSocket 劫持
- 对消息进行身份验证（如 token）
- 限制消息大小和频率
:::
