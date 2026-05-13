# React 核心原理

React 是一个用于构建用户界面的 JavaScript 库，采用组件化、声明式编程和虚拟 DOM 技术。

## React 核心特点

### 声明式编程

告诉 React 你想要什么，而不是怎么做：

```jsx
// 命令式（传统方式）
const container = document.getElementById('root')
const btn = document.createElement('button')
btn.className = 'btn'
btn.textContent = 'Click me'
btn.onclick = () => alert('Clicked!')
container.appendChild(btn)

// 声明式（React）
function App() {
  return (
    <button className="btn" onClick={() => alert('Clicked!')}>
      Click me
    </button>
  )
}
```

### 组件化

将 UI 拆分为独立、可复用的组件：

```jsx
// 按钮组件
function Button({ children, onClick, variant = 'primary' }) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  )
}

// 卡片组件
function Card({ title, children }) {
  return (
    <div className="card">
      <h2 className="card-title">{title}</h2>
      <div className="card-content">{children}</div>
    </div>
  )
}

// 组合使用
function App() {
  return (
    <Card title="Welcome">
      <p>Hello, React!</p>
      <Button onClick={() => console.log('clicked')}>
        Learn More
      </Button>
    </Card>
  )
}
```

### 单向数据流

数据从父组件流向子组件，子组件通过回调函数通知父组件：

```jsx
function Parent() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      {/* 数据向下流动 */}
      <Child count={count} onIncrement={() => setCount(c => c + 1)} />
    </div>
  )
}

function Child({ count, onIncrement }) {
  return (
    <div>
      <p>Received: {count}</p>
      {/* 事件向上传递 */}
      <button onClick={onIncrement}>Increment</button>
    </div>
  )
}
```

## JSX

JSX 是 JavaScript 的语法扩展，让你可以在 JS 中写类似 HTML 的代码。

### JSX 本质

JSX 会被编译为 `React.createElement` 调用：

```jsx
// JSX
const element = (
  <div className="container">
    <h1>Hello</h1>
    <p>World</p>
  </div>
)

// 编译后
const element = React.createElement(
  'div',
  { className: 'container' },
  React.createElement('h1', null, 'Hello'),
  React.createElement('p', null, 'World')
)

// React 17+ 使用新的 JSX Transform
import { jsx as _jsx } from 'react/jsx-runtime'

const element = _jsx('div', {
  className: 'container',
  children: [
    _jsx('h1', { children: 'Hello' }),
    _jsx('p', { children: 'World' })
  ]
})
```

### JSX 规则

```jsx
function Example() {
  const name = 'React'
  const isLoggedIn = true
  const items = ['Apple', 'Banana', 'Cherry']

  return (
    // 1. 必须有一个根元素
    <div>
      {/* 2. 使用 className 代替 class */}
      <div className="container">
        {/* 3. 使用花括号嵌入表达式 */}
        <h1>Hello, {name}</h1>

        {/* 4. 条件渲染 */}
        {isLoggedIn && <p>Welcome back!</p>}
        {isLoggedIn ? <UserPanel /> : <LoginButton />}

        {/* 5. 列表渲染需要 key */}
        <ul>
          {items.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        {/* 6. 内联样式使用对象 */}
        <p style={{ color: 'red', fontSize: '16px' }}>Styled text</p>

        {/* 7. 事件使用驼峰命名 */}
        <button onClick={() => console.log('clicked')}>Click</button>
      </div>
    </div>
  )
}
```

### Fragment

不添加额外 DOM 节点的包裹：

```jsx
// 使用 Fragment
import { Fragment } from 'react'

function List() {
  return (
    <Fragment>
      <li>Item 1</li>
      <li>Item 2</li>
    </Fragment>
  )
}

// 简写语法
function List() {
  return (
    <>
      <li>Item 1</li>
      <li>Item 2</li>
    </>
  )
}
```

## 组件

### 函数组件

```jsx
// 基础函数组件
function Welcome({ name }) {
  return <h1>Hello, {name}</h1>
}

// 箭头函数
const Welcome = ({ name }) => <h1>Hello, {name}</h1>

// 使用
<Welcome name="React" />
```

### 类组件

