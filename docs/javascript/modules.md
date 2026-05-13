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

## 高频面试题

::: details 1. CommonJS 和 ES Module 的区别？
**一句话答案：** CommonJS 是运行时同步加载，值的拷贝；ES Module 是编译时静态分析，值的引用，支持 Tree Shaking。

**详细解答：**

```javascript
// 1. 加载时机
// CommonJS - 运行时加载
const path = condition ? './a' : './b';
const module = require(path);  // 可以动态路径

// ES Module - 编译时静态分析
import { foo } from './module';  // 必须是静态路径
// 动态导入需要用 import()

// 2. 导出值
// CommonJS - 值的拷贝
// counter.js
let count = 0;
module.exports = { count, increment() { count++; } };

// main.js
const counter = require('./counter');
counter.increment();
console.log(counter.count);  // 0（不变）

// ES Module - 值的引用
// counter.mjs
export let count = 0;
export function increment() { count++; }

// main.mjs
import { count, increment } from './counter.mjs';
increment();
console.log(count);  // 1（更新了）

// 3. this 指向
// CommonJS: this 指向 module.exports
console.log(this === module.exports);  // true

// ES Module: this 是 undefined
console.log(this);  // undefined

// 4. Tree Shaking
// CommonJS 不支持（运行时才知道导出什么）
// ES Module 支持（编译时就能确定）
```

**面试回答：**

"CommonJS 和 ES Module 主要有四个区别：

第一，加载时机不同。CommonJS 是运行时加载，require 可以出现在任何地方，路径可以是变量。ES Module 是编译时静态分析，import 必须在顶层，路径必须是字符串字面量。

第二，导出值的本质不同。CommonJS 导出的是值的拷贝，模块内部的变量变化不会影响已经导出的值。ES Module 导出的是值的引用，或者叫动态绑定，模块内部变量的变化会实时反映到导入方。

第三，this 指向不同。CommonJS 中 this 指向当前模块的 exports 对象，ES Module 中 this 是 undefined。

第四，Tree Shaking。因为 ES Module 是静态的，打包工具可以在编译时分析出哪些代码没被使用并移除，CommonJS 做不到这一点。

这些区别决定了 ES Module 更适合现代前端开发，特别是需要打包优化的场景。"

---
:::

::: details 2. require 的查找规则？
```javascript
require('xxx')

// 1. 核心模块（优先级最高）
require('fs');  // 直接加载内置模块

// 2. 路径模块（./ ../ /）
require('./foo');
// 尝试顺序：
// ./foo.js
// ./foo.json
// ./foo.node
// ./foo/package.json (main 字段)
// ./foo/index.js

// 3. node_modules（向上递归查找）
require('lodash');
// 从当前目录开始，向上查找 node_modules
// ./node_modules/lodash
// ../node_modules/lodash
// ../../node_modules/lodash
// 直到根目录
```

---
:::

::: details 3. import() 动态导入有什么用？
```javascript
// 1. 代码分割 / 懒加载
button.onclick = async () => {
  const module = await import('./heavy-module.js');
  module.init();
};

// 2. 条件导入
const module = await import(
  process.env.NODE_ENV === 'production'
    ? './prod-config.js'
    : './dev-config.js'
);

// 3. 运行时确定模块路径
const locale = getUserLocale();
const messages = await import(`./locales/${locale}.js`);

// 4. 按需加载组件（React）
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

// 5. Webpack 魔法注释
const module = await import(
  /* webpackChunkName: "my-chunk" */
  /* webpackPreload: true */
  './module.js'
);
```

---
:::

::: details 4. 如何解决循环依赖？
```javascript
// 问题场景
// a.js 依赖 b.js，b.js 又依赖 a.js

// 解决方案 1：重构代码，提取公共模块
// common.js - 提取共享的部分
export const shared = { ... };

// a.js
import { shared } from './common.js';
export const a = { ... };

// b.js
import { shared } from './common.js';
export const b = { ... };


// 解决方案 2：延迟访问
// a.js
import { getB } from './b.js';

export function getA() {
  return 'A';
}

export function useB() {
  // 在函数内部访问，而不是模块顶层
  const b = getB();
  return `A uses ${b}`;
}


// 解决方案 3：依赖注入
// a.js
export function createA(b) {
  return {
    useB() {
      return b.getValue();
    }
  };
}

// main.js
import { createA } from './a.js';
import { b } from './b.js';

const a = createA(b);
```

---
:::

::: details 5. exports 和 module.exports 的区别？
```javascript
// 初始状态
// module.exports = {}
// exports = module.exports（引用同一个对象）

// 1. 添加属性时，两者等效
exports.foo = 'bar';
module.exports.foo = 'bar';
// 最终导出 { foo: 'bar' }

// 2. 重新赋值时，只有 module.exports 生效
exports = { foo: 'bar' };  // ❌ 不生效，断开了引用
module.exports = { foo: 'bar' };  // ✅ 生效

// 3. 记住：真正导出的永远是 module.exports
// exports 只是它的一个引用/快捷方式

// 最佳实践：
// - 导出对象用 module.exports = { ... }
// - 添加属性用 exports.xxx = xxx 或 module.exports.xxx = xxx
// - 不要混用，容易出错
```

---
:::

::: details 6. package.json 中 type 字段的作用？
```json
// package.json
{
  "type": "module"  // 或 "commonjs"（默认）
}
```

```javascript
// type: "module" 时
// - .js 文件被视为 ES Module
// - 需要 CommonJS 用 .cjs 扩展名
// - 支持顶层 await
// - import.meta 可用

// type: "commonjs" 时（默认）
// - .js 文件被视为 CommonJS
// - 需要 ES Module 用 .mjs 扩展名
// - 不支持顶层 await
```

---
:::

::: details 7. 如何在 ES Module 中获取 __dirname 和 __filename？
```javascript
// CommonJS 中直接可用
console.log(__dirname);
console.log(__filename);

// ES Module 中需要手动构造
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 或者使用 import.meta
console.log(import.meta.url);  // file:///path/to/file.mjs
```

---
:::

::: details 8. 打包工具如何处理模块？
```javascript
// Webpack 打包原理（简化版）

// 输入：多个模块
// a.js
import { b } from './b.js';
export const a = 'A' + b;

// b.js
export const b = 'B';

// 输出：bundle.js
(function(modules) {
  // 模块缓存
  var installedModules = {};

  // require 函数
  function __webpack_require__(moduleId) {
    // 检查缓存
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }

    // 创建新模块
    var module = installedModules[moduleId] = {
      exports: {}
    };

    // 执行模块函数
    modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    );

    return module.exports;
  }

  // 加载入口模块
  return __webpack_require__('./a.js');
})({
  './a.js': function(module, exports, __webpack_require__) {
    var _b = __webpack_require__('./b.js');
    exports.a = 'A' + _b.b;
  },
  './b.js': function(module, exports) {
    exports.b = 'B';
  }
});
```
:::
