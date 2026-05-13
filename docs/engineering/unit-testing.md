# 单元测试最佳实践

## 概述

单元测试是保证代码质量的重要手段。本文深入介绍 Jest 和 Vitest 两大测试框架的使用，以及 React/Vue 组件测试的最佳实践。

## 测试框架对比

### Jest vs Vitest

| 特性 | Jest | Vitest |
|------|------|--------|
| 速度 | 较慢 | 非常快 |
| 配置 | 开箱即用 | 需要 Vite |
| ESM 支持 | 需要配置 | 原生支持 |
| TypeScript | 需要配置 | 开箱即用 |
| 热重载 | 不支持 | 支持 |
| 生态 | 成熟 | 快速发展 |

### 安装配置

```bash
# Jest
npm install -D jest @types/jest ts-jest

# Vitest
npm install -D vitest
```

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts'
  ]
};
```

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html']
    }
  }
});
```

## 基础测试语法

### 测试结构

```javascript
// describe - 测试套件
describe('Calculator', () => {
  // beforeAll - 所有测试前执行一次
  beforeAll(() => {
    console.log('Setup');
  });

  // beforeEach - 每个测试前执行
  beforeEach(() => {
    // 重置状态
  });

  // afterEach - 每个测试后执行
  afterEach(() => {
    // 清理
  });

  // afterAll - 所有测试后执行一次
  afterAll(() => {
    console.log('Teardown');
  });

  // it/test - 单个测试用例
  it('should add two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });

  // 跳过测试
  it.skip('skipped test', () => {});

  // 只运行此测试
  it.only('only this test', () => {});

  // 待实现测试
  it.todo('implement later');
});
```

### 常用断言

```javascript
// 相等判断
expect(value).toBe(expected);        // 严格相等 ===
expect(value).toEqual(expected);     // 深度相等
expect(value).toStrictEqual(expected); // 严格深度相等

// 真假判断
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// 数字比较
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3);
expect(value).toBeLessThan(5);
expect(value).toBeCloseTo(0.3, 5);  // 浮点数比较

// 字符串
expect(str).toMatch(/pattern/);
expect(str).toContain('substring');

// 数组
expect(arr).toContain(item);
expect(arr).toHaveLength(3);
expect(arr).toContainEqual({ a: 1 });

// 对象
expect(obj).toHaveProperty('key');
expect(obj).toHaveProperty('key', value);
expect(obj).toMatchObject({ partial: 'match' });

// 异常
expect(() => func()).toThrow();
expect(() => func()).toThrow('error message');
expect(() => func()).toThrow(ErrorClass);

// 取反
expect(value).not.toBe(other);
```

### 异步测试

```javascript
// 回调方式
it('async with callback', (done) => {
  fetchData((data) => {
    expect(data).toBe('result');
    done();
  });
});

// Promise 方式
it('async with promise', () => {
  return fetchData().then(data => {
    expect(data).toBe('result');
  });
});

// async/await 方式
it('async with await', async () => {
  const data = await fetchData();
  expect(data).toBe('result');
});

// 测试 Promise 拒绝
it('should reject', async () => {
  await expect(failingPromise()).rejects.toThrow('error');
});
```

## Mock 与 Spy

### 函数 Mock

```javascript
// 创建 Mock 函数
const mockFn = jest.fn();  // Jest
const mockFn = vi.fn();    // Vitest

// 设置返回值
mockFn.mockReturnValue('value');
mockFn.mockReturnValueOnce('first').mockReturnValueOnce('second');

// 设置实现
mockFn.mockImplementation((a, b) => a + b);
mockFn.mockImplementationOnce(() => 'once');

// 模拟 Promise
mockFn.mockResolvedValue('resolved');
mockFn.mockRejectedValue(new Error('rejected'));

// 断言调用
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenLastCalledWith('arg');
expect(mockFn).toHaveBeenNthCalledWith(1, 'first call');

// 清除 Mock
mockFn.mockClear();   // 清除调用记录
mockFn.mockReset();   // 清除调用记录和实现
mockFn.mockRestore(); // 恢复原始实现
```

### 模块 Mock

```javascript
// Jest
jest.mock('./api', () => ({
  fetchUser: jest.fn(() => Promise.resolve({ name: 'John' }))
}));

// Vitest
vi.mock('./api', () => ({
  fetchUser: vi.fn(() => Promise.resolve({ name: 'John' }))
}));

// 使用
import { fetchUser } from './api';

it('should fetch user', async () => {
  const user = await fetchUser();
  expect(user.name).toBe('John');
});

// 动态 Mock
import { fetchUser } from './api';

it('should handle error', async () => {
  fetchUser.mockRejectedValueOnce(new Error('Failed'));
  await expect(fetchUser()).rejects.toThrow('Failed');
});
```

