# TCP/UDP 详解

## 概述

TCP（传输控制协议）和 UDP（用户数据报协议）是传输层最重要的两个协议，它们各有特点和适用场景。

## TCP 详解

### 基本特性

TCP 是一种**面向连接的、可靠的、基于字节流**的传输层通信协议。

| 特性 | 说明 |
|------|------|
| 面向连接 | 通信前必须建立连接（三次握手） |
| 可靠传输 | 确保数据不丢失、不重复、按序到达 |
| 全双工通信 | 双方可以同时发送和接收数据 |
| 基于字节流 | 数据被视为无结构的字节流 |
| 流量控制 | 通过滑动窗口控制发送速率 |
| 拥塞控制 | 根据网络状况调整发送速率 |

### TCP 报文头部结构

| 字段 | 说明 |
|------|------|
| 源端口/目的端口 | 标识发送和接收应用程序 |
| 序列号 (Seq) | 本报文段数据的第一个字节的序号 |
| 确认号 (Ack) | 期望收到的下一个数据字节的序号 |
| SYN | 同步标志，用于建立连接 |
| ACK | 确认标志，表示确认号有效 |
| FIN | 结束标志，用于释放连接 |
| RST | 重置标志，用于重置连接 |
| 窗口大小 | 接收窗口大小，用于流量控制 |

### 三次握手（建立连接）

```
客户端                              服务器
  |                                   |
  |  ------ SYN=1, seq=x -------->    |  第一次握手
  |                                   |
  |  <-- SYN=1,ACK=1,seq=y,ack=x+1 -- |  第二次握手
  |                                   |
  |  ------ ACK=1,seq=x+1,ack=y+1 --> |  第三次握手
  |                                   |
  |          连接建立完成              |
```

**三次握手详细过程：**

1. **第一次握手**：客户端发送 SYN 包（SYN=1, seq=x），进入 `SYN_SENT` 状态
2. **第二次握手**：服务器收到 SYN 包，发送 SYN+ACK 包（SYN=1, ACK=1, seq=y, ack=x+1），进入 `SYN_RCVD` 状态
3. **第三次握手**：客户端收到 SYN+ACK 包，发送 ACK 包（ACK=1, seq=x+1, ack=y+1），进入 `ESTABLISHED` 状态

**为什么是三次握手？**

```javascript
// 核心原因：确保双方都能确认对方的收发能力

// 两次握手的问题：
// 1. 客户端发送 SYN
// 2. 服务器回复 SYN+ACK
// 问题：服务器无法确认客户端是否收到了自己的 SYN+ACK

// 三次握手解决的问题：
// 第一次：服务器确认 - 客户端发送能力正常
// 第二次：客户端确认 - 服务器收发能力正常
// 第三次：服务器确认 - 客户端接收能力正常

// 防止历史连接的建立
// 场景：网络延迟导致旧的 SYN 包到达服务器
// 1. 旧 SYN 到达服务器，服务器回复 SYN+ACK
// 2. 客户端收到后发现序列号不对，发送 RST 重置
// 3. 避免了无效连接的建立
```

### 四次挥手（释放连接）

```
客户端                              服务器
  |                                   |
  |  ------ FIN=1, seq=u -------->    |  第一次挥手 (FIN_WAIT_1)
  |                                   |
  |  <------ ACK=1, ack=u+1 -------   |  第二次挥手 (CLOSE_WAIT)
  |          (FIN_WAIT_2)             |
  |                                   |
  |  <------ FIN=1, seq=w --------    |  第三次挥手 (LAST_ACK)
  |                                   |
  |  ------ ACK=1, ack=w+1 ------->   |  第四次挥手 (TIME_WAIT)
  |                                   |
  |     (等待 2MSL 后关闭)             |
```

**四次挥手详细过程：**

1. **第一次挥手**：客户端发送 FIN 包，表示没有数据要发送了，进入 `FIN_WAIT_1` 状态
2. **第二次挥手**：服务器收到 FIN 后发送 ACK 确认，进入 `CLOSE_WAIT` 状态；客户端收到 ACK 后进入 `FIN_WAIT_2` 状态
3. **第三次挥手**：服务器数据发送完毕后，发送 FIN 包，进入 `LAST_ACK` 状态
4. **第四次挥手**：客户端收到 FIN 后发送 ACK 确认，进入 `TIME_WAIT` 状态；服务器收到 ACK 后关闭连接

**为什么是四次挥手？**

