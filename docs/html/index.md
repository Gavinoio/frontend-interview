# HTML 核心概念

## 目录
- [HTML5 新特性](#html5-新特性)
- [DOCTYPE 作用](#doctype-作用)
- [元素分类](#元素分类)
- [语义化标签](#语义化标签)
- [meta 标签详解](#meta-标签详解)
- [script 标签的 async 和 defer](#script-标签的-async-和-defer)
- [面试高频题](#面试高频题)

---

## HTML5 新特性

HTML5 是 HTML 的第五个版本，引入了许多新特性和改进，使 Web 应用更加强大和丰富。

### 1. 语义化标签

HTML5 引入了更多语义化标签，使文档结构更清晰：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>HTML5 语义化标签示例</title>
</head>
<body>
    <!-- 头部区域 -->
    <header>
        <h1>网站标题</h1>
        <nav>
            <ul>
                <li><a href="#home">首页</a></li>
                <li><a href="#about">关于</a></li>
                <li><a href="#contact">联系</a></li>
            </ul>
        </nav>
    </header>

    <!-- 主体内容 -->
    <main>
        <!-- 文章内容 -->
        <article>
            <header>
                <h2>文章标题</h2>
                <time datetime="2024-01-01">2024年1月1日</time>
            </header>
            <section>
                <h3>第一部分</h3>
                <p>文章内容...</p>
            </section>
            <section>
                <h3>第二部分</h3>
                <p>文章内容...</p>
            </section>
        </article>

        <!-- 侧边栏 -->
        <aside>
            <h3>相关推荐</h3>
            <ul>
                <li>推荐文章1</li>
                <li>推荐文章2</li>
            </ul>
        </aside>
    </main>

    <!-- 页脚 -->
    <footer>
        <p>&copy; 2024 版权所有</p>
    </footer>
</body>
</html>
```

**主要语义化标签：**
- `<header>` - 头部区域
- `<nav>` - 导航区域
- `<main>` - 主体内容
- `<article>` - 独立的文章内容
- `<section>` - 文档中的节
- `<aside>` - 侧边栏内容
- `<footer>` - 页脚区域
- `<figure>` / `<figcaption>` - 图片和说明
- `<time>` - 时间标记
- `<mark>` - 高亮文本

### 2. 表单增强

HTML5 增强了表单功能，提供了更多输入类型和验证功能：

```html
<form action="/submit" method="post">
    <!-- 新的输入类型 -->
    <label>邮箱：
        <input type="email" name="email" required placeholder="请输入邮箱">
    </label>

    <label>网址：
        <input type="url" name="website" placeholder="https://example.com">
    </label>

    <label>电话：
        <input type="tel" name="phone" pattern="[0-9]{11}" placeholder="11位手机号">
    </label>

    <label>数字：
        <input type="number" name="age" min="1" max="120" step="1">
    </label>

    <label>日期：
        <input type="date" name="birthday">
    </label>

    <label>时间：
        <input type="time" name="meeting-time">
    </label>

    <label>颜色：
        <input type="color" name="theme-color" value="#ff0000">
    </label>

    <label>范围：
        <input type="range" name="volume" min="0" max="100" value="50">
    </label>

    <label>搜索：
        <input type="search" name="q" placeholder="搜索...">
    </label>

    <!-- 数据列表 -->
    <label>选择浏览器：
        <input type="text" list="browsers" name="browser">
        <datalist id="browsers">
            <option value="Chrome">
            <option value="Firefox">
            <option value="Safari">
            <option value="Edge">
        </datalist>
    </label>

    <!-- 表单验证属性 -->
    <label>必填项：
        <input type="text" name="username" required>
    </label>

    <label>最小长度：
        <input type="password" name="password" minlength="6" maxlength="20">
    </label>

    <label>正则验证：
        <input type="text" name="zipcode" pattern="[0-9]{6}" title="请输入6位数字">
    </label>

    <button type="submit">提交</button>
</form>
```

**新的表单属性：**
- `required` - 必填项
- `placeholder` - 占位符文本
- `pattern` - 正则表达式验证
- `min` / `max` - 最小/最大值
- `minlength` / `maxlength` - 最小/最大长度
- `multiple` - 允许多个值
- `autofocus` - 自动获取焦点
- `autocomplete` - 自动完成

### 3. 多媒体支持

HTML5 原生支持音频和视频，无需插件：

```html
<!-- 视频标签 -->
<video width="640" height="360" controls autoplay muted loop poster="poster.jpg">
    <source src="video.mp4" type="video/mp4">
    <source src="video.webm" type="video/webm">
    <source src="video.ogg" type="video/ogg">
    您的浏览器不支持视频标签。
</video>

<!-- 音频标签 -->
<audio controls loop>
    <source src="audio.mp3" type="audio/mpeg">
    <source src="audio.ogg" type="audio/ogg">
    您的浏览器不支持音频标签。
</audio>

<!-- 视频 API 示例 -->
<video id="myVideo" width="640" height="360">
    <source src="video.mp4" type="video/mp4">
</video>
<div>
    <button onclick="playVideo()">播放</button>
    <button onclick="pauseVideo()">暂停</button>
    <button onclick="toggleMute()">静音</button>
</div>

<script>
const video = document.getElementById('myVideo');

function playVideo() {
    video.play();
}

function pauseVideo() {
    video.pause();
}

function toggleMute() {
    video.muted = !video.muted;
}

// 监听事件
video.addEventListener('play', () => console.log('视频开始播放'));
video.addEventListener('pause', () => console.log('视频暂停'));
video.addEventListener('ended', () => console.log('视频播放结束'));
video.addEventListener('timeupdate', () => {
    console.log('当前播放时间：', video.currentTime);
});
</script>
```

**多媒体属性：**
- `controls` - 显示控制条
- `autoplay` - 自动播放
- `loop` - 循环播放
- `muted` - 静音
- `poster` - 视频封面图（仅 video）
- `preload` - 预加载策略（none/metadata/auto）

### 4. Canvas 绘图

Canvas 提供了 2D 绘图 API：

```html
<canvas id="myCanvas" width="400" height="300" style="border: 1px solid #ccc;"></canvas>

<script>
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// 绘制矩形
ctx.fillStyle = '#ff0000';
ctx.fillRect(10, 10, 100, 50);

// 绘制圆形
ctx.beginPath();
ctx.arc(200, 150, 50, 0, Math.PI * 2);
ctx.fillStyle = '#00ff00';
ctx.fill();
ctx.strokeStyle = '#000000';
ctx.lineWidth = 2;
ctx.stroke();

// 绘制线条
ctx.beginPath();
ctx.moveTo(50, 200);
ctx.lineTo(150, 250);
ctx.lineTo(250, 200);
ctx.strokeStyle = '#0000ff';
ctx.lineWidth = 3;
ctx.stroke();

// 绘制文本
ctx.font = '20px Arial';
ctx.fillStyle = '#000000';
ctx.fillText('Hello Canvas!', 50, 280);

// 绘制图像
const img = new Image();
img.onload = function() {
    ctx.drawImage(img, 250, 200, 100, 80);
};
img.src = 'image.jpg';

// 动画示例
let x = 0;
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x, 100, 50, 50);
    x = (x + 2) % canvas.width;
    requestAnimationFrame(animate);
}
animate();
</script>
```

### 5. SVG 支持

SVG（可缩放矢量图形）可直接嵌入 HTML：

```html
<svg width="400" height="300" style="border: 1px solid #ccc;">
    <!-- 矩形 -->
    <rect x="10" y="10" width="100" height="60"
          fill="red" stroke="black" stroke-width="2"/>

    <!-- 圆形 -->
    <circle cx="200" cy="100" r="50"
            fill="green" stroke="black" stroke-width="2"/>

    <!-- 椭圆 -->
    <ellipse cx="300" cy="100" rx="60" ry="40"
             fill="blue" opacity="0.5"/>

    <!-- 线条 -->
    <line x1="50" y1="150" x2="350" y2="150"
          stroke="purple" stroke-width="3"/>

    <!-- 多边形 -->
    <polygon points="100,200 150,250 50,250"
             fill="orange" stroke="black" stroke-width="2"/>

    <!-- 路径 -->
    <path d="M 200 200 Q 250 250 300 200"
          stroke="brown" stroke-width="3" fill="none"/>

    <!-- 文本 -->
    <text x="150" y="280" font-size="20" fill="black">SVG Text</text>
</svg>

<!-- SVG 动画 -->
<svg width="400" height="100">
    <rect x="0" y="25" width="50" height="50" fill="red">
        <animate attributeName="x" from="0" to="350"
                 dur="3s" repeatCount="indefinite"/>
    </rect>
</svg>
```

**SVG vs Canvas：**
- SVG：矢量图形，基于 XML，适合静态图形、图表、图标
- Canvas：位图绘制，基于像素，适合动画、游戏、图像处理

### 6. Web 存储

HTML5 提供了 localStorage 和 sessionStorage：

```javascript
// localStorage - 持久化存储（除非手动删除）
// 存储数据
localStorage.setItem('username', 'zhangsan');
localStorage.setItem('settings', JSON.stringify({
    theme: 'dark',
    language: 'zh-CN'
}));

// 读取数据
const username = localStorage.getItem('username');
const settings = JSON.parse(localStorage.getItem('settings'));

// 删除数据
localStorage.removeItem('username');

// 清空所有数据
localStorage.clear();

// 获取键名
const key = localStorage.key(0);

// 存储容量（一般 5-10MB）
console.log('存储数量：', localStorage.length);


// sessionStorage - 会话存储（关闭标签页后删除）
sessionStorage.setItem('token', 'abc123');
const token = sessionStorage.getItem('token');
sessionStorage.removeItem('token');
sessionStorage.clear();


// 监听存储变化（仅同源的其他页面）
window.addEventListener('storage', (e) => {
    console.log('存储变化：', {
        key: e.key,           // 改变的键
        oldValue: e.oldValue, // 旧值
        newValue: e.newValue, // 新值
        url: e.url            // 触发改变的页面 URL
    });
});


// 实际应用示例：购物车
class ShoppingCart {
    constructor() {
        this.storageKey = 'shopping_cart';
    }

    // 添加商品
    addItem(item) {
        const cart = this.getCart();
        const existingItem = cart.find(i => i.id === item.id);

        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            cart.push(item);
        }

        this.saveCart(cart);
    }

    // 获取购物车
    getCart() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    // 保存购物车
    saveCart(cart) {
        localStorage.setItem(this.storageKey, JSON.stringify(cart));
    }

    // 删除商品
    removeItem(itemId) {
        let cart = this.getCart();
        cart = cart.filter(item => item.id !== itemId);
        this.saveCart(cart);
    }

    // 清空购物车
    clearCart() {
        localStorage.removeItem(this.storageKey);
    }
}

const cart = new ShoppingCart();
cart.addItem({ id: 1, name: '商品A', price: 99, quantity: 1 });
```

### 7. Web Workers

Web Workers 允许在后台线程运行 JavaScript：

```javascript
// 主线程 (main.js)
// 创建 Worker
const worker = new Worker('worker.js');

// 发送消息给 Worker
worker.postMessage({ type: 'start', data: [1, 2, 3, 4, 5] });

// 接收 Worker 的消息
worker.addEventListener('message', (e) => {
    console.log('收到 Worker 消息：', e.data);
});

// 监听错误
worker.addEventListener('error', (e) => {
    console.error('Worker 错误：', e.message, e.filename, e.lineno);
});

// 终止 Worker
// worker.terminate();


// Worker 线程 (worker.js)
// 接收主线程消息
self.addEventListener('message', (e) => {
    const { type, data } = e.data;

    if (type === 'start') {
        // 执行耗时计算
        const result = heavyCalculation(data);

        // 发送结果回主线程
        self.postMessage({ type: 'result', data: result });
    }
});

function heavyCalculation(arr) {
    // 模拟耗时操作
    let sum = 0;
    for (let i = 0; i < 1000000000; i++) {
        sum += arr[i % arr.length];
    }
    return sum;
}


// 实际应用示例：图像处理
// main.js
const imageWorker = new Worker('imageProcessor.js');

function processImage(imageData) {
    imageWorker.postMessage({
        type: 'grayscale',
        imageData: imageData
    });
}

imageWorker.addEventListener('message', (e) => {
    const processedImageData = e.data;
    // 更新 canvas
    ctx.putImageData(processedImageData, 0, 0);
});

// imageProcessor.js
self.addEventListener('message', (e) => {
    const { type, imageData } = e.data;

    if (type === 'grayscale') {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;     // R
            data[i + 1] = avg; // G
            data[i + 2] = avg; // B
        }
        self.postMessage(imageData);
    }
});
```

**Web Workers 限制：**
- 无法访问 DOM
- 无法访问 window、document、parent 对象
- 可以使用 navigator、location（只读）
- 可以使用 XMLHttpRequest、fetch
- 可以使用 setTimeout、setInterval

### 8. WebSocket

WebSocket 实现了浏览器与服务器的全双工通信：

```javascript
// 创建 WebSocket 连接
const ws = new WebSocket('ws://localhost:8080');

// 连接打开
ws.addEventListener('open', (event) => {
    console.log('WebSocket 连接已建立');

    // 发送消息
    ws.send('Hello Server!');
    ws.send(JSON.stringify({ type: 'join', room: 'chat-room-1' }));
});

// 接收消息
ws.addEventListener('message', (event) => {
    console.log('收到消息：', event.data);

    // 如果是 JSON
    try {
        const data = JSON.parse(event.data);
        handleMessage(data);
    } catch (e) {
        console.log('文本消息：', event.data);
    }
});

// 连接关闭
ws.addEventListener('close', (event) => {
    console.log('WebSocket 连接已关闭', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
    });
});

// 连接错误
ws.addEventListener('error', (event) => {
    console.error('WebSocket 错误：', event);
});

// 发送数据
function sendMessage(message) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    } else {
        console.error('WebSocket 未连接');
    }
}

