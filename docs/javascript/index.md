# JavaScript 核心知识

## 概述

JavaScript 是前端开发的核心语言，不仅要会用，更要深入理解其运行机制和底层原理。本章节涵盖所有**高频面试八股文**。

---

## 一、数据类型

### 1. 基本类型与引用类型

```javascript
/**
 * 基本类型 (7种):
 * - number
 * - string
 * - boolean
 * - null
 * - undefined
 * - symbol (ES6)
 * - bigint (ES2020)
 *
 * 引用类型:
 * - Object (包括 Array, Function, Date, RegExp, Error 等)
 */

// 存储区别
// 基本类型: 存储在栈内存,按值访问
// 引用类型: 存储在堆内存,按引用访问

let a = 1
let b = a  // 复制值
b = 2
console.log(a)  // 1 (不受影响)

let obj1 = { name: 'Alice' }
let obj2 = obj1  // 复制引用
obj2.name = 'Bob'
console.log(obj1.name)  // 'Bob' (被修改)
```

### 2. 类型判断

```javascript
// 1. typeof
typeof 123        // 'number'
typeof 'abc'      // 'string'
typeof true       // 'boolean'
typeof undefined  // 'undefined'
typeof Symbol()   // 'symbol'
typeof 123n       // 'bigint'

// 特殊情况
typeof null       // 'object' (历史遗留 bug)
typeof []         // 'object'
typeof {}         // 'object'
typeof function() {} // 'function'

// 2. instanceof (检查原型链)
[] instanceof Array   // true
[] instanceof Object  // true
{} instanceof Object  // true

// 手写 instanceof
function myInstanceof(obj, constructor) {
  if (typeof obj !== 'object' || obj === null) return false

  let proto = Object.getPrototypeOf(obj)
  while (proto !== null) {
    if (proto === constructor.prototype) return true
    proto = Object.getPrototypeOf(proto)
  }
  return false
}

// 3. Object.prototype.toString.call() (最准确)
Object.prototype.toString.call(123)        // '[object Number]'
Object.prototype.toString.call('abc')      // '[object String]'
Object.prototype.toString.call(true)       // '[object Boolean]'
Object.prototype.toString.call(null)       // '[object Null]'
Object.prototype.toString.call(undefined)  // '[object Undefined]'
Object.prototype.toString.call([])         // '[object Array]'
Object.prototype.toString.call({})         // '[object Object]'
Object.prototype.toString.call(function(){}) // '[object Function]'
Object.prototype.toString.call(new Date()) // '[object Date]'
Object.prototype.toString.call(/abc/)      // '[object RegExp]'

// 封装通用类型判断函数
function getType(value) {
  const type = Object.prototype.toString.call(value)
  return type.slice(8, -1).toLowerCase()
}

getType(123)    // 'number'
getType([])     // 'array'
getType(null)   // 'null'

// 4. Array.isArray()
Array.isArray([])   // true
Array.isArray({})   // false

// 5. 判断 NaN
Number.isNaN(NaN)   // true (推荐)
isNaN('abc')        // true (不推荐,会先转换类型)
NaN === NaN         // false (唯一一个不等于自身的值)
Object.is(NaN, NaN) // true
```

### 3. 类型转换

