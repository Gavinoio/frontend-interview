# this 指向详解

## 概述

**官方定义**: `this` 是 JavaScript 中的一个关键字，它在函数执行时被创建，指向当前执行上下文中的对象。

**通俗理解**: `this` 就像是一个动态的指针，它不是在函数定义时确定的,而是在函数被调用时才确定。谁调用了这个函数，`this` 就指向谁。

### this 的本质

```javascript
// this 是执行上下文的一个属性
// 每个执行上下文都有以下组成部分：
// 1. 变量对象 (Variable Object)
// 2. 作用域链 (Scope Chain)
// 3. this 值

// this 的值在进入执行上下文时确定，且在执行过程中不可改变

// 规范中的描述：
// this 的值由调用表达式的形式决定
// 在全局执行上下文中，this 始终是全局对象
// 在函数执行上下文中，this 的值取决于函数的调用方式

// 引用类型 (Reference Type) 与 this
// 当函数作为对象属性调用时，存在一个"引用类型"的概念
// Reference Type = (base object, property name, strict mode)

const obj = {
  name: 'Alice',
  getName() {
    return this.name
  }
}

// obj.getName() 的引用类型：
// Reference Type = (obj, 'getName', false)
// base object = obj，所以 this = obj

// 当我们把方法赋值给变量时：
const fn = obj.getName
// fn() 的引用类型：
// Reference Type = (global, 'fn', false)
// base object = global，所以 this = window (非严格模式)
```

### this 与执行上下文

```javascript
/*
执行上下文创建过程中 this 的确定：

1. 全局执行上下文
   - 浏览器环境：this = window
   - Node.js 环境：this = global
   - Worker 环境：this = self

2. 函数执行上下文
   - 根据调用方式确定
   - 进入上下文时确定，不可更改

3. eval 执行上下文
   - 直接调用：继承调用位置的 this
   - 间接调用：this = 全局对象
*/

// 验证 this 在执行上下文创建时确定
function showThis() {
  console.log('进入函数:', this)

  const changeThis = () => {
    // 尝试"改变" this（实际不会改变）
    console.log('箭头函数中:', this)
  }

  changeThis.call({ name: 'ignored' }) // 箭头函数的 this 不会被改变

  console.log('函数结束:', this)
}

showThis.call({ name: 'Alice' })
// 输出：
// 进入函数: { name: 'Alice' }
// 箭头函数中: { name: 'Alice' }  <- 继承外层 this
// 函数结束: { name: 'Alice' }    <- this 没有改变
```

## this 的四种绑定规则

### 绑定优先级

**new绑定 > 显式绑定 > 隐式绑定 > 默认绑定**

```javascript
// 验证优先级
function foo() {
  console.log(this.a)
}

const obj1 = { a: 2, foo: foo }
const obj2 = { a: 3, foo: foo }

// 隐式绑定 vs 显式绑定
obj1.foo.call(obj2) // 3 - 显式绑定胜出

// 显式绑定 vs new绑定
const boundFoo = foo.bind(obj1)
const instance = new boundFoo() // undefined - new绑定胜出
console.log(instance.a) // undefined
```

### 1. 默认绑定（Default Binding）

当函数独立调用时，`this` 在非严格模式下指向全局对象（浏览器中是 `window`），严格模式下是 `undefined`。

```javascript
// 非严格模式
function foo() {
  console.log(this) // window
  console.log(this.a) // 2
}

var a = 2 // 用var声明会成为window属性
foo()

// 严格模式
'use strict'
function bar() {
  console.log(this) // undefined
}
bar()

// 常见陷阱：回调函数中的this
const obj = {
  name: 'Alice',
  greet() {
    setTimeout(function() {
      console.log(this.name) // undefined - 独立调用
    }, 100)
  }
}
obj.greet()

// 解决方案1：保存this
const obj2 = {
  name: 'Alice',
  greet() {
    const self = this
    setTimeout(function() {
      console.log(self.name) // 'Alice'
    }, 100)
  }
}

// 解决方案2：箭头函数
const obj3 = {
  name: 'Alice',
  greet() {
    setTimeout(() => {
      console.log(this.name) // 'Alice'
    }, 100)
  }
}
```

### 2. 隐式绑定（Implicit Binding）

当函数作为对象的方法调用时，`this` 指向调用该方法的对象。

```javascript
const obj = {
  name: 'Alice',
  age: 25,
  sayName() {
    console.log(this.name)
  },
  child: {
    name: 'Bob',
    sayName() {
      console.log(this.name)
    }
  }
}

obj.sayName() // 'Alice' - this指向obj
obj.child.sayName() // 'Bob' - this指向child

// 隐式丢失问题
const fn = obj.sayName
fn() // undefined - 赋值给变量后，调用时是独立调用

// 另一种隐式丢失场景
function doCallback(callback) {
  callback()
}
doCallback(obj.sayName) // undefined - 传参时丢失了上下文

// 解决隐式丢失
doCallback(obj.sayName.bind(obj)) // 'Alice'
doCallback(() => obj.sayName()) // 'Alice'
```

### 3. 显式绑定（Explicit Binding）

使用 `call`、`apply`、`bind` 方法显式指定 `this` 的指向。

```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`)
}

const person = { name: 'Alice' }

// call - 参数逐个传入
greet.call(person, 'Hello', '!') // 'Hello, Alice!'

// apply - 参数以数组形式传入
greet.apply(person, ['Hi', '?']) // 'Hi, Alice?'

// bind - 返回一个新函数,不立即执行
const boundGreet = greet.bind(person, 'Hey')
boundGreet('~') // 'Hey, Alice~'

// bind的特性：柯里化
function add(a, b, c) {
  return a + b + c
}
const addOne = add.bind(null, 1)
console.log(addOne(2, 3)) // 6

// 硬绑定：bind后的函数无法再被call/apply改变this
const hardBound = greet.bind(person)
hardBound.call({ name: 'Bob' }, 'Hello', '!') // 'Hello, Alice!' - 仍然是Alice
```

### 4. new 绑定（Constructor Binding）

使用 `new` 关键字调用函数时，会创建一个新对象，`this` 指向这个新对象。

```javascript
function Person(name, age) {
  this.name = name
  this.age = age
  this.sayHi = function() {
    console.log(`Hi, I'm ${this.name}`)
  }
}

const p1 = new Person('Alice', 25)
console.log(p1.name) // 'Alice'
p1.sayHi() // "Hi, I'm Alice"

// new 操作符做了什么？
function myNew(Constructor, ...args) {
  // 1. 创建一个新对象，原型指向构造函数的prototype
  const obj = Object.create(Constructor.prototype)
  // 2. 执行构造函数，this指向新对象
  const result = Constructor.apply(obj, args)
  // 3. 如果构造函数返回对象，则返回该对象；否则返回新对象
  return result instanceof Object ? result : obj
}

const p2 = myNew(Person, 'Bob', 30)
console.log(p2.name) // 'Bob'

// 构造函数返回对象的情况
function Foo() {
  this.a = 1
  return { a: 2 }
}
const foo = new Foo()
console.log(foo.a) // 2 - 返回了显式返回的对象

