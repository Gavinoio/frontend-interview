# 策略模式（Strategy Pattern）

## 定义

策略模式定义了一系列算法，把它们一个个封装起来，并且使它们可以互相替换。策略模式让算法独立于使用它的客户端而变化。

## 核心思想

将**做什么**和**怎么做**分离：
- **Context（上下文）**：维护对策略对象的引用
- **Strategy（策略接口）**：定义算法接口
- **ConcreteStrategy（具体策略）**：实现具体算法

## 基���实现

```javascript
// 策略接口（JavaScript 中通常省略）
class Strategy {
  execute(data) {
    throw new Error('子类必须实现 execute 方法');
  }
}

// 具体策略A
class ConcreteStrategyA extends Strategy {
  execute(data) {
    console.log('使用策略A处理:', data);
    return data * 2;
  }
}

// 具体策略B
class ConcreteStrategyB extends Strategy {
  execute(data) {
    console.log('使用策略B处理:', data);
    return data * 3;
  }
}

// 具体策略C
class ConcreteStrategyC extends Strategy {
  execute(data) {
    console.log('使用策略C处理:', data);
    return data * 4;
  }
}

// 上下文
class Context {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  executeStrategy(data) {
    return this.strategy.execute(data);
  }
}

// 使用
const context = new Context(new ConcreteStrategyA());
console.log(context.executeStrategy(10)); // 20

context.setStrategy(new ConcreteStrategyB());
console.log(context.executeStrategy(10)); // 30

context.setStrategy(new ConcreteStrategyC());
console.log(context.executeStrategy(10)); // 40
```

## JavaScript 中的策略模式

JavaScript 中由于函数是一等公民，策略模式可以更简洁地实现：

```javascript
// 策略对象
const strategies = {
  A: (data) => data * 2,
  B: (data) => data * 3,
  C: (data) => data * 4
};

// 上下文
class Context {
  constructor(strategyName) {
    this.strategy = strategies[strategyName];
  }

  setStrategy(strategyName) {
    this.strategy = strategies[strategyName];
  }

  executeStrategy(data) {
    if (!this.strategy) {
      throw new Error('未设置策略');
    }
    return this.strategy(data);
  }
}

// 使用
const context = new Context('A');
console.log(context.executeStrategy(10)); // 20

context.setStrategy('B');
console.log(context.executeStrategy(10)); // 30
```

## 实际应用场景

### 1. 表单验证（最常见）

