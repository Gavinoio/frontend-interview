# 作用域与闭包

## 1. 什么是作用域?

### 官方答案
作用域(Scope)是指程序中定义变量的区域,它决定了变量的可访问性和生命周期。JavaScript 采用**词法作用域(Lexical Scope)**,也叫静态作用域,即作用域在代码编写时就已经确定。

作用域类型:
- **全局作用域**: 在代码任何地方都能访问
- **函数作用域**: 只在函数内部可访问
- **块级作用域**: ES6 引入,由 `{}` 包裹,let/const 声明的变量

### 通俗理解
作用域就像是**权限管理系统**:
- **全局作用域**像公司的公共区域,所有人都能进
- **函数作用域**像某个部门的办公室,只有部门内的人能进
- **块级作用域**像办公室内的小隔间,更加私密

变量就像是物品,放在不同的"房间"(作用域)里,决定了谁能访问它。

### 详细说明

#### 全局作用域
```javascript
// 全局变量
var globalVar = 'I am global';
let globalLet = 'I am also global';

function test() {
  console.log(globalVar);  // 可以访问
  console.log(globalLet);  // 可以访问
}

// 浏览器环境中,var 声明的全局变量会挂载到 window
console.log(window.globalVar);  // 'I am global'
console.log(window.globalLet);  // undefined - let 不会挂载到 window

// Node.js 环境中,全局对象是 global
```

#### 函数作用域
```javascript
function outer() {
  var functionScoped = 'I am in function';

  console.log(functionScoped);  // 可以访问

  function inner() {
    console.log(functionScoped);  // 可以访问外部函数的变量
  }

  inner();
}

outer();
console.log(functionScoped);  // ReferenceError - 外部无法访问

// var 没有块级作用域
if (true) {
  var a = 1;
}
console.log(a);  // 1 - 可以访问!

for (var i = 0; i < 3; i++) {
  // ...
}
console.log(i);  // 3 - 循环后 i 依然存在!
```

#### 块级作用域 (ES6)
```javascript
// let 和 const 有块级作用域
{
  let blockScoped = 'I am in block';
  const alsoBlock = 'Me too';

  console.log(blockScoped);  // 可以访问
}

console.log(blockScoped);  // ReferenceError - 块外无法访问

// if 语句块
if (true) {
  let b = 2;
}
console.log(b);  // ReferenceError

// for 循环块
for (let j = 0; j < 3; j++) {
  setTimeout(() => {
    console.log(j);  // 0, 1, 2 - 每次循环 j 都是新的变量
  }, 100);
}

// 对比 var
for (var k = 0; k < 3; k++) {
  setTimeout(() => {
    console.log(k);  // 3, 3, 3 - k 是同一个变量!
  }, 100);
}
```

#### 作用域链
```javascript
var a = 1;

function first() {
  var b = 2;

  function second() {
    var c = 3;

    function third() {
      var d = 4;

      // 作用域链: third -> second -> first -> global
      console.log(a, b, c, d);  // 1, 2, 3, 4 - 都能访问
    }

    third();
    console.log(d);  // ReferenceError - 无法访问内层变量
  }

  second();
}

first();

// 查找规则:
// 1. 先在当前作用域查找
// 2. 找不到就去父作用域查找
// 3. 一层层向上,直到全局作用域
// 4. 全局也没有,报 ReferenceError
```

### 词法作用域 vs 动态作用域

```javascript
// JavaScript 使用词法作用域（静态作用域）
// 作用域在函数定义时就确定了，而不是调用时

var value = 1;

function foo() {
  console.log(value);  // 词法作用域：看定义时的位置
}

function bar() {
  var value = 2;
  foo();  // 输出 1，不是 2
}

bar();

// 词法作用域：foo 定义时，外层是全局作用域，所以 value 是 1
// 如果是动态作用域（如 Bash）：foo 调用时在 bar 内，value 是 2

// 更复杂的例子
var x = 10;

function outer() {
  var x = 20;

  function inner() {
    console.log(x);  // 20 - 定义时外层的 x
  }

  return inner;
}

var fn = outer();
(function() {
  var x = 30;
  fn();  // 输出 20，不是 30
})();
```

### 变量提升与暂时性死区

```javascript
// var 的变量提升
console.log(a);  // undefined（不是 ReferenceError）
var a = 1;
console.log(a);  // 1

// 等价于
var a;  // 声明提升到顶部
console.log(a);  // undefined
a = 1;
console.log(a);  // 1

// let/const 的暂时性死区（TDZ）
console.log(b);  // ReferenceError: Cannot access 'b' before initialization
let b = 2;

// 函数声明也会提升
foo();  // 可以调用

function foo() {
  console.log('foo');
}

// 但函数表达式不会
bar();  // TypeError: bar is not a function

var bar = function() {
  console.log('bar');
};

// TDZ 的详细示例
let x = 'outer';

function example() {
  // TDZ 开始
  console.log(x);  // ReferenceError，不会访问外部的 x
  // TDZ 结束
  let x = 'inner';
}

// typeof 也不安全
console.log(typeof undeclaredVar);  // 'undefined' - 未声明的变量
console.log(typeof tdzVar);  // ReferenceError - TDZ 中的变量
let tdzVar;
```

### 执行上下文与作用域

