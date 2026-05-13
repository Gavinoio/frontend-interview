# HTML 面试题精选

> 汇总 HTML 基础、语义化、无障碍访问、Web Components 的高频面试题。

## HTML 基础

::: details 1. HTML5 有哪些新特性？
**答：**
- **语义化标签**：header, nav, main, article, section, aside, footer
- **表单增强**：新输入类型（email, url, date, number 等），required、pattern 等验证属性
- **多媒体**：video, audio 原生支持，无需 Flash
- **图形**：Canvas 2D 绘图，SVG 矢量图形
- **存储**：localStorage（持久化）、sessionStorage（会话级）
- **通信**：WebSocket 全双工通信，Server-Sent Events
- **性能**：Web Workers 多线程
- **API**：Geolocation 地理定位、Drag and Drop 拖放、History API

---
:::

::: details 2. DOCTYPE 的作用是什么？
**答：**
DOCTYPE 告诉浏览器使用哪种 HTML 规范解析文档，主要作用：
- 触发**标准模式**渲染，避免**怪异模式**（Quirks Mode）
- 确保页面在不同浏览器中的一致性

HTML5 的 DOCTYPE 非常简洁：`<!DOCTYPE html>`

没有 DOCTYPE 会触发怪异模式，导致盒模型等表现异常（IE 盒模型）。

---
:::

::: details 3. 块级元素和内联元素有什么区别？
| 特性 | 块级元素 | 内联元素 | 行内块元素 |
|------|---------|---------|-----------|
| 是否独占一行 | 是 | 否 | 否 |
| 默认宽度 | 父元素100% | 内容宽度 | 内容宽度 |
| 可设置width/height | 是 | 否 | 是 |
| 可设置margin | 四个方向 | 仅左右 | 四个方向 |
| 常见元素 | div, p, h1 | span, a, em | img, input |

---
:::

::: details 4. script 标签的 async 和 defer 有什么区别？
| 特性 | async | defer |
|------|-------|-------|
| 下载方式 | 异步 | 异步 |
| 执行时机 | 下载完立即执行 | HTML 解析完后执行 |
| 是否阻塞解析 | 执行时阻塞 | 不阻塞 |
| 执行顺序 | 不保证顺序 | 按顺序执行 |
| 适用场景 | 独立的第三方脚本 | 依赖 DOM 的脚本 |

**使用建议：**
- 第三方统计、广告脚本：使用 `async`
- 需要操作 DOM 或有依赖关系的脚本：使用 `defer`
- ES Module（`type="module"`）默认具有 `defer` 行为

---
:::

::: details 5. meta viewport 的作用是什么？
**答：**
viewport 用于控制移动端页面的视口大小和缩放行为，实现响应式布局。

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

不设置 viewport，移动端会使用默认 980px 虚拟视口，导致页面被缩小显示。

**参数说明：**
- `width=device-width`：视口宽度等于设备宽度
- `initial-scale=1.0`：初始缩放比例 1:1
- `user-scalable=no`：禁止用户缩放（影响可访问性，慎用）
- `viewport-fit=cover`：iOS 刘海屏适配

---
:::

::: details 6. src 和 href 的区别？
**答：**

| | href | src |
|--|------|-----|
| 用于标签 | `<a>`, `<link>` | `<img>`, `<script>`, `<iframe>` |
| 含义 | 超文本引用，建立关联 | 来源，将资源嵌入文档 |
| 是否阻塞 | 不阻塞解析 | script 会阻塞解析 |

---
:::

::: details 7. 如何实现浏览器多个标签页之间的通信？
**答：**

1. **localStorage + storage 事件**（最常用）
```javascript
// 页面 A 发送
localStorage.setItem('message', JSON.stringify({ data: 'hello' }));
// 页面 B 接收
window.addEventListener('storage', (e) => {
    if (e.key === 'message') console.log(JSON.parse(e.newValue));
});
```

2. **BroadcastChannel API**（现代浏览器推荐）
```javascript
const channel = new BroadcastChannel('my-channel');
channel.postMessage('hello');
channel.onmessage = (e) => console.log(e.data);
```

