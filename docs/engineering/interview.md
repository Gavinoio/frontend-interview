# 工程化面试题精选

> 汇总 Webpack、Vite、Babel、CI/CD、Monorepo、测试、代码规范、兼容性等高频面试题。

## Webpack

::: details 1. Webpack 的构建流程是什么？
```
初始化（读取配置）
    ↓
编译（从 entry 出发，递归解析依赖）
    ↓
每个模块经过对应 Loader 转换
    ↓
Plugin 在各生命周期钩子介入处理
    ↓
输出（生成 chunk，写入文件系统）
```

**核心概念：**
- **Entry**：构建入口，可以是单个或多个
- **Output**：输出配置（路径、文件名）
- **Loader**：转换非 JS 文件（CSS、图片、TS 等）
- **Plugin**：扩展构建能力（压缩、注入 HTML、环境变量等）
- **Chunk**：代码分割的产物，一个 chunk 对应一个输出文件

---
:::

::: details 2. Loader 和 Plugin 的区别？
| 特性 | Loader | Plugin |
|------|--------|--------|
| 作用 | 转换文件内容（文件级别） | 扩展构建流程（全局级别） |
| 执行时机 | 模块加载时 | 构建生命周期各阶段 |
| 配置位置 | `module.rules` | `plugins` 数组 |
| 本质 | 函数，接收源码返回转换结果 | 类，监听 Webpack 钩子 |
| 示例 | babel-loader、css-loader | HtmlWebpackPlugin、MiniCssExtractPlugin |

---
:::

::: details 3. Webpack 如何优化构建速度？
```javascript
// 1. 持久化缓存（Webpack 5）
cache: { type: 'filesystem' }

// 2. 多线程构建
module: {
    rules: [{ use: ['thread-loader', 'babel-loader'] }]
}

// 3. 缩小解析范围
resolve: {
    modules: [path.resolve('node_modules')],
    extensions: ['.js', '.ts']  // 减少扩展名尝试
}

// 4. externals：大型库走 CDN，不打包
externals: { react: 'React', 'react-dom': 'ReactDOM' }

// 5. DllPlugin：预编译不常变化的依赖（已被 cache 替代）
```

---
:::

::: details 4. Webpack 代码分割有哪些方式？
```javascript
// 1. 入口分割（多 entry）
entry: { app: './src/app.js', vendor: './src/vendor.js' }

// 2. SplitChunksPlugin（自动提取公共代码）
optimization: {
    splitChunks: {
        chunks: 'all',
        cacheGroups: {
            vendor: {
                test: /node_modules/,
                name: 'vendors',
                chunks: 'all'
            }
        }
    }
}

// 3. 动态导入（按需加载）
const Chart = () => import(/* webpackChunkName: "chart" */ './Chart');
```

---
:::

## Vite

::: details 5. Vite 为什么比 Webpack 快？
**开发环境：**
- 基于原生 ES Module，浏览器直接请求源文件，无需打包
- 按需编译：只编译当前请求的文件
- 依赖预构建：用 esbuild（Go 编写）预构建 node_modules，比 Babel 快 10-100 倍
- HMR 精确：只更新变化的模块，不重新打包整个应用

**生产环境：**
- 用 Rollup 打包（Tree Shaking 更彻底）
- esbuild 压缩（比 Terser 快 20-40 倍）

---
:::

::: details 6. Vite 和 Webpack 如何选择？
| 场景 | 推荐 |
|------|------|
| 新项目 | Vite（开发体验好，速度快） |
| 需要复杂 Loader/Plugin 生态 | Webpack（生态更成熟） |
| 需要兼容旧浏览器（IE） | Webpack（Vite 需额外配置） |
| 大型企业项目（已有 Webpack 配置） | 保持 Webpack 或渐进迁移 |
| 库开发 | Vite（内置库模式） |

---
:::

## Babel

::: details 7. Babel 的工作原理是什么？
```
源代码
    ↓ 解析（@babel/parser）
AST（抽象语法树）
    ↓ 转换（@babel/traverse + plugins）
新 AST
    ↓ 生成（@babel/generator）
目标代码
```

**三个阶段：Parse → Transform → Generate**

---
:::

::: details 8. @babel/preset-env 和 polyfill 的关系？
- `@babel/preset-env`：根据目标环境自动转换语法（箭头函数、class 等）
- `core-js`：提供运行时 polyfill（Promise、Array.from 等新 API）

```javascript
// babel.config.js
{
    presets: [
        ['@babel/preset-env', {
            targets: '> 0.5%, last 2 versions, not dead',
            useBuiltIns: 'usage',  // 按需引入 polyfill
            corejs: 3
        }]
    ]
}
```

`useBuiltIns: 'usage'` 会自动分析代码，只引入用到的 polyfill，避免全量引入。

---
:::

::: details 9. .babelrc 和 babel.config.js 的区别？
- `.babelrc`：项目局部配置，只对同目录及子目录生效，适合 monorepo 中的子包
- `babel.config.js`：项目全局配置，对整个项目生效，适合单仓库项目

---
:::

## CI/CD

::: details 10. 什么是 CI/CD？前端 CI/CD 流程是什么？
**CI（持续集成）**：代码提交后自动触发构建和测试，快速发现问题。
**CD（持续交付/部署）**：CI 通过后自动部署到目标环境。

