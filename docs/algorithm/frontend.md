# 前端高频算法题

前端面试中经常考察的算法题，主要包括手写实现、数据处理、DOM 操作等场景。

## 数组操作

### 数组去重

```javascript
// 方法1：Set（最简洁）
const unique1 = arr => [...new Set(arr)]

// 方法2：filter + indexOf
const unique2 = arr => arr.filter((item, index) => arr.indexOf(item) === index)

// 方法3：reduce
const unique3 = arr => arr.reduce((acc, cur) => {
  if (!acc.includes(cur)) acc.push(cur)
  return acc
}, [])

// 方法4：Map
function unique4(arr) {
  const map = new Map()
  return arr.filter(item => {
    if (!map.has(item)) {
      map.set(item, true)
      return true
    }
    return false
  })
}

// 方法5：对象去重（适用于基本类型）
function unique5(arr) {
  const obj = {}
  return arr.filter(item => {
    const key = typeof item + item
    if (!obj[key]) {
      obj[key] = true
      return true
    }
    return false
  })
}

// 对象数组去重（根据某个属性）
function uniqueByKey(arr, key) {
  const map = new Map()
  return arr.filter(item => {
    if (!map.has(item[key])) {
      map.set(item[key], true)
      return true
    }
    return false
  })
}

// 使用示例
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 1, name: 'Alice' }
]
uniqueByKey(users, 'id') // [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
```

### 数组扁平化

```javascript
// 方法1：flat（ES2019）
const flatten1 = arr => arr.flat(Infinity)

// 方法2：递归 reduce
const flatten2 = arr => arr.reduce((acc, val) =>
  Array.isArray(val) ? acc.concat(flatten2(val)) : acc.concat(val), []
)

// 方法3：迭代（栈）
function flatten3(arr) {
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

// 方法4：toString（仅适用于数字数组）
const flatten4 = arr => arr.toString().split(',').map(Number)

// 方法5：JSON + 正则
const flatten5 = arr => JSON.parse('[' + JSON.stringify(arr).replace(/\[|\]/g, '') + ']')

// 指定深度扁平化
function flattenDepth(arr, depth = 1) {
  if (depth === 0) return arr.slice()

  return arr.reduce((acc, val) => {
    if (Array.isArray(val)) {
      acc.push(...flattenDepth(val, depth - 1))
    } else {
      acc.push(val)
    }
    return acc
  }, [])
}

// 手写 flat 方法
Array.prototype.myFlat = function(depth = 1) {
  const result = []

  const flatten = (arr, d) => {
    for (const item of arr) {
      if (Array.isArray(item) && d > 0) {
        flatten(item, d - 1)
      } else {
        result.push(item)
      }
    }
  }

  flatten(this, depth)
  return result
}
```

### 数组分块

```javascript
// 将数组分成指定大小的块
function chunk(arr, size) {
  const result = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

// reduce 版本
const chunk2 = (arr, size) => arr.reduce((acc, _, i) => {
  if (i % size === 0) acc.push(arr.slice(i, i + size))
  return acc
}, [])

// 使用示例
chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
```

### 数组交集、并集、差集

```javascript
// 交集
const intersection = (arr1, arr2) => arr1.filter(item => arr2.includes(item))

// 并集
const union = (arr1, arr2) => [...new Set([...arr1, ...arr2])]

// 差集（arr1 中有但 arr2 中没有的）
const difference = (arr1, arr2) => arr1.filter(item => !arr2.includes(item))

// 对称差集（两个数组中独有的元素）
const symmetricDifference = (arr1, arr2) => [
  ...arr1.filter(item => !arr2.includes(item)),
  ...arr2.filter(item => !arr1.includes(item))
]

// 对象数组的交集
function intersectionBy(arr1, arr2, key) {
  const set = new Set(arr2.map(item => item[key]))
  return arr1.filter(item => set.has(item[key]))
}
```

### 数组乱序（洗牌算法）

```javascript
// Fisher-Yates 洗牌算法
function shuffle(arr) {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// 简洁版（不推荐，分布不均匀）
const shuffleSimple = arr => arr.sort(() => Math.random() - 0.5)
```

### 数组最大值/最小值

```javascript
// 方法1：Math.max/min + spread
const max1 = arr => Math.max(...arr)
const min1 = arr => Math.min(...arr)

// 方法2：reduce
const max2 = arr => arr.reduce((a, b) => Math.max(a, b))
const min2 = arr => arr.reduce((a, b) => Math.min(a, b))

// 方法3：apply
const max3 = arr => Math.max.apply(null, arr)

// 获取最大/最小值及其索引
function getMaxWithIndex(arr) {
  let max = arr[0]
  let index = 0
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i]
      index = i
    }
  }
  return { max, index }
}
```

### 数组求和/平均值

```javascript
// 求和
const sum = arr => arr.reduce((a, b) => a + b, 0)

// 平均值
const average = arr => arr.reduce((a, b) => a + b, 0) / arr.length

// 对象数组求和
const sumBy = (arr, key) => arr.reduce((sum, item) => sum + item[key], 0)

// 使用示例
const orders = [{ price: 10 }, { price: 20 }, { price: 30 }]
sumBy(orders, 'price') // 60
```

