# Web Components

## 什么是 Web Components？

### 官方定义
Web Components 是一套 Web 原生技术，允许你创建可复用的自定义元素，并在 Web 应用中使用它们，实现组件封装和复用。

### 通俗理解
想象你在玩乐高积木 —— 每个积木块都是独立的、可复用的。Web Components 就像让你自己设计乐高积木，然后在任何网页中使用，而不依赖任何框架。

### 三大核心技术

| 技术 | 作用 | 说明 |
|------|------|------|
| **Custom Elements** | 自定义元素 | 定义新的 HTML 标签 |
| **Shadow DOM** | 影子 DOM | 封装样式和结构，隔离组件 |
| **HTML Templates** | HTML 模板 | 定义可复用的 HTML 片段 |

---

## Custom Elements（自定义元素）

### 基础用法

```javascript
// 定义自定义元素
class MyButton extends HTMLElement {
  constructor() {
    super();  // 必须调用 super()

    // 初始化组件
    this.innerHTML = `
      <button class="my-button">
        <slot></slot>
      </button>
    `;
  }

  // 元素被添加到 DOM 时调用
  connectedCallback() {
    console.log('元素已添加到页面');
    this.addEventListener('click', this.handleClick);
  }

  // 元素从 DOM 移除时调用
  disconnectedCallback() {
    console.log('元素已从页面移除');
    this.removeEventListener('click', this.handleClick);
  }

  // 元素被移动到新文档时调用
  adoptedCallback() {
    console.log('元素被移动到新文档');
  }

  // 属性变化时调用
  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`属性 ${name} 从 ${oldValue} 变为 ${newValue}`);
  }

  // 声明需要观察的属性
  static get observedAttributes() {
    return ['disabled', 'type', 'size'];
  }

  handleClick = () => {
    this.dispatchEvent(new CustomEvent('my-click', {
      detail: { message: '按钮被点击了' },
      bubbles: true,
      composed: true  // 允许事件穿透 Shadow DOM
    }));
  }
}

// 注册自定义元素
customElements.define('my-button', MyButton);
```

```html
<!-- 使用自定义元素 -->
<my-button>点击我</my-button>
<my-button disabled>禁用状态</my-button>
```

### 生命周期回调

| 回调 | 触发时机 | 常见用途 |
|------|----------|----------|
| `constructor` | 元素创建时 | 初始化状态、绑定方法 |
| `connectedCallback` | 添加到 DOM 时 | 设置监听器、获取数据 |
| `disconnectedCallback` | 从 DOM 移除时 | 清理监听器、取消请求 |
| `attributeChangedCallback` | 属性变化时 | 响应属性变化 |
| `adoptedCallback` | 移动到新文档时 | 较少使用 |

### 属性和特性

```javascript
class MyInput extends HTMLElement {
  constructor() {
    super();
    this._value = '';
  }

  // 观察的属性列表
  static get observedAttributes() {
    return ['value', 'placeholder', 'disabled'];
  }

  // 属性变化回调
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'value':
        this._value = newValue;
        this.render();
        break;
      case 'disabled':
        this.input.disabled = newValue !== null;
        break;
    }
  }

  // 属性 getter/setter（反映到 HTML 属性）
  get value() {
    return this.getAttribute('value') || '';
  }

  set value(val) {
    if (val) {
      this.setAttribute('value', val);
    } else {
      this.removeAttribute('value');
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <input
        type="text"
        value="${this.value}"
        placeholder="${this.getAttribute('placeholder') || ''}"
        ${this.disabled ? 'disabled' : ''}
      >
    `;
    this.input = this.querySelector('input');
  }
}

