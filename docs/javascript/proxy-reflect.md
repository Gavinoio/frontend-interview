# Proxy 与 Reflect 深度解析

## 概述

Proxy 和 Reflect 是 ES6 引入的元编程特性，用于拦截和自定义对象的基本操作。Proxy 是 Vue 3 响应式系统的核心，也是现代前端框架的重要基石。

## Proxy 基础

### 基本语法

```javascript
const proxy = new Proxy(target, handler);
```

- `target`：要代理的目标对象
- `handler`：定义拦截行为的对象

### 简单示例

```javascript
const target = {
  name: '张三',
  age: 25
};

const handler = {
  get(target, property, receiver) {
    console.log(`读取属性: ${property}`);
    return target[property];
  },
  set(target, property, value, receiver) {
    console.log(`设置属性: ${property} = ${value}`);
    target[property] = value;
    return true;
  }
};

const proxy = new Proxy(target, handler);

proxy.name;        // 输出: 读取属性: name
proxy.age = 26;    // 输出: 设置属性: age = 26
```

## Proxy Handler 完整方法

Proxy 支持 13 种拦截操作：

### 1. get - 读取属性

```javascript
const handler = {
  // target: 目标对象
  // property: 属性名
  // receiver: proxy 实例本身
  get(target, property, receiver) {
    if (property in target) {
      return target[property];
    }
    throw new ReferenceError(`属性 "${property}" 不存在`);
  }
};

const proxy = new Proxy({name: 'test'}, handler);
console.log(proxy.name);    // 'test'
console.log(proxy.unknown); // ReferenceError
```

### 2. set - 设置属性

```javascript
const handler = {
  set(target, property, value, receiver) {
    // 数据验证
    if (property === 'age') {
      if (!Number.isInteger(value)) {
        throw new TypeError('age 必须是整数');
      }
      if (value < 0 || value > 150) {
        throw new RangeError('age 必须在 0-150 之间');
      }
    }
    target[property] = value;
    return true; // 必须返回 true 表示成功
  }
};

const person = new Proxy({}, handler);
person.age = 25;    // 成功
person.age = -1;    // RangeError
person.age = 'abc'; // TypeError
```

### 3. has - in 操作符拦截

```javascript
const handler = {
  has(target, property) {
    // 隐藏私有属性
    if (property.startsWith('_')) {
      return false;
    }
    return property in target;
  }
};

const obj = new Proxy({ _secret: '123', name: 'test' }, handler);
console.log('_secret' in obj); // false
console.log('name' in obj);    // true
```

### 4. deleteProperty - delete 操作拦截

```javascript
const handler = {
  deleteProperty(target, property) {
    // 禁止删除私有属性
    if (property.startsWith('_')) {
      throw new Error(`无法删除私有属性 ${property}`);
    }
    delete target[property];
    return true;
  }
};

const obj = new Proxy({ _id: 1, name: 'test' }, handler);
delete obj.name;  // 成功
delete obj._id;   // Error
```

### 5. ownKeys - 属性遍历拦截

```javascript
const handler = {
  ownKeys(target) {
    // 过滤私有属性
    return Object.keys(target).filter(key => !key.startsWith('_'));
  }
};

const obj = new Proxy({ _id: 1, name: 'test', age: 25 }, handler);
console.log(Object.keys(obj));        // ['name', 'age']
console.log(Object.getOwnPropertyNames(obj)); // ['name', 'age']
```

### 6. getOwnPropertyDescriptor - 属性描述符拦截

```javascript
const handler = {
  getOwnPropertyDescriptor(target, property) {
    if (property.startsWith('_')) {
      return undefined; // 隐藏私有属性
    }
    return Object.getOwnPropertyDescriptor(target, property);
  }
};
```

### 7. defineProperty - 定义属性拦截

```javascript
const handler = {
  defineProperty(target, property, descriptor) {
    // 禁止定义以 _ 开头的属性
    if (property.startsWith('_')) {
      return false;
    }
    return Object.defineProperty(target, property, descriptor);
  }
};
```

### 8. preventExtensions - 阻止扩展拦截

```javascript
const handler = {
  preventExtensions(target) {
    console.log('对象被设置为不可扩展');
    return Object.preventExtensions(target);
  }
};
```

