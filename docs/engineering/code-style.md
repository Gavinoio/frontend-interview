# 代码规范

代码规范是团队协作的基础，统一的代码风格可以提高代码可读性和维护性。

## ESLint

ESLint 是 JavaScript/TypeScript 代码检查工具，用于发现代码问题和统一代码风格。

### 安装配置

```bash
# 安装
npm install eslint -D

# 初始化配置
npx eslint --init
```

### 基础配置

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'no-debugger': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-var': 'error',
    'prefer-const': 'error'
  }
}
```

### TypeScript 配置

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json']
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error'
  }
}
```

### Vue 项目配置

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off',
    'vue/require-default-prop': 'off',
    'vue/component-tags-order': ['error', {
      order: ['script', 'template', 'style']
    }],
    'vue/block-lang': ['error', {
      script: { lang: 'ts' }
    }]
  }
}
```

### React 项目配置

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'jsx-a11y'],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  }
}
```

### 忽略文件

```
# .eslintignore
node_modules
dist
build
coverage
*.min.js
*.d.ts
```

## Prettier

Prettier 是代码格式化工具，专注于代码风格统一。

### 安装配置

```bash
npm install prettier -D
```

### 配置文件

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "none",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "htmlWhitespaceSensitivity": "ignore",
  "proseWrap": "preserve",
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "bracketSameLine": false
}
```

### 忽略文件

```
# .prettierignore
node_modules
dist
build
coverage
*.min.js
pnpm-lock.yaml
package-lock.json
```

### ESLint 集成

```bash
# 安装
npm install eslint-config-prettier eslint-plugin-prettier -D
```

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    // ... 其他配置
    'plugin:prettier/recommended'  // 放在最后
  ],
  rules: {
    'prettier/prettier': 'error'
  }
}
```

## EditorConfig

EditorConfig 用于统一不同编辑器的基础配置。

```ini
# .editorconfig
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2

[Makefile]
indent_style = tab
```

## Husky + lint-staged

Husky 用于管理 Git hooks，lint-staged 用于只检查暂存文件。

### 安装配置

```bash
# 安装
npm install husky lint-staged -D

# 初始化 husky
npx husky install

# 添加 prepare 脚本
npm pkg set scripts.prepare="husky install"

# 添加 pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

### lint-staged 配置

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,less}": [
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

```javascript
// lint-staged.config.js（更复杂的配置）
module.exports = {
  '*.{js,jsx,ts,tsx}': files => {
    const filenames = files.join(' ')
    return [
      `eslint --fix ${filenames}`,
      `prettier --write ${filenames}`,
      `git add ${filenames}`
    ]
  },
  '*.vue': files => {
    const filenames = files.join(' ')
    return [
      `eslint --fix ${filenames}`,
      `prettier --write ${filenames}`
    ]
  }
}
```

## Commitlint

Commitlint 用于规范 Git 提交信息。

### 安装配置

```bash
# 安装
npm install @commitlint/cli @commitlint/config-conventional -D

# 添加 commit-msg hook
npx husky add .husky/commit-msg "npx --no -- commitlint --edit $1"
```

### 配置文件

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复 bug
        'docs',     // 文档更新
        'style',    // 代码格式（不影响功能）
        'refactor', // 重构
        'perf',     // 性能优化
        'test',     // 测试
        'build',    // 构建系统或外部依赖
        'ci',       // CI 配置
        'chore',    // 其他修改
        'revert'    // 回退
      ]
    ],
    'type-case': [2, 'always', 'lower-case'],
    'subject-case': [0],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [0]
  }
}
```

### 提交示例

```bash
# 正确格式
git commit -m "feat: 添加用户登录功能"
git commit -m "fix: 修复首页加载问题"
git commit -m "docs: 更新 README"

# 带范围
git commit -m "feat(auth): 添加 OAuth 登录"
git commit -m "fix(ui): 修复按钮样式问题"

# 带详细描述
git commit -m "feat: 添加购物车功能

- 支持添加商品
- 支持修改数量
- 支持删除商品"
```

