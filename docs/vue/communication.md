# 组件通信

## 概述

**官方定义**: Vue 组件通信是指 Vue 组件之间传递数据和触发事件的方式，是构建复杂应用的基础。

**通俗理解**: 组件就像一个个独立的房间，组件通信就是这些房间之间"说话"和"传递物品"的方式。不同的关系（父子、兄弟、跨层级）需要用不同的沟通方式。

## 通信方式总览

```
组件通信方式
├── 父子通信
│   ├── props（父 → 子）
│   ├── $emit（子 → 父）
│   ├── v-model（双向绑定）
│   ├── $refs（父访问子）
│   ├── $parent / $children（Vue 2）
│   └── expose / ref（Vue 3）
├── 跨层级通信
│   ├── provide / inject
│   └── $attrs / $listeners
├── 兄弟/任意组件通信
│   ├── EventBus（Vue 2）
│   ├── mitt（Vue 3）
│   └── Vuex / Pinia
└── 其他方式
    ├── 浏览器存储
    └── URL 参数
```

## 1. Props（父传子）

### 基础用法

```vue
<!-- 父组件 -->
<template>
  <Child
    :message="msg"
    :count="num"
    :user="userInfo"
    title="静态标题"
  />
</template>

<script setup>
import { ref, reactive } from 'vue'
import Child from './Child.vue'

const msg = ref('Hello')
const num = ref(42)
const userInfo = reactive({ name: 'Alice', age: 25 })
</script>

<!-- 子组件 Child.vue -->
<template>
  <div>
    <p>{{ message }}</p>
    <p>{{ count }}</p>
    <p>{{ user.name }}</p>
  </div>
</template>

<script setup>
// Vue 3 方式
const props = defineProps({
  message: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  user: {
    type: Object,
    default: () => ({})
  },
  title: String
})

// 使用 props
console.log(props.message)
</script>
```

### Props 验证

```javascript
// 完整的 props 验证
defineProps({
  // 基础类型检查
  propA: Number,

  // 多种可能的类型
  propB: [String, Number],

  // 必填
  propC: {
    type: String,
    required: true
  },

  // 带默认值
  propD: {
    type: Number,
    default: 100
  },

  // 对象/数组默认值必须用工厂函数
  propE: {
    type: Object,
    default: () => ({ message: 'hello' })
  },

  // 自定义验证函数
  propF: {
    validator: (value) => {
      return ['success', 'warning', 'error'].includes(value)
    }
  }
})
```

### TypeScript 写法

```vue
<script setup lang="ts">
interface User {
  name: string
  age: number
}

// 方式 1：泛型
const props = defineProps<{
  message: string
  count?: number
  user: User
}>()

// 方式 2：带默认值
const props = withDefaults(defineProps<{
  message: string
  count?: number
}>(), {
  count: 0
})
</script>
```

## 2. Emit（子传父）

### 基础用法

```vue
<!-- 子组件 -->
<template>
  <button @click="handleClick">点击</button>
  <input @input="handleInput" />
</template>

<script setup>
// 声明事件
const emit = defineEmits(['update', 'change'])

// 或者带验证
const emit = defineEmits({
  update: (value) => {
    // 验证函数，返回 true 表示验证通过
    return typeof value === 'string'
  },
  change: null // 不需要验证
})

function handleClick() {
  emit('update', 'new value')
}

function handleInput(e) {
  emit('change', e.target.value)
}
</script>

<!-- 父组件 -->
<template>
  <Child
    @update="onUpdate"
    @change="onChange"
  />
</template>

<script setup>
function onUpdate(value) {
  console.log('收到更新:', value)
}

function onChange(value) {
  console.log('值改变:', value)
}
</script>
```

### TypeScript 写法

```vue
<script setup lang="ts">
// 带类型的 emit
const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'change', id: number, name: string): void
}>()

// Vue 3.3+ 简化写法
const emit = defineEmits<{
  update: [value: string]
  change: [id: number, name: string]
}>()
</script>
```

## 3. v-model（双向绑定）

### Vue 3 的 v-model

```vue
<!-- 父组件 -->
<template>
  <!-- 默认绑定 modelValue -->
  <CustomInput v-model="searchText" />

  <!-- 等价于 -->
  <CustomInput
    :modelValue="searchText"
    @update:modelValue="searchText = $event"
  />

  <!-- 具名 v-model -->
  <UserForm
    v-model:name="userName"
    v-model:age="userAge"
  />
</template>

<!-- 子组件 CustomInput.vue -->
<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup>
defineProps(['modelValue'])
defineEmits(['update:modelValue'])
</script>

<!-- 使用 defineModel (Vue 3.4+) -->
<script setup>
const model = defineModel()
// 直接读写 model.value 即可
</script>

<template>
  <input v-model="model" />
</template>
```

### 多个 v-model