```javascript
/**
 * 隐式转换规则:
 *
 * 1. 转 Boolean: 使用 Boolean() 或 !!
 *    假值: false, 0, -0, '', null, undefined, NaN
 *    其他都是真值 (包括 [], {}, '0')
 *
 * 2. 转 Number: 使用 Number() 或 +
 *    true → 1
 *    false → 0
 *    null → 0
 *    undefined → NaN
 *    '' → 0
 *    '123' → 123
 *    '12a' → NaN
 *    [] → 0
 *    [1] → 1
 *    [1,2] → NaN
 *
 * 3. 转 String: 使用 String() 或 + ''
 *    null → 'null'
 *    undefined → 'undefined'
 *    [1,2,3] → '1,2,3'
 */

// == 比较规则 (优先转 Number)
1 == '1'        // true ('1' → 1)
1 == true       // true (true → 1)
'1' == true     // true ('1' → 1, true → 1)
null == undefined // true (特殊规则)
null == 0       // false (null 只等于 undefined)
NaN == NaN      // false

// [] 和 {} 的转换
[] == ![]       // true
// ![] → false
// [] → '' → 0
// false → 0
// 0 == 0 → true

[] + []         // '' (两个空数组拼接)
[] + {}         // '[object Object]'
{} + []         // 0 ({}被解析为代码块)
({}) + []       // '[object Object]'

// 对象转原始值 (ToPrimitive)
// 优先调用 [Symbol.toPrimitive]
// 否则: 转 Number 先 valueOf 再 toString
//       转 String 先 toString 再 valueOf

const obj = {
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return 42
    if (hint === 'string') return 'hello'
    return true  // default
  }
}

+obj        // 42 (hint: 'number')
`${obj}`    // 'hello' (hint: 'string')
obj + ''    // 'true' (hint: 'default')

// 经典面试题: 让 a == 1 && a == 2 && a == 3
const a = {
  value: 1,
  valueOf() {
    return this.value++
  }
}

console.log(a == 1 && a == 2 && a == 3)  // true
```

---

## 二、执行上下文与作用域

### 1. 执行上下文

```javascript
/**
 * 执行上下文类型:
 * 1. 全局执行上下文
 * 2. 函数执行上下文
 * 3. eval 执行上下文
 *
 * 执行上下文包含:
 * - 变量环境 (var 声明)
 * - 词法环境 (let/const 声明)
 * - this 绑定
 * - 外部环境引用 (作用域链)
 */

// 执行上下文栈 (调用栈)
function foo() {
  console.log('foo')
  bar()
  console.log('foo end')
}

function bar() {
  console.log('bar')
}

foo()
// 调用栈变化:
// 1. [全局]
// 2. [全局, foo]
// 3. [全局, foo, bar]
// 4. [全局, foo] (bar 出栈)
// 5. [全局] (foo 出栈)
```

### 2. 变量提升

```javascript
/**
 * var: 存在变量提升,初始化为 undefined
 * let/const: 存在"提升"但有 TDZ (暂时性死区)
 * function: 整体提升,包括函数体
 */

console.log(a)  // undefined
var a = 1

console.log(b)  // ReferenceError: Cannot access 'b' before initialization
let b = 2

// 函数提升优先于变量提升
console.log(foo)  // [Function: foo]
var foo = 1
function foo() {}

// 等价于:
function foo() {}
var foo
console.log(foo)  // [Function: foo]
foo = 1

// TDZ (暂时性死区)
var x = 1
{
  console.log(x)  // ReferenceError
  let x = 2
}
// let x 的声明会被提升到块作用域顶部
// 但在声明前的区域就是 TDZ,访问会报错
```

### 3. 作用域与作用域链

```javascript
/**
 * 作用域类型:
 * 1. 全局作用域
 * 2. 函数作用域
 * 3. 块级作用域 (let/const)
 *
 * 作用域链: 由当前作用域和所有父级作用域组成
 * 查找变量时沿作用域链向上查找
 */

var globalVar = 'global'

function outer() {
  var outerVar = 'outer'

  function inner() {
    var innerVar = 'inner'

    console.log(innerVar)   // 'inner' (当前作用域)
    console.log(outerVar)   // 'outer' (父作用域)
    console.log(globalVar)  // 'global' (全局作用域)
  }

  inner()
}

outer()

// 作用域链在函数定义时确定,不是调用时
var x = 10

function foo() {
  console.log(x)
}

function bar() {
  var x = 20
  foo()
}

bar()  // 10 (foo 的作用域链在定义时确定)

// 块级作用域
{
  let a = 1
  const b = 2
  var c = 3
}
// console.log(a)  // ReferenceError
// console.log(b)  // ReferenceError
console.log(c)    // 3 (var 不受块级作用域限制)
```

---

## 三、闭包

### 1. 闭包定义