```javascript
// 验证策略
const validationStrategies = {
  // 必填验证
  required: (value, errorMsg) => {
    if (!value || value.trim() === '') {
      return errorMsg || '该字段不能为空';
    }
  },

  // 最小长度验证
  minLength: (value, length, errorMsg) => {
    if (value.length < length) {
      return errorMsg || `长度不能少于${length}个字符`;
    }
  },

  // 最大长度验证
  maxLength: (value, length, errorMsg) => {
    if (value.length > length) {
      return errorMsg || `长度不能超过${length}个字符`;
    }
  },

  // 邮箱验证
  email: (value, errorMsg) => {
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(value)) {
      return errorMsg || '请输入正确的邮箱格式';
    }
  },

  // 手机号验证
  phone: (value, errorMsg) => {
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(value)) {
      return errorMsg || '请输入正确的手机号';
    }
  },

  // 身份证验证
  idCard: (value, errorMsg) => {
    const idCardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (!idCardReg.test(value)) {
      return errorMsg || '请输入正确的身份证号';
    }
  },

  // 密码强度验证
  password: (value, errorMsg) => {
    // 至少8位，包含大小写字母和数字
    const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordReg.test(value)) {
      return errorMsg || '密码至少8位，包含大小写字母和数字';
    }
  },

  // 自定义正则验证
  pattern: (value, pattern, errorMsg) => {
    if (!pattern.test(value)) {
      return errorMsg || '格式不正确';
    }
  }
};

// 验证器类
class Validator {
  constructor() {
    this.rules = {};
  }

  // 添加验证规则
  addRule(field, rules) {
    this.rules[field] = rules;
    return this; // 链式调用
  }

  // 验证单个字段
  validateField(field, value) {
    const rules = this.rules[field];
    if (!rules) return null;

    for (const rule of rules) {
      const { strategy, params = [], errorMsg } = rule;
      const validator = validationStrategies[strategy];

      if (!validator) {
        console.warn(`未找到验证策略: ${strategy}`);
        continue;
      }

      const error = validator(value, ...params, errorMsg);
      if (error) {
        return error;
      }
    }

    return null;
  }

  // 验证所有字段
  validate(formData) {
    const errors = {};

    for (const field in this.rules) {
      const value = formData[field];
      const error = this.validateField(field, value);

      if (error) {
        errors[field] = error;
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  // 注册自定义验证策略
  static registerStrategy(name, validator) {
    validationStrategies[name] = validator;
  }
}

// 使用示例
const validator = new Validator();

validator
  .addRule('username', [
    { strategy: 'required' },
    { strategy: 'minLength', params: [3], errorMsg: '用户名至少3个字符' },
    { strategy: 'maxLength', params: [20] }
  ])
  .addRule('email', [
    { strategy: 'required' },
    { strategy: 'email' }
  ])
  .addRule('phone', [
    { strategy: 'required' },
    { strategy: 'phone' }
  ])
  .addRule('password', [
    { strategy: 'required' },
    { strategy: 'password' }
  ]);

// 验证表单
const formData = {
  username: 'ab',
  email: 'invalid-email',
  phone: '12345678901',
  password: 'weak'
};

const result = validator.validate(formData);
console.log(result);
// {
//   valid: false,
//   errors: {
//     username: '用户名至少3个字符',
//     email: '请输入正确的邮箱格式',
//     password: '密码至少8位，包含大小写字母和数字'
//   }
// }

// 注册自定义验证策略
Validator.registerStrategy('url', (value, errorMsg) => {
  const urlReg = /^https?:\/\/.+/;
  if (!urlReg.test(value)) {
    return errorMsg || '请输入正确的URL';
  }
});

validator.addRule('website', [
  { strategy: 'url', errorMsg: '请输入有效的网站地址' }
]);
```

### 2. 动画策略

```javascript
// 缓动函数策略
const easingStrategies = {
  // 线性
  linear: (t) => t,

  // 二次方缓入
  easeInQuad: (t) => t * t,

  // 二次方缓出
  easeOutQuad: (t) => t * (2 - t),

  // 二次方缓入缓出
  easeInOutQuad: (t) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },

  // 三次方缓入
  easeInCubic: (t) => t * t * t,

  // 三次方缓出
  easeOutCubic: (t) => {
    return (--t) * t * t + 1;
  },

  // 弹性缓出
  easeOutElastic: (t) => {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
  },

  // 回弹缓出
  easeOutBounce: (t) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  }
};

// 动画类
class Animator {
  constructor(options = {}) {
    this.duration = options.duration || 1000;
    this.easing = easingStrategies[options.easing] || easingStrategies.linear;
    this.onUpdate = options.onUpdate || (() => {});
    this.onComplete = options.onComplete || (() => {});
  }

  animate(from, to) {
    const startTime = Date.now();
    const delta = to - from;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / this.duration, 1);

      // 应用缓动函数
      const easedProgress = this.easing(progress);
      const currentValue = from + delta * easedProgress;

      this.onUpdate(currentValue, progress);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        this.onComplete();
      }
    };

    requestAnimationFrame(tick);
  }

  // 动态切换缓动策略
  setEasing(easingName) {
    this.easing = easingStrategies[easingName] || easingStrategies.linear;
    return this;
  }
}

// 使用示例
const box = document.getElementById('box');

const animator = new Animator({
  duration: 2000,
  easing: 'easeOutBounce',
  onUpdate: (value) => {
    box.style.transform = `translateX(${value}px)`;
  },
  onComplete: () => {
    console.log('动画完成');
  }
});

animator.animate(0, 500);

// 可以动态切换缓动函数
// animator.setEasing('easeOutElastic').animate(0, 500);
```

