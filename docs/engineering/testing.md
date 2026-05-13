# 前端测试

前端测试是保证代码质量的重要手段，包括单元测试、集成测试、E2E 测试等多个层次。

## 测试金字塔

```
         /\
        /  \        E2E 测试（端到端）
       /    \       - 模拟真实用户操作
      /------\      - 数量最少，成本最高
     /        \
    /  集成测试  \   集成测试
   /            \   - 测试模块间协作
  /--------------\  - 数量适中
 /                \
/    单元测试      \ 单元测试
--------------------  - 测试单个函数/组件
                      - 数量最多，成本最低
```

## 测试类型对比

| 类型 | 范围 | 速度 | 成本 | 工具 |
|------|------|------|------|------|
| 单元测试 | 函数/组件 | 快 | 低 | Jest, Vitest |
| 集成测试 | 模块交互 | 中 | 中 | Jest, Vitest |
| E2E 测试 | 完整流程 | 慢 | 高 | Playwright, Cypress |

---

## Jest

Jest 是 Facebook 开发的 JavaScript 测试框架，功能全面，开箱即用。

### 安装配置

```bash
npm install -D jest @types/jest
# React 项目
npm install -D @testing-library/react @testing-library/jest-dom
# TypeScript 支持
npm install -D ts-jest
```

```javascript
// jest.config.js
module.exports = {
  // 测试环境
  testEnvironment: 'jsdom',  // 浏览器环境，或 'node'

  // 文件匹配
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],

  // 模块路径映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss)$': 'identity-obj-proxy'  // 样式文件 mock
  },

  // TypeScript 转换
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },

  // 覆盖率配置
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // 每个测试文件前执行
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
```

```javascript
// jest.setup.js
import '@testing-library/jest-dom';
```

### 基础语法

```javascript
// sum.js
export function sum(a, b) {
  return a + b;
}

// sum.test.js
import { sum } from './sum';

// 描述测试套件
describe('sum 函数', () => {
  // 单个测试用例
  test('1 + 2 应该等于 3', () => {
    expect(sum(1, 2)).toBe(3);
  });

  // it 是 test 的别名
  it('应该正确处理负数', () => {
    expect(sum(-1, -2)).toBe(-3);
  });

  // 跳过测试
  test.skip('跳过这个测试', () => {
    // ...
  });

  // 只运行这个测试
  test.only('只运行这个测试', () => {
    // ...
  });
});
```

### 常用断言（Matchers）

```javascript
// 相等性
expect(value).toBe(3);              // 严格相等 ===
expect(value).toEqual({ a: 1 });    // 深度相等（对象/数组）
expect(value).toStrictEqual(obj);   // 更严格的深度相等

// 真值判断
expect(value).toBeTruthy();         // 真值
expect(value).toBeFalsy();          // 假值
expect(value).toBeNull();           // null
expect(value).toBeUndefined();      // undefined
expect(value).toBeDefined();        // 非 undefined

// 数字比较
expect(value).toBeGreaterThan(3);        // > 3
expect(value).toBeGreaterThanOrEqual(3); // >= 3
expect(value).toBeLessThan(3);           // < 3
expect(value).toBeCloseTo(0.3, 5);       // 浮点数近似相等

// 字符串匹配
expect(str).toMatch(/pattern/);     // 正则匹配
expect(str).toContain('substring'); // 包含子串

// 数组/可迭代对象
expect(arr).toContain(item);        // 包含元素
expect(arr).toHaveLength(3);        // 长度
expect(arr).toContainEqual({ a: 1 }); // 包含对象

// 对象
expect(obj).toHaveProperty('key');           // 有属性
expect(obj).toHaveProperty('key', 'value');  // 属性值
expect(obj).toMatchObject({ a: 1 });         // 部分匹配

// 异常
expect(() => fn()).toThrow();                // 抛出异常
expect(() => fn()).toThrow('error message'); // 抛出特定异常
expect(() => fn()).toThrow(CustomError);     // 抛出特定类型

// 取反
expect(value).not.toBe(3);
```

### 异步测试

