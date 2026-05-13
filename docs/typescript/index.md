# TypeScript 基础与高频面试题

## 概述

**官方定义**: TypeScript 是 JavaScript 的超集，添加了可选的静态类型和基于类的面向对象编程。

**核心优势**:
- 编译时类型检查，提前发现错误
- 更好的 IDE 支持和代码提示
- 代码可读性和可维护性更强
- 方便重构

## 基本类型

### 原始类型

```typescript
// 基础类型
let num: number = 42
let str: string = 'hello'
let bool: boolean = true
let n: null = null
let u: undefined = undefined
let sym: symbol = Symbol('key')
let big: bigint = 100n

// 数组
let arr1: number[] = [1, 2, 3]
let arr2: Array<number> = [1, 2, 3]

// 元组 - 固定长度和类型的数组
let tuple: [string, number] = ['hello', 42]
let tuple2: [string, number, ...boolean[]] = ['a', 1, true, false] // 剩余元素

// 只读元组
let readonlyTuple: readonly [string, number] = ['hello', 42]

// 对象
let obj: { name: string; age: number } = { name: 'Alice', age: 25 }

// 可选属性和只读属性
let user: { readonly id: number; name: string; email?: string } = {
  id: 1,
  name: 'Alice'
}
```

### 特殊类型

```typescript
// any - 任意类型，跳过类型检查
let anyValue: any = 'hello'
anyValue = 42
anyValue.foo.bar // 不会报错

// unknown - 安全的 any，使用前必须进行类型检查
let unknownValue: unknown = 'hello'
// unknownValue.toUpperCase() // 错误
if (typeof unknownValue === 'string') {
  unknownValue.toUpperCase() // 正确
}

// void - 没有返回值
function log(message: string): void {
  console.log(message)
}

// never - 永远不会返回
function throwError(message: string): never {
  throw new Error(message)
}

function infiniteLoop(): never {
  while (true) {}
}

// never 用于穷尽检查
type Shape = 'circle' | 'square' | 'triangle'

function getArea(shape: Shape): number {
  switch (shape) {
    case 'circle':
      return Math.PI * 10 ** 2
    case 'square':
      return 10 ** 2
    case 'triangle':
      return (10 * 10) / 2
    default:
      // 如果 Shape 添加了新类型但没有处理，这里会报错
      const exhaustiveCheck: never = shape
      return exhaustiveCheck
  }
}
```

## interface vs type（高频面试题）

::: details 基本区别
```typescript
// interface - 接口
interface User {
  name: string
  age: number
}

// type - 类型别名
type UserType = {
  name: string
  age: number
}

// 两者在大多数情况下可以互换使用
const user1: User = { name: 'Alice', age: 25 }
const user2: UserType = { name: 'Bob', age: 30 }
```
:::

::: details 核心区别总结
| 特性 | interface | type |
|------|-----------|------|
| 声明合并 | ✅ 支持 | ❌ 不支持 |
| extends 继承 | ✅ 支持 | ✅ 支持（用 &） |
| implements | ✅ 支持 | ✅ 支持 |
| 联合类型 | ❌ 不支持 | ✅ 支持 |
| 交叉类型 | ❌ 不支持 | ✅ 支持 |
| 元组类型 | ❌ 不支持 | ✅ 支持 |
| 映射类型 | ❌ 不支持 | ✅ 支持 |
| 计算属性 | ❌ 不支持 | ✅ 支持 |
:::

::: details 1. 声明合并（Declaration Merging）
```typescript
// interface 支持声明合并
interface User {
  name: string
}

interface User {
  age: number
}

// 合并后的 User
const user: User = {
  name: 'Alice',
  age: 25
}

// type 不支持声明合并
type Person = {
  name: string
}

// 错误：标识符 "Person" 重复
// type Person = {
//   age: number
// }
```
:::

