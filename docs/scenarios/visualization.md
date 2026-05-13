# 前端数据可视化

## 概述

数据可视化是将数据转化为图形的过程，帮助用户直观理解数据。本章节介绍前端数据可视化的核心技术和常用库。

---

## 一、可视化技术选型

### 1. 技术对比

| 技术 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| SVG | 矢量图、可交互、DOM 操作 | 数量大时性能差 | 图表、图标 |
| Canvas | 高性能、像素操作 | 放大模糊、交互复杂 | 大数据量、游戏 |
| WebGL | 极高性能、3D 支持 | 学习成本高 | 3D、海量数据 |

### 2. 库选择

| 库 | 定位 | 特点 | GitHub Stars |
|-----|------|------|--------------|
| ECharts | 全能型 | 配置简单、图表丰富 | 55k+ |
| D3.js | 底层库 | 灵活强大、学习曲线陡 | 105k+ |
| Chart.js | 轻量级 | 简单易用、响应式 | 60k+ |
| AntV G2 | 企业级 | 图形语法、蚂蚁出品 | 12k+ |
| Three.js | 3D 图形 | WebGL 封装、3D 场景 | 90k+ |

---

## 二、Canvas 基础

### 1. 基本绑定

```javascript
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

// 设置画布大小（处理高清屏）
const dpr = window.devicePixelRatio || 1
canvas.width = canvas.clientWidth * dpr
canvas.height = canvas.clientHeight * dpr
ctx.scale(dpr, dpr)
```

### 2. 基本图形

```javascript
// 矩形
ctx.fillStyle = '#3498db'
ctx.fillRect(10, 10, 100, 50)

ctx.strokeStyle = '#e74c3c'
ctx.lineWidth = 2
ctx.strokeRect(10, 80, 100, 50)

// 路径
ctx.beginPath()
ctx.moveTo(200, 10)
ctx.lineTo(250, 50)
ctx.lineTo(200, 90)
ctx.closePath()
ctx.fill()

// 圆形
ctx.beginPath()
ctx.arc(350, 50, 40, 0, Math.PI * 2)
ctx.fill()

// 圆弧
ctx.beginPath()
ctx.arc(450, 50, 40, 0, Math.PI)
ctx.stroke()

// 贝塞尔曲线
ctx.beginPath()
ctx.moveTo(10, 200)
ctx.quadraticCurveTo(100, 150, 200, 200)  // 二次
ctx.stroke()

ctx.beginPath()
ctx.moveTo(250, 200)
ctx.bezierCurveTo(300, 150, 400, 250, 450, 200)  // 三次
ctx.stroke()
```

### 3. 文本

```javascript
ctx.font = '24px Arial'
ctx.fillStyle = '#333'
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillText('Hello Canvas', 200, 100)

// 描边文字
ctx.strokeStyle = '#3498db'
ctx.lineWidth = 1
ctx.strokeText('Outline', 200, 150)
```

### 4. 渐变与阴影

```javascript
// 线性渐变
const linearGradient = ctx.createLinearGradient(0, 0, 200, 0)
linearGradient.addColorStop(0, '#3498db')
linearGradient.addColorStop(1, '#e74c3c')
ctx.fillStyle = linearGradient
ctx.fillRect(10, 10, 200, 100)

// 径向渐变
const radialGradient = ctx.createRadialGradient(100, 200, 10, 100, 200, 80)
radialGradient.addColorStop(0, '#fff')
radialGradient.addColorStop(1, '#3498db')
ctx.fillStyle = radialGradient
ctx.beginPath()
ctx.arc(100, 200, 80, 0, Math.PI * 2)
ctx.fill()

// 阴影
ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
ctx.shadowBlur = 10
ctx.shadowOffsetX = 5
ctx.shadowOffsetY = 5
ctx.fillRect(250, 10, 100, 100)
```

### 5. 变换

```javascript
// 保存状态
ctx.save()

// 平移
ctx.translate(100, 100)

// 旋转
ctx.rotate(Math.PI / 4)

// 缩放
ctx.scale(1.5, 1.5)

// 绘制
ctx.fillRect(-25, -25, 50, 50)

// 恢复状态
ctx.restore()
```

### 6. 动画

