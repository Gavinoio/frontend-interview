# 浏览器存储

## Cookie
- 大小: 4KB
- 跟随请求发送

## LocalStorage
- 大小: 5-10MB
- 永久存储

## SessionStorage
- 大小: 5-10MB
- 会话存储

## IndexedDB
- 大小: 几百MB
- 数据库存储

---

## 高频面试题

::: details 1. Cookie、localStorage、sessionStorage 的区别？
**一句话答案：** 三者都是浏览器存储方式，区别在于存储大小、生命周期、是否随请求发送以及作用域不同。

**详细解答：**

| 特性 | Cookie | localStorage | sessionStorage |
|------|--------|--------------|----------------|
| 存储大小 | 4KB | 5-10MB | 5-10MB |
| 生命周期 | 可设置过期时间，默认关闭浏览器失效 | 永久存储，除非手动清除 | 页面会话结束（标签页关闭）时清除 |
| 请求携带 | 每次HTTP请求都会自动携带 | 不会自动携带 | 不会自动携带 |
| 作用域 | 同域名下共享（可设置path和domain） | 同源共享（协议+域名+端口） | 同源且同一标签页/窗口 |
| API | document.cookie（字符串操作） | localStorage.setItem/getItem | sessionStorage.setItem/getItem |
| 服务端访问 | 可以（通过Set-Cookie响应头） | 不可以 | 不可以 |

**代码示例：**

```javascript
// Cookie 操作
// 设置 Cookie
document.cookie = "username=张三; expires=Fri, 31 Dec 2025 23:59:59 GMT; path=/";

// 读取 Cookie
const getCookie = (name) => {
  const matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
};

// 删除 Cookie
document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

// localStorage 操作
// 存储数据
localStorage.setItem('user', JSON.stringify({ name: '张三', age: 25 }));

// 读取数据
const user = JSON.parse(localStorage.getItem('user'));

// 删除单个数据
localStorage.removeItem('user');

// 清空所有数据
localStorage.clear();

// sessionStorage 操作（API 与 localStorage 相同）
sessionStorage.setItem('token', 'abc123');
const token = sessionStorage.getItem('token');
sessionStorage.removeItem('token');
sessionStorage.clear();
```

**面试口语化回答模板：**

"这三种存储方式我在项目中都用过，它们的主要区别体现在几个方面：

首先是**存储容量**，Cookie 只有 4KB，主要用来存储一些简单的状态信息，比如用户登录凭证。而 localStorage 和 sessionStorage 都有 5-10MB 的容量，可以存储更多数据。

其次是**生命周期**，Cookie 可以设置过期时间，比如我们做'记住我'功能时，可以设置 7 天或 30 天过期。localStorage 是永久存储的，除非用户手动清除或者我们代码里删除。sessionStorage 的生命周期最短，只在当前标签页有效，关闭标签页就清除了。

再就是**是否随请求发送**，Cookie 会在每次 HTTP 请求时自动携带到服务器，这也是为什么我们用 Cookie 做身份认证的原因。但这也有个缺点，就是会增加请求体积。localStorage 和 sessionStorage 都是纯前端存储，不会发送到服务器。

最后是**作用域**，localStorage 是同源共享的，比如我在一个标签页存储数据，在同域名的其他标签页也能访问。而 sessionStorage 只在当前标签页有效，即使是同一个网站，不同标签页之间的 sessionStorage 也是隔离的。

在实际项目中，我一般这样选择：用户 Token 放在 Cookie 或 localStorage 中；页面临时状态用 sessionStorage；跨页面共享的数据用 localStorage。"

---
:::

::: details 2. 浏览器页面间通信方式有哪些？
**一句话答案：** 常见的有 localStorage + storage 事件、BroadcastChannel、SharedWorker、postMessage、WebSocket 等方式。

**详细解答：**

1. **localStorage + storage 事件**
   - 原理：当一个标签页修改 localStorage 时，其他同源标签页会触发 storage 事件
   - 优点：简单易用，兼容性好
   - 缺点：只能传输字符串，需要序列化对象

