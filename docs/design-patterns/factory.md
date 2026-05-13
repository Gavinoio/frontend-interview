# 工厂模式（Factory Pattern）

## 定义

工厂模式是一种创建型设计模式，它提供了一种创建对象的最佳方式。在工厂模式中，我们创建对象时不会对客户端暴露创建逻辑，而是通过使用一个共同的接口来指向新创建的对象。

## 工厂模式的分类

工厂模式主要有三种形态：

1. **简单工厂（Simple Factory）**：又称静态工厂方法模式
2. **工厂方法（Factory Method）**：定义创建对象的接口，让子类决定实例化哪个类
3. **抽象工厂（Abstract Factory）**：提供一个创建一系列相关或相互依赖对象的接口

## 1. 简单工厂模式

### 定义

简单工厂模式由一个工厂对象决定创建哪一种产品类的实例。客户端只需要传入工厂类的参数，无需关心如何创建对象的逻辑。

### 基础实现

```javascript
// 产品类
class User {
  constructor(name, role) {
    this.name = name;
    this.role = role;
  }

  getInfo() {
    return `${this.name} - ${this.role}`;
  }
}

class Admin extends User {
  constructor(name) {
    super(name, 'Admin');
  }

  manage() {
    console.log(`${this.name} 具有管理权限`);
  }
}

class Guest extends User {
  constructor(name) {
    super(name, 'Guest');
  }

  browse() {
    console.log(`${this.name} 只能浏览`);
  }
}

class VIP extends User {
  constructor(name) {
    super(name, 'VIP');
  }

  享受特权() {
    console.log(`${this.name} 享有VIP特权`);
  }
}

// 简单工厂
class UserFactory {
  static createUser(name, role) {
    switch (role) {
      case 'admin':
        return new Admin(name);
      case 'guest':
        return new Guest(name);
      case 'vip':
        return new VIP(name);
      default:
        throw new Error('Invalid role');
    }
  }
}

// 使用
const admin = UserFactory.createUser('张三', 'admin');
const guest = UserFactory.createUser('李四', 'guest');
const vip = UserFactory.createUser('王五', 'vip');

admin.manage(); // 张三 具有管理权限
guest.browse(); // 李四 只能浏览
vip.享受特权(); // 王五 享有VIP特权
```

### 优化：使用映射表

```javascript
// 更灵活的简单工厂
class UserFactory {
  constructor() {
    this.roleMap = {
      admin: Admin,
      guest: Guest,
      vip: VIP
    };
  }

  createUser(name, role) {
    const UserClass = this.roleMap[role];
    if (!UserClass) {
      throw new Error(`Invalid role: ${role}`);
    }
    return new UserClass(name);
  }

  // 注册新角色
  registerRole(role, UserClass) {
    this.roleMap[role] = UserClass;
  }
}

// 使用
const factory = new UserFactory();

// 动态注册新角色
class SuperAdmin extends User {
  constructor(name) {
    super(name, 'SuperAdmin');
  }
}

factory.registerRole('superadmin', SuperAdmin);
const superAdmin = factory.createUser('赵六', 'superadmin');
```

### 实际应用：createElement

```javascript
// React 的 createElement 就是简单工厂模式
function createElement(type, props, ...children) {
  // 根据 type 创建不同的元素
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === 'object'
          ? child
          : createTextElement(child)
      )
    }
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  };
}

// 使用
const element = createElement(
  'div',
  { id: 'container' },
  createElement('h1', null, 'Hello'),
  createElement('p', null, 'World')
);
```

## 2. 工厂方法模式

### 定义

工厂方法模式定义一个用于创建对象的接口，让子类决定实例化哪一个类。工厂方法使一个类的实例化延迟到其子类。

### 基础实现

```javascript
// 抽象产品
class Product {
  use() {
    throw new Error('子类必须实现 use 方法');
  }
}

// 具体产品
class ConcreteProductA extends Product {
  use() {
    console.log('使用产品 A');
  }
}

class ConcreteProductB extends Product {
  use() {
    console.log('使用产品 B');
  }
}

// 抽象工厂
class Factory {
  createProduct() {
    throw new Error('子类必须实现 createProduct 方法');
  }

  operation() {
    const product = this.createProduct();
    product.use();
  }
}

// 具体工厂
class ConcreteFactoryA extends Factory {
  createProduct() {
    return new ConcreteProductA();
  }
}

class ConcreteFactoryB extends Factory {
  createProduct() {
    return new ConcreteProductB();
  }
}

// 使用
const factoryA = new ConcreteFactoryA();
factoryA.operation(); // 使用产品 A

const factoryB = new ConcreteFactoryB();
factoryB.operation(); // 使用产品 B
```

