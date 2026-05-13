# ES6+ 新特性与高频面试题

## 概述

ES6（ECMAScript 2015）是 JavaScript 语言的重大更新，此后每年都会发布新版本。本章涵盖 ES6-ES2023 的核心特性和面试题。

## 变量声明

### let vs const vs var

```javascript
// var - 函数作用域，存在变量提升
console.log(a) // undefined（变量提升）
var a = 1
var a = 2 // 允许重复声明

// let - 块级作用域，暂时性死区
// console.log(b) // ReferenceError（TDZ）
let b = 1
// let b = 2 // 不允许重复声明

// const - 块级作用域，必须初始化，不能重新赋值
const c = 1
// c = 2 // TypeError
// const d // SyntaxError: Missing initializer

// const 对于对象/数组，可以修改内部属性
const obj = { name: 'Alice' }
obj.name = 'Bob' // 允许
// obj = {} // 不允许

// 冻结对象
const frozen = Object.freeze({ name: 'Alice' })
frozen.name = 'Bob' // 静默失败（严格模式报错）
```

### 暂时性死区（TDZ）

```javascript
// TDZ - 从块作用域开始到变量声明之间的区域
{
  // TDZ 开始
  console.log(typeof x) // ReferenceError
  let x = 1
  // TDZ 结束
}

// 经典面试题
var x = 1
function foo() {
  console.log(x) // ReferenceError，不是 1
  let x = 2
}

// for 循环中的 let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}
// 输出: 0, 1, 2

for (var j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0)
}
// 输出: 3, 3, 3
```

## 解构赋值

### 数组解构

```javascript
// 基本解构
const [a, b, c] = [1, 2, 3]

// 默认值
const [x = 1, y = 2] = [undefined, null]
// x = 1, y = null (null !== undefined)

// 跳过元素
const [, , third] = [1, 2, 3] // third = 3

// 剩余元素
const [first, ...rest] = [1, 2, 3, 4]
// first = 1, rest = [2, 3, 4]

// 嵌套解构
const [a, [b, c]] = [1, [2, 3]]

// 交换变量
let m = 1, n = 2
;[m, n] = [n, m]

// 函数返回值解构
function getCoords() {
  return [10, 20]
}
const [x, y] = getCoords()
```

### 对象解构

```javascript
// 基本解构
const { name, age } = { name: 'Alice', age: 25 }

// 重命名
const { name: userName } = { name: 'Alice' }

// 默认值
const { name = 'Unknown', age = 0 } = { name: 'Alice' }

// 嵌套解构
const { address: { city } } = { address: { city: 'Beijing' } }

// 剩余属性
const { name, ...others } = { name: 'Alice', age: 25, email: 'a@b.com' }
// others = { age: 25, email: 'a@b.com' }

// 函数参数解构
function greet({ name, greeting = 'Hello' }) {
  return `${greeting}, ${name}!`
}

// 复杂解构
const {
  user: { name, profile: { avatar = 'default.png' } }
} = {
  user: { name: 'Alice', profile: {} }
}
```

## 字符串扩展

### 模板字符串

```javascript
// 基本用法
const name = 'Alice'
const greeting = `Hello, ${name}!`

// 多行字符串
const html = `
  <div>
    <h1>${title}</h1>
    <p>${content}</p>
  </div>
`

// 嵌套模板
const items = ['a', 'b', 'c']
const list = `
  <ul>
    ${items.map(item => `<li>${item}</li>`).join('')}
  </ul>
`

// 表达式
const price = 10
const quantity = 5
console.log(`Total: $${price * quantity}`)

// 标签模板
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] ? `<mark>${values[i]}</mark>` : '')
  }, '')
}

const name = 'Alice'
const age = 25
highlight`Name: ${name}, Age: ${age}`
// "Name: <mark>Alice</mark>, Age: <mark>25</mark>"
```

### 新增方法

```javascript
// includes, startsWith, endsWith
const str = 'Hello World'
str.includes('World') // true
str.startsWith('Hello') // true
str.endsWith('World') // true

// repeat
'ab'.repeat(3) // 'ababab'

// padStart, padEnd (ES2017)
'5'.padStart(3, '0') // '005'
'5'.padEnd(3, '0') // '500'

// trim, trimStart, trimEnd (ES2019)
'  hello  '.trim() // 'hello'
'  hello  '.trimStart() // 'hello  '
'  hello  '.trimEnd() // '  hello'

// replaceAll (ES2021)
'aabbcc'.replaceAll('b', 'x') // 'aaxxcc'

// at (ES2022)
'hello'.at(-1) // 'o'
```

## 数组扩展

### 扩展运算符

```javascript
// 展开数组
const arr1 = [1, 2, 3]
const arr2 = [...arr1, 4, 5] // [1, 2, 3, 4, 5]

// 合并数组
const merged = [...arr1, ...arr2]

// 复制数组（浅拷贝）
const copy = [...arr1]

// 字符串转数组
const chars = [...'hello'] // ['h', 'e', 'l', 'l', 'o']

// 类数组转数组
const nodeList = document.querySelectorAll('div')
const divs = [...nodeList]

// 解构中的剩余元素
const [first, ...rest] = [1, 2, 3, 4]
```

### 新增方法

```javascript
// Array.from - 类数组转数组
Array.from('abc') // ['a', 'b', 'c']
Array.from({ length: 3 }, (_, i) => i) // [0, 1, 2]
Array.from(new Set([1, 2, 2, 3])) // [1, 2, 3]

// Array.of - 创建数组
Array.of(1, 2, 3) // [1, 2, 3]
Array.of(3) // [3]  vs Array(3) // [, , ,]

// find, findIndex
const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
users.find(u => u.id === 1) // { id: 1, name: 'Alice' }
users.findIndex(u => u.id === 1) // 0

// findLast, findLastIndex (ES2023)
[1, 2, 3, 2, 1].findLast(x => x === 2) // 2 (index 3)
[1, 2, 3, 2, 1].findLastIndex(x => x === 2) // 3

// includes (ES2016)
[1, 2, 3].includes(2) // true
[1, 2, NaN].includes(NaN) // true (indexOf 不行)

// flat, flatMap (ES2019)
[1, [2, [3]]].flat() // [1, 2, [3]]
[1, [2, [3]]].flat(2) // [1, 2, 3]
[1, [2, [3]]].flat(Infinity) // [1, 2, 3]
[1, 2, 3].flatMap(x => [x, x * 2]) // [1, 2, 2, 4, 3, 6]

// at (ES2022)
const arr = [1, 2, 3, 4, 5]
arr.at(-1) // 5
arr.at(-2) // 4

// toReversed, toSorted, toSpliced (ES2023) - 不改变原数组
const nums = [3, 1, 2]
nums.toReversed() // [2, 1, 3]
nums.toSorted() // [1, 2, 3]
nums.toSpliced(1, 1, 99) // [3, 99, 2]
console.log(nums) // [3, 1, 2] 原数组不变

// with (ES2023) - 不改变原数组的索引更新
const arr = [1, 2, 3]
arr.with(1, 99) // [1, 99, 3]
```

## 对象扩展

### 对象简写和计算属性

```javascript
// 属性简写
const name = 'Alice'
const age = 25
const user = { name, age }

// 方法简写
const obj = {
  sayHi() {
    console.log('Hi')
  },
  // 等同于
  sayHello: function() {
    console.log('Hello')
  }
}

// 计算属性名
const key = 'name'
const obj = {
  [key]: 'Alice',
  ['get' + key.charAt(0).toUpperCase() + key.slice(1)]() {
    return this.name
  }
}
// { name: 'Alice', getName: function }

// Symbol 作为属性名
const sym = Symbol('id')
const obj = {
  [sym]: 123
}
```

### Object 新方法

```javascript
// Object.assign - 浅拷贝/合并
const target = { a: 1 }
const source = { b: 2 }
Object.assign(target, source) // { a: 1, b: 2 }

// 浅拷贝
const copy = Object.assign({}, original)

// Object.keys, values, entries
const obj = { a: 1, b: 2 }
Object.keys(obj) // ['a', 'b']
Object.values(obj) // [1, 2]
Object.entries(obj) // [['a', 1], ['b', 2]]

// Object.fromEntries (ES2019)
const entries = [['a', 1], ['b', 2]]
Object.fromEntries(entries) // { a: 1, b: 2 }
// Map 转对象
Object.fromEntries(new Map([['a', 1]]))

// Object.getOwnPropertyDescriptors (ES2017)
const obj = { name: 'Alice' }
Object.getOwnPropertyDescriptors(obj)
/*
{
  name: {
    value: 'Alice',
    writable: true,
    enumerable: true,
    configurable: true
  }
}
*/

// Object.hasOwn (ES2022) - 推荐替代 hasOwnProperty
const obj = { name: 'Alice' }
Object.hasOwn(obj, 'name') // true
Object.hasOwn(obj, 'age') // false
```

### 扩展运算符（对象）

```javascript
// 浅拷贝
const obj = { a: 1, b: 2 }
const copy = { ...obj }

// 合并对象
const merged = { ...obj1, ...obj2 }

// 覆盖属性
const user = { name: 'Alice', age: 25 }
const updated = { ...user, age: 26 }

// 剩余属性
const { a, ...rest } = { a: 1, b: 2, c: 3 }
// rest = { b: 2, c: 3 }
```

