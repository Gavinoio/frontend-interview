# 微前端框架对比

## 主流微前端框架概览

| 框架 | 开发团队 | 核心原理 | 优点 | 缺点 |
|------|---------|---------|------|------|
| qiankun | 蚂蚁金服 | single-spa + sandbox | 成熟稳定、社区活跃 | 配置繁琐、有侵入性 |
| wujie 无界 | 腾讯 | WebComponent + iframe | 原生隔离、性能好 | 较新、社区小 |
| Micro App | 京东 | WebComponent | 接入简单、零依赖 | 隔离不如 wujie 彻底 |
| Module Federation | Webpack | 运行时加载 | 官方支持、共享依赖 | 技术栈限制 |

## qiankun vs wujie 详细对比

### 核心理念对比

```javascript
// qiankun 的核心理念：
// 基于 single-spa，通过 JS 沙箱实现隔离
// HTML Entry：通过 fetch 获取子应用 HTML，解析后执行

// wujie 的核心理念：
// 基于 WebComponent + iframe
// iframe 提供天然的 JS 隔离
// WebComponent 提供 DOM 隔离
// 通过 Proxy 实现 iframe 和主应用的通信
```

### 沙箱隔离方案对比

#### qiankun 沙箱

```javascript
// qiankun 提供三种沙箱：

// 1. SnapshotSandbox（快照沙箱）
// 适用于不支持 Proxy 的浏览器
class SnapshotSandbox {
  constructor() {
    this.snapshot = {};
    this.modifyPropsMap = {};
  }

  active() {
    // 激活时记录 window 快照
    for (const prop in window) {
      this.snapshot[prop] = window[prop];
    }
    // 恢复上次修改
    Object.keys(this.modifyPropsMap).forEach(prop => {
      window[prop] = this.modifyPropsMap[prop];
    });
  }

  inactive() {
    // 失活时对比差异并记录
    for (const prop in window) {
      if (window[prop] !== this.snapshot[prop]) {
        this.modifyPropsMap[prop] = window[prop];
        window[prop] = this.snapshot[prop];
      }
    }
  }
}

// 2. LegacySandbox（单例代理沙箱）
// 使用 Proxy 代理，但仍然操作真实 window
class LegacySandbox {
  constructor() {
    this.addedPropsMap = new Map();
    this.modifiedPropsMap = new Map();
    this.currentUpdatedPropsMap = new Map();

    const fakeWindow = Object.create(null);
    this.proxy = new Proxy(fakeWindow, {
      set: (target, prop, value) => {
        const originalValue = window[prop];
        if (!window.hasOwnProperty(prop)) {
          this.addedPropsMap.set(prop, value);
        } else if (!this.modifiedPropsMap.has(prop)) {
          this.modifiedPropsMap.set(prop, originalValue);
        }
        this.currentUpdatedPropsMap.set(prop, value);
        window[prop] = value;
        return true;
      },
      get: (target, prop) => {
        return window[prop];
      }
    });
  }
}

// 3. ProxySandbox（多例代理沙箱）
// 完全隔离，不污染真实 window
class ProxySandbox {
  constructor() {
    const fakeWindow = Object.create(null);
    this.proxy = new Proxy(fakeWindow, {
      set: (target, prop, value) => {
        target[prop] = value;
        return true;
      },
      get: (target, prop) => {
        // 优先从 fakeWindow 获取
        if (prop in target) {
          return target[prop];
        }
        // 否则从真实 window 获取
        const value = window[prop];
        return typeof value === 'function' ? value.bind(window) : value;
      },
      has: (target, prop) => {
        return prop in target || prop in window;
      }
    });
  }
}
```

#### wujie 沙箱

```javascript
// wujie 使用 iframe 实现天然隔离
// iframe 的 window 对象与主应用完全独立

// wujie 的创新点：
// 1. 使用 WebComponent 渲染 UI
// 2. JS 在 iframe 中执行
// 3. 通过 Proxy 同步 DOM 操作

// 简化的 wujie 原理
class WujieApp {
  constructor(name, url) {
    this.name = name;
    this.url = url;
    this.iframe = null;
    this.shadowRoot = null;
  }

  async start() {
    // 1. 创建 iframe 作为 JS 沙箱
    this.iframe = document.createElement('iframe');
    this.iframe.src = 'about:blank';
    document.body.appendChild(this.iframe);

    // 2. 创建 WebComponent 作为 DOM 容器
    const host = document.createElement('wujie-app');
    this.shadowRoot = host.attachShadow({ mode: 'open' });
    document.body.appendChild(host);

    // 3. 加载子应用资源
    const html = await fetch(this.url).then(res => res.text());
    const { scripts, styles, body } = this.parseHTML(html);

    // 4. 将样式和 DOM 放入 shadowRoot
    this.shadowRoot.innerHTML = body;
    styles.forEach(style => this.shadowRoot.appendChild(style));

    // 5. 在 iframe 中执行 JS
    scripts.forEach(script => {
      this.iframe.contentWindow.eval(script);
    });

    // 6. 代理 document 操作到 shadowRoot
    this.proxyDocument();
  }

  proxyDocument() {
    const iframeWindow = this.iframe.contentWindow;
    const shadowRoot = this.shadowRoot;

    // 代理 document.querySelector 等方法
    iframeWindow.document.querySelector = (selector) => {
      return shadowRoot.querySelector(selector);
    };

    iframeWindow.document.querySelectorAll = (selector) => {
      return shadowRoot.querySelectorAll(selector);
    };

    iframeWindow.document.getElementById = (id) => {
      return shadowRoot.getElementById(id);
    };
  }
}
```

