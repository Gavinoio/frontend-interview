# 响应式设计

响应式设计（Responsive Web Design）是一种网页设计方法，使网站能够在不同设备和屏幕尺寸上提供最佳的浏览体验。

## 响应式设计概念

### 什么是响应式设计

响应式设计的核心理念是：一套代码，适配所有设备。

**三大核心技术**：
1. **流式布局（Fluid Grid）**：使用相对单位而非固定单位
2. **弹性图片（Flexible Images）**：图片根据容器自适应
3. **媒体查询（Media Queries）**：根据设备特性应用不同样式

### 响应式 vs 自适应

| 特性 | 响应式（Responsive） | 自适应（Adaptive） |
|------|---------------------|-------------------|
| 布局 | 流式布局，连续变化 | 固定布局，断点切换 |
| 实现 | 一套代码 | 多套代码 |
| 灵活性 | 更灵活 | 较固定 |
| 开发成本 | 较低 | 较高 |
| 加载速度 | 较慢（加载所有资源） | 较快（按需加载） |

**响应式示例**：
```css
.container {
  width: 100%;  /* 宽度随容器变化 */
  max-width: 1200px;
}
```

**自适应示例**：
```css
/* 不同断点使用不同宽度 */
.container { width: 320px; }  /* 移动端 */
@media (min-width: 768px) {
  .container { width: 750px; }  /* 平板 */
}
@media (min-width: 1024px) {
  .container { width: 970px; }  /* PC */
}
```

## 媒体查询

媒体查询是响应式设计的核心工具，可以根据设备特性应用不同的 CSS 规则。

### 基本语法

```css
@media media-type and (media-feature) {
  /* CSS 规则 */
}
```

### 媒体类型

```css
/* 所有设备（默认） */
@media all { }

/* 屏幕设备 */
@media screen { }

/* 打印设备 */
@media print { }

/* 语音合成器 */
@media speech { }
```

### 常用媒体特性

```css
/* 1. 视口宽度 */
@media (min-width: 768px) { }   /* 最小宽度 */
@media (max-width: 1024px) { }  /* 最大宽度 */
@media (width: 768px) { }       /* 精确宽度 */

/* 2. 视口高度 */
@media (min-height: 600px) { }
@media (max-height: 800px) { }

/* 3. 设备方向 */
@media (orientation: portrait) { }   /* 竖屏 */
@media (orientation: landscape) { }  /* 横屏 */

/* 4. 分辨率 */
@media (min-resolution: 2dppx) { }   /* 高清屏 */
@media (-webkit-min-device-pixel-ratio: 2) { }  /* Webkit */

/* 5. 深色模式 */
@media (prefers-color-scheme: dark) { }   /* 深色 */
@media (prefers-color-scheme: light) { }  /* 浅色 */

/* 6. 悬停能力 */
@media (hover: hover) { }    /* 支持悬停 */
@media (hover: none) { }     /* 不支持悬停（触摸屏） */
```

### 逻辑操作符

```css
/* and：且 */
@media screen and (min-width: 768px) and (max-width: 1024px) { }

/* or：或（使用逗号） */
@media (min-width: 768px), (orientation: landscape) { }

/* not：非 */
@media not screen and (color) { }

/* only：仅（隐藏旧浏览器） */
@media only screen and (min-width: 768px) { }
```

### 常用断点

```css
/* 移动优先（Mobile First） */
/* 默认样式：移动端 */
.container {
  width: 100%;
  padding: 15px;
}

/* 平板（≥768px） */
@media (min-width: 768px) {
  .container {
    max-width: 750px;
    margin: 0 auto;
  }
}

/* 桌面（≥1024px） */
@media (min-width: 1024px) {
  .container {
    max-width: 970px;
  }
}

/* 大屏（≥1280px） */
@media (min-width: 1280px) {
  .container {
    max-width: 1200px;
  }
}
```

