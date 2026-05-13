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

### 基本区别

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

### 核心区别总结

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

### 1. 声明合并（Declaration Merging）

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

### 2. 继承方式

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

### 3. 联合类型和交叉类型

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

### 4. 元组和映射类型

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

### 5. 实际使用建议

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

## 联合类型与交叉类型

### 联合类型（Union Types）

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

### 交叉类型（Intersection Types）

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

## 类型断言与类型守卫

### 类型断言

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

### 类型守卫

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

## 枚举（Enum）

### 数字枚举

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

### 字符串枚举

```typescript
enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT'
}

// 字符串枚举必须每个成员都初始化
```

### const 枚举

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

### 枚举 vs 联合类型

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

## 函数类型

### 函数类型定义

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

### 函数重载

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

### this 类型

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

## 类与接口

### 类的基本用法

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

### 类实现接口

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

### 抽象类

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