## 函数扩展

### 箭头函数

```javascript
// 基本语法
const add = (a, b) => a + b

// 单参数可省略括号
const square = x => x * x

// 返回对象需要括号
const getUser = () => ({ name: 'Alice' })

// 箭头函数特点
const obj = {
  name: 'Alice',

  // 1. 没有自己的 this，继承外层
  greet: function() {
    setTimeout(() => {
      console.log(this.name) // 'Alice'
    }, 100)
  },

  // 2. 没有 arguments
  showArgs: () => {
    // console.log(arguments) // ReferenceError
  },

  // 3. 不能作为构造函数
  // new (() => {}) // TypeError

  // 4. 没有 prototype
  // (() => {}).prototype // undefined
}
```

### 默认参数

```javascript
// 基本用法
function greet(name = 'World') {
  return `Hello, ${name}!`
}

// 表达式作为默认值
function createUser(name, id = Date.now()) {
  return { name, id }
}

// 解构 + 默认值
function request({ url, method = 'GET', headers = {} } = {}) {
  console.log(url, method, headers)
}

// 默认值会影响 length
function foo(a, b = 1, c) {}
foo.length // 1 (只计算没有默认值的参数)

// 默认值是惰性求值
let x = 1
function foo(a = x++) {}
foo() // x = 2
foo() // x = 3
```

### 剩余参数

```javascript
// 剩余参数
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0)
}

sum(1, 2, 3, 4) // 10

// 与其他参数结合
function log(first, second, ...rest) {
  console.log(first, second, rest)
}

// 必须是最后一个参数
// function foo(...a, b) {} // SyntaxError
```

## 类（Class）

### 基本语法

```javascript
class Person {
  // 私有字段 (ES2022)
  #id

  // 公共字段
  name = ''

  // 静态字段
  static count = 0

  constructor(name, id) {
    this.name = name
    this.#id = id
    Person.count++
  }

  // 实例方法
  greet() {
    return `Hello, ${this.name}`
  }

  // 私有方法 (ES2022)
  #generateId() {
    return Math.random()
  }

  // Getter/Setter
  get id() {
    return this.#id
  }

  set id(value) {
    this.#id = value
  }

  // 静态方法
  static create(name) {
    return new Person(name, Date.now())
  }

  // 静态块 (ES2022)
  static {
    console.log('Class initialized')
  }
}

const p = new Person('Alice', 1)
console.log(p.greet())
console.log(Person.count)
```

### 继承

```javascript
class Animal {
  constructor(name) {
    this.name = name
  }

  speak() {
    console.log(`${this.name} makes a sound`)
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name) // 必须先调用 super
    this.breed = breed
  }

  // 重写父类方法
  speak() {
    console.log(`${this.name} barks`)
  }

  // 调用父类方法
  speakLoud() {
    super.speak()
    console.log('LOUD!')
  }
}

const dog = new Dog('Max', 'Labrador')
dog.speak() // 'Max barks'
dog instanceof Dog // true
dog instanceof Animal // true
```

## Symbol

```javascript
// 创建唯一标识符
const sym1 = Symbol('description')
const sym2 = Symbol('description')
sym1 === sym2 // false

// 作为对象属性键
const id = Symbol('id')
const user = {
  name: 'Alice',
  [id]: 123
}

// Symbol 属性不会被枚举
Object.keys(user) // ['name']
Object.getOwnPropertySymbols(user) // [Symbol(id)]
Reflect.ownKeys(user) // ['name', Symbol(id)]

// 全局 Symbol 注册表
const globalSym = Symbol.for('app.id')
const same = Symbol.for('app.id')
globalSym === same // true
Symbol.keyFor(globalSym) // 'app.id'

// 内置 Symbol
Symbol.iterator // 定义迭代器
Symbol.toStringTag // 定义 Object.prototype.toString 结果
Symbol.hasInstance // 定义 instanceof 行为
Symbol.toPrimitive // 定义类型转换行为

// 实现迭代器
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    let current = this.from
    const last = this.to
    return {
      next() {
        if (current <= last) {
          return { value: current++, done: false }
        }
        return { done: true }
      }
    }
  }
}

for (const num of range) {
  console.log(num) // 1, 2, 3, 4, 5
}
```

## Set 和 Map

### Set

```javascript
// 创建
const set = new Set([1, 2, 3, 2, 1])
console.log(set) // Set(3) { 1, 2, 3 }

// 方法
set.add(4) // 添加
set.delete(1) // 删除
set.has(2) // 检查
set.clear() // 清空
set.size // 大小

// 遍历
for (const value of set) {
  console.log(value)
}

set.forEach(value => console.log(value))

// 转数组
const arr = [...set]
const arr2 = Array.from(set)

// 应用：数组去重
const unique = [...new Set([1, 2, 2, 3, 3, 3])]

// 应用：交集、并集、差集
const a = new Set([1, 2, 3])
const b = new Set([2, 3, 4])

// 并集
const union = new Set([...a, ...b])

// 交集
const intersection = new Set([...a].filter(x => b.has(x)))

// 差集
const difference = new Set([...a].filter(x => !b.has(x)))
```

### WeakSet

```javascript
// 只能存储对象引用
const ws = new WeakSet()

let obj = { name: 'Alice' }
ws.add(obj)
ws.has(obj) // true

obj = null // 对象会被垃圾回收
// WeakSet 中的引用也会自动删除

// 用途：标记对象
const processedObjects = new WeakSet()

function process(obj) {
  if (processedObjects.has(obj)) {
    return // 已处理过
  }
  // 处理对象
  processedObjects.add(obj)
}
```

### Map

```javascript
// 创建
const map = new Map([
  ['name', 'Alice'],
  ['age', 25]
])

// 任何类型都可以作为键
const objKey = { id: 1 }
map.set(objKey, 'value')
map.get(objKey) // 'value'

// 方法
map.set('key', 'value')
map.get('key')
map.has('key')
map.delete('key')
map.clear()
map.size

// 遍历
for (const [key, value] of map) {
  console.log(key, value)
}

map.forEach((value, key) => console.log(key, value))

// 转换
const obj = Object.fromEntries(map)
const arr = [...map]

// Map vs Object
/*
Map:
- 任何类型作为键
- 保持插入顺序
- 有 size 属性
- 更好的迭代性能
- 没有原型污染问题

Object:
- 键只能是字符串或 Symbol
- 有原型链
- JSON 原生支持
- 语法更简洁
*/
```

### WeakMap

```javascript
// 键必须是对象
const wm = new WeakMap()

let obj = { name: 'Alice' }
wm.set(obj, 'metadata')
wm.get(obj) // 'metadata'

obj = null // 键被回收后，值也会被回收

// 用途1：存储私有数据
const privateData = new WeakMap()

class Person {
  constructor(name) {
    privateData.set(this, { name })
  }

  getName() {
    return privateData.get(this).name
  }
}

// 用途2：缓存计算结果
const cache = new WeakMap()

function expensive(obj) {
  if (cache.has(obj)) {
    return cache.get(obj)
  }
  const result = /* 复杂计算 */ obj.value * 2
  cache.set(obj, result)
  return result
}
```

## Promise

### 基本用法

```javascript
// 创建 Promise
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = true
    if (success) {
      resolve('成功')
    } else {
      reject(new Error('失败'))
    }
  }, 1000)
})

// 使用
promise
  .then(result => console.log(result))
  .catch(error => console.error(error))
  .finally(() => console.log('完成'))

// 链式调用
fetch('/api/user')
  .then(res => res.json())
  .then(user => fetch(`/api/posts/${user.id}`))
  .then(res => res.json())
  .then(posts => console.log(posts))
  .catch(error => console.error(error))
```

### 静态方法

```javascript
// Promise.resolve / Promise.reject
Promise.resolve(42).then(console.log) // 42
Promise.reject(new Error('失败')).catch(console.error)

// Promise.all - 所有都成功才成功
Promise.all([
  fetch('/api/users'),
  fetch('/api/posts')
]).then(([users, posts]) => {
  console.log(users, posts)
}).catch(error => {
  console.error('有一个失败了', error)
})

// Promise.race - 第一个完成的结果
Promise.race([
  fetch('/api/data'),
  new Promise((_, reject) => setTimeout(() => reject('timeout'), 5000))
])

// Promise.allSettled (ES2020) - 等待所有完成，无论成功失败
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).then(results => {
  console.log(results)
  // [
  //   { status: 'fulfilled', value: 1 },
  //   { status: 'rejected', reason: 'error' },
  //   { status: 'fulfilled', value: 3 }
  // ]
})

// Promise.any (ES2021) - 第一个成功的结果
Promise.any([
  Promise.reject('error1'),
  Promise.resolve('success'),
  Promise.reject('error2')
]).then(result => {
  console.log(result) // 'success'
}).catch(error => {
  // AggregateError: 所有都失败时
})
```

## async/await

```javascript
// 基本用法
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`)
  const user = await response.json()
  return user
}

