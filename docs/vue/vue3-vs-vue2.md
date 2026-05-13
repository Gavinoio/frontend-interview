# Vue 3 vs Vue 2 全面对比 【高频必考】

## 核心差异一览

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 响应式系统 | Object.defineProperty | Proxy |
| API 风格 | Options API | Options API + Composition API |
| 生命周期 | beforeDestroy/destroyed | beforeUnmount/unmounted |
| 根节点要求 | 单根节点 | 多根节点（Fragments） |
| TypeScript | 支持一般 | 原生支持 |
| 打包体积 | 较大 | Tree-shaking 更小 |
| 性能 | 良好 | 更优秀 |

---

## 一、响应式系统【必考】

### Vue 2: Object.defineProperty

```javascript
// Vue 2 响应式原理简化实现
function defineReactive(obj, key, val) {
  const dep = new Dep()

  Object.defineProperty(obj, key, {
    get() {
      // 收集依赖
      if (Dep.target) {
        dep.depend()
      }
      return val
    },
    set(newVal) {
      if (newVal === val) return
      val = newVal
      // 触发更新
      dep.notify()
    }
  })
}

// 对于数组，需要重写数组方法
const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)

;['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(method => {
  arrayMethods[method] = function(...args) {
    const result = arrayProto[method].apply(this, args)
    // 触发更新
    this.__ob__.dep.notify()
    return result
  }
})
```

**Vue 2 响应式的缺陷**：

```javascript
// ❌ 问题1：无法检测对象属性的添加和删除
this.obj.newProp = 'value'  // 不触发更新
delete this.obj.existingProp  // 不触发更新

// 解决方案
this.$set(this.obj, 'newProp', 'value')
this.$delete(this.obj, 'existingProp')

// ❌ 问题2：无法检测数组索引变化
this.arr[0] = 'new value'  // 不触发更新
this.arr.length = 0  // 不触发更新

// 解决方案
this.$set(this.arr, 0, 'new value')
this.arr.splice(0)

// ❌ 问题3：性能问题
// 需要递归遍历所有属性，初始化时开销大
```

### Vue 3: Proxy

```javascript
// Vue 3 响应式原理简化实现
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      // 收集依赖
      track(target, key)
      const result = Reflect.get(target, key, receiver)
      // 如果是对象，递归代理（惰性）
      if (typeof result === 'object' && result !== null) {
        return reactive(result)
      }
      return result
    },
    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      if (oldValue !== value) {
        // 触发更新
        trigger(target, key)
      }
      return result
    },
    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(target, key)
      // 触发更新
      trigger(target, key)
      return result
    }
  })
}
```

**Vue 3 响应式的优势**：

```javascript
// ✅ 可以检测属性的添加和删除
const state = reactive({ count: 0 })
state.newProp = 'value'  // 自动触发更新
delete state.count  // 自动触发更新

// ✅ 可以检测数组索引变化
const arr = reactive([1, 2, 3])
arr[0] = 'new'  // 自动触发更新
arr.length = 0  // 自动触发更新

// ✅ 惰性代理，按需创建
// 只有访问到深层属性时才会代理，性能更好
```

### 面试题：ref 和 reactive 的区别？

```javascript
import { ref, reactive } from 'vue'

// ref - 用于基本类型（也可用于对象）
const count = ref(0)
console.log(count.value)  // 需要 .value
count.value++

// reactive - 用于对象类型
const state = reactive({ count: 0 })
console.log(state.count)  // 不需要 .value
state.count++

// ❌ reactive 的陷阱：解构会失去响应性
const { count } = reactive({ count: 0 })
count++  // 不触发更新！

// ✅ 使用 toRefs 保持响应性
const state = reactive({ count: 0 })
const { count } = toRefs(state)
count.value++  // 正常触发更新
```

---

## 二、Composition API vs Options API

### Options API (Vue 2 风格)

```javascript
export default {
  data() {
    return {
      count: 0,
      name: 'Vue'
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2
    }
  },
  watch: {
    count(newVal, oldVal) {
      console.log('count changed')
    }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  mounted() {
    console.log('mounted')
  }
}
```

**Options API 的问题**：
- 逻辑分散：一个功能的代码散落在 data、methods、computed、watch 等各处
- 代码复用困难：只能用 mixins，但有命名冲突和来源不明确的问题
- TypeScript 支持不够好

### Composition API (Vue 3 风格)

