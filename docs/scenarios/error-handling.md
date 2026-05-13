# 前端错误边界与异常处理

## 概述

前端错误处理是保证应用稳定性和用户体验的关键。良好的错误处理策略能够捕获异常、优雅降级、上报监控，让应用在出错时也能保持可用。

## 错误类型分类

### JavaScript 运行时错误

```javascript
// 语法错误（编译时）
const a = ;  // SyntaxError

// 引用错误
console.log(undefinedVar);  // ReferenceError

// 类型错误
null.toString();  // TypeError

// 范围错误
new Array(-1);  // RangeError

// URI 错误
decodeURIComponent('%');  // URIError
```

### 网络请求错误

```javascript
// HTTP 错误状态码
// 4xx - 客户端错误
// 5xx - 服务端错误

// 网络错误
// ERR_NETWORK
// ERR_CONNECTION_REFUSED
// ERR_TIMEOUT
```

### 资源加载错误

```javascript
// 图片加载失败
<img src="not-found.png" onerror="handleError()" />

// 脚本加载失败
<script src="app.js" onerror="handleError()"></script>

// 样式加载失败
<link href="style.css" onerror="handleError()" />
```

### Promise 未捕获错误

```javascript
// 未处理的 Promise 拒绝
Promise.reject('error');  // Uncaught (in promise) error

new Promise((_, reject) => {
  reject(new Error('failed'));
});  // 未捕获
```

## 全局错误捕获

### window.onerror

```javascript
// 捕获同步错误
window.onerror = function(message, source, lineno, colno, error) {
  console.log('错误信息:', message);
  console.log('脚本文件:', source);
  console.log('行号:', lineno);
  console.log('列号:', colno);
  console.log('错误对象:', error);

  // 上报错误
  reportError({
    type: 'js-error',
    message,
    source,
    lineno,
    colno,
    stack: error?.stack
  });

  // 返回 true 阻止默认错误处理
  return true;
};

// 跨域脚本错误
// 添加 crossorigin 属性获取详细错误信息
<script src="https://cdn.example.com/app.js" crossorigin="anonymous"></script>
```

### window.addEventListener('error')

```javascript
// 捕获资源加载错误（需要捕获阶段）
window.addEventListener('error', (event) => {
  const target = event.target;

  // 区分资源加载错误和运行时错误
  if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
    reportError({
      type: 'resource-error',
      tagName: target.tagName,
      src: target.src || target.href,
      message: `${target.tagName} load failed`
    });
  }
}, true);  // 捕获阶段
```

### unhandledrejection

```javascript
// 捕获未处理的 Promise 拒绝
window.addEventListener('unhandledrejection', (event) => {
  console.log('未捕获的 Promise 错误:', event.reason);

  reportError({
    type: 'promise-error',
    message: event.reason?.message || String(event.reason),
    stack: event.reason?.stack
  });

  // 阻止默认处理
  event.preventDefault();
});

// 捕获已处理的 Promise 拒绝（通常不需要）
window.addEventListener('rejectionhandled', (event) => {
  console.log('Promise 错误已被处理');
});
```

## React 错误边界

### 类组件错误边界

```jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // 静态方法：从错误派生状态
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // 捕获错误信息
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // 上报错误
    reportError({
      type: 'react-error',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // 降级 UI
      return (
        <div className="error-fallback">
          <h2>页面出错了</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            刷新页面
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre>{this.state.errorInfo?.componentStack}</pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// 使用
function App() {
  return (
    <ErrorBoundary>
      <MainContent />
    </ErrorBoundary>
  );
}
```

### 可复用的错误边界

```jsx
// ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          resetError: this.resetError
        });
      }
      return <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

// 使用
<ErrorBoundary
  onError={(error, info) => reportError(error)}
  fallback={({ error, resetError }) => (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={resetError}>重试</button>
    </div>
  )}
>
  <UserProfile />
</ErrorBoundary>
```

### react-error-boundary 库

```jsx
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';

// Fallback 组件
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

// 使用
function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => console.error(error)}
      onReset={() => {
        // 重置应用状态
      }}
      resetKeys={[userId]}  // 当 key 变化时自动重置
    >
      <UserProfile />
    </ErrorBoundary>
  );
}

// 在子组件中手动触发错误边界
function UserProfile() {
  const { showBoundary } = useErrorBoundary();

  const handleError = (error) => {
    showBoundary(error);
  };

  return <div>...</div>;
}
```

### 错误边界的限制

