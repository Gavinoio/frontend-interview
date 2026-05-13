# CSS 核心概念

CSS（Cascading Style Sheets，层叠样式表）是用于描述 HTML 或 XML 文档呈现的样式语言。本模块涵盖 CSS 的核心概念和面试高频知识点。

## CSS 简介

CSS 是前端开发三大核心技术之一，用于控制网页的视觉呈现。通过 CSS，我们可以：

- 控制元素的布局、颜色、字体等样式
- 实现响应式设计，适配不同设备
- 创建动画和过渡效果
- 提升用户体验和页面美观度

### CSS 引入方式

```html
<!-- 1. 内联样式 -->
<div style="color: red; font-size: 16px;">内联样式</div>

<!-- 2. 内部样式表 -->
<head>
  <style>
    .container {
      color: blue;
    }
  </style>
</head>

<!-- 3. 外部样式表（推荐） -->
<head>
  <link rel="stylesheet" href="styles.css">
</head>

<!-- 4. @import 导入 -->
<style>
  @import url('styles.css');
</style>
```

**优先级**：内联样式 > 内部样式 = 外部样式（后者覆盖前者）

## 盒模型

### 标准盒模型 vs IE 盒模型

CSS 盒模型是布局的基础，每个元素都可以看作是一个矩形盒子。

#### 标准盒模型（W3C 盒模型）

```
总宽度 = margin-left + border-left + padding-left + width + padding-right + border-right + margin-right
总高度 = margin-top + border-top + padding-top + height + padding-bottom + border-bottom + margin-bottom
```

**内容区域宽度 = width**

```css
.box {
  width: 200px;
  padding: 20px;
  border: 5px solid #000;
  margin: 10px;
}
/* 实际占据宽度 = 10 + 5 + 20 + 200 + 20 + 5 + 10 = 270px */
/* 内容区域宽度 = 200px */
```

#### IE 盒模型（怪异盒模型）

```
总宽度 = margin-left + width + margin-right
总高度 = margin-top + height + margin-bottom
```

**width = border + padding + 内容区域宽度**

```css
.box {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid #000;
  margin: 10px;
}
/* 实际占据宽度 = 10 + 200 + 10 = 220px */
/* 内容区域宽度 = 200 - 20*2 - 5*2 = 150px */
```

### box-sizing 属性

```css
/* 标准盒模型 */
box-sizing: content-box;

/* IE 盒模型 */
box-sizing: border-box;

/* 继承父元素 */
box-sizing: inherit;
```

**最佳实践**：全局设置 border-box

```css
* {
  box-sizing: border-box;
}

/* 或者 */
html {
  box-sizing: border-box;
}
*, *::before, *::after {
  box-sizing: inherit;
}
```

### 盒模型示例

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .standard-box {
      box-sizing: content-box;
      width: 200px;
      height: 100px;
      padding: 20px;
      border: 5px solid #3498db;
      margin: 10px;
      background: #ecf0f1;
    }

    .border-box {
      box-sizing: border-box;
      width: 200px;
      height: 100px;
      padding: 20px;
      border: 5px solid #e74c3c;
      margin: 10px;
      background: #ffeaa7;
    }
  </style>
</head>
<body>
  <div class="standard-box">标准盒模型</div>
  <div class="border-box">IE 盒模型</div>
</body>
</html>
```

## CSS 选择器

### 选择器类型

```css
/* 1. 基础选择器 */
* { }                    /* 通配符选择器 */
div { }                  /* 元素选择器 */
.class { }               /* 类选择器 */
#id { }                  /* ID 选择器 */

/* 2. 组合选择器 */
div p { }                /* 后代选择器（所有后代） */
div > p { }              /* 子选择器（直接子元素） */
div + p { }              /* 相邻兄弟选择器（紧邻的下一个） */
div ~ p { }              /* 通用兄弟选择器（后面所有兄弟） */

/* 3. 属性选择器 */
[attr] { }               /* 存在属性 */
[attr=value] { }         /* 属性值完全匹配 */
[attr^=value] { }        /* 属性值以 value 开头 */
[attr$=value] { }        /* 属性值以 value 结尾 */
[attr*=value] { }        /* 属性值包含 value */
[attr~=value] { }        /* 属性值包含完整单词 value */
[attr|=value] { }        /* 属性值以 value 或 value- 开头 */

