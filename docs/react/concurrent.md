# React 18 并发特性详解

## 概述

React 18 引入了并发渲染（Concurrent Rendering）机制，这是 React 架构的重大升级。并发特性让 React 能够同时准备多个版本的 UI，实现更流畅的用户体验。

## 并发模式核心概念

### 什么是并发渲染？

```javascript
// 传统同步渲染
// 一旦开始渲染，必须完成整个渲染过程
render() → 完成 → 更新 DOM

// 并发渲染
// 渲染可以被中断、暂停、恢复或丢弃
render() → 暂停 → 处理更高优先级任务 → 恢复 → 完成 → 更新 DOM
```

### 并发渲染的优势

```
┌─────────────────────────────────────────────────────────────┐
│                      并发渲染优势                            │
├─────────────────┬─────────────────┬─────────────────────────┤
│   可中断渲染    │   优先级调度     │     保持响应性          │
│ 长时间渲染可暂停 │ 紧急更新优先处理 │ 用户交互不被阻塞        │
└─────────────────┴─────────────────┴─────────────────────────┘
```

## 开启并发模式

### createRoot API

```jsx
// React 17 (Legacy Mode)
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));

// React 18 (Concurrent Mode)
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

### hydrateRoot（SSR）

```jsx
// React 17
import ReactDOM from 'react-dom';
ReactDOM.hydrate(<App />, document.getElementById('root'));

// React 18
import { hydrateRoot } from 'react-dom/client';
hydrateRoot(document.getElementById('root'), <App />);
```

## 自动批处理（Automatic Batching）

### 什么是批处理？

```jsx
// React 17 - 只在事件处理函数中批处理
function handleClick() {
  setCount(c => c + 1);  // 不会立即渲染
  setFlag(f => !f);      // 不会立即渲染
  // 两次更新合并为一次渲染
}

// React 17 - 异步代码中不会批处理
setTimeout(() => {
  setCount(c => c + 1);  // 触发一次渲染
  setFlag(f => !f);      // 触发另一次渲染
}, 1000);
```

```jsx
// React 18 - 所有更新自动批处理
setTimeout(() => {
  setCount(c => c + 1);  // 不会立即渲染
  setFlag(f => !f);      // 不会立即渲染
  // 自动批处理，只渲染一次
}, 1000);

// Promise 中也会批处理
fetch('/api').then(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只渲染一次
});
```

### 退出批处理

```jsx
import { flushSync } from 'react-dom';

function handleClick() {
  flushSync(() => {
    setCount(c => c + 1);
  });
  // DOM 已更新

  flushSync(() => {
    setFlag(f => !f);
  });
  // DOM 再次更新
}
```

## useTransition

### 基本用法

```jsx
import { useState, useTransition } from 'react';

function TabContainer() {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState('home');

  function selectTab(nextTab) {
    // 标记为过渡更新（低优先级）
    startTransition(() => {
      setTab(nextTab);
    });
  }

  return (
    <div>
      <TabButton onClick={() => selectTab('home')}>Home</TabButton>
      <TabButton onClick={() => selectTab('posts')}>Posts</TabButton>
      <TabButton onClick={() => selectTab('contact')}>Contact</TabButton>

      {isPending && <Spinner />}

      <TabContent tab={tab} />
    </div>
  );
}
```

### 区分紧急和非紧急更新

```jsx
function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    const value = e.target.value;

    // 紧急更新：立即更新输入框
    setQuery(value);

    // 非紧急更新：可以延迟的搜索结果
    startTransition(() => {
      setResults(searchData(value));
    });
  }

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending ? <Spinner /> : <SearchResults results={results} />}
    </div>
  );
}
```

### 过渡更新的特点

```jsx
// 1. 可被中断
// 如果用户继续输入，之前的过渡更新会被丢弃

// 2. 不显示 Suspense fallback
// 过渡更新不会触发已显示内容的 fallback

// 3. 保持 UI 响应
// 浏览器在过渡更新间隙可以处理用户输入
```

## useDeferredValue

### 基本用法

```jsx
import { useState, useDeferredValue } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  // 延迟的值
  const deferredQuery = useDeferredValue(query);

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      {/* 使用延迟值渲染，不阻塞输入 */}
      <SearchResults query={deferredQuery} />
    </div>
  );
}
```

### 与 memo 配合使用

```jsx
import { memo, useDeferredValue } from 'react';

// 使用 memo 避免不必要的重渲染
const SlowList = memo(function SlowList({ text }) {
  const items = [];
  for (let i = 0; i < 250; i++) {
    items.push(<SlowItem key={i} text={text} />);
  }
  return <ul>{items}</ul>;
});