// 构造函数返回原始值的情况
function Bar() {
  this.a = 1
  return 'hello'
}
const bar = new Bar()
console.log(bar.a) // 1 - 原始值被忽略
```

## 箭头函数的 this

箭头函数没有自己的 `this`，它会捕获其所在上下文的 `this` 值，作为自己的 `this` 值。

```javascript
// 箭头函数的this是词法作用域的
const obj = {
  name: 'Alice',
  // 普通方法
  regularMethod() {
    console.log('regular:', this.name) // 'Alice'
  },
  // 箭头函数作为属性（不推荐）
  arrowProperty: () => {
    console.log('arrow:', this.name) // undefined - 继承外层作用域(window)的this
  },
  // 方法中返回箭头函数（推荐）
  methodReturningArrow() {
    return () => {
      console.log('inner arrow:', this.name) // 'Alice' - 继承methodReturningArrow的this
    }
  }
}

obj.regularMethod() // 'Alice'
obj.arrowProperty() // undefined
obj.methodReturningArrow()() // 'Alice'

// 箭头函数无法被call/apply/bind改变this
const arrowFn = () => console.log(this.name)
arrowFn.call({ name: 'Bob' }) // undefined - 仍然是外层的this

// 实际应用场景

// 场景1：事件处理
class Button {
  constructor() {
    this.count = 0
    // 使用箭头函数保持this指向实例
    this.handleClick = () => {
      this.count++
      console.log(this.count)
    }
  }
}

// 场景2：React类组件中的事件处理
class MyComponent {
  state = { count: 0 }

  // 推荐：箭头函数属性
  handleClick = () => {
    this.setState({ count: this.state.count + 1 })
  }

  // 或者在constructor中bind
  constructor() {
    this.handleClickBound = this.handleClickNormal.bind(this)
  }

  handleClickNormal() {
    this.setState({ count: this.state.count + 1 })
  }
}

// 场景3：数组方法中的回调
const calculator = {
  base: 10,
  // 普通函数作为回调，this丢失
  addAllWrong(numbers) {
    return numbers.map(function(n) {
      return this.base + n // this是undefined或window
    })
  },
  // 箭头函数作为回调，this正确
  addAllCorrect(numbers) {
    return numbers.map(n => this.base + n) // this是calculator
  }
}

// calculator.addAllWrong([1, 2, 3]) // 报错或NaN
console.log(calculator.addAllCorrect([1, 2, 3])) // [11, 12, 13]
```

## 特殊场景的 this

### DOM 事件处理器中的 this

```javascript
// 原生事件监听
const button = document.getElementById('btn')

// 普通函数 - this指向触发事件的元素
button.addEventListener('click', function(e) {
  console.log(this) // <button id="btn">...
  console.log(this === e.currentTarget) // true
})

// 箭头函数 - this指向外层作用域
button.addEventListener('click', (e) => {
  console.log(this) // window
  // 需要用 e.currentTarget 获取元素
  console.log(e.currentTarget) // <button id="btn">...
})

// 内联事件处理
// <button onclick="console.log(this)">Click</button>
// this 指向该 DOM 元素
```

### 类中的 this

```javascript
class Animal {
  constructor(name) {
    this.name = name
  }

  // 原型方法
  speak() {
    console.log(`${this.name} makes a sound.`)
  }

  // 箭头函数属性（实例属性）
  run = () => {
    console.log(`${this.name} is running.`)
  }

  // 静态方法
  static create(name) {
    return new this(name) // this 指向类本身
  }
}

const dog = new Animal('Dog')
dog.speak() // 'Dog makes a sound.'
dog.run() // 'Dog is running.'

// 方法赋值给变量后的区别
const speak = dog.speak
const run = dog.run

// speak() // 报错：Cannot read property 'name' of undefined
run() // 'Dog is running.' - 箭头函数保持了this

// 静态方法中的this
const cat = Animal.create('Cat')
console.log(cat.name) // 'Cat'

// 继承时的this
class Dog extends Animal {
  constructor(name, breed) {
    super(name) // 必须先调用super
    this.breed = breed
  }

  speak() {
    super.speak() // 调用父类方法
    console.log(`${this.name} barks.`)
  }
}
```

### 模块化中的 this

```javascript
// ES Module 中顶层 this 是 undefined
console.log(this) // undefined

// CommonJS 中 this 指向 module.exports
console.log(this === module.exports) // true

// IIFE 中的 this
;(function() {
  'use strict'
  console.log(this) // undefined (严格模式)
})()

;(function() {
  console.log(this) // window (非严格模式)
})()
```

## 手写 call/apply/bind

### 手写 call

```javascript
Function.prototype.myCall = function(context, ...args) {
  // 1. 处理 context
  // null/undefined 时指向全局对象
  if (context === null || context === undefined) {
    context = globalThis // 浏览器中是window，Node.js中是global
  } else {
    // 基本类型需要转换为对象
    context = Object(context)
  }

  // 2. 使用 Symbol 避免属性名冲突
  const fnKey = Symbol('fn')

  // 3. 将当前函数挂载到 context 上
  context[fnKey] = this

  // 4. 调用函数并获取结果
  const result = context[fnKey](...args)

  // 5. 删除临时属性
  delete context[fnKey]

  // 6. 返回结果
  return result
}

// 测试
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`
}

const person = { name: 'Alice' }
console.log(greet.myCall(person, 'Hello', '!')) // 'Hello, Alice!'
console.log(greet.myCall(null, 'Hi', '~')) // 'Hi, undefined~' (window.name)
```

### 手写 apply

```javascript
Function.prototype.myApply = function(context, argsArray = []) {
  // 参数校验
  if (!Array.isArray(argsArray) && argsArray !== undefined) {
    throw new TypeError('CreateListFromArrayLike called on non-object')
  }

  // 处理 context
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
console.log(greet.myApply(person, ['Hey', '?'])) // 'Hey, Alice?'

// 经典应用：获取数组最大值
const numbers = [5, 6, 2, 3, 7]
console.log(Math.max.myApply(null, numbers)) // 7
```

### 手写 bind（完整版）

```javascript
Function.prototype.myBind = function(context, ...args) {
  // 1. 保存原函数
  const fn = this

  // 2. 校验调用者是否为函数
  if (typeof fn !== 'function') {
    throw new TypeError('Bind must be called on a function')
  }

  // 3. 创建一个空函数用于原型链继承
  const NOP = function() {}

  // 4. 返回绑定后的函数
  const boundFn = function(...newArgs) {
    // 判断是否是 new 调用
    // 如果是 new 调用，this 是 boundFn 的实例
    // 如果是普通调用，this 就是传入的 context
    const isNew = this instanceof NOP

    return fn.apply(
      isNew ? this : context,
      args.concat(newArgs)
    )
  }

  // 5. 维护原型链
  // 让 boundFn.prototype 继承 fn.prototype
  if (fn.prototype) {
    NOP.prototype = fn.prototype
  }
  boundFn.prototype = new NOP()

  return boundFn
}

// 测试
function Person(name, age) {
  this.name = name
  this.age = age
}
Person.prototype.sayHi = function() {
  console.log(`Hi, I'm ${this.name}`)
}