customElements.define('my-input', MyInput);
```

---

## Shadow DOM（影子 DOM）

### 什么是 Shadow DOM？

Shadow DOM 提供了封装能力，让组件的内部结构、样式与外部隔离。

```javascript
class MyCard extends HTMLElement {
  constructor() {
    super();

    // 创建 Shadow DOM
    const shadow = this.attachShadow({ mode: 'open' });

    // mode: 'open' - 外部可以访问 shadowRoot
    // mode: 'closed' - 外部无法访问 shadowRoot

    shadow.innerHTML = `
      <style>
        /* 样式被封装在 Shadow DOM 内 */
        :host {
          display: block;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
        }

        :host([theme="dark"]) {
          background: #333;
          color: #fff;
        }

        :host(:hover) {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .content {
          color: #666;
        }

        /* 外部样式无法影响这里 */
        p {
          margin: 0;
        }
      </style>

      <div class="card">
        <div class="title">
          <slot name="title">默认标题</slot>
        </div>
        <div class="content">
          <slot>默认内容</slot>
        </div>
      </div>
    `;
  }
}

customElements.define('my-card', MyCard);
```

```html
<!-- 使用 -->
<my-card>
  <span slot="title">自定义标题</span>
  <p>这是卡片内容</p>
</my-card>

<my-card theme="dark">
  <span slot="title">暗色主题</span>
  <p>暗色主题内容</p>
</my-card>

<style>
  /* 这些样式不会影响 Shadow DOM 内部 */
  p { color: red; }
  .title { font-size: 100px; }
</style>
```

### :host 选择器

```css
/* 选择宿主元素本身 */
:host {
  display: block;
}

/* 选择带有特定属性的宿主 */
:host([disabled]) {
  opacity: 0.5;
  pointer-events: none;
}

/* 选择带有特定类的宿主 */
:host(.primary) {
  background: blue;
  color: white;
}

/* 选择特定上下文中的宿主 */
:host-context(.dark-theme) {
  background: #333;
  color: #fff;
}

/* 选择宿主的伪类状态 */
:host(:hover) {
  border-color: blue;
}

:host(:focus-within) {
  box-shadow: 0 0 0 2px blue;
}
```

### ::slotted 选择器

```css
/* 选择插入到 slot 中的元素 */
::slotted(*) {
  margin: 0;
}

::slotted(p) {
  color: #333;
}

::slotted(.highlight) {
  background: yellow;
}

