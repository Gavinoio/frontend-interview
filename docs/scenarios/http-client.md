# HTTP 请求封装

## 概述

在实际项目中，通常需要封装统一的 HTTP 请求工具，处理通用逻辑如请求/响应拦截、错误处理、重试机制等。本文详细介绍 HTTP 请求工具的设计与实现。

---

## 封装思路

### 核心功能

```
HTTP 请求封装
├── 基础配置（baseURL、timeout、headers）
├── 请求拦截器（添加 token、loading 等）
├── 响应拦截器（统一错误处理、数据转换）
├── 错误处理（网络错误、业务错误、超时）
├── 取消请求（防重复提交、组件卸载取消）
├── 重试机制（网络不稳定时自动重试）
└── TypeScript 类型支持
```

---

## Axios 封装

### 基础封装

```typescript
// src/utils/request.ts
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';

// 响应数据接口
interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 扩展配置
interface RequestConfig extends AxiosRequestConfig {
  // 是否显示 loading
  showLoading?: boolean;
  // 是否显示错误提示
  showError?: boolean;
  // 重试次数
  retryCount?: number;
  // 是否需要 token
  requireAuth?: boolean;
}

class HttpClient {
  private instance: AxiosInstance;
  private pendingRequests: Map<string, AbortController> = new Map();

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      },
      ...config
    });

    this.setupInterceptors();
  }

  // 生成请求唯一标识
  private getRequestKey(config: AxiosRequestConfig): string {
    const { method, url, params, data } = config;
    return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&');
  }

  // 添加请求到 pending
  private addPendingRequest(config: InternalAxiosRequestConfig): void {
    const requestKey = this.getRequestKey(config);

    // 取消之前相同的请求
    if (this.pendingRequests.has(requestKey)) {
      this.pendingRequests.get(requestKey)?.abort();
    }

    const controller = new AbortController();
    config.signal = controller.signal;
    this.pendingRequests.set(requestKey, controller);
  }

  // 移除 pending 请求
  private removePendingRequest(config: AxiosRequestConfig): void {
    const requestKey = this.getRequestKey(config);
    this.pendingRequests.delete(requestKey);
  }

  // 设置拦截器
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 防重复请求
        this.addPendingRequest(config);

        // 添加 token
        const token = localStorage.getItem('token');
        if (token && (config as RequestConfig).requireAuth !== false) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // 显示 loading
        if ((config as RequestConfig).showLoading !== false) {
          // showLoading();
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // 移除 pending
        this.removePendingRequest(response.config);
        // 隐藏 loading
        // hideLoading();

        const { code, data, message } = response.data;

        // 业务成功
        if (code === 0 || code === 200) {
          return data;
        }

        // 业务错误
        return Promise.reject(new Error(message || '请求失败'));
      },
      (error) => {
        // 移除 pending
        if (error.config) {
          this.removePendingRequest(error.config);
        }
        // hideLoading();

        // 处理错误
        return this.handleError(error);
      }
    );
  }

  // 错误处理
  private handleError(error: any): Promise<never> {
    let message = '请求失败';

    if (axios.isCancel(error)) {
      message = '请求已取消';
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时';
    } else if (!navigator.onLine) {
      message = '网络连接失败';
    } else if (error.response) {
      const status = error.response.status;
      const statusMessages: Record<number, string> = {
        400: '请求参数错误',
        401: '未授权，请重新登录',
        403: '拒绝访问',
        404: '请求资源不存在',
        500: '服务器内部错误',
        502: '网关错误',
        503: '服务不可用',
        504: '网关超时'
      };
      message = statusMessages[status] || `请求失败(${status})`;

      // 401 跳转登录
      if (status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }

    // 显示错误提示
    // showToast(message);

    return Promise.reject(new Error(message));
  }

  // 取消所有请求
  public cancelAllRequests(): void {
    this.pendingRequests.forEach((controller) => {
      controller.abort();
    });
    this.pendingRequests.clear();
  }

  // 通用请求方法
  public request<T = any>(config: RequestConfig): Promise<T> {
    return this.instance.request(config);
  }

  public get<T = any>(url: string, params?: any, config?: RequestConfig): Promise<T> {
    return this.instance.get(url, { params, ...config });
  }

  public post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.post(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.put(url, data, config);
  }

  public delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.instance.delete(url, config);
  }

  // 文件上传
  public upload<T = any>(url: string, file: File, onProgress?: (percent: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          const percent = Math.round((event.loaded * 100) / event.total);
          onProgress(percent);
        }
      }
    });
  }
}

// 创建实例
const http = new HttpClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api'
});

export default http;
```

