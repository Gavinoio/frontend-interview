# 单例模式（Singleton Pattern）

## 定义

单例模式（Singleton Pattern）是一种创建型设计模式，确保一个类只有一个实例，并提供一个全局访问点来访问这个实例。

## 核心特点

1. **唯一实例**：类只有一个实例
2. **全局访问**：提供全局访问点
3. **延迟创建**：实例在第一次使用时才创建（懒加载）
4. **自行实例化**：类自己创建并管理唯一实例

## 适用场景

- **全局状态管理**：Vuex、Redux、Pinia
- **全局唯一组件**：Loading、Toast、Modal 弹窗
- **全局缓存**：浏览器缓存管理器
- **全局配置**：应用配置对象
- **日志系统**：全局日志记录器
- **数据库连接池**：共享数据库连接

## JavaScript 实现方式

### 1. 闭包实现（推荐）

```javascript
// 基础版本
const Singleton = (function() {
  let instance; // 闭包保存实例

  function createInstance() {
    return {
      name: 'Singleton',
      getData() {
        return this.name;
      }
    };
  }

  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

// 使用
const instance1 = Singleton.getInstance();
const instance2 = Singleton.getInstance();
console.log(instance1 === instance2); // true
```

### 2. ES6 Class 实现

```javascript
class Singleton {
  constructor() {
    // 如果已存在实例，直接返回
    if (Singleton.instance) {
      return Singleton.instance;
    }

    // 初始化
    this.name = 'Singleton';

    // 保存实例
    Singleton.instance = this;
  }

  getData() {
    return this.name;
  }
}

// 使用
const instance1 = new Singleton();
const instance2 = new Singleton();
console.log(instance1 === instance2); // true
```

### 3. 静态方法实现

```javascript
class Singleton {
  constructor(name) {
    this.name = name;
  }

  static getInstance(name) {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton(name);
    }
    return Singleton.instance;
  }

  getData() {
    return this.name;
  }
}

// 使用
const instance1 = Singleton.getInstance('Instance1');
const instance2 = Singleton.getInstance('Instance2');
console.log(instance1 === instance2); // true
console.log(instance1.getData()); // 'Instance1'（后续调用不会改变实例）
```

### 4. ES6 Module 实现（最简单）

```javascript
// singleton.js
class Singleton {
  constructor() {
    this.name = 'Singleton';
  }

  getData() {
    return this.name;
  }
}

// 导出单例实例
export default new Singleton();
```

```javascript
// 使用
import singleton from './singleton.js';

console.log(singleton.getData()); // 'Singleton'
```

### 5. 代理模式实现单例

```javascript
// 原始类
class Database {
  constructor() {
    this.data = [];
  }

  query(sql) {
    console.log('执行查询:', sql);
    return this.data;
  }
}

// 单例代理
const ProxySingleton = (function() {
  let instance;

  return function() {
    if (!instance) {
      instance = new Database();
    }
    return instance;
  };
})();

// 使用
const db1 = new ProxySingleton();
const db2 = new ProxySingleton();
console.log(db1 === db2); // true
```

### 6. 通用单例工厂（高级）

```javascript
// 通用单例工厂函数
function createSingleton(Constructor) {
  let instance;

  return function(...args) {
    if (!instance) {
      instance = new Constructor(...args);
    }
    return instance;
  };
}

// 使用示例
class User {
  constructor(name) {
    this.name = name;
  }
}

class Config {
  constructor(options) {
    this.options = options;
  }
}

const SingletonUser = createSingleton(User);
const SingletonConfig = createSingleton(Config);

const user1 = new SingletonUser('张三');
const user2 = new SingletonUser('李四');
console.log(user1 === user2); // true
console.log(user1.name); // '张三'

const config1 = new SingletonConfig({ theme: 'dark' });
const config2 = new SingletonConfig({ theme: 'light' });
console.log(config1 === config2); // true
console.log(config1.options.theme); // 'dark'
```

## 实际应用场景

### 1. 全局状态管理（Vuex）

