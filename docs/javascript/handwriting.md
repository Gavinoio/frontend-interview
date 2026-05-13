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

## 面试题

::: details 1. 实现一个带并发限制的异步调度器
<details>
<summary>点击查看答案</summary>

```javascript
class Scheduler {
  constructor(maxCount) {
    this.maxCount = maxCount
    this.runningCount = 0
    this.taskQueue = []
  }

  add(promiseCreator) {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({
        promiseCreator,
        resolve,
        reject
      })
      this.run()
    })
  }

  run() {
    if (this.runningCount < this.maxCount && this.taskQueue.length) {
      const { promiseCreator, resolve, reject } = this.taskQueue.shift()
      this.runningCount++

      promiseCreator()
        .then(resolve, reject)
        .finally(() => {
          this.runningCount--
          this.run()
        })
    }
  }
}

// 测试
const timeout = (time) => new Promise(resolve => setTimeout(resolve, time))
const scheduler = new Scheduler(2)

const addTask = (time, order) => {
  scheduler.add(() => timeout(time)).then(() => console.log(order))
}

addTask(1000, '1')
addTask(500, '2')
addTask(300, '3')
addTask(400, '4')
// 输出顺序: 2 3 1 4
```
:::

</details>

::: details 2. 实现一个 LazyMan
<details>
<summary>点击查看答案</summary>

```javascript
class LazyManClass {
  constructor(name) {
    this.name = name
    this.tasks = []

    // 初始任务
    this.tasks.push(() => {
      console.log(`Hi I am ${this.name}`)
      this.next()
    })

    // 延迟执行
    setTimeout(() => this.next(), 0)
  }

  next() {
    const task = this.tasks.shift()
    task && task()
  }

  sleep(time) {
    this.tasks.push(() => {
      setTimeout(() => {
        console.log(`等待了 ${time} 秒...`)
        this.next()
      }, time * 1000)
    })
    return this
  }

  sleepFirst(time) {
    this.tasks.unshift(() => {
      setTimeout(() => {
        console.log(`等待了 ${time} 秒...`)
        this.next()
      }, time * 1000)
    })
    return this
  }

  eat(food) {
    this.tasks.push(() => {
      console.log(`I am eating ${food}`)
      this.next()
    })
    return this
  }
}

function LazyMan(name) {
  return new LazyManClass(name)
}

// 测试
LazyMan('Tony').eat('lunch').sleep(2).eat('dinner').sleepFirst(1)
// 等待了 1 秒...
// Hi I am Tony
// I am eating lunch
// 等待了 2 秒...
// I am eating dinner
```
:::

</details>

::: details 3. 实现一个支持过期时间的 localStorage
<details>
<summary>点击查看答案</summary>

```javascript
class ExpireStorage {
  constructor(prefix = 'expire_') {
    this.prefix = prefix
  }

  set(key, value, expire) {
    const data = {
      value,
      expire: expire ? Date.now() + expire : null
    }
    localStorage.setItem(this.prefix + key, JSON.stringify(data))
  }

  get(key) {
    const dataStr = localStorage.getItem(this.prefix + key)
    if (!dataStr) return null

    try {
      const data = JSON.parse(dataStr)

      // 检查是否过期
      if (data.expire && Date.now() > data.expire) {
        this.remove(key)
        return null
      }

      return data.value
    } catch (e) {
      return null
    }
  }

  remove(key) {
    localStorage.removeItem(this.prefix + key)
  }

  // 清理所有过期数据
  clearExpired() {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        this.get(key.replace(this.prefix, ''))
      }
    })
  }
}

// 测试
const storage = new ExpireStorage()
storage.set('token', 'abc123', 5000) // 5秒后过期
console.log(storage.get('token')) // 'abc123'

setTimeout(() => {
  console.log(storage.get('token')) // null
}, 6000)
```
:::

</details>

::: details 4. 实现图片懒加载
<details>
<summary>点击查看答案</summary>

```javascript
// 方式一：Intersection Observer（推荐）
function lazyLoadWithObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.removeAttribute('data-src')
        observer.unobserve(img)
      }
    })
  }, {
    rootMargin: '50px' // 提前 50px 加载
  })

  document.querySelectorAll('img[data-src]').forEach(img => {
    observer.observe(img)
  })
}

// 方式二：滚动事件 + 节流
function lazyLoadWithScroll() {
  const images = document.querySelectorAll('img[data-src]')

  function checkImages() {
    images.forEach(img => {
      if (!img.dataset.src) return

      const rect = img.getBoundingClientRect()
      const inViewport = rect.top < window.innerHeight + 50 && rect.bottom > -50

      if (inViewport) {
        img.src = img.dataset.src
        img.removeAttribute('data-src')
      }
    })
  }

  // 节流
  let ticking = false
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        checkImages()
        ticking = false
      })
      ticking = true
    }
  })

  // 初始检查
  checkImages()
}

// HTML:
// <img data-src="real-image.jpg" src="placeholder.jpg" alt="">
```
:::

</details>

::: details 5. 实现一个模板字符串解析函数
<details>
<summary>点击查看答案</summary>