### 实际应用：不同类型的弹窗

```javascript
// 抽象弹窗
class Dialog {
  constructor(title, content) {
    this.title = title;
    this.content = content;
  }

  render() {
    throw new Error('子类必须实现 render 方法');
  }

  show() {
    const element = this.render();
    document.body.appendChild(element);
  }
}

// 具体弹窗：警告框
class AlertDialog extends Dialog {
  render() {
    const div = document.createElement('div');
    div.className = 'alert-dialog';
    div.innerHTML = `
      <div class="dialog-mask"></div>
      <div class="dialog-content">
        <div class="dialog-header">${this.title}</div>
        <div class="dialog-body">${this.content}</div>
        <button class="dialog-btn">确定</button>
      </div>
    `;
    return div;
  }
}

// 具体弹窗：确认框
class ConfirmDialog extends Dialog {
  render() {
    const div = document.createElement('div');
    div.className = 'confirm-dialog';
    div.innerHTML = `
      <div class="dialog-mask"></div>
      <div class="dialog-content">
        <div class="dialog-header">${this.title}</div>
        <div class="dialog-body">${this.content}</div>
        <button class="dialog-btn-cancel">取消</button>
        <button class="dialog-btn-confirm">确定</button>
      </div>
    `;
    return div;
  }
}

// 具体弹窗：输入框
class PromptDialog extends Dialog {
  render() {
    const div = document.createElement('div');
    div.className = 'prompt-dialog';
    div.innerHTML = `
      <div class="dialog-mask"></div>
      <div class="dialog-content">
        <div class="dialog-header">${this.title}</div>
        <div class="dialog-body">
          ${this.content}
          <input type="text" class="dialog-input" />
        </div>
        <button class="dialog-btn-cancel">取消</button>
        <button class="dialog-btn-confirm">确定</button>
      </div>
    `;
    return div;
  }
}

// 抽象工厂
class DialogFactory {
  createDialog(title, content) {
    throw new Error('子类必须实现 createDialog 方法');
  }

  showDialog(title, content) {
    const dialog = this.createDialog(title, content);
    dialog.show();
    return dialog;
  }
}

// 具体工厂
class AlertDialogFactory extends DialogFactory {
  createDialog(title, content) {
    return new AlertDialog(title, content);
  }
}

class ConfirmDialogFactory extends DialogFactory {
  createDialog(title, content) {
    return new ConfirmDialog(title, content);
  }
}

class PromptDialogFactory extends DialogFactory {
  createDialog(title, content) {
    return new PromptDialog(title, content);
  }
}

// 使用
const alertFactory = new AlertDialogFactory();
alertFactory.showDialog('提示', '操作成功');

const confirmFactory = new ConfirmDialogFactory();
confirmFactory.showDialog('确认', '确定要删除吗？');

const promptFactory = new PromptDialogFactory();
promptFactory.showDialog('输入', '请输入您的姓名：');
```

## 3. 抽象工厂模式

### 定义

抽象工厂模式提供一个创建一系列相关或相互依赖对象的接口，而无需指定它们具体的类。

### 基础实现

```javascript
// 抽象产品族：按钮
class Button {
  render() {
    throw new Error('子类必须实现 render 方法');
  }
}

// 抽象产品族：输入框
class Input {
  render() {
    throw new Error('子类必须实现 render 方法');
  }
}

// 具体产品：Windows 按钮
class WindowsButton extends Button {
  render() {
    console.log('渲染 Windows 风格按钮');
    return '<button class="windows-btn">Windows Button</button>';
  }
}

// 具体产品：Mac 按钮
class MacButton extends Button {
  render() {
    console.log('渲染 Mac 风格按钮');
    return '<button class="mac-btn">Mac Button</button>';
  }
}

// 具体产品：Windows 输入框
class WindowsInput extends Input {
  render() {
    console.log('渲染 Windows 风格输入框');
    return '<input class="windows-input" />';
  }
}

// 具体产品：Mac 输入框
class MacInput extends Input {
  render() {
    console.log('渲染 Mac 风格输入框');
    return '<input class="mac-input" />';
  }
}

// 抽象工厂
class UIFactory {
  createButton() {
    throw new Error('子类必须实现 createButton 方法');
  }

  createInput() {
    throw new Error('子类必须实现 createInput 方法');
  }
}

// 具体工厂：Windows UI 工厂
class WindowsUIFactory extends UIFactory {
  createButton() {
    return new WindowsButton();
  }

  createInput() {
    return new WindowsInput();
  }
}

// 具体工厂：Mac UI 工厂
class MacUIFactory extends UIFactory {
  createButton() {
    return new MacButton();
  }

  createInput() {
    return new MacInput();
  }
}

// 客户端代码
class Application {
  constructor(factory) {
    this.factory = factory;
  }

  render() {
    const button = this.factory.createButton();
    const input = this.factory.createInput();

    console.log(button.render());
    console.log(input.render());
  }
}

// 使用
const os = 'Windows'; // 可以根据运行环境动态确定

let factory;
if (os === 'Windows') {
  factory = new WindowsUIFactory();
} else if (os === 'Mac') {
  factory = new MacUIFactory();
}

const app = new Application(factory);
app.render();
```