```jsx
class Welcome extends React.Component {
  constructor(props) {
    super(props)
    this.state = { count: 0 }
  }

  handleClick = () => {
    this.setState({ count: this.state.count + 1 })
  }

  render() {
    return (
      <div>
        <h1>Hello, {this.props.name}</h1>
        <p>Count: {this.state.count}</p>
        <button onClick={this.handleClick}>Increment</button>
      </div>
    )
  }
}
```

### 函数组件 vs 类组件

| 特性 | 函数组件 | 类组件 |
|------|----------|--------|
| 语法 | 简洁 | 繁琐 |
| 状态 | useState | this.state |
| 生命周期 | useEffect | 生命周期方法 |
| this | 无 | 需要绑定 |
| 性能 | 略好 | 略差 |
| 推荐 | ✅ 推荐使用 | 旧项目维护 |

## State 状态

### useState

```jsx
import { useState } from 'react'

function Counter() {
  // 基础用法
  const [count, setCount] = useState(0)

  // 对象状态
  const [user, setUser] = useState({ name: '', age: 0 })

  // 数组状态
  const [items, setItems] = useState([])

  // 惰性初始化（只在首次渲染时执行）
  const [data, setData] = useState(() => {
    return expensiveComputation()
  })

  return (
    <div>
      <p>Count: {count}</p>

      {/* 直接设置新值 */}
      <button onClick={() => setCount(5)}>Set to 5</button>

      {/* 基于前值更新 */}
      <button onClick={() => setCount(c => c + 1)}>Increment</button>

      {/* 更新对象（需要创建新对象） */}
      <button onClick={() => setUser({ ...user, name: 'Tom' })}>
        Set Name
      </button>

      {/* 更新数组 */}
      <button onClick={() => setItems([...items, 'new item'])}>
        Add Item
      </button>
    </div>
  )
}
```

### 状态更新是异步的

```jsx
function Example() {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    setCount(count + 1)
    console.log(count)  // 仍然是旧值！

    // 正确方式：使用函数式更新
    setCount(c => {
      console.log(c)  // 最新值
      return c + 1
    })
  }

  return <button onClick={handleClick}>{count}</button>
}
```

### 状态不可变性

```jsx
// ❌ 错误：直接修改状态
const [user, setUser] = useState({ name: 'Tom', age: 25 })
user.name = 'Jerry'  // 不会触发重新渲染！
setUser(user)        // 引用相同，不会更新

// ✅ 正确：创建新对象
setUser({ ...user, name: 'Jerry' })

// ❌ 错误：直接修改数组
const [items, setItems] = useState([1, 2, 3])
items.push(4)   // 不会触发更新
setItems(items)

// ✅ 正确：创建新数组
setItems([...items, 4])
setItems(items.filter(i => i !== 2))
setItems(items.map(i => i * 2))
```

## Props 属性

### 基础用法

```jsx
// 接收 props
function UserCard({ name, age, email, onEdit }) {
  return (
    <div className="user-card">
      <h2>{name}</h2>
      <p>Age: {age}</p>
      <p>Email: {email}</p>
      <button onClick={onEdit}>Edit</button>
    </div>
  )
}

// 传递 props
function App() {
  return (
    <UserCard
      name="Tom"
      age={25}
      email="tom@example.com"
      onEdit={() => console.log('edit')}
    />
  )
}
```

### 默认值

```jsx
// 使用解构默认值
function Button({ text = 'Click', type = 'primary', disabled = false }) {
  return (
    <button className={type} disabled={disabled}>
      {text}
    </button>
  )
}

// 使用 defaultProps（不推荐）
Button.defaultProps = {
  text: 'Click',
  type: 'primary'
}
```

### children

```jsx
function Card({ title, children }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">
        {children}
      </div>
    </div>
  )
}

// 使用
<Card title="Welcome">
  <p>This is the content</p>
  <button>Click me</button>
</Card>
```

### 展开属性

```jsx
function Button(props) {
  const { className, ...restProps } = props
  return <button className={`btn ${className}`} {...restProps} />
}

// 使用
<Button className="primary" onClick={handleClick} disabled>
  Submit
</Button>
```

## 虚拟 DOM

### 什么是虚拟 DOM

虚拟 DOM 是真实 DOM 的 JavaScript 对象表示：

```jsx
// JSX
<div className="container">
  <h1>Hello</h1>
  <p>World</p>
</div>

// 虚拟 DOM 对象
{
  type: 'div',
  props: {
    className: 'container',
    children: [
      { type: 'h1', props: { children: 'Hello' } },
      { type: 'p', props: { children: 'World' } }
    ]
  }
}
```

