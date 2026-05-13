# 数据类型与类型转换

## 1. JavaScript 有哪些数据类型?

### 官方答案
JavaScript 数据类型分为两大类:
- **基本类型(Primitive Types)**: Number、String、Boolean、Undefined、Null、Symbol、BigInt
- **引用类型(Reference Types)**: Object(包括 Array、Function、Date、RegExp 等)

### 通俗理解
可以这样记忆:**基本类型**就像是"值"本身,比如数字 1、字符串 "hello"。它们存储在**栈内存**中,体积小、访问快。

**引用类型**就像是一个"容器",里面可以装很多东西。它们存储在**堆内存**中,变量保存的只是一个地址(引用)。

### 详细说明

#### 基本类型特点
```javascript
// 基本类型 - 值的拷贝
let a = 10;
let b = a;
b = 20;
console.log(a); // 10 - a 没有变化

// 引用类型 - 地址的拷贝
let obj1 = { name: 'Alice' };
let obj2 = obj1;
obj2.name = 'Bob';
console.log(obj1.name); // 'Bob' - obj1 也变了!
```

#### 各类型详解

**Number (数字类型)**
```javascript
let num1 = 42;           // 整数
let num2 = 3.14;         // 浮点数
let num3 = NaN;          // Not a Number
let num4 = Infinity;     // 无穷大

// 特殊值判断
console.log(typeof NaN);        // 'number' - NaN 也是数字类型
console.log(NaN === NaN);       // false - NaN 不等于任何值,包括它自己
console.log(isNaN(NaN));        // true
console.log(Number.isNaN(NaN)); // true - 更严格,推荐使用

// 浮点数精度问题
console.log(0.1 + 0.2);         // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false
```

**BigInt (大整数)**
```javascript
// 用于表示超过 Number 安全范围的整数
const bigNum = 9007199254740991n;  // 或者 BigInt(9007199254740991)
const anotherBig = BigInt("9007199254740991");

// 不能与 Number 混用
// bigNum + 10; // 报错!
bigNum + 10n;   // 正确
```

**Symbol (符号)**
```javascript
// 创建唯一标识符
const sym1 = Symbol('description');
const sym2 = Symbol('description');
console.log(sym1 === sym2); // false - 每次创建都是唯一的

// 常用于对象属性,避免命名冲突
const obj = {
  [Symbol('id')]: 1,
  name: 'test'
};
```

**Null vs Undefined**
```javascript
// undefined - 变量声明了但未赋值
let a;
console.log(a); // undefined
console.log(typeof a); // 'undefined'

// null - 明确表示"空值"
let b = null;
console.log(b); // null
console.log(typeof b); // 'object' - 这是一个历史遗留 bug!

// 使用场景
let user = null;  // 用户未登录,明确设置为 null
let config;       // 配置还未初始化,默认 undefined
```

---

## 2. 如何准确判断数据类型?

### 官方答案
- `typeof` 运算符 - 适合基本类型,但 null 返回 'object'
- `instanceof` 运算符 - 判断对象类型,检查原型链
- `Object.prototype.toString.call()` - 最准确的方法
- `Array.isArray()` - 判断数组

### 通俗理解
就像医生诊断病人,有不同的检查方法:
- `typeof` 是**快速问诊**,适合简单情况
- `instanceof` 是**看家族病史**,检查对象是不是某个"家族"的
- `Object.prototype.toString.call()` 是**全面体检**,最准确但稍显复杂

### 详细说明

#### typeof 的使用和局限
```javascript
// typeof 的正常使用
console.log(typeof 42);          // 'number'
console.log(typeof 'hello');     // 'string'
console.log(typeof true);        // 'boolean'
console.log(typeof undefined);   // 'undefined'
console.log(typeof Symbol());    // 'symbol'
console.log(typeof 123n);        // 'bigint'
console.log(typeof function(){}); // 'function'

// typeof 的坑
console.log(typeof null);        // 'object' ❌ 历史 bug
console.log(typeof []);          // 'object' - 无法区分数组
console.log(typeof {});          // 'object' - 无法区分普通对象
console.log(typeof new Date());  // 'object' - 无法识别具体类型
```

