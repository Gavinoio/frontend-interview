# 观察者模式与发布订阅模式

## 观察者模式（Observer Pattern）

### 定义

观察者模式定义了对象之间的一对多依赖关系，当一个对象（Subject/被观察者）的状态发生改变时，所有依赖于它的对象（Observer/观察者）都会得到通知并自动更新。

### 核心组成

1. **Subject（被观察者）**：维护观察者列表，提供添加、删除观察者的方法
2. **Observer（观察者）**：定义更新接口，接收 Subject 的通知
3. **ConcreteSubject（具体被观察者）**：存储状态，状态改变时通知观察者
4. **ConcreteObserver（具体观察者）**：实现更新接口，保持与 Subject 状态一致

### 基础实现

```javascript
// 被观察者（Subject）
class Subject {
  constructor() {
    this.observers = []; // 观察者列表
  }

  // 添加观察者
  addObserver(observer) {
    this.observers.push(observer);
  }

  // 移除观察者
  removeObserver(observer) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  // 通知所有观察者
  notify(data) {
    this.observers.forEach(observer => {
      observer.update(data);
    });
  }
}

// 观察者（Observer）
class Observer {
  constructor(name) {
    this.name = name;
  }

  // 更新方法
  update(data) {
    console.log(`${this.name} 收到通知:`, data);
  }
}

// 使用示例
const subject = new Subject();

const observer1 = new Observer('观察者1');
const observer2 = new Observer('观察者2');
const observer3 = new Observer('观察者3');

subject.addObserver(observer1);
subject.addObserver(observer2);
subject.addObserver(observer3);

subject.notify('状态发生变化'); // 所有观察者都会收到通知

subject.removeObserver(observer2);
subject.notify('再次变化'); // 只有观察者1和3收到通知
```

## 发布订阅模式（Publish-Subscribe Pattern）

### 定义

发布订阅模式是一种消息传递模式，发布者（Publisher）不直接向订阅者（Subscriber）发送消息，而是通过一个事件通道（Event Channel/调度中心）来传递消息。发布者和订阅者之间完全解耦。

### 核心组成

1. **Publisher（发布者）**：发布消息/事件
2. **Event Channel（事件通道）**：管理事件和订阅者的映射关系
3. **Subscriber（订阅者）**：订阅感兴趣的事件

### 基础实现

```javascript
// 事件总线（Event Bus）
class EventBus {
  constructor() {
    this.events = {}; // 存储事件和订阅者的映射
  }

  // 订阅事件
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  // 取消订阅
  off(eventName, callback) {
    if (!this.events[eventName]) return;

    if (!callback) {
      // 如果没有传入 callback，移除该事件的所有订阅
      delete this.events[eventName];
    } else {
      // 移除特定的订阅
      this.events[eventName] = this.events[eventName].filter(
        cb => cb !== callback
      );
    }
  }

  // 发布事件
  emit(eventName, ...args) {
    if (!this.events[eventName]) return;

    this.events[eventName].forEach(callback => {
      callback(...args);
    });
  }

  // 只订阅一次
  once(eventName, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(eventName, wrapper);
    };
    this.on(eventName, wrapper);
  }
}

// 使用示例
const eventBus = new EventBus();

// 订阅者1
const subscriber1 = (data) => {
  console.log('订阅者1 收到消息:', data);
};

// 订阅者2
const subscriber2 = (data) => {
  console.log('订阅者2 收到消息:', data);
};

// 订阅
eventBus.on('message', subscriber1);
eventBus.on('message', subscriber2);

// 发布
eventBus.emit('message', 'Hello World'); // 两个订阅者都收到消息

// 取消订阅
eventBus.off('message', subscriber1);
eventBus.emit('message', 'Hello Again'); // 只有订阅者2收到消息
```

## 观察者模式 vs 发布订阅模式（重点！）

这是面试高频题，必须深刻理解两者的区别。

### 核心区别

