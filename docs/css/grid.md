# Grid 网格布局

CSS Grid 是一个强大的二维布局系统，可以同时处理行和列，是构建复杂网页布局的理想选择。

## Grid 基本概念

### 核心术语

```
+----------------------------------------+
|  Grid Container (网格容器)             |
|  +----------------------------------+  |
|  | Grid Line (网格线)               |  |
|  |  +-------+  +-------+  +-------+ |  |
|  |  | Cell  |  | Cell  |  | Cell  | |  | ← Grid Track (网格轨道)
|  |  +-------+  +-------+  +-------+ |  |
|  |  +-------+  +-------+  +-------+ |  |
|  |  | Item  |  | Item  |  | Item  | |  |
|  |  +-------+  +-------+  +-------+ |  |
|  |     ↑                              |  |
|  |  Grid Gap (网格间距)              |  |
|  +----------------------------------+  |
+----------------------------------------+
```

- **Grid Container（网格容器）**：设置了 `display: grid` 的父元素
- **Grid Item（网格项目）**：容器的直接子元素
- **Grid Line（网格线）**：构成网格的分界线（行线和列线）
- **Grid Track（网格轨道）**：两条相邻网格线之间的空间（行或列）
- **Grid Cell（网格单元格）**：两条相邻行线和两条相邻列线之间的空间
- **Grid Area（网格区域）**：四条网格线包围的总空间

### 启用 Grid 布局

```css
/* 块级 Grid 容器 */
.container {
  display: grid;
}

/* 行内 Grid 容器 */
.container {
  display: inline-grid;
}
```

## 容器属性

### 1. grid-template-columns / grid-template-rows

定义网格的列宽和行高。

```css
.container {
  /* 固定宽度 */
  grid-template-columns: 100px 200px 100px;
  grid-template-rows: 50px 100px;

  /* 百分比 */
  grid-template-columns: 25% 50% 25%;

  /* fr 单位（等分剩余空间） */
  grid-template-columns: 1fr 2fr 1fr;  /* 1:2:1 分配 */

  /* repeat() 函数 */
  grid-template-columns: repeat(3, 1fr);  /* 3 列，每列 1fr */
  grid-template-columns: repeat(3, 100px);  /* 3 列，每列 100px */

  /* auto-fill（自动填充） */
  grid-template-columns: repeat(auto-fill, 200px);

  /* auto-fit（自动适配） */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

  /* minmax() 函数 */
  grid-template-columns: minmax(100px, 1fr) 200px minmax(100px, 1fr);
}
```

**示例**：

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .grid-container {
      display: grid;
      grid-template-columns: 100px 200px 100px;
      grid-template-rows: 80px 100px;
      gap: 10px;
      background: #ecf0f1;
      padding: 10px;
      margin-bottom: 20px;
    }

    .grid-item {
      background: #3498db;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="grid-container">
    <div class="grid-item">1</div>
    <div class="grid-item">2</div>
    <div class="grid-item">3</div>
    <div class="grid-item">4</div>
    <div class="grid-item">5</div>
    <div class="grid-item">6</div>
  </div>
</body>
</html>
```

**fr 单位示例**：

```html
<style>
  .grid-fr {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;  /* 1:2:1 分配 */
    gap: 10px;
    background: #ecf0f1;
    padding: 10px;
  }

  .item {
    background: #e74c3c;
    color: white;
    padding: 20px;
    text-align: center;
  }
</style>

<div class="grid-fr">
  <div class="item">1fr</div>
  <div class="item">2fr</div>
  <div class="item">1fr</div>
</div>
<!-- 如果容器宽度 400px，分配为：100px, 200px, 100px -->
```

**repeat() 函数示例**：

```css
/* 创建 12 列网格 */
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
}

