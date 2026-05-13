# 手写代码实现

## 概述

手写代码是前端面试的必考题，考察对 JavaScript 核心原理的理解。本章节涵盖高频手写题，包括详细实现思路和面试要点。

## 防抖与节流

### 防抖（Debounce）

**原理**: 事件触发后延迟执行，如果在延迟期间再次触发，则重新计时。

**应用场景**: 搜索框输入、窗口 resize、按钮防重复点击

```javascript
// 基础版
function debounce(fn, delay) {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

// 完整版：支持立即执行、取消、返回值
function debounce(fn, delay, immediate = false) {
  let timer = null
  let result

  const debounced = function(...args) {
    // 保存 this 上下文
    const context = this

    // 清除之前的定时器
    if (timer) clearTimeout(timer)

    if (immediate) {
      // 立即执行模式
      const callNow = !timer
      timer = setTimeout(() => {
        timer = null
      }, delay)

      if (callNow) {
        result = fn.apply(context, args)
      }
    } else {
      // 延迟执行模式
      timer = setTimeout(() => {
        result = fn.apply(context, args)
      }, delay)
    }

    return result
  }

  // 取消方法
  debounced.cancel = function() {
    clearTimeout(timer)
    timer = null
  }

  return debounced
}

// 使用示例
const searchInput = document.getElementById('search')
const handleSearch = debounce((e) => {
  console.log('搜索:', e.target.value)
}, 300)

searchInput.addEventListener('input', handleSearch)

// 取消防抖
// handleSearch.cancel()
```

### 节流（Throttle）

**原理**: 在一定时间内只执行一次，无论触发多少次。

**应用场景**: 滚动加载、拖拽、射击游戏

```javascript
// 时间戳版（首次立即执行）
function throttle(fn, delay) {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

// 定时器版（最后一次也会执行）
function throttle(fn, delay) {
  let timer = null
  return function(...args) {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args)
        timer = null
      }, delay)
    }
  }
}

// 完整版：支持首次执行和尾部执行配置
function throttle(fn, delay, options = {}) {
  let timer = null
  let lastTime = 0
  const { leading = true, trailing = true } = options

  const throttled = function(...args) {
    const context = this
    const now = Date.now()

    // 首次不执行
    if (!leading && !lastTime) {
      lastTime = now
    }

    const remaining = delay - (now - lastTime)

    if (remaining <= 0 || remaining > delay) {
      // 时间到了，立即执行
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      lastTime = now
      fn.apply(context, args)
    } else if (!timer && trailing) {
      // 设置尾部执行的定时器
      timer = setTimeout(() => {
        lastTime = leading ? Date.now() : 0
        timer = null
        fn.apply(context, args)
      }, remaining)
    }
  }

  throttled.cancel = function() {
    clearTimeout(timer)
    timer = null
    lastTime = 0
  }

  return throttled
}

// 使用示例
window.addEventListener('scroll', throttle(() => {
  console.log('滚动中...')
}, 200))
```

## 深拷贝

### 基础版

```javascript
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  const clone = Array.isArray(obj) ? [] : {}

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key])
    }
  }

  return clone
}
```

### 完整版（处理循环引用、特殊类型）

```javascript
function deepClone(obj, map = new WeakMap()) {
  // 处理 null 和非对象类型
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 处理循环引用
  if (map.has(obj)) {
    return map.get(obj)
  }

  // 处理 Date
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }

  // 处理 RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags)
  }

  // 处理 Map
  if (obj instanceof Map) {
    const cloneMap = new Map()
    map.set(obj, cloneMap)
    obj.forEach((value, key) => {
      cloneMap.set(deepClone(key, map), deepClone(value, map))
    })
    return cloneMap
  }

  // 处理 Set
  if (obj instanceof Set) {
    const cloneSet = new Set()
    map.set(obj, cloneSet)
    obj.forEach(value => {
      cloneSet.add(deepClone(value, map))
    })
    return cloneSet
  }

  // 处理 Symbol 属性
  const symbolKeys = Object.getOwnPropertySymbols(obj)

  // 创建新对象，继承原型
  const clone = Array.isArray(obj)
    ? []
    : Object.create(Object.getPrototypeOf(obj))

  // 记录到 map 中，处理循环引用
  map.set(obj, clone)

  // 复制普通属性
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], map)
    }
  }

  // 复制 Symbol 属性
  for (let symKey of symbolKeys) {
    clone[symKey] = deepClone(obj[symKey], map)
  }

  return clone
}

// 测试
const obj = {
  name: 'test',
  date: new Date(),
  regex: /abc/gi,
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3]),
  [Symbol('sym')]: 'symbol value'
}
obj.self = obj // 循环引用

const cloned = deepClone(obj)
console.log(cloned)
console.log(cloned.self === cloned) // true - 循环引用正确处理
```