```javascript
// 返回 Promise
test('async/await', async () => {
  const data = await fetchData();
  expect(data).toBe('data');
});

// 使用 resolves/rejects
test('resolves', () => {
  return expect(Promise.resolve('data')).resolves.toBe('data');
});

test('rejects', () => {
  return expect(Promise.reject('error')).rejects.toMatch('error');
});

// 回调函数（使用 done）
test('callback', (done) => {
  function callback(data) {
    try {
      expect(data).toBe('data');
      done();
    } catch (error) {
      done(error);
    }
  }
  fetchDataWithCallback(callback);
});

// 定时器测试
jest.useFakeTimers();

test('定时器', () => {
  const callback = jest.fn();
  setTimeout(callback, 1000);

  expect(callback).not.toBeCalled();

  jest.advanceTimersByTime(1000);  // 快进 1 秒
  // 或 jest.runAllTimers();       // 执行所有定时器

  expect(callback).toBeCalled();
});
```

### Mock 函数

```javascript
// 创建 mock 函数
const mockFn = jest.fn();
mockFn('arg1', 'arg2');

// 断言调用
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenLastCalledWith('arg1', 'arg2');

// 设置返回值
const mockFn = jest.fn()
  .mockReturnValue(10)                     // 固定返回值
  .mockReturnValueOnce(20)                 // 第一次返回
  .mockResolvedValue('data')               // 返回 resolved Promise
  .mockRejectedValue(new Error('error'))   // 返回 rejected Promise
  .mockImplementation((x) => x * 2);       // 自定义实现

// Mock 模块
jest.mock('./api', () => ({
  fetchUser: jest.fn().mockResolvedValue({ name: 'John' })
}));

// 部分 mock
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  formatDate: jest.fn()
}));

// Spy（监听真实函数）
const spy = jest.spyOn(object, 'method');
spy.mockImplementation(() => 'mocked');
// 测试后恢复
spy.mockRestore();
```

### 生命周期钩子

```javascript
describe('测试套件', () => {
  // 所有测试前执行一次
  beforeAll(() => {
    // 初始化数据库连接等
  });

  // 所有测试后执行一次
  afterAll(() => {
    // 关闭连接等
  });

  // 每个测试前执行
  beforeEach(() => {
    // 重置状态
    jest.clearAllMocks();
  });

  // 每个测试后执行
  afterEach(() => {
    // 清理
  });

  test('test 1', () => {});
  test('test 2', () => {});
});
```

---

## Vitest

Vitest 是基于 Vite 的测试框架，与 Jest 兼容，但更快、配置更简单。

### 安装配置

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // 使用 jsdom 环境
    environment: 'jsdom',
    // 全局 API（不需要每次 import）
    globals: true,
    // 每个测试文件前执行
    setupFiles: './src/test/setup.ts',
    // 覆盖率
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
```

### 基本用法

```typescript
// 与 Jest 语法几乎相同
import { describe, it, expect, vi } from 'vitest';

describe('math', () => {
  it('should add numbers', () => {
    expect(1 + 1).toBe(2);
  });
});

// Mock 函数使用 vi 而非 jest
const mockFn = vi.fn();
vi.spyOn(object, 'method');
vi.mock('./module');

// 定时器
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
vi.useRealTimers();
```

### Vitest vs Jest

| 特性 | Vitest | Jest |
|------|--------|------|
| 速度 | 更快（原生 ESM） | 较慢 |
| 配置 | 复用 Vite 配置 | 独立配置 |
| HMR | 支持 | 不支持 |
| 语法 | 兼容 Jest | - |
| 生态 | 较新 | 成熟 |

---

## React Testing Library

React Testing Library 专注于测试用户行为而非实现细节。

### 核心理念

```
"The more your tests resemble the way your software is used,
the more confidence they can give you."

测试越接近用户使用软件的方式，就越能给你信心。
```

### 基本用法

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Counter from './Counter';

describe('Counter', () => {
  test('renders initial count', () => {
    render(<Counter initialCount={0} />);

    // 查询元素
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });

  test('increments count on button click', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={0} />);

    // 点击按钮
    await user.click(screen.getByRole('button', { name: /increment/i }));

    // 断言结果
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });

  test('input change', async () => {
    const user = userEvent.setup();
    render(<Form />);

    const input = screen.getByLabelText('Username');
    await user.type(input, 'john');

    expect(input).toHaveValue('john');
  });
});
```

