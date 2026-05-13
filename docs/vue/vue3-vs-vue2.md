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

