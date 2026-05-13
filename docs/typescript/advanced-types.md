# TypeScript 高级类型

## 联合类型与交叉类型

```typescript
// 联合类型 - 多选一
type StringOrNumber = string | number;

function printId(id: StringOrNumber) {
  if (typeof id === 'string') {
    console.log(id.toUpperCase());
  } else {
    console.log(id);
  }
}

// 交叉类型 - 合并所有
interface Person {
  name: string;
}

interface Employee {
  employeeId: number;
}

type Staff = Person & Employee;

const staff: Staff = {
  name: 'Alice',
  employeeId: 123
};
```

### 联合类型详解

```typescript
// ==================== 联合类型基础 ====================

// 基础类型联合
type Primitive = string | number | boolean | null | undefined

// 字面量联合
type Direction = 'north' | 'south' | 'east' | 'west'
type StatusCode = 200 | 201 | 400 | 404 | 500
type Result = 'success' | 'error' | 0 | 1

// 对象类型联合
interface Dog {
  kind: 'dog'
  bark(): void
}

interface Cat {
  kind: 'cat'
  meow(): void
}

type Pet = Dog | Cat

// ==================== 联合类型收窄 ====================

// 类型收窄（Type Narrowing）
function handlePet(pet: Pet) {
  // 使用可辨识属性
  if (pet.kind === 'dog') {
    pet.bark()  // 类型收窄为 Dog
  } else {
    pet.meow()  // 类型收窄为 Cat
  }
}

// 使用 in 操作符
function processInput(input: string | string[]) {
  if ('length' in input && typeof input !== 'string') {
    return input.join(', ')  // string[]
  }
  return input.toUpperCase()  // string
}

// ==================== 可辨识联合（Discriminated Unions）====================

interface Circle {
  kind: 'circle'
  radius: number
}

interface Rectangle {
  kind: 'rectangle'
  width: number
  height: number
}

interface Triangle {
  kind: 'triangle'
  base: number
  height: number
}

type Shape = Circle | Rectangle | Triangle

// 穷尽检查
function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2
    case 'rectangle':
      return shape.width * shape.height
    case 'triangle':
      return (shape.base * shape.height) / 2
    default:
      // 确保所有情况都被处理
      const _exhaustiveCheck: never = shape
      return _exhaustiveCheck
  }
}

// ==================== 联合类型与分布式条件类型 ====================

// 条件类型会分布在联合类型上
type ToArray<T> = T extends any ? T[] : never

type StrOrNumArray = ToArray<string | number>
// = ToArray<string> | ToArray<number>
// = string[] | number[]

// 避免分布式行为
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never
type StrOrNumArrayNonDist = ToArrayNonDist<string | number>
// = (string | number)[]

// ==================== 联合类型工具 ====================

// 从联合类型中排除
type Exclude<T, U> = T extends U ? never : T
type NumberOrBoolean = Exclude<string | number | boolean, string>  // number | boolean

// 提取联合类型中的共同类型
type Extract<T, U> = T extends U ? T : never
type StringType = Extract<string | number | boolean, string | boolean>  // string | boolean

// 非空类型
type NonNullable<T> = T extends null | undefined ? never : T
type ValidValue = NonNullable<string | null | undefined>  // string
```

### 交叉类型详解

```typescript
// ==================== 交叉类型基础 ====================

// 合并对象类型
interface Colorful {
  color: string
}

interface Circle {
  radius: number
}

type ColorfulCircle = Colorful & Circle

const cc: ColorfulCircle = {
  color: 'red',
  radius: 10
}

// ==================== 交叉类型与接口继承对比 ====================

// 接口继承
interface Animal {
  name: string
}

interface Bear extends Animal {
  honey: boolean
}

// 交叉类型
type BearType = Animal & {
  honey: boolean
}

// 主要区别：
// 1. 接口可以重复声明（声明合并）
// 2. 交叉类型可以与任意类型交叉
// 3. 交叉类型处理冲突属性时会创建 never 类型

// ==================== 交叉类型冲突处理 ====================

interface A {
  name: string
  age: number
}

interface B {
  name: string  // 同名同类型：保持
  age: string   // 同名不同类型：变为 never
}

type AB = A & B
// {
//   name: string
//   age: never  // number & string = never
// }

// 方法重载（不冲突）
interface HasMethod1 {
  fn(a: string): string
}

interface HasMethod2 {
  fn(a: number): number
}

type Combined = HasMethod1 & HasMethod2
// fn 变成重载函数

const obj: Combined = {
  fn(a: string | number): string | number {
    return typeof a === 'string' ? a.toUpperCase() : a * 2
  }
}

// ==================== 交叉类型应用场景 ====================

// 1. 混入模式
function applyMixins<T, U>(obj: T, mixin: U): T & U {
  return { ...obj, ...mixin }
}

// 2. 扩展现有类型
type WithTimestamp<T> = T & {
  createdAt: Date
  updatedAt: Date
}

interface User {
  id: number
  name: string
}

type UserWithTimestamp = WithTimestamp<User>

// 3. 组合多个接口
interface Printable {
  print(): void
}

interface Loggable {
  log(): void
}

interface Serializable {
  serialize(): string
}

type FullFeatured = Printable & Loggable & Serializable

// ==================== 联合类型与交叉类型的关系 ====================

// 分配律
type T1 = (A | B) & C  // 等价于 (A & C) | (B & C)
type T2 = A & (B | C)  // 等价于 (A & B) | (A & C)

// 实际应用
type EventHandler<T> =
  | ((event: T) => void)
  | { handleEvent: (event: T) => void }

type ClickHandler = EventHandler<MouseEvent> & {
  readonly passive: boolean
}
```

## 类型守卫

```typescript
// typeof 守卫
function padLeft(value: string, padding: string | number) {
  if (typeof padding === 'number') {
    return ' '.repeat(padding) + value;
  }
  return padding + value;
}

// instanceof 守卫
class Bird { fly() {} }
class Fish { swim() {} }

function move(animal: Bird | Fish) {
  if (animal instanceof Bird) {
    animal.fly();
  } else {
    animal.swim();
  }
}

// in 守卫
interface Circle { kind: 'circle'; radius: number; }
interface Square { kind: 'square'; size: number; }

function getArea(shape: Circle | Square) {
  if ('radius' in shape) {
    return Math.PI * shape.radius ** 2;
  }
  return shape.size ** 2;
}

// 自定义类型守卫
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function processValue(value: unknown) {
  if (isString(value)) {
    console.log(value.toUpperCase());  // 类型收窄为 string
  }
}
```

### 类型守卫详解