::: details 2. 继承方式
```typescript
// interface 使用 extends
interface Animal {
  name: string
}

interface Dog extends Animal {
  bark(): void
}

// type 使用交叉类型 &
type AnimalType = {
  name: string
}

type DogType = AnimalType & {
  bark(): void
}

// interface 可以继承 type
interface Cat extends AnimalType {
  meow(): void
}

// type 可以继承 interface
type Bird = Animal & {
  fly(): void
}
```
:::

::: details 3. 联合类型和交叉类型
```typescript
// type 可以定义联合类型
type ID = string | number
type Status = 'pending' | 'success' | 'error'

// type 可以定义交叉类型
type Combined = { a: number } & { b: string }

// interface 不能直接定义联合类型
// 但可以通过 type 包装
type ResponseType = SuccessResponse | ErrorResponse

interface SuccessResponse {
  status: 'success'
  data: any
}

interface ErrorResponse {
  status: 'error'
  message: string
}
```
:::

::: details 4. 元组和映射类型
```typescript
// type 可以定义元组
type Point = [number, number]
type RGB = [number, number, number]

// type 可以使用映射类型
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

type Partial<T> = {
  [P in keyof T]?: T[P]
}

// type 可以使用计算属性
type Keys = 'a' | 'b' | 'c'
type Obj = {
  [K in Keys]: string
}
// { a: string; b: string; c: string }
```
:::

::: details 5. 实际使用建议
```typescript
// 推荐使用 interface 的场景：
// 1. 定义对象的形状（Object Shape）
interface User {
  id: number
  name: string
  email: string
}

// 2. 需要声明合并（如扩展第三方库类型）
declare module 'express' {
  interface Request {
    user?: User
  }
}

// 3. 类的实现
interface Printable {
  print(): void
}

class Document implements Printable {
  print() {
    console.log('Printing...')
  }
}

// 推荐使用 type 的场景：
// 1. 联合类型
type Result = Success | Error

// 2. 元组
type Coordinates = [number, number]

// 3. 映射类型和条件类型
type Nullable<T> = T | null

// 4. 提取和工具类型
type ExtractString<T> = T extends string ? T : never

// 5. 函数类型（更简洁）
type Handler = (event: Event) => void
```
:::

## 联合类型与交叉类型

::: details 联合类型（Union Types）
```typescript
// 基本联合类型
type ID = string | number

function printId(id: ID) {
  if (typeof id === 'string') {
    console.log(id.toUpperCase())
  } else {
    console.log(id)
  }
}

// 字面量联合类型
type Direction = 'up' | 'down' | 'left' | 'right'
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

// 可辨识联合（Discriminated Unions）
interface Circle {
  kind: 'circle'
  radius: number
}

interface Square {
  kind: 'square'
  sideLength: number
}

interface Rectangle {
  kind: 'rectangle'
  width: number
  height: number
}

type Shape = Circle | Square | Rectangle

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2
    case 'square':
      return shape.sideLength ** 2
    case 'rectangle':
      return shape.width * shape.height
  }
}
```
:::

::: details 交叉类型（Intersection Types）
```typescript
// 基本交叉类型
type Name = { name: string }
type Age = { age: number }
type Person = Name & Age

const person: Person = {
  name: 'Alice',
  age: 25
}

// 混入模式（Mixins）
interface Timestamped {
  createdAt: Date
  updatedAt: Date
}

interface Identifiable {
  id: string
}

type Entity<T> = T & Timestamped & Identifiable

interface User {
  name: string
  email: string
}

type UserEntity = Entity<User>
// { name: string; email: string; createdAt: Date; updatedAt: Date; id: string }

// 交叉类型的冲突处理
type A = { value: string }
type B = { value: number }
type C = A & B
// value 的类型是 string & number = never
```
:::

## 类型断言与类型守卫

