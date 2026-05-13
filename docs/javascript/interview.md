# JavaScript 面试题精选

> 汇总 JavaScript 核心概念、异步、原型、闭包、ES6+、手写代码等高频面试题。

## 数据类型

::: details 1. JavaScript 有哪些数据类型？如何判断？
**8 种数据类型：**
- 基本类型（7）：`undefined`、`null`、`boolean`、`number`、`string`、`symbol`、`bigint`
- 引用类型（1）：`object`（包含 Array、Function、Date 等）

**判断方法：**

| 方法 | 适用场景 | 局限 |
|------|---------|------|
| `typeof` | 基本类型 | `typeof null === 'object'`（历史 bug） |
| `instanceof` | 引用类型 | 跨 iframe 失效 |
| `Array.isArray()` | 数组 | 仅数组 |
| `Object.prototype.toString.call()` | 所有类型（最准确） | 写法繁琐 |

```javascript
Object.prototype.toString.call(null)      // '[object Null]'
Object.prototype.toString.call([])        // '[object Array]'
Object.prototype.toString.call(new Date) // '[object Date]'
```

---
:::

::: details 2. == 和 === 的区别？
- `===`（严格相等）：类型和值都必须相同，不做类型转换
- `==`（宽松相等）：会进行类型转换后比较

**常见陷阱：**
```javascript
null == undefined  // true
null === undefined // false
0 == false         // true
'' == false        // true
NaN == NaN         // false（NaN 不等于任何值，包括自身）
```

**推荐**：始终使用 `===`，除非明确需要 `null == undefined` 的场景。

---
:::

::: details 3. null 和 undefined 的区别？
- `undefined`：变量声明但未赋值；函数无返回值；访问不存在的属性
- `null`：主动赋值，表示"空值"或"无对象"

```javascript
typeof undefined // 'undefined'
typeof null      // 'object'（历史遗留 bug）
null == undefined  // true
null === undefined // false
```

---
:::

::: details 4. 什么是类型转换？有哪些隐式转换规则？
**转换规则：**
- `+` 运算符：有字符串则转字符串，否则转数字
- `-`、`*`、`/`：转数字
- 比较运算符：转数字（对象先调用 valueOf/toString）
- 逻辑运算符：转布尔值

**转为 false 的值（falsy）**：`false`、`0`、`''`、`null`、`undefined`、`NaN`

---
:::

## 作用域与闭包

::: details 5. 什么是闭包？有什么应用场景？
**定义**：函数能够访问其词法作用域中的变量，即使该函数在其词法作用域之外执行。

```javascript
function counter() {
    let count = 0;
    return {
        increment: () => ++count,
        get: () => count
    };
}
const c = counter();
c.increment(); // 1
c.get();       // 1
```

**应用场景：**
1. **数据私有化**：模块模式，隐藏内部状态
2. **函数工厂**：根据参数生成不同函数
3. **防抖/节流**：保存定时器 ID
4. **记忆化（Memoize）**：缓存计算结果

**注意**：闭包会持有外部变量引用，可能导致内存泄漏，用完应手动置 null。

---
:::

::: details 6. var、let、const 的区别？
| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 提升（初始化为 undefined） | 提升但不初始化（TDZ） | 提升但不初始化（TDZ） |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许（引用不可变） |
| 全局属性 | 挂载到 window | 不挂载 | 不挂载 |

**TDZ（暂时性死区）**：let/const 声明前访问会抛出 ReferenceError。

---
:::

::: details 7. 什么是变量提升（Hoisting）？
JavaScript 引擎在执行前会将变量和函数声明"提升"到作用域顶部：
- `var` 声明提升，初始化为 `undefined`
- `function` 声明整体提升（包括函数体）
- `let/const` 声明提升但不初始化（TDZ）

```javascript
console.log(a); // undefined（var 提升）
var a = 1;

console.log(b); // ReferenceError（TDZ）
let b = 2;

foo(); // 'foo'（函数声明整体提升）
function foo() { console.log('foo'); }
```

---
:::

## 原型与继承