## call/apply/bind

### 手写 call

```javascript
Function.prototype.myCall = function(context, ...args) {
  // 1. 处理 context
  if (context === null || context === undefined) {
    context = globalThis
  } else {
    context = Object(context) // 包装原始值
  }

  // 2. 使用 Symbol 避免属性冲突
  const fnKey = Symbol('fn')

  // 3. 将函数挂载到 context
  context[fnKey] = this

  // 4. 执行函数
  const result = context[fnKey](...args)

  // 5. 删除临时属性
  delete context[fnKey]

  return result
}

// 测试
function greet(greeting) {
  return `${greeting}, ${this.name}`
}
console.log(greet.myCall({ name: 'Alice' }, 'Hello')) // 'Hello, Alice'
```

### 手写 apply

```javascript
Function.prototype.myApply = function(context, argsArray = []) {
  // 参数校验
  if (argsArray !== undefined && !Array.isArray(argsArray)) {
    throw new TypeError('CreateListFromArrayLike called on non-object')
  }

  if (context === null || context === undefined) {
    context = globalThis
  } else {
    context = Object(context)
  }

  const fnKey = Symbol('fn')
  context[fnKey] = this

  const result = context[fnKey](...(argsArray || []))
  delete context[fnKey]

  return result
}

// 测试
console.log(Math.max.myApply(null, [1, 2, 3, 4, 5])) // 5
```

### 手写 bind

```javascript
Function.prototype.myBind = function(context, ...args) {
  const fn = this

  // 校验
  if (typeof fn !== 'function') {
    throw new TypeError('Bind must be called on a function')
  }

  const boundFn = function(...newArgs) {
    // 判断是否是 new 调用
    // new 调用时 this 是实例，普通调用时用传入的 context
    return fn.apply(
      this instanceof boundFn ? this : context,
      args.concat(newArgs)
    )
  }

  // 维护原型链
  if (fn.prototype) {
    boundFn.prototype = Object.create(fn.prototype)
  }

  return boundFn
}

// 测试
function Person(name, age) {
  this.name = name
  this.age = age
}

const BoundPerson = Person.myBind(null, 'Alice')
const p = new BoundPerson(25)
console.log(p.name, p.age) // 'Alice' 25
```

## Promise

### 手写 Promise（完整版）