```javascript
/**
 * 闭包 = 函数 + 函数能够访问的自由变量
 *
 * 特点:
 * 1. 函数嵌套函数
 * 2. 内部函数引用外部函数的变量
 * 3. 外部函数执行完后,变量不会被回收
 */

function outer() {
  let count = 0

  return function inner() {
    count++
    console.log(count)
  }
}

const counter = outer()
counter()  // 1
counter()  // 2
counter()  // 3
// count 变量被闭包保持,不会被回收
```

### 2. 闭包应用场景

```javascript
// 1. 模块化 (IIFE)
const module = (function() {
  let privateVar = 0

  function privateMethod() {
    return privateVar++
  }

  return {
    publicMethod: function() {
      return privateMethod()
    },
    getPrivateVar: function() {
      return privateVar
    }
  }
})()

module.publicMethod()  // 0
module.publicMethod()  // 1
// privateVar 无法直接访问

// 2. 柯里化
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    }
    return function(...moreArgs) {
      return curried.apply(this, args.concat(moreArgs))
    }
  }
}

const add = (a, b, c) => a + b + c
const curriedAdd = curry(add)

curriedAdd(1)(2)(3)  // 6
curriedAdd(1, 2)(3)  // 6
curriedAdd(1)(2, 3)  // 6

// 3. 防抖节流
function debounce(fn, delay) {
  let timer = null  // 闭包保存 timer

  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 4. 缓存 (Memoization)
function memoize(fn) {
  const cache = {}  // 闭包保存缓存

  return function(...args) {
    const key = JSON.stringify(args)

    if (key in cache) {
      return cache[key]
    }

    const result = fn.apply(this, args)
    cache[key] = result
    return result
  }
}

const expensiveFn = memoize((n) => {
  console.log('Computing...')
  return n * 2
})

expensiveFn(5)  // Computing... 10
expensiveFn(5)  // 10 (from cache)

// 5. 私有变量
function Person(name) {
  let _name = name  // 私有变量

  this.getName = function() {
    return _name
  }

  this.setName = function(newName) {
    _name = newName
  }
}

const person = new Person('Alice')
console.log(person._name)     // undefined
console.log(person.getName()) // 'Alice'
```

### 3. 闭包经典问题

```javascript
// 问题: 输出什么?
for (var i = 0; i < 5; i++) {
  setTimeout(function() {
    console.log(i)
  }, 1000)
}
// 输出: 5 5 5 5 5
// 原因: var 是函数作用域,循环结束后 i = 5

// 解决方案 1: 使用 let
for (let i = 0; i < 5; i++) {
  setTimeout(function() {
    console.log(i)
  }, 1000)
}
// 输出: 0 1 2 3 4

// 解决方案 2: 闭包
for (var i = 0; i < 5; i++) {
  (function(j) {
    setTimeout(function() {
      console.log(j)
    }, 1000)
  })(i)
}
// 输出: 0 1 2 3 4

// 解决方案 3: setTimeout 第三个参数
for (var i = 0; i < 5; i++) {
  setTimeout(function(j) {
    console.log(j)
  }, 1000, i)
}
// 输出: 0 1 2 3 4
```

---

## 四、this 指向

### 1. this 绑定规则

```javascript
/**
 * this 绑定优先级 (从高到低):
 * 1. new 绑定
 * 2. 显式绑定 (call/apply/bind)
 * 3. 隐式绑定 (对象方法调用)
 * 4. 默认绑定 (独立函数调用)
 */

// 1. 默认绑定
function foo() {
  console.log(this)
}
foo()  // window (严格模式下是 undefined)

// 2. 隐式绑定
const obj = {
  name: 'Alice',
  sayName() {
    console.log(this.name)
  }
}
obj.sayName()  // 'Alice'

// 隐式绑定丢失
const fn = obj.sayName
fn()  // undefined (默认绑定)

// 3. 显式绑定
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`)
}

const user = { name: 'Bob' }

greet.call(user, 'Hello')      // 'Hello, Bob'
greet.apply(user, ['Hi'])      // 'Hi, Bob'

const boundGreet = greet.bind(user)
boundGreet('Hey')              // 'Hey, Bob'

// 4. new 绑定
function Person(name) {
  this.name = name
}

const person = new Person('Charlie')
console.log(person.name)  // 'Charlie'

