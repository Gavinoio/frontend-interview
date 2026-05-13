# 装饰器模式（Decorator Pattern）

## 定义

装饰器模式允许向一个现有的对象添加新的功能，同时又不改变其结构。这种模式创建了一个装饰类，用来包装原有的类，并在保持类方法签名完整性的前提下，提供了额外的功能。

## 核心思想

在不修改原对象的情况下，通过装饰器动态地给对象添加额外的职责。装饰器模式是继承的一个替代方案。

## 核心组成

1. **Component（组件接口）**：定义对象的接口
2. **ConcreteComponent（具体组件）**：被装饰的原始对象
3. **Decorator（装饰器）**：维持一个指向 Component 对象的引用
4. **ConcreteDecorator（具体装饰器）**：向组件添加新功能

## 传统装饰器模式

```javascript
// 组件接口
class Component {
  operation() {
    throw new Error('子类必须实现 operation 方法');
  }
}

// 具体组件
class ConcreteComponent extends Component {
  operation() {
    return '基础功能';
  }
}

// 装饰器基类
class Decorator extends Component {
  constructor(component) {
    super();
    this.component = component;
  }

  operation() {
    return this.component.operation();
  }
}

// 具体装饰器A
class ConcreteDecoratorA extends Decorator {
  operation() {
    return `装饰器A(${this.component.operation()})`;
  }
}

// 具体装饰器B
class ConcreteDecoratorB extends Decorator {
  operation() {
    return `装饰器B(${this.component.operation()})`;
  }
}

// 使用
let component = new ConcreteComponent();
console.log(component.operation()); // '基础功能'

// 添加装饰器A
component = new ConcreteDecoratorA(component);
console.log(component.operation()); // '装饰器A(基础功能)'

// 再添加装饰器B
component = new ConcreteDecoratorB(component);
console.log(component.operation()); // '装饰器B(装饰器A(基础功能))'
```

## JavaScript 函数装饰器

JavaScript 中，由于函数是一等公民，装饰器可以更简洁地实现：

```javascript
// 基础函数
function greet(name) {
  return `Hello, ${name}!`;
}

// 装饰器：添加日志
function withLogging(fn) {
  return function(...args) {
    console.log(`调用函数，参数: ${JSON.stringify(args)}`);
    const result = fn.apply(this, args);
    console.log(`返回结果: ${result}`);
    return result;
  };
}

// 装饰器：计时
function withTiming(fn) {
  return function(...args) {
    const start = Date.now();
    const result = fn.apply(this, args);
    const duration = Date.now() - start;
    console.log(`执行耗时: ${duration}ms`);
    return result;
  };
}

// 应用装饰器
let decoratedGreet = withLogging(greet);
decoratedGreet = withTiming(decoratedGreet);

decoratedGreet('张三');
// 调用函数，参数: ["张三"]
// 返回结果: Hello, 张三!
// 执行耗时: 0ms
```

## ES7/TypeScript 装饰器

### 类装饰器

```typescript
// 类装饰器
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }

  greet() {
    return `Hello, ${this.greeting}`;
  }
}
```

### 方法装饰器

```typescript
// 方法装饰器：日志记录
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args: any[]) {
    console.log(`调用方法: ${propertyKey}`);
    console.log(`参数: ${JSON.stringify(args)}`);

    const result = originalMethod.apply(this, args);

    console.log(`返回值: ${JSON.stringify(result)}`);
    return result;
  };

  return descriptor;
}

// 方法装饰器：性能监控
function measure(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args: any[]) {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    const duration = performance.now() - start;

    console.log(`${propertyKey} 执行耗时: ${duration.toFixed(2)}ms`);
    return result;
  };

  return descriptor;
}

class Calculator {
  @log
  @measure
  add(a: number, b: number): number {
    return a + b;
  }

  @log
  multiply(a: number, b: number): number {
    return a * b;
  }
}

const calc = new Calculator();
calc.add(5, 3);
// 调用方法: add
// 参数: [5,3]
// add 执行耗时: 0.05ms
// 返回值: 8
```

