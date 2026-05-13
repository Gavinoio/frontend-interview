# TypeScript 面试题精选

> 汇总 TypeScript 类型系统、高级类型、泛型、工程实践、React 集成的高频面试题。

## 类型系统基础

::: details 1. type 和 interface 的区别？
| 特性 | interface | type |
|------|-----------|------|
| 声明合并 | ✅ 支持（同名自动合并） | ❌ 不支持 |
| 继承方式 | `extends` | `&` 交叉类型 |
| 联合类型 | ❌ 不支持 | ✅ 支持 |
| 元组/原始类型别名 | ❌ | ✅ |
| 计算属性 | 有限支持 | ✅ 支持 |

**推荐原则**：
- 定义对象结构 → 优先用 `interface`（可扩展）
- 联合类型、元组、工具类型 → 用 `type`

```typescript
// interface 声明合并
interface User { name: string; }
interface User { age: number; }
// 合并为 { name: string; age: number; }

// type 联合类型
type ID = string | number;
type Tuple = [string, number];
```

---
:::

::: details 2. any、unknown、never 的区别？
| 类型 | 含义 | 赋值给其他类型 | 使用前需检查 |
|------|------|--------------|------------|
| `any` | 任意类型，关闭类型检查 | ✅ 可以 | ❌ 不需要 |
| `unknown` | 未知类型，类型安全的 any | ❌ 不可以 | ✅ 必须 |
| `never` | 永不存在的值 | ✅ 可以（底部类型） | - |

```typescript
// unknown 必须收窄后才能使用
function process(val: unknown) {
    if (typeof val === 'string') {
        val.toUpperCase(); // OK
    }
}

// never 用于穷尽检查
type Shape = 'circle' | 'square';
function assertNever(x: never): never {
    throw new Error('Unexpected: ' + x);
}
function area(shape: Shape) {
    if (shape === 'circle') return Math.PI;
    if (shape === 'square') return 1;
    return assertNever(shape); // 如果漏掉某个 case，编译报错
}
```

---
:::

::: details 3. 如何实现类型收窄（Type Narrowing）？
```typescript
function process(val: string | number | null) {
    // typeof 收窄
    if (typeof val === 'string') { val.toUpperCase(); }

    // instanceof 收窄
    if (val instanceof Date) { val.getTime(); }

    // in 操作符收窄
    if ('name' in val) { val.name; }

    // 相等性收窄
    if (val === null) { /* val is null */ }

    // 自定义类型守卫
    function isString(v: unknown): v is string {
        return typeof v === 'string';
    }
}
```

---
:::

::: details 4. 联合类型和交叉类型的区别？
```typescript
// 联合类型（|）：满足其中一个
type A = string | number; // 可以是 string 或 number

// 交叉类型（&）：同时满足所有
type B = { name: string } & { age: number };
// B 必须同时有 name 和 age

// 联合类型只能访问共有属性
function fn(val: string | number) {
    val.toString(); // OK（共有方法）
    // val.toUpperCase(); // Error（number 没有）
}
```

---
:::

## 高级类型

::: details 5. 内置工具类型有哪些？
```typescript
interface User { name: string; age: number; email?: string; }

Partial<User>          // 所有属性变可选
Required<User>         // 所有属性变必填
Readonly<User>         // 所有属性变只读
Pick<User, 'name'>     // 选取指定属性 → { name: string }
Omit<User, 'age'>      // 排除指定属性 → { name: string; email?: string }
Record<string, User>   // 键值对类型
Exclude<'a'|'b', 'a'>  // 从联合类型排除 → 'b'
Extract<'a'|'b', 'a'>  // 从联合类型提取 → 'a'
NonNullable<string|null|undefined> // 排除 null/undefined → string
ReturnType<typeof fn>  // 获取函数返回值类型
Parameters<typeof fn>  // 获取函数参数类型元组
```

---
:::