### Spy

```javascript
// 监视对象方法
const obj = {
  method: () => 'original'
};

const spy = jest.spyOn(obj, 'method');  // Jest
const spy = vi.spyOn(obj, 'method');    // Vitest

obj.method();

expect(spy).toHaveBeenCalled();

// 修改实现
spy.mockImplementation(() => 'mocked');

// 恢复原始
spy.mockRestore();
```

### Timer Mock

```javascript
// 启用假定时器
jest.useFakeTimers();  // Jest
vi.useFakeTimers();    // Vitest

it('should delay execution', () => {
  const callback = jest.fn();
  setTimeout(callback, 1000);

  expect(callback).not.toHaveBeenCalled();

  // 快进时间
  jest.advanceTimersByTime(1000);

  expect(callback).toHaveBeenCalled();
});

// 运行所有定时器
jest.runAllTimers();

// 运行待处理定时器
jest.runOnlyPendingTimers();

// 恢复真实定时器
jest.useRealTimers();
```

## React 组件测试

### React Testing Library

```bash
npm install -D @testing-library/react @testing-library/jest-dom
```

```javascript
// jest.setup.js
import '@testing-library/jest-dom';
```

### 基础组件测试

```jsx
// Button.jsx
function Button({ onClick, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

// Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });
});
```

### 查询方法

```javascript
// getBy - 找不到抛异常
screen.getByText('text');
screen.getByRole('button');
screen.getByLabelText('label');
screen.getByPlaceholderText('placeholder');
screen.getByTestId('test-id');

// queryBy - 找不到返回 null
screen.queryByText('text');

// findBy - 异步查询
await screen.findByText('text');

// 查询多个
screen.getAllByRole('listitem');
screen.queryAllByRole('listitem');
await screen.findAllByRole('listitem');
```

### 用户交互测试

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should handle user input', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  // 输入
  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.type(screen.getByLabelText('Password'), 'password123');

  // 点击
  await user.click(screen.getByRole('button', { name: 'Login' }));

  // 断言
  expect(screen.getByText('Welcome')).toBeInTheDocument();
});

// 其他交互
await user.hover(element);
await user.unhover(element);
await user.selectOptions(select, 'option1');
await user.clear(input);
await user.tab();
```

### Hooks 测试

```javascript
import { renderHook, act } from '@testing-library/react';
import useCounter from './useCounter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('should accept initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });
});
```

### 异步组件测试

```jsx
// UserProfile.jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(data => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  return <div>Hello, {user.name}</div>;
}

// UserProfile.test.jsx
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('./api', () => ({
  fetchUser: jest.fn()
}));

import { fetchUser } from './api';
import UserProfile from './UserProfile';

it('should show loading then user name', async () => {
  fetchUser.mockResolvedValue({ name: 'John' });

  render(<UserProfile userId={1} />);

  // 初始显示 loading
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  // 等待用户名显示
  await waitFor(() => {
    expect(screen.getByText('Hello, John')).toBeInTheDocument();
  });
});
```

## Vue 组件测试

### Vue Test Utils

```bash
npm install -D @vue/test-utils
```

### 基础组件测试

```vue
<!-- Counter.vue -->
<template>
  <div>
    <span data-testid="count">{{ count }}</span>
    <button @click="increment">+</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);
const increment = () => count.value++;
</script>
```

```javascript
// Counter.test.js
import { mount } from '@vue/test-utils';
import Counter from './Counter.vue';

describe('Counter', () => {
  it('should render initial count', () => {
    const wrapper = mount(Counter);
    expect(wrapper.find('[data-testid="count"]').text()).toBe('0');
  });

  it('should increment count when button clicked', async () => {
    const wrapper = mount(Counter);
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('[data-testid="count"]').text()).toBe('1');
  });
});
```

### Props 和 Events 测试

```javascript
// 测试 Props
it('should render with props', () => {
  const wrapper = mount(MyComponent, {
    props: {
      title: 'Hello',
      count: 5
    }
  });

  expect(wrapper.props('title')).toBe('Hello');
  expect(wrapper.text()).toContain('Hello');
});