### 工作流程

```
JSX → React.createElement → 虚拟 DOM → Diff 算法 → 最小化 DOM 更新
```

1. **创建虚拟 DOM**：JSX 编译为 createElement 调用，生成虚拟 DOM 树
2. **Diff 对比**：状态更新时，对比新旧虚拟 DOM 树
3. **生成补丁**：计算出需要更新的部分
4. **更新真实 DOM**：批量应用变更到真实 DOM

### Diff 算法策略

React 的 Diff 算法基于三个假设进行优化：

1. **同层比较**：只比较同一层级的节点
2. **类型判断**：不同类型的元素产生不同的树
3. **Key 标识**：通过 key 标识列表中的元素

```jsx
// key 的重要性
function List({ items }) {
  return (
    <ul>
      {items.map(item => (
        // ✅ 使用稳定的唯一 key
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  )
}

// ❌ 不要使用 index 作为 key（列表会变化时）
{items.map((item, index) => (
  <li key={index}>{item.name}</li>  // 可能导致问题
))}
```

## 条件渲染

```jsx
function Example({ isLoggedIn, user, items, error }) {
  // 1. if 语句
  if (error) {
    return <ErrorMessage error={error} />
  }

  return (
    <div>
      {/* 2. 三元运算符 */}
      {isLoggedIn ? <UserPanel user={user} /> : <LoginButton />}

      {/* 3. 逻辑与 */}
      {isLoggedIn && <p>Welcome, {user.name}</p>}

      {/* 4. 逻辑或（提供默认值） */}
      <p>Items: {items.length || 'No items'}</p>

      {/* 5. 提前返回 */}
      {items.length === 0 && <p>List is empty</p>}
    </div>
  )
}
```

## 列表渲染

```jsx
function ItemList({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>
          <span>{item.name}</span>
          <span>{item.price}</span>
        </li>
      ))}
    </ul>
  )
}

// 提取列表项组件
function ItemCard({ item, onDelete }) {
  return (
    <li>
      <span>{item.name}</span>
      <button onClick={() => onDelete(item.id)}>Delete</button>
    </li>
  )
}

function ItemList({ items, onDelete }) {
  return (
    <ul>
      {items.map(item => (
        <ItemCard key={item.id} item={item} onDelete={onDelete} />
      ))}
    </ul>
  )
}
```

## 事件处理

```jsx
function EventExample() {
  // 普通事件处理
  const handleClick = () => {
    console.log('clicked')
  }

  // 带参数
  const handleDelete = (id) => {
    console.log('delete', id)
  }

  // 事件对象
  const handleChange = (e) => {
    console.log(e.target.value)
  }

  // 阻止默认行为
  const handleSubmit = (e) => {
    e.preventDefault()
    // 处理表单
  }

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
      <button onClick={handleClick}>Submit</button>
      <button onClick={() => handleDelete(123)}>Delete</button>
    </form>
  )
}
```

## 常见面试题

::: details 1. React 的核心特点是什么？
- **声明式**：描述 UI 应该是什么样子
- **组件化**：将 UI 拆分为独立可复用的组件
- **单向数据流**：数据从上往下流动
- **虚拟 DOM**：提高渲染性能
:::

::: details 2. JSX 是什么？
JSX 是 JavaScript 的语法扩展，允许在 JS 中写类似 HTML 的代码。它会被编译为 `React.createElement` 调用，最终生成虚拟 DOM 对象。
:::

::: details 3. 为什么列表渲染需要 key？
- key 帮助 React 识别列表中哪些元素改变了
- 提高 Diff 算法效率，避免不必要的重新渲染
- key 应该是稳定、唯一的，不推荐使用 index
:::

::: details 4. 函数组件和类组件的区别？
- 函数组件语法更简洁，使用 Hooks 管理状态
- 类组件需要继承 React.Component，使用 this.state
- 函数组件没有 this，避免了 this 绑定问题
- 函数组件是 React 推荐的写法
:::

::: details 5. 虚拟 DOM 的优势？
- 减少直接操作真实 DOM 的次数
- 通过 Diff 算法计算最小更新
- 批量更新，避免重复渲染
- 跨平台能力（React Native）
:::
