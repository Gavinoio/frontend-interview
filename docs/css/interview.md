# CSS 面试题精选

> 汇总 CSS 基础、布局、响应式、主题、工程化相关高频面试题。

## CSS 基础

::: details 1. 标准盒模型和 IE 盒模型的区别？
- **标准盒模型**：`width/height` 只包含 content，总宽度 = width + padding + border
- **IE 盒模型**：`width/height` 包含 content + padding + border，总宽度 = width

通过 `box-sizing` 切换：`content-box`（默认，标准）、`border-box`（IE 盒模型）

**推荐**：全局设置 `* { box-sizing: border-box; }`，更符合直觉。

---
:::

::: details 2. CSS 选择器优先级如何计算？
优先级从高到低：
1. `!important`（最高，慎用）
2. 内联样式（1000）
3. ID 选择器（100）
4. 类 / 属性 / 伪类（10）
5. 元素 / 伪元素（1）
6. 通配符（0）

相同优先级时，后定义的覆盖先定义的。

---
:::

::: details 3. display: none、visibility: hidden、opacity: 0 的区别？
| 特性 | display: none | visibility: hidden | opacity: 0 |
|------|---------------|-------------------|------------|
| 空间占用 | 不占空间 | 占据空间 | 占据空间 |
| 触发重排 | 是 | 否（只重绘） | 否（只重绘） |
| 子元素 | 全部隐藏 | 可设 visible 显示 | 全部透明 |
| 事件响应 | 不响应 | 不响应 | 响应 |
| transition | 不支持 | 支持 | 支持 |

---
:::

::: details 4. link 和 @import 的区别？
| 特性 | `<link>` | `@import` |
|------|----------|-----------|
| 本质 | HTML 标签 | CSS 语法 |
| 加载时机 | 页面加载时并行加载 | 页面加载完后加载（阻塞渲染） |
| JS 操作 | 可通过 DOM 操作 | 不支持 |
| 推荐 | ✅ 推荐 | ❌ 不推荐 |

---
:::

::: details 5. CSS3 新增了哪些重要特性？
1. **选择器**：`:nth-child()`、`:not()`、属性选择器
2. **盒模型**：`box-sizing`、`border-radius`、`box-shadow`
3. **视觉效果**：`filter`、`backdrop-filter`、渐变
4. **变换**：`transform`（rotate、scale、translate、skew）
5. **过渡与动画**：`transition`、`@keyframes` + `animation`
6. **布局**：`flex`、`grid`
7. **响应式**：`@media` 媒体查询
8. **自定义属性**：CSS 变量（`--var-name`）

---
:::

::: details 6. 如何清除浮动？
```css
/* 方法1：clearfix 伪元素（推荐） */
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}

/* 方法2：触发 BFC */
.container { overflow: hidden; }
```

---
:::

## BFC

::: details 7. 什么是 BFC？如何触发？有什么作用？
**BFC（块级格式化上下文）** 是一个独立的渲染区域，内部元素的布局不影响外部。

**触发条件：**
- `overflow` 不为 `visible`（hidden、auto、scroll）
- `display: flex / grid / inline-block / table-cell`
- `position: absolute / fixed`
- `float` 不为 `none`

**主要作用：**
1. **清除浮动**：BFC 容器会包含内部浮动元素
2. **防止 margin 重叠**：两个 BFC 之间的 margin 不会合并
3. **自适应两栏布局**：BFC 区域不会与浮动元素重叠

---
:::

## Flex 布局

::: details 8. flex: 1 代表什么？
`flex: 1` 等价于 `flex: 1 1 0%`，即：
- `flex-grow: 1`：有剩余空间时放大
- `flex-shrink: 1`：空间不足时缩小
- `flex-basis: 0%`：初始大小为 0，完全按比例分配

**常见对比：**

| 值 | 等价 | 含义 |
|----|------|------|
| `flex: 1` | `1 1 0%` | 平分所有空间（忽略内容大小） |
| `flex: auto` | `1 1 auto` | 先保留内容大小，再分配剩余空间 |
| `flex: none` | `0 0 auto` | 不伸缩，保持原始大小 |

---
:::

::: details 9. flex: 1 和 flex: auto 的区别？
区别在于 `flex-basis`：
- `flex: 1`（`flex-basis: 0%`）：完全平分，忽略内容大小
- `flex: auto`（`flex-basis: auto`）：先保留各自内容大小，再平分剩余空间

**场景**：需要严格等分用 `flex: 1`；需要内容自适应用 `flex: auto`。

---
:::

::: details 10. Flex 布局和 Grid 布局的区别？
- **Flex**：一维布局（行或列），适合组件内部、导航栏、卡片列表
- **Grid**：二维布局（行和列同时控制），适合页面整体布局、复杂网格

两者可以配合使用：Grid 做页面骨架，Flex 做组件内部排列。

---
:::

## 居中方案

::: details 11. 如何实现水平垂直居中？
**现代方案（推荐）：**
```css
/* Flex */
.parent { display: flex; justify-content: center; align-items: center; }

/* Grid */
.parent { display: grid; place-items: center; }
```

**经典方案：**
```css
/* 定位 + Transform（不需要知道子元素尺寸） */
.child { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }

/* 定位 + margin auto（需要固定尺寸） */
.child { position: absolute; inset: 0; margin: auto; width: 200px; height: 100px; }
```

---
:::

::: details 12. margin: auto 为什么能水平居中但不能垂直居中？
**水平方向**：块级元素宽度有明确计算方式，`margin: 0 auto` 平分剩余空间。