```typescript
// ==================== 内置类型守卫 ====================

// 1. typeof 守卫
// 支持: 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function'
function formatValue(value: string | number | boolean) {
  if (typeof value === 'string') {
    return value.trim()
  }
  if (typeof value === 'number') {
    return value.toFixed(2)
  }
  return value ? 'yes' : 'no'
}

// 2. instanceof 守卫
class ApiError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

class NetworkError extends Error {
  retryable: boolean
  constructor(message: string, retryable: boolean) {
    super(message)
    this.retryable = retryable
  }
}

function handleError(error: Error) {
  if (error instanceof ApiError) {
    console.log(`API Error: ${error.statusCode}`)
  } else if (error instanceof NetworkError) {
    console.log(`Network Error, retryable: ${error.retryable}`)
  } else {
    console.log(`Unknown Error: ${error.message}`)
  }
}

// 3. in 守卫
interface Admin {
  role: 'admin'
  permissions: string[]
}

interface User {
  role: 'user'
  email: string
}

type Person = Admin | User

function getInfo(person: Person) {
  if ('permissions' in person) {
    return person.permissions.join(', ')  // Admin
  }
  return person.email  // User
}

// 4. 相等性收窄
function handleInput(x: string | number, y: string | boolean) {
  if (x === y) {
    // x 和 y 都是 string（唯一可能相等的类型）
    console.log(x.toUpperCase())
    console.log(y.toLowerCase())
  }
}

// 5. 真值收窄
function processString(str: string | null | undefined) {
  if (str) {
    // str 是 string（非空字符串）
    console.log(str.length)
  }
}

// 6. 数组类型守卫
function processArray(value: string | string[]) {
  if (Array.isArray(value)) {
    return value.join(', ')
  }
  return value
}

// ==================== 自定义类型守卫 ====================

// 基本语法: parameterName is Type
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number'
}

// 对象类型守卫
interface Cat {
  meow(): void
  purr(): void
}

interface Dog {
  bark(): void
  wagTail(): void
}

function isCat(animal: Cat | Dog): animal is Cat {
  return 'meow' in animal
}

function isDog(animal: Cat | Dog): animal is Dog {
  return 'bark' in animal
}

function handleAnimal(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow()
    animal.purr()
  } else {
    animal.bark()
    animal.wagTail()
  }
}

// 复杂对象类型守卫
interface SuccessResponse {
  success: true
  data: unknown
}

interface ErrorResponse {
  success: false
  error: string
}

type ApiResponse = SuccessResponse | ErrorResponse

function isSuccess(response: ApiResponse): response is SuccessResponse {
  return response.success === true
}

function handleResponse(response: ApiResponse) {
  if (isSuccess(response)) {
    console.log('Data:', response.data)
  } else {
    console.log('Error:', response.error)
  }
}

// ==================== 断言函数（Assertion Functions）====================

// asserts 关键字
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Value must be a string')
  }
}

function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error('Value must be defined')
  }
}

function processData(data: unknown) {
  assertIsString(data)
  // 此后 data 的类型是 string
  console.log(data.toUpperCase())
}

// 条件断言
function assertCondition(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

function divide(a: number, b: number): number {
  assertCondition(b !== 0, 'Cannot divide by zero')
  return a / b
}

// ==================== 类型守卫工具函数 ====================

// 判断是否为对象
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// 判断是否有特定属性
function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj
}

// 判断是否为特定类型的数组
function isArrayOf<T>(
  value: unknown,
  check: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(check)
}

// 使用示例
const data: unknown = ['hello', 'world']
if (isArrayOf(data, isString)) {
  // data 是 string[]
  console.log(data.map(s => s.toUpperCase()))
}

// ==================== 判断可选属性 ====================

interface WithOptionalName {
  name?: string
  age: number
}

function hasName(obj: WithOptionalName): obj is WithOptionalName & { name: string } {
  return obj.name !== undefined
}

function greet(obj: WithOptionalName) {
  if (hasName(obj)) {
    console.log(`Hello, ${obj.name}`)  // name 是 string
  }
}

// ==================== 递归类型守卫 ====================

type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }

function isJSONValue(value: unknown): value is JSONValue {
  if (value === null) return true
  if (typeof value === 'string') return true
  if (typeof value === 'number') return true
  if (typeof value === 'boolean') return true
  if (Array.isArray(value)) {
    return value.every(isJSONValue)
  }
  if (isObject(value)) {
    return Object.values(value).every(isJSONValue)
  }
  return false
}
```

## 映射类型

```typescript
// 基本映射
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

// 键重映射 (TS 4.1+)
type Getters<T> = {
  [P in keyof T as \`get\${Capitalize<string & P>}\`]: () => T[P];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number; }

// 条件映射
type NonNullable<T> = T extends null | undefined ? never : T;
```

### 映射类型详解

```typescript
// ==================== 映射类型基础 ====================

// 基本语法: { [P in K]: T }
// P - 类型变量，遍历 K 中的每个类型
// K - 键的联合类型（通常是 keyof T）
// T - 值的类型

// 内置映射类型
type Partial<T> = {
  [P in keyof T]?: T[P]
}

type Required<T> = {
  [P in keyof T]-?: T[P]  // -? 移除可选
}

type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

type Mutable<T> = {
  -readonly [P in keyof T]: T[P]  // -readonly 移除只读
}

// ==================== 修饰符操作 ====================

interface User {
  readonly id: number
  name?: string
  email?: string
}

// 移除 readonly
type MutableUser = {
  -readonly [P in keyof User]: User[P]
}
// { id: number; name?: string; email?: string }

// 移除可选
type RequiredUser = {
  [P in keyof User]-?: User[P]
}
// { readonly id: number; name: string; email: string }

// 同时移除两者
type MutableRequiredUser = {
  -readonly [P in keyof User]-?: User[P]
}
// { id: number; name: string; email: string }

// ==================== 键的过滤与转换 ====================

// 只保留字符串类型的属性
type StringKeysOnly<T> = {
  [P in keyof T as T[P] extends string ? P : never]: T[P]
}

interface Mixed {
  name: string
  age: number
  email: string
  active: boolean
}

type StringProps = StringKeysOnly<Mixed>
// { name: string; email: string }

// 排除特定属性
type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P]
}

type NonStringProps = OmitByType<Mixed, string>
// { age: number; active: boolean }

// ==================== 键重映射 (as 子句) ====================

// 添加前缀
type Prefixed<T, Prefix extends string> = {
  [P in keyof T as \`\${Prefix}\${Capitalize<string & P>}\`]: T[P]
}

interface Actions {
  get: () => void
  set: (value: any) => void
}

type PrefixedActions = Prefixed<Actions, 'on'>
// { onGet: () => void; onSet: (value: any) => void }

// 生成 Getter 和 Setter
type Accessors<T> = {
  [P in keyof T as \`get\${Capitalize<string & P>}\`]: () => T[P]
} & {
  [P in keyof T as \`set\${Capitalize<string & P>}\`]: (value: T[P]) => void
}

type PersonAccessors = Accessors<{ name: string; age: number }>
// {
//   getName: () => string
//   setName: (value: string) => void
//   getAge: () => number
//   setAge: (value: number) => void
// }

// ==================== 条件映射类型 ====================

// 根据值类型转换
type Stringify<T> = {
  [P in keyof T]: T[P] extends object
    ? Stringify<T[P]>  // 递归处理对象
    : string
}

// 深度 Partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P]
}

// 深度 Required
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object
    ? DeepRequired<T[P]>
    : T[P]
}

// 深度 Readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P]
}

// ==================== 实用映射类型示例 ====================

// 1. Pick 实现
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P]
}

// 2. Omit 实现
type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P]
}

// 3. Record 实现
type MyRecord<K extends keyof any, T> = {
  [P in K]: T
}

// 4. 属性类型转换
type Nullable<T> = {
  [P in keyof T]: T[P] | null
}

type Promisify<T> = {
  [P in keyof T]: Promise<T[P]>
}

// 5. 函数参数提取
type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never
}[keyof T]

type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K
}[keyof T]

// 6. 事件处理器映射
type EventHandlers<T> = {
  [P in keyof T as \`on\${Capitalize<string & P>}Change\`]: (newValue: T[P], oldValue: T[P]) => void
}

interface State {
  count: number
  name: string
}

type StateHandlers = EventHandlers<State>
// {
//   onCountChange: (newValue: number, oldValue: number) => void
//   onNameChange: (newValue: string, oldValue: string) => void
// }

// ==================== 映射类型与索引签名 ====================

// 保留索引签名
type KeepIndexSignature<T> = {
  [P in keyof T]: T[P]
}

// 移除索引签名（只保留已知属性）
type RemoveIndexSignature<T> = {
  [P in keyof T as string extends P
    ? never
    : number extends P
    ? never
    : P
  ]: T[P]
}

interface WithIndex {
  [key: string]: any
  name: string
  age: number
}

type WithoutIndex = RemoveIndexSignature<WithIndex>
// { name: string; age: number }
```