// 关闭连接
function closeConnection() {
    ws.close(1000, '正常关闭');
}


// 实际应用：聊天室
class ChatClient {
    constructor(url) {
        this.ws = new WebSocket(url);
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.ws.onopen = () => {
            console.log('已连接到聊天室');
            this.updateStatus('在线');
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
        };

        this.ws.onclose = () => {
            console.log('已断开连接');
            this.updateStatus('离线');
            // 尝试重连
            setTimeout(() => this.reconnect(), 3000);
        };

        this.ws.onerror = (error) => {
            console.error('连接错误：', error);
        };
    }

    handleMessage(message) {
        switch (message.type) {
            case 'chat':
                this.displayMessage(message.user, message.text);
                break;
            case 'join':
                this.displaySystemMessage(`${message.user} 加入了聊天室`);
                break;
            case 'leave':
                this.displaySystemMessage(`${message.user} 离开了聊天室`);
                break;
        }
    }

    sendMessage(text) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'chat',
                text: text,
                timestamp: Date.now()
            }));
        }
    }

    displayMessage(user, text) {
        // 显示消息到 UI
        console.log(`${user}: ${text}`);
    }

    displaySystemMessage(text) {
        console.log(`[系统] ${text}`);
    }

    updateStatus(status) {
        console.log(`状态: ${status}`);
    }

    reconnect() {
        this.ws = new WebSocket(this.ws.url);
        this.setupEventHandlers();
    }
}

