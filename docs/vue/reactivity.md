# 响应式原理

## 1. 什么是响应式?

### 官方答案
响应式是指数据变化时,视图能够自动更新的机制。Vue 通过**数据劫持** + **观察者模式**实现响应式系统,当数据发生变化时,自动通知依赖该数据的视图进行更新。

### 通俗理解
想象你在用 Excel:
- 在单元格 A1 输入数字 10
- 在单元格 B1 写公式 `=A1*2`
- 当你修改 A1 为 20 时,B1 **自动变成** 40

这就是响应式!数据(A1)变化,依赖它的地方(B1)自动更新。

Vue 做的就是让你的 JavaScript 数据也有这种"自动更新"的能力。

---

## 2. Vue 2 响应式原理

### 核心: Object.defineProperty

Vue 2 使用 `Object.defineProperty()` 劫持对象属性的 getter 和 setter。

### 简易实现

```javascript
// 响应式数据
function defineReactive(obj, key, value) {
  const dep = new Dep();  // 依赖收集器

  Object.defineProperty(obj, key, {
    get() {
      console.log(`读取 ${key}:`, value);

      // 收集依赖
      if (Dep.target) {
        dep.depend();
      }

      return value;
    },

    set(newValue) {
      if (newValue === value) return;

      console.log(`设置 ${key}:`, newValue);
      value = newValue;

      // 通知更新
      dep.notify();
    }
  });
}

// 依赖收集器
class Dep {
  constructor() {
    this.subs = [];  // 订阅者数组
  }

  // 添加订阅者
  depend() {
    if (Dep.target) {
      this.subs.push(Dep.target);
    }
  }

  // 通知所有订阅者
  notify() {
    this.subs.forEach(watcher => watcher.update());
  }
}

Dep.target = null;  // 全局变量,当前正在收集依赖的 Watcher

// 观察者
class Watcher {
  constructor(vm, key, callback) {
    this.vm = vm;
    this.key = key;
    this.callback = callback;

    // 触发 getter,收集依赖
    Dep.target = this;
    this.value = vm[key];  // 读取数据,触发 getter
    Dep.target = null;
  }

  update() {
    const newValue = this.vm[this.key];
    if (newValue !== this.value) {
      this.value = newValue;
      this.callback(newValue);
    }
  }
}

// 使用示例
const data = { count: 0 };
defineReactive(data, 'count', data.count);

// 创建观察者
new Watcher(data, 'count', (newValue) => {
  console.log('视图更新:', newValue);
});

data.count = 1;  // 输出: 设置 count: 1 → 视图更新: 1
data.count = 2;  // 输出: 设置 count: 2 → 视图更新: 2
```

### 完整流程

```javascript
class Vue {
  constructor(options) {
    this.$data = options.data;
    this.observe(this.$data);

    // 代理 data 到 vm 实例
    Object.keys(this.$data).forEach(key => {
      Object.defineProperty(this, key, {
        get() {
          return this.$data[key];
        },
        set(newValue) {
          this.$data[key] = newValue;
        }
      });
    });

    // 编译模板
    this.compile(options.el);
  }

  observe(data) {
    if (!data || typeof data !== 'object') return;

    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key]);

      // 递归观察对象属性
      this.observe(data[key]);
    });
  }

  defineReactive(obj, key, value) {
    const dep = new Dep();
    const self = this;

    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,

      get() {
        if (Dep.target) {
          dep.depend();
        }
        return value;
      },

      set(newValue) {
        if (newValue === value) return;

        value = newValue;
        self.observe(newValue);  // 新值也要监听
        dep.notify();
      }
    });
  }

  compile(el) {
    // 简化的模板编译
    const element = document.querySelector(el);
    const childNodes = element.childNodes;

    childNodes.forEach(node => {
      if (node.nodeType === 3) {  // 文本节点
        const text = node.textContent;
        const reg = /\{\{(.*?)\}\}/g;

        if (reg.test(text)) {
          const key = RegExp.$1.trim();

          // 初始化视图
          node.textContent = this.$data[key];

          // 创建 Watcher,监听数据变化
          new Watcher(this.$data, key, (newValue) => {
            node.textContent = newValue;
          });
        }
      }
    });
  }
}

// 使用
const vm = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
});

// 修改数据,视图自动更新
vm.message = 'Hello World!';
```

### Vue 2 的局限性

```javascript
const vm = new Vue({
  data: {
    obj: { a: 1 }
  }
});

// ❌ 无法检测到属性的添加
vm.obj.b = 2;  // 不会触发更新
Vue.set(vm.obj, 'b', 2);  // ✅ 需要使用 Vue.set

// ❌ 无法检测到属性的删除
delete vm.obj.a;  // 不会触发更新
Vue.delete(vm.obj, 'a');  // ✅ 需要使用 Vue.delete

// ❌ 无法检测数组索引变化
const vm2 = new Vue({
  data: {
    arr: [1, 2, 3]
  }
});

vm2.arr[0] = 100;  // 不会触发更新
vm2.$set(vm2.arr, 0, 100);  // ✅ 需要使用 $set

// ✅ 数组方法被 Vue 重写,可以检测
vm2.arr.push(4);     // 会触发更新
vm2.arr.splice(0, 1); // 会触发更新
```

### Vue 2 数组响应式处理

```javascript
// Vue 2 重写了数组的 7 个方法
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);

['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(method => {
  const original = arrayProto[method];

  Object.defineProperty(arrayMethods, method, {
    value: function(...args) {
      // 执行原始方法
      const result = original.apply(this, args);

      // 获取新增的元素
      let inserted;
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;
        case 'splice':
          inserted = args.slice(2);
          break;
      }

      // 对新增元素进行响应式处理
      if (inserted) {
        // observeArray(inserted)
      }

      // 触发更新
      // notify()

      return result;
    },
    enumerable: false,
    writable: true,
    configurable: true
  });
});

// 使用
function observeArray(arr) {
  arr.__proto__ = arrayMethods;  // 修改原型
}
```

---

## 3. Vue 3 响应式原理

### 核心: Proxy

Vue 3 使用 ES6 的 `Proxy` 代理整个对象,解决了 Vue 2 的所有限制。

### 基础实现

```javascript
// 响应式函数
function reactive(target) {
  const handler = {
    get(target, key, receiver) {
      console.log(`读取 ${key}`);

      // 收集依赖
      track(target, key);

      const result = Reflect.get(target, key, receiver);

      // 如果是对象,递归代理
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }

      return result;
    },

    set(target, key, value, receiver) {
      console.log(`设置 ${key}:`, value);

      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);

      // 触发更新
      if (oldValue !== value) {
        trigger(target, key);
      }

      return result;
    },

    deleteProperty(target, key) {
      console.log(`删除 ${key}`);

      const hadKey = Object.prototype.hasOwnProperty.call(target, key);
      const result = Reflect.deleteProperty(target, key);

      if (hadKey && result) {
        trigger(target, key);
      }

      return result;
    }
  };

  return new Proxy(target, handler);
}

// 依赖收集
const targetMap = new WeakMap();
let activeEffect = null;

function track(target, key) {
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  dep.add(activeEffect);
}

// 触发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => effect());
  }
}

// 副作用函数
function effect(fn) {
  activeEffect = fn;
  fn();  // 立即执行,触发依赖收集
  activeEffect = null;
}

// 使用示例
const state = reactive({
  count: 0,
  user: {
    name: 'Alice'
  }
});

effect(() => {
  console.log('Effect:', state.count);
});
// 输出: 读取 count → Effect: 0

state.count++;
// 输出: 设置 count: 1 → 读取 count → Effect: 1

// ✅ 支持新增属性
state.newProp = 'new';  // 会触发更新

// ✅ 支持删除属性
delete state.newProp;  // 会触发更新

// ✅ 支持数组索引
const arr = reactive([1, 2, 3]);
arr[0] = 100;  // 会触发更新
```