## 模板字面量类型

```typescript
// 基本模板字面量
type Greeting = \`Hello, \${string}\`;
const g1: Greeting = 'Hello, World';  // OK
// const g2: Greeting = 'Hi, World';  // Error

// 联合类型组合
type Direction = 'top' | 'right' | 'bottom' | 'left';
type Margin = \`margin-\${Direction}\`;
// 'margin-top' | 'margin-right' | 'margin-bottom' | 'margin-left'

// 内置字符串操作类型
type Upper = Uppercase<'hello'>;      // 'HELLO'
type Lower = Lowercase<'HELLO'>;      // 'hello'
type Cap = Capitalize<'hello'>;       // 'Hello'
type Uncap = Uncapitalize<'Hello'>;   // 'hello'
```

### 模板字面量类型详解

```typescript
// ==================== 基础语法 ====================

// 模板字面量类型使用反引号和 ${} 插值
type World = 'world'
type HelloWorld = \`Hello \${World}\`  // "Hello world"

// 插入联合类型会产生分布式结果
type Color = 'red' | 'green' | 'blue'
type Size = 'small' | 'large'

type ColorSize = \`\${Color}-\${Size}\`
// "red-small" | "red-large" | "green-small" | "green-large" | "blue-small" | "blue-large"

// 多个联合类型的笛卡尔积
type ABC = 'A' | 'B' | 'C'
type Num = '1' | '2'
type Combined = \`\${ABC}\${Num}\`
// "A1" | "A2" | "B1" | "B2" | "C1" | "C2"

// ==================== 内置字符串操作类型 ====================

// 1. Uppercase<S> - 转大写
type Loud = Uppercase<'hello'>  // "HELLO"
type AllUpper = Uppercase<'hello' | 'world'>  // "HELLO" | "WORLD"

// 2. Lowercase<S> - 转小写
type Quiet = Lowercase<'HELLO'>  // "hello"

// 3. Capitalize<S> - 首字母大写
type Proper = Capitalize<'hello'>  // "Hello"
type EventName = Capitalize<'click' | 'change'>  // "Click" | "Change"

// 4. Uncapitalize<S> - 首字母小写
type Lower = Uncapitalize<'Hello'>  // "hello"

// ==================== 实际应用场景 ====================

// 1. CSS 属性类型
type CSSProperty =
  | \`margin-\${'top' | 'right' | 'bottom' | 'left'}\`
  | \`padding-\${'top' | 'right' | 'bottom' | 'left'}\`
  | \`border-\${'top' | 'right' | 'bottom' | 'left'}-\${'width' | 'style' | 'color'}\`

// 2. 事件处理器
type EventType = 'click' | 'focus' | 'blur' | 'change'
type EventHandler = \`on\${Capitalize<EventType>}\`
// "onClick" | "onFocus" | "onBlur" | "onChange"

// 3. HTTP 方法和路由
type HttpMethod = 'get' | 'post' | 'put' | 'delete'
type ApiPath = '/users' | '/posts' | '/comments'
type ApiEndpoint = \`\${Uppercase<HttpMethod>} \${ApiPath}\`
// "GET /users" | "GET /posts" | ... 等12种组合

// 4. 状态机状态
type State = 'idle' | 'loading' | 'success' | 'error'
type StateAction = \`set\${Capitalize<State>}\`
// "setIdle" | "setLoading" | "setSuccess" | "setError"

// ==================== 模板字面量与推断 ====================

// 使用 infer 提取字符串部分
type ExtractRouteParams<T extends string> =
  T extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? Param | ExtractRouteParams<Rest>
    : T extends \`\${string}:\${infer Param}\`
    ? Param
    : never

type Params = ExtractRouteParams<'/users/:userId/posts/:postId'>
// "userId" | "postId"

// 提取事件名
type ExtractEventName<T extends string> =
  T extends \`on\${infer Name}\`
    ? Uncapitalize<Name>
    : never

type EventNames = ExtractEventName<'onClick' | 'onFocus' | 'onChange'>
// "click" | "focus" | "change"

// 提取 getter 属性名
type ExtractGetterName<T extends string> =
  T extends \`get\${infer Name}\`
    ? Uncapitalize<Name>
    : never

type GetterProps = ExtractGetterName<'getName' | 'getAge' | 'getValue'>
// "name" | "age" | "value"

// ==================== 字符串解析 ====================

// 解析点分隔路径
type ParsePath<T extends string> =
  T extends \`\${infer Head}.\${infer Tail}\`
    ? [Head, ...ParsePath<Tail>]
    : [T]

type Path = ParsePath<'a.b.c.d'>
// ["a", "b", "c", "d"]

// 解析查询字符串
type ParseQueryString<T extends string> =
  T extends \`\${infer Key}=\${infer Value}&\${infer Rest}\`
    ? { [K in Key]: Value } & ParseQueryString<Rest>
    : T extends \`\${infer Key}=\${infer Value}\`
    ? { [K in Key]: Value }
    : {}

type QueryParams = ParseQueryString<'name=John&age=30&city=NYC'>
// { name: "John" } & { age: "30" } & { city: "NYC" }

// ==================== 字符串操作工具类型 ====================

// 1. 字符串拼接
type Join<T extends string[], D extends string> =
  T extends []
    ? ''
    : T extends [infer F extends string]
    ? F
    : T extends [infer F extends string, ...infer R extends string[]]
    ? \`\${F}\${D}\${Join<R, D>}\`
    : never

type Joined = Join<['a', 'b', 'c'], '-'>  // "a-b-c"

// 2. 字符串分割
type Split<S extends string, D extends string> =
  S extends \`\${infer Head}\${D}\${infer Tail}\`
    ? [Head, ...Split<Tail, D>]
    : S extends ''
    ? []
    : [S]

type Parts = Split<'a-b-c', '-'>  // ["a", "b", "c"]

// 3. 字符串替换
type Replace<S extends string, From extends string, To extends string> =
  S extends \`\${infer Head}\${From}\${infer Tail}\`
    ? \`\${Head}\${To}\${Tail}\`
    : S

type Replaced = Replace<'hello world', 'world', 'TypeScript'>
// "hello TypeScript"

// 4. 全部替换
type ReplaceAll<S extends string, From extends string, To extends string> =
  S extends \`\${infer Head}\${From}\${infer Tail}\`
    ? ReplaceAll<\`\${Head}\${To}\${Tail}\`, From, To>
    : S

type AllReplaced = ReplaceAll<'a-b-c-d', '-', '_'>
// "a_b_c_d"

// 5. 去除空格
type TrimLeft<S extends string> =
  S extends \` \${infer R}\` | \`\\n\${infer R}\` | \`\\t\${infer R}\`
    ? TrimLeft<R>
    : S

type TrimRight<S extends string> =
  S extends \`\${infer R} \` | \`\${infer R}\\n\` | \`\${infer R}\\t\`
    ? TrimRight<R>
    : S

type Trim<S extends string> = TrimLeft<TrimRight<S>>

type Trimmed = Trim<'  hello world  '>  // "hello world"

// ==================== 实战：类型安全的 i18n ====================

type Translations = {
  'common.hello': 'Hello'
  'common.goodbye': 'Goodbye'
  'user.name': 'Name'
  'user.email': 'Email'
}

type TranslationKey = keyof Translations

// 提取命名空间
type ExtractNamespace<T extends string> =
  T extends \`\${infer NS}.\${string}\` ? NS : never

type Namespaces = ExtractNamespace<TranslationKey>
// "common" | "user"

// 获取命名空间下的键
type GetKeysInNamespace<NS extends string> = {
  [K in TranslationKey]: K extends \`\${NS}.\${infer Key}\` ? Key : never
}[TranslationKey]

type CommonKeys = GetKeysInNamespace<'common'>  // "hello" | "goodbye"
type UserKeys = GetKeysInNamespace<'user'>  // "name" | "email"

// ==================== 实战：类型安全的路由 ====================

// 定义路由
type Routes = {
  '/': {}
  '/users': {}
  '/users/:userId': { userId: string }
  '/users/:userId/posts': { userId: string }
  '/users/:userId/posts/:postId': { userId: string; postId: string }
}

// 提取路由参数
type ExtractParams<T extends string> =
  T extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? { [K in Param]: string } & ExtractParams<\`/\${Rest}\`>
    : T extends \`\${string}:\${infer Param}\`
    ? { [K in Param]: string }
    : {}

type UserPostParams = ExtractParams<'/users/:userId/posts/:postId'>
// { userId: string } & { postId: string }

// 类型安全的导航函数
declare function navigate<T extends keyof Routes>(
  path: T,
  params: Routes[T]
): void

// navigate('/users/:userId/posts/:postId', { userId: '1', postId: '2' })  // OK
// navigate('/users/:userId/posts/:postId', { userId: '1' })  // Error
```