// 错误处理
async function fetchData() {
  try {
    const data = await fetch('/api/data')
    return await data.json()
  } catch (error) {
    console.error('请求失败:', error)
    throw error
  }
}

// 并发执行
async function fetchAll() {
  // 串行（慢）
  const user = await fetchUser(1)
  const posts = await fetchPosts(1)

  // 并行（快）
  const [user, posts] = await Promise.all([
    fetchUser(1),
    fetchPosts(1)
  ])
}

// 顶层 await (ES2022)
// 在模块顶层直接使用
const response = await fetch('/api/config')
export const config = await response.json()

// for-await-of (ES2018)
async function* asyncGenerator() {
  yield await Promise.resolve(1)
  yield await Promise.resolve(2)
}

for await (const value of asyncGenerator()) {
  console.log(value)
}
```

## Proxy 和 Reflect

### Proxy

```javascript
const target = { name: 'Alice', age: 25 }

const proxy = new Proxy(target, {
  // 拦截读取
  get(target, prop, receiver) {
    console.log(`读取 ${prop}`)
    return Reflect.get(target, prop, receiver)
  },

  // 拦截设置
  set(target, prop, value, receiver) {
    console.log(`设置 ${prop} = ${value}`)
    return Reflect.set(target, prop, value, receiver)
  },

  // 拦截 in 操作符
  has(target, prop) {
    return prop in target
  },

  // 拦截删除
  deleteProperty(target, prop) {
    return Reflect.deleteProperty(target, prop)
  },

  // 拦截 Object.keys
  ownKeys(target) {
    return Reflect.ownKeys(target)
  }
})

proxy.name // 读取 name -> 'Alice'
proxy.name = 'Bob' // 设置 name = Bob

// Vue 3 响应式原理
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key) // 收集依赖
      const result = Reflect.get(target, key, receiver)
      return typeof result === 'object' ? reactive(result) : result
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver)
      trigger(target, key) // 触发更新
      return result
    }
  })
}
```

### Reflect

```javascript
// Reflect 提供了与 Proxy 处理器方法对应的方法

// 调用函数
Reflect.apply(Math.max, null, [1, 2, 3]) // 3

// 创建实例
Reflect.construct(Date, [2023, 0, 1])

// 定义属性
Reflect.defineProperty(obj, 'name', { value: 'Alice' })

// 删除属性
Reflect.deleteProperty(obj, 'name')

// 获取属性
Reflect.get(obj, 'name')

// 设置属性
Reflect.set(obj, 'name', 'Bob')

// 检查属性
Reflect.has(obj, 'name')

// 获取所有键
Reflect.ownKeys(obj)
```

## 模块化（ES Module）

```javascript
// 导出
export const name = 'Alice'
export function greet() {}
export class Person {}

// 默认导出
export default function main() {}

// 导出时重命名
export { name as userName }

// 导入
import { name, greet } from './module.js'
import Person from './person.js'
import * as utils from './utils.js'

// 导入时重命名
import { name as userName } from './module.js'

// 动态导入 (ES2020)
const module = await import('./module.js')

// 导入断言 (ES2023)
import json from './data.json' with { type: 'json' }

// 重新导出
export { name } from './module.js'
export * from './utils.js'
export { default } from './main.js'
```

## 可选链和空值合并

```javascript
// 可选链 (ES2020)
const user = { profile: { avatar: 'url' } }

// 属性访问
user?.profile?.avatar // 'url'
user?.settings?.theme // undefined (不会报错)

// 方法调用
user.greet?.() // 如果方法存在则调用

// 数组索引
const arr = [1, 2, 3]
arr?.[0] // 1

// 空值合并 (ES2020)
const value = null ?? 'default' // 'default'
const value2 = 0 ?? 'default' // 0 (只有 null/undefined 才使用默认值)
const value3 = '' ?? 'default' // ''

// 对比 ||
const value4 = 0 || 'default' // 'default' (0 是假值)
const value5 = '' || 'default' // 'default' ('' 是假值)

// 组合使用
const theme = user?.settings?.theme ?? 'light'

// 逻辑赋值运算符 (ES2021)
let a = null
a ??= 'default' // a = 'default'

let b = 1
b ||= 2 // b = 1 (因为 b 是真值)

let c = 1
c &&= 2 // c = 2 (因为 c 是真值)
```

## 高频面试题

::: details 1. let、const、var 的区别？
**一句话答案**：var 是函数作用域、存在变量提升；let/const 是块级作用域、有暂时性死区；const 声明的变量不能重新赋值。

**详细解答**：

| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 是（提升且初始化为 undefined） | 否（暂时性死区） | 否（暂时性死区） |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许 |
| 全局对象属性 | 是（挂载到 window） | 否 | 否 |
| 必须初始化 | 否 | 否 | 是 |

```javascript
// 1. 作用域差异
{
  var a = 1
  let b = 2
  const c = 3
}
console.log(a) // 1 (var 无块级作用域)
console.log(b) // ReferenceError (let 有块级作用域)
console.log(c) // ReferenceError (const 有块级作用域)

// 2. 变量提升差异
console.log(x) // undefined (var 提升)
var x = 1

console.log(y) // ReferenceError (暂时性死区)
let y = 2

// 3. 经典闭包问题
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}
// 输出: 3, 3, 3 (只有一个 i)

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0)
}
// 输出: 0, 1, 2 (每次循环都有独立的 j)

// 4. const 特性
const PI = 3.14
PI = 3.14159 // TypeError: Assignment to constant variable

const obj = { name: 'Alice' }
obj.name = 'Bob' // 允许（修改对象属性）
obj = {} // TypeError（不能重新赋值）

// 完全冻结对象
const frozen = Object.freeze({ name: 'Alice' })
frozen.name = 'Bob' // 静默失败（严格模式下报错）
```

**面试口语化回答模板**：

> "这三者的主要区别在于作用域、变量提升和能否重新赋值。var 是函数作用域，存在变量提升，声明的变量会提升到函数顶部并初始化为 undefined；而 let 和 const 都是块级作用域，虽然也会提升，但不会初始化，形成暂时性死区，在声明之前访问会报错。
>
> const 和 let 的区别是 const 声明的变量不能重新赋值，必须在声明时初始化。但需要注意的是，const 只是保证变量指向的内存地址不变，对于对象和数组，可以修改其内部属性。
>
> 在实际开发中，我们推荐优先使用 const，确实需要重新赋值时用 let，避免使用 var。这个在经典的 for 循环闭包问题中体现得很明显：var 声明的变量会被所有回调共享，而 let 每次循环都会创建新的变量。"

---
:::

::: details 2. 箭头函数和普通函数的区别？
**一句话答案**：箭头函数没有自己的 this、arguments、prototype，不能作为构造函数，this 永远指向定义时外层的 this。

**详细解答**：

**5 大核心区别**：

1. **this 指向**：箭头函数没有自己的 this，继承外层作用域的 this，且无法通过 call/apply/bind 改变
2. **arguments 对象**：箭头函数没有 arguments，可以用剩余参数 ...args 代替
3. **构造函数**：箭头函数不能用作构造函数，不能使用 new 调用
4. **prototype 属性**：箭头函数没有 prototype 属性
5. **yield 关键字**：箭头函数不能用作 Generator 函数

```javascript
// 1. this 指向差异
const obj = {
  name: 'Alice',

  // 普通函数：this 指向调用者
  sayHi: function() {
    console.log(this.name) // 'Alice'

    setTimeout(function() {
      console.log(this.name) // undefined (this 指向 window/global)
    }, 100)
  },

  // 箭头函数：this 继承外层
  sayHello: function() {
    console.log(this.name) // 'Alice'

    setTimeout(() => {
      console.log(this.name) // 'Alice' (继承外层的 this)
    }, 100)
  },

  // 对象方法不应该用箭头函数
  greet: () => {
    console.log(this.name) // undefined (this 指向外层，不是 obj)
  }
}

// 2. call/apply/bind 无法改变箭头函数的 this
const normalFunc = function() {
  console.log(this.name)
}
const arrowFunc = () => {
  console.log(this.name)
}

normalFunc.call({ name: 'Bob' }) // 'Bob'
arrowFunc.call({ name: 'Bob' }) // undefined (无法改变)

// 3. arguments 对象
function normalFunc() {
  console.log(arguments) // [1, 2, 3]
}
normalFunc(1, 2, 3)

const arrowFunc = () => {
  console.log(arguments) // ReferenceError
}

// 使用剩余参数代替
const arrowFunc2 = (...args) => {
  console.log(args) // [1, 2, 3]
}
arrowFunc2(1, 2, 3)

// 4. 不能作为构造函数
function Person(name) {
  this.name = name
}
const p1 = new Person('Alice') // 正常

const Person2 = (name) => {
  this.name = name
}
const p2 = new Person2('Bob') // TypeError: Person2 is not a constructor

// 5. 没有 prototype
console.log(Person.prototype) // { constructor: f }
console.log(Person2.prototype) // undefined
```

**适用场景**：

```javascript
// ✅ 适合用箭头函数
// 1. 数组方法回调
const numbers = [1, 2, 3, 4, 5]
const doubled = numbers.map(n => n * 2)