::: details 类型断言
```typescript
// as 语法（推荐）
const value: unknown = 'hello'
const length: number = (value as string).length

// 尖括号语法（在 JSX 中不可用）
const length2: number = (<string>value).length

// 双重断言（不推荐，仅在必要时使用）
const num: number = 'hello' as unknown as number

// const 断言
const colors = ['red', 'green', 'blue'] as const
// 类型: readonly ['red', 'green', 'blue']

const config = {
  url: 'https://api.example.com',
  method: 'GET'
} as const
// 类型: { readonly url: 'https://api.example.com'; readonly method: 'GET' }

// 非空断言
function getLength(value: string | null): number {
  return value!.length // 断言 value 不为 null
}
```
:::

::: details 类型守卫
```typescript
// typeof 类型守卫
function padLeft(value: string, padding: string | number) {
  if (typeof padding === 'number') {
    return ' '.repeat(padding) + value
  }
  return padding + value
}

// instanceof 类型守卫
class Dog {
  bark() {
    console.log('Woof!')
  }
}

class Cat {
  meow() {
    console.log('Meow!')
  }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark()
  } else {
    animal.meow()
  }
}

// in 类型守卫
interface Fish {
  swim(): void
}

interface Bird {
  fly(): void
}

function move(animal: Fish | Bird) {
  if ('swim' in animal) {
    animal.swim()
  } else {
    animal.fly()
  }
}

// 自定义类型守卫
interface Cat {
  type: 'cat'
  meow(): void
}

interface Dog {
  type: 'dog'
  bark(): void
}

function isCat(animal: Cat | Dog): animal is Cat {
  return animal.type === 'cat'
}

function makeNoise(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow() // TypeScript 知道这是 Cat
  } else {
    animal.bark() // TypeScript 知道这是 Dog
  }
}

// 断言函数
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Value is not a string')
  }
}

function processValue(value: unknown) {
  assertIsString(value)
  // 这里 value 的类型是 string
  console.log(value.toUpperCase())
}
```
:::

## 枚举（Enum）

::: details 数字枚举
```typescript
// 默认从 0 开始
enum Direction {
  Up,      // 0
  Down,    // 1
  Left,    // 2
  Right    // 3
}

// 指定初始值
enum Status {
  Pending = 1,
  Active,     // 2
  Inactive    // 3
}

// 完全自定义
enum HttpCode {
  OK = 200,
  Created = 201,
  BadRequest = 400,
  NotFound = 404,
  ServerError = 500
}
```
:::

::: details 字符串枚举
```typescript
enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT'
}

// 字符串枚举必须每个成员都初始化
```
:::

::: details const 枚举
```typescript
// const 枚举在编译后会被内联，不会生成额外代码
const enum Direction {
  Up,
  Down,
  Left,
  Right
}

const dir = Direction.Up
// 编译后: const dir = 0

// 普通枚举会生成对象
enum RegularDirection {
  Up,
  Down
}
// 编译后会生成一个对象，支持反向映射
```
:::

::: details 枚举 vs 联合类型
```typescript
// 联合类型（推荐）
type Direction = 'up' | 'down' | 'left' | 'right'

// 好处：
// 1. 编译后没有额外代码
// 2. 类型更精确
// 3. 与 JavaScript 互操作更好

// 枚举的适用场景：
// 1. 需要双向映射（值 -> 名称）
// 2. 与后端 API 对齐
// 3. 在同一项目中保持一致性
```
:::

## 函数类型

::: details 函数类型定义
```typescript
// 函数声明
function add(a: number, b: number): number {
  return a + b
}

// 函数表达式
const subtract: (a: number, b: number) => number = (a, b) => a - b

// type 定义函数类型
type MathOperation = (a: number, b: number) => number

const multiply: MathOperation = (a, b) => a * b

// interface 定义函数类型
interface Calculator {
  (a: number, b: number): number
}

const divide: Calculator = (a, b) => a / b

// 可选参数和默认参数
function greet(name: string, greeting?: string): string {
  return `${greeting || 'Hello'}, ${name}!`
}

function greetWithDefault(name: string, greeting: string = 'Hello'): string {
  return `${greeting}, ${name}!`
}

// 剩余参数
function sum(...numbers: number[]): number {
  return numbers.reduce((acc, num) => acc + num, 0)
}
```
:::

