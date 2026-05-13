# Server-Sent Events (SSE)

## 什么是 SSE

SSE（Server-Sent Events）是一种允许服务端向客户端**单向推送**数据的技术。它基于 HTTP 协议，使用简单的文本格式传输数据。

### 通俗解释

SSE 就像订阅新闻推送：你订阅后，服务器有新消息就主动推给你，但你不能通过这个通道回复。

## SSE vs WebSocket vs 轮询

| 特性 | SSE | WebSocket | 轮询 |
|------|-----|-----------|------|
| 通信方向 | 单向（服务端→客户端） | 双向 | 单向（客户端→服务端） |
| 协议 | HTTP | WS | HTTP |
| 复杂度 | 简单 | 较复杂 | 简单 |
| 断线重连 | 自动 | 需手动实现 | 不需要 |
| 浏览器支持 | 良好（IE 除外） | 良好 | 全部支持 |
| 数据格式 | 文本 | 文本/二进制 | 任意 |
| 实时性 | 高 | 高 | 低（取决于轮询间隔） |

## 基本使用

### 前端（使用 EventSource）

```javascript
// 创建 SSE 连接
const eventSource = new EventSource('/api/events')

// 监听消息（默认事件）
eventSource.onmessage = (event) => {
  console.log('收到消息:', event.data)
}

// 监听自定义事件
eventSource.addEventListener('progress', (event) => {
  const data = JSON.parse(event.data)
  console.log('进度:', data.percent)
})

eventSource.addEventListener('complete', (event) => {
  const data = JSON.parse(event.data)
  console.log('完成:', data)
  eventSource.close() // 关闭连接
})

// 监听连接打开
eventSource.onopen = () => {
  console.log('连接已建立')
}

// 监听错误
eventSource.onerror = (error) => {
  console.error('SSE 错误:', error)
  eventSource.close()
}

// 主动关闭连接
eventSource.close()
```

### 后端（Node.js + Express）

```javascript
app.get('/api/events', (req, res) => {
  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  // 发送消息的辅助函数
  const sendEvent = (event, data) => {
    res.write(`event: ${event}\n`)
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  // 发送进度更新
  let progress = 0
  const timer = setInterval(() => {
    progress += 10
    sendEvent('progress', { percent: progress })

    if (progress >= 100) {
      clearInterval(timer)
      sendEvent('complete', { message: '任务完成' })
      res.end()
    }
  }, 1000)

  // 客户端断开连接时清理
  req.on('close', () => {
    clearInterval(timer)
    console.log('客户端断开连接')
  })
})
```

### 后端（.NET Core）

```csharp
[HttpGet("events")]
public async Task GetEvents()
{
    Response.Headers.Add("Content-Type", "text/event-stream");
    Response.Headers.Add("Cache-Control", "no-cache");
    Response.Headers.Add("Connection", "keep-alive");

    for (int i = 0; i <= 100; i += 10)
    {
        var data = JsonSerializer.Serialize(new { percent = i });
        await Response.WriteAsync($"event: progress\n");
        await Response.WriteAsync($"data: {data}\n\n");
        await Response.Body.FlushAsync();
        await Task.Delay(1000);
    }

    await Response.WriteAsync("event: complete\n");
    await Response.WriteAsync($"data: {{\"message\": \"任务完成\"}}\n\n");
}
```

## SSE 数据格式

SSE 使用纯文本格式，每条消息由多个字段组成：

```
event: 事件名称
data: 数据内容
id: 消息ID
retry: 重连时间（毫秒）

```

### 示例

```
event: message
data: {"text": "Hello"}

event: progress
data: {"percent": 50}

data: 默认事件，没有指定 event

id: 123
data: 带ID的消息

retry: 5000
data: 设置重连间隔为5秒
```

**注意**：每条消息必须以两个换行符 `\n\n` 结尾。

## 前端不能用 EventSource 的情况

`EventSource` 只支持 **GET 请求**，如果需要 POST 请求（比如发送对话历史），要用 `fetch` + `ReadableStream`：

```javascript
async function streamChat(messages) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages })
  })

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)

    // 解析 SSE 格式
    const lines = chunk.split('\n')
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') return

        const parsed = JSON.parse(data)
        console.log('收到:', parsed)
      }
    }
  }
}
```

## 实战：AI 对话流式输出

这是目前 SSE 最常见的应用场景，ChatGPT、Claude 等 AI 产品都使用这种方式。

### 前端实现

```javascript
async function sendMessage(userMessage) {
  // 对话历史
  const messages = [
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ]

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages })
  })

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let aiReply = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') break

        const { content } = JSON.parse(data)
        aiReply += content
        // 逐字显示到界面
        updateUI(aiReply)
      }
    }
  }

  // 保存到对话历史
  conversationHistory.push(
    { role: 'user', content: userMessage },
    { role: 'assistant', content: aiReply }
  )
}
```

### React Hook 封装

