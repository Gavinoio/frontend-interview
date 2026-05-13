# 异步编程

## 1. 为什么需要异步?

### 官方答案
JavaScript 是**单线程**语言,所有任务都在一个线程上执行。如果某个任务耗时很长(如网络请求、文件读取),就会阻塞后续代码的执行。异步编程允许长时间运行的操作在后台执行,主线程可以继续处理其他任务,提高程序的响应性和性能。

### 通俗理解
想象你在餐厅:

**同步模式**(排队):
- 点餐 → 等待做饭 → 等待上菜 → 吃饭
- 在等待期间,你什么都不能做,只能干等着

**异步模式**(拿号):
- 点餐 → 拿号 → 去玩手机/聊天
- 等号到了(回调)再去取餐
- 期间可以做其他事情

### 详细说明

```javascript
// 同步代码 - 阻塞
console.log('开始');
let result = 0;
for (let i = 0; i < 1000000000; i++) {
  result += i;  // 耗时操作,阻塞后续代码
}
console.log('结束');  // 必须等待循环完成

// 异步代码 - 非阻塞
console.log('开始');
setTimeout(() => {
  console.log('异步任务');
}, 0);
console.log('结束');
// 输出: 开始 → 结束 → 异步任务
```

---

## 2. 回调函数 (Callback)

### 基础概念
回调函数是作为参数传递给另一个函数的函数,在某个操作完成后被调用。

### 示例
```javascript
// 简单回调
function fetchData(callback) {
  setTimeout(() => {
    const data = { name: 'Alice', age: 25 };
    callback(data);  // 数据准备好后调用回调
  }, 1000);
}

fetchData((data) => {
  console.log('收到数据:', data);
});

// 真实场景:读取文件
const fs = require('fs');
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('读取失败:', err);
    return;
  }
  console.log('文件内容:', data);
});
```

### 回调地狱 (Callback Hell)
```javascript
// ❌ 多层嵌套,难以维护
getUserData(userId, (user) => {
  getOrders(user.id, (orders) => {
    getOrderDetails(orders[0].id, (details) => {
      getProductInfo(details.productId, (product) => {
        console.log('最终产品:', product);
        // 😱 无限嵌套...
      });
    });
  });
});

// 问题:
// 1. 代码横向发展,可读性差
// 2. 错误处理困难
// 3. 难以维护和调试
```

---

## 3. Promise

### 官方答案
Promise 是 ES6 引入的异步编程解决方案,代表一个异步操作的最终完成或失败。Promise 有三种状态:
- **Pending**(进行中)
- **Fulfilled**(已成功)
- **Rejected**(已失败)

状态一旦改变,就不会再变,任何时候都可以得到这个结果。

### 通俗理解
Promise 就像是**收货凭证**:

当你在网上买东西,下单后会得到一个订单号(Promise 对象)。这个订单有三种状态:
- **Pending**: 正在配送中
- **Fulfilled**: 已签收(成功)
- **Rejected**: 配送失败(失败)

你可以通过 `.then()` 设置"收到货后要做什么",通过 `.catch()` 设置"配送失败了怎么办"。

### 基础使用

#### 创建 Promise
```javascript
// 基础语法
const promise = new Promise((resolve, reject) => {
  // 执行异步操作
  setTimeout(() => {
    const success = true;

    if (success) {
      resolve('操作成功!');  // 状态: pending → fulfilled
    } else {
      reject('操作失败!');   // 状态: pending → rejected
    }
  }, 1000);
});

// 使用 Promise
promise
  .then(result => {
    console.log(result);  // '操作成功!'
  })
  .catch(error => {
    console.log(error);
  })
  .finally(() => {
    console.log('无论成功失败都会执行');
  });
```

#### Promise 链式调用
```javascript
// ✅ 解决回调地狱
function getUserData(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ id: userId, name: 'Alice' });
    }, 1000);
  });
}

function getOrders(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([{ id: 1, userId }]);
    }, 1000);
  });
}

function getOrderDetails(orderId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ id: orderId, productId: 100 });
    }, 1000);
  });
}

// 链式调用,扁平化
getUserData(1)
  .then(user => {
    console.log('用户:', user);
    return getOrders(user.id);  // 返回新的 Promise
  })
  .then(orders => {
    console.log('订单:', orders);
    return getOrderDetails(orders[0].id);
  })
  .then(details => {
    console.log('订单详情:', details);
  })
  .catch(error => {
    console.error('出错了:', error);  // 统一错误处理
  });
```

#### Promise 错误处理
```javascript
// 方式1: catch 捕获
promise
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error);
  });

// 方式2: then 的第二个参数
promise.then(
  result => {
    console.log(result);
  },
  error => {
    console.error(error);
  }
);

// 推荐使用 catch,因为它能捕获 then 中的错误
new Promise((resolve, reject) => {
  resolve('success');
})
  .then(result => {
    throw new Error('then 中的错误');
  })
  .catch(error => {
    console.error('捕获到:', error);  // 能捕获
  });

// 错误穿透
Promise.reject('错误')
  .then(res => console.log('1'))
  .then(res => console.log('2'))
  .then(res => console.log('3'))
  .catch(err => console.log('捕获:', err));  // 直接跳到 catch
```