```javascript
function render(template, data) {
  return template.replace(/\{\{(\w+(\.\w+)*)\}\}/g, (match, key) => {
    // 处理嵌套属性 a.b.c
    const keys = key.split('.')
    let value = data

    for (const k of keys) {
      if (value === null || value === undefined) {
        return ''
      }
      value = value[k]
    }

    return value !== undefined ? value : ''
  })
}

// 支持更复杂的表达式
function renderAdvanced(template, data) {
  const pattern = /\{\{(.+?)\}\}/g

  return template.replace(pattern, (match, expr) => {
    try {
      // 使用 with 语句让表达式可以直接访问 data 属性
      const fn = new Function('data', `with(data) { return ${expr.trim()} }`)
      return fn(data)
    } catch (e) {
      return ''
    }
  })
}

// 测试
const template = '我叫{{name}}，今年{{age}}岁，地址是{{address.city}}'
const data = {
  name: 'Alice',
  age: 25,
  address: { city: 'Beijing' }
}

console.log(render(template, data))
// 我叫Alice，今年25岁，地址是Beijing

// 高级版本支持表达式
const template2 = '{{ name.toUpperCase() }} - {{ age + 1 }}'
console.log(renderAdvanced(template2, data))
// ALICE - 26
```
:::

</details>

::: details 6. 实现一个虚拟 DOM 的 diff 算法（简化版）
<details>
<summary>点击查看答案</summary>

```javascript
// 虚拟 DOM 结构
function h(tag, props, children) {
  return { tag, props: props || {}, children: children || [] }
}

// 创建真实 DOM
function createElement(vnode) {
  if (typeof vnode === 'string') {
    return document.createTextNode(vnode)
  }

  const el = document.createElement(vnode.tag)

  // 设置属性
  for (const [key, value] of Object.entries(vnode.props)) {
    el.setAttribute(key, value)
  }

  // 递归创建子节点
  vnode.children.forEach(child => {
    el.appendChild(createElement(child))
  })

  return el
}

// Diff 算法
function diff(oldVNode, newVNode) {
  const patches = []

  // 节点类型不同，直接替换
  if (oldVNode.tag !== newVNode.tag) {
    patches.push({ type: 'REPLACE', newVNode })
    return patches
  }

  // 比较属性
  const propsPatches = diffProps(oldVNode.props, newVNode.props)
  if (Object.keys(propsPatches).length > 0) {
    patches.push({ type: 'PROPS', props: propsPatches })
  }

  // 比较子节点
  const childPatches = diffChildren(oldVNode.children, newVNode.children)
  if (childPatches.length > 0) {
    patches.push({ type: 'CHILDREN', children: childPatches })
  }

  return patches
}

function diffProps(oldProps, newProps) {
  const patches = {}

  // 新增或修改的属性
  for (const [key, value] of Object.entries(newProps)) {
    if (oldProps[key] !== value) {
      patches[key] = value
    }
  }

  // 删除的属性
  for (const key of Object.keys(oldProps)) {
    if (!(key in newProps)) {
      patches[key] = null
    }
  }

  return patches
}

function diffChildren(oldChildren, newChildren) {
  const patches = []
  const maxLen = Math.max(oldChildren.length, newChildren.length)

  for (let i = 0; i < maxLen; i++) {
    if (!oldChildren[i]) {
      patches.push({ type: 'ADD', index: i, node: newChildren[i] })
    } else if (!newChildren[i]) {
      patches.push({ type: 'REMOVE', index: i })
    } else {
      patches.push({ type: 'UPDATE', index: i, patches: diff(oldChildren[i], newChildren[i]) })
    }
  }

  return patches
}

// 应用补丁
function patch(el, patches) {
  patches.forEach(p => {
    switch (p.type) {
      case 'REPLACE':
        el.parentNode.replaceChild(createElement(p.newVNode), el)
        break
      case 'PROPS':
        for (const [key, value] of Object.entries(p.props)) {
          if (value === null) {
            el.removeAttribute(key)
          } else {
            el.setAttribute(key, value)
          }
        }
        break
      case 'CHILDREN':
        p.children.forEach(cp => {
          if (cp.type === 'ADD') {
            el.appendChild(createElement(cp.node))
          } else if (cp.type === 'REMOVE') {
            el.removeChild(el.childNodes[cp.index])
          } else if (cp.type === 'UPDATE') {
            patch(el.childNodes[cp.index], cp.patches)
          }
        })
        break
    }
  })
}

// 测试
const oldVNode = h('div', { class: 'container' }, [
  h('p', {}, ['Hello'])
])

const newVNode = h('div', { class: 'wrapper', id: 'app' }, [
  h('p', {}, ['Hello World']),
  h('span', {}, ['New Node'])
])

const patches = diff(oldVNode, newVNode)
console.log(patches)
```
:::

</details>

## 其他高频题

::: details compose 函数组合
```javascript
// 从右到左执行
function compose(...fns) {
  if (fns.length === 0) return arg => arg
  if (fns.length === 1) return fns[0]

  return fns.reduce((a, b) => (...args) => a(b(...args)))
}

// 从左到右执行 (pipe)
function pipe(...fns) {
  if (fns.length === 0) return arg => arg
  if (fns.length === 1) return fns[0]

  return fns.reduce((a, b) => (...args) => b(a(...args)))
}

// 异步 compose
function composeAsync(...fns) {
  return function(arg) {
    return fns.reduceRight((promise, fn) =>
      promise.then(fn), Promise.resolve(arg)
    )
  }
}

// 测试
const add1 = x => x + 1
const mul2 = x => x * 2
const div3 = x => x / 3

console.log(compose(div3, mul2, add1)(5)) // (5+1)*2/3 = 4
console.log(pipe(add1, mul2, div3)(5))    // (5+1)*2/3 = 4
```
:::