::: details 6. 什么是条件类型？infer 关键字有什么用？
```typescript
// 条件类型：T extends U ? X : Y
type IsString<T> = T extends string ? true : false;
type A = IsString<string>; // true
type B = IsString<number>; // false

// infer：在条件类型中推断类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type Fn = () => string;
type R = ReturnType<Fn>; // string

// 提取 Promise 的值类型
type Awaited<T> = T extends Promise<infer U> ? U : T;
type V = Awaited<Promise<number>>; // number
```

---
:::

::: details 7. 如何实现 DeepPartial、DeepRequired？
```typescript
// DeepPartial：递归将所有属性变为可选
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// DeepRequired：递归将所有属性变为必填
type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// ValueOf：获取对象所有值的类型
type ValueOf<T> = T[keyof T];
```

---
:::

::: details 8. 模板字面量类型有什么用？
```typescript
type EventName = 'click' | 'focus' | 'blur';
type Handler = `on${Capitalize<EventName>}`;
// 'onClick' | 'onFocus' | 'onBlur'

// 实际应用：API 路径类型
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ApiPath = `/api/${string}`;

// 对象键名转换
type CamelToSnake<S extends string> =
    S extends `${infer Head}${infer Tail}`
        ? Head extends Uppercase<Head>
            ? `_${Lowercase<Head>}${CamelToSnake<Tail>}`
            : `${Head}${CamelToSnake<Tail>}`
        : S;
```

---
:::

## 泛型

::: details 9. 泛型和 any 的区别？
```typescript
// any：放弃类型检查，失去类型信息
function identityAny(arg: any): any { return arg; }
const r1 = identityAny(42); // r1 是 any，失去 number 信息

// 泛型：保持类型安全，保留类型信息
function identity<T>(arg: T): T { return arg; }
const r2 = identity(42); // r2 是 number，类型安全
```

**核心区别**：泛型在保持灵活性的同时保留类型信息，any 完全放弃类型检查。

---
:::

::: details 10. 什么是泛型约束？
```typescript
// extends 约束泛型参数
function getLength<T extends { length: number }>(arg: T): number {
    return arg.length; // 安全访问 length
}

getLength('hello');  // OK
getLength([1, 2, 3]); // OK
// getLength(42);    // Error：number 没有 length

// keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}
```

---
:::

::: details 11. 泛型的常见使用场景？
```typescript
// 1. 泛型函数
function first<T>(arr: T[]): T | undefined { return arr[0]; }

// 2. 泛型接口
interface Repository<T> {
    findById(id: number): Promise<T>;
    save(entity: T): Promise<T>;
}

// 3. 泛型类
class Stack<T> {
    private items: T[] = [];
    push(item: T) { this.items.push(item); }
    pop(): T | undefined { return this.items.pop(); }
}

// 4. 泛型工具类型
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type ApiResponse<T> = { data: T; code: number; message: string; };
```

---
:::

## 工程实践

::: details 12. tsconfig.json 中 strict 包含哪些选项？
- `noImplicitAny`：禁止隐式 any
- `strictNullChecks`：严格空值检查（null/undefined 不能赋给其他类型）
- `strictFunctionTypes`：严格函数类型检查（逆变）
- `strictBindCallApply`：严格检查 bind/call/apply 参数
- `strictPropertyInitialization`：类属性必须在构造函数中初始化
- `noImplicitThis`：禁止隐式 this

**推荐**：新项目开启 `"strict": true`。

---
:::

::: details 13. 如何为第三方库添加类型声明？
```typescript
// 方式1：安装 @types 包
npm install @types/lodash

// 方式2：创建 .d.ts 声明文件
// types/my-lib.d.ts
declare module 'my-lib' {
    export function doSomething(val: string): void;
    export const version: string;
}

// 方式3：扩展现有类型（模块增强）
declare module 'express' {
    interface Request {
        user?: { id: number; name: string };
    }
}
```

---
:::

::: details 14. 装饰器（Decorator）是什么？有哪些类型？
装饰器是一种特殊的声明，可以附加到类、方法、属性或参数上，用于修改或增强其行为。