```javascript
class MyPromise {
  static PENDING = 'pending'
  static FULFILLED = 'fulfilled'
  static REJECTED = 'rejected'

  constructor(executor) {
    this.state = MyPromise.PENDING
    this.value = undefined
    this.reason = undefined
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []

    const resolve = (value) => {
      // 如果 value 是 Promise，需要等待它完成
      if (value instanceof MyPromise) {
        value.then(resolve, reject)
        return
      }

      if (this.state === MyPromise.PENDING) {
        this.state = MyPromise.FULFILLED
        this.value = value
        this.onFulfilledCallbacks.forEach(fn => fn())
      }
    }

    const reject = (reason) => {
      if (this.state === MyPromise.PENDING) {
        this.state = MyPromise.REJECTED
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
    // 参数校验，实现值穿透
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }

    const promise2 = new MyPromise((resolve, reject) => {
      const fulfilledTask = () => {
        // 使用微任务
        queueMicrotask(() => {
          try {
            const x = onFulfilled(this.value)
            this.resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }

      const rejectedTask = () => {
        queueMicrotask(() => {
          try {
            const x = onRejected(this.reason)
            this.resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }

      if (this.state === MyPromise.FULFILLED) {
        fulfilledTask()
      } else if (this.state === MyPromise.REJECTED) {
        rejectedTask()
      } else {
        // pending 状态，存储回调
        this.onFulfilledCallbacks.push(fulfilledTask)
        this.onRejectedCallbacks.push(rejectedTask)
      }
    })

    return promise2
  }

  // Promise 解析过程
  resolvePromise(promise2, x, resolve, reject) {
    // 不能返回自己
    if (promise2 === x) {
      return reject(new TypeError('Chaining cycle detected'))
    }

    // x 是 Promise
    if (x instanceof MyPromise) {
      x.then(resolve, reject)
      return
    }

    // x 是对象或函数
    if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
      let called = false
      try {
        const then = x.then
        if (typeof then === 'function') {
          then.call(
            x,
            y => {
              if (called) return
              called = true
              this.resolvePromise(promise2, y, resolve, reject)
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
    if (value instanceof MyPromise) {
      return value
    }
    return new MyPromise(resolve => resolve(value))
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason))
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = []
      let count = 0
      const len = promises.length

      if (len === 0) {
        resolve(results)
        return
      }

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          value => {
            results[index] = value
            count++
            if (count === len) {
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

  static allSettled(promises) {
    return new MyPromise(resolve => {
      const results = []
      let count = 0
      const len = promises.length

      if (len === 0) {
        resolve(results)
        return
      }

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          value => {
            results[index] = { status: 'fulfilled', value }
            count++
            if (count === len) resolve(results)
          },
          reason => {
            results[index] = { status: 'rejected', reason }
            count++
            if (count === len) resolve(results)
          }
        )
      })
    })
  }

  static any(promises) {
    return new MyPromise((resolve, reject) => {
      const errors = []
      let count = 0
      const len = promises.length

      if (len === 0) {
        reject(new AggregateError([], 'All promises were rejected'))
        return
      }

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          resolve,
          reason => {
            errors[index] = reason
            count++
            if (count === len) {
              reject(new AggregateError(errors, 'All promises were rejected'))
            }
          }
        )
      })
    })
  }
}

// 测试
const p = new MyPromise((resolve) => {
  setTimeout(() => resolve('success'), 100)
})

p.then(value => {
  console.log(value) // 'success'
  return value + '!'
}).then(value => {
  console.log(value) // 'success!'
})
```

## new 操作符

```javascript
function myNew(Constructor, ...args) {
  // 1. 创建一个新对象，原型指向构造函数的 prototype
  const obj = Object.create(Constructor.prototype)

  // 2. 执行构造函数，this 指向新对象
  const result = Constructor.apply(obj, args)

  // 3. 如果构造函数返回对象，则返回该对象；否则返回新对象
  return result instanceof Object ? result : obj
}

// 测试
function Person(name, age) {
  this.name = name
  this.age = age
}

const p = myNew(Person, 'Alice', 25)
console.log(p.name, p.age) // 'Alice' 25
console.log(p instanceof Person) // true
```

## instanceof

```javascript
function myInstanceof(obj, Constructor) {
  // 基本类型返回 false
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return false
  }

  // 获取构造函数的原型
  const prototype = Constructor.prototype

  // 获取对象的原型链
  let proto = Object.getPrototypeOf(obj)

  // 沿着原型链查找
  while (proto !== null) {
    if (proto === prototype) {
      return true
    }
    proto = Object.getPrototypeOf(proto)
  }

  return false
}

// 测试
console.log(myInstanceof([], Array)) // true
console.log(myInstanceof([], Object)) // true
console.log(myInstanceof({}, Array)) // false
```

## Object.create

```javascript
function myObjectCreate(proto, propertiesObject) {
  if (proto !== null && typeof proto !== 'object' && typeof proto !== 'function') {
    throw new TypeError('Object prototype may only be an Object or null')
  }

  // 创建一个空的构造函数
  function F() {}
  F.prototype = proto

  const obj = new F()

  // 处理第二个参数
  if (propertiesObject !== undefined) {
    Object.defineProperties(obj, propertiesObject)
  }

  // 处理 proto 为 null 的情况
  if (proto === null) {
    obj.__proto__ = null
  }

  return obj
}

// 测试
const parent = { name: 'parent' }
const child = myObjectCreate(parent, {
  age: { value: 18, writable: true }
})
console.log(child.name) // 'parent'
console.log(child.age) // 18
```

## 继承