### 数组分组

```javascript
// 按条件分组
function groupBy(arr, fn) {
  return arr.reduce((groups, item) => {
    const key = typeof fn === 'function' ? fn(item) : item[fn]
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
    return groups
  }, {})
}

// 使用示例
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 25 }
]

groupBy(users, 'age')
// { 25: [{ name: 'Alice', age: 25 }, { name: 'Charlie', age: 25 }], 30: [{ name: 'Bob', age: 30 }] }

groupBy(users, user => user.age >= 28 ? 'senior' : 'junior')
// { junior: [{ name: 'Alice', age: 25 }, { name: 'Charlie', age: 25 }], senior: [{ name: 'Bob', age: 30 }] }
```

### 类数组转数组

```javascript
// 方法1：Array.from
const toArray1 = arrayLike => Array.from(arrayLike)

// 方法2：spread
const toArray2 = arrayLike => [...arrayLike]

// 方法3：slice
const toArray3 = arrayLike => Array.prototype.slice.call(arrayLike)

// 方法4：concat
const toArray4 = arrayLike => Array.prototype.concat.apply([], arrayLike)
```

## 函数处理

### 防抖（Debounce）

防抖：在事件被触发 n 秒后再执行回调，如果在这 n 秒内又被触发，则重新计时。

```javascript
// 基础版本
function debounce(fn, delay) {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

// 立即执行版本
function debounceImmediate(fn, delay, immediate = false) {
  let timer = null

  return function(...args) {
    const callNow = immediate && !timer

    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      if (!immediate) fn.apply(this, args)
    }, delay)

    if (callNow) fn.apply(this, args)
  }
}

// 完整版本（支持取消和立即执行）
function debounceComplete(fn, delay, options = {}) {
  let timer = null
  let result

  const { leading = false, trailing = true, maxWait } = options
  let lastCallTime = 0

  const debounced = function(...args) {
    const now = Date.now()
    const isInvoking = leading && !timer

    clearTimeout(timer)

    // 处理最大等待时间
    if (maxWait !== undefined && now - lastCallTime >= maxWait) {
      result = fn.apply(this, args)
      lastCallTime = now
      return result
    }

    timer = setTimeout(() => {
      timer = null
      if (trailing) {
        result = fn.apply(this, args)
        lastCallTime = Date.now()
      }
    }, delay)

    if (isInvoking) {
      result = fn.apply(this, args)
      lastCallTime = now
    }

    return result
  }

  debounced.cancel = function() {
    clearTimeout(timer)
    timer = null
    lastCallTime = 0
  }

  debounced.flush = function() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return debounced
}

// 使用示例
const handleSearch = debounce((query) => {
  console.log('Searching:', query)
}, 300)

// input.addEventListener('input', (e) => handleSearch(e.target.value))
```

### 节流（Throttle）

节流：规定在一个单位时间内，只能触发一次函数。如果这个单位时间内触发多次函数，只有一次生效。

```javascript
// 时间戳版本（首次立即执行）
function throttleTimestamp(fn, delay) {
  let lastTime = 0

  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

// 定时器版本（首次不执行，最后一次执行）
function throttleTimer(fn, delay) {
  let timer = null

  return function(...args) {
    if (timer) return

    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

// 完整版本（支持首次和最后一次执行配置）
function throttle(fn, delay, options = {}) {
  let timer = null
  let lastTime = 0
  const { leading = true, trailing = true } = options

  return function(...args) {
    const now = Date.now()
    const remaining = delay - (now - lastTime)

    // 首次执行或时间已过
    if (remaining <= 0 || remaining > delay) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      lastTime = now
      if (leading) fn.apply(this, args)
    } else if (!timer && trailing) {
      // 设置定时器，保证最后一次执行
      timer = setTimeout(() => {
        lastTime = leading ? Date.now() : 0
        timer = null
        fn.apply(this, args)
      }, remaining)
    }
  }
}

// 使用 requestAnimationFrame 的节流
function throttleRAF(fn) {
  let ticking = false

  return function(...args) {
    if (ticking) return

    ticking = true
    requestAnimationFrame(() => {
      fn.apply(this, args)
      ticking = false
    })
  }
}

// 使用示例
const handleScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY)
}, 200)

// window.addEventListener('scroll', handleScroll)
```

### 柯里化（Curry）

```javascript
// 基础柯里化
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    }
    return function(...newArgs) {
      return curried.apply(this, args.concat(newArgs))
    }
  }
}

// 支持占位符的柯里化
function curryWithPlaceholder(fn, placeholder = '_') {
  return function curried(...args) {
    // 检查是否有占位符需要填充
    const complete = args.length >= fn.length &&
      !args.slice(0, fn.length).includes(placeholder)

    if (complete) {
      return fn.apply(this, args)
    }

    return function(...newArgs) {
      // 用新参数替换占位符
      const mergedArgs = args.map(arg =>
        arg === placeholder && newArgs.length ? newArgs.shift() : arg
      )
      return curried.apply(this, mergedArgs.concat(newArgs))
    }
  }
}

// 使用示例
const add = (a, b, c) => a + b + c
const curriedAdd = curry(add)

curriedAdd(1)(2)(3)     // 6
curriedAdd(1, 2)(3)     // 6
curriedAdd(1)(2, 3)     // 6
curriedAdd(1, 2, 3)     // 6
```

