# 接口请求重试机制

## 概述

接口请求重试机制是前端容错处理的重要手段，用于处理**网络波动**、**服务端临时故障**、**超时**等场景，提升应用的稳定性和用户体验。

---

## 一、基础实现

### 简单重试

```javascript
/**
 * 基础重试函数
 * @param {Function} fn - 需要重试的异步函数
 * @param {number} retries - 最大重试次数
 * @param {number} delay - 重试间隔（毫秒）
 */
async function retry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      // 最后一次重试失败，抛出错误
      if (i === retries - 1) {
        throw error
      }

      console.warn(`第 ${i + 1} 次请求失败，${delay}ms 后重试...`)

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

// 使用示例
const data = await retry(
  () => fetch('/api/data').then(res => res.json()),
  3,
  1000
)
```

### 带配置的重试

```javascript
/**
 * 可配置的重试函数
 */
async function retryRequest(fn, options = {}) {
  const {
    retries = 3,              // 最大重试次数
    delay = 1000,             // 初始延迟
    maxDelay = 30000,         // 最大延迟
    backoff = 'exponential',  // 退避策略: 'fixed' | 'linear' | 'exponential'
    retryOn = [],             // 指定重试的错误码/状态码
    onRetry = null,           // 重试回调
    shouldRetry = null        // 自定义重试条件
  } = options

  let lastError

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(attempt)
    } catch (error) {
      lastError = error

      // 检查是否应该重试
      if (attempt === retries) {
        break
      }

      // 自定义重试条件
      if (shouldRetry && !shouldRetry(error, attempt)) {
        break
      }

      // 检查错误码
      if (retryOn.length > 0) {
        const errorCode = error.status || error.code || error.response?.status
        if (!retryOn.includes(errorCode)) {
          break
        }
      }

      // 计算延迟时间
      const waitTime = calculateDelay(delay, attempt, backoff, maxDelay)

      // 重试回调
      onRetry?.({
        error,
        attempt: attempt + 1,
        delay: waitTime
      })

      // 等待
      await sleep(waitTime)
    }
  }

  throw lastError
}

/**
 * 计算延迟时间
 */
function calculateDelay(baseDelay, attempt, strategy, maxDelay) {
  let delay

  switch (strategy) {
    case 'fixed':
      // 固定延迟
      delay = baseDelay
      break

    case 'linear':
      // 线性增长: 1s, 2s, 3s, 4s...
      delay = baseDelay * (attempt + 1)
      break

    case 'exponential':
      // 指数退避: 1s, 2s, 4s, 8s...
      delay = baseDelay * Math.pow(2, attempt)
      break

    default:
      delay = baseDelay
  }

  // 添加抖动，避免同时重试
  const jitter = delay * 0.2 * Math.random()
  delay = delay + jitter

  return Math.min(delay, maxDelay)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 使用示例
const data = await retryRequest(
  () => fetch('/api/data').then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }),
  {
    retries: 3,
    delay: 1000,
    backoff: 'exponential',
    retryOn: [408, 500, 502, 503, 504],  // 只在这些状态码时重试
    onRetry: ({ attempt, delay }) => {
      console.log(`第 ${attempt} 次重试，等待 ${delay}ms`)
    }
  }
)
```

---

## 二、指数退避算法

### 什么是指数退避

```javascript
/**
 * 指数退避 (Exponential Backoff)
 *
 * 原理: 每次重试的等待时间呈指数增长
 * 公式: delay = baseDelay * 2^attempt
 *
 * 示例 (baseDelay = 1000ms):
 * - 第1次重试: 1000ms
 * - 第2次重试: 2000ms
 * - 第3次重试: 4000ms
 * - 第4次重试: 8000ms
 *
 * 优点:
 * 1. 给服务器恢复时间
 * 2. 避免大量请求同时重试造成雪崩
 * 3. 减少不必要的网络请求
 */
```

### 带抖动的指数退避