### 属性装饰器

```typescript
// 属性装饰器：只读
function readonly(target: any, propertyKey: string) {
  Object.defineProperty(target, propertyKey, {
    writable: false
  });
}

// 属性装饰器：验证
function validate(validator: (value: any) => boolean, message: string) {
  return function(target: any, propertyKey: string) {
    let value: any;

    Object.defineProperty(target, propertyKey, {
      get() {
        return value;
      },
      set(newValue: any) {
        if (!validator(newValue)) {
          throw new Error(message);
        }
        value = newValue;
      }
    });
  };
}

class User {
  @readonly
  id: number = 1;

  @validate((value) => value.length >= 2, '姓名至少2个字符')
  name: string = '';

  @validate((value) => value >= 0 && value <= 150, '年龄必须在0-150之间')
  age: number = 0;
}

const user = new User();
// user.id = 2; // Error: Cannot assign to read only property
user.name = '张三'; // OK
// user.age = 200; // Error: 年龄必须在0-150之间
```

### 参数装饰器

```typescript
// 参数装饰器：验证
function required(target: any, propertyKey: string, parameterIndex: number) {
  const existingRequiredParameters: number[] =
    Reflect.getOwnMetadata('required', target, propertyKey) || [];

  existingRequiredParameters.push(parameterIndex);

  Reflect.defineMetadata(
    'required',
    existingRequiredParameters,
    target,
    propertyKey
  );
}

function validateParameters(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args: any[]) {
    const requiredParameters: number[] =
      Reflect.getOwnMetadata('required', target, propertyKey) || [];

    for (const index of requiredParameters) {
      if (args[index] === undefined || args[index] === null) {
        throw new Error(`参数 ${index} 是必需的`);
      }
    }

    return originalMethod.apply(this, args);
  };

  return descriptor;
}

class UserService {
  @validateParameters
  createUser(@required name: string, @required age: number, email?: string) {
    console.log(`创建用户: ${name}, ${age}, ${email || '无'}`);
  }
}

const service = new UserService();
service.createUser('张三', 25); // OK
// service.createUser('张三', null); // Error: 参数 1 是必需的
```

## 实际应用场景

### 1. AOP（面向切面编程）

```javascript
// AOP 装饰器工厂
function createAOPDecorator(before, after, error) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      try {
        // 前置处理
        if (before) {
          await before.call(this, args);
        }

        // 执行原方法
        const result = await originalMethod.apply(this, args);

        // 后置处理
        if (after) {
          await after.call(this, result);
        }

        return result;
      } catch (err) {
        // 错误处理
        if (error) {
          await error.call(this, err);
        } else {
          throw err;
        }
      }
    };

    return descriptor;
  };
}

// 具体装饰器
function logMethod(target, propertyKey, descriptor) {
  return createAOPDecorator(
    function(args) {
      console.log(`[${propertyKey}] 开始执行，参数:`, args);
    },
    function(result) {
      console.log(`[${propertyKey}] 执行完成，结果:`, result);
    },
    function(error) {
      console.error(`[${propertyKey}] 执行错误:`, error);
    }
  )(target, propertyKey, descriptor);
}

function catchError(errorHandler) {
  return function(target, propertyKey, descriptor) {
    return createAOPDecorator(
      null,
      null,
      errorHandler
    )(target, propertyKey, descriptor);
  };
}

// 使用
class UserService {
  @logMethod
  async getUser(id) {
    // 模拟 API 调用
    return { id, name: '张三', age: 25 };
  }

  @catchError(function(error) {
    console.error('捕获到错误:', error.message);
    // 可以上报错误、显示提示等
  })
  async deleteUser(id) {
    throw new Error('删除失败');
  }
}

const service = new UserService();
await service.getUser(1);
// [getUser] 开始执行，参数: [1]
// [getUser] 执行完成，结果: { id: 1, name: '张三', age: 25 }

await service.deleteUser(1);
// 捕获到错误: 删除失败
```