::: details 函数重载
```typescript
// 函数重载签名
function createElement(tag: 'div'): HTMLDivElement
function createElement(tag: 'span'): HTMLSpanElement
function createElement(tag: 'input'): HTMLInputElement
function createElement(tag: string): HTMLElement {
  return document.createElement(tag)
}

const div = createElement('div') // HTMLDivElement
const span = createElement('span') // HTMLSpanElement

// 另一个例子
function reverse(x: string): string
function reverse(x: number[]): number[]
function reverse(x: string | number[]): string | number[] {
  if (typeof x === 'string') {
    return x.split('').reverse().join('')
  }
  return x.reverse()
}
```
:::

::: details this 类型
```typescript
// 显式 this 类型
interface User {
  name: string
  greet(this: User): string
}

const user: User = {
  name: 'Alice',
  greet() {
    return `Hello, ${this.name}!`
  }
}

// ThisParameterType 和 OmitThisParameter
type GreetFn = (this: User) => string
type GreetThisType = ThisParameterType<GreetFn> // User
type GreetWithoutThis = OmitThisParameter<GreetFn> // () => string
```
:::

## 类与接口

::: details 类的基本用法
```typescript
class Person {
  // 属性
  public name: string
  private age: number
  protected email: string
  readonly id: number

  // 静态属性
  static count: number = 0

  // 构造函数
  constructor(name: string, age: number, email: string) {
    this.id = ++Person.count
    this.name = name
    this.age = age
    this.email = email
  }

  // 方法
  greet(): string {
    return `Hello, ${this.name}!`
  }

  // getter/setter
  get userAge(): number {
    return this.age
  }

  set userAge(value: number) {
    if (value > 0) {
      this.age = value
    }
  }

  // 静态方法
  static getCount(): number {
    return Person.count
  }
}

// 简化写法 - 参数属性
class User {
  constructor(
    public name: string,
    private age: number,
    readonly id: number
  ) {}
}
```
:::

::: details 类实现接口
```typescript
interface Printable {
  print(): void
}

interface Loggable {
  log(message: string): void
}

// 实现多个接口
class Document implements Printable, Loggable {
  print(): void {
    console.log('Printing document...')
  }

  log(message: string): void {
    console.log(`[Document] ${message}`)
  }
}
```
:::

::: details 抽象类
```typescript
abstract class Animal {
  abstract name: string
  abstract makeSound(): void

  move(): void {
    console.log('Moving...')
  }
}

class Dog extends Animal {
  name = 'Dog'

  makeSound(): void {
    console.log('Woof!')
  }
}

// 不能直接实例化抽象类
// const animal = new Animal() // 错误
const dog = new Dog()
```
:::

## 面试题

::: details 1. interface 和 type 的区别？
<details>
<summary>点击查看答案</summary>

**核心区别**：

1. **声明合并**：interface 支持，type 不支持
2. **联合/交叉类型**：type 支持，interface 需要通过继承
3. **元组/映射类型**：只有 type 支持
4. **继承方式**：interface 用 extends，type 用 &

**使用建议**：
- 定义对象形状：优先用 interface
- 联合类型、元组、工具类型：用 type
- 需要扩展第三方库类型：用 interface

```typescript
// interface 声明合并
interface User { name: string }
interface User { age: number }
// 合并为 { name: string; age: number }

// type 不能重复声明
type Person = { name: string }
// type Person = { age: number } // 错误
```
:::

</details>

::: details 2. any、unknown、never 的区别？
<details>
<summary>点击查看答案</summary>

**any**：
- 任意类型，完全跳过类型检查
- 可以赋值给任何类型
- 任何类型都可以赋值给它
- 尽量避免使用

**unknown**：
- 安全的 any
- 任何类型都可以赋值给它
- 只能赋值给 unknown 或 any
- 使用前必须进行类型检查或断言