```javascript
/**
 * 指数退避 + 抖动 (Exponential Backoff with Jitter)
 *
 * 为什么需要抖动:
 * - 多个客户端同时失败，如果都在相同时间重试，会造成"惊群效应"
 * - 添加随机抖动可以分散重试时间
 *
 * 常见抖动策略:
 * 1. Full Jitter: delay = random(0, baseDelay * 2^attempt)
 * 2. Equal Jitter: delay = baseDelay * 2^attempt / 2 + random(0, baseDelay * 2^attempt / 2)
 * 3. Decorrelated Jitter: delay = min(maxDelay, random(baseDelay, prevDelay * 3))
 */

class ExponentialBackoff {
  constructor(options = {}) {
    this.baseDelay = options.baseDelay || 1000
    this.maxDelay = options.maxDelay || 30000
    this.maxRetries = options.maxRetries || 5
    this.jitterType = options.jitterType || 'full'  // 'none' | 'full' | 'equal' | 'decorrelated'

    this.attempt = 0
    this.prevDelay = this.baseDelay
  }

  // 获取下次延迟时间
  nextDelay() {
    if (this.attempt >= this.maxRetries) {
      return null  // 超过最大重试次数
    }

    const exponentialDelay = this.baseDelay * Math.pow(2, this.attempt)
    let delay

    switch (this.jitterType) {
      case 'none':
        delay = exponentialDelay
        break

      case 'full':
        // Full Jitter: [0, exponentialDelay]
        delay = Math.random() * exponentialDelay
        break

      case 'equal':
        // Equal Jitter: exponentialDelay/2 + [0, exponentialDelay/2]
        delay = exponentialDelay / 2 + Math.random() * (exponentialDelay / 2)
        break

      case 'decorrelated':
        // Decorrelated Jitter
        delay = Math.random() * (this.prevDelay * 3 - this.baseDelay) + this.baseDelay
        this.prevDelay = delay
        break

      default:
        delay = exponentialDelay
    }

    this.attempt++

    return Math.min(delay, this.maxDelay)
  }

  // 重置
  reset() {
    this.attempt = 0
    this.prevDelay = this.baseDelay
  }

  // 是否还能重试
  canRetry() {
    return this.attempt < this.maxRetries
  }
}

// 使用示例
async function fetchWithBackoff(url, options = {}) {
  const backoff = new ExponentialBackoff({
    baseDelay: 1000,
    maxDelay: 30000,
    maxRetries: 5,
    jitterType: 'full'
  })

  while (true) {
    try {
      const response = await fetch(url, options)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return response.json()

    } catch (error) {
      const delay = backoff.nextDelay()

      if (delay === null) {
        throw error  // 超过最大重试次数
      }

      console.log(`请求失败，${Math.round(delay)}ms 后重试 (第 ${backoff.attempt} 次)`)
      await sleep(delay)
    }
  }
}
```

---

## 三、Axios 重试拦截器

### 基础拦截器实现

```javascript
import axios from 'axios'

// 创建 axios 实例
const instance = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 重试配置
const retryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error) => {
    // 网络错误或 5xx 错误时重试
    return !error.response || (error.response.status >= 500 && error.response.status <= 599)
  }
}

// 响应拦截器
instance.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config

    // 初始化重试计数
    config.__retryCount = config.__retryCount || 0

    // 检查是否应该重试
    if (
      config.__retryCount >= retryConfig.retries ||
      !retryConfig.retryCondition(error)
    ) {
      return Promise.reject(error)
    }

    config.__retryCount++

    // 计算延迟
    const delay = retryConfig.retryDelay * Math.pow(2, config.__retryCount - 1)

    console.log(`请求 ${config.url} 失败，${delay}ms 后进行第 ${config.__retryCount} 次重试`)

    // 等待后重试
    await new Promise(resolve => setTimeout(resolve, delay))

    return instance(config)
  }
)

export default instance
```

### 完整的重试插件

