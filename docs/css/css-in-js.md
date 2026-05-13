# CSS-in-JS

## 概述

CSS-in-JS 是一种将 CSS 样式与 JavaScript 代码结合的技术方案，通过 JavaScript 来定义和管理组件样式。它解决了传统 CSS 的全局污染、样式隔离、动态样式等问题。

---

## 一、CSS-in-JS 优缺点

### 优点

```javascript
/**
 * 1. 样式隔离 - 自动生成唯一类名，避免全局污染
 * 2. 动态样式 - 基于 props/state 动态计算样式
 * 3. 组件化 - 样式与组件强绑定，便于维护
 * 4. 自动前缀 - 自动添加浏览器前缀
 * 5. 死代码消除 - 未使用的样式不会打包
 * 6. TypeScript 支持 - 类型安全的样式定义
 */
```

### 缺点

```javascript
/**
 * 1. 运行时开销 - 需要在运行时解析和注入样式
 * 2. 包体积增大 - 需要引入额外的库
 * 3. 学习成本 - 需要学习新的 API
 * 4. SSR 复杂性 - 服务端渲染需要额外配置
 * 5. 调试困难 - 生成的类名难以阅读
 */
```

---

## 二、主流方案对比

| 特性 | styled-components | Emotion | CSS Modules | Tailwind CSS |
|------|-------------------|---------|-------------|--------------|
| 运行时 | 是 | 是/否 | 否 | 否 |
| 包大小 | ~16KB | ~11KB | 0 | 按需 |
| 动态样式 | 原生支持 | 原生支持 | 需 JS | 需 JS |
| SSR | 需配置 | 需配置 | 原生 | 原生 |
| TypeScript | 完整支持 | 完整支持 | 需配置 | 完整支持 |
| 学习曲线 | 中等 | 中等 | 低 | 中等 |
| 社区生态 | 成熟 | 成熟 | 成熟 | 快速增长 |

---

## 三、styled-components

### 1. 安装与配置

```bash
npm install styled-components
npm install -D @types/styled-components  # TypeScript 支持
```

### 2. 基本用法

```jsx
import styled from 'styled-components'

// 基础样式组件
const Button = styled.button`
  background: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background: #2980b9;
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`

// 使用
function App() {
  return (
    <Button onClick={() => alert('clicked')}>
      点击我
    </Button>
  )
}
```

### 3. 基于 Props 的动态样式

```jsx
// 根据 props 改变样式
const Button = styled.button`
  background: ${props => props.primary ? '#3498db' : '#fff'};
  color: ${props => props.primary ? '#fff' : '#3498db'};
  padding: ${props => props.size === 'large' ? '15px 30px' : '10px 20px'};
  border: 2px solid #3498db;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: ${props => props.primary ? '#2980b9' : '#ecf0f1'};
  }
`

// 使用
<Button primary>主要按钮</Button>
<Button>次要按钮</Button>
<Button primary size="large">大按钮</Button>

// TypeScript 类型定义
interface ButtonProps {
  primary?: boolean
  size?: 'small' | 'medium' | 'large'
}

const Button = styled.button<ButtonProps>`
  background: ${props => props.primary ? '#3498db' : '#fff'};
  padding: ${props => {
    switch (props.size) {
      case 'small': return '5px 10px'
      case 'large': return '15px 30px'
      default: return '10px 20px'
    }
  }};
`
```

### 4. 扩展样式

```jsx
// 基础按钮
const Button = styled.button`
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
`

// 扩展 - 主要按钮
const PrimaryButton = styled(Button)`
  background: #3498db;
  color: white;
  border: none;
`

// 扩展 - 危险按钮
const DangerButton = styled(Button)`
  background: #e74c3c;
  color: white;
  border: none;
`

// 扩展第三方组件
import { Link } from 'react-router-dom'

const StyledLink = styled(Link)`
  color: #3498db;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`
```

### 5. 主题系统

```jsx
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components'

// 定义主题
const lightTheme = {
  colors: {
    primary: '#3498db',
    secondary: '#2ecc71',
    background: '#ffffff',
    text: '#333333',
    border: '#e0e0e0'
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px'
  },
  borderRadius: '4px',
  shadows: {
    small: '0 2px 4px rgba(0,0,0,0.1)',
    medium: '0 4px 8px rgba(0,0,0,0.1)'
  }
}

const darkTheme = {
  colors: {
    primary: '#3498db',
    secondary: '#2ecc71',
    background: '#1a1a2e',
    text: '#ffffff',
    border: '#333333'
  },
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  shadows: {
    small: '0 2px 4px rgba(0,0,0,0.3)',
    medium: '0 4px 8px rgba(0,0,0,0.3)'
  }
}