### 函数组合（Compose）

```javascript
// 从右到左执行
function compose(...fns) {
  if (fns.length === 0) return arg => arg
  if (fns.length === 1) return fns[0]

  return fns.reduce((a, b) => (...args) => a(b(...args)))
}

// 从左到右执行（pipe）
function pipe(...fns) {
  if (fns.length === 0) return arg => arg
  if (fns.length === 1) return fns[0]

  return fns.reduce((a, b) => (...args) => b(a(...args)))
}

// 异步 compose
function composeAsync(...fns) {
  return function(initialValue) {
    return fns.reduceRight(
      (promise, fn) => promise.then(fn),
      Promise.resolve(initialValue)
    )
  }
}

// 使用示例
const add10 = x => x + 10
const multiply2 = x => x * 2
const subtract5 = x => x - 5

const composed = compose(subtract5, multiply2, add10)
composed(5) // (5 + 10) * 2 - 5 = 25

const piped = pipe(add10, multiply2, subtract5)
piped(5) // (5 + 10) * 2 - 5 = 25
```

### 函数记忆化（Memoize）

```javascript
// 基础版本
function memoize(fn) {
  const cache = new Map()

  return function(...args) {
    const key = JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)
    }

    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  }
}

// 支持自定义 key 生成器
function memoizeWithResolver(fn, resolver) {
  const cache = new Map()

  const memoized = function(...args) {
    const key = resolver ? resolver.apply(this, args) : args[0]

    if (cache.has(key)) {
      return cache.get(key)
    }

    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  }

  memoized.cache = cache
  return memoized
}

// 带过期时间的记忆化
function memoizeWithExpiry(fn, ttl) {
  const cache = new Map()

  return function(...args) {
    const key = JSON.stringify(args)
    const cached = cache.get(key)

    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.value
    }

    const result = fn.apply(this, args)
    cache.set(key, { value: result, timestamp: Date.now() })
    return result
  }
}

// 使用示例
const expensiveOperation = memoize((n) => {
  console.log('Computing...')
  return n * n
})

expensiveOperation(5) // Computing... 25
expensiveOperation(5) // 25 (从缓存获取)
```

### 函数执行一次（Once）

```javascript
function once(fn) {
  let called = false
  let result

  return function(...args) {
    if (called) return result

    called = true
    result = fn.apply(this, args)
    return result
  }
}

// 使用示例
const initialize = once(() => {
  console.log('Initialized!')
  return { status: 'ready' }
})

initialize() // Initialized! { status: 'ready' }
initialize() // { status: 'ready' } (不再执行函数)
```

### 函数重试

```javascript
// 带重试的异步函数
async function retry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

// 指数退避重试
async function retryWithBackoff(fn, retries = 3, baseDelay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === retries - 1) throw error
      const delay = baseDelay * Math.pow(2, i)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

// 使用示例
const fetchData = retry(
  () => fetch('/api/data').then(res => res.json()),
  3,
  1000
)
```

### 偏函数（Partial）

```javascript
function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn.apply(this, [...presetArgs, ...laterArgs])
  }
}

// 支持占位符
function partialWithPlaceholder(fn, ...presetArgs) {
  const placeholder = partialWithPlaceholder.placeholder

  return function(...laterArgs) {
    const args = presetArgs.map(arg =>
      arg === placeholder ? laterArgs.shift() : arg
    )
    return fn.apply(this, [...args, ...laterArgs])
  }
}
partialWithPlaceholder.placeholder = Symbol('_')

// 使用示例
const greet = (greeting, name) => `${greeting}, ${name}!`
const sayHello = partial(greet, 'Hello')
sayHello('World') // "Hello, World!"
```

## 对象操作

### 深拷贝

```javascript
// 基础版本（使用 WeakMap 处理循环引用）
function deepClone(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj
  if (map.has(obj)) return map.get(obj)

  const clone = Array.isArray(obj) ? [] : {}
  map.set(obj, clone)

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], map)
    }
  }
  return clone
}

// 完整版本（处理各种数据类型）
function deepCloneComplete(obj, map = new WeakMap()) {
  // 处理基本类型和 null
  if (obj === null || typeof obj !== 'object') return obj

  // 处理循环引用
  if (map.has(obj)) return map.get(obj)

  // 处理 Date
  if (obj instanceof Date) return new Date(obj.getTime())

  // 处理 RegExp
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags)

  // 处理 Map
  if (obj instanceof Map) {
    const clonedMap = new Map()
    map.set(obj, clonedMap)
    obj.forEach((value, key) => {
      clonedMap.set(deepCloneComplete(key, map), deepCloneComplete(value, map))
    })
    return clonedMap
  }

  // 处理 Set
  if (obj instanceof Set) {
    const clonedSet = new Set()
    map.set(obj, clonedSet)
    obj.forEach(value => {
      clonedSet.add(deepCloneComplete(value, map))
    })
    return clonedSet
  }

  // 处理 ArrayBuffer
  if (obj instanceof ArrayBuffer) {
    return obj.slice(0)
  }

  // 处理 TypedArray
  if (ArrayBuffer.isView(obj)) {
    return new obj.constructor(obj)
  }

  // 处理普通对象和数组
  const clone = Array.isArray(obj) ? [] : Object.create(Object.getPrototypeOf(obj))
  map.set(obj, clone)

  // 处理 Symbol 属性
  const symbolKeys = Object.getOwnPropertySymbols(obj)
  for (const symKey of symbolKeys) {
    clone[symKey] = deepCloneComplete(obj[symKey], map)
  }

  // 处理普通属性
  for (const key of Object.keys(obj)) {
    clone[key] = deepCloneComplete(obj[key], map)
  }

  return clone
}

// 使用 structuredClone（现代浏览器）
const deepCloneModern = obj => structuredClone(obj)

// JSON 方法（有局限性）
const deepCloneJSON = obj => JSON.parse(JSON.stringify(obj))
```