```jsx
import { useState, useCallback } from 'react'

function useStreamChat() {
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')

  const sendMessage = useCallback(async (messages) => {
    setIsLoading(true)
    setStreamingContent('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let content = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            const { content: text } = JSON.parse(line.slice(6))
            content += text
            setStreamingContent(content)
          }
        }
      }

      return content
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { isLoading, streamingContent, sendMessage }
}

// 使用
function ChatApp() {
  const { isLoading, streamingContent, sendMessage } = useStreamChat()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const handleSend = async () => {
    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    const reply = await sendMessage([...messages, userMessage])

    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: reply }
    ])
  }

  return (
    <div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role}>
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="assistant">{streamingContent}</div>
        )}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
      />
      <button onClick={handleSend} disabled={isLoading}>
        发送
      </button>
    </div>
  )
}
```

## 实战：异步任务进度

比如音乐生成、视频处理等耗时任务：

### 多任务并行管理

```jsx
import { useState, useRef, useEffect } from 'react'

function TaskManager() {
  const [tasks, setTasks] = useState(new Map())
  const eventSourcesRef = useRef(new Map())

  const startTask = (prompt) => {
    const taskId = Date.now().toString()

    // 添加任务
    setTasks(prev => new Map(prev).set(taskId, {
      prompt,
      status: 'processing',
      progress: 0,
      result: null
    }))

    // 创建 SSE 连接
    const es = new EventSource(
      `/api/generate?prompt=${encodeURIComponent(prompt)}&taskId=${taskId}`
    )
    eventSourcesRef.current.set(taskId, es)

    es.addEventListener('progress', (e) => {
      const data = JSON.parse(e.data)
      setTasks(prev => {
        const newMap = new Map(prev)
        const task = newMap.get(taskId)
        if (task) {
          newMap.set(taskId, { ...task, progress: data.percent })
        }
        return newMap
      })
    })

    es.addEventListener('complete', (e) => {
      const data = JSON.parse(e.data)
      setTasks(prev => {
        const newMap = new Map(prev)
        const task = newMap.get(taskId)
        if (task) {
          newMap.set(taskId, {
            ...task,
            status: 'done',
            progress: 100,
            result: data.result
          })
        }
        return newMap
      })
      es.close()
      eventSourcesRef.current.delete(taskId)
    })

    es.addEventListener('error', () => {
      setTasks(prev => {
        const newMap = new Map(prev)
        const task = newMap.get(taskId)
        if (task) {
          newMap.set(taskId, { ...task, status: 'error' })
        }
        return newMap
      })
      es.close()
      eventSourcesRef.current.delete(taskId)
    })
  }

  const cancelTask = (taskId) => {
    const es = eventSourcesRef.current.get(taskId)
    if (es) {
      es.close()
      eventSourcesRef.current.delete(taskId)
    }
    setTasks(prev => {
      const newMap = new Map(prev)
      newMap.delete(taskId)
      return newMap
    })
  }

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      eventSourcesRef.current.forEach(es => es.close())
    }
  }, [])

  return (
    <div>
      <button onClick={() => startTask('生成音乐')}>
        新建任务
      </button>

      {[...tasks.entries()].map(([taskId, task]) => (
        <div key={taskId} className="task-card">
          <p>{task.prompt}</p>
          <p>状态: {task.status}</p>
          {task.status === 'processing' && (
            <>
              <progress value={task.progress} max="100" />
              <button onClick={() => cancelTask(taskId)}>取消</button>
            </>
          )}
          {task.result && <audio controls src={task.result.url} />}
        </div>
      ))}
    </div>
  )
}
```

## SSE 连接管理注意事项

### 1. 每次请求新建连接

对于 AI 对话场景，每轮对话新建一个 SSE 连接是正常的：

```
第1轮: 用户发消息 → 新建连接 → AI流式回复 → 连接关闭
第2轮: 用户发消息 → 新建连接 → AI流式回复 → 连接关闭
```

上下文通过请求体传递，不依赖连接状态。

### 2. 多任务并行

如果需要多个任务同时进行，每个任务独立管理自己的连接：

```javascript
// 错误：共用一个连接变量，新任务会覆盖旧任务
let eventSource = null
function startTask() {
  eventSource = new EventSource('/api/task')  // 旧连接丢失！
}

// 正确：用 Map 管理多个连接
const eventSources = new Map()
function startTask(taskId) {
  const es = new EventSource(`/api/task?id=${taskId}`)
  eventSources.set(taskId, es)
}
```

### 3. 后端处理客户端断开

```javascript
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')

  let isClosed = false

  req.on('close', () => {
    isClosed = true
    // 停止处理，释放资源
  })

  // 处理逻辑中检查 isClosed
  async function process() {
    while (!isClosed) {
      // 处理任务...
    }
  }
})
```

## 何时选择 SSE

| 场景 | 推荐方案 |
|------|---------|
| AI 对话流式输出 | SSE |
| 异步任务进度推送 | SSE |
| 实时通知（单向） | SSE |
| 多人聊天室 | WebSocket |
| 实时协作编辑 | WebSocket |
| 游戏 | WebSocket |
| 简单数据获取 | 普通 HTTP |

**总结**：如果只需要服务端向客户端推送数据，优先考虑 SSE，实现简单、兼容性好、自动重连。