### Promise 静态方法

#### Promise.all()
```javascript
// 等待所有 Promise 完成
const promise1 = Promise.resolve(1);
const promise2 = Promise.resolve(2);
const promise3 = Promise.resolve(3);

Promise.all([promise1, promise2, promise3])
  .then(results => {
    console.log(results);  // [1, 2, 3]
  });

// 实际应用:并发请求
Promise.all([
  fetch('/api/user'),
  fetch('/api/posts'),
  fetch('/api/comments')
])
  .then(([userRes, postsRes, commentsRes]) => {
    return Promise.all([
      userRes.json(),
      postsRes.json(),
      commentsRes.json()
    ]);
  })
  .then(([user, posts, comments]) => {
    console.log({ user, posts, comments });
  })
  .catch(error => {
    console.error('某个请求失败:', error);
  });

// 注意: 只要有一个 reject,整个 Promise.all 就 reject
const promises = [
  Promise.resolve(1),
  Promise.reject('错误'),
  Promise.resolve(3)
];

Promise.all(promises)
  .then(results => {
    console.log(results);  // 不会执行
  })
  .catch(error => {
    console.log(error);  // '错误'
  });
```

#### Promise.allSettled()
```javascript
// 等待所有 Promise 完成,不管成功还是失败
const promises = [
  Promise.resolve(1),
  Promise.reject('错误'),
  Promise.resolve(3)
];

Promise.allSettled(promises)
  .then(results => {
    console.log(results);
    /*
    [
      { status: 'fulfilled', value: 1 },
      { status: 'rejected', reason: '错误' },
      { status: 'fulfilled', value: 3 }
    ]
    */
  });

// 实际应用:批量操作,记录每个结果
const urls = ['/api/1', '/api/2', '/api/3'];
Promise.allSettled(urls.map(url => fetch(url)))
  .then(results => {
    const succeeded = results.filter(r => r.status === 'fulfilled');
    const failed = results.filter(r => r.status === 'rejected');
    console.log(`成功 ${succeeded.length} 个,失败 ${failed.length} 个`);
  });
```

#### Promise.race()
```javascript
// 返回最先完成的 Promise
const promise1 = new Promise(resolve => setTimeout(() => resolve('慢'), 1000));
const promise2 = new Promise(resolve => setTimeout(() => resolve('快'), 100));

Promise.race([promise1, promise2])
  .then(result => {
    console.log(result);  // '快'
  });

// 实际应用:请求超时处理
function fetchWithTimeout(url, timeout = 5000) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('请求超时')), timeout)
    )
  ]);
}

fetchWithTimeout('/api/data', 3000)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(error => console.error(error.message));
```

#### Promise.any()
```javascript
// 返回第一个成功的 Promise,所有失败才 reject
const promises = [
  Promise.reject('错误1'),
  Promise.reject('错误2'),
  Promise.resolve('成功')
];

Promise.any(promises)
  .then(result => {
    console.log(result);  // '成功'
  })
  .catch(error => {
    console.error(error);  // 只有全部失败才会执行
  });

// 实际应用:多个备用服务器
Promise.any([
  fetch('https://server1.com/api'),
  fetch('https://server2.com/api'),
  fetch('https://server3.com/api')
])
  .then(res => res.json())
  .then(data => console.log('从某个服务器获取到数据:', data))
  .catch(() => console.error('所有服务器都失败了'));
```

---

## 4. async/await

### 官方答案
async/await 是 ES2017 引入的异步编程语法糖,基于 Promise 实现。`async` 函数返回一个 Promise,`await` 暂停函数执行,等待 Promise 结果。

### 通俗理解
如果说 Promise 是"收货凭证",那么 async/await 就是让你可以用**同步的写法**来处理异步操作,就像在等快递一样自然。

```javascript
// Promise 链式调用
getUserData()
  .then(user => getOrders(user.id))
  .then(orders => getDetails(orders[0].id))
  .then(details => console.log(details));

// async/await - 看起来像同步代码
async function getData() {
  const user = await getUserData();
  const orders = await getOrders(user.id);
  const details = await getDetails(orders[0].id);
  console.log(details);
}
```

### 基础使用

```javascript
// async 函数声明
async function fetchData() {
  return 'data';  // 自动包装成 Promise.resolve('data')
}

fetchData().then(data => console.log(data));  // 'data'

// async 箭头函数
const fetchData2 = async () => {
  return 'data';
};

// await 只能在 async 函数中使用
async function example() {
  const result = await Promise.resolve('成功');
  console.log(result);  // '成功'
}

// ❌ 顶层 await (Node.js 14.8+ 支持)
// await Promise.resolve('data');  // 报错! (需要在 async 函数中)

// ✅ ES2022+ 支持顶层 await (在模块中)
// const data = await fetch('/api/data');
```

