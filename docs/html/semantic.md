# HTML 语义化详解

## 目录
- [什么是语义化](#什么是语义化)
- [语义化的好处](#语义化的好处)
- [HTML5 语义化标签](#html5-语义化标签)
- [如何正确使用语义化标签](#如何正确使用语义化标签)
- [常见语义化场景](#常见语义化场景)
- [语义化最佳实践](#语义化最佳实践)
- [面试题](#面试题)

---

## 什么是语义化

HTML 语义化是指使用恰当的 HTML 标签来描述内容的**含义**和**结构**，而不仅仅是外观。

### 非语义化 vs 语义化

```html
<!-- ❌ 非语义化 - 只用 div 和 span -->
<div class="header">
    <div class="logo">网站 Logo</div>
    <div class="nav">
        <div class="nav-item">首页</div>
        <div class="nav-item">关于</div>
        <div class="nav-item">联系</div>
    </div>
</div>

<div class="main">
    <div class="article">
        <div class="title">文章标题</div>
        <div class="content">文章内容...</div>
    </div>

    <div class="sidebar">
        <div class="widget">侧边栏内容</div>
    </div>
</div>

<div class="footer">
    <div class="copyright">版权信息</div>
</div>


<!-- ✅ 语义化 - 使用恰当的标签 -->
<header>
    <div class="logo">网站 Logo</div>
    <nav>
        <a href="/">首页</a>
        <a href="/about">关于</a>
        <a href="/contact">联系</a>
    </nav>
</header>

<main>
    <article>
        <h1>文章标题</h1>
        <p>文章内容...</p>
    </article>

    <aside>
        <section class="widget">侧边栏内容</section>
    </aside>
</main>

<footer>
    <p>&copy; 2024 版权信息</p>
</footer>
```

**对比分析：**
- 非语义化：看不出结构，只能靠 class 名猜测
- 语义化：标签本身就说明了内容的性质和作用

---

## 语义化的好处

### 1. SEO 优化（搜索引擎优化）

搜索引擎爬虫能更好地理解页面结构和内容的重要性。

```html
<!-- ✅ 有利于 SEO -->
<article>
    <header>
        <h1>前端开发最佳实践</h1>
        <time datetime="2024-01-01">2024年1月1日</time>
        <address>
            作者: <a href="mailto:author@example.com">张三</a>
        </address>
    </header>

    <section>
        <h2>性能优化</h2>
        <p>性能优化是前端开发的重要环节...</p>
    </section>

    <section>
        <h2>代码规范</h2>
        <p>良好的代码规范能提高可维护性...</p>
    </section>

    <footer>
        <p>标签: <a href="/tag/frontend">前端</a>, <a href="/tag/performance">性能</a></p>
    </footer>
</article>
```

**SEO 优势：**
- `<h1>` 告诉搜索引擎这是页面的主标题
- `<article>` 表示独立的内容单元
- `<time>` 提供结构化的时间信息
- `<nav>` 帮助搜索引擎识别导航区域
- 语义化标签提高关键词权重

### 2. 可访问性（Accessibility）

屏幕阅读器和辅助技术能更准确地解读内容，帮助视障用户。

```html
<!-- ✅ 良好的可访问性 -->
<nav aria-label="主导航">
    <ul>
        <li><a href="/">首页</a></li>
        <li><a href="/products">产品</a></li>
        <li><a href="/about">关于我们</a></li>
    </ul>
</nav>

<main>
    <article>
        <header>
            <h1>产品介绍</h1>
        </header>

        <figure>
            <img src="product.jpg" alt="产品外观图，展示黑色外壳和触摸屏">
            <figcaption>产品外观</figcaption>
        </figure>

        <section>
            <h2>产品特点</h2>
            <ul>
                <li>轻便便携</li>
                <li>续航持久</li>
                <li>性能强劲</li>
            </ul>
        </section>
    </article>

    <aside aria-label="相关推荐">
        <h2>相关产品</h2>
        <ul>
            <li><a href="/product1">产品1</a></li>
            <li><a href="/product2">产品2</a></li>
        </ul>
    </aside>
</main>
```

**可访问性优势：**
- 屏幕阅读器可以识别 `<nav>` 为导航区域
- `<main>` 告诉用户这是主内容
- `<article>` 表示独立的内容块
- `alt` 属性为视障用户描述图片
- `<figcaption>` 提供图片说明
- ARIA 标签增强可访问性

**屏幕阅读器的表现：**
```
用户听到：
"导航区域，主导航"
"链接，首页"
"链接，产品"
"主要内容区域"
"文章，产品介绍"
"一级标题，产品介绍"
...
```

### 3. 可维护性

代码结构清晰，易于理解和修改。

```html
<!-- ✅ 易于维护 -->
<article class="blog-post">
    <header class="post-header">
        <h1 class="post-title">文章标题</h1>
        <div class="post-meta">
            <time datetime="2024-01-01">2024年1月1日</time>
            <address class="author">
                作者: <a rel="author" href="/author/zhangsan">张三</a>
            </address>
        </div>
    </header>

    <div class="post-content">
        <section class="introduction">
            <h2>引言</h2>
            <p>引言内容...</p>
        </section>

        <section class="main-body">
            <h2>正文</h2>
            <p>正文内容...</p>
        </section>

        <section class="conclusion">
            <h2>结论</h2>
            <p>结论内容...</p>
        </section>
    </div>

    <footer class="post-footer">
        <nav class="post-tags">
            <a href="/tag/html">HTML</a>
            <a href="/tag/css">CSS</a>
        </nav>
        <div class="post-share">
            <button aria-label="分享到微博">分享</button>
        </div>
    </footer>
</article>
```

**可维护性优势：**
- 新成员能快速理解代码结构
- 修改某个部分不影响其他部分
- 便于团队协作
- 减少注释需求（标签本身就是说明）

### 4. 代码可读性

开发者能快速理解页面结构，减少理解成本。

```html
<!-- ❌ 可读性差 -->
<div class="container">
    <div class="top">
        <div class="left">Logo</div>
        <div class="right">
            <div class="item">首页</div>
            <div class="item">产品</div>
        </div>
    </div>
    <div class="middle">
        <div class="content">内容</div>
        <div class="side">侧边栏</div>
    </div>
    <div class="bottom">页脚</div>
</div>


<!-- ✅ 可读性好 -->
<div class="container">
    <header class="site-header">
        <div class="logo">Logo</div>
        <nav class="main-nav">
            <a href="/">首页</a>
            <a href="/products">产品</a>
        </nav>
    </header>

    <main class="site-main">
        <article class="main-content">内容</article>
        <aside class="sidebar">侧边栏</aside>
    </main>

    <footer class="site-footer">页脚</footer>
</div>
```

### 5. 结构化数据

有利于机器理解和数据提取。

```html
<!-- ✅ 结构化的活动信息 -->
<article itemscope itemtype="http://schema.org/Event">
    <header>
        <h1 itemprop="name">前端技术分享会</h1>
        <time itemprop="startDate" datetime="2024-03-15T14:00">
            2024年3月15日 14:00
        </time>
    </header>

    <div itemprop="description">
        <p>本次分享会将介绍最新的前端技术趋势...</p>
    </div>

    <div itemprop="location" itemscope itemtype="http://schema.org/Place">
        <span itemprop="name">科技大厦</span>
        <address itemprop="address">北京市朝阳区科技路1号</address>
    </div>

    <div itemprop="offers" itemscope itemtype="http://schema.org/Offer">
        <span itemprop="price">免费</span>
    </div>
</article>
```

**好处：**
- 搜索引擎可以提取结构化数据
- 在搜索结果中显示丰富片段
- 第三方工具可以解析数据

---

## HTML5 语义化标签

### 文档结构标签

#### 1. `<header>` - 头部区域

表示页面或区块的头部，通常包含 logo、导航、搜索框等。

```html
<!-- 页面头部 -->
<header class="site-header">
    <div class="logo">
        <img src="logo.png" alt="网站 Logo">
    </div>
    <nav class="main-nav">
        <a href="/">首页</a>
        <a href="/about">关于</a>
        <a href="/contact">联系</a>
    </nav>
    <form class="search-form">
        <input type="search" placeholder="搜索...">
        <button type="submit">搜索</button>
    </form>
</header>

<!-- 文章头部 -->
<article>
    <header class="article-header">
        <h1>文章标题</h1>
        <div class="meta">
            <time datetime="2024-01-01">2024年1月1日</time>
            <address class="author">
                作者: <a rel="author" href="/author/zhangsan">张三</a>
            </address>
        </div>
    </header>
    <p>文章内容...</p>
</article>

<!-- Section 头部 -->
<section>
    <header>
        <h2>章节标题</h2>
        <p>章节简介</p>
    </header>
    <p>章节内容...</p>
</section>
```

**使用场景：**
- 页面顶部的全局头部
- 文章的标题和元信息
- 区块的介绍性内容

**注意事项：**
- 一个页面可以有多个 `<header>`
- 不能嵌套在 `<footer>`, `<address>` 或另一个 `<header>` 中

#### 2. `<nav>` - 导航链接

表示导航链接区域，用于主要的导航菜单。

```html
<!-- 主导航 -->
<nav class="main-nav" aria-label="主导航">
    <ul>
        <li><a href="/" aria-current="page">首页</a></li>
        <li><a href="/products">产品</a></li>
        <li><a href="/about">关于我们</a></li>
        <li><a href="/contact">联系我们</a></li>
    </ul>
</nav>

<!-- 面包屑导航 -->
<nav aria-label="面包屑">
    <ol>
        <li><a href="/">首页</a></li>
        <li><a href="/products">产品</a></li>
        <li aria-current="page">产品详情</li>
    </ol>
</nav>

<!-- 分页导航 -->
<nav aria-label="分页">
    <a href="?page=1" rel="prev">上一页</a>
    <a href="?page=1">1</a>
    <a href="?page=2" aria-current="page">2</a>
    <a href="?page=3">3</a>
    <a href="?page=3" rel="next">下一页</a>
</nav>

<!-- 文章内目录 -->
<nav aria-label="目录">
    <h2>目录</h2>
    <ul>
        <li><a href="#section1">第一部分</a></li>
        <li><a href="#section2">第二部分</a></li>
        <li><a href="#section3">第三部分</a></li>
    </ul>
</nav>

<!-- 侧边栏导航 -->
<aside>
    <nav aria-label="文章分类">
        <h3>分类</h3>
        <ul>
            <li><a href="/category/tech">技术</a></li>
            <li><a href="/category/life">生活</a></li>
            <li><a href="/category/travel">旅行</a></li>
        </ul>
    </nav>
</aside>
```

**使用场景：**
- 主导航菜单
- 面包屑导航
- 分页导航
- 目录
- 标签云

**注意事项：**
- 不是所有链接都要放在 `<nav>` 中
- 只用于主要的导航区域
- 页脚的链接列表可以不用 `<nav>`

#### 3. `<main>` - 主内容区域

表示文档的主要内容，每个页面只能有一个可见的 `<main>`。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>网站标题</title>
</head>
<body>
    <header>
        <!-- 页面头部 -->
    </header>

    <nav>
        <!-- 导航 -->
    </nav>

    <!-- 主内容区域 -->
    <main>
        <article>
            <h1>文章标题</h1>
            <p>这是页面的主要内容...</p>
        </article>

        <section>
            <h2>相关内容</h2>
            <p>更多内容...</p>
        </section>
    </main>

    <aside>
        <!-- 侧边栏 -->
    </aside>

    <footer>
        <!-- 页脚 -->
    </footer>
</body>
</html>
```

**使用场景：**
- 文档的主体内容
- 排除页眉、页脚、导航、侧边栏等

**注意事项：**
- 每个页面只能有一个 `<main>`
- 不能是 `<article>`, `<aside>`, `<footer>`, `<header>`, `<nav>` 的后代
- 有利于屏幕阅读器快速定位主内容

#### 4. `<article>` - 独立的文章内容

表示独立的、完整的内容单元，可以独立分发或重用。

```html
<!-- 博客文章 -->
<article class="blog-post">
    <header>
        <h1>深入理解 JavaScript 闭包</h1>
        <div class="meta">
            <time datetime="2024-01-01" pubdate>2024年1月1日</time>
            <address class="author">
                作者: <a rel="author" href="/author/zhangsan">张三</a>
            </address>
        </div>
    </header>

    <div class="post-content">
        <p>闭包是 JavaScript 的核心概念...</p>

        <section>
            <h2>什么是闭包</h2>
            <p>闭包是指...</p>
        </section>

        <section>
            <h2>闭包的应用</h2>
            <p>闭包常用于...</p>
        </section>
    </div>

    <footer>
        <nav class="tags">
            <a href="/tag/javascript">JavaScript</a>
            <a href="/tag/closure">闭包</a>
        </nav>
        <div class="social-share">
            <button>分享到微博</button>
            <button>分享到微信</button>
        </div>
    </footer>
</article>

<!-- 新闻文章 -->
<article class="news-item">
    <header>
        <h2>本地新闻标题</h2>
        <time datetime="2024-01-01">2024年1月1日</time>
    </header>
    <p>新闻摘要...</p>
    <a href="/news/123">阅读更多</a>
</article>

<!-- 评论 -->
<article class="comment">
    <header>
        <h3>用户评论</h3>
        <address class="author">评论者: 李四</address>
        <time datetime="2024-01-01T10:30">2024年1月1日 10:30</time>
    </header>
    <p>这篇文章写得很好...</p>
</article>

<!-- 产品卡片 -->
<article class="product-card">
    <header>
        <h3>产品名称</h3>
    </header>
    <img src="product.jpg" alt="产品图片">
    <p class="price">¥99</p>
    <button>加入购物车</button>
</article>
```

**使用场景：**
- 博客文章
- 新闻报道
- 论坛帖子
- 评论
- 产品卡片
- 独立的小部件

**判断标准：**
- 内容是否独立完整？
- 能否单独分发？（如 RSS）
- 能否在其他页面重用？

#### 5. `<section>` - 文档中的节

表示文档中的一个主题性分组，通常带有标题。

```html
<!-- 文章的章节 -->
<article>
    <h1>前端开发指南</h1>

    <section>
        <h2>HTML 基础</h2>
        <p>HTML 是网页的结构...</p>
    </section>

    <section>
        <h2>CSS 样式</h2>
        <p>CSS 用于控制样式...</p>
    </section>

    <section>
        <h2>JavaScript 交互</h2>
        <p>JavaScript 负责交互...</p>
    </section>
</article>

<!-- 页面的不同区块 -->
<main>
    <section class="hero">
        <h1>欢迎来到我们的网站</h1>
        <p>这是首屏内容...</p>
    </section>

    <section class="features">
        <h2>产品特点</h2>
        <ul>
            <li>特点1</li>
            <li>特点2</li>
        </ul>
    </section>

    <section class="testimonials">
        <h2>用户评价</h2>
        <blockquote>很好用的产品...</blockquote>
    </section>
</main>

<!-- 选项卡内容 -->
<div class="tabs">
    <nav>
        <button>简介</button>
        <button>规格</button>
        <button>评价</button>
    </nav>

    <section id="tab-intro">
        <h2>产品简介</h2>
        <p>产品介绍...</p>
    </section>

    <section id="tab-specs">
        <h2>产品规格</h2>
        <table>...</table>
    </section>

    <section id="tab-reviews">
        <h2>用户评价</h2>
        <article>评价1...</article>
        <article>评价2...</article>
    </section>
</div>
```

**使用场景：**
- 文档的章节
- 选项卡面板
- 页面的不同主题区块

**注意事项：**
- 通常包含一个标题（h1-h6）
- 不要仅为样式而使用 section（用 div）
- section 是内容的主题分组

#### 6. `<aside>` - 侧边栏内容

表示与主内容相关但可独立存在的内容。

```html
<!-- 页面级侧边栏 -->
<main>
    <article>
        <!-- 主文章内容 -->
    </article>

    <aside class="sidebar">
        <!-- 作者信息 -->
        <section class="author-info">
            <h3>关于作者</h3>
            <img src="avatar.jpg" alt="作者头像">
            <p>前端工程师，专注于...</p>
        </section>

        <!-- 相关文章 -->
        <section class="related-posts">
            <h3>相关文章</h3>
            <ul>
                <li><a href="#">文章1</a></li>
                <li><a href="#">文章2</a></li>
            </ul>
        </section>

        <!-- 标签云 -->
        <section class="tag-cloud">
            <h3>标签</h3>
            <a href="#">JavaScript</a>
            <a href="#">CSS</a>
            <a href="#">HTML</a>
        </section>

        <!-- 广告 -->
        <section class="ad">
            <h3>赞助商</h3>
            <img src="ad.jpg" alt="广告">
        </section>
    </aside>
</main>

<!-- 文章内的侧边注释 -->
<article>
    <h1>文章标题</h1>

    <p>主要内容...</p>

    <aside class="note">
        <h4>注意</h4>
        <p>这是一个重要的补充说明...</p>
    </aside>

    <p>更多内容...</p>
</article>

<!-- 引用相关内容 -->
<article>
    <p>正文内容...</p>

    <aside class="pullquote">
        <blockquote>
            "这是一句值得注意的引用"
        </blockquote>
    </aside>

    <p>继续正文...</p>
</article>
```

**使用场景：**
- 侧边栏
- 广告
- 相关链接
- 附注说明
- 引用
- 作者信息

**注意事项：**
- 不是页面的主要内容
- 与主内容相关但可独立
- 移除后不影响主内容理解

#### 7. `<footer>` - 页脚区域

表示页面或区块的页脚，通常包含版权、联系方式、相关链接等。

```html
<!-- 页面页脚 -->
<footer class="site-footer">
    <div class="footer-content">
        <!-- 关于我们 -->
        <section class="about">
            <h3>关于我们</h3>
            <p>公司简介...</p>
        </section>

        <!-- 链接列表 -->
        <section class="links">
            <h3>快速链接</h3>
            <ul>
                <li><a href="/about">关于</a></li>
                <li><a href="/contact">联系</a></li>
                <li><a href="/privacy">隐私政策</a></li>
                <li><a href="/terms">服务条款</a></li>
            </ul>
        </section>

        <!-- 联系方式 -->
        <section class="contact">
            <h3>联系我们</h3>
            <address>
                <p>邮箱: <a href="mailto:info@example.com">info@example.com</a></p>
                <p>电话: <a href="tel:+86-10-12345678">010-12345678</a></p>
                <p>地址: 北京市朝阳区xxx路xxx号</p>
            </address>
        </section>

        <!-- 社交媒体 -->
        <section class="social">
            <h3>关注我们</h3>
            <a href="#" aria-label="微博">微博</a>
            <a href="#" aria-label="微信">微信</a>
            <a href="#" aria-label="Twitter">Twitter</a>
        </section>
    </div>

    <!-- 版权信息 -->
    <div class="copyright">
        <p>&copy; 2024 公司名称. 保留所有权利.</p>
        <p>备案号: 京ICP备xxxxxxxx号</p>
    </div>
</footer>

<!-- 文章页脚 -->
<article>
    <header>
        <h1>文章标题</h1>
    </header>

    <p>文章内容...</p>

    <footer class="article-footer">
        <section class="author">
            <h3>关于作者</h3>
            <p>作者简介...</p>
        </section>

        <section class="meta">
            <p>发布时间: <time datetime="2024-01-01">2024年1月1日</time></p>
            <p>最后更新: <time datetime="2024-01-02">2024年1月2日</time></p>
        </section>

        <nav class="tags">
            <h3>标签</h3>
            <a href="#">JavaScript</a>
            <a href="#">前端</a>
        </nav>
    </footer>
</article>

<!-- Section 页脚 -->
<section>
    <h2>章节标题</h2>
    <p>章节内容...</p>

    <footer>
        <p>相关资源: <a href="#">链接</a></p>
    </footer>
</section>
```

**使用场景：**
- 页面底部的全局页脚
- 文章的作者信息和元数据
- 章节的附加信息

**注意事项：**
- 一个页面可以有多个 `<footer>`
- 不能嵌套 `<header>` 或另一个 `<footer>`

### 内容语义化标签

#### 8. `<figure>` 和 `<figcaption>` - 图片和说明

```html
<!-- 图片 + 说明 -->
<figure>
    <img src="chart.png" alt="销售数据图表">
    <figcaption>图1: 2024年第一季度销售数据</figcaption>
</figure>

<!-- 多张图片 -->
<figure>
    <img src="photo1.jpg" alt="照片1">
    <img src="photo2.jpg" alt="照片2">
    <img src="photo3.jpg" alt="照片3">
    <figcaption>旅行照片集锦</figcaption>
</figure>

<!-- 代码示例 -->
<figure>
    <pre><code>
function hello() {
    console.log('Hello World');
}
    </code></pre>
    <figcaption>示例1: 简单的函数定义</figcaption>
</figure>

<!-- 引用 -->
<figure>
    <blockquote>
        <p>这是一句名言...</p>
    </blockquote>
    <figcaption>—— 作者名</figcaption>
</figure>

<!-- 视频 -->
<figure>
    <video controls>
        <source src="video.mp4" type="video/mp4">
    </video>
    <figcaption>产品演示视频</figcaption>
</figure>
```

#### 9. `<time>` - 时间标记

```html
<!-- 日期 -->
<time datetime="2024-01-01">2024年1月1日</time>

<!-- 日期时间 -->
<time datetime="2024-01-01T14:30:00">2024年1月1日 14:30</time>

<!-- 带时区 -->
<time datetime="2024-01-01T14:30:00+08:00">北京时间 14:30</time>

<!-- 发布时间 -->
<article>
    <h1>文章标题</h1>
    <p>发布于 <time datetime="2024-01-01" pubdate>2024年1月1日</time></p>
</article>

<!-- 更新时间 -->
<p>最后更新: <time datetime="2024-01-02">2024年1月2日</time></p>

<!-- 相对时间 -->
<time datetime="2024-01-01T10:00:00">2小时前</time>

<!-- 时长 -->
<p>视频时长: <time datetime="PT1H30M">1小时30分钟</time></p>
```

#### 10. `<mark>` - 高亮文本

```html
<!-- 搜索结果高亮 -->
<p>搜索 "JavaScript" 的结果: 学习 <mark>JavaScript</mark> 是前端开发的基础。</p>

<!-- 引用中的重点 -->
<blockquote>
    这是一段引用，<mark>这部分很重要</mark>。
</blockquote>

<!-- 代码高亮 -->
<pre><code>
const name = '<mark>重要变量</mark>';
</code></pre>
```

#### 11. `<address>` - 联系信息

```html
<!-- 页脚联系方式 -->
<footer>
    <address>
        <p>联系我们:</p>
        <p>邮箱: <a href="mailto:info@example.com">info@example.com</a></p>
        <p>电话: <a href="tel:+86-10-12345678">010-12345678</a></p>
        <p>地址: 北京市朝阳区xxx路xxx号</p>
    </address>
</footer>

<!-- 文章作者 -->
<article>
    <header>
        <h1>文章标题</h1>
        <address class="author">
            作者: <a rel="author" href="/author/zhangsan">张三</a>
        </address>
    </header>
</article>

<!-- 公司信息 -->
<address>
    <strong>公司名称</strong><br>
    北京市朝阳区xxx路xxx号<br>
    邮编: 100000<br>
    电话: 010-12345678<br>
    邮箱: info@company.com
</address>
```

#### 12. 其他语义化标签

```html
<!-- 强调 -->
<p>这是 <strong>非常重要</strong> 的内容。</p>  <!-- 强烈强调 -->
<p>这是 <em>需要注意</em> 的内容。</p>  <!-- 一般强调 -->

<!-- 引用 -->
<blockquote cite="https://example.com">
    <p>这是一段长引用...</p>
</blockquote>

<p>他说 <q>这是一段短引用</q>。</p>

<p>《<cite>书名</cite>》是一本好书。</p>

<!-- 定义 -->
<p><dfn>HTML</dfn> 是超文本标记语言。</p>

<!-- 缩写 -->
<p><abbr title="HyperText Markup Language">HTML</abbr> 是网页的基础。</p>

<!-- 代码 -->
<p>使用 <code>console.log()</code> 输出信息。</p>

<pre><code>
function hello() {
    console.log('Hello');
}
</code></pre>

<p>按 <kbd>Ctrl</kbd> + <kbd>C</kbd> 复制。</p>

<p>程序输出: <samp>Hello World</samp></p>

<p>变量名: <var>x</var></p>

<!-- 删除和插入 -->
<p>价格: <del>¥100</del> <ins>¥80</ins></p>

<!-- 小字 -->
<p>Copyright <small>&copy; 2024</small></p>

<!-- 上下标 -->
<p>水的化学式是 H<sub>2</sub>O</p>
<p>x<sup>2</sup> + y<sup>2</sup> = z<sup>2</sup></p>

<!-- 进度和度量 -->
<label>下载进度:
    <progress value="70" max="100">70%</progress>
</label>

<label>磁盘使用:
    <meter value="0.6" min="0" max="1">60%</meter>
</label>

<!-- 详情/摘要 -->
<details>
    <summary>点击展开详情</summary>
    <p>这是隐藏的详细内容...</p>
</details>

<!-- 对话框 -->
<dialog open>
    <p>这是一个对话框</p>
    <button>关闭</button>
</dialog>
```

---

## 如何正确使用语义化标签

### 决策流程

```
是否是导航链接？
  ├─ 是 → <nav>
  └─ 否 ↓

是否是页面/区块的头部？
  ├─ 是 → <header>
  └─ 否 ↓

是否是主要内容？
  ├─ 是 → <main>
  └─ 否 ↓

是否是独立的完整内容？
  ├─ 是 → <article>
  └─ 否 ↓

是否是主题性分组？
  ├─ 是 → <section>
  └─ 否 ↓

是否是侧边内容？
  ├─ 是 → <aside>
  └─ 否 ↓

是否是页脚？
  ├─ 是 → <footer>
  └─ 否 → <div>
```

### 常见错误

```html
<!-- ❌ 错误：滥用 section -->
<section class="button-group">
    <button>按钮1</button>
    <button>按钮2</button>
</section>
<!-- ✅ 正确：按钮组不是主题分组 -->
<div class="button-group">
    <button>按钮1</button>
    <button>按钮2</button>
</div>


<!-- ❌ 错误：article 和 section 混淆 -->
<section class="blog-post">
    <h1>文章标题</h1>
    <p>文章内容...</p>
</section>
<!-- ✅ 正确：独立的文章用 article -->
<article class="blog-post">
    <h1>文章标题</h1>
    <p>文章内容...</p>
</article>


<!-- ❌ 错误：多个 main -->
<main>内容1</main>
<main>内容2</main>
<!-- ✅ 正确：只能有一个 main -->
<main>
    <section>内容1</section>
    <section>内容2</section>
</main>


<!-- ❌ 错误：nav 包含所有链接 -->
<nav>
    <a href="/terms">服务条款</a>
    <a href="/privacy">隐私政策</a>
</nav>
<!-- ✅ 正确：页脚链接不一定用 nav -->
<footer>
    <a href="/terms">服务条款</a>
    <a href="/privacy">隐私政策</a>
</footer>


<!-- ❌ 错误：header 嵌套 -->
<header>
    <header>嵌套的 header</header>
</header>
<!-- ✅ 正确：不能嵌套 -->
<header>
    <div class="inner-header">内容</div>
</header>
```

---

## 常见语义化场景

### 1. 博客文章页

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>文章标题 - 博客名称</title>
</head>
<body>
    <!-- 全局头部 -->
    <header class="site-header">
        <div class="logo">博客 Logo</div>
        <nav class="main-nav" aria-label="主导航">
            <a href="/">首页</a>
            <a href="/archive">归档</a>
            <a href="/about">关于</a>
        </nav>
    </header>

    <!-- 面包屑 -->
    <nav aria-label="面包屑">
        <a href="/">首页</a> /
        <a href="/category/tech">技术</a> /
        <span aria-current="page">文章标题</span>
    </nav>

    <!-- 主内容 -->
    <main>
        <!-- 文章 -->
        <article class="blog-post">
            <!-- 文章头部 -->
            <header>
                <h1>深入理解 JavaScript 闭包</h1>
                <div class="meta">
                    <time datetime="2024-01-01" pubdate>2024年1月1日</time>
                    <address class="author">
                        作者: <a rel="author" href="/author/zhangsan">张三</a>
                    </address>
                </div>
            </header>

            <!-- 文章内容 -->
            <div class="post-content">
                <section>
                    <h2>什么是闭包</h2>
                    <p>闭包是...</p>

                    <figure>
                        <img src="closure.png" alt="闭包示意图">
                        <figcaption>图1: 闭包的作用域链</figcaption>
                    </figure>
                </section>

                <section>
                    <h2>闭包的应用</h2>
                    <p>闭包常用于...</p>

                    <aside class="note">
                        <h3>注意</h3>
                        <p>使用闭包时要注意内存泄漏...</p>
                    </aside>
                </section>
            </div>

            <!-- 文章页脚 -->
            <footer>
                <nav class="tags" aria-label="标签">
                    <a href="/tag/javascript">JavaScript</a>
                    <a href="/tag/closure">闭包</a>
                </nav>
            </footer>
        </article>

        <!-- 评论区 -->
        <section class="comments">
            <h2>评论</h2>

            <article class="comment">
                <header>
                    <address class="author">李四</address>
                    <time datetime="2024-01-02T10:30">2024年1月2日 10:30</time>
                </header>
                <p>很好的文章！</p>
            </article>
        </section>

        <!-- 侧边栏 -->
        <aside class="sidebar">
            <section class="author-info">
                <h2>关于作者</h2>
                <p>前端工程师...</p>
            </section>

            <section class="related-posts">
                <h2>相关文章</h2>
                <ul>
                    <li><a href="#">相关文章1</a></li>
                    <li><a href="#">相关文章2</a></li>
                </ul>
            </section>
        </aside>
    </main>

    <!-- 全局页脚 -->
    <footer class="site-footer">
        <p>&copy; 2024 博客名称</p>
        <nav aria-label="页脚链接">
            <a href="/privacy">隐私政策</a>
            <a href="/terms">服务条款</a>
        </nav>
    </footer>
</body>
</html>
```

### 2. 电商产品页

```html
<main>
    <!-- 产品详情 -->
    <article class="product" itemscope itemtype="http://schema.org/Product">
        <header>
            <h1 itemprop="name">产品名称</h1>
        </header>

        <!-- 产品图片 -->
        <figure class="product-gallery">
            <img itemprop="image" src="product1.jpg" alt="产品主图">
            <img src="product2.jpg" alt="产品细节图1">
            <img src="product3.jpg" alt="产品细节图2">
            <figcaption>产品图片</figcaption>
        </figure>

        <!-- 产品信息 -->
        <section class="product-info">
            <h2>产品信息</h2>

            <div itemprop="offers" itemscope itemtype="http://schema.org/Offer">
                <data itemprop="price" value="99">¥99</data>
                <meta itemprop="priceCurrency" content="CNY">
                <link itemprop="availability" href="http://schema.org/InStock">
                <span>有货</span>
            </div>

            <p itemprop="description">产品描述...</p>

            <button>加入购物车</button>
        </section>

        <!-- 产品详情 -->
        <section class="product-details">
            <h2>产品详情</h2>
            <p>详细介绍...</p>
        </section>

        <!-- 规格参数 -->
        <section class="specifications">
            <h2>规格参数</h2>
            <table>
                <tr>
                    <th>尺寸</th>
                    <td>10 x 10 x 10 cm</td>
                </tr>
                <tr>
                    <th>重量</th>
                    <td>500g</td>
                </tr>
            </table>
        </section>

        <!-- 用户评价 -->
        <section class="reviews">
            <h2>用户评价</h2>

            <article class="review">
                <header>
                    <address class="reviewer">用户A</address>
                    <time datetime="2024-01-01">2024年1月1日</time>
                    <data value="5">★★★★★</data>
                </header>
                <p>很好的产品！</p>
            </article>
        </section>
    </article>

    <!-- 相关推荐 -->
    <aside class="related-products">
        <h2>相关推荐</h2>
        <article class="product-card">
            <h3>推荐产品1</h3>
            <img src="related1.jpg" alt="推荐产品1">
            <p>¥79</p>
        </article>
    </aside>
</main>
```

### 3. 新闻网站首页

```html
<main>
    <!-- 头条新闻 -->
    <section class="top-news">
        <h2>头条</h2>

        <article class="news-item featured">
            <header>
                <h3><a href="/news/123">重大新闻标题</a></h3>
                <time datetime="2024-01-01">2024年1月1日</time>
            </header>
            <figure>
                <img src="news.jpg" alt="新闻图片">
            </figure>
            <p>新闻摘要...</p>
            <a href="/news/123">阅读更多</a>
        </article>
    </section>

    <!-- 分类新闻 -->
    <section class="category-news">
        <h2>科技</h2>

        <article class="news-item">
            <header>
                <h3><a href="/news/124">科技新闻标题</a></h3>
                <time datetime="2024-01-01">2024年1月1日</time>
            </header>
            <p>新闻摘要...</p>
        </article>

        <article class="news-item">
            <header>
                <h3><a href="/news/125">科技新闻标题</a></h3>
                <time datetime="2024-01-01">2024年1月1日</time>
            </header>
            <p>新闻摘要...</p>
        </article>
    </section>

    <!-- 侧边栏 -->
    <aside class="sidebar">
        <section class="hot-topics">
            <h2>热门话题</h2>
            <ul>
                <li><a href="#">话题1</a></li>
                <li><a href="#">话题2</a></li>
            </ul>
        </section>
    </aside>
</main>
```

---

## 语义化最佳实践

### 1. 选择合适的标签

```html
<!-- ✅ 使用语义化标签 -->
<nav>导航</nav>
<article>文章</article>
<aside>侧边栏</aside>

<!-- ❌ 滥用 div -->
<div class="nav">导航</div>
<div class="article">文章</div>
<div class="sidebar">侧边栏</div>
```

### 2. 合理的层级结构

```html
<!-- ✅ 正确的层级 -->
<article>
    <h1>文章标题</h1>
    <section>
        <h2>第一部分</h2>
        <section>
            <h3>小节1</h3>
        </section>
    </section>
</article>

<!-- ❌ 跳级 -->
<article>
    <h1>文章标题</h1>
    <h3>直接跳到 h3</h3>
</article>
```

### 3. 使用 ARIA 增强可访问性

```html
<!-- ✅ 添加 ARIA 标签 -->
<nav aria-label="主导航">
    <ul>
        <li><a href="/" aria-current="page">首页</a></li>
        <li><a href="/about">关于</a></li>
    </ul>
</nav>

<button aria-label="关闭对话框" aria-pressed="false">
    <span aria-hidden="true">&times;</span>
</button>

<img src="photo.jpg" alt="产品外观图" aria-describedby="img-desc">
<p id="img-desc">这是产品的详细描述...</p>
```

### 4. 提供 alt 文本

```html
<!-- ✅ 有意义的 alt -->
<img src="chart.png" alt="2024年第一季度销售数据柱状图，显示销售额增长30%">

<!-- ❌ 无意义的 alt -->
<img src="chart.png" alt="图片">

<!-- ✅ 装饰性图片 -->
<img src="decoration.png" alt="" role="presentation">
```

### 5. 语义化表单

```html
<!-- ✅ 语义化表单 -->
<form>
    <fieldset>
        <legend>个人信息</legend>

        <label for="name">姓名</label>
        <input type="text" id="name" name="name" required>

        <label for="email">邮箱</label>
        <input type="email" id="email" name="email" required>
    </fieldset>

    <fieldset>
        <legend>收货地址</legend>

        <label for="address">地址</label>
        <textarea id="address" name="address"></textarea>
    </fieldset>

    <button type="submit">提交</button>
</form>
```

### 6. 使用微数据

```html
<!-- ✅ Schema.org 微数据 -->
<article itemscope itemtype="http://schema.org/Article">
    <header>
        <h1 itemprop="headline">文章标题</h1>
        <time itemprop="datePublished" datetime="2024-01-01">2024年1月1日</time>
        <address itemprop="author" itemscope itemtype="http://schema.org/Person">
            <span itemprop="name">张三</span>
        </address>
    </header>
    <div itemprop="articleBody">
        <p>文章内容...</p>
    </div>
</article>
```

---
