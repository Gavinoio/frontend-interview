# Next.js

## 概述

Next.js 是由 Vercel 开发的 React 服务端渲染（SSR）框架，提供了开箱即用的服务端渲染、静态站点生成、API 路由、文件系统路由等功能，是目前最流行的 React 全栈框架。

### Next.js 的核心优势

1. **混合渲染**：同一项目支持 SSR、SSG、ISR、CSR 多种渲染模式
2. **零配置**：开箱即用，约定优于配置
3. **文件系统路由**：基于目录结构自动生成路由
4. **API 路由**：全栈开发，无需单独后端
5. **优秀的 DX**：快速刷新、TypeScript 支持
6. **性能优化**：图片优化、字体优化、代码分割

### App Router vs Pages Router

Next.js 13 引入了 App Router，是新的路由系统：

| 特性 | Pages Router | App Router |
|------|--------------|------------|
| 目录 | `pages/` | `app/` |
| 布局 | `_app.js`、`_document.js` | `layout.js` |
| 数据获取 | `getServerSideProps`、`getStaticProps` | `async` 组件 + `fetch` |
| 服务端组件 | 不支持 | 默认支持 |
| 流式渲染 | 不支持 | 支持 |
| 推荐程度 | 稳定但旧 | 推荐使用 |

## App Router 核心特性

### 1. 文件系统路由

```
app/
├── page.tsx              → /
├── about/
│   └── page.tsx          → /about
├── blog/
│   ├── page.tsx          → /blog
│   └── [slug]/
│       └── page.tsx      → /blog/:slug（动态路由）
├── shop/
│   └── [...slug]/
│       └── page.tsx      → /shop/*（捕获所有）
├── (marketing)/          → 路由分组（不影响 URL）
│   ├── about/
│   └── contact/
└── @modal/               → 并行路由
    └── login/
```

**特殊文件约定**：

| 文件 | 作用 |
|------|------|
| `page.tsx` | 页面组件 |
| `layout.tsx` | 布局（嵌套、持久化） |
| `loading.tsx` | 加载状态 |
| `error.tsx` | 错误边界 |
| `not-found.tsx` | 404 页面 |
| `template.tsx` | 模板（每次导航重新渲染） |
| `route.ts` | API 路由 |

### 2. 服务端组件（Server Components）

Next.js 13+ 默认使用 React Server Components：

```tsx
// app/users/page.tsx - 默认是服务端组件
async function UsersPage() {
  // 直接在组件中获取数据，不需要 useEffect
  const users = await fetch('https://api.example.com/users').then(r => r.json())

  return (
    <div>
      <h1>用户列表</h1>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}

export default UsersPage
```

**服务端组件 vs 客户端组件**：

```tsx
// 服务端组件（默认）
// - 可以直接访问后端资源（数据库、文件系统）
// - 不能使用 useState、useEffect 等 Hooks
// - 不能使用浏览器 API
// - 不能添加事件处理器

// 客户端组件（需要 'use client' 指令）
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(c => c + 1)}>
      点击次数：{count}
    </button>
  )
}
```

**组件选择指南**：

| 场景 | 推荐 |
|------|------|
| 获取数据 | 服务端组件 |
| 访问后端资源 | 服务端组件 |
| 敏感信息（API 密钥） | 服务端组件 |
| 减少客户端 JS | 服务端组件 |
| 交互和事件 | 客户端组件 |
| useState/useEffect | 客户端组件 |
| 浏览器 API | 客户端组件 |
| 自定义 Hooks | 客户端组件 |

### 3. 数据获取

