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