```javascript
import { ref, computed, watch, onMounted } from 'vue'

export default {
  setup() {
    // 功能1：计数器
    const count = ref(0)
    const doubleCount = computed(() => count.value * 2)
    const increment = () => count.value++

    watch(count, (newVal, oldVal) => {
      console.log('count changed')
    })

    // 功能2：用户信息
    const name = ref('Vue')

    onMounted(() => {
      console.log('mounted')
    })

    return { count, doubleCount, increment, name }
  }
}
```

### 使用 `<script setup>` 语法糖

```vue
<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// 功能1：计数器
const count = ref(0)
const doubleCount = computed(() => count.value * 2)
const increment = () => count.value++

watch(count, (newVal) => {
  console.log('count changed:', newVal)
})

// 功能2：用户信息
const name = ref('Vue')

onMounted(() => {
  console.log('mounted')
})

// 不需要 return，自动暴露给模板
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">+1</button>
  </div>
</template>
```

### 逻辑复用：Composables

```javascript
// useCounter.js - 封装计数器逻辑
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const doubleCount = computed(() => count.value * 2)

  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initialValue

  return {
    count,
    doubleCount,
    increment,
    decrement,
    reset
  }
}

// useMouse.js - 封装鼠标位置逻辑
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  const update = (e) => {
    x.value = e.pageX
    y.value = e.pageY
  }

  onMounted(() => {
    window.addEventListener('mousemove', update)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })

  return { x, y }
}

// 组件中使用
<script setup>
import { useCounter } from './useCounter'
import { useMouse } from './useMouse'

const { count, increment } = useCounter(10)
const { x, y } = useMouse()
</script>
```

### 对比：Mixins vs Composables

| 特性 | Mixins (Vue 2) | Composables (Vue 3) |
|------|----------------|---------------------|
| 来源清晰 | ❌ 不清楚属性来自哪个 mixin | ✅ 明确知道来源 |
| 命名冲突 | ❌ 会产生冲突 | ✅ 解构时自己命名 |
| 类型推导 | ❌ 困难 | ✅ 完美支持 |
| 参数传递 | ❌ 不支持 | ✅ 函数参数 |

---

## 三、新特性详解

### 1. Teleport（传送门）

```vue
<template>
  <button @click="showModal = true">打开弹窗</button>

  <!-- 将内容传送到 body 下 -->
  <Teleport to="body">
    <div v-if="showModal" class="modal">
      <h2>弹窗标题</h2>
      <button @click="showModal = false">关闭</button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
const showModal = ref(false)
</script>

<style>
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
</style>
```

### 2. Suspense（异步组件）

```vue
<template>
  <Suspense>
    <!-- 异步组件 -->
    <template #default>
      <AsyncComponent />
    </template>

    <!-- 加载中显示 -->
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() =>
  import('./AsyncComponent.vue')
)
</script>
```

```vue
<!-- AsyncComponent.vue -->
<script setup>
// 组件内部使用 async setup
const data = await fetch('/api/data').then(r => r.json())
</script>

<template>
  <div>{{ data }}</div>
</template>
```

### 3. Fragments（多根节点）

```vue
<!-- Vue 2：必须单根节点 -->
<template>
  <div>
    <header>Header</header>
    <main>Main</main>
    <footer>Footer</footer>
  </div>
</template>

<!-- Vue 3：支持多根节点 -->
<template>
  <header>Header</header>
  <main>Main</main>
  <footer>Footer</footer>
</template>
```

### 4. emits 选项

```vue
<script setup>
// 声明组件触发的事件
const emit = defineEmits(['update', 'delete'])

// 带验证的事件
const emit = defineEmits({
  update: (payload) => {
    // 返回 true/false 表示验证是否通过
    return payload.id !== undefined
  },
  delete: null  // 不需要验证
})

const handleUpdate = () => {
  emit('update', { id: 1, name: 'test' })
}
</script>
```

### 5. 多个 v-model

```vue
<!-- Vue 2：只支持一个 v-model -->
<CustomInput v-model="value" />
<!-- 等价于 -->
<CustomInput :value="value" @input="value = $event" />

<!-- Vue 3：支持多个 v-model -->
<UserForm
  v-model:firstName="firstName"
  v-model:lastName="lastName"
/>
<!-- 等价于 -->
<UserForm
  :firstName="firstName"
  @update:firstName="firstName = $event"
  :lastName="lastName"
  @update:lastName="lastName = $event"
/>
```

