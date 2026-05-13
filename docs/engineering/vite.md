# Vite 深度解析

## 什么是 Vite?

### 官方定义
Vite 是新一代前端构建工具,利用浏览器原生 ES Modules 特性,实现了**极速的开发服务器启动**和**lightning-fast的热更新(HMR)**。

### 通俗理解
传统构建工具(Webpack):
- 像是**批发市场**,要把所有商品打包好才能开门营业
- 启动慢,改一行代码要重新打包

Vite:
- 像是**便利店**,商品直接上架,顾客要什么拿什么
- 秒启动,改代码瞬间生效

## Vite vs Webpack

| 特性 | Webpack | Vite |
|------|---------|------|
| 启动速度 | 慢(需要打包) | 快(无需打包) |
| 热更新 | 秒级 | 毫秒级 |
| 生产构建 | 自己打包 | Rollup打包 |
| 配置复杂度 | 复杂 | 简单 |
| 生态 | 成熟 | 快速发展 |
| 学习成本 | 高 | 低 |

## 核心原理

### 1. 开发阶段 - ESM

```javascript
// 传统方式(Webpack)
// 1. 分析所有依赖
// 2. 打包成bundle.js
// 3. 启动服务器
// 4. 浏览器加载bundle.js

// Vite方式
// 1. 直接启动服务器(秒启动)
// 2. 浏览器请求哪个模块,服务器就编译哪个
// 3. 利用浏览器原生ESM

// index.html
<script type="module" src="/src/main.js"></script>

// main.js
import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app')

// 浏览器直接请求:
// /src/main.js
// /src/App.vue
// /node_modules/vue/dist/vue.runtime.esm-bundler.js

// Vite拦截这些请求,实时编译返回
```

### 2. 依赖预构建

```javascript
// 为什么需要预构建?
/*
1. CommonJS转ESM
   很多npm包是CommonJS格式,需要转换

2. 减少HTTP请求
   lodash-es有600+个模块,预构建打包成一个文件

3. 缓存优化
   node_modules很少变化,强缓存提升性能
*/

// 配置预构建
export default {
  optimizeDeps: {
    // 包含的依赖
    include: ['vue', 'vue-router', 'axios'],

    // 排除的依赖
    exclude: ['@vueuse/core'],

    // 强制预构建
    force: true,

    // esbuild选项
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
}
```

### 3. 热更新(HMR)原理

```javascript
// Vite HMR原理
/*
1. 文件变化时,只重新请求该模块
2. 通过WebSocket通知浏览器
3. 浏览器接收更新,局部替换
4. 整个过程毫秒级完成
*/

// HMR API使用
if (import.meta.hot) {
  // 接受自身更新
  import.meta.hot.accept((newModule) => {
    console.log('模块更新:', newModule)
  })

  // 接受依赖更新
  import.meta.hot.accept('./dep.js', (newDep) => {
    // 处理依赖更新
  })

  // 销毁回调
  import.meta.hot.dispose((data) => {
    // 清理副作用
    data.cleanup = () => {
      // 清理逻辑
    }
  })

  // 自定义事件
  import.meta.hot.on('custom-event', (data) => {
    console.log('自定义事件:', data)
  })

  // 完全重载
  import.meta.hot.invalidate()
}

// Vue HMR实现
// vite-plugin-vue 自动处理
<template>
  <div>{{ count }}</div>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

// 修改模板或脚本,页面瞬间更新,状态保持
```

## 完整配置详解

### 基础配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  // 1. 插件
  plugins: [vue()],

  // 2. 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'components': resolve(__dirname, 'src/components'),
      'utils': resolve(__dirname, 'src/utils')
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },

  // 3. 服务器配置
  server: {
    port: 3000,
    open: true,
    cors: true,

    // 代理
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },

      '/ws': {
        target: 'ws://localhost:8080',
        ws: true
      }
    },

    // HMR配置
    hmr: {
      overlay: true,
      port: 3000
    }
  },

  // 4. 构建配置
  build: {
    // 输出目录
    outDir: 'dist',

    // 静态资源目录
    assetsDir: 'assets',

    // 小于此阈值的资源转base64
    assetsInlineLimit: 4096,

    // CSS代码分割
    cssCodeSplit: true,

    // Source Map
    sourcemap: false,

    // Rollup配置
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html')
      },

      output: {
        // chunk文件名
        chunkFileNames: 'js/[name]-[hash].js',

        // 入口文件名
        entryFileNames: 'js/[name]-[hash].js',

        // 静态资源文件名
        assetFileNames: '[ext]/[name]-[hash].[ext]',

        // 代码分割
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          ui: ['element-plus'],
          utils: ['axios', 'dayjs']
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

    // chunk大小警告限制
    chunkSizeWarningLimit: 1000
  },

  // 5. CSS配置
  css: {
    // CSS预处理器
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      },
      less: {
        modifyVars: {
          'primary-color': '#1890ff'
        },
        javascriptEnabled: true
      }
    },

    // PostCSS配置
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('postcss-px-to-viewport')({
          viewportWidth: 375
        })
      ]
    }
  },

  // 6. 环境变量
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0')
  },

  // 7. 预构建优化
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'],
    exclude: ['some-large-package']
  }
})
```

### 多环境配置

```javascript
// vite.config.js
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [vue()],

    server: {
      port: Number(env.VITE_PORT) || 3000
    },

    build: {
      sourcemap: mode === 'development'
    },

    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL)
    }
  }
})