### 实际应用：主题系统

```javascript
// 抽象产品：颜色
class Color {
  getValue() {
    throw new Error('子类必须实现 getValue 方法');
  }
}

// 抽象产品：字体
class Font {
  getValue() {
    throw new Error('子类必须实现 getValue 方法');
  }
}

// 具体产品：浅色主题颜色
class LightColor extends Color {
  getValue() {
    return {
      primary: '#1890ff',
      background: '#ffffff',
      text: '#333333'
    };
  }
}

// 具体产品：深色主题颜色
class DarkColor extends Color {
  getValue() {
    return {
      primary: '#177ddc',
      background: '#141414',
      text: '#ffffff'
    };
  }
}

// 具体产品：默认字体
class DefaultFont extends Font {
  getValue() {
    return {
      family: 'Arial, sans-serif',
      size: '14px',
      weight: 'normal'
    };
  }
}

// 具体产品：大字体
class LargeFont extends Font {
  getValue() {
    return {
      family: 'Arial, sans-serif',
      size: '18px',
      weight: 'bold'
    };
  }
}

// 抽象工厂：主题工厂
class ThemeFactory {
  createColor() {
    throw new Error('子类必须实现 createColor 方法');
  }

  createFont() {
    throw new Error('子类必须实现 createFont 方法');
  }
}

// 具体工厂：浅色主题
class LightThemeFactory extends ThemeFactory {
  createColor() {
    return new LightColor();
  }

  createFont() {
    return new DefaultFont();
  }
}

// 具体工厂：深色主题
class DarkThemeFactory extends ThemeFactory {
  createColor() {
    return new DarkColor();
  }

  createFont() {
    return new DefaultFont();
  }
}

// 具体工厂：高对比度主题（无障碍）
class HighContrastThemeFactory extends ThemeFactory {
  createColor() {
    return new DarkColor();
  }

  createFont() {
    return new LargeFont();
  }
}

// 主题管理器
class ThemeManager {
  constructor(factory) {
    this.factory = factory;
    this.theme = this.createTheme();
  }

  createTheme() {
    const color = this.factory.createColor();
    const font = this.factory.createFont();

    return {
      color: color.getValue(),
      font: font.getValue()
    };
  }

  applyTheme() {
    const { color, font } = this.theme;

    document.documentElement.style.setProperty('--primary-color', color.primary);
    document.documentElement.style.setProperty('--bg-color', color.background);
    document.documentElement.style.setProperty('--text-color', color.text);
    document.documentElement.style.setProperty('--font-family', font.family);
    document.documentElement.style.setProperty('--font-size', font.size);
    document.documentElement.style.setProperty('--font-weight', font.weight);
  }

  switchTheme(factory) {
    this.factory = factory;
    this.theme = this.createTheme();
    this.applyTheme();
  }
}

// 使用
const lightTheme = new LightThemeFactory();
const themeManager = new ThemeManager(lightTheme);
themeManager.applyTheme();

// 切换到深色主题
const darkTheme = new DarkThemeFactory();
themeManager.switchTheme(darkTheme);

// 切换到高对比度主题
const highContrastTheme = new HighContrastThemeFactory();
themeManager.switchTheme(highContrastTheme);
```

## 实际应用场景

### 1. jQuery 的 $() 方法