::: details 8. 什么是原型链？
每个对象都有 `__proto__` 属性指向其原型对象，原型对象也有自己的原型，形成链式结构，直到 `null` 为止。

```javascript
const arr = [];
arr.__proto__ === Array.prototype        // true
Array.prototype.__proto__ === Object.prototype // true
Object.prototype.__proto__ === null      // true
```

属性查找沿原型链向上，直到找到或到达 `null`。

---
:::

::: details 9. instanceof 的原理是什么？
检查右侧构造函数的 `prototype` 是否在左侧对象的原型链上：

```javascript
function myInstanceof(obj, Constructor) {
    let proto = Object.getPrototypeOf(obj);
    while (proto !== null) {
        if (proto === Constructor.prototype) return true;
        proto = Object.getPrototypeOf(proto);
    }
    return false;
}
```

---
:::

::: details 10. 实现继承的几种方式？各有什么优缺点？
| 方式 | 优点 | 缺点 |
|------|------|------|
| 原型链继承 | 简单 | 引用类型共享，无法传参 |
| 构造函数继承 | 可传参，引用类型独立 | 无法继承原型方法 |
| 组合继承 | 解决上述问题 | 调用两次父构造函数 |
| 寄生组合继承 | 最优，ES6 class 的原理 | 写法稍复杂 |
| ES6 class extends | 语法简洁，最推荐 | 需要 Babel 转译兼容旧浏览器 |

```javascript
// 寄生组合继承（最优方案）
function Parent(name) { this.name = name; }
Parent.prototype.sayName = function() { return this.name; };

function Child(name, age) {
    Parent.call(this, name); // 继承实例属性
    this.age = age;
}
Child.prototype = Object.create(Parent.prototype); // 继承原型方法
Child.prototype.constructor = Child;
```

---
:::

## this 指向

::: details 11. this 的指向规则是什么？
| 调用方式 | this 指向 |
|---------|-----------|
| 普通函数调用 | `window`（严格模式为 `undefined`） |
| 方法调用 | 调用该方法的对象 |
| `new` 调用 | 新创建的实例对象 |
| `call/apply/bind` | 第一个参数指定的对象 |
| 箭头函数 | 定义时所在的词法作用域的 `this` |

**优先级**：`new` > `call/apply/bind` > 方法调用 > 普通调用

---
:::

::: details 12. 箭头函数和普通函数的区别？
1. **this**：箭头函数没有自己的 `this`，继承外层词法作用域的 `this`
2. **arguments**：箭头函数没有 `arguments` 对象
3. **new**：箭头函数不能作为构造函数（不能 `new`）
4. **prototype**：箭头函数没有 `prototype` 属性
5. **语法**：更简洁

---
:::

## 异步编程

::: details 13. Promise 的三种状态是什么？有哪些方法？
**三种状态**：`pending`（等待）→ `fulfilled`（成功）或 `rejected`（失败），状态不可逆。

**常用方法：**
- `Promise.resolve/reject`：创建已决议的 Promise
- `Promise.all(arr)`：全部成功才成功，一个失败则失败
- `Promise.allSettled(arr)`：等待全部完成，不管成功失败
- `Promise.race(arr)`：第一个完成的结果（成功或失败）
- `Promise.any(arr)`：第一个成功的结果，全失败才失败

---
:::

::: details 14. async/await 的原理是什么？
`async/await` 是 Generator + Promise 的语法糖：
- `async` 函数返回一个 Promise
- `await` 暂停函数执行，等待 Promise 决议，本质是 `then` 的语法糖
- 错误处理用 `try/catch`，等同于 `.catch()`

```javascript
// async/await 等价于：
async function fetchData() {
    const res = await fetch('/api/data');
    return res.json();
}

// 等价于：
function fetchData() {
    return fetch('/api/data').then(res => res.json());
}
```

---
:::

::: details 15. 什么是事件循环（Event Loop）？宏任务和微任务的区别？
JavaScript 是单线程的，通过事件循环处理异步：

**执行顺序**：同步代码 → 微任务队列（清空）→ 宏任务（一个）→ 微任务队列（清空）→ ...

**微任务**（优先级高）：`Promise.then/catch/finally`、`queueMicrotask`、`MutationObserver`