```tsx
// 方式1：服务端组件直接 fetch
async function PostsPage() {
  // 默认缓存，等同于 SSG
  const posts = await fetch('https://api.example.com/posts').then(r => r.json())

  // 不缓存，每次请求都重新获取，等同于 SSR
  const dynamic = await fetch('https://api.example.com/data', {
    cache: 'no-store'
  }).then(r => r.json())

  // 定时重新验证，等同于 ISR
  const revalidated = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 } // 60秒
  }).then(r => r.json())

  return <div>{/* ... */}</div>
}

// 方式2：使用 ORM/数据库（服务端组件可直接访问）
import { db } from '@/lib/db'

async function UsersPage() {
  const users = await db.user.findMany()
  return <div>{/* ... */}</div>
}

// 方式3：并行数据获取
async function Dashboard() {
  // 并行请求，提高性能
  const [users, posts, comments] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json())
  ])

  return <div>{/* ... */}</div>
}
```

### 4. 缓存策略

```tsx
// 静态数据（构建时获取，默认行为）
fetch('https://api.example.com/posts')
// 等同于
fetch('https://api.example.com/posts', { cache: 'force-cache' })

// 动态数据（每次请求都获取）
fetch('https://api.example.com/posts', { cache: 'no-store' })

// 定时重新验证（ISR）
fetch('https://api.example.com/posts', {
  next: { revalidate: 3600 } // 1小时
})

// 按需重新验证
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: Request) {
  // 重新验证特定路径
  revalidatePath('/blog')

  // 重新验证特定标签
  revalidateTag('posts')

  return Response.json({ revalidated: true })
}

// 使用标签的 fetch
fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] }
})
```

### 5. 布局系统

```tsx
// app/layout.tsx - 根布局（必需）
export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <header>导航栏</header>
        {children}
        <footer>页脚</footer>
      </body>
    </html>
  )
}

// app/blog/layout.tsx - 嵌套布局
export default function BlogLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="blog-layout">
      <aside>博客侧边栏</aside>
      <main>{children}</main>
    </div>
  )
}

// 布局不会重新渲染，状态会保持
// 如果需要每次导航都重新渲染，使用 template.tsx
```

### 6. 加载和错误处理

```tsx
// app/blog/loading.tsx - 加载状态
export default function Loading() {
  return (
    <div className="loading">
      <div className="spinner" />
      <p>加载中...</p>
    </div>
  )
}

// app/blog/error.tsx - 错误边界
'use client' // 必须是客户端组件

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="error">
      <h2>出错了！</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>重试</button>
    </div>
  )
}

// app/blog/not-found.tsx - 404 页面
export default function NotFound() {
  return (
    <div>
      <h2>页面不存在</h2>
      <p>找不到请求的资源</p>
    </div>
  )
}

// 在服务端组件中触发 404
import { notFound } from 'next/navigation'

async function PostPage({ params }) {
  const post = await getPost(params.id)

  if (!post) {
    notFound() // 触发 not-found.tsx
  }

  return <div>{post.title}</div>
}
```

### 7. API 路由（Route Handlers）

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

// GET 请求
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = searchParams.get('page') || '1'

  const users = await db.user.findMany({
    skip: (parseInt(page) - 1) * 10,
    take: 10
  })

  return NextResponse.json(users)
}

// POST 请求
export async function POST(request: NextRequest) {
  const body = await request.json()

  const user = await db.user.create({
    data: body
  })

  return NextResponse.json(user, { status: 201 })
}

// app/api/users/[id]/route.ts - 动态路由
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await db.user.findUnique({
    where: { id: params.id }
  })

  if (!user) {
    return NextResponse.json(
      { error: '用户不存在' },
      { status: 404 }
    )
  }

  return NextResponse.json(user)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await db.user.delete({
    where: { id: params.id }
  })

  return new NextResponse(null, { status: 204 })
}
```

### 8. 中间件

```typescript
// middleware.ts（项目根目录）
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 获取 token
  const token = request.cookies.get('token')?.value

  // 保护路由
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 添加请求头
  const response = NextResponse.next()
  response.headers.set('x-custom-header', 'custom-value')

  // 重写 URL
  if (request.nextUrl.pathname === '/old-path') {
    return NextResponse.rewrite(new URL('/new-path', request.url))
  }

  return response
}

