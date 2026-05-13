# TypeScript 泛型

## 什么是泛型？

泛型是一种创建可重用组件的工具，它可以支持多种类型而不是单一类型，同时保持类型安全。

```typescript
// 不使用泛型 - 失去类型信息
function identity(arg: any): any {
  return arg;
}

// 使用泛型 - 保持类型安全
function identity<T>(arg: T): T {
  return arg;
}

// 使用
const num = identity<number>(42);        // 显式指定类型
const str = identity('hello');           // 类型推断
```

### 为什么需要泛型？

```typescript
// ==================== 问题场景 ====================

// 1. 使用 any - 失去类型安全
function getFirst_any(arr: any[]): any {
  return arr[0]
}
const first_any = getFirst_any([1, 2, 3])
// first_any 是 any，可以调用任意方法而不报错
first_any.toUpperCase()  // 运行时错误，但编译时不报错

// 2. 重复定义 - 代码冗余
function getFirstNumber(arr: number[]): number {
  return arr[0]
}
function getFirstString(arr: string[]): string {
  return arr[0]
}
// 每种类型都要写一个函数...

// ==================== 泛型解决方案 ====================

function getFirst<T>(arr: T[]): T {
  return arr[0]
}

const firstNum = getFirst([1, 2, 3])     // firstNum: number
const firstStr = getFirst(['a', 'b'])    // firstStr: string

// firstNum.toUpperCase()  // 编译时报错！类型安全

// ==================== 泛型的优势 ====================

// 1. 类型安全 - 编译时检查类型错误
// 2. 代码复用 - 一个函数适用于多种类型
// 3. 类型推断 - TypeScript 自动推断类型参数
// 4. IDE 支持 - 更好的代码提示和补全
```

### 泛型命名约定

```typescript
// 常见的泛型类型参数命名
// T - Type（最常用）
// U, V - 第二、第三个类型参数
// K - Key
// V - Value
// E - Element
// P - Property
// R - Return / Result
// S - State
// A - Arguments

// 示例
function identity<T>(arg: T): T { return arg }
function swap<T, U>(tuple: [T, U]): [U, T] { return [tuple[1], tuple[0]] }
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] { return obj[key] }
type Record<K extends keyof any, V> = { [P in K]: V }

// 也可以使用更具描述性的名称
function fetchData<TResponse>(url: string): Promise<TResponse> {
  return fetch(url).then(res => res.json())
}

interface Cache<TKey, TValue> {
  get(key: TKey): TValue | undefined
  set(key: TKey, value: TValue): void
}
```

## 泛型函数

```typescript
// 基本泛型函数
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

// 多个类型参数
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

// 箭头函数泛型
const getLength = <T extends { length: number }>(arg: T): number => {
  return arg.length;
};

// 在 TSX 中需要加逗号避免与 JSX 混淆
const fn = <T,>(arg: T): T => arg;
```

### 泛型函数详解

```typescript
// ==================== 函数声明形式 ====================

// 普通函数声明
function identity<T>(arg: T): T {
  return arg
}

// 函数表达式
const identity2 = function<T>(arg: T): T {
  return arg
}

// 箭头函数
const identity3 = <T>(arg: T): T => arg

// TSX 中的箭头函数（需要加逗号或 extends）
const identity4 = <T,>(arg: T): T => arg
const identity5 = <T extends unknown>(arg: T): T => arg

// ==================== 多类型参数 ====================

// 两个类型参数
function swap<T, U>(a: T, b: U): [U, T] {
  return [b, a]
}

const [str, num] = swap(42, 'hello')
// str: string, num: number

// 三个类型参数
function triple<A, B, C>(a: A, b: B, c: C): [A, B, C] {
  return [a, b, c]
}

// 类型参数之间的关系
function copyFields<T extends U, U>(target: T, source: U): T {
  for (let id in source) {
    target[id] = (source as T)[id]
  }
  return target
}

// ==================== 泛型参数默认值 ====================

// 为泛型参数指定默认类型
function createArray<T = string>(length: number, value: T): T[] {
  return Array(length).fill(value)
}

const strings = createArray(3, 'x')      // string[]
const numbers = createArray(3, 42)       // number[]
const defaultStrings = createArray(3)    // 错误：需要提供 value

// 多个默认值
interface Config<T = string, U = number> {
  name: T
  count: U
}

const config1: Config = { name: 'test', count: 10 }
const config2: Config<boolean> = { name: true, count: 10 }
const config3: Config<string, string> = { name: 'a', count: 'b' }

// ==================== 泛型与函数重载 ====================

// 重载签名
function process<T extends string>(value: T): string
function process<T extends number>(value: T): number
function process<T extends string | number>(value: T): string | number {
  if (typeof value === 'string') {
    return value.toUpperCase()
  }
  return value * 2
}

const str = process('hello')  // string
const num = process(42)       // number

// ==================== 泛型与剩余参数 ====================

// 元组类型的剩余参数
function tuple<T extends unknown[]>(...args: T): T {
  return args
}

const t1 = tuple(1, 'a', true)  // [number, string, boolean]

// 展开元组类型
function spread<T extends unknown[], U extends unknown[]>(
  arr1: [...T],
  arr2: [...U]
): [...T, ...U] {
  return [...arr1, ...arr2]
}

const merged = spread([1, 2], ['a', 'b'])  // [number, number, string, string]

// ==================== 高阶函数的泛型 ====================

// 返回泛型函数的函数
function createIdentity<T>() {
  return function(value: T): T {
    return value
  }
}

const identityNumber = createIdentity<number>()
const result = identityNumber(42)  // number

// 接受泛型函数作为参数
function applyFn<T, R>(value: T, fn: (arg: T) => R): R {
  return fn(value)
}

const doubled = applyFn(21, x => x * 2)  // 42

// ==================== 泛型方法 ====================

const utils = {
  // 对象方法的泛型
  map<T, U>(arr: T[], fn: (item: T) => U): U[] {
    return arr.map(fn)
  },

  filter<T>(arr: T[], predicate: (item: T) => boolean): T[] {
    return arr.filter(predicate)
  },

  reduce<T, U>(arr: T[], fn: (acc: U, item: T) => U, initial: U): U {
    return arr.reduce(fn, initial)
  }
}

const numbers = [1, 2, 3, 4, 5]
const doubled = utils.map(numbers, n => n * 2)  // number[]
const evens = utils.filter(numbers, n => n % 2 === 0)  // number[]
const sum = utils.reduce(numbers, (acc, n) => acc + n, 0)  // number
```

## 泛型接口

```typescript
// 泛型接口
interface Container<T> {
  value: T;
  getValue(): T;
}

// 泛型接口实现
class Box<T> implements Container<T> {
  constructor(public value: T) {}
  getValue(): T {
    return this.value;
  }
}

// 泛型函数接口
interface GenericFn<T> {
  (arg: T): T;
}

const myIdentity: GenericFn<number> = (arg) => arg;
```

### 泛型接口详解