#### instanceof 的原理和使用
```javascript
// instanceof 检查原型链
console.log([] instanceof Array);        // true
console.log({} instanceof Object);       // true
console.log(function(){} instanceof Function); // true

// 原理:检查右边构造函数的 prototype 是否在左边对象的原型链上
class Animal {}
class Dog extends Animal {}
const dog = new Dog();

console.log(dog instanceof Dog);      // true
console.log(dog instanceof Animal);   // true
console.log(dog instanceof Object);   // true

// instanceof 的局限
console.log(null instanceof Object);  // false
console.log('hello' instanceof String); // false - 基本类型返回 false

// 跨 iframe 问题
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
const iframeArray = window.frames[0].Array;
const arr = new iframeArray();
console.log(arr instanceof Array); // false - 不同的 Array 构造函数!
```

#### Object.prototype.toString - 最准确的方法
```javascript
// 万能类型检测方法
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

console.log(getType(123));           // 'number'
console.log(getType('hello'));       // 'string'
console.log(getType(true));          // 'boolean'
console.log(getType(null));          // 'null' ✅
console.log(getType(undefined));     // 'undefined'
console.log(getType(Symbol()));      // 'symbol'
console.log(getType(123n));          // 'bigint'
console.log(getType([]));            // 'array' ✅
console.log(getType({}));            // 'object'
console.log(getType(function(){}));  // 'function'
console.log(getType(new Date()));    // 'date' ✅
console.log(getType(/regex/));       // 'regexp' ✅
console.log(getType(new Map()));     // 'map' ✅
console.log(getType(new Set()));     // 'set' ✅
```

#### 工具函数封装
```javascript
// 完整的类型判断工具
const typeUtils = {
  // 基础类型检查
  isNumber: (val) => typeof val === 'number' && !isNaN(val),
  isString: (val) => typeof val === 'string',
  isBoolean: (val) => typeof val === 'boolean',
  isUndefined: (val) => val === undefined,
  isNull: (val) => val === null,
  isSymbol: (val) => typeof val === 'symbol',
  isBigInt: (val) => typeof val === 'bigint',

  // 引用类型检查
  isObject: (val) => val !== null && typeof val === 'object',
  isPlainObject: (val) => Object.prototype.toString.call(val) === '[object Object]',
  isArray: (val) => Array.isArray(val),
  isFunction: (val) => typeof val === 'function',
  isDate: (val) => val instanceof Date,
  isRegExp: (val) => val instanceof RegExp,
  isMap: (val) => val instanceof Map,
  isSet: (val) => val instanceof Set,

  // 特殊检查
  isNaN: (val) => Number.isNaN(val),
  isNil: (val) => val === null || val === undefined,
  isEmpty: (val) => {
    if (val === null || val === undefined) return true;
    if (Array.isArray(val) || typeof val === 'string') return val.length === 0;
    if (val instanceof Map || val instanceof Set) return val.size === 0;
    if (typeof val === 'object') return Object.keys(val).length === 0;
    return false;
  }
};

// 使用示例
console.log(typeUtils.isNumber(123));      // true
console.log(typeUtils.isArray([]));        // true
console.log(typeUtils.isEmpty({}));        // true
console.log(typeUtils.isEmpty([1, 2]));    // false
```

---

## 3. 类型转换机制是怎样的?

### 官方答案
JavaScript 中的类型转换分为:
- **显式转换(强制转换)**: 通过 Number()、String()、Boolean() 等方法主动转换
- **隐式转换(自动转换)**: 在运算或比较时自动发生的转换

### 通俗理解
**显式转换**就像你明确告诉 JavaScript:"我要把这个东西变成数字!"

