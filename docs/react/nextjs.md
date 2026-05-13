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