// 2. 异步回调（需要保持 this）
class Button {
  constructor() {
    this.count = 0
  }

  click() {
    setTimeout(() => {
      this.count++ // 正确访问实例的 this
    }, 100)
  }
}

// 3. Promise/async 链式调用
fetchUser()
  .then(user => fetchPosts(user.id))
  .then(posts => posts.filter(p => p.published))

// ❌ 不适合用箭头函数
// 1. 对象方法
const user = {
  name: 'Alice',
  sayHi: () => console.log(this.name) // this 不是 user
}

// 2. 动态 this 的场景
const button = document.querySelector('button')
button.addEventListener('click', () => {
  console.log(this) // window，不是 button
})

// 3. 需要 arguments 的场景
const sum = () => {
  // arguments 不存在
}
```

**面试口语化回答模板**：

> "箭头函数和普通函数最大的区别在于 this 的指向。箭头函数没有自己的 this，它会捕获定义时外层作用域的 this，且这个 this 是固定的，无法通过 call、apply、bind 改变。而普通函数的 this 是动态的，指向调用它的对象。
>
> 除了 this，箭头函数还有几个特点：没有 arguments 对象，可以用剩余参数代替；不能作为构造函数使用 new；没有 prototype 属性；不能用作 Generator 函数。
>
> 在实际应用中，箭头函数特别适合用在需要保持外层 this 的场景，比如数组方法的回调、定时器回调、Promise 链等。但对象方法、事件处理器、需要动态 this 的场景就不适合用箭头函数。比如 Vue 的 methods、React 的类组件方法，如果用箭头函数写成对象属性，this 就会指向错误。"

---
:::

::: details 3. 解构赋值的用法？
**一句话答案**：解构赋值允许从数组或对象中提取值，快速赋值给变量，支持默认值、重命名、嵌套解构和剩余元素。

**详细解答**：

**数组解构**：

```javascript
// 1. 基本用法
const [a, b, c] = [1, 2, 3]
console.log(a, b, c) // 1 2 3

// 2. 跳过元素
const [first, , third] = [1, 2, 3]
console.log(first, third) // 1 3

// 3. 默认值
const [x = 1, y = 2] = [100]
console.log(x, y) // 100 2

const [m = 1, n = 2] = [undefined, null]
console.log(m, n) // 1 null (null 不会触发默认值)

// 4. 剩余元素
const [head, ...tail] = [1, 2, 3, 4, 5]
console.log(head) // 1
console.log(tail) // [2, 3, 4, 5]

// 5. 嵌套解构
const [a, [b, c]] = [1, [2, 3]]
console.log(a, b, c) // 1 2 3

// 6. 交换变量
let x = 1, y = 2
;[x, y] = [y, x]
console.log(x, y) // 2 1

// 7. 函数返回值
function getCoords() {
  return [10, 20]
}
const [x, y] = getCoords()

// 8. 字符串解构
const [a, b, c] = 'abc'
console.log(a, b, c) // 'a' 'b' 'c'
```

**对象解构**：

```javascript
// 1. 基本用法
const { name, age } = { name: 'Alice', age: 25 }
console.log(name, age) // 'Alice' 25

// 2. 重命名（别名）
const { name: userName, age: userAge } = { name: 'Alice', age: 25 }
console.log(userName, userAge) // 'Alice' 25

// 3. 默认值
const { name = 'Unknown', age = 0 } = { name: 'Alice' }
console.log(name, age) // 'Alice' 0

// 4. 重命名 + 默认值
const { name: userName = 'Guest' } = {}
console.log(userName) // 'Guest'

// 5. 嵌套解构
const user = {
  name: 'Alice',
  address: {
    city: 'Beijing',
    zip: '100000'
  }
}
const { address: { city, zip } } = user
console.log(city, zip) // 'Beijing' '100000'

// 注意：address 本身没有被解构出来
console.log(address) // ReferenceError

// 同时解构 address 和 city
const { address, address: { city } } = user

// 6. 剩余属性
const { name, ...rest } = { name: 'Alice', age: 25, email: 'a@b.com' }
console.log(name) // 'Alice'
console.log(rest) // { age: 25, email: 'a@b.com' }

// 7. 动态属性名
const key = 'name'
const { [key]: value } = { name: 'Alice' }
console.log(value) // 'Alice'

// 8. 已声明变量的解构（需要括号）
let x, y
({ x, y } = { x: 1, y: 2 }) // 必须用括号包裹
```

**函数参数解构**：

```javascript
// 1. 基本用法
function greet({ name, age }) {
  console.log(`${name} is ${age} years old`)
}
greet({ name: 'Alice', age: 25 })

// 2. 默认值
function request({ url, method = 'GET', headers = {} }) {
  console.log(url, method, headers)
}
request({ url: '/api' }) // '/api' 'GET' {}

// 3. 参数默认值 + 解构默认值
function ajax({ url, method = 'GET' } = {}) {
  console.log(url, method)
}
ajax() // undefined 'GET' (不会报错)
ajax({ url: '/api' }) // '/api' 'GET'

// 4. 嵌套解构
function displayUser({
  name,
  address: { city, zip }
}) {
  console.log(`${name} lives in ${city}`)
}

displayUser({
  name: 'Alice',
  address: { city: 'Beijing', zip: '100000' }
})

// 5. 剩余参数
function log({ level, message, ...meta }) {
  console.log(`[${level}] ${message}`, meta)
}
log({
  level: 'INFO',
  message: 'User logged in',
  userId: 123,
  timestamp: Date.now()
})

// 6. 数组参数解构
function sum([a, b]) {
  return a + b
}
sum([1, 2]) // 3

// 7. 混合解构
function process([first, ...rest], { debug = false }) {
  console.log(first, rest, debug)
}
process([1, 2, 3], { debug: true })
```

**实际应用场景**：

```javascript
// 1. React Props 解构
function UserCard({ name, avatar, bio }) {
  return <div>{name}</div>
}

// 2. 导入模块
import { useState, useEffect } from 'react'

// 3. API 响应处理
const { data, status, message } = await fetchUser()

// 4. 配置对象
function createServer({
  port = 3000,
  host = 'localhost',
  ssl = false
}) {
  // ...
}

// 5. 循环中使用
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]

for (const { id, name } of users) {
  console.log(id, name)
}

// 6. Map 遍历
const map = new Map([['a', 1], ['b', 2]])
for (const [key, value] of map) {
  console.log(key, value)
}

// 7. 正则匹配
const [, year, month, day] = '2024-01-15'.match(/(\d{4})-(\d{2})-(\d{2})/)
```

**面试口语化回答模板**：

> "解构赋值是 ES6 提供的一种快速从数组或对象中提取值并赋值给变量的语法糖。
>
> 对于数组，可以按顺序解构，支持跳过元素、设置默认值、使用剩余运算符获取剩余元素。一个经典应用是交换变量：[a, b] = [b, a]。
>
> 对于对象，可以提取指定属性，支持重命名、默认值、嵌套解构和剩余属性。特别要注意，对象解构时如果要重命名，语法是 { 原名: 新名 }，这个冒号后面是新变量名，不是值。
>
> 在实际开发中，解构赋值非常常用。比如函数参数解构可以让函数签名更清晰，React 组件经常解构 props，处理 API 响应时解构数据，循环遍历时解构数组或 Map 的键值对。需要注意的是，解构时如果属性不存在会得到 undefined，可以设置默认值来避免。另外，对已声明的变量进行对象解构时，需要用括号包裹整个赋值语句，否则会被当作代码块解析。"

---
:::

::: details 4. 扩展运算符的应用场景？
**一句话答案**：扩展运算符（...）可以展开数组、对象，用于浅拷贝、合并、传参、类数组转换等场景。

**详细解答**：

**数组扩展运算符应用**：

```javascript
// 1. 数组浅拷贝
const arr1 = [1, 2, 3]
const arr2 = [...arr1]
arr2.push(4)
console.log(arr1) // [1, 2, 3]
console.log(arr2) // [1, 2, 3, 4]

// 注意：是浅拷贝
const arr3 = [{ id: 1 }, { id: 2 }]
const arr4 = [...arr3]
arr4[0].id = 99
console.log(arr3[0].id) // 99 (对象被共享)

// 2. 合并数组
const arr1 = [1, 2]
const arr2 = [3, 4]
const merged = [...arr1, ...arr2] // [1, 2, 3, 4]

// 在指定位置插入
const arr = [1, 2, 5, 6]
const inserted = [1, 2, ...arr2, 5, 6] // [1, 2, 3, 4, 5, 6]

// 3. 函数传参（替代 apply）
const numbers = [1, 5, 3, 9, 2]

// ES5
Math.max.apply(null, numbers)

// ES6
Math.max(...numbers) // 9

// 4. 数组转参数
function sum(a, b, c) {
  return a + b + c
}
const nums = [1, 2, 3]
sum(...nums) // 6

// 5. 字符串转字符数组
const chars = [...'hello'] // ['h', 'e', 'l', 'l', 'o']

// 正确处理 Unicode（超过 \uFFFF 的字符）
const str = '𠮷'
str.length // 2 (错误)
[...str].length // 1 (正确)

