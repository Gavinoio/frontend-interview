# Babel 详解

## 什么是 Babel？

Babel 是一个 JavaScript 编译器，主要用于将 ES6+ 代码转换为向后兼容的 JavaScript 代码。

### Babel 的作用

```javascript
// 1. 语法转换 - 将新语法转换为旧语法
// ES6+
const fn = (a, b) => a + b
class Person {}
const { name, ...rest } = obj

// 转换为 ES5
var fn = function(a, b) { return a + b }
function Person() {}
var name = obj.name
var rest = _objectWithoutProperties(obj, ['name'])

// 2. Polyfill - 为旧环境提供新 API
// 使用 Promise, Symbol, Map, Set 等

// 3. 源码转换 - JSX, TypeScript, Flow 等
// JSX
const element = <div className="app">Hello</div>
// 转换为
const element = React.createElement('div', { className: 'app' }, 'Hello')
```

### 为什么需要 Babel？

```javascript
// 1. 浏览器兼容性
//    不同浏览器对 ES 新特性支持程度不同
//    - Chrome 最新版支持大部分 ES2023
//    - IE11 只支持 ES5
//    - Safari 对部分特性支持较晚

// 2. 使用最新语法
//    开发时使用最新语法提高效率
//    - 箭头函数、解构、展开运算符
//    - async/await
//    - 可选链、空值合并
//    - 类字段、私有属性

// 3. 框架支持
//    - React JSX 语法
//    - Vue 单文件组件
//    - TypeScript 编译

// 4. 开发工具
//    - 代码压缩、优化
//    - 移除开发代码 (console.log)
//    - 自定义语法转换
```

### Babel 版本演进

```javascript
// Babel 5 (2015)
// - 单一包 babel

// Babel 6 (2015)
// - 模块化拆分
// - 引入 preset 概念
// - 核心包: babel-core, babel-cli

// Babel 7 (2018)
// - 使用 @babel 命名空间
// - 废弃 stage-x presets
// - 引入 babel.config.js
// - 核心包: @babel/core, @babel/cli

// Babel 7.4+ (2019)
// - core-js@3 支持
// - 废弃 @babel/polyfill

// Babel 7.22+ (2023)
// - 装饰器提案更新
// - 支持更多 ES2023 特性
```

## 核心概念

### 编译流程

```
源代码 → 解析(Parse) → AST → 转换(Transform) → AST → 生成(Generate) → 目标代码
```

```javascript
// 输入 (ES6+)
const fn = (a, b) => a + b;

// 输出 (ES5)
var fn = function(a, b) {
  return a + b;
};
```

### 编译流程详解

```javascript
// ==================== 1. 解析阶段 (Parse) ====================
// 将源代码转换为 AST（抽象语法树）

// 1.1 词法分析 (Lexical Analysis)
// 将代码字符串分解为 Token 序列

const code = 'const a = 1 + 2'
// Token 序列:
// [
//   { type: 'Keyword', value: 'const' },
//   { type: 'Identifier', value: 'a' },
//   { type: 'Punctuator', value: '=' },
//   { type: 'Numeric', value: '1' },
//   { type: 'Punctuator', value: '+' },
//   { type: 'Numeric', value: '2' }
// ]

// 1.2 语法分析 (Syntactic Analysis)
// 将 Token 序列转换为 AST

// const a = 1 的 AST 结构:
const ast = {
  type: 'Program',
  body: [{
    type: 'VariableDeclaration',
    kind: 'const',
    declarations: [{
      type: 'VariableDeclarator',
      id: { type: 'Identifier', name: 'a' },
      init: {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'NumericLiteral', value: 1 },
        right: { type: 'NumericLiteral', value: 2 }
      }
    }]
  }]
}

// ==================== 2. 转换阶段 (Transform) ====================
// 遍历 AST，通过插件进行转换

// 访问者模式 (Visitor Pattern)
const visitor = {
  // 进入节点时调用
  VariableDeclaration: {
    enter(path) {
      // const -> var
      if (path.node.kind === 'const') {
        path.node.kind = 'var'
      }
    },
    exit(path) {
      // 离开节点时调用
    }
  },
  // 简写形式（只有 enter）
  ArrowFunctionExpression(path) {
    // 箭头函数转换逻辑
  }
}

// ==================== 3. 生成阶段 (Generate) ====================
// 将转换后的 AST 生成目标代码

const generate = require('@babel/generator').default
const output = generate(ast, {
  retainLines: false,    // 是否保持行号
  compact: false,        // 是否压缩
  concise: false,        // 是否简洁输出
  comments: true,        // 是否保留注释
  minified: false,       // 是否最小化
  sourceMaps: true       // 是否生成 source map
}, code)

// output = { code: 'var a = 1 + 2;', map: {...} }
```

### AST 节点类型

```javascript
// 常见的 AST 节点类型

// 1. 字面量 (Literals)
// NumericLiteral: 1, 2.5
// StringLiteral: 'hello', "world"
// BooleanLiteral: true, false
// NullLiteral: null
// RegExpLiteral: /abc/g
// TemplateLiteral: `hello ${name}`

// 2. 标识符 (Identifier)
// Identifier: a, foo, myVar

// 3. 语句 (Statements)
// ExpressionStatement: a + b;
// BlockStatement: { ... }
// ReturnStatement: return x;
// IfStatement: if (condition) { ... }
// ForStatement: for (;;) { ... }
// WhileStatement: while (condition) { ... }
// SwitchStatement: switch (x) { ... }
// TryStatement: try { ... } catch { ... }

// 4. 声明 (Declarations)
// VariableDeclaration: const a = 1
// FunctionDeclaration: function foo() {}
// ClassDeclaration: class Foo {}

// 5. 表达式 (Expressions)
// BinaryExpression: a + b
// UnaryExpression: !a, -b
// CallExpression: foo()
// MemberExpression: obj.prop, obj['prop']
// ArrowFunctionExpression: () => {}
// AssignmentExpression: a = 1
// ConditionalExpression: a ? b : c
// LogicalExpression: a && b, a || b
// ObjectExpression: { a: 1 }
// ArrayExpression: [1, 2, 3]
// NewExpression: new Foo()
// ThisExpression: this
// SpreadElement: ...args

// 6. 模式 (Patterns)
// ObjectPattern: const { a, b } = obj
// ArrayPattern: const [a, b] = arr
// RestElement: function foo(...args)

// 查看 AST: https://astexplorer.net/
```

### 核心包

```javascript
// @babel/core - 核心编译功能
const babel = require('@babel/core');
const result = babel.transformSync(code, options);

// @babel/parser - 解析器
const parser = require('@babel/parser');
const ast = parser.parse(code);

// @babel/traverse - AST 遍历
const traverse = require('@babel/traverse').default;
traverse(ast, visitor);

// @babel/generator - 代码生成
const generate = require('@babel/generator').default;
const output = generate(ast);

// @babel/types - AST 节点工具
const t = require('@babel/types');
t.identifier('name');
```

### @babel/core 详解

```javascript
const babel = require('@babel/core')

// ==================== 同步 API ====================

// transformSync - 转换代码字符串
const result = babel.transformSync(code, {
  presets: ['@babel/preset-env'],
  plugins: ['@babel/plugin-transform-runtime'],
  filename: 'script.js',       // 用于报错信息
  sourceMaps: true,            // 生成 source map
  sourceFileName: 'script.js', // source map 中的文件名
  comments: true,              // 保留注释
  compact: false,              // 是否压缩
  minified: false,             // 是否最小化
  retainLines: false,          // 保持行号
  configFile: false,           // 是否读取 babel.config.js
  babelrc: false,              // 是否读取 .babelrc
  envName: 'production'        // 环境名称
})
// result = { code, map, ast }

// transformFileSync - 转换文件
const result = babel.transformFileSync('./src/index.js', options)

// parseSync - 只解析，不转换
const ast = babel.parseSync(code, {
  sourceType: 'module',  // 'module' | 'script' | 'unambiguous'
  plugins: ['jsx', 'typescript']
})

// ==================== 异步 API ====================

// transform - 转换代码（Promise）
const result = await babel.transformAsync(code, options)

// transformFile - 转换文件（Promise）
const result = await babel.transformFileAsync('./src/index.js', options)

// parse - 解析（Promise）
const ast = await babel.parseAsync(code, options)

// ==================== 配置加载 ====================

// loadOptions - 加载完整配置
const options = babel.loadOptionsSync({
  filename: './src/index.js'
})

// loadPartialConfig - 部分配置（用于构建工具）
const partialConfig = babel.loadPartialConfigSync({
  filename: './src/index.js'
})
```

### @babel/parser 详解

