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

## 常见面试题

::: details 1. 说说原型链
<details>
<summary>点击查看答案</summary>

**一句话答案**: 原型链是 JavaScript 实现继承的机制，每个对象都有 `__proto__` 指向其构造函数的 `prototype`，形成一条链，直到 `null`。

**详细答案**:

```javascript
// 原型链示意图
/*
实例对象 person
    ↓ __proto__
Person.prototype  { constructor: Person, sayHello: fn }
    ↓ __proto__
Object.prototype  { toString: fn, valueOf: fn, hasOwnProperty: fn }
    ↓ __proto__
null
*/

// 代码验证
function Person(name) {
  this.name = name
}
const person = new Person('Alice')

console.log(person.__proto__ === Person.prototype)  // true
console.log(Person.prototype.__proto__ === Object.prototype)  // true
console.log(Object.prototype.__proto__ === null)  // true
```

**口语化回答**:
"原型链是 JS 实现继承的方式。简单说，每个对象都有一个隐藏属性 `__proto__`，指向创建它的构造函数的 `prototype`。当访问对象的属性时，如果对象本身没有，就会顺着 `__proto__` 往上找，一直找到 `Object.prototype`，再往上就是 `null` 了。这个链条就叫原型链。"
:::

</details>

::: details 2. 如何判断属性是自身的还是原型上的?
<details>
<summary>点击查看答案</summary>

**一句话答案**: 用 `hasOwnProperty` 判断是否是自身属性，用 `in` 操作符判断包括原型链。

```javascript
const obj = { name: 'Alice' }

// hasOwnProperty - 只检查自身属性
console.log(obj.hasOwnProperty('name'))  // true
console.log(obj.hasOwnProperty('toString'))  // false

// in 运算符 - 包括原型链
console.log('name' in obj)  // true
console.log('toString' in obj)  // true

// Object.hasOwn (ES2022，推荐)
console.log(Object.hasOwn(obj, 'name'))  // true
console.log(Object.hasOwn(obj, 'toString'))  // false

// Object.keys - 只返回自身可枚举属性
console.log(Object.keys(obj))  // ['name']

// Object.getOwnPropertyNames - 自身所有属性（包括不可枚举）
console.log(Object.getOwnPropertyNames(obj))  // ['name']
```

**口语化回答**:
"用 `hasOwnProperty` 或者 ES2022 的 `Object.hasOwn` 可以判断属性是不是对象自己的。`in` 操作符会把原型链上的属性也算进去。一般遍历对象时用 `Object.keys` 就只会拿到自身的可枚举属性。"
:::

</details>

::: details 3. `__proto__` 和 `prototype` 的区别？
<details>
<summary>点击查看答案</summary>

**一句话答案**: `prototype` 是函数独有的属性，`__proto__` 是所有对象都有的属性。

**对比**:

| 属性 | 所属 | 作用 |
|------|------|------|
| `prototype` | 函数 | 定义实例的原型 |
| `__proto__` | 所有对象 | 指向对象的原型 |
| `constructor` | prototype 对象 | 指向构造函数 |

```javascript
function Person() {}
const person = new Person()

// prototype 是函数的属性
console.log(Person.prototype)  // { constructor: Person }

// __proto__ 是实例的属性
console.log(person.__proto__ === Person.prototype)  // true

// constructor 指向构造函数
console.log(Person.prototype.constructor === Person)  // true

// 函数也是对象，也有 __proto__
console.log(Person.__proto__ === Function.prototype)  // true
console.log(Function.prototype.__proto__ === Object.prototype)  // true
```

**口语化回答**:
"`prototype` 是函数才有的属性，用来给实例提供原型。`__proto__` 是每个对象都有的，指向它的原型。当我们 `new` 一个构造函数时，新对象的 `__proto__` 就会指向构造函数的 `prototype`。这样实例就能访问原型上的方法了。"
:::

</details>

::: details 4. new 操作符做了什么？
<details>
<summary>点击查看答案</summary>

**一句话答案**: 创建空对象、设置原型、执行构造函数、返回对象。