```jsx
// 错误边界不能捕获以下错误：

// 1. 事件处理器中的错误
function Button() {
  const handleClick = () => {
    throw new Error('Click error');  // 不会被捕获
  };

  return <button onClick={handleClick}>Click</button>;
}

// 解决方案：使用 try-catch
function Button() {
  const handleClick = () => {
    try {
      riskyOperation();
    } catch (error) {
      // 处理错误
    }
  };

  return <button onClick={handleClick}>Click</button>;
}

// 2. 异步代码
useEffect(() => {
  setTimeout(() => {
    throw new Error('Async error');  // 不会被捕获
  }, 1000);
}, []);

// 解决方案：在异步代码中捕获
useEffect(() => {
  const timer = setTimeout(async () => {
    try {
      await asyncOperation();
    } catch (error) {
      // 处理错误
    }
  }, 1000);

  return () => clearTimeout(timer);
}, []);

// 3. 服务端渲染 (SSR)
// 4. 错误边界自身的错误
```

## Vue 错误处理

### 全局错误处理

```javascript
// Vue 3
const app = createApp(App);

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err);
  console.error('Component:', instance);
  console.error('Info:', info);

  reportError({
    type: 'vue-error',
    message: err.message,
    stack: err.stack,
    component: instance?.$options?.name,
    info
  });
};

// 全局警告处理（仅开发环境）
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('Vue warning:', msg);
};
```

### 组件级错误处理

```vue
<script setup>
import { onErrorCaptured, ref } from 'vue';

const error = ref(null);

// 捕获子组件错误
onErrorCaptured((err, instance, info) => {
  console.error('Captured error:', err);
  error.value = err;

  // 返回 false 阻止错误继续传播
  return false;
});
</script>

<template>
  <div v-if="error" class="error-fallback">
    <p>组件出错: {{ error.message }}</p>
    <button @click="error = null">重试</button>
  </div>
  <slot v-else />
</template>
```

### 错误边界组件

```vue
<!-- ErrorBoundary.vue -->
<script>
export default {
  name: 'ErrorBoundary',
  props: {
    fallback: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      error: null,
      errorInfo: null
    };
  },
  errorCaptured(err, instance, info) {
    this.error = err;
    this.errorInfo = info;

    this.$emit('error', { err, instance, info });

    // 阻止继续传播
    return false;
  },
  methods: {
    reset() {
      this.error = null;
      this.errorInfo = null;
    }
  },
  render() {
    if (this.error) {
      if (this.fallback) {
        return h(this.fallback, {
          error: this.error,
          reset: this.reset
        });
      }
      return h('div', { class: 'error-boundary' }, [
        h('p', `Error: ${this.error.message}`),
        h('button', { onClick: this.reset }, 'Retry')
      ]);
    }

    return this.$slots.default?.();
  }
};
</script>
```

## 请求错误处理

### Axios 拦截器

```javascript
import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',
  timeout: 10000
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    config.headers.Authorization = `Bearer ${getToken()}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const { response, request, message } = error;

    if (response) {
      // 服务器返回错误
      switch (response.status) {
        case 400:
          console.error('请求参数错误');
          break;
        case 401:
          console.error('未授权，请重新登录');
          // 跳转登录页
          router.push('/login');
          break;
        case 403:
          console.error('拒绝访问');
          break;
        case 404:
          console.error('请求资源不存在');
          break;
        case 500:
          console.error('服务器内部错误');
          break;
        default:
          console.error(`HTTP Error: ${response.status}`);
      }
    } else if (request) {
      // 请求已发出但无响应
      if (message.includes('timeout')) {
        console.error('请求超时');
      } else {
        console.error('网络错误');
      }
    } else {
      // 请求配置错误
      console.error('请求配置错误:', message);
    }

    // 上报错误
    reportError({
      type: 'http-error',
      url: error.config?.url,
      method: error.config?.method,
      status: response?.status,
      message
    });

    return Promise.reject(error);
  }
);
```

### 请求重试

```javascript
import axios from 'axios';

// 重试配置
const retryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error) => {
    return (
      !error.response ||
      error.response.status >= 500 ||
      error.code === 'ECONNABORTED'
    );
  }
};

// 添加重试逻辑
axios.interceptors.response.use(null, async (error) => {
  const config = error.config;

  if (!config || !retryConfig.retryCondition(error)) {
    return Promise.reject(error);
  }

  config._retryCount = config._retryCount || 0;

  if (config._retryCount >= retryConfig.retries) {
    return Promise.reject(error);
  }

  config._retryCount++;

  // 等待后重试
  await new Promise(resolve =>
    setTimeout(resolve, retryConfig.retryDelay * config._retryCount)
  );

  return axios(config);
});
```

## 异步错误处理

### async/await 错误处理

```javascript
// 方式一：try-catch
async function fetchData() {
  try {
    const response = await api.getData();
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// 方式二：封装错误处理
async function safeAsync(promise) {
  try {
    const data = await promise;
    return [null, data];
  } catch (error) {
    return [error, null];
  }
}

// 使用
const [error, data] = await safeAsync(api.getData());
if (error) {
  console.error('Error:', error);
  return;
}
console.log('Data:', data);

// 方式三：高阶函数
function withErrorHandling(fn, errorHandler) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      return errorHandler(error);
    }
  };
}