### Commitizen

使用 Commitizen 交互式生成提交信息。

```bash
# 安装
npm install commitizen cz-conventional-changelog -D

# 配置
npm pkg set config.commitizen.path="cz-conventional-changelog"
```

```json
// package.json
{
  "scripts": {
    "commit": "cz"
  },
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  }
}
```

## StyleLint

StyleLint 用于 CSS/SCSS/Less 代码检查。

### 安装配置

```bash
npm install stylelint stylelint-config-standard stylelint-config-recommended-vue -D
```

```javascript
// .stylelintrc.js
module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recommended-vue'
  ],
  rules: {
    'selector-class-pattern': null,
    'no-descending-specificity': null,
    'property-no-unknown': [
      true,
      {
        ignoreProperties: ['composes']
      }
    ],
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen']
      }
    ],
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global', 'deep']
      }
    ]
  }
}
```

### SCSS 配置

```bash
npm install stylelint-config-standard-scss -D
```

```javascript
// .stylelintrc.js
module.exports = {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-recommended-vue/scss'
  ],
  rules: {
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply']
      }
    ]
  }
}
```

## 命名规范

### 文件命名

```
# 组件文件（PascalCase）
UserProfile.vue
UserProfile.tsx
UserCard.vue

# 工具/hooks 文件（camelCase）
useAuth.ts
formatDate.ts
apiClient.ts

# 常量文件（kebab-case 或 SCREAMING_SNAKE_CASE）
api-endpoints.ts
API_ENDPOINTS.ts

# 样式文件（kebab-case）
user-profile.css
user-profile.module.css
```

### 变量命名

```javascript
// 变量（camelCase）
const userName = 'Tom'
const isLoading = false
const itemList = []

// 常量（SCREAMING_SNAKE_CASE）
const MAX_COUNT = 100
const API_BASE_URL = 'https://api.example.com'

// 私有变量（_前缀）
const _privateVar = 'private'

// 布尔值（is/has/can/should 前缀）
const isVisible = true
const hasPermission = false
const canEdit = true
const shouldUpdate = false
```

### 函数命名

```javascript
// 普通函数（camelCase，动词开头）
function getUserInfo() {}
function handleClick() {}
function validateForm() {}

// 事件处理（handle/on 前缀）
function handleSubmit() {}
function onInputChange() {}

// 获取数据（get/fetch/load）
function getUserList() {}
function fetchData() {}
function loadMore() {}

// 设置数据（set/update）
function setUserName() {}
function updateConfig() {}

// 布尔返回（is/has/can/should）
function isValid() {}
function hasPermission() {}
function canAccess() {}
```

### 组件命名

```javascript
// Vue 组件（PascalCase）
// UserProfile.vue
export default {
  name: 'UserProfile'
}

// React 组件（PascalCase）
function UserProfile() {
  return <div>...</div>
}

// 组件 props（camelCase）
defineProps({
  userName: String,
  isActive: Boolean,
  onUpdate: Function
})
```

## 目录结构规范

```
src/
├── assets/              # 静态资源
│   ├── images/
│   ├── fonts/
│   └── styles/
├── components/          # 通用组件
│   ├── common/          # 基础组件
│   └── business/        # 业务组件
├── composables/         # Vue 组合式函数
│   └── useAuth.ts
├── hooks/               # React Hooks
│   └── useAuth.ts
├── layouts/             # 布局组件
├── pages/               # 页面组件
│   └── user/
│       ├── index.vue
│       └── components/
├── router/              # 路由配置
├── services/            # API 服务
│   ├── api/
│   └── http.ts
├── stores/              # 状态管理
│   └── modules/
├── types/               # TypeScript 类型
├── utils/               # 工具函数
├── constants/           # 常量定义
├── App.vue
└── main.ts
```

## VS Code 配置

### 推荐扩展

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "stylelint.vscode-stylelint",
    "vue.volar",
    "bradlc.vscode-tailwindcss",
    "editorconfig.editorconfig"
  ]
}
```

### 工作区设置

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ],
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

