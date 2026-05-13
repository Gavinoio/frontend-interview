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

## 常见面试题

::: details 1. Vue 组件通信有哪些方式？
<details>
<summary>点击查看答案</summary>

**一句话答案**: 父子通信用 props/emit，跨层级用 provide/inject，任意组件用状态管理。

**详细答案**:

| 场景 | 通信方式 | 说明 |
|------|---------|------|
| 父 → 子 | props | 最常用，单向数据流 |
| 子 → 父 | emit | 触发自定义事件 |
| 父 ↔ 子 | v-model | 双向绑定语法糖 |
| 父访问子 | ref + expose | 直接调用子组件方法 |
| 跨层级 | provide/inject | 祖先向后代传递 |
| 任意组件 | Pinia/Vuex | 全局���态管理 |
| 任意组件 | EventBus/mitt | 事件总线（Vue 3 推荐 mitt） |

**口语化回答**:
"Vue 组件通信主要看组件之间的关系。父子组件用 props 和 emit 最直接，props 负责父传子，emit 负责子传父。如果是多层嵌套的祖孙组件，可以用 provide/inject 避免逐层传递。任意组件之间通信，通常用 Pinia 这样的状态管理库。另外 Vue 3 可以用 mitt 实现简单的事件总线。"
:::

</details>

::: details 2. props 和 data 的区别？
<details>
<summary>点击查看答案</summary>

**一句话答案**: props 是外部传入的只读数据，data 是组件内部的私有数据。

**对比**:

| 特性 | props | data |
|------|-------|------|
| 来源 | 父组件传入 | 组件内部定义 |
| 修改 | 只读，不能直接修改 | 可以自由修改 |
| 响应式 | 是 | 是 |
| 用途 | 接收外部配置 | 管理内部状态 |

```javascript
// 如果需要修改 props 的值
const props = defineProps(['initialCount'])
const count = ref(props.initialCount)  // 用 data 保存一份副本
```

**口语化回答**:
"props 是从父组件传进来的，相当于函数的参数，是只读的不能直接改。data 是组件自己的私有数据，可以随便改。如果需要基于 props 做修改，应该把 props 的值复制一份到 data 或 computed 里。"
:::

</details>

::: details 3. provide/inject 和 props 的区别？什么时候用 provide/inject？
<details>
<summary>点击查看答案</summary>

**一句话答案**: props 只能逐层传递，provide/inject 可以跨层级直接传递。

**对比**:

| 特性 | props | provide/inject |
|------|-------|----------------|
| 传递方式 | 逐层传递 | 跨层级直接传递 |
| 数据追踪 | 清晰，易于调试 | 隐式依赖，不易追踪 |
| 使用场景 | 父子组件 | 深层嵌套组件 |
| 响应式 | 自动响应式 | 需要手动传递 ref |

**适用场景**:
1. 主题切换（theme）
2. 国际化（i18n）
3. 用户登录状态
4. 全局配置

**口语化回答**:
"props 是一层一层往下传的，如果组件嵌套很深，比如 A → B → C → D，每一层都要写 props 很麻烦。provide/inject 可以直接从 A 传到 D，中间的 B、C 不用管。但要注意 provide/inject 的数据来源不太好追踪，只适合传一些全局性的数据，比如主题、语言设置这些。"
:::

</details>

::: details 4. 什么是单向数据流？为什么 Vue 推荐单向数据流？
<details>
<summary>点击查看答案</summary>

**一句话答案**: 单向数据流是指数据只能从父组件流向子组件，子组件不能直接修改父组件的数据。

**为什么推荐**:
1. **可预测性**: 数据变化来源清晰，易于追踪
2. **易于调试**: 出问题时容易定位
3. **组件解耦**: 子组件不依赖父组件的实现细节

```javascript
// ❌ 错误做法：直接修改 props
const props = defineProps(['user'])
props.user.name = 'Bob'  // 不推荐！

// ✅ 正确做法：通知父组件修改
const emit = defineEmits(['update'])
emit('update', { ...props.user, name: 'Bob' })
```

**口语化回答**:
"单向数据流就是数据只能从父组件往子组件传，子组件要改数据不能直接改，得通过 emit 告诉父组件去改。这样做的好处是数据流向清晰，出 bug 了容易排查。如果子组件能随便改父组件的数据，项目大了之后根本不知道数据在哪被改了。"
:::

</details>

::: details 5. 如何实现兄弟组件通信？
<details>
<summary>点击查看答案</summary>

**方案一：通过共同父组件**

```vue
<!-- 父组件 -->
<template>
  <BrotherA :data="sharedData" @update="handleUpdate" />
  <BrotherB :data="sharedData" />
</template>

<script setup>
const sharedData = ref('初始值')

function handleUpdate(newData) {
  sharedData.value = newData
}
</script>
```

**方案二：EventBus / mitt**

```javascript
// BrotherA
emitter.emit('dataChange', newData)

// BrotherB
emitter.on('dataChange', (data) => {
  // 处理数据
})
```

**方案三：状态管理（推荐）**

```javascript
// store
export const useSharedStore = defineStore('shared', () => {
  const data = ref('')
  return { data }
})

// 两个组件都可以访问和修改
const store = useSharedStore()
```

**口语化回答**:
"兄弟组件通信有几种方式。最简单的是状态提升，把数据放到它们共同的父组件里。或者用 EventBus，一个组件发事件，另一个组件监听。但最推荐的还是用 Pinia 这样的状态管理，把共享数据放到 store 里，两个组件都能访问和修改。"
:::

</details>

::: details 6. $refs 和 props 传递方法有什么区别？什么时候用 $refs？
<details>
<summary>点击查看答案</summary>

**对比**:

| 方式 | 数据流向 | 耦合度 | 使用场景 |
|------|---------|-------|---------|
| props 传方法 | 父 → 子 | 低 | 子组件触发父组件行为 |
| $refs | 父 → 子 | 高 | 父组件主动调用子组件方法 |

**$refs 适用场景**:
1. 聚焦输入框
2. 调用子组件的表单验证
3. 触发子组件的动画
4. 访问子组件暴露的数据

```vue
<!-- $refs 典型用法：表单验证 -->
<template>
  <MyForm ref="formRef" />
  <button @click="submitForm">提交</button>
</template>

<script setup>
const formRef = ref(null)

async function submitForm() {
  const isValid = await formRef.value.validate()
  if (isValid) {
    // 提交表单
  }
}
</script>
```

**口语化回答**:
"$refs 是父组件直接访问子组件的方式，相当于拿到子组件的引用。一般用在需要主动调用子组件方法的场景，比如让输入框聚焦、调用表单验证。但 $refs 耦合度比较高，能用 props 和 emit 解决的就不要用 $refs。"
:::

</details>
