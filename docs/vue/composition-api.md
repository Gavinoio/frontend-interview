# Composition API

Composition API 是 Vue 3 引入的新特性，提供了一种更灵活的方式来组织和复用组件逻辑。

## 为什么需要 Composition API

### Options API 的问题

```vue
<!-- Options API: 相关逻辑分散在不同选项中 -->
<script>
export default {
  data() {
    return {
      // 用户相关
      user: null,
      userLoading: false,
      // 文章相关
      posts: [],
      postsLoading: false
    }
  },
  computed: {
    // 用户相关
    userName() { return this.user?.name },
    // 文章相关
    publishedPosts() { return this.posts.filter(p => p.published) }
  },
  methods: {
    // 用户相关
    async fetchUser() { ... },
    // 文章相关
    async fetchPosts() { ... }
  },
  mounted() {
    this.fetchUser()
    this.fetchPosts()
  }
}
</script>
```

### Composition API 的优势

```vue
<!-- Composition API: 相关逻辑组织在一起 -->
<script setup>
import { useUser } from './composables/useUser'
import { usePosts } from './composables/usePosts'

// 用户相关逻辑
const { user, userName, userLoading, fetchUser } = useUser()

// 文章相关逻辑
const { posts, publishedPosts, postsLoading, fetchPosts } = usePosts()
</script>
```

## setup 函数

### 基本用法

```vue
<script>
import { ref, onMounted } from 'vue'

export default {
  props: {
    title: String
  },
  setup(props, context) {
    // props 是响应式的
    console.log(props.title)

    // context 包含 attrs, slots, emit, expose
    const { attrs, slots, emit, expose } = context

    const count = ref(0)

    function increment() {
      count.value++
      emit('update', count.value)
    }

    onMounted(() => {
      console.log('mounted')
    })

    // 暴露给模板
    return {
      count,
      increment
    }
  }
}
</script>
```

### `<script setup>` 语法糖

```vue
<script setup>
import { ref, onMounted } from 'vue'

// 定义 props
const props = defineProps({
  title: String,
  count: {
    type: Number,
    default: 0
  }
})

// 定义 emits
const emit = defineEmits(['update', 'delete'])

// 定义暴露的方法
defineExpose({
  publicMethod() {
    console.log('exposed')
  }
})

// 响应式数据
const count = ref(0)

// 方法
function increment() {
  count.value++
  emit('update', count.value)
}

// 生命周期
onMounted(() => {
  console.log('mounted')
})
</script>

<template>
  <div>
    <h1>{{ title }}</h1>
    <p>{{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>
```

## 响应式 API

### ref

用于创建基本类型的响应式数据：

```javascript
import { ref, isRef, unref, toRef, toRefs } from 'vue'

// 创建 ref
const count = ref(0)
const message = ref('hello')
const user = ref({ name: 'Tom', age: 25 })

// 访问和修改
console.log(count.value)  // 0
count.value++

// 在模板中自动解包
// <p>{{ count }}</p>  不需要 .value

// isRef 检查
console.log(isRef(count))  // true

// unref 获取值
console.log(unref(count))  // 1
// 等同于 isRef(val) ? val.value : val

// toRef 从响应式对象创建 ref
const state = reactive({ name: 'Tom' })
const nameRef = toRef(state, 'name')
nameRef.value = 'Jerry'  // state.name 也会改变

// toRefs 转换所有属性
const { name, age } = toRefs(state)
```

### reactive

用于创建对象类型的响应式数据：

```javascript
import { reactive, isReactive, toRaw, markRaw } from 'vue'

// 创建响应式对象
const state = reactive({
  count: 0,
  user: {
    name: 'Tom',
    age: 25
  },
  items: []
})

// 直接访问和修改
state.count++
state.user.name = 'Jerry'
state.items.push('new item')

// isReactive 检查
console.log(isReactive(state))  // true
console.log(isReactive(state.user))  // true（深层响应式）

// toRaw 获取原始对象
const raw = toRaw(state)

// markRaw 标记不需要响应式
const config = markRaw({
  env: 'production',
  version: '1.0.0'
})
state.config = config  // config 不会被转换为响应式
```

