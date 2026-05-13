# WebAssembly

## 概述

WebAssembly（简称 Wasm）是一种**低级的类汇编语言**，具有紧凑的二进制格式，可以接近原生的性能在浏览器中运行。它是 JavaScript 的补充，而非替代品。

---

## 一、什么是 WebAssembly

### 基本概念

```
┌─────────────────────────────────────────────────────────────┐
│                    WebAssembly 特点                          │
├─────────────────────────────────────────────────────────────┤
│  1. 高性能：接近原生代码的执行速度                             │
│  2. 安全：在沙箱环境中运行，与 JS 相同的安全策略                │
│  3. 开放：开放标准，所有主流浏览器都支持                        │
│  4. 紧凑：二进制格式，文件体积小，加载快                        │
│  5. 可移植：跨平台，不依赖特定硬件或操作系统                    │
│  6. 多语言：支持 C/C++/Rust/Go 等多种语言编译                  │
└─────────────────────────────────────────────────────────────┘
```

### WebAssembly vs JavaScript

| 特性 | WebAssembly | JavaScript |
|------|-------------|------------|
| 类型系统 | 静态类型 | 动态类型 |
| 编译 | 预编译为二进制 | JIT 编译 |
| 性能 | 接近原生 | 取决于引擎优化 |
| 启动速度 | 解码快 | 需要解析 |
| 内存管理 | 手动/线性内存 | 垃圾回收 |
| DOM 操作 | 需通过 JS | 原生支持 |
| 适用场景 | 计算密集型 | 通用开发 |

### 适用场景

```javascript
/**
 * WebAssembly 适用场景:
 *
 * 1. 计算密集型任务
 *    - 图像/视频处理
 *    - 音频处理
 *    - 3D 游戏引擎
 *    - 物理模拟
 *    - 加密/解密
 *
 * 2. 现有代码复用
 *    - 将 C/C++ 库移植到 Web
 *    - 复用游戏引擎代码
 *    - 科学计算库
 *
 * 3. 性能敏感应用
 *    - CAD/设计工具
 *    - 代码编辑器
 *    - 数据可视化
 *
 * 4. 不适合的场景
 *    - DOM 操作频繁的应用
 *    - 简单的 CRUD 应用
 *    - I/O 密集型任务
 */
```

---

## 二、WebAssembly 工作原理

### 编译流程

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  源代码       │    │  编译器       │    │  .wasm 文件   │
│  (C/C++/Rust) │ -> │  (Emscripten │ -> │  (二进制格式)  │
│              │    │   /wasm-pack) │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
                                              │
                                              v
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  执行        │ <- │  实例化       │ <- │  浏览器加载   │
│  (近原生速度) │    │  (WebAssembly │    │  (fetch)     │
│              │    │   .instantiate)│    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

### 核心概念

```javascript
/**
 * WebAssembly 核心概念:
 *
 * 1. Module (模块)
 *    - 编译后的 Wasm 二进制代码
 *    - 无状态，可缓存和共享
 *    - 类似于 ES6 模块
 *
 * 2. Instance (实例)
 *    - Module 的运行时实例
 *    - 包含所有可调用的导出函数
 *    - 有自己的内存和状态
 *
 * 3. Memory (内存)
 *    - 线性内存，可变长的 ArrayBuffer
 *    - JS 和 Wasm 共享访问
 *    - 按页分配（每页 64KB）
 *
 * 4. Table (表)
 *    - 存储函数引用的数组
 *    - 用于间接函数调用
 *    - 支持动态链接
 *
 * 5. Import/Export
 *    - 模块间的接口
 *    - 可以导入/导出函数、内存、表、全局变量
 */
```

---

## 三、基础使用

### 加载和实例化