```typescript
// ==================== 泛型接口基础 ====================

// 描述对象结构的泛型接口
interface KeyValue<K, V> {
  key: K
  value: V
}

const item: KeyValue<string, number> = {
  key: 'count',
  value: 42
}

// 泛型接口可以有多个类型参数
interface Response<T, E = Error> {
  data: T | null
  error: E | null
  loading: boolean
}

// ==================== 泛型函数接口 ====================

// 方式1：接口描述整个函数类型
interface Mapper<T, U> {
  (input: T): U
}

const stringToNumber: Mapper<string, number> = (s) => parseInt(s)

// 方式2：接口内部有泛型方法
interface Utils {
  map<T, U>(arr: T[], fn: (item: T) => U): U[]
  filter<T>(arr: T[], predicate: (item: T) => boolean): T[]
}

// 方式3：泛型方法接口
interface GenericMethod {
  <T>(arg: T): T
}

const identity: GenericMethod = <T>(arg: T): T => arg

// 区别：
// Mapper<T, U> - 整个接口使用固定的 T, U
// GenericMethod - 每次调用可以使用不同的 T

// ==================== 泛型接口继承 ====================

// 基础接口
interface Identifiable {
  id: string | number
}

// 泛型接口继承普通接口
interface Entity<T> extends Identifiable {
  data: T
  createdAt: Date
}

// 泛型接口继承泛型接口
interface TimestampedEntity<T> extends Entity<T> {
  updatedAt: Date
}

// 使用
interface User {
  name: string
  email: string
}

const userEntity: TimestampedEntity<User> = {
  id: 1,
  data: { name: 'John', email: 'john@example.com' },
  createdAt: new Date(),
  updatedAt: new Date()
}

// ==================== 泛型接口与类 ====================

// 泛型接口定义仓储模式
interface Repository<T, ID = number> {
  findById(id: ID): Promise<T | null>
  findAll(): Promise<T[]>
  save(entity: T): Promise<T>
  update(id: ID, entity: Partial<T>): Promise<T>
  delete(id: ID): Promise<boolean>
}

// 类实现泛型接口
class UserRepository implements Repository<User> {
  async findById(id: number): Promise<User | null> {
    // 实现...
    return null
  }
  async findAll(): Promise<User[]> {
    return []
  }
  async save(entity: User): Promise<User> {
    return entity
  }
  async update(id: number, entity: Partial<User>): Promise<User> {
    return { name: '', email: '' }
  }
  async delete(id: number): Promise<boolean> {
    return true
  }
}

// ==================== 可调用接口 ====================

// 可调用对象的泛型接口
interface Callable<T, R> {
  (arg: T): R
  // 还可以有属性
  description: string
}

const myCallable: Callable<number, string> = Object.assign(
  (n: number) => n.toString(),
  { description: 'Converts number to string' }
)

myCallable(42)            // "42"
myCallable.description    // "Converts number to string"

// ==================== 构造函数接口 ====================

// 描述构造函数的泛型接口
interface Constructor<T> {
  new (...args: any[]): T
}

// 使用构造函数创建实例
function createInstance<T>(ctor: Constructor<T>): T {
  return new ctor()
}

class MyClass {
  value = 42
}

const instance = createInstance(MyClass)  // MyClass 实例

// 带参数的构造函数接口
interface ConstructorWithArgs<T, A extends any[]> {
  new (...args: A): T
}

function create<T, A extends any[]>(
  ctor: ConstructorWithArgs<T, A>,
  ...args: A
): T {
  return new ctor(...args)
}

class Person {
  constructor(public name: string, public age: number) {}
}

const person = create(Person, 'John', 30)  // Person { name: 'John', age: 30 }

// ==================== 索引签名与泛型 ====================

// 泛型字典类型
interface Dictionary<T> {
  [key: string]: T
}

const numberDict: Dictionary<number> = {
  one: 1,
  two: 2,
  three: 3
}

// 泛型映射类型
interface Mapped<T> {
  [K in keyof T]: T[K]  // 错误：接口不支持映射类型
}

// 使用 type 代替
type MappedType<T> = {
  [K in keyof T]: T[K]
}

// ==================== 泛型接口 vs 泛型类型别名 ====================

// 接口：可以继承、合并声明
interface InterfaceBox<T> {
  value: T
}

interface InterfaceBox<T> {
  // 声明合并
  getValue(): T
}

// 类型别名：更灵活，支持联合类型、元组等
type TypeBox<T> = {
  value: T
}

type StringOrBox<T> = string | TypeBox<T>  // 接口做不到

// 选择建议：
// - 描述对象结构：优先用 interface
// - 需要联合类型、元组：必须用 type
// - 需要声明合并：必须用 interface
```

## 泛型类

```typescript
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }
}

const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);

const stringStack = new Stack<string>();
stringStack.push('hello');
```

### 泛型类详解

