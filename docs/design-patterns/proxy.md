# 代理模式（Proxy Pattern）

## 定义

代理模式为其他对象提供一种代理，以控制对这个对象的访问。代理对象在客户端和目标对象之间起到中介作用，可以在访问目标对象前后添加额外的处理逻辑。

## 核心思想

在不改变原对象的前提下，通过代理对象来增强或控制对原对象的访问。

## 代理模式的类型

1. **保护代理**：控制对原对象的访问权限
2. **虚拟代理**：延迟创建开销大的对象
3. **缓存代理**：为开销大的运算结果提供缓存
4. **远程代理**：为不同地址空间的对象提供局部代表
5. **智能引用代理**：在访问对象时执行额外操作

## 基础实现

### 传统代理模式

```javascript
// 目标对象
class RealSubject {
  request() {
    console.log('RealSubject: 处理请求');
    return '实际结果';
  }
}

// 代理对象
class ProxySubject {
  constructor() {
    this.realSubject = new RealSubject();
  }

  request() {
    console.log('Proxy: 请求前的处理');

    // 调用真实对象
    const result = this.realSubject.request();

    console.log('Proxy: 请求后的处理');
    return result;
  }
}

// 使用
const proxy = new ProxySubject();
proxy.request();
```

### ES6 Proxy（推荐）

```javascript
const target = {
  name: '张三',
  age: 25
};

const handler = {
  get(target, property) {
    console.log(`读取属性: ${property}`);
    return target[property];
  },

  set(target, property, value) {
    console.log(`设置属性: ${property} = ${value}`);
    target[property] = value;
    return true;
  }
};

const proxy = new Proxy(target, handler);

console.log(proxy.name); // 读取属性: name, 输出: 张三
proxy.age = 26; // 设置属性: age = 26
```

## ES6 Proxy 详解

### Proxy 基本用法

```javascript
const proxy = new Proxy(target, handler);
```

**参数**：
- `target`：被代理的目标对象
- `handler`：代理行为的配置对象（拦截器）

### Proxy 支持的拦截操作

```javascript
const handler = {
  // 1. get - 拦截属性读取
  get(target, property, receiver) {
    console.log(`读取: ${property}`);
    return Reflect.get(target, property, receiver);
  },

  // 2. set - 拦截属性设置
  set(target, property, value, receiver) {
    console.log(`设置: ${property} = ${value}`);
    return Reflect.set(target, property, value, receiver);
  },

  // 3. has - 拦截 in 操作符
  has(target, property) {
    console.log(`检查: ${property} in target`);
    return property in target;
  },

  // 4. deleteProperty - 拦截 delete 操作
  deleteProperty(target, property) {
    console.log(`删除: ${property}`);
    return delete target[property];
  },

  // 5. ownKeys - 拦截 Object.keys()、Object.getOwnPropertyNames() 等
  ownKeys(target) {
    console.log('获取所有属性');
    return Reflect.ownKeys(target);
  },

  // 6. getOwnPropertyDescriptor - 拦截 Object.getOwnPropertyDescriptor()
  getOwnPropertyDescriptor(target, property) {
    console.log(`获取属性描述符: ${property}`);
    return Reflect.getOwnPropertyDescriptor(target, property);
  },

  // 7. defineProperty - 拦截 Object.defineProperty()
  defineProperty(target, property, descriptor) {
    console.log(`定义属性: ${property}`);
    return Reflect.defineProperty(target, property, descriptor);
  },

  // 8. preventExtensions - 拦截 Object.preventExtensions()
  preventExtensions(target) {
    console.log('阻止扩展');
    return Reflect.preventExtensions(target);
  },

  // 9. getPrototypeOf - 拦截 Object.getPrototypeOf()
  getPrototypeOf(target) {
    console.log('获取原型');
    return Reflect.getPrototypeOf(target);
  },

  // 10. setPrototypeOf - 拦截 Object.setPrototypeOf()
  setPrototypeOf(target, proto) {
    console.log('设置原型');
    return Reflect.setPrototypeOf(target, proto);
  },

  // 11. isExtensible - 拦截 Object.isExtensible()
  isExtensible(target) {
    console.log('检查是否可扩展');
    return Reflect.isExtensible(target);
  },

  // 12. apply - 拦截函数调用
  apply(target, thisArg, args) {
    console.log(`调用函数，参数: ${args}`);
    return Reflect.apply(target, thisArg, args);
  },

  // 13. construct - 拦截 new 操作符
  construct(target, args) {
    console.log(`构造实例，参数: ${args}`);
    return Reflect.construct(target, args);
  }
};
```