### Vue 3 完整响应式系统

```javascript
// ref - 基本类型响应式
function ref(value) {
  return {
    get value() {
      track(this, 'value');
      return value;
    },
    set value(newValue) {
      value = newValue;
      trigger(this, 'value');
    }
  };
}

// computed - 计算属性
function computed(getter) {
  let value;
  let dirty = true;  // 脏检查

  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true;  // 依赖变化,标记为脏
      trigger(obj, 'value');
    }
  });

  const obj = {
    get value() {
      if (dirty) {
        value = effectFn();
        dirty = false;
      }
      track(obj, 'value');
      return value;
    }
  };

  return obj;
}

// readonly - 只读代理
function readonly(target) {
  return new Proxy(target, {
    get(target, key) {
      track(target, key);
      return Reflect.get(target, key);
    },
    set() {
      console.warn('readonly 对象不能修改');
      return true;
    }
  });
}

// shallowReactive - 浅响应式
function shallowReactive(target) {
  return new Proxy(target, {
    get(target, key) {
      track(target, key);
      return Reflect.get(target, key);  // 不递归
    },
    set(target, key, value) {
      const result = Reflect.set(target, key, value);
      trigger(target, key);
      return result;
    }
  });
}

// 使用示例
const count = ref(0);
const double = computed(() => count.value * 2);

effect(() => {
  console.log('Double:', double.value);
});
// 输出: Double: 0

count.value = 10;
// 输出: Double: 20
```

---

## 4. Vue 3 高级响应式 API

Vue 3 提供了一系列高级 API，用于精细控制响应式行为和性能优化。

### shallowRef 和 shallowReactive

```javascript
import { shallowRef, shallowReactive, triggerRef } from 'vue';

// shallowRef - 只有 .value 的变化是响应式的
const state = shallowRef({ count: 0, user: { name: 'Alice' } });

// ❌ 不会触发更新
state.value.count++;
state.value.user.name = 'Bob';

// ✅ 会触发更新 - 整体替换 .value
state.value = { count: 1, user: { name: 'Bob' } };

// 手动触发更新
state.value.count++;
triggerRef(state);  // 强制触发更新

// shallowReactive - 只有第一层是响应式的
const obj = shallowReactive({
  name: 'Alice',
  nested: { count: 0 }
});

obj.name = 'Bob';           // ✅ 触发更新
obj.nested.count++;         // ❌ 不会触发更新
obj.nested = { count: 1 };  // ✅ 触发更新
```

**使用场景**：
- 大型对象，内部数据变化频繁但不需要细粒度响应
- 性能敏感场景，手动控制更新时机
- 只关心引用变化，不关心内部变化

### markRaw - 跳过响应式转换

```javascript
import { markRaw, reactive, isReactive } from 'vue';

// 标记为原始对象，永远不会被转换为响应式
const rawData = markRaw({
  largeArray: new Array(10000).fill(0),
  complexObj: { /* 大型对象 */ }
});

const state = reactive({
  data: rawData  // rawData 不会被转换为响应式
});

console.log(isReactive(state.data));  // false

// 常见场景：第三方库实例
import { Chart } from 'chart.js';

const chartState = reactive({
  chartInstance: markRaw(new Chart(/* ... */)),
  options: { /* 这些会是响应式的 */ }
});

// 常见场景：大型不变数据
const config = markRaw({
  cities: [/* 几千个城市数据 */],
  countries: [/* 国家数据 */]
});
```

**什么时候用 markRaw**：
- 第三方库实例（Chart.js、ECharts、地图实例）
- 大型静态数据（城市列表、配置项）
- 不需要响应式的复杂对象
- class 实例（不希望被代理）

### toRaw - 获取原始对象

```javascript
import { reactive, toRaw, isReactive } from 'vue';

const original = { name: 'Alice', age: 25 };
const proxy = reactive(original);

// 获取原始对象
const raw = toRaw(proxy);

console.log(raw === original);  // true
console.log(isReactive(raw));   // false

// 使用场景1：传递给不支持 Proxy 的第三方库
someThirdPartyLib.process(toRaw(proxy));

// 使用场景2：性能优化 - 大量只读操作
const largeList = reactive([/* 10000 个项目 */]);

function processWithoutTracking() {
  const rawList = toRaw(largeList);

  // 遍历不会触发依赖收集，性能更好
  rawList.forEach(item => {
    // 只读操作
  });
}

// 使用场景3：深拷贝时避免代理问题
const state = reactive({ user: { name: 'Alice' } });
const copied = JSON.parse(JSON.stringify(toRaw(state)));
```

### triggerRef - 手动触发更新

```javascript
import { shallowRef, triggerRef, watchEffect } from 'vue';

const shallow = shallowRef({ count: 0 });

watchEffect(() => {
  console.log('count:', shallow.value.count);
});
// 输出: count: 0

// 修改内部值不会触发更新
shallow.value.count++;
// 无输出

// 手动触发更新
triggerRef(shallow);
// 输出: count: 1

// 实际应用：批量更新后统一触发
function batchUpdate() {
  shallow.value.count++;
  shallow.value.count++;
  shallow.value.count++;

  // 只触发一次更新
  triggerRef(shallow);
}
```

### 响应式工具函数

```javascript
import {
  ref,
  reactive,
  readonly,
  isRef,
  isReactive,
  isProxy,
  isReadonly,
  unref,
  toRef,
  toRefs
} from 'vue';

// ========== 类型检查 ==========

const count = ref(0);
const state = reactive({ name: 'Alice' });
const frozen = readonly(state);

// isRef - 检查是否为 ref
console.log(isRef(count));       // true
console.log(isRef(state));       // false

// isReactive - 检查是否为 reactive
console.log(isReactive(state));  // true
console.log(isReactive(frozen)); // false (readonly 不是 reactive)

// isProxy - 检查是否为 Proxy (包括 reactive 和 readonly)
console.log(isProxy(state));     // true
console.log(isProxy(frozen));    // true

// isReadonly - 检查是否为只读
console.log(isReadonly(frozen)); // true
console.log(isReadonly(state));  // false

// ========== unref - 解包 ref ==========

// 如果是 ref 返回 .value，否则返回原值
const maybeRef = ref(10);
const notRef = 20;

console.log(unref(maybeRef));  // 10
console.log(unref(notRef));    // 20

// 常用于组合式函数，接受 ref 或普通值
function useDouble(value) {
  return computed(() => unref(value) * 2);
}

useDouble(ref(5));   // 10
useDouble(5);        // 10

// ========== toRef - 创建单个属性的 ref ==========

const obj = reactive({ name: 'Alice', age: 25 });

// 创建一个与源属性同步的 ref
const nameRef = toRef(obj, 'name');

nameRef.value = 'Bob';
console.log(obj.name);  // 'Bob'

obj.name = 'Charlie';
console.log(nameRef.value);  // 'Charlie'

// 常用于组合式函数的 props
function useName(props) {
  const name = toRef(props, 'name');
  // name 会与 props.name 保持同步
  return { name };
}

// ========== toRefs - 解构保持响应式 ==========

const state2 = reactive({
  name: 'Alice',
  age: 25,
  email: 'alice@example.com'
});

// ❌ 直接解构会失去响应式
const { name, age } = state2;
// name 和 age 只是普通值

// ✅ 使用 toRefs 解构
const { name: nameRef2, age: ageRef } = toRefs(state2);

nameRef2.value = 'Bob';
console.log(state2.name);  // 'Bob'

// 常用于组合式函数返回值
function useUserState() {
  const state = reactive({
    name: '',
    age: 0,
    loading: false
  });

  // 返回时使用 toRefs，调用方可以解构
  return {
    ...toRefs(state),
    updateName: (name) => state.name = name
  };
}

// 使用方可以解构
const { name, age, loading, updateName } = useUserState();
```