```typescript
// ==================== 泛型类基础 ====================

// 基本泛型类
class Container<T> {
  private value: T

  constructor(value: T) {
    this.value = value
  }

  getValue(): T {
    return this.value
  }

  setValue(value: T): void {
    this.value = value
  }
}

const numContainer = new Container<number>(42)
const strContainer = new Container<string>('hello')

// 多类型参数的泛型类
class Pair<T, U> {
  constructor(
    public first: T,
    public second: U
  ) {}

  swap(): Pair<U, T> {
    return new Pair(this.second, this.first)
  }
}

const pair = new Pair('hello', 42)
const swapped = pair.swap()  // Pair<number, string>

// ==================== 泛型类与静态成员 ====================

class GenericClass<T> {
  // 实例成员可以使用类型参数
  instanceValue: T

  // 静态成员不能使用类型参数！
  // static staticValue: T  // 错误

  // 静态方法可以有自己的类型参数
  static create<U>(value: U): GenericClass<U> {
    const instance = new GenericClass<U>()
    instance.instanceValue = value
    return instance
  }

  constructor() {
    this.instanceValue = undefined as any
  }
}

// 静态成员是类级别的，不依赖于实例的类型参数
// 因为 GenericClass<number>.staticValue 和 GenericClass<string>.staticValue
// 实际上是同一个属性

// ==================== 泛型类继承 ====================

// 1. 泛型类继承泛型类
class Animal<T> {
  constructor(public data: T) {}
}

class Dog<T> extends Animal<T> {
  bark(): void {
    console.log('Woof!')
  }
}

// 2. 泛型类继承时固定类型参数
class NumberAnimal extends Animal<number> {
  constructor(value: number) {
    super(value)
  }
}

// 3. 普通类继承泛型类（必须指定类型参数）
class StringContainer extends Container<string> {
  toUpperCase(): string {
    return this.getValue().toUpperCase()
  }
}

// 4. 泛型类继承非泛型类
class Base {
  baseMethod(): void {}
}

class Derived<T> extends Base {
  derivedValue: T

  constructor(value: T) {
    super()
    this.derivedValue = value
  }
}

// ==================== 泛型类实现接口 ====================

interface Comparable<T> {
  compareTo(other: T): number
}

class NumberWrapper implements Comparable<NumberWrapper> {
  constructor(public value: number) {}

  compareTo(other: NumberWrapper): number {
    return this.value - other.value
  }
}

// 泛型类实现泛型接口
interface Collection<T> {
  add(item: T): void
  remove(item: T): boolean
  contains(item: T): boolean
  size(): number
}

class ArrayList<T> implements Collection<T> {
  private items: T[] = []

  add(item: T): void {
    this.items.push(item)
  }

  remove(item: T): boolean {
    const index = this.items.indexOf(item)
    if (index > -1) {
      this.items.splice(index, 1)
      return true
    }
    return false
  }

  contains(item: T): boolean {
    return this.items.includes(item)
  }

  size(): number {
    return this.items.length
  }
}

// ==================== 泛型类的类型约束 ====================

// 约束类型参数
class SortedList<T extends Comparable<T>> {
  private items: T[] = []

  add(item: T): void {
    this.items.push(item)
    this.items.sort((a, b) => a.compareTo(b))
  }

  getItems(): T[] {
    return [...this.items]
  }
}

// ==================== 泛型单例模式 ====================

class Singleton<T> {
  private static instances = new Map<string, any>()

  static getInstance<T>(key: string, factory: () => T): T {
    if (!this.instances.has(key)) {
      this.instances.set(key, factory())
    }
    return this.instances.get(key) as T
  }
}

// 使用
interface Config {
  apiUrl: string
  timeout: number
}

const config = Singleton.getInstance<Config>('config', () => ({
  apiUrl: 'https://api.example.com',
  timeout: 5000
}))

// ==================== 泛型工厂模式 ====================

abstract class Creator<T> {
  abstract createProduct(): T

  someOperation(): string {
    const product = this.createProduct()
    return `Creator: ${product}`
  }
}

class ConcreteCreator<T> extends Creator<T> {
  constructor(private factory: () => T) {
    super()
  }

  createProduct(): T {
    return this.factory()
  }
}

// 使用
const stringCreator = new ConcreteCreator(() => 'Hello')
const numberCreator = new ConcreteCreator(() => 42)

// ==================== 泛型观察者模式 ====================

interface Observer<T> {
  update(data: T): void
}

class Subject<T> {
  private observers: Observer<T>[] = []
  private state: T | undefined

  attach(observer: Observer<T>): void {
    this.observers.push(observer)
  }

  detach(observer: Observer<T>): void {
    const index = this.observers.indexOf(observer)
    if (index > -1) {
      this.observers.splice(index, 1)
    }
  }

  notify(): void {
    if (this.state !== undefined) {
      for (const observer of this.observers) {
        observer.update(this.state)
      }
    }
  }

  setState(state: T): void {
    this.state = state
    this.notify()
  }

  getState(): T | undefined {
    return this.state
  }
}

// 使用
class LogObserver<T> implements Observer<T> {
  update(data: T): void {
    console.log('Received:', data)
  }
}

const subject = new Subject<string>()
subject.attach(new LogObserver())
subject.setState('Hello')  // 输出: Received: Hello
```

## 泛型约束

```typescript
// 基本约束
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): number {
  return arg.length;
}

logLength('hello');      // OK
logLength([1, 2, 3]);    // OK
logLength({ length: 5 }); // OK
// logLength(42);        // Error: number 没有 length 属性

// 使用 keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: 'Alice', age: 25 };
getProperty(person, 'name');  // OK
// getProperty(person, 'email'); // Error

// 多重约束
interface HasId { id: number; }
interface HasName { name: string; }

function process<T extends HasId & HasName>(obj: T): string {
  return `${obj.id}: ${obj.name}`;
}
```

### 泛型约束详解

```typescript
// ==================== 基础约束 ====================

// 约束泛型必须具有某些属性
interface HasLength {
  length: number
}

function printLength<T extends HasLength>(item: T): void {
  console.log(item.length)
}

// 可以传入的类型
printLength('hello')           // string 有 length
printLength([1, 2, 3])         // array 有 length
printLength({ length: 10 })    // 对象有 length 属性

// 不可以传入的类型
// printLength(42)             // 错误：number 没有 length
// printLength({ size: 10 })   // 错误：没有 length 属性

// ==================== keyof 约束 ====================

// 约束为对象的键
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user = { name: 'Alice', age: 25, email: 'alice@example.com' }

const name = getProperty(user, 'name')   // string
const age = getProperty(user, 'age')     // number
// getProperty(user, 'address')          // 错误：'address' 不是 user 的键

// 设置属性的安全函数
function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]): void {
  obj[key] = value
}

setProperty(user, 'age', 30)       // OK
// setProperty(user, 'age', '30')  // 错误：期望 number

// ==================== 多重约束（交叉类型）====================

interface Nameable {
  name: string
}

interface Identifiable {
  id: number
}

// T 必须同时满足 Nameable 和 Identifiable
function describe<T extends Nameable & Identifiable>(entity: T): string {
  return `${entity.id}: ${entity.name}`
}

const entity = { id: 1, name: 'Entity', extra: 'data' }
describe(entity)  // "1: Entity"

// ==================== 类型参数之间的约束 ====================

// 一个类型参数约束另一个类型参数
function copyFields<T extends U, U>(target: T, source: U): T {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      (target as any)[key] = source[key]
    }
  }
  return target
}

const defaults = { host: 'localhost', port: 3000 }
const config = { host: 'example.com', port: 8080, ssl: true }

copyFields(config, defaults)  // T 必须包含 U 的所有属性

// ==================== 类类型约束 ====================

// 约束为可实例化的类型
interface Constructable<T> {
  new (...args: any[]): T
}

function createInstance<T>(ctor: Constructable<T>): T {
  return new ctor()
}

class MyClass {
  value = 42
}

const instance = createInstance(MyClass)  // MyClass 实例

// 约束为特定基类的子类
class Animal {
  move() {
    console.log('Moving...')
  }
}

class Dog extends Animal {
  bark() {
    console.log('Woof!')
  }
}

function createAnimal<T extends Animal>(ctor: new () => T): T {
  const animal = new ctor()
  animal.move()  // 可以调用 Animal 的方法
  return animal
}

const dog = createAnimal(Dog)
dog.bark()

// ==================== 联合类型约束 ====================

// 约束为特定的几种类型
type Primitive = string | number | boolean

function process<T extends Primitive>(value: T): T {
  return value
}

process('hello')  // OK
process(42)       // OK
process(true)     // OK
// process({})    // 错误：对象不是原始类型

// ==================== 条件约束 ====================

// 根据类型参数选择不同的约束
type StringOrNumber<T> = T extends string
  ? { toUpperCase(): string }
  : T extends number
  ? { toFixed(digits: number): string }
  : never

function processValue<T extends string | number>(
  value: T
): T extends string ? string : number {
  if (typeof value === 'string') {
    return value.toUpperCase() as any
  }
  return (value as number) * 2 as any
}

const str = processValue('hello')  // string
const num = processValue(21)       // number

// ==================== 递归约束 ====================

// 约束类型必须是可序列化的
type Serializable =
  | string
  | number
  | boolean
  | null
  | Serializable[]
  | { [key: string]: Serializable }

function serialize<T extends Serializable>(value: T): string {
  return JSON.stringify(value)
}

serialize('hello')
serialize({ name: 'Alice', scores: [1, 2, 3] })
// serialize(new Map())  // 错误：Map 不是 Serializable

// ==================== 约束与默认值 ====================

// 带默认值的约束
interface DefaultOptions {
  timeout: number
  retries: number
}

function request<T extends Partial<DefaultOptions> = {}>(
  url: string,
  options?: T
): void {
  const finalOptions = {
    timeout: 5000,
    retries: 3,
    ...options
  }
  console.log(url, finalOptions)
}

request('/api/data')
request('/api/data', { timeout: 10000 })
request('/api/data', { timeout: 10000, retries: 5 })

// ==================== 实用示例：类型安全的事件系统 ====================

interface EventMap {
  click: { x: number; y: number }
  keydown: { key: string; code: number }
  scroll: { scrollTop: number }
}

class TypedEventEmitter<T extends Record<string, any>> {
  private listeners: { [K in keyof T]?: Array<(data: T[K]) => void> } = {}

  on<K extends keyof T>(event: K, callback: (data: T[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event]!.push(callback)
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const callbacks = this.listeners[event]
    if (callbacks) {
      callbacks.forEach(cb => cb(data))
    }
  }
}

const emitter = new TypedEventEmitter<EventMap>()

emitter.on('click', (data) => {
  console.log(data.x, data.y)  // 类型安全
})

emitter.emit('click', { x: 100, y: 200 })
// emitter.emit('click', { key: 'a' })  // 错误：类型不匹配
```

