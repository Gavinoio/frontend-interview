# Pinia/Vuex

## Pinia
```javascript
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    }
  }
})
```

## Vuex
```javascript
const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++
    }
  },
  actions: {
    increment({ commit }) {
      commit('increment')
    }
  }
})
```

---

## 高频面试题

::: details 1. Pinia 和 Vuex 的区别？
**一句话答案：** Pinia 是 Vue 3 官方推荐的状态管理库，相比 Vuex 更轻量、API 更简洁、支持 TypeScript 更好，去掉了 mutations，支持多个 store 实例。

**详细解答：**

主要区别包括：

1. **API 设计**
   - Pinia：API 更简洁，去掉了 mutations
   - Vuex：需要 state、mutations、actions、getters

2. **TypeScript 支持**
   - Pinia：原生 TypeScript 支持，类型推断更好
   - Vuex：TypeScript 支持较弱，需要额外配置

3. **模块���**
   - Pinia：每个 store 都是独立的，无需嵌套
   - Vuex：使用 modules 进行模块化，可能嵌套复杂

4. **DevTools**
   - Pinia：更好的开发体验，支持时间旅行
   - Vuex：也支持但功能较少

```javascript
// Pinia - 更简洁
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: 'John',
    age: 25
  }),
  getters: {
    doubleAge: (state) => state.age * 2
  },
  actions: {
    async updateUser(newName) {
      // 直接修改 state，支持异步
      this.name = newName
      await api.updateUser(newName)
    }
  }
})

// Vuex - 更繁琐
const store = new Vuex.Store({
  state: {
    name: 'John',
    age: 25
  },
  getters: {
    doubleAge: state => state.age * 2
  },
  mutations: {
    SET_NAME(state, name) {
      state.name = name
    }
  },
  actions: {
    async updateUser({ commit }, newName) {
      commit('SET_NAME', newName)
      await api.updateUser(newName)
    }
  }
})
```

**面试口语化回答模板：**

"Pinia 和 Vuex 的主要区别我总结为以下几点：

首先，API 设计上 Pinia 更加简洁，它去掉了 Vuex 中的 mutations，可以直接在 actions 中修改 state，这样代码写起来更直观，也减少了很多模板代码。

其次，TypeScript 支持方面，Pinia 天生支持 TypeScript，类型推断非常准确，而 Vuex 需要很多额外的类型声明。

第三，模块化方面，Pinia 的每个 store 都是独立的，不需要像 Vuex 那样通过 modules 进行嵌套，使用起来更灵活。

最后，Pinia 是 Vue 3 官方推荐的状态管理方案，体积更小，性能也更好。在新项目中我们基本都会选择 Pinia。"

---
:::

::: details 2. Vuex 的核心概念有哪些？
**一句话答案：** Vuex 有五个核心概念：state（状态）、getters（计算属性）、mutations（同步修改状态）、actions（异步操作）、modules（模块化）。

**详细解答：**