// 6. 类数组/可迭代对象转数组
// NodeList
const divs = [...document.querySelectorAll('div')]

// arguments
function foo() {
  const args = [...arguments]
  return args.reduce((sum, n) => sum + n, 0)
}

// Set/Map
const set = new Set([1, 2, 3])
const arr = [...set]

const map = new Map([['a', 1], ['b', 2]])
const entries = [...map] // [['a', 1], ['b', 2]]

// 7. 数组去重
const arr = [1, 2, 2, 3, 3, 3]
const unique = [...new Set(arr)] // [1, 2, 3]

// 8. 与解构结合
const [first, ...rest] = [1, 2, 3, 4, 5]
console.log(first) // 1
console.log(rest) // [2, 3, 4, 5]

// 9. 实现数组 push 的不可变操作
const arr = [1, 2, 3]
const newArr = [...arr, 4] // 不改变原数组

// 10. 二维数组浅拷贝
const matrix = [[1, 2], [3, 4]]
const copy = matrix.map(row => [...row])
```

**对象扩展运算符应用**：

```javascript
// 1. 对象浅拷贝
const obj1 = { name: 'Alice', age: 25 }
const obj2 = { ...obj1 }
obj2.age = 26
console.log(obj1.age) // 25

// 2. 合并对象
const obj1 = { a: 1, b: 2 }
const obj2 = { c: 3, d: 4 }
const merged = { ...obj1, ...obj2 } // { a: 1, b: 2, c: 3, d: 4 }

// 后面的属性会覆盖前面的
const obj3 = { a: 1, b: 2 }
const obj4 = { b: 99, c: 3 }
const merged2 = { ...obj3, ...obj4 } // { a: 1, b: 99, c: 3 }

// 3. 修改对象属性（不可变更新）
const user = { name: 'Alice', age: 25, email: 'a@b.com' }
const updated = { ...user, age: 26 } // 只改 age，其他不变

// 4. 添加属性
const user = { name: 'Alice' }
const withId = { id: 1, ...user } // { id: 1, name: 'Alice' }

// 5. 条件属性
const includeAge = true
const user = {
  name: 'Alice',
  ...(includeAge && { age: 25 }) // 条件添加
}

// 6. 剩余属性（解构）
const user = { id: 1, name: 'Alice', age: 25, email: 'a@b.com' }
const { id, ...userInfo } = user
console.log(userInfo) // { name: 'Alice', age: 25, email: 'a@b.com' }

// 7. 移除属性
const user = { id: 1, name: 'Alice', password: '123456' }
const { password, ...publicUser } = user
console.log(publicUser) // { id: 1, name: 'Alice' }

// 8. 默认配置 + 自定义配置
const defaultConfig = {
  port: 3000,
  host: 'localhost',
  debug: false
}

const userConfig = {
  port: 8080,
  debug: true
}

const config = { ...defaultConfig, ...userConfig }
// { port: 8080, host: 'localhost', debug: true }

// 9. 函数参数传递
function updateUser(id, updates) {
  const user = getUser(id)
  return { ...user, ...updates, updatedAt: Date.now() }
}

updateUser(1, { age: 26 })

// 10. React/Redux 中的不可变更新
// Redux reducer
function todosReducer(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, action.payload]

    case 'UPDATE_TODO':
      return state.map(todo =>
        todo.id === action.id
          ? { ...todo, ...action.updates }
          : todo
      )

    default:
      return state
  }
}

// React state 更新
const [user, setUser] = useState({ name: 'Alice', age: 25 })
setUser(prev => ({ ...prev, age: 26 }))
```

**注意事项**：

```javascript
// 1. 只是浅拷贝
const obj = { a: { b: 1 } }
const copy = { ...obj }
copy.a.b = 2
console.log(obj.a.b) // 2 (内层对象共享)

// 深拷贝需要递归或其他方法
const deepCopy = JSON.parse(JSON.stringify(obj)) // 简单场景
// 或使用 structuredClone (现代浏览器)
const deepCopy2 = structuredClone(obj)

// 2. 只拷贝可枚举属性
const obj = Object.create({ inherited: 1 }, {
  own: { value: 2, enumerable: true },
  nonEnum: { value: 3, enumerable: false }
})
const copy = { ...obj }
console.log(copy) // { own: 2 } (不包含继承和不可枚举属性)

// 3. 特殊值处理
const obj = { a: undefined, b: null }
const copy = { ...obj } // { a: undefined, b: null }

// 4. Symbol 键也会被拷贝
const sym = Symbol('key')
const obj = { [sym]: 'value' }
const copy = { ...obj }
console.log(copy[sym]) // 'value'

// 5. 性能考虑
// 大对象频繁拷贝可能影响性能
const largeObj = { /* 很多属性 */ }
// 考虑是否真的需要拷贝，或者用其他方式
```

**面试口语化回答模板**：

> "扩展运算符是 ES6 引入的非常实用的语法，用三个点（...）表示，可以展开数组或对象。
>
> 在数组方面，常用于浅拷贝、合并数组、函数传参、类数组转换。比如以前用 Math.max.apply(null, arr) 来求数组最大值，现在直接 Math.max(...arr) 就行。还可以配合 Set 做数组去重：[...new Set(arr)]。
>
> 在对象方面，主要用于浅拷贝、合并对象、不可变更新。这在 React 和 Redux 中特别常用，比如更新 state 时不直接修改原对象，而是用展开运算符创建新对象。还可以配合解构实现删除属性的效果。
>
> 需要注意的是，扩展运算符做的是浅拷贝，只拷贝第一层，嵌套的对象或数组仍然是引用。如果需要深拷贝，可以用 JSON.parse(JSON.stringify()) 或者现代浏览器的 structuredClone API。另外，它只拷贝对象自身的可枚举属性，不包括原型链上的属性。"

---
:::

::: details 5. for...in 和 for...of 的区别？
**一句话答案**：for...in 遍历对象的可枚举属性（键名），for...of 遍历可迭代对象的值，推荐数组用 for...of，对象用 Object.keys/entries。

**详细解答**：

**核心区别对比**：

| 特性 | for...in | for...of |
|------|----------|----------|
| 遍历内容 | 键名（key） | 值（value） |
| 适用对象 | 所有对象 | 可迭代对象（Array, String, Map, Set, arguments 等） |
| 遍历顺序 | 不保证顺序 | 保证顺序（按迭代器定义） |
| 原型链 | 会遍历继承的可枚举属性 | 不涉及 |
| 数组索引 | 字符串类型 | 不涉及（直接是值） |
| 能否遍历对象 | 能 | 不能（除非实现迭代器） |
| break/continue | 支持 | 支持 |

**for...in 详解**：

```javascript
// 1. 遍历对象属性
const obj = { a: 1, b: 2, c: 3 }
for (const key in obj) {
  console.log(key, obj[key])
}
// 'a' 1
// 'b' 2
// 'c' 3

// 2. 遍历数组（不推荐！）
const arr = ['a', 'b', 'c']
for (const index in arr) {
  console.log(index, typeof index, arr[index])
}
// '0' 'string' 'a'
// '1' 'string' 'b'
// '2' 'string' 'c'

// ❌ 问题：索引是字符串，且会遍历数组的额外属性
arr.foo = 'bar'
for (const key in arr) {
  console.log(key) // '0', '1', '2', 'foo' (包括 foo!)
}

// 3. 遍历原型链属性
const parent = { inherited: 'value' }
const child = Object.create(parent)
child.own = 'own value'

for (const key in child) {
  console.log(key) // 'own', 'inherited' (包括继承的属性!)
}

// 过滤掉继承属性
for (const key in child) {
  if (child.hasOwnProperty(key)) {
    console.log(key) // 只有 'own'
  }
}

// 推荐：使用 Object.hasOwn (ES2022)
for (const key in child) {
  if (Object.hasOwn(child, key)) {
    console.log(key)
  }
}

// 4. 不遍历不可枚举属性
const obj = Object.defineProperties({}, {
  a: { value: 1, enumerable: true },
  b: { value: 2, enumerable: false }
})

for (const key in obj) {
  console.log(key) // 只有 'a'
}

// 5. 不遍历 Symbol 属性
const sym = Symbol('key')
const obj = { a: 1, [sym]: 2 }

for (const key in obj) {
  console.log(key) // 只有 'a'
}
```

**for...of 详解**：

```javascript
// 1. 遍历数组（推荐）
const arr = ['a', 'b', 'c']
for (const value of arr) {
  console.log(value) // 'a', 'b', 'c'
}

// 需要索引时
for (const [index, value] of arr.entries()) {
  console.log(index, value)
}

// 2. 遍历字符串
const str = 'hello'
for (const char of str) {
  console.log(char) // 'h', 'e', 'l', 'l', 'o'
}

// 正确处理 Unicode
const emoji = '😀😃😄'
for (const char of emoji) {
  console.log(char) // 正确输出每个 emoji
}

// 3. 遍历 Set
const set = new Set([1, 2, 3])
for (const value of set) {
  console.log(value) // 1, 2, 3
}

// 4. 遍历 Map
const map = new Map([
  ['a', 1],
  ['b', 2]
])

