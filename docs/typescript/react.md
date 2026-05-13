# TypeScript + React 实战模式

## 概述

TypeScript 与 React 的结合是现代前端开发的主流选择。本文涵盖组件类型定义、Hooks 类型、事件处理、状态管理等核心模式，帮助你编写类型安全的 React 应用。

## 组件类型定义

### 函数组件

```tsx
// 方式一：直接标注参数类型（推荐）
interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

function Button({ text, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
}

// 方式二：使用 React.FC（不推荐，有隐式 children）
const Button: React.FC<ButtonProps> = ({ text, onClick, disabled = false }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
};
```

### Children 类型

```tsx
// ReactNode - 最宽松，接受任何可渲染内容
interface CardProps {
  children: React.ReactNode;
}

// ReactElement - 只接受 React 元素
interface ContainerProps {
  children: React.ReactElement;
}

// 特定元素类型
interface TabsProps {
  children: React.ReactElement<TabProps>[];
}

// 函数作为 children (Render Props)
interface DataFetcherProps<T> {
  children: (data: T, loading: boolean) => React.ReactNode;
}

function DataFetcher<T>({ children, url }: DataFetcherProps<T> & { url: string }) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  // ...
  return <>{children(data as T, loading)}</>;
}
```

### Props 继承与扩展

```tsx
// 继承 HTML 元素属性
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

function Button({ variant = 'primary', loading, children, ...rest }: ButtonProps) {
  return (
    <button className={`btn-${variant}`} disabled={loading} {...rest}>
      {loading ? 'Loading...' : children}
    </button>
  );
}

// 继承其他组件属性
interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
}

// 省略某些属性
interface CustomInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size: 'small' | 'medium' | 'large';
}
```

### 组件作为 Props

```tsx
// 传递组件类型
interface LayoutProps {
  header: React.ComponentType<{ title: string }>;
  sidebar?: React.ComponentType;
}

function Layout({ header: Header, sidebar: Sidebar }: LayoutProps) {
  return (
    <div>
      <Header title="Dashboard" />
      {Sidebar && <Sidebar />}
    </div>
  );
}

// 使用 ReactElement
interface FormProps {
  submitButton: React.ReactElement<ButtonProps>;
}
```

## Hooks 类型

### useState

```tsx
// 自动推断
const [count, setCount] = useState(0);  // number

// 显式类型
const [user, setUser] = useState<User | null>(null);

// 复杂类型
interface FormState {
  name: string;
  email: string;
  age: number;
}

const [form, setForm] = useState<FormState>({
  name: '',
  email: '',
  age: 0
});

// 懒初始化
const [data, setData] = useState<Data[]>(() => {
  const cached = localStorage.getItem('data');
  return cached ? JSON.parse(cached) : [];
});
```

### useReducer

```tsx
// 状态和动作类型
interface State {
  count: number;
  error: string | null;
}

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset'; payload: number }
  | { type: 'error'; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 };
    case 'decrement':
      return { ...state, count: state.count - 1 };
    case 'reset':
      return { ...state, count: action.payload };
    case 'error':
      return { ...state, error: action.payload };
    default:
      // 类型穷尽检查
      const _exhaustive: never = action;
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0, error: null });

  return (
    <div>
      <span>{state.count}</span>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'reset', payload: 0 })}>Reset</button>
    </div>
  );
}
```

### useRef

```tsx
// DOM 引用
const inputRef = useRef<HTMLInputElement>(null);
// 使用时需要判断 null
inputRef.current?.focus();

// 可变值
const countRef = useRef<number>(0);
countRef.current = 10;  // 不需要判断 null

// 保存回调
const callbackRef = useRef<(() => void) | null>(null);
```

### useContext

```tsx
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// 创建上下文
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 自定义 Hook（推荐）
function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Provider 组件
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const value: ThemeContextType = {
    theme,
    toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light')
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### useCallback 和 useMemo

```tsx
// useCallback
const handleClick = useCallback((id: number) => {
  console.log(id);
}, []);

// 显式类型
const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
  (event) => {
    event.preventDefault();
    // ...
  },
  []
);

// useMemo
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// 显式类型
const memoizedData = useMemo<ProcessedData[]>(() => {
  return data.map(item => processItem(item));
}, [data]);
```

### 自定义 Hooks

```tsx
// 返回值类型
function useToggle(initial: boolean = false): [boolean, () => void] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle];
}

// 对象返回值
interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

function useCounter(initial: number = 0): UseCounterReturn {
  const [count, setCount] = useState(initial);

  return {
    count,
    increment: useCallback(() => setCount(c => c + 1), []),
    decrement: useCallback(() => setCount(c => c - 1), []),
    reset: useCallback(() => setCount(initial), [initial])
  };
}