```javascript
// 方式1: 使用 WebAssembly.instantiateStreaming (推荐)
async function loadWasm() {
  const response = await fetch('module.wasm')

  const { instance, module } = await WebAssembly.instantiateStreaming(
    response,
    {
      // 导入对象：提供给 Wasm 模块使用的函数和内存
      env: {
        // 导入的函数
        log: (value) => console.log('Wasm says:', value),

        // 导入的内存
        memory: new WebAssembly.Memory({ initial: 1 })  // 1页 = 64KB
      }
    }
  )

  // 调用导出的函数
  const result = instance.exports.add(1, 2)
  console.log('Result:', result)  // 3

  return { instance, module }
}

// 方式2: 使用 WebAssembly.instantiate
async function loadWasmLegacy() {
  const response = await fetch('module.wasm')
  const bytes = await response.arrayBuffer()

  const { instance, module } = await WebAssembly.instantiate(bytes, {
    env: {
      log: (value) => console.log(value)
    }
  })

  return { instance, module }
}

// 方式3: 编译后再实例化（可缓存 module）
async function loadWasmWithCache() {
  const response = await fetch('module.wasm')
  const bytes = await response.arrayBuffer()

  // 编译（可缓存）
  const module = await WebAssembly.compile(bytes)

  // 可以将 module 存入 IndexedDB 缓存

  // 实例化
  const instance = await WebAssembly.instantiate(module, {
    env: {}
  })

  return instance
}

// 方式4: 同步实例化（仅用于小模块，会阻塞主线程）
function loadWasmSync(bytes) {
  const module = new WebAssembly.Module(bytes)
  const instance = new WebAssembly.Instance(module, {
    env: {}
  })

  return instance
}
```

### 内存操作

```javascript
// 创建共享内存
const memory = new WebAssembly.Memory({
  initial: 1,     // 初始页数（64KB）
  maximum: 10,    // 最大页数
  shared: false   // 是否共享（用于多线程）
})

// 获取内存视图
const buffer = memory.buffer
const uint8View = new Uint8Array(buffer)
const int32View = new Int32Array(buffer)
const float64View = new Float64Array(buffer)

// 写入数据
uint8View[0] = 42
int32View[0] = 12345

// 读取数据
console.log(uint8View[0])  // 42

// 增长内存
memory.grow(1)  // 增加1页（64KB）
console.log(memory.buffer.byteLength)  // 131072 (2 * 64KB)

// 注意：grow() 后需要重新获取 buffer
const newBuffer = memory.buffer
const newView = new Uint8Array(newBuffer)

// 在 Wasm 和 JS 之间传递字符串
function writeString(memory, offset, str) {
  const view = new Uint8Array(memory.buffer)
  const encoder = new TextEncoder()
  const bytes = encoder.encode(str)

  view.set(bytes, offset)
  view[offset + bytes.length] = 0  // 添加 null 终止符

  return bytes.length
}

function readString(memory, offset, length) {
  const view = new Uint8Array(memory.buffer)
  const bytes = view.slice(offset, offset + length)
  const decoder = new TextDecoder()

  return decoder.decode(bytes)
}
```

### 函数调用

```javascript
// Wasm 导出函数调用
const { instance } = await WebAssembly.instantiateStreaming(
  fetch('math.wasm')
)

// 调用导出的函数
const add = instance.exports.add
const result = add(10, 20)  // 30

// 导出的内存
const memory = instance.exports.memory

// 调用需要传递数组的函数
function callWithArray(wasmFunc, memory, array) {
  // 在 Wasm 内存中分配空间
  const ptr = instance.exports.alloc(array.length * 4)  // 假设有 alloc 函数

  // 写入数据
  const view = new Int32Array(memory.buffer)
  for (let i = 0; i < array.length; i++) {
    view[ptr / 4 + i] = array[i]
  }

  // 调用 Wasm 函数
  const result = wasmFunc(ptr, array.length)

  // 释放内存
  instance.exports.dealloc(ptr, array.length * 4)  // 假设有 dealloc 函数

  return result
}
```

---

## 四、使用 C/C++ 编写 WebAssembly