**四个步骤**:
1. 创建一个空对象
2. 将空对象的 `__proto__` 指向构造函数的 `prototype`
3. 将构造函数的 `this` 指向这个空对象，执行构造函数
4. 如果构造函数返回对象则返回该对象，否则返回新创建的对象

```javascript
// 手写 new
function myNew(Constructor, ...args) {
  // 1. 创建空对象，原型指向构造函数的 prototype
  const obj = Object.create(Constructor.prototype)

  // 2. 执行构造函数，绑定 this
  const result = Constructor.apply(obj, args)

  // 3. 如果构造函数返回对象，则返回该对象；否则返回新对象
  return result instanceof Object ? result : obj
}

// 测试
function Person(name) {
  this.name = name
}
const p = myNew(Person, 'Alice')
console.log(p.name)  // 'Alice'
console.log(p instanceof Person)  // true
```

**口语化回答**:
"`new` 做了四件事：第一，创建一个空对象；第二，把这个对象的原型指向构造函数的 `prototype`；第三，用这个对象作为 `this` 执行构造函数；第四，如果构造函数返回了一个对象就用那个，否则返回新创建的对象。"
:::

</details>

::: details 5. ES6 class 和 ES5 构造函数的区别？
<details>
<summary>点击查看答案</summary>

**一句话答案**: class 是语法糖，本质还是原型继承，但有一些差异。

**主要区别**:

| 特性 | ES5 构造函数 | ES6 class |
|------|-------------|-----------|
| 调用方式 | 可以不用 new | 必须用 new |
| 方法枚举 | 可枚举 | 不可枚举 |
| 严格模式 | 需要手动开启 | 默认严格模式 |
| 变量提升 | 有提升 | 无提升（暂时性死区） |
| 静态方法 | 需手动添加 | 直接用 static |

```javascript
// ES5
function Person(name) {
  this.name = name
}
Person.prototype.sayHello = function() {
  console.log(`Hello, ${this.name}`)
}
Person.create = function(name) {  // 静态方法
  return new Person(name)
}

// ES6
class Person {
  constructor(name) {
    this.name = name
  }
  sayHello() {
    console.log(`Hello, ${this.name}`)
  }
  static create(name) {  // 静态方法
    return new Person(name)
  }
}

// 区别验证
// 1. 必须用 new
// Person()  // TypeError: Class constructor cannot be invoked without 'new'

// 2. 方法不可枚举
console.log(Object.keys(Person.prototype))  // []

// 3. 无变量提升
// const p = new Person()  // ReferenceError（如果写在 class 定义前）
```

**口语化回答**:
"class 本质上是构造函数的语法糖，但有一些区别。class 必须用 new 调用，不能直接当函数调。class 里的方法默认不可枚举。class 没有变量提升，必须先定义再使用。另外 class 内部默认是严格模式。"
:::

</details>

::: details 6. 如何实现继承？各种方式的优缺点？
<details>
<summary>点击查看答案</summary>

**一句话答案**: 推荐使用 ES6 class extends 或寄生组合继承。

| 方式 | 优点 | 缺点 |
|------|------|------|
| 原型链继承 | 简单 | 引用类型共享、无法传参 |
| 构造函数继承 | 可传参、引用独立 | 无法继承原型方法 |
| 组合继承 | 功能完整 | 调用两次父构造函数 |
| 寄生组合继承 | 完美 | 写法稍复杂 |
| ES6 class | 简洁、官方推荐 | 需要编译 |

```javascript
// 寄生组合继承（最优方案）
function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue']
}

Parent.prototype.getName = function() {
  return this.name
}

function Child(name, age) {
  Parent.call(this, name)  // 继承实例属性
  this.age = age
}

// 关键：使用 Object.create 而不是 new Parent()
Child.prototype = Object.create(Parent.prototype)
Child.prototype.constructor = Child

// ES6 class 继承（推荐）
class Parent {
  constructor(name) {
    this.name = name
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
}
```

