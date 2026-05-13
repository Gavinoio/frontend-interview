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