| 特性 | 观察者模式 | 发布订阅模式 |
|------|-----------|-------------|
| **耦合度** | 观察者和被观察者直接关联，耦合度较高 | 发布者和订阅者通过事件通道解耦，完全不知道对方的存在 |
| **中介者** | 没有中介者，Subject 直接通知 Observer | 有事件通道作为中介者 |
| **通信方式** | Subject 主动推送给 Observer | Publisher 发布到事件通道，Subscriber 从通道订阅 |
| **关系** | 一对多关系，一个 Subject 对应多个 Observer | 多对多关系，通过事件名关联 |
| **灵活性** | 较低，Observer 需要知道 Subject | 较高，完全解耦 |

### 图示对比

```
观察者模式:
Subject (被观察者)
   ↓ 直接通知
   ├─→ Observer1
   ├─→ Observer2
   └─→ Observer3

发布订阅模式:
Publisher1 ──→ ┐
Publisher2 ──→ ├─→ Event Channel (事件通道) ─→ ┌─→ Subscriber1
Publisher3 ──→ ┘                                ├─→ Subscriber2
                                                  └─→ Subscriber3
```

### 代码对比

```javascript
// ===== 观察者模式 =====
class Subject {
  constructor() {
    this.observers = [];
  }

  addObserver(observer) {
    this.observers.push(observer);
  }

  notify(data) {
    // Subject 直接调用 Observer 的方法
    this.observers.forEach(observer => observer.update(data));
  }
}

class Observer {
  update(data) {
    console.log('Observer 收到:', data);
  }
}

// 使用
const subject = new Subject();
const observer = new Observer();
subject.addObserver(observer); // Observer 需要知道 Subject
subject.notify('Hello'); // Subject 直接通知 Observer


// ===== 发布订阅模式 =====
class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}

// 使用
const eventBus = new EventBus();
eventBus.on('message', data => console.log('Subscriber 收到:', data));
eventBus.emit('message', 'Hello'); // 完全解耦，通过事件名通信
```

## 手写 EventEmitter/EventBus（面试必考）

### 完整版 EventEmitter

```javascript
class EventEmitter {
  constructor() {
    this.events = {}; // 事件映射表
  }

  /**
   * 订阅事件
   * @param {string} eventName - 事件名
   * @param {Function} callback - 回调函数
   */
  on(eventName, callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }

    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push(callback);
    return this; // 链式调用
  }

  /**
   * 取消订阅
   * @param {string} eventName - 事件名
   * @param {Function} callback - 回调函数（可选）
   */
  off(eventName, callback) {
    if (!this.events[eventName]) {
      return this;
    }

    if (!callback) {
      // 移除该事件的所有订阅
      delete this.events[eventName];
    } else {
      // 移除特定回调
      this.events[eventName] = this.events[eventName].filter(
        cb => cb !== callback && cb.origin !== callback // 处理 once 的情况
      );

      // 如果没有订阅者了，删除事件
      if (this.events[eventName].length === 0) {
        delete this.events[eventName];
      }
    }

    return this;
  }

  /**
   * 发布事件
   * @param {string} eventName - 事件名
   * @param {...any} args - 传递给回调的参数
   */
  emit(eventName, ...args) {
    if (!this.events[eventName]) {
      return false;
    }

    // 复制一份，避免在执行过程中被修改
    const callbacks = [...this.events[eventName]];

    callbacks.forEach(callback => {
      try {
        callback.apply(this, args);
      } catch (error) {
        console.error(`Error in event handler for "${eventName}":`, error);
      }
    });

    return true;
  }

  /**
   * 只订阅一次
   * @param {string} eventName - 事件名
   * @param {Function} callback - 回调函数
   */
  once(eventName, callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }

    const wrapper = (...args) => {
      callback.apply(this, args);
      this.off(eventName, wrapper);
    };

    // 保存原始函数，用于 off 时比对
    wrapper.origin = callback;

    this.on(eventName, wrapper);
    return this;
  }

  /**
   * 获取事件的订阅者数量
   * @param {string} eventName - 事件名
   */
  listenerCount(eventName) {
    return this.events[eventName] ? this.events[eventName].length : 0;
  }

  /**
   * 获取所有事件名
   */
  eventNames() {
    return Object.keys(this.events);
  }

  /**
   * 移除所有事件
   */
  removeAllListeners(eventName) {
    if (eventName) {
      delete this.events[eventName];
    } else {
      this.events = {};
    }
    return this;
  }

  /**
   * 获取事件的所有监听器
   */
  listeners(eventName) {
    return this.events[eventName] ? [...this.events[eventName]] : [];
  }
}

// 测试
const emitter = new EventEmitter();

// 订阅
const handler1 = (data) => console.log('handler1:', data);
const handler2 = (data) => console.log('handler2:', data);

emitter.on('test', handler1);
emitter.on('test', handler2);

// 发布
emitter.emit('test', 'Hello'); // handler1: Hello, handler2: Hello

// 取消订阅
emitter.off('test', handler1);
emitter.emit('test', 'World'); // handler2: World

// 只订阅一次
emitter.once('temp', data => console.log('once:', data));
emitter.emit('temp', '1'); // once: 1
emitter.emit('temp', '2'); // 不会输出

// 链式调用
emitter
  .on('chain1', () => console.log('chain1'))
  .on('chain2', () => console.log('chain2'))
  .emit('chain1')
  .emit('chain2');
```