**口语化回答**:
"JS 继承有好几种方式。原型链继承最简单但有引用类型共享问题。构造函数继承能传参但继承不了原型方法。组合继承结合了两者但会调用两次父构造函数。寄生组合继承是 ES5 的最佳方案，用 `Object.create` 代替 `new Parent()` 来设置原型。现在最推荐的是 ES6 的 class extends，简洁明了。"
:::

</details>

::: details 7. 如何实现多重继承?
<details>
<summary>点击查看答案</summary>

**一句话答案**: JavaScript 不支持多重继承，但可以用 Mixin 模式模拟。

```javascript
// Mixin 模式
const FlyMixin = {
  fly() {
    console.log(`${this.name} is flying`)
  }
}

const SwimMixin = {
  swim() {
    console.log(`${this.name} is swimming`)
  }
}

class Animal {
  constructor(name) {
    this.name = name
  }
}

// 混入多个功能
Object.assign(Animal.prototype, FlyMixin, SwimMixin)

const duck = new Animal('Duck')
duck.fly()   // Duck is flying
duck.swim()  // Duck is swimming

// 更优雅的写法：高阶函数
function withFly(Base) {
  return class extends Base {
    fly() {
      console.log(`${this.name} is flying`)
    }
  }
}

function withSwim(Base) {
  return class extends Base {
    swim() {
      console.log(`${this.name} is swimming`)
    }
  }
}

// 组合使用
class Duck extends withSwim(withFly(Animal)) {}

const duck2 = new Duck('Donald')
duck2.fly()   // Donald is flying
duck2.swim()  // Donald is swimming
```

**口语化回答**:
"JavaScript 原生不支持多重继承，但可以用 Mixin 模式来模拟。简单的方式是用 `Object.assign` 把多个对象的方法混入原型。更优雅的方式是用高阶函数，每个函数接收一个基类返回一个扩展后的类，然后嵌套调用实现多重混入。"
:::

</details>

::: details 8. `Object.create(null)` 和 `{}` 的区别？
<details>
<summary>点击查看答案</summary>

**一句话答案**: `Object.create(null)` 创建的对象没有原型，是真正的空对象。

```javascript
// 普通对象
const obj1 = {}
console.log(obj1.__proto__ === Object.prototype)  // true
console.log(obj1.toString)  // function toString()
console.log(obj1.hasOwnProperty)  // function hasOwnProperty()

// Object.create(null)
const obj2 = Object.create(null)
console.log(obj2.__proto__)  // undefined
console.log(obj2.toString)  // undefined
console.log(obj2.hasOwnProperty)  // undefined

// 使用场景：纯净的字典/Map
const dict = Object.create(null)
dict['__proto__'] = 'value'  // 不会有问题
dict['constructor'] = 'value'  // 不会有问题

// 用 {} 的话
const obj = {}
obj['__proto__'] = 'value'  // 可能有问题
```

**口语化回答**:
"`Object.create(null)` 创建的是一个完全空的对象，没有原型链，没有 `toString`、`hasOwnProperty` 这些继承来的方法。普通的 `{}` 会继承 `Object.prototype` 上的所有方法。`Object.create(null)` 常用于创建纯净的字典对象，避免键名和原型属性冲突，比如用 `__proto__` 或 `constructor` 作为键名时不会出问题。"
:::

</details>

::: details 9. Function.__proto__ 指向什么？
<details>
<summary>点击查看答案</summary>

**一句话答案**: `Function.__proto__` 指向 `Function.prototype`，Function 是自己创建自己。

```javascript
// Function 的特殊性
console.log(Function.__proto__ === Function.prototype)  // true

// 这看起来像鸡生蛋的问题，但实际上是引擎内部处理的
// Function 既是构造函数，也是 Function 的实例

// 验证其他关系
console.log(Function.prototype.__proto__ === Object.prototype)  // true
console.log(Object.__proto__ === Function.prototype)  // true（Object 也是函数）

// 完整关系
/*
Function ─┬─ prototype ───→ Function.prototype
          └─ __proto__ ────→ Function.prototype ───→ Object.prototype ───→ null
                                    ↑
Object ───── __proto__ ─────────────┘
*/

// 所有函数都是 Function 的实例
function foo() {}
console.log(foo.__proto__ === Function.prototype)  // true
console.log(foo instanceof Function)  // true
console.log(Function instanceof Function)  // true
console.log(Object instanceof Function)  // true
```

