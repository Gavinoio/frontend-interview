# 构建优化

构建优化的目标是减少构建时间和减小产物体积，从而提升开发效率和用户加载速度。

## Tree Shaking

Tree Shaking 是一种通过静态分析，删除未使用代码的技术。

### 原理

基于 ES Module 的静态结构特性，在编译时分析模块依赖，移除未引用的导出。

```javascript
// utils.js
export function add(a, b) {
  return a + b
}

export function subtract(a, b) {
  return a - b
}

// main.js - 只使用了 add
import { add } from './utils'
console.log(add(1, 2))

// 构建后 subtract 会被移除
```

### 使用条件

1. **使用 ES Module**：`import/export` 语法
2. **避免副作用**：或正确标记 `sideEffects`
3. **生产模式**：`mode: 'production'`

### package.json 配置

```json
{
  "sideEffects": false
}

// 或指定有副作用的文件
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfill.js"
  ]
}
```

### 注意事项

```javascript
// ❌ 这样会导致 Tree Shaking 失效
import _ from 'lodash'
_.get(obj, 'a.b')

// ✅ 按需引入
import get from 'lodash/get'
get(obj, 'a.b')

// ✅ 或使用 lodash-es
import { get } from 'lodash-es'
```

## 代码压缩

### JavaScript 压缩

Webpack 5 内置 Terser 进行 JS 压缩：

```javascript
// webpack.config.js
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,      // 移除 console
            drop_debugger: true,     // 移除 debugger
            pure_funcs: ['console.log']  // 移除指定函数
          },
          mangle: true,              // 混淆变量名
          format: {
            comments: false          // 移除注释
          }
        },
        parallel: true,              // 多进程并行
        extractComments: false       // 不提取注释到单独文件
      })
    ]
  }
}
```

### CSS 压缩

```javascript
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = {
  optimization: {
    minimizer: [
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true }
            }
          ]
        }
      })
    ]
  }
}
```

### HTML 压缩

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin')

new HtmlWebpackPlugin({
  minify: {
    collapseWhitespace: true,       // 折叠空白
    removeComments: true,           // 移除注释
    removeRedundantAttributes: true, // 移除冗余属性
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true
  }
})
```

## 代码分割

### splitChunks 配置

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',           // 对所有模块进行分割
      minSize: 20000,          // 最小体积 20KB
      minChunks: 1,            // 最少引用次数
      maxAsyncRequests: 30,    // 按需加载最大并行请求数
      maxInitialRequests: 30,  // 入口最大并行请求数
      cacheGroups: {
        // 第三方库
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          chunks: 'initial'
        },
        // Vue 全家桶
        vue: {
          test: /[\\/]node_modules[\\/](vue|vue-router|pinia)[\\/]/,
          name: 'vue-vendor',
          priority: 20,
          chunks: 'all'
        },
        // UI 组件库
        elementPlus: {
          test: /[\\/]node_modules[\\/]element-plus[\\/]/,
          name: 'element-plus',
          priority: 20,
          chunks: 'all'
        },
        // 公共模块
        commons: {
          name: 'commons',
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  }
}
```

### 动态导入

```javascript
// 路由懒加载
const Home = () => import(/* webpackChunkName: "home" */ './views/Home.vue')
const About = () => import(/* webpackChunkName: "about" */ './views/About.vue')

// 组件懒加载
const HeavyComponent = defineAsyncComponent(() =>
  import('./components/HeavyComponent.vue')
)

// 条件加载
async function loadEditor() {
  if (needEditor) {
    const { Editor } = await import('./Editor')
    return Editor
  }
}
```

### Magic Comments

```javascript
import(
  /* webpackChunkName: "my-chunk" */
  /* webpackPrefetch: true */
  /* webpackPreload: true */
  './module'
)
```

- `webpackChunkName`: 指定 chunk 名称
- `webpackPrefetch`: 空闲时预获取
- `webpackPreload`: 与父 chunk 并行加载

## 构建缓存

### Webpack 5 持久化缓存

```javascript
module.exports = {
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]  // 配置文件变化时使缓存失效
    },
    name: 'development-cache',
    version: '1.0'
  }
}
```

### babel-loader 缓存

```javascript
{
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    cacheCompression: false  // 不压缩缓存，提升速度
  }
}
```

## 并行构建

### thread-loader

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'thread-loader',
            options: {
              workers: require('os').cpus().length - 1
            }
          },
          'babel-loader'
        ]
      }
    ]
  }
}
```

### TerserPlugin 并行

```javascript
new TerserPlugin({
  parallel: true  // 默认 os.cpus().length - 1
})
```

## 减少构建范围

### 缩小 loader 作用范围

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),  // 只处理 src
        exclude: /node_modules/,                   // 排除 node_modules
        use: ['babel-loader']
      }
    ]
  }
}
```

### resolve 优化

```javascript
module.exports = {
  resolve: {
    // 减少后缀尝试
    extensions: ['.js', '.vue', '.json'],
    // 指定模块目录
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    // 别名
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    // 主字段
    mainFields: ['module', 'main']
  }
}
```

### externals 外部化

```javascript
module.exports = {
  externals: {
    vue: 'Vue',
    'vue-router': 'VueRouter',
    axios: 'axios'
  }
}
```

```html
<!-- 使用 CDN -->
<script src="https://cdn.jsdelivr.net/npm/vue@3"></script>
```

## 产物分析

### webpack-bundle-analyzer

```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html',
      openAnalyzer: false
    })
  ]
}
```

### 产物分析要点

- 识别大体积模块
- 发现重复依赖
- 检查是否正确分包
- 评估 Tree Shaking 效果

## Vite 构建优化

```javascript
// vite.config.js
export default {
  build: {
    // Rollup 配置
    rollupOptions: {
      output: {
        // 分包策略
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['element-plus']
        }
      }
    },
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // chunk 大小警告阈值
    chunkSizeWarningLimit: 500,
    // CSS 代码分割
    cssCodeSplit: true,
    // 生成 sourcemap
    sourcemap: false
  }
}
```

## 常见面试题

::: details 1. 什么是 Tree Shaking？如何确保它生效？
Tree Shaking 是移除未使用代码的技术。确保生效：
- 使用 ES Module
- 设置 `sideEffects: false`
- 使用 production 模式
- 避免 CommonJS 模块
:::

::: details 2. splitChunks 的 chunks 有哪些值？
- `all`: 对所有模块进行分割
- `async`: 只分割异步模块（默认）
- `initial`: 只分割入口模块
:::

::: details 3. 如何优化 Webpack 构建速度？
- 使用持久化缓存
- 缩小 loader 作用范围
- 使用 thread-loader 多进程
- 合理配置 resolve
- 使用 externals 外部化依赖
:::

::: details 4. 如何减小打包体积？
- Tree Shaking
- 代码压缩
- 代码分割
- 按需加载
- 使用 CDN
- 图片压缩
- Gzip/Brotli 压缩
:::