// 配置匹配路径
export const config = {
  matcher: [
    // 匹配所有路径，除了静态资源
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
```

### 9. 元数据和 SEO

```tsx
// app/layout.tsx - 静态元数据
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: '网站标题',
    template: '%s | 网站名称' // 子页面标题模板
  },
  description: '网站描述',
  keywords: ['关键词1', '关键词2'],
  authors: [{ name: '作者' }],
  openGraph: {
    title: 'OG 标题',
    description: 'OG 描述',
    images: ['/og-image.jpg']
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Twitter 标题',
    description: 'Twitter 描述'
  }
}

// app/blog/[slug]/page.tsx - 动态元数据
export async function generateMetadata({
  params
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPost(params.slug)

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage]
    }
  }
}
```

### 10. 图片和字体优化

```tsx
// 图片优化
import Image from 'next/image'

export default function Gallery() {
  return (
    <div>
      {/* 本地图片 */}
      <Image
        src="/images/photo.jpg"
        alt="照片"
        width={800}
        height={600}
        priority // 优先加载（LCP 图片）
      />

      {/* 远程图片 */}
      <Image
        src="https://example.com/image.jpg"
        alt="远程图片"
        width={400}
        height={300}
        placeholder="blur" // 模糊占位
        blurDataURL="data:image/..." // 占位图
      />

      {/* 响应式图片 */}
      <Image
        src="/hero.jpg"
        alt="英雄图"
        fill // 填充父容器
        sizes="(max-width: 768px) 100vw, 50vw"
        style={{ objectFit: 'cover' }}
      />
    </div>
  )
}

// 字体优化
// app/layout.tsx
import { Inter, Noto_Sans_SC } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

const notoSansSC = Noto_Sans_SC({
  subsets: ['chinese-simplified'],
  weight: ['400', '700'],
  variable: '--font-noto'
})

export default function RootLayout({ children }) {
  return (
    <html className={`${inter.variable} ${notoSansSC.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

## Server Actions

Next.js 14 引入的服务端操作，简化表单处理：

```tsx
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  // 验证
  if (!title || !content) {
    return { error: '标题和内容不能为空' }
  }

  // 保存到数据库
  const post = await db.post.create({
    data: { title, content }
  })

  // 重新验证缓存
  revalidatePath('/posts')

  // 重定向
  redirect(`/posts/${post.id}`)
}

export async function deletePost(id: string) {
  await db.post.delete({ where: { id } })
  revalidatePath('/posts')
}

// app/posts/new/page.tsx
import { createPost } from '../actions'

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input type="text" name="title" placeholder="标题" required />
      <textarea name="content" placeholder="内容" required />
      <button type="submit">发布</button>
    </form>
  )
}

// 客户端组件中使用
'use client'

import { useFormStatus, useFormState } from 'react-dom'
import { createPost } from '../actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}>
      {pending ? '提交中...' : '提交'}
    </button>
  )
}

export default function PostForm() {
  const [state, formAction] = useFormState(createPost, null)

  return (
    <form action={formAction}>
      {state?.error && <p className="error">{state.error}</p>}
      <input type="text" name="title" />
      <textarea name="content" />
      <SubmitButton />
    </form>
  )
}
```

## 项目结构

```
my-next-app/
├── app/                    # App Router
│   ├── (auth)/            # 路由分组
│   │   ├── login/
│   │   └── register/
│   ├── (marketing)/
│   │   ├── about/
│   │   └── contact/
│   ├── api/               # API 路由
│   │   └── users/
│   │       └── route.ts
│   ├── blog/
│   │   ├── [slug]/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx         # 根布局
│   ├── loading.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   └── page.tsx           # 首页
├── components/            # 组件
│   ├── ui/               # UI 组件
│   └── features/         # 功能组件
├── lib/                  # 工具库
│   ├── db.ts            # 数据库连接
│   └── utils.ts
├── public/               # 静态资源
├── middleware.ts         # 中间件
├── next.config.js        # Next.js 配置
├── tailwind.config.js
└── package.json
```

## 常见面试题

::: details 1. Next.js 的渲染模式有哪些？
<details>
<summary>点击查看答案</summary>

**一句话答案**：SSR（服务端渲染）、SSG（静态生成）、ISR（增量静态再生）、CSR（客户端渲染）。

```tsx
// SSG - 静态生成（默认，构建时生成）
async function Page() {
  const data = await fetch('https://api.example.com/data')
  return <div>{data}</div>
}

