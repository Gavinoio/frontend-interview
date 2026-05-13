# 原型与继承

## 原型链

### 核心概念

```javascript
// 每个对象都有 __proto__ 属性,指向其构造函数的 prototype
// 每个函数都有 prototype 属性,包含 constructor 属性

function Person(name) {
  this.name = name
}

Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`)
}

const person = new Person('Alice')

console.log(person.__proto__ === Person.prototype)  // true
console.log(Person.prototype.constructor === Person)  // true
console.log(person.__proto__.__proto__ === Object.prototype)  // true
console.log(Object.prototype.__proto__)  // null

// 原型链: person → Person.prototype → Object.prototype → null
```

### 完整原型链图

```javascript
/*
person
  ↓ __proto__
Person.prototype {
  constructor: Person,
  sayHello: function
}
  ↓ __proto__
Object.prototype {
  toString: function,
  valueOf: function,
  hasOwnProperty: function
}
  ↓ __proto__
null
*/
```

### 函数的原型链

```javascript
// 函数是特殊的对象，也有自己的原型链

function Person() {}

// 函数作为对象的原型链
console.log(Person.__proto__ === Function.prototype)  // true
console.log(Function.prototype.__proto__ === Object.prototype)  // true
console.log(Object.prototype.__proto__ === null)  // true

// 特殊情况：Function 自己创建自己
console.log(Function.__proto__ === Function.prototype)  // true
console.log(Function.prototype.__proto__ === Object.prototype)  // true

// Object 构造函数也是函数
console.log(Object.__proto__ === Function.prototype)  // true

// 完整关系图
/*
┌─────────────────────────────────────────────────────────────────────┐
│                         原型链完整图解                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────┐                                                        │
│  │  null   │ ← Object.prototype.__proto__                           │
│  └────↑────┘                                                        │
│       │                                                              │
│  ┌────┴────────────────┐                                            │
│  │  Object.prototype   │ ← 所有对象的终极原型                        │
│  │  - toString()       │                                            │
│  │  - valueOf()        │                                            │
│  │  - hasOwnProperty() │                                            │
│  └────↑────────────────┘                                            │
│       │                                                              │
│       ├───────────────────┬───────────────────┐                     │
│       │                   │                   │                     │
│  ┌────┴───────────┐  ┌────┴───────────┐  ┌───┴────────────┐        │
│  │ Person.prototype│  │ Array.prototype│  │Function.prototype│       │
│  │ - sayHello()   │  │ - push()       │  │ - call()        │        │
│  │ - constructor  │  │ - pop()        │  │ - apply()       │        │
│  └────↑───────────┘  │ - map()        │  │ - bind()        │        │
│       │              └────↑───────────┘  └───↑────────────┘        │
│       │                   │                   │                     │
│  ┌────┴────┐         ┌────┴────┐        ┌────┴─────┐               │
│  │ person  │         │  arr    │        │ Function │               │
│  │ (实例)  │         │ (实例)  │        │ Object   │               │
│  └─────────┘         └─────────┘        │ Person   │               │
│                                          └──────────┘               │
└─────────────────────────────────────────────────────────────────────┘
*/
```

### 原型链查找机制

```javascript
// 属性查找沿原型链向上进行

function Animal(name) {
  this.name = name
}
Animal.prototype.species = 'Animal'
Animal.prototype.eat = function() {
  console.log(`${this.name} is eating`)
}

function Dog(name, breed) {
  Animal.call(this, name)
  this.breed = breed
}
Dog.prototype = Object.create(Animal.prototype)
Dog.prototype.constructor = Dog
Dog.prototype.bark = function() {
  console.log(`${this.name} says woof!`)
}

const dog = new Dog('Buddy', 'Golden Retriever')

// 属性查找顺序：
// 1. 自身属性
console.log(dog.name)    // 'Buddy' (自身属性)
console.log(dog.breed)   // 'Golden Retriever' (自身属性)

// 2. Dog.prototype
console.log(dog.bark)    // function (Dog.prototype)

// 3. Animal.prototype
console.log(dog.species) // 'Animal' (Animal.prototype)
console.log(dog.eat)     // function (Animal.prototype)