**隐式转换**就像 JavaScript 自作主张:"我看你要做加法,我帮你把字符串变成数字吧。"

有时候这种"自作主张"会导致意外的结果,比如 `'2' + 1` 变成 `'21'` 而不是 `3`。

### 详细说明

#### 转换为数字 (Number)
```javascript
// 显式转换
console.log(Number('123'));      // 123
console.log(Number('12.5'));     // 12.5
console.log(Number(''));         // 0
console.log(Number('  '));       // 0
console.log(Number('123abc'));   // NaN
console.log(Number(true));       // 1
console.log(Number(false));      // 0
console.log(Number(null));       // 0
console.log(Number(undefined));  // NaN

// 其他转数字方法
console.log(parseInt('123abc'));     // 123 - 从左到右解析
console.log(parseFloat('12.5rem'));  // 12.5
console.log(+'123');                 // 123 - 一元加号
console.log('123' - 0);              // 123 - 减法触发转换

// 隐式转换
console.log('6' / '2');    // 3 - 除法转数字
console.log('6' * '2');    // 12 - 乘法转数字
console.log('6' - '2');    // 4 - 减法转数字
console.log('6' + '2');    // '62' ❗ 加法优先字符串拼接
```

#### 转换为字符串 (String)
```javascript
// 显式转换
console.log(String(123));        // '123'
console.log(String(true));       // 'true'
console.log(String(null));       // 'null'
console.log(String(undefined));  // 'undefined'
console.log(String([1, 2, 3]));  // '1,2,3'
console.log(String({a: 1}));     // '[object Object]'

// 其他方法
console.log((123).toString());   // '123'
console.log(`${123}`);           // '123' - 模板字符串

// 隐式转换
console.log(123 + '');           // '123'
console.log('' + true);          // 'true'
console.log('value: ' + null);   // 'value: null'
```

#### 转换为布尔值 (Boolean)
```javascript
// 显式转换
console.log(Boolean(1));          // true
console.log(Boolean(0));          // false
console.log(Boolean('hello'));    // true
console.log(Boolean(''));         // false
console.log(Boolean(null));       // false
console.log(Boolean(undefined));  // false
console.log(Boolean(NaN));        // false
console.log(Boolean({}));         // true
console.log(Boolean([]));         // true

// 隐式转换
console.log(!!'hello');           // true - 双重否定
console.log(!'');                 // true

// 假值(Falsy)列表 - 只有这 8 个!
/*
  false
  0
  -0
  0n (BigInt 零)
  '' (空字符串)
  null
  undefined
  NaN
*/

// 条件判断中的隐式转换
if ('0') {
  console.log('字符串 "0" 是真值!'); // 会执行
}

if ([]) {
  console.log('空数组是真值!'); // 会执行
}
```

#### == 的复杂转换规则
```javascript
// == 会进行类型转换,=== 不会
console.log(1 == '1');        // true
console.log(1 === '1');       // false

// null 和 undefined 的特殊规则
console.log(null == undefined);  // true ✅
console.log(null === undefined); // false

// 布尔值转换
console.log(true == 1);       // true - true 转为 1
console.log(false == 0);      // true - false 转为 0
console.log('1' == true);     // true - 都转为数字 1

// 对象转换
console.log([1] == 1);        // true - [1] 转为 '1',再转为 1
console.log([1, 2] == '1,2'); // true - [1,2] 调用 toString()

// 容易出错的情况
console.log([] == false);     // true ❗ [] 转为 '','' 转为 0
console.log([] == ![]);       // true ❗ ![] 是 false,[] 转为 ''
console.log('' == 0);         // true
console.log(' ' == 0);        // true - 空格字符串转为 0

// 最佳实践:优先使用 ===
console.log(1 === 1);         // 推荐
console.log('1' === '1');     // 推荐
```