// 遍历键值对
for (const [key, value] of map) {
  console.log(key, value)
}

// 只遍历键
for (const key of map.keys()) {
  console.log(key)
}

// 只遍历值
for (const value of map.values()) {
  console.log(value)
}

// 5. 遍历 arguments
function foo() {
  for (const arg of arguments) {
    console.log(arg)
  }
}
foo(1, 2, 3) // 1, 2, 3

// 6. 遍历 NodeList
const divs = document.querySelectorAll('div')
for (const div of divs) {
  console.log(div)
}

// 7. ❌ 不能直接遍历普通对象
const obj = { a: 1, b: 2 }
// for (const value of obj) {} // TypeError: obj is not iterable

// 解决方案
// 方案1：遍历键
for (const key of Object.keys(obj)) {
  console.log(key, obj[key])
}

// 方案2：遍历值
for (const value of Object.values(obj)) {
  console.log(value)
}

// 方案3：遍历键值对
for (const [key, value] of Object.entries(obj)) {
  console.log(key, value)
}

// 方案4：实现迭代器
const obj = {
  a: 1,
  b: 2,
  c: 3,
  [Symbol.iterator]() {
    const keys = Object.keys(this)
    let index = 0
    return {
      next: () => {
        if (index < keys.length) {
          const key = keys[index++]
          return { value: [key, this[key]], done: false }
        }
        return { done: true }
      }
    }
  }
}

for (const [key, value] of obj) {
  console.log(key, value) // 现在可以遍历了
}

// 8. break/continue
const arr = [1, 2, 3, 4, 5]
for (const num of arr) {
  if (num === 3) continue
  if (num === 4) break
  console.log(num) // 1, 2
}
```

**实际应用场景**：

```javascript
// ✅ for...of 适用场景

// 1. 遍历数组
const users = [{ name: 'Alice' }, { name: 'Bob' }]
for (const user of users) {
  console.log(user.name)
}

// 2. 异步迭代
async function processFiles(files) {
  for (const file of files) {
    await processFile(file) // 串行处理
  }
}

// 3. 遍历生成器
function* fibonacci() {
  let [a, b] = [0, 1]
  while (true) {
    yield a
    ;[a, b] = [b, a + b]
  }
}

for (const num of fibonacci()) {
  if (num > 100) break
  console.log(num)
}

// ✅ for...in 适用场景（少用）

// 1. 检查对象属性
const obj = { a: 1, b: 2, c: 3 }
for (const key in obj) {
  if (Object.hasOwn(obj, key)) {
    console.log(key)
  }
}

// 2. 动态属性处理
const fields = { name: '', age: 0, email: '' }
for (const field in fields) {
  if (!formData[field]) {
    errors[field] = `${field} is required`
  }
}

// ❌ 避免的写法

// 不要用 for...in 遍历数组
const arr = [1, 2, 3]
for (const i in arr) { // ❌
  console.log(arr[i])
}

// 应该用 for...of
for (const item of arr) { // ✅
  console.log(item)
}

// 不要忘记 hasOwnProperty 检查
for (const key in obj) {
  console.log(obj[key]) // ❌ 可能包括原型链属性
}

for (const key in obj) {
  if (Object.hasOwn(obj, key)) { // ✅
    console.log(obj[key])
  }
}
```

**其他遍历方法对比**：

```javascript
const arr = [1, 2, 3, 4, 5]

// 1. forEach - 无法 break/continue
arr.forEach(item => {
  console.log(item)
  // break // ❌ SyntaxError
})

// 2. for 循环 - 最灵活
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i])
  if (arr[i] === 3) break // ✅
}

// 3. for...of - 简洁，可 break
for (const item of arr) {
  console.log(item)
  if (item === 3) break // ✅
}

// 4. map/filter/reduce - 函数式，无法 break
const doubled = arr.map(x => x * 2)
const evens = arr.filter(x => x % 2 === 0)
const sum = arr.reduce((acc, x) => acc + x, 0)
```

**面试口语化回答模板**：

> "for...in 和 for...of 是两种完全不同的遍历方式，很容易混淆。
>
> for...in 遍历的是对象的可枚举属性名（键），主要用于对象。对于数组，它遍历的是索引（而且是字符串类型），还会遍历到数组的其他属性甚至原型链上的属性，所以非常不推荐用 for...in 遍历数组。如果要用 for...in，记得要用 hasOwnProperty 或 Object.hasOwn 过滤掉继承的属性。
>
> for...of 是 ES6 新增的，遍历的是可迭代对象的值。它专为遍历数组、字符串、Set、Map、NodeList 等可迭代对象设计，不能直接遍历普通对象，因为普通对象默认不可迭代。如果要遍历对象，可以用 Object.keys、Object.values 或 Object.entries 配合 for...of。
>
> 实际开发中，遍历数组应该用 for...of 或数组方法（forEach、map、filter），遍历对象用 Object.keys/entries 配合 for...of，尽量避免使用 for...in。for...of 和 for 循环的优势是支持 break 和 continue，而 forEach 不支持。"

---
:::

::: details 6. Map 和 Object 的区别？Set 和数组的区别?
**一句话答案**：Map 的键可以是任意类型、保持插入顺序、有 size 属性，更适合键值对集合；Set 存储唯一值、自动去重，常用于去重和判断存在性。

**详细解答**：

**Map vs Object**：

| 特性 | Map | Object |
|------|-----|--------|
| 键的类型 | 任意类型（对象、函数、基本类型） | 字符串或 Symbol |
| 键的顺序 | 保持插入顺序 | 有序但复杂（整数键 → 字符串键 → Symbol 键） |
| 大小获取 | map.size | Object.keys(obj).length |
| 性能 | 频繁增删性能更好 | 少量固定属性时更快 |
| 原型链 | 干净，没有默认键 | 有原型链（可能有 toString 等默认属性） |
| 迭代 | 原生可迭代（for...of） | 需要 Object.keys/entries |
| JSON 支持 | 不支持（需要转换） | 原生支持 JSON.stringify/parse |
| 语法 | map.set/get/has/delete | obj.key 或 obj[key] |
| 使用场景 | 大量增删、任意类型键、需要迭代 | 固定结构、JSON 交互、简单配置 |

```javascript
// Map 的优势
// 1. 任意类型作为键
const map = new Map()

// 对象作为键
const objKey = { id: 1 }
map.set(objKey, 'value1')
console.log(map.get(objKey)) // 'value1'

// 函数作为键
const funcKey = () => {}
map.set(funcKey, 'value2')

// 原始类型作为键
map.set(1, 'number key')
map.set('1', 'string key')
console.log(map.get(1)) // 'number key'
console.log(map.get('1')) // 'string key' (严格区分)

// Object 的限制
const obj = {}
const objKey = { id: 1 }
obj[objKey] = 'value' // 键会被转为字符串 "[object Object]"
console.log(Object.keys(obj)) // ["[object Object]"]

// 2. 保持插入顺序
const map = new Map()
map.set('z', 1)
map.set('a', 2)
map.set('m', 3)

for (const [key, value] of map) {
  console.log(key) // 'z', 'a', 'm' (保持插入顺序)
}

// Object 的顺序规则
const obj = {}
obj['2'] = 'two'
obj['a'] = 'a'
obj['1'] = 'one'
obj[Symbol('sym')] = 'symbol'

console.log(Object.keys(obj)) // ['1', '2', 'a'] (整数键排序，其他保持插入顺序)

// 3. 大小获取
const map = new Map([['a', 1], ['b', 2]])
console.log(map.size) // 2 (O(1) 时间复杂度)

const obj = { a: 1, b: 2 }
console.log(Object.keys(obj).length) // 2 (O(n) 时间复杂度)

// 4. 原型污染问题
const obj = {}
console.log(obj['toString']) // [Function: toString] (继承自原型)
console.log('toString' in obj) // true

// 防御性编程
if (obj.hasOwnProperty('toString')) {
  // 实际业务逻辑
}

// Map 没有这个问题
const map = new Map()
console.log(map.get('toString')) // undefined

// 5. 迭代便利性
const map = new Map([['a', 1], ['b', 2], ['c', 3]])

// 直接迭代
for (const [key, value] of map) {
  console.log(key, value)
}

// 迭代键
for (const key of map.keys()) {
  console.log(key)
}

// 迭代值
for (const value of map.values()) {
  console.log(value)
}

// Object 需要转换
const obj = { a: 1, b: 2, c: 3 }
for (const [key, value] of Object.entries(obj)) {
  console.log(key, value)
}

// 6. 频繁增删的性能
// Map - 优化了增删性能
const map = new Map()
for (let i = 0; i < 1000000; i++) {
  map.set(i, i)
}
for (let i = 0; i < 1000000; i++) {
  map.delete(i)
}

// Object - 频繁增删可能触发引擎优化/反优化
const obj = {}
for (let i = 0; i < 1000000; i++) {
  obj[i] = i
}
for (let i = 0; i < 1000000; i++) {
  delete obj[i]
}

// 7. JSON 支持
const obj = { a: 1, b: 2 }
const json = JSON.stringify(obj) // '{"a":1,"b":2}'
const parsed = JSON.parse(json)