## 泛型条件类型

```typescript
// 条件类型
type IsString<T> = T extends string ? 'yes' : 'no';

type A = IsString<string>;  // 'yes'
type B = IsString<number>;  // 'no'

// infer 关键字 - 类型推断
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type FnReturn = ReturnType<() => string>;  // string

// 获取数组元素类型
type ArrayElement<T> = T extends (infer E)[] ? E : never;

type Elem = ArrayElement<string[]>;  // string

// 获取 Promise 值类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type PromiseValue = UnwrapPromise<Promise<number>>;  // number
```

### 条件类型详解

```typescript
// ==================== 基本条件类型 ====================

// 条件类型的语法：T extends U ? X : Y
// 如果 T 可以赋值给 U，结果是 X，否则是 Y

type IsNumber<T> = T extends number ? true : false

type A = IsNumber<number>   // true
type B = IsNumber<string>   // false
type C = IsNumber<42>       // true（字面量类型）

// ==================== 嵌套条件类型 ====================

type TypeName<T> =
  T extends string ? 'string' :
  T extends number ? 'number' :
  T extends boolean ? 'boolean' :
  T extends undefined ? 'undefined' :
  T extends Function ? 'function' :
  'object'

type T1 = TypeName<string>      // 'string'
type T2 = TypeName<number[]>    // 'object'
type T3 = TypeName<() => void>  // 'function'

// ==================== 分布式条件类型 ====================

// 当条件类型作用于联合类型时，会自动分发
type Distributive<T> = T extends any ? T[] : never

type D1 = Distributive<string | number>
// 等价于 string[] | number[]（不是 (string | number)[]）

// 分发过程：
// Distributive<string | number>
// = Distributive<string> | Distributive<number>
// = string[] | number[]

// 禁止分发：用方括号包裹
type NonDistributive<T> = [T] extends [any] ? T[] : never

type D2 = NonDistributive<string | number>
// 结果是 (string | number)[]

// ==================== 实用的分布式条件类型 ====================

// 过滤联合类型中的特定类型
type Exclude<T, U> = T extends U ? never : T

type E1 = Exclude<'a' | 'b' | 'c', 'a'>        // 'b' | 'c'
type E2 = Exclude<string | number | boolean, number>  // string | boolean

// 保留联合类型中的特定类型
type Extract<T, U> = T extends U ? T : never

type E3 = Extract<'a' | 'b' | 'c', 'a' | 'b'>  // 'a' | 'b'
type E4 = Extract<string | number | boolean, number | string>  // string | number

// 去除 null 和 undefined
type NonNullable<T> = T extends null | undefined ? never : T

type E5 = NonNullable<string | null | undefined>  // string

// ==================== infer 关键字 ====================

// infer 用于在条件类型中声明一个类型变量
// 只能在 extends 子句中使用

// 提取函数返回类型
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never

type R1 = MyReturnType<() => string>           // string
type R2 = MyReturnType<(x: number) => boolean> // boolean
type R3 = MyReturnType<string>                 // never

// 提取函数参数类型
type MyParameters<T> = T extends (...args: infer P) => any ? P : never

type P1 = MyParameters<(a: number, b: string) => void>  // [number, string]
type P2 = MyParameters<() => void>                       // []

// 提取第一个参数
type FirstParameter<T> = T extends (first: infer F, ...rest: any[]) => any
  ? F
  : never

type F1 = FirstParameter<(a: number, b: string) => void>  // number

// 提取构造函数类型
type ConstructorParameters<T> = T extends new (...args: infer P) => any
  ? P
  : never

type InstanceType<T> = T extends new (...args: any[]) => infer R ? R : never

class Person {
  constructor(public name: string, public age: number) {}
}

type PersonArgs = ConstructorParameters<typeof Person>  // [string, number]
type PersonInstance = InstanceType<typeof Person>        // Person

// ==================== 复杂的 infer 使用 ====================

// 提取 Promise 的值类型（递归）
type Awaited<T> = T extends Promise<infer U>
  ? Awaited<U>  // 递归解包嵌套 Promise
  : T

type Aw1 = Awaited<Promise<string>>                    // string
type Aw2 = Awaited<Promise<Promise<number>>>          // number
type Aw3 = Awaited<Promise<Promise<Promise<boolean>>>>// boolean

// 提取数组元素类型
type Flatten<T> = T extends (infer U)[] ? U : T

type Flat1 = Flatten<string[]>    // string
type Flat2 = Flatten<number[][]>  // number[]

// 深度展平数组
type DeepFlatten<T> = T extends (infer U)[]
  ? DeepFlatten<U>
  : T

type Deep1 = DeepFlatten<number[][][]>  // number

// 提取函数的 this 类型
type ThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any
  ? U
  : unknown

function greet(this: { name: string }) {
  return `Hello, ${this.name}`
}

type GreetThis = ThisParameterType<typeof greet>  // { name: string }

// ==================== 条件类型中的多个 infer ====================

// 同时提取多个类型
type ParseFunction<T> = T extends (arg: infer A) => infer R
  ? { argument: A; return: R }
  : never

type Parsed = ParseFunction<(x: number) => string>
// { argument: number; return: string }

// 元组的首尾
type First<T> = T extends [infer F, ...any[]] ? F : never
type Last<T> = T extends [...any[], infer L] ? L : never
type Rest<T> = T extends [any, ...infer R] ? R : never

type Tuple = [1, 2, 3, 4, 5]
type F = First<Tuple>  // 1
type L = Last<Tuple>   // 5
type R = Rest<Tuple>   // [2, 3, 4, 5]

// 字符串模板中的 infer
type GetRouteParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | GetRouteParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
    ? Param
    : never

type RouteParams = GetRouteParams<'/users/:userId/posts/:postId'>
// 'userId' | 'postId'

// ==================== 条件类型与映射类型结合 ====================

// 过滤对象的属性
type FilterProperties<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K]
}

interface Mixed {
  name: string
  age: number
  isActive: boolean
  email: string
}

type StringProperties = FilterProperties<Mixed, string>
// { name: string; email: string }

// 提取函数属性
type FunctionProperties<T> = {
  [K in keyof T as T[K] extends Function ? K : never]: T[K]
}

interface API {
  url: string
  get: () => void
  post: (data: any) => void
}

type APIMethods = FunctionProperties<API>
// { get: () => void; post: (data: any) => void }

// ==================== 条件类型与泛型约束 ====================

// 约束和条件类型结合
type MessageOf<T> = T extends { message: unknown }
  ? T['message']
  : never

interface Email {
  message: string
}

interface Dog {
  bark(): void
}

type EmailMessage = MessageOf<Email>  // string
type DogMessage = MessageOf<Dog>      // never

// 更灵活的版本
type MessageOf2<T extends { message: unknown }> = T['message']

// type M = MessageOf2<Dog>  // 错误：Dog 没有 message 属性
```

