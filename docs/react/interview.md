# React 面试题精选

> 汇总 React 核心原理、Fiber、Hooks、状态管理、性能优化、路由、Next.js、并发特性等高频面试题。

## 核心原理

### 1. React 的核心特点是什么？

1. **声明式**：描述 UI 应该是什么样子，而非如何操作 DOM
2. **组件化**：UI 拆分为独立可复用的组件
3. **单向数据流**：数据从父组件流向子组件，状态变化可预测
4. **虚拟 DOM**：通过 Diff 算法最小化真实 DOM 操作

---

### 2. 函数组件和类组件的区别？

| 特性 | 函数组件 | 类组件 |
|------|---------|--------|
| 语法 | 简洁 | 繁琐 |
| this | 无 | 有（容易出错） |
| 状态 | Hooks（useState） | this.state |
| 生命周期 | useEffect 模拟 | 完整生命周期方法 |
| 性能 | 略好（无实例开销） | 略差 |
| 推荐 | ✅ 现代 React 首选 | 遗留代码 |

---

### 3. 为什么列表渲染需要 key？

key 帮助 React 在 Diff 时识别节点身份，实现高效复用：
- 有 key：React 可以精确匹配新旧节点，只更新变化的部分
- 无 key：React 按顺序比较，可能产生错误的复用

**不要用 index 作为 key**：列表顺序变化时，index 对应的内容改变，导致错误复用和不必要的重渲染。

---

## Fiber 架构

### 4. 什么是 Fiber？解决了什么问题？

**问题**：React 15 的 Stack Reconciler 是同步递归的，一旦开始无法中断，长时间占用主线程导致页面卡顿（掉帧）。

**Fiber**：将渲染工作拆分为小单元（Fiber 节点），利用浏览器空闲时间（requestIdleCallback 思想）分片执行，可以中断和恢复。

**三个阶段：**
1. **调度（Scheduler）**：按优先级调度任务
2. **协调（Reconciler）**：可中断的 Diff，构建 workInProgress 树
3. **提交（Commit）**：同步执行 DOM 更新（不可中断）

---

### 5. 什么是双缓存机制？

React 同时维护两棵 Fiber 树：
- **current 树**：当前屏幕显示的内容
- **workInProgress 树**：正在构建的新树

更新完成后，`workInProgress` 树变为新的 `current` 树，实现无闪烁切换。

---

### 6. React 渲染流程是什么？

```
触发更新（setState/forceUpdate/ReactDOM.render）
    ↓
调度阶段（Scheduler）：确定优先级，安排执行时机
    ↓
协调阶段（Reconciler）：可中断，Diff 生成 effectList
    ↓
提交阶段（Commit）：不可中断，执行 DOM 操作
    ├── beforeMutation：执行 getSnapshotBeforeUpdate
    ├── mutation：执行 DOM 增删改
    └── layout：执行 componentDidMount/Update，useLayoutEffect
```

---

## Hooks

### 7. Hooks 的实现原理是什么？为什么不能在条件语句中使用？

Hooks 的状态存储在 Fiber 节点的 **链表** 中，按调用顺序依次存储。每次渲染时，React 按顺序读取链表中的值与 Hook 对应。

如果在条件语句中使用 Hook，条件变化时调用顺序改变，导致 Hook 读取到错误的状态。

**规则：**
1. 只在函数组件或自定义 Hook 中调用
2. 只在顶层调用，不能在条件/循环/嵌套函数中调用

---

### 8. useEffect 和 useLayoutEffect 的区别？

| 特性 | useEffect | useLayoutEffect |
|------|-----------|----------------|
| 执行时机 | DOM 更新后，浏览器绘制**后**（异步） | DOM 更新后，浏览器绘制**前**（同步） |
| 是否阻塞绘制 | 否 | 是 |
| 适用场景 | 数据请求、订阅、日志 | 需要同步读取/修改 DOM（避免闪烁） |

**推荐**：优先用 `useEffect`，只有需要同步操作 DOM 时才用 `useLayoutEffect`。

---

### 9. useMemo 和 useCallback 的区别？

```javascript
// useMemo：缓存计算结果（值）
const expensiveValue = useMemo(() => compute(a, b), [a, b]);

// useCallback：缓存函数引用
const handleClick = useCallback(() => doSomething(id), [id]);
```

- `useMemo` 缓存**值**，避免重复计算
- `useCallback` 缓存**函数**，避免子组件因函数引用变化而重渲染

**不要过度使用**：缓存本身有开销，只在确实有性能问题时使用。

---

### 10. useState 和 useReducer 如何选择？

- **useState**：简单的独立状态，逻辑简单
- **useReducer**：多个相关状态、复杂更新逻辑、状态更新依赖前一个状态

```javascript
// useReducer 适合复杂状态
const [state, dispatch] = useReducer(reducer, initialState);
dispatch({ type: 'INCREMENT', payload: 1 });
```

---

### 11. 如何实现自定义 Hook？

自定义 Hook 是以 `use` 开头的函数，内部可以调用其他 Hook，用于复用有状态的逻辑：

```javascript
function useFetch(url) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch(url)
            .then(res => res.json())
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false));
    }, [url]);

    return { data, loading, error };
}
```

---

## 状态管理

### 12. Redux 和 Context 的区别？什么时候用哪个？

| 特性 | Context | Redux |
|------|---------|-------|
| 适用场景 | 低频更新的全局数据（主题、语言） | 复杂状态、高频更新 |
| 性能 | Context 变化导致所有消费者重渲染 | 精确订阅，只更新相关组件 |
| DevTools | 无 | 完善的时间旅行调试 |
| 学习成本 | 低 | 较高 |
| 中间件 | 无 | 支持（redux-thunk、redux-saga） |