### 错误处理

```javascript
// 方式1: try-catch
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;  // 重新抛出或处理
  }
}

// 方式2: catch 方法
async function fetchData2() {
  const data = await fetch('/api/data')
    .catch(error => {
      console.error('请求失败:', error);
      return { default: 'data' };  // 返回默认值
    });

  return data;
}

// 方式3: Promise.catch
async function fetchData3() {
  const data = await fetch('/api/data').catch(e => console.error(e));
  return data;
}

// 统一错误处理
async function request(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('请求错误:', error);
    return null;
  }
}
```

### 并发处理

```javascript
// ❌ 串行执行 - 慢
async function sequential() {
  const user = await fetchUser();      // 等待 1s
  const posts = await fetchPosts();    // 等待 1s
  const comments = await fetchComments(); // 等待 1s
  // 总共 3s
  return { user, posts, comments };
}

// ✅ 并发执行 - 快
async function concurrent() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments()
  ]);
  // 总共约 1s (取决于最慢的那个)
  return { user, posts, comments };
}

// 部分依赖
async function partialDependency() {
  const user = await fetchUser();  // 必须先获取用户

  // 这两个可以并发
  const [posts, comments] = await Promise.all([
    fetchPosts(user.id),
    fetchComments(user.id)
  ]);

  return { user, posts, comments };
}

// 动态并发
async function fetchAllUsers(ids) {
  const promises = ids.map(id => fetchUser(id));
  const users = await Promise.all(promises);
  return users;
}
```

### 实际应用场景

```javascript
// 1. 接口调用
async function login(username, password) {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      throw new Error('登录失败');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    console.error('登录错误:', error);
    throw error;
  }
}

// 2. 文件处理
async function readFiles(filePaths) {
  const fs = require('fs').promises;
  const contents = [];

  for (const path of filePaths) {
    const content = await fs.readFile(path, 'utf8');
    contents.push(content);
  }

  return contents;
}

// 3. 数据库操作
async function updateUser(userId, data) {
  const db = await connectDB();

  try {
    await db.beginTransaction();

    await db.query('UPDATE users SET ? WHERE id = ?', [data, userId]);
    await db.query('INSERT INTO logs SET ?', { action: 'update', userId });

    await db.commit();
    return { success: true };
  } catch (error) {
    await db.rollback();
    throw error;
  } finally {
    await db.close();
  }
}

// 4. 重试机制
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log(`尝试 ${i + 1} 失败`);
      if (i === maxRetries - 1) throw error;

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

---

## 5. 手写 Promise

### 简易版 Promise
```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';  // pending, fulfilled, rejected
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];  // 成功回调队列
    this.onRejectedCallbacks = [];   // 失败回调队列

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };

    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === 'fulfilled') {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolve(x);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.state === 'rejected') {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolve(x);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.state === 'pending') {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolve(x);
            } catch (error) {
              reject(error);
            }
          });
        });

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolve(x);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    });

    return promise2;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  static resolve(value) {
    return new MyPromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = [];
      let count = 0;

      promises.forEach((promise, index) => {
        Promise.resolve(promise).then(value => {
          results[index] = value;
          count++;
          if (count === promises.length) {
            resolve(results);
          }
        }, reject);
      });
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(promise => {
        Promise.resolve(promise).then(resolve, reject);
      });
    });
  }
}

// 测试
const p = new MyPromise((resolve, reject) => {
  setTimeout(() => resolve('成功'), 1000);
});

p.then(res => {
  console.log(res);
  return '链式调用';
}).then(res => {
  console.log(res);
});
```

---

## 总结

### 核心要点
1. **回调函数**: 最基础的异步方式,容易产生回调地狱
2. **Promise**: 解决回调地狱,提供链式调用和统一错误处理
3. **async/await**: Promise 的语法糖,让异步代码看起来像同步
4. **并发控制**: 合理使用 Promise.all、race 等方法

### 面试加分项
- 能手写 Promise 实现
- 理解 Promise 的状态机制
- 掌握 async/await 的错误处理
- 了解宏任务和微任务(事件循环)
- 能解决实际的异步场景问题

---

## 6. 常见面试题

::: details Q1: Promise 的三种状态是什么?
#### 一句话答案
Pending(进行中)、Fulfilled(已成功)、Rejected(已失败),状态一旦改变就不可逆。

#### 详细解答
Promise 对象代表一个异步操作,有三种状态:

1. **Pending(进行中)**
   - 初始状态,既不是成功也不是失败
   - Promise 刚被创建时的状态

2. **Fulfilled(已成功)**
   - 操作成功完成
   - 调用 `resolve()` 后进入此状态
   - 状态改变后会触发 `then()` 的成功回调

3. **Rejected(已失败)**
   - 操作失败
   - 调用 `reject()` 或抛出异常后进入此状态
   - 状态改变后会触发 `catch()` 或 `then()` 的失败回调

**关键特性**:
- 状态只能从 pending 变为 fulfilled 或 rejected
- 状态一旦改变,就不会再变,任何时候都可以得到这个结果
- 这种特性称为"不可变性"(immutable)

```javascript
const promise = new Promise((resolve, reject) => {
  // 初始状态: pending
  console.log(promise);  // Promise { <pending> }

  resolve('成功');  // 状态变为 fulfilled
  reject('失败');   // 无效,状态已经改变,不能再变
});