### 支持命名空间的 EventBus

```javascript
class NamespacedEventBus {
  constructor() {
    this.events = {};
  }

  on(eventName, callback) {
    const { namespace, event } = this.parseEventName(eventName);

    if (!this.events[namespace]) {
      this.events[namespace] = {};
    }

    if (!this.events[namespace][event]) {
      this.events[namespace][event] = [];
    }

    this.events[namespace][event].push(callback);
    return this;
  }

  off(eventName, callback) {
    const { namespace, event } = this.parseEventName(eventName);

    if (!this.events[namespace] || !this.events[namespace][event]) {
      return this;
    }

    if (!callback) {
      delete this.events[namespace][event];
    } else {
      this.events[namespace][event] = this.events[namespace][event].filter(
        cb => cb !== callback
      );
    }

    return this;
  }

  emit(eventName, ...args) {
    const { namespace, event } = this.parseEventName(eventName);

    if (!this.events[namespace] || !this.events[namespace][event]) {
      return false;
    }

    this.events[namespace][event].forEach(callback => {
      callback(...args);
    });

    return true;
  }

  parseEventName(eventName) {
    const parts = eventName.split(':');
    return {
      namespace: parts[0] || 'default',
      event: parts[1] || parts[0]
    };
  }

  // 移除某个命名空间的所有事件
  removeNamespace(namespace) {
    delete this.events[namespace];
    return this;
  }
}

// 使用
const bus = new NamespacedEventBus();

bus.on('user:login', data => console.log('用户登录:', data));
bus.on('user:logout', data => console.log('用户登出:', data));
bus.on('product:add', data => console.log('添加商品:', data));

bus.emit('user:login', { name: '张三' });
bus.emit('product:add', { id: 1, name: '商品A' });

bus.removeNamespace('user'); // 移除所有 user 相关事件
```

## Vue 响应式原理中的应用

### Vue 2 响应式（观察者模式）

```javascript
// 依赖收集器（Dep）
class Dep {
  constructor() {
    this.subs = []; // 订阅者列表（Watcher）
  }

  // 添加订阅者
  addSub(sub) {
    this.subs.push(sub);
  }

  // 通知所有订阅者
  notify() {
    this.subs.forEach(sub => sub.update());
  }

  // 依赖收集
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }
}

Dep.target = null; // 当前正在收集依赖的 Watcher

// 观察者（Watcher）
class Watcher {
  constructor(vm, exp, callback) {
    this.vm = vm;
    this.exp = exp;
    this.callback = callback;
    this.value = this.get(); // 初始化时获取值并收集依赖
  }

  get() {
    Dep.target = this; // 设置当前 Watcher
    const value = this.vm[this.exp]; // 触发 getter，收集依赖
    Dep.target = null; // 重置
    return value;
  }

  update() {
    const newValue = this.get();
    const oldValue = this.value;
    if (newValue !== oldValue) {
      this.value = newValue;
      this.callback.call(this.vm, newValue, oldValue);
    }
  }

  addDep(dep) {
    dep.addSub(this);
  }
}

// 响应式（Observer）
function defineReactive(obj, key, val) {
  const dep = new Dep(); // 每个属性都有一个 Dep

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      console.log(`访问 ${key}`);
      dep.depend(); // 收集依赖
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      console.log(`设置 ${key} = ${newVal}`);
      val = newVal;
      dep.notify(); // 通知所有 Watcher
    }
  });
}

// 简易 Vue
class Vue {
  constructor(options) {
    this.$data = options.data;
    this.observe(this.$data);
    this.proxyData(this.$data);
  }

  observe(data) {
    Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key]);
    });
  }

  proxyData(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        get() {
          return data[key];
        },
        set(newVal) {
          data[key] = newVal;
        }
      });
    });
  }

  $watch(exp, callback) {
    new Watcher(this, exp, callback);
  }
}

// 使用
const vm = new Vue({
  data: {
    message: 'Hello Vue!'
  }
});

vm.$watch('message', (newVal, oldVal) => {
  console.log(`message changed: ${oldVal} -> ${newVal}`);
});

vm.message = 'Hello World'; // 触发 Watcher 更新
```

