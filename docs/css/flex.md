# Flex 布局

## 概述

Flex（Flexible Box）是一种一维布局模型，用于在容器中灵活分配空间和对齐元素，是现代响应式布局的首选方案。

## 官方定义

Flex 布局是 W3C 提出的一种新的布局方案，可以简便、完整、响应式地实现各种页面布局。采用 Flex 布局的元素，称为 Flex 容器（flex container），它的所有子元素自动成为容器成员，称为 Flex 项目（flex item）。

## 通俗理解

把 Flex 布局想象成一个**可伸缩的弹簧盒子**：

- 容器就像一个**弹簧盒**，可以自动调节内部空间
- 项目就像盒子里的**物品**，可以根据剩余空间自动放大或缩小
- 主轴就像盒子的**排列方向**，可以横着放也可以竖着放
- 弹簧的**拉伸和压缩**就像 flex-grow 和 flex-shrink

就像在火车上整理行李箱：如果空间大，行李就摊开放（flex-grow）；如果空间小，行李就压缩塞进去（flex-shrink）；每件行李占多大空间（flex-basis），都可以灵活调整。

## 详细讲解

### Flex 基本概念

#### 核心术语

```
+--------------------------------------+
|            Flex Container            |
|  +--------------------------------+  |
|  |        Main Axis (主轴)        |  |
|  |  +------+  +------+  +------+  |  |
|  |  | Item |  | Item |  | Item |  |  |
|  |  +------+  +------+  +------+  |  |
|  |                                |  |
|  |  Cross Axis (交叉轴)           |  |
|  +--------------------------------+  |
+--------------------------------------+
```

- **Flex Container（容器）**：设置了 `display: flex` 的父元素
- **Flex Item（项目）**：容器的直接子元素
- **Main Axis（主轴）**：项目排列的方向（默认水平）
- **Cross Axis（交叉轴）**：垂直于主轴的方向
- **Main Start/End**：主轴的起点/终点
- **Cross Start/End**：交叉轴的起点/终点

#### 启用 Flex 布局

```css
/* 块级 Flex 容器 */
.container {
  display: flex;
}

/* 行内 Flex 容器 */
.container {
  display: inline-flex;
}
```

### 容器属性

#### 1. flex-direction - 主轴方向

定义主轴的方向，即项目的排列方向。

```css
.container {
  flex-direction: row;              /* 默认值，水平从左到右 */
  flex-direction: row-reverse;      /* 水平从右到左 */
  flex-direction: column;           /* 垂直从上到下 */
  flex-direction: column-reverse;   /* 垂直从下到上 */
}
```

**示例**：

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .container {
      display: flex;
      margin-bottom: 20px;
      border: 2px solid #3498db;
      padding: 10px;
    }

    .item {
      width: 80px;
      height: 80px;
      background: #e74c3c;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 5px;
    }

    .row { flex-direction: row; }
    .row-reverse { flex-direction: row-reverse; }
    .column { flex-direction: column; }
    .column-reverse { flex-direction: column-reverse; }
  </style>
</head>
<body>
  <div class="container row">
    <div class="item">1</div>
    <div class="item">2</div>
    <div class="item">3</div>
  </div>

  <div class="container row-reverse">
    <div class="item">1</div>
    <div class="item">2</div>
    <div class="item">3</div>
  </div>
</body>
</html>
```

#### 2. flex-wrap - 换行方式

定义项目是否换行以及如何换行。

```css
.container {
  flex-wrap: nowrap;        /* 默认值，不换行 */
  flex-wrap: wrap;          /* 换行，第一行在上方 */
  flex-wrap: wrap-reverse;  /* 换行，第一行在下方 */
}
```

**示例**：

```html
<style>
  .container {
    display: flex;
    width: 300px;
    border: 2px solid #3498db;
    margin-bottom: 20px;
  }

  .item {
    width: 100px;
    height: 50px;
    background: #2ecc71;
    margin: 5px;
  }

  .nowrap { flex-wrap: nowrap; }
  .wrap { flex-wrap: wrap; }
</style>

<div class="container nowrap">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
</div>