**口语化回答**:
"`Function.__proto__` 指向 `Function.prototype`，这是一个特殊情况。可以理解为 Function 是自己创建自己的。这在 JavaScript 引擎内部有特殊处理。同时，因为 Object 也是一个函数，所以 `Object.__proto__` 也指向 `Function.prototype`。所有函数的 `__proto__` 都指向 `Function.prototype`。"
:::

</details>

::: details 10. 什么是原型污染？如何防范？
<details>
<summary>点击查看答案</summary>

**一句话答案**: 原型污染是通过修改原型对象影响所有继承对象的安全漏洞。

```javascript
// 原型污染示例
const maliciousPayload = '{"__proto__": {"isAdmin": true}}'
const parsed = JSON.parse(maliciousPayload)

// 不安全的对象合并
function unsafeMerge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object') {
      target[key] = target[key] || {}
      unsafeMerge(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
}

const obj = {}
unsafeMerge(obj, parsed)

// 所有对象都被污染了
const newObj = {}
console.log(newObj.isAdmin)  // true（危险！）

// 防范措施
// 1. 检查危险的键名
function safeMerge(target, source) {
  for (const key in source) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue  // 跳过危险的键
    }
    // ...
  }
}

// 2. 使用 Object.create(null) 创建无原型对象
const safeDict = Object.create(null)

// 3. 使用 Map 替代普通对象
const safeMap = new Map()

// 4. 使用 Object.freeze 冻结原型
Object.freeze(Object.prototype)

// 5. 使用 JSON schema 验证输入
```

**口语化回答**:
"原型污染是一种安全漏洞。攻击者通过恶意数据修改了 `Object.prototype` 这样的原型对象，导致所有继承该原型的对象都受影响。常见于不安全的对象合并操作。防范方法包括：检查并过滤 `__proto__`、`constructor` 等危险键名；使用 `Object.create(null)` 创建纯净字典；用 `Map` 替代对象；或者冻结原型对象。"
:::

</details>

::: details 11. 如何安全地检查对象是否有某个属性？
<details>
<summary>点击查看答案</summary>

**一句话答案**: 使用 `Object.hasOwn()` (ES2022) 或 `Object.prototype.hasOwnProperty.call()`。

```javascript
const obj = { name: 'Alice' }

// ❌ 不推荐：直接调用 hasOwnProperty
// 如果对象覆盖了这个方法或用 Object.create(null) 创建，会出问题
obj.hasOwnProperty('name')  // 可能不安全

// ❌ 不安全示例
const unsafeObj = {
  hasOwnProperty: () => false  // 覆盖了方法
}
console.log(unsafeObj.hasOwnProperty('hasOwnProperty'))  // false（错误结果）

const nullProtoObj = Object.create(null)
nullProtoObj.name = 'Bob'
// nullProtoObj.hasOwnProperty('name')  // TypeError: not a function

// ✅ 推荐方式 1: Object.hasOwn() (ES2022)
console.log(Object.hasOwn(obj, 'name'))  // true
console.log(Object.hasOwn(unsafeObj, 'hasOwnProperty'))  // true
console.log(Object.hasOwn(nullProtoObj, 'name'))  // true

// ✅ 推荐方式 2: Object.prototype.hasOwnProperty.call()
console.log(Object.prototype.hasOwnProperty.call(obj, 'name'))  // true
console.log(Object.prototype.hasOwnProperty.call(nullProtoObj, 'name'))  // true

// ✅ 推荐方式 3: 使用 in 操作符（包含原型链）
console.log('name' in obj)  // true
console.log('toString' in obj)  // true（原型链上的属性）

// 区分自身和原型属性
function hasOwnAndInherited(obj, prop) {
  const hasOwn = Object.hasOwn(obj, prop)
  const hasInherited = prop in obj && !hasOwn
  return { hasOwn, hasInherited }
}

console.log(hasOwnAndInherited(obj, 'name'))     // { hasOwn: true, hasInherited: false }
console.log(hasOwnAndInherited(obj, 'toString')) // { hasOwn: false, hasInherited: true }
```