```javascript
// jQuery 的 $() 是一个工厂函数
class jQuery {
  constructor(selector) {
    if (typeof selector === 'string') {
      // 选择器
      this.elements = document.querySelectorAll(selector);
    } else if (selector instanceof HTMLElement) {
      // DOM 元素
      this.elements = [selector];
    } else if (Array.isArray(selector)) {
      // 数组
      this.elements = selector;
    }

    this.length = this.elements.length;
  }

  css(prop, value) {
    this.elements.forEach(el => {
      el.style[prop] = value;
    });
    return this; // 链式调用
  }

  on(event, handler) {
    this.elements.forEach(el => {
      el.addEventListener(event, handler);
    });
    return this;
  }
}

// 工厂函数
function $(selector) {
  return new jQuery(selector);
}

// 使用
$('#app').css('color', 'red').on('click', () => {
  console.log('clicked');
});
```

### 2. 不同类型的图表创建

```javascript
// 图表基类
class Chart {
  constructor(data) {
    this.data = data;
  }

  render() {
    throw new Error('子类必须实现 render 方法');
  }
}

// 柱状图
class BarChart extends Chart {
  render() {
    console.log('渲染柱状图:', this.data);
    // 实际渲染逻辑
    return {
      type: 'bar',
      data: this.data,
      options: {
        // 柱状图配置
      }
    };
  }
}

// 折线图
class LineChart extends Chart {
  render() {
    console.log('渲染折线图:', this.data);
    return {
      type: 'line',
      data: this.data,
      options: {
        // 折线图配置
      }
    };
  }
}

// 饼图
class PieChart extends Chart {
  render() {
    console.log('渲染饼图:', this.data);
    return {
      type: 'pie',
      data: this.data,
      options: {
        // 饼图配置
      }
    };
  }
}

// 图表工厂
class ChartFactory {
  static chartMap = {
    bar: BarChart,
    line: LineChart,
    pie: PieChart
  };

  static createChart(type, data) {
    const ChartClass = this.chartMap[type];

    if (!ChartClass) {
      throw new Error(`不支持的图表类型: ${type}`);
    }

    return new ChartClass(data);
  }

  // 注册新图表类型
  static registerChart(type, ChartClass) {
    this.chartMap[type] = ChartClass;
  }
}

// 使用
const data = [10, 20, 30, 40, 50];

const barChart = ChartFactory.createChart('bar', data);
barChart.render();

const lineChart = ChartFactory.createChart('line', data);
lineChart.render();

const pieChart = ChartFactory.createChart('pie', data);
pieChart.render();

// 注册新图表类型
class ScatterChart extends Chart {
  render() {
    console.log('渲染散点图:', this.data);
    return {
      type: 'scatter',
      data: this.data
    };
  }
}

ChartFactory.registerChart('scatter', ScatterChart);
const scatterChart = ChartFactory.createChart('scatter', data);
scatterChart.render();
```

### 3. HTTP 请求工厂

```javascript
// 请求基类
class Request {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
  }

  send() {
    throw new Error('子类必须实现 send 方法');
  }
}

// GET 请求
class GetRequest extends Request {
  send() {
    console.log('发送 GET 请求:', this.url);
    return fetch(this.url, {
      method: 'GET',
      ...this.options
    });
  }
}

// POST 请求
class PostRequest extends Request {
  send() {
    console.log('发送 POST 请求:', this.url);
    return fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.options.headers
      },
      body: JSON.stringify(this.options.data),
      ...this.options
    });
  }
}

// PUT 请求
class PutRequest extends Request {
  send() {
    console.log('发送 PUT 请求:', this.url);
    return fetch(this.url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.options.headers
      },
      body: JSON.stringify(this.options.data),
      ...this.options
    });
  }
}

// DELETE 请求
class DeleteRequest extends Request {
  send() {
    console.log('发送 DELETE 请求:', this.url);
    return fetch(this.url, {
      method: 'DELETE',
      ...this.options
    });
  }
}

// 请求工厂
class RequestFactory {
  static requestMap = {
    GET: GetRequest,
    POST: PostRequest,
    PUT: PutRequest,
    DELETE: DeleteRequest
  };

  static createRequest(method, url, options) {
    const RequestClass = this.requestMap[method.toUpperCase()];

    if (!RequestClass) {
      throw new Error(`不支持的请求方法: ${method}`);
    }

    return new RequestClass(url, options);
  }
}

// 封装 API 客户端
class ApiClient {
  get(url, options) {
    const request = RequestFactory.createRequest('GET', url, options);
    return request.send();
  }

  post(url, data, options = {}) {
    const request = RequestFactory.createRequest('POST', url, { ...options, data });
    return request.send();
  }

  put(url, data, options = {}) {
    const request = RequestFactory.createRequest('PUT', url, { ...options, data });
    return request.send();
  }

  delete(url, options) {
    const request = RequestFactory.createRequest('DELETE', url, options);
    return request.send();
  }
}

// 使用
const api = new ApiClient();

api.get('/api/users');
api.post('/api/users', { name: '张三', age: 25 });
api.put('/api/users/1', { name: '李四', age: 30 });
api.delete('/api/users/1');
```