<div class="container wrap">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
</div>
```

#### 3. flex-flow - 简写属性

`flex-flow` 是 `flex-direction` 和 `flex-wrap` 的简写。

```css
.container {
  /* flex-flow: <flex-direction> <flex-wrap> */
  flex-flow: row nowrap;        /* 默认值 */
  flex-flow: row wrap;
  flex-flow: column wrap;
}
```

#### 4. justify-content - 主轴对齐

定义项目在主轴上的对齐方式。

```css
.container {
  justify-content: flex-start;      /* 默认值，起点对齐 */
  justify-content: flex-end;        /* 终点对齐 */
  justify-content: center;          /* 居中对齐 */
  justify-content: space-between;   /* 两端对齐，项目之间间隔相等 */
  justify-content: space-around;    /* 项目两侧间隔相等 */
  justify-content: space-evenly;    /* 项目之间和两端间隔相等 */
}
```

**可视化对比**：

```html
<style>
  .container {
    display: flex;
    width: 500px;
    height: 100px;
    border: 2px solid #3498db;
    margin-bottom: 10px;
  }

  .item {
    width: 80px;
    height: 80px;
    background: #e74c3c;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>

<!-- flex-start -->
<div class="container" style="justify-content: flex-start;">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
</div>

<!-- center -->
<div class="container" style="justify-content: center;">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
</div>

<!-- space-between -->
<div class="container" style="justify-content: space-between;">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
</div>

<!-- space-around -->
<div class="container" style="justify-content: space-around;">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
</div>

<!-- space-evenly -->
<div class="container" style="justify-content: space-evenly;">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
</div>
```

**间距对比**：

```
space-between:  [1]    间距2    [2]    间距2    [3]
space-around:   间距1  [1]  间距2  [2]  间距2  [3]  间距1
space-evenly:   间距1  [1]  间距1  [2]  间距1  [3]  间距1
```

#### 5. align-items - 交叉轴对齐

定义项目在交叉轴上的对齐方式（单行）。

```css
.container {
  align-items: stretch;       /* 默认值，拉伸填满容器 */
  align-items: flex-start;    /* 起点对齐 */
  align-items: flex-end;      /* 终点对齐 */
  align-items: center;        /* 居中对齐 */
  align-items: baseline;      /* 基线对齐 */
}
```

**示例**：

```html
<style>
  .container {
    display: flex;
    height: 200px;
    border: 2px solid #3498db;
    margin-bottom: 10px;
  }

  .item {
    width: 80px;
    background: #e74c3c;
    color: white;
    padding: 10px;
  }

  .item:nth-child(1) { height: 60px; }
  .item:nth-child(2) { height: 80px; font-size: 20px; }
  .item:nth-child(3) { height: 100px; }
</style>

<!-- flex-start -->
<div class="container" style="align-items: flex-start;">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
</div>

<!-- center -->
<div class="container" style="align-items: center;">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
</div>

<!-- baseline -->
<div class="container" style="align-items: baseline;">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
</div>
```

#### 6. align-content - 多行对齐

定义多根轴线的对齐方式（多行时有效）。

```css
.container {
  align-content: stretch;         /* 默认值，拉伸占满 */
  align-content: flex-start;      /* 起点对齐 */
  align-content: flex-end;        /* 终点对齐 */
  align-content: center;          /* 居中对齐 */
  align-content: space-between;   /* 两端对齐 */
  align-content: space-around;    /* 间隔相等 */
}
```

**注意**：只有在 `flex-wrap: wrap` 且有多行时才有效。

```html
<style>
  .container {
    display: flex;
    flex-wrap: wrap;
    width: 300px;
    height: 400px;
    border: 2px solid #3498db;
  }

  .item {
    width: 80px;
    height: 80px;
    background: #e74c3c;
    margin: 5px;
  }
</style>

<div class="container" style="align-content: space-between;">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
  <div class="item">5</div>
  <div class="item">6</div>
</div>
```

### 项目属性

#### 1. order - 排列顺序

定义项目的排列顺序，数值越小越靠前，默认为 0。

```css
.item {
  order: 0;    /* 默认值 */
  order: 1;    /* 排在后面 */
  order: -1;   /* 排在前面 */
}
```

**示例**：

```html
<style>
  .container {
    display: flex;
  }

  .item {
    width: 80px;
    height: 80px;
    background: #3498db;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 5px;
  }

  .item:nth-child(2) { order: 3; }
  .item:nth-child(3) { order: 1; }
</style>

<div class="container">
  <div class="item">1 (order: 0)</div>
  <div class="item">2 (order: 3)</div>
  <div class="item">3 (order: 1)</div>
</div>
<!-- 实际显示顺序: 1, 3, 2 -->
```

#### 2. flex-grow - 放大比例

定义项目的放大比例，默认为 0（不放大）。

```css
.item {
  flex-grow: 0;   /* 默认值，不放大 */
  flex-grow: 1;   /* 平分剩余空间 */
  flex-grow: 2;   /* 占据 2 倍空间 */
}
```

**示例**：

```html
<style>
  .container {
    display: flex;
    width: 500px;
    border: 2px solid #3498db;
  }

  .item {
    height: 80px;
    background: #e74c3c;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 5px;
  }

  .item1 { flex-grow: 1; }  /* 占 1 份 */
  .item2 { flex-grow: 2; }  /* 占 2 份 */
  .item3 { flex-grow: 1; }  /* 占 1 份 */
</style>

<div class="container">
  <div class="item item1">flex-grow: 1</div>
  <div class="item item2">flex-grow: 2</div>
  <div class="item item3">flex-grow: 1</div>
</div>
```

**计算公式**：
```
剩余空间 = 容器宽度 - 所有项目的基础宽度
每份大小 = 剩余空间 / flex-grow 总和
项目最终宽度 = 基础宽度 + flex-grow * 每份大小
```

#### 3. flex-shrink - 缩小比例

定义项目的缩小比例，默认为 1（等比缩小）。

```css
.item {
  flex-shrink: 1;   /* 默认值，等比缩小 */
  flex-shrink: 0;   /* 不缩小 */
  flex-shrink: 2;   /* 缩小 2 倍 */
}
```

**示例**：

```html
<style>
  .container {
    display: flex;
    width: 300px;
    border: 2px solid #3498db;
  }

  .item {
    width: 150px;
    height: 80px;
    background: #2ecc71;
    margin: 5px;
  }

  .item1 { flex-shrink: 1; }  /* 缩小 1 倍 */
  .item2 { flex-shrink: 2; }  /* 缩小 2 倍 */
  .item3 { flex-shrink: 0; }  /* 不缩小 */
</style>

<div class="container">
  <div class="item item1">shrink: 1</div>
  <div class="item item2">shrink: 2</div>
  <div class="item item3">shrink: 0</div>
</div>
```

#### 4. flex-basis - 基准大小

定义在分配多余空间之前，项目占据的主轴空间。

```css
.item {
  flex-basis: auto;     /* 默认值，由内容决定 */
  flex-basis: 200px;    /* 固定宽度 */
  flex-basis: 50%;      /* 百分比 */
  flex-basis: 0;        /* 不占据空间 */
}
```

**优先级**：`flex-basis` > `width` > 内容宽度

```html
<style>
  .container {
    display: flex;
    width: 500px;
  }

  .item {
    height: 80px;
    background: #9b59b6;
    margin: 5px;
  }

  .item1 { flex-basis: 100px; }
  .item2 { flex-basis: 200px; }
  .item3 { flex-basis: auto; width: 150px; }
</style>

<div class="container">
  <div class="item item1">basis: 100px</div>
  <div class="item item2">basis: 200px</div>
  <div class="item item3">basis: auto, width: 150px</div>
</div>
```

#### 5. flex - 简写属性

`flex` 是 `flex-grow`、`flex-shrink`、`flex-basis` 的简写。

```css
.item {
  /* flex: <flex-grow> <flex-shrink> <flex-basis> */
  flex: 0 1 auto;      /* 默认值 */
  flex: 1;             /* 等同于 flex: 1 1 0% */
  flex: auto;          /* 等同于 flex: 1 1 auto */
  flex: none;          /* 等同于 flex: 0 0 auto */
}
```

**常用值**：

```css
/* 1. 不放大不缩小，基于内容 */
.item { flex: 0 0 auto; }  /* 或 flex: none; */

/* 2. 平分容器空间 */
.item { flex: 1; }  /* 或 flex: 1 1 0%; */

/* 3. 自动伸缩 */
.item { flex: auto; }  /* 或 flex: 1 1 auto; */

/* 4. 固定宽度 */
.item { flex: 0 0 200px; }
```

#### 6. align-self - 单个项目对齐

允许单个项目有不同的对齐方式，可覆盖 `align-items`。

```css
.item {
  align-self: auto;         /* 默认值，继承父元素 align-items */
  align-self: flex-start;   /* 起点对齐 */
  align-self: flex-end;     /* 终点对齐 */
  align-self: center;       /* 居中对齐 */
  align-self: baseline;     /* 基线对齐 */
  align-self: stretch;      /* 拉伸填满 */
}
```

**示例**：

```html
<style>
  .container {
    display: flex;
    align-items: flex-start;
    height: 200px;
    border: 2px solid #3498db;
  }

  .item {
    width: 80px;
    height: 60px;
    background: #e74c3c;
    margin: 5px;
  }

  .item2 { align-self: center; }
  .item3 { align-self: flex-end; }
</style>

<div class="container">
  <div class="item">1</div>
  <div class="item item2">2 (center)</div>
  <div class="item item3">3 (end)</div>
</div>
```

## 实际应用

### 1. 水平垂直居中

```css
/* 方法1: justify-content + align-items */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

/* 方法2: margin auto */
.container {
  display: flex;
}
.item {
  margin: auto;
}
```

### 2. 等分布局

```html
<style>
  .container {
    display: flex;
  }

  .item {
    flex: 1;  /* 每个项目平分空间 */
    height: 100px;
    background: #3498db;
    margin: 5px;
  }
</style>

<div class="container">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
</div>
```

### 3. 圣杯布局（两侧固定，中间自适应）

```html
<style>
  .container {
    display: flex;
    height: 200px;
  }

  .left {
    flex: 0 0 200px;  /* 固定 200px */
    background: #3498db;
  }

  .middle {
    flex: 1;  /* 自适应 */
    background: #2ecc71;
  }

  .right {
    flex: 0 0 200px;  /* 固定 200px */
    background: #e74c3c;
  }
</style>

<div class="container">
  <div class="left">Left 200px</div>
  <div class="middle">Middle (auto)</div>
  <div class="right">Right 200px</div>
</div>
```

### 4. 九宫格布局

```html
<style>
  .container {
    display: flex;
    flex-wrap: wrap;
    width: 300px;
    height: 300px;
  }

  .item {
    flex: 0 0 calc(33.333% - 10px);
    height: calc(33.333% - 10px);
    background: #3498db;
    margin: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
  }
</style>

<div class="container">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
  <div class="item">5</div>
  <div class="item">6</div>
  <div class="item">7</div>
  <div class="item">8</div>
  <div class="item">9</div>
</div>
```

### 5. 底部固定布局

```html
<style>
  .container {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .header {
    flex: 0 0 60px;
    background: #3498db;
  }

  .main {
    flex: 1;  /* 自动占据剩余空间 */
    background: #ecf0f1;
  }

  .footer {
    flex: 0 0 80px;
    background: #2c3e50;
  }
</style>

<div class="container">
  <div class="header">Header</div>
  <div class="main">Main Content</div>
  <div class="footer">Footer</div>
</div>
```

### 6. 卡片布局

```html
<style>
  .card-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding: 20px;
  }

  .card {
    flex: 0 0 calc(25% - 20px);
    min-width: 200px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 20px;
  }

  /* 响应式：小屏幕 2 列 */
  @media (max-width: 768px) {
    .card {
      flex: 0 0 calc(50% - 20px);
    }
  }

  /* 响应式：超小屏幕 1 列 */
  @media (max-width: 480px) {
    .card {
      flex: 0 0 100%;
    }
  }
</style>

<div class="card-container">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
  <div class="card">Card 4</div>
</div>
```

## 面试题

::: details 1. flex: 1 代表什么？
**一句话答案**：flex: 1 等于 flex: 1 1 0%，表示元素可以放大、可以缩小、初始大小为0，会占据所有剩余空间。

**详细解答**：

`flex: 1` 是 `flex-grow`、`flex-shrink`、`flex-basis` 的简写形式：

- `flex-grow: 1`：表示有剩余空间时会放大，数值代表放大比例
- `flex-shrink: 1`：表示空间不足时会缩小，数值代表缩小比例
- `flex-basis: 0%`：表示初始大小为 0，不考虑元素本身的内容大小，完全按比例分配空间

**常见组合对比**：

```css
/* 平分所有空间（忽略内容大小） */
.item { flex: 1; }  /* = flex: 1 1 0% */

/* 根据内容大小分配剩余空间 */
.item { flex: auto; }  /* = flex: 1 1 auto */

/* 不伸缩，保持原始大小 */
.item { flex: none; }  /* = flex: 0 0 auto */

/* 默认值：不放大，可缩小 */
.item { flex: 0 1 auto; }
```

**实际场景**：

```html
<!-- 左侧固定 200px，右侧自适应 -->
<style>
  .container {
    display: flex;
  }
  .left {
    width: 200px;
  }
  .right {
    flex: 1;  /* 占据所有剩余空间 */
  }
</style>

<!-- 三栏平分 -->
<style>
  .item {
    flex: 1;  /* 三个元素各占 33.33% */
  }
</style>
```

**面试回答**：
> flex: 1 是一个简写属性，等价于 flex-grow: 1, flex-shrink: 1, flex-basis: 0%。它的意思是这个元素会占据所有剩余空间。如果有多个 flex: 1 的元素，它们会平均分配空间，不管内容多少。我在项目中经常用它来做自适应布局，比如常见的左边固定宽度、右边 flex: 1 自适应的两栏布局，或者多个 flex: 1 平分空间的等分布局。
:::

::: details 2. flex: 0 1 auto 代表什么？
**一句话答案**：flex: 0 1 auto 是 flex 的默认值，表示元素不会放大、可以缩小、初始大小由内容决定。

**详细解答**：

- `flex-grow: 0`：不放大，即使有剩余空间也保持原有大小
- `flex-shrink: 1`：空间不足时会等比缩小
- `flex-basis: auto`：基于元素的 width 属性或内容大小决定初始大小

**效果**：项目保持原有大小，只有在空间不足时才会缩小。

**面试回答**：
> flex: 0 1 auto 是 flex 的默认值。意思是元素不会主动放大去占据剩余空间，但是当容器空间不够时，元素会等比缩小。初始大小由元素的 width 或者内容决定。这个默认值比较适合内容驱动的布局，让每个元素根据自己的内容来决定大小。
:::

::: details 3. flex: 1 和 flex: auto 的区别？
**一句话答案**：flex: 1 是 flex: 1 1 0%，flex: auto 是 flex: 1 1 auto，区别在于 flex-basis 不同。

**详细解答**：

| 属性 | flex: 1 | flex: auto |
|------|---------|------------|
| 完整写法 | flex: 1 1 0% | flex: 1 1 auto |
| flex-basis | 0% | auto |
| 空间分配 | 完全平分，忽略内容大小 | 先保留内容大小，再分配剩余空间 |
| 使用场景 | 需要完全等分空间 | 需要考虑内容大小 |

**实例对比**：

```html
<style>
  .container {
    display: flex;
    width: 600px;
  }

  /* flex: 1 - 完全平分 */
  .item-1 {
    flex: 1;  /* 各占 200px，不管内容 */
  }

  /* flex: auto - 考虑内容 */
  .item-auto {
    flex: auto;  /* 先留出内容空间，再分配剩余 */
  }
</style>

<!-- flex: 1 示例 -->
<div class="container">
  <div class="item-1">短</div>
  <div class="item-1">中等长度</div>
  <div class="item-1">很长很长的内容</div>
</div>
<!-- 三个都是 200px -->

<!-- flex: auto 示例 -->
<div class="container">
  <div class="item-auto">短</div>
  <div class="item-auto">中等长度</div>
  <div class="item-auto">很长很长的内容</div>
</div>
<!-- 宽度不同，长内容会更宽 -->
```

**面试回答**：
> flex: 1 和 flex: auto 的主要区别在于 flex-basis。flex: 1 的 flex-basis 是 0%，意味着完全不考虑元素的原始大小，纯粹按比例分配空间，所以多个 flex: 1 的元素会完全平分。而 flex: auto 的 flex-basis 是 auto，会先根据内容或 width 确定基础大小，然后再分配剩余空间。实际项目中，如果要做完全等分的布局，用 flex: 1；如果希望内容多的元素自然占更多空间，用 flex: auto。
:::

::: details 4. justify-content 和 align-items 的区别？
**一句话答案**：justify-content 控制主轴方向的对齐，align-items 控制交叉轴方向的对齐。

**详细解答**：

| 属性 | 作用轴 | 控制对象 | 常用场景 |
|------|--------|----------|----------|
| justify-content | 主轴（默认水平） | 所有项目在主轴上的排列 | 控制左右对齐、居中、两端对齐等 |
| align-items | 交叉轴（默认垂直） | 单行内项目在交叉轴上的对齐 | 控制上下对齐、垂直居中等 |

**典型用法**：

```css
/* 水平垂直居中 */
.container {
  display: flex;
  justify-content: center;  /* 主轴（水平）居中 */
  align-items: center;      /* 交叉轴（垂直）居中 */
  height: 300px;
}

/* 左右两端对齐，垂直居中 */
.container {
  display: flex;
  justify-content: space-between;  /* 主轴两端对齐 */
  align-items: center;              /* 交叉轴居中 */
}
```

**注意事项**：当 `flex-direction: column` 时，主轴变为垂直方向，justify-content 控制垂直对齐，align-items 控制水平对齐。

**面试回答**：
> justify-content 和 align-items 分别控制主轴和交叉轴的对齐方式。默认情况下，主轴是水平的，所以 justify-content 控制左右对齐，align-items 控制上下对齐。最常用的组合是两者都设为 center，实现完美的水平垂直居中。需要注意的是，当 flex-direction 改为 column 时，主轴变成垂直的，这时候两个属性的作用方向会互换。
:::

::: details 5. align-items 和 align-content 的区别？
**一句话答案**：align-items 控制单行内项目的对齐，align-content 控制多行之间的对齐，只在多行时有效。

**详细解答**：

| 属性 | 适用场景 | 作用对象 | 是否需要换行 |
|------|----------|----------|--------------|
| align-items | 单行或多行 | 控制每一行内的项目对齐 | 否 |
| align-content | 仅多行 | 控制所有行之间的整体对齐 | 是（需要 flex-wrap: wrap） |

**示例对比**：

```css
/* 单行布局：只用 align-items */
.container {
  display: flex;
  align-items: center;  /* 项目在这一行内垂直居中 */
}

/* 多行布局：两者配合使用 */
.container {
  display: flex;
  flex-wrap: wrap;
  height: 400px;
  align-items: center;      /* 每行内的项目垂直居中 */
  align-content: center;    /* 所有行整体在容器内垂直居中 */
}
```

**可视化理解**：

```
align-items: center (单行)
+------------------+
|                  |
|  [1] [2] [3]     | <- 项目在行内居中
|                  |
+------------------+

align-content: center (多行)
+------------------+
|                  |
|  [1] [2] [3]     | <- 第一行
|  [4] [5] [6]     | <- 第二行（所有行整体居中）
|                  |
+------------------+
```

**面试回答**：
> align-items 和 align-content 都是控制交叉轴对齐的，但作用对象不同。align-items 控制的是每一行内的项目对齐，不管是单行还是多行都有效。而 align-content 控制的是多行之间的对齐，只有在设置了 flex-wrap: wrap 并且实际产生了多行时才会生效。举个例子，align-items: center 让每行的项目在该行内垂直居中，而 align-content: center 让所有行整体在容器内垂直居中。单行布局只需要 align-items，多行布局可能两者都需要。
:::

::: details 6. 如何实现左侧固定、右侧自适应的两栏布局？
**一句话答案**：左侧设置固定宽度或 flex: 0 0 200px，右侧设置 flex: 1 自适应。

**详细解答**：

**方法一：width + flex: 1**

```css
.container {
  display: flex;
}

.left {
  width: 200px;  /* 固定 200px */
  background: #3498db;
}

.right {
  flex: 1;  /* 占据剩余空间 */
  background: #2ecc71;
}
```

**方法二：flex: 0 0 200px + flex: 1**

```css
.container {
  display: flex;
}

.left {
  flex: 0 0 200px;  /* 不放大、不缩小、固定 200px */
  background: #3498db;
}

.right {
  flex: 1;  /* 自适应 */
  background: #2ecc71;
}
```

**方法三：flex-basis**

```css
.container {
  display: flex;
}

.left {
  flex-basis: 200px;
  flex-shrink: 0;  /* 防止缩小 */
  background: #3498db;
}

.right {
  flex: 1;
  background: #2ecc71;
}
```

**面试回答**：
> 实现两栏布局很简单，容器设置 display: flex，左侧可以直接用 width: 200px 固定宽度，也可以用 flex: 0 0 200px 更明确地表示不伸缩。右侧设置 flex: 1 就会自动占据所有剩余空间。我个人更推荐用 flex: 0 0 200px 这种写法，语义更清晰，表示左侧完全不参与伸缩。这个布局在实际项目中非常常见，比如管理后台的侧边栏菜单和主内容区。
:::

::: details 7. Flex 布局如何实现换行？
**一句话答案**：在容器上设置 flex-wrap: wrap，并控制每个项目的宽度或 flex-basis。

**详细解答**：

**基础换行**：

```css
.container {
  display: flex;
  flex-wrap: wrap;  /* 允许换行 */
}

.item {
  width: 200px;  /* 超过容器宽度时自动换行 */
}
```

**控制每行显示固定个数**：

```css
/* 每行显示 3 个 */
.container {
  display: flex;
  flex-wrap: wrap;
}

.item {
  flex: 0 0 calc(33.333% - 20px);  /* 减去 margin */
  margin: 10px;
}

/* 每行显示 4 个 */
.item {
  flex: 0 0 calc(25% - 20px);
}

/* 使用 gap 属性（推荐） */
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.item {
  flex: 0 0 calc(25% - 15px);  /* gap 会自动处理间距 */
}
```

**响应式换行**：

```css
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.item {
  flex: 0 0 calc(25% - 15px);  /* 默认 4 列 */
  min-width: 200px;
}

@media (max-width: 768px) {
  .item {
    flex: 0 0 calc(50% - 10px);  /* 小屏 2 列 */
  }
}

@media (max-width: 480px) {
  .item {
    flex: 0 0 100%;  /* 超小屏 1 列 */
  }
}
```

**面试回答**：
> Flex 实现换行需要在容器上设置 flex-wrap: wrap。然后通过控制每个项目的宽度来决定何时换行。如果要实现每行固定显示几个，可以用 calc() 计算，比如每行 3 个就设置 flex: 0 0 calc(33.333% - gap)。现在推荐用 gap 属性来处理间距，比传统的 margin 更简洁。结合媒体查询可以轻松实现响应式的多列布局，这在卡片列表、商品列表等场景很常用。
:::

::: details 8. 如何让最后一个元素靠右对齐？
**一句话答案**：给最后一个元素设置 margin-left: auto，或使用 justify-content: space-between。

**详细解答**：

**方法一：margin-left: auto（推荐）**

```css
.container {
  display: flex;
}

.item:last-child {
  margin-left: auto;  /* 自动占据左侧所有剩余空间 */
}
```

**方法二：justify-content: space-between**

```css
.container {
  display: flex;
  justify-content: space-between;
}
/* 前面的元素左对齐，最后一个元素右对齐 */
```

**方法三：嵌套 Flex 容器**

```css
.container {
  display: flex;
  justify-content: space-between;
}

.left-group {
  display: flex;
  gap: 10px;
}

.right-item {
  /* 自动靠右 */
}
```

**实际场景**：

```html
<!-- 导航栏：左侧 logo 和菜单，右侧登录按钮 -->
<style>
  .nav {
    display: flex;
    align-items: center;
  }

  .logo, .menu {
    margin-right: 20px;
  }

  .login {
    margin-left: auto;  /* 自动推到最右边 */
  }
</style>

<div class="nav">
  <div class="logo">Logo</div>
  <div class="menu">菜单</div>
  <button class="login">登录</button>
</div>
```

**面试回答**：
> 让最后一个元素靠右对齐，最简单的方法是给它设置 margin-left: auto。这利用了 Flex 布局中 auto margin 会自动占据剩余空间的特性。这种方法很灵活，不影响其他元素的排列。另一种方法是用 justify-content: space-between，但这会让所有元素两端对齐。实际项目中我更常用 margin-left: auto，比如导航栏里左边放 logo 和菜单，右边放登录按钮，就是这么实现的。
:::

::: details 9. Flex 项目设置 margin: auto 会怎样？
**一句话答案**：在 Flex 布局中，margin: auto 会自动占据剩余空间，可以用来实现各种对齐效果。

**详细解答**：

在 Flex 容器中，设置了 `margin: auto` 的项目会吸收对应方向上的所有剩余空间。

**各种对齐效果**：

```css
/* 水平垂直居中 */
.item {
  margin: auto;
}

/* 右对齐 */
.item {
  margin-left: auto;
}

/* 底部对齐 */
.item {
  margin-top: auto;
}

/* 右下角对齐 */
.item {
  margin-left: auto;
  margin-top: auto;
}

/* 左右居中 */
.item {
  margin-left: auto;
  margin-right: auto;
}
```

**实际应用**：

```html
<!-- 页面底部固定按钮 -->
<style>
  .page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .footer {
    margin-top: auto;  /* 自动推到底部 */
  }
</style>

<div class="page">
  <header>Header</header>
  <main>Content</main>
  <footer class="footer">Footer</footer>
</div>
```

**原理**：Flex 容器会将剩余空间分配给设置了 `auto` 的 margin，这个特性比 justify-content 和 align-items 更灵活。

**面试回答**：
> 在 Flex 布局中，margin: auto 有特殊作用，它会自动吸收对应方向的所有剩余空间。比如 margin-left: auto 会让元素靠右，margin-top: auto 会让元素靠下，margin: auto 则是完全居中。这个特性非常实用，比 justify-content 和 align-items 更灵活。我在项目中经常用它来实现导航栏右侧按钮、页面底部固定元素等效果。它的原理是 Flex 容器会把剩余空间分配给 auto margin，这是 Flex 布局的一个强大特性。
:::

::: details 10. Flex 布局的优缺点是什么？
**一句话答案**：Flex 布局简单灵活、适合一维布局，但不适合复杂的二维网格布局。

**详细解答**：

**优点**：

1. **简单易用**：几行代码就能实现复杂对齐
2. **响应式友好**：自动适应不同屏幕尺寸
3. **灵活伸缩**：自动分配空间，弹性调整
4. **对齐能力强**：轻松实现各种对齐效果
5. **方向灵活**：支持水平和垂直布局
6. **顺序可控**：通过 order 改变显示顺序
7. **兼容性好**：现代浏览器全面支持

**缺点**：

1. **一维布局**：只能处理一个方向（行或列），不适合复杂网格
2. **性能问题**：大量元素时可能影响性能
3. **兼容性**：IE 10 以下不支持
4. **对齐限制**：某些复杂对齐场景需要嵌套

**适用场景**：

```css
/* 适合 Flex 的场景 */
- 导航栏布局
- 垂直居中
- 等分布局
- 卡片列表
- 表单对齐
- 移动端布局

/* 不适合 Flex 的场景 */
- 复杂的网格布局（用 Grid）
- 瀑布流布局（用 CSS Grid 或 JavaScript）
- 报纸式多列布局（用 CSS Multi-column）
```

**Flex vs Grid**：

| 特性 | Flex | Grid |
|------|------|------|
| 维度 | 一维（行或列） | 二维（行和列） |
| 适用场景 | 组件内部布局 | 页面整体布局 |
| 学习曲线 | 简单 | 稍复杂 |
| 浏览器支持 | 更早 | 较晚 |

**面试回答**：
> Flex 布局的最大优点是简单灵活，几行代码就能实现水平垂直居中、等分布局等常见需求，而且响应式效果很好。它特别适合一维布局，比如导航栏、卡片列表、表单对齐等场景。但它的缺点是只能处理一维布局，对于复杂的二维网格就显得力不从心了。另外 IE 10 以下不支持，不过现在基本不需要考虑了。实际项目中，我会用 Flex 做组件内部布局，用 Grid 做页面整体布局，两者结合使用效果最好。
:::

::: details 11. space-between、space-around、space-evenly 的区别？
**一句话答案**：三者都是 justify-content 的值，区别在于空白间距的分配方式不同。

**详细解答**：

**可视化对比**：

```
space-between:  [1]    间距2    [2]    间距2    [3]
两端无间距，项目之间间距相等

space-around:   间距1  [1]  间距2  [2]  间距2  [3]  间距1
每个项目两侧间距相等，所以项目之间是两端的 2 倍

space-evenly:   间距1  [1]  间距1  [2]  间距1  [3]  间距1
所有间距完全相等，包括两端
```

**计算公式**：

```
假设容器宽度 600px，3 个项目各 100px，剩余空间 300px

space-between:
- 间距数量：2（n-1）
- 每个间距：300 / 2 = 150px
- 两端间距：0

space-around:
- 间距数量：6（每个项目两侧各 1，共 2n）
- 每个间距：300 / 6 = 50px
- 项目间距：50 * 2 = 100px
- 两端间距：50px

space-evenly:
- 间距数量：4（n+1）
- 每个间距：300 / 4 = 75px
- 所有间距相等：75px
```

**实际应用**：

```css
/* 导航栏：两端对齐 */
.nav {
  display: flex;
  justify-content: space-between;
}

/* 卡片列表：项目均匀分布 */
.card-list {
  display: flex;
  justify-content: space-around;
}

/* 按钮组：完全平均间距 */
.button-group {
  display: flex;
  justify-content: space-evenly;
}
```

**面试回答**：
> 这三个值都是用来分配剩余空间的，区别在于间距的计算方式。space-between 是两端对齐，项目之间平分空间，两端没有间距，最常用。space-around 是每个项目两侧间距相等，所以项目之间的间距是两端的 2 倍。space-evenly 是所有间距完全相等，包括两端，视觉效果最均匀。实际项目中，导航栏常用 space-between 两端对齐，卡片列表用 space-around 或 space-evenly 看起来更均衡。需要注意 space-evenly 兼容性稍差，IE 和旧版浏览器不支持。
:::

::: details 12. Flex 布局如何实现完美的垂直居中？
**一句话答案**：容器设置 display: flex、justify-content: center、align-items: center。

**详细解答**：

**方法一：justify-content + align-items（最常用）**

```css
.container {
  display: flex;
  justify-content: center;  /* 主轴居中 */
  align-items: center;      /* 交叉轴居中 */
  height: 300px;
}
```

**方法二：margin: auto**

```css
.container {
  display: flex;
  height: 300px;
}

.item {
  margin: auto;  /* 自动占据所有方向的剩余空间 */
}
```

**方法三：align-self（单个元素）**

```css
.container {
  display: flex;
  justify-content: center;
  height: 300px;
}

.item {
  align-self: center;
}
```

**各种居中场景**：

```css
/* 水平居中 */
.container {
  display: flex;
  justify-content: center;
}

/* 垂直居中 */
.container {
  display: flex;
  align-items: center;
  height: 300px;
}

/* 完美居中（水平+垂直） */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

/* 多个元素同时居中 */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;  /* 元素之间有间距 */
}
```

**实际应用**：

```html
<!-- 登录框居中 -->
<style>
  .login-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: #f5f5f5;
  }

  .login-box {
    width: 400px;
    padding: 40px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
</style>

<div class="login-wrapper">
  <div class="login-box">
    <h2>登录</h2>
    <form>...</form>
  </div>
</div>
```

**面试回答**：
> Flex 实现垂直居中非常简单，容器设置 display: flex、justify-content: center、align-items: center 就可以了，这是最常用的方法。另一种方法是给要居中的元素设置 margin: auto，利用 auto margin 会自动占据剩余空间的特性。这两种方法都很简洁，比传统的 position + transform 或者 table-cell 方案要优雅得多。实际项目中，像登录框、弹窗、空状态页面等都经常用这种方式居中，简单可靠。
:::

## 总结

::: details Flex 核心要点
1. **容器属性**：控制整体布局
   - `flex-direction`：主轴方向（row/column）
   - `flex-wrap`：是否换行（nowrap/wrap）
   - `justify-content`：主轴对齐（center/space-between/space-around/space-evenly）
   - `align-items`：交叉轴对齐（center/flex-start/flex-end）
   - `align-content`：多行对齐（仅在多行时有效）

2. **项目属性**：控制单个项目
   - `flex`：伸缩比例（常用 `flex: 1`）
   - `flex-grow`：放大比例
   - `flex-shrink`：缩小比例
   - `flex-basis`：基准大小
   - `order`：排列顺序
   - `align-self`：单独对齐

3. **常用简写**：
   - `flex: 1` = `flex: 1 1 0%`（平分空间）
   - `flex: auto` = `flex: 1 1 auto`（考虑内容）
   - `flex: none` = `flex: 0 0 auto`（不伸缩）

4. **常用场景**：
   - 水平垂直居中：`justify-content: center` + `align-items: center`
   - 两栏布局：左侧固定宽度，右侧 `flex: 1`
   - 等分布局：所有项目 `flex: 1`
   - 底部固定：`flex-direction: column` + 主内容 `flex: 1`
:::

::: details 最佳实践
1. **优先使用简写属性**：`flex: 1` 代替 `flex-grow: 1`
2. **用 gap 替代 margin**：更简洁的间距控制
3. **配合 Grid 使用**：Flex 做组件布局，Grid 做页面布局
4. **注意语义化**：`flex: 0 0 200px` 比 `width: 200px` 更明确
5. **善用 auto margin**：实现灵活的对齐效果
:::

::: details 兼容性
- 现代浏览器：完全支持
- IE 11+：完全支持
- IE 10：需要 `-ms-` 前缀
- 移动端：完全支持
:::

## 参考资料

- [MDN - Flex 布局](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout)
- [Flexbox Froggy](https://flexboxfroggy.com/) - 通过游戏学习 Flex
- [A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