const chat = new ChatClient('ws://localhost:8080/chat');
```

**WebSocket vs HTTP：**
- HTTP：单向通信，客户端发起请求
- WebSocket：双向通信，服务器可主动推送
- WebSocket：保持长连接，减少握手开销

### 9. 其他 HTML5 新特性

```html
<!-- Geolocation API - 地理定位 -->
<script>
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            console.log('纬度：', position.coords.latitude);
            console.log('经度：', position.coords.longitude);
            console.log('精度：', position.coords.accuracy);
        },
        (error) => {
            console.error('定位失败：', error.message);
        }
    );

    // 持续监听位置变化
    const watchId = navigator.geolocation.watchPosition((position) => {
        console.log('位置更新：', position.coords);
    });

    // 停止监听
    // navigator.geolocation.clearWatch(watchId);
}
</script>

<!-- Drag and Drop API - 拖放 -->
<div id="drag-source" draggable="true">拖动我</div>
<div id="drop-target">放置区域</div>

<script>
const dragSource = document.getElementById('drag-source');
const dropTarget = document.getElementById('drop-target');

// 拖动开始
dragSource.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', e.target.id);
    e.dataTransfer.effectAllowed = 'move';
});

// 拖动进入目标
dropTarget.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
});

// 放置
dropTarget.addEventListener('drop', (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    const element = document.getElementById(data);
    e.target.appendChild(element);
});
</script>

<!-- History API - 历史记录管理 -->
<script>
// 添加历史记录
history.pushState({ page: 1 }, 'Title', '/page1');

// 替换当前历史记录
history.replaceState({ page: 2 }, 'Title', '/page2');

// 前进/后退
history.back();
history.forward();
history.go(-2); // 后退两页

// 监听浏览器前进/后退
window.addEventListener('popstate', (e) => {
    console.log('历史状态变化：', e.state);
});
</script>

<!-- Page Visibility API - 页面可见性 -->
<script>
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('页面被隐藏');
        // 暂停视频、停止请求等
    } else {
        console.log('页面可见');
        // 恢复操作
    }
});
</script>
```

---

## DOCTYPE 作用

DOCTYPE（文档类型声明）是 HTML 文档的第一行，告诉浏览器使用哪种 HTML 或 XHTML 规范解析文档。

### DOCTYPE 的作用

1. **触发标准模式**：告诉浏览器使用标准模式渲染页面
2. **避免怪异模式**：没有 DOCTYPE 会触发怪异模式（Quirks Mode）
3. **确保一致性**：保证页面在不同浏览器中的一致性表现

### HTML5 DOCTYPE

```html
<!DOCTYPE html>
```

**特点：**
- 简洁明了，不区分大小写
- 不需要引用 DTD（文档类型定义）
- 向后兼容

### 历史版本的 DOCTYPE

```html
<!-- HTML 4.01 Strict -->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
    "http://www.w3.org/TR/html4/strict.dtd">

<!-- HTML 4.01 Transitional -->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">