```javascript
// TCP 是全双工通信，需要双向都关闭

// 为什么不能合并为三次？
// 因为服务器收到 FIN 时，可能还有数据要发送
// 所以先发 ACK 确认收到关闭请求
// 等数据发送完毕后，再发 FIN 表示自己也没有数据了

// 如果服务器没有数据要发送，可以将 ACK 和 FIN 合并
// 这时就变成了"三次挥手"（实际中确实可能发生）
```

### TIME_WAIT 状态

**什么是 TIME_WAIT？**

主动关闭连接的一方，在发送最后一个 ACK 后会进入 TIME_WAIT 状态，等待 2MSL（Maximum Segment Lifetime，报文最大生存时间）后才关闭。

**为什么需要 TIME_WAIT？**

```javascript
// 原因1：确保最后一个 ACK 能到达对方
// 如果最后一个 ACK 丢失，对方会重发 FIN
// TIME_WAIT 期间可以重新发送 ACK

// 原因2：让旧连接的数据包在网络中消失
// 防止新连接收到旧连接的延迟数据包
// 2MSL 时间足够让所有旧数据包过期

// TIME_WAIT 过多的问题
// 1. 占用端口资源
// 2. 占用内存资源

// 解决方案（服务器端）
// 1. 调整内核参数
//    net.ipv4.tcp_tw_reuse = 1    // 允许重用 TIME_WAIT 连接
//    net.ipv4.tcp_tw_recycle = 1  // 快速回收（已废弃）
// 2. 使用 SO_REUSEADDR 选项
// 3. 调整 TIME_WAIT 超时时间
```

### 可靠传输机制

#### 1. 序列号和确认号

```javascript
// 每个字节都有唯一的序列号
// 接收方通过确认号告知发送方已收到哪些数据

// 发送方发送: seq=1000, 数据长度=100
// 接收方回复: ack=1100 (期望下一个序列号)
```

#### 2. 超时重传

```javascript
// 发送方发送数据后启动定时器
// 如果超时未收到 ACK，则重传数据

// RTO (Retransmission Timeout) 计算
// RTT: 往返时间
// RTO = SRTT + 4 * RTTVAR

// SRTT: 平滑 RTT
// RTTVAR: RTT 变化值
```

#### 3. 滑动窗口

```javascript
// 滑动窗口的作用
// 1. 流量控制：接收方告知发送方自己的接收窗口大小
// 2. 提高效率：不用等待每个包的 ACK，可以连续发送

// 窗口大小由接收方决定
// 发送窗口 <= min(接收窗口, 拥塞窗口)
```

#### 4. 流量控制

```javascript
// 接收方通过窗口大小字段告知发送方
// 防止发送方发送过快，导致接收方缓冲区溢出

// 零窗口问题
// 当接收方窗口为 0 时，发送方停止发送
// 发送方定期发送探测报文，询问窗口大小
```

#### 5. 拥塞控制

**四个核心算法：**

```javascript
// 1. 慢启动 (Slow Start)
// 初始 cwnd = 1 MSS
// 每收到一个 ACK，cwnd = cwnd + 1
// 指数增长，直到达到 ssthresh（慢启动阈值）

// 2. 拥塞避免 (Congestion Avoidance)
// cwnd >= ssthresh 后进入
// 每个 RTT，cwnd = cwnd + 1
// 线性增长

// 3. 快速重传 (Fast Retransmit)
// 收到 3 个重复 ACK 时，立即重传丢失的包
// 不用等待超时

// 4. 快速恢复 (Fast Recovery)
// 收到 3 个重复 ACK 时：
// ssthresh = cwnd / 2
// cwnd = ssthresh + 3
// 进入拥塞避免
```

### TCP 粘包问题

**什么是粘包？**

TCP 是基于字节流的，没有消息边界，可能出现：
- 多个小包合并成一个大包发送（粘包）
- 一个大包拆分成多个小包发送（拆包）

```javascript
// 发送: "Hello" + "World"
// 可能收到: "HelloWorld" (粘包)
// 或者: "Hel" + "loWorld" (拆包)
```

**解决方案：**