::: details JSON.stringify 实现
```javascript
function jsonStringify(obj) {
  const type = typeof obj

  // 处理基本类型
  if (type !== 'object' || obj === null) {
    if (type === 'string') return `"${obj}"`
    if (type === 'undefined' || type === 'function' || type === 'symbol') return undefined
    if (Number.isNaN(obj) || obj === Infinity || obj === -Infinity) return 'null'
    return String(obj)
  }

  // 处理 Date
  if (obj instanceof Date) {
    return `"${obj.toISOString()}"`
  }

  // 处理数组
  if (Array.isArray(obj)) {
    const items = obj.map(item => {
      const val = jsonStringify(item)
      return val === undefined ? 'null' : val
    })
    return `[${items.join(',')}]`
  }

  // 处理对象
  const pairs = []
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const val = jsonStringify(obj[key])
      if (val !== undefined) {
        pairs.push(`"${key}":${val}`)
      }
    }
  }
  return `{${pairs.join(',')}}`
}

// 测试
console.log(jsonStringify({ a: 1, b: [1, 2, 3], c: { d: 'hello' } }))
// {"a":1,"b":[1,2,3],"c":{"d":"hello"}}
```
:::

::: details 大数相加
```javascript
function addBigNumbers(a, b) {
  // 补齐长度
  const maxLen = Math.max(a.length, b.length)
  a = a.padStart(maxLen, '0')
  b = b.padStart(maxLen, '0')

  let result = ''
  let carry = 0 // 进位

  // 从低位到高位相加
  for (let i = maxLen - 1; i >= 0; i--) {
    const sum = parseInt(a[i]) + parseInt(b[i]) + carry
    carry = Math.floor(sum / 10)
    result = (sum % 10) + result
  }

  // 处理最高位进位
  if (carry) {
    result = carry + result
  }

  return result
}

// 测试
console.log(addBigNumbers('9999999999999999999', '1'))
// "10000000000000000000"
```
:::

::: details 数组转树形结构
```javascript
function arrayToTree(arr, parentId = null) {
  return arr
    .filter(item => item.parentId === parentId)
    .map(item => ({
      ...item,
      children: arrayToTree(arr, item.id)
    }))
}

// 非递归版本（更高效）
function arrayToTreeIterative(arr) {
  const map = {}
  const result = []

  // 创建映射
  arr.forEach(item => {
    map[item.id] = { ...item, children: [] }
  })

  // 构建树
  arr.forEach(item => {
    if (item.parentId === null) {
      result.push(map[item.id])
    } else {
      map[item.parentId]?.children.push(map[item.id])
    }
  })

  return result
}

// 测试
const arr = [
  { id: 1, name: '部门1', parentId: null },
  { id: 2, name: '部门2', parentId: 1 },
  { id: 3, name: '部门3', parentId: 1 },
  { id: 4, name: '部门4', parentId: 2 },
]
console.log(arrayToTree(arr))
```
:::

::: details 树形结构转数组
```javascript
function treeToArray(tree) {
  const result = []

  function traverse(nodes, parentId = null) {
    nodes.forEach(node => {
      const { children, ...rest } = node
      result.push({ ...rest, parentId })

      if (children && children.length) {
        traverse(children, node.id)
      }
    })
  }

  traverse(tree)
  return result
}

// BFS 版本
function treeToArrayBFS(tree) {
  const result = []
  const queue = tree.map(node => ({ node, parentId: null }))

  while (queue.length) {
    const { node, parentId } = queue.shift()
    const { children, ...rest } = node

    result.push({ ...rest, parentId })

    if (children) {
      children.forEach(child => {
        queue.push({ node: child, parentId: node.id })
      })
    }
  }

  return result
}
```
:::

::: details 洗牌算法
```javascript
// Fisher-Yates 洗牌算法
function shuffle(arr) {
  const result = [...arr]

  for (let i = result.length - 1; i > 0; i--) {
    // 生成 0 到 i 之间的随机整数
    const j = Math.floor(Math.random() * (i + 1))
    // 交换
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

// 验证均匀性
function testShuffle() {
  const count = {}
  const arr = [1, 2, 3]

  for (let i = 0; i < 100000; i++) {
    const key = shuffle(arr).join(',')
    count[key] = (count[key] || 0) + 1
  }

  console.log(count)
  // 每种排列约出现 16666 次
}
```
:::

::: details 红绿灯问题
```javascript
// 实现红绿灯：红灯3秒，绿灯2秒，黄灯1秒，循环执行
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function trafficLight() {
  while (true) {
    console.log('红灯亮')
    await sleep(3000)

    console.log('绿灯亮')
    await sleep(2000)

    console.log('黄灯亮')
    await sleep(1000)
  }
}

// Promise 实现
function trafficLightPromise() {
  const light = (color, duration) => {
    return new Promise(resolve => {
      console.log(color + '灯亮')
      setTimeout(resolve, duration)
    })
  }

  const step = () => {
    light('红', 3000)
      .then(() => light('绿', 2000))
      .then(() => light('黄', 1000))
      .then(step)
  }

  step()
}
```
:::

::: details 实现 Object.assign
```javascript
function myAssign(target, ...sources) {
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object')
  }

  const to = Object(target)

  sources.forEach(source => {
    if (source != null) {
      // 复制可枚举属性
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          to[key] = source[key]
        }
      }

      // 复制 Symbol 属性
      Object.getOwnPropertySymbols(source).forEach(sym => {
        if (Object.prototype.propertyIsEnumerable.call(source, sym)) {
          to[sym] = source[sym]
        }
      })
    }
  })

  return to
}

// 测试
const target = { a: 1 }
const result = myAssign(target, { b: 2 }, { c: 3 })
console.log(result) // { a: 1, b: 2, c: 3 }
```
:::