### 浅拷贝

```javascript
// 方法1：spread
const shallowClone1 = obj => ({ ...obj })

// 方法2：Object.assign
const shallowClone2 = obj => Object.assign({}, obj)

// 方法3：Array.from（数组）
const shallowCloneArray = arr => Array.from(arr)
```

### 对象合并

```javascript
// 浅合并
const merge = (...objects) => Object.assign({}, ...objects)

// 深合并
function deepMerge(target, ...sources) {
  if (!sources.length) return target

  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item)
}
```

### 对象扁平化

```javascript
// 将嵌套对象扁平化
function flattenObject(obj, prefix = '', result = {}) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        flattenObject(obj[key], newKey, result)
      } else {
        result[newKey] = obj[key]
      }
    }
  }
  return result
}

// 反扁平化
function unflattenObject(obj) {
  const result = {}

  for (const key in obj) {
    const keys = key.split('.')
    let current = result

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }

    current[keys[keys.length - 1]] = obj[key]
  }

  return result
}

// 使用示例
const nested = { a: { b: { c: 1 } }, d: 2 }
flattenObject(nested) // { 'a.b.c': 1, 'd': 2 }

const flat = { 'a.b.c': 1, 'd': 2 }
unflattenObject(flat) // { a: { b: { c: 1 } }, d: 2 }
```

### 对象路径访问

```javascript
// 获取嵌套属性
function get(obj, path, defaultValue = undefined) {
  const keys = Array.isArray(path) ? path : path.split('.')
  let result = obj

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue
    }
    result = result[key]
  }

  return result === undefined ? defaultValue : result
}

// 设置嵌套属性
function set(obj, path, value) {
  const keys = Array.isArray(path) ? path : path.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }

  current[keys[keys.length - 1]] = value
  return obj
}

// 检查路径是否存在
function has(obj, path) {
  const keys = Array.isArray(path) ? path : path.split('.')
  let current = obj

  for (const key of keys) {
    if (!current || !current.hasOwnProperty(key)) {
      return false
    }
    current = current[key]
  }

  return true
}

// 使用示例
const obj = { a: { b: { c: 1 } } }
get(obj, 'a.b.c')          // 1
get(obj, 'a.b.d', 'default') // 'default'
set(obj, 'a.b.d', 2)        // { a: { b: { c: 1, d: 2 } } }
has(obj, 'a.b.c')          // true
```

### 对象比较

```javascript
// 浅比较
function shallowEqual(obj1, obj2) {
  if (obj1 === obj2) return true
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false
  if (obj1 === null || obj2 === null) return false

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  return keys1.every(key => obj1[key] === obj2[key])
}

// 深比较
function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true
  if (typeof obj1 !== typeof obj2) return false
  if (obj1 === null || obj2 === null) return obj1 === obj2

  if (typeof obj1 !== 'object') return obj1 === obj2

  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  return keys1.every(key => deepEqual(obj1[key], obj2[key]))
}
```

### 对象过滤

```javascript
// 按 key 过滤（pick）
function pick(obj, keys) {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
    return result
  }, {})
}

// 排除指定 key（omit）
function omit(obj, keys) {
  const keysSet = new Set(keys)
  return Object.keys(obj).reduce((result, key) => {
    if (!keysSet.has(key)) {
      result[key] = obj[key]
    }
    return result
  }, {})
}

// 按条件过滤
function filterObject(obj, predicate) {
  return Object.keys(obj).reduce((result, key) => {
    if (predicate(obj[key], key, obj)) {
      result[key] = obj[key]
    }
    return result
  }, {})
}

// 使用示例
const user = { name: 'Alice', age: 25, email: 'alice@example.com' }
pick(user, ['name', 'email']) // { name: 'Alice', email: 'alice@example.com' }
omit(user, ['email'])         // { name: 'Alice', age: 25 }
```

## 缓存实现

### LRU 缓存（Least Recently Used）

