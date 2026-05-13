# Webpack 深度解析

## 什么是 Webpack?

### 官方定义
Webpack 是一个现代 JavaScript 应用程序的**静态模块打包工具**。它将项目中的所有资源(JS、CSS、图片等)视为模块,通过分析依赖关系,打包成浏览器可执行的静态资源。

### 通俗理解
Webpack 就像是一个**超级工厂**:
- 输入: 各种原材料(源代码、图片、CSS等)
- 处理: 按照配方(配置文件)加工
- 输出: 成品(打包后的文件)

## 核心概念

### 1. Entry (入口)

```javascript
// 单入口
module.exports = {
  entry: './src/index.js'
};

// 多入口
module.exports = {
  entry: {
    app: './src/app.js',
    admin: './src/admin.js'
  }
};

// 动态入口
module.exports = {
  entry: () => {
    return {
      app: './src/app.js',
      vendor: ['react', 'react-dom']
    };
  }
};
```

### 2. Output (输出)

```javascript
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    // 输出目录(绝对路径)
    path: path.resolve(__dirname, 'dist'),

    // 输出文件名
    filename: '[name].[contenthash:8].js',

    // 公共路径(CDN)
    publicPath: 'https://cdn.example.com/',

    // chunk 文件名
    chunkFilename: '[name].[contenthash:8].chunk.js',

    // 清空输出目录
    clean: true
  }
};

// 文件名占位符:
// [name] - chunk名称
// [hash] - 构建hash
// [contenthash] - 内容hash(推荐)
// [chunkhash] - chunk hash
```

### 3. Loader (加载器)

```javascript
module.exports = {
  module: {
    rules: [
      // 1. JavaScript/TypeScript
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: '> 0.25%, not dead' }],
              '@babel/preset-react',
              '@babel/preset-typescript'
            ]
          }
        }
      },

      // 2. CSS
      {
        test: /\.css$/,
        use: [
          'style-loader',  // 将CSS注入到DOM
          'css-loader',    // 解析CSS
          'postcss-loader' // CSS后处理(autoprefixer)
        ]
      },

      // 3. Sass/Less
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },

      // 4. 图片
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 10KB以下转base64
          }
        },
        generator: {
          filename: 'images/[name].[hash:8][ext]'
        }
      },

      // 5. 字体
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]'
        }
      }
    ]
  }
};

// Loader 特点:
// - 从右到左执行
// - 链式调用
// - 可以是同步或异步
```

### 4. Plugin (插件)

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  plugins: [
    // 1. HTML生成
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      inject: 'body',
      minify: {
        removeComments: true,
        collapseWhitespace: true
      }
    }),

    // 2. 提取CSS
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].chunk.css'
    }),

    // 3. 清理输出目录
    new CleanWebpackPlugin(),

    // 4. 复制静态资源
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', to: 'public' }
      ]
    }),

    // 5. 定义环境变量
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.API_URL': JSON.stringify('https://api.example.com')
    }),

    // 6. 模块热替换
    new webpack.HotModuleReplacementPlugin()
  ]
};
```

## 优化策略

### 1. 代码分割

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 第三方库
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },

        // 公共模块
        common: {
          minChunks: 2,
          name: 'common',
          priority: 5,
          reuseExistingChunk: true
        },

        // React相关
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          priority: 20
        }
      }
    },

    // 运行时代码单独打包
    runtimeChunk: {
      name: 'runtime'
    }
  }
};
```

### 2. Tree Shaking

```javascript
// package.json
{
  "sideEffects": [
    "*.css",
    "*.scss"
  ]
}

// webpack.config.js
module.exports = {
  mode: 'production',  // 自动启用 Tree Shaking
  optimization: {
    usedExports: true,  // 标记未使用的导出
    minimize: true      // 删除未使用的代码
  }
};

// 代码示例
// utils.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;

// main.js
import { add } from './utils';  // 只导入 add
console.log(add(1, 2));
// 打包后: subtract 和 multiply 会被移除
```

### 3. 压缩优化

```javascript
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      // JS压缩
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,  // 删除console
            drop_debugger: true,
            pure_funcs: ['console.log']
          },
          format: {
            comments: false  // 删除注释
          }
        },
        extractComments: false
      }),

      // CSS压缩
      new CssMinimizerPlugin()
    ]
  }
};
```

### 4. 缓存优化

```javascript
module.exports = {
  // 1. 文件名hash
  output: {
    filename: '[name].[contenthash:8].js'
  },

  // 2. 模块ID稳定
  optimization: {
    moduleIds: 'deterministic'
  },

  // 3. Loader缓存
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            cacheCompression: false
          }
        }
      }
    ]
  },

  // 4. 持久化缓存(Webpack 5)
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  }
};
```

### 5. 构建性能优化

```javascript
module.exports = {
  // 1. 缩小文件搜索范围
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'components': path.resolve(__dirname, 'src/components')
    }
  },

  // 2. 使用 include/exclude
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },

  // 3. 多线程打包
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'thread-loader',
            options: { workers: 4 }
          },
          'babel-loader'
        ]
      }
    ]
  },

  // 4. DLL插件(已过时,现在用externals)
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
};
```

## 开发环境配置

```javascript
const webpack = require('webpack');

module.exports = {
  mode: 'development',

  // Source Map
  devtool: 'eval-cheap-module-source-map',

  // 开发服务器
  devServer: {
    port: 3000,
    hot: true,
    open: true,
    compress: true,
    historyApiFallback: true,

    // 代理
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    }
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};
```

## 生产环境配置

```javascript
module.exports = {
  mode: 'production',

  // Source Map(生产环境)
  devtool: 'source-map',

  optimization: {
    minimize: true,
    splitChunks: { chunks: 'all' },
    runtimeChunk: true
  },

  performance: {
    hints: 'warning',
    maxEntrypointSize: 250000,
    maxAssetSize: 250000
  }
};
```

## 手写简易 Webpack

```javascript
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const babel = require('@babel/core');

class Webpack {
  constructor(options) {
    this.entry = options.entry;
    this.output = options.output;
    this.modules = [];
  }

  // 解析模块
  parse(filename) {
    const content = fs.readFileSync(filename, 'utf-8');

    // 解析AST
    const ast = parser.parse(content, {
      sourceType: 'module'
    });

    const dependencies = [];

    // 收集依赖
    traverse(ast, {
      ImportDeclaration({ node }) {
        dependencies.push(node.source.value);
      }
    });

    // 转换ES6
    const { code } = babel.transformFromAstSync(ast, null, {
      presets: ['@babel/preset-env']
    });

    return {
      filename,
      dependencies,
      code
    };
  }

  // 构建依赖图
  build(entry) {
    const entryModule = this.parse(entry);
    const queue = [entryModule];

    for (const module of queue) {
      module.dependencies.forEach(dep => {
        const depPath = path.resolve(path.dirname(module.filename), dep);
        const depModule = this.parse(depPath);
        queue.push(depModule);
      });
    }

    this.modules = queue;
  }

  // 生成输出文件
  generate() {
    const modules = this.modules.map(module => {
      return `'${module.filename}': function(require, module, exports) {
        ${module.code}
      }`;
    }).join(',');

    const output = `
      (function(modules) {
        function require(filename) {
          const fn = modules[filename];
          const module = { exports: {} };
          fn(require, module, module.exports);
          return module.exports;
        }
        require('${this.entry}');
      })({${modules}})
    `;

    return output;
  }

  // 写入文件
  emit() {
    const outputPath = path.join(this.output.path, this.output.filename);
    const code = this.generate();
    fs.writeFileSync(outputPath, code, 'utf-8');
  }

  run() {
    this.build(this.entry);
    this.emit();
  }
}

// 使用
const webpack = new Webpack({
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
});

webpack.run();
```

## 常见面试题

::: details 1. Webpack构建流程是怎样的?
<details>
<summary>点击查看答案</summary>

**完整流程**:

1. **初始化**
   - 读取配置文件
   - 合并配置参数
   - 创建Compiler对象

2. **编译**
   - 从entry开始
   - 递归解析所有依赖模块
   - 调用对应的Loader处理

3. **构建模块**
   - 使用Loader转换文件
   - 解析依赖关系
   - 生成AST

4. **生成chunk**
   - 根据entry和splitChunks配置
   - 将modules组合成chunks

5. **输出**
   - 根据output配置
   - 将chunks写入文件系统

**核心钩子**:
- beforeRun: 开始前
- compile: 编译前
- make: 构建模块
- seal: 生成chunk
- emit: 输出文件
- done: 完成
:::

</details>

::: details 2. Loader和Plugin的区别?
<details>
<summary>点击查看答案</summary>

**Loader**:
- 作用: 转换文件内容
- 时机: 编译阶段
- 本质: 函数,接收源代码,返回转换后代码
- 示例: babel-loader、css-loader