// 箭头函数没有自己的 this
const arrow = {
  name: 'Dave',
  sayName: () => {
    console.log(this.name)  // undefined (继承外层 this)
  },
  sayNameRegular() {
    const inner = () => {
      console.log(this.name)  // 'Dave' (继承 sayNameRegular 的 this)
    }
    inner()
  }
}

arrow.sayName()        // undefined
arrow.sayNameRegular() // 'Dave'
```

### 2. 手写 call/apply/bind

```javascript
// 手写 call
Function.prototype.myCall = function(context, ...args) {
  // 处理 null/undefined
  context = context ?? window

  // 将函数设为对象的方法
  const key = Symbol('fn')
  context[key] = this

  // 调用方法
  const result = context[key](...args)

  // 删除临时方法
  delete context[key]

  return result
}

// 手写 apply
Function.prototype.myApply = function(context, args = []) {
  context = context ?? window

  const key = Symbol('fn')
  context[key] = this

  const result = context[key](...args)

  delete context[key]

  return result
}

// 手写 bind
Function.prototype.myBind = function(context, ...args) {
  const fn = this

  const bound = function(...moreArgs) {
    // 如果是 new 调用,this 指向实例
    return fn.apply(
      this instanceof bound ? this : context,
      args.concat(moreArgs)
    )
  }

  // 继承原型
  if (fn.prototype) {
    bound.prototype = Object.create(fn.prototype)
  }

  return bound
}

// 测试
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`
}

const user = { name: 'Alice' }

console.log(greet.myCall(user, 'Hello', '!'))  // 'Hello, Alice!'
console.log(greet.myApply(user, ['Hi', '?']))  // 'Hi, Alice?'
console.log(greet.myBind(user, 'Hey')('...'))  // 'Hey, Alice...'
```

---

## 五、原型与继承

### 1. 原型链

```javascript
/**
 * 每个对象都有 __proto__ 属性,指向其构造函数的 prototype
 * 原型链: 对象 → 原型 → 原型的原型 → ... → null
 */

function Person(name) {
  this.name = name
}

Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`)
}

const person = new Person('Alice')

// 原型链关系
console.log(person.__proto__ === Person.prototype)          // true
console.log(Person.prototype.__proto__ === Object.prototype) // true
console.log(Object.prototype.__proto__ === null)             // true

// 属性查找
person.sayHello()              // 'Hello, I'm Alice' (原型上)
console.log(person.toString()) // '[object Object]' (Object.prototype)

// 判断属性来源
console.log(person.hasOwnProperty('name'))     // true (自身属性)
console.log(person.hasOwnProperty('sayHello')) // false (原型属性)
console.log('sayHello' in person)              // true (包括原型)
```

### 2. 继承方式

```javascript
// 1. 原型链继承
function Parent() {
  this.colors = ['red', 'blue']
}

function Child() {}
Child.prototype = new Parent()

// 问题: 引用类型共享
const c1 = new Child()
const c2 = new Child()
c1.colors.push('green')
console.log(c2.colors)  // ['red', 'blue', 'green']

// 2. 构造函数继承
function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue']
}

function Child(name) {
  Parent.call(this, name)
}

// 问题: 无法继承原型方法

// 3. 组合继承
function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue']
}

Parent.prototype.sayName = function() {
  console.log(this.name)
}

function Child(name, age) {
  Parent.call(this, name)  // 第一次调用 Parent
  this.age = age
}

Child.prototype = new Parent()  // 第二次调用 Parent
Child.prototype.constructor = Child

// 问题: Parent 构造函数被调用两次

// 4. 寄生组合继承 (最优)
function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue']
}

Parent.prototype.sayName = function() {
  console.log(this.name)
}

function Child(name, age) {
  Parent.call(this, name)
  this.age = age
}

// 关键: 使用 Object.create
Child.prototype = Object.create(Parent.prototype)
Child.prototype.constructor = Child

const child = new Child('Alice', 18)
child.sayName()  // 'Alice'
console.log(child.colors)  // ['red', 'blue']

// 5. ES6 Class 继承
class Parent {
  constructor(name) {
    this.name = name
  }