```javascript
// 使用 Map 实现
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.cache = new Map()
  }

  get(key) {
    if (!this.cache.has(key)) return -1

    const value = this.cache.get(key)
    // 刷新访问顺序
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    this.cache.set(key, value)

    // 超出容量，删除最久未使用的
    if (this.cache.size > this.capacity) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
  }
}

// 使用双向链表 + 哈希表实现（更高效）
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

  // 将节点移到链表头部
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
    node.next = this.head.next
    node.prev = this.head
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
      const newNode = { key, value, prev: null, next: null }
      this.cache.set(key, newNode)
      this.addToHead(newNode)

      if (this.cache.size > this.capacity) {
        const removed = this.removeTail()
        this.cache.delete(removed.key)
      }
    }
  }
}
```

### LFU 缓存（Least Frequently Used）

```javascript
class LFUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.minFreq = 0
    this.keyToVal = new Map()
    this.keyToFreq = new Map()
    this.freqToKeys = new Map()
  }

  get(key) {
    if (!this.keyToVal.has(key)) return -1

    this.increaseFreq(key)
    return this.keyToVal.get(key)
  }

  put(key, value) {
    if (this.capacity === 0) return

    if (this.keyToVal.has(key)) {
      this.keyToVal.set(key, value)
      this.increaseFreq(key)
      return
    }

    if (this.keyToVal.size >= this.capacity) {
      this.removeMinFreqKey()
    }

    this.keyToVal.set(key, value)
    this.keyToFreq.set(key, 1)

    if (!this.freqToKeys.has(1)) {
      this.freqToKeys.set(1, new Set())
    }
    this.freqToKeys.get(1).add(key)
    this.minFreq = 1
  }

  increaseFreq(key) {
    const freq = this.keyToFreq.get(key)
    this.keyToFreq.set(key, freq + 1)

    // 从原频率集合中移除
    this.freqToKeys.get(freq).delete(key)
    if (this.freqToKeys.get(freq).size === 0) {
      this.freqToKeys.delete(freq)
      if (this.minFreq === freq) {
        this.minFreq++
      }
    }

    // 添加到新频率集合
    if (!this.freqToKeys.has(freq + 1)) {
      this.freqToKeys.set(freq + 1, new Set())
    }
    this.freqToKeys.get(freq + 1).add(key)
  }

  removeMinFreqKey() {
    const keys = this.freqToKeys.get(this.minFreq)
    const oldestKey = keys.values().next().value
    keys.delete(oldestKey)

    if (keys.size === 0) {
      this.freqToKeys.delete(this.minFreq)
    }

    this.keyToVal.delete(oldestKey)
    this.keyToFreq.delete(oldestKey)
  }
}
```

## Promise 实现

### 手写 Promise

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
      const fulfilledTask = () => {
        queueMicrotask(() => {
          try {
            const x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }

      const rejectedTask = () => {
        queueMicrotask(() => {
          try {
            const x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }

      if (this.state === 'fulfilled') {
        fulfilledTask()
      } else if (this.state === 'rejected') {
        rejectedTask()
      } else {
        this.onFulfilledCallbacks.push(fulfilledTask)
        this.onRejectedCallbacks.push(rejectedTask)
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

      if (promises.length === 0) {
        resolve(results)
        return
      }

      promises.forEach((p, index) => {
        MyPromise.resolve(p).then(
          value => {
            results[index] = value
            count++
            if (count === promises.length) {
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
      promises.forEach(p => {
        MyPromise.resolve(p).then(resolve, reject)
      })
    })
  }

  static allSettled(promises) {
    return new MyPromise((resolve) => {
      const results = []
      let count = 0

      if (promises.length === 0) {
        resolve(results)
        return
      }

      promises.forEach((p, index) => {
        MyPromise.resolve(p).then(
          value => {
            results[index] = { status: 'fulfilled', value }
            count++
            if (count === promises.length) resolve(results)
          },
          reason => {
            results[index] = { status: 'rejected', reason }
            count++
            if (count === promises.length) resolve(results)
          }
        )
      })
    })
  }

  static any(promises) {
    return new MyPromise((resolve, reject) => {
      const errors = []
      let count = 0

      if (promises.length === 0) {
        reject(new AggregateError([], 'All promises were rejected'))
        return
      }

      promises.forEach((p, index) => {
        MyPromise.resolve(p).then(
          resolve,
          error => {
            errors[index] = error
            count++
            if (count === promises.length) {
              reject(new AggregateError(errors, 'All promises were rejected'))
            }
          }
        )
      })
    })
  }
}

// 辅助函数：处理 then 返回值
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
    } catch (e) {
      if (called) return
      called = true
      reject(e)
    }
  } else {
    resolve(x)
  }
}
```

### 并发控制

```javascript
// 限制并发数的 Promise 调度器
class Scheduler {
  constructor(limit) {
    this.limit = limit
    this.running = 0
    this.queue = []
  }

  add(promiseCreator) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        promiseCreator,
        resolve,
        reject
      })
      this.run()
    })
  }

  run() {
    while (this.running < this.limit && this.queue.length > 0) {
      const { promiseCreator, resolve, reject } = this.queue.shift()
      this.running++

      promiseCreator()
        .then(resolve, reject)
        .finally(() => {
          this.running--
          this.run()
        })
    }
  }
}

// 使用示例
const scheduler = new Scheduler(2)

const addTask = (time, order) => {
  scheduler.add(() => new Promise(resolve => {
    setTimeout(() => {
      console.log(order)
      resolve()
    }, time)
  }))
}