#### 对象转原始类型
```javascript
// 对象转换调用顺序: Symbol.toPrimitive > valueOf > toString
const obj = {
  value: 100,

  // 方法1: Symbol.toPrimitive (优先级最高)
  [Symbol.toPrimitive](hint) {
    console.log('hint:', hint); // 'number', 'string', 'default'
    if (hint === 'number') return this.value;
    if (hint === 'string') return `值是 ${this.value}`;
    return this.value;
  },

  // 方法2: valueOf
  valueOf() {
    console.log('调用 valueOf');
    return this.value;
  },

  // 方法3: toString
  toString() {
    console.log('调用 toString');
    return String(this.value);
  }
};

console.log(obj + 1);      // Symbol.toPrimitive with hint 'default'
console.log(+obj);         // Symbol.toPrimitive with hint 'number'
console.log(`${obj}`);     // Symbol.toPrimitive with hint 'string'

// 实际例子
const price = {
  value: 100,
  valueOf() {
    return this.value;
  },
  toString() {
    return `¥${this.value}`;
  }
};

console.log(price + 50);    // 150 - 调用 valueOf
console.log(`价格: ${price}`); // '价格: ¥100' - 调用 toString
```

---

## 4. 常见面试题

::: details 题目1: 输出结果
```javascript
console.log(typeof typeof 1);
```
<details>
<summary>点击查看答案</summary>

**答案**: `'string'`

**解析**:
1. `typeof 1` 返回 `'number'`(字符串)
2. `typeof 'number'` 返回 `'string'`

任何 `typeof` 操作都返回字符串类型。
:::

</details>

::: details 题目2: 比较结果
```javascript
console.log([] == ![]);
```
<details>
<summary>点击查看答案</summary>

**答案**: `true`

**解析**:
1. `![]` 先执行,空数组是真值,取反得 `false`
2. 变成 `[] == false`
3. `[]` 调用 `toString()` 得到 `''`
4. `''` 和 `false` 都转为数字 `0`
5. `0 == 0` 为 `true`

这是一个经典的"坑",实际开发中永远不要这样写,用 `===`!
:::

</details>

::: details 题目3: 输出结果
```javascript
console.log(1 + '1');
console.log(1 - '1');
console.log(1 * '2');
console.log(1 / '2');
```
<details>
<summary>点击查看答案</summary>

**答案**:
```javascript
'11'   // 字符串拼接
0      // 减法转数字
2      // 乘法转数字
0.5    // 除法转数字
```

**解析**: 只有 `+` 运算符在遇到字符串时会进行拼接,其他算术运算符都会将操作数转为数字。
:::

---

</details>

## 5. 高频面试题

::: details Q1: typeof 和 instanceof 的区别？
#### 一句话答案
typeof 返回类型字符串，适合判断基本类型；instanceof 检查原型链，适合判断对象的具体类型。

#### 详细解答

| 特性 | typeof | instanceof |
|------|--------|------------|
| 返回值 | 类型字符串 | 布尔值 |
| 适用场景 | 基本类型 | 引用类型（对象） |
| 原理 | 检查值的内部标记 | 检查原型链 |
| null | 返回 'object'（bug） | 返回 false |
| 基本类型包装 | 正确返回 | 返回 false |
| 跨 iframe | 无问题 | 有问题 |

```javascript
// typeof 示例
typeof 123          // 'number'
typeof '123'        // 'string'
typeof true         // 'boolean'
typeof undefined    // 'undefined'
typeof null         // 'object' ❌
typeof Symbol()     // 'symbol'
typeof 123n         // 'bigint'
typeof {}           // 'object'
typeof []           // 'object' - 无法区分数组
typeof function(){} // 'function'

// instanceof 示例
[] instanceof Array        // true
[] instanceof Object       // true
{} instanceof Object       // true
function(){} instanceof Function  // true

// instanceof 的问题
'str' instanceof String    // false - 基本类型
123 instanceof Number      // false - 基本类型
new String('str') instanceof String  // true - 包装对象

// 手写 instanceof
function myInstanceof(obj, constructor) {
  // 基本类型直接返回 false
  if (obj === null || typeof obj !== 'object') {
    return false;
  }

  let proto = Object.getPrototypeOf(obj);

  while (proto !== null) {
    if (proto === constructor.prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }

  return false;
}
```