promise.then(
  value => console.log('成功:', value),  // 输出: 成功
  reason => console.log('失败:', reason) // 不会执行
);
```

#### 面试回答模板
"Promise 有三种状态:pending、fulfilled 和 rejected。刚创建的 Promise 处于 pending 状态,当异步操作成功时调用 resolve 进入 fulfilled 状态,失败时调用 reject 进入 rejected 状态。需要注意的是,状态一旦改变就不能再修改了,这保证了 Promise 的可靠性。在实际开发中,我们通过 then 方法获取成功结果,通过 catch 方法处理错误。"

---
:::

::: details Q2: async/await 的原理是什么?
#### 一句话答案
async/await 是 Generator 函数的语法糖,本质上是基于 Promise 和生成器实现的。

#### 详细解答
async/await 的实现原理涉及以下几个核心概念:

**1. async 函数的本质**
```javascript
// async 函数
async function foo() {
  return 'hello';
}

// 等价于
function foo() {
  return Promise.resolve('hello');
}

// 验证
console.log(foo());  // Promise { 'hello' }
foo().then(console.log);  // 'hello'
```

**2. await 的执行机制**
- `await` 会暂停 async 函数的执行
- 等待 Promise 的结果
- 然后恢复函数执行并返回结果值

```javascript
async function example() {
  console.log('1');
  const result = await Promise.resolve('2');
  console.log(result);
  console.log('3');
}

example();
console.log('4');

// 输出顺序: 1 4 2 3
// 解释: await 后面的代码相当于放在 Promise.then 中执行
```

**3. Generator 函数模拟**
```javascript
// async/await 版本
async function fetchData() {
  const data1 = await fetch('/api/1');
  const data2 = await fetch('/api/2');
  return [data1, data2];
}

// Generator 版本(原理)
function* fetchDataGenerator() {
  const data1 = yield fetch('/api/1');
  const data2 = yield fetch('/api/2');
  return [data1, data2];
}

// 自动执行器
function run(gen) {
  return new Promise((resolve, reject) => {
    const g = gen();

    function step(nextF) {
      let next;
      try {
        next = nextF();
      } catch (e) {
        return reject(e);
      }

      if (next.done) {
        return resolve(next.value);
      }

      Promise.resolve(next.value).then(
        value => step(() => g.next(value)),
        error => step(() => g.throw(error))
      );
    }

    step(() => g.next());
  });
}

// 使用
run(fetchDataGenerator).then(console.log);
```

**4. 执行流程**
```javascript
async function demo() {
  console.log('A');
  const result = await new Promise(resolve => {
    console.log('B');
    resolve('C');
  });
  console.log(result);
  console.log('D');
}

demo();
console.log('E');

// 输出: A B E C D
// 解释:
// 1. 执行 demo(),打印 A
// 2. 遇到 await,执行 Promise 构造函数,打印 B
// 3. await 暂停,继续执行外部代码,打印 E
// 4. Promise 状态改变,恢复执行,打印 C D
```

**5. 错误处理原理**
```javascript
async function errorDemo() {
  try {
    await Promise.reject('错误');
  } catch (e) {
    console.log('捕获:', e);
  }
}

// 等价于
function errorDemo() {
  return Promise.reject('错误').catch(e => {
    console.log('捕获:', e);
  });
}
```

#### 面试回答模板
"async/await 本质上是 Generator 函数和 Promise 的语法糖。async 函数会返回一个 Promise,函数内部的返回值会被 Promise.resolve 包装。await 关键字会暂停函数执行,等待 Promise 状态改变后再继续执行,它的实现原理类似于 Generator 的 yield,但提供了自动执行器。当 await 后面的 Promise 变为 fulfilled 时,会恢复函数执行并返回结果值;如果变为 rejected,则会抛出异常。这种机制让我们能用同步的写法处理异步操作,代码更加简洁易读。"

---
:::

::: details Q3: Promise.all 和 Promise.race 的区别?
#### 一句话答案
Promise.all 等所有 Promise 完成才返回,有一个失败就失败;Promise.race 返回最先完成的那个 Promise 的结果。

#### 详细解答

**Promise.all 特性:**

1. **等待所有 Promise 完成**
```javascript
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = Promise.resolve(3);

Promise.all([p1, p2, p3])
  .then(results => {
    console.log(results);  // [1, 2, 3]
    // 结果顺序与输入顺序一致
  });