// .env.development
VITE_PORT=3000
VITE_API_URL=http://localhost:8080/api

// .env.production
VITE_PORT=8080
VITE_API_URL=https://api.example.com

// 使用环境变量
console.log(import.meta.env.VITE_API_URL)
console.log(import.meta.env.MODE)  // 'development' | 'production'
console.log(import.meta.env.DEV)   // boolean
console.log(import.meta.env.PROD)  // boolean
```

## 常用插件

### 1. Vue 相关

```javascript
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default {
  plugins: [
    vue(),

    // JSX支持
    vueJsx(),

    // 自动导入API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()]
    }),

    // 自动导入组件
    Components({
      resolvers: [ElementPlusResolver()],
      dirs: ['src/components'],
      extensions: ['vue'],
      deep: true
    })
  ]
}
```

### 2. 性能优化插件

```javascript
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'
import viteImagemin from 'vite-plugin-imagemin'

export default {
  plugins: [
    // Gzip压缩
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
      deleteOriginFile: false
    }),

    // Brotli压缩
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br'
    }),

    // 打包分析
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    }),

    // 图片压缩
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.8, 0.9] },
      svgo: {
        plugins: [
          { name: 'removeViewBox' },
          { name: 'removeEmptyAttrs', active: false }
        ]
      }
    })
  ]
}
```

### 3. 其他实用插件

```javascript
import legacy from '@vitejs/plugin-legacy'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import mockDevServerPlugin from 'vite-plugin-mock-dev-server'

export default {
  plugins: [
    // 浏览器兼容
    legacy({
      targets: ['defaults', 'not IE 11']
    }),

    // SVG图标
    createSvgIconsPlugin({
      iconDirs: [resolve(process.cwd(), 'src/icons')],
      symbolId: 'icon-[dir]-[name]'
    }),

    // Mock服务
    mockDevServerPlugin()
  ]
}
```

## 性能优化实战

### 1. 首屏优化

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        // 分包策略
        manualChunks(id) {
          // node_modules分包
          if (id.includes('node_modules')) {
            // 将大型库单独打包
            if (id.includes('element-plus')) {
              return 'element-plus'
            }
            if (id.includes('echarts')) {
              return 'echarts'
            }
            // 其他第三方库
            return 'vendor'
          }

          // 业务代码分包
          if (id.includes('src/views')) {
            const path = id.split('src/views/')[1]
            const moduleName = path.split('/')[0]
            return `views-${moduleName}`
          }
        }
      }
    }
  }
}

// 路由懒加载
const routes = [
  {
    path: '/home',
    component: () => import('./views/Home.vue')
  },
  {
    path: '/about',
    component: () => import('./views/About.vue')
  }
]

// 组件懒加载
const HeavyComponent = defineAsyncComponent(() =>
  import('./components/HeavyComponent.vue')
)
```

### 2. 构建优化

```javascript
export default {
  build: {
    // 目标浏览器
    target: 'es2015',

    // CSS代码分割
    cssCodeSplit: true,

    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      },
      format: {
        comments: false
      }
    },

    // 关闭brotli可节省构建时间
    reportCompressedSize: false,

    // chunk大小警告
    chunkSizeWarningLimit: 1000
  },

  // esbuild优化
  esbuild: {
    pure: ['console.log'],
    drop: ['debugger'],
    legalComments: 'none'
  }
}
```

