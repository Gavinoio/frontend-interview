# 水平垂直居中方案

元素居中是 CSS 布局中的经典问题，也是面试高频考点。本文系统总结了各种居中方案及其适用场景。

## 水平居中方案

### 1. 行内元素 - text-align

适用于行内元素（`inline`、`inline-block`、`inline-table`、`inline-flex` 等）。

```html
<style>
  .container {
    text-align: center;  /* 水平居中 */
    background: #ecf0f1;
    padding: 20px;
  }

  .item {
    display: inline-block;
    background: #3498db;
    color: white;
    padding: 10px 20px;
  }
</style>

<div class="container">
  <div class="item">行内元素</div>
</div>
```

**优点**：简单，兼容性好
**缺点**：只适用于行内元素
**兼容性**：所有浏览器

### 2. 块级元素 - margin: auto

适用于固定宽度的块级元素。

```html
<style>
  .container {
    background: #ecf0f1;
    padding: 20px;
  }

  .item {
    width: 200px;         /* 必须有宽度 */
    margin: 0 auto;       /* 水平居中 */
    background: #3498db;
    color: white;
    padding: 20px;
    text-align: center;
  }
</style>

<div class="container">
  <div class="item">块级元素</div>
</div>
```

**优点**：简单，常用
**缺点**：需要固定宽度
**兼容性**：所有浏览器

### 3. 绝对定位 + transform

适用于不固定宽度的元素。

```html
<style>
  .container {
    position: relative;
    height: 200px;
    background: #ecf0f1;
  }

  .item {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    background: #3498db;
    color: white;
    padding: 20px;
  }
</style>

<div class="container">
  <div class="item">绝对定位居中</div>
</div>
```

**优点**：不需要固定宽度
**缺点**：需要父元素相对定位
**兼容性**：IE9+（transform）

### 4. Flex 布局

现代布局的首选方案。

```html
<style>
  .container {
    display: flex;
    justify-content: center;  /* 水平居中 */
    background: #ecf0f1;
    padding: 20px;
  }

  .item {
    background: #3498db;
    color: white;
    padding: 20px;
  }
</style>

<div class="container">
  <div class="item">Flex 居中</div>
</div>
```

**优点**：简单灵活，不需要固定宽度
**缺点**：IE 10+ 支持
**兼容性**：IE 10+（需前缀）

### 5. Grid 布局

```html
<style>
  .container {
    display: grid;
    justify-content: center;  /* 水平居中 */
    background: #ecf0f1;
    padding: 20px;
  }

  .item {
    background: #3498db;
    color: white;
    padding: 20px;
  }
</style>

<div class="container">
  <div class="item">Grid 居中</div>
</div>
```

**优点**：强大的二维布局
**缺点**：IE 11+ 部分支持
**兼容性**：IE 11+（有限支持）

## 垂直居中方案

### 1. 单行文本 - line-height

适用于单行文本。

```html
<style>
  .container {
    height: 100px;
    line-height: 100px;  /* 等于容器高度 */
    background: #ecf0f1;
    text-align: center;
  }
</style>

<div class="container">
  单行文本垂直居中
</div>
```

**优点**：简单
**缺点**：只适用于单行文本
**兼容性**：所有浏览器

### 2. table-cell

利用表格单元格的特性。

```html
<style>
  .container {
    display: table-cell;
    vertical-align: middle;  /* 垂直居中 */
    width: 300px;
    height: 200px;
    background: #ecf0f1;
    text-align: center;
  }

  .item {
    display: inline-block;
    background: #3498db;
    color: white;
    padding: 20px;
  }
</style>

<div class="container">
  <div class="item">Table-cell 居中</div>
</div>
```

**优点**：兼容性好
**缺点**：需要改变 display 属性
**兼容性**：所有浏览器

### 3. 绝对定位 + transform

```html
<style>
  .container {
    position: relative;
    height: 200px;
    background: #ecf0f1;
  }

  .item {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: #3498db;
    color: white;
    padding: 20px;
  }
</style>

<div class="container">
  <div class="item">绝对定位垂直居中</div>
</div>
```

**优点**：不需要固定高度
**缺点**：需要父元素相对定位
**兼容性**：IE9+

### 4. Flex 布局

```html
<style>
  .container {
    display: flex;
    align-items: center;  /* 垂直居中 */
    height: 200px;
    background: #ecf0f1;
  }

  .item {
    background: #3498db;
    color: white;
    padding: 20px;
  }
</style>

<div class="container">
  <div class="item">Flex 垂直居中</div>
</div>
```

**优点**：简单灵活
**缺点**：IE 10+ 支持
**兼容性**：IE 10+

### 5. Grid 布局

```html
<style>
  .container {
    display: grid;
    align-items: center;  /* 垂直居中 */
    height: 200px;
    background: #ecf0f1;
  }

  .item {
    background: #3498db;
    color: white;
    padding: 20px;
  }
</style>

<div class="container">
  <div class="item">Grid 垂直居中</div>
</div>
```