### 查询方法

```jsx
// 查询类型
// getBy*    - 找到返回元素，找不到抛错
// queryBy*  - 找到返回元素，找不到返回 null
// findBy*   - 返回 Promise，适合异步元素

// getAllBy*, queryAllBy*, findAllBy* - 返回数组

// 查询方式（推荐顺序）
screen.getByRole('button', { name: /submit/i });  // ⭐ 首选，无障碍
screen.getByLabelText('Email');                    // 表单元素
screen.getByPlaceholderText('Enter email');        // placeholder
screen.getByText('Hello World');                   // 文本内容
screen.getByDisplayValue('current value');         // 表单当前值
screen.getByAltText('profile');                    // img alt
screen.getByTitle('tooltip');                      // title 属性
screen.getByTestId('custom-element');              // data-testid（最后手段）

// 示例
const button = screen.getByRole('button', { name: /submit/i });
const heading = screen.getByRole('heading', { level: 1 });
const checkbox = screen.getByRole('checkbox', { checked: true });
const link = screen.getByRole('link', { name: 'Home' });
const textbox = screen.getByRole('textbox', { name: /email/i });
const list = screen.getByRole('list');
const listItems = screen.getAllByRole('listitem');
```

### 用户交互

```jsx
import userEvent from '@testing-library/user-event';

test('user interactions', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);

  // 点击
  await user.click(element);
  await user.dblClick(element);
  await user.tripleClick(element);

  // 输入
  await user.type(input, 'Hello');
  await user.clear(input);

  // 选择
  await user.selectOptions(select, ['option1', 'option2']);
  await user.deselectOptions(select, 'option1');

  // 键盘
  await user.keyboard('{Enter}');
  await user.keyboard('{Shift>}A{/Shift}');  // Shift+A

  // 复制粘贴
  await user.copy();
  await user.paste();

  // 悬停
  await user.hover(element);
  await user.unhover(element);

  // Tab 导航
  await user.tab();
  await user.tab({ shift: true });  // Shift+Tab

  // 上传文件
  const file = new File(['content'], 'test.png', { type: 'image/png' });
  await user.upload(input, file);
});
```

### 异步测试

```jsx
import { render, screen, waitFor } from '@testing-library/react';

test('async data loading', async () => {
  render(<UserProfile userId="1" />);

  // 等待元素出现
  const userName = await screen.findByText('John Doe');
  expect(userName).toBeInTheDocument();

  // 或使用 waitFor
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  // 等待元素消失
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});

// 配置超时
await waitFor(() => {}, { timeout: 3000 });
await screen.findByText('text', {}, { timeout: 3000 });
```

### Mock 网络请求

```jsx
// 使用 MSW (Mock Service Worker)
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/user', (req, res, ctx) => {
    return res(ctx.json({ name: 'John' }));
  }),
  rest.post('/api/login', async (req, res, ctx) => {
    const { username } = await req.json();
    return res(ctx.json({ token: 'abc123' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('fetches user data', async () => {
  render(<UserProfile />);
  expect(await screen.findByText('John')).toBeInTheDocument();
});

// 测试错误场景
test('handles server error', async () => {
  server.use(
    rest.get('/api/user', (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );

  render(<UserProfile />);
  expect(await screen.findByText('Error loading user')).toBeInTheDocument();
});
```

---

## Vue Testing

### Vue Test Utils

```bash
npm install -D @vue/test-utils vitest jsdom
```

```javascript
// vite.config.js
export default defineConfig({
  test: {
    environment: 'jsdom'
  }
});
```

```vue
<!-- Counter.vue -->
<template>
  <div>
    <p data-testid="count">{{ count }}</p>
    <button @click="increment">+1</button>
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
import { describe, it, expect } from 'vitest';
import Counter from './Counter.vue';

describe('Counter', () => {
  it('renders initial count', () => {
    const wrapper = mount(Counter);
    expect(wrapper.find('[data-testid="count"]').text()).toBe('0');
  });

  it('increments count when button clicked', async () => {
    const wrapper = mount(Counter);
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('[data-testid="count"]').text()).toBe('1');
  });

  it('receives props', () => {
    const wrapper = mount(Counter, {
      props: {
        initialCount: 10
      }
    });
    expect(wrapper.vm.count).toBe(10);
  });

  it('emits events', async () => {
    const wrapper = mount(Counter);
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('update')).toBeTruthy();
    expect(wrapper.emitted('update')[0]).toEqual([1]);
  });
});
```

