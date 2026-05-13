# DNS 解析详解

## 概述

DNS（Domain Name System，域名系统）是互联网的核心服务之一，负责将人类可读的域名（如 www.example.com）转换为计算机可识别的 IP 地址（如 192.168.1.1）。

## DNS 基础概念

### 域名结构

```
        www.example.com.
         │    │     │  │
         │    │     │  └── 根域（.）
         │    │     └───── 顶级域（TLD）
         │    └─────────── 二级域
         └──────────────── 三级域（主机名）

完整域名：www.example.com.（FQDN）
```

### 域名层级

```
                    根域名服务器（.）
                          │
          ┌───────────────┼───────────────┐
          │               │               │
        .com            .org            .cn
          │               │               │
     example.com    example.org    example.cn
          │               │               │
    www.example.com  ...              ...
```

### DNS 记录类型

```
┌────────┬──────────────────────────────────────────────────┐
│ 类型   │ 描述                                              │
├────────┼──────────────────────────────────────────────────┤
│ A      │ 将域名映射到 IPv4 地址                            │
│ AAAA   │ 将域名映射到 IPv6 地址                            │
│ CNAME  │ 别名记录，将域名指向另一个域名                     │
│ MX     │ 邮件交换记录，指定邮件服务器                       │
│ TXT    │ 文本记录，用于验证、SPF等                         │
│ NS     │ 域名服务器记录，指定授权DNS服务器                  │
│ SOA    │ 起始授权记录，包含域名管理信息                     │
│ PTR    │ 指针记录，用于反向DNS查询                         │
│ SRV    │ 服务记录，指定服务位置                            │
└────────┴──────────────────────────────────────────────────┘
```

## DNS 解析流程

### 完整解析流程

```
用户输入 www.example.com
           │
           ▼
    ┌──────────────┐
    │ 浏览器 DNS 缓存 │ ← 命中直接返回
    └──────┬───────┘
           │ 未命中
           ▼
    ┌──────────────┐
    │ 操作系统 DNS 缓存│ ← 命中直接返回
    └──────┬───────┘
           │ 未命中
           ▼
    ┌──────────────┐
    │  hosts 文件   │ ← 命中直接返回
    └──────┬───────┘
           │ 未命中
           ▼
    ┌──────────────┐
    │ 本地 DNS 服务器 │ ← （递归解析器）
    └──────┬───────┘
           │ 缓存未命中
           │
     ┌─────┴─────┐
     │ 递归查询   │
     └─────┬─────┘
           │
           ▼
    ┌──────────────┐
    │ 根域名服务器   │ ← 返回 .com 服务器地址
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ .com 顶级域服务器│ ← 返回 example.com 服务器地址
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ 权威 DNS 服务器│ ← 返回 www.example.com 的 IP
    └──────┬───────┘
           │
           ▼
     返回 IP 地址
```

### 迭代查询 vs 递归查询

```
递归查询（客户端 → 本地 DNS）
客户端只发一次请求，本地 DNS 服务器负责完成整个解析过程

迭代查询（本地 DNS → 根/顶级/权威）
本地 DNS 服务器逐级查询，每级服务器返回下一级服务器地址
```

## DNS 缓存

### 缓存层级

```javascript
// 1. 浏览器缓存
// Chrome: chrome://net-internals/#dns
// 缓存时间通常较短（1分钟左右）

// 2. 操作系统缓存
// Windows: ipconfig /displaydns
// macOS: dscacheutil -cachedump -entries
// Linux: systemd-resolve --statistics

// 3. 路由器缓存
// 家用路由器通常会缓存DNS查询

// 4. ISP DNS 缓存
// 运营商的DNS服务器缓存
```

### TTL（Time To Live）

```javascript
// DNS 记录的 TTL 决定缓存时间
// 单位：秒

// 查看 DNS 记录的 TTL
// nslookup -type=A example.com

// 常见 TTL 设置：
// - 静态内容：86400（1天）
// - 动态内容：300（5分钟）
// - 故障切换：60（1分钟）
```

## 前端 DNS 优化

### DNS 预解析

```html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//api.example.com">
<link rel="dns-prefetch" href="//cdn.example.com">
<link rel="dns-prefetch" href="//analytics.google.com">

<!-- 预连接（包含 DNS + TCP + TLS） -->
<link rel="preconnect" href="https://api.example.com">

<!-- 预连接但不带凭证 -->
<link rel="preconnect" href="https://cdn.example.com" crossorigin>
```

### 控制 DNS 预解析

```html
<!-- 默认情况下，浏览器会对页面中的链接进行 DNS 预解析 -->
<!-- 可以通过 meta 标签关闭 -->
<meta http-equiv="x-dns-prefetch-control" content="off">

<!-- 或开启 -->
<meta http-equiv="x-dns-prefetch-control" content="on">
```