```javascript
/**
 * Axios 重试插件
 */
function axiosRetry(axiosInstance, defaultOptions = {}) {
  const defaults = {
    retries: 3,
    retryDelay: (retryCount) => retryCount * 1000,  // 支持函数
    retryCondition: isRetryableError,
    shouldResetTimeout: false,
    onRetry: null
  }

  // 合并默认配置
  const globalConfig = { ...defaults, ...defaultOptions }

  axiosInstance.interceptors.response.use(null, async (error) => {
    const config = error.config

    // 获取重试配置（请求级别配置优先）
    const retryConfig = {
      ...globalConfig,
      ...config.retry
    }

    // 初始化重试状态
    const currentState = config.__retryState || {}
    config.__retryState = currentState

    currentState.retryCount = currentState.retryCount || 0

    // 判断是否应该重试
    const shouldRetry = retryConfig.retryCondition(error) &&
                        currentState.retryCount < retryConfig.retries

    if (!shouldRetry) {
      return Promise.reject(error)
    }

    currentState.retryCount++

    // 计算延迟
    const delay = typeof retryConfig.retryDelay === 'function'
      ? retryConfig.retryDelay(currentState.retryCount, error)
      : retryConfig.retryDelay

    // 重试回调
    retryConfig.onRetry?.(currentState.retryCount, error, config)

    // 重置超时
    if (retryConfig.shouldResetTimeout && config.timeout) {
      config.timeout = config.timeout
    }

    // 延迟后重试
    await new Promise(resolve => setTimeout(resolve, delay))

    return axiosInstance(config)
  })
}

/**
 * 判断错误是否可重试
 */
function isRetryableError(error) {
  // 网络错误
  if (!error.response) {
    return true
  }

  // 幂等方法的 5xx 错误
  const idempotentMethods = ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE']
  const isIdempotent = idempotentMethods.includes(error.config.method?.toUpperCase())

  if (isIdempotent && error.response.status >= 500) {
    return true
  }

  // 特定状态码
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504]
  if (retryableStatusCodes.includes(error.response.status)) {
    return true
  }

  return false
}

// 使用示例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

axiosRetry(api, {
  retries: 3,
  retryDelay: (retryCount) => {
    // 指数退避
    return Math.pow(2, retryCount) * 1000
  },
  retryCondition: (error) => {
    // 自定义重试条件
    return isRetryableError(error)
  },
  onRetry: (retryCount, error, config) => {
    console.log(`[${config.url}] 第 ${retryCount} 次重试`)
  }
})

// 请求级别配置
api.get('/data', {
  retry: {
    retries: 5,  // 覆盖全局配置
    retryDelay: 2000
  }
})
```

---

## 四、Fetch 重试封装

### 基础封装

```javascript
/**
 * 带重试的 Fetch
 */
async function fetchWithRetry(url, options = {}) {
  const {
    retries = 3,
    retryDelay = 1000,
    retryOn = [408, 500, 502, 503, 504],
    timeout = 10000,
    onRetry,
    ...fetchOptions
  } = options

  let lastError

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      // 检查是否需要重试
      if (!response.ok && retryOn.includes(response.status)) {
        throw new Error(`HTTP ${response.status}`)
      }

      return response

    } catch (error) {
      clearTimeout(timeoutId)
      lastError = error

      // 最后一次尝试，抛出错误
      if (attempt === retries) {
        break
      }

      // 检查是否是可重试的错误
      const isRetryable = error.name === 'AbortError' ||  // 超时
                          error.name === 'TypeError' ||    // 网络错误
                          error.message.startsWith('HTTP')

      if (!isRetryable) {
        break
      }

      // 计算延迟（指数退避）
      const delay = retryDelay * Math.pow(2, attempt)

      onRetry?.({
        attempt: attempt + 1,
        error,
        delay
      })

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

// 使用示例
try {
  const response = await fetchWithRetry('/api/data', {
    method: 'GET',
    retries: 3,
    retryDelay: 1000,
    timeout: 5000,
    onRetry: ({ attempt, delay }) => {
      console.log(`重试 ${attempt}，等待 ${delay}ms`)
    }
  })

  const data = await response.json()
  console.log(data)

} catch (error) {
  console.error('请求最终失败:', error)
}
```

### 高级封装

