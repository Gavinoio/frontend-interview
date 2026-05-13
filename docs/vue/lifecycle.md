# Vue 生命周期 【必考】

## 官方定义
每个 Vue 组件实例在创建时都需要经历一系列的初始化步骤，比如设置好数据侦听，编译模板，挂载实例到 DOM，以及在数据改变时更新 DOM。在此过程中，它也会运行被称为生命周期钩子的函数，让开发者有机会在特定阶段运行自己的代码。

## 白话解释
生命周期就像人的一生：出生（创建）→ 成长（挂载）→ 变化（更新）→ 死亡（销毁）。Vue 在每个阶段都给你一个"插入代码"的机会，让你可以在合适的时机做合适的事。

---

## Vue 2 生命周期

### 完整流程图

```
                    new Vue()
                        │
                        ▼
            ┌───────────────────────┐
            │    beforeCreate       │  实例初始化之后
            │    (无法访问data/methods)│
            └───────────┬───────────┘
                        │ 初始化 data/methods/computed
                        ▼
            ┌───────────────────────┐
            │      created          │  实例创建完成
            │   (可以访问data/methods)│  常用：请求数据
            └───────────┬───────────┘
                        │ 判断是否有 template
                        ▼
            ┌───────────────────────┐
            │    beforeMount        │  挂载开始之前
            │    (虚拟DOM已创建)     │
            └───────────┬───────────┘
                        │ 创建 vm.$el 替换 el
                        ▼
            ┌───────────────────────┐
            │      mounted          │  挂载完成
            │    (可以访问DOM)       │  常用：操作DOM/请求数据
            └───────────┬───────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼ (data变化时)                  ▼ (调用$destroy时)
┌───────────────┐               ┌───────────────┐
│ beforeUpdate  │               │ beforeDestroy │
│ (虚拟DOM重新渲染)│               │ (实例仍可用)   │
└───────┬───────┘               └───────┬───────┘
        │                               │
        ▼                               ▼
┌───────────────┐               ┌───────────────┐
│   updated     │               │  destroyed    │
│ (DOM已更新)    │               │ (清理完成)     │
└───────────────┘               └───────────────┘
```

### 各阶段详解

```javascript
export default {
  data() {
    return {
      message: 'Hello'
    }
  },

  // 1. 实例初始化之后，数据观测和事件配置之前
  beforeCreate() {
    console.log('beforeCreate')
    console.log(this.message)  // undefined
    console.log(this.$el)      // undefined
    // 用途：插件开发中使用，如 vuex、vue-router
  },

  // 2. 实例创建完成，数据观测、属性和方法运算完成
  created() {
    console.log('created')
    console.log(this.message)  // 'Hello'
    console.log(this.$el)      // undefined（DOM未挂载）
    // 用途：请求数据、初始化非响应式数据
  },

  // 3. 挂载开始之前，虚拟DOM已创建
  beforeMount() {
    console.log('beforeMount')
    console.log(this.$el)      // <div id="app">{{ message }}</div>（未编译）
    // 用途：很少使用
  },

  // 4. 挂载完成，DOM已渲染
  mounted() {
    console.log('mounted')
    console.log(this.$el)      // <div id="app">Hello</div>（已编译）
    // 用途：操作DOM、请求数据、初始化第三方库
    // 注意：不保证所有子组件都已挂载，使用 this.$nextTick
    this.$nextTick(() => {
      // 所有子组件都已挂载
    })
  },

  // 5. 数据更新时，虚拟DOM重新渲染之前
  beforeUpdate() {
    console.log('beforeUpdate')
    // 此时 data 已更新，但 DOM 还未更新
    // 用途：访问更新前的 DOM 状态
  },

  // 6. 虚拟DOM重新渲染并应用到真实DOM之后
  updated() {
    console.log('updated')
    // DOM 已更新
    // 用途：执行依赖于更新后 DOM 的操作
    // 注意：避免在此修改 data，可能导致无限循环
  },

  // 7. 实例销毁之前
  beforeDestroy() {
    console.log('beforeDestroy')
    // 实例仍然完全可用
    // 用途：清理定时器、取消订阅、解绑事件
  },

  // 8. 实例销毁之后
  destroyed() {
    console.log('destroyed')
    // 所有指令解绑、事件监听器移除、子实例销毁
    // 用途：最后的清理工作（很少使用）
  }
}
```