```javascript
let x = 0

function animate() {
  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 绘制
  ctx.fillStyle = '#3498db'
  ctx.beginPath()
  ctx.arc(x, 100, 20, 0, Math.PI * 2)
  ctx.fill()

  // 更新位置
  x += 2
  if (x > canvas.width) x = 0

  requestAnimationFrame(animate)
}

animate()
```

---

## 三、SVG 基础

### 1. 基本图形

```html
<svg width="500" height="300" viewBox="0 0 500 300">
  <!-- 矩形 -->
  <rect x="10" y="10" width="100" height="50" fill="#3498db" />

  <!-- 圆形 -->
  <circle cx="200" cy="35" r="25" fill="#e74c3c" />

  <!-- 椭圆 -->
  <ellipse cx="300" cy="35" rx="40" ry="25" fill="#2ecc71" />

  <!-- 线条 -->
  <line x1="10" y1="100" x2="150" y2="100" stroke="#333" stroke-width="2" />

  <!-- 折线 -->
  <polyline points="10,150 50,120 90,180 130,140"
            fill="none" stroke="#3498db" stroke-width="2" />

  <!-- 多边形 -->
  <polygon points="200,100 250,150 200,200 150,150"
           fill="#9b59b6" />

  <!-- 路径 -->
  <path d="M 300 100 L 350 150 Q 400 100 350 200 Z"
        fill="#f39c12" />
</svg>
```

### 2. 样式与渐变

```html
<svg width="400" height="200">
  <defs>
    <!-- 线性渐变 -->
    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3498db" />
      <stop offset="100%" style="stop-color:#e74c3c" />
    </linearGradient>

    <!-- 径向渐变 -->
    <radialGradient id="gradient2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#fff" />
      <stop offset="100%" style="stop-color:#3498db" />
    </radialGradient>

    <!-- 滤镜 -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>

  <rect x="10" y="10" width="150" height="80" fill="url(#gradient1)" />
  <circle cx="280" cy="50" r="40" fill="url(#gradient2)" />
  <rect x="10" y="110" width="100" height="60" fill="#3498db" filter="url(#shadow)" />
</svg>
```

### 3. 动画

```html
<svg width="400" height="200">
  <!-- SMIL 动画 -->
  <circle cx="50" cy="100" r="20" fill="#3498db">
    <animate attributeName="cx" from="50" to="350" dur="2s" repeatCount="indefinite" />
  </circle>

  <!-- 变换动画 -->
  <rect x="150" y="80" width="40" height="40" fill="#e74c3c">
    <animateTransform attributeName="transform" type="rotate"
                      from="0 170 100" to="360 170 100"
                      dur="2s" repeatCount="indefinite" />
  </rect>

  <!-- 路径动画 -->
  <circle r="10" fill="#2ecc71">
    <animateMotion dur="3s" repeatCount="indefinite">
      <mpath href="#motionPath" />
    </animateMotion>
  </circle>
  <path id="motionPath" d="M 250,100 Q 300,50 350,100 T 450,100"
        fill="none" stroke="#ddd" />
</svg>
```

### 4. JavaScript 操作

```javascript
// 创建 SVG 元素
const svgNS = 'http://www.w3.org/2000/svg'

function createSVGElement(tag, attrs) {
  const el = document.createElementNS(svgNS, tag)
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value)
  }
  return el
}

const svg = document.querySelector('svg')

// 创建圆形
const circle = createSVGElement('circle', {
  cx: 100,
  cy: 100,
  r: 50,
  fill: '#3498db'
})

svg.appendChild(circle)

// 事件监听
circle.addEventListener('click', () => {
  circle.setAttribute('fill', '#e74c3c')
})

// 动画
let radius = 50
function animate() {
  radius = 50 + 20 * Math.sin(Date.now() / 200)
  circle.setAttribute('r', radius)
  requestAnimationFrame(animate)
}
animate()
```

---

## 四、ECharts

### 1. 基本使用

```javascript
import * as echarts from 'echarts'

// 初始化
const chart = echarts.init(document.getElementById('chart'))

// 配置项
const option = {
  title: {
    text: '销售数据'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['销量', '利润']
  },
  xAxis: {
    type: 'category',
    data: ['一月', '二月', '三月', '四月', '五月']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '销量',
      type: 'bar',
      data: [120, 200, 150, 80, 70]
    },
    {
      name: '利润',
      type: 'line',
      data: [30, 50, 40, 20, 15]
    }
  ]
}

chart.setOption(option)

// 响应式
window.addEventListener('resize', () => {
  chart.resize()
})
```

