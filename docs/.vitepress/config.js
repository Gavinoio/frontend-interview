import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '前端知识库',
  description: '系统化的前端开发知识整理',
  lang: 'zh-CN',
  base: process.env.VITE_BASE_PATH || '/',  // Vercel 使用根路径，GitHub Pages 使用子路径
  head: [
    ['link', { rel: 'icon', href: `${process.env.VITE_BASE_PATH || '/'}/favicon.png`.replace(/\/+/g, '/') }]
  ],

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '基础', items: [{ text: 'HTML', link: '/html/' }, { text: 'CSS', link: '/css/' }, { text: 'JavaScript', link: '/javascript/' }, { text: 'TypeScript', link: '/typescript/' }] },
      { text: '框架', items: [{ text: 'Vue', link: '/vue/' }, { text: 'React', link: '/react/' }] },
      { text: '网络与浏览器', items: [{ text: '网络协议', link: '/network/' }, { text: '浏览器原理', link: '/browser/' }] },
      { text: '工程化', items: [{ text: '构建工具', link: '/engineering/' }, { text: '性能优化', link: '/performance/' }, { text: '微前端', link: '/micro-frontend/' }, { text: 'Node.js', link: '/nodejs/' }] },
      { text: '进阶', items: [{ text: '设计模式', link: '/design-patterns/' }, { text: '场景题', link: '/scenarios/' }, { text: '算法', link: '/algorithm/' }, { text: '跨端开发', link: '/cross-platform/' }] },
      { text: 'AI', link: '/ai/' }
    ],

    sidebar: {
      '/javascript/': [
        {
          text: 'JavaScript 核心',
          items: [
            { text: '基础概念', link: '/javascript/' },
            { text: '数据类型与类型转换', link: '/javascript/data-types' },
            { text: '作用域与闭包', link: '/javascript/scope-closure' },
            { text: '原型与继承', link: '/javascript/prototype' },
            { text: 'this 指向', link: '/javascript/this' },
            { text: '异步编程', link: '/javascript/async' },
            { text: 'ES6+ 新特性', link: '/javascript/es6' },
            { text: '模块化', link: '/javascript/modules' },
            { text: '手写代码实现', link: '/javascript/handwriting' },
            { text: '正则表达式', link: '/javascript/regex' },
            { text: 'Proxy 与 Reflect', link: '/javascript/proxy-reflect' }
          ]
        },
        {
          text: '面试题精选',
          items: [
            { text: 'JavaScript 面试题精选', link: '/javascript/interview' }
          ]
        }
      ],

      '/typescript/': [
        {
          text: 'TypeScript',
          items: [
            { text: 'TypeScript 基础', link: '/typescript/' },
            { text: '类型系统', link: '/typescript/type-system' },
            { text: '高级类型', link: '/typescript/advanced-types' },
            { text: '泛型', link: '/typescript/generics' },
            { text: '工程实践', link: '/typescript/practice' },
            { text: 'TypeScript + React', link: '/typescript/react' }
          ]
        },
        {
          text: '面试题精选',
          items: [
            { text: 'TypeScript 面试题精选', link: '/typescript/interview' }
          ]
        }
      ],

      '/vue/': [
        {
          text: 'Vue 框架',
          items: [
            { text: 'Vue 核心原理', link: '/vue/' },
            { text: '响应式原理', link: '/vue/reactivity' },
            { text: '双向数据绑定', link: '/vue/v-model' },
            { text: '虚拟 DOM 与 Diff', link: '/vue/virtual-dom' },
            { text: '组件通信', link: '/vue/communication' },
            { text: '生命周期', link: '/vue/lifecycle' },
            { text: 'Composition API', link: '/vue/composition-api' },
            { text: 'Vue Router', link: '/vue/router' },
            { text: 'Pinia/Vuex', link: '/vue/state-management' },
            { text: 'Vue 3 vs Vue 2', link: '/vue/vue3-vs-vue2' },
            { text: 'Nuxt.js', link: '/vue/nuxt' },
            { text: '自定义指令', link: '/vue/directives' },
            { text: '性能优化', link: '/vue/optimization' }
          ]
        },
        {
          text: '面试题精选',
          items: [
            { text: 'Vue 面试题精选', link: '/vue/interview' }
          ]
        }
      ],

      '/react/': [
        {
          text: 'React 框架',
          items: [
            { text: 'React 核心原理', link: '/react/' },
            { text: 'Fiber 架构', link: '/react/fiber' },
            { text: 'Hooks 原理', link: '/react/hooks' },
            { text: '状态管理', link: '/react/state-management' },
            { text: '状态管理方案对比', link: '/react/state-comparison' },
            { text: '性能优化', link: '/react/optimization' },
            { text: 'React Router', link: '/react/router' },
            { text: 'Next.js', link: '/react/nextjs' },
            { text: 'React 18 并发特性', link: '/react/concurrent' }
          ]
        },
        {
          text: '面试题精选',
          items: [
            { text: 'React 面试题精选', link: '/react/interview' }
          ]
        }
      ],

      '/network/': [
        {
          text: '网络与HTTP',
          items: [
            { text: '网络协议', link: '/network/' },
            { text: 'HTTP/HTTPS', link: '/network/http' },
            { text: 'TCP/UDP', link: '/network/tcp-udp' },
            { text: 'WebSocket', link: '/network/websocket' },
            { text: 'SSE', link: '/network/sse' },
            { text: '跨域解决方案', link: '/network/cors' },
            { text: '网络安全', link: '/network/security' },
            { text: 'DNS 解析', link: '/network/dns' }
          ]
        }
      ],

      '/browser/': [
        {
          text: '浏览器原理',
          items: [
            { text: '浏览器架构', link: '/browser/' },
            { text: '渲染原理', link: '/browser/rendering' },
            { text: '事件循环', link: '/browser/event-loop' },
            { text: '浏览器缓存', link: '/browser/cache' },
            { text: '浏览器存储', link: '/browser/storage' },
            { text: 'Observer API', link: '/browser/observer-api' },
            { text: 'WebAssembly', link: '/browser/webassembly' },
            { text: 'PWA 渐进式应用', link: '/browser/pwa' },
            { text: 'URL 到页面渲染', link: '/browser/url-to-render' },
            { text: 'Web Workers', link: '/browser/web-workers' }
          ]
        }
      ],

      '/performance/': [
        {
          text: '性能优化',
          items: [
            { text: '性能优化概述', link: '/performance/' },
            { text: '加载性能优化', link: '/performance/loading' },
            { text: '运行时性能优化', link: '/performance/runtime' },
            { text: '构建优化', link: '/performance/build' },
            { text: '性能监控', link: '/performance/monitoring' },
            { text: 'CDN 原理与优化', link: '/performance/cdn' }
          ]
        }
      ],

      '/engineering/': [
        {
          text: '工程化',
          items: [
            { text: '工程化概述', link: '/engineering/' },
            { text: 'Webpack', link: '/engineering/webpack' },
            { text: 'Vite', link: '/engineering/vite' },
            { text: 'Babel', link: '/engineering/babel' },
            { text: 'CI/CD', link: '/engineering/cicd' },
            { text: 'Monorepo', link: '/engineering/monorepo' },
            { text: '代码规范', link: '/engineering/code-style' },
            { text: '前端测试', link: '/engineering/testing' },
            { text: '浏览器兼容性', link: '/engineering/compatibility' },
            { text: 'Git Hooks', link: '/engineering/git-hooks' },
            { text: '单元测试', link: '/engineering/unit-testing' }
          ]
        }
      ],

      '/nodejs/': [
        {
          text: 'Node.js',
          items: [
            { text: 'Node.js 基础', link: '/nodejs/' },
            { text: 'Web 框架对比', link: '/nodejs/frameworks' }
          ]
        }
      ],

      '/micro-frontend/': [
        {
          text: '微前端',
          items: [
            { text: '微前端架构', link: '/micro-frontend/' },
            { text: 'qiankun', link: '/micro-frontend/qiankun' },
            { text: 'wujie 无界', link: '/micro-frontend/wujie' },
            { text: 'Micro App', link: '/micro-frontend/micro-app' },
            { text: 'Module Federation', link: '/micro-frontend/module-federation' }
          ]
        }
      ],

      '/cross-platform/': [
        {
          text: '跨端开发',
          items: [
            { text: '跨端方案对比', link: '/cross-platform/' },
            { text: 'uni-app', link: '/cross-platform/uniapp' },
            { text: 'Taro', link: '/cross-platform/taro' },
            { text: '小程序原理', link: '/cross-platform/miniprogram' }
          ]
        }
      ],

      '/ai/': [
        {
          text: 'AI 基础',
          items: [
            { text: 'AI 前端应用', link: '/ai/' },
            { text: 'ChatGPT 集成', link: '/ai/chatgpt' },
            { text: 'AI 辅助开发', link: '/ai/ai-coding' },
            { text: '大模型应用', link: '/ai/llm' }
          ]
        },
        {
          text: 'AI Agent',
          items: [
            { text: 'AI Agent 概述', link: '/ai/agent/' },
            { text: '入门与学习路径', link: '/ai/agent/learning-path' },
            { text: '技术栈与框架', link: '/ai/agent/tech-stack' },
            { text: '实战案例', link: '/ai/agent/practice' }
          ]
        },
        {
          text: 'AI 实战项目',
          items: [
            { text: 'AI 音乐生成项目', link: '/ai/ai-music-project-plan' }
          ]
        }
      ],

      '/scenarios/': [
        {
          text: '场景题',
          items: [
            { text: '场景题概述', link: '/scenarios/' },
            { text: '系统设计', link: '/scenarios/system-design' },
            { text: '问题排查', link: '/scenarios/debugging' },
            { text: '架构设计', link: '/scenarios/architecture' },
            { text: '大文件上传', link: '/scenarios/file-upload' },
            { text: '虚拟列表与无限滚动', link: '/scenarios/virtual-list' },
            { text: '搜索建议', link: '/scenarios/search-autocomplete' },
            { text: '拖拽排序', link: '/scenarios/drag-sort' },
            { text: '请求重试机制', link: '/scenarios/request-retry' },
            { text: 'HTTP 请求封装', link: '/scenarios/http-client' },
            { text: '前端监控体系', link: '/scenarios/monitoring' },
            { text: '前端国际化', link: '/scenarios/i18n' },
            { text: '数据可视化', link: '/scenarios/visualization' },
            { text: '高频场景题', link: '/scenarios/common-questions' },
            { text: '错误边界处理', link: '/scenarios/error-handling' }
          ]
        }
      ],


      '/design-patterns/': [
        {
          text: '设计模式',
          items: [
            { text: '设计模式概述', link: '/design-patterns/' },
            { text: '单例模式', link: '/design-patterns/singleton' },
            { text: '观察者模式', link: '/design-patterns/observer' },
            { text: '工厂模式', link: '/design-patterns/factory' },
            { text: '策略模式', link: '/design-patterns/strategy' },
            { text: '代理模式', link: '/design-patterns/proxy' },
            { text: '装饰器模式', link: '/design-patterns/decorator' }
          ]
        }
      ],

'/algorithm/': [
        {
          text: '算法与数据结构',
          items: [
            { text: '算法基础', link: '/algorithm/' },
            { text: '数据结构', link: '/algorithm/data-structure' },
            { text: '常见算法', link: '/algorithm/common' },
            { text: '高频算法详解', link: '/algorithm/advanced' },
            { text: '前端算法题', link: '/algorithm/frontend' },
            { text: '面试高频题精选', link: '/algorithm/interview-hot' }
          ]
        }
      ],

      '/html/': [
        {
          text: 'HTML 核心',
          items: [
            { text: 'HTML 基础', link: '/html/' },
            { text: '语义化标签', link: '/html/semantic' },
            { text: '无障碍访问', link: '/html/a11y' },
            { text: 'Web Components', link: '/html/web-components' }
          ]
        },
        {
          text: '面试题精选',
          items: [
            { text: 'HTML 面试题精选', link: '/html/interview' }
          ]
        }
      ],

      '/css/': [
        {
          text: 'CSS 核心',
          items: [
            { text: 'CSS 基础', link: '/css/' },
            { text: 'BFC', link: '/css/bfc' },
            { text: 'Flex 布局', link: '/css/flex' },
            { text: 'Grid 布局', link: '/css/grid' },
            { text: '居中方案', link: '/css/center' },
            { text: '响应式设计', link: '/css/responsive' },
            { text: '主题切换', link: '/css/theme' },
            { text: 'CSS 变量', link: '/css/variables' },
            { text: '原子化 CSS', link: '/css/atomic-css' },
            { text: 'CSS-in-JS', link: '/css/css-in-js' }
          ]
        },
        {
          text: '面试题精选',
          items: [
            { text: 'CSS 面试题精选', link: '/css/interview' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Gavenr/frontend-interview' }
    ],

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3],
      label: '目录'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    lastUpdated: {
      text: '最后更新于'
    }
  }
})