// 4. Object.prototype
console.log(dog.toString) // function (Object.prototype)

// 5. 找不到返回 undefined
console.log(dog.fly)     // undefined

// 验证查找路径
console.log(dog.hasOwnProperty('name'))     // true
console.log(dog.hasOwnProperty('bark'))     // false
console.log(Dog.prototype.hasOwnProperty('bark'))  // true
```

### 原型的动态性

```javascript
// 原型是动态的，修改原型会影响所有实例

function Person(name) {
  this.name = name
}

const person1 = new Person('Alice')

// 在实例创建后添加原型方法
Person.prototype.greet = function() {
  console.log(`Hello, I'm ${this.name}`)
}

// 已创建的实例也能访问新方法
person1.greet()  // "Hello, I'm Alice"

// 但如果重写整个 prototype，情况就不同了
function Animal() {}
const cat = new Animal()

Animal.prototype.eat = function() {
  console.log('eating')
}
cat.eat()  // 'eating'

// 重写 prototype（切断了原有的引用）
Animal.prototype = {
  constructor: Animal,
  sleep: function() {
    console.log('sleeping')
  }
}

const dog = new Animal()

// 新实例可以访问新原型
dog.sleep()  // 'sleeping'
// dog.eat()  // TypeError: dog.eat is not a function

// 旧实例仍指向旧原型
cat.eat()    // 'eating'
// cat.sleep()  // TypeError: cat.sleep is not a function
```

### 原型污染

```javascript
// 原型污染是一种安全漏洞，通过修改原型影响所有对象

// 危险示例：污染 Object.prototype
Object.prototype.polluted = true

const obj = {}
console.log(obj.polluted)  // true（所有对象都被影响）

// 常见的污染场景：不安全的对象合并
function unsafeMerge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object') {
      target[key] = target[key] || {}
      unsafeMerge(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}

// 攻击者可以利用 __proto__ 进行污染
const malicious = JSON.parse('{"__proto__": {"isAdmin": true}}')
const user = {}
unsafeMerge(user, malicious)

const newUser = {}
console.log(newUser.isAdmin)  // true（被污染了）

// 防御方式1：检查 key
function safeMerge(target, source) {
  for (const key in source) {
    // 跳过危险的 key
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue
    }
    if (typeof source[key] === 'object' && source[key] !== null) {
      target[key] = target[key] || {}
      safeMerge(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}

// 防御方式2：使用 Object.create(null)
const safeDict = Object.create(null)
// safeDict 没有原型，无法被污染

// 防御方式3：使用 Map
const safeMap = new Map()
safeMap.set('__proto__', 'value')  // 安全，只是普通的键值对

// 清理污染
delete Object.prototype.polluted
delete Object.prototype.isAdmin
```

## 继承方式

### 1. 原型链继承

```javascript
function Parent() {
  this.name = 'parent'
  this.colors = ['red', 'blue']
}

Parent.prototype.getName = function() {
  return this.name
}

function Child() {
  this.type = 'child'
}

// 继承
Child.prototype = new Parent()
Child.prototype.constructor = Child

const child1 = new Child()
const child2 = new Child()

// ❌ 问题1: 引用类型共享
child1.colors.push('green')
console.log(child2.colors)  // ['red', 'blue', 'green']

// ❌ 问题2: 无法向父类构造函数传参
```

### 2. 构造函数继承

```javascript
function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue']
}

Parent.prototype.getName = function() {
  return this.name
}

function Child(name, age) {
  Parent.call(this, name)  // 调用父类构造函数
  this.age = age
}

const child1 = new Child('Alice', 18)
const child2 = new Child('Bob', 20)

// ✅ 解决了引用类型共享问题
child1.colors.push('green')
console.log(child2.colors)  // ['red', 'blue']

// ✅ 可以传参
console.log(child1.name)  // 'Alice'

// ❌ 问题: 无法继承父类原型上的方法
console.log(child1.getName)  // undefined
```

### 3. 组合继承 (推荐)

```javascript
function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue']
}

Parent.prototype.getName = function() {
  return this.name
}