// 普通绑定使用
const boundGreet = greet.myBind(person, 'Hello')
console.log(boundGreet('!')) // 'Hello, Alice!'

// new 调用
const BoundPerson = Person.myBind({ name: 'ignored' }, 'Alice')
const p = new BoundPerson(25)
console.log(p.name) // 'Alice'
console.log(p.age) // 25
p.sayHi() // "Hi, I'm Alice"
console.log(p instanceof Person) // true
```

## 常见面试题

::: details 1. this 指向的规则有哪些？
**一句话答案**：this 有四种绑定规则，按优先级从高到低是：new 绑定 > 显式绑定（call/apply/bind）> 隐式绑定（对象方法）> 默认绑定（独立调用）。

**详细解答**：

JavaScript 中的 this 指向规则可以分为以下四种：

1. **默认绑定**：函数独立调用时
   - 非严格模式下指向全局对象（浏览器中是 window）
   - 严格模式下是 undefined
   - 例如：`foo()` 直接调用

2. **隐式绑定**：函数作为对象方法调用时
   - this 指向调用该方法的对象
   - 例如：`obj.foo()` 中 this 指向 obj
   - 注意：容易发生"隐式丢失"，如将方法赋值给变量后调用

3. **显式绑定**：使用 call/apply/bind 明确指定 this
   - call 和 apply 立即执行函数
   - bind 返回一个新函数，不立即执行
   - 例如：`foo.call(obj)` 中 this 指向 obj

4. **new 绑定**：使用 new 调用构造函数时
   - this 指向新创建的对象
   - 例如：`new Foo()` 中 this 指向新实例

**优先级**：`new绑定 > 显式绑定 > 隐式绑定 > 默认绑定`

```javascript
// 优先级验证示例
function foo() {
  console.log(this.a)
}

const obj1 = { a: 2, foo }
const obj2 = { a: 3 }

// 隐式 vs 显式：显式绑定优先
obj1.foo.call(obj2) // 3

// 显式 vs new：new 绑定优先
const boundFoo = foo.bind(obj1)
const instance = new boundFoo() // this 指向新对象，不是 obj1
```

**面试回答模板**：

> "this 的指向主要有四种规则。首先是默认绑定，就是函数直接调用的情况，非严格模式下指向 window，严格模式下是 undefined。第二是隐式绑定，当函数作为对象的方法调用时，this 指向那个对象，比如 obj.foo()，this 就指向 obj。不过要注意隐式丢失的问题，如果把方法赋值给变量再调用，this 就会丢失。
>
> 第三是显式绑定，也就是用 call、apply、bind 这些方法来明确指定 this 的指向。其中 call 和 apply 会立即执行函数，只是传参方式不同，bind 则是返回一个新函数，不会立即执行。最后是 new 绑定，用 new 调用构造函数时，this 指向新创建的对象。
>
> 这四种规则有优先级的，new 绑定优先级最高，然后是显式绑定，接着是隐式绑定，最后是默认绑定。我在实际项目中，最常遇到的问题就是回调函数里 this 丢失的情况，通常会用箭头函数或者 bind 来解决。"

---
:::

::: details 2. 箭头函数的 this 指向什么？
**一句话答案**：箭头函数没有自己的 this，它会捕获定义时所在上下文的 this 值，并且无法通过 call/apply/bind 改变。

**详细解答**：

箭头函数的 this 具有以下特点：

1. **词法绑定**：箭头函数的 this 在定义时就确定了，继承自外层作用域
2. **不可变性**：无法使用 call/apply/bind 改变箭头函数的 this
3. **没有 this 绑定**：箭头函数本身没有 this，所以也不能作为构造函数使用
4. **没有 arguments 对象**：可以使用 rest 参数（...args）代替

```javascript
const obj = {
  name: 'Alice',
  // 普通方法中的箭头函数 - 推荐
  method() {
    const arrow = () => console.log(this.name)
    arrow() // 'Alice' - 继承 method 的 this
  },
  // 箭头函数作为对象属性 - 不推荐
  arrowMethod: () => {
    console.log(this.name) // undefined - 继承全局作用域的 this
  }
}

// 验证无法改变 this
const fn = () => console.log(this)
fn.call({ a: 1 }) // 仍然是外层的 this，不是 {a: 1}

// 实际应用场景
class Counter {
  count = 0

  // 使用箭头函数避免 this 丢失
  increment = () => {
    this.count++
  }

  start() {
    // 回调函数中保持 this 指向
    setInterval(() => {
      console.log(this.count)
    }, 1000)
  }
}
```

**适用场景**：
- 需要保持外层 this 的回调函数
- 数组方法（map、filter 等）的回调
- 定时器回调（setTimeout、setInterval）
- 事件处理器（React 类组件中）

**不适用场景**：
- 对象的方法定义（会导致 this 指向错误）
- 需要动态 this 的场景
- 构造函数（无法使用 new）
- 需要使用 arguments 对象时

**面试回答模板**：

> "箭头函数最大的特点就是它没有自己的 this，它的 this 是从定义时所在的作用域继承来的，这个叫做词法绑定。而且这个 this 一旦确定就无法改变，用 call、apply、bind 都改不了。
>
> 这个特性在实际开发中特别有用，比如在回调函数里，普通函数的 this 经常会丢失，但箭头函数就不会有这个问题。我在 React 项目中就经常用箭头函数来定义事件处理器，这样就不用在 constructor 里手动 bind 了。
>
> 不过也要注意，箭头函数不能用在所有场景。比如定义对象方法时就不合适，因为对象字面量不会创建作用域，箭头函数的 this 会指向外层的全局作用域而不是对象本身。还有就是箭头函数不能当构造函数，也没有 prototype 属性。"

---
:::

::: details 3. 如何改变 this 指向？（call/apply/bind）
**一句话答案**：可以使用 call、apply、bind 三种方法改变 this 指向，call 和 apply 立即执行且参数传递方式不同，bind 返回新函数不立即执行。

**详细解答**：

JavaScript 提供了三种显式改变 this 指向的方法：

| 方法 | 语法 | 执行时机 | 参数形式 | 返回值 |
|------|------|----------|----------|--------|
| call | `fn.call(thisArg, arg1, arg2, ...)` | 立即执行 | 逐个传入 | 函数返回值 |
| apply | `fn.apply(thisArg, [arg1, arg2, ...])` | 立即执行 | 数组传入 | 函数返回值 |
| bind | `fn.bind(thisArg, arg1, arg2, ...)` | 返回新函数 | 逐个传入（支持柯里化） | 绑定后的新函数 |

**详细对比**：

```javascript
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`
}

const person = { name: 'Alice' }

// call - 参数逐个传入，立即执行
greet.call(person, 'Hello', '!') // 'Hello, Alice!'

// apply - 参数以数组形式传入，立即执行
greet.apply(person, ['Hi', '?']) // 'Hi, Alice?'

// bind - 返回新函数，不立即执行，支持柯里化
const boundGreet = greet.bind(person, 'Hey')
boundGreet('~') // 'Hey, Alice~'

// bind 的特性：硬绑定，无法再被 call/apply 改变
const hardBound = greet.bind(person)
hardBound.call({ name: 'Bob' }, 'Hi', '!') // 'Hi, Alice!' - 仍然是 Alice
```