// SSR - 服务端渲染（每次请求都渲染）
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store'
  })
  return <div>{data}</div>
}

// ISR - 增量静态再生（定时更新）
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 }
  })
  return <div>{data}</div>
}

// CSR - 客户端渲染
'use client'
function Page() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData)
  }, [])
  return <div>{data}</div>
}
```

**口语化回答**：
"Next.js 支持四种渲染模式：
1. **SSG** - 静态生成，构建时生成 HTML，性能最好，适合博客、文档
2. **SSR** - 服务端渲染，每次请求都渲染，适合动态内容
3. **ISR** - 增量静态再生，结合了 SSG 和 SSR，页面定期更新
4. **CSR** - 客户端渲染，用于交互性强的组件

App Router 里通过 fetch 的 cache 选项控制：默认缓存是 SSG，no-store 是 SSR，revalidate 是 ISR。"
:::

</details>

::: details 2. React Server Components 和传统 SSR 有什么区别？
<details>
<summary>点击查看答案</summary>

**一句话答案**：传统 SSR 是整页渲染然后激活，RSC 是组件级别的服务端渲染，且不需要激活。

| 特性 | 传统 SSR | React Server Components |
|------|---------|------------------------|
| 渲染粒度 | 整页 | 组件级别 |
| 激活（Hydration） | 需要，整页激活 | 服务端组件无需激活 |
| JavaScript 体积 | 大，包含所有组件 | 小，只包含客户端组件 |
| 状态和交互 | 激活后可用 | 服务端组件不支持 |
| 数据获取 | getServerSideProps | 组件内直接 async/await |

**口语化回答**：
"传统 SSR 是把整个页面在服务器渲染成 HTML，然后客户端下载所有 JS 代码进行激活，让页面变成可交互的。RSC 是 React 18 的新特性，可以在组件级别区分服务端和客户端组件。服务端组件只在服务器运行，不会打包到客户端，也不需要激活。这样客户端 JS 体积更小，首屏更快。但服务端组件不能有交互，需要交互的部分用客户端组件。"
:::

</details>

::: details 3. App Router 和 Pages Router 的区别？
<details>
<summary>点击查看答案</summary>

**一句话答案**：App Router 是新的路由系统，支持 RSC、嵌套布局、流式渲染；Pages Router 是旧系统，更简单但功能少。

| 特性 | Pages Router | App Router |
|------|--------------|------------|
| 目录 | `pages/` | `app/` |
| 服务端组件 | 不支持 | 默认支持 |
| 布局 | `_app.js` | `layout.tsx` |
| 数据获取 | getServerSideProps | async 组件 |
| 流式渲染 | 不支持 | 支持 |
| 加载状态 | 手动处理 | loading.tsx |
| 错误处理 | 手动处理 | error.tsx |

**口语化回答**：
"Pages Router 是 Next.js 最早的路由系统，基于 pages 目录，用 getServerSideProps、getStaticProps 获取数据，比较简单直接。App Router 是 Next.js 13 引入的新系统，基于 app 目录，默认使用 React Server Components，支持嵌套布局、流式渲染、loading/error 文件约定。App Router 更强大但学习曲线稍陡，新项目推荐用 App Router。"
:::

</details>

::: details 4. Next.js 中如何实现登录鉴权？
<details>
<summary>点击查看答案</summary>

**一句话答案**：使用中间件检查 cookie/token，配合 Server Actions 处理登录逻辑。

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // 需要登录的路由
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 已登录不能访问登录页
  if (request.nextUrl.pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// app/actions/auth.ts
'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email')
  const password = formData.get('password')

  // 验证用户
  const user = await authenticate(email, password)
  if (!user) {
    return { error: '邮箱或密码错误' }
  }

  // 设置 cookie
  cookies().set('token', generateToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7 // 7天
  })

  redirect('/dashboard')
}
```