```vue
<!-- UserForm.vue -->
<script setup>
defineProps(['firstName', 'lastName'])
const emit = defineEmits(['update:firstName', 'update:lastName'])
</script>

<template>
  <input
    :value="firstName"
    @input="emit('update:firstName', $event.target.value)"
  />
  <input
    :value="lastName"
    @input="emit('update:lastName', $event.target.value)"
  />
</template>
```

---

## 四、性能优化

### 1. 编译优化

```vue
<template>
  <div>
    <!-- 静态节点：编译时会被标记，更新时跳过 -->
    <h1>静态标题</h1>

    <!-- 动态节点：只更新这部分 -->
    <p>{{ message }}</p>

    <!-- 静态属性会被提升 -->
    <div class="static-class" id="static-id">
      {{ dynamicContent }}
    </div>
  </div>
</template>
```

Vue 3 的编译优化：
- **静态提升**：静态节点只创建一次
- **Patch Flag**：标记动态内容类型，更新时精确定位
- **缓存事件处理器**：内联函数不会每次重新创建

### 2. Tree-shaking

```javascript
// Vue 2：全量引入
import Vue from 'vue'

// Vue 3：按需引入
import { ref, computed, watch } from 'vue'

// 没用到的功能不会打包
// 如：Teleport、Suspense、KeepAlive 等
```

### 3. 源码优化

| 优化项 | Vue 2 | Vue 3 |
|--------|-------|-------|
| 源码结构 | 单一仓库 | Monorepo |
| 代码语言 | JavaScript | TypeScript |
| Proxy | 不支持 | 支持 |
| 包体积 | ~20KB | ~10KB（核心） |

---

## 五、API 变化

### 移除的 API

```javascript
// ❌ Vue 3 移除
Vue.config.keyCodes  // 自定义按键修饰符
$on, $off, $once     // 事件总线相关
$children            // 使用 ref 代替
filters              // 使用 computed 或方法代替

// $listeners 合并到 $attrs
// $scopedSlots 合并到 $slots
```

### 新增的 API

```javascript
// ✅ Vue 3 新增
createApp()          // 创建应用实例
app.config.globalProperties  // 全局属性
app.provide()        // 应用级 provide
watchEffect()        // 自动收集依赖的 watch
watchPostEffect()    // DOM 更新后执行
shallowRef()         // 浅层响应式
shallowReactive()    // 浅层响应式对象
triggerRef()         // 手动触发更新
customRef()          // 自定义 ref
```

---

## 六、经典面试题

::: details 面试题 1：Vue 3 相比 Vue 2 有哪些优化？
<details>
<summary>点击查看答案</summary>

**1. 响应式系统优化**
- Proxy 替代 Object.defineProperty
- 支持属性增删、数组索引修改
- 惰性代理，按需创建

**2. 编译优化**
- 静态提升
- Patch Flag 精确更新
- 缓存事件处理器

**3. 源码优化**
- TypeScript 重写
- Monorepo 架构
- 更好的 Tree-shaking

**4. 新特性**
- Composition API
- Teleport、Suspense
- Fragments

**5. 性能数据**
- 首次渲染快 55%
- 更新快 133%
- 内存占用少 54%
:::

---

</details>

::: details 面试题 2：为什么 Vue 3 用 Proxy 替代 Object.defineProperty？
<details>
<summary>点击查看答案</summary>

**Object.defineProperty 的问题**：

1. **无法检测属性增删**
```javascript
this.obj.newProp = 'value'  // 不触发更新
```

2. **无法检测数组索引变化**
```javascript
this.arr[0] = 'new'  // 不触发更新
```

3. **需要递归遍历**
```javascript
// 初始化时需要遍历所有属性，性能差
```

**Proxy 的优势**：

1. **可以代理整个对象**
2. **支持 13 种拦截操作**（get、set、has、deleteProperty 等）
3. **惰性代理**：访问时才代理深层对象
4. **原生支持数组**
:::

---

</details>

::: details 面试题 3：Composition API 的优势是什么？
<details>
<summary>点击查看答案</summary>

1. **逻辑聚合**
   - 相关逻辑放在一起，而不是分散在 data、methods、computed 等

2. **更好的代码复用**
   - Composables 比 mixins 更清晰、无命名冲突

3. **更好的类型推导**
   - TypeScript 支持更完善

4. **更小的打包体积**
   - 函数名可以被压缩

5. **更灵活**
   - 可以在任意位置组织代码

