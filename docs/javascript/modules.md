# JavaScript 模块化

模块化是将代码分割成独立、可复用的模块，解决命名冲突、依赖管理、代码组织等问题。

## 模块化演进历史

```
全局函数 → 命名空间 → IIFE → CommonJS → AMD → UMD → ES Module
```

### 1. 全局函数时代（问题：命名冲突）

```javascript
// a.js
function add(a, b) {
  return a + b;
}

// b.js
function add(x, y, z) {  // 命名冲突！覆盖了 a.js 的 add
  return x + y + z;
}
```

### 2. 命名空间（问题：仍可被修改）

```javascript
var MyApp = {
  add: function(a, b) {
    return a + b;
  },
  utils: {
    format: function() {}
  }
};

// 问题：属性可以被外部修改
MyApp.add = null;  // 破坏了模块
```

### 3. IIFE（立即执行函数）

```javascript
var Module = (function() {
  // 私有变量
  var privateVar = 'private';

  // 私有方法
  function privateMethod() {
    console.log(privateVar);
  }

  // 暴露公共 API
  return {
    publicMethod: function() {
      privateMethod();
    },
    publicVar: 'public'
  };
})();

Module.publicMethod();  // 可以访问
// Module.privateVar;   // undefined，无法访问
```

---

## CommonJS

CommonJS 是 Node.js 采用的模块规范，特点是**同步加载**、**运行时加载**、**值的拷贝**。

### 基本语法

```javascript
// math.js - 导出
const PI = 3.14159;

function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

// 方式1：单个导出
module.exports.add = add;
module.exports.PI = PI;

// 方式2：整体导出（推荐）
module.exports = {
  PI,
  add,
  multiply
};

// 方式3：exports 简写（注意不能重新赋值）
exports.add = add;
exports.PI = PI;
// exports = { add };  // ❌ 错误！这会断开与 module.exports 的引用
```

```javascript
// main.js - 导入
const math = require('./math');
console.log(math.add(1, 2));
console.log(math.PI);

// 解构导入
const { add, PI } = require('./math');
```

### module.exports vs exports

```javascript
// 初始状态
// exports = module.exports = {}

// exports 是 module.exports 的引用
exports.foo = 'bar';  // ✅ 等同于 module.exports.foo = 'bar'

// 但不能重新赋值
exports = { foo: 'bar' };  // ❌ 断开了引用，不生效

// module.exports 可以重新赋值
module.exports = { foo: 'bar' };  // ✅ 这才是真正导出的对象

// 最终导出的是 module.exports
```

### 加载机制

```javascript
// 1. 同步加载
const fs = require('fs');  // 阻塞执行，直到模块加载完成

// 2. 缓存机制
const a1 = require('./a');  // 第一次加载，执行模块代码
const a2 = require('./a');  // 直接返回缓存
console.log(a1 === a2);     // true

// 3. 值的拷贝
// counter.js
let count = 0;
module.exports = {
  count,
  increment() { count++; }
};

// main.js
const counter = require('./counter');
console.log(counter.count);  // 0
counter.increment();
console.log(counter.count);  // 0（仍是 0，因为是值的拷贝）
```

### 循环依赖

```javascript
// a.js
console.log('a.js 开始执行');
exports.done = false;
const b = require('./b.js');  // 此时去执行 b.js
console.log('在 a.js 中，b.done =', b.done);
exports.done = true;
console.log('a.js 执行完毕');

// b.js
console.log('b.js 开始执行');
exports.done = false;
const a = require('./a.js');  // 获取 a.js 的不完整导出
console.log('在 b.js 中，a.done =', a.done);  // false！
exports.done = true;
console.log('b.js 执行完毕');

// 执行 node a.js
// 输出：
// a.js 开始执行
// b.js 开始执行
// 在 b.js 中，a.done = false  ← 获取到不完整的值
// b.js 执行完毕
// 在 a.js 中，b.done = true
// a.js 执行完毕
```

---

## ES Module (ESM)

ES Module 是 ES6 引入的官方模块规范，特点是**静态分析**、**编译时加载**、**值的引用**。

### 基本语法

```javascript
// math.mjs - 导出

// 命名导出
export const PI = 3.14159;

export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

// 集中导出
const subtract = (a, b) => a - b;
const divide = (a, b) => a / b;
export { subtract, divide };

// 重命名导出
export { subtract as sub };

// 默认导出（每个模块只能有一个）
export default function() {
  console.log('default export');
}

// 或者
const myFunction = () => {};
export default myFunction;
```

```javascript
// main.mjs - 导入

// 命名导入
import { add, PI } from './math.mjs';

// 重命名导入
import { add as sum } from './math.mjs';

// 导入默认导出
import myFunc from './math.mjs';

// 混合导入
import myFunc, { add, PI } from './math.mjs';

// 导入全部
import * as math from './math.mjs';
console.log(math.add(1, 2));
console.log(math.default);  // 默认导出

// 动态导入（返回 Promise）
const module = await import('./math.mjs');

// 仅执行模块（不导入任何内容）
import './side-effect.mjs';
```

### 静态分析特性

