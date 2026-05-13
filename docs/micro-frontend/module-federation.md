# Module Federation

Module Federation（模块联邦）是 Webpack 5 引入的一项革命性功能，它允许多个独立构建的应用在运行时动态共享代码，是实现微前端架构的重要技术方案。

## 核心概念

### 基本原理

```
┌─────────────────────────────────────────────────────────┐
│                        Host（主应用）                     │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │   本地模块       │    │   远程模块（运行时加载）      │ │
│  │   ./App         │    │   remote/Button            │ │
│  │   ./Header      │    │   remote/utils             │ │
│  └─────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                              ↑
                              │ 运行时加载
                              │
┌─────────────────────────────────────────────────────────┐
│                      Remote（远程应用）                   │
│  ┌─────────────────────────────────────────────────────┐ │
│  │   暴露的模块                                         │ │
│  │   ./Button  ./utils  ./Card                        │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 核心术语

| 术语 | 说明 |
|------|------|
| Host | 消费其他应用模块的应用（主应用） |
| Remote | 暴露模块供其他应用使用的应用 |
| Exposed | Remote 暴露出去的模块 |
| Shared | 多个应用共享的依赖（如 React） |
| Container | 每个应用的模块容器 |

## 基础配置

### Remote 应用配置

```javascript
// webpack.config.js（Remote 应用）
const { ModuleFederationPlugin } = require('webpack').container

module.exports = {
  output: {
    publicPath: 'http://localhost:3001/',
    // 使用唯一的全局变量名
    uniqueName: 'remote_app'
  },
  plugins: [
    new ModuleFederationPlugin({
      // 应用名称（全局唯一）
      name: 'remote',

      // 远程入口文件名
      filename: 'remoteEntry.js',

      // 暴露的模块
      exposes: {
        './Button': './src/components/Button',
        './Card': './src/components/Card',
        './utils': './src/utils/index'
      },

      // 共享依赖
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.0.0'
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.0.0'
        }
      }
    })
  ]
}
```

### Host 应用配置

```javascript
// webpack.config.js（Host 应用）
const { ModuleFederationPlugin } = require('webpack').container

module.exports = {
  output: {
    publicPath: 'http://localhost:3000/'
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',

      // 声明远程应用
      remotes: {
        // 格式：name@url/filename
        remote: 'remote@http://localhost:3001/remoteEntry.js',
        another: 'another@http://localhost:3002/remoteEntry.js'
      },

      // 共享依赖
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.0.0'
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.0.0'
        }
      }
    })
  ]
}
```

### 使用远程模块

```tsx
// Host 应用中使用 Remote 模块
import React, { Suspense, lazy } from 'react'

// 动态导入远程组件
const RemoteButton = lazy(() => import('remote/Button'))
const RemoteCard = lazy(() => import('remote/Card'))

// 导入远程工具函数
const getUtils = () => import('remote/utils')

function App() {
  const handleClick = async () => {
    const { formatDate } = await getUtils()
    console.log(formatDate(new Date()))
  }

  return (
    <div>
      <h1>Host Application</h1>

      <Suspense fallback={<div>Loading Button...</div>}>
        <RemoteButton onClick={handleClick}>
          Click Me
        </RemoteButton>
      </Suspense>

      <Suspense fallback={<div>Loading Card...</div>}>
        <RemoteCard title="Remote Card" />
      </Suspense>
    </div>
  )
}

export default App
```

## 共享依赖配置

### 基础共享

```javascript
new ModuleFederationPlugin({
  shared: ['react', 'react-dom', 'lodash']
})
```

### 高级共享配置

```javascript
new ModuleFederationPlugin({
  shared: {
    react: {
      // 单例模式（确保只有一个 React 实例）
      singleton: true,

      // 立即加载共享模块
      eager: true,

      // 版本要求
      requiredVersion: '^18.0.0',

      // 严格版本检查
      strictVersion: true
    },

    'react-dom': {
      singleton: true,
      requiredVersion: '^18.0.0'
    },

    // 共享自己的模块
    '@myorg/shared': {
      singleton: true,
      // 使用 package.json 中的版本
      requiredVersion: require('./package.json').dependencies['@myorg/shared']
    },

    lodash: {
      // 允许不同版本共存
      singleton: false
    }
  }
})
```

### 共享策略

```javascript
// 自动从 package.json 获取共享配置
const deps = require('./package.json').dependencies