```javascript
const parser = require('@babel/parser')

// 基本用法
const ast = parser.parse(code)

// 完整配置
const ast = parser.parse(code, {
  // 源代码类型
  sourceType: 'module',  // 'module' | 'script' | 'unambiguous'

  // 是否允许 await 在顶层使用
  allowAwaitOutsideFunction: true,

  // 是否允许 return 在函数外使用
  allowReturnOutsideFunction: false,

  // 是否允许 import/export 在任何位置
  allowImportExportEverywhere: false,

  // 是否允许 super 在类外使用
  allowSuperOutsideMethod: false,

  // 启用的语法插件
  plugins: [
    // 语言扩展
    'jsx',                  // JSX 语法
    'typescript',           // TypeScript
    'flow',                 // Flow 类型

    // ES 提案
    'decorators',           // 装饰器
    'classProperties',      // 类属性
    'classPrivateProperties', // 私有属性
    'classPrivateMethods',  // 私有方法
    'classStaticBlock',     // 静态块
    'privateIn',            // #x in obj

    // 其他提案
    'topLevelAwait',        // 顶层 await
    'importMeta',           // import.meta
    'importAssertions',     // import with assertions
    'dynamicImport',        // import()
    'optionalChaining',     // ?.
    'nullishCoalescingOperator', // ??
    'bigInt',               // BigInt
    'numericSeparator',     // 1_000_000

    // 实验性提案
    'partialApplication',   // f(?, 1)
    'pipelineOperator',     // |>
    'throwExpressions',     // throw 表达式
    'doExpressions',        // do {}
    'recordAndTuple'        // #{ a: 1 }, #[1, 2]
  ],

  // 启用装饰器时的配置
  decoratorsBeforeExport: true,

  // 错误恢复模式
  errorRecovery: false,

  // 附加注释到 AST
  attachComment: true,

  // 记录 token
  tokens: false,

  // 记录位置信息
  ranges: false
})

// 解析表达式
const ast = parser.parseExpression('1 + 2')
```

### @babel/traverse 详解

```javascript
const traverse = require('@babel/traverse').default
const parser = require('@babel/parser')

const code = `
  const a = 1
  function foo(x) {
    return x + a
  }
`
const ast = parser.parse(code)

// ==================== 基本用法 ====================

traverse(ast, {
  // 访问特定类型的节点
  FunctionDeclaration(path) {
    console.log('函数名:', path.node.id.name)
  },

  // enter 和 exit
  Identifier: {
    enter(path) {
      console.log('进入 Identifier:', path.node.name)
    },
    exit(path) {
      console.log('离开 Identifier:', path.node.name)
    }
  },

  // 访问多种类型
  'FunctionDeclaration|ArrowFunctionExpression'(path) {
    console.log('函数节点')
  }
})

// ==================== Path 对象 ====================

traverse(ast, {
  FunctionDeclaration(path) {
    // 节点信息
    path.node         // 当前 AST 节点
    path.parent       // 父节点
    path.parentPath   // 父 Path
    path.key          // 在父节点中的属性名
    path.listKey      // 如果在数组中，数组的属性名
    path.container    // 包含此节点的数组或对象

    // 作用域信息
    path.scope        // 当前作用域

    // 位置信息
    path.type         // 节点类型
    path.toString()   // 节点代码

    // 节点关系
    path.get('id')              // 获取子路径
    path.get('params.0')        // 获取嵌套子路径
    path.getSibling(0)          // 获取兄弟路径
    path.getNextSibling()       // 下一个兄弟
    path.getPrevSibling()       // 上一个兄弟
    path.getAllNextSiblings()   // 所有后续兄弟
    path.getAllPrevSiblings()   // 所有前置兄弟

    // 祖先关系
    path.findParent(p => p.isFunctionDeclaration())
    path.find(p => p.isFunctionDeclaration())  // 包含自身
    path.getFunctionParent()    // 最近的函数
    path.getStatementParent()   // 最近的语句

    // 判断方法
    path.isIdentifier()
    path.isIdentifier({ name: 'foo' })
    path.isFunctionDeclaration()
    path.isReferencedIdentifier()  // 是否被引用
    path.isBindingIdentifier()     // 是否是绑定

    // 检查
    path.has('id')           // 是否有某属性
    path.is('id')            // 同 has
    path.equals('name', 'foo') // 属性值是否相等
  }
})

// ==================== Path 操作方法 ====================

traverse(ast, {
  Identifier(path) {
    // 修改节点
    path.replaceWith(t.identifier('newName'))
    path.replaceWithMultiple([node1, node2])
    path.replaceWithSourceString('console.log()')

    // 插入节点
    path.insertBefore(node)
    path.insertAfter(node)

    // 删除节点
    path.remove()

    // 跳过遍历
    path.skip()       // 跳过子节点
    path.stop()       // 停止整个遍历

    // 标记
    path.setData('key', value)
    path.getData('key')

    // 注释
    path.addComment('leading', '前置注释')
    path.addComment('trailing', '后置注释')
  }
})

// ==================== Scope 作用域 ====================

traverse(ast, {
  FunctionDeclaration(path) {
    const scope = path.scope

    // 作用域信息
    scope.path          // 作用域对应的 path
    scope.parent        // 父作用域
    scope.parentBlock   // 父块级作用域
    scope.block         // 当前块节点

    // 绑定信息
    scope.bindings      // 当前作用域的所有绑定
    scope.hasBinding('a')           // 是否有绑定
    scope.hasOwnBinding('a')        // 是否是自己的绑定
    scope.getBinding('a')           // 获取绑定
    scope.getOwnBinding('a')        // 获取自己的绑定
    scope.getBindingIdentifier('a') // 获取绑定标识符

    // 引用信息
    scope.getAllBindings()   // 所有绑定（包括父作用域）
    scope.getBinding('a').references      // 引用数量
    scope.getBinding('a').referencePaths  // 引用路径
    scope.getBinding('a').constant        // 是否常量
    scope.getBinding('a').constantViolations // 修改位置

    // 生成唯一标识符
    scope.generateUidIdentifier('temp')  // _temp, _temp2...
    scope.generateUid('temp')            // 字符串形式

    // 重命名
    scope.rename('oldName', 'newName')

    // 注册绑定
    scope.push({ id: t.identifier('a'), init: t.numericLiteral(1) })

    // 向上查找
    scope.lookup('a')  // 在作用域链中查找
  }
})
```

### @babel/types 详解

```javascript
const t = require('@babel/types')

// ==================== 创建节点 ====================

// 标识符
t.identifier('name')

// 字面量
t.numericLiteral(42)
t.stringLiteral('hello')
t.booleanLiteral(true)
t.nullLiteral()
t.regExpLiteral('abc', 'gi')

// 数组和对象
t.arrayExpression([
  t.numericLiteral(1),
  t.numericLiteral(2)
])

t.objectExpression([
  t.objectProperty(
    t.identifier('name'),
    t.stringLiteral('John')
  ),
  t.objectMethod(
    'method',
    t.identifier('greet'),
    [],
    t.blockStatement([
      t.returnStatement(t.stringLiteral('Hello'))
    ])
  )
])

// 函数
t.functionDeclaration(
  t.identifier('foo'),                    // id
  [t.identifier('a'), t.identifier('b')], // params
  t.blockStatement([                       // body
    t.returnStatement(
      t.binaryExpression('+',
        t.identifier('a'),
        t.identifier('b')
      )
    )
  ])
)

t.arrowFunctionExpression(
  [t.identifier('x')],
  t.binaryExpression('*', t.identifier('x'), t.numericLiteral(2))
)

// 调用表达式
t.callExpression(
  t.memberExpression(
    t.identifier('console'),
    t.identifier('log')
  ),
  [t.stringLiteral('Hello')]
)

// 变量声明
t.variableDeclaration('const', [
  t.variableDeclarator(
    t.identifier('a'),
    t.numericLiteral(1)
  )
])

// 类
t.classDeclaration(
  t.identifier('Person'),
  null,  // superClass
  t.classBody([
    t.classMethod(
      'constructor',
      t.identifier('constructor'),
      [t.identifier('name')],
      t.blockStatement([
        t.expressionStatement(
          t.assignmentExpression('=',
            t.memberExpression(t.thisExpression(), t.identifier('name')),
            t.identifier('name')
          )
        )
      ])
    )
  ])
)

// 模板字符串
t.templateLiteral(
  [
    t.templateElement({ raw: 'Hello, ', cooked: 'Hello, ' }, false),
    t.templateElement({ raw: '!', cooked: '!' }, true)
  ],
  [t.identifier('name')]
)

// ==================== 判断节点类型 ====================

t.isIdentifier(node)
t.isIdentifier(node, { name: 'foo' })
t.isStringLiteral(node)
t.isFunctionDeclaration(node)
t.isExpression(node)
t.isStatement(node)
t.isLiteral(node)
t.isImmutable(node)
t.isDeclaration(node)

// ==================== 断言节点类型 ====================

t.assertIdentifier(node)  // 如果不是 Identifier 抛出错误

// ==================== 节点校验 ====================

t.validate(parent, 'key', node)  // 验证节点是否有效

// ==================== 克隆节点 ====================

t.cloneNode(node)           // 浅克隆
t.cloneNode(node, true)     // 深克隆
t.cloneDeep(node)           // 深克隆（别名）

// ==================== 工具方法 ====================

// 判断引用
t.isReferenced(node, parent)  // 节点是否被引用
t.isBinding(node, parent)     // 节点是否是绑定

// 判断作用域
t.isScope(node, parent)       // 是否创建新作用域
t.isBlockScoped(node)         // 是否块级作用域 (const, let, class)
t.isVar(node)                 // 是否 var 声明

// 比较节点
t.shallowEqual(node1, node2)  // 浅比较
t.nodesAreEquivalent(node1, node2)  // 深比较

// 添加注释
t.addComment(node, 'leading', '注释内容')
t.addComment(node, 'trailing', '注释内容')
t.addComments(node, 'leading', [comment1, comment2])

// 移除属性
t.removeProperties(node)      // 移除 extra 属性
t.removePropertiesDeep(node)  // 深度移除
```