### customRef - 自定义 ref

```javascript
import { customRef } from 'vue';

// 创建防抖 ref
function useDebouncedRef(value, delay = 300) {
  let timeout;

  return customRef((track, trigger) => ({
    get() {
      track();  // 追踪依赖
      return value;
    },
    set(newValue) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        value = newValue;
        trigger();  // 触发更新
      }, delay);
    }
  }));
}

// 使用
const searchQuery = useDebouncedRef('', 500);

// 输入时不会立即触发更新，500ms 后才触发
searchQuery.value = 'hello';

// 创建节流 ref
function useThrottledRef(value, delay = 300) {
  let lastTime = 0;

  return customRef((track, trigger) => ({
    get() {
      track();
      return value;
    },
    set(newValue) {
      const now = Date.now();
      if (now - lastTime >= delay) {
        value = newValue;
        lastTime = now;
        trigger();
      }
    }
  }));
}

// 创建验证 ref
function useValidatedRef(value, validator) {
  return customRef((track, trigger) => ({
    get() {
      track();
      return value;
    },
    set(newValue) {
      if (validator(newValue)) {
        value = newValue;
        trigger();
      } else {
        console.warn('验证失败:', newValue);
      }
    }
  }));
}

// 使用：只接受正数
const positiveNumber = useValidatedRef(1, (v) => v > 0);
positiveNumber.value = 10;  // ✅ 更新
positiveNumber.value = -5;  // ❌ 验证失败，不更新

// 创建本地存储同步 ref
function useLocalStorageRef(key, defaultValue) {
  return customRef((track, trigger) => ({
    get() {
      track();
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    },
    set(newValue) {
      localStorage.setItem(key, JSON.stringify(newValue));
      trigger();
    }
  }));
}

// 使用：自动与 localStorage 同步
const theme = useLocalStorageRef('theme', 'light');
theme.value = 'dark';  // 自动保存到 localStorage
```

### effectScope - 副作用作用域

```javascript
import { effectScope, ref, computed, watch, watchEffect } from 'vue';

// 创建一个作用域
const scope = effectScope();

scope.run(() => {
  const count = ref(0);
  const double = computed(() => count.value * 2);

  watch(count, () => {
    console.log('count changed');
  });

  watchEffect(() => {
    console.log('double:', double.value);
  });

  // 所有响应式副作用都在这个作用域内
});

// 一次性停止所有副作用
scope.stop();

// 实际应用：组件外的响应式状态管理
const store = effectScope(true);  // true 表示分离作用域

const state = store.run(() => {
  const user = ref(null);
  const isLoggedIn = computed(() => !!user.value);

  watchEffect(() => {
    if (isLoggedIn.value) {
      console.log('用户已登录:', user.value.name);
    }
  });

  return { user, isLoggedIn };
});

// 组合式函数中使用
function useFeature() {
  const scope = effectScope();

  const result = scope.run(() => {
    const data = ref([]);
    const loading = ref(false);

    watchEffect(() => {
      // 副作用
    });

    return { data, loading };
  });

  // 返回清理函数
  return {
    ...result,
    dispose: () => scope.stop()
  };
}
```

### 高级 API 最佳实践

```javascript
// 1. 性能优化：大型列表使用 shallowRef
const bigList = shallowRef([]);

async function fetchData() {
  const data = await api.fetchLargeList();
  bigList.value = data;  // 整体替换，触发一次更新
}

// 2. 第三方库实例使用 markRaw
const chartRef = ref(null);
const chartInstance = shallowRef(null);

onMounted(() => {
  chartInstance.value = markRaw(new Chart(chartRef.value, options));
});

// 3. 组合式函数返回值使用 toRefs
function useState(initialState) {
  const state = reactive(initialState);

  return {
    ...toRefs(state),
    reset: () => Object.assign(state, initialState)
  };
}

// 4. 接受 ref 或普通值的函数使用 unref
function useTitle(title) {
  watchEffect(() => {
    document.title = unref(title);
  });
}

useTitle(ref('动态标题'));  // ✅
useTitle('静态标题');       // ✅

// 5. 避免不必要的响应式
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
};
// 不需要响应式的配置，直接用普通对象

const state = reactive({
  user: null,
  config: markRaw(config)  // 或者用 markRaw
});
```

---

## 5. Vue 2 vs Vue 3 响应式对比

### 实现对比

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 核心 API | Object.defineProperty | Proxy |
| 监听方式 | 属性劫持 | 对象代理 |
| 新增属性 | ❌ 不支持 | ✅ 支持 |
| 删除属性 | ❌ 不支持 | ✅ 支持 |
| 数组索引 | ❌ 不支持 | ✅ 支持 |
| Map/Set | ❌ 不支持 | ✅ 支持 |
| 性能 | 初始化慢(递归) | 懒代理,性能好 |
| 浏览器支持 | IE9+ | 不支持 IE11 |

### 代码对比

```javascript
// Vue 2
const vm = new Vue({
  data: {
    user: { name: 'Alice' }
  }
});

// ❌ 不会响应
vm.user.age = 25;
vm.$set(vm.user, 'age', 25);  // ✅ 需要 $set

// ❌ 不会响应
delete vm.user.name;
vm.$delete(vm.user, 'name');  // ✅ 需要 $delete

// Vue 3
const state = reactive({
  user: { name: 'Alice' }
});

// ✅ 直接响应
state.user.age = 25;

// ✅ 直接响应
delete state.user.name;
```

---

## 6. 常见面试题

::: details 题目1: Vue 如何检测数组变化?
<details>
<summary>点击查看答案</summary>

**Vue 2 的处理**:
1. 重写了数组的 7 个变更方法:`push`、`pop`、`shift`、`unshift`、`splice`、`sort`、`reverse`
2. 通过修改数组原型链,指向重写后的方法
3. 在重写的方法中:
   - 调用原生数组方法
   - 对新增元素进行响应式处理
   - 触发视图更新

**Vue 3 的处理**:
- 使用 Proxy 直接代理数组,所有操作都能检测到
- 包括索引访问、length 修改等