---

## Vue 3 生命周期

### Composition API 生命周期钩子

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
  onErrorCaptured
} from 'vue'

export default {
  setup() {
    // setup 本身相当于 beforeCreate + created

    onBeforeMount(() => {
      console.log('beforeMount')
    })

    onMounted(() => {
      console.log('mounted')
      // 请求数据、操作DOM
    })

    onBeforeUpdate(() => {
      console.log('beforeUpdate')
    })

    onUpdated(() => {
      console.log('updated')
    })

    onBeforeUnmount(() => {
      console.log('beforeUnmount')
      // 清理定时器、取消订阅
    })

    onUnmounted(() => {
      console.log('unmounted')
    })

    // keep-alive 相关
    onActivated(() => {
      console.log('activated')
    })

    onDeactivated(() => {
      console.log('deactivated')
    })

    // 错误捕获
    onErrorCaptured((err, instance, info) => {
      console.log('error captured:', err)
      return false  // 返回 false 阻止错误继续传播
    })
  }
}
```

### Vue 2 vs Vue 3 对比

| Vue 2 (Options API) | Vue 3 (Options API) | Vue 3 (Composition API) |
|---------------------|---------------------|-------------------------|
| beforeCreate | beforeCreate | setup() |
| created | created | setup() |
| beforeMount | beforeMount | onBeforeMount |
| mounted | mounted | onMounted |
| beforeUpdate | beforeUpdate | onBeforeUpdate |
| updated | updated | onUpdated |
| beforeDestroy | **beforeUnmount** | onBeforeUnmount |
| destroyed | **unmounted** | onUnmounted |
| activated | activated | onActivated |
| deactivated | deactivated | onDeactivated |
| errorCaptured | errorCaptured | onErrorCaptured |

---

## 父子组件生命周期顺序

### 初始化阶段

```
父 beforeCreate
父 created
父 beforeMount
  子 beforeCreate
  子 created
  子 beforeMount
  子 mounted
父 mounted
```

**记忆口诀**：父组件先创建，但子组件先挂载完成

### 更新阶段

```
父 beforeUpdate
  子 beforeUpdate
  子 updated
父 updated
```

### 销毁阶段

```
父 beforeDestroy/beforeUnmount
  子 beforeDestroy/beforeUnmount
  子 destroyed/unmounted
父 destroyed/unmounted
```

### 代码验证

```vue
<!-- Parent.vue -->
<template>
  <div>
    <Child />
  </div>
</template>

<script>
export default {
  beforeCreate() { console.log('Parent beforeCreate') },
  created() { console.log('Parent created') },
  beforeMount() { console.log('Parent beforeMount') },
  mounted() { console.log('Parent mounted') },
  beforeUpdate() { console.log('Parent beforeUpdate') },
  updated() { console.log('Parent updated') },
  beforeDestroy() { console.log('Parent beforeDestroy') },
  destroyed() { console.log('Parent destroyed') }
}
</script>

<!-- Child.vue -->
<script>
export default {
  beforeCreate() { console.log('Child beforeCreate') },
  created() { console.log('Child created') },
  beforeMount() { console.log('Child beforeMount') },
  mounted() { console.log('Child mounted') },
  beforeUpdate() { console.log('Child beforeUpdate') },
  updated() { console.log('Child updated') },
  beforeDestroy() { console.log('Child beforeDestroy') },
  destroyed() { console.log('Child destroyed') }
}
</script>
```

---

## keep-alive 与生命周期

```vue
<template>
  <keep-alive>
    <component :is="currentComponent" />
  </keep-alive>
