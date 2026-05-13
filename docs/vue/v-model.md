# Vue 双向数据绑定 (v-model)

## 核心概念

v-model 是 Vue 中实现双向数据绑定的语法糖，它会根据不同的表单元素自动选择对应的属性和事件。

## v-model 原理

### 在表单元素上使用

v-model 本质上是以下两个操作的语法糖：

1. 绑定 value 属性（或其他属性）
2. 监听 input 事件（或其他事件）

```vue
<!-- 使用 v-model -->
<input v-model="message" />

<!-- 等价于 -->
<input :value="message" @input="message = $event.target.value" />
```

### 不同表单元素的实现

```vue
<!-- 文本输入框 -->
<input v-model="text" />
<!-- 等价于 -->
<input :value="text" @input="text = $event.target.value" />

<!-- 复选框 -->
<input type="checkbox" v-model="checked" />
<!-- 等价于 -->
<input type="checkbox" :checked="checked" @change="checked = $event.target.checked" />

<!-- 单选框 -->
<input type="radio" value="option1" v-model="picked" />
<!-- 等价于 -->
<input type="radio" value="option1" :checked="picked === 'option1'" @change="picked = $event.target.value" />

<!-- 下拉框 -->
<select v-model="selected">
  <option>选项A</option>
</select>
<!-- 等价于 -->
<select :value="selected" @change="selected = $event.target.value">
  <option>选项A</option>
</select>
```

## 修饰符

### .lazy

默认情况下，v-model 在每次 input 事件触发后同步数据。使用 .lazy 修饰符可以改为在 change 事件后同步。

```vue
<template>
  <!-- 失去焦点时才更新 -->
  <input v-model.lazy="message" />
</template>
```

### .number

自动将用户输入转换为数值类型。

```vue
<template>
  <input v-model.number="age" type="number" />
</template>

<script setup>
import { ref } from 'vue'

const age = ref(0)
// 输入 "123" 时，age 的值是数字 123，而不是字符串 "123"
</script>
```

### .trim

自动过滤用户输入的首尾空白字符。

```vue
<template>
  <input v-model.trim="username" />
</template>
```

### 组合使用

```vue
<template>
  <input v-model.lazy.trim="message" />
  <input v-model.number.lazy="age" />
</template>
```

## 在组件上使用 v-model

### Vue 3 中的用法

在 Vue 3 中，v-model 默认对应 `modelValue` prop 和 `update:modelValue` 事件。

```vue
<!-- 父组件 -->
<template>
  <CustomInput v-model="searchText" />
  <!-- 等价于 -->
  <CustomInput
    :modelValue="searchText"
    @update:modelValue="searchText = $event"
  />
</template>

<script setup>
import { ref } from 'vue'
import CustomInput from './CustomInput.vue'

const searchText = ref('')
</script>
```

```vue
<!-- CustomInput.vue 子组件 -->
<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup>
defineProps({
  modelValue: String
})

defineEmits(['update:modelValue'])
</script>
```

### 使用计算属性实现

更优雅的方式是使用计算属性：

```vue
<!-- CustomInput.vue -->
<template>
  <input v-model="value" />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: String
})

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})
</script>
```

### 多个 v-model 绑定

Vue 3 支持在同一个组件上使用多个 v-model：

```vue
<!-- 父组件 -->
<template>
  <UserProfile
    v-model:name="userName"
    v-model:age="userAge"
  />
</template>

<script setup>
import { ref } from 'vue'
import UserProfile from './UserProfile.vue'

const userName = ref('张三')
const userAge = ref(25)
</script>
```

```vue
<!-- UserProfile.vue 子组件 -->
<template>
  <div>
    <input v-model="nameValue" placeholder="姓名" />
    <input v-model.number="ageValue" type="number" placeholder="年龄" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: String,
  age: Number
})

const emit = defineEmits(['update:name', 'update:age'])

const nameValue = computed({
  get: () => props.name,
  set: (value) => emit('update:name', value)
})

const ageValue = computed({
  get: () => props.age,
  set: (value) => emit('update:age', value)
})
</script>
```

### 自定义 v-model 修饰符