**最佳实践**:
```javascript
// Vue 2
this.arr.push(item);        // ✅
this.arr[0] = item;         // ❌
this.$set(this.arr, 0, item); // ✅

// Vue 3
arr.value.push(item);       // ✅
arr.value[0] = item;        // ✅
```
:::

</details>

::: details 题目2: 为什么 Vue 3 要用 Proxy 替代 Object.defineProperty?
<details>
<summary>点击查看答案</summary>

**Proxy 的优势**:

1. **可以监听整个对象**,而不是单个属性
2. **支持动态属性**的添加和删除
3. **支持数组索引**和 length 属性
4. **支持 Map、Set** 等数据结构
5. **性能更好**,懒代理(访问时才代理),不需要递归遍历
6. 有**13种拦截方法**,功能更强大

**Object.defineProperty 的局限**:
1. 只能监听已存在的属性
2. 需要递归遍历所有属性
3. 数组索引和 length 无法监听
4. 对象新增/删除属性无法监听

**代码示例**:
```javascript
// Object.defineProperty - 初始化时递归
function observe(obj) {
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key]);
    if (typeof obj[key] === 'object') {
      observe(obj[key]);  // 递归!
    }
  });
}

// Proxy - 访问时才代理
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      const result = Reflect.get(target, key);
      if (typeof result === 'object') {
        return reactive(result);  // 懒代理!
      }
      return result;
    }
  });
}
```
:::

</details>

::: details 题目3: 什么是依赖收集?
<details>
<summary>点击查看答案</summary>

**官方定义**:
依赖收集是指在**读取数据(getter)**时,记录哪些地方用到了这个数据;当**数据变化(setter)**时,通知这些地方进行更新。

**流程**:
1. **数据读取**: 触发 getter → 将当前的 Watcher 收集到 Dep
2. **数据修改**: 触发 setter → 遍历 Dep 中的 Watcher → 执行更新

**代码示例**:
```javascript
// 1. 渲染时读取数据
<template>
  <div>{{ message }}</div>
</template>

// 2. 触发 message 的 getter
// 3. 收集当前组件的 render Watcher

// 4. 修改数据
this.message = 'new value';

// 5. 触发 message 的 setter
// 6. 通知 render Watcher
// 7. 组件重新渲染
```

**依赖收集的三个核心角色**:
- **Observer**: 数据劫持,给数据添加 getter/setter
- **Dep**: 依赖收集器,管理 Watcher
- **Watcher**: 观察者,数据变化时执行回调
:::

---

</details>

## 总结

::: details 核心要点
1. Vue 2 使用 `Object.defineProperty`,有诸多限制
2. Vue 3 使用 `Proxy`,解决了所有限制,性能更好
3. 响应式核心是**数据劫持 + 观察者模式**
4. 依赖收集发生在 getter,派发更新发生在 setter
:::

::: details 面试加分项
- 能手写简易的响应式系统
- 理解 Proxy 的 13 种拦截操作
- 了解 Vue 3 的 ref、reactive、computed 实现
- 知道响应式的性能优化（shallowRef、shallowReactive、markRaw）
- 掌握高级 API：toRaw、triggerRef、customRef、effectScope
- 理解工具函数：isRef、isReactive、toRef、toRefs、unref
- 理解 Vue 2 到 Vue 3 的升级动机

---
:::

## 高频面试题

::: details 面试题1: Vue 2 和 Vue 3 响应式原理的区别?
#### 一句话答案
Vue 2 使用 Object.defineProperty 劫持属性,Vue 3 使用 Proxy 代理整个对象,解决了动态属性、数组索引等监听问题。

#### 详细解答

**核心区别**:

| 维度 | Vue 2 | Vue 3 |
|------|-------|-------|
| **实现方式** | Object.defineProperty | Proxy + Reflect |
| **监听粒度** | 属性级别 | 对象级别 |
| **初始化** | 递归遍历所有属性 | 懒代理(访问时才代理) |
| **动态属性** | 不支持,需要 $set | 原生支持 |
| **删除属性** | 不支持,需要 $delete | 原生支持 |
| **数组索引** | 不支持,重写数组方法 | 原生支持 |
| **性能** | 初始化慢,运行时快 | 初始化快,整体性能好 |
| **兼容性** | IE9+ | 不支持 IE11 |

**代码对比**:

```javascript
// Vue 2 - Object.defineProperty
function defineReactive(obj, key, val) {
  Object.defineProperty(obj, key, {
    get() {
      console.log(`读取 ${key}`);
      return val;
    },
    set(newVal) {
      console.log(`设置 ${key}: ${newVal}`);
      val = newVal;
    }
  });
}

const data = { count: 0 };
defineReactive(data, 'count', 0);

data.count = 1;        // ✅ 可以监听
data.newProp = 'new';  // ❌ 无法监听!需要 Vue.set

// Vue 3 - Proxy
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      console.log(`读取 ${key}`);
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      console.log(`设置 ${key}: ${value}`);
      return Reflect.set(target, key, value);
    },
    deleteProperty(target, key) {
      console.log(`删除 ${key}`);
      return Reflect.deleteProperty(target, key);
    }
  });
}

const state = reactive({ count: 0 });

state.count = 1;        // ✅ 可以监听
state.newProp = 'new';  // ✅ 可以监听!
delete state.count;     // ✅ 可以监听删除!
```

**数组处理对比**:

```javascript
// Vue 2 - 重写数组方法
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);

['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']
  .forEach(method => {
    arrayMethods[method] = function(...args) {
      const result = arrayProto[method].apply(this, args);
      console.log(`数组方法 ${method} 被调用`);
      return result;
    };
  });

const arr = [1, 2, 3];
arr.__proto__ = arrayMethods;

arr.push(4);   // ✅ 可以监听
arr[0] = 100;  // ❌ 无法监听索引变化!

// Vue 3 - 直接代理数组
const arr3 = reactive([1, 2, 3]);

arr3.push(4);   // ✅ 可以监听
arr3[0] = 100;  // ✅ 可以监听索引变化!
arr3.length = 0; // ✅ 可以监听 length 变化!
```

#### 面试口语化回答

> "Vue 2 和 Vue 3 最大的区别就是响应式实现方式不同。"
>
> "Vue 2 用的是 Object.defineProperty,它的问题是只能监听已经存在的属性。比如你给对象新增一个属性,或者直接修改数组的索引,Vue 2 是监听不到的,所以需要用 Vue.set 或者 $set 这些 API。而且 Vue 2 在初始化的时候需要递归遍历所有属性,给每个属性都加上 getter 和 setter,数据量大的时候会比较慢。"
>
> "Vue 3 改用 Proxy,它是代理整个对象,不管你是新增属性、删除属性、还是修改数组索引,都能监听到。而且 Proxy 是懒代理,只有在访问到深层对象的时候才会去代理它,初始化性能好很多。"
>
> "简单说就是:Vue 2 是属性劫持,Vue 3 是对象代理,功能更强性能更好。唯一的缺点是 Proxy 不支持 IE。"

---
:::

::: details 面试题2: Object.defineProperty 和 Proxy 的区别?
#### 一句话答案
Object.defineProperty 只能劫持对象属性,Proxy 可以代理整个对象并拦截 13 种操作,功能更强大。

#### 详细解答