```javascript
// Loader示例
module.exports = function(source) {
  // source: 文件内容
  // 进行转换
  return transformedSource;
};
```

**Plugin**:
- 作用: 扩展Webpack功能
- 时机: 整个构建流程
- 本质: 类,包含apply方法
- 示例: HtmlWebpackPlugin、CleanWebpackPlugin

```javascript
// Plugin示例
class MyPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('MyPlugin', (compilation, callback) => {
      // 在输出文件前执行
      console.log('即将输出文件');
      callback();
    });
  }
}
```

**区别**:
- Loader专注文件转换,Plugin功能更强大
- Loader链式调用,Plugin监听钩子
- Loader单一职责,Plugin可以做任何事
:::

</details>

::: details 3. 如何优化Webpack构建速度?
<details>
<summary>点击查看答案</summary>

**优化策略**:

1. **缩小文件搜索范围**
   - include/exclude
   - resolve.modules
   - resolve.extensions

2. **使用缓存**
   - babel-loader cacheDirectory
   - cache: { type: 'filesystem' }

3. **多线程打包**
   - thread-loader
   - HappyPack(已过时)

4. **减少不必要的插件**
   - 开发环境少用生产插件

5. **使用DllPlugin**(已过时)
   - 现在用externals更好

6. **升级版本**
   - Webpack 5性能大幅提升

**实测效果**:
- 缓存: 提速50-70%
- thread-loader: 提速30-40%
- 优化resolve: 提速10-20%
:::

</details>

## 总结

::: details 核心要点
1. **四个核心概念**: Entry、Output、Loader、Plugin
2. **构建流程**: 初始化 → 编译 → 构建 → 生成 → 输出
3. **优化策略**: 代码分割、Tree Shaking、缓存、压缩
4. **性能优化**: 缩小范围、使用缓存、多线程
:::

::: details 面试加分项
- 能手写简易Webpack
- 了解构建流程和原理
- 熟悉常见优化策略
- 有Loader/Plugin开发经验
:::

## 高频面试题精讲

::: details 1. Webpack 的构建流程是什么？
**一句话答案**：
初始化配置 → 从入口递归解析依赖 → 用 Loader 转换模块 → 用 Plugin 处理 chunk → 输出打包文件。

**详细解答**：

Webpack 构建流程分为以下几个核心阶段：

#### 完整构建流程

```javascript
// 1. 初始化阶段
// - 读取并合并配置(webpack.config.js + CLI参数)
// - 创建 Compiler 对象
// - 加载所有配置的插件

// 2. 编译阶段
const compiler = webpack(config);

compiler.run((err, stats) => {
  // 3. 构建模块阶段
  // - 从 entry 开始
  // - 调用 Loader 转换模块
  // - 解析模块依赖
  // - 递归处理所有依赖模块
});

// 构建流程示例
class BuildProcessDemo {
  constructor() {
    this.modules = new Map();
    this.chunks = [];
  }

  // 阶段1: 初始化
  initialize(config) {
    this.entry = config.entry;
    this.output = config.output;
    this.loaders = config.module.rules;
    this.plugins = config.plugins;

    // 应用所有插件
    this.plugins.forEach(plugin => {
      plugin.apply(this);
    });
  }

  // 阶段2: 编译入口
  compile(entry) {
    // 触发 compile 钩子
    this.hooks.compile.call();

    // 开始构建
    this.hooks.make.callAsync(() => {
      this.buildModule(entry);
    });
  }

  // 阶段3: 构建模块
  buildModule(modulePath) {
    // 1. 读取文件内容
    const content = fs.readFileSync(modulePath, 'utf-8');

    // 2. 使用匹配的 Loader 转换
    const transformedContent = this.runLoaders(modulePath, content);

    // 3. 解析 AST，提取依赖
    const dependencies = this.parseDependencies(transformedContent);

    // 4. 存储模块信息
    this.modules.set(modulePath, {
      id: modulePath,
      code: transformedContent,
      dependencies
    });

    // 5. 递归处理依赖
    dependencies.forEach(dep => {
      this.buildModule(dep);
    });
  }

  // 阶段4: 封装 chunk
  seal() {
    this.hooks.seal.call();

    // 1. 根据入口和动态导入创建 chunk
    this.createChunks();

    // 2. 优化 chunk
    this.hooks.optimizeChunks.call(this.chunks);

    // 3. 生成 chunk 代码
    this.createChunkAssets();
  }

  // 阶段5: 输出文件
  emit() {
    this.hooks.emit.callAsync(() => {
      // 1. 创建输出目录
      const outputPath = this.output.path;

      // 2. 写入文件
      this.chunks.forEach(chunk => {
        const filename = this.output.filename.replace('[name]', chunk.name);
        fs.writeFileSync(
          path.join(outputPath, filename),
          chunk.code
        );
      });

      // 3. 触发完成钩子
      this.hooks.done.call();
    });
  }
}
```

#### 关键生命周期钩子

```javascript
// Webpack 核心钩子执行顺序
class CompilerHooks {
  constructor() {
    this.hooks = {
      // 1. 准备阶段
      beforeRun: new AsyncSeriesHook(['compiler']),
      run: new AsyncSeriesHook(['compiler']),

      // 2. 编译阶段
      beforeCompile: new AsyncSeriesHook(['params']),
      compile: new SyncHook(['params']),
      make: new AsyncParallelHook(['compilation']),

      // 3. 生成阶段
      seal: new SyncHook([]),
      optimizeChunks: new SyncBailHook(['chunks']),
      optimizeChunkAssets: new AsyncSeriesHook(['chunks']),

      // 4. 输出阶段
      emit: new AsyncSeriesHook(['compilation']),
      afterEmit: new AsyncSeriesHook(['compilation']),

      // 5. 完成阶段
      done: new AsyncSeriesHook(['stats']),
      failed: new SyncHook(['error'])
    };
  }
}

// Plugin 监听钩子示例
class MyBuildPlugin {
  apply(compiler) {
    // 编译开始前
    compiler.hooks.compile.tap('MyPlugin', () => {
      console.log('开始编译...');
    });

    // 构建模块时
    compiler.hooks.make.tapAsync('MyPlugin', (compilation, callback) => {
      console.log('正在构建模块...');
      callback();
    });

    // 生成资源前
    compiler.hooks.emit.tapAsync('MyPlugin', (compilation, callback) => {
      console.log('即将输出文件...');
      // 可以修改输出内容
      callback();
    });

    // 构建完成
    compiler.hooks.done.tap('MyPlugin', stats => {
      console.log('构建完成!');
    });
  }
}
```

#### 模块解析过程

```javascript
// 依赖解析示例
class ModuleParser {
  parse(source) {
    // 1. 解析为 AST
    const ast = babylon.parse(source, {
      sourceType: 'module',
      plugins: ['dynamicImport']
    });

    const dependencies = [];

    // 2. 遍历 AST 节点
    traverse(ast, {
      // 处理 import
      ImportDeclaration(path) {
        dependencies.push({
          type: 'import',
          module: path.node.source.value
        });
      },

      // 处理 require
      CallExpression(path) {
        if (path.node.callee.name === 'require') {
          dependencies.push({
            type: 'require',
            module: path.node.arguments[0].value
          });
        }
      },

      // 处理动态导入
      Import(path) {
        dependencies.push({
          type: 'dynamic-import',
          module: path.parent.arguments[0].value,
          chunk: 'async'
        });
      }
    });

    // 3. 转换代码
    const { code } = babel.transformFromAstSync(ast, source, {
      presets: ['@babel/preset-env']
    });

    return { code, dependencies };
  }
}
```

**面试口语化回答模板**：

"Webpack 的构建流程可以分为五个主要阶段：

首先是**初始化阶段**，Webpack 会读取配置文件和命令行参数，合并配置后创建 Compiler 对象，并加载所有插件。

然后进入**编译阶段**，从 entry 入口文件开始，Webpack 会读取文件内容并调用匹配的 Loader 进行转换。

接着是**构建模块阶段**，Webpack 会解析转换后的代码生成 AST，从中提取出所有依赖关系，然后递归处理每个依赖模块，重复调用 Loader 转换的过程。

然后是**封装阶段**，Webpack 会根据入口和代码分割规则，把相关的模块组合成 chunk，并进行优化处理，比如 Tree Shaking、代码压缩等。

最后是**输出阶段**，Webpack 会根据 output 配置，把每个 chunk 转换成单独的文件写入文件系统。

整个过程中，Plugin 可以通过监听不同的钩子来介入构建流程，实现各种功能扩展。我在实际项目中就自己写过 Plugin，在 emit 阶段修改输出内容，添加版本信息。"

---
:::

::: details 2. Loader 和 Plugin 的区别？
**一句话答案**：
Loader 负责转换文件内容，Plugin 负责扩展 Webpack 功能，Loader 是函数，Plugin 是类。