function Child(name, age) {
  Parent.call(this, name)  // 第二次调用 Parent
  this.age = age
}

Child.prototype = new Parent()  // 第一次调用 Parent
Child.prototype.constructor = Child

const child = new Child('Alice', 18)

// ✅ 既能继承实例属性,又能继承原型方法
console.log(child.colors)  // ['red', 'blue']
console.log(child.getName())  // 'Alice'

// ❌ 问题: 调用了两次父类构造函数
```

### 4. 寄生组合继承 (最优)

```javascript
function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue']
}

Parent.prototype.getName = function() {
  return this.name
}

function Child(name, age) {
  Parent.call(this, name)
  this.age = age
}

// 关键: 使用 Object.create
Child.prototype = Object.create(Parent.prototype)
Child.prototype.constructor = Child

const child = new Child('Alice', 18)

// ✅ 完美继承,只调用一次父类构造函数
console.log(child.colors)  // ['red', 'blue']
console.log(child.getName())  // 'Alice'
console.log(child instanceof Child)  // true
console.log(child instanceof Parent)  // true
```

### 5. ES6 Class 继承

```javascript
class Parent {
  constructor(name) {
    this.name = name
    this.colors = ['red', 'blue']
  }

  getName() {
    return this.name
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name)  // 必须先调用 super
    this.age = age
  }

  getAge() {
    return this.age
  }
}

const child = new Child('Alice', 18)
console.log(child.getName())  // 'Alice'
console.log(child.getAge())  // 18
```

### 6. 其他继承方式

```javascript
// ==================== 原型式继承 ====================
// Object.create 的前身，适合不需要构造函数的简单继承

function createObject(proto) {
  function F() {}
  F.prototype = proto
  return new F()
}

const person = {
  name: 'Unknown',
  friends: ['Alice', 'Bob'],
  greet() {
    console.log(`Hi, I'm ${this.name}`)
  }
}

const child = createObject(person)
child.name = 'Charlie'
child.greet()  // "Hi, I'm Charlie"

// 等价于 ES5 的 Object.create
const child2 = Object.create(person)

// ❌ 问题: 和原型链继承一样，引用类型共享
child.friends.push('Dave')
console.log(person.friends)  // ['Alice', 'Bob', 'Dave']


// ==================== 寄生式继承 ====================
// 在原型式继承的基础上增强对象

function createEnhancedObject(proto) {
  const clone = Object.create(proto)
  // 增强对象
  clone.sayHi = function() {
    console.log('Hi!')
  }
  return clone
}

const enhancedChild = createEnhancedObject(person)
enhancedChild.sayHi()  // 'Hi!'

// ❌ 问题: 方法不能复用，每次都会创建新函数


// ==================== 混入继承（Mixin）====================
// 将多个对象的属性混入到目标对象

function mixin(target, ...sources) {
  return Object.assign(target, ...sources)
}

const canEat = {
  eat() {
    console.log(`${this.name} is eating`)
  }
}

const canWalk = {
  walk() {
    console.log(`${this.name} is walking`)
  }
}

const canSwim = {
  swim() {
    console.log(`${this.name} is swimming`)
  }
}

class Animal {
  constructor(name) {
    this.name = name
  }
}

// 混入多个能力
mixin(Animal.prototype, canEat, canWalk, canSwim)