### 寄生组合继承

```javascript
function inheritPrototype(Child, Parent) {
  // 创建父类原型的副本
  const prototype = Object.create(Parent.prototype)
  // 修复 constructor
  prototype.constructor = Child
  // 赋值给子类原型
  Child.prototype = prototype
}

function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue']
}

Parent.prototype.sayName = function() {
  console.log(this.name)
}

function Child(name, age) {
  // 继承属性
  Parent.call(this, name)
  this.age = age
}

// 继承方法
inheritPrototype(Child, Parent)

Child.prototype.sayAge = function() {
  console.log(this.age)
}

// 测试
const child = new Child('Alice', 25)
child.sayName() // 'Alice'
child.sayAge() // 25
console.log(child instanceof Parent) // true
```

### ES6 class 继承

```javascript
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
    super(name) // 必须先调用 super
    this.age = age
  }

  sayAge() {
    console.log(this.age)
  }
}
```

## 柯里化

```javascript
// 基础版
function curry(fn) {
  return function curried(...args) {
    // 如果参数足够，直接执行
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    }
    // 否则返回一个新函数，继续收集参数
    return function(...newArgs) {
      return curried.apply(this, args.concat(newArgs))
    }
  }
}

// 支持占位符的版本
function curry(fn, placeholder = curry.placeholder) {
  return function curried(...args) {
    // 检查是否有占位符
    const hasPlaceholder = args.some(arg => arg === placeholder)
    // 实际参数数量（不包括占位符）
    const realArgs = args.filter(arg => arg !== placeholder)

    if (!hasPlaceholder && realArgs.length >= fn.length) {
      return fn.apply(this, args)
    }

    return function(...newArgs) {
      // 用新参数填充占位符
      const mergedArgs = args.map(arg =>
        arg === placeholder && newArgs.length ? newArgs.shift() : arg
      )
      return curried.apply(this, mergedArgs.concat(newArgs))
    }
  }
}
curry.placeholder = Symbol('placeholder')

// 使用
const add = (a, b, c) => a + b + c
const curriedAdd = curry(add)

console.log(curriedAdd(1)(2)(3)) // 6
console.log(curriedAdd(1, 2)(3)) // 6
console.log(curriedAdd(1)(2, 3)) // 6

// 占位符用法
const _ = curry.placeholder
console.log(curriedAdd(_, 2, 3)(1)) // 6
```

## 数组方法

### 数组扁平化

```javascript
// 递归版
function flatten(arr, depth = Infinity) {
  if (depth < 1) return arr.slice()

  return arr.reduce((acc, val) =>
    Array.isArray(val)
      ? acc.concat(flatten(val, depth - 1))
      : acc.concat(val),
    []
  )
}

// 迭代版（使用栈）
function flattenIterative(arr) {
  const result = []
  const stack = [...arr]

  while (stack.length) {
    const item = stack.pop()
    if (Array.isArray(item)) {
      stack.push(...item)
    } else {
      result.unshift(item)
    }
  }

  return result
}

// 使用 toString（仅适用于数字数组）
function flattenToString(arr) {
  return arr.toString().split(',').map(Number)
}

// 测试
const arr = [1, [2, [3, [4, 5]]]]
console.log(flatten(arr)) // [1, 2, 3, 4, 5]
console.log(flatten(arr, 1)) // [1, 2, [3, [4, 5]]]
```

### 数组去重

```javascript
// Set
const unique1 = arr => [...new Set(arr)]

// filter + indexOf
const unique2 = arr => arr.filter((item, index) => arr.indexOf(item) === index)

// reduce
const unique3 = arr => arr.reduce((acc, cur) =>
  acc.includes(cur) ? acc : [...acc, cur], []
)

// Map（保持顺序，支持对象）
function unique4(arr, key) {
  const map = new Map()
  return arr.filter(item => {
    const k = key ? item[key] : item
    if (map.has(k)) return false
    map.set(k, true)
    return true
  })
}

// 测试
const arr = [1, 2, 2, 3, 3, 3]
console.log(unique1(arr)) // [1, 2, 3]

// 对象数组去重
const objArr = [{ id: 1 }, { id: 2 }, { id: 1 }]
console.log(unique4(objArr, 'id')) // [{ id: 1 }, { id: 2 }]
```