### 4. 表单验证器工厂

```javascript
// 验证器基类
class Validator {
  constructor(value, errorMsg) {
    this.value = value;
    this.errorMsg = errorMsg;
  }

  validate() {
    throw new Error('子类必须实现 validate 方法');
  }
}

// 必填验证
class RequiredValidator extends Validator {
  validate() {
    if (!this.value || this.value.trim() === '') {
      return {
        valid: false,
        message: this.errorMsg || '该字段不能为空'
      };
    }
    return { valid: true };
  }
}

// 邮箱验证
class EmailValidator extends Validator {
  validate() {
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(this.value)) {
      return {
        valid: false,
        message: this.errorMsg || '请输入正确的邮箱格式'
      };
    }
    return { valid: true };
  }
}

// 手机号验证
class PhoneValidator extends Validator {
  validate() {
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(this.value)) {
      return {
        valid: false,
        message: this.errorMsg || '请输入正确的手机号'
      };
    }
    return { valid: true };
  }
}

// 长度验证
class LengthValidator extends Validator {
  constructor(value, min, max, errorMsg) {
    super(value, errorMsg);
    this.min = min;
    this.max = max;
  }

  validate() {
    const len = this.value.length;
    if (len < this.min || len > this.max) {
      return {
        valid: false,
        message: this.errorMsg || `长度应在 ${this.min} 到 ${this.max} 之间`
      };
    }
    return { valid: true };
  }
}

// 验证器工厂
class ValidatorFactory {
  static validatorMap = {
    required: RequiredValidator,
    email: EmailValidator,
    phone: PhoneValidator,
    length: LengthValidator
  };

  static createValidator(type, value, ...args) {
    const ValidatorClass = this.validatorMap[type];

    if (!ValidatorClass) {
      throw new Error(`不支持的验证类型: ${type}`);
    }

    return new ValidatorClass(value, ...args);
  }
}

// 表单验证
class FormValidator {
  constructor(rules) {
    this.rules = rules;
  }

  validate(formData) {
    const errors = {};

    for (const field in this.rules) {
      const fieldRules = this.rules[field];
      const value = formData[field];

      for (const rule of fieldRules) {
        const { type, ...params } = rule;
        const validator = ValidatorFactory.createValidator(
          type,
          value,
          ...Object.values(params)
        );

        const result = validator.validate();

        if (!result.valid) {
          errors[field] = result.message;
          break; // 一个字段只显示第一个错误
        }
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// 使用
const formValidator = new FormValidator({
  username: [
    { type: 'required' },
    { type: 'length', min: 3, max: 20, errorMsg: '用户名长度为3-20个字符' }
  ],
  email: [
    { type: 'required' },
    { type: 'email' }
  ],
  phone: [
    { type: 'required' },
    { type: 'phone' }
  ]
});

const formData = {
  username: 'ab',
  email: 'invalid-email',
  phone: '12345678901'
};

const result = formValidator.validate(formData);
console.log(result);
// {
//   valid: false,
//   errors: {
//     username: '用户名长度为3-20个字符',
//     email: '请输入正确的邮箱格式'
//   }
// }
```

## 优缺点分析

### 优点

1. **解耦**：客户端不需要知道创建对象的具体类名
2. **扩展性**：新增产品类型时，只需添加新的工厂类
3. **灵活性**：可以根据条件动态选择创建对象
4. **单一职责**：对象创建逻辑集中管理
5. **符合开闭原则**：对扩展开放，对修改封闭

### 缺点

1. **类的数量增加**：每个产品都需要一个工厂类
2. **复杂性提高**：增加了系统的抽象性和理解难度
3. **运行时开销**：通过工厂创建对象会有一定的性能开销

## 三种工厂模式对比

| 特性 | 简单工厂 | 工厂方法 | 抽象工厂 |
|------|---------|---------|---------|
| **复杂度** | 低 | 中 | 高 |
| **灵活性** | 低 | 中 | 高 |
| **扩展性** | 差（需修改工厂） | 好（新增子类） | 好（新增工厂族） |
| **适用场景** | 产品类型少 | 产品类型多 | 产品族多 |
| **类的数量** | 少 | 多 | 最多 |