<!-- XHTML 1.0 Strict -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<!-- XHTML 1.0 Transitional -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
```

### 浏览器渲染模式

#### 1. 标准模式（Standards Mode）
- 有正确的 DOCTYPE 声明
- 浏览器按照 W3C 标准解析渲染页面
- CSS 盒模型、布局等按标准执行

#### 2. 怪异模式（Quirks Mode）
- 没有 DOCTYPE 或 DOCTYPE 不正确
- 浏览器模拟旧版本浏览器的行为
- 盒模型计算方式不同（IE 盒模型）

#### 3. 近标准模式（Almost Standards Mode）
- 某些过渡型 DOCTYPE 触发
- 大部分按标准模式，但表格单元格处理不同

```javascript
// 检测当前文档的渲染模式
console.log(document.compatMode);
// "CSS1Compat" - 标准模式
// "BackCompat" - 怪异模式
```

### 标准模式 vs 怪异模式的区别

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .box {
            width: 200px;
            height: 100px;
            padding: 20px;
            border: 10px solid #000;
        }
    </style>
</head>
<body>
    <div class="box">盒模型示例</div>
</body>
</html>
```

**标准模式（W3C 盒模型）：**
- 总宽度 = width + padding + border
- 总宽度 = 200 + 40 + 20 = 260px

**怪异模式（IE 盒模型）：**
- 总宽度 = width
- 总宽度 = 200px（padding 和 border 包含在 width 内）

---

## 元素分类

HTML 元素根据显示方式和布局特性可以分为三类：块级元素、内联元素（行内元素）、行内块元素。

### 块级元素（Block-level Elements）

**特点：**
- 独占一行，宽度默认为父元素的 100%
- 可以设置宽度、高度、内外边距
- 可以包含其他块级元素和内联元素
- 垂直方向排列

**常见块级元素：**

```html
<!-- 常见块级元素 -->
<div>div - 通用块级容器</div>
<p>p - 段落</p>
<h1>h1-h6 - 标题</h1>
<ul>
    <li>ul/ol/li - 列表</li>
</ul>
<form>form - 表单</form>
<table>table - 表格</table>
<header>header - 头部</header>
<nav>nav - 导航</nav>
<section>section - 区块</section>
<article>article - 文章</article>
<aside>aside - 侧边栏</aside>
<footer>footer - 页脚</footer>
<main>main - 主内容</main>
<hr> <!-- hr - 分隔线 -->
<pre>pre - 预格式化文本</pre>
<blockquote>blockquote - 引用块</blockquote>
<address>address - 地址信息</address>
<fieldset>fieldset - 表单字段集</fieldset>

<style>
/* 块级元素示例 */
div {
    width: 300px;
    height: 100px;
    background-color: lightblue;
    margin: 10px;
    padding: 20px;
}
</style>
```

### 内联元素（Inline Elements / 行内元素）

**特点：**
- 不会独占一行，与其他内联元素在同一行显示
- 宽度由内容决定
- 不能设置宽度和高度
- 只能设置左右 margin 和 padding，上下 margin 无效，上下 padding 不影响布局
- 只能包含内联元素和文本

**常见内联元素：**

```html
<!-- 常见内联元素 -->
<span>span - 通用内联容器</span>
<a href="#">a - 链接</a>
<strong>strong - 粗体（强调）</strong>
<em>em - 斜体（强调）</em>
<b>b - 粗体</b>
<i>i - 斜体</i>
<u>u - 下划线</u>
<s>s - 删除线</s>
<small>small - 小号文本</small>
<code>code - 代码</code>
<label>label - 表单标签</label>
<input type="text" placeholder="input - 输入框">
<textarea>textarea - 文本域</textarea>
<select><option>select - 下拉选择</option></select>
<button>button - 按钮</button>
<img src="image.jpg" alt="img - 图片">
<br> <!-- br - 换行 -->
<sub>sub - 下标</sub>
<sup>sup - 上标</sup>
<abbr title="缩写">abbr - 缩写</abbr>
<cite>cite - 引用</cite>
<q>q - 短引用</q>
<time>time - 时间</time>
<mark>mark - 高亮</mark>

<style>
/* 内联元素示例 */
span {
    /* width: 200px; */ /* 无效 */
    /* height: 100px; */ /* 无效 */
    margin: 10px 20px; /* 只有左右生效 */
    padding: 10px 20px; /* 上下不影响布局 */
    background-color: lightgreen;
}
</style>
```

### 行内块元素（Inline-block Elements）

**特点：**
- 不会独占一行，与其他元素在同一行显示
- 可以设置宽度、高度、内外边距
- 兼具块级元素和内联元素的特性

**常见行内块元素：**

```html
<!-- 常见行内块元素 -->
<img src="image.jpg" alt="图片" width="100" height="100">
<input type="text" placeholder="输入框">
<button>按钮</button>
<select>
    <option>选项1</option>
    <option>选项2</option>
</select>
<textarea rows="3" cols="20">文本域</textarea>

<style>
/* 行内块元素示例 */
img, input, button {
    width: 100px;
    height: 40px;
    margin: 10px;
    padding: 5px;
    vertical-align: middle; /* 垂直对齐 */
}
</style>
```

### display 属性转换

可以通过 CSS 的 `display` 属性改变元素的显示类型：

```html
<style>
/* 块级转内联 */
div.inline {
    display: inline;
    /* width、height 将失效 */
}

/* 内联转块级 */
span.block {
    display: block;
    width: 200px;
    height: 100px;
}

/* 转为行内块 */
span.inline-block {
    display: inline-block;
    width: 100px;
    height: 50px;
}

/* 隐藏元素 */
.hidden {
    display: none; /* 不占据空间 */
}

/* Flex 布局 */
.flex-container {
    display: flex;
}

/* Grid 布局 */
.grid-container {
    display: grid;
}
</style>

<div class="inline">块级转内联</div>
<span class="block">内联转块级</span>
<span class="inline-block">行内块1</span>
<span class="inline-block">行内块2</span>
```

### 元素嵌套规则

```html
<!-- ✅ 正确的嵌套 -->
<div>
    <p>段落中可以包含 <span>内联元素</span></p>
    <div>块级元素中可以包含块级元素</div>
</div>

<!-- ❌ 错误的嵌套 -->
<p>
    <div>段落中不应该包含块级元素</div>
</p>

<span>
    <div>内联元素中不应该包含块级元素</div>
</span>

<!-- ⚠️ 特殊情况 -->
<!-- a 标签虽然是内联元素，但在 HTML5 中可以包含块级元素 -->
<a href="#">
    <div>HTML5 允许链接包含块级元素</div>
</a>

<!-- p 标签不能包含块级元素，但可以包含内联元素 -->
<p>
    这是段落 <strong>可以包含内联元素</strong>
</p>
```