## 递归类型

```typescript
// JSON 类型
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

// 深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

// 深度可选
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};
```

### 递归类型详解

```typescript
// ==================== 递归类型基础 ====================

// 递归类型是指在类型定义中引用自身的类型
// TypeScript 4.1+ 支持递归条件类型

// 链表类型
type LinkedList<T> = {
  value: T
  next: LinkedList<T> | null
}

// 树结构
type TreeNode<T> = {
  value: T
  children: TreeNode<T>[]
}

// 嵌套对象
type NestedObject = {
  [key: string]: string | NestedObject
}

// ==================== 深度工具类型 ====================

// 1. 深度 Partial（处理数组）
type DeepPartial<T> = T extends object
  ? T extends (infer U)[]
    ? DeepPartial<U>[]
    : { [P in keyof T]?: DeepPartial<T[P]> }
  : T

// 2. 深度 Required
type DeepRequired<T> = T extends object
  ? T extends (infer U)[]
    ? DeepRequired<U>[]
    : { [P in keyof T]-?: DeepRequired<T[P]> }
  : T

// 3. 深度 Readonly
type DeepReadonly<T> = T extends object
  ? T extends (infer U)[]
    ? readonly DeepReadonly<U>[]
    : { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T

// 4. 深度 Mutable
type DeepMutable<T> = T extends object
  ? T extends (infer U)[]
    ? DeepMutable<U>[]
    : { -readonly [P in keyof T]: DeepMutable<T[P]> }
  : T

// 使用示例
interface Config {
  database: {
    host: string
    port: number
    credentials: {
      username: string
      password: string
    }
  }
  features: string[]
}

type PartialConfig = DeepPartial<Config>
// 所有属性（包括嵌套）都是可选的

type ReadonlyConfig = DeepReadonly<Config>
// 所有属性（包括嵌套）都是只读的

// ==================== 递归条件类型 ====================

// 展平数组类型
type Flatten<T> = T extends (infer U)[]
  ? Flatten<U>
  : T

type Flat1 = Flatten<number[]>           // number
type Flat2 = Flatten<number[][]>         // number
type Flat3 = Flatten<number[][][]>       // number
type Flat4 = Flatten<string | number[]>  // string | number

// 展平指定深度
type FlattenDepth<T, D extends number, A extends any[] = []> =
  A['length'] extends D
    ? T
    : T extends (infer U)[]
    ? FlattenDepth<U, D, [any, ...A]>
    : T

type FlatD1 = FlattenDepth<number[][][], 1>  // number[][]
type FlatD2 = FlattenDepth<number[][][], 2>  // number[]
type FlatD3 = FlattenDepth<number[][][], 3>  // number

// 获取嵌套对象的路径
type Paths<T, D extends number = 10, A extends any[] = []> =
  A['length'] extends D
    ? never
    : T extends object
    ? {
        [K in keyof T]: K extends string | number
          ? `${K}` | `${K}.${Paths<T[K], D, [any, ...A]>}`
          : never
      }[keyof T]
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
// "a" | "e" | "a.b" | "a.d" | "a.b.c"

// ==================== 路径访问类型 ====================

// 根据路径获取类型
type PathValue<T, P extends string> =
  P extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
      ? PathValue<T[Key], Rest>
      : never
    : P extends keyof T
    ? T[P]
    : never

type Value1 = PathValue<Nested, 'a.b.c'>  // string
type Value2 = PathValue<Nested, 'a.d'>    // number
type Value3 = PathValue<Nested, 'e'>      // boolean

// 类型安全的 get 函数
declare function get<T, P extends Paths<T>>(
  obj: T,
  path: P
): PathValue<T, P>

// const value = get(nested, 'a.b.c')  // 类型为 string

// ==================== 递归元组操作 ====================

// 反转元组
type Reverse<T extends any[]> =
  T extends [infer First, ...infer Rest]
    ? [...Reverse<Rest>, First]
    : []

type Reversed = Reverse<[1, 2, 3, 4]>  // [4, 3, 2, 1]

// 元组长度
type Length<T extends any[]> = T['length']

// 去除第一个元素
type Tail<T extends any[]> =
  T extends [any, ...infer Rest] ? Rest : []

// 去除最后一个元素
type Init<T extends any[]> =
  T extends [...infer Rest, any] ? Rest : []

// 获取最后一个元素
type Last<T extends any[]> =
  T extends [...any[], infer L] ? L : never

// 拼接元组
type Concat<T extends any[], U extends any[]> = [...T, ...U]

// 包含判断
type Includes<T extends any[], U> =
  T extends [infer First, ...infer Rest]
    ? Equal<First, U> extends true
      ? true
      : Includes<Rest, U>
    : false

// ==================== 递归数字操作 ====================

// 使用元组长度模拟数字
type BuildArray<N extends number, A extends any[] = []> =
  A['length'] extends N
    ? A
    : BuildArray<N, [...A, any]>

// 加法
type Add<A extends number, B extends number> =
  [...BuildArray<A>, ...BuildArray<B>]['length'] & number

type Sum = Add<3, 4>  // 7

// 减法
type Subtract<A extends number, B extends number> =
  BuildArray<A> extends [...BuildArray<B>, ...infer R]
    ? R['length']
    : never

type Diff = Subtract<10, 3>  // 7

// 乘法（递归加法）
type Multiply<A extends number, B extends number, R extends any[] = []> =
  B extends 0
    ? R['length']
    : Multiply<A, Subtract<B, 1>, [...R, ...BuildArray<A>]>

type Product = Multiply<3, 4>  // 12

// 范围类型
type Range<
  Start extends number,
  End extends number,
  R extends number[] = []
> = Start extends End
  ? [...R, End]
  : Range<Add<Start, 1>, End, [...R, Start]>

type Numbers = Range<1, 5>  // [1, 2, 3, 4, 5]

// ==================== Promise 递归展开 ====================

// 递归获取 Promise 的值类型
type Awaited<T> =
  T extends null | undefined
    ? T
    : T extends object & { then(onfulfilled: infer F): any }
    ? F extends (value: infer V, ...args: any) => any
      ? Awaited<V>
      : never
    : T

type P1 = Awaited<Promise<string>>                    // string
type P2 = Awaited<Promise<Promise<number>>>           // number
type P3 = Awaited<Promise<Promise<Promise<boolean>>>> // boolean

// ==================== JSON 类型 ====================

// 完整的 JSON 类型定义
type JSONPrimitive = string | number | boolean | null
type JSONArray = JSONValue[]
type JSONObject = { [key: string]: JSONValue }
type JSONValue = JSONPrimitive | JSONArray | JSONObject

// 可序列化类型判断
type IsSerializable<T> =
  T extends JSONValue
    ? true
    : T extends Function
    ? false
    : T extends object
    ? { [K in keyof T]: IsSerializable<T[K]> }[keyof T] extends true
      ? true
      : false
    : false

// ==================== 实战：类型安全的状态管理 ====================

// 嵌套状态更新
type NestedKeyOf<T extends object> = {
  [K in keyof T & (string | number)]: T[K] extends object
    ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
    : `${K}`
}[keyof T & (string | number)]

interface AppState {
  user: {
    profile: {
      name: string
      email: string
    }
    settings: {
      theme: 'light' | 'dark'
      notifications: boolean
    }
  }
  posts: string[]
}

type StateKeys = NestedKeyOf<AppState>
// "user" | "posts" | "user.profile" | "user.settings" |
// "user.profile.name" | "user.profile.email" |
// "user.settings.theme" | "user.settings.notifications"

// 类型安全的状态更新函数
declare function updateState<P extends NestedKeyOf<AppState>>(
  path: P,
  value: PathValue<AppState, P>
): void

// updateState('user.profile.name', 'John')  // OK
// updateState('user.settings.theme', 'dark')  // OK
// updateState('user.profile.name', 123)  // Error

// ==================== 递归类型限制 ====================

// TypeScript 对递归深度有限制
// 超过限制会报错：Type instantiation is excessively deep and possibly infinite

// 使用计数器限制深度
type DeepType<T, D extends number = 10, A extends any[] = []> =
  A['length'] extends D
    ? T  // 达到深度限制，停止递归
    : T extends object
    ? { [K in keyof T]: DeepType<T[K], D, [any, ...A]> }
    : T

// 优化递归：使用尾递归
type TailRecursive<T, Acc = never> =
  T extends [infer H, ...infer Rest]
    ? TailRecursive<Rest, Acc | H>
    : Acc

type Union = TailRecursive<[1, 2, 3, 4, 5]>  // 1 | 2 | 3 | 4 | 5
```