## 泛型工具类型

```typescript
// Partial - 所有属性可选
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Required - 所有属性必填
type Required<T> = {
  [P in keyof T]-?: T[P];
};

// Readonly - 所有属性只读
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Pick - 选取部分属性
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Omit - 排除部分属性
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

// Record - 构造对象类型
type Record<K extends keyof any, T> = {
  [P in K]: T;
};

// 使用示例
interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;
type UserName = Pick<User, 'name'>;
type UserWithoutId = Omit<User, 'id'>;
```

### 内置工具类型详解

```typescript
// ==================== 属性修饰工具类型 ====================

// Partial<T> - 所有属性变为可选
type Partial<T> = {
  [P in keyof T]?: T[P]
}

interface User {
  id: number
  name: string
  email: string
}

type PartialUser = Partial<User>
// { id?: number; name?: string; email?: string }

// 实际应用：更新函数参数
function updateUser(id: number, updates: Partial<User>): void {
  // 只更新传入的字段
}
updateUser(1, { name: 'New Name' })  // 只更新 name

// Required<T> - 所有属性变为必填
type Required<T> = {
  [P in keyof T]-?: T[P]  // -? 移除可选修饰符
}

interface Config {
  host?: string
  port?: number
}

type RequiredConfig = Required<Config>
// { host: string; port: number }

// Readonly<T> - 所有属性变为只读
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

type ReadonlyUser = Readonly<User>
const user: ReadonlyUser = { id: 1, name: 'Alice', email: 'a@b.com' }
// user.name = 'Bob'  // 错误：无法分配到 "name" ，因为它是只读属性

// Mutable<T> - 移除只读（自定义）
type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

type MutableUser = Mutable<ReadonlyUser>

// ==================== 属性选择工具类型 ====================

// Pick<T, K> - 选取指定属性
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

type UserBasic = Pick<User, 'id' | 'name'>
// { id: number; name: string }

// Omit<T, K> - 排除指定属性
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>

type UserWithoutEmail = Omit<User, 'email'>
// { id: number; name: string }

// 排除多个属性
type UserIdOnly = Omit<User, 'name' | 'email'>
// { id: number }

// ==================== 联合类型工具 ====================

// Exclude<T, U> - 从 T 中排除可以赋值给 U 的类型
type Exclude<T, U> = T extends U ? never : T

type T1 = Exclude<'a' | 'b' | 'c', 'a'>           // 'b' | 'c'
type T2 = Exclude<string | number | boolean, string>  // number | boolean

// Extract<T, U> - 从 T 中提取可以赋值给 U 的类型
type Extract<T, U> = T extends U ? T : never

type T3 = Extract<'a' | 'b' | 'c', 'a' | 'f'>     // 'a'
type T4 = Extract<string | number | (() => void), Function>  // () => void

// NonNullable<T> - 排除 null 和 undefined
type NonNullable<T> = T extends null | undefined ? never : T

type T5 = NonNullable<string | null | undefined>  // string

// ==================== 函数相关工具类型 ====================

// Parameters<T> - 获取函数参数类型（元组）
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never

type Func = (a: number, b: string) => boolean
type FuncParams = Parameters<Func>  // [number, string]

// ReturnType<T> - 获取函数返回类型
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any

type FuncReturn = ReturnType<Func>  // boolean

// ThisParameterType<T> - 获取函数的 this 参数类型
type ThisParameterType<T> =
  T extends (this: infer U, ...args: any[]) => any ? U : unknown

function fn(this: { name: string }, x: number) {
  return this.name
}
type FnThis = ThisParameterType<typeof fn>  // { name: string }

// OmitThisParameter<T> - 移除函数的 this 参数
type OmitThisParameter<T> =
  unknown extends ThisParameterType<T>
    ? T
    : T extends (...args: infer A) => infer R
    ? (...args: A) => R
    : T

type FnWithoutThis = OmitThisParameter<typeof fn>  // (x: number) => string

// ==================== 构造函数相关工具类型 ====================

// ConstructorParameters<T> - 获取构造函数参数类型
type ConstructorParameters<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: infer P) => any ? P : never

class Person {
  constructor(public name: string, public age: number) {}
}

type PersonCtorParams = ConstructorParameters<typeof Person>  // [string, number]

// InstanceType<T> - 获取构造函数实例类型
type InstanceType<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: any) => infer R ? R : any

type PersonInstance = InstanceType<typeof Person>  // Person

// ==================== Record 类型 ====================

// Record<K, T> - 创建具有指定键和值类型的对象类型
type Record<K extends keyof any, T> = {
  [P in K]: T
}

// 使用字面量联合类型作为键
type Status = 'pending' | 'fulfilled' | 'rejected'
type StatusRecord = Record<Status, string>
// { pending: string; fulfilled: string; rejected: string }

// 使用 string 作为键
type StringRecord = Record<string, number>
// { [key: string]: number }

// 实际应用
interface Product {
  name: string
  price: number
}

type ProductMap = Record<string, Product>

const products: ProductMap = {
  'p1': { name: 'Phone', price: 999 },
  'p2': { name: 'Tablet', price: 599 }
}

// ==================== 字符串操作工具类型（4.1+）====================

// Uppercase<S> - 转大写
type Upper = Uppercase<'hello'>  // 'HELLO'

// Lowercase<S> - 转小写
type Lower = Lowercase<'HELLO'>  // 'hello'

// Capitalize<S> - 首字母大写
type Cap = Capitalize<'hello'>  // 'Hello'

// Uncapitalize<S> - 首字母小写
type Uncap = Uncapitalize<'Hello'>  // 'hello'

// 组合使用
type EventName<T extends string> = `on${Capitalize<T>}`

type ClickEvent = EventName<'click'>  // 'onClick'
type FocusEvent = EventName<'focus'>  // 'onFocus'

// ==================== Awaited 类型（4.5+）====================

// Awaited<T> - 解包 Promise
type Awaited<T> = T extends null | undefined
  ? T
  : T extends object & { then(onfulfilled: infer F): any }
  ? F extends (value: infer V, ...args: any) => any
    ? Awaited<V>
    : never
  : T

type A1 = Awaited<Promise<string>>           // string
type A2 = Awaited<Promise<Promise<number>>>  // number
type A3 = Awaited<boolean | Promise<string>> // boolean | string
```