```javascript
// 1. 固定长度
// 每个消息固定长度，不足补齐
const FIXED_LENGTH = 1024;
const message = data.padEnd(FIXED_LENGTH, '\0');

// 2. 分隔符
// 用特殊字符分隔消息（如 HTTP 用 \r\n）
const messages = buffer.split('\n');

// 3. 长度前缀（最常用）
// 消息头部包含长度信息
function encode(data) {
  const body = Buffer.from(data);
  const header = Buffer.alloc(4);
  header.writeUInt32BE(body.length);
  return Buffer.concat([header, body]);
}

function decode(buffer) {
  const length = buffer.readUInt32BE(0);
  const body = buffer.slice(4, 4 + length);
  return body.toString();
}

// 4. 自定义协议
// [魔数][版本][类型][长度][数据][校验]
```

## UDP 详解

### 基本特性

UDP 是一种**无连接的、不可靠的、基于数据报**的传输层协议。

| 特性 | 说明 |
|------|------|
| 无连接 | 发送数据前不需要建立连接 |
| 不可靠 | 不保证数据到达、不保证顺序、不保证不重复 |
| 面向数据报 | 保留消息边界，一次发送对应一次接收 |
| 首部开销小 | 只有 8 字节 |
| 支持广播和多播 | 可以一对多发送 |
| 没有拥塞控制 | 发送速率不受网络状况影响 |

### UDP 的应用场景

```javascript
// 1. 实时性要求高的场景
// - 视频直播、视频通话
// - 在线游戏
// - 实时音视频传输

// 2. 允许少量丢包的场景
// - DNS 查询
// - DHCP
// - SNMP

// 3. 广播和多播场景
// - 局域网设备发现
// - 视频会议

// 4. 物联网和嵌入式
// - 资源受限设备
// - 简单的数据上报
```

### 基于 UDP 实现可靠传输

```javascript
// 虽然 UDP 本身不可靠，但可以在应用层实现可靠性

// 方案1：简单确认重传
class ReliableUDP {
  constructor() {
    this.pending = new Map();
    this.timeout = 3000;
  }

  async send(socket, message, address, port) {
    const id = this.generateId();
    const packet = { id, type: 'data', data: message };

    return new Promise((resolve, reject) => {
      socket.send(JSON.stringify(packet), port, address);

      const timer = setInterval(() => {
        const info = this.pending.get(id);
        if (info && info.retries >= 3) {
          clearInterval(timer);
          this.pending.delete(id);
          reject(new Error('Send failed after 3 retries'));
        } else if (info) {
          info.retries++;
          socket.send(JSON.stringify(packet), port, address);
        }
      }, this.timeout);

      this.pending.set(id, { timer, retries: 0, resolve });
    });
  }
}

// 方案2：使用成熟的协议
// - QUIC (HTTP/3 底层协议)
// - KCP
// - UDT
// - RUDP
```

## TCP vs UDP 对比

| 特性 | TCP | UDP |
|------|-----|-----|
| 连接 | 面向连接 | 无连接 |
| 可靠性 | 可靠传输 | 不可靠传输 |
| 顺序 | 保证顺序 | 不保证顺序 |
| 传输方式 | 字节流 | 数据报 |
| 首部大小 | 20-60 字节 | 8 字节 |
| 传输效率 | 较低 | 较高 |
| 流量控制 | 有 | 无 |
| 拥塞控制 | 有 | 无 |
| 连接方式 | 点对点 | 一对一/一对多/多对多 |
| 适用场景 | 可靠性要求高 | 实时性要求高 |

### 如何选择？

```javascript
// 选择 TCP 的场景：
// - 文件传输 (FTP)
// - 邮件 (SMTP/POP3/IMAP)
// - 网页 (HTTP/HTTPS)
// - 远程登录 (SSH/Telnet)
// - 数据库连接

// 选择 UDP 的场景：
// - DNS 查询
// - 视频直播/视频通话
// - 在线游戏
// - 物联网数据上报
// - 实时音视频 (WebRTC)
```

## 常见面试题

::: details 1. 为什么 TCP 握手是三次，不是两次或四次？
```javascript
// 核心目的：确保双方都确认对方的收发能力

// 为什么不能两次？
// 场景：网络延迟导致旧的连接请求到达服务器
// 1. 客户端发送 SYN（已过期）
// 2. 服务器回复 SYN+ACK，以为连接建立
// 3. 客户端不会理会这个过期的响应
// 4. 服务器一直等待，资源被浪费

// 三次握手如何解决：
// 客户端收到 SYN+ACK 后会检查序列号
// 如果是旧连接，发送 RST 重置
// 服务器收到 RST 后释放资源

// 为什么不需要四次？
// 三次已经足够确认双方收发能力
// 第一次：服务器知道客户端能发
// 第二次：客户端知道服务器能收能发
// 第三次：服务器知道客户端能收
```
:::