**宏任务**：`setTimeout`、`setInterval`、`setImmediate`、I/O、UI 渲染

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// 输出：1 4 3 2
```

---
:::

## ES6+

::: details 16. ES6 有哪些重要新特性？
1. **let/const**：块级作用域
2. **箭头函数**：简洁语法，词法 this
3. **解构赋值**：数组和对象解构
4. **模板字符串**：`` `${var}` ``
5. **默认参数**：`function(a = 1) {}`
6. **展开运算符**：`...arr`
7. **Promise**：异步编程
8. **class**：语法糖，基于原型
9. **模块化**：`import/export`
10. **Symbol**：唯一值
11. **Map/Set**：新数据结构
12. **Proxy/Reflect**：元编程
13. **Generator/Iterator**：迭代器协议

---
:::

::: details 17. Map 和 Object 的区别？Set 和 Array 的区别？
**Map vs Object：**
- Map 的键可以是任意类型，Object 的键只能是字符串/Symbol
- Map 保持插入顺序，Object 不保证
- Map 有 `size` 属性，Object 需要 `Object.keys().length`
- Map 性能更好（频繁增删）

**Set vs Array：**
- Set 的值唯一，Array 可重复
- Set 没有索引，不能通过下标访问
- Set 的 `has()` 是 O(1)，Array 的 `includes()` 是 O(n)
- 常用 Set 去重：`[...new Set(arr)]`

---
:::

::: details 18. Proxy 和 Object.defineProperty 的区别？
| 特性 | Proxy | Object.defineProperty |
|------|-------|----------------------|
| 拦截操作 | 13 种（get/set/has/delete 等） | 仅 get/set |
| 数组支持 | 原生支持 | 需要特殊处理 |
| 新增属性 | 自动拦截 | 需要手动添加 |
| 性能 | 略低（代理层） | 略高 |
| Vue 版本 | Vue 3 使用 | Vue 2 使用 |

---
:::

## 模块化

::: details 19. CommonJS 和 ES Module 的区别？
| 特性 | CommonJS | ES Module |
|------|---------|-----------|
| 语法 | `require/module.exports` | `import/export` |
| 加载时机 | 运行时（动态） | 编译时（静态） |
| 输出 | 值的拷贝 | 值的引用（live binding） |
| 同步/异步 | 同步 | 异步（可 tree-shaking） |
| 环境 | Node.js | 浏览器 + Node.js |
| this | module 对象 | undefined |

---
:::

## 手写代码

::: details 20. 手写 call、apply、bind
```javascript
// call
Function.prototype.myCall = function(ctx, ...args) {
    ctx = ctx ?? globalThis;
    const key = Symbol();
    ctx[key] = this;
    const result = ctx[key](...args);
    delete ctx[key];
    return result;
};

// apply
Function.prototype.myApply = function(ctx, args = []) {
    ctx = ctx ?? globalThis;
    const key = Symbol();
    ctx[key] = this;
    const result = ctx[key](...args);
    delete ctx[key];
    return result;
};