/* 4. 伪类选择器 */
:hover { }               /* 鼠标悬停 */
:active { }              /* 激活状态 */
:focus { }               /* 获得焦点 */
:visited { }             /* 已访问链接 */
:first-child { }         /* 第一个子元素 */
:last-child { }          /* 最后一个子元素 */
:nth-child(n) { }        /* 第 n 个子元素 */
:nth-of-type(n) { }      /* 第 n 个该类型元素 */
:not(selector) { }       /* 非选择器 */

/* 5. 伪元素选择器 */
::before { }             /* 元素前插入内容 */
::after { }              /* 元素后插入内容 */
::first-letter { }       /* 首字母 */
::first-line { }         /* 首行 */
::selection { }          /* 选中的文本 */
```

### 选择器示例

```css
/* 属性选择器示例 */
input[type="text"] {
  border: 1px solid #ccc;
}

a[href^="https"] {
  color: green;
}

img[src$=".png"] {
  border: 1px solid blue;
}

/* 伪类选择器示例 */
li:first-child {
  font-weight: bold;
}

li:nth-child(odd) {
  background: #f0f0f0;
}

li:nth-child(even) {
  background: #fff;
}

/* 伪元素选择器示例 */
p::first-letter {
  font-size: 2em;
  font-weight: bold;
}

.clearfix::after {
  content: "";
  display: table;
  clear: both;
}
```

## CSS 优先级

### 优先级计算规则

CSS 优先级由四个部分组成：`(a, b, c, d)`

- **a**: 内联样式（1000）
- **b**: ID 选择器数量（100）
- **c**: 类选择器、属性选择器、伪类数量（10）
- **d**: 元素选择器、伪元素数量（1）

```css
/* 示例计算 */
div { }                          /* (0, 0, 0, 1) = 1 */
.class { }                       /* (0, 0, 1, 0) = 10 */
#id { }                          /* (0, 1, 0, 0) = 100 */
<div style="color: red;">        /* (1, 0, 0, 0) = 1000 */

div p { }                        /* (0, 0, 0, 2) = 2 */
div.class { }                    /* (0, 0, 1, 1) = 11 */
#id .class { }                   /* (0, 1, 1, 0) = 110 */
div#id.class p { }               /* (0, 1, 1, 2) = 112 */

/* !important 优先级最高 */
color: red !important;
```

### 优先级示例

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* 优先级: 1 */
    p {
      color: black;
    }

    /* 优先级: 10 */
    .text {
      color: blue;
    }

    /* 优先级: 11 */
    p.text {
      color: green;
    }

    /* 优先级: 100 */
    #content {
      color: red;
    }

    /* 优先级: 111 */
    #content p.text {
      color: purple;
    }
  </style>
</head>
<body>
  <div id="content">
    <!-- 最终颜色: purple -->
    <p class="text">这段文字是什么颜色？</p>
  </div>
</body>
</html>
```

### 优先级规则总结

1. **!important** > **内联样式** > **ID 选择器** > **类选择器** > **元素选择器**
2. 相同优先级，后定义的覆盖先定义的
3. 继承的样式优先级最低
4. 通配符 `*` 优先级为 0
5. 避免滥用 `!important`

```css
/* 优先级对比 */
div p { }                /* 0,0,0,2 */
.class p { }             /* 0,0,1,1 - 胜出 */

#id div { }              /* 0,1,0,1 - 胜出 */
.class .class div { }    /* 0,0,2,1 */

/* !important 示例 */
.text {
  color: red !important;  /* 最高优先级 */
}

#id {
  color: blue;            /* 无法覆盖 */
}
```

## 常见面试题

::: details 1. 标准盒模型和 IE 盒模型的区别？
**答案**：

- **标准盒模型**：width/height 只包含 content，不包含 padding 和 border
- **IE 盒模型**：width/height 包含 content + padding + border
- 通过 `box-sizing` 属性切换：
  - `content-box`（默认）：标准盒模型
  - `border-box`：IE 盒模型

**实际应用**：推荐全局设置 `box-sizing: border-box`，更符合直觉，便于布局计算。
:::

::: details 2. CSS 选择器有哪些？优先级如何计算？
**答案**：

选择器类型：
- 基础选择器：`*`、元素、类、ID
- 组合选择器：后代、子、相邻兄弟、通用兄弟
- 属性选择器：`[attr]`、`[attr=value]` 等
- 伪类：`:hover`、`:first-child`、`:nth-child()` 等
- 伪元素：`::before`、`::after`、`::first-letter` 等