```

2. **一个失败全部失败**
```javascript
const p1 = Promise.resolve(1);
const p2 = Promise.reject('错误');
const p3 = Promise.resolve(3);

Promise.all([p1, p2, p3])
  .then(results => {
    console.log(results);  // 不会执行
  })
  .catch(error => {
    console.log(error);  // '错误'
    // p3 虽然成功,但结果被丢弃
  });
```

3. **应用场景**
```javascript
// 场景1: 并发请求多个接口
Promise.all([
  fetch('/api/user'),
  fetch('/api/posts'),
  fetch('/api/comments')
])
  .then(async ([user, posts, comments]) => {
    const userData = await user.json();
    const postsData = await posts.json();
    const commentsData = await comments.json();
    return { userData, postsData, commentsData };
  });

// 场景2: 预加载多个资源
function preloadImages(urls) {
  const promises = urls.map(url => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = reject;
      img.src = url;
    });
  });

  return Promise.all(promises);
}
```

**Promise.race 特性:**

1. **返回最快的结果**
```javascript
const p1 = new Promise(resolve => setTimeout(() => resolve('慢'), 1000));
const p2 = new Promise(resolve => setTimeout(() => resolve('快'), 100));

Promise.race([p1, p2])
  .then(result => {
    console.log(result);  // '快'
    // p1 虽然也会完成,但结果被忽略
  });
```

2. **失败也算完成**
```javascript
const p1 = new Promise(resolve => setTimeout(() => resolve('成功'), 1000));
const p2 = Promise.reject('快速失败');

Promise.race([p1, p2])
  .then(result => {
    console.log(result);  // 不会执行
  })
  .catch(error => {
    console.log(error);  // '快速失败'
  });
```

3. **应用场景**
```javascript
// 场景1: 请求超时控制
function fetchWithTimeout(url, timeout = 5000) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('请求超时')), timeout)
    )
  ]);
}

fetchWithTimeout('/api/data', 3000)
  .then(res => res.json())
  .catch(error => console.error(error.message));

// 场景2: 多个服务器请求,用最快的那个
Promise.race([
  fetch('https://server1.com/api'),
  fetch('https://server2.com/api'),
  fetch('https://server3.com/api')
])
  .then(res => res.json())
  .then(data => console.log('获取到数据:', data));
```

**对比总结:**

| 特性 | Promise.all | Promise.race |
|------|-------------|--------------|
| 完成条件 | 所有 Promise 都成功 | 任意一个 Promise 完成 |
| 失败条件 | 任意一个 Promise 失败 | 最快的那个 Promise 失败 |
| 返回值 | 所有结果的数组 | 最快完成的那个结果 |
| 结果顺序 | 与输入顺序一致 | 无序,看哪个快 |
| 应用场景 | 并发请求,全部成功才继续 | 超时控制,快速响应 |

**其他相关方法:**

```javascript
// Promise.allSettled - 等待所有完成,不管成功失败
Promise.allSettled([p1, p2, p3])
  .then(results => {
    // [
    //   { status: 'fulfilled', value: 1 },
    //   { status: 'rejected', reason: '错误' },
    //   { status: 'fulfilled', value: 3 }
    // ]
  });

// Promise.any - 任意一个成功就成功,全部失败才失败
Promise.any([p1, p2, p3])
  .then(result => {
    console.log('第一个成功的:', result);
  })
  .catch(error => {
    console.log('全部失败:', error);
  });
```

#### 面试回答模板
"Promise.all 和 Promise.race 是处理多个 Promise 的两种不同策略。Promise.all 会等待所有 Promise 都完成,返回一个包含所有结果的数组,但只要有一个 Promise 失败,整个就会失败,适合并发请求多个接口且都需要成功的场景。Promise.race 则是竞速模式,返回最先完成的那个 Promise 的结果,不管成功还是失败,常用于实现请求超时控制。实际项目中我还会用 Promise.allSettled,它会等待所有 Promise 完成并返回每个的状态,适合批量操作需要知道每个结果的场景。"

---
:::

::: details Q4: 如何实现 Promise 并发控制?
#### 一句话答案
通过维护一个执行队列和计数器,控制同时执行的 Promise 数量不超过限制。

#### 详细解答

**问题背景:**
当需要发起大量异步请求时(如 1000 个),如果使用 `Promise.all` 会同时发起所有请求,可能导致:
- 浏览器连接数限制(Chrome 通常是 6 个/域名)
- 服务器压力过大
- 内存占用过高

需要实现一个并发控制器,限制同时执行的 Promise 数量。

**实现方式 1: 基础版 - 递归控制**

```javascript
/**
 * 并发控制函数
 * @param {Array} tasks - 任务数组,每个任务是返回 Promise 的函数
 * @param {Number} limit - 并发限制数
 */