```javascript
// 逻辑聚合示例
setup() {
  // 用户相关逻辑
  const { user, fetchUser, updateUser } = useUser()

  // 权限相关逻辑
  const { permissions, checkPermission } = usePermission()

  // 清晰的逻辑分组
  return { user, permissions }
}
```
:::

---

</details>

::: details 面试题 4：ref 和 reactive 怎么选？
<details>
<summary>点击查看答案</summary>

**ref**：
- 用于基本类型：`ref(0)`、`ref('hello')`
- 用于需要整体替换的对象：`ref({ a: 1 })`
- 模板中自动解包，JS 中需要 `.value`

**reactive**：
- 用于复杂对象：`reactive({ user: { name: 'John' } })`
- 不需要 `.value`
- 不能解构（会失去响应性）
- 不能整体替换

**推荐用法**：
```javascript
// ✅ 简单值用 ref
const count = ref(0)
const name = ref('Vue')

// ✅ 表单等复杂对象用 reactive
const form = reactive({
  username: '',
  password: '',
  remember: false
})

// ✅ 需要整体替换的用 ref
const user = ref(null)
user.value = await fetchUser()

// ❌ 不要用 reactive 替换整个对象
const state = reactive({ user: null })
state.user = await fetchUser()  // 这样可以
state = { user: newUser }  // ❌ 这样不行
```
:::

---

</details>

::: details 面试题 5：setup 中如何访问 this？
<details>
<summary>点击查看答案</summary>

**setup 中没有 this！**

```javascript
export default {
  setup() {
    console.log(this)  // undefined
  }
}
```

**替代方案**：

```javascript
import { getCurrentInstance } from 'vue'

setup() {
  // 1. 使用 getCurrentInstance（不推荐在业务代码中使用）
  const instance = getCurrentInstance()
  console.log(instance.proxy)  // 相当于 this

  // 2. 使用 defineProps、defineEmits
  const props = defineProps(['name'])
  const emit = defineEmits(['update'])

  // 3. 使用 useRouter、useStore 等 composables
  const router = useRouter()
  const store = useStore()
}
```
:::

---

</details>

::: details 面试题 6：Vue 3 的 Teleport 有什么用？
<details>
<summary>点击查看答案</summary>

**用途**：将组件的一部分渲染到 DOM 中的其他位置。

**典型场景**：
1. **模态框/对话框**：避免 z-index 和样式问题
2. **通知/Toast**：统一渲染到页面顶层
3. **全屏加载**：不受父组件样式影响

```vue
<template>
  <div class="container">
    <!-- 即使在深层嵌套的组件中 -->
    <Teleport to="body">
      <div class="modal">
        <!-- 渲染到 body 下，避免样式污染 -->
      </div>
    </Teleport>
  </div>
</template>
```

**与 React Portal 类似**。
:::

---

</details>

::: details 面试题 7：Vue 3 的响应式是完全兼容 Vue 2 的吗？
<details>
<summary>点击查看答案</summary>

**不完全兼容！** 主要区别：

1. **ref 需要 .value**
```javascript
// Vue 3
const count = ref(0)
count.value++  // 需要 .value
```

2. **reactive 的解构问题**
```javascript
// ❌ 解构会失去响应性
const { name } = reactive({ name: 'Vue' })

// ✅ 使用 toRefs
const { name } = toRefs(reactive({ name: 'Vue' }))
```

3. **数组响应式的细微差别**
```javascript
// Vue 2 需要特殊方法
this.$set(arr, 0, newValue)

// Vue 3 直接修改
arr[0] = newValue  // 正常触发更新
```

4. **Map、Set 的支持**
```javascript
// Vue 3 支持 Map、Set
const map = reactive(new Map())
map.set('key', 'value')  // 触发更新
```
:::

---

</details>

## 七、迁移指南

::: details 从 Vue 2 迁移到 Vue 3
```javascript
// 1. 使用官方迁移构建版本
npm install vue@^3.1.0 @vue/compat

// 2. 配置兼容模式
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.resolve.alias.set('vue', '@vue/compat')
  }
}

// 3. 逐步替换不兼容的 API
// - $on/$off/$once -> mitt 或 tiny-emitter
// - filters -> computed 或方法
// - $children -> ref
// - 全局 API -> 实例 API
```
:::

::: details 渐进式迁移策略
1. **第一阶段**：升级到 Vue 2.7（兼容 Composition API）
2. **第二阶段**：使用 @vue/compat 兼容模式
3. **第三阶段**：逐步替换废弃 API
4. **第四阶段**：切换到完整 Vue 3