::: details 实现 sleep 函数
```javascript
// Promise 版本
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// async/await 使用
async function demo() {
  console.log('开始')
  await sleep(1000)
  console.log('1秒后')
}

// Generator 版本
function* sleepGenerator(ms) {
  yield new Promise(resolve => setTimeout(resolve, ms))
}

// 可取消的 sleep
function sleepCancellable(ms) {
  let timeoutId
  const promise = new Promise((resolve, reject) => {
    timeoutId = setTimeout(resolve, ms)
  })

  promise.cancel = () => {
    clearTimeout(timeoutId)
  }

  return promise
}
```
:::

::: details 实现字符串 repeat
```javascript
function repeat(str, count) {
  if (count < 0 || count === Infinity) {
    throw new RangeError('Invalid count value')
  }

  count = Math.floor(count)
  if (count === 0 || str === '') return ''

  // 二分法优化
  let result = ''
  while (count > 0) {
    if (count & 1) {
      result += str
    }
    count >>>= 1
    str += str
  }
  return result
}

// 测试
console.log(repeat('ab', 3)) // 'ababab'
```
:::

::: details URL 参数解析
```javascript
function parseQueryString(url) {
  const queryString = url.split('?')[1]
  if (!queryString) return {}

  const params = {}

  queryString.split('&').forEach(pair => {
    let [key, value] = pair.split('=')
    key = decodeURIComponent(key)
    value = value ? decodeURIComponent(value) : ''

    // 处理数组参数 key[]=1&key[]=2
    if (key.endsWith('[]')) {
      key = key.slice(0, -2)
      params[key] = params[key] || []
      params[key].push(value)
    } else if (params[key]) {
      // 同名参数转为数组
      params[key] = [].concat(params[key], value)
    } else {
      params[key] = value
    }
  })

  return params
}

// 对象转查询字符串
function stringifyQueryString(obj) {
  const pairs = []

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      value.forEach(v => {
        pairs.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(v)}`)
      })
    } else if (value !== undefined && value !== null) {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    }
  }

  return pairs.join('&')
}

// 测试
const url = 'https://example.com?name=test&age=20&tags[]=a&tags[]=b'
console.log(parseQueryString(url))
// { name: 'test', age: '20', tags: ['a', 'b'] }
```
:::

## 数据结构实现

::: details 链表操作
```javascript
// 链表节点定义
class ListNode {
  constructor(val, next = null) {
    this.val = val
    this.next = next
  }
}

// 从数组创建链表
// 时间复杂度: O(n)，空间复杂度: O(n)
function createLinkedList(arr) {
  if (!arr || arr.length === 0) return null

  const head = new ListNode(arr[0])
  let current = head

  for (let i = 1; i < arr.length; i++) {
    current.next = new ListNode(arr[i])
    current = current.next
  }

  return head
}

// 链表转数组
// 时间复杂度: O(n)，空间复杂度: O(n)
function linkedListToArray(head) {
  const result = []
  let current = head

  // 防止循环链表导致死循环
  const visited = new Set()

  while (current && !visited.has(current)) {
    visited.add(current)
    result.push(current.val)
    current = current.next
  }

  return result
}

// 反转链表（迭代）
// 时间复杂度: O(n)，空间复杂度: O(1)
function reverseList(head) {
  let prev = null
  let current = head

  while (current) {
    const next = current.next
    current.next = prev
    prev = current
    current = next
  }

  return prev
}

// 反转链表（递归）
// 时间复杂度: O(n)，空间复杂度: O(n) - 递归栈
function reverseListRecursive(head) {
  if (!head || !head.next) return head

  const newHead = reverseListRecursive(head.next)
  head.next.next = head
  head.next = null

  return newHead
}

// 检测环形链表
// 时间复杂度: O(n)，空间复杂度: O(1)
function hasCycle(head) {
  if (!head || !head.next) return false

  let slow = head
  let fast = head

  while (fast && fast.next) {
    slow = slow.next
    fast = fast.next.next

    if (slow === fast) return true
  }

  return false
}

// 找到环的入口
// 时间复杂度: O(n)，空间复杂度: O(1)
function detectCycle(head) {
  if (!head || !head.next) return null

  let slow = head
  let fast = head

  // 找到相遇点
  while (fast && fast.next) {
    slow = slow.next
    fast = fast.next.next

    if (slow === fast) {
      // 从头节点和相遇点同时出发
      let ptr = head
      while (ptr !== slow) {
        ptr = ptr.next
        slow = slow.next
      }
      return ptr
    }
  }

  return null
}

// 合并两个有序链表
// 时间复杂度: O(n+m)，空间复杂度: O(1)
function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0)
  let current = dummy

  while (l1 && l2) {
    if (l1.val <= l2.val) {
      current.next = l1
      l1 = l1.next
    } else {
      current.next = l2
      l2 = l2.next
    }
    current = current.next
  }

  current.next = l1 || l2
  return dummy.next
}

// 删除链表倒数第 N 个节点
// 时间复杂度: O(n)，空间复杂度: O(1)
function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head)
  let fast = dummy
  let slow = dummy

  // fast 先走 n+1 步
  for (let i = 0; i <= n; i++) {
    fast = fast.next
  }

  // 同时移动
  while (fast) {
    fast = fast.next
    slow = slow.next
  }

  slow.next = slow.next.next
  return dummy.next
}

// 找到链表中间节点
// 时间复杂度: O(n)，空间复杂度: O(1)
function middleNode(head) {
  let slow = head
  let fast = head

  while (fast && fast.next) {
    slow = slow.next
    fast = fast.next.next
  }

  return slow
}