async function concurrentControl(tasks, limit) {
  const results = [];  // 存储结果
  const executing = [];  // 正在执行的 Promise

  for (const [index, task] of tasks.entries()) {
    // 创建 Promise
    const p = Promise.resolve().then(() => task());
    results[index] = p;

    if (limit <= tasks.length) {
      // 当 Promise 完成后,从 executing 中移除
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);

      // 如果达到并发限制,等待一个完成
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }

  return Promise.all(results);
}

// 使用示例
const tasks = Array.from({ length: 10 }, (_, i) => {
  return () => new Promise(resolve => {
    setTimeout(() => {
      console.log(`任务 ${i + 1} 完成`);
      resolve(i + 1);
    }, Math.random() * 1000);
  });
});

concurrentControl(tasks, 3).then(results => {
  console.log('所有任务完成:', results);
});
```

**实现方式 2: 队列版 - 更易理解**

```javascript
class PromisePool {
  constructor(limit) {
    this.limit = limit;  // 并发限制
    this.count = 0;      // 当前执行数
    this.queue = [];     // 等待队列
  }

  async add(task) {
    // 如果达到限制,等待
    if (this.count >= this.limit) {
      await new Promise(resolve => this.queue.push(resolve));
    }

    this.count++;

    try {
      return await task();
    } finally {
      this.count--;

      // 执行下一个任务
      if (this.queue.length > 0) {
        const resolve = this.queue.shift();
        resolve();
      }
    }
  }

  async all(tasks) {
    return Promise.all(tasks.map(task => this.add(task)));
  }
}

// 使用示例
const pool = new PromisePool(3);

const tasks = Array.from({ length: 10 }, (_, i) => {
  return () => new Promise(resolve => {
    console.log(`任务 ${i + 1} 开始`);
    setTimeout(() => {
      console.log(`任务 ${i + 1} 完成`);
      resolve(i + 1);
    }, 1000);
  });
});

pool.all(tasks).then(results => {
  console.log('所有任务完成:', results);
});
```

**实现方式 3: async-pool(npm 包实现)**

```javascript
async function asyncPool(poolLimit, array, iteratorFn) {
  const ret = [];  // 存储所有的 Promise
  const executing = [];  // 正在执行的 Promise

  for (const item of array) {
    const p = Promise.resolve().then(() => iteratorFn(item, array));
    ret.push(p);

    if (poolLimit <= array.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);

      if (executing.length >= poolLimit) {
        await Promise.race(executing);
      }
    }
  }

  return Promise.all(ret);
}

// 使用示例
const timeout = i => new Promise(resolve =>
  setTimeout(() => resolve(i), i)
);

asyncPool(2, [1000, 5000, 3000, 2000], timeout)
  .then(results => {
    console.log(results);  // [1000, 5000, 3000, 2000]
  });
```

**实际应用场景:**

```javascript
// 场景1: 批量上传文件
async function uploadFiles(files, limit = 3) {
  const pool = new PromisePool(limit);

  const tasks = files.map(file => {
    return () => fetch('/upload', {
      method: 'POST',
      body: file
    });
  });

  return pool.all(tasks);
}