**never**：
- 永远不会有值的类型
- 函数永远不返回（抛异常、无限循环）
- 用于穷尽检查

```typescript
// any - 完全放弃类型检查
let a: any = 1
a.foo.bar // 不报错

// unknown - 必须检查后才能使用
let b: unknown = 'hello'
// b.toUpperCase() // 错误
if (typeof b === 'string') {
  b.toUpperCase() // 正确
}

// never - 穷尽检查
type Action = 'add' | 'delete'
function handle(action: Action) {
  switch (action) {
    case 'add': return
    case 'delete': return
    default:
      const exhaustive: never = action // 确保处理所有情况
  }
}
```
:::

</details>

::: details 3. TypeScript 中如何实现函数重载？
<details>
<summary>点击查看答案</summary>

```typescript
// 重载签名（只有类型，没有实现）
function reverse(x: string): string
function reverse(x: number[]): number[]

// 实现签名（必须兼容所有重载签名）
function reverse(x: string | number[]): string | number[] {
  if (typeof x === 'string') {
    return x.split('').reverse().join('')
  }
  return [...x].reverse()
}

// 调用时会根据参数类型选择正确的重载
const str = reverse('hello') // string
const arr = reverse([1, 2, 3]) // number[]
```

**注意事项**：
- 重载签名不是实现，只是类型声明
- 实现签名的参数类型必须兼容所有重载
- 调用时只能使用重载签名定义的类型
:::

</details>

::: details 4. 如何定义一个对象的所有属性都是可选的？
<details>
<summary>点击查看答案</summary>

```typescript
// 方法1：使用内置 Partial
interface User {
  name: string
  age: number
  email: string
}

type PartialUser = Partial<User>
// { name?: string; age?: number; email?: string }

// 方法2：手动实现 Partial
type MyPartial<T> = {
  [K in keyof T]?: T[K]
}

// 深度可选
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}
```
:::

</details>

::: details 5. keyof 和 typeof 的作用？
<details>
<summary>点击查看答案</summary>

**keyof**：获取对象类型的所有键组成的联合类型

```typescript
interface User {
  name: string
  age: number
}

type UserKeys = keyof User // 'name' | 'age'

// 使用场景：安全地访问对象属性
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
```

**typeof**：获取变量或属性的类型

```typescript
const user = {
  name: 'Alice',
  age: 25
}

type UserType = typeof user
// { name: string; age: number }

// 获取函数类型
function add(a: number, b: number) {
  return a + b
}

type AddFn = typeof add // (a: number, b: number) => number

// 结合使用
const colors = ['red', 'green', 'blue'] as const
type Color = typeof colors[number] // 'red' | 'green' | 'blue'
```
:::

</details>

::: details 6. 如何获取函数的参数类型和返回值类型？
<details>
<summary>点击查看答案</summary>

```typescript
function createUser(name: string, age: number): { id: number; name: string } {
  return { id: 1, name }
}

// 获取参数类型
type Params = Parameters<typeof createUser>
// [name: string, age: number]

// 获取单个参数类型
type FirstParam = Parameters<typeof createUser>[0] // string

// 获取返回值类型
type Result = ReturnType<typeof createUser>
// { id: number; name: string }

// 手动实现
type MyParameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never

type MyReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : never
```
:::

</details>

::: details 7. 如何实现一个 DeepReadonly？
<details>
<summary>点击查看答案</summary>

```typescript
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepReadonly<T[K]>
    : T[K]
}

// 使用
interface Config {
  database: {
    host: string
    port: number
  }
  features: string[]
}

type ReadonlyConfig = DeepReadonly<Config>
/*
{
  readonly database: {
    readonly host: string
    readonly port: number
  }
  readonly features: readonly string[]
}
*/
```
:::

</details>

::: details 8. infer 关键字的作用？
<details>
<summary>点击查看答案</summary>

`infer` 用于在条件类型中声明一个待推断的类型变量。