const safeFetch = withErrorHandling(fetchData, (error) => {
  console.error('Error:', error);
  return null;
});
```

### Promise 错误处理

```javascript
// 统一的 Promise 错误处理
function createSafePromise(promise) {
  return promise
    .then(data => ({ data, error: null }))
    .catch(error => ({ data: null, error }));
}

// 批量处理 Promise
async function fetchAll(urls) {
  const results = await Promise.allSettled(
    urls.map(url => fetch(url))
  );

  const successful = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  const failed = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason);

  if (failed.length > 0) {
    console.error('Some requests failed:', failed);
  }

  return successful;
}
```

## 错误上报

### 错误上报服务

```javascript
class ErrorReporter {
  constructor(options) {
    this.endpoint = options.endpoint;
    this.appId = options.appId;
    this.queue = [];
    this.maxQueueSize = 10;

    // 页面卸载前发送
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  report(error) {
    const errorData = {
      appId: this.appId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...error
    };

    this.queue.push(errorData);

    if (this.queue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  async flush() {
    if (this.queue.length === 0) return;

    const errors = [...this.queue];
    this.queue = [];

    try {
      // 使用 sendBeacon 确保发送
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          this.endpoint,
          JSON.stringify(errors)
        );
      } else {
        await fetch(this.endpoint, {
          method: 'POST',
          body: JSON.stringify(errors),
          keepalive: true
        });
      }
    } catch (e) {
      // 发送失败，放回队列
      this.queue.unshift(...errors);
    }
  }
}

// 使用
const reporter = new ErrorReporter({
  endpoint: '/api/errors',
  appId: 'my-app'
});

window.onerror = (message, source, lineno, colno, error) => {
  reporter.report({
    type: 'js-error',
    message,
    source,
    lineno,
    colno,
    stack: error?.stack
  });
};
```

### Source Map 支持

```javascript
// 生产环境使用 Source Map 还原错误位置
// 1. 构建时生成 Source Map
// 2. 将 Source Map 上传到错误监控服务
// 3. 错误上报时包含原始位置信息

// 使用 source-map 库解析
import { SourceMapConsumer } from 'source-map';

async function parseErrorStack(stack, sourceMapUrl) {
  const response = await fetch(sourceMapUrl);
  const sourceMap = await response.json();

  const consumer = await new SourceMapConsumer(sourceMap);

  // 解析堆栈中的每一行
  const parsedStack = stack.split('\n').map(line => {
    const match = line.match(/at .+ \((.+):(\d+):(\d+)\)/);
    if (match) {
      const [, file, line, column] = match;
      const original = consumer.originalPositionFor({
        line: parseInt(line),
        column: parseInt(column)
      });
      return `at ${original.source}:${original.line}:${original.column}`;
    }
    return line;
  });

  consumer.destroy();
  return parsedStack.join('\n');
}
```

## 面试常见问题

::: details 1. 前端错误有哪些类型？
- JavaScript 运行时错误
- 资源加载错误
- 网络请求错误
- Promise 未捕获错误
- 框架组件渲染错误
:::

::: details 2. React 错误边界能捕获哪些错误？
能捕获：
- 子组件渲染时的错误
- 生命周期方法中的错误
- 构造函数中的错误

不能捕获：
- 事件处理器中的错误
- 异步代码中的错误
- 服务端渲染
- 错误边界自身的错误
:::

::: details 3. 如何设计一个错误监控系统？
```javascript
// 1. 错误捕获
window.onerror = ...
window.addEventListener('error', ...)
window.addEventListener('unhandledrejection', ...)

// 2. 错误标准化
// 3. 错误去重和采样
// 4. 错误上报
// 5. Source Map 解析
// 6. 告警通知
```
:::

::: details 4. 如何处理跨域脚本错误？
```html
<!-- 添加 crossorigin 属性 -->
<script src="https://cdn.example.com/app.js" crossorigin="anonymous"></script>
```

服务器需要返回 `Access-Control-Allow-Origin` 头。
:::

::: details 5. 如何优雅降级？
- 错误边界提供 Fallback UI
- 关键功能提供备用方案
- 资源加载失败使用默认资源
- 保存用户数据防止丢失
:::

## 总结

前端错误处理的核心策略：

1. **全面捕获**：onerror、addEventListener、unhandledrejection
2. **框架支持**：React ErrorBoundary、Vue errorHandler
3. **请求处理**：Axios 拦截器、重试机制
4. **错误上报**：标准化、去重、采样、Source Map
5. **优雅降级**：Fallback UI、备用方案

完善的错误处理能够显著提升应用的稳定性和用户体验。