**垂直方向**：正常文档流中高度由内容决定，没有"剩余空间"概念，`margin: auto` 计算为 0。

**例外**：绝对定位 + `top: 0; bottom: 0;` 时，垂直方向有了明确空间，`margin: auto` 可以垂直居中（需固定高度）。

---
:::

## 响应式设计

::: details 13. rem、em、vw 的区别和使用场景？
| 单位 | 相对于 | 特点 | 使用场景 |
|------|--------|------|----------|
| `rem` | 根元素字体大小 | 不累加，统一管理 | 布局、字体（首选） |
| `em` | 父元素字体大小 | 可能累加 | 按钮、组件内部间距 |
| `vw/vh` | 视口宽/高 | 真正响应式 | 全屏布局、大标题 |
| `px` | 绝对像素 | 精确 | 边框、阴影 |

---
:::

::: details 14. 移动端适配方案有哪些？
1. **vw 方案（推荐）**：PostCSS 自动将 px 转为 vw，无需 JS
2. **Flexible 方案（rem）**：动态设置根字体大小，`font-size = clientWidth / 10`
3. **媒体查询 + rem**：在不同断点设置不同根字体大小

---
:::

::: details 15. 如何解决移动端 1px 边框问题？
高清屏（DPR=2）上 CSS 的 1px 实际渲染为 2 个物理像素，显示偏粗。

```css
/* 推荐：transform scale */
.border::after {
  content: '';
  position: absolute;
  left: 0; bottom: 0;
  width: 100%; height: 1px;
  background: #e5e5e5;
  transform: scaleY(0.5);
  transform-origin: 0 100%;
}
```

---
:::

## 主题与 CSS 变量

::: details 16. CSS 变量和 Sass 变量的区别？
| 特性 | CSS 变量 | Sass 变量 |
|------|---------|-----------|
| 处理时机 | 运行时 | 编译时 |
| 动态修改 | 可以（JS 修改） | 不可以 |
| 作用域 | 有作用域和继承 | 全局 |
| 开发者工具 | 可见 | 不可见 |

---
:::

::: details 17. 如何实现夜间模式？如何避免切换时的闪烁？
**实现方案：**
```css
:root { --bg: #fff; --text: #333; }
:root[data-theme="dark"] { --bg: #1a1a1a; --text: #eee; }
```

**避免闪烁**：在 `<head>` 中用同步脚本尽早设置主题，避免等待 JS 加载：
```html
<script>
  const theme = localStorage.getItem('theme') ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
</script>
```

---
:::

::: details 18. height: auto 无法过渡怎么办？
```css
/* 方案1：max-height 过渡（有延迟感） */
.collapse { max-height: 0; overflow: hidden; transition: max-height 0.3s; }
.collapse.open { max-height: 500px; }

/* 方案2：grid-template-rows（推荐，无延迟） */
.collapse { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.3s; }
.collapse > div { overflow: hidden; }
.collapse.open { grid-template-rows: 1fr; }
```

---
:::

## 原子化 CSS

::: details 19. 什么是原子化 CSS？有什么优势和劣势？
**定义**：将样式拆分为最小的单一用途功能类，通过组合类名构建 UI（如 Tailwind CSS）。

**优势：**
- CSS 体积可控，随项目增长趋于稳定
- 无需命名，开发效率高
- 删除 HTML 即删除样式，无冗余 CSS
- 使用设计系统预定义值，风格统一

**劣势：**
- HTML 类名冗长，可读性下降
- 学习成本（需记忆类名）
- 不适合高度动态的样式

---
:::

::: details 20. Tailwind CSS 的 JIT 模式是什么？
JIT（Just-In-Time）是 Tailwind 3.0+ 的默认模式，按需生成 CSS：
- 扫描源码中实际使用的类名，只生成对应 CSS
- 启动速度从 3-5s 降至 <100ms
- 支持任意值：`w-[762px]`、`bg-[#1da1f2]`
- 开发环境 CSS 体积从 3-10MB 降至几 KB

---
:::

## CSS-in-JS

::: details 21. CSS-in-JS 的优缺点是什么？
**优点：**
- 样式与组件共存，天然作用域隔离
- 可使用 JS 变量和逻辑
- 动态样式方便
- 无需担心类名冲突

**缺点：**
- 运行时性能开销（动态生成样式）
- 增加 JS bundle 体积
- SSR 配置复杂
- 不能被浏览器缓存（动态生成）

**主流方案**：styled-components、Emotion（运行时）；vanilla-extract、Linaria（零运行时）。

---
:::

## 综合题

::: details 22. 重排（Reflow）和重绘（Repaint）的区别？如何优化？
**重排**：元素的几何属性（位置、尺寸）发生变化，浏览器需要重新计算布局。触发：改变 width/height/margin/padding、DOM 增删、字体大小变化。

**重绘**：元素外观变化但不影响布局。触发：改变 color/background/visibility。

**重排一定触发重绘，重绘不一定触发重排。**

**优化：**
```javascript
// ❌ 多次触发重排
el.style.width = '100px';
el.style.height = '100px';
el.style.margin = '10px';

// ✅ 批量修改（一次重排）
el.style.cssText = 'width: 100px; height: 100px; margin: 10px;';
// 或使用 class
el.classList.add('new-style');

// ✅ 使用 transform 代替 top/left（不触发重排）
el.style.transform = 'translate(100px, 100px)';

// ✅ 使用 DocumentFragment 批量操作 DOM
const fragment = document.createDocumentFragment();
items.forEach(item => fragment.appendChild(createEl(item)));
container.appendChild(fragment);
```
:::