## 可辨识联合

```typescript
// 使用公共属性区分类型
interface Circle {
  kind: 'circle';
  radius: number;
}

interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}

interface Triangle {
  kind: 'triangle';
  base: number;
  height: number;
}

type Shape = Circle | Rectangle | Triangle;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'triangle':
      return (shape.base * shape.height) / 2;
  }
}

// 穷尽检查
function assertNever(x: never): never {
  throw new Error('Unexpected: ' + x);
}

function getAreaExhaustive(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'triangle':
      return (shape.base * shape.height) / 2;
    default:
      return assertNever(shape);  // 确保处理所有情况
  }
}
```

### 可辨识联合详解

```typescript
// ==================== 可辨识联合基础 ====================

// 可辨识联合（Discriminated Unions）也称为标签联合（Tagged Unions）
// 三个要素：
// 1. 联合类型中的每个类型都有一个共同的单例类型属性（辨识属性/标签）
// 2. 类型别名将这些类型联合起来
// 3. 使用类型守卫检查辨识属性

// 基本示例
interface Loading {
  state: 'loading'
}

interface Success<T> {
  state: 'success'
  data: T
}

interface Error {
  state: 'error'
  message: string
}

type AsyncState<T> = Loading | Success<T> | Error

function handleState<T>(state: AsyncState<T>): void {
  switch (state.state) {
    case 'loading':
      console.log('Loading...')
      break
    case 'success':
      console.log('Data:', state.data)  // 类型收窄为 Success<T>
      break
    case 'error':
      console.log('Error:', state.message)  // 类型收窄为 Error
      break
  }
}

// ==================== 多种辨识属性 ====================

// 字符串字面量作为辨识属性
type StringDiscriminator =
  | { type: 'text'; content: string }
  | { type: 'image'; url: string; alt: string }
  | { type: 'video'; url: string; duration: number }

// 数字字面量作为辨识属性
type StatusCode =
  | { code: 200; data: unknown }
  | { code: 400; error: string }
  | { code: 500; error: string; stack?: string }

// 布尔值作为辨识属性
type ValidationResult =
  | { valid: true; value: string }
  | { valid: false; errors: string[] }

// ==================== 穷尽性检查 ====================

// 方式1：使用 never
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`)
}