```javascript
// ES Module 的 import/export 必须在顶层

// ❌ 错误：不能在条件语句中
if (condition) {
  import { foo } from './foo.mjs';  // SyntaxError
}

// ❌ 错误：不能在函数中
function loadModule() {
  import { bar } from './bar.mjs';  // SyntaxError
}

// ✅ 正确：动态导入可以在任何地方
async function loadModule() {
  if (condition) {
    const module = await import('./foo.mjs');
  }
}

// 静态分析的好处
// 1. 可以在编译时确定依赖关系
// 2. 支持 Tree Shaking
// 3. 可以做静态优化
```

### 值的引用（动态绑定）

```javascript
// counter.mjs
export let count = 0;

export function increment() {
  count++;
}

// main.mjs
import { count, increment } from './counter.mjs';

console.log(count);  // 0
increment();
console.log(count);  // 1 ← 获取到更新后的值！

// 注意：不能直接修改导入的绑定
// count = 10;  // TypeError: Assignment to constant variable
```

### 循环依赖

```javascript
// ES Module 通过引用更好地处理循环依赖

// a.mjs
console.log('a.mjs 开始执行');
import { b } from './b.mjs';
console.log('在 a.mjs 中，b =', b);
export const a = 'a';

// b.mjs
console.log('b.mjs 开始执行');
import { a } from './a.mjs';
console.log('在 b.mjs 中，a =', a);  // undefined（但不会报错）
export const b = 'b';

// 执行时：
// b.mjs 开始执行
// 在 b.mjs 中，a = undefined
// a.mjs 开始执行
// 在 a.mjs 中，b = b

// 虽然有 undefined 的问题，但比 CommonJS 更可控
// 解决方案：将导出放在 import 之前，或使用函数包装
```

### Node.js 中使用 ES Module

```javascript
// 方式1：使用 .mjs 扩展名
// file.mjs 自动被识别为 ES Module

// 方式2：package.json 设置 type
{
  "type": "module"  // 所有 .js 文件都按 ES Module 处理
}

// 方式3：.cjs 扩展名强制使用 CommonJS
// 在 type: "module" 的项目中，.cjs 文件仍使用 CommonJS

// ES Module 中使用 CommonJS 模块
import cjsModule from './cjs-module.cjs';

// CommonJS 中使用 ES Module（必须动态导入）
async function main() {
  const esmModule = await import('./esm-module.mjs');
}
```

---

## AMD (Asynchronous Module Definition)

AMD 是为浏览器设计的异步模块规范，RequireJS 是其主要实现。

```javascript
// 定义模块
define('math', ['dependency1', 'dependency2'], function(dep1, dep2) {
  // 模块代码
  return {
    add: function(a, b) {
      return a + b;
    }
  };
});

// 使用模块
require(['math'], function(math) {
  console.log(math.add(1, 2));
});

// 特点：
// 1. 异步加载，不阻塞页面
// 2. 依赖前置，在定义时声明所有依赖
// 3. 适合浏览器环境
```

---

## UMD (Universal Module Definition)

UMD 是兼容 CommonJS、AMD 和全局变量的通用模块规范。

```javascript
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['dependency'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = factory(require('dependency'));
  } else {
    // 浏览器全局变量
    root.MyModule = factory(root.Dependency);
  }
})(typeof self !== 'undefined' ? self : this, function(Dependency) {
  // 模块代码
  return {
    // ...
  };
});
```

---

## 模块规范对比

| 特性 | CommonJS | ES Module | AMD |
|------|----------|-----------|-----|
| 加载方式 | 同步 | 异步/静态 | 异步 |
| 加载时机 | 运行时 | 编译时 | 运行时 |
| 导出值 | 值的拷贝 | 值的引用 | 值的拷贝 |
| 顶层 this | 当前模块 | undefined | - |
| 循环依赖 | 部分导出 | 未初始化引用 | 部分导出 |
| Tree Shaking | 不支持 | 支持 | 不支持 |
| 动态导入 | require() | import() | require() |
| 使用环境 | Node.js | 浏览器/Node.js | 浏览器 |

---

## Tree Shaking

Tree Shaking 是利用 ES Module 的静态分析特性，在打包时移除未使用的代码。

### 工作原理

```javascript
// math.js
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

export function unused() {
  console.log('This function is never used');
}

// main.js
import { add } from './math.js';
console.log(add(1, 2));

// 打包后，multiply 和 unused 会被移除
```

### 生效条件

```javascript
// ✅ 可以 Tree Shaking

// 1. 使用 ES Module
import { foo } from './module';

// 2. 纯函数，无副作用
export const add = (a, b) => a + b;


// ❌ 无法 Tree Shaking

// 1. CommonJS
const { foo } = require('./module');

// 2. 动态属性访问
import * as utils from './utils';
const method = condition ? 'foo' : 'bar';
utils[method]();  // 无法静态分析

// 3. 有副作用的代码
export const PI = 3.14;
console.log('模块加载了');  // 副作用，不会被移除
```

### 配置 sideEffects

```json
// package.json
{
  "name": "my-package",
  "sideEffects": false,  // 声明整个包无副作用

  // 或指定有副作用的文件
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfill.js"
  ]
}
```

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',  // production 模式自动开启 Tree Shaking
  optimization: {
    usedExports: true,  // 标记未使用的导出
    minimize: true       // 压缩时移除未使用代码
  }
};
```

---