### 3. 价格计算策略

```javascript
// 价格计算策略
const pricingStrategies = {
  // 无折扣
  none: (price) => {
    return {
      finalPrice: price,
      discount: 0,
      saved: 0
    };
  },

  // 满减
  fullReduction: (price, { threshold, reduction }) => {
    if (price >= threshold) {
      const finalPrice = price - reduction;
      return {
        finalPrice,
        discount: reduction,
        saved: reduction,
        description: `满${threshold}减${reduction}`
      };
    }
    return pricingStrategies.none(price);
  },

  // 打折
  percentage: (price, { discount }) => {
    const finalPrice = price * discount;
    const saved = price - finalPrice;
    return {
      finalPrice,
      discount: (1 - discount) * 100,
      saved,
      description: `${discount * 10}折`
    };
  },

  // VIP折扣
  vip: (price, { level }) => {
    const discountMap = {
      1: 0.95, // 9.5折
      2: 0.9,  // 9折
      3: 0.85, // 8.5折
      4: 0.8,  // 8折
      5: 0.75  // 7.5折
    };

    const discount = discountMap[level] || 1;
    const finalPrice = price * discount;
    const saved = price - finalPrice;

    return {
      finalPrice,
      discount: (1 - discount) * 100,
      saved,
      description: `VIP${level} ${discount * 10}折`
    };
  },

  // 满件折扣
  quantityDiscount: (price, { quantity, discountRules }) => {
    // discountRules: [{ min: 2, discount: 0.9 }, { min: 5, discount: 0.8 }]
    const rule = discountRules
      .filter(r => quantity >= r.min)
      .sort((a, b) => b.discount - a.discount)[0];

    if (rule) {
      const finalPrice = price * rule.discount;
      const saved = price - finalPrice;
      return {
        finalPrice,
        discount: (1 - rule.discount) * 100,
        saved,
        description: `满${rule.min}件${rule.discount * 10}折`
      };
    }

    return pricingStrategies.none(price);
  },

  // 新人优惠
  newUser: (price, { discount }) => {
    const finalPrice = price * discount;
    const saved = price - finalPrice;
    return {
      finalPrice,
      discount: (1 - discount) * 100,
      saved,
      description: `新人专享${discount * 10}折`
    };
  }
};

// 价格计算器
class PriceCalculator {
  constructor(strategy = 'none', params = {}) {
    this.setStrategy(strategy, params);
  }

  setStrategy(strategy, params = {}) {
    this.strategy = pricingStrategies[strategy];
    this.params = params;

    if (!this.strategy) {
      throw new Error(`未找到定价策略: ${strategy}`);
    }

    return this;
  }

  calculate(price) {
    return this.strategy(price, this.params);
  }

  // 计算多个商品的总价
  calculateCart(items) {
    const results = items.map(item => {
      const result = this.calculate(item.price * item.quantity);
      return {
        ...item,
        ...result
      };
    });

    const total = results.reduce((sum, item) => sum + item.finalPrice, 0);
    const originalTotal = results.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalSaved = originalTotal - total;

    return {
      items: results,
      total,
      originalTotal,
      totalSaved
    };
  }
}

// 使用示例
const calculator = new PriceCalculator();

// 1. 无折扣
console.log(calculator.calculate(100));
// { finalPrice: 100, discount: 0, saved: 0 }

// 2. 满减
calculator.setStrategy('fullReduction', { threshold: 200, reduction: 50 });
console.log(calculator.calculate(250));
// { finalPrice: 200, discount: 50, saved: 50, description: '满200减50' }

// 3. 打折
calculator.setStrategy('percentage', { discount: 0.8 });
console.log(calculator.calculate(100));
// { finalPrice: 80, discount: 20, saved: 20, description: '8折' }

// 4. VIP折扣
calculator.setStrategy('vip', { level: 3 });
console.log(calculator.calculate(100));
// { finalPrice: 85, discount: 15, saved: 15, description: 'VIP3 8.5折' }

// 5. 计算购物车
calculator.setStrategy('vip', { level: 2 });
const cart = [
  { id: 1, name: '商品A', price: 100, quantity: 2 },
  { id: 2, name: '商品B', price: 200, quantity: 1 }
];

console.log(calculator.calculateCart(cart));
```