**详细解答**：

#### Loader 详解

```javascript
// 1. Loader 的本质：函数
// Loader 接收源代码，返回转换后的代码

// 简单 Loader 示例
module.exports = function(source) {
  // source: 文件的原始内容
  // this: Loader 的上下文，包含很多有用的方法

  // 进行转换
  const result = source.replace(/console\.log/g, '');

  // 返回转换后的内容
  return result;
};

// 2. 带参数的 Loader
module.exports = function(source) {
  // 获取 Loader 的配置选项
  const options = this.getOptions();

  // 使用配置进行转换
  if (options.removeLog) {
    source = source.replace(/console\.log/g, '');
  }

  return source;
};

// 3. 异步 Loader
module.exports = function(source) {
  // 告诉 Webpack 这是异步 Loader
  const callback = this.async();

  // 异步处理
  setTimeout(() => {
    const result = transform(source);

    // 异步返回结果
    // callback(error, content, sourceMap, meta)
    callback(null, result);
  }, 1000);
};

// 4. Raw Loader (处理二进制)
module.exports = function(source) {
  // source 是 Buffer
  console.log(source instanceof Buffer); // true

  return source;
};
module.exports.raw = true; // 标记为 raw loader

// 5. Pitch Loader (提前执行)
module.exports = function(source) {
  return source;
};

module.exports.pitch = function(remainingRequest, precedingRequest, data) {
  // pitch 从左到右执行
  // 可以提前返回，跳过后续 loader
  console.log('pitch 阶段');

  // 如果返回值，后续 loader 会被跳过
  // return 'module.exports = "直接返回结果"';
};

// 6. 实战：Markdown Loader
const marked = require('marked');

module.exports = function(source) {
  const html = marked(source);

  // 返回 JS 模块
  return `module.exports = ${JSON.stringify(html)}`;
};

// webpack.config.js 中使用
module.exports = {
  module: {
    rules: [
      {
        test: /\.md$/,
        use: [
          'html-loader',
          './loaders/markdown-loader'
        ]
      }
    ]
  }
};
```

#### Plugin 详解

```javascript
// 1. Plugin 的本质：类
// Plugin 必须有 apply 方法

class MyPlugin {
  constructor(options) {
    // 接收配置参数
    this.options = options;
  }

  apply(compiler) {
    // compiler: Webpack 实例
    // 包含整个构建流程的钩子

    console.log('MyPlugin 被应用');
  }
}

// 2. 监听生命周期钩子
class BuildInfoPlugin {
  apply(compiler) {
    // 同步钩子：使用 tap
    compiler.hooks.compile.tap('BuildInfoPlugin', () => {
      console.log('开始编译');
    });

    // 异步钩子：使用 tapAsync
    compiler.hooks.emit.tapAsync('BuildInfoPlugin', (compilation, callback) => {
      console.log('准备输出文件');

      // 访问编译结果
      console.log('输出文件:', Object.keys(compilation.assets));

      // 必须调用 callback
      callback();
    });

    // Promise 钩子：使用 tapPromise
    compiler.hooks.afterEmit.tapPromise('BuildInfoPlugin', (compilation) => {
      return new Promise((resolve) => {
        console.log('文件已输出');
        resolve();
      });
    });
  }
}

// 3. 修改输出内容
class AddVersionPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('AddVersionPlugin', (compilation, callback) => {
      // compilation.assets 包含所有要输出的文件

      // 添加版本信息文件
      const version = `Build Time: ${new Date().toISOString()}`;

      compilation.assets['version.txt'] = {
        source: () => version,
        size: () => version.length
      };

      callback();
    });
  }
}

// 4. 访问和修改模块
class AnalyzeModulesPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('AnalyzeModulesPlugin', (compilation) => {
      // 在模块优化阶段
      compilation.hooks.optimizeModules.tap('AnalyzeModulesPlugin', (modules) => {
        console.log(`共有 ${modules.size} 个模块`);

        // 遍历所有模块
        for (const module of modules) {
          console.log('模块路径:', module.resource);
          console.log('模块大小:', module.size());
        }
      });
    });
  }
}

// 5. 实战：清理注释 Plugin
class RemoveCommentsPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('RemoveCommentsPlugin', (compilation, callback) => {
      // 遍历所有输出文件
      for (const filename in compilation.assets) {
        if (filename.endsWith('.js')) {
          const asset = compilation.assets[filename];
          const content = asset.source();

          // 移除注释
          const newContent = content
            .replace(/\/\*[\s\S]*?\*\//g, '') // 块注释
            .replace(/\/\/.*/g, ''); // 行注释

          // 更新资源
          compilation.assets[filename] = {
            source: () => newContent,
            size: () => newContent.length
          };
        }
      }

      callback();
    });
  }
}

// 6. 实战：文件大小限制 Plugin
class FileSizeLimitPlugin {
  constructor(options) {
    this.maxSize = options.maxSize || 250 * 1024; // 默认 250KB
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap('FileSizeLimitPlugin', (compilation) => {
      const errors = [];

      for (const filename in compilation.assets) {
        const size = compilation.assets[filename].size();

        if (size > this.maxSize) {
          errors.push(
            `文件 ${filename} 大小为 ${(size / 1024).toFixed(2)}KB，` +
            `超过限制 ${(this.maxSize / 1024).toFixed(2)}KB`
          );
        }
      }

      if (errors.length > 0) {
        compilation.warnings.push(...errors);
      }
    });
  }
}

// webpack.config.js 中使用
module.exports = {
  plugins: [
    new MyPlugin({ option: 'value' }),
    new BuildInfoPlugin(),
    new FileSizeLimitPlugin({ maxSize: 200 * 1024 })
  ]
};
```

#### Loader vs Plugin 对比

```javascript
// 对比表格
/*
┌─────────────┬──────────────────┬────────────────────┐
│   特性      │     Loader       │      Plugin        │
├─────────────┼──────────────────┼────────────────────┤
│ 作用        │ 转换文件内容      │ 扩展 Webpack 功能   │
│ 本质        │ 函数             │ 类（带 apply 方法） │
│ 作用时机    │ 加载模块时        │ 整个构建流程        │
│ 输入输出    │ 接收源码，返回新码 │ 访问 compilation   │
│ 职责        │ 单一职责          │ 功能强大           │
│ 执行顺序    │ 从右到左，链式     │ 按插件数组顺序      │
│ 使用方式    │ module.rules     │ plugins 数组       │
└─────────────┴──────────────────┴────────────────────┘
*/

// Loader 使用场景
const loaderExamples = {
  // 1. 转换语言
  typescript: 'ts-loader',
  sass: 'sass-loader',

  // 2. 处理资源
  images: 'url-loader',
  fonts: 'file-loader',

  // 3. 代码转换
  es6: 'babel-loader',
  css: 'css-loader',

  // 4. 代码检查
  eslint: 'eslint-loader'
};

// Plugin 使用场景
const pluginExamples = {
  // 1. 生成文件
  html: 'HtmlWebpackPlugin',
  copy: 'CopyWebpackPlugin',

  // 2. 代码优化
  uglify: 'TerserPlugin',
  extract: 'MiniCssExtractPlugin',

  // 3. 环境变量
  define: 'DefinePlugin',

  // 4. 构建分析
  bundle: 'BundleAnalyzerPlugin',

  // 5. 功能增强
  hmr: 'HotModuleReplacementPlugin'
};
```

#### 执行顺序演示

```javascript
// Loader 执行顺序：从右到左，从下到上
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',  // 3. 最后执行：注入到 DOM
          'css-loader',    // 2. 其次执行：解析 CSS
          'postcss-loader' // 1. 首先执行：处理 CSS
        ]
      }
    ]
  }
};

// 执行流程：
// source.css
//   → postcss-loader (添加浏览器前缀)
//   → css-loader (解析 @import 和 url())
//   → style-loader (生成 JS 代码注入 <style>)
//   → bundle.js

// Plugin 执行顺序：按数组顺序
module.exports = {
  plugins: [
    new CleanWebpackPlugin(),        // 1. 先清理
    new HtmlWebpackPlugin(),         // 2. 生成 HTML
    new MiniCssExtractPlugin(),      // 3. 提取 CSS
    new OptimizeCssAssetsPlugin()    // 4. 优化 CSS
  ]
};
```

**面试口语化回答模板**：

"Loader 和 Plugin 是 Webpack 中两个非常重要但完全不同的概念。

从**本质**上来说，Loader 就是一个函数，它接收源代码作为参数，返回转换后的代码；而 Plugin 是一个类，必须实现 apply 方法，可以监听 Webpack 构建过程中的各种钩子。