addTask(1000, '1')
addTask(500, '2')
addTask(300, '3')
addTask(400, '4')
// 输出顺序：2 3 1 4

// 并发请求控制
async function asyncPool(limit, items, iteratorFn) {
  const results = []
  const executing = []

  for (const item of items) {
    const p = Promise.resolve().then(() => iteratorFn(item))
    results.push(p)

    if (limit <= items.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1))
      executing.push(e)

      if (executing.length >= limit) {
        await Promise.race(executing)
      }
    }
  }

  return Promise.all(results)
}
```

### 串行执行 Promise

```javascript
// 方法1：reduce
function runSequentially(promises) {
  return promises.reduce(
    (prev, curr) => prev.then(() => curr()),
    Promise.resolve()
  )
}

// 方法2：async/await
async function runSequentiallyAsync(promiseCreators) {
  const results = []
  for (const creator of promiseCreators) {
    results.push(await creator())
  }
  return results
}

// 方法3：递归
function runSequentiallyRecursive(promises, index = 0, results = []) {
  if (index >= promises.length) {
    return Promise.resolve(results)
  }

  return promises[index]()
    .then(result => {
      results.push(result)
      return runSequentiallyRecursive(promises, index + 1, results)
    })
}
```

## 手写原生方法

### call / apply / bind

```javascript
// 手写 call
Function.prototype.myCall = function(context, ...args) {
  context = context || window
  const fn = Symbol('fn')
  context[fn] = this
  const result = context[fn](...args)
  delete context[fn]
  return result
}

// 手写 apply
Function.prototype.myApply = function(context, args = []) {
  context = context || window
  const fn = Symbol('fn')
  context[fn] = this
  const result = context[fn](...args)
  delete context[fn]
  return result
}

// 手写 bind
Function.prototype.myBind = function(context, ...args) {
  const self = this

  const fBound = function(...innerArgs) {
    // 作为构造函数时，this 指向实例
    return self.apply(
      this instanceof fBound ? this : context,
      [...args, ...innerArgs]
    )
  }

  // 继承原型
  if (this.prototype) {
    fBound.prototype = Object.create(this.prototype)
  }

  return fBound
}
```

### new 操作符

```javascript
function myNew(constructor, ...args) {
  // 创建新对象，继承构造函数原型
  const obj = Object.create(constructor.prototype)
  // 执行构造函数
  const result = constructor.apply(obj, args)
  // 如果构造函数返回对象，则返回该对象
  return result instanceof Object ? result : obj
}

// 使用示例
function Person(name, age) {
  this.name = name
  this.age = age
}

const person = myNew(Person, 'Alice', 25)
```

### instanceof

```javascript
function myInstanceof(obj, constructor) {
  if (obj === null || typeof obj !== 'object') return false

  let proto = Object.getPrototypeOf(obj)

  while (proto !== null) {
    if (proto === constructor.prototype) {
      return true
    }
    proto = Object.getPrototypeOf(proto)
  }

  return false
}
```

### Object.create

```javascript
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
```

### Array 方法

```javascript
// map
Array.prototype.myMap = function(callback, thisArg) {
  const result = []
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      result[i] = callback.call(thisArg, this[i], i, this)
    }
  }
  return result
}

// filter
Array.prototype.myFilter = function(callback, thisArg) {
  const result = []
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      result.push(this[i])
    }
  }
  return result
}

// reduce
Array.prototype.myReduce = function(callback, initialValue) {
  let accumulator = initialValue
  let startIndex = 0

  if (initialValue === undefined) {
    if (this.length === 0) {
      throw new TypeError('Reduce of empty array with no initial value')
    }
    accumulator = this[0]
    startIndex = 1
  }

  for (let i = startIndex; i < this.length; i++) {
    if (i in this) {
      accumulator = callback(accumulator, this[i], i, this)
    }
  }

  return accumulator
}

// forEach
Array.prototype.myForEach = function(callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      callback.call(thisArg, this[i], i, this)
    }
  }
}

// find
Array.prototype.myFind = function(callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      return this[i]
    }
  }
  return undefined
}

// some
Array.prototype.mySome = function(callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      return true
    }
  }
  return false
}

// every
Array.prototype.myEvery = function(callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this && !callback.call(thisArg, this[i], i, this)) {
      return false
    }
  }
  return true
}

// includes
Array.prototype.myIncludes = function(searchElement, fromIndex = 0) {
  const len = this.length
  let start = fromIndex < 0 ? Math.max(len + fromIndex, 0) : fromIndex

  for (let i = start; i < len; i++) {
    if (this[i] === searchElement || (Number.isNaN(this[i]) && Number.isNaN(searchElement))) {
      return true
    }
  }
  return false
}
```

## 事件系统

### EventEmitter

```javascript
class EventEmitter {
  constructor() {
    this.events = new Map()
  }

  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event).push(listener)
    return this
  }

  once(event, listener) {
    const wrapper = (...args) => {
      listener.apply(this, args)
      this.off(event, wrapper)
    }
    wrapper.originalListener = listener
    this.on(event, wrapper)
    return this
  }

  off(event, listener) {
    if (!this.events.has(event)) return this

    if (!listener) {
      this.events.delete(event)
    } else {
      const listeners = this.events.get(event)
      const index = listeners.findIndex(
        l => l === listener || l.originalListener === listener
      )
      if (index !== -1) {
        listeners.splice(index, 1)
      }
      if (listeners.length === 0) {
        this.events.delete(event)
      }
    }
    return this
  }

  emit(event, ...args) {
    if (!this.events.has(event)) return false

    const listeners = this.events.get(event).slice()
    listeners.forEach(listener => listener.apply(this, args))
    return true
  }

  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0
  }

  removeAllListeners(event) {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
    return this
  }
}