## 实际应用场景

### 1. 数据验证（保护代理）

```javascript
// 数据验证代理
function createValidationProxy(target, rules) {
  return new Proxy(target, {
    set(target, property, value) {
      // 检查是否有验证规则
      const rule = rules[property];

      if (rule) {
        // 类型验证
        if (rule.type && typeof value !== rule.type) {
          throw new TypeError(
            `${property} 必须是 ${rule.type} 类型，实际是 ${typeof value}`
          );
        }

        // 必填验证
        if (rule.required && (value === undefined || value === null || value === '')) {
          throw new Error(`${property} 是必填字段`);
        }

        // 最小值验证
        if (rule.min !== undefined && value < rule.min) {
          throw new Error(`${property} 不能小于 ${rule.min}`);
        }

        // 最大值验证
        if (rule.max !== undefined && value > rule.max) {
          throw new Error(`${property} 不能大于 ${rule.max}`);
        }

        // 正则验证
        if (rule.pattern && !rule.pattern.test(value)) {
          throw new Error(`${property} 格式不正确`);
        }

        // 自定义验证
        if (rule.validator && !rule.validator(value)) {
          throw new Error(rule.message || `${property} 验证失败`);
        }
      }

      // 验证通过，设置值
      target[property] = value;
      return true;
    }
  });
}

// 使用示例
const user = {};
const userRules = {
  name: {
    type: 'string',
    required: true,
    validator: (value) => value.length >= 2,
    message: '姓名至少2个字符'
  },
  age: {
    type: 'number',
    min: 0,
    max: 150
  },
  email: {
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
};

const validatedUser = createValidationProxy(user, userRules);

try {
  validatedUser.name = '张'; // Error: 姓名至少2个字符
} catch (e) {
  console.error(e.message);
}

try {
  validatedUser.age = 200; // Error: age 不能大于 150
} catch (e) {
  console.error(e.message);
}

try {
  validatedUser.email = 'invalid'; // Error: email 格式不正确
} catch (e) {
  console.error(e.message);
}

// 正确的赋值
validatedUser.name = '张三';
validatedUser.age = 25;
validatedUser.email = 'zhangsan@example.com';
console.log(validatedUser); // { name: '张三', age: 25, email: 'zhangsan@example.com' }
```

### 2. 缓存代理

```javascript
// 缓存代理
function createCacheProxy(fn) {
  const cache = new Map();

  return new Proxy(fn, {
    apply(target, thisArg, args) {
      // 生成缓存 key
      const key = JSON.stringify(args);

      // 检查缓存
      if (cache.has(key)) {
        console.log('从缓存读取');
        return cache.get(key);
      }

      // 执行函数
      console.log('执行函数');
      const result = Reflect.apply(target, thisArg, args);

      // 存入缓存
      cache.set(key, result);

      return result;
    }
  });
}

// 计算斐波那契数列（开销大的运算）
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const cachedFibonacci = createCacheProxy(fibonacci);

console.log(cachedFibonacci(10)); // 执行函数, 55
console.log(cachedFibonacci(10)); // 从缓存读取, 55
console.log(cachedFibonacci(20)); // 执行函数, 6765
console.log(cachedFibonacci(20)); // 从缓存读取, 6765
```

### 3. 虚拟代理（图片懒加载）

