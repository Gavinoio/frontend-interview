# 类型系统

TypeScript 的核心是其强大的类型系统，它能在编译时捕获错误，提供更好的代码提示和文档。

## 基础类型

### 原始类型

```typescript
// 字符串
let name: string = 'Tom'

// 数字
let age: number = 25
let hex: number = 0xf00d
let binary: number = 0b1010

// 布尔值
let isDone: boolean = false

// null 和 undefined
let n: null = null
let u: undefined = undefined

// Symbol
let sym: symbol = Symbol('key')

// BigInt
let big: bigint = 100n
```

### 特殊类型

```typescript
// any - 任意类型，绕过类型检查
let notSure: any = 4
notSure = 'string'  // OK
notSure.foo()       // OK，但运行时可能报错

// unknown - 安全的 any，需要类型检查后才能使用
let value: unknown = 'hello'
// value.length  // 错误：不能直接使用
if (typeof value === 'string') {
  console.log(value.length)  // OK
}

// void - 没有返回值
function log(msg: string): void {
  console.log(msg)
}

// never - 永不返回
function error(msg: string): never {
  throw new Error(msg)
}

function infiniteLoop(): never {
  while (true) {}
}
```

### any vs unknown

```typescript
// any 可以赋值给任何类型
let a: any = 1
let b: string = a  // OK，但可能运行时出错

// unknown 不能直接赋值给其他类型
let x: unknown = 1
// let y: string = x  // 错误
let y: string = x as string  // 需要断言或类型收窄
```

## 对象类型

### 对象字面量

```typescript
// 内联类型
let user: { name: string; age: number } = {
  name: 'Tom',
  age: 25
}

// 可选属性
let config: {
  host: string
  port?: number  // 可选
} = { host: 'localhost' }

// 只读属性
let point: {
  readonly x: number
  readonly y: number
} = { x: 10, y: 20 }
// point.x = 5  // 错误：只读

// 索引签名
let dict: {
  [key: string]: number
} = {
  apple: 1,
  banana: 2
}
```

### type 类型别名

```typescript
type User = {
  name: string
  age: number
  email?: string
}

type ID = string | number

type Point = {
  x: number
  y: number
}

const user: User = {
  name: 'Tom',
  age: 25
}
```

### interface 接口

```typescript
interface User {
  name: string
  age: number
  email?: string
  readonly id: number
}

// 方法定义
interface Calculator {
  add(a: number, b: number): number
  subtract: (a: number, b: number) => number
}

// 索引签名
interface StringArray {
  [index: number]: string
}

const arr: StringArray = ['a', 'b', 'c']
```

### type vs interface

```typescript
// interface 可以重复声明（合并）
interface User {
  name: string
}
interface User {
  age: number
}
// User = { name: string; age: number }

// type 不能重复声明
type Point = { x: number }
// type Point = { y: number }  // 错误

// interface 可以 extends
interface Animal {
  name: string
}
interface Dog extends Animal {
  breed: string
}

// type 使用交叉类型
type Animal = { name: string }
type Dog = Animal & { breed: string }

// type 可以定义联合类型、元组等
type Status = 'pending' | 'success' | 'error'
type Tuple = [string, number]

// 推荐：对象结构用 interface，其他用 type
```

## 数组和元组

### 数组类型

```typescript
// 两种写法
let numbers: number[] = [1, 2, 3]
let strings: Array<string> = ['a', 'b', 'c']

// 联合类型数组
let mixed: (string | number)[] = [1, 'a', 2, 'b']

// 对象数组
interface User {
  name: string
}
let users: User[] = [{ name: 'Tom' }]

// 只读数组
let readonlyArr: readonly number[] = [1, 2, 3]
// readonlyArr.push(4)  // 错误
```

### 元组类型

元组是固定长度和类型的数组：

```typescript
// 基本元组
let tuple: [string, number] = ['hello', 10]

// 可选元素
let optionalTuple: [string, number?] = ['hello']

// 剩余元素
let restTuple: [string, ...number[]] = ['hello', 1, 2, 3]

// 命名元组（提高可读性）
type Point = [x: number, y: number]
const point: Point = [10, 20]

// 只读元组
let readonlyTuple: readonly [string, number] = ['hello', 10]

// 实际应用：函数返回多个值
function useState<T>(initial: T): [T, (value: T) => void] {
  let state = initial
  const setState = (value: T) => { state = value }
  return [state, setState]
}

const [count, setCount] = useState(0)
```

## 函数类型

### 函数声明

```typescript
// 参数和返回值类型
function add(a: number, b: number): number {
  return a + b
}

// 可选参数
function greet(name: string, greeting?: string): string {
  return `${greeting || 'Hello'}, ${name}`
}

// 默认参数
function greet2(name: string, greeting: string = 'Hello'): string {
  return `${greeting}, ${name}`
}

// 剩余参数
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0)
}
```

### 函数类型表达式

```typescript
// 类型别名
type AddFn = (a: number, b: number) => number

const add: AddFn = (a, b) => a + b

// 接口定义
interface MathFn {
  (a: number, b: number): number
}

// 调用签名（带属性的函数）
type FnWithDescription = {
  description: string
  (a: number): number
}

const double: FnWithDescription = (n) => n * 2
double.description = 'Doubles a number'
```

