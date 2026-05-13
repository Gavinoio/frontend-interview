# Vue 自定义指令完全指南

## 概述

Vue 指令是带有 `v-` 前缀的特殊属性。除了内置指令（v-if、v-for、v-model 等），Vue 还允许注册自定义指令，用于对 DOM 元素进行底层操作。

## 指令基础

### 注册方式

```javascript
// 全局注册 - Vue 3
const app = createApp(App);
app.directive('focus', {
  mounted(el) {
    el.focus();
  }
});

// 局部注册 - Vue 3 选项式
export default {
  directives: {
    focus: {
      mounted(el) {
        el.focus();
      }
    }
  }
}

// 局部注册 - Vue 3 组合式 <script setup>
const vFocus = {
  mounted: (el) => el.focus()
};
// 使用时：<input v-focus />
```

### 函数简写

```javascript
// 当只需要在 mounted 和 updated 触发相同行为时
app.directive('color', (el, binding) => {
  el.style.color = binding.value;
});

// 等价于
app.directive('color', {
  mounted(el, binding) {
    el.style.color = binding.value;
  },
  updated(el, binding) {
    el.style.color = binding.value;
  }
});
```

## 指令钩子函数

### Vue 3 钩子

```javascript
const myDirective = {
  // 绑定元素的 attribute 或事件监听器被应用之前调用
  created(el, binding, vnode, prevVnode) {},

  // 元素被插入到 DOM 前调用
  beforeMount(el, binding, vnode, prevVnode) {},

  // 绑定元素的父组件及所有子节点都挂载完成后调用
  mounted(el, binding, vnode, prevVnode) {},

  // 绑定元素的父组件更新前调用
  beforeUpdate(el, binding, vnode, prevVnode) {},

  // 绑定元素的父组件及所有子节点都更新后调用
  updated(el, binding, vnode, prevVnode) {},

  // 绑定元素的父组件卸载前调用
  beforeUnmount(el, binding, vnode, prevVnode) {},

  // 绑定元素的父组件卸载后调用
  unmounted(el, binding, vnode, prevVnode) {}
};
```

### Vue 2 vs Vue 3 钩子对比

| Vue 2 | Vue 3 | 说明 |
|-------|-------|------|
| bind | beforeMount | 指令首次绑定到元素 |
| inserted | mounted | 元素插入父节点 |
| update | beforeUpdate + updated | 组件更新 |
| componentUpdated | updated | 组件及子组件更新完成 |
| unbind | unmounted | 指令与元素解绑 |
| - | created | 新增：属性绑定前 |
| - | beforeUnmount | 新增：卸载前 |

## 钩子参数

### binding 对象

```javascript
app.directive('example', {
  mounted(el, binding, vnode, prevVnode) {
    console.log(binding);
  }
});

// binding 对象包含：
{
  value: any,        // 指令绑定的值，如 v-my="1+1" 则为 2
  oldValue: any,     // 之前的值，仅在 beforeUpdate 和 updated 中可用
  arg: string,       // 传给指令的参数，如 v-my:foo 则为 "foo"
  modifiers: object, // 修饰符对象，如 v-my.a.b 则为 { a: true, b: true }
  instance: object,  // 使用该指令的组件实例
  dir: object        // 指令定义对象
}
```

### 使用示例

```html
<div v-example:arg.modifier1.modifier2="value"></div>
```

```javascript
app.directive('example', {
  mounted(el, binding) {
    // binding.arg = 'arg'
    // binding.modifiers = { modifier1: true, modifier2: true }
    // binding.value = value 的值
  }
});
```

## 实战指令示例

### 1. v-focus（自动聚焦）

```javascript
// 自动聚焦指令
const vFocus = {
  mounted(el, binding) {
    // 支持条件聚焦
    if (binding.value !== false) {
      el.focus();
    }
  },
  updated(el, binding) {
    if (binding.value && !binding.oldValue) {
      el.focus();
    }
  }
};

// 使用
// <input v-focus />
// <input v-focus="shouldFocus" />
```

### 2. v-click-outside（点击外部）

```javascript
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      // 判断点击是否在元素外部
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el._clickOutside);
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside);
    delete el._clickOutside;
  }
};

// 使用
// <div v-click-outside="handleClickOutside">...</div>
```

### 3. v-debounce（防抖）