```typescript
// 提取数组元素类型
type ElementType<T> = T extends (infer E)[] ? E : never
type Num = ElementType<number[]> // number

// 提取 Promise 的值类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T
type Result = UnwrapPromise<Promise<string>> // string

// 提取函数第一个参数类型
type FirstArg<T> = T extends (first: infer F, ...args: any[]) => any ? F : never
type First = FirstArg<(a: string, b: number) => void> // string

// 提取构造函数实例类型
type InstanceType<T> = T extends new (...args: any[]) => infer R ? R : never

// 提取对象属性值类型
type ValueOf<T> = T[keyof T]
type PropType<T, K extends keyof T> = T extends { [P in K]: infer V } ? V : never
```
:::

</details>

::: details 9. 协变与逆变是什么？
<details>
<summary>点击查看答案</summary>

**协变（Covariance）**：子类型可以赋值给父类型
**逆变（Contravariance）**：父类型可以赋值给子类型

```typescript
// 协变 - 数组是协变的
class Animal { name = '' }
class Dog extends Animal { bark() {} }

let animals: Animal[] = []
let dogs: Dog[] = []

animals = dogs // OK - Dog[] 可以赋值给 Animal[]（协变）
// dogs = animals // 错误

// 函数返回值是协变的
type AnimalCreator = () => Animal
type DogCreator = () => Dog

let createAnimal: AnimalCreator = () => new Animal()
let createDog: DogCreator = () => new Dog()

createAnimal = createDog // OK - 返回值协变

// 函数参数是逆变的
type AnimalHandler = (animal: Animal) => void
type DogHandler = (dog: Dog) => void

let handleAnimal: AnimalHandler = (animal) => console.log(animal.name)
let handleDog: DogHandler = (dog) => dog.bark()

handleDog = handleAnimal // OK - 参数逆变
// handleAnimal = handleDog // 错误

// strictFunctionTypes: true 时强制函数参数逆变
```
:::

</details>

::: details 10. 如何让 TypeScript 识别 .vue 文件？
<details>
<summary>点击查看答案</summary>

创建 `shims-vue.d.ts` 文件：

```typescript
// shims-vue.d.ts
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

**其他常见声明**：

```typescript
// 图片模块
declare module '*.png' {
  const value: string
  export default value
}

declare module '*.jpg' {
  const value: string
  export default value
}

declare module '*.svg' {
  const value: string
  export default value
}

// CSS 模块
declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

// JSON 模块
declare module '*.json' {
  const value: any
  export default value
}
```
:::

</details>

::: details 11. declare 关键字的作用？
<details>
<summary>点击查看答案</summary>

`declare` 用于声明已存在的变量/类型，不会生成任何 JavaScript 代码。

```typescript
// 声明全局变量
declare const VERSION: string
declare function greet(name: string): void

// 声明全局模块
declare module 'lodash' {
  export function chunk<T>(array: T[], size: number): T[][]
}

// 声明命名空间
declare namespace MyLib {
  function init(): void
  const version: string
}

// 声明全局类型
declare global {
  interface Window {
    myGlobalVar: string
  }
}

// 声明类
declare class MyClass {
  constructor(name: string)
  getName(): string
}
```
:::

</details>

::: details 12. const 断言的作用？
<details>
<summary>点击查看答案</summary>

`as const` 将类型推断为最窄的字面量类型，并使所有属性变为 `readonly`。

```typescript
// 没有 as const
const colors = ['red', 'green', 'blue']
// 类型: string[]

// 使用 as const
const colors2 = ['red', 'green', 'blue'] as const
// 类型: readonly ['red', 'green', 'blue']

// 对象
const config = {
  url: 'https://api.example.com',
  method: 'GET'
} as const
// 类型: { readonly url: 'https://api.example.com'; readonly method: 'GET' }

// 常见用途：定义常量映射
const STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error'
} as const

type Status = typeof STATUS[keyof typeof STATUS]
// 'pending' | 'success' | 'error'
```
:::

</details>