```javascript
// Vuex Store 实现原理（简化版）
class Store {
  constructor(options) {
    this.state = options.state || {};
    this.mutations = options.mutations || {};
    this.actions = options.actions || {};
  }

  commit(type, payload) {
    const mutation = this.mutations[type];
    if (mutation) {
      mutation(this.state, payload);
    }
  }

  dispatch(type, payload) {
    const action = this.actions[type];
    if (action) {
      return action(this, payload);
    }
  }
}

// 单例模式保证全局只有一个 Store
let store;

function createStore(options) {
  if (!store) {
    store = new Store(options);
  }
  return store;
}

// 使用
const store1 = createStore({
  state: { count: 0 },
  mutations: {
    increment(state) {
      state.count++;
    }
  }
});

const store2 = createStore({
  state: { count: 100 }
});

console.log(store1 === store2); // true
console.log(store1.state.count); // 0（不会被第二次创建覆盖）
```

### 2. 全局 Loading 组件

```javascript
class Loading {
  constructor() {
    if (Loading.instance) {
      return Loading.instance;
    }

    this.element = null;
    this.isShow = false;
    this.init();

    Loading.instance = this;
  }

  init() {
    // 创建 Loading DOM
    this.element = document.createElement('div');
    this.element.id = 'global-loading';
    this.element.className = 'loading-mask';
    this.element.innerHTML = `
      <div class="loading-spinner">
        <i class="icon-loading"></i>
        <p>加载中...</p>
      </div>
    `;
    this.element.style.display = 'none';
    document.body.appendChild(this.element);
  }

  show() {
    if (!this.isShow) {
      this.element.style.display = 'flex';
      this.isShow = true;
    }
  }

  hide() {
    if (this.isShow) {
      this.element.style.display = 'none';
      this.isShow = false;
    }
  }

  destroy() {
    if (this.element) {
      document.body.removeChild(this.element);
      this.element = null;
      this.isShow = false;
    }
  }
}

// 导出单例
const loading = new Loading();
export default loading;

// 使用
// import loading from './loading';
// loading.show();
// setTimeout(() => loading.hide(), 2000);
```

### 3. 全局弹窗管理

```javascript
class Modal {
  constructor() {
    if (Modal.instance) {
      return Modal.instance;
    }

    this.modalElement = null;
    this.isVisible = false;
    this.init();

    Modal.instance = this;
  }

  init() {
    // 创建弹窗 DOM
    this.modalElement = document.createElement('div');
    this.modalElement.className = 'modal-container';
    this.modalElement.innerHTML = `
      <div class="modal-mask"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title"></h3>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body"></div>
        <div class="modal-footer">
          <button class="modal-cancel">取消</button>
          <button class="modal-confirm">确定</button>
        </div>
      </div>
    `;
    this.modalElement.style.display = 'none';
    document.body.appendChild(this.modalElement);

    // 绑定事件
    this.bindEvents();
  }

  bindEvents() {
    const closeBtn = this.modalElement.querySelector('.modal-close');
    const cancelBtn = this.modalElement.querySelector('.modal-cancel');
    const confirmBtn = this.modalElement.querySelector('.modal-confirm');
    const mask = this.modalElement.querySelector('.modal-mask');

    closeBtn.onclick = () => this.hide();
    cancelBtn.onclick = () => this.hide();
    mask.onclick = () => this.hide();
    confirmBtn.onclick = () => {
      this.onConfirm && this.onConfirm();
      this.hide();
    };
  }

  show(options = {}) {
    const { title = '提示', content = '', onConfirm } = options;

    this.modalElement.querySelector('.modal-title').textContent = title;
    this.modalElement.querySelector('.modal-body').innerHTML = content;
    this.onConfirm = onConfirm;

    this.modalElement.style.display = 'block';
    this.isVisible = true;
  }

  hide() {
    this.modalElement.style.display = 'none';
    this.isVisible = false;
    this.onConfirm = null;
  }
}

// 导出单例
const modal = new Modal();
export default modal;

// 使用
// import modal from './modal';
// modal.show({
//   title: '确认删除',
//   content: '确定要删除这条记录吗？',
//   onConfirm: () => {
//     console.log('确认删除');
//   }
// });
```

### 4. 缓存管理器

```javascript
class CacheManager {
  constructor() {
    if (CacheManager.instance) {
      return CacheManager.instance;
    }

    this.cache = new Map();
    CacheManager.instance = this;
  }

  set(key, value, ttl) {
    const expireTime = ttl ? Date.now() + ttl : null;
    this.cache.set(key, { value, expireTime });
  }

  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // 检查是否过期
    if (item.expireTime && Date.now() > item.expireTime) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // 清理过期缓存
  clearExpired() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expireTime && now > item.expireTime) {
        this.cache.delete(key);
      }
    }
  }
}

// 导出单例
const cacheManager = new CacheManager();
export default cacheManager;

// 使用
// import cache from './cache';
// cache.set('user', { name: '张三' }, 5000); // 5秒后过期
// console.log(cache.get('user')); // { name: '张三' }
// setTimeout(() => {
//   console.log(cache.get('user')); // null（已过期）
// }, 6000);
```