// 场景2: 批量请求接口
async function batchFetch(urls, limit = 5) {
  const results = [];
  const executing = [];

  for (const [index, url] of urls.entries()) {
    const p = fetch(url).then(res => res.json());
    results[index] = p;

    const e = p.then(() => executing.splice(executing.indexOf(e), 1));
    executing.push(e);

    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

// 场景3: 爬虫限流
async function crawlPages(urls, limit = 2) {
  const pool = new PromisePool(limit);

  const tasks = urls.map(url => {
    return async () => {
      const response = await fetch(url);
      const html = await response.text();
      console.log(`爬取完成: ${url}`);
      return html;
    };
  });

  return pool.all(tasks);
}
```

**进阶: 带错误处理的并发控制**

```javascript
class AdvancedPromisePool {
  constructor(limit, options = {}) {
    this.limit = limit;
    this.count = 0;
    this.queue = [];
    this.results = [];
    this.errors = [];
    this.retryTimes = options.retryTimes || 0;
  }

  async add(task, index) {
    if (this.count >= this.limit) {
      await new Promise(resolve => this.queue.push(resolve));
    }

    this.count++;

    let retries = 0;
    while (retries <= this.retryTimes) {
      try {
        const result = await task();
        this.results[index] = { status: 'fulfilled', value: result };
        break;
      } catch (error) {
        if (retries === this.retryTimes) {
          this.results[index] = { status: 'rejected', reason: error };
          this.errors.push({ index, error });
        }
        retries++;
      }
    }

    this.count--;

    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      resolve();
    }
  }

  async all(tasks) {
    await Promise.all(
      tasks.map((task, index) => this.add(task, index))
    );

    return {
      results: this.results,
      errors: this.errors,
      success: this.errors.length === 0
    };
  }
}

// 使用
const pool = new AdvancedPromisePool(3, { retryTimes: 2 });

const tasks = [
  () => fetch('/api/1').then(r => r.json()),
  () => fetch('/api/2').then(r => r.json()),
  () => Promise.reject('失败'),
  () => fetch('/api/4').then(r => r.json()),
];

pool.all(tasks).then(({ results, errors, success }) => {
  console.log('结果:', results);
  console.log('错误:', errors);
  console.log('是否全部成功:', success);
});
```

#### 面试回答模板
"Promise 并发控制的核心思路是维护一个执行队列和计数器,控制同时执行的 Promise 数量。具体实现时,我会创建一个 executing 数组来存储正在执行的 Promise,当数组长度达到限制时,使用 Promise.race 等待其中任意一个完成,然后再继续执行下一个任务。这样可以避免同时发起大量请求导致浏览器连接数超限或服务器压力过大。实际项目中我会封装成一个 PromisePool 类,提供更灵活的配置,比如支持失败重试、错误收集等功能。这个技术在批量上传文件、批量请求接口、爬虫限流等场景都很常用。"

---
:::

::: details Q5: 说说 Event Loop（事件循环）
#### 一句话答案
Event Loop 是 JavaScript 实现异步的核心机制,它不断从任务队列中取出任务执行,宏任务和微任务交替执行。

#### 详细解答

**执行顺序**: 同步代码 → 微任务队列（全部） → 宏任务队列（一个） → 微任务队列 → 宏任务...

```javascript
// 宏任务 (Macro Task)
// setTimeout, setInterval, setImmediate, I/O, UI rendering, requestAnimationFrame

// 微任务 (Micro Task)
// Promise.then/catch/finally, MutationObserver, queueMicrotask, process.nextTick(Node)

console.log('1');  // 同步

setTimeout(() => {
  console.log('2');  // 宏任务
  Promise.resolve().then(() => console.log('3'));  // 微任务
}, 0);

Promise.resolve().then(() => {
  console.log('4');  // 微任务
  setTimeout(() => console.log('5'), 0);  // 宏任务
});

console.log('6');  // 同步

// 输出: 1 → 6 → 4 → 2 → 3 → 5
```

**执行流程图**:
```
┌─────────────────────────────────┐
│         调用栈 (Call Stack)      │
│   执行同步代码,遇到异步放入队列    │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│    微任务队列 (Microtask Queue)  │
│  Promise.then, queueMicrotask   │
│       ← 优先级高,执行完所有       │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│    宏任务队列 (Macrotask Queue)  │
│  setTimeout, setInterval, I/O   │
│       ← 每次取一个执行           │
└─────────────────────────────────┘
```

#### 经典面试题

```javascript
// 题目1: 输出顺序
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

async1();

new Promise(resolve => {
  console.log('promise1');
  resolve();
}).then(() => {
  console.log('promise2');
});

console.log('script end');

// 答案:
// script start → async1 start → async2 → promise1 → script end
// → async1 end → promise2 → setTimeout
```

#### 面试回答模板
"Event Loop 是 JS 实现异步的核心机制。JS 是单线程的,通过事件循环来处理异步任务。执行顺序是:先执行同步代码,然后清空微任务队列(Promise.then 等),再执行一个宏任务(setTimeout 等),然后又清空微任务,如此循环。微任务优先级高于宏任务,每次宏任务执行完都会检查并执行所有微任务。"

---
:::

::: details Q6: async/await 如何进行错误处理？
#### 一句话答案
使用 try/catch 捕获错误,或者在 await 后面 .catch(),也可以封装统一的错误处理函数。

#### 详细解答

```javascript
// 方式1: try/catch（推荐）
async function fetchData() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('请求失败:', error);
    return null;
  }
}

// 方式2: await 后 .catch()
async function fetchData2() {
  const data = await fetch('/api/data')
    .then(r => r.json())
    .catch(err => {
      console.error(err);
      return null;
    });
  return data;
}

// 方式3: 封装统一处理函数（Go 风格）
async function to(promise) {
  try {
    const data = await promise;
    return [null, data];
  } catch (err) {
    return [err, null];
  }
}

// 使用
async function main() {
  const [err, data] = await to(fetch('/api/data').then(r => r.json()));
  if (err) {
    console.error('出错了:', err);
    return;
  }
  console.log('成功:', data);
}

// 方式4: 高阶函数包装
const withErrorHandling = fn => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    console.error('Error:', error);
    // 可以上报错误、显示提示等
    throw error;
  }
};

const safeFetch = withErrorHandling(async url => {
  const res = await fetch(url);
  return res.json();
});
```

---
:::

::: details Q7: 如何实现 Promise 的超时控制？
#### 详细解答

```javascript
// 方式1: Promise.race 实现超时
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms);
  });
  return Promise.race([promise, timeout]);
}

// 使用
withTimeout(fetch('/api/data'), 5000)
  .then(res => res.json())
  .catch(err => console.error(err.message));