```javascript
/**
 * 高级 Fetch 封装
 * 支持: 重试、超时、取消、进度
 */
class FetchClient {
  constructor(baseURL = '', defaultOptions = {}) {
    this.baseURL = baseURL
    this.defaults = {
      retries: 3,
      retryDelay: 1000,
      backoff: 'exponential',
      timeout: 10000,
      retryOn: [408, 429, 500, 502, 503, 504],
      ...defaultOptions
    }
  }

  async request(url, options = {}) {
    const config = {
      ...this.defaults,
      ...options,
      url: this.baseURL + url
    }

    const {
      retries,
      retryDelay,
      backoff,
      timeout,
      retryOn,
      onRetry,
      onProgress,
      ...fetchOptions
    } = config

    let lastError
    let lastResponse

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController()
      let timeoutId

      try {
        // 设置超时
        if (timeout) {
          timeoutId = setTimeout(() => controller.abort(), timeout)
        }

        const response = await fetch(config.url, {
          ...fetchOptions,
          signal: controller.signal
        })

        clearTimeout(timeoutId)
        lastResponse = response

        // 成功响应
        if (response.ok) {
          return response
        }

        // 检查是否需要重试
        if (!retryOn.includes(response.status)) {
          return response
        }

        throw new Error(`HTTP ${response.status}`)

      } catch (error) {
        clearTimeout(timeoutId)
        lastError = error

        // 最后一次尝试
        if (attempt === retries) {
          break
        }

        // 检查是否可重试
        if (!this.isRetryable(error)) {
          break
        }

        // 计算延迟
        const delay = this.calculateDelay(retryDelay, attempt, backoff)

        // 重试回调
        onRetry?.({
          attempt: attempt + 1,
          totalRetries: retries,
          error,
          delay
        })

        await this.sleep(delay)
      }
    }

    // 如果有响应但不成功，返回响应
    if (lastResponse) {
      return lastResponse
    }

    throw lastError
  }

  isRetryable(error) {
    // 超时
    if (error.name === 'AbortError') {
      return true
    }

    // 网络错误
    if (error.name === 'TypeError') {
      return true
    }

    // HTTP 错误
    if (error.message.startsWith('HTTP')) {
      return true
    }

    return false
  }

  calculateDelay(baseDelay, attempt, strategy) {
    let delay

    switch (strategy) {
      case 'fixed':
        delay = baseDelay
        break
      case 'linear':
        delay = baseDelay * (attempt + 1)
        break
      case 'exponential':
        delay = baseDelay * Math.pow(2, attempt)
        break
      default:
        delay = baseDelay
    }

    // 添加抖动
    const jitter = delay * 0.2 * Math.random()
    return delay + jitter
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 便捷方法
  get(url, options) {
    return this.request(url, { ...options, method: 'GET' })
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
    })
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
    })
  }

  delete(url, options) {
    return this.request(url, { ...options, method: 'DELETE' })
  }
}

// 使用示例
const api = new FetchClient('/api', {
  retries: 3,
  timeout: 10000
})

// GET 请求
const response = await api.get('/users', {
  onRetry: ({ attempt, delay }) => {
    console.log(`第 ${attempt} 次重试`)
  }
})

// POST 请求
await api.post('/users', { name: 'John' })
```

---

## 五、Vue 3 组合式函数