### Emscripten 环境搭建

```bash
# 安装 Emscripten
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk

# 下载并安装最新版本
./emsdk install latest
./emsdk activate latest

# 设置环境变量
source ./emsdk_env.sh

# 验证安装
emcc --version
```

### 简单示例

```c
// math.c
#include <emscripten.h>

// 导出函数
EMSCRIPTEN_KEEPALIVE
int add(int a, int b) {
    return a + b;
}

EMSCRIPTEN_KEEPALIVE
int multiply(int a, int b) {
    return a * b;
}

EMSCRIPTEN_KEEPALIVE
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

// 操作数组
EMSCRIPTEN_KEEPALIVE
int sum_array(int* arr, int length) {
    int sum = 0;
    for (int i = 0; i < length; i++) {
        sum += arr[i];
    }
    return sum;
}

// 字符串处理
EMSCRIPTEN_KEEPALIVE
int string_length(const char* str) {
    int len = 0;
    while (str[len] != '\0') {
        len++;
    }
    return len;
}
```

```bash
# 编译为 Wasm
emcc math.c -o math.js \
  -s EXPORTED_FUNCTIONS='["_add", "_multiply", "_factorial", "_sum_array", "_string_length"]' \
  -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]' \
  -s WASM=1 \
  -O3

# 编译选项说明:
# -o math.js          : 输出文件（会同时生成 math.wasm）
# -s EXPORTED_FUNCTIONS: 导出的函数（函数名前加 _）
# -s EXPORTED_RUNTIME_METHODS: 导出的运行时方法
# -s WASM=1           : 生成 WebAssembly
# -O3                 : 优化级别
```

```javascript
// 使用 Emscripten 生成的模块
// 方式1: 使用生成的 JS 胶水代码
Module.onRuntimeInitialized = function() {
  // 直接调用
  const result = Module._add(1, 2)
  console.log(result)  // 3

  // 使用 ccall
  const sum = Module.ccall(
    'add',           // 函数名
    'number',        // 返回类型
    ['number', 'number'],  // 参数类型
    [10, 20]         // 参数值
  )
  console.log(sum)  // 30

  // 使用 cwrap（返回 JS 函数）
  const multiply = Module.cwrap('multiply', 'number', ['number', 'number'])
  console.log(multiply(3, 4))  // 12
}

// 方式2: 作为 ES 模块使用
import createModule from './math.js'

async function main() {
  const Module = await createModule()

  const add = Module.cwrap('add', 'number', ['number', 'number'])
  console.log(add(1, 2))  // 3
}

main()
```

### 处理复杂数据

```c
// image.c - 图像处理示例
#include <emscripten.h>
#include <stdint.h>

// 灰度转换
EMSCRIPTEN_KEEPALIVE
void grayscale(uint8_t* data, int length) {
    for (int i = 0; i < length; i += 4) {
        uint8_t r = data[i];
        uint8_t g = data[i + 1];
        uint8_t b = data[i + 2];

        // 灰度公式
        uint8_t gray = (uint8_t)(0.299 * r + 0.587 * g + 0.114 * b);

        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
        // alpha 保持不变
    }
}

// 图像反转
EMSCRIPTEN_KEEPALIVE
void invert(uint8_t* data, int length) {
    for (int i = 0; i < length; i += 4) {
        data[i] = 255 - data[i];         // R
        data[i + 1] = 255 - data[i + 1]; // G
        data[i + 2] = 255 - data[i + 2]; // B
        // alpha 保持不变
    }
}

// 模糊处理（简单的均值模糊）
EMSCRIPTEN_KEEPALIVE
void blur(uint8_t* src, uint8_t* dst, int width, int height) {
    for (int y = 1; y < height - 1; y++) {
        for (int x = 1; x < width - 1; x++) {
            for (int c = 0; c < 3; c++) {  // RGB 通道
                int sum = 0;
                for (int dy = -1; dy <= 1; dy++) {
                    for (int dx = -1; dx <= 1; dx++) {
                        int idx = ((y + dy) * width + (x + dx)) * 4 + c;
                        sum += src[idx];
                    }
                }
                int idx = (y * width + x) * 4 + c;
                dst[idx] = sum / 9;
            }
            // 复制 alpha
            int idx = (y * width + x) * 4 + 3;
            dst[idx] = src[idx];
        }
    }
}
```