**口语化回答**:
"最安全的方式是使用 ES2022 的 `Object.hasOwn(obj, prop)`。如果要兼容旧环境，用 `Object.prototype.hasOwnProperty.call(obj, prop)`。不要直接调用 `obj.hasOwnProperty()`，因为这个方法可能被覆盖，或者对象可能是用 `Object.create(null)` 创建的没有这个方法。"
:::

</details>

::: details 12. 说说 getter 和 setter 在原型上的行为
<details>
<summary>点击查看答案</summary>

**一句话答案**: 原型上的 getter/setter 会在访问/设置属性时被调用，但 setter 设置的值会成为实例的自身属性。

```javascript
const proto = {
  _value: 0,
  get value() {
    console.log('getter called')
    return this._value
  },
  set value(v) {
    console.log('setter called')
    this._value = v
  }
}

const obj = Object.create(proto)

// 访问会触发原型上的 getter
console.log(obj.value)  // 'getter called', 0

// 设置会触发原型上的 setter，但 _value 会成为 obj 的自身属性
obj.value = 42  // 'setter called'
console.log(obj._value)  // 42

// 验证属性归属
console.log(obj.hasOwnProperty('_value'))  // true（自身属性）
console.log(obj.hasOwnProperty('value'))   // false（原型上的访问器）

// 注意：如果直接赋值会覆盖原型上的访问器
const obj2 = Object.create(proto)
Object.defineProperty(obj2, 'value', {
  value: 100,
  writable: true
})
console.log(obj2.value)  // 100（不会触发 getter）

// 实际应用：计算属性
class Circle {
  constructor(radius) {
    this._radius = radius
  }

  get radius() {
    return this._radius
  }

  set radius(value) {
    if (value < 0) throw new Error('Radius cannot be negative')
    this._radius = value
  }

  get area() {
    return Math.PI * this._radius ** 2
  }

  get circumference() {
    return 2 * Math.PI * this._radius
  }
}

const circle = new Circle(5)
console.log(circle.area)  // ~78.54
circle.radius = 10
console.log(circle.area)  // ~314.16
```

**口语化回答**:
"当访问一个属性时，如果对象本身没有这个属性，就会去原型上找。如果原型上是 getter/setter，就会触发它们。setter 里设置的值会作为实例的自身属性存储，所以不会影响原型上的数据。这个特性常用于实现计算属性和属性验证。"
:::

</details>

::: details 13. Symbol.species 有什么作用？
<details>
<summary>点击查看答案</summary>

**一句话答案**: `Symbol.species` 允许子类覆盖返回实例的构造函数，影响 `map`、`filter` 等方法的返回类型。

```javascript
// 默认行为：子类的方法返回子类实例
class MyArray extends Array {}

const arr = new MyArray(1, 2, 3)
const mapped = arr.map(x => x * 2)

console.log(mapped instanceof MyArray)  // true
console.log(mapped instanceof Array)    // true

// 使用 Symbol.species 改变返回类型
class SpecialArray extends Array {
  static get [Symbol.species]() {
    return Array  // 让派生方法返回 Array 而不是 SpecialArray
  }

  sum() {
    return this.reduce((a, b) => a + b, 0)
  }
}

const special = new SpecialArray(1, 2, 3)
console.log(special.sum())  // 6

const filtered = special.filter(x => x > 1)
console.log(filtered instanceof SpecialArray)  // false
console.log(filtered instanceof Array)         // true
// filtered.sum()  // TypeError: filtered.sum is not a function

// 实际应用：Promise 子类
class MyPromise extends Promise {
  static get [Symbol.species]() {
    return Promise  // then/catch 返回普通 Promise
  }

  // 添加自定义方法
  timeout(ms) {
    return Promise.race([
      this,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), ms)
      )
    ])
  }
}

const p = new MyPromise(resolve => resolve(42))
const chained = p.then(x => x * 2)
console.log(chained instanceof MyPromise)  // false
console.log(chained instanceof Promise)    // true

// 其他支持 Symbol.species 的内置类
// - Array
// - ArrayBuffer
// - Map
// - Set
// - Promise
// - RegExp
// - TypedArray (Int8Array, etc.)
```

