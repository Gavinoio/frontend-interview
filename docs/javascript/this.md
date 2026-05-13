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

