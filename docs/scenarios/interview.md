# 场景题面试题精选

> 汇总系统设计、大文件上传、虚拟列表、搜索建议、请求重试、前端监控等高频场景题。

## 系统设计

::: details 1. 如何设计一个前端监控系统？
**采集维度：**
- **性能监控**：FCP、LCP、CLS、TTFB（用 web-vitals 库）
- **错误监控**：JS 错误、Promise 未捕获、资源加载失败
- **用户行为**：PV/UV、点击、路由跳转、停留时长
- **接口监控**：请求耗时、错误率、慢请求

**上报策略：**
```javascript
// 优先用 sendBeacon（页面卸载时也能发送，不阻塞）
navigator.sendBeacon('/report', JSON.stringify(data));
// 降级用 fetch 或 Image 打点
new Image().src = `/report?data=${encodeURIComponent(JSON.stringify(data))}`;
```

**关键设计点：**
- 采样率控制（高流量时只上报 10%）
- 批量上报（积累一定数量再发送）
- 错误去重（相同错误只上报一次）
- Source Map 还原（上报压缩后的行列号，服务端还原）

---
:::

::: details 2. 如何设计一个通用的 HTTP 请求封装？
```javascript
class HttpClient {
    constructor(baseURL, options = {}) {
        this.baseURL = baseURL;
        this.interceptors = { request: [], response: [] };
        this.timeout = options.timeout || 10000;
    }

    // 请求拦截器（添加 token、loading 等）
    useRequest(fn) { this.interceptors.request.push(fn); }

    // 响应拦截器（统一错误处理、数据转换）
    useResponse(fn) { this.interceptors.response.push(fn); }

    async request(config) {
        // 执行请求拦截器
        let finalConfig = this.interceptors.request.reduce(
            (cfg, fn) => fn(cfg), { ...config, url: this.baseURL + config.url }
        );

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeout);

        try {
            let response = await fetch(finalConfig.url, {
                ...finalConfig,
                signal: controller.signal
            });
            // 执行响应拦截器
            return this.interceptors.response.reduce((res, fn) => fn(res), response);
        } finally {
            clearTimeout(timer);
        }
    }
}
```

---
:::

## 大文件上传

::: details 3. 大文件上传如何实现？
**核心方案：分片上传 + 断点续传**

```javascript
async function uploadLargeFile(file) {
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB 每片
    const fileHash = await calculateHash(file); // 文件内容 hash（用于秒传和续传）

    // 1. 询问服务端已上传哪些分片（断点续传）
    const { uploadedChunks } = await checkUploadStatus(fileHash);

    // 2. 切片
    const chunks = [];
    for (let i = 0; i < Math.ceil(file.size / CHUNK_SIZE); i++) {
        chunks.push(file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
    }

    // 3. 并发上传未上传的分片（控制并发数）
    const tasks = chunks
        .filter((_, i) => !uploadedChunks.includes(i))
        .map((chunk, i) => () => uploadChunk(chunk, fileHash, i));

    await concurrentLimit(tasks, 3); // 最多 3 个并发

    // 4. 通知服务端合并
    await mergeChunks(fileHash, chunks.length);
}
```

**秒传**：上传前先发送文件 hash，服务端已有则直接返回成功。

---
:::

## 虚拟列表

::: details 4. 虚拟列表的实现原理？
只渲染可视区域内的列表项，通过 padding 或 transform 撑开滚动区域。

```javascript
// 定高虚拟列表核心逻辑
function VirtualList({ items, itemHeight, containerHeight }) {
    const [scrollTop, setScrollTop] = useState(0);

    const startIndex = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount + 1, items.length);

    const visibleItems = items.slice(startIndex, endIndex);
    const offsetY = startIndex * itemHeight; // 偏移量

    return (
        <div style={{ height: containerHeight, overflow: 'auto' }}
             onScroll={e => setScrollTop(e.target.scrollTop)}>
            {/* 撑开滚动区域 */}
            <div style={{ height: items.length * itemHeight, position: 'relative' }}>
                <div style={{ transform: `translateY(${offsetY}px)` }}>
                    {visibleItems.map((item, i) => (
                        <div key={startIndex + i} style={{ height: itemHeight }}>
                            {item.content}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
```

**不定高虚拟列表**：预估高度渲染，渲染后用 ResizeObserver 更新实际高度，用 Map 缓存已知高度。

---
:::

## 搜索建议

::: details 5. 搜索建议（Autocomplete）如何实现？
**关键点：防抖 + 取消过期请求 + 缓存**