```javascript
// 图像处理示例
async function processImage(imageData) {
  const Module = await createModule()

  // 分配内存
  const length = imageData.data.length
  const ptr = Module._malloc(length)

  // 复制图像数据到 Wasm 内存
  Module.HEAPU8.set(imageData.data, ptr)

  // 调用灰度处理
  Module._grayscale(ptr, length)

  // 读取处理后的数据
  const result = new Uint8ClampedArray(
    Module.HEAPU8.buffer,
    ptr,
    length
  )

  // 创建新的 ImageData
  const newImageData = new ImageData(
    new Uint8ClampedArray(result),
    imageData.width,
    imageData.height
  )

  // 释放内存
  Module._free(ptr)

  return newImageData
}

// Canvas 使用示例
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

const processedData = await processImage(imageData)
ctx.putImageData(processedData, 0, 0)
```

---

## 五、使用 Rust 编写 WebAssembly

### 环境搭建

```bash
# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 添加 wasm32 目标
rustup target add wasm32-unknown-unknown

# 安装 wasm-pack
cargo install wasm-pack

# 安装 wasm-bindgen-cli
cargo install wasm-bindgen-cli
```

### 创建项目

```bash
# 创建新项目
cargo new --lib wasm-demo
cd wasm-demo
```

```toml
# Cargo.toml
[package]
name = "wasm-demo"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
wasm-bindgen = "0.2"
js-sys = "0.3"
web-sys = { version = "0.3", features = [
    "console",
    "Window",
    "Document",
    "Element",
    "HtmlElement",
    "HtmlCanvasElement",
    "CanvasRenderingContext2d",
    "ImageData"
]}

[profile.release]
opt-level = "z"      # 优化体积
lto = true           # 链接时优化
```

### Rust 代码示例

```rust
// src/lib.rs
use wasm_bindgen::prelude::*;
use web_sys::console;

// 导出函数
#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

// 使用 console.log
#[wasm_bindgen]
pub fn greet(name: &str) {
    console::log_1(&format!("Hello, {}!", name).into());
}

// 操作 DOM
#[wasm_bindgen]
pub fn update_element(id: &str, content: &str) -> Result<(), JsValue> {
    let window = web_sys::window().expect("no window");
    let document = window.document().expect("no document");

    let element = document
        .get_element_by_id(id)
        .expect("element not found");

    element.set_inner_html(content);

    Ok(())
}

// 处理数组
#[wasm_bindgen]
pub fn sum_array(arr: &[i32]) -> i32 {
    arr.iter().sum()
}

// 返回数组
#[wasm_bindgen]
pub fn get_primes(limit: u32) -> Vec<u32> {
    let mut primes = Vec::new();

    for n in 2..=limit {
        let is_prime = (2..n).all(|i| n % i != 0);
        if is_prime {
            primes.push(n);
        }
    }

    primes
}

// 结构体
#[wasm_bindgen]
pub struct Point {
    x: f64,
    y: f64,
}

#[wasm_bindgen]
impl Point {
    #[wasm_bindgen(constructor)]
    pub fn new(x: f64, y: f64) -> Point {
        Point { x, y }
    }

    pub fn x(&self) -> f64 {
        self.x
    }

    pub fn y(&self) -> f64 {
        self.y
    }

    pub fn distance(&self, other: &Point) -> f64 {
        let dx = self.x - other.x;
        let dy = self.y - other.y;
        (dx * dx + dy * dy).sqrt()
    }
}

// 图像处理
#[wasm_bindgen]
pub fn grayscale(data: &mut [u8]) {
    for pixel in data.chunks_mut(4) {
        let r = pixel[0] as f32;
        let g = pixel[1] as f32;
        let b = pixel[2] as f32;

        let gray = (0.299 * r + 0.587 * g + 0.114 * b) as u8;

        pixel[0] = gray;
        pixel[1] = gray;
        pixel[2] = gray;
    }
}

// 高性能排序
#[wasm_bindgen]
pub fn quick_sort(arr: &mut [i32]) {
    if arr.len() <= 1 {
        return;
    }

    let pivot_index = partition(arr);

    let (left, right) = arr.split_at_mut(pivot_index);
    quick_sort(left);
    quick_sort(&mut right[1..]);
}

fn partition(arr: &mut [i32]) -> usize {
    let len = arr.len();
    let pivot = arr[len - 1];
    let mut i = 0;

    for j in 0..len - 1 {
        if arr[j] <= pivot {
            arr.swap(i, j);
            i += 1;
        }
    }

    arr.swap(i, len - 1);
    i
}
```