```javascript
const vDebounce = {
  mounted(el, binding) {
    const { value, arg = 'click' } = binding;
    const delay = binding.modifiers.delay || 300;

    let timer = null;

    el._debounceHandler = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        value();
      }, delay);
    };

    el.addEventListener(arg, el._debounceHandler);
  },
  unmounted(el, binding) {
    const { arg = 'click' } = binding;
    el.removeEventListener(arg, el._debounceHandler);
    delete el._debounceHandler;
  }
};

// 使用
// <button v-debounce="handleClick">点击</button>
// <input v-debounce:input="handleInput" />
```

### 4. v-throttle（节流）

```javascript
const vThrottle = {
  mounted(el, binding) {
    const { value, arg = 'click' } = binding;
    const delay = binding.modifiers.delay || 300;

    let lastTime = 0;

    el._throttleHandler = () => {
      const now = Date.now();
      if (now - lastTime >= delay) {
        lastTime = now;
        value();
      }
    };

    el.addEventListener(arg, el._throttleHandler);
  },
  unmounted(el, binding) {
    const { arg = 'click' } = binding;
    el.removeEventListener(arg, el._throttleHandler);
    delete el._throttleHandler;
  }
};

// 使用
// <button v-throttle="handleClick">点击</button>
// <div v-throttle:scroll="handleScroll">...</div>
```

### 5. v-lazy（图片懒加载）

```javascript
const vLazy = {
  mounted(el, binding) {
    const defaultImg = binding.arg || '/placeholder.png';

    // 设置默认图片
    el.src = defaultImg;

    // 使用 IntersectionObserver
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.src = binding.value;
        el.onerror = () => {
          el.src = defaultImg;
        };
        observer.unobserve(el);
      }
    }, {
      rootMargin: '100px'
    });

    el._lazyObserver = observer;
    observer.observe(el);
  },
  unmounted(el) {
    el._lazyObserver?.disconnect();
    delete el._lazyObserver;
  }
};

// 使用
// <img v-lazy="imageUrl" />
// <img v-lazy:"/error.png"="imageUrl" />
```

### 6. v-loading（加载状态）

```javascript
const vLoading = {
  mounted(el, binding) {
    // 创建加载遮罩
    const mask = document.createElement('div');
    mask.className = 'loading-mask';
    mask.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <span>加载中...</span>
      </div>
    `;

    el._loadingMask = mask;
    el.style.position = 'relative';

    if (binding.value) {
      el.appendChild(mask);
    }
  },
  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      if (binding.value) {
        el.appendChild(el._loadingMask);
      } else {
        el._loadingMask.remove();
      }
    }
  },
  unmounted(el) {
    el._loadingMask?.remove();
    delete el._loadingMask;
  }
};

// 使用
// <div v-loading="isLoading">...</div>
```

### 7. v-permission（权限控制）

```javascript
const vPermission = {
  mounted(el, binding) {
    const { value } = binding;
    // 从 store 或其他地方获取用户权限
    const userPermissions = store.getters.permissions;

    // value 可以是字符串或数组
    const requiredPermissions = Array.isArray(value) ? value : [value];

    // 检查权限
    const hasPermission = requiredPermissions.some(
      permission => userPermissions.includes(permission)
    );

    if (!hasPermission) {
      // 无权限时移除元素
      el.parentNode?.removeChild(el);
    }
  }
};

// 使用
// <button v-permission="'admin'">管理员按钮</button>
// <button v-permission="['admin', 'editor']">编辑按钮</button>
```

### 8. v-copy（复制文本）

```javascript
const vCopy = {
  mounted(el, binding) {
    el._copyHandler = async () => {
      const text = binding.value || el.innerText;

      try {
        await navigator.clipboard.writeText(text);
        // 成功回调
        binding.arg?.success?.();
      } catch (err) {
        // 失败回调
        binding.arg?.error?.(err);
      }
    };

    el.addEventListener('click', el._copyHandler);
  },
  unmounted(el) {
    el.removeEventListener('click', el._copyHandler);
    delete el._copyHandler;
  }
};