// 全局样式
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
`

// 使用主题的组件
const Card = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.medium};
  box-shadow: ${props => props.theme.shadows.small};
`

const Button = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
  border: none;
  border-radius: ${props => props.theme.borderRadius};
`

// 应用
function App() {
  const [isDark, setIsDark] = useState(false)

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <GlobalStyle />
      <Card>
        <h1>主题示例</h1>
        <Button onClick={() => setIsDark(!isDark)}>
          切换主题
        </Button>
      </Card>
    </ThemeProvider>
  )
}
```

### 6. 高级特性

```jsx
// attrs - 设置默认属性
const Input = styled.input.attrs(props => ({
  type: props.type || 'text',
  placeholder: props.placeholder || '请输入...'
}))`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
`

// as - 改变渲染的 HTML 标签
const Button = styled.button`
  /* 样式 */
`
<Button as="a" href="/link">链接按钮</Button>

// css 辅助函数
import styled, { css } from 'styled-components'

const flexCenter = css`
  display: flex;
  justify-content: center;
  align-items: center;
`

const Card = styled.div`
  ${flexCenter}
  padding: 20px;
`

// keyframes 动画
import styled, { keyframes } from 'styled-components'

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
`

// 引用其他组件
const Link = styled.a`
  color: #3498db;
`

const Icon = styled.span`
  margin-right: 8px;
`

const Card = styled.div`
  padding: 20px;

  /* 选中 Card 内的 Link */
  ${Link} {
    color: #e74c3c;
  }

  &:hover ${Icon} {
    color: #2ecc71;
  }
`
```

### 7. SSR 配置

```jsx
// _document.js (Next.js)
import Document, { DocumentContext } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />)
        })

      const initialProps = await Document.getInitialProps(ctx)
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        )
      }
    } finally {
      sheet.seal()
    }
  }
}
```

---

## 四、Emotion

### 1. 安装

```bash
# 核心包
npm install @emotion/react

# styled API (类似 styled-components)
npm install @emotion/styled

# Babel 插件 (优化)
npm install -D @emotion/babel-plugin
```

### 2. css prop 方式

```jsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

// 对象语法
const buttonStyle = css({
  backgroundColor: '#3498db',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#2980b9'
  }
})

// 模板字符串语法
const cardStyle = css`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`

function App() {
  return (
    <div css={cardStyle}>
      <button css={buttonStyle}>按钮</button>

      {/* 内联样式 */}
      <p css={{ color: 'gray', fontSize: '14px' }}>
        内联 css prop
      </p>

      {/* 组合样式 */}
      <button css={[buttonStyle, { marginTop: '10px' }]}>
        组合样式
      </button>
    </div>
  )
}
```

### 3. styled API

```jsx
import styled from '@emotion/styled'

// 基本用法 (与 styled-components 相同)
const Button = styled.button`
  background: #3498db;
  color: white;
  padding: 10px 20px;
`

// 对象语法
const Card = styled.div({
  background: 'white',
  padding: '20px',
  borderRadius: '8px'
})

// 动态样式
const Button = styled.button`
  background: ${props => props.primary ? '#3498db' : 'white'};
  color: ${props => props.primary ? 'white' : '#3498db'};
`

// 组合使用 (对象语法)
const Button = styled.button(
  {
    padding: '10px 20px',
    borderRadius: '4px'
  },
  props => ({
    background: props.primary ? '#3498db' : 'white',
    color: props.primary ? 'white' : '#3498db'
  })
)
```

### 4. 主题

```jsx
import { ThemeProvider, useTheme } from '@emotion/react'
import styled from '@emotion/styled'

const theme = {
  colors: {
    primary: '#3498db',
    secondary: '#2ecc71'
  }
}

// 在 styled 中使用
const Button = styled.button`
  background: ${props => props.theme.colors.primary};
`

// 使用 useTheme hook
function ThemedComponent() {
  const theme = useTheme()
  return (
    <div css={{ color: theme.colors.primary }}>
      使用主题
    </div>
  )
}

// 应用
<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

### 5. Global 全局样式

```jsx
import { Global, css } from '@emotion/react'

const globalStyles = css`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`

function App() {
  return (
    <>
      <Global styles={globalStyles} />
      <main>内容</main>
    </>
  )
}
```

### 6. 零运行时 (@emotion/css)

```jsx
// 编译时提取，无运行时开销
import { css } from '@emotion/css'

const buttonClass = css`
  background: #3498db;
  color: white;
  padding: 10px 20px;
`

function App() {
  return <button className={buttonClass}>按钮</button>
}
```

---

## 五、CSS Modules

### 1. 基本用法