**优点**：强大灵活
**缺点**：IE 11+ 有限支持
**兼容性**：IE 11+

## 水平垂直居中方案

### 方案 1: Flex 布局（推荐）

**最简单、最常用的方案**。

```html
<style>
  .container {
    display: flex;
    justify-content: center;  /* 水平居中 */
    align-items: center;      /* 垂直居中 */
    height: 300px;
    background: #ecf0f1;
  }

  .item {
    background: #3498db;
    color: white;
    padding: 20px;
    border-radius: 8px;
  }
</style>

<div class="container">
  <div class="item">
    Flex 水平垂直居中<br>
    支持多行内容
  </div>
</div>
```

**优点**：
- 简洁优雅
- 不需要知道子元素尺寸
- 支持多行内容
- 响应式友好

**缺点**：
- IE 10+ 支持（需要前缀）

**兼容性**：IE 10+

### 方案 2: Grid 布局

```html
<style>
  .container {
    display: grid;
    place-items: center;  /* 水平垂直居中（简写） */
    height: 300px;
    background: #ecf0f1;
  }

  /* 或分开写 */
  .container-alt {
    display: grid;
    justify-content: center;
    align-items: center;
  }

  .item {
    background: #3498db;
    color: white;
    padding: 20px;
    border-radius: 8px;
  }
</style>

<div class="container">
  <div class="item">Grid 水平垂直居中</div>
</div>
```

**优点**：
- 代码简洁（place-items）
- 功能强大

**缺点**：
- IE 11+ 有限支持

**兼容性**：IE 11+（有限）

### 方案 3: 绝对定位 + transform

**经典方案，兼容性好**。

```html
<style>
  .container {
    position: relative;
    height: 300px;
    background: #ecf0f1;
  }

  .item {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #3498db;
    color: white;
    padding: 20px;
    border-radius: 8px;
  }
</style>

<div class="container">
  <div class="item">
    绝对定位 + Transform<br>
    水平垂直居中
  </div>
</div>
```

**优点**：
- 不需要知道子元素尺寸
- 兼容性好（IE9+）

**缺点**：
- 脱离文档流
- 需要父元素相对定位

**兼容性**：IE9+

### 方案 4: 绝对定位 + margin: auto

**需要知道子元素尺寸**。

```html
<style>
  .container {
    position: relative;
    height: 300px;
    background: #ecf0f1;
  }

  .item {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    width: 200px;   /* 必须设置宽度 */
    height: 100px;  /* 必须设置高度 */
    background: #3498db;
    color: white;
    padding: 20px;
    border-radius: 8px;
  }
</style>

<div class="container">
  <div class="item">
    绝对定位 + Margin Auto
  </div>
</div>
```

**优点**：
- 兼容性好

**缺点**：
- 需要固定宽高

**兼容性**：所有浏览器

### 方案 5: 绝对定位 + 负 margin

**需要知道子元素尺寸**。

```html
<style>
  .container {
    position: relative;
    height: 300px;
    background: #ecf0f1;
  }

  .item {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200px;
    height: 100px;
    margin-left: -100px;  /* 宽度的一半 */
    margin-top: -50px;    /* 高度的一半 */
    background: #3498db;
    color: white;
    padding: 20px;
    border-radius: 8px;
  }
</style>

<div class="container">
  <div class="item">
    负 Margin 居中
  </div>
</div>
```

**优点**：
- 兼容性最好

**缺点**：
- 需要固定宽高并计算

**兼容性**：所有浏览器

### 方案 6: table-cell

```html
<style>
  .container {
    display: table-cell;
    vertical-align: middle;
    text-align: center;
    width: 400px;
    height: 300px;
    background: #ecf0f1;
  }

  .item {
    display: inline-block;
    background: #3498db;
    color: white;
    padding: 20px;
    border-radius: 8px;
  }
</style>

<div class="container">
  <div class="item">Table-cell 居中</div>
</div>
```

**优点**：
- 兼容性好

**缺点**：
- 需要改变 display
- 不够灵活

**兼容性**：所有浏览器

### 方案 7: Flex + margin auto

```html
<style>
  .container {
    display: flex;
    height: 300px;
    background: #ecf0f1;
  }

  .item {
    margin: auto;  /* 自动居中 */
    background: #3498db;
    color: white;
    padding: 20px;
    border-radius: 8px;
  }
</style>

<div class="container">
  <div class="item">Flex + Margin Auto</div>
</div>
```

**优点**：
- 代码简洁

**缺点**：
- IE 10+ 支持

**兼容性**：IE 10+

### 方案 8: writing-mode（创意方案）

```html
<style>
  .container {
    writing-mode: vertical-lr;
    text-align: center;
    height: 300px;
    background: #ecf0f1;
  }

  .inner {
    writing-mode: horizontal-tb;
    display: inline-block;
    text-align: center;
    width: 100%;
  }

  .item {
    display: inline-block;
    background: #3498db;
    color: white;
    padding: 20px;
    border-radius: 8px;
  }
</style>

<div class="container">
  <div class="inner">
    <div class="item">Writing-mode 居中</div>
  </div>
</div>
```