```typescript
// 类装饰器
@Injectable()
class UserService { }

// 方法装饰器
class Controller {
    @Get('/users')
    getUsers() { }
}

// 属性装饰器
class User {
    @Column({ type: 'varchar' })
    name: string;
}
```

需要在 tsconfig.json 中开启 `"experimentalDecorators": true`。

---
:::

## TypeScript + React

::: details 15. React.FC 有什么问题？推荐用什么替代？
```tsx
// ❌ React.FC 的问题：隐式包含 children 类型（React 18 已修复）
const Button: React.FC<{ text: string }> = ({ text }) => <button>{text}</button>;

// ✅ 推荐：直接标注参数类型
function Button({ text }: { text: string }) {
    return <button>{text}</button>;
}

// ✅ 或者显式声明 children
interface ButtonProps {
    text: string;
    children?: React.ReactNode;
}
function Button({ text, children }: ButtonProps) { ... }
```

---
:::

::: details 16. 如何正确类型化事件处理函数？
```tsx
// 内联函数：自动推断
<button onClick={(e) => console.log(e.target)} />

// 独立函数：显式类型
const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    console.log(e.currentTarget);
};

// 常用事件类型
React.ChangeEvent<HTMLInputElement>   // input onChange
React.FormEvent<HTMLFormElement>      // form onSubmit
React.KeyboardEvent<HTMLInputElement> // onKeyDown
React.DragEvent<HTMLDivElement>       // onDrag
```

---
:::

::: details 17. useRef 的三种使用场景如何类型化？
```tsx
// 1. DOM 引用（初始值为 null，只读）
const inputRef = useRef<HTMLInputElement>(null);
// 使用时需要判空：inputRef.current?.focus()

// 2. 可变值存储（不触发重渲染）
const countRef = useRef<number>(0);
countRef.current = 1; // 可直接赋值

// 3. 保存上一次值
const prevValueRef = useRef<string | undefined>(undefined);
useEffect(() => { prevValueRef.current = value; });
```

---
:::

::: details 18. 如何类型化 forwardRef 和泛型组件？
```tsx
// forwardRef
interface InputProps { label: string; }
const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label }, ref) => <label>{label}<input ref={ref} /></label>
);

// 泛型组件（TSX 中箭头函数需要特殊语法）
function List<T extends { id: number }>(props: { items: T[] }) {
    return <ul>{props.items.map(i => <li key={i.id}>{JSON.stringify(i)}</li>)}</ul>;
}

// 箭头函数泛型组件
const List = <T,>(props: { items: T[] }) => { ... };
```

---
:::

## 综合题

::: details 19. TypeScript 的类型系统是结构化类型还是名义类型？
TypeScript 使用**结构化类型（Structural Typing）**，也叫"鸭子类型"：只要结构兼容，类型就兼容，不关心类型名称。

```typescript
interface Point { x: number; y: number; }
interface Coordinate { x: number; y: number; }

const p: Point = { x: 1, y: 2 };
const c: Coordinate = p; // OK！结构相同即兼容
```

---
:::

::: details 20. 如何实现一个类型安全的 EventEmitter？
```typescript
type EventMap = {
    click: { x: number; y: number };
    change: { value: string };
    close: void;
};

class TypedEventEmitter<T extends Record<string, any>> {
    private listeners: Partial<{ [K in keyof T]: ((data: T[K]) => void)[] }> = {};

    on<K extends keyof T>(event: K, listener: (data: T[K]) => void) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event]!.push(listener);
    }

    emit<K extends keyof T>(event: K, data: T[K]) {
        this.listeners[event]?.forEach(fn => fn(data));
    }
}

const emitter = new TypedEventEmitter<EventMap>();
emitter.on('click', ({ x, y }) => console.log(x, y)); // 类型安全
emitter.emit('click', { x: 1, y: 2 }); // OK
// emitter.emit('click', { value: 'a' }); // Error！
```
:::