**口语化回答**：
"Next.js 鉴权的核心是中间件。在 middleware.ts 里检查 cookie 中的 token，保护需要登录的路由。登录逻辑用 Server Actions 处理，验证成功后用 cookies() 设置 httpOnly cookie。这样整个流程都在服务端，安全性好。也可以用 NextAuth.js 这样的库，它封装了 OAuth、JWT 等常见鉴权方式。"
:::

</details>

::: details 5. Next.js Image 组件有什么优势？
<details>
<summary>点击查看答案</summary>

**一句话答案**：自动优化图片大小、格式，支持懒加载、响应式、占位图。

```tsx
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="英雄图"
  width={800}
  height={600}
  priority           // LCP 图片优先加载
  placeholder="blur" // 模糊占位
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

**核心功能**：
1. **自动优化**：根据设备自动调整图片大小
2. **格式转换**：自动转为 WebP/AVIF
3. **懒加载**：默认懒加载，进入视口才加载
4. **防止布局偏移**：必须指定宽高，避免 CLS
5. **响应式**：sizes 属性支持响应式图片
6. **占位图**：blur 占位防止闪烁

**口语化回答**：
"Next.js 的 Image 组件做了很多优化。首先是自动调整大小，根据访问设备返回合适尺寸的图片，省流量。其次自动转成 WebP 等现代格式，体积更小。还有懒加载，图片进入视口才加载。必须指定宽高是为了避免布局偏移，提升 CLS 分数。还支持模糊占位图，用户体验更好。用了 Image 组件，Lighthouse 图片相关的分数会明显提高。"
:::

</details>

::: details 6. Server Actions 是什么？有什么优势？
<details>
<summary>点击查看答案</summary>

**一句话答案**：Server Actions 是在服务端执行的函数，可以直接在表单 action 中使用，简化数据变更操作。

```tsx
// app/actions.ts
'use server'

export async function createPost(formData: FormData) {
  const title = formData.get('title')
  await db.post.create({ data: { title } })
  revalidatePath('/posts')
}

// 使用
<form action={createPost}>
  <input name="title" />
  <button type="submit">创建</button>
</form>
```

**优势**：
1. **简化代码**：不需要创建 API 路由
2. **类型安全**：TypeScript 全程支持
3. **渐进增强**：即使 JS 禁用也能工作
4. **自动集成**：与 revalidatePath、redirect 等 API 无缝配合
5. **减少客户端代码**：逻辑在服务端执行

**口语化回答**：
"Server Actions 是 Next.js 14 的新特性，让表单处理变得超级简单。以前提交表单要创建 API 路由、写 fetch 请求，现在直接把服务端函数传给 form 的 action 属性就行。它本质上还是 POST 请求，但 Next.js 帮你处理了序列化、错误处理等细节。而且支持渐进增强，即使 JavaScript 禁用，表单也能正常提交。配合 useFormStatus 还能做加载状态，非常方便。"
:::

</details>

::: details 7. Next.js 中间件能做什么？
<details>
<summary>点击查看答案</summary>

**一句话答案**：中间件在请求到达页面前执行，可以做鉴权、重定向、重写、添加响应头等。

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. 鉴权
  const token = request.cookies.get('token')
  if (!token && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. 重定向
  if (request.nextUrl.pathname === '/old-page') {
    return NextResponse.redirect(new URL('/new-page', request.url))
  }

  // 3. 重写（URL 不变，内容变）
  if (request.nextUrl.pathname === '/api/proxy') {
    return NextResponse.rewrite(new URL('https://api.external.com/data'))
  }

  // 4. 添加响应头
  const response = NextResponse.next()
  response.headers.set('x-custom-header', 'value')

  // 5. 地理位置路由
  const country = request.geo?.country || 'US'
  if (country === 'CN') {
    return NextResponse.rewrite(new URL('/cn' + request.nextUrl.pathname))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|favicon.ico).*)']
}
```