// 测试
const list = createLinkedList([1, 2, 3, 4, 5])
console.log(linkedListToArray(reverseList(list))) // [5, 4, 3, 2, 1]
```
:::

::: details 二叉树操作
```javascript
// 二叉树节点定义
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val
    this.left = left
    this.right = right
  }
}

// 从数组构建二叉树（层序）
// 时间复杂度: O(n)，空间复杂度: O(n)
function buildTree(arr) {
  if (!arr || arr.length === 0 || arr[0] === null) return null

  const root = new TreeNode(arr[0])
  const queue = [root]
  let i = 1

  while (queue.length && i < arr.length) {
    const node = queue.shift()

    if (i < arr.length && arr[i] !== null) {
      node.left = new TreeNode(arr[i])
      queue.push(node.left)
    }
    i++

    if (i < arr.length && arr[i] !== null) {
      node.right = new TreeNode(arr[i])
      queue.push(node.right)
    }
    i++
  }

  return root
}

// 前序遍历（递归）
// 时间复杂度: O(n)，空间复杂度: O(h) h为树高
function preorderTraversal(root) {
  const result = []

  function traverse(node) {
    if (!node) return
    result.push(node.val)  // 根
    traverse(node.left)     // 左
    traverse(node.right)    // 右
  }

  traverse(root)
  return result
}

// 前序遍历（迭代）
// 时间复杂度: O(n)，空间复杂度: O(h)
function preorderIterative(root) {
  if (!root) return []

  const result = []
  const stack = [root]

  while (stack.length) {
    const node = stack.pop()
    result.push(node.val)

    // 先右后左入栈，保证左子树先处理
    if (node.right) stack.push(node.right)
    if (node.left) stack.push(node.left)
  }

  return result
}

// 中序遍历（递归）
// 时间复杂度: O(n)，空间复杂度: O(h)
function inorderTraversal(root) {
  const result = []

  function traverse(node) {
    if (!node) return
    traverse(node.left)     // 左
    result.push(node.val)   // 根
    traverse(node.right)    // 右
  }

  traverse(root)
  return result
}

// 中序遍历（迭代）
// 时间复杂度: O(n)，空间复杂度: O(h)
function inorderIterative(root) {
  const result = []
  const stack = []
  let current = root

  while (current || stack.length) {
    // 一直向左走
    while (current) {
      stack.push(current)
      current = current.left
    }

    current = stack.pop()
    result.push(current.val)
    current = current.right
  }

  return result
}

// 后序遍历（递归）
// 时间复杂度: O(n)，空间复杂度: O(h)
function postorderTraversal(root) {
  const result = []

  function traverse(node) {
    if (!node) return
    traverse(node.left)     // 左
    traverse(node.right)    // 右
    result.push(node.val)   // 根
  }

  traverse(root)
  return result
}

// 后序遍历（迭代）
// 时间复杂度: O(n)，空间复杂度: O(h)
function postorderIterative(root) {
  if (!root) return []

  const result = []
  const stack = [root]

  while (stack.length) {
    const node = stack.pop()
    result.unshift(node.val)  // 从头部插入

    if (node.left) stack.push(node.left)
    if (node.right) stack.push(node.right)
  }

  return result
}

// 层序遍历
// 时间复杂度: O(n)，空间复杂度: O(n)
function levelOrder(root) {
  if (!root) return []

  const result = []
  const queue = [root]

  while (queue.length) {
    const levelSize = queue.length
    const currentLevel = []

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()
      currentLevel.push(node.val)

      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }

    result.push(currentLevel)
  }

  return result
}

// 二叉树最大深度
// 时间复杂度: O(n)，空间复杂度: O(h)
function maxDepth(root) {
  if (!root) return 0
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right))
}

// 判断是否对称二叉树
// 时间复杂度: O(n)，空间复杂度: O(h)
function isSymmetric(root) {
  if (!root) return true

  function isMirror(left, right) {
    if (!left && !right) return true
    if (!left || !right) return false

    return left.val === right.val &&
           isMirror(left.left, right.right) &&
           isMirror(left.right, right.left)
  }

  return isMirror(root.left, root.right)
}

// 路径总和
// 时间复杂度: O(n)，空间复杂度: O(h)
function hasPathSum(root, targetSum) {
  if (!root) return false

  // 叶子节点
  if (!root.left && !root.right) {
    return root.val === targetSum
  }

  const remaining = targetSum - root.val
  return hasPathSum(root.left, remaining) || hasPathSum(root.right, remaining)
}

// 二叉搜索树验证
// 时间复杂度: O(n)，空间复杂度: O(h)
function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true

  if (root.val <= min || root.val >= max) return false

  return isValidBST(root.left, min, root.val) &&
         isValidBST(root.right, root.val, max)
}

// 最近公共祖先
// 时间复杂度: O(n)，空间复杂度: O(h)
function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root

  const left = lowestCommonAncestor(root.left, p, q)
  const right = lowestCommonAncestor(root.right, p, q)

  if (left && right) return root
  return left || right
}

// 测试
const tree = buildTree([1, 2, 3, 4, 5, 6, 7])
console.log(preorderTraversal(tree))  // [1, 2, 4, 5, 3, 6, 7]
console.log(inorderTraversal(tree))   // [4, 2, 5, 1, 6, 3, 7]
console.log(postorderTraversal(tree)) // [4, 5, 2, 6, 7, 3, 1]
console.log(levelOrder(tree))         // [[1], [2, 3], [4, 5, 6, 7]]
```
:::

::: details 图算法
```javascript
// 图的表示 - 邻接表
class Graph {
  constructor() {
    this.adjacencyList = new Map()
  }