**实际应用场景**：

```javascript
// 1. 借用方法
const arrayLike = { 0: 'a', 1: 'b', length: 2 }
Array.prototype.push.call(arrayLike, 'c')

// 2. 求数组最大值
const max = Math.max.apply(null, [1, 2, 3, 4, 5]) // 5

// 3. 函数柯里化
function add(a, b, c) {
  return a + b + c
}
const add5 = add.bind(null, 5)
console.log(add5(1, 2)) // 8

// 4. 类数组转数组
const arr = Array.prototype.slice.call(arrayLike)

// 5. 事件处理器
class Button {
  handleClick() {
    console.log('Button clicked')
  }

  render() {
    // 绑定 this 确保方法能访问实例
    element.addEventListener('click', this.handleClick.bind(this))
  }
}
```

**选择建议**：
- 需要立即执行且参数较少：使用 **call**
- 需要立即执行且参数是数组：使用 **apply**
- 需要延迟执行或多次调用：使用 **bind**
- 需要函数柯里化：使用 **bind**

**面试回答模板**：

> "改变 this 指向主要有三个方法：call、apply 和 bind。
>
> call 和 apply 的作用是一样的，都是立即执行函数并改变 this 指向，区别就在于传参方式。call 是把参数一个一个传进去，像 `fn.call(obj, arg1, arg2)`；apply 是把参数放在数组里传，像 `fn.apply(obj, [arg1, arg2])`。我一般记忆的方式是，apply 的 a 对应 array。
>
> bind 和它们俩不一样，bind 不会立即执行函数，而是返回一个新的函数，这个新函数的 this 被永久绑定了，后续再用 call 或 apply 都改不了。bind 还支持柯里化，可以预先传入一些参数。
>
> 在实际开发中，我用得比较多的是 bind。比如在 React 类组件中，事件处理器需要访问组件实例的时候，就要在 constructor 里用 bind 绑定 this。还有一个常见场景是类数组转数组，可以用 `Array.prototype.slice.call(arrayLike)` 来实现。"

---
:::

::: details 4. new 操作符做了什么？this 指向谁？
**一句话答案**：new 操作符创建一个新对象，将构造函数的 this 指向这个新对象，执行构造函数，最后返回这个新对象（除非构造函数显式返回一个对象）。

**详细解答**：

new 操作符在执行时会经历以下四个步骤：

1. **创建新对象**：创建一个空对象，该对象的 `__proto__` 指向构造函数的 `prototype`
2. **绑定 this**：将构造函数的 this 绑定到这个新对象上
3. **执行构造函数**：执行构造函数中的代码，为新对象添加属性和方法
4. **返回对象**：
   - 如果构造函数返回一个对象，则返回该对象
   - 如果返回原始值或没有返回值，则返回新创建的对象

```javascript
// 示例
function Person(name, age) {
  this.name = name
  this.age = age
  this.sayHi = function() {
    console.log(`Hi, I'm ${this.name}`)
  }
}

const p1 = new Person('Alice', 25)
console.log(p1.name) // 'Alice'
console.log(p1 instanceof Person) // true
p1.sayHi() // "Hi, I'm Alice"

// 手写 new 操作符
function myNew(Constructor, ...args) {
  // 1. 创建一个新对象，继承构造函数的原型
  const obj = Object.create(Constructor.prototype)

  // 2. 执行构造函数，将 this 绑定到新对象
  const result = Constructor.apply(obj, args)

  // 3. 如果构造函数返回对象，则返回该对象；否则返回新对象
  return result instanceof Object ? result : obj
}

// 测试手写的 new
const p2 = myNew(Person, 'Bob', 30)
console.log(p2.name) // 'Bob'
console.log(p2 instanceof Person) // true

// 特殊情况1：构造函数返回对象
function Foo() {
  this.a = 1
  return { a: 2 } // 显式返回对象
}
const foo = new Foo()
console.log(foo.a) // 2 - 返回了显式返回的对象

// 特殊情况2：构造函数返回原始值
function Bar() {
  this.a = 1
  return 'hello' // 返回原始值
}
const bar = new Bar()
console.log(bar.a) // 1 - 原始值被忽略，返回新对象
```

**new 绑定的特点**：

1. **优先级最高**：new 绑定的优先级高于显式绑定（bind）
2. **创建实例**：通过 new 创建的对象会继承构造函数的原型
3. **this 指向**：构造函数内的 this 明确指向新创建的实例
4. **返回值处理**：只有显式返回对象时才会覆盖默认的返回值

```javascript
// new 绑定 vs bind 绑定
function Person(name) {
  this.name = name
}

const obj = { name: 'ignored' }
const BoundPerson = Person.bind(obj)

const p = new BoundPerson('Alice')
console.log(p.name) // 'Alice' - new 优先级更高，this 指向新对象
console.log(obj.name) // 'ignored' - obj 没有被修改
```

**面试回答模板**：

> "new 操作符的执行过程可以分为四步。首先，它会创建一个空对象，并且让这个对象的原型指向构造函数的 prototype，这样实例就能继承原型上的方法。然后，它会把构造函数的 this 绑定到这个新对象上，这样构造函数里的 this.xxx 都是在给新对象添加属性。接着，执行构造函数的代码。最后，返回这个新对象，但有个特殊情况，如果构造函数自己返回了一个对象，那就返回那个对象，不过如果返回的是原始值就会被忽略。
>
> 所以说，new 调用时，this 就指向这个新创建的对象。而且 new 绑定的优先级是最高的，即使用 bind 绑定过的构造函数，用 new 调用时 this 还是指向新对象，不会指向 bind 的那个对象。
>
> 我在面试的时候还被要求手写过 new 操作符的实现，核心就是用 Object.create 创建对象，然后用 apply 改变 this 指向并执行构造函数，最后判断返回值类型决定返回什么。"

---
:::

::: details 5. 下面代码输出什么？
```javascript
var name = 'window'

const obj = {
  name: 'obj',
  methods: {
    name: 'methods',
    getName1: function() {
      return this.name
    },
    getName2: () => {
      return this.name
    },
    getName3: function() {
      return (() => this.name)()
    }
  }
}

console.log(obj.methods.getName1())
console.log(obj.methods.getName2())
console.log(obj.methods.getName3())

const fn1 = obj.methods.getName1
console.log(fn1())
```

<details>
<summary>点击查看答案</summary>

```javascript
console.log(obj.methods.getName1()) // 'methods'
console.log(obj.methods.getName2()) // 'window'
console.log(obj.methods.getName3()) // 'methods'