```css
/* 桌面优先（Desktop First） */
/* 默认样式：桌面端 */
.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 平板（≤1024px） */
@media (max-width: 1024px) {
  .container {
    max-width: 970px;
  }
}

/* 小平板（≤768px） */
@media (max-width: 768px) {
  .container {
    width: 100%;
    padding: 15px;
  }
}

/* 手机（≤480px） */
@media (max-width: 480px) {
  .container {
    padding: 10px;
  }
}
```

**推荐**：移动优先（性能更好）

### 常见断点参考

| 设备 | 宽度范围 | 断点建议 |
|------|----------|----------|
| 手机 | < 768px | 默认或 max-width: 767px |
| 平板 | 768px - 1024px | min-width: 768px |
| 小型桌面 | 1024px - 1280px | min-width: 1024px |
| 大型桌面 | > 1280px | min-width: 1280px |

**Bootstrap 断点**：
- xs: < 576px
- sm: ≥ 576px
- md: ≥ 768px
- lg: ≥ 992px
- xl: ≥ 1200px
- xxl: ≥ 1400px

### 媒体查询示例

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
    }

    /* 默认样式：移动端 */
    .header {
      background: #3498db;
      color: white;
      padding: 20px;
      text-align: center;
    }

    .nav {
      background: #2c3e50;
      padding: 10px;
    }

    .nav ul {
      list-style: none;
    }

    .nav li {
      padding: 10px;
      border-bottom: 1px solid #34495e;
    }

    .nav a {
      color: white;
      text-decoration: none;
    }

    .content {
      padding: 20px;
    }

    /* 平板：≥768px */
    @media (min-width: 768px) {
      .header {
        text-align: left;
        padding: 30px 40px;
      }

      .nav ul {
        display: flex;
        justify-content: space-around;
      }

      .nav li {
        border-bottom: none;
      }

      .content {
        padding: 30px 40px;
      }
    }

    /* 桌面：≥1024px */
    @media (min-width: 1024px) {
      .container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .nav {
        background: transparent;
      }

      .nav ul {
        gap: 30px;
      }
    }

    /* 深色模式 */
    @media (prefers-color-scheme: dark) {
      body {
        background: #1a1a1a;
        color: #fff;
      }

      .content {
        background: #2a2a2a;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>响应式网站</h1>
    </header>
    <nav class="nav">
      <ul>
        <li><a href="#">首页</a></li>
        <li><a href="#">产品</a></li>
        <li><a href="#">关于</a></li>
        <li><a href="#">联系</a></li>
      </ul>
    </nav>
    <main class="content">
      <h2>响应式设计示例</h2>
      <p>调整浏览器窗口大小查看效果</p>
    </main>
  </div>
</body>
</html>
```

## CSS 单位

### 绝对单位

```css
/* px：像素（最常用） */
.box { width: 100px; }

/* pt：点（1pt = 1/72英寸） */
.text { font-size: 12pt; }

/* cm：厘米 */
.box { width: 10cm; }
```

### 相对单位

#### em

相对于**父元素**的字体大小。

```css
.parent {
  font-size: 16px;
}

.child {
  font-size: 2em;    /* 2 * 16px = 32px */
  padding: 1em;      /* 1 * 32px = 32px（相对于自身字体） */
}
```

**特点**：
- 相对父元素字体大小
- 可能产生层级累加效果
- 用于需要跟随字体缩放的场景

**示例**：

```html
<style>
  .level-1 {
    font-size: 16px;
  }

  .level-2 {
    font-size: 1.5em;  /* 16 * 1.5 = 24px */
  }

  .level-3 {
    font-size: 1.5em;  /* 24 * 1.5 = 36px（累加！） */
  }
</style>

<div class="level-1">
  16px
  <div class="level-2">
    24px
    <div class="level-3">
      36px（累加效果）
    </div>
  </div>
</div>
```

#### rem

相对于**根元素**（html）的字体大小。

```css
html {
  font-size: 16px;  /* 根字体大小 */
}

.box {
  width: 10rem;      /* 10 * 16px = 160px */
  padding: 2rem;     /* 2 * 16px = 32px */
  font-size: 1.5rem; /* 1.5 * 16px = 24px */
}
```

**特点**：
- 相对根元素，不会累加
- 便于统一管理尺寸
- 响应式设计的首选单位

**rem 响应式方案**：

```css
/* 方案 1: 媒体查询调整根字体 */
html {
  font-size: 16px;
}

@media (min-width: 768px) {
  html {
    font-size: 18px;
  }
}

@media (min-width: 1024px) {
  html {
    font-size: 20px;
  }
}

/* 所有使用 rem 的元素会自动缩放 */
.box {
  width: 10rem;   /* 移动端 160px，平板 180px，桌面 200px */
}

/* 方案 2: JavaScript 动态设置 */
function setRem() {
  const baseSize = 16;
  const scale = document.documentElement.clientWidth / 375; // 设计稿 375px
  document.documentElement.style.fontSize = baseSize * scale + 'px';
}

setRem();
window.addEventListener('resize', setRem);
```

#### vw / vh

相对于**视口**（viewport）的宽度和高度。

```css
/* vw：视口宽度的 1% */
.box {
  width: 50vw;   /* 视口宽度的 50% */
}

/* vh：视口高度的 1% */
.full-screen {
  height: 100vh;  /* 全屏高度 */
}

/* vmin：vw 和 vh 中较小的值 */
.square {
  width: 50vmin;
  height: 50vmin;  /* 始终是正方形 */
}

/* vmax：vw 和 vh 中较大的值 */
.box {
  width: 50vmax;
}
```

**vw 响应式方案**：

```css
/* 直接使用 vw */
.container {
  width: 90vw;
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 5vw;  /* 响应式字体 */
}

/* 限制最大最小值 */
.text {
  font-size: calc(14px + 1vw);  /* 动态字体 */
  font-size: clamp(14px, 2vw, 24px);  /* 限制范围 */
}
```

#### 百分比 %

相对于**父元素**的对应属性。

```css
.parent {
  width: 500px;
  height: 300px;
}

.child {
  width: 50%;     /* 50% * 500px = 250px */
  height: 100%;   /* 100% * 300px = 300px */
  padding: 10%;   /* 10% * 500px = 50px（基于宽度！） */
}
```

**注意**：
- `padding`、`margin` 的百分比基于**父元素宽度**
- `height` 的百分比基于**父元素高度**
- 父元素高度为 auto 时，百分比高度无效

### 单位对比

| 单位 | 相对于 | 特点 | 适用场景 |
|------|--------|------|----------|
| px | 绝对单位 | 固定不变 | 边框、细节 |
| em | 父元素字体 | 可能累加 | 按钮、组件 |
| rem | 根元素字体 | 不累加 | 布局、字体（推荐） |
| vw/vh | 视口尺寸 | 响应式 | 全屏、大标题 |
| % | 父元素 | 相对父元素 | 流式布局 |

### 单位选择建议

```css
/* 1. 字体大小：rem */
html { font-size: 16px; }
h1 { font-size: 2rem; }
p { font-size: 1rem; }

/* 2. 布局宽高：rem 或 % */
.container {
  width: 90%;
  max-width: 75rem;  /* 1200px */
}

/* 3. 间距：rem */
.box {
  padding: 1rem;
  margin: 2rem 0;
}

/* 4. 边框：px */
.box {
  border: 1px solid #ccc;
}

/* 5. 媒体查询：em 或 px */
@media (min-width: 48em) {  /* 768px */
  /* ... */
}

/* 6. 全屏布局：vh/vw */
.hero {
  height: 100vh;
}

/* 7. 响应式字体：clamp */
.title {
  font-size: clamp(1.5rem, 5vw, 3rem);
}
```

## 移动端适配方案

### 1. viewport 设置

```html
<!-- 基础设置 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- 详细参数 -->
<meta name="viewport" content="
  width=device-width,           /* 宽度等于设备宽度 */
  initial-scale=1.0,            /* 初始缩放比例 */
  maximum-scale=1.0,            /* 最大缩放比例 */
  minimum-scale=1.0,            /* 最小缩放比例 */
  user-scalable=no              /* 禁止用户缩放 */
">

<!-- 推荐设置 */
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

### 2. Flexible 方案（淘宝）

**原理**：动态设置根字体大小，使用 rem 布局。

```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script>
    // flexible.js 核心代码
    (function(win, lib) {
      var doc = win.document;
      var docEl = doc.documentElement;
      var metaEl = doc.querySelector('meta[name="viewport"]');
      var flexibleEl = doc.querySelector('meta[name="flexible"]');
      var dpr = 0;
      var scale = 0;
      var tid;

      // 设计稿宽度（通常 750px）
      var designWidth = 750;

      function setRemUnit() {
        // 根据屏幕宽度设置 rem
        var rem = docEl.clientWidth / 10;
        docEl.style.fontSize = rem + 'px';
      }

      setRemUnit();

      // 监听窗口变化
      win.addEventListener('resize', function() {
        clearTimeout(tid);
        tid = setTimeout(setRemUnit, 300);
      }, false);

      // 监听页面显示
      win.addEventListener('pageshow', function(e) {
        if (e.persisted) {
          clearTimeout(tid);
          tid = setTimeout(setRemUnit, 300);
        }
      }, false);

      // 设置 body 字体大小
      if (doc.readyState === 'complete') {
        doc.body.style.fontSize = 12 * dpr + 'px';
      } else {
        doc.addEventListener('DOMContentLoaded', function(e) {
          doc.body.style.fontSize = 12 * dpr + 'px';
        }, false);
      }
    })(window, window['lib'] || (window['lib'] = {}));
  </script>

  <style>
    /* 设计稿 750px，元素宽度 375px */
    .box {
      width: 3.75rem;  /* 375 / 100 = 3.75rem */
      height: 2rem;
      background: #3498db;
    }
  </style>
</head>
<body>
  <div class="box">Flexible 方案</div>
</body>
</html>
```

**使用**：
1. 设计稿通常 750px
2. 将 px 转换为 rem：`rem = px / 100`
3. 使用 PostCSS 插件自动转换

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 100,  // 根字体大小
      propList: ['*']  // 需要转换的属性
    }
  }
}
```

### 3. vw 方案（推荐）

**原理**：直接使用 vw 单位，无需 JavaScript。

```css
/* 设计稿 750px，元素宽度 375px */
.box {
  width: 50vw;  /* 375 / 750 * 100 = 50vw */
  height: 26.67vw;
  background: #3498db;
}