// 泛型 Hook
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const valueToStore = newValue instanceof Function ? newValue(prev) : newValue;
      localStorage.setItem(key, JSON.stringify(valueToStore));
      return valueToStore;
    });
  }, [key]);

  return [value, setStoredValue] as const;
}
```

## 事件处理

### 常见事件类型

```tsx
// 鼠标事件
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.currentTarget);
};

// 表单事件
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};

// 输入事件
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value);
};

// 键盘事件
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    // ...
  }
};

// 焦点事件
const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.select();
};

// 拖拽事件
const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
  e.dataTransfer.setData('text', 'data');
};
```

### 事件处理函数类型

```tsx
// 使用内置类型
interface Props {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}

// 自定义事件处理
interface Props {
  onSelect: (id: string, data: ItemData) => void;
  onError?: (error: Error) => void;
}
```

## 表单处理

### 受控组件

```tsx
interface FormData {
  username: string;
  email: string;
  role: 'admin' | 'user';
}

function Form() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    role: 'user'
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        value={formData.username}
        onChange={handleChange}
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
      />
      <select name="role" value={formData.role} onChange={handleChange}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 表单验证

```tsx
interface ValidationErrors {
  [key: string]: string | undefined;
}

function useFormValidation<T extends Record<string, unknown>>(
  values: T,
  validate: (values: T) => ValidationErrors
) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const newErrors = validate(values);
    setErrors(newErrors);
  };

  const isValid = Object.keys(errors).length === 0;

  return { errors, touched, handleBlur, isValid };
}
```

## 泛型组件

### 列表组件

```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

// 使用
interface User {
  id: number;
  name: string;
}

<List<User>
  items={users}
  keyExtractor={user => user.id}
  renderItem={user => <span>{user.name}</span>}
/>
```

### 选择组件

```tsx
interface SelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
  getValue: (option: T) => string | number;
}

function Select<T>({
  options,
  value,
  onChange,
  getLabel,
  getValue
}: SelectProps<T>) {
  return (
    <select
      value={value ? String(getValue(value)) : ''}
      onChange={e => {
        const option = options.find(
          opt => String(getValue(opt)) === e.target.value
        );
        if (option) onChange(option);
      }}
    >
      <option value="">请选择</option>
      {options.map(option => (
        <option key={getValue(option)} value={getValue(option)}>
          {getLabel(option)}
        </option>
      ))}
    </select>
  );
}
```

### 表格组件

```tsx
interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  width?: number | string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: keyof T | ((record: T) => string);
  loading?: boolean;
}

function Table<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  loading
}: TableProps<T>) {
  const getRowKey = (record: T): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey]);
  };

  return (
    <table>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={String(col.key)} style={{ width: col.width }}>
              {col.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((record, index) => (
          <tr key={getRowKey(record)}>
            {columns.map(col => (
              <td key={String(col.key)}>
                {col.render
                  ? col.render(record[col.key as keyof T], record, index)
                  : String(record[col.key as keyof T] ?? '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## 高阶组件 (HOC)

```tsx
// withLoading HOC
interface WithLoadingProps {
  loading: boolean;
}

function withLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithLoadingComponent({
    loading,
    ...props
  }: P & WithLoadingProps) {
    if (loading) {
      return <div>Loading...</div>;
    }
    return <WrappedComponent {...(props as P)} />;
  };
}

// withAuth HOC
interface WithAuthProps {
  isAuthenticated: boolean;
}

function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAuthComponent(props: P & WithAuthProps) {
    const { isAuthenticated, ...rest } = props;

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return <WrappedComponent {...(rest as P)} />;
  };
}

// 使用
const ProtectedDashboard = withAuth(Dashboard);
```

## Render Props

```tsx
interface RenderProps<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

interface FetcherProps<T> {
  url: string;
  children: (props: RenderProps<T>) => React.ReactNode;
}

function Fetcher<T>({ url, children }: FetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return <>{children({ data: data as T, loading, error })}</>;
}

// 使用
<Fetcher<User[]> url="/api/users">
  {({ data, loading, error }) => {
    if (loading) return <Spinner />;
    if (error) return <Error message={error.message} />;
    return <UserList users={data} />;
  }}
</Fetcher>
```

## 常见类型工具

```tsx
// 获取组件 Props 类型
type ButtonProps = React.ComponentProps<typeof Button>;
type InputProps = React.ComponentProps<'input'>;

// 获取 Ref 类型
type InputRef = React.ElementRef<'input'>;  // HTMLInputElement

// PropsWithChildren
type Props = React.PropsWithChildren<{
  title: string;
}>;

// PropsWithRef
type Props = React.PropsWithRef<{
  value: string;
}>;
```