#### 面试回答模板

> "typeof 和 instanceof 是两种不同的类型判断方式。typeof 返回一个表示类型的字符串，适合判断基本类型，但它有个历史遗留的 bug，typeof null 返回 'object'，而且它无法区分数组和普通对象，都返回 'object'。
>
> instanceof 用来判断对象是否是某个构造函数的实例，它的原理是检查右边构造函数的 prototype 是否在左边对象的原型链上。它的问题是对基本类型无效，而且在跨 iframe 时会有问题，因为每个 iframe 有自己的 Array 构造函数。
>
> 最准确的类型判断方法是 Object.prototype.toString.call()，它能正确识别所有类型，包括 null、数组、Date、RegExp 等。"

---
:::

::: details Q2: null 和 undefined 的区别？
#### 一句话答案
undefined 表示变量已声明但未赋值，null 表示空对象指针，是主动设置的"空值"。

#### 详细解答

| 特性 | undefined | null |
|------|-----------|------|
| 含义 | 未定义/未赋值 | 空值/空对象引用 |
| typeof 结果 | 'undefined' | 'object' |
| 转为数字 | NaN | 0 |
| 转为布尔 | false | false |
| == 比较 | null == undefined 为 true | |
| === 比较 | null === undefined 为 false | |
| 是否是关键字 | 否（全局变量） | 是 |

```javascript
// 什么时候是 undefined
let a;                    // 声明未赋值
const obj = {};
console.log(obj.name);    // 访问不存在的属性
function foo() {}
console.log(foo());       // 函数没有返回值
function bar(x) {
  console.log(x);         // 参数未传递
}
bar();

// 什么时候用 null
let user = null;          // 明确表示"没有用户"
element.parentNode = null; // 手动断开引用
const data = fetchData() || null;  // 表示无数据

// 类型转换差异
Number(undefined)  // NaN
Number(null)       // 0

// 相等性
null == undefined   // true
null === undefined  // false
null == null        // true
null === null       // true

// undefined 不是关键字
function test() {
  var undefined = 123;  // 可以这样做（不推荐）
  console.log(undefined);  // 123
}

// 推荐用 void 0 代替 undefined
const safeUndefined = void 0;

// 判断方法
// 判断 null
value === null

// 判断 undefined
value === undefined
typeof value === 'undefined'  // 更安全，避免变量未声明报错

// 判断 null 或 undefined
value == null  // 利用 == 的特性
value === null || value === undefined
```

#### 面试回答模板

> "undefined 和 null 都表示'没有值'，但语义不同。undefined 是 JavaScript 自动赋的默认值，表示变量声明了但还没有值，比如声明未赋值的变量、访问不存在的属性、函数没有返回值等。null 是程序员主动设置的，表示'这里本应该有个值，但现在是空的'，比如表示用户未登录时可以设为 null。
>
> 它们还有几个区别：typeof null 返回 'object'，这是个历史 bug；转数字时 undefined 是 NaN，null 是 0；用 == 比较它们是相等的，但 === 不相等。另外 undefined 不是关键字，在函数作用域内可以被重新赋值，所以有时候会用 void 0 来代替 undefined。"

---
:::

::: details Q3: 如何判断一个变量是否是数组？
#### 一句话答案
推荐用 Array.isArray()，最准确且能处理跨 iframe 的情况。

#### 详细解答