```vue
<!-- 父组件 -->
<template>
  <UserForm
    v-model:firstName="first"
    v-model:lastName="last"
  />
</template>

<!-- 子组件 -->
<script setup>
defineProps(['firstName', 'lastName'])
defineEmits(['update:firstName', 'update:lastName'])
</script>

<template>
  <input
    :value="firstName"
    @input="$emit('update:firstName', $event.target.value)"
  />
  <input
    :value="lastName"
    @input="$emit('update:lastName', $event.target.value)"
  />
</template>
```

## 4. Provide / Inject（跨层级）

### 基础用法

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, ref, readonly } from 'vue'

const theme = ref('dark')
const updateTheme = (newTheme) => {
  theme.value = newTheme
}

// 提供响应式数据
provide('theme', readonly(theme))  // 只读，防止子组件修改
provide('updateTheme', updateTheme)  // 提供修改方法

// 提供对象
provide('user', {
  name: 'Alice',
  age: 25
})
</script>

<!-- 后代组件（任意层级） -->
<script setup>
import { inject } from 'vue'

// 注入
const theme = inject('theme')
const updateTheme = inject('updateTheme')

// 带默认值
const user = inject('user', { name: 'Guest' })

// 使用
console.log(theme.value)  // 'dark'
updateTheme('light')
</script>
```

### 使用 Symbol 作为 key

```javascript
// keys.js
export const ThemeKey = Symbol('theme')
export const UserKey = Symbol('user')

// 祖先组件
import { ThemeKey } from './keys'
provide(ThemeKey, theme)

// 后代组件
import { ThemeKey } from './keys'
const theme = inject(ThemeKey)
```

### TypeScript 类型支持

```typescript
// types.ts
import type { InjectionKey, Ref } from 'vue'

interface User {
  name: string
  age: number
}

export const UserKey: InjectionKey<Ref<User>> = Symbol('user')

// 祖先组件
provide(UserKey, user)

// 后代组件
const user = inject(UserKey)  // 类型自动推断为 Ref<User> | undefined
const user = inject(UserKey)! // 确定存在时
```

## 5. $attrs（属性透传）

```vue
<!-- 父组件 -->
<template>
  <MyButton
    class="custom-btn"
    style="color: red"
    data-id="123"
    @click="handleClick"
  />
</template>

<!-- MyButton.vue -->
<template>
  <!-- 默认会自动透传到根元素 -->
  <button>
    <span v-bind="$attrs">按钮文字</span>
  </button>
</template>

<script setup>
import { useAttrs } from 'vue'

// 禁用自动透传
defineOptions({
  inheritAttrs: false
})

// 访问 attrs
const attrs = useAttrs()
console.log(attrs.class)  // 'custom-btn'
console.log(attrs.style)  // { color: 'red' }
console.log(attrs['data-id'])  // '123'
</script>
```

## 6. $refs（父访问子）

### Vue 3 Composition API

```vue
<!-- 父组件 -->
<template>
  <Child ref="childRef" />
  <button @click="callChildMethod">调用子组件方法</button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Child from './Child.vue'

const childRef = ref(null)

onMounted(() => {
  // 访问子组件暴露的内容
  console.log(childRef.value.count)
  childRef.value.increment()
})

function callChildMethod() {
  childRef.value.sayHello()
}
</script>

<!-- 子组件 -->
<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}

function sayHello() {
  console.log('Hello from child')
}

// 显式暴露给父组件
defineExpose({
  count,
  increment,
  sayHello
})
</script>
```

## 7. EventBus / mitt（任意组件）

### Vue 3 使用 mitt

```javascript
// eventBus.js
import mitt from 'mitt'

export const emitter = mitt()

// 组件 A（发送事件）
import { emitter } from './eventBus'

function sendMessage() {
  emitter.emit('message', { text: 'Hello' })
}

// 组件 B（接收事件）
import { emitter } from './eventBus'
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  emitter.on('message', (data) => {
    console.log('收到消息:', data.text)
  })
})

onUnmounted(() => {
  emitter.off('message')  // 记得移除监听
})

// 监听所有事件
emitter.on('*', (type, data) => {
  console.log(type, data)
})

// 清除所有监听
emitter.all.clear()
```

## 8. 状态管理（Pinia）

```javascript
// stores/counter.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // state
  const count = ref(0)

  // getters
  const doubleCount = computed(() => count.value * 2)

  // actions
  function increment() {
    count.value++
  }

  async function asyncIncrement() {
    await new Promise(resolve => setTimeout(resolve, 1000))
    count.value++
  }

  return { count, doubleCount, increment, asyncIncrement }
})

// 组件中使用
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

const store = useCounterStore()

// 解构响应式数据需要 storeToRefs
const { count, doubleCount } = storeToRefs(store)

// 方法可以直接解构
const { increment } = store
```