2. **BroadcastChannel API**
   - 原理：创建一个命名频道，所有订阅该频道的页面可以接收消息
   - 优点：专为跨页面通信设计，API 简洁
   - 缺点：兼容性较差（IE 不支持）

3. **SharedWorker**
   - 原理：多个页面共享同一个 Worker 线程，通过 Worker 中转消息
   - 优点：可以处理复杂逻辑
   - 缺点：兼容性问题，调试困难

4. **postMessage**
   - 原理：通过 window.open 或 iframe 获取目标窗口引用，使用 postMessage 发送消息
   - 优点：可跨域通信
   - 缺点：需要持有目标窗口引用

5. **WebSocket**
   - 原理：所有页面连接到同一个 WebSocket 服务器，通过服务器转发消息
   - 优点：功能强大，支持服务端推送
   - 缺点：需要服务器支持，成本较高

6. **IndexedDB + 轮询**
   - 原理：通过定时读取 IndexedDB 中的变化来实现通信
   - 优点：可存储大量数据
   - 缺点：实时性差，性能开销大

**代码示例：**

```javascript
// 方式 1: localStorage + storage 事件
// 页面 A - 发送消息
const sendMessage = (message) => {
  localStorage.setItem('message', JSON.stringify({
    data: message,
    timestamp: Date.now()
  }));
  // 立即删除，确保每次都能触发事件
  localStorage.removeItem('message');
};

sendMessage('Hello from Page A');

// 页面 B - 接收消息
window.addEventListener('storage', (e) => {
  if (e.key === 'message' && e.newValue) {
    const message = JSON.parse(e.newValue);
    console.log('收到消息:', message.data);
  }
});

// 方式 2: BroadcastChannel
// 页面 A - 创建频道并发送消息
const channel = new BroadcastChannel('my-channel');
channel.postMessage({ type: 'greeting', text: 'Hello!' });

// 页面 B - 订阅频道并接收消息
const channel = new BroadcastChannel('my-channel');
channel.onmessage = (event) => {
  console.log('收到消息:', event.data);
};

// 关闭频道
channel.close();

// 方式 3: SharedWorker
// shared-worker.js
const connections = [];
self.onconnect = (e) => {
  const port = e.ports[0];
  connections.push(port);

  port.onmessage = (event) => {
    // 广播给所有连接的页面
    connections.forEach(conn => {
      if (conn !== port) {
        conn.postMessage(event.data);
      }
    });
  };
};

// 页面 A 和 B
const worker = new SharedWorker('shared-worker.js');
worker.port.start();

// 发送消息
worker.port.postMessage('Hello from page');

// 接收消息
worker.port.onmessage = (e) => {
  console.log('收到消息:', e.data);
};

// 方式 4: postMessage（父子窗口通信）
// 父页面
const childWindow = window.open('child.html');
childWindow.postMessage('Hello from parent', 'https://example.com');

// 子页面
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://example.com') return;
  console.log('收到消息:', event.data);
  // 回复消息
  event.source.postMessage('Hello from child', event.origin);
});
```

**面试口语化回答模板：**

"浏览器页面间通信这块我接触比较多，主要有这么几种方式：

最常用的是 **localStorage + storage 事件**。原理很简单，当一个页面修改 localStorage 的值时，其他同源页面会自动触发 storage 事件。我之前做过一个多标签页的管理后台，用户在一个标签页登出后，其他标签页也要同步登出状态，就是用的这种方式。需要注意的是，修改 localStorage 的那个页面本身不会触发 storage 事件，只有其他页面才会收到通知。

还有一个专门的 API 叫 **BroadcastChannel**，它就是专门为跨页面通信设计的，API 非常简洁。创建一个频道，所有订阅这个频道的页面都能收到消息，就像微信群聊一样。不过兼容性稍微差一点，IE 不支持。

如果需要处理比较复杂的逻辑，可以用 **SharedWorker**。它相当于在所有页面之间共享一个 Worker 线程，页面之间的消息都通过这个 Worker 中转。但这个方案比较重，而且调试起来也麻烦。