3. **SharedWorker**：多页面共享同一 Worker 实例
4. **Service Worker**：可拦截和转发消息
5. **WebSocket**：通过服务器中转

---
:::

::: details 8. Canvas 和 SVG 的区别？
| 特性 | Canvas | SVG |
|------|--------|-----|
| 类型 | 位图（像素） | 矢量图 |
| 缩放 | 失真 | 不失真 |
| 事件处理 | 复杂（需手动计算坐标） | 简单（元素级别） |
| 性能 | 适合大量元素、动画 | 适合少量元素 |
| 适用场景 | 游戏、图像处理、复杂动画 | 图表、图标、地图 |
| 可访问性 | 差 | 好 |

---
:::

## 语义化

::: details 9. 什么是 HTML 语义化？有什么好处？
**答：**
语义化是指使用恰当的 HTML 标签描述内容的含义，让标签本身就能表达内容的性质。

**好处：**
1. **SEO 优化**：搜索引擎更好地理解页面结构和内容重要性
2. **可访问性**：屏幕阅读器能准确解读内容，帮助视障用户
3. **可维护性**：代码结构清晰，新人接手快速理解
4. **可读性**：标签即文档，减少注释需求

```html
<!-- ❌ 非语义化 -->
<div class="header"><div class="nav">...</div></div>

<!-- ✅ 语义化 -->
<header><nav>...</nav></header>
```

---
:::

::: details 10. article 和 section 的区别？
**答：**

**article**：独立的、完整的内容单元，可以单独分发或重用（如 RSS）。
- 示例：博客文章、新闻、评论、产品卡片

**section**：文档中的主题性分组，通常包含标题，是文档大纲的一部分。
- 示例：文章的章节、选项卡面板

**判断方法**：这段内容能否独立存在？能 → `article`，否 → `section`

```html
<!-- article 包含 section（文章的章节） -->
<article>
    <h1>文章标题</h1>
    <section><h2>第一章</h2></section>
    <section><h2>第二章</h2></section>
</article>

<!-- section 包含 article（新闻列表） -->
<section>
    <h2>最新新闻</h2>
    <article>新闻1</article>
    <article>新闻2</article>
</section>
```

---
:::

::: details 11. 一个页面可以有多个 main 标签吗？
**答：** 不可以。每个页面只能有**一个可见的** `<main>` 标签。

`<main>` 表示文档的主要内容，帮助屏幕阅读器快速定位。SPA 中可以有多个 `<main>`，但只能有一个可见（其余加 `hidden` 属性）。

---
:::

::: details 12. 如何选择合适的语义化标签？
**决策流程：**
1. 导航链接 → `<nav>`
2. 页面/区块头部 → `<header>`
3. 主要内容 → `<main>`
4. 独立完整的内容 → `<article>`
5. 主题性分组 → `<section>`
6. 侧边内容 → `<aside>`
7. 页脚 → `<footer>`
8. 都不是 → `<div>`

---
:::

## 无障碍访问（A11y）

::: details 13. 什么是 Web 无障碍？WCAG 四大原则是什么？
**答：**
Web 无障碍是指让网站对所有人可用，包括残障人士（视觉、听觉、运动、认知障碍）。

**WCAG 四大原则（POUR）：**
| 原则 | 说明 |
|------|------|
| **可感知**（Perceivable） | 信息必须以用户能感知的方式呈现，如图片提供 alt 文本 |
| **可操作**（Operable） | 所有功能可通过键盘访问 |
| **可理解**（Understandable） | 清晰的错误提示，可预期的行为 |
| **健壮性**（Robust） | 使用语义化 HTML，兼容各种用户代理 |

---
:::

::: details 14. ARIA 属性有什么作用？常用的有哪些？
**答：**
ARIA（Accessible Rich Internet Applications）是在原生 HTML 语义不足时，为辅助技术提供额外信息的属性。