### 2. 防抖和节流装饰器

```javascript
// 防抖装饰器
function debounce(delay) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    let timeoutId;

    descriptor.value = function(...args) {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        originalMethod.apply(this, args);
      }, delay);
    };

    return descriptor;
  };
}

// 节流装饰器
function throttle(delay) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    let lastTime = 0;

    descriptor.value = function(...args) {
      const now = Date.now();

      if (now - lastTime >= delay) {
        lastTime = now;
        originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}

// 使用
class SearchComponent {
  @debounce(500)
  handleSearch(keyword) {
    console.log('搜索:', keyword);
    // 实际的搜索逻辑
  }

  @throttle(1000)
  handleScroll(event) {
    console.log('滚动:', event);
    // 实际的滚动处理逻辑
  }
}

const search = new SearchComponent();

// 连续调用，只有最后一次会执行
search.handleSearch('a');
search.handleSearch('ab');
search.handleSearch('abc'); // 500ms 后执行这次

// 连续调用，每1秒最多执行一次
search.handleScroll({ y: 100 });
search.handleScroll({ y: 200 }); // 被忽略
search.handleScroll({ y: 300 }); // 被忽略
// 1秒后
search.handleScroll({ y: 400 }); // 执行
```

### 3. 缓存装饰器

```javascript
// 缓存装饰器
function memoize(target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;
  const cache = new Map();

  descriptor.value = function(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      console.log('从缓存读取');
      return cache.get(key);
    }

    console.log('执行计算');
    const result = originalMethod.apply(this, args);
    cache.set(key, result);

    return result;
  };

  return descriptor;
}

// 带过期时间的缓存
function memoizeWithTTL(ttl) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    const cache = new Map();

    descriptor.value = function(...args) {
      const key = JSON.stringify(args);
      const cached = cache.get(key);

      // 检查缓存是否存在且未过期
      if (cached && Date.now() - cached.time < ttl) {
        console.log('从缓存读取');
        return cached.value;
      }

      console.log('执行计算');
      const result = originalMethod.apply(this, args);
      cache.set(key, {
        value: result,
        time: Date.now()
      });

      return result;
    };

    return descriptor;
  };
}

// 使用
class Calculator {
  @memoize
  fibonacci(n) {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }

  @memoizeWithTTL(5000) // 5秒过期
  async fetchData(id) {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { id, data: 'some data' };
  }
}

const calc = new Calculator();
console.log(calc.fibonacci(10)); // 执行计算
console.log(calc.fibonacci(10)); // 从缓存读取
```

### 4. 权限验证装饰器

```javascript
// 权限验证装饰器
function requireAuth(target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args) {
    // 检查用户是否登录
    const isAuthenticated = this.isUserAuthenticated();

    if (!isAuthenticated) {
      throw new Error('未登录，请先登录');
    }

    return originalMethod.apply(this, args);
  };

  return descriptor;
}

// 角色验证装饰器
function requireRole(...roles) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function(...args) {
      const userRole = this.getUserRole();

      if (!roles.includes(userRole)) {
        throw new Error(`需要 ${roles.join(' 或 ')} 权限`);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// 使用
class UserController {
  isUserAuthenticated() {
    // 实际的认证逻辑
    return localStorage.getItem('token') !== null;
  }

  getUserRole() {
    // 实际的获取角色逻辑
    return localStorage.getItem('role');
  }

  @requireAuth
  getUserInfo() {
    return { name: '张三', email: 'zhangsan@example.com' };
  }

  @requireAuth
  @requireRole('admin', 'superadmin')
  deleteUser(userId) {
    console.log(`删除用户: ${userId}`);
  }

  @requireAuth
  @requireRole('editor', 'admin')
  editArticle(articleId) {
    console.log(`编辑文章: ${articleId}`);
  }
}

const controller = new UserController();

// localStorage.setItem('token', 'xxx');
// localStorage.setItem('role', 'admin');

try {
  controller.getUserInfo(); // OK
  controller.deleteUser(1); // OK
  controller.editArticle(1); // OK
} catch (error) {
  console.error(error.message);
}
```