### 函数重载

```typescript
// 重载签名
function format(value: string): string
function format(value: number): string
function format(value: Date): string

// 实现签名
function format(value: string | number | Date): string {
  if (typeof value === 'string') {
    return value.trim()
  } else if (typeof value === 'number') {
    return value.toFixed(2)
  } else {
    return value.toISOString()
  }
}

format('hello')  // OK
format(3.14159)  // OK
format(new Date())  // OK
```

### this 类型

```typescript
interface User {
  name: string
  greet(this: User): void
}

const user: User = {
  name: 'Tom',
  greet() {
    console.log(`Hello, ${this.name}`)
  }
}

// const greet = user.greet
// greet()  // 错误：this 不是 User 类型
```

## 字面量类型

```typescript
// 字符串字面量
type Direction = 'up' | 'down' | 'left' | 'right'
let dir: Direction = 'up'
// dir = 'forward'  // 错误

// 数字字面量
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6
let roll: DiceRoll = 3

// 布尔字面量
type True = true
type False = false

// 模板字面量类型
type EventName = `on${Capitalize<'click' | 'focus' | 'blur'>}`
// 'onClick' | 'onFocus' | 'onBlur'

// as const 断言
const config = {
  host: 'localhost',
  port: 3000
} as const
// typeof config = { readonly host: 'localhost'; readonly port: 3000 }
```

## 联合类型和交叉类型

### 联合类型

```typescript
// 基础联合
type ID = string | number

function printId(id: ID) {
  if (typeof id === 'string') {
    console.log(id.toUpperCase())
  } else {
    console.log(id.toFixed(2))
  }
}

// 判别联合
type Circle = {
  kind: 'circle'
  radius: number
}

type Square = {
  kind: 'square'
  size: number
}

type Shape = Circle | Square

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2
    case 'square':
      return shape.size ** 2
  }
}
```

### 交叉类型

```typescript
// 合并类型
type Named = { name: string }
type Aged = { age: number }
type Person = Named & Aged

const person: Person = {
  name: 'Tom',
  age: 25
}

// 接口继承的替代
interface Printable {
  print(): void
}

interface Loggable {
  log(): void
}

type PrintableLoggable = Printable & Loggable
```

## 类型收窄

TypeScript 通过控制流分析自动收窄类型：

```typescript
function example(value: string | number | null) {
  // typeof 收窄
  if (typeof value === 'string') {
    return value.toUpperCase()  // value: string
  }

  // 真值收窄
  if (value) {
    return value.toFixed(2)  // value: number
  }

  // 相等收窄
  if (value === null) {
    return 'null'  // value: null
  }
}

// in 收窄
interface Bird {
  fly(): void
}

interface Fish {
  swim(): void
}

function move(animal: Bird | Fish) {
  if ('fly' in animal) {
    animal.fly()  // animal: Bird
  } else {
    animal.swim()  // animal: Fish
  }
}

// instanceof 收窄
function logDate(value: Date | string) {
  if (value instanceof Date) {
    console.log(value.toISOString())  // value: Date
  } else {
    console.log(new Date(value).toISOString())  // value: string
  }
}
```

### 类型谓词

```typescript
interface Cat {
  meow(): void
}

interface Dog {
  bark(): void
}

// 自定义类型守卫
function isCat(animal: Cat | Dog): animal is Cat {
  return 'meow' in animal
}

function speak(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow()  // animal: Cat
  } else {
    animal.bark()  // animal: Dog
  }
}
```

## 类型断言

```typescript
// as 语法
const input = document.getElementById('input') as HTMLInputElement
input.value = 'Hello'

// 尖括号语法（JSX 中不可用）
const input2 = <HTMLInputElement>document.getElementById('input')

// 非空断言
function process(value: string | null) {
  // 确信 value 不为 null
  console.log(value!.length)
}

// const 断言
const arr = [1, 2, 3] as const  // readonly [1, 2, 3]
const obj = { x: 10 } as const  // { readonly x: 10 }
```

## 常见面试题

::: details 1. any 和 unknown 的区别？
- `any` 可以赋值给任何类型，也可以访问任何属性
- `unknown` 更安全，必须进行类型检查后才能使用
- 推荐用 `unknown` 代替 `any`
:::

::: details 2. type 和 interface 的区别？
- `interface` 可以重复声明（声明合并），`type` 不行
- `interface` 使用 `extends` 继承，`type` 使用 `&` 交叉
- `type` 可以定义联合类型、元组、原始类型别名
- 推荐：对象用 `interface`，其他用 `type`
:::

::: details 3. never 类型有什么用？
- 表示永远不会有值的类型
- 抛出异常的函数返回 `never`
- 无限循环的函数返回 `never`
- 在穷尽检查中确保处理了所有情况
:::

::: details 4. 如何实现类型收窄？
- `typeof` 检查原始类型
- `instanceof` 检查类实例
- `in` 检查属性存在
- 相等性检查
- 自定义类型守卫（类型谓词）
:::