### 编译和使用

```bash
# 编译
wasm-pack build --target web

# 生成的文件结构:
# pkg/
#   ├── wasm_demo.js        # JS 胶水代码
#   ├── wasm_demo_bg.wasm   # Wasm 二进制
#   ├── wasm_demo.d.ts      # TypeScript 类型定义
#   └── package.json
```

```html
<!DOCTYPE html>
<html>
<head>
  <title>Wasm Demo</title>
</head>
<body>
  <div id="output"></div>

  <script type="module">
    import init, {
      add,
      fibonacci,
      greet,
      sum_array,
      get_primes,
      Point,
      grayscale
    } from './pkg/wasm_demo.js'

    async function main() {
      // 初始化 Wasm 模块
      await init()

      // 基本函数调用
      console.log('add(1, 2) =', add(1, 2))
      console.log('fibonacci(10) =', fibonacci(10))

      // 字符串
      greet('Wasm')

      // 数组
      const arr = new Int32Array([1, 2, 3, 4, 5])
      console.log('sum =', sum_array(arr))

      // 获取素数
      const primes = get_primes(100)
      console.log('primes:', primes)

      // 使用结构体
      const p1 = new Point(0, 0)
      const p2 = new Point(3, 4)
      console.log('distance:', p1.distance(p2))  // 5

      // 图像处理
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      // ... 加载图像
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      grayscale(imageData.data)
      ctx.putImageData(imageData, 0, 0)
    }

    main()
  </script>
</body>
</html>
```

---

## 六、实战案例

### 1. 图像处理

```javascript
// 完整的图像处理模块
class WasmImageProcessor {
  constructor() {
    this.module = null
    this.ready = false
  }

  async init() {
    const response = await fetch('image_processor.wasm')
    const { instance } = await WebAssembly.instantiateStreaming(response)

    this.module = instance.exports
    this.memory = this.module.memory
    this.ready = true
  }

  // 分配内存
  allocate(size) {
    return this.module.alloc(size)
  }

  // 释放内存
  free(ptr, size) {
    this.module.dealloc(ptr, size)
  }

  // 灰度处理
  grayscale(imageData) {
    const { data, width, height } = imageData
    const length = data.length

    // 分配内存并复制数据
    const ptr = this.allocate(length)
    const view = new Uint8Array(this.memory.buffer, ptr, length)
    view.set(data)

    // 调用 Wasm 函数
    this.module.grayscale(ptr, length)

    // 读取结果
    const result = new Uint8ClampedArray(view)

    // 释放内存
    this.free(ptr, length)

    return new ImageData(result, width, height)
  }

  // 高斯模糊
  blur(imageData, radius = 5) {
    const { data, width, height } = imageData
    const length = data.length

    const srcPtr = this.allocate(length)
    const dstPtr = this.allocate(length)

    const srcView = new Uint8Array(this.memory.buffer, srcPtr, length)
    srcView.set(data)

    this.module.gaussian_blur(srcPtr, dstPtr, width, height, radius)

    const dstView = new Uint8Array(this.memory.buffer, dstPtr, length)
    const result = new Uint8ClampedArray(dstView)

    this.free(srcPtr, length)
    this.free(dstPtr, length)

    return new ImageData(result, width, height)
  }

  // 边缘检测
  edgeDetect(imageData) {
    // ... 类似实现
  }
}

// 使用示例
const processor = new WasmImageProcessor()
await processor.init()

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

// 应用灰度
const grayData = processor.grayscale(imageData)
ctx.putImageData(grayData, 0, 0)

// 应用模糊
const blurData = processor.blur(imageData, 10)
ctx.putImageData(blurData, 0, 0)
```