### 自定义工具类型

```typescript
// ==================== 深度工具类型 ====================

// DeepPartial - 深度可选
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepPartial<T[P]>
    : T[P]
}

interface NestedConfig {
  database: {
    host: string
    port: number
    credentials: {
      username: string
      password: string
    }
  }
}

type PartialConfig = DeepPartial<NestedConfig>
// 所有嵌套属性都变为可选

// DeepReadonly - 深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepReadonly<T[P]>
    : T[P]
}

// DeepRequired - 深度必填
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepRequired<T[P]>
    : T[P]
}

// ==================== 属性操作工具类型 ====================

// 获取可选属性的键
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

interface Example {
  required: string
  optional?: number
  alsoRequired: boolean
}

type OptKeys = OptionalKeys<Example>  // 'optional'

// 获取必填属性的键
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

type ReqKeys = RequiredKeys<Example>  // 'required' | 'alsoRequired'

// 获取只读属性的键
type ReadonlyKeys<T> = {
  [K in keyof T]-?: IfEquals<
    { [Q in K]: T[K] },
    { -readonly [Q in K]: T[K] },
    never,
    K
  >
}[keyof T]

type IfEquals<X, Y, A, B> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? A : B

// ==================== 联合类型操作 ====================

// 联合类型转交叉类型
type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends
  (k: infer I) => void ? I : never

type Union = { a: string } | { b: number } | { c: boolean }
type Intersection = UnionToIntersection<Union>
// { a: string } & { b: number } & { c: boolean }

// 获取联合类型的最后一个成员
type LastOfUnion<T> =
  UnionToIntersection<T extends any ? (x: T) => void : never> extends
  (x: infer Last) => void ? Last : never

type Last = LastOfUnion<'a' | 'b' | 'c'>  // 'c'

// 联合类型转元组
type UnionToTuple<T, Last = LastOfUnion<T>> =
  [T] extends [never]
    ? []
    : [...UnionToTuple<Exclude<T, Last>>, Last]

type Tuple = UnionToTuple<'a' | 'b' | 'c'>  // ['a', 'b', 'c']

// ==================== 路径操作工具类型 ====================

// 获取对象所有路径
type Paths<T, K extends keyof T = keyof T> = K extends string | number
  ? T[K] extends object
    ? T[K] extends any[]
      ? K | `${K}.${Paths<T[K], Exclude<keyof T[K], keyof any[]>>}`
      : K | `${K}.${Paths<T[K]>}`
    : K
  : never

interface Nested {
  a: {
    b: {
      c: string
    }
    d: number
  }
  e: boolean
}

type NestedPaths = Paths<Nested>
// 'a' | 'e' | 'a.b' | 'a.d' | 'a.b.c'

// 根据路径获取类型
type PathValue<T, P extends string> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? PathValue<T[Key], Rest>
    : never
  : P extends keyof T
  ? T[P]
  : never

type Value = PathValue<Nested, 'a.b.c'>  // string

// ==================== 函数操作工具类型 ====================

// 追加参数
type AppendArgument<F extends (...args: any) => any, A> =
  F extends (...args: infer P) => infer R
    ? (...args: [...P, A]) => R
    : never

type Fn = (a: number, b: string) => boolean
type Extended = AppendArgument<Fn, Date>
// (a: number, b: string, arg: Date) => boolean

// 柯里化函数类型
type Curry<F extends (...args: any) => any> =
  F extends (...args: infer P) => infer R
    ? P extends [infer First, ...infer Rest]
      ? Rest extends []
        ? (arg: First) => R
        : (arg: First) => Curry<(...args: Rest) => R>
      : R
    : never

type CurriedFn = Curry<(a: number, b: string, c: boolean) => void>
// (arg: number) => (arg: string) => (arg: boolean) => void

// ==================== 对象操作工具类型 ====================

// 合并两个类型（后者覆盖前者）
type Merge<T, U> = Omit<T, keyof U> & U

interface A {
  name: string
  age: number
}

interface B {
  age: string  // 覆盖 A 的 age
  email: string
}

type AB = Merge<A, B>
// { name: string; age: string; email: string }

// 只选择指定类型的属性
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K]
}

interface Mixed {
  name: string
  age: number
  email: string
  active: boolean
}

type StringProps = PickByType<Mixed, string>
// { name: string; email: string }

// 排除指定类型的属性
type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K]
}

type NonStringProps = OmitByType<Mixed, string>
// { age: number; active: boolean }

// ==================== 条件工具类型 ====================

// 如果两个类型相等
type Equals<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false

type E1 = Equals<string, string>  // true
type E2 = Equals<string, number>  // false

// 断言工具类型
type Assert<T, U extends T> = U

// 确保类型满足条件
type EnsureArray<T> = T extends any[] ? T : never
type EnsureObject<T> = T extends object ? T : never
```

## 实际应用

### API 响应封装

```typescript
// ==================== 基础 API 响应类型 ====================

interface ApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 分页响应
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// 错误响应
interface ErrorResponse {
  code: number
  message: string
  errors?: Record<string, string[]>
}

// ==================== 类型安全的 API 客户端 ====================

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface RequestConfig<T = any> {
  method?: HttpMethod
  data?: T
  params?: Record<string, string | number>
  headers?: Record<string, string>
}

async function request<TResponse, TRequest = void>(
  url: string,
  config?: RequestConfig<TRequest>
): Promise<ApiResponse<TResponse>> {
  const response = await fetch(url, {
    method: config?.method || 'GET',
    body: config?.data ? JSON.stringify(config.data) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers
    }
  })
  return response.json()
}

// 使用示例
interface User {
  id: number
  name: string
  email: string
}

interface CreateUserRequest {
  name: string
  email: string
  password: string
}

// GET 请求
const getUser = async (id: number) => {
  return request<User>(`/api/users/${id}`)
}

// POST 请求
const createUser = async (data: CreateUserRequest) => {
  return request<User, CreateUserRequest>('/api/users', {
    method: 'POST',
    data
  })
}

// ==================== API 端点定义 ====================

// 定义 API 端点映射
interface ApiEndpoints {
  '/users': {
    GET: { response: User[]; params: { page?: number } }
    POST: { response: User; body: CreateUserRequest }
  }
  '/users/:id': {
    GET: { response: User; params: { id: number } }
    PUT: { response: User; body: Partial<User> }
    DELETE: { response: void }
  }
  '/posts': {
    GET: { response: Post[]; params: { userId?: number } }
    POST: { response: Post; body: CreatePostRequest }
  }
}

interface Post {
  id: number
  title: string
  content: string
}

interface CreatePostRequest {
  title: string
  content: string
}

// 类型安全的 API 调用
type ApiCall<
  E extends keyof ApiEndpoints,
  M extends keyof ApiEndpoints[E]
> = ApiEndpoints[E][M]

// 使用
type GetUsersResponse = ApiCall<'/users', 'GET'>['response']  // User[]
type CreateUserBody = ApiCall<'/users', 'POST'>['body']       // CreateUserRequest
```