**典型前端 CI/CD 流程：**
```
代码提交（git push）
    ↓
触发 CI（GitHub Actions / GitLab CI）
    ↓
安装依赖（npm ci）
    ↓
代码检查（ESLint、TypeScript 类型检查）
    ↓
运行测试（单元测试、E2E 测试）
    ↓
构建（npm run build）
    ↓
部署（上传到 CDN / 服务器）
    ↓
通知（Slack / 邮件）
```

---
:::

::: details 11. GitHub Actions 的基本结构是什么？
```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
      - name: Deploy to CDN
        run: # 部署命令
```

---
:::

## Monorepo

::: details 12. 什么是 Monorepo？有什么优缺点？
**Monorepo**：将多个项目/包放在同一个 Git 仓库中管理。

**优点：**
- 代码共享方便，无需发布 npm 包
- 统一的工具链和规范
- 跨包重构更容易
- 原子提交（一次提交涉及多个包的变更）

**缺点：**
- 仓库体积大，clone 慢
- 构建时间长（需要增量构建）
- 权限管理复杂

**主流工具**：pnpm workspace（推荐）、Turborepo（构建缓存）、Nx（大型项目）

---
:::

::: details 13. pnpm 相比 npm/yarn 有什么优势？
1. **硬链接 + 符号链接**：所有包存储在全局 store，项目中用链接引用，节省磁盘空间
2. **严格的依赖隔离**：只能访问 `package.json` 中声明的依赖，避免幽灵依赖
3. **安装速度快**：并行安装 + 全局缓存
4. **原生 Monorepo 支持**：`pnpm workspace` 开箱即用

---
:::

## 测试

::: details 14. 单元测试、集成测试、E2E 测试的区别？
| 类型 | 测试范围 | 速度 | 工具 |
|------|---------|------|------|
| 单元测试 | 单个函数/组件 | 极快 | Jest、Vitest |
| 集成测试 | 多个模块协作 | 中等 | Jest + Testing Library |
| E2E 测试 | 完整用户流程 | 慢 | Playwright、Cypress |

**测试金字塔**：单元测试（多）> 集成测试（中）> E2E 测试（少）

---
:::

::: details 15. 如何写好单元测试？
**AAA 模式：**
```javascript
test('should add two numbers', () => {
    // Arrange（准备）
    const a = 1, b = 2;

    // Act（执行）
    const result = add(a, b);

    // Assert（断言）
    expect(result).toBe(3);
});
```

**原则：**
- 测试行为，不测实现细节（避免测试内部状态）
- 每个测试只验证一件事
- 测试之间相互独立，不依赖执行顺序
- 有意义的测试名称（描述预期行为）
- 合理使用 Mock（隔离外部依赖）

---
:::

::: details 16. Vitest 和 Jest 的区别？
| 特性 | Vitest | Jest |
|------|--------|------|
| 速度 | 极快（基于 Vite，ESM 原生） | 较慢（需要转换） |
| 配置 | 复用 vite.config.ts | 独立配置 |
| 生态 | 兼容 Jest API | 成熟生态 |
| 适用 | Vite 项目 | 任意项目 |

Vite 项目推荐 Vitest，其他项目用 Jest。

---
:::

## 代码规范

::: details 17. ESLint 和 Prettier 的区别？如何配合使用？
- **ESLint**：代码质量检查（未使用变量、潜在 bug、最佳实践）
- **Prettier**：代码格式化（缩进、引号、分号等风格统一）

**配合使用：**
```bash
npm install -D eslint prettier eslint-config-prettier
```

```json
// .eslintrc
{
  "extends": ["eslint:recommended", "prettier"]  // prettier 放最后，关闭冲突规则
}
```

**推荐**：ESLint 负责逻辑规则，Prettier 负责格式，两者职责分离。

---
:::

::: details 18. Git Hooks 如何在提交时自动检查代码？
```bash
npm install -D husky lint-staged
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,vue}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": ["prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

**流程**：`git commit` → husky 触发 `pre-commit` → lint-staged 只检查暂存区文件 → 通过则提交

---
:::

## 浏览器兼容性

::: details 19. 如何处理浏览器兼容性问题？
1. **Babel 转译语法**：`@babel/preset-env` + browserslist 配置目标浏览器
2. **Polyfill 填充 API**：`core-js` 按需引入缺失的 API
3. **CSS 前缀**：`autoprefixer`（PostCSS 插件）自动添加 `-webkit-` 等前缀
4. **特性检测**：`@supports` CSS 规则、`if ('fetch' in window)` JS 检测
5. **渐进增强**：先保证基础功能，再为现代浏览器增强体验

```
// .browserslistrc
> 1%
last 2 versions
not dead
not IE 11
```

---
:::

::: details 20. browserslist 是什么？如何配置？
browserslist 定义目标浏览器范围，被 Babel、Autoprefixer、ESLint 等工具共享使用。

```
# .browserslistrc 常用配置
> 0.5%           # 全球使用率 > 0.5%
last 2 versions  # 每个浏览器最新 2 个版本
not dead         # 排除已停止维护的浏览器
not IE 11        # 明确排除 IE 11
```

可以用 `npx browserslist` 查看匹配的浏览器列表。
:::