// 方式2: 可取消的超时（使用 AbortController）
async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// 方式3: 支持重试的超时请求
async function fetchWithRetry(url, options = {}) {
  const { timeout = 5000, retries = 3 } = options;

  for (let i = 0; i < retries; i++) {
    try {
      return await fetchWithTimeout(url, timeout);
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`重试第 ${i + 1} 次...`);
    }
  }
}
```

---
:::

::: details Q8: Generator 函数与异步编程
#### 一句话答案
Generator 是 ES6 引入的可暂停执行的函数,配合 Promise 可以实现类似 async/await 的效果,是 async/await 的前身。

#### 详细解答

```javascript
// Generator 基础
function* gen() {
  console.log('开始');
  const a = yield 1;
  console.log('a:', a);
  const b = yield 2;
  console.log('b:', b);
  return 3;
}

const g = gen();
console.log(g.next());     // 开始, { value: 1, done: false }
console.log(g.next('A'));  // a: A, { value: 2, done: false }
console.log(g.next('B'));  // b: B, { value: 3, done: true }

// Generator + Promise 实现异步
function* asyncGen() {
  const res1 = yield fetch('/api/1').then(r => r.json());
  console.log('res1:', res1);
  const res2 = yield fetch('/api/2').then(r => r.json());
  console.log('res2:', res2);
  return 'done';
}

// 自动执行器（简化版 co 库）
function co(gen) {
  return new Promise((resolve, reject) => {
    const g = gen();

    function next(data) {
      const { value, done } = g.next(data);
      if (done) return resolve(value);
      Promise.resolve(value).then(next, reject);
    }

    next();
  });
}

// 使用
co(asyncGen).then(result => console.log(result));

// 对比: 现在我们直接用 async/await
async function asyncFn() {
  const res1 = await fetch('/api/1').then(r => r.json());
  const res2 = await fetch('/api/2').then(r => r.json());
  return 'done';
}
```

#### 面试回答模板
"Generator 函数可以暂停和恢复执行,通过 yield 关键字可以把异步代码写成同步的样子。配合一个自动执行器(如 co 库),就能实现类似 async/await 的效果。实际上 async/await 就是 Generator + 自动执行器的语法糖。现在开发中我们直接用 async/await 就好,但了解 Generator 有助于理解 async/await 的原理。"

---
:::

::: details Q9: 宏任务和微任务有哪些？执行优先级？
#### 详细解答

| 类型 | 任务 | 备注 |
|------|------|------|
| **微任务** | Promise.then/catch/finally | 最常用 |
| | queueMicrotask | 手动添加微任务 |
| | MutationObserver | DOM 变化监听 |
| | process.nextTick | Node.js 专属,优先级最高 |
| **宏任务** | setTimeout/setInterval | 定时器 |
| | setImmediate | Node.js 专属 |
| | I/O 操作 | 文件读写、网络请求 |
| | UI rendering | 浏览器渲染 |
| | requestAnimationFrame | 动画帧 |
| | MessageChannel | 消息通道 |

**优先级**: 同步代码 > process.nextTick > 微任务 > 宏任务

```javascript
// Node.js 中的完整顺序
console.log('sync');

process.nextTick(() => console.log('nextTick'));

Promise.resolve().then(() => console.log('promise'));

setImmediate(() => console.log('immediate'));

setTimeout(() => console.log('timeout'), 0);

// 输出: sync → nextTick → promise → timeout → immediate
// (timeout 和 immediate 顺序可能因情况而异)
```

---
:::

::: details Q10: 手写 Promise.allSettled
#### 详细解答

```javascript
Promise.myAllSettled = function(promises) {
  return new Promise(resolve => {
    const results = [];
    let count = 0;
    const len = promises.length;

    if (len === 0) return resolve([]);

    promises.forEach((p, i) => {
      Promise.resolve(p)
        .then(value => {
          results[i] = { status: 'fulfilled', value };
        })
        .catch(reason => {
          results[i] = { status: 'rejected', reason };
        })
        .finally(() => {
          count++;
          if (count === len) resolve(results);
        });
    });
  });
};

// 测试
Promise.myAllSettled([
  Promise.resolve(1),
  Promise.reject('err'),
  Promise.resolve(3)
]).then(console.log);
// [
//   { status: 'fulfilled', value: 1 },
//   { status: 'rejected', reason: 'err' },
//   { status: 'fulfilled', value: 3 }
// ]
```

---
:::

## 总结

::: details 异步编程发展历程
```
回调函数 → Promise → Generator + co → async/await
```
:::

::: details 核心要点速记
| 概念 | 要点 |
|------|------|
| Promise 状态 | pending → fulfilled/rejected,不可逆 |
| 微任务 vs 宏任务 | 微任务优先,每轮宏任务后清空微任务 |
| async/await | 语法糖,返回 Promise,await 后是微任务 |
| 错误处理 | try/catch 或 .catch() |
| 并发控制 | Promise.all/race/allSettled + 限流池 |
:::