### @babel/template 详解

```javascript
const template = require('@babel/template').default
const t = require('@babel/types')

// ==================== 基本用法 ====================

// 创建模板
const buildRequire = template(`
  const IMPORT_NAME = require(SOURCE)
`)

// 使用模板（返回 AST 节点）
const ast = buildRequire({
  IMPORT_NAME: t.identifier('myModule'),
  SOURCE: t.stringLiteral('./my-module')
})

// ==================== 模板配置 ====================

const build = template(`
  function NAME(PARAMS) {
    BODY
  }
`, {
  // 占位符前缀
  placeholderPattern: /^[A-Z0-9_]+$/,

  // 保留注释
  preserveComments: false,

  // 语法插件
  plugins: ['jsx', 'typescript']
})

// ==================== 快捷方法 ====================

// expression - 返回表达式
const expr = template.expression(`OBJECT.METHOD(ARGS)`)({
  OBJECT: t.identifier('console'),
  METHOD: t.identifier('log'),
  ARGS: t.stringLiteral('hello')
})

// statement - 返回语句
const stmt = template.statement(`return RESULT`)({
  RESULT: t.identifier('value')
})

// statements - 返回语句数组
const stmts = template.statements(`
  const a = 1;
  const b = 2;
`)()

// program - 返回完整 Program
const program = template.program(`
  import foo from 'foo';
  export default foo;
`)()

// ==================== 字面量值 ====================

// 使用 %%VALUE%% 语法替换为字面量
const buildLog = template(`console.log(%%MESSAGE%%)`)

const ast = buildLog({
  MESSAGE: 'Hello'  // 直接使用字符串，会自动转为 StringLiteral
})

// 等价于
buildLog({
  MESSAGE: t.stringLiteral('Hello')
})

// ==================== 实际应用示例 ====================

// 1. 包装函数
const wrapFunction = template(`
  (function() {
    BODY
  })()
`)

// 2. 导入语句
const buildImport = template(`
  import { IMPORTED as LOCAL } from SOURCE
`)

// 3. 类方法
const buildMethod = template(`
  class CLASS {
    METHOD(PARAMS) {
      BODY
    }
  }
`)

// 4. try-catch
const buildTryCatch = template(`
  try {
    BODY
  } catch (ERROR) {
    HANDLER
  }
`)

// 5. React 组件
const buildComponent = template(`
  function COMPONENT_NAME(props) {
    return RENDER_BODY
  }
`)
```

## 配置详解

### 配置文件类型

```javascript
// ==================== 配置文件对比 ====================

// 1. babel.config.js / babel.config.json
//    - 项目级配置（Project-wide）
//    - 适用于整个项目，包括 node_modules
//    - Babel 7 引入
//    - 支持编程式配置

// 2. .babelrc / .babelrc.json / .babelrc.js
//    - 文件相对配置（File-relative）
//    - 只作用于所在目录及子目录
//    - 不会作用于 node_modules
//    - 向上查找直到找到 package.json

// 3. package.json 中的 "babel" 字段
//    - 等同于 .babelrc.json

// ==================== 选择建议 ====================

// 单体应用（Monorepo）
// → 使用 babel.config.js

// 发布的库
// → 使用 .babelrc

// 需要动态配置
// → 使用 .js 格式
```

### babel.config.js 完整配置

```javascript
// babel.config.js
module.exports = function(api) {
  // 缓存配置（提高性能）
  api.cache(true)
  // 或者基于环境
  api.cache.using(() => process.env.NODE_ENV)

  const presets = [
    ['@babel/preset-env', {
      targets: {
        browsers: ['> 1%', 'last 2 versions']
      },
      useBuiltIns: 'usage',
      corejs: 3
    }],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ]

  const plugins = [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-optional-chaining'
  ]

  return {
    presets,
    plugins
  }
}

// ==================== 完整配置选项 ====================

module.exports = {
  // ========== 预设和插件 ==========
  presets: [
    // 字符串形式
    '@babel/preset-env',
    // 带配置的数组形式
    ['@babel/preset-env', { targets: '> 1%' }]
  ],

  plugins: [
    // 同上
    '@babel/plugin-transform-runtime',
    ['@babel/plugin-transform-runtime', { corejs: 3 }]
  ],

  // ========== 文件匹配 ==========

  // 只处理这些文件
  only: [
    'src/**/*.js',
    /\.mjs$/
  ],

  // 忽略这些文件
  ignore: [
    'node_modules/**',
    '**/*.test.js'
  ],

  // 包含这些文件（更精确的匹配）
  include: [],

  // 排除这些文件
  exclude: [],

  // ========== 输出控制 ==========

  // 生成 source map
  sourceMaps: true,  // true | false | 'inline' | 'both'

  // source map 中的源文件路径
  sourceRoot: '',

  // source map 文件名
  sourceFileName: '',

  // 是否保留注释
  comments: true,

  // 是否压缩输出
  compact: 'auto',  // true | false | 'auto'

  // 是否最小化（移除空白）
  minified: false,

  // 保持源码行号
  retainLines: false,

  // ========== 解析选项 ==========

  // 源代码类型
  sourceType: 'module',  // 'module' | 'script' | 'unambiguous'

  // 解析器插件
  parserOpts: {
    plugins: ['jsx', 'typescript']
  },

  // 生成器选项
  generatorOpts: {
    jsescOption: {
      minimal: true
    }
  },

  // ========== 环境配置 ==========

  // 基于环境的配置
  env: {
    development: {
      plugins: ['react-refresh/babel']
    },
    production: {
      plugins: ['transform-remove-console']
    },
    test: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }]
      ]
    }
  },

  // ========== 条件配置 ==========

  // 基于文件路径的配置
  overrides: [
    {
      test: /\.tsx?$/,
      presets: ['@babel/preset-typescript']
    },
    {
      test: /\.jsx?$/,
      presets: ['@babel/preset-react']
    },
    {
      include: './legacy',
      presets: [
        ['@babel/preset-env', { targets: 'ie 11' }]
      ]
    }
  ],

  // ========== 配置继承 ==========

  // 继承其他配置文件
  extends: './base.babel.config.js',

  // 是否查找 .babelrc
  babelrc: true,

  // .babelrc 查找根目录
  babelrcRoots: ['.', 'packages/*'],

  // 是否使用 babel.config.js
  configFile: true,

  // ========== 其他选项 ==========

  // 高亮代码错误
  highlightCode: true,

  // 包装输出
  wrapPluginVisitorMethod: null,

  // 文件名（用于错误消息）
  filename: undefined,

  // 当前工作目录
  cwd: process.cwd(),

  // 根目录
  root: process.cwd(),

  // 环境名称
  envName: process.env.BABEL_ENV || process.env.NODE_ENV || 'development',

  // 假设已有的文件内容
  assumptions: {
    arrayLikeIsIterable: true,
    constantReexports: true,
    constantSuper: true,
    enumerableModuleMeta: true,
    ignoreFunctionLength: true,
    ignoreToPrimitiveHint: true,
    iterableIsArray: true,
    mutableTemplateObject: true,
    noClassCalls: true,
    noDocumentAll: true,
    noNewArrows: true,
    objectRestNoSymbols: true,
    privateFieldsAsProperties: true,
    pureGetters: true,
    setClassMethods: true,
    setComputedProperties: true,
    setPublicClassFields: true,
    setSpreadProperties: true,
    skipForOfIteratorClosing: true,
    superIsCallableConstructor: true
  }
}
```