::: details 2. 为什么 TCP 挥手是四次？
```javascript
// 因为 TCP 是全双工通信

// 客户端发送 FIN：客户端没有数据发了
// 服务器回复 ACK：知道了
// 但是！服务器可能还有数据要发
// 服务器发送 FIN：服务器也没有数据发了
// 客户端回复 ACK：知道了，关闭连接

// 关闭一个方向需要 FIN + ACK
// 全双工有两个方向
// 所以需要 2 × 2 = 4 次
```
:::

::: details 3. TIME_WAIT 为什么是 2MSL？
```javascript
// MSL: Maximum Segment Lifetime，报文最大生存时间

// 原因1：确保最后一个 ACK 到达
// 如果服务器没收到 ACK，会重发 FIN
// 一个 FIN 的传输时间最多 MSL
// 客户端等待 2MSL 确保能处理重发的 FIN

// 原因2：让网络中的旧数据包消失
// 一个数据包从发送到接收最多 MSL
// 一个响应从接收方返回最多 MSL
// 所以一个完整的交互最多 2MSL

// 2MSL 典型值：Linux 默认 60 秒 (MSL=30秒)
```
:::

::: details 4. TCP 如何保证可靠传输？
```javascript
// 1. 序列号和确认号
// 每个字节都有编号，接收方确认收到的字节

// 2. 校验和
// 检测数据在传输过程中是否损坏

// 3. 超时重传
// 发送后启动定时器，超时未确认则重传

// 4. 流量控制
// 接收方告知窗口大小，防止发送过快

// 5. 拥塞控制
// 慢启动、拥塞避免、快速重传、快速恢复

// 6. 数据排序
// 接收方根据序列号重新排序
```
:::

::: details 5. SYN 洪泛攻击是什么？如何防御？
```javascript
// SYN Flood 攻击原理：
// 攻击者发送大量 SYN 包，但不完成三次握手
// 服务器为每个半连接分配资源，等待 ACK
// 大量半连接耗尽服务器资源

// 防御措施：
// 1. SYN Cookie - 不立即分配资源
// 2. 缩短 SYN Timeout
// 3. 增大半连接队列
// 4. 防火墙过滤
// 5. CDN/高防 IP
```
:::

::: details 6. HTTP/3 为什么使用 QUIC (UDP)？
```javascript
// HTTP/2 的问题：TCP 队头阻塞
// TCP 保证顺序，一个包丢失会阻塞后续所有包

// QUIC 的优势：
// 1. 解决队头阻塞 - 流独立，互不影响
// 2. 更快的连接建立 - 0-RTT 或 1-RTT
// 3. 连接迁移 - 用 Connection ID 而非 IP:Port
// 4. 改进的拥塞控制
// 5. 内置加密 - 默认 TLS 1.3
```
:::

## 实际应用

::: details Node.js TCP 服务器
```javascript
const net = require('net');

const server = net.createServer((socket) => {
  console.log('客户端连接');

  let buffer = Buffer.alloc(0);

  socket.on('data', (data) => {
    buffer = Buffer.concat([buffer, data]);

    while (buffer.length >= 4) {
      const length = buffer.readUInt32BE(0);
      if (buffer.length < 4 + length) break;

      const message = buffer.slice(4, 4 + length).toString();
      buffer = buffer.slice(4 + length);

      console.log('收到消息:', message);
    }
  });

  socket.on('end', () => console.log('客户端断开'));
});

server.listen(8080);
```
:::

::: details Node.js UDP 服务器
```javascript
const dgram = require('dgram');

const server = dgram.createSocket('udp4');

server.on('message', (msg, rinfo) => {
  console.log(\`收到来自 \${rinfo.address}:\${rinfo.port} 的消息: \${msg}\`);
  server.send(Buffer.from('收到'), rinfo.port, rinfo.address);
});

server.bind(8081);
```
:::

## 总结

| 要点 | TCP | UDP |
|------|-----|-----|
| 连接管理 | 三次握手建立，四次挥手释放 | 无需连接管理 |
| 可靠性保证 | 序列号、确认、重传、校验 | 无（需应用层实现） |
| 流量/拥塞控制 | 滑动窗口、慢启动等 | 无 |
| 传输效率 | 较低，有握手和确认开销 | 较高，首部仅8字节 |
| 适用场景 | HTTP、文件传输、邮件 | 视频直播、DNS、游戏 |