### 测试 Pinia Store

```javascript
import { setActivePinia, createPinia } from 'pinia';
import { useCounterStore } from './counter';

describe('Counter Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('increments count', () => {
    const store = useCounterStore();
    expect(store.count).toBe(0);
    store.increment();
    expect(store.count).toBe(1);
  });

  it('computes double count', () => {
    const store = useCounterStore();
    store.count = 5;
    expect(store.doubleCount).toBe(10);
  });
});
```

---

## E2E 测试

### Playwright

```bash
npm init playwright@latest
```

```javascript
// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } }
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000
  }
});
```

```javascript
// e2e/login.spec.js
import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login successfully', async ({ page }) => {
    // 填写表单
    await page.fill('[data-testid="email"]', 'user@example.com');
    await page.fill('[data-testid="password"]', 'password123');

    // 点击登录
    await page.click('[data-testid="login-button"]');

    // 等待导航
    await page.waitForURL('/dashboard');

    // 断言
    await expect(page.locator('h1')).toHaveText('Welcome');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('[data-testid="email"]', 'wrong@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toHaveText('Invalid credentials');
  });
});
```

**Playwright 常用 API：**

```javascript
// 导航
await page.goto('https://example.com');
await page.goBack();
await page.goForward();
await page.reload();

// 选择器
page.locator('button');                    // CSS 选择器
page.locator('text=Submit');               // 文本
page.locator('[data-testid="submit"]');    // data-testid
page.getByRole('button', { name: 'Submit' }); // 角色
page.getByLabel('Email');                  // 标签
page.getByPlaceholder('Enter email');      // placeholder
page.getByText('Hello');                   // 文本

// 操作
await page.click('button');
await page.fill('input', 'text');
await page.type('input', 'text');  // 逐字符输入
await page.press('input', 'Enter');
await page.selectOption('select', 'value');
await page.check('input[type="checkbox"]');
await page.hover('button');

// 等待
await page.waitForSelector('.loaded');
await page.waitForURL('/dashboard');
await page.waitForResponse('/api/data');
await page.waitForTimeout(1000);  // 不推荐

// 断言
await expect(page).toHaveTitle('My App');
await expect(page).toHaveURL('/dashboard');
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();
await expect(locator).toHaveText('Hello');
await expect(locator).toHaveValue('input value');
await expect(locator).toHaveCount(5);

// 截图
await page.screenshot({ path: 'screenshot.png' });
await page.screenshot({ fullPage: true });

// 网络拦截
await page.route('/api/**', (route) => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ data: 'mocked' })
  });
});
```

### Cypress

```bash
npm install -D cypress
```

```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js'
  }
});
```

```javascript
// cypress/e2e/login.cy.js
describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login successfully', () => {
    cy.get('[data-testid="email"]').type('user@example.com');
    cy.get('[data-testid="password"]').type('password123');
    cy.get('[data-testid="login-button"]').click();

    cy.url().should('include', '/dashboard');
    cy.get('h1').should('contain', 'Welcome');
  });

  it('should show validation error', () => {
    cy.get('[data-testid="login-button"]').click();
    cy.get('.error').should('be.visible');
  });
});

// 网络请求拦截
cy.intercept('POST', '/api/login', {
  statusCode: 200,
  body: { token: 'abc123' }
}).as('loginRequest');

cy.get('button').click();
cy.wait('@loginRequest');
```

---

## 测试覆盖率

```bash
# Jest
npx jest --coverage

# Vitest
npx vitest --coverage
```

```javascript
// 覆盖率报告解读
// - Statements: 语句覆盖率
// - Branches: 分支覆盖率（if/else, switch）
// - Functions: 函数覆盖率
// - Lines: 行覆盖率

// 覆盖率目标建议
// - 核心业务逻辑: 90%+
// - 工具函数: 100%
// - UI 组件: 70-80%
// - 整体项目: 80%+
```

---