**能力对比**:

| 特性 | Object.defineProperty | Proxy |
|------|----------------------|-------|
| 监听对象 | 需要遍历每个属性 | 直接代理整个对象 |
| 新增属性 | ❌ 监听不到 | ✅ 可以监听 |
| 删除属性 | ❌ 监听不到 | ✅ 可以监听(deleteProperty) |
| 数组索引 | ❌ 监听不到 | ✅ 可以监听 |
| 数组 length | ❌ 监听不到 | ✅ 可以监听 |
| 对象遍历 | ❌ 监听不到 | ✅ 可以监听(ownKeys) |
| 拦截方法数 | 2 个(get/set) | 13 个 |
| 兼容性 | IE9+ | 不支持 IE,无法 polyfill |
| 性能 | 初始化慢 | 运行时慢,但整体好 |

**Proxy 的 13 种拦截操作**:

```javascript
const handler = {
  // 1. 属性读取
  get(target, key, receiver) {
    console.log(`读取 ${key}`);
    return Reflect.get(target, key, receiver);
  },

  // 2. 属性设置
  set(target, key, value, receiver) {
    console.log(`设置 ${key} = ${value}`);
    return Reflect.set(target, key, value, receiver);
  },

  // 3. in 操作符
  has(target, key) {
    console.log(`检查 ${key} 是否存在`);
    return Reflect.has(target, key);
  },

  // 4. delete 操作符
  deleteProperty(target, key) {
    console.log(`删除 ${key}`);
    return Reflect.deleteProperty(target, key);
  },

  // 5. Object.getOwnPropertyNames()
  ownKeys(target) {
    console.log('获取所有属性');
    return Reflect.ownKeys(target);
  },

  // 6. Object.getOwnPropertyDescriptor()
  getOwnPropertyDescriptor(target, key) {
    return Reflect.getOwnPropertyDescriptor(target, key);
  },

  // 7. Object.defineProperty()
  defineProperty(target, key, descriptor) {
    return Reflect.defineProperty(target, key, descriptor);
  },

  // 8. Object.preventExtensions()
  preventExtensions(target) {
    return Reflect.preventExtensions(target);
  },

  // 9. Object.getPrototypeOf()
  getPrototypeOf(target) {
    return Reflect.getPrototypeOf(target);
  },

  // 10. Object.isExtensible()
  isExtensible(target) {
    return Reflect.isExtensible(target);
  },

  // 11. Object.setPrototypeOf()
  setPrototypeOf(target, proto) {
    return Reflect.setPrototypeOf(target, proto);
  },

  // 12. 函数调用
  apply(target, thisArg, args) {
    return Reflect.apply(target, thisArg, args);
  },

  // 13. new 操作符
  construct(target, args) {
    return Reflect.construct(target, args);
  }
};

const obj = new Proxy({}, handler);
```

**实际应用对比**:

```javascript
// Object.defineProperty - 局限性示例
const data = {};

Object.defineProperty(data, 'name', {
  get() {
    console.log('读取 name');
    return this._name;
  },
  set(value) {
    console.log('设置 name:', value);
    this._name = value;
  }
});

data.name = 'Alice';  // ✅ 触发 setter
data.age = 25;        // ❌ 新属性,无法监听
delete data.name;     // ❌ 删除操作,无法监听

// Proxy - 功能完整示例
const state = new Proxy({}, {
  get(target, key) {
    console.log('读取', key);
    return target[key];
  },
  set(target, key, value) {
    console.log('设置', key, '=', value);
    target[key] = value;
    return true;
  },
  deleteProperty(target, key) {
    console.log('删除', key);
    delete target[key];
    return true;
  }
});

state.name = 'Alice';  // ✅ 触发 set
state.age = 25;        // ✅ 触发 set(新属性也能监听)
delete state.name;     // ✅ 触发 deleteProperty
console.log('age' in state); // ✅ 可以拦截 has
```

**性能对比**:

```javascript
// Object.defineProperty - 初始化时递归
function observeDefineProperty(obj) {
  Object.keys(obj).forEach(key => {
    let value = obj[key];

    // 递归处理嵌套对象
    if (typeof value === 'object') {
      observeDefineProperty(value);
    }

    Object.defineProperty(obj, key, {
      get() {
        return value;
      },
      set(newVal) {
        if (typeof newVal === 'object') {
          observeDefineProperty(newVal);
        }
        value = newVal;
      }
    });
  });
}

// Proxy - 懒代理(访问时才代理)
function observeProxy(obj) {
  return new Proxy(obj, {
    get(target, key) {
      const value = target[key];

      // 只有访问到才代理
      if (typeof value === 'object' && value !== null) {
        return observeProxy(value);
      }

      return value;
    },
    set(target, key, value) {
      target[key] = value;
      return true;
    }
  });
}

// 性能测试
const deepObj = {
  level1: {
    level2: {
      level3: {
        level4: { data: 'value' }
      }
    }
  }
};

// defineProperty: 初始化时遍历所有层级
console.time('defineProperty');
observeDefineProperty(deepObj);
console.timeEnd('defineProperty');
// 输出: defineProperty: 2.5ms

// Proxy: 只有访问时才代理
console.time('proxy');
const proxyObj = observeProxy(deepObj);
console.timeEnd('proxy');
// 输出: proxy: 0.1ms (快很多!)
```

#### 面试口语化回答

> "Object.defineProperty 和 Proxy 最大的区别就是监听能力。"
>
> "Object.defineProperty 只能监听对象的某个属性,所以 Vue 2 需要遍历对象的每个属性去添加 getter 和 setter。而且它监听不到新增属性、删除属性、数组索引这些操作。"
>
> "Proxy 是代理整个对象,它有 13 种拦截方法,不管是读取、设置、删除、遍历,甚至 in 操作符都能拦截到。所以 Vue 3 才能做到对新增属性、数组索引的监听。"
>
> "性能上,Proxy 也更好。Object.defineProperty 需要在初始化的时候递归遍历所有属性,数据量大会很慢。Proxy 是懒代理,只有真正访问到的时候才去代理,初始化很快。"
>
> "唯一的问题是 Proxy 是 ES6 的 API,不支持 IE,而且没办法用 polyfill 模拟,这也是为什么 Vue 3 放弃了 IE 支持。"

---
:::

::: details 面试题3: Vue 3 的 ref 和 reactive 有什么区别?
#### 一句话答案
ref 用于基本类型和单一值,通过 .value 访问;reactive 用于对象,直接访问属性,但不能整体替换。

#### 详细解答

**核心区别**:

| 特性 | ref | reactive |
|------|-----|----------|
| **适用类型** | 任何类型(基本类型、对象) | 只能是对象/数组 |
| **访问方式** | 需要 .value | 直接访问属性 |
| **模板中** | 自动解包,不需要 .value | 直接使用 |
| **重新赋值** | ✅ 可以整体替换 | ❌ 会失去响应式 |
| **原理** | 通过 getter/setter | 通过 Proxy |
| **深层响应** | ✅ 默认深层响应 | ✅ 默认深层响应 |
| **解构** | ✅ 可以解构(需要 toRefs) | ❌ 解构后失去响应式 |

**基本使用**:

```javascript
import { ref, reactive } from 'vue';

// ref - 基本类型
const count = ref(0);
console.log(count.value);  // 0
count.value++;             // 修改需要 .value

// ref - 对象类型
const user = ref({ name: 'Alice', age: 25 });
console.log(user.value.name);  // Alice
user.value.age++;              // 修改需要 .value

// reactive - 对象类型
const state = reactive({ name: 'Alice', age: 25 });
console.log(state.name);  // Alice (不需要 .value)
state.age++;              // 直接修改

// reactive - 数组
const list = reactive([1, 2, 3]);
list.push(4);       // ✅
list[0] = 100;      // ✅
```

**重新赋值的区别**:

```javascript
// ref - 可以整体替换
const user = ref({ name: 'Alice' });

// ✅ 整体替换,保持响应式
user.value = { name: 'Bob', age: 30 };

// reactive - 不能整体替换
let state = reactive({ name: 'Alice' });

// ❌ 失去响应式!
state = { name: 'Bob', age: 30 };  // 错误!

// ✅ 正确做法:逐个修改属性
state.name = 'Bob';
state.age = 30;

// ✅ 或者用 Object.assign
Object.assign(state, { name: 'Bob', age: 30 });
```

**模板中的使用**:

```vue
<script setup>
import { ref, reactive } from 'vue';

const count = ref(0);
const state = reactive({ message: 'Hello' });

function increment() {
  count.value++;  // JS 中需要 .value
}
</script>

<template>
  <!-- 模板中 ref 自动解包,不需要 .value -->
  <div>{{ count }}</div>
  <button @click="count++">+1</button>

  <!-- reactive 直接使用 -->
  <div>{{ state.message }}</div>
  <button @click="state.message = 'Hi'">Change</button>
</template>
```

**解构的区别**:

```javascript
import { ref, reactive, toRefs } from 'vue';

// ref - 可以解构(配合 toRefs)
const user = reactive({
  name: 'Alice',
  age: 25
});

// ❌ 直接解构,失去响应式
const { name, age } = user;
name = 'Bob';  // 不会触发更新

// ✅ 使用 toRefs 解构
const { name, age } = toRefs(user);
name.value = 'Bob';  // ✅ 触发更新

// ref 本身可以直接传递
const count = ref(0);
function useCount() {
  return count;  // ✅ 保持响应式
}
```

**实现原理对比**:

```javascript
// ref 的简化实现
function ref(value) {
  const wrapper = {
    _value: value,

    get value() {
      track(wrapper, 'value');  // 依赖收集
      return this._value;
    },

    set value(newValue) {
      this._value = newValue;
      trigger(wrapper, 'value');  // 触发更新
    }
  };

  return wrapper;
}

// reactive 的简化实现
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key);
      return Reflect.get(target, key, receiver);
    },

    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key);
      return result;
    }
  });
}
```

**选择建议**:

```javascript
// ✅ 基本类型用 ref
const count = ref(0);
const message = ref('Hello');
const isLoading = ref(false);

// ✅ 对象用 reactive(不需要 .value)
const state = reactive({
  user: { name: 'Alice' },
  settings: { theme: 'dark' }
});

// ✅ 需要整体替换用 ref
const userList = ref([]);
// 重新赋值
userList.value = await fetchUsers();

// ❌ 不推荐:对象用 ref(需要多写 .value)
const user = ref({ name: 'Alice' });
user.value.name = 'Bob';  // 多了一层 .value

// ✅ Composition API 函数返回时
function useCounter() {
  const count = ref(0);
  const increment = () => count.value++;

  // ref 可以直接返回,保持响应式
  return { count, increment };
}

function useState() {
  const state = reactive({ count: 0 });

  // reactive 需要 toRefs 才能解构
  return { ...toRefs(state) };
}
```

#### 面试口语化回答

> "ref 和 reactive 都是 Vue 3 创建响应式数据的 API,但使用场景不同。"
>
> "ref 主要用于基本类型,比如数字、字符串、布尔值。它通过一个对象包装,所以访问和修改都需要 .value。不过在模板中会自动解包,不需要写 .value。ref 还有个好处是可以整体替换,比如 count.value = 10 这样。"
>
> "reactive 用于对象和数组,它是用 Proxy 代理的,所以直接访问属性就行,不需要 .value。但是它不能整体替换,如果你直接给 reactive 的变量重新赋值,会失去响应式。"
>
> "简单说,基本类型用 ref,对象用 reactive。如果对象需要整体替换,也用 ref。我一般的做法是,Composition API 的 hook 返回值都用 ref,因为可以直接解构,不会失去响应式。"

---
:::

::: details 面试题4: computed 和 watch 的区别?
#### 一句话答案
computed 有缓存,依赖不变不重新计算,用于计算派生值;watch 无缓存,用于执行副作用操作。

#### 详细解答

**核心区别**:

| 特性 | computed | watch |
|------|----------|-------|
| **用途** | 计算派生值 | 执行副作用(异步、DOM 操作) |
| **缓存** | ✅ 有缓存,依赖不变不重算 | ❌ 无缓存,每次都执行 |
| **返回值** | 必须有返回值 | 无返回值 |
| **支持异步** | ❌ 不支持 | ✅ 支持 |
| **立即执行** | ✅ 创建时立即计算 | ❌ 默认不执行(可配置) |
| **多个依赖** | ✅ 自动收集 | ✅ 可以监听多个源 |
| **场景** | 数据转换、过滤、计算 | API 调用、本地存储、日志 |

**基本使用**:

```javascript
import { ref, computed, watch } from 'vue';

// computed - 计算派生值
const firstName = ref('Zhang');
const lastName = ref('San');

// 自动收集依赖,有缓存
const fullName = computed(() => {
  console.log('computed 执行');
  return `${firstName.value} ${lastName.value}`;
});

console.log(fullName.value);  // computed 执行 → Zhang San
console.log(fullName.value);  // 直接返回缓存 → Zhang San
firstName.value = 'Li';       // 触发重新计算
console.log(fullName.value);  // computed 执行 → Li San

// watch - 执行副作用
const count = ref(0);

watch(count, (newValue, oldValue) => {
  console.log('watch 执行');
  console.log(`count 从 ${oldValue} 变成 ${newValue}`);

  // 可以执行异步操作
  if (newValue > 10) {
    fetch('/api/log', {
      method: 'POST',
      body: JSON.stringify({ count: newValue })
    });
  }
});

count.value = 1;  // watch 执行 → count 从 0 变成 1
count.value = 2;  // watch 执行 → count 从 1 变成 2
```

**缓存机制对比**:

```javascript
// computed - 有缓存
const count = ref(1);

const double = computed(() => {
  console.log('computed 计算');
  return count.value * 2;
});

// 多次访问,只计算一次
console.log(double.value);  // computed 计算 → 2
console.log(double.value);  // 2 (使用缓存,不计算)
console.log(double.value);  // 2 (使用缓存,不计算)

// 依赖变化,重新计算
count.value = 2;
console.log(double.value);  // computed 计算 → 4

// watch - 无缓存,每次都执行
watch(count, () => {
  console.log('watch 执行');
});

count.value = 3;  // watch 执行
count.value = 4;  // watch 执行
count.value = 5;  // watch 执行
```

**复杂场景对比**:

```javascript
import { ref, computed, watch } from 'vue';

// 场景1: 数据过滤和计算 → 用 computed
const list = ref([
  { name: 'Apple', price: 10, stock: 5 },
  { name: 'Banana', price: 5, stock: 0 },
  { name: 'Orange', price: 8, stock: 3 }
]);

const keyword = ref('');

// ✅ computed:计算过滤后的列表
const filteredList = computed(() => {
  return list.value.filter(item =>
    item.name.toLowerCase().includes(keyword.value.toLowerCase())
  );
});

// ✅ computed:计算总价
const totalPrice = computed(() => {
  return filteredList.value.reduce((sum, item) =>
    sum + item.price * item.stock, 0
  );
});

// 场景2: 副作用操作 → 用 watch
const userId = ref(1);
const userInfo = ref(null);

// ✅ watch:异步获取数据
watch(userId, async (newId) => {
  const response = await fetch(`/api/user/${newId}`);
  userInfo.value = await response.json();
});

// ✅ watch:本地存储同步
const settings = ref({ theme: 'dark', lang: 'zh' });

watch(settings, (newSettings) => {
  localStorage.setItem('settings', JSON.stringify(newSettings));
}, { deep: true });  // 深度监听

// ✅ watch:日志记录
const errorCount = ref(0);

watch(errorCount, (newCount) => {
  if (newCount > 5) {
    console.error('错误次数过多,发送告警');
    sendAlert({ type: 'error', count: newCount });
  }
});
```

**watch 的高级用法**:

```javascript
import { ref, watch, watchEffect } from 'vue';

const count = ref(0);
const message = ref('Hello');

// 1. 监听多个源
watch([count, message], ([newCount, newMsg], [oldCount, oldMsg]) => {
  console.log(`count: ${oldCount} → ${newCount}`);
  console.log(`message: ${oldMsg} → ${newMsg}`);
});

// 2. 立即执行
watch(count, (newValue) => {
  console.log('count:', newValue);
}, { immediate: true });  // 创建时立即执行一次

// 3. 深度监听
const state = ref({
  user: {
    name: 'Alice',
    profile: {
      age: 25
    }
  }
});

watch(state, (newValue) => {
  console.log('state 变化:', newValue);
}, { deep: true });  // 深度监听嵌套对象

state.value.user.profile.age = 26;  // 会触发 watch

// 4. watchEffect - 自动收集依赖
watchEffect(() => {
  // 自动追踪所有响应式依赖
  console.log(`count: ${count.value}, message: ${message.value}`);
});

count.value++;   // 触发 watchEffect
message.value = 'Hi';  // 触发 watchEffect

// 5. 停止监听
const stop = watch(count, () => {
  console.log('count:', count.value);
});

// 不再需要时停止
stop();
```

**computed 的高级用法**:

```javascript
import { ref, computed } from 'vue';

// 1. 可写的 computed
const firstName = ref('Zhang');
const lastName = ref('San');

const fullName = computed({
  get() {
    return `${firstName.value} ${lastName.value}`;
  },
  set(value) {
    [firstName.value, lastName.value] = value.split(' ');
  }
});

console.log(fullName.value);  // Zhang San
fullName.value = 'Li Si';     // 触发 setter
console.log(firstName.value); // Li
console.log(lastName.value);  // Si

// 2. 计算属性链
const count = ref(1);
const double = computed(() => count.value * 2);
const quadruple = computed(() => double.value * 2);

console.log(quadruple.value);  // 4
count.value = 2;
console.log(quadruple.value);  // 8

// 3. 避免副作用
// ❌ 不要在 computed 中执行副作用
const bad = computed(() => {
  console.log('这是副作用!');  // 不推荐
  fetch('/api/data');           // 不推荐
  return count.value * 2;
});

// ✅ 副作用用 watch
watch(count, () => {
  console.log('这是副作用');
  fetch('/api/data');
});
```

**使用场景总结**:

```javascript
// ✅ 用 computed 的场景
const list = ref([1, 2, 3, 4, 5]);

// 1. 数据过滤
const evenNumbers = computed(() => list.value.filter(n => n % 2 === 0));

// 2. 数据转换
const doubledList = computed(() => list.value.map(n => n * 2));

// 3. 数据聚合
const sum = computed(() => list.value.reduce((a, b) => a + b, 0));

// 4. 格式化
const price = ref(12345.67);
const formattedPrice = computed(() => `¥${price.value.toFixed(2)}`);

// ✅ 用 watch 的场���
// 1. 异步请求
watch(userId, async (id) => {
  const data = await fetchUser(id);
  userInfo.value = data;
});

// 2. 本地存储
watch(settings, (newSettings) => {
  localStorage.setItem('settings', JSON.stringify(newSettings));
}, { deep: true });

// 3. 路由跳转
watch(errorMessage, (msg) => {
  if (msg) {
    router.push('/error');
  }
});

// 4. DOM 操作
watch(isModalOpen, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});
```

#### 面试口语化回答

> "computed 和 watch 最大的区别是使用场景不同。"
>
> "computed 是用来计算派生值的,比如你有一个列表,需要过滤或者求和,就用 computed。它有缓存机制,只要依赖的数据不变,就不会重新计算,直接返回缓存结果,性能很好。而且 computed 必须有返回值,不能执行异步操作。"
>
> "watch 是用来执行副作用的,比如发请求、操作 DOM、写本地存储这些。它没有缓存,每次数据变化都会执行。watch 支持异步操作,可以在里面写 async/await,还可以配置 immediate 立即执行,或者 deep 深度监听对象。"
>
> "简单记就是:数据计算用 computed,副作用操作用 watch。我一般的原则是,能用 computed 就不用 watch,因为 computed 有缓存性能更好。"

---
:::

::: details 面试题5: 为什么 Vue 3 要用 Proxy 替代 Object.defineProperty?
#### 一句话答案
Proxy 功能更强、性能更好,解决了 Vue 2 无法监听动态属性、数组索引等问题,是 Vue 3 响应式重构的核心。

#### 详细解答

**Vue 2 的痛点**:

```javascript
// Vue 2 的限制
const vm = new Vue({
  data: {
    user: { name: 'Alice' },
    list: [1, 2, 3]
  }
});

// 问题1: 无法检测对象属性的添加
vm.user.age = 25;  // ❌ 不会触发更新
vm.$set(vm.user, 'age', 25);  // ✅ 需要用 $set

// 问题2: 无法检测对象属性的删除
delete vm.user.name;  // ❌ 不会触发更新
vm.$delete(vm.user, 'name');  // ✅ 需要用 $delete

// 问题3: 无法检测数组索引和长度变化
vm.list[0] = 100;  // ❌ 不会触发更新
vm.list.length = 0;  // ❌ 不会触发更新
vm.$set(vm.list, 0, 100);  // ✅ 需要用 $set

// 问题4: 初始化性能差
const bigData = {
  level1: { level2: { level3: { /* ... */ } } }
};
// 初始化时需要递归遍历所有属性,数据量大时很慢
new Vue({ data: bigData });
```

**Proxy 的优势**:

**1. 监听整个对象,不是单个属性**