Vue 3 支持自定义 v-model 修饰符：

```vue
<!-- 父组件 -->
<template>
  <CustomInput v-model.capitalize="text" />
</template>

<script setup>
import { ref } from 'vue'
import CustomInput from './CustomInput.vue'

const text = ref('')
</script>
```

```vue
<!-- CustomInput.vue -->
<template>
  <input v-model="value" />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: String,
  modelModifiers: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    // 如果有 capitalize 修饰符，首字母大写
    if (props.modelModifiers.capitalize) {
      value = value.charAt(0).toUpperCase() + value.slice(1)
    }
    emit('update:modelValue', value)
  }
})
</script>
```

## Vue 2 中的用法

在 Vue 2 中，v-model 默认对应 `value` prop 和 `input` 事件。

```vue
<!-- 父组件 -->
<template>
  <CustomInput v-model="searchText" />
</template>

<script>
export default {
  data() {
    return {
      searchText: ''
    }
  }
}
</script>
```

```vue
<!-- CustomInput.vue 子组件 -->
<template>
  <input :value="value" @input="$emit('input', $event.target.value)" />
</template>

<script>
export default {
  props: {
    value: String
  }
}
</script>
```

### 自定义 prop 和 event (Vue 2)

可以通过 `model` 选项自定义：

```vue
<!-- CustomCheckbox.vue -->
<template>
  <input
    type="checkbox"
    :checked="checked"
    @change="$emit('change', $event.target.checked)"
  />
</template>

<script>
export default {
  model: {
    prop: 'checked',
    event: 'change'
  },
  props: {
    checked: Boolean
  }
}
</script>
```

```vue
<!-- 使用 -->
<template>
  <CustomCheckbox v-model="isChecked" />
  <!-- 等价于 -->
  <CustomCheckbox :checked="isChecked" @change="isChecked = $event" />
</template>
```

## 实际应用场景

### 表单验证

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label>用户名:</label>
      <input v-model.trim="form.username" />
      <span v-if="errors.username" class="error">{{ errors.username }}</span>
    </div>

    <div>
      <label>年龄:</label>
      <input v-model.number="form.age" type="number" />
      <span v-if="errors.age" class="error">{{ errors.age }}</span>
    </div>

    <div>
      <label>邮箱:</label>
      <input v-model.lazy="form.email" type="email" />
      <span v-if="errors.email" class="error">{{ errors.email }}</span>
    </div>

    <button type="submit">提交</button>
  </form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const form = reactive({
  username: '',
  age: null,
  email: ''
})

const errors = reactive({
  username: '',
  age: '',
  email: ''
})

// 实时验证
watch(() => form.username, (value) => {
  if (!value) {
    errors.username = '用户名不能为空'
  } else if (value.length < 3) {
    errors.username = '用户名至少3个字符'
  } else {
    errors.username = ''
  }
})

watch(() => form.age, (value) => {
  if (!value) {
    errors.age = '年龄不能为空'
  } else if (value < 18) {
    errors.age = '年龄必须大于18岁'
  } else {
    errors.age = ''
  }
})

watch(() => form.email, (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!value) {
    errors.email = '邮箱不能为空'
  } else if (!emailRegex.test(value)) {
    errors.email = '邮箱格式不正确'
  } else {
    errors.email = ''
  }
})

const handleSubmit = () => {
  if (!errors.username && !errors.age && !errors.email) {
    console.log('表单提交:', form)
  } else {
    console.log('表单验证失败')
  }
}
</script>

<style scoped>
.error {
  color: red;
  font-size: 12px;
  margin-left: 10px;
}