const map = new Map([['a', 1], ['b', 2]])
// JSON.stringify(map) // '{}' (不支持)

// 转换方案
const mapToJSON = JSON.stringify([...map]) // '[["a",1],["b",2]]'
const jsonToMap = new Map(JSON.parse(mapToJSON))

// 或使用 Object.fromEntries/Object.entries
const mapToObj = Object.fromEntries(map)
const objToMap = new Map(Object.entries(obj))
```

**Map 的使用场景**：

```javascript
// 1. 缓存（对象作为键）
const cache = new Map()

function getUser(userObj) {
  if (cache.has(userObj)) {
    return cache.get(userObj)
  }
  const data = fetchUserData(userObj)
  cache.set(userObj, data)
  return data
}

// 2. 存储元数据
const metadata = new Map()
metadata.set(document.querySelector('#btn'), { clicks: 0, lastClicked: null })

// 3. 统计频率
function countChars(str) {
  const count = new Map()
  for (const char of str) {
    count.set(char, (count.get(char) || 0) + 1)
  }
  return count
}

countChars('hello') // Map { 'h' => 1, 'e' => 1, 'l' => 2, 'o' => 1 }

// 4. LRU 缓存
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.cache = new Map()
  }

  get(key) {
    if (!this.cache.has(key)) return -1
    const value = this.cache.get(key)
    this.cache.delete(key) // 删除
    this.cache.set(key, value) // 重新插入到末尾
    return value
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    this.cache.set(key, value)
    if (this.cache.size > this.capacity) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
  }
}
```

**Set vs 数组**：

| 特性 | Set | 数组 |
|------|-----|------|
| 元素唯一性 | 自动去重 | 可重复 |
| 判断存在 | set.has(value) O(1) | arr.includes(value) O(n) |
| 添加元素 | set.add(value) | arr.push(value) |
| 删除元素 | set.delete(value) O(1) | arr.splice(index, 1) O(n) |
| 有序性 | 保持插入顺序 | 保持插入顺序 |
| 索引访问 | 不支持 | arr[index] |
| 长度 | set.size | arr.length |
| 迭代 | for...of | for...of / forEach / for |
| 数组方法 | 无 map/filter/reduce | 有丰富的数组方法 |

```javascript
// Set 的优势
// 1. 自动去重
const arr = [1, 2, 2, 3, 3, 3]
const set = new Set(arr)
console.log([...set]) // [1, 2, 3]

// 快速去重
const unique = [...new Set(arr)]

// 2. 快速判断存在性
const arr = [1, 2, 3, 4, 5]
arr.includes(3) // O(n)

const set = new Set([1, 2, 3, 4, 5])
set.has(3) // O(1)

// 大数据量时性能差异明显
const largeArr = Array.from({ length: 100000 }, (_, i) => i)
const largeSet = new Set(largeArr)

console.time('array')
largeArr.includes(99999) // 慢
console.timeEnd('array')

console.time('set')
largeSet.has(99999) // 快
console.timeEnd('set')

// 3. 快速删除
const arr = [1, 2, 3, 4, 5]
const index = arr.indexOf(3)
arr.splice(index, 1) // O(n)

const set = new Set([1, 2, 3, 4, 5])
set.delete(3) // O(1)

// 4. 集合运算
const a = new Set([1, 2, 3])
const b = new Set([2, 3, 4])

// 并集
const union = new Set([...a, ...b]) // {1, 2, 3, 4}

// 交集
const intersection = new Set([...a].filter(x => b.has(x))) // {2, 3}

// 差集
const difference = new Set([...a].filter(x => !b.has(x))) // {1}

// 对称差集
const symmetricDiff = new Set(
  [...a].filter(x => !b.has(x)).concat([...b].filter(x => !a.has(x)))
) // {1, 4}

// 5. 去除重复对象（基于内容）
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 1, name: 'Alice' }
]

// Set 无法去重对象（引用不同）
const set = new Set(users)
console.log(set.size) // 3 (无法去重)

// 需要使用 Map
const uniqueUsers = [...new Map(users.map(u => [u.id, u])).values()]
// [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]

// 数组的优势
// 1. 索引访问
const arr = [1, 2, 3, 4, 5]
arr[2] // 3

const set = new Set([1, 2, 3, 4, 5])
// set[2] // undefined (不支持索引)

// Set 转数组后访问
[...set][2] // 3

// 2. 数组方法
const arr = [1, 2, 3, 4, 5]
arr.map(x => x * 2) // [2, 4, 6, 8, 10]
arr.filter(x => x > 2) // [3, 4, 5]
arr.reduce((sum, x) => sum + x, 0) // 15

// Set 需要转数组
const set = new Set([1, 2, 3, 4, 5])
[...set].map(x => x * 2)
[...set].filter(x => x > 2)
[...set].reduce((sum, x) => sum + x, 0)

// 3. 需要重复元素
const scores = [85, 90, 85, 92, 90]
// Set 会丢失重复信息
```

**Set 的使用场景**：

```javascript
// 1. 数组去重
const arr = [1, 2, 2, 3, 3, 3]
const unique = [...new Set(arr)]

// 2. 字符串去重
const str = 'hello'
const uniqueChars = [...new Set(str)].join('') // 'helo'

// 3. 判断是否有重复
function hasDuplicates(arr) {
  return new Set(arr).size !== arr.length
}

hasDuplicates([1, 2, 3]) // false
hasDuplicates([1, 2, 2]) // true

// 4. 标记已访问节点（图遍历）
function bfs(graph, start) {
  const visited = new Set()
  const queue = [start]

  while (queue.length) {
    const node = queue.shift()
    if (visited.has(node)) continue

    visited.add(node)
    queue.push(...graph[node])
  }

  return visited
}

// 5. 权限管理
const userPermissions = new Set(['read', 'write'])
const requiredPermissions = new Set(['read', 'delete'])

function hasPermission(user, required) {
  return [...required].every(p => user.has(p))
}

hasPermission(userPermissions, new Set(['read'])) // true
hasPermission(userPermissions, requiredPermissions) // false
```

**WeakMap 和 WeakSet**：

```javascript
// WeakMap - 键必须是对象，弱引用，不可枚举
const wm = new WeakMap()

let obj = { name: 'Alice' }
wm.set(obj, 'metadata')

obj = null // 对象被回收，WeakMap 中的条目也会被删除

// 用途1：私有数据
const privateData = new WeakMap()

class Person {
  constructor(name) {
    privateData.set(this, { name })
  }

  getName() {
    return privateData.get(this).name
  }
}

// 用途2：DOM 节点关联数据
const elementData = new WeakMap()

function setData(element, data) {
  elementData.set(element, data)
}

// 元素被删除时，关联数据自动回收

// WeakSet - 只能存对象，弱引用，不可枚举
const ws = new WeakSet()

let obj1 = { id: 1 }
ws.add(obj1)
ws.has(obj1) // true

obj1 = null // 对象被回收

// 用途：标记对象
const processedNodes = new WeakSet()

function process(node) {
  if (processedNodes.has(node)) return

  // 处理节点
  processedNodes.add(node)
}
```

**面试口语化回答模板**：

> "Map 和 Object 的主要区别在于：Map 的键可以是任意类型，而 Object 的键只能是字符串或 Symbol；Map 保持严格的插入顺序，而 Object 的顺序规则比较复杂；Map 有 size 属性可以快速获取大小，Object 需要 Object.keys().length；Map 对频繁增删的性能更好，没有原型链污染问题。
>
> 什么时候用 Map？当你需要任意类型做键、需要频繁增删、需要迭代、或者担心原型污染时用 Map。什么时候用 Object？当你需要 JSON 序列化、属性相对固定、或者只是简单的配置对象时用 Object。
>
> Set 和数组的区别是：Set 自动去重，元素唯一；Set 的 has 方法判断存在性是 O(1)，数组的 includes 是 O(n)；Set 的 delete 是 O(1)，数组删除需要 splice，是 O(n)。但是 Set 不支持索引访问，也没有数组的 map、filter、reduce 等方法，需要转成数组才能用。
>
> Set 常用于数组去重、快速判断元素存在、集合运算（并集、交集、差集），以及需要频繁增删和查找的场景。如果需要保留重复元素、需要索引访问、或者需要用数组方法处理数据，那还是用数组更合适。
>
> 还有 WeakMap 和 WeakSet，它们的键是弱引用，不会阻止垃圾回收，而且不可枚举。WeakMap 常用于存储对象的私有数据或元数据，WeakSet 用于标记对象，当对象被回收时自动清理，不会造成内存泄漏。"

---
:::

::: details 7. 解释 Promise 的三种状态
**一句话答案**：Promise 有 pending（进行中）、fulfilled（已成功）、rejected（已失败）三种状态，状态一旦改变就不可逆。

**详细解答**：

**三种状态**：
- **pending**：初始状态，等待中，既没有成功也没有失败
- **fulfilled**：操作成功完成，有一个结果值（value）
- **rejected**：操作失败，有一个失败原因（reason）

```javascript
const promise = new Promise((resolve, reject) => {
  // pending 状态
  if (success) {
    resolve(value) // -> fulfilled
  } else {
    reject(error) // -> rejected
  }
})
```

**特点**：
- 状态只能从 pending 变为 fulfilled 或 rejected
- 状态一旦改变就不能再变（不可逆）
- 状态改变后会触发 then/catch 回调

**面试口语化回答模板**：

> "Promise 有三种状态：pending 是初始状态，表示异步操作还在进行中；fulfilled 表示操作成功完成，会有一个结果值；rejected 表示操作失败，会有一个失败原因。
>
> Promise 的状态特点是一旦从 pending 变为 fulfilled 或 rejected，就不能再改变了，这个叫做状态凝固。状态改变后会触发对应的 then 或 catch 回调，而且即使在状态改变之后再添加回调，也能拿到结果，这就是 Promise 相比回调函数的优势之一。"

---
:::

::: details 8. async/await 的原理？
**一句话答案**：async/await 是 Generator + Promise 的语法糖，async 函数返回 Promise，await 暂停执行等待 Promise 结果。

**详细解答**：

async/await 是 Generator + Promise 的语法糖。

```javascript
// async/await
async function fetchData() {
  const response = await fetch('/api')
  const data = await response.json()
  return data
}