function App() {
  const [text, setText] = useState('');
  const deferredText = useDeferredValue(text);

  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      {/* deferredText 变化时才重渲染 SlowList */}
      <SlowList text={deferredText} />
    </>
  );
}
```

### useTransition vs useDeferredValue

```jsx
// useTransition - 包装 setState
// 适用于：可以访问 setState 的场景
const [isPending, startTransition] = useTransition();
startTransition(() => {
  setSearchQuery(input);
});

// useDeferredValue - 包装 value
// 适用于：无法访问 setState，只能获取值的场景
const deferredValue = useDeferredValue(searchQuery);
// 例如：从 props 接收值，从第三方库获取值
```

## Suspense 增强

### 服务端组件支持

```jsx
// 服务端组件 + Suspense
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Comments />
    </Suspense>
  );
}

// Comments 是异步服务端组件
async function Comments() {
  const comments = await fetchComments();
  return (
    <ul>
      {comments.map(c => <li key={c.id}>{c.text}</li>)}
    </ul>
  );
}
```

### 嵌套 Suspense

```jsx
function ProfilePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProfileHeader />
      <Suspense fallback={<PostsSkeleton />}>
        <Posts />
      </Suspense>
      <Suspense fallback={<FriendsSkeleton />}>
        <Friends />
      </Suspense>
    </Suspense>
  );
}
```

### SuspenseList（实验性）

```jsx
import { SuspenseList, Suspense } from 'react';

function ProfilePage() {
  return (
    <SuspenseList revealOrder="forwards" tail="collapsed">
      <Suspense fallback={<Spinner />}>
        <ProfileHeader />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <Posts />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <Friends />
      </Suspense>
    </SuspenseList>
  );
}

// revealOrder: "forwards" | "backwards" | "together"
// tail: "collapsed" | "hidden"
```

## 新 Hooks

### useId

```jsx
import { useId } from 'react';

function PasswordField() {
  const id = useId();

  return (
    <>
      <label htmlFor={id}>Password:</label>
      <input id={id} type="password" />
    </>
  );
}

// 生成唯一 ID，服务端和客户端一致
// 适用于 SSR，避免 hydration 不匹配
```

### useSyncExternalStore

```jsx
import { useSyncExternalStore } from 'react';

// 订阅外部状态（如 Redux store）
function useOnlineStatus() {
  const isOnline = useSyncExternalStore(
    subscribe,     // 订阅函数
    getSnapshot,   // 获取客户端状态
    getServerSnapshot // 获取服务端状态（SSR）
  );
  return isOnline;
}

function subscribe(callback) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true; // 服务端默认在线
}
```

### useInsertionEffect

```jsx
import { useInsertionEffect } from 'react';

// 专门用于 CSS-in-JS 库
// 在 DOM 变更前同步执行，用于注入样式
function useCSS(rule) {
  useInsertionEffect(() => {
    const style = document.createElement('style');
    style.textContent = rule;
    document.head.appendChild(style);
    return () => style.remove();
  });
}

// 执行顺序：useInsertionEffect → useLayoutEffect → useEffect
```

## Streaming SSR

### 流式渲染

```jsx
// server.js
import { renderToPipeableStream } from 'react-dom/server';

app.get('/', (req, res) => {
  const { pipe, abort } = renderToPipeableStream(
    <App />,
    {
      bootstrapScripts: ['/main.js'],
      onShellReady() {
        res.setHeader('Content-Type', 'text/html');
        pipe(res);
      },
      onError(error) {
        console.error(error);
      }
    }
  );

  // 超时处理
  setTimeout(abort, 10000);
});
```

### 选择性 Hydration

```jsx
// 用户交互的部分优先 hydrate
function App() {
  return (
    <div>
      <Header />  {/* 立即 hydrate */}

      <Suspense fallback={<Spinner />}>
        <Sidebar />  {/* 延迟 hydrate */}
      </Suspense>

      <Suspense fallback={<Spinner />}>
        <Comments />  {/* 延迟 hydrate */}
      </Suspense>
    </div>
  );
}

// 如果用户点击 Comments 区域
// React 会优先 hydrate Comments 组件
```

## 优先级调度

### 更新优先级

```javascript
// React 18 的更新优先级（从高到低）
1. 离散事件（click, input）     - 立即更新
2. 连续事件（scroll, drag）     - 高优先级
3. 默认更新                     - 正常优先级
4. Transition 更新              - 低优先级
5. 空闲更新                     - 最低优先级
```

### Lane 模型

```javascript
// React 使用 Lane 模型管理优先级
// 每个 Lane 是一个二进制位

const SyncLane = 0b0000000000000000000000000000001;      // 同步
const InputContinuousLane = 0b0000000000000000000000000000100;  // 连续输入
const DefaultLane = 0b0000000000000000000000000010000;   // 默认
const TransitionLane = 0b0000000000000001000000000000;   // 过渡
const IdleLane = 0b0100000000000000000000000000000;      // 空闲

