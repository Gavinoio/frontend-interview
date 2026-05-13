# Vue 3 性能优化专题

## 概述

Vue 3 在性能方面有了显著提升，但在大型应用中仍需要合理优化。本文从编译优化、运行时优化、组件优化等多个维度，深入探讨 Vue 3 性能优化的最佳实践。

## Vue 3 内置优化

### 编译时优化

```javascript
// Vue 3 编译器的静态提升
// 模板
<template>
  <div>
    <span>静态内容</span>
    <span>{{ dynamic }}</span>
  </div>
</template>

// 编译后
const _hoisted_1 = /*#__PURE__*/ createVNode("span", null, "静态内容")

function render(_ctx) {
  return createVNode("div", null, [
    _hoisted_1,  // 静态节点被提升
    createVNode("span", null, _ctx.dynamic)
  ])
}
```

### PatchFlags 优化

```javascript
// Vue 3 使用 PatchFlags 标记动态节点
// 只有标记的部分才会进行 diff

// 1 - TEXT：动态文本
// 2 - CLASS：动态 class
// 4 - STYLE：动态 style
// 8 - PROPS：动态 props
// 16 - FULL_PROPS：有动态 key
// 32 - HYDRATE_EVENTS：有事件监听
// 64 - STABLE_FRAGMENT：稳定的 fragment
// 128 - KEYED_FRAGMENT：有 key 的 fragment
// 256 - UNKEYED_FRAGMENT：无 key 的 fragment
// 512 - NEED_PATCH：需要 patch
// 1024 - DYNAMIC_SLOTS：动态插槽
```

### 事件缓存

```javascript
// Vue 3 自动缓存事件处理函数
<template>
  <button @click="handleClick">Click</button>
</template>

// 编译后
function render(_ctx) {
  return createVNode("button", {
    onClick: _cache[0] || (_cache[0] = ($event) => _ctx.handleClick($event))
  }, "Click")
}
```

## 响应式优化

### shallowRef 和 shallowReactive

```javascript
import { shallowRef, shallowReactive, triggerRef } from 'vue';

// shallowRef - 只有 .value 的变化是响应式的
const state = shallowRef({ count: 0 });
state.value.count++;  // 不触发更新
state.value = { count: 1 };  // 触发更新

// 手动触发更新
state.value.count++;
triggerRef(state);  // 强制触发更新

// shallowReactive - 只有第一层是响应式的
const obj = shallowReactive({
  nested: { count: 0 }
});
obj.nested.count++;  // 不触发更新
obj.nested = { count: 1 };  // 触发更新
```

### markRaw - 跳过响应式

```javascript
import { markRaw, reactive } from 'vue';

// 大型对象或第三方库实例
const rawData = markRaw({
  largeArray: new Array(10000).fill(0),
  thirdPartyLib: new SomeLibrary()
});

const state = reactive({
  data: rawData  // 不会被转为响应式
});
```

### toRaw - 获取原始对象

```javascript
import { reactive, toRaw } from 'vue';

const original = { count: 0 };
const proxy = reactive(original);

// 需要传递原始对象给第三方库时
const raw = toRaw(proxy);
someThirdPartyLib.process(raw);
```

### 避免不必要的响应式

```javascript
// 不好：所有数据都是响应式
const state = reactive({
  users: [], // 大数组
  config: { /* 静态配置 */ }
});

// 好：只对需要响应的数据使用响应式
const users = shallowRef([]);
const config = { /* 静态配置 */ };  // 普通对象
```

## 计算属性优化

### 合理使用 computed

```javascript
import { computed, ref } from 'vue';

const items = ref([/* 大量数据 */]);
const filter = ref('');

// 好：使用 computed 缓存计算结果
const filteredItems = computed(() => {
  return items.value.filter(item =>
    item.name.includes(filter.value)
  );
});

// 不好：每次渲染都重新计算
// const filteredItems = items.value.filter(...)
```

### computed 的 getter/setter

```javascript
const firstName = ref('John');
const lastName = ref('Doe');

// 带 setter 的 computed
const fullName = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: (value) => {
    const [first, last] = value.split(' ');
    firstName.value = first;
    lastName.value = last;
  }
});
```

### 避免 computed 中的副作用

```javascript
// 不好：computed 中有副作用
const badComputed = computed(() => {
  console.log('computed');  // 副作用
  someApiCall();  // 副作用
  return data.value * 2;
});

// 好：computed 保持纯净
const goodComputed = computed(() => data.value * 2);

// 副作用使用 watchEffect
watchEffect(() => {
  console.log('effect');
  someApiCall();
});
```