### 手写 map

```javascript
Array.prototype.myMap = function(callback, thisArg) {
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function')
  }

  const result = []
  const arr = this

  for (let i = 0; i < arr.length; i++) {
    // 跳过稀疏数组的空位
    if (i in arr) {
      result[i] = callback.call(thisArg, arr[i], i, arr)
    }
  }

  return result
}

// 测试
const arr = [1, 2, 3]
console.log(arr.myMap(x => x * 2)) // [2, 4, 6]
```

### 手写 reduce

```javascript
Array.prototype.myReduce = function(callback, initialValue) {
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function')
  }

  const arr = this
  let accumulator
  let startIndex

  if (arguments.length >= 2) {
    accumulator = initialValue
    startIndex = 0
  } else {
    // 没有初始值，使用数组第一个非空元素
    if (arr.length === 0) {
      throw new TypeError('Reduce of empty array with no initial value')
    }

    let found = false
    for (let i = 0; i < arr.length; i++) {
      if (i in arr) {
        accumulator = arr[i]
        startIndex = i + 1
        found = true
        break
      }
    }

    if (!found) {
      throw new TypeError('Reduce of empty array with no initial value')
    }
  }

  for (let i = startIndex; i < arr.length; i++) {
    if (i in arr) {
      accumulator = callback(accumulator, arr[i], i, arr)
    }
  }

  return accumulator
}

// 测试
console.log([1, 2, 3].myReduce((acc, cur) => acc + cur, 0)) // 6
console.log([1, 2, 3].myReduce((acc, cur) => acc + cur)) // 6
```

### 手写 filter

```javascript
Array.prototype.myFilter = function(callback, thisArg) {
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function')
  }

  const result = []
  const arr = this

  for (let i = 0; i < arr.length; i++) {
    if (i in arr) {
      if (callback.call(thisArg, arr[i], i, arr)) {
        result.push(arr[i])
      }
    }
  }

  return result
}

// 测试
console.log([1, 2, 3, 4].myFilter(x => x > 2)) // [3, 4]
```

## 发布订阅模式

```javascript
class EventEmitter {
  constructor() {
    this.events = new Map()
  }

  // 订阅
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event).push(callback)
    return this
  }

  // 订阅一次
  once(event, callback) {
    const wrapper = (...args) => {
      callback.apply(this, args)
      this.off(event, wrapper)
    }
    wrapper.originalCallback = callback
    this.on(event, wrapper)
    return this
  }

  // 发布
  emit(event, ...args) {
    if (!this.events.has(event)) return false

    const callbacks = this.events.get(event)
    callbacks.forEach(cb => cb.apply(this, args))
    return true
  }

  // 取消订阅
  off(event, callback) {
    if (!this.events.has(event)) return this

    if (!callback) {
      // 移除该事件的所有监听
      this.events.delete(event)
    } else {
      const callbacks = this.events.get(event)
      const index = callbacks.findIndex(
        cb => cb === callback || cb.originalCallback === callback
      )
      if (index !== -1) {
        callbacks.splice(index, 1)
      }
      if (callbacks.length === 0) {
        this.events.delete(event)
      }
    }

    return this
  }

  // 获取监听器数量
  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0
  }
}

// 测试
const emitter = new EventEmitter()

const handler = (data) => console.log('收到:', data)

emitter.on('message', handler)
emitter.once('message', (data) => console.log('一次性:', data))

emitter.emit('message', 'hello')
// 收到: hello
// 一次性: hello

emitter.emit('message', 'world')
// 收到: world

emitter.off('message', handler)
emitter.emit('message', 'test')
// (无输出)
```

## 异步控制

### 并发控制