### 配置继承与覆盖

```javascript
// base.babel.config.js
module.exports = {
  presets: ['@babel/preset-env'],
  plugins: ['@babel/plugin-transform-runtime']
}

// babel.config.js
module.exports = {
  extends: './base.babel.config.js',

  // 添加额外配置
  presets: [
    '@babel/preset-react'  // 与继承的合并
  ],

  // 覆盖特定文件
  overrides: [
    {
      test: './src/legacy/**',
      presets: [
        ['@babel/preset-env', {
          targets: { ie: 11 }
        }]
      ]
    }
  ]
}
```

### Preset vs Plugin

```javascript
// ==================== 基本概念 ====================

// Plugin: 单个功能转换
// 例如: @babel/plugin-transform-arrow-functions
// 只转换箭头函数这一种语法

// Preset: 一组 Plugin 的集合
// 例如: @babel/preset-env 包含所有 ES6+ 转换
// 包含几十个 plugin，一次性配置

// ==================== 执行顺序 ====================

// 1. Plugins 先于 Presets 执行
// 2. Plugins 从前往后执行
// 3. Presets 从后往前执行

// 示例
module.exports = {
  plugins: [
    'pluginA',  // 第1个执行
    'pluginB',  // 第2个执行
    'pluginC'   // 第3个执行
  ],
  presets: [
    'presetA',  // 第3个执行（最后）
    'presetB',  // 第2个执行
    'presetC'   // 第1个执行（最先）
  ]
}

// 完整执行顺序:
// pluginA → pluginB → pluginC → presetC → presetB → presetA

// ==================== 常用 Presets ====================

// 1. @babel/preset-env
//    - ES6+ 语法转换
//    - 智能 polyfill

// 2. @babel/preset-react
//    - JSX 语法转换
//    - React 开发模式优化

// 3. @babel/preset-typescript
//    - TypeScript 语法转换
//    - 不做类型检查

// 4. @babel/preset-flow
//    - Flow 类型注解移除

// ==================== 常用 Plugins ====================

// 语法转换
// @babel/plugin-transform-arrow-functions     - 箭头函数
// @babel/plugin-transform-classes             - 类
// @babel/plugin-transform-destructuring       - 解构
// @babel/plugin-transform-spread              - 展开运算符
// @babel/plugin-transform-parameters          - 默认参数、剩余参数
// @babel/plugin-transform-template-literals   - 模板字符串
// @babel/plugin-transform-for-of              - for-of 循环
// @babel/plugin-transform-async-to-generator  - async/await

// 提案语法（Stage 3+）
// @babel/plugin-transform-class-properties       - 类属性
// @babel/plugin-transform-private-methods        - 私有方法
// @babel/plugin-transform-optional-chaining      - 可选链 ?.
// @babel/plugin-transform-nullish-coalescing-operator - 空值合并 ??
// @babel/plugin-transform-logical-assignment-operators - 逻辑赋值

// 运行时
// @babel/plugin-transform-runtime  - 辅助函数共享

// 优化
// @babel/plugin-transform-react-constant-elements  - React 常量元素提升
// babel-plugin-transform-remove-console            - 移除 console

// ==================== 自定义 Preset ====================

// my-preset.js
module.exports = function(api, options) {
  // 可以读取 options
  const { loose = false, modules = 'auto' } = options

  return {
    presets: [
      ['@babel/preset-env', { loose, modules }]
    ],
    plugins: [
      '@babel/plugin-transform-runtime',
      loose && 'some-loose-plugin'
    ].filter(Boolean)
  }
}

// 使用
module.exports = {
  presets: [
    ['./my-preset.js', { loose: true }]
  ]
}
```

## @babel/preset-env

```javascript
// 智能预设，根据目标环境按需转换

module.exports = {
  presets: [
    ['@babel/preset-env', {
      // 目标环境
      targets: {
        chrome: '60',
        ie: '11'
      },

      // Polyfill 策略
      // 'usage': 按需引入
      // 'entry': 入口全部引入
      // false: 不引入
      useBuiltIns: 'usage',

      // core-js 版本
      corejs: 3,

      // 是否转换模块语法
      modules: false,  // 保留 ESM，利于 tree-shaking

      // 调试输出
      debug: true
    }]
  ]
};
```

### targets 配置详解

```javascript
// ==================== targets 配置方式 ====================

// 1. 对象形式 - 指定具体浏览器版本
targets: {
  chrome: '58',
  firefox: '60',
  safari: '11',
  edge: '16',
  ie: '11',
  ios: '10',
  android: '4.4',
  node: '10',
  electron: '1.8'
}

// 2. 字符串形式 - browserslist 查询语法
targets: '> 1%, last 2 versions, not dead'

// 3. 使用 .browserslistrc 文件（推荐）
// 不设置 targets 时，自动读取 .browserslistrc 或 package.json 的 browserslist

// 4. 指定 ESModules 支持
targets: { esmodules: true }  // 只针对支持 ES modules 的浏览器

// ==================== browserslist 查询语法 ====================

// 市场份额
'> 1%'           // 全球份额 > 1%
'> 1% in CN'     // 中国份额 > 1%
'> 1% in alt-AS' // 亚洲份额 > 1%

// 版本选择
'last 2 versions'      // 每个浏览器最近 2 个版本
'last 2 Chrome versions' // Chrome 最近 2 个版本
'Firefox ESR'          // Firefox 扩展支持版本
'unreleased versions'  // alpha/beta 版本

// 特定版本
'Chrome >= 60'
'iOS >= 10'
'node >= 10'
'not IE 11'            // 排除 IE 11

// 时间范围
'since 2020'           // 2020 年后发布的版本
'last 2 years'         // 最近 2 年的版本

// 特殊查询
'defaults'             // > 0.5%, last 2 versions, Firefox ESR, not dead
'dead'                 // 已停止维护的浏览器
'not dead'             // 仍在维护的浏览器
'supports es6-module'  // 支持特定特性的浏览器
'maintained node versions' // 维护中的 Node 版本

// 组合查询
'> 1%, last 2 versions, not dead, not IE 11'
'> 1% and last 2 versions'  // 交集
'> 1%, last 2 versions'     // 并集
'> 1% or last 2 versions'   // 并集（同上）
'not > 1%'                  // 取反

// ==================== .browserslistrc 文件 ====================

// .browserslistrc
// 默认环境
> 1%
last 2 versions
not dead

// 生产环境
[production]
> 0.5%
not dead
not op_mini all

// 开发环境
[development]
last 1 chrome version
last 1 firefox version

// 现代浏览器
[modern]
last 2 Chrome versions
last 2 Firefox versions
last 2 Safari versions
last 2 Edge versions

// 旧版浏览器
[legacy]
> 0.5%
IE 11

// ==================== package.json 配置 ====================

// package.json
{
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead"
  ],
  // 或者按环境
  "browserslist": {
    "production": ["> 0.5%", "not dead"],
    "development": ["last 1 chrome version"]
  }
}

// ==================== 查看目标浏览器 ====================

// 命令行查看
// npx browserslist "> 1%, last 2 versions"

// 代码中查看
const browserslist = require('browserslist')
console.log(browserslist('> 1%'))
// ['chrome 96', 'edge 96', 'firefox 95', ...]
```

### useBuiltIns 详解