### 隔离效果对比

| 隔离维度 | qiankun | wujie |
|---------|---------|-------|
| JS 全局变量 | Proxy 模拟（可能泄漏） | iframe 天然隔离 |
| 定时器 | 需要手动清理 | iframe 销毁自动清理 |
| 事件监听 | 需要手动清理 | iframe 销毁自动清理 |
| CSS 样式 | Shadow DOM / Scoped | Shadow DOM |
| DOM 操作 | 共享 document | 代理到 shadowRoot |
| 路由 | 劫持 history | iframe location |

### 接入成本对比

```javascript
// qiankun 接入 - 子应用需要改造

// 1. 导出生命周期
export async function bootstrap() {}
export async function mount(props) {
  render(props);
}
export async function unmount() {
  instance.$destroy();
}

// 2. 配置 webpack
module.exports = {
  output: {
    library: 'vueApp',
    libraryTarget: 'umd',
  }
};

// 3. 处理路由 base
const router = new VueRouter({
  base: window.__POWERED_BY_QIANKUN__ ? '/vue' : '/'
});
```

```javascript
// wujie 接入 - 子应用基本无需改造

// 主应用
import { startApp } from 'wujie';

startApp({
  name: 'vue-app',
  url: 'http://localhost:8080',
  el: '#container'
});

// 子应用只需配置跨域
// 无需导出生命周期
// 无需修改 webpack 配置
// 无需处理路由 base
```

### 性能对比

```javascript
// qiankun
// - 每次切换应用需要重新解析 HTML
// - JS 沙箱有一定性能开销
// - 支持预加载优化

// wujie
// - iframe 创建有一定开销
// - 但 iframe 可以复用（保活模式）
// - JS 执行性能接近原生

// wujie 保活模式
startApp({
  name: 'vue-app',
  url: 'http://localhost:8080',
  el: '#container',
  alive: true  // 保活模式，切换时不销毁
});
```

### 适用场景对比

| 场景 | 推荐方案 | 原因 |
|------|---------|------|
| 成熟稳定要求高 | qiankun | 社区成熟、案例多 |
| 隔离要求严格 | wujie | iframe 天然隔离 |
| 子应用改造成本高 | wujie | 接入侵入性小 |
| 需要共享依赖 | qiankun | 支持依赖共享 |
| 多实例运行 | wujie | 天然支持 |
| IE 兼容 | qiankun | wujie 不支持 IE |

## React vs Vue 对比

### 核心设计理念

```javascript
// React: 函数式、不可变数据、单向数据流
// "UI = f(state)"

function Counter() {
  const [count, setCount] = useState(0);
  // state 不可直接修改，必须通过 setCount
  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}

// Vue: 响应式、可变数据、双向绑定
// "数据驱动视图"

export default {
  data() {
    return { count: 0 };
  },
  template: \`
    <button @click="count++">{{ count }}</button>
  \`
  // count 可以直接修改
};
```

### 响应式原理

```javascript
// Vue 2: Object.defineProperty
function defineReactive(obj, key, val) {
  const dep = new Dep();

  Object.defineProperty(obj, key, {
    get() {
      if (Dep.target) {
        dep.depend();  // 收集依赖
      }
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      val = newVal;
      dep.notify();  // 通知更新
    }
  });
}

// Vue 3: Proxy
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key);  // 收集依赖
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key);  // 触发更新
      return result;
    }
  });
}

// React: 不可变数据 + 调度更新
function useState(initialState) {
  // 简化实现
  let state = initialState;
  const setState = (newState) => {
    state = newState;
    scheduleUpdate();  // 调度更新
  };
  return [state, setState];
}
```

### 组件通信对比

```javascript
// 父子通信

// React: props + callback
function Parent() {
  const [value, setValue] = useState('');
  return <Child value={value} onChange={setValue} />;
}

function Child({ value, onChange }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}

// Vue: props + emit
// 父组件
<Child :value="value" @update="value = $event" />
// 或使用 v-model
<Child v-model="value" />

// 子组件
props: ['value'],
emits: ['update'],
methods: {
  handleChange(e) {
    this.$emit('update', e.target.value);
  }
}
```

```javascript
// 跨层级通信

// React: Context
const ThemeContext = React.createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <DeepChild />
    </ThemeContext.Provider>
  );
}

function DeepChild() {
  const theme = useContext(ThemeContext);
  return <div>{theme}</div>;
}

// Vue: provide/inject
// 祖先组件
export default {
  provide() {
    return { theme: 'dark' };
  }
};

// 后代组件
export default {
  inject: ['theme'],
  template: '<div>{{ theme }}</div>'
};
```