### 带重试的封装

```typescript
// 重试配置
interface RetryConfig {
  retries: number;        // 重试次数
  retryDelay: number;     // 重试延迟（ms）
  retryCondition?: (error: any) => boolean;  // 重试条件
}

// 添加重试拦截器
function setupRetryInterceptor(instance: AxiosInstance, config: RetryConfig) {
  instance.interceptors.response.use(undefined, async (error) => {
    const { config: requestConfig } = error;

    // 初始化重试计数
    requestConfig.__retryCount = requestConfig.__retryCount || 0;

    // 检查是否应该重试
    const shouldRetry = (
      requestConfig.__retryCount < config.retries &&
      (config.retryCondition ? config.retryCondition(error) : isRetryableError(error))
    );

    if (!shouldRetry) {
      return Promise.reject(error);
    }

    requestConfig.__retryCount += 1;

    // 延迟重试
    await new Promise(resolve => setTimeout(resolve, config.retryDelay));

    console.log(`重试第 ${requestConfig.__retryCount} 次: ${requestConfig.url}`);

    return instance(requestConfig);
  });
}

// 判断是否应该重试
function isRetryableError(error: any): boolean {
  // 网络错误、超时、5xx 服务器错误可以重试
  return (
    !error.response ||
    error.code === 'ECONNABORTED' ||
    (error.response.status >= 500 && error.response.status < 600)
  );
}
```

---

## Fetch 封装

