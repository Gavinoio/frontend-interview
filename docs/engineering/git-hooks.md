# Git Hooks 与工作流

## 概述

Git Hooks 是 Git 在特定事件（如提交、推送）发生时自动执行的脚本。通过 Git Hooks，可以实现代码检查、格式化、测试等自动化流程，保证代码质量和团队协作规范。

## Git Hooks 基础

### 钩子类型

```
┌─────────────────────────────────────────────────────────────────┐
│                        Git Hooks                                 │
├─────────────────────────┬───────────────────────────────────────┤
│      客户端钩子         │           服务端钩子                   │
├─────────────────────────┼───────────────────────────────────────┤
│ pre-commit              │ pre-receive                           │
│ prepare-commit-msg      │ update                                │
│ commit-msg              │ post-receive                          │
│ post-commit             │                                       │
│ pre-push                │                                       │
│ pre-rebase              │                                       │
│ post-checkout           │                                       │
│ post-merge              │                                       │
└─────────────────────────┴───────────────────────────────────────┘
```

### 常用钩子说明

| 钩子 | 触发时机 | 常见用途 |
|------|----------|----------|
| pre-commit | commit 前 | 代码检查、格式化 |
| commit-msg | 编辑提交信息后 | 校验提交信息格式 |
| pre-push | push 前 | 运行测试、检查分支 |
| post-merge | merge 后 | 安装依赖、清理缓存 |
| post-checkout | checkout 后 | 环境切换、依赖更新 |

### 原生 Git Hooks

```bash
# Git Hooks 位置
.git/hooks/

# 创建 pre-commit 钩子
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
echo "Running pre-commit hook..."

# 运行 ESLint
npm run lint
if [ $? -ne 0 ]; then
  echo "ESLint failed, commit aborted"
  exit 1
fi

echo "Pre-commit checks passed!"
EOF

# 添加执行权限
chmod +x .git/hooks/pre-commit
```

## Husky - 现代 Git Hooks 管理

### 安装配置

```bash
# 安装 Husky
npm install husky -D

# 初始化 Husky
npx husky init

# 目录结构
.husky/
├── _/
│   └── husky.sh
├── pre-commit
└── commit-msg
```

### 配置钩子

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/h"

npm run lint
npm run test
```

```bash
# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/h"

npx --no -- commitlint --edit ${1}
```

### package.json 配置

```json
{
  "scripts": {
    "prepare": "husky",
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix",
    "test": "jest"
  }
}
```

## lint-staged - 只检查暂存文件

### 安装配置

```bash
npm install lint-staged -D
```

### 配置方式

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,less}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

```javascript
// lint-staged.config.js
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    // 运行相关测试
    (filenames) => `jest --findRelatedTests ${filenames.join(' ')}`
  ],
  '*.{css,scss}': [
    'stylelint --fix',
    'prettier --write'
  ],
  '*.vue': [
    'eslint --fix',
    'stylelint --fix',
    'prettier --write'
  ]
};
```

### 配合 Husky 使用

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/h"

npx lint-staged
```

## Commitlint - 提交信息规范

### 安装配置

```bash
npm install @commitlint/cli @commitlint/config-conventional -D
```

### 配置规则

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 类型
    'type-enum': [2, 'always', [
      'feat',     // 新功能
      'fix',      // 修复
      'docs',     // 文档
      'style',    // 格式
      'refactor', // 重构
      'perf',     // 性能
      'test',     // 测试
      'build',    // 构建
      'ci',       // CI
      'chore',    // 其他
      'revert'    // 回滚
    ]],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // 范围
    'scope-case': [2, 'always', 'lower-case'],

    // 主题
    'subject-case': [0],
    'subject-empty': [2, 'never'],
    'subject-max-length': [2, 'always', 72],

    // 正文
    'body-max-line-length': [2, 'always', 100],

    // 页脚
    'footer-max-line-length': [2, 'always', 100]
  }
};
```

### 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

```bash
# 示例
feat(auth): add user login feature

- Add login form component
- Add authentication API
- Add JWT token handling

Closes #123
```

### Commitizen - 交互式提交

```bash
# 安装
npm install commitizen cz-conventional-changelog -D

# 配置 package.json
{
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  },
  "scripts": {
    "commit": "cz"
  }
}

# 使用
npm run commit
# 或
npx cz
```

```bash
# 自定义 Adapter
npm install cz-customizable -D
```

```javascript
// .cz-config.js
module.exports = {
  types: [
    { value: 'feat', name: 'feat:     新功能' },
    { value: 'fix', name: 'fix:      修复' },
    { value: 'docs', name: 'docs:     文档' },
    { value: 'style', name: 'style:    格式' },
    { value: 'refactor', name: 'refactor: 重构' },
    { value: 'perf', name: 'perf:     性能优化' },
    { value: 'test', name: 'test:     测试' },
    { value: 'build', name: 'build:    构建' },
    { value: 'ci', name: 'ci:       CI 配置' },
    { value: 'chore', name: 'chore:    其他' }
  ],
  scopes: [
    { name: 'components' },
    { name: 'utils' },
    { name: 'styles' },
    { name: 'api' },
    { name: 'config' }
  ],
  messages: {
    type: '选择提交类型:',
    scope: '选择影响范围 (可选):',
    subject: '简短描述:',
    body: '详细描述 (可选):',
    footer: '关联 Issue (可选):',
    confirmCommit: '确认提交?'
  },
  allowCustomScopes: true,
  subjectLimit: 72
};
```

## 完整工作流配置

### 项目初始化

```bash
# 1. 安装依赖
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional eslint prettier stylelint