```javascript
// composables/useRequest.js
import { ref, shallowRef } from 'vue'

export function useRequest(requestFn, options = {}) {
  const {
    immediate = false,
    retries = 3,
    retryDelay = 1000,
    backoff = 'exponential',
    onSuccess,
    onError,
    onRetry
  } = options

  const data = shallowRef(null)
  const error = ref(null)
  const loading = ref(false)
  const retryCount = ref(0)

  async function execute(...args) {
    loading.value = true
    error.value = null
    retryCount.value = 0

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await requestFn(...args)
        data.value = result
        onSuccess?.(result)
        return result

      } catch (e) {
        error.value = e

        if (attempt === retries) {
          onError?.(e)
          break
        }

        retryCount.value = attempt + 1

        const delay = calculateDelay(retryDelay, attempt, backoff)
        onRetry?.({ attempt: attempt + 1, error: e, delay })

        await sleep(delay)
      }
    }

    loading.value = false
    throw error.value
  }

  function reset() {
    data.value = null
    error.value = null
    loading.value = false
    retryCount.value = 0
  }

  // 立即执行
  if (immediate) {
    execute()
  }

  return {
    data,
    error,
    loading,
    retryCount,
    execute,
    reset
  }
}

function calculateDelay(baseDelay, attempt, strategy) {
  switch (strategy) {
    case 'fixed':
      return baseDelay
    case 'linear':
      return baseDelay * (attempt + 1)
    case 'exponential':
      return baseDelay * Math.pow(2, attempt)
    default:
      return baseDelay
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 使用示例
// <script setup>
// import { useRequest } from '@/composables/useRequest'
//
// const { data, loading, error, execute, retryCount } = useRequest(
//   () => fetch('/api/data').then(res => res.json()),
//   {
//     retries: 3,
//     retryDelay: 1000,
//     backoff: 'exponential',
//     onRetry: ({ attempt }) => {
//       console.log(`第 ${attempt} 次重试`)
//     }
//   }
// )
//
// // 手动执行
// await execute()
// </script>
//
// <template>
//   <div v-if="loading">加载中... (重试: {{ retryCount }})</div>
//   <div v-else-if="error">{{ error.message }}</div>
//   <div v-else>{{ data }}</div>
// </template>
```

---

## 六、React Hook

```jsx
import { useState, useCallback, useRef, useEffect } from 'react'

function useRequest(requestFn, options = {}) {
  const {
    manual = true,
    retries = 3,
    retryDelay = 1000,
    backoff = 'exponential',
    onSuccess,
    onError,
    onRetry
  } = options

  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    setRetryCount(0)

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await requestFn(...args)

        if (mountedRef.current) {
          setData(result)
          setLoading(false)
          onSuccess?.(result)
        }

        return result

      } catch (e) {
        if (!mountedRef.current) return

        if (attempt === retries) {
          setError(e)
          setLoading(false)
          onError?.(e)
          throw e
        }

        setRetryCount(attempt + 1)

        const delay = calculateDelay(retryDelay, attempt, backoff)
        onRetry?.({ attempt: attempt + 1, error: e, delay })

        await sleep(delay)
      }
    }
  }, [requestFn, retries, retryDelay, backoff, onSuccess, onError, onRetry])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
    setRetryCount(0)
  }, [])

  // 非手动模式，自动执行
  useEffect(() => {
    if (!manual) {
      execute()
    }
  }, [manual, execute])

  return {
    data,
    error,
    loading,
    retryCount,
    execute,
    reset
  }
}

function calculateDelay(baseDelay, attempt, strategy) {
  switch (strategy) {
    case 'fixed':
      return baseDelay
    case 'linear':
      return baseDelay * (attempt + 1)
    case 'exponential':
      return baseDelay * Math.pow(2, attempt)
    default:
      return baseDelay
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 使用示例
function UserList() {
  const { data, loading, error, retryCount, execute } = useRequest(
    () => fetch('/api/users').then(res => res.json()),
    {
      manual: false,  // 自动执行
      retries: 3,
      retryDelay: 1000,
      backoff: 'exponential',
      onRetry: ({ attempt, delay }) => {
        console.log(`第 ${attempt} 次重试，等待 ${delay}ms`)
      }
    }
  )

  if (loading) {
    return <div>加载中... {retryCount > 0 && `(重试 ${retryCount})`}</div>
  }

  if (error) {
    return (
      <div>
        <p>错误: {error.message}</p>
        <button onClick={execute}>重试</button>
      </div>
    )
  }

  return (
    <ul>
      {data?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

---

## 七、重试策略最佳实践

### 1. 幂等性考虑

```javascript
/**
 * 幂等性 (Idempotency)
 *
 * 幂等请求: 多次执行结果相同
 * - GET: 幂等 ✓
 * - PUT: 幂等 ✓
 * - DELETE: 幂等 ✓
 * - POST: 非幂等 ✗
 * - PATCH: 非幂等 ✗
 *
 * 非幂等请求需要特殊处理
 */