form > div {
  margin-bottom: 15px;
}
</style>
```

### 搜索框组件

```vue
<!-- SearchBox.vue -->
<template>
  <div class="search-box">
    <input
      v-model="searchValue"
      :placeholder="placeholder"
      @keyup.enter="handleSearch"
      class="search-input"
    />
    <button @click="handleSearch" class="search-btn">搜索</button>
    <button v-if="searchValue" @click="clear" class="clear-btn">清空</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: String,
  placeholder: {
    type: String,
    default: '请输入搜索内容'
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const searchValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleSearch = () => {
  emit('search', searchValue.value)
}

const clear = () => {
  searchValue.value = ''
  emit('search', '')
}
</script>

<style scoped>
.search-box {
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-btn,
.clear-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-btn {
  background-color: #409eff;
  color: white;
}

.clear-btn {
  background-color: #f56c6c;
  color: white;
}
</style>
```

使用搜索框：

```vue
<template>
  <div>
    <SearchBox
      v-model="keyword"
      @search="handleSearch"
      placeholder="搜索文章..."
    />
    <div v-if="keyword">当前搜索: {{ keyword }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SearchBox from './SearchBox.vue'

const keyword = ref('')

const handleSearch = (value) => {
  console.log('搜索:', value)
  // 执行搜索逻辑
}
</script>
```

## 常见问题

### 1. 为什么 v-model 不生效？

**问题**: 输入框的值不更新。

```vue
<!-- 错误示例 -->
<script setup>
const message = 'hello' // 不是响应式的
</script>

<template>
  <input v-model="message" />
</template>
```

**解决方案**: 确保使用响应式数据。

```vue
<script setup>
import { ref } from 'vue'
const message = ref('hello') // 响应式的
</script>

<template>
  <input v-model="message" />
</template>
```

### 2. 复选框数组绑定

```vue
<template>
  <div>
    <input type="checkbox" v-model="checkedItems" value="apple" /> 苹果
    <input type="checkbox" v-model="checkedItems" value="banana" /> 香蕉
    <input type="checkbox" v-model="checkedItems" value="orange" /> 橙子
    <p>选中的: {{ checkedItems }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const checkedItems = ref([])
// 输出: ['apple', 'banana'] 当苹果和香蕉被选中时
</script>
```

### 3. 单选框组

```vue
<template>
  <div>
    <input type="radio" v-model="picked" value="option1" /> 选项1
    <input type="radio" v-model="picked" value="option2" /> 选项2
    <input type="radio" v-model="picked" value="option3" /> 选项3
    <p>选中的: {{ picked }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const picked = ref('option1') // 默认选中 option1
</script>
```

### 4. 下拉框多选

```vue
<template>
  <div>
    <select v-model="selected" multiple>
      <option value="js">JavaScript</option>
      <option value="ts">TypeScript</option>
      <option value="vue">Vue</option>
      <option value="react">React</option>
    </select>
    <p>选中的: {{ selected }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selected = ref([])
// 输出: ['js', 'vue'] 当选中 JavaScript 和 Vue 时
</script>
```

## 性能优化

### 使用 .lazy 修饰符

对于不需要实时更新的输入框，使用 `.lazy` 可以减少触发次数。

```vue
<template>
  <!-- 每次输入都触发更新 -->
  <input v-model="message1" />

  <!-- 失去焦点时才触发更新 -->
  <input v-model.lazy="message2" />
</template>
```

### 防抖处理

对于需要实时搜索的场景，建议添加防抖：

```vue
<template>
  <input v-model="searchText" placeholder="搜索..." />
</template>

<script setup>
import { ref, watch } from 'vue'
import { debounce } from 'lodash-es'

const searchText = ref('')

const debouncedSearch = debounce((value) => {
  console.log('执行搜索:', value)
  // 调用搜索 API
}, 300)

watch(searchText, (newValue) => {
  debouncedSearch(newValue)
})
</script>
```

## 总结

- **v-model 本质**：语法糖，简化了属性绑定 + 事件监听
- **修饰符**：.lazy、.number、.trim 提供便捷的数据处理
- **组件通信**：Vue 3 使用 modelValue/update:modelValue，支持多个 v-model
- **自定义修饰符**：可以实现更灵活的数据处理逻辑
- **性能优化**：合理使用 .lazy、防抖等技术提升性能

## 面试重点

1. 解释 v-model 的原理和实现机制
2. 说明 Vue 2 和 Vue 3 中 v-model 的区别
3. 如何在自定义组件中实现 v-model
4. v-model 修饰符的作用和使用场景
5. 如何实现多个 v-model 绑定
6. 双向数据绑定的性能考虑
