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