/* 使用 PostCSS 自动转换 */
/* 写 px，自动转为 vw */
.box {
  width: 375px;  /* 自动转为 50vw */
}
```

**PostCSS 配置**：

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      viewportWidth: 750,    // 设计稿宽度
      unitPrecision: 5,      // 转换精度
      viewportUnit: 'vw',    // 转换单位
      selectorBlackList: [], // 不转换的类名
      minPixelValue: 1,      // 最小转换值
      mediaQuery: false      // 是否转换媒体查询中的 px
    }
  }
}
```

**优点**：
- 无需 JavaScript
- 性能更好
- 代码更简洁

**缺点**：
- 兼容性稍差（iOS 8+, Android 4.4+）

### 4. 方案对比

| 方案 | 原理 | 优点 | 缺点 | 推荐度 |
|------|------|------|------|--------|
| Flexible | rem + JS | 兼容性好 | 需要 JS，有延迟 | ⭐⭐⭐ |
| vw | 纯 CSS | 无需 JS，性能好 | 兼容性稍差 | ⭐⭐⭐⭐⭐ |
| 媒体查询 | breakpoint | 简单直观 | 不够精细 | ⭐⭐⭐ |
| rem | rem + 媒体查询 | 简单 | 不够灵活 | ⭐⭐⭐ |