### ref vs reactive

```javascript
// ref: 适合基本类型，需要 .value
const count = ref(0)
count.value++

// reactive: 适合对象，直接访问
const state = reactive({ count: 0 })
state.count++

// reactive 的局限性
let state = reactive({ count: 0 })
state = reactive({ count: 1 })  // ❌ 丢失响应性

// 解构会丢失响应性
const { count } = reactive({ count: 0 })
// count 不是响应式的

// 使用 toRefs 解决
const state = reactive({ count: 0, name: 'Tom' })
const { count, name } = toRefs(state)
// count.value 和 name.value 是响应式的
```

### shallowRef 和 shallowReactive

```javascript
import { shallowRef, shallowReactive, triggerRef } from 'vue'

// shallowRef: 只有 .value 是响应式的
const state = shallowRef({ count: 0 })
state.value.count++  // 不会触发更新
state.value = { count: 1 }  // 会触发更新

// 手动触发更新
state.value.count++
triggerRef(state)  // 强制触发

// shallowReactive: 只有第一层是响应式的
const obj = shallowReactive({
  nested: {
    count: 0
  }
})
obj.nested.count++  // 不会触发更新
obj.nested = { count: 1 }  // 会触发更新
```

### readonly

```javascript
import { readonly, shallowReadonly } from 'vue'

const original = reactive({ count: 0, nested: { value: 1 } })

// 深层只读
const copy = readonly(original)
copy.count++  // ❌ 警告，无法修改
copy.nested.value++  // ❌ 警告

// 浅层只读
const shallow = shallowReadonly(original)
shallow.count++  // ❌ 警告
shallow.nested.value++  // ✅ 可以修改
```

## computed

```javascript
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

// 只读计算属性
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`
})

console.log(fullName.value)  // 'John Doe'

// 可写计算属性
const fullNameWritable = computed({
  get() {
    return `${firstName.value} ${lastName.value}`
  },
  set(value) {
    const [first, last] = value.split(' ')
    firstName.value = first
    lastName.value = last
  }
})

fullNameWritable.value = 'Jane Smith'
// firstName.value = 'Jane'
// lastName.value = 'Smith'

// 带调试选项
const plusOne = computed(
  () => count.value + 1,
  {
    onTrack(e) {
      console.log('tracked', e)
    },
    onTrigger(e) {
      console.log('triggered', e)
    }
  }
)
```

## watch 和 watchEffect

### watch

```javascript
import { ref, reactive, watch } from 'vue'

const count = ref(0)
const state = reactive({ name: 'Tom', age: 25 })

// 监听 ref
watch(count, (newValue, oldValue) => {
  console.log(`count: ${oldValue} -> ${newValue}`)
})

// 监听 reactive 的属性
watch(
  () => state.name,
  (newName, oldName) => {
    console.log(`name: ${oldName} -> ${newName}`)
  }
)

// 监听整个 reactive 对象（深层监听）
watch(
  () => state,
  (newState) => {
    console.log('state changed', newState)
  },
  { deep: true }
)

// 监听多个数据源
watch(
  [count, () => state.name],
  ([newCount, newName], [oldCount, oldName]) => {
    console.log(`count: ${oldCount} -> ${newCount}`)
    console.log(`name: ${oldName} -> ${newName}`)
  }
)

// 立即执行
watch(
  count,
  (newValue) => {
    console.log(newValue)
  },
  { immediate: true }
)

// 只触发一次
watch(
  count,
  (newValue) => {
    console.log(newValue)
  },
  { once: true }
)

// 停止监听
const stop = watch(count, () => {})
stop()  // 停止监听
```

### watchEffect

```javascript
import { ref, watchEffect, watchPostEffect, watchSyncEffect } from 'vue'

const count = ref(0)
const name = ref('Tom')

// 自动追踪依赖
const stop = watchEffect(() => {
  console.log(`count: ${count.value}, name: ${name.value}`)
  // 任何一个变化都会重新执行
})

// 清理副作用
watchEffect((onCleanup) => {
  const timer = setInterval(() => {
    console.log(count.value)
  }, 1000)

  // 在副作用重新执行前或组件卸载时调用
  onCleanup(() => {
    clearInterval(timer)
  })
})