### 状态管理

```typescript
// ==================== 简单状态管理 ====================

function createStore<T extends object>(initialState: T) {
  let state = initialState
  const listeners = new Set<(state: T) => void>()

  return {
    getState(): T {
      return state
    },

    setState(partial: Partial<T> | ((prev: T) => Partial<T>)): void {
      const updates = typeof partial === 'function' ? partial(state) : partial
      state = { ...state, ...updates }
      listeners.forEach(listener => listener(state))
    },

    subscribe(listener: (state: T) => void): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    // 选择器
    select<R>(selector: (state: T) => R): R {
      return selector(state)
    }
  }
}

// 使用
interface AppState {
  user: User | null
  theme: 'light' | 'dark'
  notifications: Notification[]
}

interface Notification {
  id: string
  message: string
  type: 'info' | 'warning' | 'error'
}

const store = createStore<AppState>({
  user: null,
  theme: 'light',
  notifications: []
})

// 类型安全的状态更新
store.setState({ theme: 'dark' })
store.setState(prev => ({
  notifications: [...prev.notifications, {
    id: '1',
    message: 'Hello',
    type: 'info'
  }]
}))

// ==================== Redux 风格状态管理 ====================

// Action 类型定义
type Action<T extends string = string, P = any> = {
  type: T
  payload: P
}

// Action 创建器
function createAction<T extends string, P>(type: T) {
  return (payload: P): Action<T, P> => ({ type, payload })
}

// Reducer 类型
type Reducer<S, A extends Action> = (state: S, action: A) => S

// Action 映射
interface ActionMap {
  SET_USER: User | null
  SET_THEME: 'light' | 'dark'
  ADD_NOTIFICATION: Notification
  REMOVE_NOTIFICATION: string
}

// 从映射生成 Action 联合类型
type ActionUnion = {
  [K in keyof ActionMap]: Action<K, ActionMap[K]>
}[keyof ActionMap]

// Reducer 实现
const reducer: Reducer<AppState, ActionUnion> = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'SET_THEME':
      return { ...state, theme: action.payload }
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      }
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      }
    default:
      return state
  }
}

// ==================== Zustand 风格状态管理 ====================

type SetState<T> = (
  partial: Partial<T> | ((state: T) => Partial<T>),
  replace?: boolean
) => void

type GetState<T> = () => T

type StateCreator<T> = (
  set: SetState<T>,
  get: GetState<T>
) => T

function create<T extends object>(createState: StateCreator<T>) {
  let state: T
  const listeners = new Set<(state: T) => void>()

  const setState: SetState<T> = (partial, replace) => {
    const nextState = typeof partial === 'function'
      ? partial(state)
      : partial

    if (replace) {
      state = nextState as T
    } else {
      state = { ...state, ...nextState }
    }

    listeners.forEach(listener => listener(state))
  }

  const getState: GetState<T> = () => state

  state = createState(setState, getState)

  return {
    getState,
    setState,
    subscribe: (listener: (state: T) => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    }
  }
}

// 使用
interface BearState {
  bears: number
  increase: () => void
  decrease: () => void
  reset: () => void
}

const useBearStore = create<BearState>((set, get) => ({
  bears: 0,
  increase: () => set({ bears: get().bears + 1 }),
  decrease: () => set(state => ({ bears: Math.max(0, state.bears - 1) })),
  reset: () => set({ bears: 0 })
}))
```

### 表单验证

```typescript
// ==================== 类型安全的表单验证 ====================

// 验证规则类型
type ValidationRule<T> = {
  validate: (value: T) => boolean
  message: string
}

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[]
}

type ValidationErrors<T> = {
  [K in keyof T]?: string[]
}

// 验证函数
function validate<T extends object>(
  data: T,
  rules: ValidationRules<T>
): ValidationErrors<T> {
  const errors: ValidationErrors<T> = {}

  for (const key in rules) {
    const fieldRules = rules[key]
    if (!fieldRules) continue

    const value = data[key]
    const fieldErrors: string[] = []

    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        fieldErrors.push(rule.message)
      }
    }

    if (fieldErrors.length > 0) {
      errors[key] = fieldErrors
    }
  }

  return errors
}

// 常用验证规则工厂
const required = <T>(message = '此字段必填'): ValidationRule<T> => ({
  validate: (value) => value !== undefined && value !== null && value !== '',
  message
})

const minLength = (min: number, message?: string): ValidationRule<string> => ({
  validate: (value) => value.length >= min,
  message: message || `最少需要 ${min} 个字符`
})

const maxLength = (max: number, message?: string): ValidationRule<string> => ({
  validate: (value) => value.length <= max,
  message: message || `最多 ${max} 个字符`
})

const pattern = (regex: RegExp, message: string): ValidationRule<string> => ({
  validate: (value) => regex.test(value),
  message
})

const email = (message = '请输入有效的邮箱'): ValidationRule<string> => ({
  validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  message
})

const min = (minValue: number, message?: string): ValidationRule<number> => ({
  validate: (value) => value >= minValue,
  message: message || `不能小于 ${minValue}`
})

// 使用示例
interface RegisterForm {
  username: string
  email: string
  password: string
  age: number
}

const registerRules: ValidationRules<RegisterForm> = {
  username: [
    required('用户名必填'),
    minLength(3, '用户名至少 3 个字符'),
    maxLength(20, '用户名最多 20 个字符')
  ],
  email: [
    required('邮箱必填'),
    email('请输入有效的邮箱地址')
  ],
  password: [
    required('密码必填'),
    minLength(8, '密码至少 8 个字符'),
    pattern(/[A-Z]/, '密码需要包含大写字母'),
    pattern(/[0-9]/, '密码需要包含数字')
  ],
  age: [
    required('年龄必填'),
    min(18, '年龄必须大于等于 18')
  ]
}

const formData: RegisterForm = {
  username: 'ab',
  email: 'invalid-email',
  password: 'weak',
  age: 16
}

const errors = validate(formData, registerRules)
// {
//   username: ['用户名至少 3 个字符'],
//   email: ['请输入有效的邮箱地址'],
//   password: ['密码至少 8 个字符', '密码需要包含大写字母', '密码需要包含数字'],
//   age: ['年龄必须大于等于 18']
// }

// ==================== 表单状态管理 ====================

interface FormState<T> {
  values: T
  errors: ValidationErrors<T>
  touched: { [K in keyof T]?: boolean }
  isValid: boolean
  isSubmitting: boolean
}

function useForm<T extends object>(
  initialValues: T,
  rules: ValidationRules<T>
) {
  let state: FormState<T> = {
    values: initialValues,
    errors: {},
    touched: {},
    isValid: true,
    isSubmitting: false
  }

  const validateField = <K extends keyof T>(name: K, value: T[K]) => {
    const fieldRules = rules[name]
    if (!fieldRules) return []

    return fieldRules
      .filter(rule => !rule.validate(value))
      .map(rule => rule.message)
  }

  const setFieldValue = <K extends keyof T>(name: K, value: T[K]) => {
    state.values[name] = value
    const fieldErrors = validateField(name, value)
    if (fieldErrors.length > 0) {
      state.errors[name] = fieldErrors
    } else {
      delete state.errors[name]
    }
    state.isValid = Object.keys(state.errors).length === 0
  }

  const setFieldTouched = <K extends keyof T>(name: K) => {
    state.touched[name] = true
  }

  const handleSubmit = async (onSubmit: (values: T) => Promise<void>) => {
    state.errors = validate(state.values, rules)
    state.isValid = Object.keys(state.errors).length === 0

    if (state.isValid) {
      state.isSubmitting = true
      try {
        await onSubmit(state.values)
      } finally {
        state.isSubmitting = false
      }
    }
  }

  return {
    state,
    setFieldValue,
    setFieldTouched,
    handleSubmit,
    reset: () => {
      state = {
        values: initialValues,
        errors: {},
        touched: {},
        isValid: true,
        isSubmitting: false
      }
    }
  }
}
```