### 三者对比总结

| 特性 | 块级元素 | 内联元素 | 行内块元素 |
|------|---------|---------|-----------|
| 是否独占一行 | 是 | 否 | 否 |
| 默认宽度 | 父元素100% | 内容宽度 | 内容宽度 |
| 可设置width/height | 是 | 否 | 是 |
| 可设置margin | 四个方向 | 仅左右 | 四个方向 |
| 可设置padding | 四个方向 | 四个方向（上下不影响布局） | 四个方向 |
| 可包含元素 | 块级+内联 | 仅内联 | 块级+内联 |
| 常见元素 | div, p, h1 | span, a, em | img, input |

---

## 语义化标签

语义化是指使用恰当的 HTML 标签来描述内容的含义，让代码更易读、易维护，同时对 SEO 和可访问性更友好。

详见：[语义化详解](./semantic.md)

**核心语义化标签：**

```html
<header>页面或区块的头部</header>
<nav>导航链接</nav>
<main>文档主内容</main>
<article>独立的文章内容</article>
<section>文档中的一个区块</section>
<aside>侧边栏内容</aside>
<footer>页脚</footer>
<figure>
    <img src="image.jpg" alt="描述">
    <figcaption>图片说明</figcaption>
</figure>
<time datetime="2024-01-01">2024年1月1日</time>
<mark>高亮文本</mark>
```

---

## meta 标签详解

meta 标签提供页面的元数据信息，不会显示在页面上，但对浏览器、搜索引擎和其他服务非常重要。

### 基础 meta 标签

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <!-- 字符编码 - 必须放在 head 的最前面 -->
    <meta charset="UTF-8">

    <!-- IE 兼容模式 -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <!-- 视口设置 - 响应式必备 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

    <!-- 页面描述 - SEO 重要 -->
    <meta name="description" content="这是页面的描述，会显示在搜索结果中，建议 150-160 字符">

    <!-- 关键词 - 现代搜索引擎基本不用 -->
    <meta name="keywords" content="关键词1, 关键词2, 关键词3">

    <!-- 作者 -->
    <meta name="author" content="作者名称">

    <!-- 版权信息 -->
    <meta name="copyright" content="版权所有 © 2024">

    <title>页面标题</title>
</head>
<body>
</body>
</html>
```

### viewport 详解

```html
<!-- viewport 各参数说明 -->
<meta name="viewport" content="
    width=device-width,        /* 宽度等于设备宽度 */
    initial-scale=1.0,         /* 初始缩放比例 1:1 */
    maximum-scale=1.0,         /* 最大缩放比例 */
    minimum-scale=1.0,         /* 最小缩放比例 */
    user-scalable=no,          /* 禁止用户缩放 */
    viewport-fit=cover         /* iOS 刘海屏适配 */
">

<!-- 常用配置 -->
<!-- 移动端响应式（推荐） -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- 禁止缩放（Web App） -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

<!-- 固定宽度 -->
<meta name="viewport" content="width=750">
```

### SEO 相关 meta

```html
<head>
    <!-- 页面标题 - 最重要的 SEO 元素 -->
    <title>网站标题 - 副标题 - 品牌名</title>

    <!-- 页面描述 - 显示在搜索结果 -->
    <meta name="description" content="准确描述页面内容，吸引用户点击，150-160字符最佳">

    <!-- 关键词（已不重要） -->
    <meta name="keywords" content="关键词1, 关键词2, 关键词3">

    <!-- 搜索引擎爬虫控制 -->
    <meta name="robots" content="index, follow">
    <!--
        index / noindex: 是否索引
        follow / nofollow: 是否跟踪链接
        noarchive: 不显示快照
        nosnippet: 不显示摘要
        noimageindex: 不索引图片
    -->

    <!-- 针对特定搜索引擎 -->
    <meta name="googlebot" content="index, follow">
    <meta name="bingbot" content="index, follow">

    <!-- 页面作者 -->
    <meta name="author" content="作者名">

    <!-- 版权声明 -->
    <meta name="copyright" content="版权所有">

    <!-- 重新访问 -->
    <meta name="revisit-after" content="7 days">
</head>
```

### Open Graph（社交分享）

```html
<head>
    <!-- Open Graph - Facebook, LinkedIn 等 -->
    <meta property="og:title" content="分享时显示的标题">
    <meta property="og:description" content="分享时显示的描述">
    <meta property="og:image" content="https://example.com/image.jpg">
    <meta property="og:url" content="https://example.com/page">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="网站名称">
    <meta property="og:locale" content="zh_CN">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="分享时显示的标题">
    <meta name="twitter:description" content="分享时显示的描述">
    <meta name="twitter:image" content="https://example.com/image.jpg">
    <meta name="twitter:site" content="@username">
    <meta name="twitter:creator" content="@username">
</head>
```

### 移动端相关 meta

```html
<head>
    <!-- 视口设置 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- iOS -->
    <!-- 添加到主屏幕后的标题 -->
    <meta name="apple-mobile-web-app-title" content="应用标题">

    <!-- 是否启用 WebApp 全屏模式 -->
    <meta name="apple-mobile-web-app-capable" content="yes">

    <!-- 状态栏样式 -->
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <!-- default: 白色, black: 黑色, black-translucent: 黑色半透明 -->

    <!-- 禁止自动识别电话号码 -->
    <meta name="format-detection" content="telephone=no">

    <!-- 禁止自动识别邮箱 -->
    <meta name="format-detection" content="email=no">

    <!-- 禁止自动识别地址 -->
    <meta name="format-detection" content="address=no">

    <!-- 组合使用 -->
    <meta name="format-detection" content="telephone=no, email=no, address=no">

    <!-- Android -->
    <!-- 主题颜色 -->
    <meta name="theme-color" content="#ffffff">

    <!-- UC 浏览器 -->
    <meta name="full-screen" content="yes">
    <meta name="browsermode" content="application">

    <!-- QQ 浏览器 -->
    <meta name="x5-fullscreen" content="true">
    <meta name="x5-page-mode" content="app">
