# Vue 面试题精选

> 汇总 Vue 响应式、虚拟 DOM、组件通信、生命周期、Composition API、路由、状态管理等高频面试题。

## 核心原理

### 1. Vue 2 和 Vue 3 响应式原理的区别？

**Vue 2（Object.defineProperty）：**
- 递归遍历对象，对每个属性设置 getter/setter
- 无法检测属性的新增/删除（需要 `Vue.set`/`Vue.delete`）
- 无法检测数组下标和 length 变化（需要重写数组方法）
- 初始化时递归遍历，性能开销大

**Vue 3（Proxy）：**
- 代理整个对象，拦截所有操作（get/set/has/deleteProperty 等）
- 天然支持属性新增/删除、数组下标修改
- 懒代理（访问时才递归），性能更好
- 支持 Map、Set、WeakMap、WeakSet

```javascript
// Vue 3 响应式核心
function reactive(obj) {
    return new Proxy(obj, {
        get(target, key, receiver) {
            track(target, key) // 依赖收集
            const res = Reflect.get(target, key, receiver)
            return isObject(res) ? reactive(res) : res // 懒递归
        },
        set(target, key, value, receiver) {
            const result = Reflect.set(target, key, value, receiver)
            trigger(target, key) // 触发更新
            return result
        }
    })
}
```

---

### 2. 什么是虚拟 DOM？Vue 的 Diff 算法是怎样的？

**虚拟 DOM**：用 JavaScript 对象描述真实 DOM 结构，通过对比新旧虚拟 DOM 的差异（Diff）来最小化真实 DOM 操作。

**优势**：跨平台、批量更新、声明式编程
**劣势**：额外的内存开销，极简场景下不如直接操作 DOM

**Vue 3 Diff 算法（快速 Diff）：**
1. 头头比较、尾尾比较（处理公共前缀/后缀）
2. 新增/删除处理
3. 中间乱序部分：建立新节点的 key→index 映射，用最长递增子序列（LIS）最小化移动操作

**key 的作用**：帮助 Diff 算法识别节点身份，复用 DOM，避免不必要的重建。不要用 index 作为 key（会导致错误复用）。

---

### 3. Vue 3 相比 Vue 2 有哪些重要改进？

| 方面 | Vue 2 | Vue 3 |
|------|-------|-------|
| 响应式 | Object.defineProperty | Proxy |
| 组合方式 | Options API | Composition API（兼容 Options） |
| 性能 | — | 编译优化（静态提升、补丁标志、树摇） |
| TypeScript | 支持有限 | 原生 TypeScript 重写 |
| 包体积 | 较大 | 支持 Tree-shaking，更小 |
| Fragment | 单根节点 | 多根节点 |
| Teleport | 无 | 支持（传送门） |
| Suspense | 无 | 支持 |
| 生命周期 | beforeDestroy/destroyed | onBeforeUnmount/onUnmounted |

---

### 4. ref 和 reactive 如何选择？

| 特性 | ref | reactive |
|------|-----|----------|
| 适用类型 | 基本类型 + 对象 | 对象/数组 |
| 访问方式 | `.value`（JS 中）| 直接访问 |
| 解构 | 解构后失去响应性 | 解构后失去响应性（需 toRefs） |
| 重新赋值 | 支持（替换 .value） | 不支持（会失去响应性） |

**推荐**：基本类型用 `ref`，复杂对象用 `reactive`；或统一用 `ref`（更一致）。

---

## 组件通信

### 5. Vue 组件通信方式有哪些？

| 方式 | 适用场景 | 说明 |
|------|---------|------|
| `props` / `emit` | 父子组件 | 最基础，单向数据流 |
| `v-model` | 父子双向绑定 | 语法糖，本质是 props + emit |
| `provide` / `inject` | 跨层级祖孙 | 避免 props 逐层传递 |
| `$refs` | 父访问子实例 | 直接调用子组件方法/属性 |
| `EventBus` | 任意组件（Vue 2） | Vue 3 推荐用 mitt 替代 |
| Pinia / Vuex | 全局状态 | 复杂应用的状态管理 |

---

### 6. v-model 的原理是什么？Vue 2 和 Vue 3 有什么区别？

**本质**：`v-model` 是 `props` + `emit` 的语法糖。