```javascript
const store = new Vuex.Store({
  // 1. State - 存储应用的状态数据
  state: {
    count: 0,
    user: {
      name: 'John',
      age: 25
    },
    todos: []
  },

  // 2. Getters - 类似计算属性，用于派生状态
  getters: {
    // 访问 state
    doubleCount: state => state.count * 2,

    // 访问其他 getters
    doubleCountPlusOne: (state, getters) => {
      return getters.doubleCount + 1
    },

    // 返回函数，实现传参
    getTodoById: (state) => (id) => {
      return state.todos.find(todo => todo.id === id)
    },

    // 复杂计算
    completedTodos: state => {
      return state.todos.filter(todo => todo.completed)
    }
  },

  // 3. Mutations - 同步修改 state 的唯一方式
  mutations: {
    // 接收 state 作为第一个参数
    INCREMENT(state) {
      state.count++
    },

    // 接收 payload（载荷）
    INCREMENT_BY(state, amount) {
      state.count += amount
    },

    // 对象风格的载荷
    SET_USER(state, { name, age }) {
      state.user.name = name
      state.user.age = age
    },

    // 添加新属性时使用 Vue.set 或对象展开
    ADD_TODO(state, todo) {
      state.todos.push(todo)
    }
  },

  // 4. Actions - 处理异步操作，提交 mutations
  actions: {
    // context 对象包含 { state, commit, dispatch, getters }
    async fetchUser({ commit, state }) {
      try {
        const response = await api.getUser()
        commit('SET_USER', response.data)
      } catch (error) {
        console.error(error)
      }
    },

    // 组合多个 mutations
    async addTodo({ commit, dispatch }, text) {
      const todo = {
        id: Date.now(),
        text,
        completed: false
      }
      commit('ADD_TODO', todo)

      // 可以 dispatch 其他 actions
      await dispatch('saveTodoToServer', todo)
    },

    // actions 支持 Promise
    actionA({ commit }) {
      return new Promise((resolve) => {
        setTimeout(() => {
          commit('INCREMENT')
          resolve()
        }, 1000)
      })
    },

    // 链式调用 actions
    async actionB({ dispatch }) {
      await dispatch('actionA')
      console.log('actionA 完成后执行')
    }
  },

  // 5. Modules - 将 store 分割成模块
  modules: {
    user: {
      namespaced: true, // 命名空间
      state: () => ({
        profile: {}
      }),
      getters: {
        fullName: state => `${state.profile.firstName} ${state.profile.lastName}`
      },
      mutations: {
        SET_PROFILE(state, profile) {
          state.profile = profile
        }
      },
      actions: {
        async loadProfile({ commit }) {
          const profile = await api.getProfile()
          commit('SET_PROFILE', profile)
        }
      }
    },

    cart: {
      namespaced: true,
      state: () => ({
        items: []
      }),
      // ...
    }
  }
})

// 使用示例
// 访问 state
store.state.count
store.state.user.name

// 访问 getters
store.getters.doubleCount
store.getters.getTodoById(1)

// 提交 mutations
store.commit('INCREMENT')
store.commit('INCREMENT_BY', 10)
store.commit({
  type: 'SET_USER',
  name: 'Jane',
  age: 30
})

// 分发 actions
store.dispatch('fetchUser')
store.dispatch('addTodo', 'Learn Vuex')

// 访问模块（带命名空间）
store.state.user.profile
store.getters['user/fullName']
store.commit('user/SET_PROFILE', profile)
store.dispatch('user/loadProfile')
```

**在组件中使用：**

```javascript
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  computed: {
    // 映射 state
    ...mapState(['count', 'user']),
    ...mapState({
      userAge: state => state.user.age
    }),

    // 映射 getters
    ...mapGetters(['doubleCount', 'completedTodos']),

    // 映射模块的 state 和 getters
    ...mapState('user', ['profile']),
    ...mapGetters('user', ['fullName'])
  },

  methods: {
    // 映射 mutations
    ...mapMutations(['INCREMENT', 'SET_USER']),
    ...mapMutations({
      add: 'INCREMENT'
    }),

    // 映射 actions
    ...mapActions(['fetchUser', 'addTodo']),
    ...mapActions({
      load: 'fetchUser'
    }),

    // 映射模块的 actions
    ...mapActions('user', ['loadProfile'])
  }
}
```

**面试口语化回答模板：**

"Vuex 的核心概念有五个，我按照数据流的顺序来说：

首先是 State，它就是存储应用状态数据的地方，相当于组件的 data。

然后是 Getters，类似于计算属性，用于从 state 中派生出一些状态，比如过滤、计算等操作，而且 getters 的结果会被缓存。

接下来是 Mutations，这是修改 state 的唯一方式，必须是同步函数。我们通过 commit 来提交 mutations。

第四个是 Actions，用于处理异步操作，比如 API 请求。actions 不直接修改 state，而是通过 commit mutations 来修改。我们通过 dispatch 来分发 actions。

最后是 Modules，当应用变得复杂时，我们可以用 modules 将 store 分割成模块，每个模块有自己的 state、getters、mutations、actions。通过设置 namespaced 为 true 可以让模块更独立。

简单来说就是：state 存数据，getters 派生数据，mutations 同步改数据，actions 异步操作，modules 做模块化。"

---
:::

::: details 3. 为什么 mutations 必须是同步的？
**一句话答案：** mutations 必须是同步的，是为了确保状态变化可追踪、可调试，devtools 能准确记录每次状态变更，便于时间旅行调试和状态回溯。

**详细解答：**

Vuex 要求 mutations 必须是同步函数，主要原因有：

1. **状态追踪**：devtools 需要捕获 mutation 前后的状态快照，如果是异步的，无法确定状态何时改变

2. **调试能力**：同步保证了每个 mutation 的执行顺序，便于调试和状态回溯

3. **时间旅行**：devtools 的时间旅行功能依赖于明确的状态变更点