```html
<!-- aria-label：为元素提供可访问名称 -->
<button aria-label="关闭对话框">×</button>

<!-- aria-hidden：对辅助技术隐藏装饰性内容 -->
<span aria-hidden="true">🎉</span>

<!-- aria-live：通知屏幕阅读器动态内容变化 -->
<div aria-live="polite" id="status">加载中...</div>

<!-- aria-expanded：表示折叠/展开状态 -->
<button aria-expanded="false" aria-controls="menu">菜单</button>

<!-- role：定义元素的语义角色 -->
<div role="alert">错误：请填写必填项</div>
```

**原则：** 优先使用原生语义化 HTML，ARIA 是补充而非替代。

---
:::

::: details 15. 如何确保表单的可访问性？
**答：**

```html
<form>
    <fieldset>
        <legend>个人信息</legend>

        <!-- label 关联 input -->
        <label for="name">姓名 <span aria-hidden="true">*</span></label>
        <input type="text" id="name" name="name" required
               aria-required="true"
               aria-describedby="name-error">
        <span id="name-error" role="alert" aria-live="polite"></span>
    </fieldset>
</form>
```

关键点：
- 每个 `input` 都有关联的 `<label>`
- 必填项用 `required` + `aria-required`
- 错误信息用 `role="alert"` 或 `aria-live`
- 表单分组用 `<fieldset>` + `<legend>`

---
:::

## Web Components

::: details 16. Web Components 的三大核心技术是什么？
**答：**

| 技术 | 作用 |
|------|------|
| **Custom Elements** | 定义新的 HTML 标签，扩展原生元素 |
| **Shadow DOM** | 封装样式和结构，实现样式隔离 |
| **HTML Templates** | 定义可复用的 HTML 片段（`<template>` + `<slot>`） |

---
:::

::: details 17. Shadow DOM 和 Virtual DOM 的区别？
| 特性 | Shadow DOM | Virtual DOM |
|------|------------|-------------|
| 本质 | 浏览器原生 API | JavaScript 抽象层 |
| 目的 | 样式和 DOM 封装隔离 | 性能优化（减少真实 DOM 操作） |
| 可见性 | DOM 树中真实存在 | 内存中的 JS 对象 |
| 框架依赖 | 无需框架 | React/Vue 等框架实现 |

---
:::

::: details 18. Web Components 的优势和局限是什么？
**优势：**
- 原生支持，无框架依赖
- Shadow DOM 提供完美的样式隔离
- 跨框架复用（React/Vue/Angular 均可使用）
- W3C 标准，长期维护有保障

**局限：**
- IE 不支持，需要 polyfill
- SSR 支持有限
- 与部分框架集成需要额外配置
- 学习曲线相对较高，生态不如主流框架成熟

---
:::

::: details 19. 如何在 Web Components 中实现跨组件通信？
**答：**

```javascript
// 方式1：自定义事件（子 → 父）
this.dispatchEvent(new CustomEvent('value-change', {
    detail: { value: 'new value' },
    bubbles: true,    // 事件冒泡
    composed: true    // 穿透 Shadow DOM 边界
}));

// 方式2：属性/特性（父 → 子）
element.setAttribute('value', 'new value');
// 配合 observedAttributes + attributeChangedCallback 响应变化

// 方式3：直接调用公共方法
const el = document.querySelector('my-component');
el.updateData({ key: 'value' });
```

---
:::

## 综合题

::: details 20. 从输入 URL 到页面渲染，HTML 解析阶段发生了什么？
**答：**

1. **接收 HTML 字节流** → 解码为字符串
2. **词法分析（Tokenization）** → 将字符串解析为 Token（开始标签、结束标签、文本等）
3. **构建 DOM 树** → Token 转换为 DOM 节点，形成树形结构
4. **遇到 `<link>` CSS** → 异步下载，不阻塞 HTML 解析，但阻塞渲染
5. **遇到 `<script>`（无属性）** → 暂停 HTML 解析，下载并执行脚本
6. **遇到 `<script defer/async>`** → 异步下载，不阻塞解析
7. **DOM 构建完成** → 触发 `DOMContentLoaded` 事件
8. **所有资源加载完成** → 触发 `load` 事件
:::