new ModuleFederationPlugin({
  shared: {
    ...deps,
    react: {
      singleton: true,
      requiredVersion: deps.react
    },
    'react-dom': {
      singleton: true,
      requiredVersion: deps['react-dom']
    }
  }
})
```

## 动态远程加载

### 运行时动态加载

```javascript
// 动态加载远程模块
async function loadRemoteModule(scope, module) {
  // 初始化远程容器
  await __webpack_init_sharing__('default')

  const container = window[scope]
  await container.init(__webpack_share_scopes__.default)

  // 获取模块工厂
  const factory = await container.get(module)
  return factory()
}

// 使用
const Button = await loadRemoteModule('remote', './Button')
```

### 动态配置 Remote

```javascript
// 运行时配置远程应用
function loadRemoteEntry(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// 动态加载远程入口
async function loadDynamicRemote(remoteName, remoteUrl) {
  await loadRemoteEntry(remoteUrl)
  return loadRemoteModule(remoteName, './Button')
}

// 使用
const Button = await loadDynamicRemote(
  'dynamicRemote',
  'http://localhost:3003/remoteEntry.js'
)
```

### 动态 Remote 组件

```tsx
import React, { useState, useEffect, Suspense } from 'react'

interface RemoteConfig {
  url: string
  scope: string
  module: string
}

function useDynamicRemote(config: RemoteConfig) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadComponent() {
      try {
        // 加载远程入口
        await loadRemoteEntry(config.url)

        // 初始化共享作用域
        await __webpack_init_sharing__('default')

        const container = window[config.scope]
        await container.init(__webpack_share_scopes__.default)

        const factory = await container.get(config.module)
        const Module = factory()

        if (isMounted) {
          setComponent(() => Module.default || Module)
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error)
        }
      }
    }

    loadComponent()

    return () => {
      isMounted = false
    }
  }, [config.url, config.scope, config.module])

  return { Component, error }
}

// 使用
function DynamicRemoteComponent({ config, ...props }) {
  const { Component, error } = useDynamicRemote(config)

  if (error) return <div>加载失败: {error.message}</div>
  if (!Component) return <div>加载中...</div>

  return <Component {...props} />
}
```

## TypeScript 支持

### 类型声明

```typescript
// types/remote.d.ts
declare module 'remote/Button' {
  import { FC, ButtonHTMLAttributes } from 'react'

  interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary'
    size?: 'small' | 'medium' | 'large'
  }

  const Button: FC<ButtonProps>
  export default Button
}

declare module 'remote/Card' {
  import { FC, ReactNode } from 'react'

  interface CardProps {
    title: string
    children?: ReactNode
    footer?: ReactNode
  }

  const Card: FC<CardProps>
  export default Card
}

declare module 'remote/utils' {
  export function formatDate(date: Date): string
  export function formatNumber(num: number): string
}
```

### 配置 TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "remote/*": ["./types/remote.d.ts"]
    }
  },
  "include": ["src", "types"]
}
```

### 自动生成类型

```javascript
// webpack.config.js
const { FederatedTypesPlugin } = require('@module-federation/typescript')

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      // ...配置
    }),
    new FederatedTypesPlugin({
      federationConfig: {
        name: 'remote',
        filename: 'remoteEntry.js',
        exposes: {
          './Button': './src/components/Button'
        }
      }
    })
  ]
}
```

## Vite 支持

### 使用 vite-plugin-federation

```bash
npm install @originjs/vite-plugin-federation -D
```