## 组件优化

### v-once - 只渲染一次

```vue
<template>
  <!-- 静态内容只渲染一次 -->
  <div v-once>
    <h1>{{ title }}</h1>
    <p>{{ staticContent }}</p>
  </div>
</template>
```

### v-memo - 条件缓存

```vue
<template>
  <!-- 只有当 item.id 变化时才重新渲染 -->
  <div v-for="item in list" :key="item.id" v-memo="[item.id]">
    <ExpensiveComponent :data="item" />
  </div>

  <!-- 条件缓存 -->
  <div v-memo="[selected === item.id]">
    <p>{{ item.name }}</p>
    <p>Selected: {{ selected === item.id }}</p>
  </div>
</template>
```

### 异步组件

```javascript
import { defineAsyncComponent } from 'vue';

// 基本用法
const AsyncComp = defineAsyncComponent(() =>
  import('./components/HeavyComponent.vue')
);

// 带配置
const AsyncCompWithOptions = defineAsyncComponent({
  loader: () => import('./components/HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200,  // 显示 loading 前的延迟
  timeout: 10000,  // 超时时间
  suspensible: false  // 是否支持 Suspense
});
```

### KeepAlive 缓存组件

```vue
<template>
  <!-- 缓存组件状态 -->
  <KeepAlive>
    <component :is="currentTab" />
  </KeepAlive>

  <!-- 指定缓存组件 -->
  <KeepAlive include="Home,About">
    <component :is="currentTab" />
  </KeepAlive>

  <!-- 排除组件 -->
  <KeepAlive exclude="Settings">
    <component :is="currentTab" />
  </KeepAlive>

  <!-- 限制缓存数量 -->
  <KeepAlive :max="10">
    <component :is="currentTab" />
  </KeepAlive>
</template>

<script setup>
import { onActivated, onDeactivated } from 'vue';

// KeepAlive 生命周期
onActivated(() => {
  console.log('组件被激活');
});

onDeactivated(() => {
  console.log('组件被缓存');
});
</script>
```

### 函数式组件（无状态）

```vue
<script setup>
// 纯展示组件，没有响应式状态
defineProps(['title', 'content']);
</script>

<template>
  <div class="card">
    <h2>{{ title }}</h2>
    <p>{{ content }}</p>
  </div>
</template>
```

## 列表渲染优化

### 使用 key

```vue
<template>
  <!-- 好：使用唯一 key -->
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>

  <!-- 不好：使用 index 作为 key -->
  <div v-for="(item, index) in items" :key="index">
    {{ item.name }}
  </div>
</template>
```

### 虚拟滚动

```vue
<template>
  <!-- 使用 vue-virtual-scroller -->
  <RecycleScroller
    class="scroller"
    :items="items"
    :item-size="50"
    key-field="id"
    v-slot="{ item }"
  >
    <div class="item">{{ item.name }}</div>
  </RecycleScroller>
</template>

<script setup>
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

const items = ref(Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`
})));
</script>
```

### 分页加载

```vue
<script setup>
import { ref, onMounted } from 'vue';

const items = ref([]);
const page = ref(1);
const loading = ref(false);
const hasMore = ref(true);

async function loadMore() {
  if (loading.value || !hasMore.value) return;

  loading.value = true;
  const newItems = await fetchItems(page.value);

  if (newItems.length === 0) {
    hasMore.value = false;
  } else {
    items.value.push(...newItems);
    page.value++;
  }

  loading.value = false;
}

// 使用 IntersectionObserver 实现无限滚动
const sentinel = ref(null);

onMounted(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        loadMore();
      }
    },
    { threshold: 0.1 }
  );

  if (sentinel.value) {
    observer.observe(sentinel.value);
  }
});
</script>

<template>
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
  <div ref="sentinel" v-show="hasMore">加载中...</div>
</template>
```

## Watch 优化

### 精确监听

```javascript
import { watch, ref } from 'vue';

const state = ref({
  user: { name: 'John', profile: { age: 25 } },
  settings: { theme: 'dark' }
});

// 不好：监听整个对象
watch(state, () => {
  console.log('state changed');
}, { deep: true });

// 好：只监听需要的部分
watch(
  () => state.value.user.name,
  (newName) => {
    console.log('name changed:', newName);
  }
);
```

### 使用 watchEffect 的清理函数

```javascript
import { watchEffect, ref } from 'vue';