### 3. 预加载和预连接

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <!-- DNS预解析 -->
  <link rel="dns-prefetch" href="https://api.example.com">

  <!-- 预连接 -->
  <link rel="preconnect" href="https://cdn.example.com">

  <!-- 预加载关键资源 -->
  <link rel="preload" href="/logo.png" as="image">
  <link rel="preload" href="/font.woff2" as="font" crossorigin>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

## 从 Webpack 迁移到 Vite

### 迁移步骤

```javascript
// 1. 安装Vite
npm install -D vite @vitejs/plugin-vue

// 2. 修改package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}

// 3. 创建vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})

// 4. 修改index.html
// Webpack:
<script src="/src/main.js"></script>

// Vite:
<script type="module" src="/src/main.js"></script>

// 5. 环境变量改名
// Webpack: process.env.VUE_APP_API_URL
// Vite: import.meta.env.VITE_API_URL

// 6. 静态资源处理
// Webpack: require('@/assets/logo.png')
// Vite: new URL('@/assets/logo.png', import.meta.url).href
// 或者: import logo from '@/assets/logo.png'

// 7. CommonJS转ESM
// Webpack: module.exports = {}
// Vite: export default {}
```

### 常见问题

```javascript
// 问题1: require is not defined
// 解决: 改用import
// ❌
const logo = require('@/assets/logo.png')

// ✅
import logo from '@/assets/logo.png'

// 问题2: process is not defined
// 解决: 使用import.meta.env
// ❌
console.log(process.env.NODE_ENV)

// ✅
console.log(import.meta.env.MODE)

// 问题3: __dirname is not defined
// 解决: 使用import.meta.url
// ❌
const dir = __dirname

// ✅
import { fileURLToPath } from 'url'
const __dirname = fileURLToPath(new URL('.', import.meta.url))

// 问题4: 动态import不work
// 解决: 使用Glob导入
// ❌
const modules = require.context('./modules', true, /\.js$/)

// ✅
const modules = import.meta.glob('./modules/**/*.js')
// 或立即导入
const modules = import.meta.glob('./modules/**/*.js', { eager: true })
```

## 手写简易Vite

```javascript
// mini-vite.js
const fs = require('fs')
const path = require('path')
const Koa = require('koa')
const { transformAsync } = require('@babel/core')

class MiniVite {
  constructor() {
    this.app = new Koa()
    this.setupMiddleware()
  }

  setupMiddleware() {
    // 处理ESM模块
    this.app.use(async (ctx) => {
      const { url } = ctx.request

      // 1. 处理根路径
      if (url === '/') {
        ctx.type = 'text/html'
        ctx.body = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8')
        return
      }

      // 2. 处理JS/Vue文件
      if (url.endsWith('.js') || url.endsWith('.vue')) {
        const filepath = path.join(process.cwd(), url)
        let content = fs.readFileSync(filepath, 'utf-8')

        // 3. 处理node_modules导入
        // import vue from 'vue' => import vue from '/@modules/vue'
        content = content.replace(
          /from ['"]([^'"]+)['"]/g,
          (match, p1) => {
            if (!p1.startsWith('./') && !p1.startsWith('/')) {
              return `from '/@modules/${p1}'`
            }
            return match
          }
        )

        // 4. 编译Vue单文件组件
        if (url.endsWith('.vue')) {
          content = this.compileVue(content)
        }

        // 5. 转换ES6
        const result = await transformAsync(content, {
          presets: ['@babel/preset-env'],
          filename: filepath
        })

        ctx.type = 'application/javascript'
        ctx.body = result.code
        return
      }

      // 6. 处理node_modules
      if (url.startsWith('/@modules/')) {
        const moduleName = url.replace('/@modules/', '')
        const modulePath = path.join(
          process.cwd(),
          'node_modules',
          moduleName,
          'package.json'
        )
        const pkg = require(modulePath)
        const entryFile = pkg.module || pkg.main
        const content = fs.readFileSync(
          path.join(path.dirname(modulePath), entryFile),
          'utf-8'
        )

        ctx.type = 'application/javascript'
        ctx.body = content
      }
    })
  }

  compileVue(content) {
    // 简化的Vue SFC编译
    const template = content.match(/<template>([\s\S]*?)<\/template>/)[1]
    const script = content.match(/<script>([\s\S]*?)<\/script>/)[1]

    return `
      ${script.replace('export default', 'const __script =')}
      __script.template = \`${template}\`
      export default __script
    `
  }

  listen(port) {
    this.app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`)
    })
  }
}

// 使用
const vite = new MiniVite()
vite.listen(3000)
```