// 使用示例
const emitter = new EventEmitter()
emitter.on('data', (data) => console.log('Received:', data))
emitter.once('connect', () => console.log('Connected!'))
emitter.emit('connect')  // Connected!
emitter.emit('connect')  // (nothing)
emitter.emit('data', { id: 1 }) // Received: { id: 1 }
```

### 发布订阅模式

```javascript
class PubSub {
  constructor() {
    this.subscribers = {}
  }

  subscribe(topic, callback) {
    if (!this.subscribers[topic]) {
      this.subscribers[topic] = []
    }
    this.subscribers[topic].push(callback)

    // 返回取消订阅函数
    return () => {
      this.subscribers[topic] = this.subscribers[topic].filter(cb => cb !== callback)
    }
  }

  publish(topic, data) {
    if (!this.subscribers[topic]) return

    this.subscribers[topic].forEach(callback => callback(data))
  }
}
```

## DOM 操作

### 事件委托

```javascript
// 通用事件委托
function delegate(parent, selector, eventType, handler) {
  parent.addEventListener(eventType, (e) => {
    let target = e.target

    while (target && target !== parent) {
      if (target.matches(selector)) {
        handler.call(target, e)
        return
      }
      target = target.parentNode
    }
  })
}

// 使用示例
delegate(document.body, '.btn', 'click', function(e) {
  console.log('Button clicked:', this.textContent)
})
```

### 虚拟 DOM

```javascript
// 创建虚拟 DOM
function createElement(type, props = {}, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.flat().map(child =>
        typeof child === 'object' ? child : createTextElement(child)
      )
    }
  }
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

// 渲染虚拟 DOM
function render(vdom, container) {
  const dom = vdom.type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(vdom.type)

  // 设置属性
  Object.keys(vdom.props)
    .filter(key => key !== 'children')
    .forEach(name => {
      if (name.startsWith('on')) {
        const eventType = name.toLowerCase().substring(2)
        dom.addEventListener(eventType, vdom.props[name])
      } else {
        dom[name] = vdom.props[name]
      }
    })

  // 递归渲染子元素
  vdom.props.children.forEach(child => render(child, dom))

  container.appendChild(dom)
}

// 简单 diff 算法
function diff(oldVdom, newVdom) {
  // 节点类型不同，直接替换
  if (oldVdom.type !== newVdom.type) {
    return { type: 'REPLACE', newVdom }
  }

  // 文本节点，内容不同
  if (oldVdom.type === 'TEXT_ELEMENT') {
    if (oldVdom.props.nodeValue !== newVdom.props.nodeValue) {
      return { type: 'TEXT', text: newVdom.props.nodeValue }
    }
    return null
  }

  // 比较属性
  const propPatches = diffProps(oldVdom.props, newVdom.props)

  // 比较子节点
  const childPatches = diffChildren(
    oldVdom.props.children,
    newVdom.props.children
  )

  if (!propPatches && !childPatches.length) {
    return null
  }

  return { type: 'UPDATE', propPatches, childPatches }
}
```

### 懒加载

```javascript
// 图片懒加载
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]')

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.removeAttribute('data-src')
        observer.unobserve(img)
      }
    })
  }, {
    rootMargin: '100px'
  })

  images.forEach(img => observer.observe(img))
}

// 传统方式（兼容性更好）
function lazyLoadImagesTraditional() {
  const images = document.querySelectorAll('img[data-src]')

  function loadImage() {
    images.forEach(img => {
      const rect = img.getBoundingClientRect()
      if (rect.top < window.innerHeight + 100 && rect.bottom > 0) {
        img.src = img.dataset.src
        img.removeAttribute('data-src')
      }
    })
  }

  window.addEventListener('scroll', throttle(loadImage, 200))
  loadImage()
}
```

## 字符串处理

### 模板字符串解析

```javascript
function render(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match
  })
}

// 支持嵌套属性
function renderNested(template, data) {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const keys = path.trim().split('.')
    let value = data

    for (const key of keys) {
      if (value === undefined) return match
      value = value[key]
    }

    return value !== undefined ? value : match
  })
}

// 使用示例
const template = 'Hello, {{name}}! You are {{age}} years old.'
const data = { name: 'Alice', age: 25 }
render(template, data) // "Hello, Alice! You are 25 years old."
```

### URL 解析

```javascript
function parseURL(url) {
  const parser = document.createElement('a')
  parser.href = url

  return {
    protocol: parser.protocol,
    host: parser.host,
    hostname: parser.hostname,
    port: parser.port,
    pathname: parser.pathname,
    search: parser.search,
    hash: parser.hash,
    origin: parser.origin
  }
}