### 9. getPrototypeOf - 获取原型拦截

```javascript
const handler = {
  getPrototypeOf(target) {
    console.log('获取原型');
    return Object.getPrototypeOf(target);
  }
};
```

### 10. setPrototypeOf - 设置原型拦截

```javascript
const handler = {
  setPrototypeOf(target, proto) {
    throw new Error('禁止修改原型');
  }
};
```

### 11. isExtensible - 可扩展性检查拦截

```javascript
const handler = {
  isExtensible(target) {
    return Object.isExtensible(target);
  }
};
```

### 12. apply - 函数调用拦截

```javascript
function sum(a, b) {
  return a + b;
}

const handler = {
  apply(target, thisArg, argumentsList) {
    console.log(`调用函数，参数: ${argumentsList}`);
    return target.apply(thisArg, argumentsList);
  }
};

const proxy = new Proxy(sum, handler);
proxy(1, 2); // 输出: 调用函数，参数: 1,2  返回: 3
```

### 13. construct - new 操作拦截

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
}

const handler = {
  construct(target, args, newTarget) {
    console.log(`创建实例，参数: ${args}`);
    return new target(...args);
  }
};

const ProxyPerson = new Proxy(Person, handler);
new ProxyPerson('张三'); // 输出: 创建实例，参数: 张三
```

## Reflect API

Reflect 是一个内置对象，提供与 Proxy handler 方法一一对应的静态方法。

### 为什么需要 Reflect

```javascript
// 1. 统一的函数式操作
// 传统方式
'name' in obj;
delete obj.name;
Object.keys(obj);

// Reflect 方式
Reflect.has(obj, 'name');
Reflect.deleteProperty(obj, 'name');
Reflect.ownKeys(obj);

// 2. 返回操作结果（而不是抛出异常）
// 传统方式 - 可能抛出异常
try {
  Object.defineProperty(obj, 'name', { value: 1 });
} catch (e) {
  // 处理错误
}

// Reflect 方式 - 返回布尔值
if (Reflect.defineProperty(obj, 'name', { value: 1 })) {
  // 成功
} else {
  // 失败
}