  sayName() {
    console.log(this.name)
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name)  // 必须先调用 super
    this.age = age
  }
}

const c = new Child('Bob', 20)
c.sayName()  // 'Bob'
```

### 3. 手写 new 和 Object.create

```javascript
// 手写 new
function myNew(constructor, ...args) {
  // 1. 创建新对象,原型指向构造函数的 prototype
  const obj = Object.create(constructor.prototype)

  // 2. 执行构造函数,绑定 this
  const result = constructor.apply(obj, args)

  // 3. 如果构造函数返回对象,则返回该对象
  return result instanceof Object ? result : obj
}

// 手写 Object.create
function myCreate(proto, propertiesObject) {
  if (typeof proto !== 'object' && typeof proto !== 'function') {
    throw new TypeError('Object prototype may only be an Object or null')
  }

  function F() {}
  F.prototype = proto

  const obj = new F()

  if (propertiesObject !== undefined) {
    Object.defineProperties(obj, propertiesObject)
  }

  return obj
}

// 测试
function Person(name) {
  this.name = name
}

Person.prototype.sayHello = function() {
  console.log('Hello')
}

const p = myNew(Person, 'Alice')
p.sayHello()  // 'Hello'
```

---

## 六、异步编程

### 1. Promise

```javascript
/**
 * Promise 三种状态:
 * - pending: 进行中
 * - fulfilled: 已成功
 * - rejected: 已失败
 *
 * 状态一旦改变就不可逆
 */

// 基本使用
const promise = new Promise((resolve, reject) => {
  // 异步操作
  setTimeout(() => {
    if (Math.random() > 0.5) {
      resolve('success')
    } else {
      reject(new Error('failed'))
    }
  }, 1000)
})

promise
  .then(result => console.log(result))
  .catch(error => console.error(error))
  .finally(() => console.log('done'))

// Promise 链式调用
Promise.resolve(1)
  .then(x => x + 1)
  .then(x => x * 2)
  .then(x => console.log(x))  // 4

// Promise.all (全部成功才成功)
Promise.all([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]).then(results => console.log(results))  // [1, 2, 3]

// Promise.allSettled (全部完成)
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject(new Error('failed')),
  Promise.resolve(3)
]).then(results => console.log(results))
// [
//   { status: 'fulfilled', value: 1 },
//   { status: 'rejected', reason: Error: failed },
//   { status: 'fulfilled', value: 3 }
// ]

// Promise.race (最快的)
Promise.race([
  new Promise(resolve => setTimeout(() => resolve(1), 100)),
  new Promise(resolve => setTimeout(() => resolve(2), 50))
]).then(result => console.log(result))  // 2

