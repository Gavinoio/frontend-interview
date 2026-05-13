# 设计模式概述

## 什么是设计模式

设计模式（Design Pattern）是软件开发过程中，针对特定问题的、经过反复实践而总结出的、可复用的解决方案。它不是代码，而是一种解决问题的思路和方法论。

### 设计模式的三个要素

1. **问题（Problem）**：在什么情况下使用该模式
2. **解决方案（Solution）**：如何解决该问题的设计思路
3. **效果（Consequences）**：使用该模式的优缺点和权衡

### 为什么要学习设计模式

- **提高代码质量**：更好的可维护性、可扩展性、可复用性
- **统一沟通语言**：团队成员用相同的术语交流设计思想
- **解决常见问题**：避免重复造轮子，站在巨人的肩膀上
- **面试必考**：几乎所有大厂面试都会考察设计模式

## 设计模式分类

根据《设计模式：可复用面向对象软件的基础》（Gang of Four，简称 GoF），设计模式主要分为三大类：

### 1. 创建型模式（Creational Patterns）

关注对象的创建过程，解决对象创建时的复杂性问题。

| 模式 | 描述 | 前端常用度 |
|------|------|------------|
| **单例模式** | 确保一个类只有一个实例，并提供全局访问点 | ⭐⭐⭐⭐⭐ |
| **工厂模式** | 定义创建对象的接口，让子类决定实例化哪个类 | ⭐⭐⭐⭐ |
| **抽象工厂** | 创建相关或依赖对象的家族，无需指定具体类 | ⭐⭐⭐ |
| **建造者模式** | 将复杂对象的构建与表示分离 | ⭐⭐⭐ |
| **原型模式** | 通过复制现有对象来创建新对象 | ⭐⭐⭐ |

### 2. 结构型模式（Structural Patterns）

关注类和对象的组合，通过组合获得新功能。

| 模式 | 描述 | 前端常用度 |
|------|------|------------|
| **代理模式** | 为对象提供代理以控制对其的访问 | ⭐⭐⭐⭐⭐ |
| **装饰器模式** | 动态地给对象添加额外的职责 | ⭐⭐⭐⭐ |
| **适配器模式** | 将一个类的接口转换成客户希望的另一个接口 | ⭐⭐⭐⭐ |
| **桥接模式** | 将抽象部分与实现部分分离 | ⭐⭐ |
| **外观模式** | 为子系统提供统一的高层接口 | ⭐⭐⭐ |
| **组合模式** | 将对象组合成树形结构表示"部分-整体"层次 | ⭐⭐⭐ |
| **享元模式** | 运用共享技术有效支持大量细粒度对象 | ⭐⭐ |

### 3. 行为型模式（Behavioral Patterns）

关注对象之间的通信和职责分配。

| 模式 | 描述 | 前端常用度 |
|------|------|------------|
| **观察者模式** | 定义对象间的一对多依赖，当对象状态改变时通知所有依赖者 | ⭐⭐⭐⭐⭐ |
| **发布订阅** | 对象间松耦合的消息通信机制 | ⭐⭐⭐⭐⭐ |
| **策略模式** | 定义一系列算法，封装起来并使它们可以互相替换 | ⭐⭐⭐⭐ |
| **命令模式** | 将请求封装为对象，从而可以参数化客户端 | ⭐⭐⭐ |
| **迭代器模式** | 提供顺序访问聚合对象元素的方法 | ⭐⭐⭐⭐ |
| **模板方法** | 定义算法骨架，延迟某些步骤到子类 | ⭐⭐⭐ |
| **责任链模式** | 避免请求发送者与接收者耦合，让多个对象都有机会处理请求 | ⭐⭐⭐ |
| **中介者模式** | 用中介对象封装一系列对象交互 | ⭐⭐ |
| **备忘录模式** | 在不破坏封装的前提下捕获对象内部状态 | ⭐⭐ |
| **状态模式** | 允许对象在内部状态改变时改变其行为 | ⭐⭐⭐ |
| **访问者模式** | 将数据结构与数据操作分离 | ⭐ |

## 前端常用设计模式概览

在前端开发中，以下设计模式最为常用且重要：

### 高频使用（面试必考）

1. **[单例模式](./singleton.md)**
   - 全局状态管理（Vuex、Redux）
   - 全局弹窗、Loading 组件
   - 全局缓存管理

2. **[观察者模式与发布订阅](./observer.md)**
   - Vue 响应式系统
   - React Hooks（useEffect）
   - 事件总线（EventBus）
   - DOM 事件监听

3. **[代理模式](./proxy.md)**
   - Vue 3 响应式系统（Proxy）
   - 图片懒加载
   - 缓存代理
   - 数据拦截与验证

4. **[策略模式](./strategy.md)**
   - 表单验证
   - 动画效果切换
   - 支付方式选择
   - 权限控制