```javascript
// ==================== useBuiltIns: false ====================
// 不自动引入 polyfill，需要手动全量引入

// 入口文件
import 'core-js'  // 全量引入，体积很大

// 配置
{
  presets: [['@babel/preset-env', {
    useBuiltIns: false
  }]]
}

// ==================== useBuiltIns: 'entry' ====================
// 在入口处替换为目标环境需要的 polyfill

// 入口文件（转换前）
import 'core-js/stable'
import 'regenerator-runtime/runtime'

// 入口文件（转换后，假设 targets: { ie: 11 }）
import 'core-js/modules/es.array.includes'
import 'core-js/modules/es.array.flat'
import 'core-js/modules/es.object.values'
import 'core-js/modules/es.promise'
// ... 根据目标环境引入需要的所有 polyfill

// 配置
{
  presets: [['@babel/preset-env', {
    useBuiltIns: 'entry',
    corejs: 3
  }]]
}

// 优点：
// - 确保所有 polyfill 都被引入
// - 不会遗漏

// 缺点：
// - 可能引入未使用的 polyfill
// - 体积相对较大

// ==================== useBuiltIns: 'usage' ====================
// 按需引入，只引入代码中实际使用的 polyfill（推荐）

// 源代码
const a = [1, 2, 3].includes(1)
const b = Promise.resolve()
const c = Object.values({ a: 1 })

// 转换后
import 'core-js/modules/es.array.includes'
import 'core-js/modules/es.promise'
import 'core-js/modules/es.object.values'

const a = [1, 2, 3].includes(1)
const b = Promise.resolve()
const c = Object.values({ a: 1 })

// 配置
{
  presets: [['@babel/preset-env', {
    useBuiltIns: 'usage',
    corejs: 3
  }]]
}

// 优点：
// - 最小化 polyfill 体积
// - 自动分析代码

// 缺点：
// - 可能遗漏动态使用的 API
// - 第三方库的 polyfill 可能不被分析

// ==================== corejs 版本配置 ====================

// core-js 2（旧版，不推荐）
{
  useBuiltIns: 'usage',
  corejs: 2
}

// core-js 3（推荐）
{
  useBuiltIns: 'usage',
  corejs: 3
}

// core-js 3 带提案特性
{
  useBuiltIns: 'usage',
  corejs: {
    version: 3,
    proposals: true  // 包含提案阶段的 API
  }
}

// ==================== 全局污染问题 ====================

// useBuiltIns 会全局引入 polyfill
// 这意味着会修改全局对象，如 Array.prototype, Promise 等

// 源代码
[1, 2, 3].includes(1)

// 转换后（全局污染）
import 'core-js/modules/es.array.includes'
[1, 2, 3].includes(1)

// Array.prototype.includes 被修改
// 这在开发应用时通常没问题
// 但在开发库时可能造成冲突

// 解决方案：使用 @babel/plugin-transform-runtime
```

### modules 配置

```javascript
// ==================== modules 选项 ====================

// modules: 'auto'（默认）
// 根据 caller 自动判断，通常 webpack/rollup 会设置为 false

// modules: false
// 保留 ES modules 语法，利于 tree-shaking（推荐）
import { foo } from './utils'
export const bar = foo

// modules: 'commonjs'
// 转换为 CommonJS
const { foo } = require('./utils')
exports.bar = foo

// modules: 'amd'
// 转换为 AMD
define(['exports', './utils'], function(exports, utils) {
  exports.bar = utils.foo
})

// modules: 'umd'
// 转换为 UMD（通用模块定义）

// modules: 'systemjs'
// 转换为 SystemJS

// ==================== 为什么推荐 false ====================

// 1. Tree-shaking
// ES modules 是静态的，可以在编译时分析依赖
// CommonJS 是动态的，无法进行静态分析

// 2. 打包工具支持
// Webpack/Rollup 等工具已经支持 ES modules
// 让打包工具处理模块转换更高效

// 3. 代码分割
// ES modules 支持动态 import()
// 有利于代码分割和懒加载

// 推荐配置
{
  presets: [['@babel/preset-env', {
    modules: false  // 保留 ESM
  }]]
}

// 测试环境可能需要 CommonJS
{
  presets: [['@babel/preset-env', {
    modules: process.env.NODE_ENV === 'test' ? 'commonjs' : false
  }]]
}
```

### 其他配置选项

```javascript
{
  presets: [['@babel/preset-env', {
    // ========== 转换控制 ==========

    // 松散模式（生成更简洁但不完全符合规范的代码）
    loose: false,

    // 使用更简洁的代码生成（Babel 7.9+）
    bugfixes: true,

    // 排除特定转换插件
    exclude: [
      '@babel/plugin-transform-regenerator',
      '@babel/plugin-transform-typeof-symbol'
    ],

    // 只包含特定转换插件
    include: [
      '@babel/plugin-transform-spread'
    ],

    // 强制所有转换（忽略 targets）
    forceAllTransforms: false,

    // ========== 规范相关 ==========

    // 规范模式（生成完全符合规范的代码）
    spec: false,

    // 使用 Babel 7.4+ 的新 class 处理方式
    shippedProposals: true,

    // ========== 调试 ==========

    // 输出使用的插件信息
    debug: false,

    // ========== browserslist ==========

    // 忽略 browserslist 配置
    ignoreBrowserslistConfig: false,

    // browserslist 配置文件路径
    configPath: '.'
  }]]
}

// ==================== 实际配置示例 ====================

// 现代浏览器配置
{
  presets: [['@babel/preset-env', {
    targets: { esmodules: true },
    bugfixes: true,
    modules: false
  }]]
}

// 兼容旧浏览器配置
{
  presets: [['@babel/preset-env', {
    targets: '> 0.5%, not dead, IE 11',
    useBuiltIns: 'usage',
    corejs: 3,
    modules: false
  }]]
}

// 库开发配置
{
  presets: [['@babel/preset-env', {
    modules: false,
    useBuiltIns: false  // 不包含 polyfill，让用户决定
  }]],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      corejs: 3
    }]
  ]
}

// Node.js 配置
{
  presets: [['@babel/preset-env', {
    targets: { node: 'current' }
  }]]
}
```

## @babel/runtime 与 transform-runtime

### 问题：辅助代码重复

```javascript
// Babel 转换时会注入辅助代码（helper）

// 源代码
class Person {
  constructor(name) {
    this.name = name
  }
}

// 转换后（每个文件都会注入）
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function")
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i]
    // ...
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  // ...
}

var Person = function Person(name) {
  _classCallCheck(this, Person)
  this.name = name
}

// 问题：
// 1. 每个文件都注入相���的辅助代码
// 2. 如果有 100 个文件使用 class，就会有 100 份重复代码
// 3. 大大增加打包体积
```

### 解决方案：@babel/runtime

```javascript
// @babel/runtime 提供了所有辅助函数的实现
// @babel/plugin-transform-runtime 将内联的辅助代码替换为 import

// 安装
// npm install @babel/runtime
// npm install -D @babel/plugin-transform-runtime

// 配置
{
  plugins: [
    ['@babel/plugin-transform-runtime', {
      helpers: true,      // 使用 runtime 中的 helpers
      regenerator: true,  // 使用 runtime 中的 regenerator
      corejs: false       // 不使用 runtime 中的 corejs
    }]
  ]
}

// 转换后
import _classCallCheck from '@babel/runtime/helpers/classCallCheck'
import _createClass from '@babel/runtime/helpers/createClass'

var Person = function Person(name) {
  _classCallCheck(this, Person)
  this.name = name
}

// 所有文件共享同一份辅助代码
```

### transform-runtime 完整配置

```javascript
// babel.config.js
module.exports = {
  presets: ['@babel/preset-env'],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      // ==================== helpers ====================
      // 是否使用 runtime 中的辅助函数
      // 默认: true
      helpers: true,

      // ==================== regenerator ====================
      // 是否使用 runtime 中的 regenerator
      // 用于 async/await 和 generator
      // 默认: true
      regenerator: true,

      // ==================== corejs ====================
      // 是否使用 runtime 中的 core-js polyfill
      // false: 不使用（默认）
      // 2: 使用 @babel/runtime-corejs2
      // 3: 使用 @babel/runtime-corejs3（推荐）
      corejs: 3,

      // ==================== version ====================
      // 指定 @babel/runtime 版本
      // 用于优化生成的代码
      version: '^7.20.0',

      // ==================== absoluteRuntime ====================
      // 是否使用绝对路径引用 runtime
      // 在 monorepo 中可能需要设置为 true
      // 默认: false
      absoluteRuntime: false,

      // ==================== useESModules ====================
      // 是否使用 ESM 版本的 helpers
      // 'auto': 自动判断（默认）
      // true: 使用 ESM
      // false: 使用 CJS
      // 已废弃，使用 babel 的 caller.supportsStaticESM
      useESModules: 'auto'
    }]
  ]
}
```

### corejs: 3 的作用

```javascript
// 当 corejs: 3 时，polyfill 不会污染全局

// 源代码
const promise = Promise.resolve()
const includes = [1, 2, 3].includes(1)

// ==================== useBuiltIns: 'usage' 的转换 ====================
// 全局污染方式
import 'core-js/modules/es.promise'
import 'core-js/modules/es.array.includes'

const promise = Promise.resolve()
const includes = [1, 2, 3].includes(1)
// Promise 和 Array.prototype.includes 被修改

// ==================== transform-runtime corejs: 3 的转换 ====================
// 沙盒化，不污染全局
import _Promise from '@babel/runtime-corejs3/core-js-stable/promise'
import _includesInstanceProperty from '@babel/runtime-corejs3/core-js-stable/instance/includes'

var _context
const promise = _Promise.resolve()
const includes = _includesInstanceProperty(_context = [1, 2, 3]).call(_context, 1)
// 全局 Promise 和 Array.prototype 不受影响

// ==================== 使用场景 ====================

// 开发应用
// → useBuiltIns: 'usage'（全局 polyfill 可接受）

// 开发库/组件
// → transform-runtime + corejs: 3（避免污染用户环境）
```