```javascript
// 图片虚拟代理
class ImageLoader {
  constructor() {
    this.loadedImages = new Map();
  }

  // 实际加载图片
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        console.log(`图片加载完成: ${src}`);
        this.loadedImages.set(src, img);
        resolve(img);
      };

      img.onerror = () => {
        reject(new Error(`图片加载失败: ${src}`));
      };

      img.src = src;
    });
  }

  // 创建代理
  createProxy() {
    return new Proxy(this, {
      get(target, property) {
        if (property === 'loadImage') {
          return function(src) {
            // 如果已加载，直接返回
            if (target.loadedImages.has(src)) {
              console.log(`从缓存获取图片: ${src}`);
              return Promise.resolve(target.loadedImages.get(src));
            }

            // 否则加载图片
            return target.loadImage(src);
          };
        }

        return target[property];
      }
    });
  }
}

// 使用
const loader = new ImageLoader();
const proxyLoader = loader.createProxy();

// 图片懒加载实现
class LazyImage {
  constructor(container, realSrc) {
    this.container = container;
    this.realSrc = realSrc;
    this.img = null;

    this.init();
  }

  init() {
    // 创建占位图
    this.img = document.createElement('img');
    this.img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5Mb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg==';
    this.container.appendChild(this.img);

    // 监听滚动，图片进入视口时加载
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadRealImage();
          this.observer.disconnect();
        }
      });
    });

    this.observer.observe(this.img);
  }

  async loadRealImage() {
    try {
      const realImg = await proxyLoader.loadImage(this.realSrc);
      this.img.src = this.realSrc;
      this.img.classList.add('loaded');
    } catch (error) {
      console.error(error);
      this.img.src = 'error.jpg'; // 错误占位图
    }
  }
}

// 使用
// const lazyImage = new LazyImage(
//   document.getElementById('container'),
//   'https://example.com/large-image.jpg'
// );
```

### 4. 日志代理

```javascript
// 日志代理
function createLogProxy(target, options = {}) {
  const {
    logGet = true,
    logSet = true,
    logMethod = true,
    logger = console.log
  } = options;

  return new Proxy(target, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);

      // 记录属性读取
      if (logGet && typeof value !== 'function') {
        logger(`[GET] ${property}: ${JSON.stringify(value)}`);
      }

      // 拦截方法调用
      if (logMethod && typeof value === 'function') {
        return new Proxy(value, {
          apply(fn, thisArg, args) {
            const start = Date.now();
            logger(`[CALL] ${property}(${JSON.stringify(args)})`);

            const result = Reflect.apply(fn, thisArg, args);

            const duration = Date.now() - start;
            logger(`[RETURN] ${property} => ${JSON.stringify(result)} (${duration}ms)`);

            return result;
          }
        });
      }

      return value;
    },

    set(target, property, value, receiver) {
      // 记录属性设置
      if (logSet) {
        const oldValue = target[property];
        logger(`[SET] ${property}: ${JSON.stringify(oldValue)} => ${JSON.stringify(value)}`);
      }

      return Reflect.set(target, property, value, receiver);
    }
  });
}

// 使用示例
class Calculator {
  constructor() {
    this.result = 0;
  }

  add(a, b) {
    this.result = a + b;
    return this.result;
  }

  multiply(a, b) {
    this.result = a * b;
    return this.result;
  }
}

const calculator = new Calculator();
const loggedCalculator = createLogProxy(calculator);

loggedCalculator.add(5, 3);
// [CALL] add([5,3])
// [RETURN] add => 8 (0ms)

loggedCalculator.multiply(4, 2);
// [CALL] multiply([4,2])
// [RETURN] multiply => 8 (0ms)

console.log(loggedCalculator.result);
// [GET] result: 8
```

### 5. 只读代理

```javascript
// 创建只读代理
function createReadonlyProxy(target) {
  return new Proxy(target, {
    set(target, property, value) {
      console.warn(`Cannot set property ${property}, object is readonly`);
      return false;
    },

    deleteProperty(target, property) {
      console.warn(`Cannot delete property ${property}, object is readonly`);
      return false;
    },

    defineProperty(target, property, descriptor) {
      console.warn(`Cannot define property ${property}, object is readonly`);
      return false;
    }
  });
}

// 使用
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
};

const readonlyConfig = createReadonlyProxy(config);

console.log(readonlyConfig.apiUrl); // https://api.example.com

readonlyConfig.apiUrl = 'https://newapi.com'; // Warning: Cannot set property apiUrl
console.log(readonlyConfig.apiUrl); // 仍然是 https://api.example.com

delete readonlyConfig.timeout; // Warning: Cannot delete property timeout
console.log(readonlyConfig.timeout); // 仍然是 5000
```

### 6. 负索引代理（类似 Python）

```javascript
// 支持负索引的数组代理
function createNegativeIndexProxy(arr) {
  return new Proxy(arr, {
    get(target, property) {
      const index = Number(property);

      // 处理负索引
      if (index < 0) {
        property = target.length + index;
      }

      return target[property];
    }
  });
}

// 使用
const arr = [1, 2, 3, 4, 5];
const proxyArr = createNegativeIndexProxy(arr);

console.log(proxyArr[0]);   // 1
console.log(proxyArr[-1]);  // 5（最后一个元素）
console.log(proxyArr[-2]);  // 4（倒数第二个）
console.log(proxyArr[-5]);  // 1（倒数第五个）
```