// 异步请求示例
watchEffect(async (onCleanup) => {
  const controller = new AbortController()

  onCleanup(() => {
    controller.abort()
  })

  const response = await fetch(`/api/user/${userId.value}`, {
    signal: controller.signal
  })
  data.value = await response.json()
})

// 调整执行时机
// watchEffect 默认在组件更新前执行
watchEffect(() => {}, { flush: 'pre' })  // 默认

// DOM 更新后执行
watchPostEffect(() => {
  // 可以访问更新后的 DOM
})
// 等同于 watchEffect(() => {}, { flush: 'post' })

// 同步执行
watchSyncEffect(() => {
  // 响应式依赖变化时同步执行
})
// 等同于 watchEffect(() => {}, { flush: 'sync' })
```

### watch vs watchEffect

| 特性 | watch | watchEffect |
|------|-------|-------------|
| 依赖追踪 | 需要明确指定 | 自动追踪 |
| 访问旧值 | 可以 | 不可以 |
| 初次执行 | 默认不执行 | 立即执行 |
| 懒执行 | 是 | 否 |
| 使用场景 | 需要对比新旧值 | 副作用函数 |

## 生命周期钩子

```javascript
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onActivated,
  onDeactivated,
  onErrorCaptured,
  onRenderTracked,
  onRenderTriggered
} from 'vue'

// 挂载前
onBeforeMount(() => {
  console.log('before mount')
})

// 挂载后
onMounted(() => {
  console.log('mounted')
  // DOM 已经渲染完成
})

// 更新前
onBeforeUpdate(() => {
  console.log('before update')
})

// 更新后
onUpdated(() => {
  console.log('updated')
})

// 卸载前
onBeforeUnmount(() => {
  console.log('before unmount')
  // 清理工作
})

// 卸载后
onUnmounted(() => {
  console.log('unmounted')
})

// keep-alive 缓存组件激活
onActivated(() => {
  console.log('activated')
})

// keep-alive 缓存组件停用
onDeactivated(() => {
  console.log('deactivated')
})

// 错误捕获
onErrorCaptured((err, instance, info) => {
  console.error('error captured', err, info)
  return false  // 阻止错误继续传播
})

// 调试用
onRenderTracked((e) => {
  console.log('render tracked', e)
})

onRenderTriggered((e) => {
  console.log('render triggered', e)
})
```

### Options API 对应关系

| Options API | Composition API |
|-------------|-----------------|
| beforeCreate | setup() |
| created | setup() |
| beforeMount | onBeforeMount |
| mounted | onMounted |
| beforeUpdate | onBeforeUpdate |
| updated | onUpdated |
| beforeUnmount | onBeforeUnmount |
| unmounted | onUnmounted |
| activated | onActivated |
| deactivated | onDeactivated |
| errorCaptured | onErrorCaptured |

## 依赖注入

```javascript
// 父组件
import { provide, ref, readonly } from 'vue'

const count = ref(0)
const increment = () => count.value++

// 提供响应式数据
provide('count', readonly(count))  // 只读，防止子组件修改
provide('increment', increment)

// 提供对象
provide('user', {
  name: ref('Tom'),
  updateName: (name) => { ... }
})

// 子组件
import { inject } from 'vue'

// 注入
const count = inject('count')
const increment = inject('increment')

// 默认值
const theme = inject('theme', 'light')

// 工厂函数默认值（延迟计算）
const config = inject('config', () => computeDefaultConfig(), true)
```

### 使用 Symbol 作为 key

```javascript
// keys.js
export const CountKey = Symbol('count')
export const UserKey = Symbol('user')

// 父组件
import { provide } from 'vue'
import { CountKey, UserKey } from './keys'

provide(CountKey, ref(0))
provide(UserKey, { name: 'Tom' })

// 子组件
import { inject } from 'vue'
import { CountKey, UserKey } from './keys'