/* 注意：只能选择直接子元素 */
::slotted(div p) {  /* 无效！ */
  color: red;
}
```

### CSS 变量穿透

```javascript
class ThemedButton extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>
        button {
          /* 使用 CSS 变量，允许外部自定义 */
          background: var(--btn-bg, #007bff);
          color: var(--btn-color, white);
          padding: var(--btn-padding, 8px 16px);
          border: none;
          border-radius: var(--btn-radius, 4px);
          font-size: var(--btn-font-size, 14px);
          cursor: pointer;
        }

        button:hover {
          background: var(--btn-bg-hover, #0056b3);
        }
      </style>
      <button><slot></slot></button>
    `;
  }
}

customElements.define('themed-button', ThemedButton);
```

```html
<!-- 通过 CSS 变量自定义样式 -->
<style>
  themed-button {
    --btn-bg: #28a745;
    --btn-bg-hover: #1e7e34;
    --btn-radius: 20px;
  }

  .danger {
    --btn-bg: #dc3545;
    --btn-bg-hover: #c82333;
  }
</style>

<themed-button>默认按钮</themed-button>
<themed-button class="danger">危险按钮</themed-button>
```

---

## HTML Templates（HTML 模板）

### template 元素

```html
<!-- 定义模板（不会被渲染） -->
<template id="card-template">
  <style>
    .card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      margin: 8px;
    }
    .card-title {
      font-size: 18px;
      font-weight: bold;
    }
    .card-content {
      color: #666;
      margin-top: 8px;
    }
  </style>
  <div class="card">
    <div class="card-title"></div>
    <div class="card-content"></div>
  </div>
</template>

<script>
// 使用模板
const template = document.getElementById('card-template');

function createCard(title, content) {
  // 克隆模板内容
  const clone = template.content.cloneNode(true);

  // 填充数据
  clone.querySelector('.card-title').textContent = title;
  clone.querySelector('.card-content').textContent = content;

  return clone;
}

// 添加到页面
document.body.appendChild(createCard('标题1', '内容1'));
document.body.appendChild(createCard('标题2', '内容2'));
</script>
```

### 在自定义元素中使用模板

```javascript
// 定义模板
const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: inline-block;
    }
    .counter {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    button {
      width: 32px;
      height: 32px;
      border: 1px solid #ddd;
      background: white;
      cursor: pointer;
      font-size: 18px;
    }
    button:hover {
      background: #f5f5f5;
    }
    .value {
      min-width: 40px;
      text-align: center;
      font-size: 18px;
    }
  </style>
  <div class="counter">
    <button class="decrement">-</button>
    <span class="value">0</span>
    <button class="increment">+</button>
  </div>
`;

class MyCounter extends HTMLElement {
  constructor() {
    super();

    // 使用模板创建 Shadow DOM
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    // 获取元素引用
    this.valueEl = shadow.querySelector('.value');
    this.decrementBtn = shadow.querySelector('.decrement');
    this.incrementBtn = shadow.querySelector('.increment');

    this._count = 0;
  }

  connectedCallback() {
    this.decrementBtn.addEventListener('click', () => this.decrement());
    this.incrementBtn.addEventListener('click', () => this.increment());
    this.render();
  }

  get count() {
    return this._count;
  }

  set count(value) {
    this._count = value;
    this.render();
    this.dispatchEvent(new CustomEvent('change', {
      detail: { count: value }
    }));
  }

  increment() {
    this.count++;
  }

  decrement() {
    this.count--;
  }

  render() {
    this.valueEl.textContent = this._count;
  }
}

customElements.define('my-counter', MyCounter);
```

---

## Slot（插槽）

### 默认插槽

```javascript
class MyPanel extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>
        .panel {
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .header {
          background: #f5f5f5;
          padding: 12px;
          font-weight: bold;
        }
        .body {
          padding: 12px;
        }
      </style>
      <div class="panel">
        <div class="header">面板标题</div>
        <div class="body">
          <slot>默认内容</slot>
        </div>
      </div>
    `;
  }
}

customElements.define('my-panel', MyPanel);
```

```html
<my-panel>
  <p>自定义内容1</p>
  <p>自定义内容2</p>
</my-panel>

<my-panel></my-panel>  <!-- 显示"默认内容" -->
```

### 具名插槽

```javascript
class MyDialog extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>
        .dialog {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          min-width: 300px;
        }
        .header {
          padding: 16px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .body {
          padding: 16px;
        }
        .footer {
          padding: 16px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
        }
      </style>
      <div class="dialog">
        <div class="header">
          <slot name="header">对话框标题</slot>
          <button class="close-btn">&times;</button>
        </div>
        <div class="body">
          <slot>对话框内容</slot>
        </div>
        <div class="footer">
          <slot name="footer">
            <button>确定</button>
          </slot>
        </div>
      </div>
    `;
  }
}

customElements.define('my-dialog', MyDialog);
```

```html
<my-dialog>
  <h3 slot="header">确认删除</h3>
  <p>确定要删除这条记录吗？此操作不可恢复。</p>
  <div slot="footer">
    <button class="cancel">取消</button>
    <button class="confirm">确认删除</button>
  </div>
</my-dialog>
```

### 监听插槽变化

```javascript
class SlotDemo extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <div>
        <slot name="items"></slot>
      </div>
    `;

    const slot = shadow.querySelector('slot');

    // 监听插槽内容变化
    slot.addEventListener('slotchange', (e) => {
      const assignedElements = slot.assignedElements();
      console.log('插槽内容变化:', assignedElements);
      console.log('元素数量:', assignedElements.length);
    });
  }
}

customElements.define('slot-demo', SlotDemo);
```

---

## 实战组件示例

### 自定义 Tabs 组件

```javascript
class MyTabs extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .tabs-header {
          display: flex;
          border-bottom: 2px solid #eee;
        }
        .tab-btn {
          padding: 12px 24px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          color: #666;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: all 0.3s;
        }
        .tab-btn:hover {
          color: #1890ff;
        }
        .tab-btn.active {
          color: #1890ff;
          border-bottom-color: #1890ff;
        }
        .tabs-content {
          padding: 16px 0;
        }
        ::slotted([slot^="panel"]) {
          display: none;
        }
        ::slotted([slot^="panel"].active) {
          display: block;
        }
      </style>
      <div class="tabs">
        <div class="tabs-header"></div>
        <div class="tabs-content">
          <slot></slot>
        </div>
      </div>
    `;

    this.header = shadow.querySelector('.tabs-header');
  }

  connectedCallback() {
    this.render();
  }

  render() {
    // 获取所有 tab 面板
    const panels = Array.from(this.querySelectorAll('[slot^="panel"]'));

    // 创建 tab 按钮
    this.header.innerHTML = '';
    panels.forEach((panel, index) => {
      const btn = document.createElement('button');
      btn.className = 'tab-btn' + (index === 0 ? ' active' : '');
      btn.textContent = panel.getAttribute('data-label') || `Tab ${index + 1}`;
      btn.addEventListener('click', () => this.switchTab(index));
      this.header.appendChild(btn);

      // 设置初始显示状态
      panel.classList.toggle('active', index === 0);
    });
  }

  switchTab(index) {
    // 更新按钮状态
    const buttons = this.header.querySelectorAll('.tab-btn');
    buttons.forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });

    // 更新面板显示
    const panels = this.querySelectorAll('[slot^="panel"]');
    panels.forEach((panel, i) => {
      panel.classList.toggle('active', i === index);
    });

    // 触发事件
    this.dispatchEvent(new CustomEvent('tab-change', {
      detail: { index }
    }));
  }
}