## Vue 3 响应式原理（Proxy 应用）

```javascript
// 简化版 Vue 3 响应式系统
const targetMap = new WeakMap();
let activeEffect = null;

// 依赖收集
function track(target, property) {
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(property);
  if (!dep) {
    depsMap.set(property, (dep = new Set()));
  }

  dep.add(activeEffect);
}

// 触发更新
function trigger(target, property) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(property);
  if (dep) {
    dep.forEach(effect => effect());
  }
}

// 副作用函数
function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

// 创建响应式对象
function reactive(target) {
  return new Proxy(target, {
    get(target, property, receiver) {
      const result = Reflect.get(target, property, receiver);

      // 收集依赖
      track(target, property);

      // 如果是对象，递归代理
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }

      return result;
    },

    set(target, property, value, receiver) {
      const oldValue = target[property];
      const result = Reflect.set(target, property, value, receiver);

      // 值改变时触发更新
      if (oldValue !== value) {
        trigger(target, property);
      }

      return result;
    }
  });
}

// 计算属性
function computed(getter) {
  let value;
  let dirty = true;

  const effectFn = effect(() => {
    value = getter();
    dirty = false;
  });

  return {
    get value() {
      if (dirty) {
        effectFn();
      }
      return value;
    }
  };
}

// 使用示例
const state = reactive({
  count: 0,
  message: 'Hello'
});

// 副作用函数1
effect(() => {
  console.log('count changed:', state.count);
});

// 副作用函数2
effect(() => {
  console.log('message changed:', state.message);
});

// 计算属性
const doubleCount = computed(() => state.count * 2);

state.count++; // 输出: count changed: 1
console.log(doubleCount.value); // 2

state.message = 'Hi'; // 输出: message changed: Hi
```

## Proxy vs Object.defineProperty

这是 Vue 2 和 Vue 3 响应式原理的核心区别。

### Object.defineProperty（Vue 2）

```javascript
function defineReactive(obj, key, val) {
  Object.defineProperty(obj, key, {
    get() {
      console.log(`get ${key}: ${val}`);
      return val;
    },
    set(newVal) {
      console.log(`set ${key}: ${val} => ${newVal}`);
      val = newVal;
    }
  });
}

const obj = {};
defineReactive(obj, 'name', '张三');

console.log(obj.name); // get name: 张三
obj.name = '李四'; // set name: 张三 => 李四
```

### Proxy（Vue 3）

```javascript
const obj = { name: '张三' };

const proxy = new Proxy(obj, {
  get(target, property) {
    console.log(`get ${property}: ${target[property]}`);
    return target[property];
  },
  set(target, property, value) {
    console.log(`set ${property}: ${target[property]} => ${value}`);
    target[property] = value;
    return true;
  }
});

console.log(proxy.name); // get name: 张三
proxy.name = '李四'; // set name: 张三 => 李四
```

### 对比总结

| 特性 | Object.defineProperty | Proxy |
|------|----------------------|-------|
| **监听新增属性** | ❌ 不支持（需要 Vue.set） | ✅ 支持 |
| **监听删除属性** | ❌ 不支持（需要 Vue.delete） | ✅ 支持 |
| **监听数组** | ❌ 需要重写数组方法 | ✅ 原生支持 |
| **监听数组索引** | ❌ 不支持 | ✅ 支持 |
| **深度监听** | ❌ 需要递归遍历 | ✅ 支持（懒递归） |
| **性能** | 初始化时遍历所有属性 | 懒代理，性能更好 |
| **兼容性** | ✅ IE9+ | ❌ IE不支持 |

## 优缺点分析

### 优点

1. **增强功能**：在不修改原对象的情况下增强功能
2. **控制访问**：可以控制对目标对象的访问
3. **解耦**：将访问控制逻辑与业务逻辑分离
4. **灵活性**：可以在运行时动态添加代理行为

### 缺点

1. **性能开销**：增加了一层间接访问
2. **复杂性**：增加了系统的复杂度
3. **调试困难**：代理对象可能使调试变得困难