const count = inject(CountKey)
const user = inject(UserKey)
```

## 组合式函数（Composables）

### 基本示例

```javascript
// composables/useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)

  const double = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = initialValue
  }

  return {
    count,
    double,
    increment,
    decrement,
    reset
  }
}

// 使用
import { useCounter } from './composables/useCounter'

const { count, double, increment, decrement } = useCounter(10)
```

### 鼠标位置追踪

```javascript
// composables/useMouse.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => {
    window.addEventListener('mousemove', update)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })

  return { x, y }
}
```

### 异步数据获取

```javascript
// composables/useFetch.js
import { ref, watchEffect, toValue } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)

  async function fetchData() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(toValue(url))
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      data.value = await response.json()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  watchEffect(() => {
    fetchData()
  })

  return { data, error, loading, refetch: fetchData }
}

// 使用
const url = ref('/api/users')
const { data, error, loading, refetch } = useFetch(url)

// 改变 url 会自动重新请求
url.value = '/api/posts'
```

### 防抖和节流

```javascript
// composables/useDebounce.js
import { ref, watch } from 'vue'

export function useDebounce(value, delay = 300) {
  const debouncedValue = ref(value.value)
  let timeout

  watch(value, (newValue) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  return debouncedValue
}

// composables/useThrottle.js
export function useThrottle(fn, delay = 300) {
  let lastTime = 0

  return (...args) => {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn(...args)
    }
  }
}
```

### 本地存储

```javascript
// composables/useLocalStorage.js
import { ref, watch } from 'vue'

export function useLocalStorage(key, defaultValue) {
  const stored = localStorage.getItem(key)
  const data = ref(stored ? JSON.parse(stored) : defaultValue)

  watch(
    data,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true }
  )

  return data
}

// 使用
const theme = useLocalStorage('theme', 'light')
theme.value = 'dark'  // 自动保存到 localStorage
```

### 组合多个 Composables

```javascript
// composables/useUserProfile.js
import { computed } from 'vue'
import { useFetch } from './useFetch'
import { useLocalStorage } from './useLocalStorage'

export function useUserProfile(userId) {
  const { data: user, loading, error } = useFetch(
    computed(() => `/api/users/${userId.value}`)
  )

  const preferences = useLocalStorage(`user-${userId.value}-prefs`, {
    theme: 'light',
    language: 'zh'
  })

  const displayName = computed(() => {
    return user.value?.nickname || user.value?.name || 'Anonymous'
  })

  return {
    user,
    loading,
    error,
    preferences,
    displayName
  }
}
```

## 模板引用

```vue
<script setup>
import { ref, onMounted } from 'vue'

// DOM 元素引用
const inputRef = ref(null)

// 组件引用
const childRef = ref(null)

onMounted(() => {
  // 访问 DOM
  inputRef.value.focus()

  // 访问子组件暴露的方法
  childRef.value.someMethod()
})

// 函数引用（用于 v-for）
const itemRefs = ref([])

function setItemRef(el) {
  if (el) {
    itemRefs.value.push(el)
  }
}

// 清理引用
onBeforeUpdate(() => {
  itemRefs.value = []
})
</script>

<template>
  <input ref="inputRef" />
  <ChildComponent ref="childRef" />

  <ul>
    <li v-for="item in list" :key="item.id" :ref="setItemRef">
      {{ item.name }}
    </li>
  </ul>
</template>
```

## TypeScript 支持

```vue
<script setup lang="ts">
import { ref, computed, PropType } from 'vue'

// 定义 props 类型
interface User {
  id: number
  name: string
  email: string
}

const props = defineProps<{
  title: string
  count?: number
  user: User
}>()

// 带默认值
const props = withDefaults(defineProps<{
  title: string
  count?: number
}>(), {
  count: 0
})

// 定义 emits 类型
const emit = defineEmits<{
  (e: 'update', value: number): void
  (e: 'delete', id: number): void
}>()

// ref 类型
const count = ref<number>(0)
const user = ref<User | null>(null)

// computed 类型
const double = computed<number>(() => count.value * 2)

// 模板引用类型
const inputRef = ref<HTMLInputElement | null>(null)
const childRef = ref<InstanceType<typeof ChildComponent> | null>(null)
</script>
```

