# Monorepo

Monorepo（单仓库）是一种项目管理策略，将多个相关项目放在同一个代码仓库中管理。

## 什么是 Monorepo

### 基本概念

```
monorepo/
├── packages/
│   ├── app/           # 主应用
│   ├── shared/        # 共享库
│   ├── ui/            # UI 组件库
│   └── utils/         # 工具库
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

### Monorepo vs Multirepo

| 特性 | Monorepo | Multirepo |
|------|----------|-----------|
| 代码共享 | 简单 | 需要发包 |
| 依赖管理 | 统一 | 各自管理 |
| 原子提交 | 支持 | 不支持 |
| 构建速度 | 需要优化 | 独立构建 |
| CI/CD | 复杂 | 简单 |
| 权限控制 | 较难 | 简单 |

### 适用场景

- 多个项目有大量共享代码
- 需要频繁进行跨项目修改
- 统一的代码规范和工具链
- 团队协作紧密

## pnpm workspace

pnpm 内置了 workspace 支持，是目前最流行的 Monorepo 方案之一。

### 配置 workspace

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - '!**/test/**'  # 排除测试目录
```

### 根目录 package.json

```json
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel run dev",
    "build": "pnpm -r run build",
    "test": "pnpm -r run test",
    "lint": "pnpm -r run lint"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "eslint": "^8.0.0"
  }
}
```

### 子包结构

```json
// packages/shared/package.json
{
  "name": "@myorg/shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "lodash": "^4.17.21"
  }
}

// packages/app/package.json
{
  "name": "@myorg/app",
  "version": "1.0.0",
  "dependencies": {
    "@myorg/shared": "workspace:*",  // 引用 workspace 包
    "@myorg/ui": "workspace:^"
  }
}
```

### 常用命令

```bash
# 安装所有依赖
pnpm install

# 在根目录安装依赖（-w 表示 workspace root）
pnpm add typescript -D -w

# 在特定包安装依赖
pnpm add lodash --filter @myorg/shared

# 运行特定包的脚本
pnpm --filter @myorg/app dev

# 运行所有包的脚本
pnpm -r run build

# 并行运行
pnpm -r --parallel run dev

# 按依赖顺序运行
pnpm -r run build

# 查看依赖关系
pnpm list -r
```

### 版本协议

```json
{
  "dependencies": {
    // workspace:* - 使用当前版本
    "@myorg/shared": "workspace:*",

    // workspace:^ - 发布时转为 ^x.x.x
    "@myorg/ui": "workspace:^",

    // workspace:~ - 发布时转为 ~x.x.x
    "@myorg/utils": "workspace:~"
  }
}
```

## Turborepo

Turborepo 是一个高性能的 Monorepo 构建系统，提供智能缓存和并行执行。

### 安装配置

```bash
# 创建新项目
npx create-turbo@latest

# 在现有项目添加
pnpm add turbo -D -w
```

### turbo.json 配置

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": [],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "deploy": {
      "dependsOn": ["build", "test", "lint"],
      "outputs": []
    }
  }
}
```

### 任务依赖

```json
{
  "pipeline": {
    // ^build 表示先构建依赖的包
    "build": {
      "dependsOn": ["^build"]
    },

    // 同一个包内的依赖
    "test": {
      "dependsOn": ["build"]
    },

    // 指定包的任务依赖
    "deploy": {
      "dependsOn": ["@myorg/app#build"]
    }
  }
}
```

### 缓存配置

```json
{
  "pipeline": {
    "build": {
      "outputs": ["dist/**"],
      "cache": true  // 默认开启
    },
    "dev": {
      "cache": false  // 开发模式不缓存
    }
  }
}

// 远程缓存（团队共享）
// turbo.json 或 .turbo/config.json
{
  "remoteCache": {
    "signature": true
  }
}
```

### 常用命令

```bash
# 运行所有包的 build
turbo run build

# 运行特定包
turbo run build --filter=@myorg/app

# 只运行变更的包
turbo run build --filter=...[origin/main]

# 并行运行
turbo run lint test --parallel

# 显示依赖图
turbo run build --graph

# 清理缓存
turbo run build --force
```

### 过滤器语法

```bash
# 指定包
--filter=@myorg/app

# 包及其依赖
--filter=@myorg/app...

# 包及其依赖者
--filter=...@myorg/shared

# 目录过滤
--filter=./packages/*

# 变更过滤
--filter=[HEAD^1]
--filter=...[origin/main]

# 组合过滤
--filter=@myorg/app --filter=@myorg/ui
```

## Nx

Nx 是另一个强大的 Monorepo 工具，提供更多开箱即用的功能。

### 基本配置

```json
// nx.json
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["{projectRoot}/dist"]
    },
    "test": {
      "inputs": ["default", "^production"]
    }
  },
  "defaultProject": "app"
}
```

### 项目配置

```json
// packages/app/project.json
{
  "name": "app",
  "projectType": "application",
  "targets": {
    "build": {
      "executor": "@nx/vite:build",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/packages/app"
      }
    },
    "serve": {
      "executor": "@nx/vite:dev-server",
      "options": {
        "buildTarget": "app:build"
      }
    }
  }
}
```

### 常用命令

```bash
# 运行任务
nx run app:build
nx build app

# 运行受影响的项目
nx affected:build
nx affected:test

# 查看依赖图
nx graph

# 生成项目
nx generate @nx/react:library my-lib
```

## Lerna（传统方案）

虽然 Lerna 维护状态不如从前活跃，但仍被广泛使用。

### 基本配置

```json
// lerna.json
{
  "version": "independent",
  "npmClient": "pnpm",
  "useWorkspaces": true,
  "packages": ["packages/*"],
  "command": {
    "version": {
      "conventionalCommits": true,
      "message": "chore(release): publish %s"
    },
    "publish": {
      "conventionalCommits": true
    }
  }
}
```

### 常用命令

```bash
# 初始化
npx lerna init

# 安装依赖并链接
lerna bootstrap

# 运行所有包的脚本
lerna run build

# 发布变更的包
lerna publish

# 查看变更
lerna changed

# 版本升级
lerna version
```

## 共享配置

### 共享 TypeScript 配置

```json
// tsconfig.base.json（根目录）
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true
  }
}

// packages/shared/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### 共享 ESLint 配置

```javascript
// packages/eslint-config/index.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off'
  }
}

// packages/app/.eslintrc.js
module.exports = {
  extends: ['@myorg/eslint-config'],
  parserOptions: {
    project: './tsconfig.json'
  }
}
```

### 共享版本管理

```json
// package.json（根目录）
{
  "devDependencies": {
    "@changesets/cli": "^2.26.0"
  }
}

// .changeset/config.json
{
  "$schema": "https://unpkg.com/@changesets/config@2.3.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch"
}
```

```bash
# 添加变更记录
pnpm changeset

# 更新版本
pnpm changeset version

# 发布
pnpm changeset publish
```

## CI/CD 最佳实践

### GitHub Actions 示例

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 2  # 用于检测变更

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      # Turborepo 远程缓存
      - name: Setup Turbo Cache
        uses: actions/cache@v3
        with:
          path: .turbo
          key: ${{ runner.os }}-turbo-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-turbo-

      - run: pnpm install

      # 只构建受影响的包
      - run: pnpm turbo run build --filter=...[origin/main]

      - run: pnpm turbo run test --filter=...[origin/main]

      - run: pnpm turbo run lint --filter=...[origin/main]
```

### 增量构建

```yaml
# 只在特定目录变更时触发
on:
  push:
    paths:
      - 'packages/app/**'
      - 'packages/shared/**'
```