### 2. 加密计算

```rust
// 使用 Rust 实现 SHA-256
use wasm_bindgen::prelude::*;
use sha2::{Sha256, Digest};

#[wasm_bindgen]
pub fn sha256(data: &[u8]) -> Vec<u8> {
    let mut hasher = Sha256::new();
    hasher.update(data);
    hasher.finalize().to_vec()
}

#[wasm_bindgen]
pub fn sha256_hex(data: &str) -> String {
    let hash = sha256(data.as_bytes());
    hash.iter().map(|b| format!("{:02x}", b)).collect()
}

// AES 加密
use aes::Aes256;
use block_modes::{BlockMode, Cbc};
use block_modes::block_padding::Pkcs7;

type Aes256Cbc = Cbc<Aes256, Pkcs7>;

#[wasm_bindgen]
pub fn aes_encrypt(data: &[u8], key: &[u8], iv: &[u8]) -> Vec<u8> {
    let cipher = Aes256Cbc::new_from_slices(key, iv).unwrap();
    cipher.encrypt_vec(data)
}

#[wasm_bindgen]
pub fn aes_decrypt(data: &[u8], key: &[u8], iv: &[u8]) -> Vec<u8> {
    let cipher = Aes256Cbc::new_from_slices(key, iv).unwrap();
    cipher.decrypt_vec(data).unwrap()
}
```

```javascript
// 使用加密模块
import init, { sha256_hex, aes_encrypt, aes_decrypt } from './crypto.js'

await init()

// SHA-256
const hash = sha256_hex('Hello, World!')
console.log(hash)

// AES 加密
const key = new Uint8Array(32)  // 256-bit key
const iv = new Uint8Array(16)   // 128-bit IV
crypto.getRandomValues(key)
crypto.getRandomValues(iv)

const plaintext = new TextEncoder().encode('Secret message')
const ciphertext = aes_encrypt(plaintext, key, iv)

const decrypted = aes_decrypt(ciphertext, key, iv)
console.log(new TextDecoder().decode(decrypted))
```

### 3. 游戏物理引擎