**口语化回答**:
"`Symbol.species` 用于指定派生对象的构造函数。比如你继承了 Array，调用 `map()` 默认会返回子类的实例。如果你想让它返回普通数组，就定义静态的 `[Symbol.species]` getter 返回 `Array`。这在创建工具类时很有用，可以避免链式调用时每次都创建自定义类的实例。"
:::

</details>

::: details 14. 如何让一个对象不可被继承？
<details>
<summary>点击查看答案</summary>

**一句话答案**: 使用 `Object.preventExtensions()`、`Object.seal()` 或 `Object.freeze()`。

```javascript
// 方法1: Object.preventExtensions - 禁止添加属性
const obj1 = { a: 1 }
Object.preventExtensions(obj1)

obj1.a = 2  // ✅ 可以修改
obj1.b = 3  // ❌ 静默失败（严格模式下报错）
delete obj1.a  // ✅ 可以删除
console.log(Object.isExtensible(obj1))  // false

// 方法2: Object.seal - 禁止添加/删除属性
const obj2 = { a: 1 }
Object.seal(obj2)

obj2.a = 2  // ✅ 可以修改
obj2.b = 3  // ❌ 禁止添加
delete obj2.a  // ❌ 禁止删除
console.log(Object.isSealed(obj2))  // true

// 方法3: Object.freeze - 完全冻结（最严格）
const obj3 = { a: 1 }
Object.freeze(obj3)

obj3.a = 2  // ❌ 禁止修改
obj3.b = 3  // ❌ 禁止添加
delete obj3.a  // ❌ 禁止删除
console.log(Object.isFrozen(obj3))  // true

// 注意：freeze 是浅冻结
const nested = { inner: { value: 1 } }
Object.freeze(nested)
nested.inner.value = 2  // ✅ 嵌套对象可以修改
console.log(nested.inner.value)  // 2

// 深度冻结
function deepFreeze(obj) {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      deepFreeze(obj[key])
    }
  })
  return Object.freeze(obj)
}

// 对比总结
/*
┌─────────────────────┬──────────┬──────────┬──────────┐
│       操作          │ prevent  │   seal   │  freeze  │
│                     │Extensions│          │          │
├─────────────────────┼──────────┼──────────┼──────────┤
│ 添加新属性          │    ❌    │    ❌    │    ❌    │
│ 删除已有属性        │    ✅    │    ❌    │    ❌    │
│ 修改已有属性值      │    ✅    │    ✅    │    ❌    │
│ 修改属性描述符      │    ✅    │    ❌    │    ❌    │
│ 修改原型            │    ❌    │    ❌    │    ❌    │
└─────────────────────┴──────────┴──────────┴──────────┘
*/
```

**口语化回答**:
"有三个方法：`preventExtensions` 只是禁止添加新属性；`seal` 在此基础上禁止删除属性和修改属性描述符；`freeze` 是最严格的，完全冻结对象，属性值也不能改。但要注意，这些都是浅操作，嵌套对象需要递归处理才能深度冻结。"
:::

</details>

::: details 15. 原型方法和实例方法的区别？什么时候用哪个？
<details>
<summary>点击查看答案</summary>

**一句话答案**: 原型方法被所有实例共享节省内存，实例方法每个实例独立可访问私有数据。