// Promise.any (第一个成功的)
Promise.any([
  Promise.reject(new Error('1')),
  Promise.resolve(2),
  Promise.resolve(3)
]).then(result => console.log(result))  // 2
```

### 2. 手写 Promise

```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending'
    this.value = undefined
    this.reason = undefined
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled'
        this.value = value
        this.onFulfilledCallbacks.forEach(fn => fn())
      }
    }

    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected'
        this.reason = reason
        this.onRejectedCallbacks.forEach(fn => fn())
      }
    }

    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v
    onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e }

    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === 'fulfilled') {
        queueMicrotask(() => {
          try {
            const x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }

      if (this.state === 'rejected') {
        queueMicrotask(() => {
          try {
            const x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }

      if (this.state === 'pending') {
        this.onFulfilledCallbacks.push(() => {
          queueMicrotask(() => {
            try {
              const x = onFulfilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          })
        })

        this.onRejectedCallbacks.push(() => {
          queueMicrotask(() => {
            try {
              const x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          })
        })
      }
    })

    return promise2
  }

  catch(onRejected) {
    return this.then(null, onRejected)
  }

  finally(callback) {
    return this.then(
      value => MyPromise.resolve(callback()).then(() => value),
      reason => MyPromise.resolve(callback()).then(() => { throw reason })
    )
  }

  static resolve(value) {
    if (value instanceof MyPromise) return value
    return new MyPromise(resolve => resolve(value))
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason))
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = []
      let count = 0

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          value => {
            results[index] = value
            if (++count === promises.length) {
              resolve(results)
            }
          },
          reject
        )
      })
    })
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(promise => {
        MyPromise.resolve(promise).then(resolve, reject)
      })
    })
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected'))
  }

  if (x instanceof MyPromise) {
    x.then(resolve, reject)
  } else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    let called = false
    try {
      const then = x.then

      if (typeof then === 'function') {
        then.call(
          x,
          y => {
            if (called) return
            called = true
            resolvePromise(promise2, y, resolve, reject)
          },
          r => {
            if (called) return
            called = true
            reject(r)
          }
        )
      } else {
        resolve(x)
      }
    } catch (error) {
      if (called) return
      called = true
      reject(error)
    }
  } else {
    resolve(x)
  }
}
```

### 3. async/await

```javascript
// async/await 是 Generator + Promise 的语法糖
async function fetchData() {
  try {
    const response = await fetch('/api/data')
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}

// 并行执行
async function fetchAll() {
  const [user, posts] = await Promise.all([
    fetch('/api/user'),
    fetch('/api/posts')
  ])
  return { user, posts }
}

// 串行执行
async function fetchSequentially(urls) {
  const results = []
  for (const url of urls) {
    const response = await fetch(url)
    results.push(await response.json())
  }
  return results
}

// 错误处理
async function withErrorHandling() {
  try {
    const data = await fetchData()
    return data
  } catch (error) {
    // 处理错误
    return null
  }
}

// async 函数返回 Promise
async function foo() {
  return 'hello'
}
foo().then(console.log)  // 'hello'

async function bar() {
  throw new Error('failed')
}
bar().catch(console.error)  // Error: failed
```

---

## 七、事件循环

### 1. 浏览器事件循环

```javascript
/**
 * 宏任务 (MacroTask):
 * - script (整体代码)
 * - setTimeout/setInterval
 * - setImmediate (Node.js)
 * - I/O
 * - UI rendering
 * - requestAnimationFrame
 *
 * 微任务 (MicroTask):
 * - Promise.then/catch/finally
 * - MutationObserver
 * - queueMicrotask
 * - process.nextTick (Node.js)
 *
 * 执行顺序:
 * 1. 执行一个宏任务
 * 2. 执行所有微任务
 * 3. 渲染 (如果需要)
 * 4. 回到步骤 1
 */

console.log('1')

setTimeout(() => {
  console.log('2')
  Promise.resolve().then(() => {
    console.log('3')
  })
}, 0)

Promise.resolve().then(() => {
  console.log('4')
  setTimeout(() => {
    console.log('5')
  }, 0)
})

console.log('6')

// 输出: 1, 6, 4, 2, 3, 5

// 复杂示例
async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}

async function async2() {
  console.log('async2')
}

console.log('script start')

setTimeout(() => {
  console.log('setTimeout')
}, 0)

async1()

new Promise(resolve => {
  console.log('promise1')
  resolve()
}).then(() => {
  console.log('promise2')
})

console.log('script end')

// 输出:
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
```

### 2. Node.js 事件循环

```javascript
/**
 * Node.js 事件循环阶段:
 * 1. timers: setTimeout/setInterval 回调
 * 2. pending callbacks: I/O 回调
 * 3. idle, prepare: 内部使用
 * 4. poll: 检索新的 I/O 事件
 * 5. check: setImmediate 回调
 * 6. close callbacks: close 事件回调
 *
 * process.nextTick 优先级最高,在每个阶段之间执行
 */

console.log('start')

setTimeout(() => {
  console.log('setTimeout')
}, 0)

setImmediate(() => {
  console.log('setImmediate')
})

process.nextTick(() => {
  console.log('nextTick')
})

Promise.resolve().then(() => {
  console.log('Promise')
})

console.log('end')