### 5. 1px 问题

**问题**：高清屏（DPR > 1）上，1px 边框看起来很粗。

**解决方案**：

```css
/* 方案 1: transform scale（推荐） */
.border-1px {
  position: relative;
}

.border-1px::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: #e5e5e5;
  transform: scaleY(0.5);
  transform-origin: 0 0;
}

/* 适配不同 DPR */
@media (-webkit-min-device-pixel-ratio: 3) {
  .border-1px::after {
    transform: scaleY(0.33);
  }
}

/* 方案 2: viewport + rem */
/* 设置 viewport 的 scale = 1/DPR */
<meta name="viewport" content="initial-scale=0.5, maximum-scale=0.5, minimum-scale=0.5, user-scalable=no">

/* 方案 3: box-shadow */
.border-1px {
  box-shadow: 0 1px 1px -1px rgba(0, 0, 0, 0.2);
}

/* 方案 4: SVG */
.border-1px {
  border: 1px solid transparent;
  border-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%' height='1'%3E%3Cline x1='0' y1='0' x2='100%' y2='0' stroke='%23e5e5e5' stroke-width='1'/%3E%3C/svg%3E") 1 stretch;
}
```

## 响应式图片

### 1. CSS 响应式

```css
/* 图片自适应 */
img {
  max-width: 100%;
  height: auto;
}

/* 背景图片 */
.bg {
  background-image: url('image-small.jpg');
  background-size: cover;
  background-position: center;
}

@media (min-width: 768px) {
  .bg {
    background-image: url('image-medium.jpg');
  }
}

@media (min-width: 1024px) {
  .bg {
    background-image: url('image-large.jpg');
  }
}
```