const fn1 = obj.methods.getName1
console.log(fn1()) // 'window'
```

**详细解析**：

1. `obj.methods.getName1()` → **'methods'**
   - 普通函数，隐式绑定
   - this 指向调用它的对象 methods

2. `obj.methods.getName2()` → **'window'**
   - 箭头函数，定义在对象字面量中
   - 对象字面量不构成作用域，所以继承外层（全局）的 this

3. `obj.methods.getName3()` → **'methods'**
   - 普通函数 getName3 内部返回一个箭头函数
   - 箭头函数继承 getName3 的 this
   - getName3 被 methods 调用，this 指向 methods

4. `fn1()` → **'window'**
   - 隐式丢失
   - 将方法赋值给变量后，独立调用
   - 默认绑定到全局对象

**关键点**：
- 普通函数的 this：看调用位置
- 箭头函数的 this：看定义位置的外层作用域
- 对象字面量不创建作用域
- 方法赋值给变量会丢失 this
:::

---

</details>

::: details 6. 下面代码输出什么？（综合题）
```javascript
var name = 'global'

function Person(name) {
  this.name = name
  this.sayName = function() {
    console.log(this.name)
  }
  this.sayNameArrow = () => {
    console.log(this.name)
  }
}

const p1 = new Person('Alice')
const p2 = { name: 'Bob' }

p1.sayName()
p1.sayName.call(p2)
p1.sayNameArrow()
p1.sayNameArrow.call(p2)

const fn1 = p1.sayName
const fn2 = p1.sayNameArrow
fn1()
fn2()
```

<details>
<summary>点击查看答案</summary>

```javascript
p1.sayName() // 'Alice'
p1.sayName.call(p2) // 'Bob'
p1.sayNameArrow() // 'Alice'
p1.sayNameArrow.call(p2) // 'Alice'

const fn1 = p1.sayName
const fn2 = p1.sayNameArrow
fn1() // 'global'
fn2() // 'Alice'
```

**详细解析**：

1. `p1.sayName()` → **'Alice'**
   - 隐式绑定，this 指向 p1

2. `p1.sayName.call(p2)` → **'Bob'**
   - 显式绑定，this 被改为 p2

3. `p1.sayNameArrow()` → **'Alice'**
   - 箭头函数，继承构造函数中的 this
   - 构造函数中 this 指向 p1 实例

4. `p1.sayNameArrow.call(p2)` → **'Alice'**
   - 箭头函数的 this 无法被 call 改变
   - 仍然指向创建时的 this（p1）

5. `fn1()` → **'global'**
   - 普通函数，隐式丢失
   - 独立调用，默认绑定到全局

6. `fn2()` → **'Alice'**
   - 箭头函数的 this 永远不变
   - 仍然指向 p1 实例

**核心区别**：
- **普通函数**：this 取决于调用方式，可以被 call/apply/bind 改变
- **箭头函数**：this 取决于定义位置，永远不会改变
- **构造函数中的箭头函数**：this 永远指向该实例，不受调用方式影响
:::

---

</details>

::: details 7. 手写 call、apply、bind
<details>
<summary>点击查看答案</summary>

```javascript
// 手写 call
Function.prototype.myCall = function(context, ...args) {
  // 1. 处理 context，null/undefined 指向全局对象
  if (context === null || context === undefined) {
    context = globalThis
  } else {
    // 原始值需要转换为对象
    context = Object(context)
  }

  // 2. 使用 Symbol 避免属性名冲突
  const key = Symbol('fn')

  // 3. 将函数作为 context 的方法
  context[key] = this

  // 4. 调用方法
  const result = context[key](...args)

  // 5. 删除临时属性
  delete context[key]

  // 6. 返回结果
  return result
}

// 手写 apply
Function.prototype.myApply = function(context, args = []) {
  // 参数校验
  if (!Array.isArray(args) && args !== undefined) {
    throw new TypeError('CreateListFromArrayLike called on non-object')
  }

  // 处理 context
  if (context === null || context === undefined) {
    context = globalThis
  } else {
    context = Object(context)
  }

  const key = Symbol('fn')
  context[key] = this

  const result = context[key](...(args || []))
  delete context[key]

  return result
}

// 手写 bind（完整版，支持 new 调用）
Function.prototype.myBind = function(context, ...args) {
  // 1. 保存原函数
  const fn = this

  // 2. 校验调用者是否为函数
  if (typeof fn !== 'function') {
    throw new TypeError('Bind must be called on a function')
  }

  // 3. 返回绑定后的函数
  const boundFn = function(...newArgs) {
    // 判断是否是 new 调用
    // new 调用时 this 是 boundFn 的实例，应该指向新对象
    // 普通调用时使用传入的 context
    return fn.apply(
      this instanceof boundFn ? this : context,
      args.concat(newArgs)
    )
  }

  // 4. 维护原型链
  if (fn.prototype) {
    boundFn.prototype = Object.create(fn.prototype)
  }

  return boundFn
}

// 测试
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`
}

const person = { name: 'Alice' }

console.log(greet.myCall(person, 'Hello', '!')) // 'Hello, Alice!'
console.log(greet.myApply(person, ['Hi', '?'])) // 'Hi, Alice?'

const boundGreet = greet.myBind(person, 'Hey')
console.log(boundGreet('~')) // 'Hey, Alice~'

// 测试 bind 的 new 调用
function Person(name, age) {
  this.name = name
  this.age = age
}
Person.prototype.sayHi = function() {
  console.log(`Hi, I'm ${this.name}`)
}

const BoundPerson = Person.myBind({ name: 'ignored' }, 'Alice')
const p = new BoundPerson(25)
console.log(p.name) // 'Alice'
console.log(p.age) // 25
console.log(p instanceof Person) // true
p.sayHi() // "Hi, I'm Alice"
```

**实现要点**：

1. **call/apply 共同点**：
   - 处理 null/undefined 指向全局对象
   - 原始值需要装箱（Object()）
   - 使用 Symbol 避免属性名冲突
   - 执行完毕删除临时属性

2. **bind 特殊之处**：
   - 返回新函数，不立即执行
   - 支持柯里化（预设参数）
   - 支持 new 调用（判断 this instanceof boundFn）
   - 维护原型链（继承原函数的 prototype）

3. **关键技巧**：
   - 通过 `context[key] = this` 改变 this
   - 通过 `context[key](...args)` 调用函数
   - bind 中通过 `this instanceof boundFn` 判断是否 new 调用
:::

---

</details>

::: details 8. 实现一个 softBind（可覆盖的绑定）
<details>
<summary>点击查看答案</summary>

`softBind` 是一种特殊的绑定方式：如果函数调用时的 this 是全局对象或 undefined，才使用绑定的 context；否则使用当前的 this。

```javascript
Function.prototype.softBind = function(context, ...args) {
  const fn = this

  const bound = function(...newArgs) {
    // 关键：如果 this 是全局对象或 undefined，使用绑定的 context
    // 否则使用当前的 this（允许被覆盖）
    return fn.apply(
      !this || this === globalThis ? context : this,
      args.concat(newArgs)
    )
  }

  // 维护原型链
  bound.prototype = Object.create(fn.prototype)

  return bound
}

// 测试
function greet() {
  console.log('Hello, ' + this.name)
}

const obj1 = { name: 'Alice' }
const obj2 = { name: 'Bob' }

const softGreet = greet.softBind(obj1)