### 中等频率

5. **[工厂模式](./factory.md)**
   - 组件创建（React.createElement）
   - 不同类型对象的批量创建
   - jQuery 的 $() 方法

6. **[装饰器模式](./decorator.md)**
   - AOP 编程（日志、性能监控）
   - TypeScript/JavaScript 装饰器
   - React 高阶组件（HOC）
   - 函数增强

7. **适配器模式**
   - 第三方库接口适配
   - 数据格式转换
   - 兼容性处理

8. **迭代器模式**
   - ES6 Iterator
   - Generator 函数
   - for...of 循环

### 其他实用模式

9. **命令模式**
   - 撤销/重做功能
   - 宏命令（批量操作）

10. **责任链模式**
    - 中间件机制（Koa、Express）
    - 事件冒泡
    - 职责传递

## SOLID 设计原则

SOLID 是面向对象设计的五大基本原则，是设计模式的理论基础。

### 1. 单一职责原则（Single Responsibility Principle, SRP）

**定义**：一个类应该只有一个引起它变化的原因。

**解释**：每个类或模块只负责一件事，降低代码耦合度。

```javascript
// ❌ 不好的设计：一个类做了太多事情
class User {
  constructor(name) {
    this.name = name;
  }

  // 用户业务逻辑
  getName() {
    return this.name;
  }

  // 数据库操作
  save() {
    console.log('保存到数据库');
  }

  // 日志记录
  log() {
    console.log('记录日志');
  }
}

// ✅ 好的设计：职责分离
class User {
  constructor(name) {
    this.name = name;
  }

  getName() {
    return this.name;
  }
}

class UserRepository {
  save(user) {
    console.log('保存到数据库', user);
  }
}

class Logger {
  log(message) {
    console.log('记录日志:', message);
  }
}
```

### 2. 开放封闭原则（Open-Closed Principle, OCP）

**定义**：软件实体应该对扩展开放，对修改封闭。

**解释**：当需求变化时，通过扩展来实现新功能，而不是修改已有代码。

```javascript
// ❌ 不好的设计：每次新增图形都要修改代码
class AreaCalculator {
  calculate(shape) {
    if (shape.type === 'circle') {
      return Math.PI * shape.radius ** 2;
    } else if (shape.type === 'rectangle') {
      return shape.width * shape.height;
    }
    // 新增正方形时需要修改这里
  }
}

// ✅ 好的设计：通过扩展新增功能
class Shape {
  area() {
    throw new Error('子类必须实现 area 方法');
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }

  area() {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }

  area() {
    return this.width * this.height;
  }
}

// 新增正方形只需扩展，不需修改已有代码
class Square extends Shape {
  constructor(side) {
    super();
    this.side = side;
  }

  area() {
    return this.side ** 2;
  }
}

class AreaCalculator {
  calculate(shape) {
    return shape.area();
  }
}
```

### 3. 里氏替换原则（Liskov Substitution Principle, LSP）

**定义**：子类必须能够替换其基类。

**解释**：子类应该可以替换父类并出现在父类能够出现的任何地方，且行为一致。

```javascript
// ❌ 违反里氏替换原则
class Bird {
  fly() {
    console.log('飞翔');
  }
}

class Penguin extends Bird {
  fly() {
    throw new Error('企鹅不会飞'); // 企鹅不能替换鸟
  }
}

// ✅ 符合里氏替换原则
class Bird {
  move() {
    console.log('移动');
  }
}

class FlyingBird extends Bird {
  fly() {
    console.log('飞翔');
  }
}

class Penguin extends Bird {
  swim() {
    console.log('游泳');
  }
}

class Sparrow extends FlyingBird {
  fly() {
    console.log('麻雀飞翔');
  }
}
```

### 4. 接口隔离原则（Interface Segregation Principle, ISP）

**定义**：客户端不应该依赖它不需要的接口。

**解释**：使用多个专门的接口，而不是单一的总接口。

```javascript
// ❌ 不好的设计：接口过于庞大
class Worker {
  work() {}
  eat() {}
  sleep() {}
}

class Robot extends Worker {
  work() {
    console.log('机器人工作');
  }

  eat() {
    // 机器人不需要吃饭，但被迫实现
    throw new Error('机器人不需要吃饭');
  }

  sleep() {
    // 机器人不需要睡觉，但被迫实现
    throw new Error('机器人不需要睡觉');
  }
}

// ✅ 好的设计：接口隔离
class Workable {
  work() {
    throw new Error('必须实现 work 方法');
  }
}

class Eatable {
  eat() {
    throw new Error('必须实现 eat 方法');
  }
}

class Sleepable {
  sleep() {
    throw new Error('必须实现 sleep 方法');
  }
}

class Human extends Workable {
  work() {
    console.log('人类工作');
  }
}

// 可以通过组合实现多个接口
Object.assign(Human.prototype, Eatable.prototype, Sleepable.prototype);

class Robot extends Workable {
  work() {
    console.log('机器人工作');
  }
  // 只需要实现工作接口
}
```