### 2. HTML 响应式

```html
<!-- srcset：不同分辨率 -->
<img
  src="image.jpg"
  srcset="image-1x.jpg 1x, image-2x.jpg 2x, image-3x.jpg 3x"
  alt="响应式图片"
>

<!-- srcset + sizes：不同尺寸 -->
<img
  src="image.jpg"
  srcset="
    image-320.jpg 320w,
    image-640.jpg 640w,
    image-960.jpg 960w
  "
  sizes="
    (max-width: 320px) 280px,
    (max-width: 640px) 600px,
    960px
  "
  alt="响应式图片"
>

<!-- picture 元素 -->
<picture>
  <source media="(min-width: 1024px)" srcset="image-large.jpg">
  <source media="(min-width: 768px)" srcset="image-medium.jpg">
  <img src="image-small.jpg" alt="响应式图片">
</picture>

<!-- 不同格式 -->
<picture>
  <source type="image/webp" srcset="image.webp">
  <source type="image/jpeg" srcset="image.jpg">
  <img src="image.jpg" alt="响应式图片">
</picture>
```

## 面试题

::: details 1. 什么是响应式设计？如何实现？
**答案**：

**定义**：响应式设计是一种网页设计方法，使网站能够在不同设备和屏幕尺寸上提供最佳体验。

**实现方式**：
1. **媒体查询**：根据设备特性应用不同样式
2. **流式布局**：使用相对单位（rem、%、vw）
3. **弹性图片**：`max-width: 100%`
4. **Flex/Grid**：现代布局方式
5. **viewport 设置**：`<meta name="viewport">`

**示例**：
```css
/* 移动优先 */
.container {
  width: 100%;
  padding: 15px;
}

@media (min-width: 768px) {
  .container {
    max-width: 750px;
    margin: 0 auto;
  }
}
```
:::

::: details 2. rem、em、vw 的区别和使用场景？
**答案**：

| 单位 | 相对于 | 特点 | 使用场景 |
|------|--------|------|----------|
| rem | 根元素字体 | 不累加，统一管理 | 布局、字体（首选） |
| em | 父元素字体 | 可能累加 | 按钮、组件内部 |
| vw | 视口宽度 | 真正响应式 | 全屏、大标题 |