```css
/* Button.module.css */
.button {
  background: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
}

.button:hover {
  background: #2980b9;
}

.primary {
  background: #3498db;
}

.secondary {
  background: #95a5a6;
}

/* 组合类 */
.large {
  composes: button;
  padding: 15px 30px;
  font-size: 18px;
}

/* 从其他文件组合 */
.special {
  composes: base from './base.module.css';
  color: red;
}
```

```jsx
// Button.jsx
import styles from './Button.module.css'

function Button({ children, variant = 'primary', size }) {
  const className = `${styles.button} ${styles[variant]} ${size === 'large' ? styles.large : ''}`

  return (
    <button className={className}>
      {children}
    </button>
  )
}

// 使用 classnames 库简化
import cn from 'classnames'

function Button({ children, variant, size, disabled }) {
  return (
    <button
      className={cn(
        styles.button,
        styles[variant],
        {
          [styles.large]: size === 'large',
          [styles.disabled]: disabled
        }
      )}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
```

### 2. 全局样式

```css
/* styles.module.css */
.container {
  padding: 20px;
}

/* 局部转全局 */
:global(.external-class) {
  color: red;
}

/* 全局块 */
:global {
  .global-header {
    background: #333;
  }

  .global-footer {
    background: #666;
  }
}
```

### 3. TypeScript 支持

```typescript
// Button.module.css.d.ts (自动生成或手写)
declare const styles: {
  readonly button: string
  readonly primary: string
  readonly secondary: string
  readonly large: string
}

export default styles

// 或使用 typed-css-modules 自动生成
// npm install -D typed-css-modules
// tcm src/**/*.module.css
```

### 4. Vite 配置

```javascript
// vite.config.js
export default {
  css: {
    modules: {
      // 类名生成规则
      generateScopedName: '[name]__[local]___[hash:base64:5]',
      // 驼峰命名转换
      localsConvention: 'camelCaseOnly'
    }
  }
}
```

---

## 六、Tailwind CSS (实用优先)

### 1. 安装配置

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3498db',
        secondary: '#2ecc71'
      },
      spacing: {
        '128': '32rem'
      }
    }
  },
  plugins: []
}
```

```css
/* index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2. 基本用法

```jsx
function Button({ children, variant = 'primary' }) {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors'
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  }

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  )
}

// 复杂布局示例
function Card() {
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div className="md:flex">
        <div className="md:shrink-0">
          <img className="h-48 w-full object-cover md:h-full md:w-48" src="/img.jpg" alt="" />
        </div>
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
            Case study
          </div>
          <h2 className="mt-1 text-lg font-medium text-gray-900">
            标题
          </h2>
          <p className="mt-2 text-gray-500">
            描述文字...
          </p>
        </div>
      </div>
    </div>
  )
}
```

### 3. 响应式设计

```jsx
// 移动优先的响应式
<div className="
  w-full        /* 默认全宽 */
  md:w-1/2      /* 中等屏幕半宽 */
  lg:w-1/3      /* 大屏幕三分之一 */
  xl:w-1/4      /* 超大屏幕四分之一 */
">
  响应式元素
</div>

// 断点
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px
```

### 4. 状态变体

```jsx
<button className="
  bg-blue-500
  hover:bg-blue-600      /* 悬停 */
  focus:ring-2           /* 聚焦 */
  focus:ring-blue-300
  active:bg-blue-700     /* 点击 */
  disabled:opacity-50    /* 禁用 */
  disabled:cursor-not-allowed
">
  按钮
</button>

// 暗色模式
<div className="bg-white dark:bg-gray-800 text-black dark:text-white">
  支持暗色模式
</div>

// 组合状态
<input className="
  border
  border-gray-300
  focus:border-blue-500
  focus:ring-1
  focus:ring-blue-500
  invalid:border-red-500
  disabled:bg-gray-100
" />
```

### 5. @apply 提取组件

```css
/* styles.css */
@layer components {
  .btn {
    @apply px-4 py-2 rounded font-medium transition-colors;
  }

  .btn-primary {
    @apply btn bg-blue-500 text-white hover:bg-blue-600;
  }

  .btn-secondary {
    @apply btn bg-gray-200 text-gray-800 hover:bg-gray-300;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }

  .input {
    @apply w-full px-3 py-2 border border-gray-300 rounded
           focus:outline-none focus:ring-2 focus:ring-blue-500;
  }
}
```

### 6. 与 React 组件库结合

```jsx
// clsx + tailwind-merge
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 使用
function Button({ className, variant, ...props }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded font-medium',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-800',
        className  // 允许外部覆盖
      )}
      {...props}
    />
  )
}

// 使用时可覆盖
<Button variant="primary" className="px-8">  // px-8 会覆盖 px-4
  大按钮