softGreet() // 'Hello, Alice' - 默认调用，使用绑定的 context
softGreet.call(obj2) // 'Hello, Bob' - 可以被显式绑定覆盖
softGreet.call(null) // 'Hello, Alice' - null 时回退到绑定的 context

obj2.fn = softGreet
obj2.fn() // 'Hello, Bob' - 隐式绑定也可以覆盖
```

**与 bind 的对比**：

| 特性 | bind | softBind |
|------|------|----------|
| 默认调用 | 使用绑定的 context | 使用绑定的 context |
| call/apply 调用 | 无法覆盖 | 可以覆盖 |
| 隐式绑定 | 无法覆盖 | 可以覆盖 |
| 应用场景 | 永久绑定 this | 提供默认 this，但允许覆盖 |

**应用场景**：
- 需要提供默认 this，但又希望在特殊情况下能够覆盖
- 想避免隐式绑定丢失，但保留灵活性
:::

---

</details>

::: details 9. 下面代码输出什么？（复杂场景）
```javascript
const obj = {
  a: 1,
  b: {
    a: 2,
    fn: function() {
      return this.a
    },
    arrow: () => this.a
  },
  fn: function() {
    return function() {
      return this.a
    }
  },
  arrow: function() {
    return () => this.a
  }
}

console.log(obj.b.fn())
console.log(obj.b.arrow())
console.log(obj.fn()())
console.log(obj.arrow()())

const fn1 = obj.b.fn
console.log(fn1())

const fn2 = obj.arrow()
console.log(fn2())
```

<details>
<summary>点击查看答案</summary>

```javascript
console.log(obj.b.fn())      // 2 - 隐式绑定，this 指向 obj.b
console.log(obj.b.arrow())   // undefined - 箭头函数继承全局 this（window.a 或 undefined）
console.log(obj.fn()())      // undefined - 返回的函数独立调用，默认绑定
console.log(obj.arrow()())   // 1 - 箭头函数继承 arrow() 的 this，即 obj

const fn1 = obj.b.fn
console.log(fn1())           // undefined - 隐式丢失，默认绑定

const fn2 = obj.arrow()
console.log(fn2())           // 1 - 箭头函数 this 在定义时确定，指向 obj
```

**详细解析**：

1. `obj.b.fn()` → **2**
   - 普通函数，隐式绑定
   - this 指向最近的调用对象 obj.b
   - obj.b.a = 2

2. `obj.b.arrow()` → **undefined**
   - 箭头函数定义在对象字面量中
   - 对象字面量不创建作用域
   - 继承外层（全局）的 this
   - 全局没有 a 属性

3. `obj.fn()()` → **undefined**
   - obj.fn() 返回一个普通函数
   - 返回的函数独立调用
   - 默认绑定，this 指向 window（非严格）或 undefined（严格）

4. `obj.arrow()()` → **1**
   - obj.arrow() 的 this 是 obj
   - 返回的箭头函数继承 arrow 的 this
   - 箭头函数的 this 永远是 obj，返回 obj.a = 1

5. `fn1()` → **undefined**
   - 方法赋值给变量，隐式丢失
   - 独立调用，默认绑定

6. `fn2()` → **1**
   - fn2 是在 obj.arrow() 中创建的箭头函数
   - 箭头函数的 this 在创建时就固定了
   - 无论如何调用，this 都是 obj

**关键点**：
- 对象字面量 `{}` 不创建作用域
- 箭头函数的 this 取决于**定义时**的外层作用域
- 普通函数返回的箭头函数会捕获普通函数的 this
:::

---

</details>

::: details 10. 解释 this 在不同场景下的指向
<details>
<summary>点击查看答案</summary>

| 场景 | this 指向 | 示例 |
|------|-----------|------|
| 全局代码 | window / undefined(严格模式) | `console.log(this)` |
| 普通函数调用 | window / undefined(严格模式) | `foo()` |
| 对象方法调用 | 调用的对象 | `obj.foo()` |
| call/apply/bind | 第一个参数 | `foo.call(obj)` |
| new 调用 | 新创建的对象 | `new Foo()` |
| 箭头函数 | 外层作用域的 this | `() => this` |
| DOM 事件（普通函数） | 触发事件的元素 | `element.onclick` |
| DOM 事件（箭头函数） | 外层作用域的 this | `element.onclick = () => {}` |
| setTimeout（普通函数） | window | `setTimeout(fn, 100)` |
| setTimeout（箭头函数） | 外层作用域的 this | `setTimeout(() => {}, 100)` |
| class 方法 | 实例对象 | `instance.method()` |
| class 静态方法 | 类本身 | `Class.staticMethod()` |
| 严格模式独立调用 | undefined | `'use strict'; foo()` |
| ES Module 顶层 | undefined | 模块顶层的 this |
| CommonJS 顶层 | module.exports | Node.js 模块中 |

**记忆技巧**：

1. **普通函数看调用位置**：谁调用，this 指向谁
2. **箭头函数看定义位置**：继承外层作用域的 this
3. **优先级记忆**：new > 显式 > 隐式 > 默认
4. **严格模式**：默认绑定是 undefined，非严格是 window
5. **DOM 事件**：普通函数指向元素，箭头函数指向外层

**常见陷阱**：

```javascript
// 陷阱1：隐式丢失
const obj = {
  name: 'Alice',
  greet() {
    console.log(this.name)
  }
}
setTimeout(obj.greet, 100) // undefined - 方法被当作函数传递

// 解决：使用箭头函数或 bind
setTimeout(() => obj.greet(), 100) // 'Alice'
setTimeout(obj.greet.bind(obj), 100) // 'Alice'

// 陷阱2：箭头函数作为对象方法
const obj2 = {
  name: 'Bob',
  greet: () => {
    console.log(this.name) // undefined - 箭头函数继承全局 this
  }
}

// 陷阱3：回调函数中的 this
[1, 2, 3].map(function(n) {
  return this.base + n // this 是 undefined 或 window
})
// 解决：使用箭头函数
[1, 2, 3].map(n => this.base + n)
```
:::

---

</details>

## 高级应用场景

::: details 框架中的 this
#### React 中的 this

```javascript
// ==================== React 类组件中的 this 问题 ====================

class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = { count: 0 }

    // 方案1: 构造函数中绑定
    this.handleClick1 = this.handleClick1.bind(this)
  }

  // 普通方法 - 需要绑定
  handleClick1() {
    this.setState({ count: this.state.count + 1 })
  }

  // 方案2: 类字段 + 箭头函数（推荐）
  handleClick2 = () => {
    this.setState({ count: this.state.count + 1 })
  }

  // 普通方法 - 不绑定会丢失 this
  handleClick3() {
    console.log(this) // undefined!
  }

  render() {
    return (
      <div>
        {/* 正常工作 - 构造函数中绑定 */}
        <button onClick={this.handleClick1}>Click 1</button>

        {/* 正常工作 - 箭头函数属性 */}
        <button onClick={this.handleClick2}>Click 2</button>

        {/* 方案3: 内联箭头函数（性能稍差，每次渲染创建新函数） */}
        <button onClick={() => this.handleClick3()}>Click 3</button>

        {/* ❌ 错误 - this 丢失 */}
        <button onClick={this.handleClick3}>Click 4 (Broken)</button>
      </div>
    )
  }
}