</head>
```

### http-equiv 类型的 meta

```html
<head>
    <!-- 字符编码 -->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

    <!-- IE 兼容模式 -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

    <!-- 禁止缓存 -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">

    <!-- 自动刷新/跳转 -->
    <meta http-equiv="refresh" content="5">  <!-- 5秒后刷新 -->
    <meta http-equiv="refresh" content="5; url=https://example.com">  <!-- 5秒后跳转 -->

    <!-- 设置 Cookie -->
    <meta http-equiv="Set-Cookie" content="name=value; expires=Fri, 31 Dec 2024 23:59:59 GMT; path=/">

    <!-- 强制 HTTPS -->
    <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">

    <!-- 默认语言 -->
    <meta http-equiv="Content-Language" content="zh-CN">
</head>
```

### 安全相关 meta

```html
<head>
    <!-- 内容安全策略 CSP -->
    <meta http-equiv="Content-Security-Policy" content="
        default-src 'self';
        script-src 'self' 'unsafe-inline' https://cdn.example.com;
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        font-src 'self' data:;
        connect-src 'self' https://api.example.com;
    ">

    <!-- 防止被 iframe 嵌套 -->
    <meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
    <!-- DENY: 完全禁止; SAMEORIGIN: 同源可以; ALLOW-FROM uri: 指定来源 -->

    <!-- XSS 防护 -->
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">

    <!-- 禁止嗅探 MIME 类型 -->
    <meta http-equiv="X-Content-Type-Options" content="nosniff">

    <!-- Referrer 策略 -->
    <meta name="referrer" content="no-referrer-when-downgrade">
    <!--
        no-referrer: 不发送
        no-referrer-when-downgrade: HTTPS->HTTP 不发送
        origin: 只发送源
        same-origin: 同源才发送
        strict-origin: 同上但 HTTPS->HTTP 不发送
    -->
</head>
```

### PWA 相关 meta

```html
<head>
    <!-- 主题颜色 -->
    <meta name="theme-color" content="#2196F3">

    <!-- manifest 文件 -->
    <link rel="manifest" href="/manifest.json">

    <!-- iOS 图标 -->
    <link rel="apple-touch-icon" href="/icon-192.png">
    <link rel="apple-touch-icon" sizes="152x152" href="/icon-152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png">
    <link rel="apple-touch-icon" sizes="167x167" href="/icon-167.png">

    <!-- iOS 启动画面 -->
    <link rel="apple-touch-startup-image" href="/splash-2048x2732.png">

    <!-- Web App 模式 -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
</head>
```

### 完整的 head 示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <!-- 基础 meta -->
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- SEO -->
    <title>页面标题 - 网站名称</title>
    <meta name="description" content="页面描述，150字符以内">
    <meta name="keywords" content="关键词1, 关键词2">
    <meta name="author" content="作者">
    <meta name="robots" content="index, follow">

    <!-- Open Graph -->
    <meta property="og:title" content="分享标题">
    <meta property="og:description" content="分享描述">
    <meta property="og:image" content="https://example.com/share.jpg">
    <meta property="og:url" content="https://example.com">
    <meta property="og:type" content="website">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="分享标题">
    <meta name="twitter:description" content="分享描述">
    <meta name="twitter:image" content="https://example.com/share.jpg">

    <!-- 移动端 -->
    <meta name="format-detection" content="telephone=no">
    <meta name="theme-color" content="#2196F3">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">

    <!-- PWA -->
    <link rel="manifest" href="/manifest.json">
    <link rel="apple-touch-icon" href="/icon-192.png">

    <!-- Favicon -->
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">

    <!-- 安全 -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'">
    <meta name="referrer" content="no-referrer-when-downgrade">

    <!-- 样式和脚本 -->
    <link rel="stylesheet" href="styles.css">
    <script defer src="script.js"></script>
</head>
<body>
    <!-- 页面内容 -->
</body>
</html>
```

---

## script 标签的 async 和 defer

script 标签的加载和执行会阻塞 HTML 解析，async 和 defer 属性可以改变这种行为。

### 默认行为（无属性）

```html
<script src="script.js"></script>
```

**执行流程：**
1. HTML 解析到 script 标签
2. 暂停 HTML 解析
3. 下载 script.js
4. 执行 script.js
5. 继续 HTML 解析

**缺点：**
- 阻塞 HTML 解析，影响页面渲染
- 用户看到白屏时间长

### async 属性

```html
<script async src="script.js"></script>
```

**执行流程：**
1. HTML 解析的同时，异步下载 script.js
2. script.js 下载完成后，立即暂停 HTML 解析
3. 执行 script.js
4. 继续 HTML 解析

**特点：**
- 异步下载，不阻塞 HTML 解析
- 下载完成后立即执行，会中断 HTML 解析
- 执行顺序不确定（哪个先下载完哪个先执行）
- 适用于独立的第三方脚本（统计、广告等）

```html
<!-- 多个 async 脚本执行顺序不确定 -->
<script async src="analytics.js"></script>
<script async src="ads.js"></script>
<script async src="chat.js"></script>
<!-- 执行顺序取决于下载速度 -->
```

### defer 属性

```html
<script defer src="script.js"></script>
```

**执行流程：**
1. HTML 解析的同时，异步下载 script.js
2. HTML 解析完成后
3. DOMContentLoaded 事件之前
4. 按顺序执行所有 defer 脚本

**特点：**
- 异步下载，不阻塞 HTML 解析
- HTML 解析完成后才执行
- 多个 defer 脚本按顺序执行
- 在 DOMContentLoaded 之前执行
- 适用于需要 DOM 的脚本

```html
<!-- 多个 defer 脚本按顺序执行 -->
<script defer src="jquery.js"></script>
<script defer src="app.js"></script>  <!-- 依赖 jquery.js -->
<script defer src="init.js"></script> <!-- 依赖 app.js -->
<!-- 执行顺序：jquery.js -> app.js -> init.js -->
```

### 三者对比

| 特性 | 默认 | async | defer |
|------|------|-------|-------|
| 下载时机 | 遇到立即下载 | 遇到立即下载 | 遇到立即下载 |
| 阻塞HTML解析 | 是 | 否（执行时阻塞） | 否 |
| 执行时机 | 下载完立即执行 | 下载完立即执行 | HTML解析完后执行 |
| 执行顺序 | 按顺序 | 不确定 | 按顺序 |
| DOMContentLoaded | 等待脚本执行 | 不等待 | 等待脚本执行 |
| 适用场景 | 依赖DOM的关键脚本 | 独立的第三方脚本 | 依赖DOM的普通脚本 |