**Vue 2**：
```html
<!-- 等价于 -->
<Input :value="msg" @input="msg = $event" />
<!-- 自定义组件可通过 model 选项修改 prop/event 名 -->
```

**Vue 3**：
```html
<!-- 等价于 -->
<Input :modelValue="msg" @update:modelValue="msg = $event" />

<!-- 支持多个 v-model -->
<UserForm v-model:name="name" v-model:age="age" />

<!-- 支持修饰符 -->
<Input v-model.trim="msg" />
```

**主要区别**：Vue 3 支持多个 v-model 绑定，prop 名从 `value` 改为 `modelValue`，event 从 `input` 改为 `update:modelValue`。

---

## 生命周期

### 7. Vue 3 生命周期钩子有哪些？父子组件的执行顺序？

**Vue 3 生命周期（Composition API）：**
`setup` → `onBeforeMount` → `onMounted` → `onBeforeUpdate` → `onUpdated` → `onBeforeUnmount` → `onUnmounted`

**父子组件挂载顺序：**
```
父 beforeMount → 子 beforeMount → 子 mounted → 父 mounted
```

**父子组件更新顺序：**
```
父 beforeUpdate → 子 beforeUpdate → 子 updated → 父 updated
```

**父子组件销毁顺序：**
```
父 beforeUnmount → 子 beforeUnmount → 子 unmounted → 父 unmounted
```

**created vs mounted**：`created` 时 DOM 未挂载（可发请求），`mounted` 时 DOM 已挂载（可操作 DOM）。

---

### 8. setup 函数在哪个生命周期执行？

`setup` 在 `beforeCreate` 之前执行，是 Composition API 的入口。此时组件实例尚未创建，无法访问 `this`。

---

## Composition API

### 9. Composition API 相比 Options API 有什么优势？

1. **逻辑复用**：通过 composable 函数复用逻辑，解决 mixin 的命名冲突和来源不清晰问题
2. **代码组织**：相关逻辑集中在一起，而非分散在 data/methods/computed/watch 中
3. **TypeScript 支持**：更好的类型推断
4. **Tree-shaking**：按需引入，减小包体积

```javascript
// composable 复用示例
function useCounter(initial = 0) {
    const count = ref(initial)
    const increment = () => count.value++
    const decrement = () => count.value--
    return { count, increment, decrement }
}
```

---

### 10. watch 和 watchEffect 的区别？

| 特性 | watch | watchEffect |
|------|-------|-------------|
| 依赖声明 | 显式指定 | 自动收集 |
| 初始执行 | 默认不执行（`immediate: true` 才执行） | 立即执行 |
| 旧值访问 | 可以获取 oldValue | 不能 |
| 适用场景 | 需要对比新旧值、精确控制 | 副作用自动追踪 |

---

### 11. computed 和 watch 的区别？

| 特性 | computed | watch |
|------|---------|-------|
| 用途 | 派生数据（有返回值） | 监听变化执行副作用 |
| 缓存 | 有缓存，依赖不变不重新计算 | 无缓存，每次变化都执行 |
| 异步 | 不支持 | 支持 |
| 适用场景 | 模板中的计算值 | 数据变化时的异步操作 |

---

## 路由

### 12. Vue Router 的 History 模式和 Hash 模式有什么区别？

| 特性 | Hash 模式 | History 模式 |
|------|----------|-------------|
| URL 格式 | `/#/path` | `/path` |
| 服务器配置 | 不需要 | 需要（所有路径返回 index.html） |
| SEO | 较差 | 较好 |
| 兼容性 | 更好 | IE10+ |
| 原理 | `hashchange` 事件 | `pushState` / `popstate` |

---

### 13. 路由守卫的执行顺序是什么？

完整导航解析流程：
1. `beforeEach`（全局前置守卫）
2. `beforeEnter`（路由独享守卫）
3. 组件内 `beforeRouteEnter`
4. `beforeResolve`（全局解析守卫）
5. 导航确认，DOM 更新
6. `afterEach`（全局后置钩子）
7. 组件内 `beforeRouteUpdate`（复用组件时）
8. 组件内 `beforeRouteLeave`（离开时）

---

### 14. $route 和 $router 的区别？