```javascript
/*
执行上下文（Execution Context）和作用域是相关但不同的概念：

1. 作用域（Scope）
   - 静态的，代码编写时就确定
   - 定义变量的可访问范围
   - 由代码结构决定

2. 执行上下文（Execution Context）
   - 动态的，代码执行时创建
   - 包含：变量环境、词法环境、this 绑定
   - 形成执行上下文栈（调用栈）

3. 词法环境（Lexical Environment）
   - 存储变量和函数声明
   - 包含外部环境引用（实现作用域链）
*/

// 执行上下文栈的演示
function first() {
  console.log('first 开始');
  second();
  console.log('first 结束');
}

function second() {
  console.log('second 开始');
  third();
  console.log('second 结束');
}

function third() {
  console.log('third');
}

first();
/*
执行上下文栈变化：
1. [Global]
2. [Global, first]
3. [Global, first, second]
4. [Global, first, second, third]
5. [Global, first, second]
6. [Global, first]
7. [Global]

输出：
first 开始
second 开始
third
second 结束
first 结束
*/
```

---

## 2. 什么是闭包?

### 官方答案
闭包(Closure)是指有权访问另一个函数作用域中变量的函数。即使外部函数已经返回,闭包仍然可以访问外部函数的变量。

**形成条件**:
1. 函数嵌套
2. 内部函数引用了外部函数的变量
3. 内部函数被返回或以某种方式被外部引用

### 通俗理解
闭包就像是一个**背包**:

当内部函数被创建时,它会把需要用到的外部变量"装进背包"带走。即使外部函数已经执行完毕,"背包"里的东西依然保留着,内部函数随时可以拿出来用。

```javascript
function 外部函数() {
  let 食物 = '三明治';

  function 内部函数() {
    console.log(食物);  // 把食物装进了"背包"
  }

  return 内部函数;
}

const 我的背包 = 外部函数();
我的背包();  // '三明治' - 虽然外部函数已经执行完了,但食物还在!
```

### 详细说明

#### 基础闭包示例
```javascript
function createCounter() {
  let count = 0;  // 私有变量

  return function() {
    count++;
    return count;
  };
}

const counter = createCounter();
console.log(counter());  // 1
console.log(counter());  // 2
console.log(counter());  // 3

// count 变量被"封闭"在闭包中,外部无法直接访问
console.log(count);  // ReferenceError

// 创建新的计数器,有独立的 count
const counter2 = createCounter();
console.log(counter2());  // 1 - 全新的开始
```

#### 闭包的实际应用

**1. 数据私有化 / 模块化**
```javascript
const BankAccount = (function() {
  // 私有变量,外部无法访问
  let balance = 0;

  // 公开的接口
  return {
    deposit(amount) {
      if (amount > 0) {
        balance += amount;
        return `存入 ${amount} 元,余额 ${balance} 元`;
      }
    },

    withdraw(amount) {
      if (amount > 0 && amount <= balance) {
        balance -= amount;
        return `取出 ${amount} 元,余额 ${balance} 元`;
      }
      return '余额不足';
    },

    getBalance() {
      return balance;
    }
  };
})();

console.log(BankAccount.deposit(100));   // '存入 100 元,余额 100 元'
console.log(BankAccount.withdraw(30));   // '取出 30 元,余额 70 元'
console.log(BankAccount.getBalance());   // 70
console.log(BankAccount.balance);        // undefined - 无法直接访问
```

**2. 函数柯里化**
```javascript
// 普通函数
function add(a, b, c) {
  return a + b + c;
}
console.log(add(1, 2, 3));  // 6

// 柯里化版本 - 使用闭包
function curry(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

const add1 = curry(1);
const add1And2 = add1(2);
console.log(add1And2(3));  // 6

// 或者链式调用
console.log(curry(1)(2)(3));  // 6

// 通用柯里化函数
function curryify(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...nextArgs) {
        return curried.apply(this, args.concat(nextArgs));
      };
    }
  };
}

const sum = (a, b, c) => a + b + c;
const curriedSum = curryify(sum);

console.log(curriedSum(1)(2)(3));      // 6
console.log(curriedSum(1, 2)(3));      // 6
console.log(curriedSum(1)(2, 3));      // 6
```

**3. 防抖和节流**
```javascript
// 防抖(debounce): 一定时间内只执行最后一次
function debounce(func, wait) {
  let timeout;  // 闭包保存 timer

  return function(...args) {
    const context = this;

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// 使用场景:搜索框输入
const searchInput = document.querySelector('#search');
const search = debounce(function(e) {
  console.log('搜索:', e.target.value);
}, 500);

searchInput.addEventListener('input', search);

// 节流(throttle): 一定时间内只执行一次
function throttle(func, wait) {
  let timeout;
  let previous = 0;

  return function(...args) {
    const context = this;
    const now = Date.now();

    if (now - previous > wait) {
      func.apply(context, args);
      previous = now;
    }
  };
}

// 使用场景:滚动事件
window.addEventListener('scroll', throttle(function() {
  console.log('滚动位置:', window.scrollY);
}, 200));
```

**4. 事件监听器**
```javascript
function createButton(label) {
  let clickCount = 0;  // 每个按钮独立的计数

  const button = document.createElement('button');
  button.textContent = label;

  button.addEventListener('click', function() {
    clickCount++;
    console.log(`${label} 被点击了 ${clickCount} 次`);
  });

  return button;
}

const btn1 = createButton('按钮1');
const btn2 = createButton('按钮2');

document.body.append(btn1, btn2);
// 每个按钮有独立的 clickCount 闭包变量
```