### 2. 常用图表类型

```javascript
// 饼图
const pieOption = {
  series: [{
    type: 'pie',
    radius: '50%',
    data: [
      { value: 1048, name: '搜索引擎' },
      { value: 735, name: '直接访问' },
      { value: 580, name: '邮件营销' }
    ]
  }]
}

// 散点图
const scatterOption = {
  xAxis: { type: 'value' },
  yAxis: { type: 'value' },
  series: [{
    type: 'scatter',
    data: [[10, 20], [15, 30], [20, 25], [25, 35]]
  }]
}

// 雷达图
const radarOption = {
  radar: {
    indicator: [
      { name: '销售', max: 100 },
      { name: '管理', max: 100 },
      { name: '技术', max: 100 },
      { name: '客服', max: 100 },
      { name: '研发', max: 100 }
    ]
  },
  series: [{
    type: 'radar',
    data: [{
      value: [80, 90, 70, 85, 95],
      name: '团队A'
    }]
  }]
}

// 热力图
const heatmapOption = {
  xAxis: { type: 'category', data: ['周一', '周二', '周三'] },
  yAxis: { type: 'category', data: ['早', '中', '晚'] },
  visualMap: { min: 0, max: 100 },
  series: [{
    type: 'heatmap',
    data: [
      [0, 0, 50], [0, 1, 80], [0, 2, 60],
      [1, 0, 70], [1, 1, 90], [1, 2, 40],
      [2, 0, 30], [2, 1, 60], [2, 2, 85]
    ]
  }]
}
```

### 3. 交互与事件

```javascript
// 点击事件
chart.on('click', (params) => {
  console.log('点击:', params.name, params.value)
})

// 图例切换
chart.on('legendselectchanged', (params) => {
  console.log('图例变化:', params.selected)
})

// 数据区域缩放
chart.on('datazoom', (params) => {
  console.log('缩放:', params.start, params.end)
})

// 高亮
chart.dispatchAction({
  type: 'highlight',
  seriesIndex: 0,
  dataIndex: 2
})

// 显示 tooltip
chart.dispatchAction({
  type: 'showTip',
  seriesIndex: 0,
  dataIndex: 1
})
```

### 4. 动态数据

```javascript
// 实时更新
function updateData() {
  const newData = data.map(() => Math.random() * 100)

  chart.setOption({
    series: [{
      data: newData
    }]
  })
}

setInterval(updateData, 2000)

// 增量更新（大数据量）
chart.appendData({
  seriesIndex: 0,
  data: [[Date.now(), Math.random() * 100]]
})
```

---

## 五、D3.js

### 1. 选择与数据绑定

```javascript
import * as d3 from 'd3'

// 选择元素
const svg = d3.select('#chart')
  .append('svg')
  .attr('width', 500)
  .attr('height', 300)

// 数据绑定
const data = [30, 86, 168, 281, 303]

svg.selectAll('rect')
  .data(data)
  .join('rect')
  .attr('x', (d, i) => i * 50)
  .attr('y', d => 300 - d)
  .attr('width', 40)
  .attr('height', d => d)
  .attr('fill', '#3498db')
```

### 2. 比例尺

```javascript
// 线性比例尺
const xScale = d3.scaleLinear()
  .domain([0, 100])   // 数据范围
  .range([0, 500])    // 像素范围

xScale(50)  // 250

// 序数比例尺
const colorScale = d3.scaleOrdinal()
  .domain(['A', 'B', 'C'])
  .range(['#3498db', '#e74c3c', '#2ecc71'])

colorScale('A')  // '#3498db'

// 时间比例尺
const timeScale = d3.scaleTime()
  .domain([new Date(2024, 0, 1), new Date(2024, 11, 31)])
  .range([0, 500])

// 带宽比例尺（柱状图）
const bandScale = d3.scaleBand()
  .domain(['A', 'B', 'C', 'D'])
  .range([0, 400])
  .padding(0.1)

bandScale.bandwidth()  // 每个柱子的宽度
```

### 3. 坐标轴

```javascript
const margin = { top: 20, right: 20, bottom: 30, left: 40 }
const width = 500 - margin.left - margin.right
const height = 300 - margin.top - margin.bottom

const svg = d3.select('#chart')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`)

// X 轴
const xScale = d3.scaleBand()
  .domain(['A', 'B', 'C', 'D'])
  .range([0, width])