- `$route`：当前路由信息对象（只读），包含 `path`、`params`、`query`、`name` 等
- `$router`：路由实例，用于编程式导航（`push`、`replace`、`go` 等）

---

## 状态管理

### 15. Pinia 和 Vuex 的区别？

| 特性 | Pinia | Vuex |
|------|-------|------|
| mutations | 无（直接修改 state） | 有（必须通过 mutation） |
| 模块化 | 天然多 store，无需嵌套 | 需要 modules 配置 |
| TypeScript | 原生支持，类型推断好 | 需要额外配置 |
| DevTools | 支持 | 支持 |
| 体积 | 更小（~1KB） | 较大 |
| Vue 版本 | Vue 2/3 均支持 | Vuex 4 支持 Vue 3 |

**为什么 Pinia 去掉了 mutations？** mutations 的设计初衷是让状态变更可追踪，但 actions 已经可以做到，mutations 只是增加了样板代码。

---

### 16. Vuex 的核心概念是什么？为什么 mutations 必须是同步的？

**核心概念**：`state`（状态）、`getters`（计算属性）、`mutations`（同步变更）、`actions`（异步操作）、`modules`（模块化）

**mutations 必须同步**：DevTools 需要在每次 mutation 前后捕获状态快照，异步操作会导致快照时序混乱，无法追踪状态变化。异步操作应放在 actions 中，通过 commit 调用 mutation。

---

## 性能优化

### 17. Vue 3 在性能上做了哪些优化？

**编译层面：**
1. **静态提升（Static Hoisting）**：静态节点提升到渲染函数外，避免重复创建
2. **补丁标志（Patch Flags）**：标记动态节点类型，Diff 时跳过静态内容
3. **树摇（Tree-shaking）**：未使用的功能不打包

**运行时层面：**
1. **Proxy 响应式**：懒代理，按需递归
2. **Fragment**：减少不必要的根节点包裹
3. **Teleport/Suspense**：更灵活的渲染控制

---

### 18. v-if 和 v-show 的区别？如何选择？

| 特性 | v-if | v-show |
|------|------|--------|
| 实现方式 | 条件渲染/销毁 DOM | CSS `display: none` |
| 初始开销 | 条件为 false 时无开销 | 始终渲染 |
| 切换开销 | 高（重新创建/销毁） | 低（只改 CSS） |
| 适用场景 | 条件很少改变 | 频繁切换显隐 |

---

### 19. 大列表如何优化？

1. **虚拟滚动**：只渲染可视区域内的节点（vue-virtual-scroller、vue-virtual-scroll-grid）
2. **分页/懒加载**：减少一次性渲染数量
3. **v-memo**：缓存子树，跳过不必要的更新
4. **shallowRef/shallowReactive**：大对象只做浅层响应式

---

## 自定义指令

### 20. 自定义指令的使用场景和生命周期？

**适用场景**：需要直接操作 DOM 的逻辑（权限控制、防抖、懒加载图片、拖拽等）

**Vue 3 指令钩子：**
```javascript
const vFocus = {
    mounted(el, binding, vnode) {
        el.focus()
    },
    updated(el, binding) {
        // 组件更新时
    },
    beforeUnmount(el) {
        // 清理副作用
    }
}
```

**指令 vs 组件**：指令用于 DOM 操作，组件用于 UI 封装。如果逻辑涉及模板/状态，用组件；如果只是 DOM 操作，用指令。

---

## Nuxt

### 21. Nuxt 3 的渲染模式有哪些？

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| SSR | 每次请求服务端渲染 | 动态内容、SEO 要求高 |
| SSG | 构建时生成静态 HTML | 内容不常变化的页面 |
| ISR | 增量静态再生，定时重新生成 | 内容定期更新 |
| CSR | 纯客户端渲染 | 后台管理系统 |
| 混合渲染 | 不同路由使用不同模式 | 复杂应用 |

---

### 22. useFetch 和 useAsyncData 的区别？

- `useFetch`：封装了 `useAsyncData` + `$fetch`，适合简单的 HTTP 请求
- `useAsyncData`：更底层，可以包裹任意异步函数，适合复杂数据获取逻辑

两者都支持 SSR 数据预取，在服务端执行后将数据序列化传给客户端，避免客户端重复请求。