优先级计算：
1. `!important` 最高
2. 内联样式（1000）
3. ID 选择器（100）
4. 类/属性/伪类（10）
5. 元素/伪元素（1）
6. 通配符（0）
:::

::: details 3. 如何清除浮动？
**答案**：

```css
/* 方法1: clearfix 伪元素（推荐） */
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}

/* 方法2: 触发 BFC */
.container {
  overflow: hidden;
  /* 或 overflow: auto; */
}

/* 方法3: 额外标签 */
<div style="clear: both;"></div>

/* 方法4: 父元素也浮动 */
.parent {
  float: left;
}
```
:::

::: details 4. link 和 @import 的区别？
**答案**：

| 特性 | `<link>` | `@import` |
|------|----------|-----------|
| 本质 | HTML 标签 | CSS 语法 |
| 加载时机 | 页面加载时同时加载 | 页面加载完后加载 |
| 兼容性 | 所有浏览器 | IE5+ |
| DOM 操作 | 可以通过 JS 操作 | 不支持 |
| 权重 | 相同 | 相同 |
| 推荐 | ✅ 推荐使用 | ❌ 不推荐 |
:::

::: details 5. display: none 和 visibility: hidden 的区别？
**答案**：

| 特性 | display: none | visibility: hidden |
|------|---------------|-------------------|
| 空间占用 | 不占空间 | 占据空间 |
| 重排重绘 | 触发重排和重绘 | 只触发重绘 |
| 子元素 | 子元素也不显示 | 子元素可设置 visible 显示 |
| 过渡效果 | 不支持 transition | 支持 transition |
| 事件监听 | 不触发事件 | 不触发事件 |

```css
/* 示例 */
.hidden-display {
  display: none;        /* 完全移除，不占空间 */
}

.hidden-visibility {
  visibility: hidden;   /* 隐藏但占空间 */
}

.hidden-opacity {
  opacity: 0;          /* 透明但占空间，可触发事件 */
}
```
:::

::: details 6. 如何实现一个元素的水平垂直居中？
详见 [水平垂直居中方案](./center.md)
:::

::: details 7. CSS3 新增了哪些特性？
**答案**：

1. **选择器**：`:nth-child()`、`:not()`、`::selection` 等
2. **盒模型**：`box-sizing`、`border-radius`、`box-shadow`
3. **背景**：`background-size`、`background-origin`、多背景
4. **渐变**：`linear-gradient`、`radial-gradient`
5. **转换**：`transform`（rotate、scale、translate、skew）
6. **过渡**：`transition`
7. **动画**：`@keyframes`、`animation`
8. **布局**：`flex`、`grid`
9. **媒体查询**：`@media`
10. **其他**：`filter`、`calc()`、自定义属性（CSS 变量）

```css
/* CSS3 示例 */
.box {
  /* 圆角 */
  border-radius: 10px;

  /* 阴影 */
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  /* 渐变 */
  background: linear-gradient(to right, #667eea, #764ba2);

  /* 过渡 */
  transition: all 0.3s ease;

  /* 转换 */
  transform: rotate(45deg) scale(1.2);
}

/* 动画 */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.animated {
  animation: slideIn 0.5s ease-out;
}
```
:::

::: details 8. rem、em、px、vw/vh 的区别？
详见 [响应式设计](./responsive.md)
:::

::: details 9. 什么是 BFC？如何触发 BFC？
详见 [BFC 详解](./bfc.md)
:::

::: details 10. Flex 布局和 Grid 布局的区别？
**简答**：

- **Flex**：一维布局（行或列），适合组件内部布局
- **Grid**：二维布局（行和列），适合页面整体布局

详见：
- [Flex 布局](./flex.md)
- [Grid 布局](./grid.md)
:::

## 相关资源

- [BFC 详解](./bfc.md)
- [Flex 布局](./flex.md)
- [Grid 布局](./grid.md)
- [水平垂直居中方案](./center.md)
- [响应式设计](./responsive.md)

## 参考资料

- [MDN CSS 文档](https://developer.mozilla.org/zh-CN/docs/Web/CSS)
- [CSS Tricks](https://css-tricks.com/)
- [Can I Use](https://caniuse.com/)