```javascript
const arr = [1, 2, 3];

// 方法1: Array.isArray() - 推荐 ✅
Array.isArray(arr);  // true
Array.isArray({});   // false
Array.isArray('abc'); // false

// 方法2: Object.prototype.toString.call() - 准确 ✅
Object.prototype.toString.call(arr) === '[object Array]';

// 方法3: instanceof - 跨 iframe 有问题 ⚠️
arr instanceof Array;  // true
// 但在跨 iframe 时可能为 false

// 方法4: constructor - 可被修改 ⚠️
arr.constructor === Array;  // true
// 但 constructor 可以被手动修改

// 方法5: Array.prototype.isPrototypeOf - 可行
Array.prototype.isPrototypeOf(arr);  // true

// 跨 iframe 问题演示
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
const iframeArray = window.frames[0].Array;
const iframeArr = new iframeArray(1, 2, 3);

iframeArr instanceof Array;           // false ❌
Array.isArray(iframeArr);             // true ✅
Object.prototype.toString.call(iframeArr);  // '[object Array]' ✅

// 封装通用判断函数
function isArray(value) {
  if (Array.isArray) {
    return Array.isArray(value);
  }
  return Object.prototype.toString.call(value) === '[object Array]';
}
```

---
:::

::: details Q4: == 和 === 的区别？
#### 一句话答案
== 会进行类型转换后比较，=== 不会转换类型，必须类型和值都相等。

#### 详细解答

```javascript
// === 严格相等，不转换类型
1 === 1        // true
1 === '1'      // false - 类型不同
null === undefined  // false

// == 宽松相等，会转换类型
1 == '1'       // true - '1' 转为 1
true == 1      // true - true 转为 1
null == undefined  // true - 特殊规则

// == 的转换规则
/*
1. 类型相同：直接比较
2. null == undefined: true
3. 数字 vs 字符串: 字符串转数字
4. 布尔 vs 其他: 布尔转数字
5. 对象 vs 基本类型: 对象转原始值（ToPrimitive）
*/

// 常见陷阱
'' == false    // true (都转为 0)
'0' == false   // true (都转为 0)
[] == false    // true ([] -> '' -> 0)
[] == ![]      // true ([] -> '' -> 0, ![] -> false -> 0)
{} == !{}      // false ({} -> NaN, !{} -> false -> 0)

// 建议：始终使用 ===
const a = '1';
const b = 1;

// ❌ 不推荐
if (a == b) { }

// ✅ 推荐
if (Number(a) === b) { }
if (a === String(b)) { }

// 唯一可以用 == 的场景：判断 null/undefined
if (value == null) {
  // value 是 null 或 undefined
}
```

---
:::

::: details Q5: 0.1 + 0.2 为什么不等于 0.3？如何解决？
#### 一句话答案
因为 JavaScript 使用 IEEE 754 双精度浮点数，某些十进制小数无法精确表示为二进制，导致精度丢失。

#### 详细解答

```javascript
console.log(0.1 + 0.2);  // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3);  // false

// 原因：
// 0.1 的二进制是无限循环小数
// 0.1 = 0.00011001100110011...(无限循环)
// 存储时被截断，导致精度丢失

// 解决方案1：使用 Number.EPSILON
function equal(a, b) {
  return Math.abs(a - b) < Number.EPSILON;
}
equal(0.1 + 0.2, 0.3);  // true

// 解决方案2：转为整数计算
function add(a, b) {
  const precision = Math.max(
    (String(a).split('.')[1] || '').length,
    (String(b).split('.')[1] || '').length
  );
  const multiplier = Math.pow(10, precision);
  return (a * multiplier + b * multiplier) / multiplier;
}
add(0.1, 0.2);  // 0.3

// 解决方案3：toFixed（注意返回字符串）
(0.1 + 0.2).toFixed(1);  // '0.3'
parseFloat((0.1 + 0.2).toFixed(10));  // 0.3

// 解决方案4：使用第三方库
// decimal.js, bignumber.js, big.js

// 实际应用场景
// 金额计算：用分而不是元，避免小数
const priceInCents = 199;  // 1.99 元用 199 分表示
const total = priceInCents * quantity;
const displayPrice = (total / 100).toFixed(2);
```