### @babel/runtime 系列包

```javascript
// ==================== 包的区别 ====================

// 1. @babel/runtime
//    - 只包含 helpers 和 regenerator
//    - 不包含 polyfill
//    - 配合 corejs: false

// 2. @babel/runtime-corejs2
//    - 包含 helpers、regenerator 和 core-js@2 的 polyfill
//    - 配合 corejs: 2

// 3. @babel/runtime-corejs3
//    - 包含 helpers、regenerator 和 core-js@3 的 polyfill
//    - 配合 corejs: 3
//    - 推荐使用

// ==================== 安装 ====================

// 仅辅助函数（无 polyfill）
npm install @babel/runtime

// 包含 polyfill（推荐）
npm install @babel/runtime-corejs3

// ==================== 依赖类型 ====================

// @babel/runtime[-corejs3] → dependencies（运行时需要）
// @babel/plugin-transform-runtime → devDependencies（编译时需要）

// package.json
{
  "dependencies": {
    "@babel/runtime-corejs3": "^7.20.0"
  },
  "devDependencies": {
    "@babel/plugin-transform-runtime": "^7.20.0"
  }
}
```

### preset-env vs transform-runtime

```javascript
// ==================== 对比 ====================

// @babel/preset-env + useBuiltIns
// - 全局 polyfill
// - 修改 Promise, Array.prototype 等
// - 适合开发应用
// - 一次引入，全局可用

// @babel/plugin-transform-runtime + corejs
// - 沙盒化 polyfill
// - 不修改全局对象
// - 适合开发库
// - 每次使用都是独立引用

// ==================== 推荐配置 ====================

// 应用开发
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: '> 0.5%, not dead',
      useBuiltIns: 'usage',
      corejs: 3,
      modules: false
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      helpers: true,       // 辅助函数去重
      regenerator: false,  // 让 preset-env 处理
      corejs: false        // 让 preset-env 处理
    }]
  ]
}

// 库开发
module.exports = {
  presets: [
    ['@babel/preset-env', {
      modules: false,
      useBuiltIns: false  // 不在库中引入 polyfill
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      helpers: true,
      regenerator: true,
      corejs: 3  // 沙盒化 polyfill
    }]
  ]
}
```

## 编写 Babel 插件

### 插件基本结构

```javascript
// 基础结构
module.exports = function(babel) {
  // babel 对象包含:
  // - types (t): AST 节点工具
  // - template: 代码模板
  // - traverse: AST 遍历
  // - parse: 代码解析
  const { types: t, template } = babel

  return {
    // 插件名称（用于调试）
    name: 'my-plugin',

    // 预处理
    pre(state) {
      // 在遍历开始前执行
      this.cache = new Map()
    },

    // 访问者对象
    visitor: {
      // 访问特定类型的节点
      Identifier(path, state) {
        // path: 当前节点的路径对象
        // state: 插件状态，包含 opts（用户传入的选项）
      }
    },

    // 后处理
    post(state) {
      // 在遍历结束后执行
      console.log('Cache size:', this.cache.size)
    }
  }
}

// 使用箭头函数
module.exports = ({ types: t }) => ({
  name: 'my-plugin',
  visitor: {
    // ...
  }
})
```

### 插件示例：移除 console

```javascript
// babel-plugin-remove-console.js
module.exports = function(babel) {
  const { types: t } = babel

  return {
    name: 'remove-console',
    visitor: {
      CallExpression(path, state) {
        const { callee } = path.node
        // 获取用户配置
        const { exclude = [] } = state.opts

        // 检查是否是 console.xxx() 调用
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.object, { name: 'console' })
        ) {
          const method = callee.property.name

          // 排除某些方法
          if (!exclude.includes(method)) {
            path.remove()
          }
        }
      }
    }
  }
}

// 使用
// babel.config.js
module.exports = {
  plugins: [
    ['./babel-plugin-remove-console.js', {
      exclude: ['error', 'warn']  // 保留 console.error 和 console.warn
    }]
  ]
}
```

### 插件示例：自动注入代码

```javascript
// babel-plugin-auto-import.js
// 自动在使用 lodash 方法时引入对应模块

module.exports = function({ types: t }) {
  return {
    name: 'auto-import-lodash',
    visitor: {
      Program: {
        enter(path, state) {
          // 记录使用的 lodash 方法
          state.usedMethods = new Set()
        },
        exit(path, state) {
          // 在 Program 退出时添加 import
          const imports = []

          state.usedMethods.forEach(method => {
            imports.push(
              t.importDeclaration(
                [t.importDefaultSpecifier(t.identifier(`_${method}`))],
                t.stringLiteral(`lodash/${method}`)
              )
            )
          })

          // 在文件开头插入 import
          path.unshiftContainer('body', imports)
        }
      },

      CallExpression(path, state) {
        const { callee } = path.node

        // 检查 _.method() 形式
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.object, { name: '_' })
        ) {
          const method = callee.property.name
          state.usedMethods.add(method)

          // 替换 _.method 为 _method
          path.get('callee').replaceWith(
            t.identifier(`_${method}`)
          )
        }
      }
    }
  }
}

// 转换示例：
// 输入
// const result = _.map([1, 2], x => x * 2)

// 输出
// import _map from 'lodash/map'
// const result = _map([1, 2], x => x * 2)
```

### 插件示例：代码转换

```javascript
// babel-plugin-optional-chaining-manual.js
// 简化版可选链转换（展示原理）

module.exports = function({ types: t, template }) {
  return {
    name: 'optional-chaining-transform',
    visitor: {
      OptionalMemberExpression(path) {
        // a?.b 转换为 a == null ? undefined : a.b

        const { object, property, computed } = path.node

        // 生成唯一变量名
        const ref = path.scope.generateUidIdentifier('ref')

        // 构建替换表达式
        const replacement = t.conditionalExpression(
          // 条件: ref == null
          t.binaryExpression(
            '==',
            t.assignmentExpression('=', ref, object),
            t.nullLiteral()
          ),
          // 为 true: undefined
          t.identifier('undefined'),
          // 为 false: ref.property
          computed
            ? t.memberExpression(ref, property, true)
            : t.memberExpression(ref, property)
        )

        // 在作用域中声明变量
        path.scope.push({ id: t.cloneNode(ref) })

        // 替换节点
        path.replaceWith(replacement)
      }
    }
  }
}

// 转换示例：
// 输入
// const name = user?.profile?.name

// 输出
// var _ref, _ref2
// const name = (_ref = user) == null
//   ? undefined
//   : (_ref2 = _ref.profile) == null
//     ? undefined
//     : _ref2.name
```

### 插件示例：使用 template

```javascript
// babel-plugin-wrap-function.js
// 用 try-catch 包装异步函数

module.exports = function({ types: t, template }) {
  // 构建代码模板
  const wrapperTemplate = template(`
    async function FUNCTION_NAME(PARAMS) {
      try {
        BODY
      } catch (error) {
        console.error('Error in ' + FUNCTION_NAME_STRING + ':', error)
        throw error
      }
    }
  `)

  return {
    name: 'wrap-async-function',
    visitor: {
      FunctionDeclaration(path, state) {
        // 只处理 async 函数
        if (!path.node.async) return

        // 避免重复处理
        if (path.node._wrapped) return

        const functionName = path.node.id.name

        // 使用模板生成新的 AST
        const wrapped = wrapperTemplate({
          FUNCTION_NAME: t.identifier(functionName),
          FUNCTION_NAME_STRING: t.stringLiteral(functionName),
          PARAMS: path.node.params,
          BODY: path.node.body.body
        })

        // 标记为已处理
        wrapped._wrapped = true

        // 替换原函数
        path.replaceWith(wrapped)
      }
    }
  }
}
```

### 插件示例：代码分析

```javascript
// babel-plugin-analyze-imports.js
// 分析项目中的 import 使用情况

module.exports = function({ types: t }) {
  const imports = {
    default: [],    // import x from 'y'
    named: [],      // import { x } from 'y'
    namespace: [],  // import * as x from 'y'
    sideEffect: []  // import 'y'
  }

  return {
    name: 'analyze-imports',
    visitor: {
      ImportDeclaration(path, state) {
        const source = path.node.source.value
        const specifiers = path.node.specifiers

        if (specifiers.length === 0) {
          // import 'module'
          imports.sideEffect.push(source)
        } else {
          specifiers.forEach(spec => {
            if (t.isImportDefaultSpecifier(spec)) {
              imports.default.push({
                source,
                local: spec.local.name
              })
            } else if (t.isImportNamespaceSpecifier(spec)) {
              imports.namespace.push({
                source,
                local: spec.local.name
              })
            } else if (t.isImportSpecifier(spec)) {
              imports.named.push({
                source,
                imported: spec.imported.name,
                local: spec.local.name
              })
            }
          })
        }
      }
    },
    post() {
      console.log('Import Analysis:')
      console.log(JSON.stringify(imports, null, 2))
    }
  }
}
```