// bind
Function.prototype.myBind = function(ctx, ...args) {
    const fn = this;
    return function(...innerArgs) {
        // 处理 new 调用
        if (this instanceof fn) {
            return new fn(...args, ...innerArgs);
        }
        return fn.apply(ctx, [...args, ...innerArgs]);
    };
};
```

---
:::

::: details 21. 手写防抖和节流
```javascript
// 防抖：最后一次触发后 delay ms 执行
function debounce(fn, delay) {
    let timer = null;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// 节流：每 interval ms 最多执行一次
function throttle(fn, interval) {
    let lastTime = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastTime >= interval) {
            lastTime = now;
            fn.apply(this, args);
        }
    };
}
```

---
:::

::: details 22. 手写深拷贝
```javascript
function deepClone(obj, map = new WeakMap()) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof RegExp) return new RegExp(obj);

    // 处理循环引用
    if (map.has(obj)) return map.get(obj);

    const clone = Array.isArray(obj) ? [] : {};
    map.set(obj, clone);

    for (const key of Reflect.ownKeys(obj)) {
        clone[key] = deepClone(obj[key], map);
    }
    return clone;
}
```

---
:::

::: details 23. 手写 Promise
```javascript
class MyPromise {
    constructor(executor) {
        this.state = 'pending';
        this.value = undefined;
        this.callbacks = [];

        const resolve = (value) => {
            if (this.state !== 'pending') return;
            this.state = 'fulfilled';
            this.value = value;
            this.callbacks.forEach(cb => cb.onFulfilled(value));
        };

        const reject = (reason) => {
            if (this.state !== 'pending') return;
            this.state = 'rejected';
            this.value = reason;
            this.callbacks.forEach(cb => cb.onRejected(reason));
        };

        try { executor(resolve, reject); }
        catch (e) { reject(e); }
    }

    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
        onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e; };

        return new MyPromise((resolve, reject) => {
            const handle = (fn, value) => {
                try {
                    const result = fn(value);
                    result instanceof MyPromise ? result.then(resolve, reject) : resolve(result);
                } catch (e) { reject(e); }
            };

            if (this.state === 'fulfilled') queueMicrotask(() => handle(onFulfilled, this.value));
            else if (this.state === 'rejected') queueMicrotask(() => handle(onRejected, this.value));
            else this.callbacks.push({
                onFulfilled: v => queueMicrotask(() => handle(onFulfilled, v)),
                onRejected: r => queueMicrotask(() => handle(onRejected, r))
            });
        });
    }
}
```

---
:::

::: details 24. 手写 new 操作符
```javascript
function myNew(Constructor, ...args) {
    // 1. 创建新对象，原型指向构造函数的 prototype
    const obj = Object.create(Constructor.prototype);
    // 2. 执行构造函数，绑定 this
    const result = Constructor.apply(obj, args);
    // 3. 如果构造函数返回对象则返回该对象，否则返回新对象
    return result instanceof Object ? result : obj;
}
```

---
:::

::: details 25. 手写 instanceof
```javascript
function myInstanceof(obj, Constructor) {
    if (typeof obj !== 'object' && typeof obj !== 'function') return false;
    let proto = Object.getPrototypeOf(obj);
    while (proto !== null) {
        if (proto === Constructor.prototype) return true;
        proto = Object.getPrototypeOf(proto);
    }
    return false;
}
```

---
:::

::: details 26. 手写数组扁平化
```javascript
// 递归
function flatten(arr, depth = Infinity) {
    return arr.reduce((acc, item) => {
        if (Array.isArray(item) && depth > 0) {
            acc.push(...flatten(item, depth - 1));
        } else {
            acc.push(item);
        }
        return acc;
    }, []);
}

// 原生
[1, [2, [3]]].flat(Infinity);
```

---
:::

::: details 27. 手写 Promise.all
```javascript
function promiseAll(promises) {
    return new Promise((resolve, reject) => {
        const results = [];
        let count = 0;
        if (promises.length === 0) return resolve([]);

        promises.forEach((p, i) => {
            Promise.resolve(p).then(val => {
                results[i] = val;
                if (++count === promises.length) resolve(results);
            }).catch(reject);
        });
    });
}
```

---
:::

## 综合题

::: details 28. 说说 JavaScript 的垃圾回收机制
**标记清除（主流）**：
1. 从根对象（window/global）出发，标记所有可达对象
2. 清除未被标记的对象（不可达 = 垃圾）

**引用计数（已淘汰）**：记录对象被引用次数，为 0 时回收。缺点：循环引用无法回收。

**内存泄漏常见原因：**
- 全局变量（意外创建）
- 未清除的定时器/事件监听
- 闭包持有大对象引用
- DOM 引用未清除

---
:::

::: details 29. 什么是执行上下文和调用栈？
**执行上下文**：代码执行时的环境，包含变量环境、词法环境、this 绑定。

**类型**：全局执行上下文、函数执行上下文、eval 执行上下文

**调用栈（Call Stack）**：管理执行上下文的栈结构，LIFO（后进先出）。函数调用时压栈，返回时出栈。栈溢出（Stack Overflow）发生在递归过深时。
:::