  addVertex(vertex) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, [])
    }
  }

  addEdge(v1, v2, directed = false) {
    this.addVertex(v1)
    this.addVertex(v2)

    this.adjacencyList.get(v1).push(v2)
    if (!directed) {
      this.adjacencyList.get(v2).push(v1)
    }
  }

  // 深度优先遍历
  // 时间复杂度: O(V + E)，空间复杂度: O(V)
  dfs(start) {
    const visited = new Set()
    const result = []

    const traverse = (vertex) => {
      if (!vertex || visited.has(vertex)) return

      visited.add(vertex)
      result.push(vertex)

      const neighbors = this.adjacencyList.get(vertex) || []
      for (const neighbor of neighbors) {
        traverse(neighbor)
      }
    }

    traverse(start)
    return result
  }

  // 深度优先遍历（迭代）
  dfsIterative(start) {
    const visited = new Set()
    const result = []
    const stack = [start]

    while (stack.length) {
      const vertex = stack.pop()

      if (visited.has(vertex)) continue

      visited.add(vertex)
      result.push(vertex)

      const neighbors = this.adjacencyList.get(vertex) || []
      // 逆序入栈保证顺序
      for (let i = neighbors.length - 1; i >= 0; i--) {
        if (!visited.has(neighbors[i])) {
          stack.push(neighbors[i])
        }
      }
    }

    return result
  }

  // 广度优先遍历
  // 时间复杂度: O(V + E)，空间复杂度: O(V)
  bfs(start) {
    const visited = new Set([start])
    const result = []
    const queue = [start]

    while (queue.length) {
      const vertex = queue.shift()
      result.push(vertex)

      const neighbors = this.adjacencyList.get(vertex) || []
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push(neighbor)
        }
      }
    }

    return result
  }

  // 检测环（有向图）
  // 时间复杂度: O(V + E)
  hasCycle() {
    const visited = new Set()
    const recursionStack = new Set()

    const dfs = (vertex) => {
      visited.add(vertex)
      recursionStack.add(vertex)

      const neighbors = this.adjacencyList.get(vertex) || []
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true
        } else if (recursionStack.has(neighbor)) {
          return true  // 回边，存在环
        }
      }

      recursionStack.delete(vertex)
      return false
    }

    for (const vertex of this.adjacencyList.keys()) {
      if (!visited.has(vertex)) {
        if (dfs(vertex)) return true
      }
    }

    return false
  }

  // 拓扑排序（Kahn's Algorithm）
  // 时间复杂度: O(V + E)，空间复杂度: O(V)
  topologicalSort() {
    const inDegree = new Map()
    const result = []
    const queue = []

    // 初始化入度
    for (const vertex of this.adjacencyList.keys()) {
      inDegree.set(vertex, 0)
    }

    // 计算入度
    for (const [vertex, neighbors] of this.adjacencyList) {
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) + 1)
      }
    }

    // 入度为 0 的节点入队
    for (const [vertex, degree] of inDegree) {
      if (degree === 0) queue.push(vertex)
    }

    while (queue.length) {
      const vertex = queue.shift()
      result.push(vertex)

      const neighbors = this.adjacencyList.get(vertex) || []
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1)
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor)
        }
      }
    }

    // 检测是否有环
    return result.length === this.adjacencyList.size ? result : []
  }
}

// 最短路径 - Dijkstra 算法
// 时间复杂度: O((V + E) log V)，空间复杂度: O(V)
function dijkstra(graph, start) {
  const distances = new Map()
  const visited = new Set()
  const pq = new MinPriorityQueue()  // 需要优先队列实现

  // 初始化
  for (const vertex of graph.adjacencyList.keys()) {
    distances.set(vertex, Infinity)
  }
  distances.set(start, 0)
  pq.enqueue(start, 0)

  while (!pq.isEmpty()) {
    const { element: current } = pq.dequeue()

    if (visited.has(current)) continue
    visited.add(current)

    const neighbors = graph.adjacencyList.get(current) || []
    for (const { node, weight } of neighbors) {
      const newDist = distances.get(current) + weight
      if (newDist < distances.get(node)) {
        distances.set(node, newDist)
        pq.enqueue(node, newDist)
      }
    }
  }

  return distances
}

// 简单优先队列实现
class MinPriorityQueue {
  constructor() {
    this.heap = []
  }

  enqueue(element, priority) {
    this.heap.push({ element, priority })
    this.bubbleUp(this.heap.length - 1)
  }

  dequeue() {
    if (this.heap.length === 0) return null

    const min = this.heap[0]
    const end = this.heap.pop()

    if (this.heap.length > 0) {
      this.heap[0] = end
      this.bubbleDown(0)
    }

    return min
  }

  isEmpty() {
    return this.heap.length === 0
  }

  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2)
      if (this.heap[index].priority >= this.heap[parentIndex].priority) break

      [this.heap[index], this.heap[parentIndex]] =
        [this.heap[parentIndex], this.heap[index]]
      index = parentIndex
    }
  }

  bubbleDown(index) {
    const length = this.heap.length

    while (true) {
      const leftChild = 2 * index + 1
      const rightChild = 2 * index + 2
      let smallest = index

      if (leftChild < length &&
          this.heap[leftChild].priority < this.heap[smallest].priority) {
        smallest = leftChild
      }

      if (rightChild < length &&
          this.heap[rightChild].priority < this.heap[smallest].priority) {
        smallest = rightChild
      }

      if (smallest === index) break

      [this.heap[index], this.heap[smallest]] =
        [this.heap[smallest], this.heap[index]]
      index = smallest
    }
  }
}