```javascript
class ConcurrencyLimit {
  constructor(limit) {
    this.limit = limit
    this.running = 0
    this.queue = []
  }

  async add(task) {
    if (this.running >= this.limit) {
      // 等待有空位
      await new Promise(resolve => this.queue.push(resolve))
    }

    this.running++

    try {
      return await task()
    } finally {
      this.running--
      if (this.queue.length > 0) {
        const next = this.queue.shift()
        next()
      }
    }
  }
}

// 函数式实现
function limitConcurrency(tasks, limit) {
  return new Promise((resolve, reject) => {
    const results = []
    let index = 0
    let running = 0
    let completed = 0

    function runNext() {
      while (running < limit && index < tasks.length) {
        const currentIndex = index
        const task = tasks[index]
        index++
        running++

        Promise.resolve(task())
          .then(result => {
            results[currentIndex] = result
          })
          .catch(error => {
            results[currentIndex] = error
          })
          .finally(() => {
            running--
            completed++

            if (completed === tasks.length) {
              resolve(results)
            } else {
              runNext()
            }
          })
      }
    }

    runNext()
  })
}

// 测试
const delay = (ms, value) => () =>
  new Promise(resolve => setTimeout(() => resolve(value), ms))

const tasks = [
  delay(1000, 1),
  delay(500, 2),
  delay(300, 3),
  delay(400, 4),
  delay(200, 5)
]

limitConcurrency(tasks, 2).then(console.log) // [1, 2, 3, 4, 5]
```

### 请求重试

```javascript
async function retry(fn, retries = 3, delay = 1000) {
  let lastError

  for (let i = 0; i <= retries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      console.log(`第 ${i + 1} 次请求失败，${i < retries ? '重试中...' : '已达最大重试次数'}`)

      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, delay))
        // 指数退避
        delay *= 2
      }
    }
  }

  throw lastError
}

// 测试
let count = 0
const unreliableApi = () => {
  count++
  if (count < 3) {
    return Promise.reject(new Error('失败'))
  }
  return Promise.resolve('成功')
}

retry(unreliableApi, 5, 100).then(console.log).catch(console.error)
```

### async/await 串行与并行

```javascript
// 串行执行
async function serial(tasks) {
  const results = []
  for (const task of tasks) {
    results.push(await task())
  }
  return results
}

// 并行执行
async function parallel(tasks) {
  return Promise.all(tasks.map(task => task()))
}

// 带并发限制的并行
async function parallelLimit(tasks, limit) {
  const executing = []
  const results = []

  for (const [index, task] of tasks.entries()) {
    const p = Promise.resolve(task()).then(result => {
      results[index] = result
      executing.splice(executing.indexOf(p), 1)
    })

    executing.push(p)

    if (executing.length >= limit) {
      await Promise.race(executing)
    }
  }

  await Promise.all(executing)
  return results
}
```

## LRU 缓存

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.cache = new Map()
  }

  get(key) {
    if (!this.cache.has(key)) {
      return -1
    }

    // 移到最后（最近使用）
    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value)

    return value
  }

  put(key, value) {
    // 如果已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.capacity) {
      // 删除最久未使用的（第一个）
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, value)
  }
}

// 双向链表实现（性能更好）
class LRUCacheLinkedList {
  constructor(capacity) {
    this.capacity = capacity
    this.cache = new Map()

    // 虚拟头尾节点
    this.head = { key: null, value: null, prev: null, next: null }
    this.tail = { key: null, value: null, prev: null, next: null }
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  // 移动到头部
  moveToHead(node) {
    this.removeNode(node)
    this.addToHead(node)
  }

  // 删除节点
  removeNode(node) {
    node.prev.next = node.next
    node.next.prev = node.prev
  }

  // 添加到头部
  addToHead(node) {
    node.prev = this.head
    node.next = this.head.next
    this.head.next.prev = node
    this.head.next = node
  }

  // 删除尾部节点
  removeTail() {
    const node = this.tail.prev
    this.removeNode(node)
    return node
  }

  get(key) {
    if (!this.cache.has(key)) return -1

    const node = this.cache.get(key)
    this.moveToHead(node)
    return node.value
  }

  put(key, value) {
    if (this.cache.has(key)) {
      const node = this.cache.get(key)
      node.value = value
      this.moveToHead(node)
    } else {
      const node = { key, value, prev: null, next: null }
      this.cache.set(key, node)
      this.addToHead(node)

      if (this.cache.size > this.capacity) {
        const tail = this.removeTail()
        this.cache.delete(tail.key)
      }
    }
  }
}

// 测试
const cache = new LRUCache(2)
cache.put(1, 1)
cache.put(2, 2)
console.log(cache.get(1)) // 1
cache.put(3, 3) // 淘汰 key 2
console.log(cache.get(2)) // -1
```