// 等价的 Generator 实现
function* fetchDataGen() {
  const response = yield fetch('/api')
  const data = yield response.json()
  return data
}

// 执行器
function run(generator) {
  const gen = generator()

  function next(value) {
    const result = gen.next(value)
    if (result.done) return Promise.resolve(result.value)
    return Promise.resolve(result.value).then(next)
  }

  return next()
}
```

**面试口语化回答模板**：

> "async/await 本质上是 Generator 函数和 Promise 的语法糖。async 函数会返回一个 Promise，函数内部 return 的值会成为这个 Promise 的结果。await 关键字会暂停 async 函数的执行，等待 Promise 完成后继续执行，并返回 Promise 的结果。
>
> 它的原理类似于用 Generator 函数配合一个自动执行器。Generator 的 yield 对应 await，执行器会自动调用 next 方法，等待 Promise 完成后再继续。相比手写 Promise 链，async/await 让异步代码看起来像同步代码，更直观易读，也更方便错误处理，用 try-catch 就能捕获异步错误。"

---
:::

::: details 9. ES6 模块与 CommonJS 的区别？
**一句话答案**：ES Module 是编译时加载、值引用、静态分析，CommonJS 是运行时加载、值拷贝、动态引入。

**详细解答**：

| 特性 | ES Module | CommonJS |
|------|-----------|----------|
| 语法 | import/export | require/module.exports |
| 加载时机 | 编译时 | 运行时 |
| 值类型 | 引用（动态绑定） | 拷贝 |
| 顶层 this | undefined | module |
| 循环依赖 | 支持 | 可能出问题 |
| 异步加载 | 支持 | 不支持 |

```javascript
// ES Module - 值是引用
// a.js
export let count = 0
export function increment() { count++ }

// b.js
import { count, increment } from './a.js'
console.log(count) // 0
increment()
console.log(count) // 1

// CommonJS - 值是拷贝
// a.js
let count = 0
module.exports = { count, increment() { count++ } }

// b.js
const { count, increment } = require('./a.js')
console.log(count) // 0
increment()
console.log(count) // 0 (还是0，因为是拷贝)
```

**面试口语化回答模板**：

> "ES Module 和 CommonJS 最核心的区别在于加载时机和值的传递方式。ES Module 是编译时加载，在代码执行前就确定模块依赖关系，输出的是值的引用，模块内部值变化会反映到外部。而 CommonJS 是运行时加载，require 时才执行模块代码，输出的是值的拷贝，模块内部变化不会影响已经导出的值。
>
> 这也导致了其他区别：ES Module 支持静态分析，可以做 tree-shaking；支持异步加载；import 必须在顶层。CommonJS 支持动态 require，可以条件加载，更灵活但无法 tree-shaking。实际开发中，前端项目用 ES Module，Node.js 传统项目用 CommonJS，现代 Node.js 也开始支持 ES Module。"

---
:::

::: details 10. Proxy 可以拦截哪些操作？
**一句话答案**：Proxy 可以拦截 13 种操作，包括读取、设置、删除属性、函数调用、new 操作等，是实现 Vue 3 响应式的核心。

**详细解答**：

```javascript
const handler = {
  get(target, prop, receiver) {},      // 读取属性
  set(target, prop, value, receiver) {}, // 设置属性
  has(target, prop) {},                // in 操作符
  deleteProperty(target, prop) {},     // delete 操作
  ownKeys(target) {},                  // Object.keys 等
  getOwnPropertyDescriptor(target, prop) {},
  defineProperty(target, prop, desc) {},
  getPrototypeOf(target) {},
  setPrototypeOf(target, proto) {},
  isExtensible(target) {},
  preventExtensions(target) {},
  apply(target, thisArg, args) {},     // 函数调用
  construct(target, args, newTarget) {} // new 操作
}
```

**面试口语化回答模板**：

> "Proxy 可以拦截 13 种对象的底层操作。最常用的是 get 拦截属性读取、set 拦截属性设置，这两个是实现响应式的基础。还有 has 拦截 in 操作符、deleteProperty 拦截 delete、ownKeys 拦截 Object.keys。对于函数，apply 拦截函数调用、construct 拦截 new 操作。
>
> Proxy 相比 Object.defineProperty 的优势是：能监听数组索引和 length 变化，能监听属性的删除，能拦截更多操作，而且是代理整个对象而不是单个属性。Vue 3 就是用 Proxy 替代了 Vue 2 的 Object.defineProperty 来实现响应式，性能更好也更完善。"

---
:::

::: details 11. 什么是迭代器和生成器？
**一句话答案**：迭代器是实现了 next() 方法的对象，生成器是用 function* 声明的特殊函数，可以暂停和恢复执行。

**详细解答**：

**迭代器**：实现 next() 方法的对象

```javascript
const iterator = {
  index: 0,
  next() {
    if (this.index < 3) {
      return { value: this.index++, done: false }
    }
    return { done: true }
  }
}
```

**生成器**：使用 function* 声明，可以暂停和恢复

```javascript
function* generator() {
  yield 1
  yield 2
  yield 3
}

const gen = generator()
gen.next() // { value: 1, done: false }
gen.next() // { value: 2, done: false }
gen.next() // { value: 3, done: false }
gen.next() // { done: true }
```

**可迭代对象**：实现 Symbol.iterator 方法

```javascript
const iterable = {
  [Symbol.iterator]() {
    let i = 0
    return {
      next() {
        return i < 3 ? { value: i++, done: false } : { done: true }
      }
    }
  }
}

for (const value of iterable) {
  console.log(value) // 0, 1, 2
}
```

**面试口语化回答模板**：

> "迭代器是一个实现了 next 方法的对象，每次调用 next 返回 { value, done } 格式的结果，done 为 true 时表示迭代结束。
>
> 生成器是 ES6 提供的一种特殊函数，用 function* 声明，内部可以用 yield 暂停执行。调用生成器函数不会立即执行，而是返回一个迭代器对象，每次调用 next 才执行到下一个 yield。生成器简化了迭代器的实现，也是 async/await 的底层原理。
>
> 可迭代对象是实现了 Symbol.iterator 方法的对象，数组、字符串、Set、Map 都是可迭代对象，可以用 for...of 遍历。我们也可以给自定义对象实现 Symbol.iterator，让它变成可迭代对象。"

---
:::

## ES6+ 特性速查表

::: details 按版本分类
| 版本 | 年份 | 核心特性 |
|------|------|----------|
| ES6 | 2015 | let/const、箭头函数、解构、模板字符串、Promise、Class、Module、Symbol、Set/Map |
| ES7 | 2016 | includes()、指数运算符 ** |
| ES8 | 2017 | async/await、Object.values/entries、padStart/padEnd |
| ES9 | 2018 | Rest/Spread 属性、for await...of、Promise.finally |
| ES10 | 2019 | flat/flatMap、Object.fromEntries、trimStart/trimEnd、可选 catch |
| ES11 | 2020 | 可选链 ?.、空值合并 ??、BigInt、Promise.allSettled、globalThis |
| ES12 | 2021 | ||= &&= ??=、String.replaceAll、Promise.any、WeakRef |
| ES13 | 2022 | at()、Object.hasOwn、类静态块、顶层 await、正则 /d |
| ES14 | 2023 | findLast/findLastIndex、Hashbang、WeakMap Symbol 键 |
:::

::: details 高频面试考点
```
┌─────────────────────────────────────────────────────────┐
│                    ES6+ 高频考点                        │
├─────────────────────────────────────────────────────────┤
│  let/const/var 区别 ✓   箭头函数 this ✓   解构赋值 ✓   │
│  Promise 原理 ✓✓        async/await ✓✓    Class 语法 ✓ │
│  ES Module vs CJS ✓✓    Proxy/Reflect ✓✓  Symbol ✓     │
│  Set/Map/WeakMap ✓      可选链/空值合并 ✓  扩展运算符 ✓ │
└─────────────────────────────────────────────────────────┘
✓ 常考  ✓✓ 高频重点
```
:::
