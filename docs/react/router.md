# React Router

React Router 是 React 生态中最流行的路由解决方案，用于实现单页应用的路由管理。

## 基本概念

### 安装

```bash
npm install react-router-dom
```

### 核心组件

- `BrowserRouter`: 使用 HTML5 History API 的路由容器
- `Routes`: 路由匹配容器
- `Route`: 定义路径与组件的映射
- `Link`: 导航链接
- `Navigate`: 重定向组件

## 基础用法

### 路由配置

```jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      {/* 导航链接 */}
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
        <Link to="/users">用户</Link>
      </nav>

      {/* 路由配置 */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users" element={<Users />} />
        {/* 404 页面 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### 路由参数

```jsx
// 定义动态路由
<Route path="/user/:id" element={<UserDetail />} />
<Route path="/post/:postId/comment/:commentId" element={<Comment />} />

// 获取路由参数
import { useParams } from 'react-router-dom'

function UserDetail() {
  const { id } = useParams()
  return <div>用户 ID: {id}</div>
}

function Comment() {
  const { postId, commentId } = useParams()
  return (
    <div>
      文章: {postId}, 评论: {commentId}
    </div>
  )
}
```

### 查询参数

```jsx
import { useSearchParams } from 'react-router-dom'

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams()

  // 获取参数 ?page=1&category=books
  const page = searchParams.get('page') || '1'
  const category = searchParams.get('category')

  // 设置参数
  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage, category })
  }

  return (
    <div>
      <p>当前页: {page}</p>
      <button onClick={() => handlePageChange(Number(page) + 1)}>
        下一页
      </button>
    </div>
  )
}
```

## 编程式导航

```jsx
import { useNavigate, useLocation } from 'react-router-dom'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogin = async () => {
    await login()

    // 基本导航
    navigate('/dashboard')

    // 替换当前历史记录
    navigate('/dashboard', { replace: true })

    // 携带状态
    navigate('/dashboard', { state: { from: location } })

    // 后退
    navigate(-1)

    // 前进
    navigate(1)
  }

  return <button onClick={handleLogin}>登录</button>
}

// 获取传递的状态
function Dashboard() {
  const location = useLocation()
  const from = location.state?.from

  return <div>来自: {from?.pathname}</div>
}
```

## 嵌套路由

```jsx
// 定义嵌套路由
function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="users" element={<Users />}>
          <Route index element={<UserList />} />
          <Route path=":id" element={<UserDetail />} />
        </Route>
      </Route>
    </Routes>
  )
}

// 父路由组件需要 Outlet
import { Outlet, Link } from 'react-router-dom'

function Layout() {
  return (
    <div>
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
        <Link to="/users">用户</Link>
      </nav>

      <main>
        {/* 子路由渲染位置 */}
        <Outlet />
      </main>

      <footer>Footer</footer>
    </div>
  )
}

function Users() {
  return (
    <div>
      <h2>用户管理</h2>
      <Outlet />  {/* UserList 或 UserDetail */}
    </div>
  )
}
```

## 路由守卫

### 权限验证

```jsx
import { Navigate, useLocation } from 'react-router-dom'

// 认证 Context
const AuthContext = createContext()

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = (userData) => setUser(userData)
  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  return useContext(AuthContext)
}

// 路由守卫组件
function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    // 保存当前位置，登录后跳回
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

// 使用
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

### 角色权限

```jsx
function RequireRole({ children, roles }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

// 使用
<Route
  path="/admin"
  element={
    <RequireRole roles={['admin', 'superadmin']}>
      <AdminPanel />
    </RequireRole>
  }
/>
```

## 路由懒加载

```jsx
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// 懒加载页面组件
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

// 加载中组件
function Loading() {
  return <div className="loading">加载中...</div>
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

## 路由配置式写法

```jsx
import { useRoutes } from 'react-router-dom'

const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      {
        path: 'users',
        element: <Users />,
        children: [
          { index: true, element: <UserList /> },
          { path: ':id', element: <UserDetail /> }
        ]
      }
    ]
  },
  { path: '/login', element: <Login /> },
  { path: '*', element: <NotFound /> }
]

function App() {
  const element = useRoutes(routes)

  return (
    <BrowserRouter>
      {element}
    </BrowserRouter>
  )
}
```

## 常用 Hooks

```jsx
import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
  useMatch,
  useOutletContext
} from 'react-router-dom'

function Example() {
  // 编程式导航
  const navigate = useNavigate()

  // 路由参数 /user/:id
  const { id } = useParams()

  // 查询参数 ?page=1
  const [searchParams, setSearchParams] = useSearchParams()

  // 当前位置信息
  const location = useLocation()
  // { pathname, search, hash, state, key }

  // 匹配路由
  const match = useMatch('/user/:id')
  // 返回匹配信息或 null

  // 获取父路由传递的上下文
  const context = useOutletContext()

  return <div>...</div>
}

// 父组件传递上下文
function Parent() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Outlet context={{ count, setCount }} />
    </div>
  )
}
```

## NavLink 活动链接

```jsx
import { NavLink } from 'react-router-dom'

function Navigation() {
  return (
    <nav>
      {/* 自动添加 active 类 */}
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? 'nav-link active' : 'nav-link'
        }
      >
        首页
      </NavLink>

      {/* 使用 style */}
      <NavLink
        to="/about"
        style={({ isActive }) => ({
          color: isActive ? 'red' : 'black'
        })}
      >
        关于
      </NavLink>

      {/* end 属性：精确匹配 */}
      <NavLink to="/users" end>
        用户列表
      </NavLink>
    </nav>
  )
}
```

## 路由模式

### Hash 模式

```jsx
import { HashRouter } from 'react-router-dom'

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* URL: http://example.com/#/about */}
        <Route path="/about" element={<About />} />
      </Routes>
    </HashRouter>
  )
}
```

### History 模式

```jsx
import { BrowserRouter } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* URL: http://example.com/about */}
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}

// 需要服务器配置支持
// Nginx 配置
// location / {
//   try_files $uri $uri/ /index.html;
// }
```

## 滚动恢复

```jsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// 路由切换时滚动到顶部
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ... */}
      </Routes>
    </BrowserRouter>
  )
}
```