customElements.define('my-tabs', MyTabs);
```

```html
<my-tabs>
  <div slot="panel-1" data-label="基本信息">
    <p>这是基本信息面板</p>
  </div>
  <div slot="panel-2" data-label="详细设置">
    <p>这是详细设置面板</p>
  </div>
  <div slot="panel-3" data-label="高级选项">
    <p>这是高级选项面板</p>
  </div>
</my-tabs>
```

### 自定义 Modal 组件

```javascript
class MyModal extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>
        :host {
          display: none;
        }
        :host([open]) {
          display: block;
        }
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal {
          background: white;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow: auto;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .header {
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
          line-height: 1;
        }
        .close-btn:hover {
          color: #333;
        }
        .body {
          padding: 20px;
        }
        .footer {
          padding: 16px 20px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
      </style>
      <div class="overlay">
        <div class="modal" role="dialog" aria-modal="true">
          <div class="header">
            <h2 class="title"><slot name="title">标题</slot></h2>
            <button class="close-btn" aria-label="关闭">&times;</button>
          </div>
          <div class="body">
            <slot></slot>
          </div>
          <div class="footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    `;

    this.overlay = shadow.querySelector('.overlay');
    this.closeBtn = shadow.querySelector('.close-btn');
  }

  connectedCallback() {
    this.closeBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    document.addEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  handleKeydown = (e) => {
    if (e.key === 'Escape' && this.hasAttribute('open')) {
      this.close();
    }
  }

  open() {
    this.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
    this.dispatchEvent(new CustomEvent('open'));
  }

  close() {
    this.removeAttribute('open');
    document.body.style.overflow = '';
    this.dispatchEvent(new CustomEvent('close'));
  }

  static get observedAttributes() {
    return ['open'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'open') {
      if (newValue !== null) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }
}

customElements.define('my-modal', MyModal);
```

```html
<button id="open-modal">打开弹窗</button>

<my-modal id="modal">
  <span slot="title">确认操作</span>
  <p>确定要执行此操作吗？</p>
  <div slot="footer">
    <button onclick="modal.close()">取消</button>
    <button onclick="handleConfirm()">确认</button>
  </div>
</my-modal>

<script>
  const modal = document.getElementById('modal');

  document.getElementById('open-modal').addEventListener('click', () => {
    modal.open();
  });

  function handleConfirm() {
    console.log('确认');
    modal.close();
  }
</script>
```

---

## 与框架集成

### 在 React 中使用

```jsx
// React 组件包装器
import { useRef, useEffect } from 'react';

function MyButton({ children, onClick, disabled }) {
  const ref = useRef();

  useEffect(() => {
    const element = ref.current;
    const handler = (e) => onClick?.(e.detail);

    element.addEventListener('my-click', handler);
    return () => element.removeEventListener('my-click', handler);
  }, [onClick]);

  return (
    <my-button ref={ref} disabled={disabled || undefined}>
      {children}
    </my-button>
  );
}

// 使用
function App() {
  return (
    <MyButton onClick={(detail) => console.log(detail)}>
      点击我
    </MyButton>
  );
}
```

### 在 Vue 中使用

```vue
<template>
  <my-counter
    :count="count"
    @change="handleChange"
  ></my-counter>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);

function handleChange(e) {
  count.value = e.detail.count;
}
</script>

<script>
// vue.config.js 或 vite.config.js
// 告诉 Vue 忽略自定义元素
export default {
  compilerOptions: {
    isCustomElement: (tag) => tag.startsWith('my-')
  }
}
</script>
```

---

## 常见面试题

::: details Q1: Web Components 的优势是什么？
**答案**：

1. **原生支持** - 无需框架依赖，浏览器原生支持
2. **样式隔离** - Shadow DOM 提供完美的样式封装
3. **可复用性** - 跨框架使用，React/Vue/Angular 都能用
4. **标准化** - W3C 标准，长期维护有保障
5. **互操作性** - 与现有 HTML/JS/CSS 无缝集成
:::

::: details Q2: Shadow DOM 和 Virtual DOM 的区别？
**答案**：

| 特性 | Shadow DOM | Virtual DOM |
|------|------------|-------------|
| **本质** | 浏览器原生 API | JavaScript 抽象层 |
| **目的** | 样式和 DOM 封装 | 性能优化 |
| **可见性** | DOM 树中真实存在 | 内存中的 JS 对象 |
| **框架** | 无需框架 | React/Vue 等框架实现 |
| **使用场景** | 组件封装 | 高效 DOM 更新 |
:::

::: details Q3: 如何在 Web Components 中实现双向绑定？
**答案**：

```javascript
class TwoWayInput extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <input type="text">
    `;

    this.input = shadow.querySelector('input');
  }

  static get observedAttributes() {
    return ['value'];
  }

  connectedCallback() {
    this.input.addEventListener('input', (e) => {
      // 更新属性
      this.setAttribute('value', e.target.value);

      // 触发自定义事件
      this.dispatchEvent(new CustomEvent('value-change', {
        detail: { value: e.target.value },
        bubbles: true
      }));
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'value' && this.input.value !== newValue) {
      this.input.value = newValue || '';
    }
  }

  get value() {
    return this.getAttribute('value') || '';
  }

  set value(val) {
    this.setAttribute('value', val);
  }
}

customElements.define('two-way-input', TwoWayInput);
```

---
:::

## 总结

::: details 核心要点
1. **Custom Elements** - 定义自定义 HTML 元素
2. **Shadow DOM** - 封装样式和结构
3. **HTML Templates** - 定义可复用模板
4. **Slots** - 内容分发机制
:::

::: details 适用场景
- 跨框架的 UI 组件库
- 微前端架构中的组件共享
- 设计系统的底层实现
- 需要长期维护的基础组件
:::

::: details 注意事项
- IE 不支持，需要 polyfill
- 部分框架需要额外配置
- SSR 支持有限
- 学习曲线相对较高
:::