### 5. 重试装饰器

```javascript
// 重试装饰器
function retry(maxAttempts, delay = 1000) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      let lastError;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(`[${propertyKey}] 第 ${attempt} 次尝试`);
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error;
          console.error(`[${propertyKey}] 第 ${attempt} 次失败:`, error.message);

          if (attempt < maxAttempts) {
            console.log(`等待 ${delay}ms 后重试...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      throw new Error(`失败 ${maxAttempts} 次后放弃: ${lastError.message}`);
    };

    return descriptor;
  };
}

// 使用
class ApiClient {
  @retry(3, 2000) // 最多重试3次，间隔2秒
  async fetchData(url) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return response.json();
  }
}

const client = new ApiClient();
await client.fetchData('https://api.example.com/data');
// [fetchData] 第 1 次尝试
// [fetchData] 第 1 次失败: HTTP Error: 500
// 等待 2000ms 后重试...
// [fetchData] 第 2 次尝试
// ...
```

### 6. React 高阶组件（HOC）

```javascript
// React 高阶组件就是装饰器模式的应用

// withLoading HOC
function withLoading(WrappedComponent) {
  return class extends React.Component {
    render() {
      const { isLoading, ...props } = this.props;

      if (isLoading) {
        return <div>Loading...</div>;
      }

      return <WrappedComponent {...props} />;
    }
  };
}