**5. 循环中的闭包问题**
```javascript
// ❌ 经典错误
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);  // 3, 3, 3 - 都是 3!
  }, 100);
}
// 原因: 所有回调共享同一个 i,循环结束时 i = 3

// ✅ 解决方案1: 使用 let
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);  // 0, 1, 2 - 每次循环 i 是新的
  }, 100);
}

// ✅ 解决方案2: IIFE 创建闭包
for (var i = 0; i < 3; i++) {
  (function(j) {  // 立即执行函数
    setTimeout(function() {
      console.log(j);  // 0, 1, 2
    }, 100);
  })(i);
}

// ✅ 解决方案3: setTimeout 的第三个参数
for (var i = 0; i < 3; i++) {
  setTimeout(function(j) {
    console.log(j);  // 0, 1, 2
  }, 100, i);
}
```

---

## 3. 闭包的优缺点

### 优点
1. **数据私有化**: 创建私有变量,外部无法直接访问
2. **保持变量**: 变量不会被垃圾回收,可以长期保持
3. **模块化**: 可以创建独立的模块,避免全局污染
4. **函数工厂**: 可以创建具有特定行为的函数

### 缺点
1. **内存泄漏**: 闭包会使变量一直保存在内存中,不当使用可能导致内存泄漏
2. **性能问题**: 过度使用闭包会增加内存开销
3. **调试困难**: 闭包中的变量在外部不可见,增加调试难度

### 内存管理示例
```javascript
// ❌ 内存泄漏风险
function createLargeArray() {
  const largeArray = new Array(1000000).fill('data');  // 占用大量内存

  return function() {
    console.log(largeArray.length);  // 闭包引用了大数组
  };
}

const fn = createLargeArray();
// largeArray 一直保存在内存中,即使只用到了它的 length

// ✅ 改进: 只保留需要的数据
function createLength() {
  const largeArray = new Array(1000000).fill('data');
  const length = largeArray.length;  // 只保存长度

  return function() {
    console.log(length);  // 只引用 length,数组可以被回收
  };
}

const fn2 = createLength();

// ✅ 手动释放闭包
let counter = (function() {
  let count = 0;
  return {
    increment: () => ++count,
    destroy: function() {
      count = null;  // 释放引用
    }
  };
})();

// 使用完后
counter.destroy();
counter = null;  // 彻底释放
```

---

## 4. 经典面试题

::: details 题目1: 连续调用
```javascript
// 实现一个函数,可以这样调用: add(1)(2)(3)
function add(a) {
  // 你的代码
}

console.log(add(1)(2)(3));  // 6
console.log(add(1)(2)(3)(4));  // 10
```

<details>
<summary>点击查看答案</summary>

```javascript
function add(a) {
  function sum(b) {
    a = a + b;  // 累加
    return sum;  // 返回自身,支持继续调用
  }

  // 重写 toString,在需要转换为原始值时调用
  sum.toString = function() {
    return a;
  };

  return sum;
}

console.log(add(1)(2)(3).toString());  // '6'
console.log(+add(1)(2)(3));  // 6 - 一元加号触发 valueOf/toString

// 或者使用 valueOf
function add2(a) {
  function sum(b) {
    a = a + b;
    return sum;
  }

  sum.valueOf = function() {
    return a;
  };

  return sum;
}
```

**考察点**: 闭包、函数式编程、类型转换
:::

</details>

::: details 题目2: 创建10个按钮
```javascript
// 创建10个按钮,点击时分别弹出 0-9
for (var i = 0; i < 10; i++) {
  const btn = document.createElement('button');
  btn.textContent = i;

  btn.onclick = function() {
    alert(i);  // ❌ 都会弹出 10
  };

  document.body.appendChild(btn);
}

// 如何修复?
```

<details>
<summary>点击查看答案</summary>

**方案1: 使用 let**
```javascript
for (let i = 0; i < 10; i++) {  // var 改为 let
  const btn = document.createElement('button');
  btn.textContent = i;
  btn.onclick = function() {
    alert(i);
  };
  document.body.appendChild(btn);
}
```

**方案2: IIFE**
```javascript
for (var i = 0; i < 10; i++) {
  (function(num) {
    const btn = document.createElement('button');
    btn.textContent = num;
    btn.onclick = function() {
      alert(num);
    };
    document.body.appendChild(btn);
  })(i);
}
```

**方案3: 使用 dataset**
```javascript
for (var i = 0; i < 10; i++) {
  const btn = document.createElement('button');
  btn.textContent = i;
  btn.dataset.index = i;  // 存储到 DOM 属性
  btn.onclick = function() {
    alert(this.dataset.index);
  };
  document.body.appendChild(btn);
}
```

**方案4: bind**
```javascript
for (var i = 0; i < 10; i++) {
  const btn = document.createElement('button');
  btn.textContent = i;
  btn.onclick = (function(num) {
    return function() {
      alert(num);
    };
  })(i);
  document.body.appendChild(btn);
}
```
:::

</details>

::: details 题目3: 输出结果
```javascript
function test() {
  var a = 1;

  return function() {
    console.log(a++);
  };
}

var fn = test();
fn();  // ?
fn();  // ?
var fn2 = test();
fn2();  // ?
```

<details>
<summary>点击查看答案</summary>

**答案**:
```
1
2
1
```

**解析**:
- `fn` 和 `fn2` 是两个独立的闭包
- 每个闭包都有自己独立的 `a` 变量
- `fn()` 第一次输出 1,然后 a 变成 2
- `fn()` 第二次输出 2,然后 a 变成 3
- `fn2()` 是新的闭包,a 从 1 开始
:::

---

</details>

## 5. 常见面试题

::: details 问题1: 闭包是什么？有什么用？
#### 一句话答案
闭包是函数和其词法作用域的组合，可以让函数访问其定义时所在作用域的变量，主要用于数据私有化、函数柯里化、防抖节流等场景。