</Button>
```

---

## 七、性能优化

### 1. styled-components 优化

```jsx
// 1. 避免在组件内部定义 styled 组件
// ❌ 每次渲染都创建新组件
function BadExample() {
  const Button = styled.button`...`  // 不要这样做
  return <Button>按钮</Button>
}

// ✅ 在组件外部定义
const Button = styled.button`...`
function GoodExample() {
  return <Button>按钮</Button>
}

// 2. 使用 shouldForwardProp 避免 DOM 警告
const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !['primary', 'size'].includes(prop)
})`
  background: ${props => props.primary ? 'blue' : 'white'};
`

// 3. 使用 attrs 减少重复计算
const Input = styled.input.attrs(props => ({
  type: 'text',
  size: props.size || '1em'
}))`
  font-size: ${props => props.size};
`
```

### 2. Emotion 优化

```jsx
// 1. 使用对象语法（更好的缓存）
const style = css({
  color: 'blue'
})

// 2. 提取静态样式
const staticStyle = css`
  padding: 10px;
  border-radius: 4px;
`

function Component({ color }) {
  return (
    <div css={[staticStyle, { color }]}>
      内容
    </div>
  )
}

// 3. Babel 插件优化
// babel.config.js
{
  "plugins": ["@emotion/babel-plugin"]
}
```

### 3. 通用优化策略

```javascript
/**
 * 1. 避免运行时动态生成样式类名
 * 2. 使用 CSS 变量处理主题
 * 3. 考虑零运行时方案
 * 4. 使用代码分割按需加载样式
 * 5. SSR 场景提取关键 CSS
 */

// CSS 变量方案
const Button = styled.button`
  background: var(--color-primary);
  color: var(--color-text);
`

// 在根元素设置变量
document.documentElement.style.setProperty('--color-primary', '#3498db')
```

---

## 八、方案选择指南

### 选择 styled-components

```
- 团队熟悉 CSS-in-JS
- 需要强大的主题系统
- 项目以组件库为主
- React 生态
```

### 选择 Emotion

```
- 需要灵活的 API (css prop + styled)
- 对包大小敏感
- 需要更好的性能
- 同时支持 React 和其他框架
```

### 选择 CSS Modules

```
- 团队熟悉传统 CSS
- 对运行时性能要求高
- 需要渐进式迁移
- SSR 场景
```

### 选择 Tailwind CSS

```
- 快速原型开发
- 设计系统约束
- 团队协作一致性
- 不想写自定义 CSS
```

---

## 九、高频面试题

::: details 1. CSS-in-JS 的优缺点？
```
优点:
- 样式隔离，避免全局污染
- 动态样式，基于状态计算
- 组件化，样式与组件绑定
- 死代码消除
- TypeScript 支持

缺点:
- 运行时开销
- 包体积增大
- 学习成本
- SSR 配置复杂
- 调试困难
```
:::

::: details 2. styled-components vs Emotion？
```
styled-components:
- API 更简洁
- 社区更成熟
- 只有 styled API

Emotion:
- 支持 css prop + styled 两种方式
- 包更小
- 有零运行时版本 (@emotion/css)
- 更灵活

选择建议:
- 纯 styled 写法选 styled-components
- 需要灵活性选 Emotion
```
:::

::: details 3. CSS Modules vs CSS-in-JS？
```
CSS Modules:
- 零运行时
- 学习成本低
- 静态分析友好
- 动态样式需要额外处理

CSS-in-JS:
- 运行时开销
- 动态样式原生支持
- 更好的 JS 集成
- 主题系统内置
```
:::

::: details 4. 如何处理 CSS-in-JS 的 SSR？
```javascript
// styled-components
import { ServerStyleSheet } from 'styled-components'
const sheet = new ServerStyleSheet()
const html = renderToString(sheet.collectStyles(<App />))
const styles = sheet.getStyleTags()

// Emotion
import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache)
```
:::

::: details 5. Tailwind CSS 的优缺点？
```
优点:
- 开发速度快
- 一致性强
- 零运行时
- 包大小小 (PurgeCSS)
- 响应式内置

缺点:
- HTML 类名冗长
- 学习曲线
- 定制需要配置
- 可读性差
```
:::

::: details 6. 如何在大型项目中组织 CSS-in-JS？
```javascript
// 1. 组件级样式
// Button/Button.styles.js
export const StyledButton = styled.button`...`
export const ButtonIcon = styled.span`...`

// Button/Button.jsx
import { StyledButton, ButtonIcon } from './Button.styles'

// 2. 主题和全局样式
// styles/theme.js
// styles/globalStyles.js
// styles/mixins.js

// 3. 共享样式
// styles/shared/buttons.js
// styles/shared/typography.js

// 4. 类型定义
// styles/styled.d.ts
```
:::