---
:::

::: details Q6: 说说 JavaScript 中的隐式类型转换
#### 一句话答案
隐式类型转换发生在运算和比较时，JavaScript 会自动将操作数转换为需要的类型，主要涉及 ToPrimitive、ToNumber、ToString、ToBoolean 四种转换。

#### 详细解答

```javascript
// 1. 加法运算中的隐式转换
// 规则：有字符串则拼接，否则转数字
1 + '2'       // '12' - 数字转字符串
'1' + 2       // '12'
1 + 2         // 3
true + 1      // 2 - true 转 1
false + '1'   // 'false1' - 有字符串，false 转 'false'
[] + 1        // '1' - [] 转 ''
{} + 1        // 1 或 '[object Object]1'（取决于解析方式）
[] + []       // '' - 都转空字符串
[] + {}       // '[object Object]'
{} + []       // 0 或 '[object Object]'

// 2. 其他算术运算（-、*、/、%）
// 规则：都转数字
'6' - 1       // 5
'6' * '2'     // 12
'10' / '2'    // 5
'10' % '3'    // 1
'abc' - 1     // NaN

// 3. 比较运算
// 规则：基本都转数字，但字符串比较按字符编码
'10' > '9'    // false - 字符串比较，'1' < '9'
'10' > 9      // true - '10' 转为 10
'a' > 'A'     // true - 比较 ASCII 码

// 4. 逻辑运算中的转换
// && 和 || 返回原值，不是布尔值
'hello' && 'world'  // 'world'
'' && 'world'       // ''
'hello' || 'world'  // 'hello'
'' || 'world'       // 'world'
null || 'default'   // 'default'

// 5. 条件语句中的转换
if ('0') { }         // 执行 - '0' 是真值
if ([]) { }          // 执行 - [] 是真值
if (0) { }           // 不执行
if ('') { }          // 不执行

// 6. ToPrimitive 转换（对象转原始值）
const obj = {
  valueOf() {
    return 42;
  },
  toString() {
    return 'hello';
  }
};

obj + 1      // 43 - 优先调用 valueOf
`${obj}`     // 'hello' - 字符串场景调用 toString

// 7. 一元运算符
+true        // 1
+'123'       // 123
+[]          // 0 ([] -> '' -> 0)
+{}          // NaN ({} -> '[object Object]' -> NaN)
![]          // false
!![]         // true
```

---
:::

::: details Q7: Object.is() 和 === 有什么区别？
#### 一句话答案
Object.is() 修复了 === 的两个特殊情况：NaN 等于 NaN，+0 不等于 -0。

#### 详细解答

```javascript
// === 的特殊情况
NaN === NaN      // false ❌
+0 === -0        // true ❌

// Object.is() 的结果
Object.is(NaN, NaN)   // true ✅
Object.is(+0, -0)     // false ✅

// 其他情况两者相同
Object.is(1, 1)       // true
Object.is('a', 'a')   // true
Object.is(null, null) // true
Object.is(undefined, undefined) // true
Object.is({}, {})     // false - 不同对象

// 手写 Object.is
function myObjectIs(a, b) {
  // 处理 +0 和 -0
  if (a === 0 && b === 0) {
    return 1 / a === 1 / b;  // Infinity vs -Infinity
  }
  // 处理 NaN
  if (a !== a) {
    return b !== b;
  }
  // 其他情况用 ===
  return a === b;
}

// 使用场景
// 1. 检测 NaN
Object.is(value, NaN)  // 或用 Number.isNaN(value)

// 2. 区分 +0 和 -0
Object.is(+0, -0)  // false

// 为什么要区分 +0 和 -0？
1 / +0   // Infinity
1 / -0   // -Infinity
```