```javascript
class Person {
  constructor(name) {
    this.name = name
    this._id = Math.random()

    // 实例方法：每个实例有自己的一份
    this.getIdInstance = function() {
      return this._id  // 可以访问私有变量
    }
  }

  // 原型方法：所有实例共享一份
  getName() {
    return this.name
  }

  // 静态方法：属于类本身
  static create(name) {
    return new Person(name)
  }
}

const p1 = new Person('Alice')
const p2 = new Person('Bob')

// 原型方法是共享的
console.log(p1.getName === p2.getName)  // true

// 实例方法每个实例都有一份
console.log(p1.getIdInstance === p2.getIdInstance)  // false

// 内存对比
// - 1000 个实例，原型方法只有 1 份
// - 1000 个实例，实例方法有 1000 份

// 什么时候用实例方法？
// 1. 需要访问闭包中的私有变量（ES6 之前的私有属性模式）
function Counter() {
  let count = 0  // 私有变量

  this.increment = function() {
    return ++count  // 实例方法可以访问闭包
  }
}

// 2. 需要在构造函数中动态创建方法
function DynamicClass(config) {
  if (config.type === 'A') {
    this.method = function() { /* A 的实现 */ }
  } else {
    this.method = function() { /* B 的实现 */ }
  }
}

// 什么时候用原型方法？
// 1. 大多数情况（节省内存）
// 2. 需要被所有实例共享的方法
// 3. 可能被继承和覆盖的方法

// ES6 类中的箭头函数字段（实例方法的语法糖）
class Button {
  // 这实际上是实例方法！
  handleClick = () => {
    console.log('clicked', this.name)
  }

  // 这是原型方法
  handleHover() {
    console.log('hovered', this.name)
  }
}

const btn1 = new Button()
const btn2 = new Button()
console.log(btn1.handleClick === btn2.handleClick)  // false（实例方法）
console.log(btn1.handleHover === btn2.handleHover)  // true（原型方法）
```

**口语化回答**:
"原型方法定义在 `prototype` 上，所有实例共享同一份，节省内存。实例方法在构造函数中用 `this.method = function(){}` 定义，每个实例有自己的一份。一般优先用原型方法。实例方法主要用于需要访问构造函数闭包中的私有变量，或者 React 中需要绑定 this 的事件处理函数（用类字段的箭头函数）。"
:::

</details>

::: details 16. 如何检测一个对象是否是某个类的实例？
<details>
<summary>点击查看答案</summary>

**一句话答案**: 使用 `instanceof`、`Object.prototype.isPrototypeOf` 或 `constructor` 属性。

```javascript
class Animal {}
class Dog extends Animal {}
const dog = new Dog()

// 方法1: instanceof
console.log(dog instanceof Dog)     // true
console.log(dog instanceof Animal)  // true
console.log(dog instanceof Object)  // true

// 方法2: isPrototypeOf
console.log(Dog.prototype.isPrototypeOf(dog))     // true
console.log(Animal.prototype.isPrototypeOf(dog))  // true

// 方法3: constructor
console.log(dog.constructor === Dog)  // true
// 注意：constructor 可能被修改，不太可靠

// 方法4: Symbol.hasInstance（自定义 instanceof 行为）
class Even {
  static [Symbol.hasInstance](obj) {
    return Number.isInteger(obj) && obj % 2 === 0
  }
}
console.log(2 instanceof Even)   // true
console.log(3 instanceof Even)   // false
console.log('2' instanceof Even) // false

// 跨 iframe/window 的问题
// instanceof 会失败，因为不同 window 的构造函数不同
// 解决方案：使用 duck typing 或 Symbol
const isArray1 = arr => arr instanceof Array  // 可能失败
const isArray2 = arr => Array.isArray(arr)    // 可靠

// 更可靠的类型检测
function getType(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1)
}
console.log(getType([]))        // 'Array'
console.log(getType({}))        // 'Object'
console.log(getType(new Date))  // 'Date'
console.log(getType(null))      // 'Null'

// 自定义 toStringTag
class MyClass {
  get [Symbol.toStringTag]() {
    return 'MyClass'
  }
}
console.log(getType(new MyClass()))  // 'MyClass'
```

**口语化回答**:
"最常用的是 `instanceof`，但它有跨 iframe 的问题。更可靠的方式是 `Object.prototype.toString.call()`，它能准确返回内置类型。对于数组专门用 `Array.isArray()`。如果需要自定义 instanceof 的行为，可以定义 `Symbol.hasInstance` 静态方法。"
:::

</details>