```javascript
// vite.config.js（Remote）
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'remote',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/components/Button.tsx',
        './Card': './src/components/Card.tsx'
      },
      shared: ['react', 'react-dom']
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
})
```

```javascript
// vite.config.js（Host）
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'host',
      remotes: {
        remote: 'http://localhost:5001/assets/remoteEntry.js'
      },
      shared: ['react', 'react-dom']
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
})
```

## 错误处理

### 加载错误处理

```tsx
import React, { Component, Suspense, lazy } from 'react'

// 错误边界组件
class ErrorBoundary extends Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Remote module error:', error, errorInfo)
    // 上报错误
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

// 带错误处理的远程组件
const RemoteButton = lazy(() =>
  import('remote/Button').catch(() => ({
    default: () => <button disabled>加载失败</button>
  }))
)

function App() {
  return (
    <ErrorBoundary fallback={<div>组件加载失败</div>}>
      <Suspense fallback={<div>加载中...</div>}>
        <RemoteButton />
      </Suspense>
    </ErrorBoundary>
  )
}
```

### 降级方案

```tsx
// 带降级的远程组件加载
function loadRemoteWithFallback<T>(
  remoteImport: () => Promise<{ default: T }>,
  fallback: T
): Promise<{ default: T }> {
  return remoteImport().catch(() => ({ default: fallback }))
}

// 本地降级组件
const LocalButton = (props) => <button {...props} />

// 使用
const RemoteButton = lazy(() =>
  loadRemoteWithFallback(
    () => import('remote/Button'),
    LocalButton
  )
)
```

### 重试机制

```typescript
async function loadRemoteWithRetry(
  loader: () => Promise<any>,
  maxRetries = 3,
  delay = 1000
): Promise<any> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await loader()
    } catch (error) {
      lastError = error as Error
      console.warn(`加载失败，第 ${i + 1} 次重试...`)
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }

  throw lastError!
}

// 使用
const RemoteButton = lazy(() =>
  loadRemoteWithRetry(() => import('remote/Button'))
)
```

## 版本控制

### 版本协商

```javascript
new ModuleFederationPlugin({
  shared: {
    react: {
      singleton: true,
      requiredVersion: '^18.0.0',
      // 严格版本检查，版本不匹配时抛出警告
      strictVersion: true
    }
  }
})
```

### 多版本共存

```javascript
new ModuleFederationPlugin({
  shared: {
    lodash: {
      // 允许多版本
      singleton: false,
      // 指定版本范围
      requiredVersion: '^4.17.0'
    }
  }
})
```

### 版本冲突处理

```javascript
// 自定义版本协商逻辑
new ModuleFederationPlugin({
  shared: {
    react: {
      singleton: true,
      requiredVersion: '^18.0.0',
      // 版本不满足时的处理
      strictVersion: false,  // 使用警告而非错误
    }
  }
})
```

## 性能优化

### 预加载远程模块

```javascript
// 预加载策略
function preloadRemote(url: string) {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'script'
  link.href = url
  document.head.appendChild(link)
}

// 在合适的时机预加载
preloadRemote('http://localhost:3001/remoteEntry.js')
```

### 缓存策略

```javascript
// webpack.config.js
module.exports = {
  output: {
    // 使用内容哈希
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js'
  },
  optimization: {
    moduleIds: 'deterministic',
    chunkIds: 'deterministic'
  }
}
```

### 按需加载

```tsx
// 路由级别的按需加载
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

const RemoteApp = lazy(() => import('remote/App'))
const AnotherApp = lazy(() => import('another/App'))

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/remote/*"
        element={
          <Suspense fallback={<Loading />}>
            <RemoteApp />
          </Suspense>
        }
      />
      <Route
        path="/another/*"
        element={
          <Suspense fallback={<Loading />}>
            <AnotherApp />
          </Suspense>
        }
      />
    </Routes>
  )
}
```

## 双向联邦

### 互相暴露和消费