svg.append('g')
  .attr('transform', `translate(0,${height})`)
  .call(d3.axisBottom(xScale))

// Y 轴
const yScale = d3.scaleLinear()
  .domain([0, 100])
  .range([height, 0])

svg.append('g')
  .call(d3.axisLeft(yScale))
```

### 4. 过渡动画

```javascript
// 基本过渡
svg.selectAll('rect')
  .data(newData)
  .transition()
  .duration(1000)
  .ease(d3.easeElastic)
  .attr('height', d => d)
  .attr('y', d => height - d)

// Enter/Update/Exit 模式
const bars = svg.selectAll('rect').data(data)

// Enter - 新增元素
bars.enter()
  .append('rect')
  .attr('x', (d, i) => i * 50)
  .attr('y', height)
  .attr('width', 40)
  .attr('height', 0)
  .attr('fill', '#3498db')
  .transition()
  .duration(500)
  .attr('y', d => height - d)
  .attr('height', d => d)

// Update - 更新元素
bars.transition()
  .duration(500)
  .attr('y', d => height - d)
  .attr('height', d => d)

// Exit - 移除元素
bars.exit()
  .transition()
  .duration(500)
  .attr('height', 0)
  .attr('y', height)
  .remove()
```

### 5. 交互

```javascript
svg.selectAll('rect')
  .on('mouseover', function(event, d) {
    d3.select(this)
      .transition()
      .duration(200)
      .attr('fill', '#e74c3c')

    // 显示 tooltip
    tooltip
      .style('opacity', 1)
      .html(`Value: ${d}`)
      .style('left', `${event.pageX + 10}px`)
      .style('top', `${event.pageY - 10}px`)
  })
  .on('mouseout', function() {
    d3.select(this)
      .transition()
      .duration(200)
      .attr('fill', '#3498db')

    tooltip.style('opacity', 0)
  })
  .on('click', function(event, d) {
    console.log('Clicked:', d)
  })
```

---

## 六、大数据量渲染

### 1. Canvas 优化

```javascript
// 1. 离屏 Canvas
const offscreenCanvas = document.createElement('canvas')
const offscreenCtx = offscreenCanvas.getContext('2d')

// 在离屏 Canvas 预渲染
function prerender() {
  offscreenCtx.clearRect(0, 0, width, height)
  // 绑制复杂图形...
}

// 主 Canvas 只做复制
function render() {
  ctx.drawImage(offscreenCanvas, 0, 0)
}

// 2. 分层渲染
// 静态层 - 坐标轴、背景
// 动态层 - 数据点、动画

// 3. 视口裁剪
function renderVisibleData(data, viewport) {
  const visibleData = data.filter(d =>
    d.x >= viewport.left && d.x <= viewport.right &&
    d.y >= viewport.top && d.y <= viewport.bottom
  )

  visibleData.forEach(d => {
    ctx.fillRect(d.x, d.y, 2, 2)
  })
}

// 4. 数据聚合
function aggregateData(data, resolution) {
  const buckets = new Map()

  data.forEach(d => {
    const key = `${Math.floor(d.x / resolution)}_${Math.floor(d.y / resolution)}`
    if (!buckets.has(key)) {
      buckets.set(key, { count: 0, x: 0, y: 0 })
    }
    const bucket = buckets.get(key)
    bucket.count++
    bucket.x += d.x
    bucket.y += d.y
  })

  return Array.from(buckets.values()).map(b => ({
    x: b.x / b.count,
    y: b.y / b.count,
    size: Math.log(b.count + 1)
  }))
}
```

### 2. WebGL 渲染

```javascript
// 使用 PixiJS
import * as PIXI from 'pixi.js'

const app = new PIXI.Application({
  width: 800,
  height: 600,
  antialias: true
})

document.body.appendChild(app.view)

// 创建粒子容器
const container = new PIXI.ParticleContainer(100000, {
  scale: true,
  position: true
})

app.stage.addChild(container)

// 批量创建粒子
const texture = PIXI.Texture.from('particle.png')
const particles = []

for (let i = 0; i < 100000; i++) {
  const particle = new PIXI.Sprite(texture)
  particle.x = Math.random() * 800
  particle.y = Math.random() * 600
  particle.scale.set(0.1)
  container.addChild(particle)
  particles.push(particle)
}