// 输出:
// start
// end
// nextTick
// Promise
// setTimeout (或 setImmediate,顺序不确定)
// setImmediate (或 setTimeout)
```

---

## 八、垃圾回收

### 1. 垃圾回收机制

```javascript
/**
 * 引用计数:
 * - 优点: 实时回收,无停顿
 * - 缺点: 无法处理循环引用
 *
 * 标记清除:
 * - 从根对象开始标记所有可达对象
 * - 清除未标记的对象
 * - 现代浏览器主要使用
 *
 * V8 分代回收:
 * - 新生代: 存活时间短的对象,使用 Scavenge 算法
 * - 老生代: 存活时间长的对象,使用标记清除 + 标记整理
 */

// 循环引用示例
function circularReference() {
  const obj1 = {}
  const obj2 = {}
  obj1.ref = obj2
  obj2.ref = obj1
  // 引用计数无法回收
  // 标记清除可以回收 (函数执行完后,从根无法到达)
}

// 手动解除引用
let bigData = new Array(1000000).fill('x')
// 使用完后
bigData = null  // 帮助 GC
```

### 2. 内存泄漏场景

```javascript
// 1. 全局变量
function leak() {
  leakedVar = 'global'  // 忘记 var/let/const
}

// 2. 闭包
function createLeak() {
  const hugeData = new Array(1000000)
  return function() {
    // hugeData 被保留
    console.log(hugeData.length)
  }
}

// 3. 定时器
const timer = setInterval(() => {
  const dom = document.getElementById('xxx')
  if (dom) {
    dom.innerHTML = Date.now()
  }
}, 1000)
// 忘记 clearInterval

// 4. DOM 引用
const elements = {
  button: document.getElementById('button')
}

document.body.removeChild(elements.button)
// elements.button 仍然引用着 DOM

// 5. 事件监听
element.addEventListener('click', handler)
// 忘记 removeEventListener

// 6. Map/Set
const cache = new Map()
cache.set(key, value)  // key 一直被引用

// 使用 WeakMap 解决
const weakCache = new WeakMap()
weakCache.set(obj, value)  // obj 可被回收
```

---

## 高频面试题汇总

::: details 1. typeof 和 instanceof 的区别?
<details>
<summary>点击查看答案</summary>

**typeof:**
- 返回字符串,表示类型
- 可以判断基本类型 (除 null)
- 无法区分引用类型 (除 function)

**instanceof:**
- 返回布尔值
- 检查原型链
- 只能判断引用类型

```javascript
typeof null           // 'object' (bug)
typeof []             // 'object'
[] instanceof Array   // true
[] instanceof Object  // true
```
:::

</details>

::: details 2. == 和 === 的区别?
<details>
<summary>点击查看答案</summary>

**===** 严格相等:
- 不进行类型转换
- 类型不同直接返回 false

**==** 宽松相等:
- 会进行类型转换
- 转换规则复杂

```javascript
1 === '1'    // false
1 == '1'     // true
null == undefined  // true
null === undefined // false
NaN == NaN   // false
```

**建议: 始终使用 ===**
:::

</details>

::: details 3. var/let/const 的区别?
<details>
<summary>点击查看答案</summary>

| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 是 | TDZ | TDZ |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许 |
| 全局属性 | 是 | 否 | 否 |

```javascript
// var 挂载到 window
var a = 1
window.a  // 1

// let/const 不挂载
let b = 2
window.b  // undefined
```
:::

</details>

::: details 4. 箭头函数和普通函数的区别?
<details>
<summary>点击查看答案</summary>

1. **this**: 箭头函数没有自己的 this,继承外层
2. **arguments**: 箭头函数没有 arguments 对象
3. **new**: 箭头函数不能作为构造函数
4. **prototype**: 箭头函数没有 prototype 属性
5. **yield**: 箭头函数不能用作 Generator

```javascript
const obj = {
  name: 'Alice',
  regular() {
    console.log(this.name)  // 'Alice'
  },
  arrow: () => {
    console.log(this.name)  // undefined
  }
}
```
:::

</details>

::: details 5. 深拷贝和浅拷贝的区别?
<details>
<summary>点击查看答案</summary>

**浅拷贝**: 只复制第一层
```javascript
Object.assign({}, obj)
{ ...obj }
[].concat(arr)
[...arr]
```

**深拷贝**: 递归复制所有层
```javascript
JSON.parse(JSON.stringify(obj))  // 有限制
// 无法处理: undefined, function, Symbol, 循环引用