```typescript
// src/utils/fetch-client.ts

interface FetchConfig extends RequestInit {
  baseURL?: string;
  timeout?: number;
  params?: Record<string, any>;
}

interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

class FetchClient {
  private baseURL: string;
  private defaultConfig: RequestInit;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(config: FetchConfig = {}) {
    this.baseURL = config.baseURL || '';
    this.defaultConfig = {
      headers: {
        'Content-Type': 'application/json'
      },
      ...config
    };
  }

  // 构建完整 URL
  private buildURL(url: string, params?: Record<string, any>): string {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    if (!params) return fullURL;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${fullURL}?${queryString}` : fullURL;
  }

  // 请求超时处理
  private createTimeoutSignal(timeout: number): AbortSignal {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller.signal;
  }

  // 合并 AbortSignal
  private mergeSignals(...signals: (AbortSignal | undefined)[]): AbortSignal {
    const controller = new AbortController();

    signals.filter(Boolean).forEach(signal => {
      signal!.addEventListener('abort', () => controller.abort());
    });

    return controller.signal;
  }

  // 核心请求方法
  async request<T = any>(url: string, config: FetchConfig = {}): Promise<T> {
    const {
      baseURL,
      timeout = 10000,
      params,
      ...fetchConfig
    } = config;

    const fullURL = this.buildURL(url, params);

    // 添加 token
    const token = localStorage.getItem('token');
    const headers = new Headers(this.defaultConfig.headers);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // 合并配置
    const mergedConfig: RequestInit = {
      ...this.defaultConfig,
      ...fetchConfig,
      headers,
      signal: this.mergeSignals(
        this.createTimeoutSignal(timeout),
        config.signal
      )
    };

    try {
      const response = await fetch(fullURL, mergedConfig);

      // HTTP 错误处理
      if (!response.ok) {
        throw await this.handleHttpError(response);
      }

      // 解析响应
      const data: ApiResponse<T> = await response.json();

      // 业务错误处理
      if (data.code !== 0 && data.code !== 200) {
        throw new Error(data.message || '请求失败');
      }

      return data.data;
    } catch (error: any) {
      // 超时处理
      if (error.name === 'AbortError') {
        throw new Error('请求超时');
      }
      throw error;
    }
  }

  // HTTP 错误处理
  private async handleHttpError(response: Response): Promise<Error> {
    const status = response.status;
    let message = `请求失败(${status})`;

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {}

    if (status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return new Error(message);
  }

  // 快捷方法
  get<T = any>(url: string, params?: Record<string, any>, config?: FetchConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET', params });
  }

  post<T = any>(url: string, data?: any, config?: FetchConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put<T = any>(url: string, data?: any, config?: FetchConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  delete<T = any>(url: string, config?: FetchConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }
}

export const fetchClient = new FetchClient({
  baseURL: '/api'
});
```

---

## Vue 3 组合式封装

```typescript
// src/composables/useRequest.ts
import { ref, Ref, UnwrapRef } from 'vue';
import http from '@/utils/request';

interface UseRequestOptions<T> {
  // 是否立即执行
  immediate?: boolean;
  // 默认数据
  defaultData?: T;
  // 请求前回调
  onBefore?: () => void;
  // 请求成功回调
  onSuccess?: (data: T) => void;
  // 请求失败回调
  onError?: (error: Error) => void;
  // 请求结束回调
  onFinally?: () => void;
}

interface UseRequestReturn<T, P extends any[]> {
  data: Ref<UnwrapRef<T> | undefined>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  run: (...params: P) => Promise<T>;
  refresh: () => Promise<T>;
  cancel: () => void;
}

export function useRequest<T = any, P extends any[] = any[]>(
  requestFn: (...args: P) => Promise<T>,
  options: UseRequestOptions<T> = {}
): UseRequestReturn<T, P> {
  const {
    immediate = false,
    defaultData,
    onBefore,
    onSuccess,
    onError,
    onFinally
  } = options;

  const data = ref<T | undefined>(defaultData);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  let lastParams: P;
  let abortController: AbortController | null = null;

  const run = async (...params: P): Promise<T> => {
    lastParams = params;

    // 取消之前的请求
    cancel();
    abortController = new AbortController();

    loading.value = true;
    error.value = null;
    onBefore?.();

    try {
      const result = await requestFn(...params);
      data.value = result as UnwrapRef<T>;
      onSuccess?.(result);
      return result;
    } catch (e: any) {
      error.value = e;
      onError?.(e);
      throw e;
    } finally {
      loading.value = false;
      onFinally?.();
    }
  };

  const refresh = () => {
    return run(...lastParams);
  };

  const cancel = () => {
    abortController?.abort();
    abortController = null;
  };

  // 立即执行
  if (immediate) {
    run(...([] as unknown as P));
  }

  return {
    data,
    loading,
    error,
    run,
    refresh,
    cancel
  };
}

// 分页请求 Hook
interface PaginationParams {
  page: number;
  pageSize: number;
}

interface PaginationResult<T> {
  list: T[];
  total: number;
}

export function usePagination<T = any>(
  requestFn: (params: PaginationParams) => Promise<PaginationResult<T>>,
  options: { defaultPageSize?: number } = {}
) {
  const { defaultPageSize = 10 } = options;

  const list = ref<T[]>([]);
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(defaultPageSize);
  const loading = ref(false);

  const fetchData = async () => {
    loading.value = true;
    try {
      const result = await requestFn({
        page: page.value,
        pageSize: pageSize.value
      });
      list.value = result.list as UnwrapRef<T[]>;
      total.value = result.total;
    } finally {
      loading.value = false;
    }
  };

  const changePage = (newPage: number) => {
    page.value = newPage;
    fetchData();
  };

  const changePageSize = (newPageSize: number) => {
    pageSize.value = newPageSize;
    page.value = 1;
    fetchData();
  };

  const refresh = () => {
    page.value = 1;
    fetchData();
  };

  return {
    list,
    total,
    page,
    pageSize,
    loading,
    fetchData,
    changePage,
    changePageSize,
    refresh
  };
}
```

**使用示例：**

```vue
<script setup lang="ts">
import { useRequest, usePagination } from '@/composables/useRequest';
import { getUserInfo, getUserList } from '@/api/user';

// 基础用法
const { data: userInfo, loading, error, run } = useRequest(getUserInfo, {
  immediate: true,
  onSuccess(data) {
    console.log('获取成功', data);
  }
});

// 手动触发
const handleSubmit = async () => {
  await run(userId);
};

// 分页用法
const {
  list,
  total,
  page,
  pageSize,
  loading: listLoading,
  fetchData,
  changePage
} = usePagination(getUserList);

// 初始加载
fetchData();
</script>
```

---

## React 封装

```typescript
// src/hooks/useRequest.ts
import { useState, useCallback, useEffect, useRef } from 'react';

interface UseRequestOptions<T> {
  manual?: boolean;
  defaultData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  debounceWait?: number;
  throttleWait?: number;
}

interface UseRequestResult<T, P extends any[]> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  run: (...params: P) => Promise<T>;
  refresh: () => Promise<T>;
  cancel: () => void;
  mutate: (data: T | ((prevData: T | undefined) => T)) => void;
}

export function useRequest<T = any, P extends any[] = any[]>(
  requestFn: (...args: P) => Promise<T>,
  options: UseRequestOptions<T> = {}
): UseRequestResult<T, P> {
  const {
    manual = false,
    defaultData,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState<T | undefined>(defaultData);
  const [loading, setLoading] = useState(!manual);
  const [error, setError] = useState<Error | null>(null);

  const lastParamsRef = useRef<P>();
  const mountedRef = useRef(true);

  const run = useCallback(async (...params: P): Promise<T> => {
    lastParamsRef.current = params;
    setLoading(true);
    setError(null);

    try {
      const result = await requestFn(...params);

      if (mountedRef.current) {
        setData(result);
        onSuccess?.(result);
      }

      return result;
    } catch (e: any) {
      if (mountedRef.current) {
        setError(e);
        onError?.(e);
      }
      throw e;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [requestFn, onSuccess, onError]);

  const refresh = useCallback(() => {
    if (lastParamsRef.current) {
      return run(...lastParamsRef.current);
    }
    return run(...([] as unknown as P));
  }, [run]);

  const cancel = useCallback(() => {
    mountedRef.current = false;
  }, []);

  const mutate = useCallback((
    newData: T | ((prevData: T | undefined) => T)
  ) => {
    if (typeof newData === 'function') {
      setData(prevData => (newData as Function)(prevData));
    } else {
      setData(newData);
    }
  }, []);

  // 自动请求
  useEffect(() => {
    if (!manual) {
      run(...([] as unknown as P));
    }
  }, []);

  // 清理
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    run,
    refresh,
    cancel,
    mutate
  };
}

// 使用示例
function UserProfile({ userId }: { userId: string }) {
  const { data: user, loading, error, refresh } = useRequest(
    () => fetchUserById(userId),
    {
      onSuccess: (data) => {
        console.log('User loaded:', data);
      }
    }
  );

  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      <h1>{user?.name}</h1>
      <button onClick={refresh}>刷新</button>
    </div>
  );
}
```

---

## 接口并发优化

### 并行请求

```typescript
// 多个独立接口并行请求
async function loadPageData() {
  // ❌ 串行请求，耗时 = A + B + C
  const userInfo = await getUserInfo();
  const orderList = await getOrderList();
  const statistics = await getStatistics();

  // ✅ 并行请求，耗时 = max(A, B, C)
  const [userInfo, orderList, statistics] = await Promise.all([
    getUserInfo(),
    getOrderList(),
    getStatistics()
  ]);
}

// Promise.allSettled - 不因单个失败而中断
async function loadDashboard() {
  const results = await Promise.allSettled([
    getUserInfo(),
    getOrderList(),
    getStatistics()
  ]);

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`接口${index}成功:`, result.value);
    } else {
      console.log(`接口${index}失败:`, result.reason);
    }
  });
}
```

### 请求合并

```typescript
// 批量请求合并
class RequestBatcher<T> {
  private queue: Array<{
    id: string;
    resolve: (value: T) => void;
    reject: (error: any) => void;
  }> = [];

  private timer: NodeJS.Timeout | null = null;
  private readonly delay: number = 50;

  constructor(
    private batchFn: (ids: string[]) => Promise<Map<string, T>>
  ) {}

  async fetch(id: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ id, resolve, reject });

      if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.delay);
      }
    });
  }

  private async flush() {
    const batch = this.queue.splice(0);
    this.timer = null;

    if (batch.length === 0) return;

    const ids = batch.map(item => item.id);

    try {
      const results = await this.batchFn(ids);

      batch.forEach(({ id, resolve, reject }) => {
        const result = results.get(id);
        if (result !== undefined) {
          resolve(result);
        } else {
          reject(new Error(`No result for ${id}`));
        }
      });
    } catch (error) {
      batch.forEach(({ reject }) => reject(error));
    }
  }
}

// 使用示例
const userBatcher = new RequestBatcher<User>(async (ids) => {
  const users = await fetchUsersByIds(ids);
  return new Map(users.map(u => [u.id, u]));
});

// 多次调用会被合并为一次请求
userBatcher.fetch('1');
userBatcher.fetch('2');
userBatcher.fetch('3');
// 50ms 后发送一次请求：fetchUsersByIds(['1', '2', '3'])
```

---