// 解析查询字符串
function parseQueryString(queryString) {
  const params = new URLSearchParams(queryString)
  const result = {}

  for (const [key, value] of params) {
    if (result[key]) {
      result[key] = [].concat(result[key], value)
    } else {
      result[key] = value
    }
  }

  return result
}

// 手写 parseQueryString
function parseQueryStringManual(queryString) {
  if (!queryString || queryString === '?') return {}

  return queryString
    .replace(/^\?/, '')
    .split('&')
    .reduce((params, pair) => {
      const [key, value = ''] = pair.split('=').map(decodeURIComponent)
      if (key) {
        if (params[key]) {
          params[key] = [].concat(params[key], value)
        } else {
          params[key] = value
        }
      }
      return params
    }, {})
}

// 构建查询字符串
function buildQueryString(params) {
  return Object.entries(params)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&')
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    })
    .join('&')
}
```

### 驼峰命名转换

```javascript
// 短横线转驼峰
function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase())
}

// 驼峰转短横线
function camelToKebab(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

// 下划线转驼峰
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
}

// 驼峰转下划线
function camelToSnake(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase()
}
```

### 千分位格式化

```javascript
// 方法1：正则
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 方法2：toLocaleString
function formatNumberLocale(num) {
  return num.toLocaleString()
}

// 方法3：手动实现
function formatNumberManual(num) {
  const [integer, decimal] = num.toString().split('.')
  const chars = integer.split('').reverse()
  const result = []

  for (let i = 0; i < chars.length; i++) {
    if (i > 0 && i % 3 === 0) {
      result.push(',')
    }
    result.push(chars[i])
  }

  return result.reverse().join('') + (decimal ? `.${decimal}` : '')
}
```

## 常见面试题

::: details 两数之和
```javascript
function twoSum(nums, target) {
  const map = new Map()

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i]
    if (map.has(complement)) {
      return [map.get(complement), i]
    }
    map.set(nums[i], i)
  }

  return []
}
```
:::

::: details 最长公共子序列
```javascript
function longestCommonSubsequence(text1, text2) {
  const m = text1.length
  const n = text2.length
  const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  return dp[m][n]
}
```
:::

::: details 有效括号
```javascript
function isValidParentheses(s) {
  const stack = []
  const map = { ')': '(', ']': '[', '}': '{' }

  for (const char of s) {
    if (!map[char]) {
      stack.push(char)
    } else {
      if (stack.pop() !== map[char]) {
        return false
      }
    }
  }

  return stack.length === 0
}
```
:::

::: details 版本号比较
```javascript
function compareVersion(version1, version2) {
  const v1 = version1.split('.')
  const v2 = version2.split('.')
  const len = Math.max(v1.length, v2.length)

  for (let i = 0; i < len; i++) {
    const n1 = parseInt(v1[i] || 0)
    const n2 = parseInt(v2[i] || 0)

    if (n1 > n2) return 1
    if (n1 < n2) return -1
  }

  return 0
}
```
:::

::: details 大数相加
```javascript
function addStrings(num1, num2) {
  let i = num1.length - 1
  let j = num2.length - 1
  let carry = 0
  let result = ''

  while (i >= 0 || j >= 0 || carry) {
    const n1 = i >= 0 ? parseInt(num1[i--]) : 0
    const n2 = j >= 0 ? parseInt(num2[j--]) : 0
    const sum = n1 + n2 + carry

    result = (sum % 10) + result
    carry = Math.floor(sum / 10)
  }

  return result
}
```
:::

::: details 数组转树
```javascript
function arrayToTree(arr, parentId = null) {
  return arr
    .filter(item => item.parentId === parentId)
    .map(item => ({
      ...item,
      children: arrayToTree(arr, item.id)
    }))
}

// 使用 Map 优化
function arrayToTreeOptimized(arr) {
  const map = new Map()
  const result = []

  // 建立 id -> node 映射
  arr.forEach(item => {
    map.set(item.id, { ...item, children: [] })
  })

  // 构建树结构
  map.forEach(node => {
    if (node.parentId === null) {
      result.push(node)
    } else {
      const parent = map.get(node.parentId)
      if (parent) {
        parent.children.push(node)
      }
    }
  })

  return result
}

// 树转数组（扁平化）
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
```
:::

## 面试技巧

::: details 常见考点总结
| 题目类型 | 核心知识点 |
|---------|-----------|
| 数组操作 | 去重、扁平化、排序、查找 |
| 函数处理 | 防抖、节流、柯里化、compose |
| 对象操作 | 深拷贝、合并、扁平化 |
| Promise | 手写实现、并发控制、串行执行 |
| 原生方法 | call/apply/bind、new、instanceof |
| 数据结构 | LRU 缓存、发布订阅、EventEmitter |
| DOM 操作 | 事件委托、虚拟 DOM、懒加载 |
:::

::: details 解题思路
1. **理清问题**：明确输入、输出和边界条件
2. **暴力解法**：先给出一个能工作的解法
3. **优化方案**：考虑时间/空间复杂度优化
4. **边界处理**：空值、特殊情况的处理
5. **代码规范**：变量命名、注释、可读性
:::