**postMessage** 主要用在父子窗口或 iframe 之间的通信，它的好处是支持跨域。比如嵌入第三方页面时，就可以用 postMessage 进行安全的跨域通信。

如果项目本身就用了 WebSocket，那也可以用它来做页面间通信，所有页面连接到同一个 WebSocket 服务器，通过服务器转发消息。这种方式功能最强大，但成本也高。

在实际项目中，我一般首选 localStorage + storage 事件，因为简单够用，兼容性也好。如果不需要考虑 IE，BroadcastChannel 是更优雅的选择。"

---
:::

::: details 3. 如何实现跨标签页通信？
**一句话答案：** 推荐使用 localStorage + storage 事件或 BroadcastChannel API 实现，前者兼容性好，后者 API 更优雅。

**详细解答：**

跨标签页通信在实际项目中有很多应用场景：
- 多标签页登录状态同步
- 购物车数据同步
- 实时消息通知同步
- 多标签页防重复登录

这里提供两种最常用的实现方案：

**方案一：localStorage + storage 事件（推荐，兼容性好）**

优点：
- 兼容性好，支持所有现代浏览器
- 实现简单，无需额外依赖
- 自动持久化数据

缺点：
- 只能传输字符串，需要序列化
- 同一标签页不会触发 storage 事件
- 存储容量有限（5-10MB）

**方案二：BroadcastChannel API（现代浏览器推荐）**

优点：
- 专为跨页面通信设计
- API 简洁直观
- 支持任意可序列化数据类型
- 不会持久化数据（更安全）

缺点：
- 不支持 IE 浏览器
- Safari 较晚才支持（13.1+）

**代码示例：**

```javascript
// ===== 方案一：localStorage + storage 事件 =====

// 封装通信工具类
class CrossTabMessenger {
  constructor(channelName) {
    this.channelName = channelName;
    this.listeners = new Set();
    this.initListener();
  }

  // 初始化监听器
  initListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === this.channelName && e.newValue) {
        const message = JSON.parse(e.newValue);
        this.listeners.forEach(listener => listener(message));
      }
    });
  }

  // 发送消息
  send(data) {
    const message = {
      data,
      timestamp: Date.now(),
      from: this.getTabId()
    };
    localStorage.setItem(this.channelName, JSON.stringify(message));
    // 立即删除，确保下次能再次触发
    localStorage.removeItem(this.channelName);
  }

  // 订阅消息
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // 获取当前标签页 ID
  getTabId() {
    if (!sessionStorage.getItem('tabId')) {
      sessionStorage.setItem('tabId', `tab_${Date.now()}_${Math.random()}`);
    }
    return sessionStorage.getItem('tabId');
  }
}

// 使用示例
const messenger = new CrossTabMessenger('my-app-channel');

// 发送消息
messenger.send({ type: 'logout', user: 'zhangsan' });

// 订阅消息
const unsubscribe = messenger.subscribe((message) => {
  console.log('收到消息:', message);
  if (message.data.type === 'logout') {
    // 处理登出逻辑
    handleLogout();
  }
});

// 取消订阅
unsubscribe();

// ===== 方案二：BroadcastChannel API =====

// 封装通信工具类
class BroadcastMessenger {
  constructor(channelName) {
    this.channel = new BroadcastChannel(channelName);
    this.listeners = new Set();
    this.initListener();
  }

  // 初始化监听器
  initListener() {
    this.channel.onmessage = (event) => {
      this.listeners.forEach(listener => listener(event.data));
    };
  }

  // 发送消息
  send(data) {
    this.channel.postMessage({
      data,
      timestamp: Date.now()
    });
  }

  // 订阅消息
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // 关闭频道
  close() {
    this.channel.close();
    this.listeners.clear();
  }
}

// 使用示例
const messenger = new BroadcastMessenger('my-app-channel');

// 发送消息
messenger.send({ type: 'cart-update', items: 3 });

// 订阅消息
messenger.subscribe((message) => {
  console.log('收到消息:', message);
  if (message.data.type === 'cart-update') {
    updateCartUI(message.data.items);
  }
});

// 页面卸载时关闭频道
window.addEventListener('beforeunload', () => {
  messenger.close();
});

// ===== 实际项目案例：多标签页登录状态同步 =====

// 登录状态管理器
class AuthSyncManager {
  constructor() {
    this.messenger = new BroadcastMessenger('auth-sync');
    this.init();
  }

  init() {
    // 监听其他标签页的登录/登出事件
    this.messenger.subscribe((message) => {
      const { type, user } = message.data;

      if (type === 'login') {
        console.log('其他标签页登录了:', user);
        this.syncLoginState(user);
      } else if (type === 'logout') {
        console.log('其他标签页登出了');
        this.syncLogoutState();
      }
    });
  }

  // 通知其他标签页登录
  notifyLogin(user) {
    this.messenger.send({ type: 'login', user });
  }

  // 通知其他标签页登出
  notifyLogout() {
    this.messenger.send({ type: 'logout' });
  }

  // 同步登录状态
  syncLoginState(user) {
    // 更新全局状态
    window.currentUser = user;
    // 更新 UI
    this.updateLoginUI(user);
    // 重新加载用户数据
    this.loadUserData(user);
  }

  // 同步登出状态
  syncLogoutState() {
    // 清除全局状态
    window.currentUser = null;
    // 清除本地存储
    localStorage.removeItem('token');
    // 跳转到登录页
    window.location.href = '/login';
  }

  updateLoginUI(user) {
    document.querySelector('.username').textContent = user.name;
  }

  loadUserData(user) {
    // 加载用户相关数据
  }
}

// 使用
const authManager = new AuthSyncManager();

// 登录成功后通知
function onLoginSuccess(user) {
  localStorage.setItem('token', user.token);
  authManager.notifyLogin(user);
}

// 登出时通知
function onLogout() {
  localStorage.removeItem('token');
  authManager.notifyLogout();
}

// ===== 兼容性处理方案 =====

// 自动选择最佳方案
class SmartMessenger {
  constructor(channelName) {
    if (typeof BroadcastChannel !== 'undefined') {
      return new BroadcastMessenger(channelName);
    } else {
      return new CrossTabMessenger(channelName);
    }
  }
}

// 使用
const messenger = new SmartMessenger('my-channel');
```