### 5. 依赖倒置原则（Dependency Inversion Principle, DIP）

**定义**：
- 高层模块不应该依赖低层模块，两者都应该依赖抽象
- 抽象不应该依赖细节，细节应该依赖抽象

**解释**：面向接口编程，而不是面向实现编程。

```javascript
// ❌ 不好的设计：高层依赖低层具体实现
class MySQLDatabase {
  save(data) {
    console.log('保存到 MySQL:', data);
  }
}

class UserService {
  constructor() {
    this.db = new MySQLDatabase(); // 直接依赖具体实现
  }

  saveUser(user) {
    this.db.save(user);
  }
}

// ✅ 好的设计：依赖抽象
class Database {
  save(data) {
    throw new Error('必须实现 save 方法');
  }
}

class MySQLDatabase extends Database {
  save(data) {
    console.log('保存到 MySQL:', data);
  }
}

class MongoDBDatabase extends Database {
  save(data) {
    console.log('保存到 MongoDB:', data);
  }
}

class UserService {
  constructor(database) {
    this.db = database; // 依赖抽象（接口）
  }

  saveUser(user) {
    this.db.save(user);
  }
}

// 使用时注入依赖
const mysqlDb = new MySQLDatabase();
const userService = new UserService(mysqlDb);

// 可以轻松切换数据库
const mongoDb = new MongoDBDatabase();
const userService2 = new UserService(mongoDb);
```

## 设计模式与 SOLID 的关系

不同的设计模式体现了不同的 SOLID 原则：

| 设计模式 | 体现的原则 |
|---------|-----------|
| 单例模式 | SRP - 单一职责 |
| 工厂模式 | OCP - 开放封闭、DIP - 依赖倒置 |
| 策略模式 | OCP - 开放封闭、LSP - 里氏替换 |
| 装饰器模式 | OCP - 开放封闭、SRP - 单一职责 |
| 代理模式 | OCP - 开放封闭、SRP - 单一职责 |
| 适配器模式 | ISP - 接口隔离 |
| 观察者模式 | OCP - 开放封闭、DIP - 依赖倒置 |

## 学习路线建议

### 第一阶段：必会模式（面试高频）

1. **单例模式** - 最简单，先从这里开始
2. **观察者模式与发布订阅** - 前端核心，Vue/React 基础
3. **代理模式** - Vue 3 原理，ES6 Proxy
4. **策略模式** - 替代 if-else，提高代码质量

### 第二阶段：常用模式

5. **工厂模式** - 组件创建
6. **装饰器模式** - AOP 编程
7. **适配器模式** - 接口转换
8. **迭代器模式** - ES6 基础

### 第三阶段：进阶模式

9. **命令模式** - 撤销重做
10. **责任链模式** - 中间件机制
11. **状态模式** - 状态管理
12. **组合模式** - 树形结构

## 如何学习设计模式

1. **理解问题**：先理解模式要解决什么问题
2. **掌握结构**：了解模式的组成部分和类图
3. **编写代码**：手写实现，加深理解
4. **实际应用**：在项目中使用，体会优势
5. **对比总结**：对比不同模式的区别和适用场景

## 面试中的设计模式

::: details 常见面试题
1. **描述一下你了解的设计模式**
   - 分类说明：创建型、结构型、行为型
   - 举例说明：单例、观察者、代理等
   - 实际应用：在项目中的使用经验

2. **观察者模式和发布订阅模式的区别**
   - 这是最高频的面试题，必须掌握

3. **Vue 2 和 Vue 3 响应式原理的区别**
   - Object.defineProperty vs Proxy
   - 代理模式的应用

4. **手写单例模式**
   - 闭包实现
   - ES6 class 实现
   - 模块化实现

5. **手写发布订阅模式（EventEmitter）**
   - on、off、emit、once 方法
   - 完整实现

6. **策略模式如何优化 if-else**
   - 实际案例
   - 代码对比
:::

::: details 回答技巧
1. **概念清晰**：先说定义，再说特点
2. **举例说明**：结合实际项目经验
3. **对比分析**：说明优缺点和适用场景
4. **手写代码**：准备常见模式的实现
5. **原理深入**：理解框架中的应用（Vue、React）
:::

## 总结

设计模式是前端进阶的必经之路，不仅能提升代码质量，还是面试中的重点考察内容。建议：

- **循序渐进**：从简单到复杂，从常用到少用
- **理论结合实践**：在实际项目中应用
- **手写代码**：多写多练，加深理解
- **源码学习**：阅读 Vue、React 等框架源码
- **总结归纳**：整理笔记，形成知识体系

接下来，让我们深入学习每个具体的设计模式！
