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