---
:::

::: details Q8: 什么是包装类型？
#### 一句话答案
包装类型是 JavaScript 为基本类型（Number、String、Boolean）提供的临时对象包装，使得基本类型可以调用方法。

#### 详细解答

```javascript
// 基本类型调用方法时会临时创建包装对象
const str = 'hello';
console.log(str.length);      // 5
console.log(str.toUpperCase()); // 'HELLO'

// 实际发生了什么？
// 1. 创建 String 包装对象
// 2. 调用方法
// 3. 销毁包装对象

// 等价于：
const temp = new String('hello');
console.log(temp.length);
temp = null;  // 销毁

// 包装类型 vs 基本类型
const str1 = 'hello';           // 基本类型
const str2 = new String('hello'); // 包装对象

typeof str1  // 'string'
typeof str2  // 'object'

str1 === str2  // false
str1 == str2   // true

// 给基本类型添加属性不会报错，但也没效果
const s = 'test';
s.foo = 'bar';
console.log(s.foo);  // undefined

// 因为每次访问都创建新的包装对象

// Number 和 Boolean 同理
const num = 123;
num.toFixed(2);  // '123.00'

const bool = true;
bool.toString(); // 'true'

// 显式创建包装对象（不推荐）
const numObj = new Number(123);
const strObj = new String('abc');
const boolObj = new Boolean(false);

// 注意：Boolean 包装对象的坑
if (new Boolean(false)) {
  console.log('会执行！');  // 对象是真值
}
```

---
:::

## 6. 类型转换速查表

::: details 转换为 Number
| 原始值 | 结果 |
|--------|------|
| undefined | NaN |
| null | 0 |
| true | 1 |
| false | 0 |
| '' | 0 |
| '123' | 123 |
| '12.5' | 12.5 |
| '123abc' | NaN |
| [] | 0 |
| [1] | 1 |
| [1,2] | NaN |
| {} | NaN |
| function(){} | NaN |
:::

::: details 转换为 String
| 原始值 | 结果 |
|--------|------|
| undefined | 'undefined' |
| null | 'null' |
| true | 'true' |
| false | 'false' |
| 123 | '123' |
| NaN | 'NaN' |
| Infinity | 'Infinity' |
| [] | '' |
| [1,2,3] | '1,2,3' |
| {} | '[object Object]' |
| function(){} | 'function(){}' |
:::

::: details 转换为 Boolean（假值列表）
```javascript
// 只有以下 8 个值转为 false，其他都是 true
false
0
-0
0n        // BigInt 零
''        // 空字符串
null
undefined
NaN
```

---
:::

## 总结

::: details 核心要点
1. JavaScript 有 7 种基本类型和 1 种引用类型
2. 使用 `Object.prototype.toString.call()` 最准确
3. 理解显式转换和隐式转换的区别
4. 掌握假值列表(8个)
5. 优先使用 `===` 避免类型转换的坑
:::

::: details 面试加分项
- 能说出 `typeof null` 返回 `'object'` 的历史原因
- 了解 V8 引擎中的 Smi 和 HeapNumber
- 理解 Symbol 和 BigInt 的使用场景
- 掌握对象转原始类型的完整流程
:::

::: details 高频考点速记
```
┌─────────────────────────────────────────────────────────┐
│                   数据类型高频考点                        │
├─────────────────────────────────────────────────────────┤
│  typeof vs instanceof ✓✓    null vs undefined ✓✓        │
│  判断数组方法 ✓              == vs === ✓✓               │
│  0.1 + 0.2 问题 ✓✓          隐式类型转换 ✓✓             │
│  Object.is() ✓              包装类型 ✓                  │
│  假值列表 ✓✓                 类型转换规则 ✓✓             │
└─────────────────────────────────────────────────────────┘
✓ 常考  ✓✓ 高频重点
```
:::