从**作用**上来说，Loader 专注于转换文件内容，比如把 TypeScript 转成 JavaScript，把 Sass 转成 CSS；而 Plugin 可以做更复杂的事情，比如生成 HTML 文件、压缩代码、定义环境变量等。

从**时机**上来说，Loader 只在加载模块时执行，而 Plugin 可以在整个构建流程的任何阶段工作，通过监听不同的钩子来实现功能。

从**执行顺序**来说，Loader 是从右到左、从下到上链式调用的，而 Plugin 是按照在配置数组中的顺序依次执行。

举个例子，处理 CSS 时，我们用 sass-loader、css-loader、style-loader 这三个 Loader 链式转换；同时用 MiniCssExtractPlugin 这个 Plugin 把 CSS 提取成单独的文件。Loader 负责转换，Plugin 负责提取。

我在项目中还自己写过 Loader 来处理特殊格式的文件，也写过 Plugin 来生成构建信息文件。"

---
:::

::: details 3. 如何优化 Webpack 构建速度？
**一句话答案**：
缩小构建范围、使用缓存、多进程打包、合理配置 resolve，开发环境减少生产优化。

**详细解答**：

#### 1. 缩小构建范围

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        // 优化1: 明确 Loader 作用范围
        include: path.resolve(__dirname, 'src'), // 只处理 src 目录
        exclude: /node_modules/,                 // 排除 node_modules
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        // 优化2: 排除不需要处理的文件
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader']
      }
    ],

    // 优化3: 不解析的库
    noParse: /jquery|lodash/,  // 这些库没有依赖，不需要解析
  },

  resolve: {
    // 优化4: 减少文件搜索范围
    modules: [
      path.resolve(__dirname, 'src'),  // 优先搜索 src
      'node_modules'                   // 再搜索 node_modules
    ],

    // 优化5: 减少后缀尝试
    extensions: ['.js', '.jsx', '.json'],  // 只保留必要的后缀
    // 不要写: ['.js', '.jsx', '.ts', '.tsx', '.json', '.vue', ...]

    // 优化6: 设置别名
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'components': path.resolve(__dirname, 'src/components'),
      // 直接指向库的压缩版本
      'react': path.resolve(__dirname, 'node_modules/react/cjs/react.production.min.js')
    },

    // 优化7: 只解析必要的字段
    mainFields: ['main'],  // 只使用 package.json 的 main 字段
  }
};
```

#### 2. 使用缓存

```javascript
module.exports = {
  // 优化1: Webpack 5 持久化缓存（最重要！）
  cache: {
    type: 'filesystem',  // 使用文件系统缓存
    cacheDirectory: path.resolve(__dirname, '.temp_cache'),
    buildDependencies: {
      config: [__filename],  // 配置文件改变时，缓存失效
    },
    // 缓存命中率可达 90%+，速度提升 5-10 倍
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            // 优化2: Babel 缓存
            cacheDirectory: true,        // 开启缓存
            cacheCompression: false,     // 不压缩缓存（更快）
          }
        }
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            // 优化3: TypeScript 缓存
            transpileOnly: true,  // 只转译，不做类型检查（快很多）
          }
        }
      }
    ]
  },

  plugins: [
    // 优化4: 使用 fork-ts-checker-webpack-plugin 异步类型检查
    new ForkTsCheckerWebpackPlugin({
      async: true,  // 异步检查，不阻塞编译
    }),
  ]
};

// 缓存效果对比
/*
首次构建:  20s
有缓存:    2s    ← 提升 10 倍！
*/
```

#### 3. 多进程/多线程打包

```javascript
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          // 优化1: thread-loader 多线程打包
          {
            loader: 'thread-loader',
            options: {
              workers: 4,  // 开启 4 个工作进程
              workerParallelJobs: 50,
              poolTimeout: 2000,
            }
          },
          'babel-loader'
        ]
      }
    ]
  },

  optimization: {
    minimizer: [
      // 优化2: 多进程压缩
      new TerserPlugin({
        parallel: true,  // 开启多进程压缩
        terserOptions: {
          compress: {
            drop_console: true,
          }
        }
      })
    ]
  }
};

// 注意事项:
// 1. thread-loader 有启动开销，只在大项目中使用
// 2. 小项目反而会变慢
// 3. 一般项目超过 1000 个模块才考虑使用

// 效果对比（1000+ 模块的项目）
/*
单线程:    15s
4 线程:    8s     ← 提升近 2 倍
*/
```

#### 4. 开发环境优化

```javascript
// webpack.dev.js
module.exports = {
  mode: 'development',

  // 优化1: 使用更快的 source-map
  devtool: 'eval-cheap-module-source-map',
  // 不要用: 'source-map' (最慢)
  // 推荐用: 'eval-cheap-module-source-map' (快很多)

  // 优化2: 关闭生产环境的优化
  optimization: {
    minimize: false,           // 不压缩
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,        // 不分割代码
  },

  // 优化3: 减少不必要的插件
  plugins: [
    // 开发环境不需要:
    // ❌ MiniCssExtractPlugin (用 style-loader)
    // ❌ OptimizeCssAssetsPlugin
    // ❌ CompressionPlugin
    // ❌ BundleAnalyzerPlugin
  ],

  // 优化4: 模块热替换
  devServer: {
    hot: true,  // HMR 只更新修改的模块
  }
};

// 速度对比
/*
开发环境（优化前）: 10s
开发环境（优化后）: 3s   ← 提升 3 倍
*/
```

#### 5. 动态链接库（已过时，但了解原理）

```javascript
// 现代方案: externals (更简单)
module.exports = {
  externals: {
    // 不打包这些库，从 CDN 引入
    'react': 'React',
    'react-dom': 'ReactDOM',
    'lodash': '_',
  }
};

// 在 HTML 中引入 CDN
/*
<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>
*/

// 效果: 减少 30-50% 的构建时间
```

#### 6. 其他优化技巧

```javascript
module.exports = {
  // 优化1: 减少 resolve 尝试
  resolve: {
    symlinks: false,  // 不解析符号链接
  },

  // 优化2: 忽略 moment.js 的语言包
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
  ],

  // 优化3: 输出性能提示
  performance: {
    hints: false,  // 关闭性能提示（开发环境）
  },

  // 优化4: 统计信息配置
  stats: {
    modules: false,    // 不显示模块信息
    children: false,   // 不显示子模块
  },
};

// 优化5: 升级到 Webpack 5
// Webpack 5 相比 4 提升 20-30%

// 优化6: 升级 Node.js
// Node 18 比 Node 14 快 10-15%
```

#### 完整优化配置示例

```javascript
// webpack.config.js (生产环境)
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',

  // 1. 缓存优化
  cache: {
    type: 'filesystem',
  },

  // 2. 范围优化
  module: {
    noParse: /jquery|lodash/,
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: [
          {
            loader: 'thread-loader',
            options: { workers: 4 }
          },
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              cacheCompression: false,
            }
          }
        ]
      }
    ]
  },

  // 3. resolve 优化
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    symlinks: false,
  },

  // 4. 多进程压缩
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
      })
    ]
  },

  // 5. 统计优化
  stats: 'errors-warnings',
};

// 优化效果汇总
/*
┌─────────────────────┬────────┬────────┬─────────┐
│   优化措施          │ 优化前 │ 优化后 │ 提升    │
├─────────────────────┼────────┼────────┼─────────┤
│ 持久化缓存          │  20s   │  2s    │ 10x     │
│ thread-loader       │  15s   │  8s    │ 1.8x    │
│ 缩小构建范围        │  12s   │  9s    │ 1.3x    │
│ 开发环境配置        │  10s   │  3s    │ 3.3x    │
│ externals           │  8s    │  5s    │ 1.6x    │
│ 升级 Webpack 5      │  10s   │  7s    │ 1.4x    │
└─────────────────────┴────────┴────────┴─────────┘

综合优化后: 首次构建 8s，二次构建 2s
*/
```

#### 分析构建速度

```javascript
// 1. 使用 speed-measure-webpack-plugin
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap({
  // webpack 配置
});

// 输出示例:
/*
SMP  ⏱
General output time took 8.5 secs

 SMP  ⏱  Plugins
TerserPlugin took 3.2 secs
MiniCssExtractPlugin took 1.5 secs

 SMP  ⏱  Loaders
babel-loader took 2.8 secs
  module count = 245
css-loader took 1.2 secs
  module count = 38
*/

// 2. 使用 Webpack 内置分析
webpack --profile --json > stats.json