# 2. 初始化 Husky
npx husky init

# 3. 配置 pre-commit
echo "npx lint-staged" > .husky/pre-commit

# 4. 配置 commit-msg
echo "npx --no -- commitlint --edit \${1}" > .husky/commit-msg
```

### package.json

```json
{
  "scripts": {
    "prepare": "husky",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write .",
    "stylelint": "stylelint \"**/*.{css,scss,vue}\"",
    "test": "jest",
    "commit": "cz"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,less}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.vue": [
      "eslint --fix",
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{json,md,yaml,yml}": [
      "prettier --write"
    ]
  },
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  }
}
```

### ESLint 配置

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn'
  },
  settings: {
    react: { version: 'detect' }
  }
};
```

### Prettier 配置

```javascript
// .prettierrc.js
module.exports = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf'
};
```

### Stylelint 配置

```javascript
// .stylelintrc.js
module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recommended-scss',
    'stylelint-config-prettier'
  ],
  rules: {
    'selector-class-pattern': null,
    'no-descending-specificity': null
  }
};
```

## 高级配置

### pre-push 钩子

```bash
# .husky/pre-push
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/h"

# 运行测试
npm run test

# 检查分支名
branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$branch" == "main" || "$branch" == "master" ]]; then
  echo "Cannot push directly to $branch branch"
  exit 1
fi
```

### 跳过钩子

```bash
# 跳过 pre-commit
git commit --no-verify -m "message"
git commit -n -m "message"

# 跳过特定钩子
HUSKY=0 git commit -m "message"
```

### 条件执行

```javascript
// lint-staged.config.js
module.exports = {
  '*.{js,ts}': (filenames) => {
    // 大量文件时跳过
    if (filenames.length > 100) {
      return 'echo "Too many files, skipping lint"';
    }
    return [
      `eslint --fix ${filenames.join(' ')}`,
      `prettier --write ${filenames.join(' ')}`
    ];
  }
};
```

### 并行执行

```javascript
// lint-staged.config.js
module.exports = {
  '*.js': ['eslint --fix', 'prettier --write'],
  '*.css': ['stylelint --fix', 'prettier --write']
  // JS 和 CSS 检查并行执行
};
```

## CI/CD 集成

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run stylelint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run test -- --coverage
      - uses: codecov/codecov-action@v3

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

### Commitlint in CI

```yaml
# .github/workflows/commitlint.yml
name: Commitlint

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  commitlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: wagoid/commitlint-github-action@v5
```

## 常见问题

### 钩子不执行

```bash
# 1. 检查权限
chmod +x .husky/*

# 2. 重新初始化
rm -rf .husky
npx husky init

# 3. 检查 Git 版本
git --version  # 需要 2.9+
```

### Windows 兼容性

```bash
# 使用 cross-env 处理环境变量
npm install cross-env -D

# package.json
{
  "scripts": {
    "lint": "cross-env NODE_ENV=production eslint ."
  }
}
```

### 性能优化

```javascript
// lint-staged.config.js
module.exports = {
  // 1. 只检查变更文件
  '*.{js,ts}': 'eslint --fix',

  // 2. 使用缓存
  '*.{js,ts}': 'eslint --fix --cache',

  // 3. 限制并发
  '*.{js,ts}': {
    maxBuffer: 1024 * 1024 * 50, // 50MB
    concurrent: 4
  }
};
```

## 面试常见问题

::: details 1. Git Hooks 有哪些常用钩子？
- **pre-commit**：提交前执行，用于代码检查
- **commit-msg**：编辑提交信息后，用于校验信息格式
- **pre-push**：推送前执行，用于运行测试
- **post-merge**：合并后执行，用于更新依赖
:::

::: details 2. Husky 和原生 Git Hooks 的区别？
- Husky 配置可版本控制，原生钩子在 .git 目录
- Husky 提供更好的跨平台支持
- Husky 配置更简单，易于团队共享
:::

::: details 3. lint-staged 的作用？
只对 Git 暂存区的文件执行检查，避免检查整个项目，提高提交效率。
:::

::: details 4. Commitlint 规范有什么好处？
- 统一提交信息格式
- 便于自动生成 Changelog
- 方便追溯代码变更历史
- 支持语义化版本管理
:::

::: details 5. 如何跳过 Git Hooks？
```bash
git commit --no-verify -m "message"
# 或
HUSKY=0 git commit -m "message"
```
:::

## 总结

Git Hooks 是保证代码质量的重要工具：

1. **Husky**：现代化的 Git Hooks 管理
2. **lint-staged**：只检查暂存文件
3. **Commitlint**：规范提交信息
4. **Commitizen**：交互式提交
5. **CI 集成**：自动化检查流程

完整的 Git Hooks 工作流能够显著提升团队协作效率和代码质量。