#### 详细解答

**闭包的定义**：
- 闭包是指一个函数能够访问其外部函数作用域中的变量，即使外部函数已经执行完毕
- 从技术角度讲，闭包 = 函数 + 函数能够访问的自由变量

**形成闭包的条件**：
1. 函数嵌套（内部函数和外部函数）
2. 内部函数引用了外部函数的变量
3. 内部函数被外部引用或返回

**闭包的作用**：
1. **数据私有化/封装**：创建私有变量，防止全局污染
   ```javascript
   function createPerson(name) {
     let age = 0;  // 私有变量
     return {
       getName: () => name,
       getAge: () => age,
       growUp: () => ++age
     };
   }
   ```

2. **保持变量状态**：让变量持久保存在内存中
   ```javascript
   function createCounter() {
     let count = 0;
     return () => ++count;
   }
   ```

3. **函数柯里化**：将多参数函数转换为单参数函数序列
   ```javascript
   function curry(a) {
     return function(b) {
       return a + b;
     };
   }
   ```

4. **防抖节流**：通过闭包保存timer和状态
   ```javascript
   function debounce(fn, delay) {
     let timer;
     return function(...args) {
       clearTimeout(timer);
       timer = setTimeout(() => fn(...args), delay);
     };
   }
   ```

5. **模块化开发**：创建独立的模块，避免变量冲突
   ```javascript
   const module = (function() {
     let private = 'private';
     return {
       getPrivate: () => private
     };
   })();
   ```

#### 面试回答模板

> 闭包简单说就是函数能访问它定义时所在作用域的变量，即使这个函数在其他地方执行也能访问。形成闭包需要两个条件：一是函数嵌套，二是内部函数引用外部函数的变量。
>
> 闭包的作用主要有这么几个：一是做数据私有化，比如创建一个计数器，外部不能直接修改count变量，只能通过提供的方法去操作；二是保持变量状态，像防抖节流里就用闭包保存timer；三是函数柯里化，把多参数函数变成单参数的；还有就是模块化开发，避免全局污染。
>
> 需要注意的是闭包会让变量一直在内存中，用不好可能造成内存泄漏。比如在循环里创建闭包，或者闭包引用了大对象但只用了其中一小部分，这些都要小心处理。

---
:::

::: details 问题2: 闭包会造成内存泄漏吗？
#### 一句话答案
闭包本身不会造成内存泄漏，但不当使用闭包（如过度使用、引用大对象、忘记清理）会导致内存无法被回收，从而造成内存泄漏。

#### 详细解答

**内存泄漏的定义**：
内存泄漏是指程序中已分配的内存无法被回收，导致可用内存不断减少。

**闭包与内存的关系**：
1. **闭包的内存特性**：
   - 闭包会保持对外部变量的引用
   - 只要闭包存在，被引用的变量就不会被垃圾回收
   - 这是闭包的特性，不是bug

2. **正常使用不会泄漏**：
   ```javascript
   function createCounter() {
     let count = 0;
     return () => ++count;
   }

   let counter = createCounter();
   // count 被保持在内存中，这是预期行为，不是泄漏

   counter = null;  // 解除引用后，count 可以被回收
   ```

3. **可能导致内存泄漏的场景**：

   **场景1：闭包引用了大对象，但只用其中一小部分**
   ```javascript
   // ❌ 内存浪费
   function getData() {
     const largeData = new Array(1000000).fill('data');
     return function() {
       return largeData.length;  // 只用length，但整个数组都保留了
     };
   }

   // ✅ 优化：只保留需要的
   function getData() {
     const largeData = new Array(1000000).fill('data');
     const length = largeData.length;
     return function() {
       return length;  // 数组可以被回收
     };
   }
   ```

   **场景2：循环中创建大量闭包**
   ```javascript
   // ❌ 可能的问题
   for (let i = 0; i < 10000; i++) {
     const element = document.getElementById(`item-${i}`);
     const largeData = fetchData(i);  // 假设返回大量数据

     element.addEventListener('click', function() {
       console.log(largeData);  // 每个闭包都保存了 largeData
     });
   }

   // ✅ 优化：只保存必要信息
   for (let i = 0; i < 10000; i++) {
     const element = document.getElementById(`item-${i}`);
     const id = i;  // 只保存ID

     element.addEventListener('click', function() {
       const data = fetchData(id);  // 需要时再获取
       console.log(data);
     });
   }
   ```

   **场景3：DOM 引用 + 闭包导致的循环引用**
   ```javascript
   // ❌ 循环引用
   function bindEvent() {
     const element = document.getElementById('btn');
     const data = { /* 大量数据 */ };

     element.onclick = function() {
       console.log(data);  // 闭包引用 data
       // element 也被引用，即使从 DOM 移除也无法回收
     };
   }

   // ✅ 手动清理
   function bindEvent() {
     const element = document.getElementById('btn');
     const data = { /* 大量数据 */ };

     element.onclick = function() {
       console.log(data);
     };

     // 清理函数
     return function cleanup() {
       element.onclick = null;
       // 此时闭包和 DOM 都能被回收
     };
   }

   const cleanup = bindEvent();
   // 不需要时调用
   cleanup();
   ```

   **场景4：定时器未清理**
   ```javascript
   // ❌ 定时器持续引用
   function startTimer() {
     const data = new Array(1000000);

     setInterval(function() {
       console.log(data.length);
     }, 1000);
     // data 永远不会被释放
   }

   // ✅ 保存定时器ID，提供清理方法
   function startTimer() {
     const data = new Array(1000000);

     const timerId = setInterval(function() {
       console.log(data.length);
     }, 1000);

     return function stop() {
       clearInterval(timerId);
       // 清除后 data 可以被回收
     };
   }
   ```