### 插件开发技巧

```javascript
// ==================== 调试技巧 ====================

// 1. 打印 AST 结构
visitor: {
  Identifier(path) {
    console.log('Node:', JSON.stringify(path.node, null, 2))
    console.log('Parent:', path.parent.type)
    console.log('Scope bindings:', Object.keys(path.scope.bindings))
  }
}

// 2. 使用 AST Explorer
// https://astexplorer.net/
// 选择 @babel/parser，实时查看 AST 结构

// 3. 条件断点
visitor: {
  Identifier(path) {
    if (path.node.name === 'targetVar') {
      debugger  // 在调试器中暂停
    }
  }
}

// ==================== 常见模式 ====================

// 1. 避免无限循环
visitor: {
  Identifier(path) {
    // 使用标记避免重复处理
    if (path.node._processed) return
    path.node._processed = true

    // 或者使用 skip
    const newNode = t.identifier('newName')
    path.replaceWith(newNode)
    path.skip()  // 跳过新节点的遍历
  }
}

// 2. 获取文件信息
visitor: {
  Program(path, state) {
    const filename = state.filename
    const cwd = state.cwd
    console.log('Processing:', filename)
  }
}

// 3. 处理注释
visitor: {
  FunctionDeclaration(path) {
    // 检查是否有特定注释
    const leadingComments = path.node.leadingComments || []
    const hasAnnotation = leadingComments.some(
      comment => comment.value.includes('@pure')
    )

    if (hasAnnotation) {
      // 添加 /*#__PURE__*/ 注释
      t.addComment(path.node, 'leading', '#__PURE__')
    }
  }
}

// 4. 处理 JSX
visitor: {
  JSXElement(path) {
    const openingElement = path.node.openingElement
    const tagName = openingElement.name.name

    // 检查组件名称
    if (tagName[0] === tagName[0].toUpperCase()) {
      console.log('自定义组件:', tagName)
    }
  }
}

// 5. 作用域操作
visitor: {
  FunctionDeclaration(path) {
    // 获取函数内的所有绑定
    const bindings = path.scope.getAllBindings()

    // 检查变量是否被引用
    Object.entries(bindings).forEach(([name, binding]) => {
      if (!binding.referenced) {
        console.log('未使用的变量:', name)
      }
    })

    // 生成唯一变量名
    const uid = path.scope.generateUidIdentifier('temp')

    // 重命名绑定
    path.scope.rename('oldName', 'newName')
  }
}

// ==================== 插件测试 ====================

// 使用 babel-plugin-tester
const pluginTester = require('babel-plugin-tester').default
const plugin = require('./my-plugin')

pluginTester({
  plugin,
  pluginName: 'my-plugin',
  tests: {
    'should transform': {
      code: 'const a = 1',
      output: 'const b = 1'
    },
    'should not transform': {
      code: 'let x = 2',
      output: 'let x = 2'
    },
    'should throw error': {
      code: 'invalid code here',
      error: /SyntaxError/
    }
  }
})
```

### 发布插件

```javascript
// package.json
{
  "name": "babel-plugin-my-transform",
  "version": "1.0.0",
  "description": "My Babel plugin",
  "main": "lib/index.js",
  "keywords": [
    "babel-plugin"
  ],
  "peerDependencies": {
    "@babel/core": "^7.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "babel-plugin-tester": "^10.0.0"
  }
}

// 目录结构
babel-plugin-my-transform/
├── lib/
│   └── index.js      // 插件代码
├── __tests__/
│   └── index.test.js // 测试文件
├── package.json
└── README.md

// 命名规范
// 官方插件: @babel/plugin-xxx
// 社区插件: babel-plugin-xxx
// Preset: babel-preset-xxx 或 @scope/babel-preset-xxx
```

## 常见面试题

::: details 1. Babel 的编译流程？
```javascript
// 1. 解析 (Parse)
//    - 词法分析：代码 → Token
//    - 语法分析：Token → AST

// 2. 转换 (Transform)
//    - 遍历 AST
//    - 应用 Plugin 转换

// 3. 生成 (Generate)
//    - AST → 代码

// 详细说明：
// 1. 解析阶段
//    输入: const fn = (a) => a + 1
//    词法分析产出: ['const', 'fn', '=', '(', 'a', ')', '=>', 'a', '+', '1']
//    语法分析产出: AST 树形结构

// 2. 转换阶段
//    遍历 AST，访问者模式
//    每个插件处理特定节点类型
//    如：ArrowFunctionExpression → FunctionExpression

// 3. 生成阶段
//    将 AST 转回代码字符串
//    可生成 source map
```
:::

::: details 2. preset-env 和 runtime 的区别？
```javascript
// ==================== @babel/preset-env ====================
// 功能：
// - 转换 ES6+ 语法到 ES5
// - 通过 useBuiltIns 引入 polyfill
// - 根据 targets 按需转换

// 特点：
// - 全局 polyfill（修改全局对象）
// - 适合开发应用
// - 一次引入，全局可用

// ==================== @babel/plugin-transform-runtime ====================
// 功能：
// - 共享辅助函数（减少代码体积）
// - 沙盒化 polyfill（corejs: 3）
// - 处理 regenerator（async/await）

// 特点：
// - 不污染全局
// - 适合开发库
// - 按模块引入

// ==================== 配合使用 ====================

// 应用开发（推荐）
{
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: 3
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      helpers: true,  // 只用于辅助函数去重
      corejs: false
    }]
  ]
}

// 库开发（推荐）
{
  presets: [
    ['@babel/preset-env', {
      modules: false
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      corejs: 3  // 沙盒化 polyfill
    }]
  ]
}
```
:::

::: details 3. useBuiltIns 的三个值？
```javascript
// ==================== false ====================
// 不自动引入 polyfill
// 需要手动全量引入
import 'core-js'

// ==================== 'entry' ====================
// 在入口处根据 targets 替换为需要的 polyfill
// 需要手动引入入口

// 入口文件
import 'core-js/stable'
import 'regenerator-runtime/runtime'

// Babel 转换后
import 'core-js/modules/es.array.includes'
import 'core-js/modules/es.promise'
// ... 所有目标环境需要的 polyfill

// ==================== 'usage'（推荐）====================
// 按需引入，自动分析代码中使用的 API

// 源代码
const a = [1, 2].includes(1)
new Promise()

// 转换后
import 'core-js/modules/es.array.includes'
import 'core-js/modules/es.promise'
const a = [1, 2].includes(1)
new Promise()

// 优点：最小化 polyfill 体积
// 缺点：可能遗漏动态使用的 API
```
:::

::: details 4. Babel 插件和预设的执行顺序？
```javascript
// 执行顺序规则：
// 1. 插件在预设之前执行
// 2. 插件按数组顺序从前往后执行
// 3. 预设按数组顺序从后往前执行

{
  plugins: ['A', 'B', 'C'],  // 执行顺序: A → B → C
  presets: ['D', 'E', 'F']   // 执行顺序: F → E → D
}

// 完整执行顺序: A → B → C → F → E → D

// 原因：
// 预设从后往前是为了让用户可以把最通用的预设放在前面
// 更具体的预设放在后面，后面的预设可以覆盖前面的配置
```
:::

::: details 5. 如何编写一个 Babel 插件？
```javascript
// 基本结构
module.exports = function(babel) {
  const { types: t } = babel

  return {
    name: 'my-plugin',
    visitor: {
      // 访问特定类型的节点
      Identifier(path, state) {
        // path: 节点路径，包含节点信息和操作方法
        // state: 插件状态，包含用户配置 state.opts

        // 常用操作
        path.node          // 当前节点
        path.parent        // 父节点
        path.scope         // 作用域
        path.replaceWith() // 替换节点
        path.remove()      // 删除节点
        path.insertBefore() // 在之前插入
        path.insertAfter()  // 在之后插入
      }
    }
  }
}

// 实际示例：移除 console.log
module.exports = ({ types: t }) => ({
  name: 'remove-console',
  visitor: {
    CallExpression(path) {
      if (
        t.isMemberExpression(path.node.callee) &&
        t.isIdentifier(path.node.callee.object, { name: 'console' }) &&
        t.isIdentifier(path.node.callee.property, { name: 'log' })
      ) {
        path.remove()
      }
    }
  }
})
```
:::