// 3. 配合 Proxy 使用，保持正确的 this 绑定
const handler = {
  get(target, property, receiver) {
    // 使用 Reflect.get 保证正确的 receiver
    return Reflect.get(target, property, receiver);
  }
};
```

### Reflect 完整方法列表

```javascript
// 与 Proxy handler 一一对应
Reflect.get(target, propertyKey[, receiver])
Reflect.set(target, propertyKey, value[, receiver])
Reflect.has(target, propertyKey)
Reflect.deleteProperty(target, propertyKey)
Reflect.ownKeys(target)
Reflect.getOwnPropertyDescriptor(target, propertyKey)
Reflect.defineProperty(target, propertyKey, attributes)
Reflect.preventExtensions(target)
Reflect.getPrototypeOf(target)
Reflect.setPrototypeOf(target, prototype)
Reflect.isExtensible(target)
Reflect.apply(target, thisArgument, argumentsList)
Reflect.construct(target, argumentsList[, newTarget])
```

### Reflect 与 Proxy 配合使用

```javascript
const handler = {
  get(target, property, receiver) {
    console.log(`GET ${property}`);
    // 推荐使用 Reflect，保持正确的行为
    return Reflect.get(target, property, receiver);
  },
  set(target, property, value, receiver) {
    console.log(`SET ${property} = ${value}`);
    return Reflect.set(target, property, value, receiver);
  }
};
```

## 实战应用场景

### 1. 数据验证

```javascript
function createValidator(target, validators) {
  return new Proxy(target, {
    set(target, property, value, receiver) {
      const validator = validators[property];
      if (validator && !validator(value)) {
        throw new Error(`Invalid value for ${property}`);
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}

const user = createValidator({}, {
  age: (value) => Number.isInteger(value) && value >= 0,
  email: (value) => /^[\w-]+@[\w-]+\.\w+$/.test(value),
  name: (value) => typeof value === 'string' && value.length > 0
});

user.age = 25;           // 成功
user.email = 'test@a.com'; // 成功
user.age = -1;           // Error: Invalid value for age
```

### 2. 响应式数据（Vue 3 核心原理）

```javascript
// 简化版响应式实现
const reactiveMap = new WeakMap();
let activeEffect = null;

function reactive(target) {
  if (reactiveMap.has(target)) {
    return reactiveMap.get(target);
  }

  const proxy = new Proxy(target, {
    get(target, property, receiver) {
      // 依赖收集
      track(target, property);
      const result = Reflect.get(target, property, receiver);
      // 深层响应式
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      return result;
    },
    set(target, property, value, receiver) {
      const oldValue = target[property];
      const result = Reflect.set(target, property, value, receiver);
      // 触发更新
      if (oldValue !== value) {
        trigger(target, property);
      }
      return result;
    }
  });

  reactiveMap.set(target, proxy);
  return proxy;
}

// 依赖收集
const targetMap = new WeakMap();

function track(target, property) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(property);
  if (!deps) {
    depsMap.set(property, (deps = new Set()));
  }
  deps.add(activeEffect);
}

function trigger(target, property) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const deps = depsMap.get(property);
  if (deps) {
    deps.forEach(effect => effect());
  }
}

// 使用示例
const state = reactive({ count: 0 });

activeEffect = () => {
  console.log('count changed:', state.count);
};
state.count; // 触发依赖收集

state.count = 1; // 输出: count changed: 1
```

### 3. 属性访问日志

```javascript
function createLogger(target, name = 'Object') {
  return new Proxy(target, {
    get(target, property, receiver) {
      console.log(`[${new Date().toISOString()}] GET ${name}.${property}`);
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      console.log(`[${new Date().toISOString()}] SET ${name}.${property} = ${JSON.stringify(value)}`);
      return Reflect.set(target, property, value, receiver);
    }
  });
}

const user = createLogger({ name: '张三' }, 'user');
user.name;        // [2024-01-01T00:00:00.000Z] GET user.name
user.age = 25;    // [2024-01-01T00:00:00.000Z] SET user.age = 25
```

### 4. 缓存代理

```javascript
function createCachedFunction(fn) {
  const cache = new Map();

  return new Proxy(fn, {
    apply(target, thisArg, args) {
      const key = JSON.stringify(args);

      if (cache.has(key)) {
        console.log('从缓存返回');
        return cache.get(key);
      }

      const result = Reflect.apply(target, thisArg, args);
      cache.set(key, result);
      return result;
    }
  });
}

// 使用
const expensiveCalculation = (n) => {
  console.log('计算中...');
  return n * n;
};

const cachedCalculation = createCachedFunction(expensiveCalculation);

cachedCalculation(5); // 计算中... 25
cachedCalculation(5); // 从缓存返回 25
cachedCalculation(3); // 计算中... 9
```

### 5. 私有属性保护

```javascript
function createPrivateObject(target, privateProps = []) {
  return new Proxy(target, {
    get(target, property, receiver) {
      if (privateProps.includes(property)) {
        throw new Error(`Cannot access private property: ${property}`);
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (privateProps.includes(property)) {
        throw new Error(`Cannot modify private property: ${property}`);
      }
      return Reflect.set(target, property, value, receiver);
    },
    has(target, property) {
      if (privateProps.includes(property)) {
        return false;
      }
      return Reflect.has(target, property);
    },
    ownKeys(target) {
      return Reflect.ownKeys(target).filter(key => !privateProps.includes(key));
    }
  });
}

const user = createPrivateObject(
  { name: '张三', _password: '123456' },
  ['_password']
);

console.log(user.name);      // '张三'
console.log(user._password); // Error: Cannot access private property
console.log('_password' in user); // false
console.log(Object.keys(user));   // ['name']
```

### 6. 负数索引数组

```javascript
function createNegativeArray(array) {
  return new Proxy(array, {
    get(target, property, receiver) {
      const index = Number(property);
      if (Number.isInteger(index) && index < 0) {
        property = target.length + index;
      }
      return Reflect.get(target, property, receiver);
    }
  });
}

const arr = createNegativeArray([1, 2, 3, 4, 5]);
console.log(arr[-1]); // 5
console.log(arr[-2]); // 4
console.log(arr[0]);  // 1
```

### 7. 默认值代理

```javascript
function withDefaults(target, defaults) {
  return new Proxy(target, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);
      if (value === undefined && property in defaults) {
        return defaults[property];
      }
      return value;
    }
  });
}