### Vue 3 响应式（Proxy + 发布订阅）

```javascript
// 依赖收集（发布订阅模式）
const targetMap = new WeakMap();

function track(target, key) {
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  dep.add(activeEffect);
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => effect());
  }
}

let activeEffect = null;

function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

// 响应式（Proxy）
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      track(target, key); // 收集依赖
      return result;
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key); // 触发更新
      return result;
    }
  });
}

// 使用
const state = reactive({
  count: 0,
  message: 'Hello'
});

effect(() => {
  console.log('count:', state.count);
});

effect(() => {
  console.log('message:', state.message);
});

state.count++; // 输出: count: 1
state.message = 'World'; // 输出: message: World
```

## 实际应用场景

### 1. DOM 事件监听（观察者模式）

```javascript
// 浏览器的 DOM 事件就是观察者模式
const button = document.querySelector('#btn');

// 添加观察者
const handler1 = () => console.log('点击了按钮1');
const handler2 = () => console.log('点击了按钮2');

button.addEventListener('click', handler1);
button.addEventListener('click', handler2);

// 移除观察者
button.removeEventListener('click', handler1);
```

### 2. 跨组件通信（发布订阅）

```javascript
// eventBus.js
import EventEmitter from './EventEmitter';
export default new EventEmitter();

// ComponentA.vue
import eventBus from './eventBus';

export default {
  methods: {
    sendMessage() {
      eventBus.emit('message', 'Hello from A');
    }
  }
};

// ComponentB.vue
import eventBus from './eventBus';

export default {
  created() {
    eventBus.on('message', (data) => {
      console.log('收到消息:', data);
    });
  },
  beforeDestroy() {
    eventBus.off('message');
  }
};
```

### 3. 状态管理（观察者模式）

```javascript
// 简易状态管理
class Store {
  constructor(state = {}) {
    this.state = state;
    this.observers = [];
  }

  // 订阅状态变化
  subscribe(observer) {
    this.observers.push(observer);
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  // 修改状态
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  // 通知观察者
  notify() {
    this.observers.forEach(observer => {
      observer(this.state);
    });
  }

  getState() {
    return this.state;
  }
}

// 使用
const store = new Store({ count: 0 });

const unsubscribe = store.subscribe(state => {
  console.log('状态更新:', state);
});

store.setState({ count: 1 }); // 输出: 状态更新: { count: 1 }

unsubscribe(); // 取消订阅
store.setState({ count: 2 }); // 不会触发回调
```

### 4. Promise 链式调用（观察者模式）

```javascript
// Promise 内部使用观察者模式
class MyPromise {
  constructor(executor) {
    this.status = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = []; // 成功回调队列
    this.onRejectedCallbacks = []; // 失败回调队列

    const resolve = (value) => {
      if (this.status === 'pending') {
        this.status = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn()); // 通知所有观察者
      }
    };

    const reject = (reason) => {
      if (this.status === 'pending') {
        this.status = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn()); // 通知所有观察者
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    if (this.status === 'fulfilled') {
      onFulfilled(this.value);
    }

    if (this.status === 'rejected') {
      onRejected(this.reason);
    }

    if (this.status === 'pending') {
      // 添加观察者
      this.onFulfilledCallbacks.push(() => {
        onFulfilled(this.value);
      });
      this.onRejectedCallbacks.push(() => {
        onRejected(this.reason);
      });
    }
  }
}
```