function processMedia(media: StringDiscriminator): string {
  switch (media.type) {
    case 'text':
      return media.content
    case 'image':
      return `<img src="${media.url}" alt="${media.alt}" />`
    case 'video':
      return `<video src="${media.url}" />`
    default:
      return assertNever(media)  // 如果添加新类型，这里会报错
  }
}

// 方式2：使用返回值类型检查
function getMediaDescription(media: StringDiscriminator): string {
  switch (media.type) {
    case 'text':
      return 'Text content'
    case 'image':
      return 'Image'
    case 'video':
      return 'Video'
    // 如果漏掉某个分支，TypeScript 会报错：
    // Function lacks ending return statement and return type does not include 'undefined'
  }
}

// ==================== 实战应用 ====================

// 1. Redux Action 类型
interface AddTodoAction {
  type: 'ADD_TODO'
  payload: { id: string; text: string }
}

interface ToggleTodoAction {
  type: 'TOGGLE_TODO'
  payload: { id: string }
}

interface DeleteTodoAction {
  type: 'DELETE_TODO'
  payload: { id: string }
}

type TodoAction = AddTodoAction | ToggleTodoAction | DeleteTodoAction

function todoReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, { id: action.payload.id, text: action.payload.text, done: false }]
    case 'TOGGLE_TODO':
      return state.map(todo =>
        todo.id === action.payload.id ? { ...todo, done: !todo.done } : todo
      )
    case 'DELETE_TODO':
      return state.filter(todo => todo.id !== action.payload.id)
  }
}

// 2. API 响应处理
type ApiResponse<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T; timestamp: number }
  | { status: 'error'; error: Error; retryCount: number }

function renderResponse<T>(
  response: ApiResponse<T>,
  render: (data: T) => string
): string {
  switch (response.status) {
    case 'idle':
      return 'Ready to fetch'
    case 'loading':
      return 'Loading...'
    case 'success':
      return render(response.data)
    case 'error':
      return `Error: ${response.error.message} (retries: ${response.retryCount})`
  }
}

// 3. 表单字段类型
type FormField =
  | { type: 'text'; value: string; maxLength?: number }
  | { type: 'number'; value: number; min?: number; max?: number }
  | { type: 'select'; value: string; options: string[] }
  | { type: 'checkbox'; value: boolean }
  | { type: 'date'; value: Date; minDate?: Date; maxDate?: Date }

function validateField(field: FormField): boolean {
  switch (field.type) {
    case 'text':
      return !field.maxLength || field.value.length <= field.maxLength
    case 'number':
      return (
        (field.min === undefined || field.value >= field.min) &&
        (field.max === undefined || field.value <= field.max)
      )
    case 'select':
      return field.options.includes(field.value)
    case 'checkbox':
      return true
    case 'date':
      const time = field.value.getTime()
      return (
        (!field.minDate || time >= field.minDate.getTime()) &&
        (!field.maxDate || time <= field.maxDate.getTime())
      )
  }
}

// 4. 事件系统
type DOMEvent =
  | { type: 'click'; x: number; y: number; button: 'left' | 'right' | 'middle' }
  | { type: 'keydown'; key: string; ctrlKey: boolean; shiftKey: boolean }
  | { type: 'scroll'; scrollX: number; scrollY: number }
  | { type: 'resize'; width: number; height: number }

function handleDOMEvent(event: DOMEvent): void {
  switch (event.type) {
    case 'click':
      console.log(`Clicked at (${event.x}, ${event.y}) with ${event.button} button`)
      break
    case 'keydown':
      console.log(`Key pressed: ${event.key}`)
      break
    case 'scroll':
      console.log(`Scrolled to (${event.scrollX}, ${event.scrollY})`)
      break
    case 'resize':
      console.log(`Resized to ${event.width}x${event.height}`)
      break
  }
}

// ==================== 复杂可辨识联合 ====================

// 多层嵌套
type TreeNode =
  | { type: 'leaf'; value: number }
  | { type: 'branch'; left: TreeNode; right: TreeNode }

function sumTree(node: TreeNode): number {
  if (node.type === 'leaf') {
    return node.value
  }
  return sumTree(node.left) + sumTree(node.right)
}

// 带泛型的可辨识联合
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E }

function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) {
    return result.value
  }
  throw result.error
}

function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  if (result.ok) {
    return { ok: true, value: fn(result.value) }
  }
  return result
}

// ==================== 工厂函数模式 ====================

// 使用工厂函数创建类型安全的联合类型
function createSuccess<T>(data: T): Success<T> {
  return { state: 'success', data }
}

function createError(message: string): Error {
  return { state: 'error', message }
}

function createLoading(): Loading {
  return { state: 'loading' }
}

// 使用
const state: AsyncState<User> = createSuccess({ id: 1, name: 'John' })
```

## 常见面试题

::: details 1. 如何实现 DeepRequired？
```typescript
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object
    ? DeepRequired<T[P]>
    : T[P];
};
```
:::

::: details 2. 如何获取对象所有值的类型？
```typescript
type ValueOf<T> = T[keyof T];

interface Config {
  name: string;
  count: number;
  enabled: boolean;
}

type ConfigValue = ValueOf<Config>;  // string | number | boolean
```
:::

::: details 3. 如何实现 Flatten 类型？
```typescript
type Flatten<T> = T extends Array<infer U> ? U : T;

type Num = Flatten<number[]>;  // number
type Str = Flatten<string>;    // string
```
:::

::: details 4. 联合类型和交叉类型的区别？
```typescript
// ==================== 联合类型 (Union Types) ====================
// 使用 | 符号，表示"或"的关系
// 一个值可以是多种类型之一