**如何避免内存泄漏**：
1. 及时清理不需要的闭包引用
2. 避免在闭包中引用大对象的全部内容
3. 使用完后将闭包赋值为 null
4. 清理定时器、事件监听器等
5. 使用 WeakMap、WeakSet 存储对象引用

#### 面试回答模板

> 闭包本身不会造成内存泄漏，但确实需要注意内存管理。闭包的特点是会保持对外部变量的引用，只要闭包还在，这些变量就不会被垃圾回收，这是它的正常特性。
>
> 但在一些场景下可能会有问题。比如闭包引用了一个很大的对象，但实际只用了其中一小部分，这时候整个对象都会被保留在内存里，就造成浪费了。还有就是在循环里创建大量闭包，每个都保存了大量数据。或者DOM元素被移除了，但事件监听器里的闭包还引用着它，导致无法回收。
>
> 避免这些问题的话，一是只在闭包里保留真正需要的数据；二是用完后及时清理，比如把闭包赋值为null，或者清除定时器和事件监听；三是可以用WeakMap这种弱引用的数据结构。总之就是要有意识地管理闭包的生命周期。

---
:::

::: details 问题3: 闭包的应用场景有哪些？
#### 一句话答案
闭包的应用场景主要包括：数据私有化/模块化、防抖节流、函数柯里化、单例模式、缓存优化、偏函数等。

#### 详细解答

**1. 数据私有化和模块化**

最经典的应用，创建私有变量，只暴露公共接口：

```javascript
// 单例模式
const UserManager = (function() {
  let instance;
  let users = [];  // 私有数据

  function init() {
    return {
      addUser(user) {
        users.push(user);
      },
      getUsers() {
        return [...users];  // 返回副本，保护原数据
      },
      getUserCount() {
        return users.length;
      }
    };
  }

  return {
    getInstance() {
      if (!instance) {
        instance = init();
      }
      return instance;
    }
  };
})();

const manager = UserManager.getInstance();
manager.addUser({ name: 'Alice' });
```

**2. 防抖和节流**

通过闭包保存定时器ID和上次执行时间：

```javascript
// 防抖：最后一次触发后才执行
function debounce(fn, delay) {
  let timer = null;

  return function(...args) {
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 节流：固定时间间隔执行
function throttle(fn, delay) {
  let lastTime = 0;

  return function(...args) {
    const now = Date.now();

    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

// 实际应用
const searchInput = document.querySelector('#search');
searchInput.addEventListener('input', debounce(function(e) {
  console.log('搜索:', e.target.value);
}, 300));

window.addEventListener('scroll', throttle(function() {
  console.log('滚动位置:', window.scrollY);
}, 200));
```

**3. 函数柯里化**

将多参数函数转换为一系列单参数函数：

```javascript
// 手动柯里化
function curry(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

curry(1)(2)(3);  // 6

// 通用柯里化函数
function currying(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...nextArgs) {
        return curried.apply(this, [...args, ...nextArgs]);
      };
    }
  };
}

// 使用示例
function sum(a, b, c) {
  return a + b + c;
}

const curriedSum = currying(sum);
curriedSum(1)(2)(3);     // 6
curriedSum(1, 2)(3);     // 6
curriedSum(1)(2, 3);     // 6
```

**4. 缓存/记忆化**

利用闭包缓存计算结果，避免重复计算：

```javascript
function memoize(fn) {
  const cache = {};

  return function(...args) {
    const key = JSON.stringify(args);

    if (key in cache) {
      console.log('从缓存获取');
      return cache[key];
    }

    console.log('计算结果');
    const result = fn.apply(this, args);
    cache[key] = result;
    return result;
  };
}

// 计算斐波那契数列
const fibonacci = memoize(function(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

fibonacci(10);  // 计算
fibonacci(10);  // 从缓存获取
```

**5. 偏函数**

固定函数的部分参数：

```javascript
function partial(fn, ...fixedArgs) {
  return function(...remainingArgs) {
    return fn.apply(this, [...fixedArgs, ...remainingArgs]);
  };
}

// 使用示例
function multiply(a, b, c) {
  return a * b * c;
}

const double = partial(multiply, 2);  // 固定第一个参数为 2
console.log(double(3, 4));  // 2 * 3 * 4 = 24

const tripleOfTen = partial(multiply, 3, 10);  // 固定前两个参数
console.log(tripleOfTen(5));  // 3 * 10 * 5 = 150
```

**6. 延迟执行/惰性函数**

```javascript
// 延迟执行
function lazy(fn) {
  let result;
  let executed = false;

  return function(...args) {
    if (!executed) {
      result = fn.apply(this, args);
      executed = true;
    }
    return result;
  };
}

const expensiveOperation = lazy(function() {
  console.log('执行复杂计算...');
  return 42;
});

expensiveOperation();  // 执行复杂计算...
expensiveOperation();  // 直接返回结果，不再执行
```

**7. 事件处理器工厂**

```javascript
function createButtonHandler(buttonId, config) {
  let clickCount = 0;
  const maxClicks = config.maxClicks || Infinity;

  return function(event) {
    if (clickCount < maxClicks) {
      clickCount++;
      console.log(`${buttonId} 被点击第 ${clickCount} 次`);

      if (config.onClick) {
        config.onClick(event, clickCount);
      }

      if (clickCount >= maxClicks) {
        console.log(`${buttonId} 已达到最大点击次数`);
        this.disabled = true;
      }
    }
  };
}

// 使用
const btn = document.querySelector('#submit');
btn.addEventListener('click', createButtonHandler('提交按钮', {
  maxClicks: 1,
  onClick: (e, count) => {
    console.log('处理提交...');
  }
}));
```