```javascript
// 错误示例：异步 mutation
const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    // ❌ 不要这样做！
    async INCREMENT_ASYNC(state) {
      // 异步操作会导致 devtools 无法追踪
      setTimeout(() => {
        state.count++ // 这个状态变更无法被正确追踪
      }, 1000)
    },

    // ❌ 不要这样做！
    async FETCH_DATA(state) {
      const data = await api.getData()
      state.data = data // devtools 无法捕获这个变更的确切时机
    }
  }
})

// 正确示例：使用 actions 处理异步
const store = new Vuex.Store({
  state: {
    count: 0,
    data: null,
    loading: false
  },

  mutations: {
    // ✅ mutations 只做同步的状态修改
    INCREMENT(state) {
      state.count++
    },

    SET_DATA(state, data) {
      state.data = data
    },

    SET_LOADING(state, loading) {
      state.loading = loading
    }
  },

  actions: {
    // ✅ actions 处理异步逻辑
    async incrementAsync({ commit }) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      commit('INCREMENT') // 通过 commit 同步的 mutation
    },

    async fetchData({ commit }) {
      commit('SET_LOADING', true)
      try {
        const data = await api.getData()
        commit('SET_DATA', data) // 异步完成后，commit 同步 mutation
      } catch (error) {
        console.error(error)
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
})
```

**为什么同步很重要：**

```javascript
// 场景：多个异步 mutation 同时执行
store.commit('ASYNC_MUTATION_A') // 假设需要 2 秒
store.commit('ASYNC_MUTATION_B') // 假设需要 1 秒

// 问题：
// 1. B 可能在 A 之前完成，导致状态变更顺序不确定
// 2. devtools 无法准确记录状态变化的时间点
// 3. 无法进行有效的时间旅行调试
// 4. 难以重现 bug

// 使用同步 mutations + 异步 actions
store.dispatch('actionA') // action 内部按顺序 commit mutations
store.dispatch('actionB')

// 优势：
// 1. 每个 mutation 都是原子性的状态变更
// 2. devtools 可以准确追踪每次状态变化
// 3. 可以清晰地看到状态变更历史
// 4. 支持时间旅行和状态回放
```

**实际调试对比：**

```javascript
// 使用同步 mutations
// DevTools 显示：
// [2023-01-01 10:00:00] INCREMENT ← 可以看到确切时间和状态
// [2023-01-01 10:00:01] SET_USER  ← 清晰的变更记录
// [2023-01-01 10:00:02] ADD_TODO  ← 每步都可追踪

// 如果使用异步 mutations
// DevTools 显示混乱：
// [2023-01-01 10:00:00] ASYNC_MUTATION_A ← commit 时间
// [2023-01-01 10:00:00] ASYNC_MUTATION_B ← commit 时间
// 但实际状态变更发生在未知时间，无法追踪
```

**面试口语化回答模板：**

"mutations 必须是同步的，这是 Vuex 的一个重要约束，主要出于以下几个原因：

首先，最重要的是为了状态的可追踪性。Vue DevTools 需要在 mutation 执行前后捕获状态快照，如果 mutation 是异步的，DevTools 就无法确定状态到底是什么时候改变的，也就没法准确记录状态变更。

其次，同步的 mutations 保证了状态变更的顺序是可预测的。如果允许异步，多个 mutation 并发执行，我们就不知道哪个会先完成，状态变更的顺序就乱了，这会给调试带来很大困难。

第三，Vue DevTools 的时间旅行功能依赖于明确的状态变更点。每个 mutation 都是一个可以回溯的时间点，如果是异步的，这个功能就没法实现了。

所以在实际开发中，我们把异步逻辑都放在 actions 里，等异步操作完成后，再通过 commit 提交同步的 mutations 来修改状态。这样既保证了灵活性，又保证了状态变更的可追踪性。"

---
:::

::: details 4. Pinia 为什么不需要 mutations？
**一句话答案：** Pinia 不需要 mutations 是因为 Vue 3 的 Proxy 响应式系统可以直接追踪状态变化，不再需要像 Vuex 那样通过 mutations 来保证 DevTools 的追踪能力，这样使 API 更简洁、开发更高效。

**详细解答：**

Pinia 去掉 mutations 的原因：

1. **Vue 3 响应式系统的改进**
   - Vue 3 使用 Proxy 替代了 Vue 2 的 Object.defineProperty
   - Proxy 可以更好地追踪对象的变化
   - DevTools 可以直接监听响应式对象的变更

2. **简化开发体验**
   - 减少样板代码
   - 不需要区分同步和异步操作
   - 代码更直观易读

3. **TypeScript 支持更好**
   - 类型推断更准确
   - 减少手动类型声明