```rust
// 简单的物理模拟
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct PhysicsWorld {
    bodies: Vec<Body>,
    gravity: f32,
}

struct Body {
    x: f32,
    y: f32,
    vx: f32,
    vy: f32,
    mass: f32,
    radius: f32,
}

#[wasm_bindgen]
impl PhysicsWorld {
    #[wasm_bindgen(constructor)]
    pub fn new(gravity: f32) -> PhysicsWorld {
        PhysicsWorld {
            bodies: Vec::new(),
            gravity,
        }
    }

    pub fn add_body(&mut self, x: f32, y: f32, mass: f32, radius: f32) -> usize {
        let body = Body {
            x, y,
            vx: 0.0,
            vy: 0.0,
            mass,
            radius,
        };
        self.bodies.push(body);
        self.bodies.len() - 1
    }

    pub fn set_velocity(&mut self, index: usize, vx: f32, vy: f32) {
        if let Some(body) = self.bodies.get_mut(index) {
            body.vx = vx;
            body.vy = vy;
        }
    }

    pub fn step(&mut self, dt: f32) {
        // 应用重力
        for body in &mut self.bodies {
            body.vy += self.gravity * dt;
        }

        // 更新位置
        for body in &mut self.bodies {
            body.x += body.vx * dt;
            body.y += body.vy * dt;
        }

        // 碰撞检测
        self.handle_collisions();
    }

    fn handle_collisions(&mut self) {
        let len = self.bodies.len();

        for i in 0..len {
            for j in (i + 1)..len {
                let (left, right) = self.bodies.split_at_mut(j);
                let a = &mut left[i];
                let b = &mut right[0];

                let dx = b.x - a.x;
                let dy = b.y - a.y;
                let dist = (dx * dx + dy * dy).sqrt();

                if dist < a.radius + b.radius {
                    // 简单的弹性碰撞
                    let nx = dx / dist;
                    let ny = dy / dist;

                    let dvx = a.vx - b.vx;
                    let dvy = a.vy - b.vy;

                    let dvn = dvx * nx + dvy * ny;

                    if dvn > 0.0 {
                        continue;
                    }

                    let m1 = a.mass;
                    let m2 = b.mass;

                    let j = -2.0 * dvn / (1.0 / m1 + 1.0 / m2);

                    a.vx += j * nx / m1;
                    a.vy += j * ny / m1;
                    b.vx -= j * nx / m2;
                    b.vy -= j * ny / m2;
                }
            }
        }
    }

    pub fn get_position(&self, index: usize) -> Vec<f32> {
        if let Some(body) = self.bodies.get(index) {
            vec![body.x, body.y]
        } else {
            vec![0.0, 0.0]
        }
    }

    pub fn body_count(&self) -> usize {
        self.bodies.len()
    }
}
```

```javascript
// 使用物理引擎
import init, { PhysicsWorld } from './physics.js'

await init()

const world = new PhysicsWorld(9.8)

// 添加物体
const ball1 = world.add_body(100, 100, 1.0, 20)
const ball2 = world.add_body(200, 100, 1.0, 20)

world.set_velocity(ball1, 50, 0)
world.set_velocity(ball2, -50, 0)

// 渲染循环
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

function render() {
  world.step(1 / 60)

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < world.body_count(); i++) {
    const [x, y] = world.get_position(i)

    ctx.beginPath()
    ctx.arc(x, y, 20, 0, Math.PI * 2)
    ctx.fill()
  }

  requestAnimationFrame(render)
}

render()
```

---

## 七、性能优化

### 1. 减小体积

```bash
# C/C++ 编译优化
emcc main.c -O3 -s WASM=1 -s FILESYSTEM=0 -s ASSERTIONS=0

# Rust 编译优化
[profile.release]
opt-level = "z"     # 优化体积
lto = true          # 链接时优化
codegen-units = 1   # 单代码单元

# 使用 wasm-opt 进一步优化
wasm-opt -O3 -o optimized.wasm input.wasm

# 使用 brotli 压缩
brotli -o module.wasm.br module.wasm
```

### 2. 加载优化

```javascript
// 流式编译（边下载边编译）
const response = await fetch('module.wasm')
const { instance } = await WebAssembly.instantiateStreaming(response)

// 缓存编译后的模块
async function loadWasmWithCache(url, cacheName = 'wasm-cache') {
  const cache = await caches.open(cacheName)
  let response = await cache.match(url)

  if (!response) {
    response = await fetch(url)
    cache.put(url, response.clone())
  }

  return WebAssembly.instantiateStreaming(response)
}

// 预加载
<link rel="preload" href="module.wasm" as="fetch" crossorigin>

// 使用 Service Worker 缓存
self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('.wasm')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((response) => {
          const clone = response.clone()
          caches.open('wasm-cache').then((cache) => {
            cache.put(event.request, clone)
          })
          return response
        })
      })
    )
  }
})
```