### DNS 解析性能测量

```javascript
// 使用 Performance API 测量 DNS 时间
const [navigation] = performance.getEntriesByType('navigation');

const dnsTime = navigation.domainLookupEnd - navigation.domainLookupStart;
console.log(`DNS 解析时间: ${dnsTime}ms`);

// 使用 PerformanceObserver 监控资源加载
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: DNS ${entry.domainLookupEnd - entry.domainLookupStart}ms`);
  }
});

observer.observe({ entryTypes: ['resource'] });
```

### DNS over HTTPS (DoH)

```javascript
// 浏览器可以使用 DoH 加密 DNS 查询
// Chrome: chrome://settings/security → 使用安全 DNS

// 常见 DoH 提供商：
// - Cloudflare: https://cloudflare-dns.com/dns-query
// - Google: https://dns.google/dns-query
// - 阿里云: https://dns.alidns.com/dns-query
```

## 常见 DNS 问题

### DNS 劫持

```javascript
// DNS 劫持：DNS 服务器返回错误的 IP 地址
// 解决方案：
// 1. 使用可信的 DNS 服务器（如 8.8.8.8, 1.1.1.1）
// 2. 使用 HTTPS（即使 IP 错误，证书验证会失败）
// 3. 使用 DNS over HTTPS/TLS
```

### DNS 污染

```javascript
// DNS 污染：在 DNS 响应中注入虚假结果
// 常见于某些网络环境
// 解决方案：
// 1. 使用 DoH/DoT
// 2. 使用 VPN
// 3. 修改 hosts 文件
```

### DNS 缓存问题

```javascript
// 问题：DNS 更新后客户端仍使用旧 IP
// 解决方案：
// 1. 降低 TTL（更新前）
// 2. 清除本地 DNS 缓存

// Windows
// ipconfig /flushdns

// macOS
// sudo dscacheutil -flushcache
// sudo killall -HUP mDNSResponder

// Chrome
// chrome://net-internals/#dns → Clear host cache
```

## DNS 负载均衡

### 轮询（Round Robin）

```
; DNS 记录配置
example.com.  IN  A  192.168.1.1
example.com.  IN  A  192.168.1.2
example.com.  IN  A  192.168.1.3

; 每次查询返回不同顺序的 IP 列表
; 客户端通常使用第一个 IP
```

### 基于地理位置（GeoDNS）

```javascript
// 根据用户地理位置返回最近的服务器 IP
// 北京用户 → 返回北京服务器 IP
// 上海用户 → 返回上海服务器 IP

// 常见 GeoDNS 服务：
// - AWS Route 53
// - Cloudflare
// - 阿里云 DNS
```

### 基于健康检查

```javascript
// 结合健康检查的智能 DNS
// 1. 定期检测服务器状态
// 2. 移除不健康服务器的 DNS 记录
// 3. 自动故障转移
```

## DNS 安全

### DNSSEC

```javascript
// DNSSEC（DNS Security Extensions）
// 使用数字签名验证 DNS 响应的真实性

// 查看 DNSSEC 信息
// dig +dnssec example.com

// DNSSEC 记录类型：
// - RRSIG: 资源记录签名
// - DNSKEY: 公钥
// - DS: 委托签名者
// - NSEC/NSEC3: 证明不存在
```

### DoH 和 DoT

```javascript
// DNS over HTTPS (DoH)
// - 端口: 443
// - 使用 HTTPS 加密
// - 难以被识别和拦截

// DNS over TLS (DoT)
// - 端口: 853
// - 使用 TLS 加密
// - 可能被防火墙拦截
```

## 实战应用

### 多域名策略

```javascript
// 使用多个域名分散 DNS 查询和连接
const domains = {
  api: 'api.example.com',
  static: 'static.example.com',
  images: 'images.example.com',
  cdn: 'cdn.example.com'
};

// 优点：
// 1. 突破浏览器同域名并发限制
// 2. 分离动态和静态资源
// 3. 便于 CDN 配置

// 缺点：
// 1. 更多的 DNS 查询
// 2. 更多的 TCP 连接
// HTTP/2 时代建议减少域名数量
```

### DNS 预热

```javascript
// 页面加载时预解析可能用到的域名
document.addEventListener('DOMContentLoaded', () => {
  const domains = [
    'api.example.com',
    'cdn.example.com',
    'analytics.example.com'
  ];

  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });
});
```

### 动态 DNS 优化

```javascript
// 基于用户行为动态预解析
function prefetchOnHover(element) {
  element.addEventListener('mouseenter', () => {
    const href = element.getAttribute('href');
    if (href) {
      const url = new URL(href);
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = url.origin;
      document.head.appendChild(link);
    }
  }, { once: true });
}

// 为所有外部链接添加预解析
document.querySelectorAll('a[href^="http"]').forEach(prefetchOnHover);
```