### 4. 支付方式策略

```javascript
// 支付策略
const paymentStrategies = {
  // 支付宝
  alipay: {
    validate: (account) => {
      // 验证支付宝账号
      const alipayReg = /^1[3-9]\d{9}$|^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return alipayReg.test(account);
    },
    pay: async (order, account) => {
      console.log(`使用支付宝支付 ${order.amount} 元`);
      console.log(`支付账号: ${account}`);

      // 调用支付宝 SDK
      return {
        success: true,
        method: '支付宝',
        transactionId: 'ALIPAY_' + Date.now(),
        paidAt: new Date().toISOString()
      };
    }
  },

  // 微信支付
  wechat: {
    validate: (account) => {
      // 验证微信账号
      return account && account.length > 0;
    },
    pay: async (order, account) => {
      console.log(`使用微信支付 ${order.amount} 元`);
      console.log(`微信账号: ${account}`);

      // 调用微信 SDK
      return {
        success: true,
        method: '微信支付',
        transactionId: 'WECHAT_' + Date.now(),
        paidAt: new Date().toISOString()
      };
    }
  },

  // 银行卡
  bankCard: {
    validate: (cardNumber) => {
      // 简单的银行卡号验证（Luhn算法）
      if (!/^\d{16,19}$/.test(cardNumber)) {
        return false;
      }

      let sum = 0;
      let shouldDouble = false;

      for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber[i]);

        if (shouldDouble) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }

        sum += digit;
        shouldDouble = !shouldDouble;
      }

      return sum % 10 === 0;
    },
    pay: async (order, cardNumber, cvv, expiryDate) => {
      console.log(`使用银行卡支付 ${order.amount} 元`);
      console.log(`卡号: ${cardNumber.slice(0, 4)}****${cardNumber.slice(-4)}`);

      // 调用银行接口
      return {
        success: true,
        method: '银行卡',
        transactionId: 'BANK_' + Date.now(),
        paidAt: new Date().toISOString()
      };
    }
  },

  // 余额支付
  balance: {
    validate: (userId, amount, getBalance) => {
      const balance = getBalance(userId);
      return balance >= amount;
    },
    pay: async (order, userId, deductBalance) => {
      console.log(`使用余额支付 ${order.amount} 元`);

      // 扣除余额
      await deductBalance(userId, order.amount);

      return {
        success: true,
        method: '余额支付',
        transactionId: 'BALANCE_' + Date.now(),
        paidAt: new Date().toISOString()
      };
    }
  }
};

// 支付管理器
class PaymentManager {
  constructor() {
    this.strategy = null;
  }

  setPaymentMethod(method) {
    this.strategy = paymentStrategies[method];

    if (!this.strategy) {
      throw new Error(`不支持的支付方式: ${method}`);
    }

    return this;
  }

  validate(...args) {
    if (!this.strategy) {
      throw new Error('请先设置支付方式');
    }

    return this.strategy.validate(...args);
  }

  async pay(order, ...args) {
    if (!this.strategy) {
      throw new Error('请先设置支付方式');
    }

    try {
      const result = await this.strategy.pay(order, ...args);
      console.log('支付成功:', result);
      return result;
    } catch (error) {
      console.error('支付失败:', error);
      throw error;
    }
  }
}

// 使用示例
const paymentManager = new PaymentManager();

const order = {
  id: 'ORDER_123',
  amount: 99.99,
  items: [{ name: '商品A', price: 99.99 }]
};

// 1. 支付宝支付
paymentManager.setPaymentMethod('alipay');
if (paymentManager.validate('13800138000')) {
  paymentManager.pay(order, '13800138000');
}

// 2. 微信支付
paymentManager.setPaymentMethod('wechat');
if (paymentManager.validate('wxid_123')) {
  paymentManager.pay(order, 'wxid_123');
}

// 3. 银行卡支付
paymentManager.setPaymentMethod('bankCard');
const cardNumber = '6225880012345678';
if (paymentManager.validate(cardNumber)) {
  paymentManager.pay(order, cardNumber, '123', '12/25');
}
```