// 3. 在线分析工具
// 上传 stats.json 到: https://webpack.github.io/analyse/
```

**面试口语化回答模板**：

"优化 Webpack 构建速度，我总结了几个最有效的方法：

首先也是最重要的，就是**使用缓存**。Webpack 5 的持久化缓存非常强大，只需要配置 `cache: { type: 'filesystem' }`，二次构建速度能提升 5-10 倍。同时给 babel-loader 开启 cacheDirectory，也能显著提升速度。

第二是**缩小构建范围**。用 include 限定 Loader 只处理 src 目录，用 exclude 排除 node_modules；配置 noParse 让 Webpack 不解析那些没有依赖的库，比如 jQuery；还要优化 resolve 配置，减少文件搜索范围和后缀尝试次数。

第三是**多进程打包**。对于大项目，可以用 thread-loader 开启多线程转译，用 TerserPlugin 的 parallel 选项开启多进程压缩，能提升 50% 以上的速度。

第四是**区分开发和生产环境**。开发环境不需要压缩、不需要提取 CSS、用更快的 source-map，这样能提升 2-3 倍速度。

第五是合理使用 **externals**，把 React、Lodash 这些大库通过 CDN 引入，不参与打包，能减少 30-50% 的构建时间。

最后，升级到 Webpack 5 和最新的 Node.js 版本也能带来 20-30% 的提升。

我在实际项目中，通过这些优化，把构建时间从 30 秒降到了 5 秒，二次构建只需要 2 秒。最关键的就是持久化缓存和缩小构建范围这两个。"

---
:::

::: details 4. Tree Shaking 原理是什么？
**一句话答案**：
基于 ES6 模块的静态结构分析，标记未使用的导出，在压缩阶段删除死代码。

**详细解答**：

#### Tree Shaking 基本原理

```javascript
// Tree Shaking 的三个关键条件:
// 1. 使用 ES6 Module (import/export)
// 2. mode: 'production' 或 optimization.usedExports: true
// 3. 没有副作用 (sideEffects)

// 示例: utils.js
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export function multiply(a, b) {
  return a * b;
}

export function divide(a, b) {
  return a / b;
}

// main.js
import { add, subtract } from './utils.js';

console.log(add(1, 2));
console.log(subtract(5, 3));

// 打包结果: multiply 和 divide 会被删除（Tree Shaking）

// 为什么 CommonJS 不行？
// CommonJS 是动态的:
const utils = require('./utils');
const funcName = Math.random() > 0.5 ? 'add' : 'subtract';
utils[funcName](1, 2);  // 无法静态分析！

// ES6 Module 是静态的:
import { add } from './utils';  // 编译时就确定了
```

#### 工作流程详解

```javascript
// 1. 标记阶段 (Mark)
// Webpack 分析代码，标记每个导出是否被使用

// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,  // 开启标记未使用的导出
  }
};

// 编译后的中间产物 (简化版):
/*
// utils.js
export const add = (a, b) => a + b;          // ← 被使用 ✓
export const subtract = (a, b) => a - b;     // ← 被使用 ✓
export const multiply = (a, b) => a * b;     // ← 未使用 ✗
export const divide = (a, b) => a / b;       // ← 未使用 ✗
*/

// 2. 删除阶段 (Sweep)
// 压缩器 (Terser) 删除未使用的代码

module.exports = {
  optimization: {
    minimize: true,  // 开启代码压缩
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            unused: true,       // 删除未使用的代码
            dead_code: true,    // 删除死代码
          }
        }
      })
    ]
  }
};

// 最终输出 (只保留使用的函数):
/*
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
console.log(add(1, 2));
console.log(subtract(5, 3));
*/
```

#### sideEffects 副作用

```javascript
// package.json
{
  "name": "my-library",
  "sideEffects": false  // 声明所有文件都没有副作用
}

// 什么是副作用？
// 副作用 = 除了导出内容外，还会执行其他操作

// 有副作用的代码示例:

// polyfill.js (有副作用)
Array.prototype.myMethod = function() {  // 修改全局对象
  console.log('custom method');
};
export const version = '1.0.0';

// styles.js (有副作用)
import './global.css';  // 导入 CSS
export const theme = 'dark';

// analytics.js (有副作用)
window.analytics.track('page_view');  // 执行追踪
export const userId = '123';

// 如果这些文件被标记为 sideEffects: false
// 即使导入了，但不使用导出，整个文件会被删除！

// 正确配置:
{
  "sideEffects": [
    "*.css",           // CSS 文件有副作用
    "*.scss",
    "./src/polyfill.js",  // 特定文件有副作用
    "./src/analytics.js"
  ]
}

// 实际案例:
// main.js
import { Button } from './components';  // 只导入 Button
import './styles/global.css';          // 导入全局样式

// components/index.js
export { Button } from './Button';      // 被使用 ✓
export { Modal } from './Modal';        // 未使用 ✗
export { Tooltip } from './Tooltip';    // 未使用 ✗

// 如果 sideEffects: false
// Modal.js 和 Tooltip.js 会被完全删除

// 如果 sideEffects: ["*.css"]
// global.css 会保留，但 Modal 和 Tooltip 的 JS 会被删除
```

#### 实战案例

```javascript
// 案例1: Lodash 的 Tree Shaking

// ❌ 错误: 会打包整个 lodash (70KB+)
import _ from 'lodash';
_.debounce(fn, 300);

// ✅ 正确: 只打包 debounce (几 KB)
import debounce from 'lodash-es/debounce';
debounce(fn, 300);

// 或者使用 babel-plugin-lodash
// .babelrc
{
  "plugins": ["lodash"]
}
// 代码
import { debounce } from 'lodash';  // 自动转换为按需引入

// 案例2: UI 组件库的 Tree Shaking

// antd 配置
// babel.config.js
module.exports = {
  plugins: [
    [
      'import',
      {
        libraryName: 'antd',
        style: true,  // 自动导入样式
      }
    ]
  ]
};

// 使用
import { Button, Modal } from 'antd';  // 只打包 Button 和 Modal

// 案例3: 自己的工具库

// utils/index.js
export { default as formatDate } from './formatDate';
export { default as formatMoney } from './formatMoney';
export { default as debounce } from './debounce';
export { default as throttle } from './throttle';
// ... 100 个工具函数

// package.json
{
  "sideEffects": false  // 声明无副作用，支持 Tree Shaking
}

// 使用
import { formatDate, debounce } from '@/utils';  // 只打包这两个
```

#### 常见陷阱

```javascript
// 陷阱1: Babel 转换破坏 Tree Shaking

// .babelrc (错误配置)
{
  "presets": [
    ["@babel/preset-env", {
      "modules": "commonjs"  // ❌ 转成 CommonJS，Tree Shaking 失效
    }]
  ]
}

// .babelrc (正确配置)
{
  "presets": [
    ["@babel/preset-env", {
      "modules": false  // ✅ 保留 ES6 模块
    }]
  ]
}

// 陷阱2: 类的方法 Tree Shaking

// MyClass.js
export class MyClass {
  method1() {}  // 使用了
  method2() {}  // 没使用
  method3() {}  // 没使用
}

// main.js
import { MyClass } from './MyClass';
const obj = new MyClass();
obj.method1();

// 结果: method2 和 method3 无法被 Tree Shaking！
// 原因: 类是一个整体，无法拆分

// 解决方案: 使用独立函数
export function method1() {}
export function method2() {}
export function method3() {}

// 陷阱3: 重导出

// index.js (错误)
export * from './utils';  // ❌ 导出所有，Tree Shaking 失效

// index.js (正确)
export { add, subtract } from './utils';  // ✅ 明确导出

// 陷阱4: 开发环境看不到效果

// 开发环境 (mode: 'development')
// Tree Shaking 不生效，因为需要保留代码方便调试

// 只有生产环境 (mode: 'production') 才会真正删除代码
```

#### 验证 Tree Shaking

```javascript
// 1. 查看编译产物
webpack --mode production

// 2. 使用 webpack-bundle-analyzer
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
};

// 3. 查看统计信息
webpack --mode production --json > stats.json

// 4. 测试用例
// before-tree-shaking.js
import * as utils from './utils';  // 500KB

// after-tree-shaking.js
import { add } from './utils';     // 50KB

// 对比打包结果
/*
Before Tree Shaking:  bundle.js → 500KB
After Tree Shaking:   bundle.js → 50KB
减少 90%! ✅
*/
```

#### 完整配置示例

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',

  optimization: {
    // Tree Shaking 相关配置
    usedExports: true,    // 标记未使用的导出
    minimize: true,       // 启用代码压缩

    // 只导出被使用的部分
    providedExports: true,

    // 识别 package.json 的 sideEffects
    sideEffects: true,
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                modules: false,  // ✅ 保留 ES6 模块
              }]
            ]
          }
        }
      }
    ]
  }
};

// package.json
{
  "name": "my-app",
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}
```

**面试口语化回答模板**：

"Tree Shaking 就是摇树优化，把没用的代码像枯叶一样摇掉。它的原理基于 ES6 模块的静态结构。

具体来说，Tree Shaking 分为两个阶段：