```javascript
// App A 配置
new ModuleFederationPlugin({
  name: 'appA',
  filename: 'remoteEntry.js',
  exposes: {
    './ComponentA': './src/ComponentA'
  },
  remotes: {
    appB: 'appB@http://localhost:3002/remoteEntry.js'
  },
  shared: ['react', 'react-dom']
})

// App B 配置
new ModuleFederationPlugin({
  name: 'appB',
  filename: 'remoteEntry.js',
  exposes: {
    './ComponentB': './src/ComponentB'
  },
  remotes: {
    appA: 'appA@http://localhost:3001/remoteEntry.js'
  },
  shared: ['react', 'react-dom']
})
```

### 避免循环依赖

```javascript
// 使用动态导入避免循环依赖
// App A 中使用 App B 的组件
const ComponentB = lazy(() => import('appB/ComponentB'))

// App B 中使用 App A 的组件
const ComponentA = lazy(() => import('appA/ComponentA'))
```

## 与微前端框架对比

| 特性 | Module Federation | qiankun | Micro App |
|------|------------------|---------|-----------|
| 实现层级 | 模块级 | 应用级 | 应用级 |
| 共享依赖 | 运行时共享 | 需要额外配置 | 需要额外配置 |
| 构建工具 | 依赖 Webpack 5 | 无要求 | 无要求 |
| 技术栈要求 | 较高 | 无 | 无 |
| 粒度 | 细粒度（组件） | 粗粒度（应用） | 粗粒度（应用） |
| 隔离性 | 无沙箱 | JS/CSS 沙箱 | JS/CSS 沙箱 |

## 常见面试题

::: details 1. Module Federation 的工作原理？
Module Federation 工作流程：
1. **构建时**：每个应用独立构建，生成 `remoteEntry.js` 入口文件
2. **运行时**：Host 应用加载 Remote 的入口文件
3. **初始化**：Remote 容器初始化，注册暴露的模块
4. **按需加载**：Host 请求模块时，从 Remote 容器获取
5. **共享协商**：检查共享依赖版本，使用合适版本
:::

::: details 2. 如何处理共享依赖的版本冲突？
```javascript
shared: {
  react: {
    // 单例模式确保只有一个实例
    singleton: true,
    // 使用警告而非错误
    strictVersion: false,
    // 指定兼容版本范围
    requiredVersion: '^18.0.0'
  }
}
```
:::

::: details 3. Module Federation 与微前端有什么区别？
- **粒度不同**：MF 是模块级共享，微前端是应用级集成
- **隔离性**：MF 无沙箱，共享同一运行时；微前端有沙箱隔离
- **适用场景**：MF 适合组件/模块共享；微前端适合独立应用集成
- **技术要求**：MF 需要 Webpack 5；微前端技术栈无关
:::

::: details 4. 如何实现动态加载远程模块？
```javascript
async function loadModule(scope, module) {
  // 加载远程入口
  await loadRemoteEntry(`http://example.com/${scope}/remoteEntry.js`)

  // 初始化共享作用域
  await __webpack_init_sharing__('default')

  // 获取容器并初始化
  const container = window[scope]
  await container.init(__webpack_share_scopes__.default)

  // 获取模块
  const factory = await container.get(module)
  return factory()
}
```
:::

::: details 5. shared 配置中 singleton 和 eager 的作用？
- **singleton: true**
  - 确保整个应用只有一个模块实例
  - 适用于 React 等需要单一实例的库
  - 避免多实例导致的问题（如 hooks 规则）

- **eager: true**
  - 模块会被立即加载，而非按需加载
  - 适用于启动时必需的模块
  - 会增加初始加载体积
:::

::: details 6. 如何保证远程模块的类型安全？
- 创建类型声明文件（.d.ts）
- 使用 `@module-federation/typescript` 自动生成类型
- 配置 tsconfig.json 的 paths 映射
- 在 CI/CD 中同步类型定义
:::