// 完整深拷贝
function deepClone(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof RegExp) return new RegExp(obj)
  if (map.has(obj)) return map.get(obj)

  const clone = Array.isArray(obj) ? [] : {}
  map.set(obj, clone)

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], map)
    }
  }

  return clone
}
```
:::

---

</details>

## 总结

::: details 核心考点
1. **数据类型**: 类型判断、类型转换
2. **作用域**: 作用域链、闭包、变量提升
3. **this**: 绑定规则、call/apply/bind
4. **原型**: 原型链、继承方式
5. **异步**: Promise、async/await、事件循环
6. **内存**: 垃圾回收、内存泄漏
:::

::: details 面试技巧
1. 先说概念,再举例子
2. 结合实际项目经验
3. 展示深入理解 (原理、底层)
4. 主动提及相关知识点
:::

## 错误处理

### 错误类型

JavaScript 内置了多种错误类型：

```javascript
// SyntaxError：语法错误（编译时）
// eval('let a ='); // SyntaxError

// ReferenceError：访问未声明的变量
// console.log(notDefined); // ReferenceError

// TypeError：类型操作错误（最常见）
null.property;              // TypeError: Cannot read properties of null
undefined();                // TypeError: undefined is not a function

// RangeError：数值超出范围
new Array(-1);              // RangeError: Invalid array length
(1234567890).toFixed(200);  // RangeError: toFixed() digits argument must be between 0 and 100

// URIError：URL 编码/解码错误
decodeURIComponent('%');    // URIError: URI malformed
```

### 自定义错误类

```javascript
// 创建自定义错误类，继承 Error
class NetworkError extends Error {
  constructor(message, statusCode) {
    super(message);           // 调用父类构造函数
    this.name = 'NetworkError'; // 错误名称
    this.statusCode = statusCode;
    // 确保 instanceof 检查正常工作
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// 使用
function fetchUser(id) {
  if (!id) throw new ValidationError('用户 ID 不能为空', 'id');
  // ...
}

try {
  fetchUser(null);
} catch (err) {
  if (err instanceof ValidationError) {
    console.log(`字段 ${err.field} 验证失败: ${err.message}`);
  } else if (err instanceof NetworkError) {
    console.log(`网络错误 ${err.statusCode}: ${err.message}`);
  } else {
    throw err; // 未知错误，重新抛出
  }
}
```

### 异步错误处理

```javascript
// Promise 链中的错误处理
fetch('/api/data')
  .then(res => {
    if (!res.ok) throw new NetworkError(`请求失败`, res.status);
    return res.json();
  })
  .then(data => processData(data))
  .catch(err => {
    // 捕获整个链中的所有错误
    console.error(err);
  });

// async/await 中的错误处理
async function loadData() {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new NetworkError('请求失败', res.status);
    const data = await res.json();
    return data;
  } catch (err) {
    if (err instanceof NetworkError) {
      // 处理网络错误
    } else {
      throw err; // 重新抛出非预期错误
    }
  } finally {
    // 无论成功失败都会执行，适合清理资源
    setLoading(false);
  }
}

// 统一处理 Promise rejection
window.addEventListener('unhandledrejection', event => {
  console.error('未处理的 Promise 拒绝:', event.reason);
  event.preventDefault(); // 阻止默认行为（浏览器报错）
});

// 全局错误捕获
window.addEventListener('error', event => {
  console.error('全局错误:', event.error);
  // 上报到监控系统
});
```

### 错误边界与优雅降级

```javascript
// 函数级别的错误边界（高阶函数模式）
function withErrorHandler(fn, fallback) {
  return async function(...args) {
    try {
      return await fn(...args);
    } catch (err) {
      console.error(`${fn.name} 出错:`, err);
      return typeof fallback === 'function' ? fallback(err) : fallback;
    }
  };
}

const safeLoadUser = withErrorHandler(loadUser, null);
const user = await safeLoadUser(userId); // 出错时返回 null，不崩溃
```