首先是**标记阶段**，Webpack 会分析代码的导入导出关系，因为 ES6 模块是静态的，编译时就能确定哪些导出被使用了，哪些没被使用。这个过程通过配置 `usedExports: true` 来开启。

然后是**删除阶段**，在代码压缩时，Terser 会把那些标记为未使用的代码删除掉。这就是为什么 Tree Shaking 需要在生产环境才能看到效果。

但 Tree Shaking 有个关键概念叫**副作用**。如果一个模块除了导出内容，还会修改全局变量、导入 CSS、执行追踪代码等，这就是有副作用。我们需要在 package.json 中配置 `sideEffects` 字段，告诉 Webpack 哪些文件有副作用不能删除。

Tree Shaking 有几个注意点：一是必须用 ES6 模块，CommonJS 不行因为是动态的；二是 Babel 配置要保留 ES6 模块格式；三是类的方法无法 Tree Shaking，最好用独立函数。

我在项目中用 Tree Shaking 优化过 Lodash 的引入，从 70KB 降到了几 KB。还有 UI 组件库，配合 babel-plugin-import 实现按需引入。"

---
:::

::: details 5. Webpack 热更新（HMR）原理？
**一句话答案**：
通过 WebSocket 推送更新模块，浏览器接收后动态替换模块，无需刷新页面。

**详细解答**：

#### HMR 基本概念

```javascript
// webpack.config.js
module.exports = {
  devServer: {
    hot: true,  // 开启热更新
    port: 3000,
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin()  // Webpack 5 不需要手动添加
  ]
};

// 热更新 vs 自动刷新
/*
┌──────────────────┬────────────┬──────────────┐
│                  │  自动刷新  │   热更新     │
├──────────────────┼────────────┼──────────────┤
│ 保留页面状态     │     ✗      │      ✓       │
│ 更新速度         │    慢      │     快       │
│ 体验             │    差      │     好       │
│ 实现复杂度       │    简单    │    复杂      │
└──────────────────┴────────────┴──────────────┘
*/

// 示例: 表单填写场景
// 自动刷新: 修改代码 → 刷新页面 → 表单数据丢失 ❌
// 热更新:   修改代码 → 更新模块 → 表单数据保留 ✓
```

#### HMR 完整流程

```javascript
// ========== 第一阶段: 启动服务器 ==========

// 1. Webpack Compiler 监听文件变化
const compiler = webpack(config);
compiler.watch({}, (err, stats) => {
  console.log('文件发生变化，重新编译...');
});

// 2. Webpack Dev Server 启动 HTTP 服务器
const server = new WebpackDevServer(compiler, {
  hot: true,
  port: 3000
});

// 3. 建立 WebSocket 连接
// 浏览器 ←→ WebSocket ←→ Dev Server
const ws = new WebSocket('ws://localhost:3000/ws');

// ========== 第二阶段: 文件修改 ==========

// 4. 监听到文件变化
// fs.watch → 触发重新编译

// 5. Webpack 重新编译
// 生成新的模块代码 + manifest (更新描述文件)

const update = {
  hash: 'abc123',           // 新的编译哈希
  modules: {
    './src/App.js': {       // 更新的模块
      id: './src/App.js',
      code: '/* 新代码 */'
    }
  }
};

// ========== 第三阶段: 推送更新 ==========

// 6. Dev Server 通过 WebSocket 推送消息
ws.send(JSON.stringify({
  type: 'hash',
  data: 'abc123'
}));

ws.send(JSON.stringify({
  type: 'ok'  // 编译成功，可以更新
}));

// ========== 第四阶段: 浏览器接收更新 ==========

// 7. 浏览器接收 WebSocket 消息
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === 'hash') {
    currentHash = message.data;
  }

  if (message.type === 'ok') {
    // 开始热更新
    hotEmitter.emit('webpackHotUpdate', currentHash);
  }
};

// 8. 浏览器发起 AJAX 请求获取更新
// GET /abc123.hot-update.json
// 返回: { "c": ["main"], "modules": [...] }

fetch(`/${currentHash}.hot-update.json`)
  .then(res => res.json())
  .then(update => {
    // 获取到需要更新的模块列表
    return Promise.all(
      update.c.map(chunkId =>
        // GET /main.abc123.hot-update.js
        fetch(`/${chunkId}.${currentHash}.hot-update.js`)
      )
    );
  });

// ========== 第五阶段: 执行更新 ==========

// 9. 加载新模块代码
// 通过 JSONP 或动态 script 标签
const script = document.createElement('script');
script.src = `/main.${currentHash}.hot-update.js`;
document.head.appendChild(script);

// 10. 新模块代码执行
// hot-update.js 内容:
webpackHotUpdate("main", {
  "./src/App.js": function(module, exports, __webpack_require__) {
    // 新的模块代码
    module.exports = function App() {
      return '<div>Updated App</div>';
    };
  }
});

// 11. 替换旧模块
// HMR Runtime 处理
module.hot.apply({
  './src/App.js': newModule  // 用新模块替换旧模块
});

// 12. 调用模块的 accept 回调
if (module.hot) {
  module.hot.accept('./App.js', function() {
    // 重新渲染
    render(<App />);
  });
}
```

#### HMR Runtime API

```javascript
// 1. module.hot.accept - 接受更新

// 接受自身更新
if (module.hot) {
  module.hot.accept(err => {
    if (err) {
      console.error('HMR 更新失败', err);
    }
  });
}

// 接受依赖更新
if (module.hot) {
  module.hot.accept('./utils.js', function() {
    // utils.js 更新后的回调
    console.log('utils.js 已更新');
  });
}

// 接受多个依赖
if (module.hot) {
  module.hot.accept(
    ['./moduleA.js', './moduleB.js'],
    function() {
      // 依赖更新后的处理
    }
  );
}

// 2. module.hot.decline - 拒绝更新
if (module.hot) {
  module.hot.decline('./legacy.js');
  // legacy.js 更新时，会触发整页刷新
}

// 3. module.hot.dispose - 清理副作用
if (module.hot) {
  module.hot.dispose(data => {
    // 模块被替换前的清理工作
    clearInterval(timer);
    removeEventListener('click', handler);

    // 保存状态供新模块使用
    data.count = currentCount;
  });
}

// 4. module.hot.data - 获取旧模块数据
if (module.hot && module.hot.data) {
  // 恢复状态
  currentCount = module.hot.data.count;
}

// 5. module.hot.status - 获取 HMR 状态
console.log(module.hot.status());
// 'idle' | 'check' | 'prepare' | 'ready' | 'dispose' | 'apply'
```

#### 实战案例

```javascript
// 案例1: React 组件热更新

// App.js
import React from 'react';

function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}

export default App;

// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

function render() {
  ReactDOM.render(<App />, document.getElementById('root'));
}

render();

// React Hot Loader 配置
if (module.hot) {
  module.hot.accept('./App', () => {
    // 重新导入并渲染
    render();
  });
}

// 效果: 修改 App.js 后
// ✓ 组件立即更新
// ✓ count 状态保留
// ✓ 不刷新页面

// 案例2: CSS 热更新

// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',  // style-loader 内置 HMR 支持
          'css-loader'
        ]
      }
    ]
  }
};

// 效果: 修改 CSS 后
// ✓ 样式立即更新
// ✓ 无需刷新
// ✓ 自动注入新样式

// 案例3: Vue 单文件组件热更新

// Counter.vue
<template>
  <div>{{ count }}</div>
</template>

<script>
export default {
  data() {
    return { count: 0 };
  }
};
</script>

// vue-loader 自动处理 HMR
// 修改 template → 重新渲染，保留状态
// 修改 script → 重新挂载，状态重置
// 修改 style → 更新样式

// 案例4: 状态管理热更新

// store.js (Redux)
const initialState = { count: 0 };

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    default:
      return state;
  }
}

export default createStore(reducer);

// index.js
import store from './store';

if (module.hot) {
  module.hot.accept('./store', () => {
    const newStore = require('./store').default;
    // 替换 reducer，保留 state
    store.replaceReducer(newStore.reducer);
  });
}
```

#### HMR 流程图

```javascript
// 文字描述完整流程:

/*
┌─────────────┐
│ 1. 修改文件 │
└──────┬──────┘
       │
       v
┌─────────────────┐
│ 2. Webpack 监听 │
│    到文件变化   │
└──────┬──────────┘
       │
       v
┌─────────────────┐
│ 3. 重新编译     │
│    生成 update  │
└──────┬──────────┘
       │
       v
┌──────────────────┐
│ 4. WebSocket 推送│
│    hash + ok     │
└──────┬───────────┘
       │
       v
┌─────────────────────┐
│ 5. 浏览器请求       │
│    hot-update.json  │
│    hot-update.js    │
└──────┬──────────────┘
       │
       v
┌──────────────────┐
│ 6. 下载新模块    │
└──────┬───────────┘
       │
       v
┌──────────────────┐
│ 7. HMR Runtime   │
│    替换旧模块    │
└──────┬───────────┘
       │
       v
┌──────────────────┐
│ 8. 调用 accept   │
│    回调函数      │
└──────┬───────────┘
       │
       v
┌──────────────────┐
│ 9. 页面更新完成  │
└──────────────────┘
*/
```