// 测试
const graph = new Graph()
graph.addEdge('A', 'B')
graph.addEdge('A', 'C')
graph.addEdge('B', 'D')
graph.addEdge('C', 'E')
graph.addEdge('D', 'E')
graph.addEdge('D', 'F')
graph.addEdge('E', 'F')

console.log(graph.dfs('A'))  // ['A', 'B', 'D', 'E', 'C', 'F']
console.log(graph.bfs('A'))  // ['A', 'B', 'C', 'D', 'E', 'F']
```
:::

## Object 方法实现

::: details Object.freeze / seal / preventExtensions
```javascript
// Object.freeze 实现
// 冻结对象：不能添加、删除、修改属性
function myFreeze(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 获取所有属性（包括 Symbol）
  const props = Object.getOwnPropertyNames(obj)
    .concat(Object.getOwnPropertySymbols(obj))

  props.forEach(prop => {
    const descriptor = Object.getOwnPropertyDescriptor(obj, prop)

    // 数据属性：设为不可写、不可配置
    if (descriptor.writable !== undefined) {
      Object.defineProperty(obj, prop, {
        writable: false,
        configurable: false
      })
    } else {
      // 访问器属性：只设为不可配置
      Object.defineProperty(obj, prop, {
        configurable: false
      })
    }
  })

  // 阻止添加新属性
  Object.preventExtensions(obj)

  return obj
}

// 深度冻结
function deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 冻结自身
  Object.freeze(obj)

  // 递归冻结属性
  Object.getOwnPropertyNames(obj).forEach(prop => {
    const value = obj[prop]
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value)
    }
  })

  return obj
}

// Object.seal 实现
// 密封对象：不能添加、删除属性，但可以修改现有属性值
function mySeal(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  const props = Object.getOwnPropertyNames(obj)
    .concat(Object.getOwnPropertySymbols(obj))

  props.forEach(prop => {
    Object.defineProperty(obj, prop, {
      configurable: false
    })
  })

  Object.preventExtensions(obj)

  return obj
}

// Object.preventExtensions 实现原理
// 阻止添加新属性（使用 Proxy 模拟）
function myPreventExtensions(obj) {
  return new Proxy(obj, {
    defineProperty(target, prop, descriptor) {
      if (!(prop in target)) {
        throw new TypeError('Cannot add property, object is not extensible')
      }
      return Reflect.defineProperty(target, prop, descriptor)
    },
    set(target, prop, value) {
      if (!(prop in target)) {
        throw new TypeError('Cannot add property, object is not extensible')
      }
      return Reflect.set(target, prop, value)
    }
  })
}

// 测试
const obj1 = { a: 1, b: { c: 2 } }
myFreeze(obj1)
obj1.a = 100  // 静默失败（严格模式会报错）
console.log(obj1.a)  // 1
obj1.b.c = 200  // 嵌套对象可修改
console.log(obj1.b.c)  // 200

const obj2 = { a: 1, b: { c: 2 } }
deepFreeze(obj2)
obj2.b.c = 200  // 静默失败
console.log(obj2.b.c)  // 2
```
:::

::: details 对象方法对比
| 方法 | 添加属性 | 删除属性 | 修改属性 | 修改描述符 |
|------|---------|---------|---------|-----------|
| `Object.preventExtensions` | ❌ | ✅ | ✅ | ✅ |
| `Object.seal` | ❌ | ❌ | ✅ | ❌ |
| `Object.freeze` | ❌ | ❌ | ❌ | ❌ |

```javascript
// 检测方法
Object.isExtensible(obj)  // 是否可扩展
Object.isSealed(obj)      // 是否密封
Object.isFrozen(obj)      // 是否冻结

// 关系：frozen ⊆ sealed ⊆ non-extensible
// 冻结的对象一定是密封的，密封的对象一定是不可扩展的
```
:::

## 复杂度分析总结

::: details 常见手写题复杂度
| 实现 | 时间复杂度 | 空间复杂度 | 说明 |
|------|-----------|-----------|------|
| 防抖/节流 | O(1) | O(1) | 闭包存储定时器 |
| 深拷贝 | O(n) | O(n) | n 为属性总数 |
| call/apply/bind | O(1) | O(1) | 常数操作 |
| Promise | O(1) | O(n) | n 为回调数量 |
| new 操作符 | O(1) | O(1) | - |
| instanceof | O(n) | O(1) | n 为原型链长度 |
| 柯里化 | O(n) | O(n) | n 为参数数量 |
| 数组扁平化 | O(n) | O(n) | n 为元素总数 |
| 数组去重（Set） | O(n) | O(n) | - |
| 数组去重（双循环） | O(n²) | O(n) | - |
| LRU 缓存（Map） | O(1) | O(n) | get/put 均为 O(1) |
| LRU 缓存（链表） | O(1) | O(n) | 更优的时间常数 |
:::

::: details 数据结构操作复杂度
| 操作 | 数组 | 链表 | 二叉搜索树 | 哈希表 |
|------|-----|------|-----------|-------|
| 访问 | O(1) | O(n) | O(log n) | O(1) |
| 搜索 | O(n) | O(n) | O(log n) | O(1) |
| 插入 | O(n) | O(1) | O(log n) | O(1) |
| 删除 | O(n) | O(1) | O(log n) | O(1) |
:::

## 边界情况处理

::: details 类型检测与防御性编程
```javascript
// 完整的类型检测
function getType(value) {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'

  const type = typeof value
  if (type !== 'object') return type

  // 详细对象类型
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}