**面试口语化回答模板：**

"跨标签页通信这个需求我在实际项目中遇到过好几次，最典型的场景就是多标签页登录状态同步。

我主要用过两种方案：**localStorage + storage 事件**和 **BroadcastChannel API**。

第一种方案 **localStorage + storage 事件**是我最常用的，因为兼容性非常好。实现原理是这样的：当一个标签页修改 localStorage 时，其他同源标签页会自动触发 storage 事件。我在项目里封装了一个工具类，包装了发送和接收消息的方法。发送消息时，我会把数据序列化成 JSON 存到 localStorage，然后立即删除，这样可以确保每次都能触发 storage 事件。需要注意的是，修改 localStorage 的那个标签页自己是不会收到 storage 事件的，所以如果需要本地也执行相同逻辑，要额外处理一下。

第二种方案 **BroadcastChannel** 是浏览器专门为跨页面通信设计的 API，用起来更简洁。创建一个命名频道，所有订阅这个频道的标签页都能收发消息，不需要手动序列化数据，而且不会持久化到磁盘，更安全。但缺点是兼容性稍差，IE 完全不支持，Safari 也是 13.1 之后才支持。

在实际项目中，我一般这样选择：如果需要兼容 IE，就用 localStorage 方案；如果只考虑现代浏览器，BroadcastChannel 是更好的选择。我还做过一个兼容性封装，运行时检测浏览器是否支持 BroadcastChannel，如果支持就用它，否则降级到 localStorage 方案。

举个实际例子，我之前做的管理后台有这样的需求：用户在一个标签页点击退出登录后，其他所有标签页也要同步退出。我就用 BroadcastChannel 实现了一个 AuthSyncManager，登出时发送 logout 消息，其他标签页收到后清除 token 并跳转到登录页。这样用户体验就很流畅，不会出现一个标签页已经登出了，其他标签页还能操作的情况。"
:::