**8. 迭代器和生成器**

```javascript
function createIterator(array) {
  let index = 0;

  return {
    next() {
      if (index < array.length) {
        return { value: array[index++], done: false };
      }
      return { done: true };
    },
    reset() {
      index = 0;
    }
  };
}

const iterator = createIterator([1, 2, 3]);
console.log(iterator.next());  // { value: 1, done: false }
console.log(iterator.next());  // { value: 2, done: false }
iterator.reset();
console.log(iterator.next());  // { value: 1, done: false }
```

#### 面试回答模板

> 闭包的应用场景其实挺多的，我平时开发中经常用到。
>
> 最常见的就是数据私有化，比如做一个用户管理模块，不想让外部直接访问用户数组，就用闭包把数据保护起来，只暴露addUser、getUsers这些方法。还有单例模式也是这样实现的。
>
> 然后就是防抖节流，这个在处理输入框搜索、滚动事件时特别有用。通过闭包保存timer或者上次执行时间，来控制函数执行频率。
>
> 函数柯里化也会用到，就是把多参数函数变成单参数的，方便函数复用。比如有个三个参数的add函数，柯里化后可以先固定一个参数，返回新函数继续接收剩余参数。
>
> 还有缓存优化，像计算斐波那契数列这种递归函数，用闭包把计算结果缓存起来，避免重复计算，性能提升很明显。
>
> 实际项目里还会用闭包做偏函数、延迟执行、事件处理器工厂这些。总之闭包的核心价值就是能保持状态和实现数据封装，很多设计模式都离不开它。

---
:::

## 总结

::: details 核心要点
1. **作用域**: 变量的可访问范围,JS 使用词法作用域
2. **作用域链**: 从内到外逐层查找变量
3. **闭包**: 函数 + 其词法环境的组合
4. **闭包应用**: 数据私有、柯里化、防抖节流、模块化
5. **注意内存**: 避免不必要的闭包,及时释放引用
:::

::: details 面试加分项
- 能用代码演示闭包的实际应用
- 了解闭包的内存模型
- 知道如何避免内存泄漏
- 理解 V8 中的上下文和作用域链
- 能手写防抖、节流、柯里化等工具函数

---
:::

## 6. 高级面试题

::: details 题目4：分析代码输出
```javascript
var a = 10;

function foo() {
  console.log(a);
}

(function() {
  var a = 20;
  foo();  // ?
})();
```

<details>
<summary>点击查看答案</summary>

**答案**: 10

**解析**:
JavaScript 使用词法作用域（静态作用域）。`foo` 函数定义在全局作用域，所以它访问的 `a` 是全局的 `a`（值为 10），而不是 IIFE 内部的 `a`（值为 20）。

作用域在函数**定义时**确定，而不是**调用时**确定。
:::

</details>

::: details 题目5：实现私有变量
```javascript
// 使用闭包实现一个类，具有私有变量 name 和 age
// 提供 getName、getAge、setAge 方法
// age 只能设置为 0-150 之间的整数
```

<details>
<summary>点击查看答案</summary>

```javascript
function Person(name, age) {
  // 私有变量
  let _name = name;
  let _age = validateAge(age) ? age : 0;

  function validateAge(val) {
    return Number.isInteger(val) && val >= 0 && val <= 150;
  }

  // 公开方法
  this.getName = function() {
    return _name;
  };

  this.getAge = function() {
    return _age;
  };

  this.setAge = function(newAge) {
    if (validateAge(newAge)) {
      _age = newAge;
      return true;
    }
    return false;
  };
}

// 测试
const person = new Person('Alice', 25);
console.log(person.getName());  // 'Alice'
console.log(person.getAge());   // 25
console.log(person._name);      // undefined（无法直接访问）
console.log(person._age);       // undefined

person.setAge(30);
console.log(person.getAge());   // 30

person.setAge(-1);
console.log(person.getAge());   // 30（无效设置被拒绝）

// ES6 WeakMap 实现私有变量
const privateData = new WeakMap();

class PersonES6 {
  constructor(name, age) {
    privateData.set(this, { name, age });
  }

  getName() {
    return privateData.get(this).name;
  }

  getAge() {
    return privateData.get(this).age;
  }
}
```
:::

</details>

::: details 题目6：实现 once 函数
```javascript
// 实现一个 once 函数，让传入的函数只执行一次
function once(fn) {
  // 你的代码
}

const logOnce = once(console.log);
logOnce('a');  // 'a'
logOnce('b');  // 无输出
logOnce('c');  // 无输出
```

<details>
<summary>点击查看答案</summary>

```javascript
// 基础版本
function once(fn) {
  let called = false;
  let result;

  return function(...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

// 增强版本：支持重置
function onceWithReset(fn) {
  let called = false;
  let result;

  const onceFn = function(...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };

  onceFn.reset = function() {
    called = false;
    result = undefined;
  };

  return onceFn;
}

// 测试
const init = once(function() {
  console.log('初始化');
  return { initialized: true };
});

console.log(init());  // '初始化' { initialized: true }
console.log(init());  // { initialized: true }（不再执行，但返回之前的结果）
```
:::

</details>