**选择原则**：主题/语言/用户信息等低频全局数据用 Context；复杂业务状态、需要调试追踪用 Redux（或 Zustand）。

---

### 13. Redux Toolkit 相比原始 Redux 有什么优势？

1. **简化样板代码**：`createSlice` 自动生成 action creators 和 reducer
2. **内置 Immer**：可以直接"修改" state（实际是不可变更新）
3. **内置 Redux Thunk**：开箱即用的异步支持
4. **`createAsyncThunk`**：标准化异步操作处理
5. **RTK Query**：内置数据请求和缓存方案

---

### 14. Zustand vs Redux Toolkit 如何选择？

| 特性 | Zustand | Redux Toolkit |
|------|---------|---------------|
| 学习成本 | 极低 | 中等 |
| 样板代码 | 极少 | 较少（比原始 Redux 少很多） |
| DevTools | 支持 | 完善 |
| 适用规模 | 中小型项目 | 中大型项目 |
| 异步处理 | 直接在 action 中 | createAsyncThunk |

---

### 15. React Query 和 Redux 的区别？

- **React Query**：专注于**服务端状态**（数据请求、缓存、同步），自动处理 loading/error/refetch
- **Redux**：管理**客户端状态**（UI 状态、业务逻辑）

两者不是竞争关系，可以配合使用：React Query 管理服务端数据，Redux/Zustand 管理客户端状态。

---

## 性能优化

### 16. React.memo、useMemo、useCallback 的区别？

```javascript
// React.memo：缓存组件，props 不变则跳过重渲染
const Child = React.memo(({ value }) => <div>{value}</div>);

// useMemo：缓存计算值
const result = useMemo(() => expensiveCalc(a, b), [a, b]);

// useCallback：缓存函数引用（配合 React.memo 使用）
const handleClick = useCallback(() => onClick(id), [id, onClick]);
```

**三者配合**：父组件用 `useCallback` 稳定函数引用，子组件用 `React.memo` 跳过重渲染。

---

### 17. 如何优化长列表性能？

1. **虚拟化**：只渲染可视区域（react-window、react-virtual）
2. **分页/无限滚动**：减少一次性渲染数量
3. **React.memo**：避免列表项不必要的重渲染
4. **key 优化**：使用稳定唯一的 key

---

## 路由

### 18. BrowserRouter 和 HashRouter 的区别？

| 特性 | BrowserRouter | HashRouter |
|------|--------------|------------|
| URL 格式 | `/path` | `/#/path` |
| 服务器配置 | 需要（所有路径返回 index.html） | 不需要 |
| SEO | 较好 | 较差 |
| 原理 | History API | hash 变化 |

---

### 19. 如何实现路由懒加载？

```javascript
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));

function App() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
            </Routes>
        </Suspense>
    );
}
```

---

## 并发特性（React 18）

### 20. React 18 有哪些重要新特性？

1. **并发渲染**：渲染可中断，优先处理高优先级更新
2. **自动批处理**：所有更新（包括异步中的）自动批处理，减少重渲染
3. **useTransition**：标记非紧急更新，保持 UI 响应
4. **useDeferredValue**：延迟更新低优先级值
5. **Suspense 增强**：支持服务端流式渲染
6. **新的根 API**：`createRoot` 替代 `ReactDOM.render`

---

### 21. useTransition 和 useDeferredValue 的区别？

两者都用于标记低优先级更新，区别在于控制点：

```javascript
// useTransition：控制状态更新（有 isPending 状态）
const [isPending, startTransition] = useTransition();
startTransition(() => {
    setSearchQuery(input); // 标记为低优先级
});

// useDeferredValue：延迟值的更新（适合无法控制更新来源时）
const deferredQuery = useDeferredValue(searchQuery);
// deferredQuery 会滞后于 searchQuery 更新
```

---

## Next.js

### 22. Next.js 的渲染模式有哪些？

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| SSG | 构建时生成静态 HTML | 博客、文档、内容不变的页面 |
| SSR | 每次请求服务端渲染 | 动态内容、需要实时数据 |
| ISR | 定时重新生成静态页面 | 内容定期更新（电商、新闻） |
| CSR | 纯客户端渲染 | 后台管理、不需要 SEO |

---

### 23. App Router 和 Pages Router 的区别？

| 特性 | App Router（推荐） | Pages Router |
|------|------------------|-------------|
| 目录 | `app/` | `pages/` |
| 组件默认类型 | Server Component | Client Component |
| 数据获取 | 直接在组件中 async/await | getServerSideProps/getStaticProps |
| 布局 | `layout.tsx` 嵌套布局 | `_app.tsx` 全局布局 |
| 流式渲染 | 支持 | 不支持 |

---

### 24. React Server Components（RSC）是什么？

RSC 是在服务端运行的组件，不会打包到客户端 JS 中：
- **优势**：直接访问数据库/文件系统，减少客户端 JS 体积，更好的首屏性能
- **限制**：不能使用 useState/useEffect，不能绑定事件
- **与 SSR 的区别**：SSR 在服务端渲染 HTML 后发送给客户端（客户端还需要 hydration），RSC 的组件代码完全不发送到客户端

```javascript
// Server Component（默认）
async function UserProfile({ id }) {
    const user = await db.user.findById(id); // 直接访问数据库
    return <div>{user.name}</div>;
}

// Client Component（需要交互）
'use client';
function Counter() {
    const [count, setCount] = useState(0);
    return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```