// 优点：
// 1. 可以批量处理相同优先级的更新
// 2. 可以通过位运算快速判断和合并优先级
```

## 实战示例

### 1. 搜索优化

```jsx
function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e) => {
    const value = e.target.value;

    // 紧急：更新输入框
    setQuery(value);

    // 非紧急：更新搜索结果
    startTransition(async () => {
      const data = await searchAPI(value);
      setResults(data);
    });
  };

  return (
    <div>
      <input
        value={query}
        onChange={handleSearch}
        placeholder="搜索..."
      />

      {isPending && <div className="loading-bar" />}

      <ul className={isPending ? 'stale' : ''}>
        {results.map(item => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 2. 大列表渲染

```jsx
function LargeList({ items }) {
  const [filter, setFilter] = useState('');
  const deferredFilter = useDeferredValue(filter);

  // 使用 memo 避免不必要的重渲染
  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(deferredFilter.toLowerCase())
    );
  }, [items, deferredFilter]);

  const isStale = filter !== deferredFilter;

  return (
    <div>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="过滤..."
      />

      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        {filteredItems.map(item => (
          <ExpensiveItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
```

### 3. Tab 切换优化

```jsx
function TabPanel() {
  const [tab, setTab] = useState('home');
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (newTab) => {
    startTransition(() => {
      setTab(newTab);
    });
  };

  return (
    <div>
      <div className="tabs">
        {['home', 'posts', 'settings'].map(t => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={tab === t ? 'active' : ''}
          >
            {t}
          </button>
        ))}
      </div>

      <div className={`content ${isPending ? 'loading' : ''}`}>
        <Suspense fallback={<TabSkeleton />}>
          <TabContent tab={tab} />
        </Suspense>
      </div>
    </div>
  );
}
```

## 面试常见问题

::: details 1. React 18 并发特性是什么？
并发特性允许 React 同时准备多个版本的 UI，渲染过程可以被中断、暂停和恢复。主要包括：
- 自动批处理
- useTransition 和 useDeferredValue
- Suspense 增强
- 流式 SSR
:::

::: details 2. useTransition 和 useDeferredValue 的区别？
```jsx
// useTransition - 包装更新函数
// 你可以控制何时触发过渡
const [isPending, startTransition] = useTransition();
startTransition(() => setState(newValue));

// useDeferredValue - 包装值
// 适用于无法控制更新源的情况
const deferredValue = useDeferredValue(propsValue);
```
:::

::: details 3. 为什么需要并发渲染？
- 保持 UI 响应性，用户输入不被阻塞
- 区分更新优先级，紧急更新优先处理
- 避免不必要的加载状态
- 更好的用户体验
:::

::: details 4. 并发模式下状态更新可能被丢弃吗？
是的，过渡更新可能被丢弃：

```jsx
// 用户快速输入 a → ab → abc
// 只有最后一次 "abc" 的搜索结果会被渲染
startTransition(() => {
  setSearchResults(search(query));
});
```
:::

::: details 5. createRoot 和 render 的区别？
```jsx
// render (React 17) - 同步渲染
ReactDOM.render(<App />, container);

// createRoot (React 18) - 启用并发特性
const root = createRoot(container);
root.render(<App />);

// 区别：
// 1. createRoot 启用自动批处理
// 2. createRoot 支持并发特性
// 3. createRoot 可以调用 root.unmount()
```
:::

## 最佳实践

::: details 1. 合理使用 Transition
```jsx
// ✅ 好：用于非紧急更新
startTransition(() => {
  setSearchResults(results);
});

// ❌ 不好：用于紧急更新
startTransition(() => {
  setInputValue(e.target.value); // 输入框应该立即更新
});
```
:::

::: details 2. 配合 Suspense 使用
```jsx
// ✅ 好：Transition + Suspense
function App() {
  const [tab, setTab] = useState('home');
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <TabButtons onChange={tab => startTransition(() => setTab(tab))} />
      <Suspense fallback={<Spinner />}>
        <TabContent tab={tab} />
      </Suspense>
    </div>
  );
}
```
:::

::: details 3. 避免过度使用
```jsx
// ❌ 不好：所有更新都用 Transition
startTransition(() => {
  setName(value);
  setEmail(value);
  setPhone(value);
});

// ✅ 好：只对耗时更新使用 Transition
setName(value);
setEmail(value);
startTransition(() => {
  setExpensiveData(compute(value));
});
```
:::

## 总结

React 18 并发特性的核心价值：

1. **可中断渲染**：长时间渲染不再阻塞用户交互
2. **优先级调度**：紧急更新优先处理
3. **自动批处理**：减少不必要的渲染次数
4. **流式 SSR**：更快的首屏加载
5. **更好的开发体验**：useTransition、useDeferredValue 等新 API

掌握并发特性是 React 面试的重要加分项，也是构建高性能 React 应用的关键技能。