### 可视化对比

```
默认（无属性）：
HTML解析 ━━━━━━━━ ⏸暂停⏸ ━━━━━━━━━
                 ↓下载↓
                 ↓执行↓

async：
HTML解析 ━━━━━━━━━━⏸暂停⏸━━━━━━━
下载     ━━━━━━━━↓    ↓执行↓
                (下载完立即执行)

defer：
HTML解析 ━━━━━━━━━━━━━━━━━━━━▶ 执行脚本
下载     ━━━━━━━━↓
                (解析完后按顺序执行)
```

### 实际应用示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>script 加载策略</title>

    <!-- 1. 关键的内联脚本 - 放在 head -->
    <script>
        // 性能监控、错误捕获等关键脚本
        window.performance.mark('script-start');
    </script>

    <!-- 2. 需要 DOM 的脚本 - 使用 defer -->
    <script defer src="jquery.js"></script>
    <script defer src="app.js"></script>

    <!-- 3. 独立的第三方脚本 - 使用 async -->
    <script async src="https://www.google-analytics.com/analytics.js"></script>
    <script async src="https://cdn.example.com/ads.js"></script>
</head>
<body>
    <h1>页面内容</h1>

    <!-- 4. 依赖 DOM 的脚本 - 放在 body 底部 -->
    <script>
        // 可以直接访问上面的 DOM
        document.querySelector('h1').textContent = '修改后的标题';
    </script>

    <!-- 5. 或者使用 DOMContentLoaded -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM 已加载完成');
        });
    </script>
</body>
</html>
```

### 模块脚本（type="module"）

```html
<!-- ES Module 默认具有 defer 行为 -->
<script type="module" src="module.js"></script>

<!-- 等同于 -->
<script defer src="module.js"></script>

<!-- 模块脚本 + async -->
<script type="module" async src="module.js"></script>
```

**module 特点：**
- 默认是 defer 模式
- 自动启用严格模式
- 有独立的作用域
- 可以使用 import/export
- 可以添加 async 属性

### 最佳实践

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>最佳实践</title>

    <!-- ✅ 推荐：关键 CSS 内联 -->
    <style>
        /* 首屏关键样式 */
        body { margin: 0; }
    </style>

    <!-- ✅ 推荐：预加载关键资源 -->
    <link rel="preload" as="script" href="app.js">

    <!-- ✅ 推荐：defer 加载主要脚本 -->
    <script defer src="app.js"></script>

    <!-- ✅ 推荐：async 加载第三方脚本 -->
    <script async src="analytics.js"></script>
</head>
<body>
    <div id="app"></div>

    <!-- ❌ 不推荐：阻塞脚本放在 head -->
    <!-- ❌ 不推荐：大量脚本放在 body 顶部 -->

    <!-- ✅ 可选：非关键脚本放在 body 底部 -->
    <script src="non-critical.js"></script>
</body>
</html>
```

**推荐策略：**
1. 关键脚本：内联在 head 中
2. 主要脚本：使用 defer
3. 第三方脚本：使用 async
4. 非关键脚本：放在 body 底部或使用 defer
5. ES Module：使用 type="module"（自动 defer）

---

## 面试高频题

### 1. HTML5 有哪些新特性？

**答：**
- **语义化标签**：header, nav, main, article, section, aside, footer
- **表单增强**：新输入类型（email, url, date, number 等），表单验证属性
- **多媒体**：video, audio 原生支持
- **图形**：Canvas 2D 绘图，SVG 矢量图形
- **存储**：localStorage, sessionStorage
- **通信**：WebSocket, Server-Sent Events
- **性能**：Web Workers（多线程）
- **API**：Geolocation（地理定位）, Drag and Drop（拖放）, History API
- **其他**：离线应用（Application Cache）, Web Components

### 2. DOCTYPE 的作用是什么？

**答：**
DOCTYPE（文档类型声明）用于告诉浏览器使用哪种 HTML 规范解析文档，主要作用是：
- 触发标准模式渲染
- 避免怪异模式（Quirks Mode）
- 确保页面在不同浏览器中的一致性

HTML5 的 DOCTYPE 非常简洁：`<!DOCTYPE html>`

没有 DOCTYPE 会触发怪异模式，导致盒模型等表现异常。

### 3. 块级元素和内联元素有什么区别？

**答：**

**块级元素：**
- 独占一行
- 可设置宽高、内外边距
- 默认宽度为父元素 100%
- 可包含块级和内联元素
- 常见：div, p, h1-h6, ul, li, form, header, section

**内联元素：**
- 不独占一行，在同一行显示
- 不可设置宽高
- 宽度由内容决定
- 只能设置左右 margin，上下 margin 无效
- 只能包含内联元素和文本
- 常见：span, a, strong, em, img, input

**行内块元素：**
- 不独占一行
- 可设置宽高、内外边距
- 常见：img, input, button

### 4. 什么是语义化？有什么好处？

**答：**

**语义化**是指使用恰当的 HTML 标签来描述内容的含义。

**好处：**
1. **SEO 优化**：搜索引擎更好地理解页面结构和内容
2. **可访问性**：屏幕阅读器能更准确地解读内容
3. **可维护性**：代码结构清晰，易于理解和维护
4. **可读性**：开发者能快速了解页面结构
5. **语义明确**：标签本身就说明了内容的性质

**示例：**
```html
<!-- ❌ 不语义化 -->
<div class="header">
    <div class="nav">...</div>
</div>

<!-- ✅ 语义化 -->
<header>
    <nav>...</nav>
</header>
```

### 5. meta viewport 的作用是什么？

**答：**

viewport 用于控制移动端页面的视口大小和缩放行为，实现响应式布局。

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**参数说明：**
- `width=device-width`：视口宽度等于设备宽度
- `initial-scale=1.0`：初始缩放比例 1:1
- `maximum-scale`：最大缩放比例
- `minimum-scale`：最小缩放比例
- `user-scalable`：是否允许用户缩放