// 安全的属性访问
function safeGet(obj, path, defaultValue = undefined) {
  if (obj == null) return defaultValue

  const keys = Array.isArray(path) ? path : path.split('.')
  let result = obj

  for (const key of keys) {
    if (result == null) return defaultValue
    result = result[key]
  }

  return result === undefined ? defaultValue : result
}

// 测试
console.log(safeGet({ a: { b: { c: 1 } } }, 'a.b.c'))  // 1
console.log(safeGet(null, 'a.b', 'default'))           // 'default'
console.log(safeGet({ a: 1 }, 'a.b.c', 'default'))     // 'default'
```
:::

::: details 常见边界情况清单
```javascript
// 1. null 和 undefined
function handleNullUndefined(value) {
  // 区分 null 和 undefined
  if (value === null) {
    return 'null'
  }
  if (value === undefined) {
    return 'undefined'
  }

  // 同时检测
  if (value == null) {  // null 或 undefined
    return 'nullish'
  }
}

// 2. NaN 检测
function isReallyNaN(value) {
  // 只有 NaN 不等于自身
  return value !== value
  // 或使用 Number.isNaN（推荐）
  // return Number.isNaN(value)
}

// 3. 数组空值
function handleSparseArray(arr) {
  // 稀疏数组
  const sparse = [1, , 3]  // [1, empty, 3]

  // forEach 会跳过空位
  sparse.forEach(item => console.log(item))  // 1, 3

  // map 保留空位
  const mapped = sparse.map(x => x * 2)  // [2, empty, 6]

  // 安全遍历
  for (let i = 0; i < arr.length; i++) {
    if (i in arr) {  // 检测是否有值
      console.log(arr[i])
    }
  }
}

// 4. 循环引用检测
function hasCircular(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== 'object') {
    return false
  }

  if (seen.has(obj)) {
    return true
  }

  seen.add(obj)

  for (const value of Object.values(obj)) {
    if (hasCircular(value, seen)) {
      return true
    }
  }

  return false
}

// 5. 负零检测
function isNegativeZero(value) {
  return value === 0 && 1 / value === -Infinity
}

// 6. 大数精度
function safeAdd(a, b) {
  // Number.MAX_SAFE_INTEGER: 9007199254740991
  if (Math.abs(a) > Number.MAX_SAFE_INTEGER ||
      Math.abs(b) > Number.MAX_SAFE_INTEGER) {
    return BigInt(a) + BigInt(b)
  }
  return a + b
}

// 7. 浮点数比较
function floatEqual(a, b, epsilon = Number.EPSILON) {
  return Math.abs(a - b) < epsilon
}

// 测试
console.log(0.1 + 0.2 === 0.3)           // false
console.log(floatEqual(0.1 + 0.2, 0.3))  // true
```
:::

::: details 防御性克隆
```javascript
// 处理各种边界情况的深拷贝
function robustDeepClone(obj, map = new WeakMap()) {
  // 1. 处理原始类型和 null
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 2. 处理循环引用
  if (map.has(obj)) {
    return map.get(obj)
  }

  // 3. 处理特殊对象
  const type = Object.prototype.toString.call(obj)

  switch (type) {
    case '[object Date]':
      return new Date(obj.getTime())

    case '[object RegExp]':
      return new RegExp(obj.source, obj.flags)

    case '[object Map]': {
      const cloneMap = new Map()
      map.set(obj, cloneMap)
      obj.forEach((value, key) => {
        cloneMap.set(
          robustDeepClone(key, map),
          robustDeepClone(value, map)
        )
      })
      return cloneMap
    }

    case '[object Set]': {
      const cloneSet = new Set()
      map.set(obj, cloneSet)
      obj.forEach(value => {
        cloneSet.add(robustDeepClone(value, map))
      })
      return cloneSet
    }

    case '[object ArrayBuffer]':
      return obj.slice(0)

    case '[object DataView]':
      return new DataView(obj.buffer.slice(0))

    // TypedArray
    case '[object Int8Array]':
    case '[object Uint8Array]':
    case '[object Uint8ClampedArray]':
    case '[object Int16Array]':
    case '[object Uint16Array]':
    case '[object Int32Array]':
    case '[object Uint32Array]':
    case '[object Float32Array]':
    case '[object Float64Array]':
    case '[object BigInt64Array]':
    case '[object BigUint64Array]':
      return new obj.constructor(obj)

    case '[object Error]':
      return new obj.constructor(obj.message)

    default: {
      // 4. 处理普通对象和数组
      const clone = Array.isArray(obj)
        ? []
        : Object.create(Object.getPrototypeOf(obj))

      map.set(obj, clone)

      // 5. 复制所有属性（包括 Symbol 和不可枚举）
      const allKeys = [
        ...Object.getOwnPropertyNames(obj),
        ...Object.getOwnPropertySymbols(obj)
      ]

      for (const key of allKeys) {
        const descriptor = Object.getOwnPropertyDescriptor(obj, key)

        if (descriptor.value !== undefined) {
          descriptor.value = robustDeepClone(descriptor.value, map)
        }

        Object.defineProperty(clone, key, descriptor)
      }

      return clone
    }
  }
}

// 测试
const complex = {
  date: new Date(),
  regex: /test/gi,
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3]),
  typed: new Int32Array([1, 2, 3]),
  [Symbol('sym')]: 'symbol',
  nested: { a: { b: { c: 1 } } }
}
complex.self = complex  // 循环引用

const cloned = robustDeepClone(complex)
console.log(cloned.date instanceof Date)  // true
console.log(cloned.self === cloned)       // true（正确处理循环引用）
```
:::