// withAuth HOC
function withAuth(WrappedComponent) {
  return class extends React.Component {
    componentDidMount() {
      const isAuthenticated = this.checkAuth();

      if (!isAuthenticated) {
        // 重定向到登录页
        this.props.history.push('/login');
      }
    }

    checkAuth() {
      return localStorage.getItem('token') !== null;
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}

// 使用
class UserProfile extends React.Component {
  render() {
    return <div>用户信息</div>;
  }
}

// 应用装饰器
const EnhancedUserProfile = withAuth(withLoading(UserProfile));

// 或使用装饰器语法（需要配置）
@withAuth
@withLoading
class UserProfile extends React.Component {
  render() {
    return <div>用户信息</div>;
  }
}
```

## 装饰器模式 vs 继承

### 使用继承（不灵活）

```javascript
class Component {
  operation() {
    return '基础功能';
  }
}

// 需要创建多个子类
class ComponentWithA extends Component {
  operation() {
    return `A(${super.operation()})`;
  }
}

class ComponentWithB extends Component {
  operation() {
    return `B(${super.operation()})`;
  }
}

// 如果需要同时使用A和B，需要再创建一个类
class ComponentWithAB extends Component {
  operation() {
    return `B(A(${super.operation()}))`;
  }
}

// 类爆炸问题：n个功能需要 2^n 个类
```

### 使用装饰器（灵活）

```javascript
class Component {
  operation() {
    return '基础功能';
  }
}

function decoratorA(component) {
  const original = component.operation.bind(component);
  component.operation = () => `A(${original()})`;
  return component;
}

function decoratorB(component) {
  const original = component.operation.bind(component);
  component.operation = () => `B(${original()})`;
  return component;
}

// 灵活组合
let component = new Component();
component = decoratorA(component);
component = decoratorB(component);

console.log(component.operation()); // B(A(基础功能))
```

## 优缺点分析

### 优点

1. **灵活性**：比继承更灵活，可以动态添加功能
2. **单一职责**：每个装饰器只关注一个功能
3. **可组合**：多个装饰器可以自由组合
4. **符合开闭原则**：无需修改原代码即可扩展功能
5. **避免类爆炸**：不需要为每种组合创建子类

### 缺点

1. **复杂性增加**：多个装饰器叠加可能难以理解
2. **调试困难**：装饰器链过长时，调试变得困难
3. **顺序依赖**：装饰器的顺序可能影响结果
4. **类型丢失**：在 TypeScript 中可能丢失类型信息

## 面试高频题

::: details 1. 什么是装饰器模式？
**参考答案**：

装饰器模式允许向对象动态添加新功能，而不改变其结构。它通过创建装饰类来包装原有的类，提供额外的功能。

**核心特点**：
- 动态添加功能
- 不改变原对象
- 可以叠加使用
- 是继承的替代方案
:::

::: details 2. 装饰器模式和代理模式的区别？
**参考答案**：

| 特性 | 装饰器模式 | 代理模式 |
|------|-----------|---------|
| 目的 | 增强功能 | 控制访问 |
| 关系 | 装饰器知道被装饰对象 | 代理控制对目标对象的访问 |
| 使用 | 可以叠加多个装饰器 | 通常只有一层代理 |
| 创建时机 | 运行时动态添加 | 可以延迟创建对象 |
:::

::: details 3. JavaScript/TypeScript 中如何使用装饰器？
**参考答案**：

```javascript
// 函数装饰器
function withLogging(fn) {
  return function(...args) {
    console.log('调用函数');
    return fn.apply(this, args);
  };
}

// TypeScript 装饰器
function log(target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function(...args) {
    console.log(`调用 ${propertyKey}`);
    return originalMethod.apply(this, args);
  };
  return descriptor;
}

class MyClass {
  @log
  myMethod() {
    console.log('执行方法');
  }
}
```
:::

::: details 4. 装饰器模式的应用场景？
**参考答案**：

1. **AOP 编程**：日志、性能监控、错误处理
2. **函数增强**：防抖、节流、缓存
3. **权限控制**：登录验证、角色验证
4. **React HOC**：withRouter、connect
5. **表单验证**：字段验证装饰器
6. **API 重试**：自动重试失败的请求
:::

::: details 5. 手写一个防抖装饰器
**参考答案**：

```javascript
function debounce(delay) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    let timeoutId;

    descriptor.value = function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        originalMethod.apply(this, args);
      }, delay);
    };

    return descriptor;
  };
}

class SearchComponent {
  @debounce(500)
  handleSearch(keyword) {
    console.log('搜索:', keyword);
  }
}
```
:::

::: details 6. 装饰器模式 vs 继承？
**参考答案**：

**装饰器模式优势**：
- 更灵活，可以动态添加功能
- 避免类爆炸问题
- 可以自由组合多个装饰器
- 符合单一职责原则

**继承的问题**：
- 静态，编译时确定
- 多个功能组合需要创建大量子类
- 功能耦合在类层次结构中

**选择建议**：
- 需要动态添加功能时使用装饰器
- 需要共享代码和多态时使用继承
:::

## 总结

装饰器模式是前端开发中非常实用的设计模式，需要掌握：

**核心要点**：
1. **核心思想**：动态添加功能，不改变原对象
2. **实现方式**：函数装饰器、TypeScript 装饰器、React HOC
3. **典型应用**：AOP、防抖节流、权限控制等
4. **与继承对比**：更灵活，避免类爆炸

**面试准备**：
- 理解装饰器模式的核心思想
- 掌握多种实现方式
- 会手写常用装饰器（防抖、日志等）
- 理解与代理模式、继承的区别
- 了解 React HOC 的原理

**学习建议**：
- 从简单函数装饰器开始
- 学习 TypeScript 装饰器语法
- 深入理解 React HOC
- 在项目中实践应用
- 总结常用装饰器模板

装饰器模式是提升代码复用性和可维护性的重要手段，是前端开发者必须掌握的设计模式之一。