**示例**：
```css
/* rem：布局 */
html { font-size: 16px; }
.container { width: 75rem; }  /* 1200px */

/* em：组件 */
.button {
  font-size: 1em;
  padding: 0.5em 1em;  /* 跟随字体缩放 */
}

/* vw：全屏 */
.hero {
  height: 100vh;
  font-size: 5vw;
}
```
:::

::: details 3. 移动端适配方案有哪些？
**答案**：

**1. vw 方案（推荐）**：
```css
/* PostCSS 自动转换 px 为 vw */
.box { width: 375px; }  /* 转为 50vw（设计稿750px） */
```

**2. Flexible 方案（淘宝）**：
```javascript
// 动态设置 rem
document.documentElement.style.fontSize =
  document.documentElement.clientWidth / 10 + 'px';
```

**3. 媒体查询 + rem**：
```css
html { font-size: 16px; }
@media (min-width: 768px) {
  html { font-size: 18px; }
}
```

**推荐**：vw 方案（无需 JS，性能好）
:::

::: details 4. 如何解决 1px 边框问题？
**答案**：

**问题**：高清屏上 1px 边框显示较粗。

**解决方案**：

```css
/* 方案 1: transform scale（推荐） */
.border::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: #e5e5e5;
  transform: scaleY(0.5);
}

/* 方案 2: box-shadow */
.border {
  box-shadow: 0 1px 1px -1px rgba(0, 0, 0, 0.2);
}

/* 方案 3: viewport scale */
<meta name="viewport" content="initial-scale=0.5">
```
:::

::: details 5. 媒体查询的断点如何设置？
**答案**：

**方法 1：基于常见设备**
```css
/* 移动端 */
@media (max-width: 767px) { }

/* 平板 */
@media (min-width: 768px) and (max-width: 1023px) { }

/* 桌面 */
@media (min-width: 1024px) { }
```

**方法 2：基于内容（推荐）**
- 根据内容在何时需要调整来设置断点
- 而非固定的设备尺寸

**方法 3：参考框架**
- Bootstrap: 576px, 768px, 992px, 1200px
- Tailwind: 640px, 768px, 1024px, 1280px, 1536px

**建议**：
- 移动优先：使用 `min-width`
- 3-4 个断点即可
- 根据实际内容调整
:::

::: details 6. 如何实现响应式字体？
**答案**：

```css
/* 方案 1: 媒体查询 */
.title {
  font-size: 20px;
}

@media (min-width: 768px) {
  .title {
    font-size: 24px;
  }
}

@media (min-width: 1024px) {
  .title {
    font-size: 28px;
  }
}

/* 方案 2: vw 单位 */
.title {
  font-size: 5vw;
}

/* 方案 3: clamp（推荐） */
.title {
  font-size: clamp(20px, 5vw, 40px);
  /* 最小 20px，理想 5vw，最大 40px */
}

/* 方案 4: calc */
.title {
  font-size: calc(16px + 1vw);
}
```
:::

::: details 7. viewport 的作用是什么？
**答案**：

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**作用**：
1. **控制视口大小**：`width=device-width` 设置视口宽度等于设备宽度
2. **控制缩放**：`initial-scale=1.0` 设置初始缩放比例
3. **禁止缩放**：`user-scalable=no`（不推荐）

**参数**：
- `width`：视口宽度（device-width 或具体数值）
- `height`：视口高度
- `initial-scale`：初始缩放（0.0 - 10.0）
- `maximum-scale`：最大缩放
- `minimum-scale`：最小缩放
- `user-scalable`：是否允许用户缩放（yes/no）

**不设置的后果**：
- 移动端显示桌面版布局
- 文字和元素过小
- 需要手动缩放
:::

::: details 8. 移动优先和桌面优先的区别？
**答案**：

**移动优先（Mobile First）**：
```css
/* 默认：移动端样式 */
.container {
  width: 100%;
}

/* 渐进增强 */
@media (min-width: 768px) {
  .container {
    width: 750px;
  }
}
```