### 状态管理对比

```javascript
// React: Redux / Zustand / Jotai

// Redux 示例
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    }
  }
});

// 组件中使用
function Counter() {
  const count = useSelector(state => state.counter.value);
  const dispatch = useDispatch();
  return (
    <button onClick={() => dispatch(increment())}>
      {count}
    </button>
  );
}

// Vue: Pinia / Vuex

// Pinia 示例
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++;
    }
  }
});

// 组件中使用
const store = useCounterStore();
// 直接访问和修改
store.count++;
store.increment();
```

### 生命周期对比

```javascript
// React 类组件生命周期
class MyComponent extends React.Component {
  constructor(props) {}           // 初始化
  componentDidMount() {}          // 挂载后
  componentDidUpdate() {}         // 更新后
  componentWillUnmount() {}       // 卸载前
  render() {}                     // 渲染
}

// React Hooks
function MyComponent() {
  useEffect(() => {
    // componentDidMount + componentDidUpdate
    return () => {
      // componentWillUnmount
    };
  }, [deps]);
}

// Vue 2 生命周期
export default {
  beforeCreate() {},   // 实例初始化
  created() {},        // 实例创建完成
  beforeMount() {},    // 挂载前
  mounted() {},        // 挂载后
  beforeUpdate() {},   // 更新前
  updated() {},        // 更新后
  beforeDestroy() {},  // 销毁前
  destroyed() {}       // 销毁后
};

// Vue 3 Composition API
import { onMounted, onUnmounted, onUpdated } from 'vue';

export default {
  setup() {
    onMounted(() => {});
    onUnmounted(() => {});
    onUpdated(() => {});
  }
};
```

### 性能优化对比

```javascript
// React 性能优化

// 1. memo 避免不必要的重渲染
const Child = React.memo(function Child({ data }) {
  return <div>{data}</div>;
});

// 2. useMemo 缓存计算结果
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// 3. useCallback 缓存函数
const handleClick = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// Vue 性能优化

// 1. 响应式自动追踪，无需手动优化
// 2. computed 自动缓存
const doubleCount = computed(() => count.value * 2);

// 3. v-once 只渲染一次
<span v-once>{{ staticValue }}</span>

// 4. v-memo 缓存模板片段 (Vue 3.2+)
<div v-memo="[item.id]">{{ item.name }}</div>
```

### 总结对比表

| 维度 | React | Vue |
|------|-------|-----|
| 核心理念 | 函数式、不可变 | 响应式、可变 |
| 学习曲线 | 较陡（需理解函数式） | 平缓（模板直观） |
| 灵活性 | 高（一切皆 JS） | 中（有约定限制） |
| 响应式 | 手动声明依赖 | 自动追踪依赖 |
| 模板 | JSX（JS 中写 HTML） | Template（HTML 增强） |
| 状态更新 | setState（不可变） | 直接修改（可变） |
| 社区生态 | 更大 | 在中国更流行 |
| 适用场景 | 大型复杂应用 | 中小型应用、快速开发 |

### 选型建议

```javascript
// 选择 React 的场景：
// 1. 团队熟悉函数式编程
// 2. 需要高度灵活性
// 3. 生态要求（如 React Native）
// 4. 大型复杂应用

// 选择 Vue 的场景：
// 1. 快速开发、原型验证
// 2. 团队新手较多
// 3. 中小型项目
// 4. 需要中文文档和社区支持
```

## 常见面试题

::: details 1. qiankun 和 wujie 的沙箱有什么区别？
```javascript
// qiankun：使用 Proxy 模拟隔离
// - 优点：性能好
// - 缺点：可能存在逃逸，需要手动清理定时器等

// wujie：使用 iframe 天然隔离
// - 优点：隔离彻底，自动清理
// - 缺点：iframe 有一定开销
```
:::

::: details 2. React 和 Vue 响应式的区别？
```javascript
// Vue：自动追踪依赖
// - 使用时自动收集依赖
// - 修改时自动触发更新
// - 开发者无需关心依赖

// React：手动声明依赖
// - useEffect/useMemo 需要手动声明依赖数组
// - 依赖变化时重新执行
// - 容易出现依赖遗漏问题
```
:::

::: details 3. 为什么 Vue 不需要 memo？
```javascript
// Vue 的响应式系统会精确追踪依赖
// 只有真正使用的数据变化时才会更新

// React 父组件更新，默认会重新渲染所有子组件
// 需要 memo/useMemo/useCallback 优化

// Vue 组件只有 props 真正变化时才重新渲染
// 因为 Vue 知道组件依赖了哪些数据
```
:::

::: details 4. 如何选择微前端方案？
```javascript
// 考虑因素：
// 1. 子应用改造成本 → wujie 更低
// 2. 隔离要求 → wujie 更彻底
// 3. 社区成熟度 → qiankun 更好
// 4. 浏览器兼容 → qiankun 支持 IE
// 5. 团队熟悉度 → 选熟悉的
```
:::