**优点**：
- 无需定位

**缺点**：
- 代码复杂
- 实用性低

**兼容性**：IE8+

## 各方案优缺点对比

### 水平居中对比

| 方案 | 适用场景 | 优点 | 缺点 | 兼容性 |
|------|----------|------|------|--------|
| text-align | 行内元素 | 简单 | 仅行内元素 | 所有浏览器 |
| margin: auto | 块级元素 | 简单常用 | 需固定宽度 | 所有浏览器 |
| 定位 + transform | 任意元素 | 无需固定宽度 | 需定位 | IE9+ |
| Flex | 任意元素 | 简单灵活 | IE10+ | IE10+ |
| Grid | 任意元素 | 强大 | IE11+ | IE11+ |

### 垂直居中对比

| 方案 | 适用场景 | 优点 | 缺点 | 兼容性 |
|------|----------|------|------|--------|
| line-height | 单行文本 | 简单 | 仅单行 | 所有浏览器 |
| table-cell | 任意元素 | 兼容性好 | 改变display | 所有浏览器 |
| 定位 + transform | 任意元素 | 无需固定高度 | 需定位 | IE9+ |
| Flex | 任意元素 | 简单灵活 | IE10+ | IE10+ |
| Grid | 任意元素 | 强大 | IE11+ | IE11+ |

### 水平垂直居中对比

| 方案 | 是否需要固定尺寸 | 兼容性 | 推荐度 | 备注 |
|------|------------------|--------|--------|------|
| Flex | ❌ | IE10+ | ⭐⭐⭐⭐⭐ | **首选** |
| Grid | ❌ | IE11+ | ⭐⭐⭐⭐ | 现代浏览器 |
| 定位 + transform | ❌ | IE9+ | ⭐⭐⭐⭐ | 经典方案 |
| 定位 + margin auto | ✅ | 所有 | ⭐⭐⭐ | 需固定尺寸 |
| 定位 + 负margin | ✅ | 所有 | ⭐⭐ | 需计算 |
| table-cell | ❌ | 所有 | ⭐⭐ | 不够灵活 |

## 完整示例

### 各种居中方案对比演示

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>居中方案对比</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      padding: 20px;
      font-family: Arial, sans-serif;
      background: #f5f5f5;
    }

    h2 {
      margin: 30px 0 20px;
      color: #2c3e50;
    }

    .demo {
      width: 100%;
      height: 200px;
      background: #ecf0f1;
      margin-bottom: 20px;
      border: 2px dashed #95a5a6;
      border-radius: 8px;
    }

    .box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      min-width: 150px;
      text-align: center;
    }

    /* 1. Flex 居中 */
    .flex-center {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    /* 2. Grid 居中 */
    .grid-center {
      display: grid;
      place-items: center;
    }

    /* 3. 定位 + Transform */
    .transform-center {
      position: relative;
    }

    .transform-center .box {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    /* 4. 定位 + Margin Auto */
    .margin-auto-center {
      position: relative;
    }

    .margin-auto-center .box {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
      width: 200px;
      height: 100px;
    }

    /* 5. table-cell */
    .table-center {
      display: table-cell;
      vertical-align: middle;
      text-align: center;
    }

    .table-center .box {
      display: inline-block;
    }

    /* 6. Flex + Margin */
    .flex-margin {
      display: flex;
    }

    .flex-margin .box {
      margin: auto;
    }

    .label {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,0.6);
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>CSS 水平垂直居中方案对比</h1>

  <h2>方案 1: Flex 布局（推荐）</h2>
  <div class="demo flex-center">
    <span class="label">display: flex</span>
    <div class="box">
      Flex 居中<br>
      简单灵活
    </div>
  </div>

  <h2>方案 2: Grid 布局</h2>
  <div class="demo grid-center">
    <span class="label">display: grid</span>
    <div class="box">
      Grid 居中<br>
      强大优雅
    </div>
  </div>

  <h2>方案 3: 绝对定位 + Transform</h2>
  <div class="demo transform-center">
    <span class="label">position + transform</span>
    <div class="box">
      Transform 居中<br>
      经典方案
    </div>
  </div>

  <h2>方案 4: 绝对定位 + Margin Auto</h2>
  <div class="demo margin-auto-center">
    <span class="label">position + margin: auto</span>
    <div class="box">
      Margin Auto<br>
      需固定尺寸
    </div>
  </div>

  <h2>方案 5: Table-cell</h2>
  <div class="demo table-center">
    <span class="label">display: table-cell</span>
    <div class="box">
      Table-cell<br>
      兼容性好
    </div>
  </div>

  <h2>方案 6: Flex + Margin Auto</h2>
  <div class="demo flex-margin">
    <span class="label">flex + margin: auto</span>
    <div class="box">
      Flex + Margin<br>
      简洁优雅
    </div>
  </div>
</body>
</html>
```