// 动画
app.ticker.add(() => {
  particles.forEach(p => {
    p.x += (Math.random() - 0.5) * 2
    p.y += (Math.random() - 0.5) * 2
  })
})
```

### 3. 虚拟滚动

```javascript
// 只渲染可视区域的数据
class VirtualScroller {
  constructor(container, data, itemHeight) {
    this.container = container
    this.data = data
    this.itemHeight = itemHeight
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight)

    this.setup()
  }

  setup() {
    // 创建滚动容器
    this.scrollContainer = document.createElement('div')
    this.scrollContainer.style.height = `${this.data.length * this.itemHeight}px`
    this.scrollContainer.style.position = 'relative'
    this.container.appendChild(this.scrollContainer)

    // 监听滚动
    this.container.addEventListener('scroll', () => this.render())

    this.render()
  }

  render() {
    const scrollTop = this.container.scrollTop
    const startIndex = Math.floor(scrollTop / this.itemHeight)
    const endIndex = Math.min(startIndex + this.visibleCount + 1, this.data.length)

    // 清除旧元素
    this.scrollContainer.innerHTML = ''

    // 渲染可见元素
    for (let i = startIndex; i < endIndex; i++) {
      const item = document.createElement('div')
      item.style.position = 'absolute'
      item.style.top = `${i * this.itemHeight}px`
      item.style.height = `${this.itemHeight}px`
      item.textContent = this.data[i]
      this.scrollContainer.appendChild(item)
    }
  }
}
```

---

## 七、常见图表实现

### 1. 柱状图

```javascript
function drawBarChart(ctx, data, options) {
  const { width, height, padding = 40 } = options
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  // 计算比例
  const maxValue = Math.max(...data.map(d => d.value))
  const barWidth = chartWidth / data.length * 0.8
  const gap = chartWidth / data.length * 0.2

  // 绘制坐标轴
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, height - padding)
  ctx.lineTo(width - padding, height - padding)
  ctx.stroke()

  // 绘制柱子
  data.forEach((d, i) => {
    const x = padding + i * (barWidth + gap)
    const barHeight = (d.value / maxValue) * chartHeight
    const y = height - padding - barHeight

    ctx.fillStyle = d.color || '#3498db'
    ctx.fillRect(x, y, barWidth, barHeight)

    // 标签
    ctx.fillStyle = '#333'
    ctx.textAlign = 'center'
    ctx.fillText(d.label, x + barWidth / 2, height - padding + 20)
    ctx.fillText(d.value, x + barWidth / 2, y - 5)
  })
}
```

### 2. 折线图

```javascript
function drawLineChart(ctx, data, options) {
  const { width, height, padding = 40 } = options
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const maxValue = Math.max(...data.map(d => d.value))
  const xStep = chartWidth / (data.length - 1)

  // 绘制网格线
  ctx.strokeStyle = '#eee'
  for (let i = 0; i <= 5; i++) {
    const y = padding + (chartHeight / 5) * i
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
  }

  // 绘制折线
  ctx.beginPath()
  ctx.strokeStyle = '#3498db'
  ctx.lineWidth = 2

  data.forEach((d, i) => {
    const x = padding + i * xStep
    const y = height - padding - (d.value / maxValue) * chartHeight

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.stroke()

  // 绘制数据点
  data.forEach((d, i) => {
    const x = padding + i * xStep
    const y = height - padding - (d.value / maxValue) * chartHeight

    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#3498db'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
  })
}
```

### 3. 饼图

```javascript
function drawPieChart(ctx, data, options) {
  const { width, height } = options
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 2 - 20

  const total = data.reduce((sum, d) => sum + d.value, 0)
  let startAngle = -Math.PI / 2

  data.forEach((d, i) => {
    const sliceAngle = (d.value / total) * Math.PI * 2
    const endAngle = startAngle + sliceAngle

    // 绘制扇形
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.closePath()
    ctx.fillStyle = d.color || `hsl(${i * 60}, 70%, 60%)`
    ctx.fill()

    // 绘制标签
    const midAngle = startAngle + sliceAngle / 2
    const labelX = centerX + Math.cos(midAngle) * (radius * 0.7)
    const labelY = centerY + Math.sin(midAngle) * (radius * 0.7)

    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${((d.value / total) * 100).toFixed(1)}%`, labelX, labelY)

    startAngle = endAngle
  })
}
```

---