### 5. 权限控制策略

```javascript
// 权限策略
const permissionStrategies = {
  // 超级管理员
  superadmin: {
    canAccess: (resource) => true, // 可以访问所有资源
    canEdit: (resource) => true,
    canDelete: (resource) => true,
    canCreate: () => true
  },

  // 管理员
  admin: {
    canAccess: (resource) => {
      const restrictedResources = ['system-config', 'user-roles'];
      return !restrictedResources.includes(resource);
    },
    canEdit: (resource) => {
      const restrictedResources = ['system-config'];
      return !restrictedResources.includes(resource);
    },
    canDelete: (resource) => {
      const restrictedResources = ['system-config', 'user-roles'];
      return !restrictedResources.includes(resource);
    },
    canCreate: () => true
  },

  // 编辑
  editor: {
    canAccess: (resource) => {
      const allowedResources = ['articles', 'comments', 'media'];
      return allowedResources.includes(resource);
    },
    canEdit: (resource) => {
      const allowedResources = ['articles', 'comments'];
      return allowedResources.includes(resource);
    },
    canDelete: (resource) => {
      return resource === 'comments';
    },
    canCreate: () => true
  },

  // 访客
  guest: {
    canAccess: (resource) => {
      const allowedResources = ['articles', 'public-pages'];
      return allowedResources.includes(resource);
    },
    canEdit: () => false,
    canDelete: () => false,
    canCreate: () => false
  }
};

// 权限管理器
class PermissionManager {
  constructor(role) {
    this.setRole(role);
  }

  setRole(role) {
    this.role = role;
    this.strategy = permissionStrategies[role];

    if (!this.strategy) {
      throw new Error(`未知角色: ${role}`);
    }

    return this;
  }

  canAccess(resource) {
    return this.strategy.canAccess(resource);
  }

  canEdit(resource) {
    return this.strategy.canEdit(resource);
  }

  canDelete(resource) {
    return this.strategy.canDelete(resource);
  }

  canCreate() {
    return this.strategy.canCreate();
  }

  // 检查多个权限
  checkPermissions(resource, actions = []) {
    const results = {};

    for (const action of actions) {
      const method = `can${action.charAt(0).toUpperCase()}${action.slice(1)}`;
      results[action] = this[method] ? this[method](resource) : false;
    }

    return results;
  }
}

// 使用示例
const pm = new PermissionManager('editor');

console.log(pm.canAccess('articles')); // true
console.log(pm.canEdit('articles')); // true
console.log(pm.canDelete('articles')); // false

// 检查多个权限
console.log(pm.checkPermissions('articles', ['access', 'edit', 'delete']));
// { access: true, edit: true, delete: false }

// 切换角色
pm.setRole('guest');
console.log(pm.canEdit('articles')); // false
```

## 策略模式 vs if-else

### 使用 if-else（不好的做法）

```javascript
function calculatePrice(type, price) {
  if (type === 'normal') {
    return price;
  } else if (type === 'member') {
    return price * 0.9;
  } else if (type === 'vip') {
    return price * 0.8;
  } else if (type === 'supervip') {
    return price * 0.7;
  } else {
    return price;
  }
}

// 缺点：
// 1. 难以维护：新增类型需要修改函数
// 2. 违反开闭原则：对修改开放
// 3. 代码冗长：大量 if-else
// 4. 难以复用：逻辑耦合在函数中
```

### 使用策略模式（好的做法）

```javascript
const strategies = {
  normal: (price) => price,
  member: (price) => price * 0.9,
  vip: (price) => price * 0.8,
  supervip: (price) => price * 0.7
};

function calculatePrice(type, price) {
  const strategy = strategies[type] || strategies.normal;
  return strategy(price);
}

// 优点：
// 1. 易于维护：新增类型只需添加策略
// 2. 符合开闭原则：对扩展开放，对修改封闭
// 3. 代码简洁：没有 if-else
// 4. 易于复用：策略可以独立使用

// 新增策略
strategies.newType = (price) => price * 0.6;
```