// ==================== 为什么 React 事件处理需要绑定 this ====================

// React 事件系统会这样调用你的处理函数：
const handler = component.handleClick
handler() // 独立调用，this 丢失

// 而不是这样：
component.handleClick() // 方法调用，this 正确

// ==================== React Hooks 不需要担心 this ====================

function Counter() {
  const [count, setCount] = useState(0)

  // 函数组件没有 this 的问题
  const handleClick = () => {
    setCount(count + 1)
  }

  return <button onClick={handleClick}>{count}</button>
}
```

#### Vue 中的 this

```javascript
// ==================== Vue 2 Options API ====================

export default {
  data() {
    return {
      message: 'Hello'
    }
  },

  // ✅ methods 中的函数会自动绑定 this 到组件实例
  methods: {
    greet() {
      console.log(this.message) // 正常工作
    },

    // ❌ 箭头函数会导致 this 指向错误
    // greetArrow: () => {
    //   console.log(this.message) // this 不是组件实例!
    // }
  },

  // ✅ computed 也会自动绑定
  computed: {
    reversedMessage() {
      return this.message.split('').reverse().join('')
    }
  },

  // ✅ watch 同样
  watch: {
    message(newVal, oldVal) {
      console.log(this.message) // 正常工作
    }
  },

  // ✅ 生命周期钩子
  mounted() {
    console.log(this.message) // 正常工作
  }
}

// ==================== Vue 3 Composition API ====================

import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    // setup 中没有 this
    // console.log(this) // undefined

    const message = ref('Hello')

    // 普通函数
    function greet() {
      console.log(message.value)
    }

    // 箭头函数也可以
    const greetArrow = () => {
      console.log(message.value)
    }

    onMounted(() => {
      console.log(message.value)
    })

    return {
      message,
      greet,
      greetArrow
    }
  }
}

// Vue 3 <script setup> 语法
// 同样没有 this，使用响应式 ref/reactive
```
:::

::: details 定时器中的 this
```javascript
// ==================== setTimeout/setInterval 中的 this ====================

const obj = {
  name: 'Alice',

  // ❌ 问题：普通函数丢失 this
  delayedGreet() {
    setTimeout(function() {
      console.log(this.name) // undefined - this 指向 window
    }, 1000)
  },

  // ✅ 解决方案1：保存 this
  delayedGreet1() {
    const self = this
    setTimeout(function() {
      console.log(self.name) // 'Alice'
    }, 1000)
  },

  // ✅ 解决方案2：箭头函数（推荐）
  delayedGreet2() {
    setTimeout(() => {
      console.log(this.name) // 'Alice'
    }, 1000)
  },

  // ✅ 解决方案3：bind
  delayedGreet3() {
    setTimeout(function() {
      console.log(this.name) // 'Alice'
    }.bind(this), 1000)
  }
}

// ==================== setInterval 同样的问题 ====================

class Timer {
  constructor() {
    this.seconds = 0
    this.timerId = null
  }

  // ❌ this 丢失
  startBroken() {
    this.timerId = setInterval(function() {
      this.seconds++ // TypeError: Cannot read property 'seconds' of undefined
    }, 1000)
  }

  // ✅ 箭头函数解决
  start() {
    this.timerId = setInterval(() => {
      this.seconds++
      console.log(this.seconds)
    }, 1000)
  }

  stop() {
    clearInterval(this.timerId)
  }
}
```
:::

::: details 数组方法中的 this
```javascript
// ==================== forEach/map/filter 等的 this ====================

const obj = {
  multiplier: 2,
  numbers: [1, 2, 3],

  // ❌ 普通函数 - this 丢失
  doubleAllBroken() {
    return this.numbers.map(function(n) {
      return n * this.multiplier // this 是 undefined
    })
  },

  // ✅ 箭头函数
  doubleAll() {
    return this.numbers.map(n => n * this.multiplier)
  },

  // ✅ 使用 thisArg 参数（forEach/map/filter/some/every 都支持）
  doubleAllWithThisArg() {
    return this.numbers.map(function(n) {
      return n * this.multiplier
    }, this) // 第二个参数指定 this
  },

  // ✅ bind
  doubleAllWithBind() {
    return this.numbers.map(function(n) {
      return n * this.multiplier
    }.bind(this))
  }
}

// ==================== reduce 没有 thisArg 参数 ====================

const calculator = {
  base: 10,
  numbers: [1, 2, 3],

  // reduce 不支持 thisArg，必须用箭头函数或 bind
  sum() {
    return this.numbers.reduce((acc, n) => acc + n + this.base, 0)
  }
}
```
:::

::: details 事件处理器中的 this
```javascript
// ==================== DOM 事件中的 this ====================

const button = document.getElementById('myButton')

// 普通函数 - this 指向触发事件的元素
button.addEventListener('click', function(event) {
  console.log(this)                // <button id="myButton">
  console.log(this === event.target) // true（通常情况）
  console.log(this === event.currentTarget) // true
})

// 箭头函数 - this 指向外层作用域
button.addEventListener('click', (event) => {
  console.log(this)                // window（或外层的 this）
  console.log(event.currentTarget) // 需要用 event 获取元素
})

// ==================== 类中的事件处理 ====================

class ButtonHandler {
  constructor(element) {
    this.element = element
    this.count = 0

    // ❌ 错误：this 指向 button 而不是实例
    // element.addEventListener('click', this.handleClick)

    // ✅ 方案1：bind
    element.addEventListener('click', this.handleClick.bind(this))

    // ✅ 方案2：箭头函数包装
    element.addEventListener('click', (e) => this.handleClick(e))

    // ✅ 方案3：箭头函数属性（需要在构造函数之前定义）
    // 见下方 handleClickArrow
  }

  handleClick(event) {
    this.count++
    console.log(`Clicked ${this.count} times`)
  }

  // 箭头函数属性 - this 自动绑定
  handleClickArrow = (event) => {
    this.count++
    console.log(`Clicked ${this.count} times`)
  }

  // 清理
  destroy() {
    // 如果用了 bind，需要保存引用才能移除
    // element.removeEventListener('click', this.boundHandler)
  }
}

// ==================== 事件委托中的 this ====================

document.getElementById('list').addEventListener('click', function(event) {
  // this 指向 #list（绑定事件的元素）
  console.log('this:', this.id) // 'list'

  // event.target 是实际点击的元素
  if (event.target.matches('li')) {
    console.log('Clicked item:', event.target.textContent)
  }

  // event.currentTarget 始终是绑定事件的元素（等于 this）
  console.log('currentTarget:', event.currentTarget.id) // 'list'
})
```
:::

::: details 原型方法中的 this
```javascript
// ==================== 原型方法中的 this ====================

function Animal(name) {
  this.name = name
}

Animal.prototype.speak = function() {
  console.log(`${this.name} makes a sound`)
}

Animal.prototype.delayedSpeak = function() {
  // ❌ this 丢失
  // setTimeout(this.speak, 1000)

  // ✅ 正确
  setTimeout(() => this.speak(), 1000)
}