::: details 6. AST 是什么？有什么作用？
```javascript
// AST = Abstract Syntax Tree（抽象语法树）
// 是源代码的树形结构表示

// 源代码
const a = 1 + 2

// 对应的 AST
{
  type: 'Program',
  body: [{
    type: 'VariableDeclaration',
    kind: 'const',
    declarations: [{
      type: 'VariableDeclarator',
      id: { type: 'Identifier', name: 'a' },
      init: {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'NumericLiteral', value: 1 },
        right: { type: 'NumericLiteral', value: 2 }
      }
    }]
  }]
}

// AST 的作用：
// 1. 代码转换（Babel、TypeScript）
// 2. 代码检查（ESLint）
// 3. 代码格式化（Prettier）
// 4. 代码压缩（Terser）
// 5. 代码高亮（编辑器）
// 6. 自动补全（IDE）
// 7. 依赖分析（Webpack）

// 工具：https://astexplorer.net/
```
:::

::: details 7. Babel 如何处理 async/await？
```javascript
// async/await 被转换为 generator + regenerator-runtime

// 源代码
async function fetchData() {
  const res = await fetch('/api')
  return res.json()
}

// 转换后（简化版）
function fetchData() {
  return _asyncToGenerator(function* () {
    const res = yield fetch('/api')
    return res.json()
  })()
}

// _asyncToGenerator 辅助函数使用 regenerator-runtime
// 来模拟 async/await 行为

// regenerator-runtime 处理方式：
// 1. @babel/preset-env 自动引入（推荐）
// 2. @babel/plugin-transform-runtime 共享引入

// 配置示例
{
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: 3  // 自动处理 regenerator
    }]
  ]
}
```
:::

::: details 8. 如何减少 Babel 编译后的代码体积？
```javascript
// 1. 使用 @babel/plugin-transform-runtime
//    - 共享辅助函数，避免重复
{
  plugins: [
    ['@babel/plugin-transform-runtime', {
      helpers: true
    }]
  ]
}

// 2. 合理配置 targets
//    - 只转换需要支持的浏览器
{
  presets: [
    ['@babel/preset-env', {
      targets: '> 1%, not dead'  // 不要支持过旧的浏览器
    }]
  ]
}

// 3. 使用 useBuiltIns: 'usage'
//    - 按需引入 polyfill
{
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: 3
    }]
  ]
}

// 4. 使用 bugfixes: true
//    - Babel 7.9+ 生成更优化的代码
{
  presets: [
    ['@babel/preset-env', {
      bugfixes: true
    }]
  ]
}

// 5. 保留 ES modules
//    - 让 Webpack/Rollup 进行 tree-shaking
{
  presets: [
    ['@babel/preset-env', {
      modules: false
    }]
  ]
}

// 6. 排除不需要的转换
{
  presets: [
    ['@babel/preset-env', {
      exclude: [
        '@babel/plugin-transform-regenerator',
        '@babel/plugin-transform-typeof-symbol'
      ]
    }]
  ]
}
```
:::

::: details 9. babel-loader 和 @babel/core 的关系？
```javascript
// @babel/core
// - Babel 的核心编译功能
// - 提供 transform、parse 等 API
// - 可以独立使用

const babel = require('@babel/core')
const result = babel.transformSync(code, options)

// babel-loader
// - Webpack 的 loader
// - 在 Webpack 构建流程中调用 @babel/core
// - 处理 .js/.jsx/.ts/.tsx 文件

// webpack.config.js
module.exports = {
  module: {
    rules: [{
      test: /\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          // 传递给 @babel/core 的配置
          presets: ['@babel/preset-env']
        }
      }
    }]
  }
}

// 关系图
// Webpack → babel-loader → @babel/core → 转换代码

// 相关包
// @babel/core: 核心（必需）
// babel-loader: Webpack 集成
// @babel/cli: 命令行工具
// @babel/register: Node.js 运行时转换
```
:::

::: details 10. Polyfill 和语法转换的区别？
```javascript
// ==================== 语法转换 ====================
// 将新语法转换为旧语法
// 编译时处理

// 箭头函数
const fn = () => {}
// → var fn = function() {}

// 类
class Person {}
// → function Person() {}

// 解构
const { a } = obj
// → var a = obj.a

// 可选链
a?.b
// → a == null ? void 0 : a.b

// ==================== Polyfill ====================
// 为旧环境提供新 API 的实现
// 运行时处理

// Promise
new Promise()
// 需要引入 Promise polyfill

// Array.prototype.includes
[].includes()
// 需要给 Array.prototype 添加 includes 方法

// Object.assign
Object.assign({}, obj)
// 需要给 Object 添加 assign 方法

// ==================== 总结 ====================
// 语法转换：
// - 编译时完成
// - 不增加运行时代码（除了辅助函数）
// - Babel 默认行为

// Polyfill：
// - 运行时注入
// - 增加打包体积
// - 需要配置 useBuiltIns 或 transform-runtime
```
:::

## 工程化配置示例

::: details React 项目配置
```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: '> 0.5%, not dead',
      useBuiltIns: 'usage',
      corejs: 3,
      modules: false
    }],
    ['@babel/preset-react', {
      runtime: 'automatic',  // React 17+ 自动导入
      development: process.env.NODE_ENV === 'development'
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      helpers: true
    }],
    // 开发环境添加 React Refresh
    process.env.NODE_ENV === 'development' && 'react-refresh/babel'
  ].filter(Boolean)
}
```
:::

::: details Vue 项目配置
```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: '> 0.5%, not dead',
      useBuiltIns: 'usage',
      corejs: 3,
      modules: false
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      helpers: true
    }],
    // Vue JSX 支持
    '@vue/babel-plugin-jsx'
  ]
}
```
:::

::: details TypeScript 项目配置
```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: '> 0.5%, not dead',
      useBuiltIns: 'usage',
      corejs: 3,
      modules: false
    }],
    ['@babel/preset-typescript', {
      isTSX: true,
      allExtensions: true
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      helpers: true
    }]
  ]
}

// 注意：Babel 只移除类型注解，不做类型检查
// 需要配合 tsc --noEmit 或 fork-ts-checker-webpack-plugin
```
:::

::: details 库开发配置
```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      modules: false,       // 保留 ESM
      useBuiltIns: false    // 不引入 polyfill
    }],
    '@babel/preset-typescript'
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      helpers: true,
      regenerator: true,
      corejs: 3           // 沙盒化 polyfill
    }]
  ]
}

// package.json
{
  "main": "lib/index.js",      // CommonJS
  "module": "es/index.js",     // ESM
  "types": "types/index.d.ts", // 类型声明
  "sideEffects": false,        // 支持 tree-shaking
  "dependencies": {
    "@babel/runtime-corejs3": "^7.20.0"
  }
}
```
:::

::: details Monorepo 配置
```javascript
// 根目录 babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: '> 0.5%, not dead'
    }]
  ],
  // 允许 packages 目录下的 .babelrc 生效
  babelrcRoots: [
    '.',
    'packages/*'
  ]
}

// packages/app/.babelrc
{
  "presets": ["@babel/preset-react"]
}

// packages/utils/.babelrc
{
  "plugins": [
    ["@babel/plugin-transform-runtime", {
      "corejs": 3
    }]
  ]
}
```
:::

## 调试与优化

::: details 调试 Babel 配置
```javascript
// 1. 启用 debug 选项
{
  presets: [
    ['@babel/preset-env', {
      debug: true  // 输出使用的插件列表
    }]
  ]
}

// 2. 使用 BABEL_SHOW_CONFIG_FOR 环境变量
// BABEL_SHOW_CONFIG_FOR=./src/index.js npm run build

// 3. 查看编译结果
// npx babel src/index.js --out-file output.js

// 4. 使用 Babel REPL
// https://babeljs.io/repl
```
:::

::: details 性能优化
```javascript
// 1. 缩小编译范围
// webpack.config.js
module.exports = {
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,  // 排除 node_modules
      include: path.resolve(__dirname, 'src'),  // 只处理 src
      use: 'babel-loader'
    }]
  }
}

// 2. 启用缓存
// babel-loader 缓存
{
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,      // 启用缓存
    cacheCompression: false    // 禁用压缩（提高速度）
  }
}

// 3. 使用 api.cache
// babel.config.js
module.exports = function(api) {
  api.cache(true)  // 永久缓存
  // api.cache.using(() => process.env.NODE_ENV)  // 基于环境缓存

  return {
    // 配置...
  }
}

// 4. 减少不必要的转换
{
  presets: [
    ['@babel/preset-env', {
      targets: { esmodules: true },  // 只针对现代浏览器
      bugfixes: true                  // 更精细的转换
    }]
  ]
}
```
:::