---
:::

## 总结速记

```
响应式：
- Vue 2: Object.defineProperty（无法检测增删、数组索引）
- Vue 3: Proxy（完美支持，惰性代理）

API 风格：
- Options API: 按选项组织（data/methods/computed）
- Composition API: 按逻辑组织 + composables 复用

新特性：
- Teleport: 传送 DOM 到其他位置
- Suspense: 异步组件 loading 状态
- Fragments: 多根节点
- 多个 v-model

性能优化：
- 静态提升、Patch Flag、事件缓存
- Tree-shaking 更好
- 首次渲染快 55%，更新快 133%

注意事项：
- ref 需要 .value
- reactive 不能解构
- setup 没有 this
```

---

## Vue 3.6 Vapor Mode

::: details 什么是 Vapor Mode？
Vapor Mode 是 Vue 3.6 引入的一种新的编译策略，它可以**完全跳过虚拟 DOM**，直接编译成原生 DOM 操作，从而获得更好的性能。

> 💡 **一句话解释**：Vapor Mode 就是 Vue 的"无虚拟DOM模式"，类似于 Svelte 的编译策略。
:::

::: details 为什么需要 Vapor Mode？
1. **性能瓶颈**：虚拟 DOM diff 有运行时开销
2. **包体积**：虚拟 DOM 运行时代码增加 bundle 大小
3. **竞争压力**：Svelte、Solid.js 等框架的无虚拟DOM方案性能更好
:::

::: details Vapor Mode vs 传统模式对比
```javascript
// 传统模式编译结果（虚拟 DOM）
function render() {
  return h('div', { class: 'container' }, [
    h('span', null, this.count)
  ])
}

// Vapor Mode 编译结果（直接 DOM 操作）
function render() {
  const div = document.createElement('div')
  div.className = 'container'
  const span = document.createElement('span')
  span.textContent = this.count
  div.appendChild(span)

  // 响应式更新
  watchEffect(() => {
    span.textContent = this.count
  })

  return div
}
```
:::

::: details 性能对比
| 指标 | 传统模式 | Vapor Mode | 提升 |
|------|---------|------------|------|
| 初始渲染 | 基准 | 快 30-50% | ⬆️ |
| 更新性能 | 基准 | 快 50-100% | ⬆️⬆️ |
| 内存占用 | 基准 | 减少 30% | ⬇️ |
| 包体积 | 基准 | 减少 40% | ⬇️ |
:::

::: details 如何使用？
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      vapor: true // 开启 Vapor Mode
    })
  ]
})
```
:::

::: details 组件级别切换
```vue
<!-- 使用 Vapor Mode -->
<script vapor>
export default {
  // ...
}
</script>

<!-- 或者使用 setup -->
<script vapor setup>
import { ref } from 'vue'
const count = ref(0)
</script>
```
:::

::: details Vapor Mode 的限制
1. **不支持的特性**：
   - Teleport
   - Suspense
   - KeepAlive（部分支持）
   - Transition（部分支持）

2. **兼容性**：
   - 需要 Vue 3.6+
   - 部分第三方组件库可能不兼容
:::

::: details 适用场景
✅ **适合使用 Vapor Mode**：
- 性能敏感的应用
- 移动端 H5
- 简单的营销页面
- 需要极致性能的场景

❌ **不适合使用**：
- 大量使用 Teleport/Suspense
- 依赖复杂过渡动画
- 使用不兼容的第三方库
:::

::: details 面试回答模板
> **面试官**：了解 Vue 3.6 的 Vapor Mode 吗？
>
> **回答**：了解的。Vapor Mode 是 Vue 3.6 引入的新编译模式，核心思想是**跳过虚拟 DOM，直接编译成原生 DOM 操作**。
>
> 传统 Vue 使用虚拟 DOM 做 diff 更新，虽然灵活但有运行时开销。Vapor Mode 借鉴了 Svelte 的思路，在编译时就确定更新逻辑，运行时直接操作真实 DOM。
>
> 优势是**性能提升明显**（更新快 50-100%）、**包体积更小**（减少约 40%）。但也有一些限制，比如不完全支持 Teleport、Suspense 等特性。
>
> 适合用在**性能敏感的场景**，比如移动端 H5 或简单的营销页面。可以在组件级别选择性开启，和传统模式混用。
:::