const duck = new Animal('Duck')
duck.eat()   // 'Duck is eating'
duck.walk()  // 'Duck is walking'
duck.swim()  // 'Duck is swimming'
```

### 继承方式对比总结

```javascript
/*
┌────────────────┬───────────────┬───────────────┬────────────────┐
│    继承方式     │     优点      │     缺点      │    适用场景    │
├────────────────┼───────────────┼───────────────┼────────────────┤
│  原型链继承    │ 简单直接      │ 引用类型共享  │ 不推荐使用     │
│               │              │ 无法传参      │               │
├────────────────┼───────────────┼───────────────┼────────────────┤
│  构造函数继承  │ 可以传参      │ 无法继承      │ 只需要继承     │
│               │ 引用独立      │ 原型方法      │ 实例属性时     │
├────────────────┼───────────────┼───────────────┼────────────────┤
│  组合继承      │ 功能完整      │ 调用两次      │ ES5 常用方案   │
│               │              │ 父构造函数    │               │
├────────────────┼───────────────┼───────────────┼────────────────┤
│  寄生组合继承  │ 效率高        │ 写法稍复杂    │ ES5 最优方案   │
│               │ 功能完整      │              │               │
├────────────────┼───────────────┼───────────────┼────────────────┤
│  ES6 class    │ 语法简洁      │ 无            │ 现代项目首选   │
│               │ 官方标准      │              │               │
├────────────────┼───────────────┼───────────────┼────────────────┤
│  Mixin        │ 组合灵活      │ 命名冲突      │ 多重继承需求   │
│               │ 不受限于类    │              │               │
└────────────────┴───────────────┴───────────────┴────────────────┘
*/

// 推荐使用顺序：
// 1. ES6 class extends（现代项目首选）
// 2. 寄生组合继承（需要兼容 ES5）
// 3. Mixin（需要多重继承）
```

## 手写实现

### 手写 new

```javascript
function myNew(constructor, ...args) {
  // 1. 创建新对象,原型指向构造函数的 prototype
  const obj = Object.create(constructor.prototype)

  // 2. 执行构造函数,绑定 this
  const result = constructor.apply(obj, args)

  // 3. 如果构造函数返回对象,则返回该对象,否则返回新对象
  return result instanceof Object ? result : obj
}

// 测试
function Person(name, age) {
  this.name = name
  this.age = age
}

Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`)
}

const person = myNew(Person, 'Alice', 18)
person.sayHello()  // Hello, I'm Alice
```

### 手写 instanceof

```javascript
function myInstanceof(obj, constructor) {
  // 基本类型返回 false
  if (typeof obj !== 'object' || obj === null) {
    return false
  }

  // 获取对象的原型
  let proto = Object.getPrototypeOf(obj)

  // 循环查找原型链
  while (proto !== null) {
    if (proto === constructor.prototype) {
      return true
    }
    proto = Object.getPrototypeOf(proto)
  }

  return false
}

// 测试
console.log(myInstanceof([], Array))  // true
console.log(myInstanceof([], Object))  // true
console.log(myInstanceof('', String))  // false (基本类型)
```

### 手写 Object.create

```javascript
function myCreate(proto, propertiesObject) {
  if (typeof proto !== 'object' && typeof proto !== 'function') {
    throw new TypeError('Object prototype may only be an Object or null')
  }

  function F() {}
  F.prototype = proto

  const obj = new F()

  // 支持第二个参数（属性描述符）
  if (propertiesObject !== undefined) {
    Object.defineProperties(obj, propertiesObject)
  }

  // 支持 null 原型
  if (proto === null) {
    obj.__proto__ = null
  }

  return obj
}

// 测试
const parent = { name: 'parent' }
const child = myCreate(parent, {
  age: {
    value: 18,
    writable: true,
    enumerable: true
  }
})
console.log(child.__proto__ === parent)  // true
console.log(child.age)  // 18
```

### 手写 Object.assign

```javascript
function myAssign(target, ...sources) {
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object')
  }

  const to = Object(target)

  for (const source of sources) {
    if (source != null) {
      // 遍历自身可枚举属性（包括 Symbol）
      for (const key of Reflect.ownKeys(source)) {
        // 只复制自身可枚举属性
        if (Object.prototype.propertyIsEnumerable.call(source, key)) {
          to[key] = source[key]
        }
      }
    }
  }

  return to
}

// 测试
const target = { a: 1, b: 2 }
const source = { b: 4, c: 5 }
const result = myAssign(target, source)
console.log(result)  // { a: 1, b: 4, c: 5 }
console.log(target)  // { a: 1, b: 4, c: 5 }（target 被修改）
```

### 手写 Object.getPrototypeOf