**口语化回答**：
"Next.js 中间件在 Edge Runtime 运行，请求到达页面前就会执行，非常快。常见用途有：鉴权检查，未登录重定向到登录页；URL 重定向，比如旧页面跳新页面；URL 重写，把请求代理到其他服务；设置响应头；A/B 测试；地理位置路由等。中间件的 matcher 配置可以指定哪些路径需要经过中间件，通常排除静态资源和 API 路由。"
:::

</details>

::: details 8. 如何优化 Next.js 应用性能？
<details>
<summary>点击查看答案</summary>

**一句话答案**：使用 SSG/ISR 减少服务器压力，Image 组件优化图片，代码分割减少 JS 体积，合理使用缓存。

**优化策略**：

```tsx
// 1. 使用适当的渲染模式
// 静态内容用 SSG，动态内容用 SSR/ISR
fetch(url, { next: { revalidate: 60 } }) // ISR

// 2. 图片优化
import Image from 'next/image'
<Image src="/hero.jpg" priority /> // LCP 图片优先加载

// 3. 字体优化
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })

// 4. 动态导入减少首屏 JS
import dynamic from 'next/dynamic'
const HeavyComponent = dynamic(() => import('./Heavy'), {
  loading: () => <p>加载中...</p>,
  ssr: false // 仅客户端渲染
})

// 5. 服务端组件减少客户端 JS
// 默认是服务端组件，只有需要交互的才用 'use client'

// 6. 并行数据获取
const [users, posts] = await Promise.all([
  fetch('/api/users'),
  fetch('/api/posts')
])

// 7. 使用 React Suspense 流式渲染
import { Suspense } from 'react'
<Suspense fallback={<Loading />}>
  <SlowComponent />
</Suspense>
```

**口语化回答**：
"Next.js 性能优化主要从几个方面：
1. **渲染模式**：能静态就静态，用 SSG 或 ISR
2. **图片**：用 Image 组件，自动优化
3. **字体**：用 next/font，避免布局偏移
4. **代码分割**：动态导入大组件，减少首屏 JS
5. **服务端组件**：默认服务端，减少客户端 JS
6. **并行请求**：Promise.all 并行获取数据
7. **流式渲染**：Suspense 让页面渐进显示

核心思路是减少客户端 JS、优化静态资源、利用缓存。"
:::

</details>

## 总结

::: details Next.js 核心知识点
| 概念 | 说明 |
|------|------|
| App Router | 新的路由系统，支持 RSC、嵌套布局 |
| Server Components | 服务端组件，默认使用，减少客户端 JS |
| 数据获取 | async 组件 + fetch，通过 cache 选项控制 |
| Server Actions | 服务端函数，简化表单处理 |
| 中间件 | Edge Runtime，鉴权、重定向、重写 |
| 渲染模式 | SSG、SSR、ISR、CSR 可混合使用 |
| 元数据 | Metadata API 处理 SEO |
| 图片优化 | Image 组件自动优化 |
:::

::: details 面试重点
1. SSG/SSR/ISR/CSR 的区别和选择
2. React Server Components 的概念和优势
3. App Router 的特点和使用
4. Server Actions 的使用场景
5. 中间件的作用和常见用法
6. Next.js 性能优化策略
:::