```javascript
function useSearchSuggestions(delay = 300) {
    const [suggestions, setSuggestions] = useState([]);
    const cache = useRef(new Map());
    const abortRef = useRef(null);

    const search = useMemo(() => debounce(async (query) => {
        if (!query.trim()) { setSuggestions([]); return; }

        // 命中缓存
        if (cache.current.has(query)) {
            setSuggestions(cache.current.get(query));
            return;
        }

        // 取消上一次请求
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        try {
            const data = await fetchSuggestions(query, abortRef.current.signal);
            cache.current.set(query, data);
            setSuggestions(data);
        } catch (e) {
            if (e.name !== 'AbortError') console.error(e);
        }
    }, delay), [delay]);

    return { suggestions, search };
}
```

---
:::

## 请求重试

::: details 6. 如何实现请求重试机制？
```javascript
async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
    for (let i = 0; i <= retries; i++) {
        try {
            const res = await fetch(url, options);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res;
        } catch (err) {
            if (i === retries) throw err; // 最后一次失败，抛出错误
            // 指数退避：1s, 2s, 4s...
            await new Promise(r => setTimeout(r, delay * 2 ** i));
        }
    }
}

// 只对特定错误重试（网络错误、5xx，不重试 4xx）
function shouldRetry(error) {
    if (error.name === 'TypeError') return true; // 网络错误
    if (error.status >= 500) return true;        // 服务端错误
    return false;
}
```

---
:::

## 拖拽排序

::: details 7. 拖拽排序如何实现？
**方案一：HTML5 Drag and Drop API**
```javascript
// 核心：dragstart 记录源，dragover 允许放置，drop 交换位置
item.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', item.dataset.index);
});
container.addEventListener('dragover', e => e.preventDefault());
container.addEventListener('drop', e => {
    const fromIndex = e.dataTransfer.getData('text/plain');
    const toIndex = e.target.dataset.index;
    swapItems(fromIndex, toIndex);
});
```

**方案二：鼠标事件（更灵活）**：mousedown 记录起点 → mousemove 更新位置 → mouseup 确认放置

**方案三：成熟库**：`@dnd-kit/core`（React）、`vue-draggable-next`（Vue）、`Sortable.js`（框架无关）

---
:::

## 国际化

::: details 8. 前端国际化方案如何设计？
```javascript
// i18n 核心实现
class I18n {
    constructor(locale, messages) {
        this.locale = locale;
        this.messages = messages; // { zh: {...}, en: {...} }
    }

    t(key, params = {}) {
        const msg = key.split('.').reduce((obj, k) => obj?.[k], this.messages[this.locale]);
        if (!msg) return key; // 降级显示 key
        // 插值替换：'Hello, {name}' → 'Hello, 张三'
        return msg.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
    }

    setLocale(locale) {
        this.locale = locale;
        document.documentElement.lang = locale;
        // 触发更新...
    }
}
```

**注意事项**：
- 日期/数字格式化用 `Intl.DateTimeFormat`、`Intl.NumberFormat`
- RTL 语言（阿拉伯语）需要 `dir="rtl"` 和镜像布局
- 动态加载语言包（按需，减少首屏体积）

---
:::

## 错误边界

::: details 9. 前端错误边界如何处理？
```javascript
// React 错误边界
class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // 上报错误
        reportError({ error, componentStack: info.componentStack });
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback error={this.state.error}
                                  onReset={() => this.setState({ hasError: false })} />;
        }
        return this.props.children;
    }
}

// Vue 错误处理
app.config.errorHandler = (err, instance, info) => {
    reportError({ err, info });
};
```

---
:::

## 数据可视化

::: details 10. 前端数据可视化方案如何选择？
| 方案 | 特点 | 适用场景 |
|------|------|---------|
| **ECharts** | 功能全面，配置式，社区活跃 | 通用图表，快速开发 |
| **D3.js** | 底层灵活，学习曲线陡 | 自定义复杂图表 |
| **AntV（G2/G6）** | 阿里出品，语法优雅 | 企业级应用 |
| **Three.js** | 3D 渲染 | 3D 可视化 |
| **Canvas** | 高性能，适合大量数据 | 实时数据、游戏 |
| **SVG** | 矢量，可交互 | 少量元素，需要交互 |

**大数据量优化**：数据采样、WebGL 渲染（deck.gl）、Web Worker 处理数据、虚拟化（只渲染可视区域）
:::