### React Hooks 泛型

```typescript
// ==================== 类型安全的 React Hooks ====================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

// useState 类型推断
const [count, setCount] = useState(0)           // number
const [user, setUser] = useState<User | null>(null)  // User | null

// useReducer 类型
type CounterAction =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset'; payload: number }

function counterReducer(state: number, action: CounterAction): number {
  switch (action.type) {
    case 'increment': return state + 1
    case 'decrement': return state - 1
    case 'reset': return action.payload
  }
}

// const [count, dispatch] = useReducer(counterReducer, 0)
// dispatch({ type: 'increment' })
// dispatch({ type: 'reset', payload: 10 })

// ==================== 自定义 Hook: useFetch ====================

interface UseFetchState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

function useFetch<T>(url: string): UseFetchState<T> {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }))
        const response = await fetch(url)
        const data: T = await response.json()
        setState({ data, loading: false, error: null })
      } catch (error) {
        setState({ data: null, loading: false, error: error as Error })
      }
    }

    fetchData()
  }, [url])

  return state
}

// 使用
// const { data, loading, error } = useFetch<User[]>('/api/users')

// ==================== 自定义 Hook: useLocalStorage ====================

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue(prev => {
      const valueToStore = value instanceof Function ? value(prev) : value
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
      return valueToStore
    })
  }, [key])

  return [storedValue, setValue]
}

// 使用
// const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light')

// ==================== 自定义 Hook: useDebounce ====================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// ==================== 自定义 Hook: useAsync ====================

interface UseAsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

function useAsync<T, P extends any[]>(
  asyncFn: (...args: P) => Promise<T>
): UseAsyncState<T> & { execute: (...args: P) => Promise<void> } {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const execute = useCallback(async (...args: P) => {
    setState({ data: null, loading: true, error: null })
    try {
      const data = await asyncFn(...args)
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error })
    }
  }, [asyncFn])

  return { ...state, execute }
}

// 使用
// const { data, loading, error, execute } = useAsync(fetchUser)
// execute(userId)

// ==================== 自定义 Hook: useEventListener ====================

function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: Window
): void

function useEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: HTMLElement
): void

function useEventListener(
  eventName: string,
  handler: (event: Event) => void,
  element: Window | HTMLElement = window
): void {
  const savedHandler = useRef(handler)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const eventListener = (event: Event) => savedHandler.current(event)
    element.addEventListener(eventName, eventListener)
    return () => element.removeEventListener(eventName, eventListener)
  }, [eventName, element])
}

// 使用
// useEventListener('click', (e) => console.log(e.clientX, e.clientY))
// useEventListener('keydown', (e) => console.log(e.key))
```

### 依赖注入容器

```typescript
// ==================== 简单的 DI 容器 ====================

type Constructor<T = any> = new (...args: any[]) => T

class Container {
  private services = new Map<string, any>()
  private singletons = new Map<string, any>()

  // 注册服务
  register<T>(token: string, service: Constructor<T>): void {
    this.services.set(token, service)
  }

  // 注册单例
  registerSingleton<T>(token: string, service: Constructor<T>): void {
    this.services.set(token, { service, singleton: true })
  }

  // 注册值
  registerValue<T>(token: string, value: T): void {
    this.singletons.set(token, value)
  }

  // 解析服务
  resolve<T>(token: string): T {
    // 检查是否已有单例实例
    if (this.singletons.has(token)) {
      return this.singletons.get(token)
    }

    const registration = this.services.get(token)
    if (!registration) {
      throw new Error(`Service not found: ${token}`)
    }

    // 检查是否是单例配置
    if (registration.singleton) {
      const instance = new registration.service()
      this.singletons.set(token, instance)
      return instance
    }

    // 普通服务，每次创建新实例
    return new registration()
  }
}

// 使用示例
interface Logger {
  log(message: string): void
}

class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(`[LOG] ${message}`)
  }
}

interface UserService {
  getUser(id: number): Promise<User>
}

class UserServiceImpl implements UserService {
  constructor(private logger: Logger) {}

  async getUser(id: number): Promise<User> {
    this.logger.log(`Fetching user ${id}`)
    return { id, name: 'User', email: 'user@example.com' }
  }
}

// 注册和使用
const container = new Container()
container.registerSingleton('Logger', ConsoleLogger)
// container.register('UserService', UserServiceImpl)

const logger = container.resolve<Logger>('Logger')
logger.log('Hello')

// ==================== 带依赖解析的高级容器 ====================

type Token<T> = symbol & { __type: T }

function createToken<T>(description: string): Token<T> {
  return Symbol(description) as Token<T>
}

class AdvancedContainer {
  private bindings = new Map<symbol, () => any>()

  bind<T>(token: Token<T>, factory: () => T): void {
    this.bindings.set(token, factory)
  }

  get<T>(token: Token<T>): T {
    const factory = this.bindings.get(token)
    if (!factory) {
      throw new Error(`No binding found for token`)
    }
    return factory()
  }
}

// 使用
const LoggerToken = createToken<Logger>('Logger')
const UserServiceToken = createToken<UserService>('UserService')

const advContainer = new AdvancedContainer()
advContainer.bind(LoggerToken, () => new ConsoleLogger())
// advContainer.bind(UserServiceToken, () =>
//   new UserServiceImpl(advContainer.get(LoggerToken))
// )

const loggerInstance = advContainer.get(LoggerToken)  // Logger 类型
```