#### HMR 失败降级

```javascript
// HMR 失败的情况

// 1. 没有 accept 处理 → 冒泡到父模块
// moduleA.js (没有 accept)
export const a = 1;

// moduleB.js (导入 moduleA)
import { a } from './moduleA';

if (module.hot) {
  module.hot.accept('./moduleA', () => {
    console.log('moduleA 更新了');
  });
}

// 修改 moduleA → moduleB 的 accept 处理

// 2. 冒泡到顶层仍无 accept → 整页刷新
// main.js (入口，没有 accept)
import './app';

// 修改 app.js → 找不到 accept → 刷新页面

// 3. HMR 报错 → 整页刷新
if (module.hot) {
  module.hot.accept('./utils', () => {
    throw new Error('更新失败');  // → 刷新页面
  });
}

// 最佳实践: 在框架层面处理 HMR
// React: react-hot-loader
// Vue: vue-loader
// 业务代码不需要关心 HMR 细节
```

#### 手写简易 HMR

```javascript
// 简化版 HMR 实现

// 1. 服务端
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const WebSocket = require('ws');
const fs = require('fs');

const app = express();
const compiler = webpack(config);

// HTTP 服务器
app.use(webpackDevMiddleware(compiler));

// WebSocket 服务器
const wss = new WebSocket.Server({ port: 8080 });
const clients = [];

wss.on('connection', ws => {
  clients.push(ws);
});

// 监听文件变化
compiler.hooks.done.tap('HMR', stats => {
  const hash = stats.hash;

  // 推送更新消息
  clients.forEach(ws => {
    ws.send(JSON.stringify({ type: 'hash', data: hash }));
    ws.send(JSON.stringify({ type: 'ok' }));
  });
});

app.listen(3000);

// 2. 客户端
const ws = new WebSocket('ws://localhost:8080');
let currentHash = '';

ws.onmessage = event => {
  const message = JSON.parse(event.data);

  if (message.type === 'hash') {
    currentHash = message.data;
  }

  if (message.type === 'ok') {
    // 获取更新
    fetch(`/${currentHash}.hot-update.json`)
      .then(res => res.json())
      .then(update => {
        // 加载新模块
        return fetch(`/main.${currentHash}.hot-update.js`);
      })
      .then(res => res.text())
      .then(code => {
        // 执行新模块
        eval(code);

        // 替换模块
        __webpack_require__.c['./src/App.js'] = newModule;

        // 触发重新渲染
        if (module.hot._acceptedDependencies['./src/App.js']) {
          module.hot._acceptedDependencies['./src/App.js']();
        }
      });
  }
};
```

**面试口语化回答模板**：

"Webpack 的热更新 HMR 是一个非常巧妙的机制，它可以在不刷新页面的情况下更新模块。

整个流程是这样的：

首先，Webpack Compiler 会**监听文件变化**，当我们修改代码时，会触发重新编译，生成新的模块代码和一个更新描述文件。

然后，Webpack Dev Server 通过 **WebSocket** 向浏览器推送两条消息：一个是新的 hash 值，一个是 'ok' 表示编译成功。

浏览器接收到消息后，会发起 **AJAX 请求**，先请求 `hash.hot-update.json` 获取更新的模块列表，再请求 `hash.hot-update.js` 获取新的模块代码。

下载完成后，**HMR Runtime** 会接管，它会替换掉旧的模块，然后调用我们在代码中写的 `module.hot.accept` 回调函数。

最后，在回调函数中，我们可以重新渲染组件或者执行其他更新逻辑，这样就完成了热更新。

关键点是，如果某个模块没有处理 accept，更新会**向上冒泡**到父模块；如果一直冒泡到入口文件都没有处理，就会**降级为整页刷新**。

在实际开发中，React 的 react-hot-loader、Vue 的 vue-loader 都已经帮我们处理好了 HMR，我们的业务代码不需要关心这些细节。CSS 的 style-loader 也内置了 HMR 支持。

HMR 最大的好处就是能保留应用状态，比如表单填写到一半，修改代码后状态不会丢失，开发体验非常好。"

---
:::

## Webpack 5 Module Federation（模块联邦）

::: details 什么是 Module Federation？
```javascript
/**
 * Module Federation 允许多个独立的 Webpack 构建共享代码
 *
 * 使用场景：
 * 1. 微前端架构 - 独立部署的应用共享组件
 * 2. 组件库动态加载 - 远程加载最新版本组件
 * 3. 多项目代码复用 - 无需 npm 发布
 *
 * 核心概念：
 * - Host (主机): 消费远程模块的应用
 * - Remote (远程): 暴露模块给其他应用的应用
 * - Shared (共享): 多个应用共享的依赖
 */
```
:::

::: details 基本配置
```javascript
// ============ Remote 应用配置 (提供模块) ============
// remote-app/webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  output: {
    publicPath: 'http://localhost:3001/',  // 远程地址
  },

  plugins: [
    new ModuleFederationPlugin({
      // 应用名称（全局唯一）
      name: 'remoteApp',

      // 输出文件名
      filename: 'remoteEntry.js',

      // 暴露的模块
      exposes: {
        './Button': './src/components/Button',
        './Header': './src/components/Header',
        './utils': './src/utils/index',
      },

      // 共享依赖
      shared: {
        react: {
          singleton: true,       // 只使用一个版本
          requiredVersion: '^18.0.0',
          eager: false,          // 延迟加载
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.0.0',
        },
      },
    }),
  ],
};

// ============ Host 应用配置 (消费模块) ============
// host-app/webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'hostApp',

      // 引用远程模块
      remotes: {
        // 格式: 别名@远程地址/入口文件
        remoteApp: 'remoteApp@http://localhost:3001/remoteEntry.js',
      },

      // 共享依赖
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
```
:::

::: details 使用远程模块
```javascript
// Host 应用中使用远程组件

// 方式1: 动态导入 (推荐)
const RemoteButton = React.lazy(() => import('remoteApp/Button'));

function App() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <RemoteButton onClick={() => console.log('clicked')}>
        远程按钮
      </RemoteButton>
    </React.Suspense>
  );
}

// 方式2: 静态导入 (需要配置 eager: true)
import Button from 'remoteApp/Button';

// 方式3: 异步加载入口
// bootstrap.js
import('./App').then(({ default: App }) => {
  ReactDOM.render(<App />, document.getElementById('root'));
});

// index.js
import('./bootstrap');  // 异步入口

// 工具函数也可以共享
import { formatDate } from 'remoteApp/utils';
```
:::

::: details 实战：微前端架构
```javascript
// ============ 主应用 (Shell) ============
// shell/webpack.config.js
new ModuleFederationPlugin({
  name: 'shell',
  remotes: {
    app1: 'app1@http://localhost:3001/remoteEntry.js',
    app2: 'app2@http://localhost:3002/remoteEntry.js',
    shared: 'shared@http://localhost:3003/remoteEntry.js',
  },
  shared: ['react', 'react-dom', 'react-router-dom'],
});

// shell/src/App.jsx
const App1 = React.lazy(() => import('app1/App'));
const App2 = React.lazy(() => import('app2/App'));
const SharedHeader = React.lazy(() => import('shared/Header'));

function Shell() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <SharedHeader />
        <Routes>
          <Route path="/app1/*" element={<App1 />} />
          <Route path="/app2/*" element={<App2 />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

// ============ 子应用1 ============
// app1/webpack.config.js
new ModuleFederationPlugin({
  name: 'app1',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/App',
  },
  shared: ['react', 'react-dom', 'react-router-dom'],
});

// ============ 共享组件库 ============
// shared/webpack.config.js
new ModuleFederationPlugin({
  name: 'shared',
  filename: 'remoteEntry.js',
  exposes: {
    './Header': './src/Header',
    './Footer': './src/Footer',
    './Button': './src/Button',
    './Modal': './src/Modal',
  },
  shared: ['react', 'react-dom'],
});
```
:::

::: details 动态远程模块
```javascript
// 动态加载远程模块（运行时确定）
async function loadRemoteModule(scope, module) {
  // 初始化共享作用域
  await __webpack_init_sharing__('default');

  const container = window[scope];

  // 初始化容器
  await container.init(__webpack_share_scopes__.default);

  // 获取模块
  const factory = await container.get(module);

  return factory();
}

// 使用
async function loadButton() {
  const Button = await loadRemoteModule('remoteApp', './Button');
  return Button;
}

// 配置动态远程
// webpack.config.js
new ModuleFederationPlugin({
  name: 'host',
  remotes: {
    // 使用 promise 形式
    dynamicRemote: `promise new Promise(resolve => {
      const remoteUrl = window.remoteConfig?.url || 'http://localhost:3001/remoteEntry.js';
      const script = document.createElement('script');
      script.src = remoteUrl;
      script.onload = () => {
        resolve(window.dynamicRemote);
      };
      document.head.appendChild(script);
    })`,
  },
});
```
:::