const id = ref(1);

watchEffect((onCleanup) => {
  const controller = new AbortController();

  fetch(`/api/data/${id.value}`, {
    signal: controller.signal
  })
    .then(res => res.json())
    .then(data => console.log(data));

  // 清理函数：在下次执行前或组件卸载时调用
  onCleanup(() => {
    controller.abort();
  });
});
```

### 延迟执行

```javascript
import { watch, ref } from 'vue';

const searchQuery = ref('');

// 防抖
let timeout;
watch(searchQuery, (value) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    performSearch(value);
  }, 300);
});

// 或使用 flush: 'post'
watch(source, callback, {
  flush: 'post'  // DOM 更新后执行
});
```

## 构建优化

### Tree-shaking

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['element-plus']
        }
      }
    }
  }
};
```

### 按需导入

```javascript
// 不好：全量导入
import ElementPlus from 'element-plus';
app.use(ElementPlus);

// 好：按需导入
import { ElButton, ElInput } from 'element-plus';
app.component('ElButton', ElButton);
app.component('ElInput', ElInput);

// 使用 unplugin-vue-components 自动导入
// vite.config.js
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default {
  plugins: [
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ]
};
```

### 代码分割

```javascript
// 路由懒加载
const routes = [
  {
    path: '/dashboard',
    component: () => import('./views/Dashboard.vue')
  },
  {
    path: '/settings',
    component: () => import('./views/Settings.vue')
  }
];

// 带注释的分组
const routes = [
  {
    path: '/admin',
    component: () => import(/* webpackChunkName: "admin" */ './views/Admin.vue')
  }
];
```

## 性能监控

### 使用 Vue Devtools

```javascript
// 开启性能追踪
app.config.performance = true;

// 在 Chrome Performance 面板中可以看到组件渲染时间
```

### 自定义性能监控

```javascript
import { onMounted, onUpdated, getCurrentInstance } from 'vue';

// 组件渲染时间
function useRenderTime() {
  const instance = getCurrentInstance();
  let startTime;

  onMounted(() => {
    const renderTime = performance.now() - startTime;
    console.log(`${instance?.type.name} mounted in ${renderTime}ms`);
  });

  onUpdated(() => {
    const updateTime = performance.now() - startTime;
    console.log(`${instance?.type.name} updated in ${updateTime}ms`);
  });

  // 在 setup 开始时记录
  startTime = performance.now();
}
```

### 使用 Performance API

```javascript
// 标记和测量
function measureComponent(name) {
  return {
    start() {
      performance.mark(`${name}-start`);
    },
    end() {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);

      const measures = performance.getEntriesByName(name);
      console.log(`${name}: ${measures[0].duration}ms`);

      // 清理
      performance.clearMarks();
      performance.clearMeasures();
    }
  };
}
```

## 面试常见问题

::: details 1. Vue 3 相比 Vue 2 有哪些性能提升？
- **编译优化**：静态提升、PatchFlags、事件缓存
- **响应式优化**：Proxy 替代 Object.defineProperty
- **Tree-shaking**：按需打包，减小体积
- **Fragment**：减少无意义的根节点
- **Teleport**：更高效的弹窗渲染
:::

::: details 2. 什么时候使用 shallowRef？
- 大型对象或数组，内部数据变化频繁但不需要细粒度响应
- 第三方库实例
- 性能敏感场景，手动控制更新
:::

::: details 3. v-memo 的使用场景？
- 大列表中每项包含复杂子组件
- 条件渲染优化（如选中状态）
- 需要精确控制重渲染的场景
:::

::: details 4. 如何优化大列表渲染？
```javascript
// 1. 虚拟滚动
// 2. 分页加载
// 3. v-memo 缓存
// 4. shallowRef 减少响应式开销
// 5. 使用 key 优化 diff
```
:::

::: details 5. computed 和 watch 的性能差异？
- **computed**：有缓存，依赖不变不重新计算
- **watch**：每次依赖变化都执行
- 优先使用 computed，需要副作用时使用 watch
:::

## 总结

Vue 3 性能优化的核心策略：

1. **响应式优化**：shallowRef、markRaw、避免不必要的响应式
2. **组件优化**：v-once、v-memo、异步组件、KeepAlive
3. **列表优化**：虚拟滚动、分页加载、正确使用 key
4. **计算优化**：合理使用 computed、精确监听
5. **构建优化**：Tree-shaking、按需导入、代码分割

掌握这些优化技巧，能够构建高性能的 Vue 3 应用。