// ==================== 原型链中的 this ====================

const animal = new Animal('Generic')
const dog = Object.create(animal)
dog.name = 'Buddy'

dog.speak() // 'Buddy makes a sound'
// 虽然 speak 在原型链上，但 this 指向调用者 dog

// ==================== 借用方法时的 this ====================

const arr = [1, 2, 3]
const arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 }

// 借用数组方法
const result = Array.prototype.join.call(arrayLike, '-')
console.log(result) // 'a-b-c'

// this 指向 arrayLike，而不是 Array.prototype
```
:::

## this 相关工具函数

::: details 实现 throttle 保持 this
```javascript
function throttle(fn, delay) {
  let lastTime = 0
  let timer = null

  return function(...args) {
    const now = Date.now()
    const context = this // 保存 this

    if (now - lastTime >= delay) {
      fn.apply(context, args)
      lastTime = now
    } else if (!timer) {
      timer = setTimeout(() => {
        fn.apply(context, args)
        lastTime = Date.now()
        timer = null
      }, delay - (now - lastTime))
    }
  }
}

// 使用
const obj = {
  name: 'Alice',
  greet: throttle(function() {
    console.log(`Hello, ${this.name}`)
  }, 1000)
}

obj.greet() // 'Hello, Alice' - this 正确
```
:::

::: details 实现 debounce 保持 this
```javascript
function debounce(fn, delay, immediate = false) {
  let timer = null

  return function(...args) {
    const context = this // 保存 this
    const callNow = immediate && !timer

    clearTimeout(timer)

    timer = setTimeout(() => {
      timer = null
      if (!immediate) {
        fn.apply(context, args)
      }
    }, delay)

    if (callNow) {
      fn.apply(context, args)
    }
  }
}

// 使用
const obj = {
  name: 'Bob',
  search: debounce(function(query) {
    console.log(`${this.name} is searching: ${query}`)
  }, 300)
}

obj.search('hello') // 'Bob is searching: hello'
```
:::

::: details 实现 once 保持 this
```javascript
function once(fn) {
  let called = false
  let result

  return function(...args) {
    if (!called) {
      called = true
      result = fn.apply(this, args) // 保持 this
    }
    return result
  }
}

// 使用
const obj = {
  name: 'Charlie',
  init: once(function() {
    console.log(`${this.name} initialized`)
    return 'done'
  })
}

obj.init() // 'Charlie initialized'
obj.init() // 不执行，返回 'done'
```
:::

## V8 引擎中的 this 实现

::: details this 的内部表示
```javascript
/*
V8 中的 this 绑定机制：

1. 函数调用时，V8 会根据调用方式确定 this
2. this 的值存储在当前执行上下文的 "receiver" 字段中
3. 不同的调用方式会产生不同的 receiver

调用栈帧结构（简化）：
┌─────────────────────────┐
│  Return Address         │
│  Previous Frame Pointer │
│  Context (闭包变量)      │
│  Function               │
│  Receiver (this)        │  ← this 存储在这里
│  Arguments              │
│  Local Variables        │
└─────────────────────────┘
*/

// 不同调用方式的 receiver 确定

// 1. 方法调用: obj.method()
// receiver = obj
// V8 会检查 . 或 [] 操作符左侧的对象

// 2. 函数调用: fn()
// receiver = global (非严格) 或 undefined (严格)

// 3. new 调用: new Fn()
// receiver = 新创建的对象

// 4. call/apply: fn.call(obj)
// receiver = 第一个参数

// 5. 箭头函数
// 不创建自己的 receiver，从外层作用域继承
```
:::

::: details 性能考虑
```javascript
// ==================== this 相关的性能优化 ====================

// 1. 避免在热路径中重复绑定
class Widget {
  constructor() {
    // ✅ 构造时绑定一次
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    // ...
  }

  render() {
    // ❌ 每次渲染都创建新函数
    // return <button onClick={this.handleClick.bind(this)}>

    // ✅ 使用已绑定的方法
    // return <button onClick={this.handleClick}>
  }
}

// 2. 箭头函数属性的内存影响
class Example {
  // 每个实例都有自己的方法副本
  arrowMethod = () => {
    console.log(this)
  }

  // 所有实例共享原型上的方法
  prototypeMethod() {
    console.log(this)
  }
}

// 1000 个实例：
// arrowMethod: 1000 个函数对象
// prototypeMethod: 1 个函数对象

// 3. 使用 WeakMap 优化 this 绑定缓存
const boundMethodsCache = new WeakMap()

function bindMethod(obj, methodName) {
  if (!boundMethodsCache.has(obj)) {
    boundMethodsCache.set(obj, new Map())
  }

  const objCache = boundMethodsCache.get(obj)

  if (!objCache.has(methodName)) {
    objCache.set(methodName, obj[methodName].bind(obj))
  }

  return objCache.get(methodName)
}

// 使用
const obj = { name: 'Alice', greet() { console.log(this.name) } }
const boundGreet = bindMethod(obj, 'greet')
// 多次调用 bindMethod 会返回同一个绑定函数
```
:::

## 总结

::: details this 判断流程图
```
函数被调用
    │
    ├─ 是箭头函数？──是──→ this = 外层作用域的 this（词法绑定）
    │
    └─ 否
        │
        ├─ 是 new 调用？──是──→ this = 新创建的对象
        │
        └─ 否
            │
            ├─ 是 call/apply/bind？──是──→ this = 第一个参数
            │
            └─ 否
                │
                ├─ 是对象方法调用？──是──→ this = 调用对象
                │   (obj.method())
                │
                └─ 否（独立调用）
                    │
                    ├─ 严格模式？──是──→ this = undefined
                    │
                    └─ 否──→ this = 全局对象 (window/global)
```
:::

::: details 核心要点
| 规则 | this 指向 | 能否被改变 |
|------|-----------|------------|
| 默认绑定 | window / undefined | 是 |
| 隐式绑定 | 调用对象 | 是 |
| 显式绑定 (call/apply) | 指定对象 | 是 |
| 硬绑定 (bind) | 指定对象 | 否 |
| new 绑定 | 新对象 | 否 |
| 箭头函数 | 外层 this | 否 |
:::

::: details 面试答题模板
> **当被问到"说说 this 的指向"时：**
>
> "this 的指向主要有四种绑定规则，按优先级从高到低是：
>
> 1. **new 绑定**：用 new 调用构造函数时，this 指向新创建的对象
> 2. **显式绑定**：用 call/apply/bind 可以明确指定 this，其中 bind 创建的硬绑定无法再被修改
> 3. **隐式绑定**：作为对象方法调用时，this 指向那个对象，但要注意隐式丢失的问题
> 4. **默认绑定**：独立调用时，非严格模式指向 window，严格模式是 undefined
>
> 另外箭头函数比较特殊，它没有自己的 this，会从定义时的外层作用域继承，而且无法被 call/apply/bind 改变。
>
> 实际项目中最常遇到的问题就是回调函数和事件处理器中 this 丢失，一般用箭头函数或 bind 来解决。"
:::