::: details 题目7：实现函数组合 compose
```javascript
// 实现 compose 函数，从右到左执行函数
// compose(f, g, h)(x) === f(g(h(x)))
```

<details>
<summary>点击查看答案</summary>

```javascript
// 方式1：reduce
function compose(...fns) {
  if (fns.length === 0) return arg => arg;
  if (fns.length === 1) return fns[0];

  return fns.reduce((a, b) => (...args) => a(b(...args)));
}

// 方式2：reduceRight
function compose2(...fns) {
  return function(initialValue) {
    return fns.reduceRight((acc, fn) => fn(acc), initialValue);
  };
}

// 方式3：递归
function compose3(...fns) {
  return function(value) {
    if (fns.length === 0) return value;
    const last = fns.pop();
    return compose3(...fns)(last(value));
  };
}

// 测试
const add10 = x => x + 10;
const multiply2 = x => x * 2;
const subtract5 = x => x - 5;

const composed = compose(add10, multiply2, subtract5);
console.log(composed(10));  // ((10 - 5) * 2) + 10 = 20

// pipe：从左到右执行（compose 的反向）
function pipe(...fns) {
  return fns.reduce((a, b) => (...args) => b(a(...args)));
}

const piped = pipe(subtract5, multiply2, add10);
console.log(piped(10));  // 20
```
:::

</details>

::: details 题目8：分析复杂闭包
```javascript
function createFunctions() {
  var result = [];

  for (var i = 0; i < 3; i++) {
    result[i] = function(num) {
      return function() {
        return num;
      };
    }(i);
  }

  return result;
}

var funcs = createFunctions();
console.log(funcs[0]());  // ?
console.log(funcs[1]());  // ?
console.log(funcs[2]());  // ?
```

<details>
<summary>点击查看答案</summary>

**答案**:
```
0
1
2
```

**解析**:
这里使用了 IIFE（立即调用函数表达式）来创建闭包。每次循环时，`i` 的值作为参数 `num` 传入外层函数并立即执行，返回的内部函数保存了那个时刻的 `num` 值。

关键点：
- `function(num) { return function() { return num; }; }(i)`
- 外层函数立即执行，`i` 的值被保存到 `num` 参数中
- 返回的内部函数形成闭包，保存了 `num` 的值

如果没有 IIFE：
```javascript
for (var i = 0; i < 3; i++) {
  result[i] = function() {
    return i;  // 共享同一个 i
  };
}
// 全部输出 3
```
:::

</details>

::: details 题目9：实现 bind 函数
```javascript
// 手写实现 Function.prototype.bind
```

<details>
<summary>点击查看答案</summary>

```javascript
Function.prototype.myBind = function(context, ...args) {
  if (typeof this !== 'function') {
    throw new TypeError('Bind must be called on a function');
  }

  const self = this;

  const fBound = function(...innerArgs) {
    // 处理 new 调用的情况
    // 如果是 new 调用，this 指向新创建的对象
    return self.apply(
      this instanceof fBound ? this : context,
      [...args, ...innerArgs]
    );
  };

  // 维护原型链
  if (this.prototype) {
    fBound.prototype = Object.create(this.prototype);
  }

  return fBound;
};

// 测试
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

const person = { name: 'Alice' };
const boundGreet = greet.myBind(person, 'Hello');

console.log(boundGreet('!'));  // 'Hello, Alice!'

// 测试 new 调用
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  return `${this.name} makes a sound`;
};

const BoundAnimal = Animal.myBind(null, 'Dog');
const dog = new BoundAnimal();
console.log(dog.name);        // 'Dog'
console.log(dog.speak());     // 'Dog makes a sound'
console.log(dog instanceof Animal);  // true
```
:::

</details>

::: details 题目10：实现 sleep 函数
```javascript
// 实现一个 sleep 函数，使得 await sleep(1000) 后暂停 1 秒
```

<details>
<summary>点击查看答案</summary>

```javascript
// 基础版本
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 使用
async function demo() {
  console.log('开始');
  await sleep(1000);
  console.log('1秒后');
}

// 带返回值的版本
function sleepWithValue(ms, value) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

async function demo2() {
  const result = await sleepWithValue(1000, 'done');
  console.log(result);  // 'done'
}

// 可取消的版本
function cancellableSleep(ms) {
  let timeoutId;
  let rejectFn;

  const promise = new Promise((resolve, reject) => {
    rejectFn = reject;
    timeoutId = setTimeout(resolve, ms);
  });

  promise.cancel = function() {
    clearTimeout(timeoutId);
    rejectFn(new Error('Sleep cancelled'));
  };

  return promise;
}

async function demo3() {
  const sleepPromise = cancellableSleep(5000);

  setTimeout(() => {
    sleepPromise.cancel();
  }, 1000);

  try {
    await sleepPromise;
    console.log('完成');
  } catch (e) {
    console.log(e.message);  // 'Sleep cancelled'
  }
}
```
:::

---

</details>

## 7. V8 引擎中的闭包

::: details 闭包的内存模型
```javascript
/*
V8 引擎如何处理闭包：

1. 作用域分析（Scope Analysis）
   - 编译阶段分析哪些变量被内部函数引用
   - 被引用的变量会被标记为"上下文变量"

2. 上下文对象（Context Object）
   - 闭包变量存储在堆上的 Context 对象中
   - 不是存储在栈上（栈上的会被销毁）

3. 内存布局
   - 普通局部变量：栈上分配
   - 闭包变量：堆上的 Context 对象

4. 垃圾回收
   - 当闭包函数不再被引用时
   - Context 对象才能被垃圾回收
*/

function createClosure() {
  let a = 1;        // 被内部函数引用 → 堆上的 Context
  let b = [1,2,3];  // 被内部函数引用 → 堆上的 Context
  let c = 'temp';   // 未被引用 → 栈上，函数返回后销毁

  return function() {
    console.log(a, b);  // a 和 b 被引用
  };
}

const closure = createClosure();
// c 已被销毁
// a 和 b 保存在 Context 对象中
```
:::