### 对比总结

| 特性 | if-else | 策略模式 |
|------|---------|---------|
| 可维护性 | 差 | 好 |
| 可扩展性 | 差 | 好 |
| 代码复杂度 | 高 | 低 |
| 开闭原则 | 不符合 | 符合 |
| 复用性 | 差 | 好 |
| 测试难度 | 高 | 低 |

## 优缺点分析

### 优点

1. **符合开闭原则**：对扩展开放，对修改封闭
2. **避免多重条件判断**：消除大量 if-else 或 switch-case
3. **易于扩展**：新增策略不影响现有代码
4. **易于复用**：策略可以在不同上下文中使用
5. **易于测试**：每个策略可以独立测试

### 缺点

1. **策略类增多**：每个策略都是一个类或函数
2. **客户端需要了解策略**：客户端需要知道有哪些策略可选
3. **增加了对象数量**：可能产生很多策略对象

## 面试高频题

::: details 1. 什么是策略模式？
**参考答案**：

策略模式定义了一系列算法，把它们封装起来，并且使它们可以互相替换。策略模式让算法独立于使用它的客户端。

**核心组成**：
- Context（上下文）：维护对策略的引用
- Strategy（策略）：定义算法接口
- ConcreteStrategy（具体策略）：实现具体算法
:::

::: details 2. 策略模式的应用场景？
**参考答案**：

1. **表单验证**：不同字段使用不同验证规则
2. **价格计算**：不同用户类型使用不同折扣策略
3. **动画效果**：不同的缓动函数
4. **支付方式**：支付宝、微信、银行卡等
5. **权限控制**：不同角色有不同权限
6. **排序算法**：根据场景选择不同排序策略
:::

::: details 3. 策略模式如何优化 if-else？
**参考答案**：

将每个条件分支封装成策略，通过策略映射表替代条件判断。

```javascript
// 优化前
function getDiscount(type) {
  if (type === 'vip') return 0.8;
  else if (type === 'member') return 0.9;
  else return 1;
}

// 优化后
const discounts = {
  vip: 0.8,
  member: 0.9,
  normal: 1
};

function getDiscount(type) {
  return discounts[type] || discounts.normal;
}
```
:::

::: details 4. 策略模式的优缺点？
**参考答案**：

**优点**：
- 符合开闭原则
- 消除多重条件判断
- 易于扩展和维护
- 策略可以自由切换

**缺点**：
- 策略类数量增多
- 客户端需要了解所有策略
- 增加了对象数量
:::

::: details 5. 手写一个表单验证的策略模式
参考前面"表单验证"部分的完整实现。
:::

::: details 6. 策略模式和状态模式的区别？
**参考答案**：

| 特性 | 策略模式 | 状态模式 |
|------|---------|---------|
| 目的 | 算法的选择和切换 | 状态的切换和行为变化 |
| 切换方式 | 客户端主动切换 | 状态内部自动切换 |
| 关注点 | 算法的实现方式 | 对象的状态变化 |
| 独立性 | 策略相互独立 | 状态间有转换关系 |
:::

## 总结

策略模式是前端开发中非常实用的设计模式，需要掌握：

**核心要点**：
1. **核心思想**：将算法封装成策略，让算法独立变化
2. **典型应用**：表单验证、价格计算、动画效果等
3. **优化 if-else**：用策略映射表替代条件判断
4. **符合原则**：开闭原则、单一职责原则

**面试准备**：
- 理解策略模式的核心思想
- 会手写表单验证等实际案例
- 知道如何优化 if-else
- 理解优缺点和适用场景

**学习建议**：
- 从简单场景开始实践
- 总结 if-else 过多的代码
- 尝试用策略模式重构
- 在实际项目中应用

策略模式是提高代码质量的重要手段，掌握它可以写出更优雅、更易维护的代码。