</template>
```

### 执行顺序

**首次进入**：
```
beforeCreate -> created -> beforeMount -> mounted -> activated
```

**离开时**：
```
deactivated  （不会触发 beforeDestroy/destroyed）
```

**再次进入**：
```
activated  （不会触发 beforeCreate/created/beforeMount/mounted）
```

### 使用场景

```vue
<script>
export default {
  activated() {
    // 组件被激活时调用
    // 适合：刷新数据、重新请求
    this.fetchData()
  },

  deactivated() {
    // 组件被停用时调用
    // 适合：暂停定时器、取消未完成的请求
    this.pauseTimer()
  }
}
</script>
```

---

## 经典面试题

::: details 面试题 1：created 和 mounted 的区别？在哪个阶段请求数据？
<details>
<summary>点击查看答案</summary>

**区别**：
| 钩子 | DOM | 用途 |
|------|-----|------|
| created | 未挂载，无法访问 $el | 初始化数据、请求数据 |
| mounted | 已挂载，可以访问 DOM | 操作 DOM、初始化第三方库 |

**请求数据放在哪里？**

两者都可以，但各有优缺点：

**created**：
- ✅ 更快：不需要等待 DOM 挂载
- ✅ SSR 兼容：服务端渲染时会执行
- ❌ 无法操作 DOM

**mounted**：
- ✅ 可以操作 DOM
- ❌ SSR 时不执行
- ❌ 时机稍晚

**建议**：
- 普通数据请求放 created
- 需要 DOM 的操作放 mounted
- SSR 项目放 created
:::

---

</details>

::: details 面试题 2：beforeDestroy/beforeUnmount 中应该做什么？
<details>
<summary>点击查看答案</summary>

**必须清理的内容**：

```javascript
beforeDestroy() {
  // 1. 清理定时器
  clearInterval(this.timer)
  clearTimeout(this.timeout)

  // 2. 取消事件监听
  window.removeEventListener('resize', this.handleResize)
  document.removeEventListener('click', this.handleClick)

  // 3. 取消订阅
  this.unsubscribe()
  this.$bus.$off('eventName', this.handler)

  // 4. 取消未完成的请求
  this.cancelToken.cancel()

  // 5. 销毁第三方库实例
  this.chart?.destroy()
  this.editor?.destroy()

  // 6. 解绑自定义指令（如有必要）
}
```

**不清理的后果**：内存泄漏！
:::

---

</details>

::: details 面试题 3：Vue 3 为什么把 beforeDestroy 改名为 beforeUnmount？
<details>
<summary>点击查看答案</summary>

1. **语义更准确**：Vue 3 中组件不是被"销毁"，而是从 DOM 中"卸载"
2. **与 React 保持一致**：React 使用 componentWillUnmount
3. **与 mount 对称**：beforeMount/mounted 对应 beforeUnmount/unmounted

```javascript
// Vue 2
beforeDestroy() {}
destroyed() {}