### 3. 内存优化

```javascript
// 复用内存
const memory = new WebAssembly.Memory({ initial: 10, maximum: 100 })

// 避免频繁分配
class MemoryPool {
  constructor(memory, blockSize, blockCount) {
    this.memory = memory
    this.blockSize = blockSize
    this.blocks = []

    // 预分配块
    for (let i = 0; i < blockCount; i++) {
      this.blocks.push({
        ptr: i * blockSize,
        free: true
      })
    }
  }

  alloc() {
    const block = this.blocks.find(b => b.free)
    if (block) {
      block.free = false
      return block.ptr
    }
    return null
  }

  free(ptr) {
    const block = this.blocks.find(b => b.ptr === ptr)
    if (block) {
      block.free = true
    }
  }
}
```

---

## 八、常见面试题

::: details 1. WebAssembly 是什么？有什么优势？
<details>
<summary>点击查看答案</summary>

**定义：**
WebAssembly 是一种低级的类汇编语言，具有紧凑的二进制格式，可以在浏览器中以接近原生的速度运行。

**优势：**
1. **高性能**：预编译为二进制，执行速度接近原生
2. **可移植**：跨平台，不依赖特定硬件
3. **安全**：在沙箱中运行，与 JS 相同的安全策略
4. **多语言**：支持 C/C++/Rust/Go 等语言编译
5. **体积小**：二进制格式，加载快

**适用场景：**
- 计算密集型任务（图像处理、加密）
- 游戏引擎
- 现有 C/C++ 库移植
:::

</details>

::: details 2. WebAssembly 和 JavaScript 如何交互？
<details>
<summary>点击查看答案</summary>

**交互方式：**

1. **导入/导出函数**：
```javascript
// JS 导入函数给 Wasm
const imports = {
  env: {
    log: (x) => console.log(x)
  }
}

// Wasm 导出函数给 JS
const result = instance.exports.add(1, 2)
```

2. **共享内存**：
```javascript
const memory = new WebAssembly.Memory({ initial: 1 })
const view = new Uint8Array(memory.buffer)
// JS 和 Wasm 都可以读写这块内存
```

3. **传递复杂数据**：
- 基本类型直接传递
- 数组/字符串通过共享内存传递
- 对象需要序列化
:::

</details>

::: details 3. WebAssembly 的局限性是什么？
<details>
<summary>点击查看答案</summary>

**局限性：**

1. **无法直接操作 DOM**：需要通过 JS 桥接
2. **垃圾回收**：目前不支持 GC，需手动管理内存
3. **多线程限制**：SharedArrayBuffer 支持有限
4. **调试困难**：二进制格式不易调试
5. **启动成本**：小型应用可能比 JS 更慢
6. **生态系统**：工具链不如 JS 成熟

**不适合的场景：**
- DOM 操作频繁的应用
- 简单的 CRUD 应用
- I/O 密集型任务
:::

---

</details>

## 总结

::: details 核心要点
1. **定位**：Wasm 是 JS 的补充，用于计算密集型任务
2. **编译**：支持 C/C++/Rust/Go 等语言
3. **交互**：通过导入/导出函数和共享内存与 JS 交互
4. **性能**：接近原生速度，但有启动成本
5. **安全**：在沙箱中运行，与 JS 同样安全
:::

::: details 工具链
| 语言 | 工具链 |
|------|--------|
| C/C++ | Emscripten |
| Rust | wasm-pack, wasm-bindgen |
| Go | 内置支持 |
| AssemblyScript | asc (TypeScript-like) |
:::

::: details 学习资源
- [WebAssembly 官网](https://webassembly.org/)
- [MDN WebAssembly 文档](https://developer.mozilla.org/zh-CN/docs/WebAssembly)
- [Rust and WebAssembly](https://rustwasm.github.io/docs/book/)
- [Emscripten 文档](https://emscripten.org/docs/)
:::