```javascript
function myGetPrototypeOf(obj) {
  if (obj == null) {
    throw new TypeError('Cannot convert undefined or null to object')
  }

  // 优先使用 __proto__（非标准但广泛支持）
  if (obj.__proto__ !== undefined) {
    return obj.__proto__
  }

  // 备选方案：通过 constructor
  if (obj.constructor) {
    return obj.constructor.prototype
  }

  return null
}

// 测试
const arr = []
console.log(myGetPrototypeOf(arr) === Array.prototype)  // true
```

### 手写继承工具函数

```javascript
// 寄生组合继承的封装
function inherit(Child, Parent) {
  // 创建父类原型的副本
  const prototype = Object.create(Parent.prototype)

  // 修复 constructor 指向
  prototype.constructor = Child

  // 设置子类原型
  Child.prototype = prototype
}

// 使用示例
function Animal(name) {
  this.name = name
}

Animal.prototype.eat = function() {
  console.log(`${this.name} is eating`)
}

function Dog(name, breed) {
  Animal.call(this, name)
  this.breed = breed
}

// 使用封装的继承函数
inherit(Dog, Animal)

Dog.prototype.bark = function() {
  console.log(`${this.name} says woof!`)
}

const dog = new Dog('Buddy', 'Golden')
dog.eat()   // 'Buddy is eating'
dog.bark()  // 'Buddy says woof!'
console.log(dog instanceof Dog)    // true
console.log(dog instanceof Animal) // true
```

### 手写 class 转 ES5

```javascript
// ES6 class
/*
class Person {
  constructor(name) {
    this.name = name
  }

  static species = 'human'

  static create(name) {
    return new Person(name)
  }

  sayHello() {
    console.log(`Hello, I'm ${this.name}`)
  }

  get fullName() {
    return this.name
  }

  set fullName(value) {
    this.name = value
  }
}
*/

// 转换为 ES5
'use strict'

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function')
  }
}

function _defineProperties(target, props) {
  for (let i = 0; i < props.length; i++) {
    const descriptor = props[i]
    descriptor.enumerable = descriptor.enumerable || false
    descriptor.configurable = true
    if ('value' in descriptor) descriptor.writable = true
    Object.defineProperty(target, descriptor.key, descriptor)
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps)
  if (staticProps) _defineProperties(Constructor, staticProps)
  return Constructor
}

const Person = (function() {
  function Person(name) {
    _classCallCheck(this, Person)
    this.name = name
  }

  _createClass(Person, [
    // 原型方法
    {
      key: 'sayHello',
      value: function sayHello() {
        console.log(`Hello, I'm ${this.name}`)
      }
    },
    // getter
    {
      key: 'fullName',
      get: function() {
        return this.name
      },
      set: function(value) {
        this.name = value
      }
    }
  ], [
    // 静态方法
    {
      key: 'create',
      value: function create(name) {
        return new Person(name)
      }
    }
  ])

  // 静态属性
  Person.species = 'human'

  return Person
})()

// 测试
const p = new Person('Alice')
p.sayHello()           // "Hello, I'm Alice"
console.log(p.fullName)  // 'Alice'
console.log(Person.species)  // 'human'
console.log(Person.create('Bob').name)  // 'Bob'
```

## ES6 Class 深入

### Class 的本质

```javascript
class Person {
  constructor(name) {
    this.name = name
  }

  sayHello() {
    console.log(`Hello, I'm ${this.name}`)
  }

  static create(name) {
    return new Person(name)
  }
}

// class 的本质还是函数
console.log(typeof Person)  // 'function'
console.log(Person === Person.prototype.constructor)  // true

// 方法定义在 prototype 上
console.log(Person.prototype.sayHello)  // function

// 静态方法定义在类本身上
console.log(Person.create)  // function

// 但有一些区别
// 1. 必须使用 new 调用
// Person()  // TypeError

// 2. 原型方法不可枚举
console.log(Object.keys(Person.prototype))  // []（空数组）
console.log(Object.getOwnPropertyNames(Person.prototype))  // ['constructor', 'sayHello']

// 3. 类内部自动严格模式
```

### 私有字段和方法

```javascript
class BankAccount {
  // 私有字段（ES2022）
  #balance = 0
  #transactions = []

  // 静态私有字段
  static #bankName = 'MyBank'