没有 viewport，移动端会使用默认的 980px 宽度，导致页面被缩小显示。

### 6. script 标签的 async 和 defer 有什么区别？

**答：**

**相同点：**
- 都是异步下载脚本，不阻塞 HTML 解析
- 都只对外部脚本有效

**不同点：**

| 特性 | async | defer |
|------|-------|-------|
| 执行时机 | 下载完立即执行 | HTML 解析完后执行 |
| 是否阻塞解析 | 执行时阻塞 | 不阻塞 |
| 执行顺序 | 不保证顺序 | 按顺序执行 |
| 适用场景 | 独立的第三方脚本 | 依赖 DOM 的脚本 |

**使用建议：**
- 第三方统计、广告脚本：使用 async
- 需要操作 DOM 的脚本：使用 defer
- 有依赖关系的脚本：使用 defer（保证顺序）

### 7. 如何理解 HTML 结构、CSS 表现、JavaScript 行为分离？

**答：**

这是 Web 开发的基本原则，将三者分开管理：

**HTML（结构）：**
- 负责页面的内容和结构
- 使用语义化标签
- 不包含样式和行为

**CSS（表现）：**
- 负责页面的样式和布局
- 通过外部样式表或 `<style>` 标签引入
- 不写内联样式（style 属性）

**JavaScript（行为）：**
- 负责页面的交互和动态效果
- 通过外部脚本或 `<script>` 标签引入
- 不写内联事件（onclick 等属性）

**好处：**
- 提高代码可维护性
- 便于团队协作
- 利于代码复用
- 提升性能（样式和脚本可缓存）

### 8. src 和 href 的区别？

**答：**

**href（Hypertext Reference）：**
- 用于 `<a>`, `<link>` 等标签
- 表示超文本引用，建立当前元素与资源的关联
- 浏览器会并行下载资源，不阻塞解析
- 示例：`<link href="style.css">`

**src（Source）：**
- 用于 `<img>`, `<script>`, `<iframe>` 等标签
- 表示来源，将资源嵌入到当前文档
- 浏览器会暂停解析，直到资源加载和执行完成（script）
- 示例：`<script src="app.js"></script>`

**核心区别：**
- href 是引用，src 是嵌入
- href 不阻塞，src 可能阻塞

### 9. 常用的 meta 标签有哪些？

**答：**

```html
<!-- 字符编码 -->
<meta charset="UTF-8">

<!-- 视口设置 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- SEO -->
<meta name="description" content="页面描述">
<meta name="keywords" content="关键词">
<meta name="robots" content="index, follow">

<!-- IE 兼容 -->
<meta http-equiv="X-UA-Compatible" content="IE=edge">

<!-- 移动端 -->
<meta name="format-detection" content="telephone=no">
<meta name="theme-color" content="#ffffff">

<!-- 社交分享 -->
<meta property="og:title" content="分享标题">
<meta property="og:description" content="分享描述">
<meta property="og:image" content="分享图片">

<!-- 安全 -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">
```

### 10. 如何实现浏览器多个标签页之间的通信？

**答：**

**1. localStorage + storage 事件：**
```javascript
// 页面 A
localStorage.setItem('message', 'Hello from A');

// 页面 B
window.addEventListener('storage', (e) => {
    if (e.key === 'message') {
        console.log('收到消息：', e.newValue);
    }
});
```

**2. BroadcastChannel API：**
```javascript
// 页面 A
const channel = new BroadcastChannel('my-channel');
channel.postMessage('Hello from A');

// 页面 B
const channel = new BroadcastChannel('my-channel');
channel.addEventListener('message', (e) => {
    console.log('收到消息：', e.data);
});
```

**3. SharedWorker：**
```javascript
// 页面 A 和 B
const worker = new SharedWorker('worker.js');
worker.port.postMessage('Hello');
worker.port.onmessage = (e) => {
    console.log('收到消息：', e.data);
};
```

**4. Service Worker：**
- 可以拦截和转发消息

**5. WebSocket：**
- 通过服务器中转消息

### 11. HTML5 的离线存储怎么使用？

**答：**

HTML5 提供了多种离线存储方案：

**1. localStorage（推荐）：**
```javascript
// 存储
localStorage.setItem('key', 'value');
// 读取
const value = localStorage.getItem('key');
// 删除
localStorage.removeItem('key');
```

**2. sessionStorage：**
- 用法同 localStorage
- 会话结束后清除

**3. IndexedDB（大量数据）：**
```javascript
const request = indexedDB.open('myDB', 1);
request.onsuccess = (e) => {
    const db = e.target.result;
    // 操作数据库
};
```

**4. Application Cache（已废弃）：**
- 使用 manifest 文件
- 已被 Service Worker 替代

**5. Service Worker + Cache API：**
```javascript
// 缓存资源
caches.open('v1').then((cache) => {
    cache.addAll(['/index.html', '/style.css', '/app.js']);
});
```

### 12. Canvas 和 SVG 的区别？

**答：**

| 特性 | Canvas | SVG |
|------|--------|-----|
| 类型 | 位图（像素） | 矢量图 |
| 绘制方式 | JavaScript API | XML 标记 |
| 缩放 | 失真 | 不失真 |
| 事件处理 | 复杂（需手动计算） | 简单（元素级别） |
| 性能 | 适合大量元素、动画 | 适合少量元素 |
| 适用场景 | 游戏、图像处理、复杂动画 | 图表、图标、地图 |
| DOM | 单个元素 | 每个图形是 DOM 元素 |
| 可访问性 | 差 | 好 |

**使用建议：**
- 游戏、动画、图像处理：Canvas
- 图表、图标、需要交互的图形：SVG

---

## 总结

HTML 作为 Web 开发的基础，掌握以下核心内容至关重要：

1. **HTML5 新特性**：语义化标签、表单增强、多媒体、Canvas/SVG、Web 存储、Web Workers、WebSocket
2. **DOCTYPE**：触发标准模式，避免怪异模式
3. **元素分类**：块级、内联、行内块的特点和使用
4. **语义化**：提升 SEO、可访问性、可维护性
5. **meta 标签**：SEO、移动端适配、社交分享、安全策略
6. **script 加载**：async 和 defer 的区别和使用场景

掌握这些知识点，能够帮助你构建更加规范、高效、可维护的 Web 应用。