// 测试 Events
it('should emit event', async () => {
  const wrapper = mount(MyComponent);

  await wrapper.find('button').trigger('click');

  expect(wrapper.emitted()).toHaveProperty('update');
  expect(wrapper.emitted('update')[0]).toEqual([1]);
});

// 测试 v-model
it('should update v-model', async () => {
  const wrapper = mount(MyComponent, {
    props: {
      modelValue: 'initial',
      'onUpdate:modelValue': (value) => wrapper.setProps({ modelValue: value })
    }
  });

  await wrapper.find('input').setValue('new value');
  expect(wrapper.props('modelValue')).toBe('new value');
});
```

### 插槽测试

```javascript
it('should render slot content', () => {
  const wrapper = mount(MyComponent, {
    slots: {
      default: 'Main content',
      header: '<h1>Header</h1>',
      footer: {
        template: '<p>{{ text }}</p>',
        data: () => ({ text: 'Footer' })
      }
    }
  });

  expect(wrapper.html()).toContain('Main content');
  expect(wrapper.find('h1').text()).toBe('Header');
});
```

### Pinia Store 测试

```javascript
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from './userStore';

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should update user', () => {
    const store = useUserStore();

    expect(store.user).toBeNull();

    store.setUser({ name: 'John' });

    expect(store.user.name).toBe('John');
  });

  it('should have correct getters', () => {
    const store = useUserStore();
    store.setUser({ name: 'John', role: 'admin' });

    expect(store.isAdmin).toBe(true);
  });
});
```

## 测试最佳实践

### 1. 测试命名规范

```javascript
// 好的命名
it('should return sum of two numbers', () => {});
it('should throw error when input is invalid', () => {});
it('should render loading state initially', () => {});

// 不好的命名
it('test add function', () => {});
it('works', () => {});
```

### 2. AAA 模式

```javascript
it('should calculate total price', () => {
  // Arrange - 准备
  const cart = new Cart();
  cart.addItem({ price: 10, quantity: 2 });
  cart.addItem({ price: 20, quantity: 1 });

  // Act - 执行
  const total = cart.calculateTotal();

  // Assert - 断言
  expect(total).toBe(40);
});
```

### 3. 单一职责

```javascript
// 好：一个测试只测一件事
it('should add item to cart', () => {});
it('should calculate correct total', () => {});
it('should apply discount', () => {});

// 不好：一个测试做太多事
it('should add item, calculate total and apply discount', () => {});
```

### 4. 避免测试实现细节

```javascript
// 好：测试行为
it('should show success message after form submit', async () => {
  render(<Form />);
  await userEvent.type(screen.getByLabelText('Email'), 'test@test.com');
  await userEvent.click(screen.getByRole('button'));
  expect(screen.getByText('Success')).toBeInTheDocument();
});

// 不好：测试实现细节
it('should set state to success', () => {
  const { result } = renderHook(() => useForm());
  act(() => result.current.setState({ status: 'success' }));
  expect(result.current.state.status).toBe('success');
});
```

### 5. 测试覆盖率

```bash
# Jest
jest --coverage

# Vitest
vitest --coverage
```

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## 面试常见问题

::: details 1. 什么是单元测试？
单元测试是对代码最小可测试单元（函数、组件）进行独立验证的测试。目的是确保每个单元按预期工作。
:::

::: details 2. Jest 和 Vitest 的区别？
- Vitest 更快，基于 Vite
- Vitest 原生支持 ESM 和 TypeScript
- Jest 生态更成熟
- API 基本兼容
:::

::: details 3. Mock 和 Spy 的区别？
- **Mock**：完全替换函数实现
- **Spy**：监视函数调用，可选择是否替换实现
:::

::: details 4. 如何测试异步代码？
```javascript
// async/await
it('async test', async () => {
  const result = await asyncFunction();
  expect(result).toBe('expected');
});

// Promise
it('promise test', () => {
  return asyncFunction().then(result => {
    expect(result).toBe('expected');
  });
});
```
:::

::: details 5. 如何提高测试覆盖率？
- 测试所有分支条件
- 测试边界情况
- 测试错误处理
- 测试异步代码
- 使用覆盖率报告找出未覆盖代码
:::

## 总结

单元测试最佳实践：

1. **选择合适框架**：Vitest 适合 Vite 项目，Jest 适合通用项目
2. **Mock 与 Spy**：合理使用，隔离依赖
3. **组件测试**：使用 Testing Library，测试用户行为
4. **命名规范**：清晰描述测试意图
5. **覆盖率**：追求有意义的覆盖，不是数字

完善的单元测试是高质量代码的重要保障。