**桌面优先（Desktop First）**：
```css
/* 默认：桌面样式 */
.container {
  width: 1200px;
}

/* 渐进降级 */
@media (max-width: 767px) {
  .container {
    width: 100%;
  }
}
```

**对比**：

| 特性 | 移动优先 | 桌面优先 |
|------|----------|----------|
| 默认样式 | 移动端 | 桌面端 |
| 媒体查询 | min-width | max-width |
| 理念 | 渐进增强 | 优雅降级 |
| 性能 | 更好（移动端加载少） | 较差 |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**推荐**：移动优先（性能更好，符合趋势）
:::

::: details 9. 如何实现响应式图片？
**答案**：

```html
<!-- 方案 1: CSS max-width -->
<img src="image.jpg" style="max-width: 100%; height: auto;">

<!-- 方案 2: srcset（不同分辨率） -->
<img
  src="image.jpg"
  srcset="image-1x.jpg 1x, image-2x.jpg 2x"
  alt="响应式图片"
>

<!-- 方案 3: srcset + sizes（不同尺寸） -->
<img
  srcset="small.jpg 320w, medium.jpg 640w, large.jpg 960w"
  sizes="(max-width: 320px) 280px, (max-width: 640px) 600px, 960px"
  src="large.jpg"
>

<!-- 方案 4: picture 元素 -->
<picture>
  <source media="(min-width: 1024px)" srcset="large.jpg">
  <source media="(min-width: 768px)" srcset="medium.jpg">
  <img src="small.jpg" alt="响应式图片">
</picture>

<!-- 方案 5: CSS background-image -->
<style>
  .hero {
    background-image: url('small.jpg');
  }

  @media (min-width: 768px) {
    .hero {
      background-image: url('large.jpg');
    }
  }
</style>
```
:::

::: details 10. 实现一个响应式导航栏
**答案**：

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .navbar {
      background: #333;
      color: white;
      padding: 1rem;
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: bold;
    }

    .nav-menu {
      display: flex;
      list-style: none;
      gap: 2rem;
    }

    .nav-menu a {
      color: white;
      text-decoration: none;
    }

    .hamburger {
      display: none;
      flex-direction: column;
      cursor: pointer;
    }

    .hamburger span {
      width: 25px;
      height: 3px;
      background: white;
      margin: 3px 0;
      transition: 0.3s;
    }

    /* 移动端 */
    @media (max-width: 768px) {
      .nav-menu {
        position: fixed;
        left: -100%;
        top: 60px;
        flex-direction: column;
        background: #333;
        width: 100%;
        text-align: center;
        transition: 0.3s;
        padding: 2rem 0;
      }

      .nav-menu.active {
        left: 0;
      }

      .hamburger {
        display: flex;
      }
    }
  </style>
</head>
<body>
  <nav class="navbar">
    <div class="nav-container">
      <div class="logo">LOGO</div>

      <ul class="nav-menu">
        <li><a href="#">首页</a></li>
        <li><a href="#">产品</a></li>
        <li><a href="#">关于</a></li>
        <li><a href="#">联系</a></li>
      </ul>

      <div class="hamburger">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </nav>

  <script>
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  </script>
</body>
</html>
```
:::

## 总结

::: details 响应式设计核心
1. **移动优先**：从小屏幕开始设计
2. **流式布局**：使用相对单位（rem、%、vw）
3. **媒体查询**：适配不同断点
4. **弹性图片**：`max-width: 100%`
5. **Flex/Grid**：现代布局工具
:::

::: details 最佳实践
1. **使用 rem 做布局**：便于统一管理
2. **vw 方案优于 Flexible**：无需 JS，性能好
3. **移动优先开发**：性能更好
4. **3-4 个断点足够**：不要过度细分
5. **测试真机**：模拟器不够准确
:::

## 参考资料

- [MDN - 响应式设计](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Google - 响应式 Web 设计基础](https://developers.google.com/web/fundamentals/design-and-ux/responsive)
- [使用媒体查询](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Media_Queries/Using_media_queries)