/* 创建响应式网格（自动填充） */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
```

### 2. gap (grid-gap)

定义网格间距（行间距和列间距）。

```css
.container {
  /* 行间距和列间距相同 */
  gap: 10px;

  /* 分别设置行间距和列间距 */
  gap: 10px 20px;  /* row-gap column-gap */

  /* 单独设置 */
  row-gap: 10px;
  column-gap: 20px;

  /* 旧语法（兼容性） */
  grid-gap: 10px;
  grid-row-gap: 10px;
  grid-column-gap: 20px;
}
```

**示例**：

```html
<style>
  .grid-gap {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;  /* 网格间距 20px */
    background: #ecf0f1;
    padding: 10px;
  }

  .item {
    background: #2ecc71;
    height: 100px;
  }
</style>

<div class="grid-gap">
  <div class="item"></div>
  <div class="item"></div>
  <div class="item"></div>
  <div class="item"></div>
  <div class="item"></div>
  <div class="item"></div>
</div>
```

### 3. grid-template-areas

通过命名网格区域来定义网格布局。

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: 80px 1fr 60px;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
}

/* 项目通过 grid-area 放置到对应区域 */
.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
```

**完整示例**：

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .page-layout {
      display: grid;
      grid-template-columns: 200px 1fr 200px;
      grid-template-rows: 80px 1fr 60px;
      grid-template-areas:
        "header header header"
        "sidebar main aside"
        "footer footer footer";
      gap: 10px;
      height: 100vh;
      padding: 10px;
    }

    .header {
      grid-area: header;
      background: #3498db;
      color: white;
      display: flex;
      align-items: center;
      padding: 0 20px;
      font-size: 24px;
    }

    .sidebar {
      grid-area: sidebar;
      background: #2ecc71;
      padding: 20px;
    }

    .main {
      grid-area: main;
      background: #ecf0f1;
      padding: 20px;
    }

    .aside {
      grid-area: aside;
      background: #e74c3c;
      padding: 20px;
      color: white;
    }

    .footer {
      grid-area: footer;
      background: #34495e;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div class="page-layout">
    <header class="header">Header</header>
    <aside class="sidebar">Sidebar</aside>
    <main class="main">Main Content</main>
    <aside class="aside">Aside</aside>
    <footer class="footer">Footer</footer>
  </div>
</body>
</html>
```

**使用 . 表示空单元格**：

```css
.container {
  grid-template-areas:
    "header header header"
    "sidebar main ."     /* . 表示空单元格 */
    "footer footer footer";
}
```

### 4. justify-items / align-items

设置网格项目在单元格内的对齐方式。

```css
.container {
  /* 水平对齐（行轴） */
  justify-items: start;    /* 起点对齐 */
  justify-items: end;      /* 终点对齐 */
  justify-items: center;   /* 居中对齐 */
  justify-items: stretch;  /* 默认值，拉伸填满 */

  /* 垂直对齐（列轴） */
  align-items: start;
  align-items: end;
  align-items: center;
  align-items: stretch;   /* 默认值 */

  /* 简写 */
  place-items: center;    /* 水平垂直居中 */
  place-items: center start;  /* align-items justify-items */
}
```

**示例**：

```html
<style>
  .grid-align {
    display: grid;
    grid-template-columns: repeat(3, 150px);
    grid-template-rows: repeat(2, 150px);
    gap: 10px;
    justify-items: center;  /* 水平居中 */
    align-items: center;    /* 垂直居中 */
    background: #ecf0f1;
    padding: 10px;
  }

  .item {
    width: 80px;
    height: 80px;
    background: #3498db;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>

<div class="grid-align">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
  <div class="item">5</div>
  <div class="item">6</div>
</div>
```

### 5. justify-content / align-content

设置整个网格在容器内的对齐方式（当网格总大小小于容器时）。

```css
.container {
  /* 水平对齐 */
  justify-content: start;
  justify-content: end;
  justify-content: center;
  justify-content: stretch;
  justify-content: space-around;
  justify-content: space-between;
  justify-content: space-evenly;

  /* 垂直对齐 */
  align-content: start;
  align-content: end;
  align-content: center;
  align-content: stretch;
  align-content: space-around;
  align-content: space-between;
  align-content: space-evenly;

  /* 简写 */
  place-content: center;
}
```

### 6. grid-auto-flow

控制自动放置项目的算法。

```css
.container {
  grid-auto-flow: row;        /* 默认值，按行填充 */
  grid-auto-flow: column;     /* 按列填充 */
  grid-auto-flow: row dense;  /* 按行，尽可能填满空隙 */
  grid-auto-flow: column dense;
}
```

**示例**：

```html
<style>
  .grid-flow {
    display: grid;
    grid-template-columns: repeat(3, 100px);
    grid-auto-flow: row;  /* 或 column */
    gap: 10px;
  }

  .item:nth-child(1) {
    grid-column: span 2;  /* 占据 2 列 */
  }
</style>

<div class="grid-flow">
  <div class="item">1 (span 2)</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
</div>
```

## 项目属性

### 1. grid-column / grid-row

指定项目所在的网格线，从而确定项目位置。

```css
.item {
  /* 指定列的起始和结束线 */
  grid-column-start: 1;
  grid-column-end: 3;
  /* 简写 */
  grid-column: 1 / 3;

  /* 指定行的起始和结束线 */
  grid-row-start: 1;
  grid-row-end: 3;
  /* 简写 */
  grid-row: 1 / 3;

  /* 使用 span 关键字（跨越） */
  grid-column: 1 / span 2;  /* 从第 1 条线开始，跨越 2 列 */
  grid-row: 1 / span 2;     /* 从第 1 条线开始，跨越 2 行 */

  /* 简写形式 */
  grid-column: span 2;  /* 跨越 2 列 */
}
```

**示例**：

```html
<style>
  .grid-placement {
    display: grid;
    grid-template-columns: repeat(4, 100px);
    grid-template-rows: repeat(3, 100px);
    gap: 10px;
    background: #ecf0f1;
    padding: 10px;
  }

  .item {
    background: #3498db;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .item1 {
    grid-column: 1 / 3;  /* 跨越第 1-2 列 */
    grid-row: 1 / 2;
    background: #e74c3c;
  }

  .item2 {
    grid-column: 3 / 5;  /* 跨越第 3-4 列 */
    grid-row: 1 / 3;     /* 跨越第 1-2 行 */
    background: #2ecc71;
  }

  .item3 {
    grid-column: 1 / 3;
    grid-row: 2 / 4;     /* 跨越第 2-3 行 */
    background: #9b59b6;
  }
</style>

<div class="grid-placement">
  <div class="item item1">1 (2列)</div>
  <div class="item item2">2 (2列2行)</div>
  <div class="item item3">3 (2列2行)</div>
  <div class="item">4</div>
  <div class="item">5</div>
  <div class="item">6</div>
</div>
```

### 2. grid-area

指定项目放置在哪个区域，或作为简写属性。

```css
/* 方式1: 使用命名区域 */
.item {
  grid-area: header;
}

/* 方式2: 简写形式 */
.item {
  /* grid-area: row-start / column-start / row-end / column-end */
  grid-area: 1 / 1 / 3 / 3;
}
```

### 3. justify-self / align-self

设置单个项目在单元格内的对齐方式。

```css
.item {
  /* 水平对齐 */
  justify-self: start;
  justify-self: end;
  justify-self: center;
  justify-self: stretch;  /* 默认值 */

  /* 垂直对齐 */
  align-self: start;
  align-self: end;
  align-self: center;
  align-self: stretch;

  /* 简写 */
  place-self: center;
  place-self: center start;
}
```

## Grid 与 Flex 对比

| 特性 | Grid | Flex |
|------|------|------|
| **维度** | 二维（行和列） | 一维（行或列） |
| **适用场景** | 页面整体布局 | 组件内部布局 |
| **对齐方式** | 二维对齐 | 一维对齐 |
| **灵活性** | 更强大，但稍复杂 | 简单直观 |
| **浏览器支持** | IE 11+（部分支持） | IE 11+ |
| **学习曲线** | 较陡 | 较平缓 |

**使用建议**：

```css
/* Grid: 页面级布局 */
.page {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}

/* Flex: 组件级布局 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card {
  display: flex;
  flex-direction: column;
}
```

## 实际应用

### 1. 响应式图片墙

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .image-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      padding: 20px;
    }

    .image-item {
      aspect-ratio: 1;
      background: #3498db;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
    }

    .image-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* 特色项目跨越更多空间 */
    .image-item:nth-child(5n) {
      grid-column: span 2;
      grid-row: span 2;
    }
  </style>
</head>
<body>
  <div class="image-gallery">
    <div class="image-item">1</div>
    <div class="image-item">2</div>
    <div class="image-item">3</div>
    <div class="image-item">4</div>
    <div class="image-item">5 (大)</div>
    <div class="image-item">6</div>
    <div class="image-item">7</div>
    <div class="image-item">8</div>
  </div>
</body>
</html>
```

### 2. 圣杯布局

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .holy-grail {
      display: grid;
      grid-template-columns: 200px 1fr 200px;
      grid-template-rows: auto 1fr auto;
      grid-template-areas:
        "header header header"
        "nav main aside"
        "footer footer footer";
      gap: 10px;
      min-height: 100vh;
      padding: 10px;
    }

    .header { grid-area: header; background: #3498db; padding: 20px; }
    .nav { grid-area: nav; background: #2ecc71; padding: 20px; }
    .main { grid-area: main; background: #ecf0f1; padding: 20px; }
    .aside { grid-area: aside; background: #e74c3c; padding: 20px; }
    .footer { grid-area: footer; background: #34495e; padding: 20px; color: white; }

    /* 响应式：小屏幕单列布局 */
    @media (max-width: 768px) {
      .holy-grail {
        grid-template-columns: 1fr;
        grid-template-areas:
          "header"
          "nav"
          "main"
          "aside"
          "footer";
      }
    }
  </style>
</head>
<body>
  <div class="holy-grail">
    <header class="header">Header</header>
    <nav class="nav">Navigation</nav>
    <main class="main">Main Content</main>
    <aside class="aside">Aside</aside>
    <footer class="footer">Footer</footer>
  </div>
</body>
</html>
```

### 3. 卡片网格

```html
<style>
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    padding: 30px;
  }

  .card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    overflow: hidden;
    transition: transform 0.3s;
  }

  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0,0,0,0.15);
  }

  .card-image {
    height: 200px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .card-content {
    padding: 20px;
  }
</style>

<div class="card-grid">
  <div class="card">
    <div class="card-image"></div>
    <div class="card-content">
      <h3>Card Title 1</h3>
      <p>Card description goes here...</p>
    </div>
  </div>
  <!-- 更多卡片... -->
</div>
```

### 4. 12列网格系统

```css
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
}

/* 占据不同列数 */
.col-1 { grid-column: span 1; }
.col-2 { grid-column: span 2; }
.col-3 { grid-column: span 3; }
.col-4 { grid-column: span 4; }
.col-6 { grid-column: span 6; }
.col-8 { grid-column: span 8; }
.col-12 { grid-column: span 12; }
```

```html
<div class="grid-12">
  <div class="col-12">Full Width</div>
  <div class="col-6">Half Width</div>
  <div class="col-6">Half Width</div>
  <div class="col-4">1/3 Width</div>
  <div class="col-4">1/3 Width</div>
  <div class="col-4">1/3 Width</div>
</div>
```

### 5. 复杂仪表板布局

```html
<style>
  .dashboard {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: auto 200px 200px 200px;
    gap: 20px;
    padding: 20px;
  }

  .widget {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 20px;
  }

  .widget-header { grid-column: 1 / -1; }
  .widget-chart { grid-column: span 2; grid-row: span 2; }
  .widget-stats { grid-column: span 1; }
  .widget-table { grid-column: 1 / -1; }
</style>

<div class="dashboard">
  <div class="widget widget-header">Dashboard Header</div>
  <div class="widget widget-chart">Large Chart</div>
  <div class="widget widget-stats">Stats 1</div>
  <div class="widget widget-stats">Stats 2</div>
  <div class="widget widget-stats">Stats 3</div>
  <div class="widget widget-stats">Stats 4</div>
  <div class="widget widget-table">Data Table</div>
</div>
```

## Grid 面试题

::: details 1. Grid 和 Flex 的区别是什么？
**答案**：

| 维度 | Grid | Flex |
|------|------|------|
| 布局类型 | 二维（行和列） | 一维（行或列） |
| 使用场景 | 页面整体布局 | 组件内布局、一维排列 |
| 控制方式 | 容器控制项目位置 | 项目自身的弹性控制 |
| 复杂度 | 更强大但复杂 | 简单直观 |
| 对齐能力 | 二维精确对齐 | 一维灵活对齐 |

**选择建议**：
- 页面布局、二维排列 → Grid
- 组件布局、一维排列 → Flex
- 两者可以嵌套使用
:::

::: details 2. fr 单位是什么？
**答案**：

`fr`（fraction，分数）是 Grid 布局特有的单位，表示可用空间的一份。

```css
.container {
  grid-template-columns: 1fr 2fr 1fr;
}
/* 三列比例为 1:2:1 */
```

**计算方式**：
1. 先计算固定尺寸（px、%等）
2. 剩余空间按 fr 比例分配

```css
.container {
  width: 400px;
  grid-template-columns: 100px 1fr 2fr;
}
/* 100px 固定，剩余 300px 按 1:2 分配
   结果：100px, 100px, 200px */
```
:::

::: details 3. repeat() 函数的作用？
**答案**：

`repeat()` 用于简化重复的网格定义。

```css
/* 基础用法 */
grid-template-columns: repeat(3, 1fr);
/* 等同于 */
grid-template-columns: 1fr 1fr 1fr;

/* 重复多个值 */
grid-template-columns: repeat(2, 100px 200px);
/* 等同于 */
grid-template-columns: 100px 200px 100px 200px;

/* auto-fill: 自动填充 */
grid-template-columns: repeat(auto-fill, 200px);
/* 根据容器宽度自动创建尽可能多的 200px 列 */

/* auto-fit: 自动适配（会拉伸） */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
/* 自动适配，每列最小 200px，最大 1fr */
```
:::

::: details 4. auto-fill 和 auto-fit 的区别？
**答案**：

```css
/* auto-fill: 保留空轨道 */
.container {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
/* 如果空间足够，会创建空的网格轨道 */

/* auto-fit: 折叠空轨道 */
.container {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
/* 空轨道会被折叠，剩余项目拉伸填满 */
```

**区别**：
- `auto-fill`：尽可能多地创建轨道，即使是空的
- `auto-fit`：只创建需要的轨道，剩余空间由项目填充

**使用场景**：
- 固定大小项目 → `auto-fill`
- 响应式弹性项目 → `auto-fit`
:::

::: details 5. 如何实现响应式网格布局？
**答案**：

```css
/* 方法1: auto-fit + minmax */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
/* 自动适应，每列最小 250px */

/* 方法2: 媒体查询 */
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

/* 方法3: grid-template-areas */
.layout {
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
}

@media (max-width: 768px) {
  .layout {
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "aside"
      "footer";
  }
}
```
:::

::: details 6. grid-template-areas 的优势是什么？
**答案**：

**优势**：
1. **直观可视**：代码结构直观反映布局
2. **命名语义**：使用有意义的区域名称
3. **易于调整**：修改布局只需调整 areas
4. **响应式友好**：媒体查询中易于重排

```css
.layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav main aside"
    "footer footer footer";
}

/* 项目绑定区域 */
.header { grid-area: header; }
.nav { grid-area: nav; }
/* ... */
```
:::

::: details 7. 如何实现网格项目的跨行跨列？
**答案**：

```css
/* 方法1: grid-column / grid-row */
.item {
  grid-column: 1 / 3;  /* 跨越 2 列 */
  grid-row: 1 / 3;     /* 跨越 2 行 */
}

/* 方法2: span 关键字 */
.item {
  grid-column: span 2;  /* 跨越 2 列 */
  grid-row: span 2;     /* 跨越 2 行 */
}

/* 方法3: grid-area 简写 */
.item {
  /* row-start / col-start / row-end / col-end */
  grid-area: 1 / 1 / 3 / 3;
}
```
:::

::: details 8. Grid 的兼容性如何？
**答案**：

| 浏览器 | 支持情况 | 备注 |
|--------|----------|------|
| Chrome | 57+ | 完全支持 |
| Firefox | 52+ | 完全支持 |
| Safari | 10.1+ | 完全支持 |
| Edge | 16+ | 完全支持 |
| IE | 11 | 部分支持（旧语法） |

**兼容性建议**：
- 现代浏览器：完全支持，放心使用
- IE 11：使用 Autoprefixer，但功能有限
- 旧浏览器：使用 Flex 或浮动作为降级方案

```css
/* 使用 @supports 进行特性检测 */
.layout {
  /* 降级方案 */
  display: flex;
  flex-wrap: wrap;
}

@supports (display: grid) {
  .layout {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}
```
:::

::: details 9. 实现一个圣杯布局（头部、三栏、底部）
**答案**：

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .container {
      display: grid;
      grid-template-columns: 200px 1fr 200px;
      grid-template-rows: 80px 1fr 60px;
      grid-template-areas:
        "header header header"
        "sidebar main aside"
        "footer footer footer";
      min-height: 100vh;
    }

    .header { grid-area: header; }
    .sidebar { grid-area: sidebar; }
    .main { grid-area: main; }
    .aside { grid-area: aside; }
    .footer { grid-area: footer; }

    @media (max-width: 768px) {
      .container {
        grid-template-columns: 1fr;
        grid-template-areas:
          "header"
          "main"
          "sidebar"
          "aside"
          "footer";
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">Header</header>
    <aside class="sidebar">Sidebar</aside>
    <main class="main">Main</main>
    <aside class="aside">Aside</aside>
    <footer class="footer">Footer</footer>
  </div>
</body>
</html>
```
:::

::: details 10. Grid 和 Table 的区别？
**答案**：

| 特性 | Grid | Table |
|------|------|-------|
| 用途 | 布局 | 表格数据 |
| 语义 | 布局语义 | 数据语义 |
| 灵活性 | 非常灵活 | 有限 |
| 跨行跨列 | 简单 | 需要 rowspan/colspan |
| 响应式 | 易于实现 | 困难 |
| 性能 | 更好 | 较差 |

**总结**：
- 用 Grid 做布局
- 用 Table 显示表格数据
- 不要用 Table 做布局（过时做法）
:::

## 总结

::: details Grid 核心要点
1. **容器属性**：
   - `grid-template-columns/rows`：定义网格
   - `gap`：间距
   - `grid-template-areas`：命名区域

2. **项目属性**：
   - `grid-column/row`：跨行跨列
   - `grid-area`：指定区域

3. **常用单位**：
   - `fr`：分数单位
   - `repeat()`：重复
   - `minmax()`：最小最大值

4. **响应式**：
   - `auto-fill/auto-fit`
   - 媒体查询
   - `grid-template-areas` 重排
:::

::: details 最佳实践
1. **页面布局优先使用 Grid**
2. **组件布局优先使用 Flex**
3. **Grid 和 Flex 可以嵌套使用**
4. **使用命名区域提升可读性**
5. **使用 auto-fit/auto-fill 实现响应式**
:::

## 参考资料

- [MDN - CSS Grid](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Grid_Layout)
- [Grid Garden](https://cssgridgarden.com/) - 通过游戏学习 Grid
- [A Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