type StringOrNumber = string | number

const a: StringOrNumber = 'hello'  // OK
const b: StringOrNumber = 42       // OK

// 只能访问所有类型共有的成员
function process(value: string | number) {
  // value.toUpperCase()  // Error: number 没有 toUpperCase
  // 需要类型收窄
  if (typeof value === 'string') {
    value.toUpperCase()  // OK
  }
}

// ==================== 交叉类型 (Intersection Types) ====================
// 使用 & 符号，表示"且"的关系
// 一个值必须同时满足所有类型

interface Person {
  name: string
}

interface Employee {
  employeeId: number
}

type Staff = Person & Employee
// Staff 必须同时有 name 和 employeeId

const staff: Staff = {
  name: 'John',
  employeeId: 123
}

// ==================== 主要区别 ====================

// 1. 语义不同
//    - 联合类型：多选一（A 或 B）
//    - 交叉类型：全都要（A 且 B）

// 2. 成员访问
//    - 联合类型：只能访问共有成员
//    - 交叉类型：可以访问所有成员

// 3. 类型冲突
//    - 联合类型：类型保持独立
//    - 交叉类型：冲突属性变为 never

interface A { name: string; age: number }
interface B { name: string; age: string }

type AB = A & B
// { name: string; age: never }  // number & string = never

// 4. 函数重载
//    - 联合类型参数：需要处理所有可能
//    - 交叉类型：函数签名合并为重载

// 5. 分布式行为
//    - 条件类型中联合类型会分布
type ToArray<T> = T extends any ? T[] : never
type Result = ToArray<string | number>  // string[] | number[]
```
:::

::: details 5. 什么是类型守卫？如何实现？
```typescript
// ==================== 类型守卫的作用 ====================
// 类型守卫是运行时检查，用于在特定代码块内收窄类型

// ==================== 实现方式 ====================

// 1. typeof 类型守卫
function process(value: string | number) {
  if (typeof value === 'string') {
    // value 的类型是 string
    return value.toUpperCase()
  }
  // value 的类型是 number
  return value.toFixed(2)
}

// 2. instanceof 类型守卫
class Dog { bark() {} }
class Cat { meow() {} }

function speak(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark()
  } else {
    animal.meow()
  }
}

// 3. in 操作符
interface Fish { swim(): void }
interface Bird { fly(): void }

function move(animal: Fish | Bird) {
  if ('swim' in animal) {
    animal.swim()
  } else {
    animal.fly()
  }
}

// 4. 自定义类型守卫（类型谓词）
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function process(value: unknown) {
  if (isString(value)) {
    // value 的类型是 string
    console.log(value.toUpperCase())
  }
}

// 5. 断言函数
function assertIsNumber(value: unknown): asserts value is number {
  if (typeof value !== 'number') {
    throw new Error('Not a number!')
  }
}

function double(value: unknown): number {
  assertIsNumber(value)
  // 此后 value 的类型是 number
  return value * 2
}

// 6. 可辨识联合
interface Square { kind: 'square'; size: number }
interface Circle { kind: 'circle'; radius: number }
type Shape = Square | Circle

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'square':
      return shape.size ** 2
    case 'circle':
      return Math.PI * shape.radius ** 2
  }
}
```
:::

::: details 6. 如何实现一个 PickByType 类型？
```typescript
// 从对象类型中挑选指定值类型的属性
type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P]
}

interface Example {
  name: string
  age: number
  email: string
  active: boolean
}

type StringProps = PickByType<Example, string>
// { name: string; email: string }

type NumberProps = PickByType<Example, number>
// { age: number }

// 排除指定值类型的属性
type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P]
}

type NonStringProps = OmitByType<Example, string>
// { age: number; active: boolean }
```
:::

::: details 7. 如何实现一个 Mutable 类型（移除 readonly）？
```typescript
// 移除所有属性的 readonly
type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

interface ReadonlyUser {
  readonly id: number
  readonly name: string
}

type User = Mutable<ReadonlyUser>
// { id: number; name: string }

// 深度移除 readonly
type DeepMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object
    ? DeepMutable<T[P]>
    : T[P]
}

interface DeepReadonly {
  readonly user: {
    readonly profile: {
      readonly name: string
    }
  }
}

type MutableDeep = DeepMutable<DeepReadonly>
// 所有嵌套属性的 readonly 都被移除
```
:::

::: details 8. 如何获取函数的参数类型和返回值类型？
```typescript
// ==================== 内置工具类型 ====================

// Parameters<T> - 获取函数参数类型（元组）
type Fn = (a: string, b: number, c: boolean) => void
type Params = Parameters<Fn>  // [string, number, boolean]

// ReturnType<T> - 获取函数返回值类型
type GetUser = (id: number) => { name: string; age: number }
type User = ReturnType<GetUser>  // { name: string; age: number }

// ==================== 手动实现 ====================

// Parameters 实现
type MyParameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never

// ReturnType 实现
type MyReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : never

// ==================== 其他函数相关工具类型 ====================

// 获取构造函数参数
type ConstructorParameters<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: infer P) => any ? P : never

class User {
  constructor(public name: string, public age: number) {}
}

type UserParams = ConstructorParameters<typeof User>
// [string, number]

// 获取构造函数实例类型
type InstanceType<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: any) => infer R ? R : never

type UserInstance = InstanceType<typeof User>
// User

// 获取 this 参数类型
type ThisParameterType<T> = T extends (this: infer U, ...args: any) => any ? U : unknown

function greet(this: { name: string }) {
  console.log(`Hello, ${this.name}`)
}

type ThisType = ThisParameterType<typeof greet>  // { name: string }

// 移除 this 参数
type OmitThisParameter<T> = unknown extends ThisParameterType<T>
  ? T
  : T extends (...args: infer A) => infer R
  ? (...args: A) => R
  : T
```
:::

::: details 9. 如何实现一个 UnionToIntersection 类型？
```typescript
// 将联合类型转换为交叉类型
// 利用逆变位置的特性

type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends
  (k: infer I) => void ? I : never

type Union = { a: string } | { b: number } | { c: boolean }
type Intersection = UnionToIntersection<Union>
// { a: string } & { b: number } & { c: boolean }

// 原理解释：
// 1. (U extends any ? (k: U) => void : never)
//    将 U 分布为函数参数：
//    ((k: { a: string }) => void) | ((k: { b: number }) => void) | ((k: { c: boolean }) => void)
//
// 2. ... extends (k: infer I) => void ? I : never
//    函数参数在逆变位置，推断 I 时会产生交叉类型
//    I = { a: string } & { b: number } & { c: boolean }
```
:::

::: details 10. 如何实现 IsNever 类型？
```typescript
// 判断类型是否为 never
// 注意：直接使用 T extends never 不行，因为 never 在条件类型中会分布为 never

