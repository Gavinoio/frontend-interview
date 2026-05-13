# 设计模式面试题精选

> 汇总单例、观察者、工厂、策略、代理、装饰器等高频设计模式面试题。

## 基础概念

::: details 1. 什么是设计模式？前端常用哪些？
设计模式是解决软件设计中常见问题的可复用方案，分三大类：
- **创建型**：单例、工厂、抽象工厂、建造者、原型
- **结构型**：代理、装饰器、适配器、外观、组合
- **行为型**：观察者、策略、命令、迭代器、模板方法

**前端最常用**：单例、观察者/发布订阅、工厂、策略、代理、装饰器

---
:::

## 单例模式

::: details 2. 单例模式的实现和应用场景？
确保一个类只有一个实例，并提供全局访问点。

```javascript
class Singleton {
    static instance = null;

    static getInstance() {
        if (!Singleton.instance) {
            Singleton.instance = new Singleton();
        }
        return Singleton.instance;
    }
}

// 更简洁的模块单例（ES Module 天然单例）
// store.js
export const store = { state: {} }; // 模块只加载一次
```

**前端应用场景**：全局状态管理（Vuex/Pinia store）、全局事件总线、弹窗管理器、WebSocket 连接、日志系统

---
:::

## 观察者模式 vs 发布订阅模式

::: details 3. 观察者模式和发布订阅模式的区别？
| 特性 | 观察者模式 | 发布订阅模式 |
|------|----------|------------|
| 耦合度 | 观察者和被观察者直接依赖 | 通过事件中心解耦，完全不知道对方 |
| 通信 | 直接调用观察者方法 | 通过事件名通信 |
| 典型实现 | Vue 响应式、DOM 事件 | EventBus、Node.js EventEmitter、Redux |

```javascript
// 手写 EventEmitter（高频手写题）
class EventEmitter {
    constructor() { this.events = {}; }

    on(event, listener) {
        (this.events[event] ??= []).push(listener);
        return this;
    }

    off(event, listener) {
        this.events[event] = this.events[event]?.filter(l => l !== listener);
        return this;
    }

    emit(event, ...args) {
        this.events[event]?.forEach(l => l(...args));
        return this;
    }

    once(event, listener) {
        const wrapper = (...args) => { listener(...args); this.off(event, wrapper); };
        return this.on(event, wrapper);
    }
}
```

---
:::

## 工厂模式

::: details 4. 工厂模式有哪几种？各有什么区别？
| 类型 | 说明 | 适用场景 |
|------|------|---------|
| **简单工厂** | 一个函数/类根据参数创建不同对象 | 创建逻辑简单，类型固定 |
| **工厂方法** | 定义创建接口，子类决定实例化哪个类 | 需要扩展新类型，符合开闭原则 |
| **抽象工厂** | 创建一系列相关对象的接口 | 产品族（如不同主题的 UI 组件套件） |

```javascript
// 简单工厂（前端最常用）
function createComponent(type, props) {
    const map = { button: Button, input: Input, select: Select };
    const Component = map[type];
    if (!Component) throw new Error(`Unknown type: ${type}`);
    return new Component(props);
}

// 工厂方法（Vue/React 组件注册本质）
class ComponentFactory {
    create(props) { throw new Error('子类必须实现'); }
}
class ButtonFactory extends ComponentFactory {
    create(props) { return new Button(props); }
}
```

---
:::

## 策略模式

::: details 5. 策略模式的应用场景？
将算法封装成独立的策略类，使它们可以互相替换，消除大量 if-else。

```javascript
// ❌ 不用策略模式
function getDiscount(type, price) {
    if (type === 'vip') return price * 0.8;
    if (type === 'svip') return price * 0.6;
    if (type === 'normal') return price;
}

// ✅ 策略模式
const discountStrategies = {
    vip: price => price * 0.8,
    svip: price => price * 0.6,
    normal: price => price,
};

function getDiscount(type, price) {
    const strategy = discountStrategies[type];
    if (!strategy) throw new Error(`Unknown type: ${type}`);
    return strategy(price);
}
```

**前端应用**：表单验证规则、权限控制、动画策略、排序算法切换

---
:::

## 代理模式

::: details 6. 代理模式在前端的应用？
为对象提供一个代理，控制对该对象的访问。

```javascript
// ES6 Proxy（Vue 3 响应式的核心）
const handler = {
    get(target, key) {
        console.log(`读取 ${key}`);
        return Reflect.get(target, key);
    },
    set(target, key, value) {
        console.log(`设置 ${key} = ${value}`);
        return Reflect.set(target, key, value);
    }
};
const proxy = new Proxy({}, handler);

// 虚拟代理：图片懒加载
class ImageProxy {
    constructor(src) {
        this.realImage = null;
        this.src = src;
        this.placeholder = 'loading.gif';
    }
    display() {
        if (!this.realImage) {
            this.realImage = new RealImage(this.src);
        }
        return this.realImage.display();
    }
}
```

**前端应用**：Vue 3 响应式（Proxy）、图片懒加载、缓存代理、权限拦截、API 请求拦截

---
:::

## 装饰器模式

::: details 7. 装饰器模式和继承的区别？
装饰器在不修改原对象的情况下动态添加功能，比继承更灵活（组合优于继承）。

```javascript
// 函数装饰器（高阶函数）
function withLogging(fn) {
    return function(...args) {
        console.log(`调用 ${fn.name}，参数:`, args);
        const result = fn.apply(this, args);
        console.log(`返回:`, result);
        return result;
    };
}

const add = (a, b) => a + b;
const loggedAdd = withLogging(add);

// TypeScript/ES 装饰器（类装饰器）
function readonly(target, key, descriptor) {
    descriptor.writable = false;
    return descriptor;
}

class Circle {
    @readonly
    getArea() { return Math.PI * this.r ** 2; }
}
```

**前端应用**：React HOC（高阶组件）、Vue mixins、AOP（日志、权限、缓存）、TypeScript 装饰器（NestJS）

---
:::

## 综合题

::: details 8. SOLID 原则是什么？
| 原则 | 说明 | 前端示例 |
|------|------|---------|
| **S** 单一职责 | 一个类只做一件事 | 组件只负责 UI，逻辑抽到 hooks |
| **O** 开闭原则 | 对扩展开放，对修改关闭 | 策略模式添加新策略不改旧代码 |
| **L** 里氏替换 | 子类可替换父类 | 组件继承保持接口兼容 |
| **I** 接口隔离 | 不依赖不需要的接口 | TypeScript 接口拆分 |
| **D** 依赖倒置 | 依赖抽象而非具体 | 依赖注入（NestJS） |
:::