  constructor(initialBalance) {
    this.#balance = initialBalance
  }

  // 私有方法
  #logTransaction(type, amount) {
    this.#transactions.push({
      type,
      amount,
      date: new Date()
    })
  }

  deposit(amount) {
    if (amount > 0) {
      this.#balance += amount
      this.#logTransaction('deposit', amount)
    }
  }

  withdraw(amount) {
    if (amount > 0 && amount <= this.#balance) {
      this.#balance -= amount
      this.#logTransaction('withdraw', amount)
      return true
    }
    return false
  }

  get balance() {
    return this.#balance
  }

  getTransactionHistory() {
    // 返回副本，保护原数据
    return [...this.#transactions]
  }

  // 静态方法访问静态私有字段
  static getBankName() {
    return BankAccount.#bankName
  }
}

const account = new BankAccount(1000)
account.deposit(500)
account.withdraw(200)
console.log(account.balance)  // 1300

// 无法从外部访问私有字段
// console.log(account.#balance)  // SyntaxError
// console.log(account.#transactions)  // SyntaxError

// 检查私有字段是否存在
console.log(#balance in account)  // true

// 静态私有字段
console.log(BankAccount.getBankName())  // 'MyBank'
// console.log(BankAccount.#bankName)  // SyntaxError
```

### super 关键字

```javascript
class Animal {
  constructor(name) {
    this.name = name
  }

  speak() {
    console.log(`${this.name} makes a sound`)
  }

  static create(name) {
    return new this(name)
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    // super() 调用父类构造函数
    // 必须在使用 this 之前调用
    super(name)
    this.breed = breed
  }

  speak() {
    // super.method() 调用父类方法
    super.speak()
    console.log(`${this.name} barks`)
  }

  static create(name, breed) {
    // 静态方法中的 super 指向父类
    console.log('Creating a dog...')
    return new this(name, breed)
  }
}

const dog = new Dog('Buddy', 'Golden')
dog.speak()
// "Buddy makes a sound"
// "Buddy barks"

const dog2 = Dog.create('Max', 'Labrador')
console.log(dog2.name, dog2.breed)  // 'Max' 'Labrador'


// super 的指向
class Parent {
  method() {
    return 'Parent method'
  }
}

class Child extends Parent {
  method() {
    // 在普通方法中，super 指向父类的原型对象
    console.log(super.method())  // 'Parent method'

    // 等价于
    console.log(Parent.prototype.method.call(this))
  }

  static staticMethod() {
    // 在静态方法中，super 指向父类本身
    // super === Parent
  }
}


// super 的注意事项
class Base {
  name = 'base'

  constructor() {
    console.log('Base constructor, name:', this.name)
  }
}

class Derived extends Base {
  name = 'derived'

  constructor() {
    super()  // 此时 this.name 是 'derived'（因为字段声明在 super() 之后执行）
    console.log('Derived constructor, name:', this.name)
  }
}

// 输出：
// "Base constructor, name: derived"
// "Derived constructor, name: derived"
```

### 类的静态初始化块

```javascript
// ES2022 静态初始化块
class Database {
  static connection
  static config = {}

  // 静态初始化块
  static {
    console.log('Initializing Database class...')

    // 可以进行复杂的静态属性初始化
    try {
      this.config = this.#loadConfig()
      this.connection = this.#createConnection()
    } catch (e) {
      this.config = { fallback: true }
      this.connection = null
    }
  }

  static #loadConfig() {
    return {
      host: 'localhost',
      port: 5432
    }
  }

  static #createConnection() {
    // 模拟连接
    return { connected: true }
  }

  static getConnection() {
    return this.connection
  }
}

// 类定义时自动执行静态初始化块
console.log(Database.config)  // { host: 'localhost', port: 5432 }
console.log(Database.getConnection())  // { connected: true }


// 多个静态初始化块按顺序执行
class MultiInit {
  static a = 1

  static {
    console.log('First block:', this.a)  // 1
    this.a = 2
  }

  static b = this.a + 1  // 3

  static {
    console.log('Second block:', this.a, this.b)  // 2, 3
  }
}
```