type IsNever<T> = [T] extends [never] ? true : false

type Test1 = IsNever<never>    // true
type Test2 = IsNever<string>   // false
type Test3 = IsNever<unknown>  // false

// 错误的实现（会返回 never）
type WrongIsNever<T> = T extends never ? true : false
type Wrong = WrongIsNever<never>  // never（因为 never 分布为空）

// 为什么用 [T] extends [never]？
// 将 T 包装在元组中，阻止分布式条件类型的行为
```
:::

::: details 11. 如何实现 IsUnion 类型？
```typescript
// 判断类型是否为联合类型
type IsUnion<T, U = T> =
  T extends any
    ? [U] extends [T]
      ? false
      : true
    : never

type Test1 = IsUnion<string>           // false
type Test2 = IsUnion<string | number>  // true
type Test3 = IsUnion<never>            // false

// 原理：
// 当 T = string | number 时：
// 1. T extends any 会分布，分别处理 string 和 number
// 2. U 仍然是完整的 string | number
// 3. 对于 T = string：[string | number] extends [string] = false
//    所以返回 true
// 4. 对于 T = number：[string | number] extends [number] = false
//    所以返回 true
// 5. 最终结果是 true | true = true
//
// 当 T = string 时：
// 1. T extends any 得到 string
// 2. U = string
// 3. [string] extends [string] = true
// 4. 返回 false
```
:::

::: details 12. 如何实现类型安全的 EventEmitter？
```typescript
// 定义事件映射
interface EventMap {
  click: { x: number; y: number }
  change: string
  error: Error
}

// 类型安全的事件发射器
class TypedEventEmitter<T extends Record<string, any>> {
  private listeners = new Map<keyof T, Set<(data: any) => void>>()

  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    this.listeners.get(event)?.delete(listener)
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    this.listeners.get(event)?.forEach(listener => listener(data))
  }
}

// 使用
const emitter = new TypedEventEmitter<EventMap>()

emitter.on('click', ({ x, y }) => {
  console.log(`Clicked at (${x}, ${y})`)
})

emitter.emit('click', { x: 100, y: 200 })  // OK
// emitter.emit('click', 'invalid')  // Error: 类型不匹配
```
:::

::: details 13. 分布式条件类型是什么？如何避免？
```typescript
// ==================== 分布式条件类型 ====================

// 当条件类型的检查类型是裸类型参数时，会对联合类型进行分布

type ToArray<T> = T extends any ? T[] : never

type Result = ToArray<string | number>
// 分布式行为：ToArray<string> | ToArray<number>
// 结果：string[] | number[]

// ==================== 如何避免分布式行为 ====================

// 方法1：用元组包装
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never

type Result1 = ToArrayNonDist<string | number>
// 结果：(string | number)[]

// 方法2：用 { [K in keyof T]: ... } 包装
type WrapInObject<T> = { value: T }
type ToArrayViaObject<T> = WrapInObject<T> extends { value: infer U } ? U[] : never

// ==================== 利用分布式特性 ====================

// 过滤联合类型中的某些成员
type Exclude<T, U> = T extends U ? never : T
type Result2 = Exclude<'a' | 'b' | 'c', 'a'>  // 'b' | 'c'

// 提取联合类型中的某些成员
type Extract<T, U> = T extends U ? T : never
type Result3 = Extract<string | number | boolean, number | string>
// string | number

// 过滤 null 和 undefined
type NonNullable<T> = T extends null | undefined ? never : T
type Result4 = NonNullable<string | null | undefined>  // string
```
:::

::: details 14. infer 关键字的作用和使用场景？
```typescript
// ==================== infer 基础 ====================

// infer 用于在条件类型中声明一个待推断的类型变量
// 只能在 extends 子句中使用

// 提取数组元素类型
type ElementType<T> = T extends (infer E)[] ? E : T
type E1 = ElementType<number[]>  // number

// 提取 Promise 值类型
type PromiseType<T> = T extends Promise<infer V> ? V : T
type P1 = PromiseType<Promise<string>>  // string

// ==================== 函数类型推断 ====================

// 提取参数类型
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never

// 提取返回值类型
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : never

// 提取第一个参数类型
type FirstParameter<T extends (...args: any) => any> =
  T extends (first: infer F, ...rest: any) => any ? F : never

type First = FirstParameter<(a: string, b: number) => void>  // string

// ==================== 元组推断 ====================

// 提取元组第一个元素
type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never

// 提取元组最后一个元素
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never

// 提取除第一个外的剩余元素
type Tail<T extends any[]> = T extends [any, ...infer R] ? R : never

// ==================== 字符串推断 ====================

// 提取字符串开头
type StartsWith<T extends string, U extends string> =
  T extends \`\${U}\${infer Rest}\` ? true : false

type S1 = StartsWith<'hello world', 'hello'>  // true

// 提取路由参数
type ExtractParams<T extends string> =
  T extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? Param | ExtractParams<Rest>
    : T extends \`\${string}:\${infer Param}\`
    ? Param
    : never

type RouteParams = ExtractParams<'/user/:id/post/:postId'>
// 'id' | 'postId'

// ==================== 协变与逆变位置的推断 ====================

// 协变位置（返回值）：推断为联合类型
type UnionFromFunctions<T> =
  T extends { a: () => infer R } | { b: () => infer R }
    ? R
    : never

type U1 = UnionFromFunctions<{ a: () => string } | { b: () => number }>
// string | number

// 逆变位置（参数）：推断为交叉类型
type IntersectionFromFunctions<T> =
  T extends { a: (x: infer R) => void } | { b: (x: infer R) => void }
    ? R
    : never

type I1 = IntersectionFromFunctions<
  { a: (x: { name: string }) => void } |
  { b: (x: { age: number }) => void }
>
// { name: string } & { age: number }
```
:::

::: details 15. 如何实现一个 DeepKeyOf 类型？
```typescript
// 获取嵌套对象的所有路径
type DeepKeyOf<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${Prefix}${K}` | DeepKeyOf<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`
    }[keyof T & string]
  : never

interface User {
  name: string
  profile: {
    age: number
    address: {
      city: string
      country: string
    }
  }
  settings: {
    theme: 'light' | 'dark'
  }
}

type UserKeys = DeepKeyOf<User>
// 'name' | 'profile' | 'profile.age' | 'profile.address' |
// 'profile.address.city' | 'profile.address.country' |
// 'settings' | 'settings.theme'

// 根据路径获取类型
type DeepValue<T, P extends string> =
  P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? DeepValue<T[K], Rest>
      : never
    : P extends keyof T
    ? T[P]
    : never

type CityType = DeepValue<User, 'profile.address.city'>  // string
type ThemeType = DeepValue<User, 'settings.theme'>  // 'light' | 'dark'
```
:::