```javascript
// Object.defineProperty - 需要遍历每个属性
function observe(obj) {
  Object.keys(obj).forEach(key => {
    let value = obj[key];

    Object.defineProperty(obj, key, {
      get() {
        console.log(`读取 ${key}`);
        return value;
      },
      set(newValue) {
        console.log(`设置 ${key}`);
        value = newValue;
      }
    });
  });
}

const data = { name: 'Alice', age: 25 };
observe(data);
data.name;  // 读取 name
data.gender = 'female';  // ❌ 新属性,监听不到!

// Proxy - 代理整个对象
const state = new Proxy({ name: 'Alice', age: 25 }, {
  get(target, key) {
    console.log(`读取 ${key}`);
    return target[key];
  },
  set(target, key, value) {
    console.log(`设置 ${key}`);
    target[key] = value;
    return true;
  }
});

state.name;  // 读取 name
state.gender = 'female';  // ✅ 可以监听到新属性!
```

**2. 支持 13 种拦截操作**

```javascript
const handler = {
  // 属性读取
  get(target, key) {
    console.log(`get ${key}`);
    return target[key];
  },

  // 属性设置
  set(target, key, value) {
    console.log(`set ${key} = ${value}`);
    target[key] = value;
    return true;
  },

  // 属性删除 (Object.defineProperty 做不到)
  deleteProperty(target, key) {
    console.log(`delete ${key}`);
    delete target[key];
    return true;
  },

  // in 操作符 (Object.defineProperty 做不到)
  has(target, key) {
    console.log(`${key} in object`);
    return key in target;
  },

  // Object.keys() (Object.defineProperty 做不到)
  ownKeys(target) {
    console.log('get keys');
    return Object.keys(target);
  }

  // 还有 apply, construct 等共 13 种
};

const obj = new Proxy({}, handler);

obj.name = 'Alice';     // set name = Alice
delete obj.name;        // delete name
'name' in obj;          // name in object
Object.keys(obj);       // get keys
```

**3. 完美支持数组**

```javascript
// Object.defineProperty - 数组索引无法监听
const arr = [1, 2, 3];

// 只能监听数组本身
Object.defineProperty(arr, 'push', {
  value: function(...items) {
    console.log('push 被调用');
    return Array.prototype.push.apply(this, items);
  }
});

arr.push(4);   // ✅ push 被调用
arr[0] = 100;  // ❌ 索引变化,监听不到
arr.length = 0;  // ❌ length 变化,监听不到

// Proxy - 完美支持数组
const arr2 = new Proxy([1, 2, 3], {
  get(target, key) {
    console.log(`get ${key}`);
    return target[key];
  },
  set(target, key, value) {
    console.log(`set ${key} = ${value}`);
    target[key] = value;
    return true;
  }
});

arr2.push(4);     // set 3 = 4, set length = 4
arr2[0] = 100;    // set 0 = 100
arr2.length = 0;  // set length = 0
```

**4. 懒代理,性能更好**

```javascript
// Object.defineProperty - 初始化时递归
function observeDefineProperty(obj) {
  // 遍历所有属性
  Object.keys(obj).forEach(key => {
    let value = obj[key];

    // 递归处理嵌套对象
    if (typeof value === 'object') {
      observeDefineProperty(value);  // 立即递归!
    }

    Object.defineProperty(obj, key, {
      get() { return value; },
      set(newValue) { value = newValue; }
    });
  });
}

// 初始化时就要遍历所有层级
const data = {
  level1: {
    level2: {
      level3: {
        level4: { value: 'data' }
      }
    }
  }
};

console.time('init');
observeDefineProperty(data);
console.timeEnd('init');
// init: 2.5ms (深层对象会更慢)

// Proxy - 访问时才代理 (懒代理)
function observeProxy(obj) {
  return new Proxy(obj, {
    get(target, key) {
      const value = target[key];

      // 只有访问到才代理
      if (typeof value === 'object' && value !== null) {
        return observeProxy(value);  // 懒代理!
      }

      return value;
    },
    set(target, key, value) {
      target[key] = value;
      return true;
    }
  });
}

console.time('init');
const state = observeProxy(data);
console.timeEnd('init');
// init: 0.1ms (快很多!)

// 只有访问到 level3 时,才会代理 level3
state.level1.level2.level3.level4.value;
```

**5. 支持 Map、Set 等数据结构**

```javascript
// Vue 2 - 不支持 Map/Set
const vm = new Vue({
  data: {
    map: new Map([['a', 1], ['b', 2]])
  }
});

vm.map.set('c', 3);  // ❌ 不会触发更新
vm.map.delete('a');  // ❌ 不会触发更新

// Vue 3 - 支持 Map/Set
const state = reactive({
  map: new Map([['a', 1], ['b', 2]]),
  set: new Set([1, 2, 3])
});

state.map.set('c', 3);  // ✅ 触发更新
state.set.add(4);       // ✅ 触发更新
```

**Vue 3 为什么必须用 Proxy**:

```javascript
// 1. Composition API 需要更灵活的响应式
function useCounter() {
  const count = ref(0);
  const double = computed(() => count.value * 2);

  // 返回的对象需要动态添加属性
  const result = { count, double };

  // Vue 2 会丢失响应式,Vue 3 用 Proxy 可以
  result.triple = computed(() => count.value * 3);

  return result;
}

// 2. 更好的 TypeScript 支持
// Proxy 可以保留原始对象的类型
const state = reactive<{ name: string; age?: number }>({
  name: 'Alice'
});

state.age = 25;  // ✅ TypeScript 类型正确

// 3. 性能优化
// 大数据量时,Proxy 的懒代理性能好很多
const bigList = reactive(Array(10000).fill({ /* ... */ }));

// 4. 更符合 JavaScript 标准
// Proxy 是 ES6 标准 API,未来会持续优化
```

**唯一的缺点: 浏览器兼容性**

```javascript
// Proxy 无法被 polyfill
// 因为它是底层语言特性,无法用 JavaScript 模拟

// 支持:
// Chrome 49+
// Firefox 18+
// Safari 10+
// Edge 12+

// 不支持:
// IE 11 及以下 (无法兼容)

// 这也是 Vue 3 放弃 IE 支持的原因
```

#### 面试口语化回答

> "Vue 3 用 Proxy 替代 Object.defineProperty 主要是为了解决 Vue 2 的几个痛点。"
>
> "第一是功能问题。Object.defineProperty 只能监听对象已有的属性,所以 Vue 2 没办法检测到新增属性、删除属性、数组索引变化,只能用 $set 和 $delete 这些 API 来补救。Proxy 是代理整个对象,不管你是新增、删除还是修改,都能监听到,还支持 Map、Set 这些新的数据结构。"
>
> "第二是性能问题。Object.defineProperty 需要在初始化的时候递归遍历所有属性,给每个属性加 getter 和 setter,数据量大的时候初始化很慢。Proxy 是懒代理,只有在访问到深层对象的时候才去代理它,初始化性能好很多。"
>
> "第三是 API 能力。Proxy 有 13 种拦截操作,不只是 get 和 set,还能拦截 delete、in 操作符、Object.keys 这些,功能强大得多。"
>
> "唯一的问题就是 Proxy 不支持 IE,而且没办法用 polyfill 兼容,所以 Vue 3 彻底放弃了 IE 支持。但从长远看,用 Proxy 是正确的选择,它更符合现代 JavaScript 的标准,性能和功能都更好。"
:::