```javascript
// Vuex 的繁琐写法
const store = new Vuex.Store({
  state: {
    count: 0,
    user: null
  },

  mutations: {
    // 需要为每个状态变更定义 mutation
    INCREMENT(state) {
      state.count++
    },
    SET_COUNT(state, value) {
      state.count = value
    },
    SET_USER(state, user) {
      state.user = user
    }
  },

  actions: {
    // 同步操作也要通过 commit
    increment({ commit }) {
      commit('INCREMENT')
    },

    // 异步操作需要先定义 mutation
    async fetchUser({ commit }) {
      const user = await api.getUser()
      commit('SET_USER', user)
    }
  }
})

// Pinia 的简洁写法
import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => ({
    count: 0,
    user: null
  }),

  actions: {
    // 直接修改 state，支持同步和异步
    increment() {
      this.count++
    },

    setCount(value) {
      this.count = value
    },

    async fetchUser() {
      this.user = await api.getUser()
    },

    // 也可以通过 $patch 批量更新
    updateMultiple() {
      this.$patch({
        count: this.count + 1,
        user: { name: 'John' }
      })
    },

    // $patch 还支持函数形式
    updateWithFunction() {
      this.$patch((state) => {
        state.count++
        state.user.age++
      })
    }
  }
})
```

**Pinia 中修改状态的三种方式：**

```javascript
import { useMainStore } from '@/stores/main'

// 在组件中使用
const store = useMainStore()

// 方式 1：直接修改（组件中）
store.count++
store.user = { name: 'John' }

// 方式 2：使用 $patch 对象形式
store.$patch({
  count: store.count + 1,
  user: { name: 'John', age: 25 }
})

// 方式 3：使用 $patch 函数形式（性能更好）
store.$patch((state) => {
  state.count++
  state.user.age++
  state.items.push({ id: 1, text: 'New Item' })
})

// 方式 4：在 actions 中修改（推荐）
store.increment()
store.fetchUser()
```

**DevTools 追踪对比：**

```javascript
// Pinia - DevTools 可以追踪所有变更
const useStore = defineStore('main', {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++ // ✅ DevTools 追踪到：action "increment"
    },
    async fetchData() {
      const data = await api.getData()
      this.data = data // ✅ DevTools 追踪到：action "fetchData"
    }
  }
})

// 组件中直接修改
store.count++ // ✅ DevTools 追踪到：direct mutation

// 使用 $patch
store.$patch({ count: 10 }) // ✅ DevTools 追踪到：$patch

// Vuex - 必须通过 mutations
const store = new Vuex.Store({
  state: { count: 0 },
  mutations: {
    INCREMENT(state) {
      state.count++ // ✅ DevTools 追踪到
    }
  },
  actions: {
    async fetchData({ commit }) {
      const data = await api.getData()
      commit('SET_DATA', data) // ✅ 必须通过 mutation
    }
  }
})

// 直接修改会有警告
store.state.count++ // ⚠️ 警告：不要直接修改 state
```

**为什么 Vue 3 可以做到这一点：**

```javascript
// Vue 2 的限制（Object.defineProperty）
const state = {
  count: 0
}
Object.defineProperty(state, 'count', {
  get() { /* 追踪读取 */ },
  set() { /* 追踪修改 */ }
})
// 问题：无法追踪新增属性、数组索引变化等

// Vue 3 的改进（Proxy）
const state = new Proxy({
  count: 0
}, {
  get(target, key) {
    // 追踪所有属性访问
    track(target, key)
    return target[key]
  },
  set(target, key, value) {
    // 追踪所有属性修改，包括新增
    trigger(target, key)
    target[key] = value
  }
})
// 优势：可以完整追踪所有变化，不需要特殊处理
```

**面试口语化回答模板：**

"Pinia 不需要 mutations，这是因为 Vue 3 的响应式系统有了本质的改进。

在 Vue 2 时代，Vuex 使用 mutations 主要是为了让 DevTools 能够追踪状态变化。因为 Vue 2 用的是 Object.defineProperty，有一些限制，必须通过 mutations 这个中间层来保证每次状态变更都能被记录。

但到了 Vue 3，响应式系统改用了 Proxy，这是一个更强大的特性。Proxy 可以完整地拦截和追踪对象的所有操作，包括属性的新增、删除等。所以 DevTools 可以直接监听响应式状态的变化，不再需要 mutations 这个中间层了。

Pinia 就是基于这个特性设计的。我们可以直接在 actions 里修改 state，或者在组件里通过 store.count++ 这样直接修改，DevTools 都能准确追踪到。这样就大大简化了代码，减少了很多样板代码，不用再写一堆 mutations，开发效率提高了很多。

而且因为去掉了 mutations，actions 可以同时处理同步和异步操作，不用再区分，TypeScript 的类型推断也更准确了。所以这是一个基于技术进步的合理简化。"
:::