function shouldRetry(error, config) {
  // 非幂等方法默认不重试
  const nonIdempotentMethods = ['POST', 'PATCH']
  const method = config.method?.toUpperCase()

  if (nonIdempotentMethods.includes(method)) {
    // 只在网络错误（请求未到达服务器）时重试
    return !error.response
  }

  // 幂等方法可以重试
  return true
}

// 使用幂等键保证安全
async function safePost(url, data, options = {}) {
  const idempotencyKey = options.idempotencyKey || generateUUID()

  return fetchWithRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey  // 服务端需要支持
    },
    body: JSON.stringify(data),
    ...options
  })
}
```

### 2. 断路器模式

```javascript
/**
 * 断路器模式 (Circuit Breaker)
 *
 * 状态:
 * - CLOSED: 正常，允许请求
 * - OPEN: 熔断，拒绝请求
 * - HALF_OPEN: 半开，允许部分请求测试
 *
 * 作用: 防止对已知故障服务持续请求
 */

class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5    // 失败阈值
    this.successThreshold = options.successThreshold || 3    // 恢复阈值
    this.timeout = options.timeout || 30000                  // 熔断时间

    this.state = 'CLOSED'
    this.failureCount = 0
    this.successCount = 0
    this.lastFailureTime = null
  }

  async execute(fn) {
    // 检查状态
    if (this.state === 'OPEN') {
      // 检查是否可以进入半开状态
      if (Date.now() - this.lastFailureTime >= this.timeout) {
        this.state = 'HALF_OPEN'
        console.log('断路器进入半开状态')
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result

    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  onSuccess() {
    this.failureCount = 0

    if (this.state === 'HALF_OPEN') {
      this.successCount++

      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED'
        this.successCount = 0
        console.log('断路器关闭')
      }
    }
  }

  onFailure() {
    this.failureCount++
    this.lastFailureTime = Date.now()
    this.successCount = 0

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN'
      console.log('断路器打开')
    }
  }

  getState() {
    return this.state
  }
}

// 结合重试使用
const breaker = new CircuitBreaker({
  failureThreshold: 5,
  timeout: 30000
})

async function fetchWithCircuitBreaker(url) {
  return breaker.execute(async () => {
    return fetchWithRetry(url, {
      retries: 3,
      retryDelay: 1000
    })
  })
}
```

### 3. 请求队列

```javascript
/**
 * 请求队列
 * 控制并发数，失败时自动重试
 */

class RequestQueue {
  constructor(options = {}) {
    this.concurrency = options.concurrency || 3
    this.retries = options.retries || 3
    this.retryDelay = options.retryDelay || 1000

    this.queue = []
    this.running = 0
    this.results = new Map()
  }

  add(id, requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        id,
        requestFn,
        resolve,
        reject,
        retryCount: 0
      })

      this.process()
    })
  }

  async process() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift()
      this.running++

      this.executeTask(task)
        .then(result => {
          this.results.set(task.id, { success: true, data: result })
          task.resolve(result)
        })
        .catch(error => {
          this.results.set(task.id, { success: false, error })
          task.reject(error)
        })
        .finally(() => {
          this.running--
          this.process()
        })
    }
  }

  async executeTask(task) {
    try {
      return await task.requestFn()
    } catch (error) {
      if (task.retryCount < this.retries) {
        task.retryCount++
        await sleep(this.retryDelay * task.retryCount)
        return this.executeTask(task)
      }
      throw error
    }
  }

  getResults() {
    return this.results
  }
}

// 使用示例
const queue = new RequestQueue({
  concurrency: 3,
  retries: 3
})

// 批量请求
const urls = ['/api/1', '/api/2', '/api/3', '/api/4', '/api/5']

const promises = urls.map((url, index) =>
  queue.add(index, () => fetch(url).then(res => res.json()))
)

const results = await Promise.allSettled(promises)
```

---