::: details Chrome DevTools 查看闭包
```javascript
function outer() {
  const name = 'closure variable';

  return function inner() {
    console.log(name);
  };
}

const fn = outer();

// 在 Chrome DevTools 中：
// 1. 打断点在 inner 函数内
// 2. 查看 Scope 面板
// 3. 可以看到 Closure 作用域
// 4. 里面包含 name 变量

// 或者直接打印函数
console.dir(fn);
// [[Scopes]] 属性中可以看到闭包信息
```
:::

::: details 闭包优化建议
```javascript
// 1. 避免在闭包中引用不需要的大对象
// ❌ 不好
function createHandler() {
  const largeData = new Array(1000000).fill('x');

  return function handler() {
    // 只用了 length，但整个数组都被保留
    return largeData.length;
  };
}

// ✅ 好
function createHandler() {
  const largeData = new Array(1000000).fill('x');
  const length = largeData.length;  // 只保存需要的

  return function handler() {
    return length;
  };
}

// 2. 及时解除闭包引用
let cached = (function() {
  const data = computeExpensiveData();
  return {
    getData: () => data,
    clear: function() {
      // 提供清理方法
    }
  };
})();

// 不再需要时
cached = null;

// 3. 考虑使用 WeakMap 存储私有数据
const privateStore = new WeakMap();

class MyClass {
  constructor(secret) {
    privateStore.set(this, { secret });
  }

  getSecret() {
    return privateStore.get(this).secret;
  }
}

// 实例被回收时，privateStore 中对应的数据也会被回收

// 4. 使用 WeakRef 和 FinalizationRegistry（ES2021）
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`${heldValue} 被垃圾回收了`);
});

function createCached(key, data) {
  const obj = { data };
  registry.register(obj, key);
  return new WeakRef(obj);
}

const weakRef = createCached('myData', { value: 42 });

// 稍后检查对象是否还存在
const obj = weakRef.deref();
if (obj) {
  console.log(obj.data);
} else {
  console.log('对象已被回收');
}
```

---
:::

## 8. 实战应用

::: details React 中的闭包陷阱
```javascript
// React Hooks 中常见的闭包问题

function Counter() {
  const [count, setCount] = useState(0);

  // ❌ 闭包陷阱：count 是旧值
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('当前 count:', count);  // 始终是 0
      setCount(count + 1);  // 始终设置为 1
    }, 1000);

    return () => clearInterval(timer);
  }, []);  // 空依赖数组，只在挂载时执行

  // ✅ 解决方案1：使用函数式更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prevCount => prevCount + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ✅ 解决方案2：使用 ref
  const countRef = useRef(count);
  countRef.current = count;

  useEffect(() => {
    const timer = setInterval(() => {
      console.log('当前 count:', countRef.current);  // 正确的值
      setCount(countRef.current + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ✅ 解决方案3：正确设置依赖
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [count]);  // count 变化时重新创建定时器

  return <div>{count}</div>;
}
```
:::

::: details 事件处理器的闭包
```javascript
// ❌ 内存泄漏风险
function setupListeners() {
  const heavyData = loadHeavyData();

  document.getElementById('btn').addEventListener('click', function() {
    // heavyData 被闭包捕获，永远不会释放
    console.log(heavyData.length);
  });
}

// ✅ 提供清理机制
function setupListeners() {
  const heavyData = loadHeavyData();

  const handler = function() {
    console.log(heavyData.length);
  };

  document.getElementById('btn').addEventListener('click', handler);

  // 返回清理函数
  return function cleanup() {
    document.getElementById('btn').removeEventListener('click', handler);
  };
}

const cleanup = setupListeners();
// 不需要时
cleanup();

// ✅ 使用 AbortController（现代方式）
function setupListeners() {
  const controller = new AbortController();
  const heavyData = loadHeavyData();

  document.getElementById('btn').addEventListener('click', function() {
    console.log(heavyData.length);
  }, { signal: controller.signal });

  return () => controller.abort();
}
```
:::

::: details 请求缓存
```javascript
// 使用闭包实现请求缓存
function createRequestCache() {
  const cache = new Map();
  const pending = new Map();

  return async function cachedRequest(url, options = {}) {
    const cacheKey = `${url}_${JSON.stringify(options)}`;

    // 检查缓存
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < (options.maxAge || 60000)) {
        return cached.data;
      }
      cache.delete(cacheKey);
    }

    // 检查是否有正在进行的相同请求
    if (pending.has(cacheKey)) {
      return pending.get(cacheKey);
    }

    // 发起请求
    const requestPromise = fetch(url, options)
      .then(res => res.json())
      .then(data => {
        cache.set(cacheKey, { data, timestamp: Date.now() });
        pending.delete(cacheKey);
        return data;
      })
      .catch(err => {
        pending.delete(cacheKey);
        throw err;
      });

    pending.set(cacheKey, requestPromise);
    return requestPromise;
  };
}

const cachedFetch = createRequestCache();

// 使用
async function loadData() {
  // 相同 URL 的请求会被缓存
  const data1 = await cachedFetch('/api/users');
  const data2 = await cachedFetch('/api/users');  // 从缓存获取
}
```
:::