const config = withDefaults({}, {
  timeout: 3000,
  retries: 3,
  baseURL: 'https://api.example.com'
});

console.log(config.timeout); // 3000
console.log(config.baseURL); // 'https://api.example.com'
config.timeout = 5000;
console.log(config.timeout); // 5000
```

## Proxy vs Object.defineProperty

### 对比表

| 特性 | Proxy | Object.defineProperty |
|------|-------|----------------------|
| 监听方式 | 代理整个对象 | 劫持单个属性 |
| 新增属性 | 自动监听 | 需要手动添加 |
| 数组监听 | 完美支持 | 需要重写数组方法 |
| 性能 | 略低（现代引擎已优化） | 较高 |
| 兼容性 | ES6+，无法 polyfill | ES5+ |
| 操作类型 | 支持 13 种操作 | 仅 get/set |

### 代码对比

```javascript
// Object.defineProperty 方式
function defineReactive(obj, key, val) {
  Object.defineProperty(obj, key, {
    get() {
      console.log(`get ${key}`);
      return val;
    },
    set(newVal) {
      console.log(`set ${key}`);
      val = newVal;
    }
  });
}

const obj1 = { name: 'test' };
defineReactive(obj1, 'name', obj1.name);

// 问题：新增属性无法监听
obj1.age = 25; // 不会触发 set

// Proxy 方式
const obj2 = new Proxy({ name: 'test' }, {
  get(target, key) {
    console.log(`get ${key}`);
    return target[key];
  },
  set(target, key, value) {
    console.log(`set ${key}`);
    target[key] = value;
    return true;
  }
});

// 新增属性自动监听
obj2.age = 25; // 触发 set
```

### 数组监听对比

```javascript
// Object.defineProperty 监听数组需要重写方法
const arrayMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
const arrayProto = Array.prototype;
const newArrayProto = Object.create(arrayProto);

arrayMethods.forEach(method => {
  newArrayProto[method] = function(...args) {
    console.log(`数组方法 ${method} 被调用`);
    return arrayProto[method].apply(this, args);
  };
});

// Proxy 直接监听
const arr = new Proxy([1, 2, 3], {
  set(target, property, value) {
    console.log(`设置 arr[${property}] = ${value}`);
    target[property] = value;
    return true;
  }
});

arr.push(4); // 自动触发
arr[0] = 10; // 自动触发
```

## 可撤销代理

```javascript
const { proxy, revoke } = Proxy.revocable(target, handler);

const target = { name: 'test' };
const { proxy, revoke } = Proxy.revocable(target, {
  get(target, property) {
    return target[property];
  }
});

console.log(proxy.name); // 'test'

// 撤销代理
revoke();

console.log(proxy.name); // TypeError: Cannot perform 'get' on a proxy that has been revoked
```

## 性能优化建议

### 1. 避免不必要的代理

```javascript
// 不好：对所有对象创建代理
function badReactive(obj) {
  return new Proxy(obj, handler);
}

// 好：使用 WeakMap 缓存
const proxyMap = new WeakMap();
function goodReactive(obj) {
  if (proxyMap.has(obj)) {
    return proxyMap.get(obj);
  }
  const proxy = new Proxy(obj, handler);
  proxyMap.set(obj, proxy);
  return proxy;
}
```

### 2. 惰性代理

```javascript
// 只在需要时创建深层代理
const handler = {
  get(target, property, receiver) {
    const value = Reflect.get(target, property, receiver);
    // 惰性创建嵌套对象的代理
    if (typeof value === 'object' && value !== null) {
      return new Proxy(value, handler);
    }
    return value;
  }
};
```

### 3. 避免在热路径使用

```javascript
// 频繁调用的函数中避免创建新代理
// 不好
function processItems(items) {
  items.forEach(item => {
    const proxy = new Proxy(item, handler); // 每次循环都创建
    // ...
  });
}

// 好
function processItems(items) {
  const proxiedItems = items.map(item => new Proxy(item, handler));
  proxiedItems.forEach(proxy => {
    // ...
  });
}
```