::: details Module Federation 最佳实践
```javascript
/**
 * 最佳实践：
 *
 * 1. 版本管理
 *    - 使用 requiredVersion 确保兼容性
 *    - 重要依赖设置 singleton: true
 *
 * 2. 错误处理
 *    - 使用 Suspense + ErrorBoundary
 *    - 设置 fallback 组件
 *
 * 3. 性能优化
 *    - 合理设置 shared，避免重复加载
 *    - 使用 eager: false 延迟加载
 *
 * 4. 开发体验
 *    - 本地开发使用 fallback 模块
 *    - 统一的类型定义
 */

// 错误边界处理
class RemoteErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>远程模块加载失败，请刷新重试</div>;
    }
    return this.props.children;
  }
}

// 使用
<RemoteErrorBoundary>
  <React.Suspense fallback={<Skeleton />}>
    <RemoteComponent />
  </React.Suspense>
</RemoteErrorBoundary>

// TypeScript 类型声明
// remote.d.ts
declare module 'remoteApp/Button' {
  const Button: React.FC<{ onClick?: () => void }>;
  export default Button;
}

declare module 'remoteApp/utils' {
  export function formatDate(date: Date): string;
}
```

---
:::

## 构建工具对比：Webpack vs Vite vs Turbopack

::: details 核心差异
```javascript
/**
 * ┌─────────────┬──────────────────┬──────────────────┬──────────────────┐
 * │    特性     │     Webpack      │      Vite        │    Turbopack     │
 * ├─────────────┼──────────────────┼──────────────────┼──────────────────┤
 * │ 开发模式    │ Bundle (打包)    │ No-Bundle (ESM)  │ 增量编译         │
 * │ 冷启动速度  │ 慢 (10-30s)      │ 快 (1-3s)        │ 极快 (<1s)       │
 * │ HMR 速度    │ 一般 (1-5s)      │ 快 (50-500ms)    │ 极快 (<50ms)     │
 * │ 生产构建    │ 成熟稳定         │ Rollup (快)      │ 开发中           │
 * │ 生态系统    │ 最丰富           │ 快速增长         │ 起步阶段         │
 * │ 配置复杂度  │ 复杂             │ 简单             │ 简单             │
 * │ 浏览器支持  │ IE11+            │ 现代浏览器       │ 现代浏览器       │
 * │ 语言实现    │ JavaScript       │ Go + JavaScript  │ Rust             │
 * └─────────────┴──────────────────┴──────────────────┴──────────────────┘
 */
```
:::

::: details Webpack 特点
```javascript
// Webpack 优势：
// 1. 生态最成熟，插件最丰富
// 2. 配置灵活，可高度定制
// 3. 支持所有模块格式 (ESM, CommonJS, AMD)
// 4. 支持旧版浏览器 (IE11)
// 5. 企业级项目首选

// Webpack 劣势：
// 1. 配置复杂
// 2. 冷启动慢
// 3. 大项目 HMR 慢

// 适用场景
const webpackUseCases = [
  '大型企业项目',
  '需要兼容 IE11',
  '需要复杂的构建定制',
  '已有 Webpack 项目的维护',
  '需要 Module Federation 的微前端',
];
```
:::

::: details Vite 特点
```javascript
// Vite 优势：
// 1. 冷启动极快（利用浏览器原生 ESM）
// 2. HMR 速度极快（只更新修改的模块）
// 3. 开箱即用，配置简单
// 4. 生产构建使用 Rollup

// Vite 劣势：
// 1. 不支持 IE11
// 2. 大型项目首次请求较多
// 3. 插件生态还在发展

// Vite 为什么快？
/*
Webpack 开发模式:
  修改文件 → 重新打包所有模块 → 浏览器刷新
  时间复杂度: O(N)，N 为模块数量

Vite 开发模式:
  修改文件 → 只编译修改的文件 → 浏览器请求 ESM
  时间复杂度: O(1)
*/

// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});

// 适用场景
const viteUseCases = [
  '新项目开发',
  'Vue 3 / React 项目',
  '追求开发体验',
  '不需要 IE 兼容',
  '中小型项目',
];
```
:::

::: details Turbopack 特点
```javascript
// Turbopack 优势：
// 1. Rust 实现，性能极高
// 2. 增量计算，只编译变化的部分
// 3. 函数级 HMR
// 4. Next.js 官方支持

// Turbopack 劣势：
// 1. 仍在开发中，功能不完整
// 2. 目前只能用于 Next.js
// 3. 插件系统不成熟

// 性能对比（官方数据）
/*
冷启动速度：
- Webpack: 10s
- Vite:    3s
- Turbopack: 0.5s (快 20 倍)

HMR 速度（10000 模块项目）：
- Webpack: 1000ms
- Vite:    100ms
- Turbopack: 10ms
*/

// 在 Next.js 中使用 Turbopack
// next dev --turbo

// 适用场景
const turbopackUseCases = [
  'Next.js 13+ 项目',
  '追求极致性能',
  '大型项目开发',
  '愿意尝试新技术',
];
```
:::

::: details 选型建议
```javascript
/**
 * 如何选择构建工具？
 *
 * 选 Webpack:
 * ✓ 需要兼容 IE11
 * ✓ 需要高度定制化配置
 * ✓ 使用 Module Federation
 * ✓ 企业级大型项目
 * ✓ 已有 Webpack 项目
 *
 * 选 Vite:
 * ✓ 新项目
 * ✓ Vue 3 / React 项目
 * ✓ 追求开发体验
 * ✓ 不需要 IE 兼容
 * ✓ 中小型项目
 *
 * 选 Turbopack:
 * ✓ Next.js 项目
 * ✓ 愿意尝试 Alpha/Beta 版本
 * ✓ 追求极致性能
 *
 * 迁移路径:
 * Webpack → Vite: 推荐，社区有迁移工具
 * Vite → Turbopack: 等待 Turbopack 成熟
 */

// 面试回答模板
const interviewAnswer = `
构建工具的选择主要看项目需求：

Webpack 是最成熟的方案，生态丰富、配置灵活，适合需要兼容旧浏览器或高度定制的企业级项目。缺点是配置复杂、开发启动慢。

Vite 利用浏览器原生 ESM，开发体验极好，冷启动和 HMR 都很快。生产构建用 Rollup，也足够稳定。适合新项目，但不支持 IE。

Turbopack 是 Vercel 用 Rust 写的，性能最强，但目前只能在 Next.js 中使用，还在开发中。

我的建议是：新项目优先考虑 Vite，除非有特殊需求（IE 兼容、Module Federation）才用 Webpack。Next.js 项目可以尝试 Turbopack。
`;
```
:::

::: details Source Map 详细对比
```javascript
/**
 * Source Map 类型对比:
 *
 * ┌──────────────────────────┬─────────┬─────────┬──────────┬────────────┐
 * │        类型              │ 构建速度│ 重建速度│ 质量     │ 适用环境   │
 * ├──────────────────────────┼─────────┼─────────┼──────────┼────────────┤
 * │ (none)                   │ +++     │ +++     │ 无       │ 生产       │
 * │ eval                     │ +++     │ +++     │ 低       │ 开发       │
 * │ eval-source-map          │ --      │ +       │ 高       │ 开发       │
 * │ eval-cheap-source-map    │ +       │ ++      │ 中低     │ 开发       │
 * │ eval-cheap-module-source │ o       │ ++      │ 中       │ 开发(推荐) │
 * │ source-map               │ --      │ --      │ 最高     │ 生产       │
 * │ cheap-source-map         │ +       │ o       │ 中低     │ 都可以     │
 * │ cheap-module-source-map  │ o       │ -       │ 中       │ 都可以     │
 * │ hidden-source-map        │ --      │ --      │ 最高     │ 生产(安全) │
 * │ nosources-source-map     │ --      │ --      │ 高       │ 生产(安全) │
 * └──────────────────────────┴─────────┴─────────┴──────────┴────────────┘
 *
 * 推荐配置:
 * - 开发环境: eval-cheap-module-source-map
 * - 生产环境: source-map 或 hidden-source-map
 */

// webpack.config.js
module.exports = (env) => ({
  devtool: env.production
    ? 'hidden-source-map'  // 生产：不暴露源码
    : 'eval-cheap-module-source-map',  // 开发：快速且够用
});
:::