// 使用
// <button v-copy="'复制的文本'">复制</button>
// <button v-copy="textToCopy">复制</button>
```

### 9. v-tooltip（提示框）

```javascript
const vTooltip = {
  mounted(el, binding) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = binding.value;

    // 定位
    const position = binding.arg || 'top';
    tooltip.classList.add(`tooltip-${position}`);

    el._tooltip = tooltip;

    el.addEventListener('mouseenter', () => {
      document.body.appendChild(tooltip);

      // 计算位置
      const rect = el.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      let top, left;
      switch (position) {
        case 'top':
          top = rect.top - tooltipRect.height - 8;
          left = rect.left + (rect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = rect.bottom + 8;
          left = rect.left + (rect.width - tooltipRect.width) / 2;
          break;
        // ... 其他位置
      }

      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
    });

    el.addEventListener('mouseleave', () => {
      tooltip.remove();
    });
  },
  updated(el, binding) {
    el._tooltip.textContent = binding.value;
  },
  unmounted(el) {
    el._tooltip?.remove();
    delete el._tooltip;
  }
};

// 使用
// <button v-tooltip="'提示文本'">悬停</button>
// <button v-tooltip:bottom="'底部提示'">悬停</button>
```

### 10. v-longpress（长按）

```javascript
const vLongpress = {
  mounted(el, binding) {
    const duration = binding.arg || 1000;
    let timer = null;

    const start = (e) => {
      if (e.type === 'click' && e.button !== 0) return;

      timer = setTimeout(() => {
        binding.value(e);
      }, duration);
    };

    const cancel = () => {
      clearTimeout(timer);
      timer = null;
    };

    // 支持触屏和鼠标
    el.addEventListener('mousedown', start);
    el.addEventListener('touchstart', start);
    el.addEventListener('mouseup', cancel);
    el.addEventListener('touchend', cancel);
    el.addEventListener('touchcancel', cancel);
    el.addEventListener('mouseleave', cancel);

    el._longpressHandlers = { start, cancel };
  },
  unmounted(el) {
    const { start, cancel } = el._longpressHandlers;
    el.removeEventListener('mousedown', start);
    el.removeEventListener('touchstart', start);
    el.removeEventListener('mouseup', cancel);
    el.removeEventListener('touchend', cancel);
    el.removeEventListener('touchcancel', cancel);
    el.removeEventListener('mouseleave', cancel);
    delete el._longpressHandlers;
  }
};

// 使用
// <button v-longpress="handleLongPress">长按</button>
// <button v-longpress:2000="handleLongPress">长按2秒</button>
```

## 指令工厂模式

### 创建可配置指令

```javascript
// 指令工厂函数
function createPermissionDirective(options = {}) {
  const { getPermissions, action = 'remove' } = options;

  return {
    mounted(el, binding) {
      const permissions = getPermissions();
      const required = Array.isArray(binding.value) ? binding.value : [binding.value];

      const hasPermission = required.some(p => permissions.includes(p));

      if (!hasPermission) {
        switch (action) {
          case 'remove':
            el.parentNode?.removeChild(el);
            break;
          case 'disable':
            el.disabled = true;
            el.style.opacity = '0.5';
            break;
          case 'hide':
            el.style.display = 'none';
            break;
        }
      }
    }
  };
}

// 使用
app.directive('permission', createPermissionDirective({
  getPermissions: () => store.state.user.permissions,
  action: 'disable'
}));
```

## 指令与组合式 API

### 在 setup 中使用指令

```vue
<script setup>
import { ref } from 'vue';

// 以 v 开头的变量会自动注册为指令
const vHighlight = {
  mounted(el, binding) {
    el.style.backgroundColor = binding.value || 'yellow';
  },
  updated(el, binding) {
    el.style.backgroundColor = binding.value || 'yellow';
  }
};

const color = ref('lightblue');
</script>

<template>
  <p v-highlight="color">高亮文本</p>
  <button @click="color = 'pink'">改变颜色</button>
</template>
```

### 封装为组合式函数

```javascript
// useDirective.js
import { onMounted, onUnmounted, ref } from 'vue';

export function useClickOutside(elementRef, callback) {
  const handler = (event) => {
    if (elementRef.value && !elementRef.value.contains(event.target)) {
      callback(event);
    }
  };

  onMounted(() => {
    document.addEventListener('click', handler);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handler);
  });
}

// 使用
const menuRef = ref(null);
useClickOutside(menuRef, () => {
  closeMenu();
});
```