### 5. 请求管理器（防止重复请求）

```javascript
class RequestManager {
  constructor() {
    if (RequestManager.instance) {
      return RequestManager.instance;
    }

    this.pendingRequests = new Map();
    RequestManager.instance = this;
  }

  request(url, options = {}) {
    const key = this.getRequestKey(url, options);

    // 如果已有相同请求在进行中，返回该请求
    if (this.pendingRequests.has(key)) {
      console.log('复用请求:', key);
      return this.pendingRequests.get(key);
    }

    // 发起新请求
    const promise = fetch(url, options)
      .then(response => response.json())
      .finally(() => {
        // 请求完成后删除
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  getRequestKey(url, options) {
    return `${options.method || 'GET'}_${url}_${JSON.stringify(options.body || {})}`;
  }

  clearAll() {
    this.pendingRequests.clear();
  }
}

// 导出单例
const requestManager = new RequestManager();
export default requestManager;

// 使用
// import request from './request';
//
// // 短时间内多次调用，只会发起一次请求
// request.request('/api/users');
// request.request('/api/users'); // 复用第一次的请求
// request.request('/api/users'); // 复用第一次的请求
```

### 6. 日志管理器

```javascript
class Logger {
  constructor() {
    if (Logger.instance) {
      return Logger.instance;
    }

    this.logs = [];
    this.level = 'info'; // debug, info, warn, error
    Logger.instance = this;
  }

  setLevel(level) {
    this.level = level;
  }

  debug(...args) {
    if (this.shouldLog('debug')) {
      this.log('DEBUG', ...args);
    }
  }

  info(...args) {
    if (this.shouldLog('info')) {
      this.log('INFO', ...args);
    }
  }

  warn(...args) {
    if (this.shouldLog('warn')) {
      this.log('WARN', ...args);
    }
  }

  error(...args) {
    if (this.shouldLog('error')) {
      this.log('ERROR', ...args);
    }
  }

  log(level, ...args) {
    const timestamp = new Date().toISOString();
    const message = args.join(' ');
    const logEntry = { timestamp, level, message };

    this.logs.push(logEntry);
    console.log(`[${timestamp}] [${level}]`, ...args);

    // 可以在这里添加上报逻辑
    if (level === 'ERROR') {
      this.reportError(logEntry);
    }
  }

  shouldLog(level) {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  reportError(logEntry) {
    // 上报错误到服务器
    console.log('上报错误:', logEntry);
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

// 导出单例
const logger = new Logger();
export default logger;

// 使用
// import logger from './logger';
// logger.setLevel('info');
// logger.debug('这条不会输出'); // 低于 info 级别
// logger.info('用户登录');
// logger.warn('网络缓慢');
// logger.error('请求失败');
```

## 优缺点分析

### 优点

1. **节省内存**：只创建一个实例，避免重复创建
2. **全局访问**：提供全局访问点，方便管理
3. **延迟加载**：实例在需要时才创建，节省资源
4. **状态一致**：全局共享一个状态，避免不一致

### 缺点

1. **全局污染**：全局变量可能造成命名冲突
2. **紧耦合**：代码依赖全局单例，不易测试
3. **扩展困难**：单例类的职责过重时，违反单一职责原则
4. **并发问题**：在多线程环境下需要考虑线程安全（JavaScript 单线程不涉及）

## 单例模式 vs 静态类

| 特性 | 单例模式 | 静态类 |
|------|---------|--------|
| 实例创建 | 可以延迟创建 | 类加载时就存在 |
| 继承性 | 可以继承 | 不可继承 |
| 接口实现 | 可以实现接口 | 不能实现接口 |
| 状态管理 | 可以有实例状态 | 只能有静态属性 |
| 灵活性 | 更灵活 | 不够灵活 |

```javascript
// 单例模式
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    this.state = {};
    Singleton.instance = this;
  }
}

// 静态类
class StaticClass {
  static state = {};

  static method() {
    // ...
  }
}
```