// Vue 3
beforeUnmount() {}
unmounted() {}
```
:::

---

</details>

::: details 面试题 4：父子组件的生命周期执行顺序？
<details>
<summary>点击查看答案</summary>

**挂载阶段**：
```
父 beforeCreate → 父 created → 父 beforeMount
→ 子 beforeCreate → 子 created → 子 beforeMount → 子 mounted
→ 父 mounted
```

**更新阶段**：
```
父 beforeUpdate → 子 beforeUpdate → 子 updated → 父 updated
```

**销毁阶段**：
```
父 beforeDestroy → 子 beforeDestroy → 子 destroyed → 父 destroyed
```

**记忆口诀**：
- 创建从外到内，挂载从内到外
- 更新从外到内，完成从内到外
- 销毁从外到内，完成从内到外
:::

---

</details>

::: details 面试题 5：setup 和 created 哪个先执行？
<details>
<summary>点击查看答案</summary>

**setup 先执行！**

```javascript
export default {
  setup() {
    console.log('1. setup')
  },
  beforeCreate() {
    console.log('2. beforeCreate')
  },
  created() {
    console.log('3. created')
  }
}
// 输出：1. setup → 2. beforeCreate → 3. created
```

**原因**：
- setup 在组件实例创建之前执行
- setup 替代了 beforeCreate 和 created
- 在 setup 中无法使用 this
:::

---

</details>

::: details 面试题 6：mounted 中能保证子组件都挂载完成吗？
<details>
<summary>点击查看答案</summary>

**不能保证！**

mounted 不会保证所有子组件都已挂载完成。如果需要等待整个视图都渲染完成，应该使用 `$nextTick`：

```javascript
mounted() {
  // 不能保证子组件都已挂载
  console.log(this.$refs.child)  // 可能是 undefined

  // 使用 $nextTick 确保所有子组件都已挂载
  this.$nextTick(() => {
    console.log(this.$refs.child)  // 可以访问
  })
}
```

**异步组件的情况**：
```javascript
mounted() {
  // 异步组件可能还没加载完成
  this.$nextTick(() => {
    // 异步组件可能仍未完成
    // 需要在异步组件内部处理
  })
}
```
:::

---

</details>

::: details 面试题 7：Vue 3 的 onMounted 可以调用多次吗？
<details>
<summary>点击查看答案</summary>

**可以！** 这是 Composition API 的优势之一：

```javascript
import { onMounted } from 'vue'

// composable 1
function useFeatureA() {
  onMounted(() => {
    console.log('Feature A mounted')
  })
}

// composable 2
function useFeatureB() {
  onMounted(() => {
    console.log('Feature B mounted')
  })
}

// 组件中
setup() {
  useFeatureA()
  useFeatureB()

  onMounted(() => {
    console.log('Component mounted')
  })

  // 输出顺序：
  // Feature A mounted
  // Feature B mounted
  // Component mounted
}
```

**好处**：
- 逻辑可以按功能分组
- 更好的代码复用
- 每个 composable 管理自己的生命周期
:::

---

</details>

## 最佳实践

::: details 1. 数据初始化
```javascript
// ✅ 推荐：created 中初始化数据
created() {
  this.fetchUserInfo()
  this.initializeData()
}

// ✅ 需要 DOM 时使用 mounted
mounted() {
  this.initChart()
  this.bindDOMEvents()
}
```
:::

::: details 2. 清理工作
```javascript
export default {
  data() {
    return {
      timer: null,
      unsubscribe: null
    }
  },

  mounted() {
    this.timer = setInterval(() => {}, 1000)
    this.unsubscribe = store.subscribe(() => {})
  },

  // ✅ 务必清理
  beforeDestroy() {
    clearInterval(this.timer)
    this.unsubscribe?.()
  }
}
```
:::

::: details 3. Composition API 最佳实践
```javascript
// ✅ 封装成 composable
function useTimer() {
  const count = ref(0)
  let timer = null

  onMounted(() => {
    timer = setInterval(() => {
      count.value++
    }, 1000)
  })

  onBeforeUnmount(() => {
    clearInterval(timer)
  })

  return { count }
}

// 组件中使用
setup() {
  const { count } = useTimer()
  return { count }
}
```

---
:::

## 总结速记

```
Vue 2 生命周期：
beforeCreate → created → beforeMount → mounted
→ beforeUpdate → updated
→ beforeDestroy → destroyed

Vue 3 变化：
- beforeDestroy → beforeUnmount
- destroyed → unmounted
- setup 在 beforeCreate 之前执行

父子组件：
- 创建从外到内，挂载从内到外
- 父 beforeMount → 子全部 mounted → 父 mounted

keep-alive：
- 首次：created → mounted → activated
- 再次：activated
- 离开：deactivated

请求数据：一般放 created，需要 DOM 放 mounted
清理工作：务必在 beforeDestroy/beforeUnmount 中完成
```
