# AI 与前端开发

## 概述

AI 技术正在深刻改变前端开发的方方面面，从 AI 辅助编码到智能交互应用，从大语言模型集成到智能推荐系统。作为前端开发者，掌握 AI 相关技术已经成为提升竞争力的关键。

本章节将系统介绍 AI 在前端领域的应用，包括基础概念、实践技巧和面试考点。

---

## AI 技术对前端的影响和变革

### 1. 开发方式的变革

**传统开发模式**
```javascript
// 开发者手写所有代码
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
```

**AI 辅助开发模式**
```javascript
// 1. 开发者写注释或函数名
// 创建一个支持立即执行选项的防抖函数

// 2. AI 自动生成完整实现
function debounce(fn, delay, immediate = false) {
  let timer = null;
  return function(...args) {
    const callNow = immediate && !timer;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) {
        fn.apply(this, args);
      }
    }, delay);
    if (callNow) {
      fn.apply(this, args);
    }
  };
}
```

### 2. 用户交互的升级

**传统交互**
- 表单输入
- 按钮点击
- 固定的导航流程

**AI 驱动的智能交互**
```vue
<template>
  <div class="smart-search">
    <!-- 自然语言搜索 -->
    <input
      v-model="query"
      placeholder="用自然语言描述你要找的内容..."
    />

    <!-- AI 理解用户意图并返回结果 -->
    <div v-for="item in intelligentResults" :key="item.id">
      {{ item.title }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      query: '', // "性价比高的蓝色连衣裙"
      intelligentResults: [] // AI 理解意图后返回精准结果
    };
  },

  methods: {
    async search() {
      // AI 理解自然语言，提取关键信息
      // 价格范围：低 | 颜色：蓝色 | 类型：连衣裙
      const response = await this.semanticSearch(this.query);
      this.intelligentResults = response.data;
    }
  }
};
</script>
```

### 3. 应用场景的扩展

**新兴的 AI 驱动应用**
- 智能客服机器人
- AI 代码助手
- 智能内容生成
- 图像识别和生成
- 语音交互
- 智能推荐
- 文档问答系统
- AI 数据分析

---

## 前端开发者需要了解的 AI 基础概念

### 1. 大语言模型（LLM）

#### 什么是 LLM

大语言模型（Large Language Model）是基于深度学习的自然语言处理模型，通过训练海量文本数据，能够理解和生成人类语言。

**主流 LLM 对比**

| 模型 | 开发商 | 特点 | 前端应用场景 |
|------|--------|------|-------------|
| GPT-4 | OpenAI | 综合能力强，理解准确 | 智能客服、内容生成 |
| Claude | Anthropic | 安全性好，上下文长 | 文档分析、代码审查 |
| 文心一言 | 百度 | 中文理解好 | 中文内容生成 |
| 通义千问 | 阿里 | 多模态能力强 | 图文处理 |
| Gemini | Google | 集成 Google 生态 | 搜索、数据分析 |

#### LLM 的基本原理

```javascript
// LLM 工作流程示意
class SimplifiedLLM {
  constructor() {
    this.model = 'gpt-4';
  }

  /**
   * 文本生成过程
   * 1. 输入文本 → 2. Token化 → 3. 向量编码 → 4. 模型推理 → 5. 输出文本
   */
  async generate(prompt) {
    // 1. 将输入文本转换为 tokens
    const tokens = this.tokenize(prompt);
    // [ "前端", "开发", "的", "未来" ]

    // 2. 转换为向量（数字表示）
    const embeddings = this.toEmbeddings(tokens);
    // [ [0.1, 0.2, ...], [0.3, 0.4, ...], ... ]

    // 3. 模型预测下一个 token
    const nextToken = await this.predict(embeddings);

    // 4. 重复直到生成完整响应
    return this.decode(nextToken);
  }

  tokenize(text) {
    // 实际使用 tiktoken 等库
    return text.split('');
  }
}
```

#### Token 和计费

```javascript
/**
 * Token 计算示例
 */
const text = "Hello, how are you?";

// 英文: 约 1 token = 0.75 单词
// 中文: 约 1 token = 0.5 汉字

// OpenAI 计费（GPT-4）
const pricing = {
  input: 0.03,  // 每 1K tokens
  output: 0.06  // 每 1K tokens
};

// 估算成本
function estimateCost(inputTokens, outputTokens) {
  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;
  return inputCost + outputCost;
}

// 示例：1000 输入 tokens + 500 输出 tokens
const cost = estimateCost(1000, 500);
console.log(`成本: $${cost}`); // $0.06
```

### 2. Prompt Engineering

Prompt Engineering 是设计和优化输入提示词的技术，以获得更好的 AI 输出结果。

#### 基础技巧

**1. 明确角色（Role）**
```javascript
const messages = [
  {
    role: 'system',
    content: '你是一个资深的前端架构师，精通 React、Vue、性能优化和工程化。'
  },
  {
    role: 'user',
    content: '如何优化 React 应用的首屏加载速度？'
  }
];
```

**2. 提供上下文（Context）**
```javascript
const prompt = `
【背景】
我正在开发一个电商网站，使用 React 18 + Vite

【现状】
- 首页加载时间 5.2s
- LCP (Largest Contentful Paint): 4.8s
- FCP (First Contentful Paint): 2.1s
- Bundle 大小: 2.3MB

【问题】
用户反馈首页加载太慢

【需求】
请给出具体的优化方案和代码示例
`;
```

**3. 结构化输出（Format）**
```javascript
const prompt = `
分析以下代码的问题，按 JSON 格式输出：

{
  "issues": [
    {
      "type": "performance|bug|security|style",
      "severity": "high|medium|low",
      "line": 行号,
      "description": "问题描述",
      "suggestion": "修复建议",
      "code": "修复后的代码"
    }
  ],
  "summary": "总体评价",
  "score": 评分(0-100)
}

代码：
\`\`\`javascript
${code}
\`\`\`
`;
```

**4. Few-Shot Learning（提供示例）**
```javascript
const prompt = `
将用户输入转换为数据库查询条件：

示例1:
输入: "价格在100到500之间的红色连衣裙"
输出: { "price": { "min": 100, "max": 500 }, "color": "红色", "category": "连衣裙" }

示例2:
输入: "最近一周的订单"
输出: { "dateRange": { "start": "7 days ago", "end": "now" }, "type": "order" }

现在转换:
输入: "评分4星以上的蓝色手机"
输出:
`;
```

**5. Chain of Thought（思维链）**
```javascript
const prompt = `
问题：如何实现一个高性能的虚拟滚动列表？

请按以下步骤思考：
1. 分析问题：为什么需要虚拟滚动？
2. 核心原理：虚拟滚动的实现思路
3. 技术方案：需要处理哪些技术点？
4. 代码实现：给出完整代码
5. 优化建议：还有哪些优化空间？

一步步思考并给出详细答案。
`;
```

#### 高级技巧

```javascript
// 1. Temperature 控制
// 取值 0-2，越低越确定，越高越随机
const settings = {
  temperature: 0.1,  // 代码生成、事实回答
  // temperature: 0.7,  // 创意写作、头脑风暴
  // temperature: 1.5,  // 极富创意但可能不准确
};

// 2. System Prompt 优化
const systemPrompt = `
你是一个前端代码生成助手。

规则：
1. 只生成可运行的代码，不要有伪代码
2. 代码要有详细注释
3. 要考虑边界情况和错误处理
4. 使用 ES6+ 语法
5. 遵循最佳实践

输出格式：
- 先简要说明思路
- 然后给出完整代码
- 最后说明使用方法
`;

// 3. 迭代优化
async function improvePrompt(initialPrompt) {
  let prompt = initialPrompt;
  let iteration = 0;

  while (iteration < 3) {
    const response = await callLLM(prompt);

    // 检查响应质量
    if (isGoodResponse(response)) {
      return response;
    }

    // 优化 prompt
    prompt = `
${prompt}

上次的回答不够好，请改进：
1. 提供更具体的代码示例
2. 解释得更清楚
3. 考虑更多边界情况
    `;

    iteration++;
  }
}
```

### 3. Embedding 和向量数据库

#### 什么是 Embedding

Embedding 是将文本转换为向量（数字数组）的过程，相似的文本会有相似的向量表示。

```javascript
/**
 * Embedding 示例
 */
class TextEmbedding {
  async getEmbedding(text) {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text
      })
    });

    const data = await response.json();
    return data.data[0].embedding;
    // 返回 1536 维向量: [0.002, -0.015, 0.023, ...]
  }
}

// 使用示例
const embedding = new TextEmbedding();

const vec1 = await embedding.getEmbedding('Vue 3 的新特性');
const vec2 = await embedding.getEmbedding('Vue 3 有哪些改进');
const vec3 = await embedding.getEmbedding('如何做红烧肉');

// vec1 和 vec2 的向量会很接近（余弦相似度高）
// vec1 和 vec3 的向量会相距较远
```

#### 向量相似度计算

```javascript
/**
 * 计算余弦相似度
 */
function cosineSimilarity(vecA, vecB) {
  // 点积
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);

  // 模长
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  // 余弦相似度：范围 [-1, 1]，1 表示完全相同
  return dotProduct / (magnitudeA * magnitudeB);
}

// 使用
const similarity = cosineSimilarity(vec1, vec2);
console.log(similarity); // 0.95（非常相似）
```

#### 向量数据库应用

```javascript
/**
 * 简单的向量数据库实现
 */
class VectorDB {
  constructor() {
    this.documents = [];
  }

  // 添加文档
  async addDocument(text, metadata = {}) {
    const embedding = await this.getEmbedding(text);

    this.documents.push({
      id: Date.now(),
      text,
      embedding,
      metadata
    });
  }

  // 语义搜索
  async search(query, topK = 5) {
    const queryEmbedding = await this.getEmbedding(query);

    // 计算所有文档的相似度
    const results = this.documents.map(doc => ({
      ...doc,
      similarity: cosineSimilarity(queryEmbedding, doc.embedding)
    }));

    // 按相似度排序，返回 top K
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  async getEmbedding(text) {
    // 调用 OpenAI Embedding API
    // ...
  }
}

// 使用示例
const db = new VectorDB();

// 添加文档
await db.addDocument('React 使用虚拟 DOM 提升性能', { category: 'React' });
await db.addDocument('Vue 3 使用 Proxy 实现响应式', { category: 'Vue' });
await db.addDocument('性能优化的最佳实践', { category: 'Performance' });

// 语义搜索
const results = await db.search('如何提升 React 性能');
console.log(results);
// [
//   { text: 'React 使用虚拟 DOM 提升性能', similarity: 0.89 },
//   { text: '性能优化的最佳实践', similarity: 0.76 },
//   ...
// ]
```

### 4. RAG（检索增强生成）

RAG（Retrieval-Augmented Generation）是一种结合检索和生成的技术，通过检索相关文档增强 LLM 的回答质量。

#### RAG 工作流程

```
用户问题 → 向量化 → 检索相关文档 → 组合成 Prompt → LLM 生成答案
```

#### RAG 实现示例

```javascript
/**
 * RAG 系统实现
 */
class RAGSystem {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.vectorDB = new VectorDB();
  }

  // 1. 添加知识库文档
  async addKnowledge(documents) {
    for (const doc of documents) {
      await this.vectorDB.addDocument(doc.content, {
        title: doc.title,
        source: doc.source
      });
    }
  }

  // 2. 问答
  async ask(question) {
    // 2.1 检索相关文档
    const relevantDocs = await this.vectorDB.search(question, 3);

    // 2.2 构建增强的 prompt
    const context = relevantDocs
      .map(doc => `【${doc.metadata.title}】\n${doc.text}`)
      .join('\n\n');

    const prompt = `
基于以下文档回答问题：

${context}

问题：${question}

要求：
1. 只基于提供的文档内容回答
2. 如果文档中没有相关信息，明确说明
3. 引用来源
    `;

    // 2.3 调用 LLM 生成答案
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一个知识问答助手，只基于提供的文档回答问题。'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();
    return {
      answer: data.choices[0].message.content,
      sources: relevantDocs.map(doc => doc.metadata)
    };
  }
}

// 使用示例
const rag = new RAGSystem(API_KEY);

// 添加知识库
await rag.addKnowledge([
  {
    title: 'React 性能优化',
    content: 'React 性能优化可以通过 memo、useMemo、useCallback 等方法...',
    source: 'docs/react-optimization.md'
  },
  {
    title: 'Vue 3 响应式原理',
    content: 'Vue 3 使用 Proxy 替代了 Object.defineProperty...',
    source: 'docs/vue3-reactivity.md'
  }
]);

// 问答
const result = await rag.ask('React 有哪些性能优化方法？');
console.log(result.answer);
console.log('来源:', result.sources);
```

#### RAG 优化技巧

```javascript
// 1. 文档分块策略
class DocumentChunker {
  // 固定大小分块
  chunkBySize(text, chunkSize = 500, overlap = 50) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // 按段落分块
  chunkByParagraph(text) {
    return text.split('\n\n').filter(p => p.trim());
  }

  // 智能分块（保持语义完整）
  chunkBySemantic(text, maxSize = 500) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxSize && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}

// 2. 重排序（Reranking）
class Reranker {
  async rerank(query, documents) {
    // 使用专门的 reranking 模型提高相关性
    const scores = await Promise.all(
      documents.map(doc => this.scoreRelevance(query, doc))
    );

    return documents
      .map((doc, i) => ({ ...doc, rerankScore: scores[i] }))
      .sort((a, b) => b.rerankScore - a.rerankScore);
  }

  async scoreRelevance(query, document) {
    // 使用交叉编码器或其他方法计算相关性
    // ...
  }
}

// 3. 混合检索（Hybrid Search）
class HybridSearch {
  async search(query, topK = 5) {
    // 向量检索
    const vectorResults = await this.vectorDB.search(query, topK * 2);

    // 关键词检索（BM25）
    const keywordResults = await this.keywordSearch(query, topK * 2);

    // 合并结果（RRF - Reciprocal Rank Fusion）
    const merged = this.mergeResults(vectorResults, keywordResults);

    return merged.slice(0, topK);
  }

  mergeResults(vectorResults, keywordResults) {
    const scoreMap = new Map();

    // RRF 算法
    const k = 60;

    vectorResults.forEach((doc, rank) => {
      const score = 1 / (k + rank + 1);
      scoreMap.set(doc.id, (scoreMap.get(doc.id) || 0) + score);
    });

    keywordResults.forEach((doc, rank) => {
      const score = 1 / (k + rank + 1);
      scoreMap.set(doc.id, (scoreMap.get(doc.id) || 0) + score);
    });

    // 合并并排序
    return Array.from(scoreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id, score]) => ({ id, score }));
  }
}
```

---

## AI 在前端的应用场景概览

### 1. 智能客服机器人

```vue
<template>
  <div class="chatbot">
    <div class="messages">
      <div v-for="msg in messages" :key="msg.id" :class="msg.role">
        {{ msg.content }}
      </div>
    </div>
    <input v-model="input" @keyup.enter="send" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      messages: [],
      input: ''
    };
  },

  methods: {
    async send() {
      // 添加用户消息
      this.messages.push({
        id: Date.now(),
        role: 'user',
        content: this.input
      });

      const userInput = this.input;
      this.input = '';

      // 调用 AI 获取回复
      const reply = await this.getAIReply(userInput);

      this.messages.push({
        id: Date.now() + 1,
        role: 'assistant',
        content: reply
      });
    },

    async getAIReply(message) {
      // 集成 ChatGPT 或其他 LLM
      // ...
    }
  }
};
</script>
```

### 2. 智能搜索和推荐

```javascript
// 语义搜索
class SemanticSearch {
  async search(query) {
    // 1. 将查询转换为向量
    const queryEmbedding = await this.getEmbedding(query);

    // 2. 在向量数据库中检索
    const results = await this.vectorDB.search(queryEmbedding);

    // 3. 返回最相关的结果
    return results;
  }
}

// 智能推荐
class SmartRecommendation {
  async recommend(userId, context) {
    // 1. 获取用户历史行为
    const userHistory = await this.getUserHistory(userId);

    // 2. 分析用户偏好
    const preferences = await this.analyzePreferences(userHistory);

    // 3. 生成推荐
    const prompt = `
用户偏好：${JSON.stringify(preferences)}
当前上下文：${JSON.stringify(context)}
请推荐5个最相关的商品
    `;

    const recommendations = await this.callLLM(prompt);
    return recommendations;
  }
}
```

### 3. AI 代码助手

```javascript
// 代码解释
async function explainCode(code) {
  const prompt = `
请解释以下代码的功能：

\`\`\`javascript
${code}
\`\`\`

要求：
1. 说明整体功能
2. 逐行解释关键代码
3. 指出潜在问题
  `;

  return await callLLM(prompt);
}

// 代码优化建议
async function suggestOptimization(code) {
  const prompt = `
请分析以下代码并给出优化建议：

\`\`\`javascript
${code}
\`\`\`

从以下角度分析：
1. 性能优化
2. 代码可读性
3. 最佳实践
4. 潜在 bug

给出优化后的代码。
  `;

  return await callLLM(prompt);
}

// 单元测试生成
async function generateTests(code, functionName) {
  const prompt = `
为以下函数生成单元测试：

\`\`\`javascript
${code}
\`\`\`

要求：
1. 使用 Jest
2. 覆盖正常情况
3. 覆盖边界情况
4. 覆盖异常情况
  `;

  return await callLLM(prompt);
}
```

### 4. 内容生成和处理

```javascript
// 文章摘要
async function summarizeArticle(article) {
  const prompt = `
请总结以下文章的核心内容（200字以内）：

${article}
  `;

  return await callLLM(prompt);
}

// 文本改写
async function rewriteText(text, style) {
  const prompt = `
请将以下文本改写为${style}风格：

原文：${text}
  `;

  return await callLLM(prompt);
}

// 多语言翻译
async function translate(text, targetLang) {
  const prompt = `
将以下文本翻译为${targetLang}：

${text}

要求：
1. 保持原意
2. 语言地道
3. 保留格式
  `;

  return await callLLM(prompt);
}
```

### 5. 图像处理

```javascript
// 图像识别
async function recognizeImage(imageUrl) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '请描述图片中的内容'
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            }
          ]
        }
      ]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

// 图像生成
async function generateImage(prompt) {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024'
    })
  });

  const data = await response.json();
  return data.data[0].url;
}
```

---

## 前端 AI 技术栈

### 1. API 和 SDK

```javascript
// OpenAI SDK
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Anthropic SDK (Claude)
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Vercel AI SDK
import { OpenAIStream, StreamingTextResponse } from 'ai';

export async function POST(req) {
  const { messages } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    stream: true,
    messages
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
```

### 2. 框架和库

```bash
# LangChain.js - LLM 应用开发框架
npm install langchain

# Vercel AI SDK - 流式 UI 和 AI 集成
npm install ai

# OpenAI SDK
npm install openai

# Anthropic SDK
npm install @anthropic-ai/sdk

# 向量数据库客户端
npm install @pinecone-database/pinecone
npm install chromadb

# 本地 LLM
npm install ollama
```

### 3. 常用工具

```javascript
// 1. Token 计数
import { encoding_for_model } from 'tiktoken';

const enc = encoding_for_model('gpt-4');
const tokens = enc.encode('Hello, world!');
console.log(`Token 数量: ${tokens.length}`);

// 2. Markdown 渲染
import { marked } from 'marked';
import hljs from 'highlight.js';

marked.setOptions({
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return code;
  }
});

const html = marked('## Hello\n\n```js\nconsole.log("hi");\n```');

// 3. 流式响应处理
async function* streamResponse(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    yield chunk;
  }
}
```

---

## 面试高频题

::: details 基础概念题
**1. 什么是大语言模型（LLM）？它的工作原理是什么？**

答案要点：
- LLM 是基于 Transformer 架构的深度学习模型
- 通过训练海量文本数据学习语言模式
- 工作流程：输入 Token 化 → 向量编码 → 模型推理 → 输出生成
- 主流模型：GPT-4、Claude、文心一言等

**2. 什么是 Prompt Engineering？有哪些常用技巧？**

答案要点：
- 设计优化输入提示词的技术
- 常用技巧：
  - 明确角色和上下文
  - 提供示例（Few-shot Learning）
  - 思维链（Chain of Thought）
  - 结构化输出
  - 迭代优化

**3. 解释 Embedding 和向量数据库的概念及应用场景**

答案要点：
- Embedding：将文本转换为向量表示
- 相似文本有相似向量
- 应用：语义搜索、推荐系统、RAG
- 向量数据库：专门存储和检索向量数据

**4. 什么是 RAG？它解决了什么问题？**

答案要点：
- RAG：检索增强生成
- 解决 LLM 知识更新和幻觉问题
- 流程：检索相关文档 → 增强 Prompt → 生成答案
- 优势：减少幻觉、引入最新知识、可追溯来源
:::

::: details 实践应用题
**5. 如何在前端实现流式响应（SSE）？**

```javascript
async function streamChat(messages, onChunk) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, stream: true })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim());

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content;
          if (content) onChunk(content);
        } catch (e) {
          console.error('Parse error:', e);
        }
      }
    }
  }
}
```

**6. 如何保护 API Key 安全？**

答案要点：
- 永远不要在前端暴露 API Key
- 使用后端代理：前端 → 后端 → AI API
- 环境变量存储
- 使用访问控制和限流
- 监控 API 使用情况

```javascript
// 错误示例：直接在前端调用
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}` // ❌ 危险！
  }
});

// 正确示例：通过后端代理
// 前端
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ messages })
});

// 后端（Next.js API Route）
export async function POST(req) {
  const { messages } = await req.json();

  // 在服务端调用 OpenAI
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` // ✅ 安全
    },
    body: JSON.stringify({ model: 'gpt-4', messages })
  });

  return Response.json(await response.json());
}
```

**7. 如何计算和控制 Token 成本？**

```javascript
import { encoding_for_model } from 'tiktoken';

class TokenCostCalculator {
  constructor(model = 'gpt-4') {
    this.model = model;
    this.encoding = encoding_for_model(model);

    // 价格（每 1K tokens）
    this.pricing = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 }
    };
  }

  // 计算 token 数量
  countTokens(text) {
    return this.encoding.encode(text).length;
  }

  // 估算成本
  estimateCost(inputText, estimatedOutputTokens = 500) {
    const inputTokens = this.countTokens(inputText);
    const pricing = this.pricing[this.model];

    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (estimatedOutputTokens / 1000) * pricing.output;

    return {
      inputTokens,
      estimatedOutputTokens,
      totalCost: inputCost + outputCost,
      breakdown: { inputCost, outputCost }
    };
  }

  // 控制成本
  limitTokens(messages, maxTokens = 4000) {
    let totalTokens = 0;
    const limitedMessages = [];

    // 保留 system message
    if (messages[0]?.role === 'system') {
      limitedMessages.push(messages[0]);
      totalTokens += this.countTokens(messages[0].content);
    }

    // 从最新消息开始，倒序添加直到达到限制
    for (let i = messages.length - 1; i >= 1; i--) {
      const tokens = this.countTokens(messages[i].content);
      if (totalTokens + tokens > maxTokens) break;

      limitedMessages.unshift(messages[i]);
      totalTokens += tokens;
    }

    return {
      messages: limitedMessages,
      totalTokens
    };
  }
}

// 使用
const calculator = new TokenCostCalculator('gpt-4');

const messages = [
  { role: 'system', content: '你是一个助手' },
  { role: 'user', content: '解释 React Hooks' },
  // ... 更多消息
];

// 限制 token 数量
const { messages: limited, totalTokens } = calculator.limitTokens(messages, 3000);

// 估算成本
const cost = calculator.estimateCost(
  limited.map(m => m.content).join('\n'),
  500
);

console.log(`输入 Tokens: ${cost.inputTokens}`);
console.log(`预估成本: $${cost.totalCost.toFixed(4)}`);
```

**8. 如何优化 AI 应用的性能？**

答案要点：

1. **缓存策略**
```javascript
class AIResponseCache {
  constructor() {
    this.cache = new Map();
  }

  // 生成缓存 key
  getCacheKey(messages) {
    return JSON.stringify(messages);
  }

  // 获取缓存
  get(messages) {
    const key = this.getCacheKey(messages);
    return this.cache.get(key);
  }

  // 设置缓存
  set(messages, response) {
    const key = this.getCacheKey(messages);
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });
  }

  // 清理过期缓存
  cleanup(maxAge = 3600000) { // 1小时
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
  }
}
```

2. **请求合并和批处理**
```javascript
class RequestBatcher {
  constructor(batchSize = 5, delay = 100) {
    this.queue = [];
    this.batchSize = batchSize;
    this.delay = delay;
    this.timer = null;
  }

  async add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });

      if (this.queue.length >= this.batchSize) {
        this.flush();
      } else {
        this.scheduleFlush();
      }
    });
  }

  scheduleFlush() {
    if (this.timer) return;
    this.timer = setTimeout(() => this.flush(), this.delay);
  }

  async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.batchSize);

    try {
      const results = await this.processBatch(
        batch.map(item => item.request)
      );

      batch.forEach((item, i) => {
        item.resolve(results[i]);
      });
    } catch (error) {
      batch.forEach(item => {
        item.reject(error);
      });
    }
  }

  async processBatch(requests) {
    // 批量处理请求
    return Promise.all(requests.map(req => this.callAPI(req)));
  }
}
```

3. **流式渲染优化**
```javascript
// 使用 React Suspense 和 Streaming
import { Suspense } from 'react';

function ChatMessage({ message }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StreamingMessage message={message} />
    </Suspense>
  );
}

// 虚拟滚动优化长列表
import { FixedSizeList } from 'react-window';

function MessageList({ messages }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={messages.length}
      itemSize={100}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <ChatMessage message={messages[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```
:::

::: details 思考题
**9. AI 会取代前端开发者吗？为什么？**

答案要点：
- 不会完全取代，但会改变工作方式
- AI 的局限：
  - 缺乏创造力和设计思维
  - 无法理解复杂的业务逻辑
  - 需要人类审查和优化
  - 无法做决策和规划
- 未来趋势：
  - AI 是工具，提升效率
  - 开发者角色转变：从编码到设计和架构
  - 需要学会与 AI 协作

**10. 如何看待 AI 对前端开发的影响？**

答案要点：
- 正面影响：
  - 提高开发效率
  - 降低学习门槛
  - 自动化重复工作
  - 更好的代码质量
- 挑战：
  - 需要学习新技能
  - 代码同质化风险
  - 过度依赖 AI
- 应对策略：
  - 提升核心能力（架构、设计、业务理解）
  - 学会使用 AI 工具
  - 保持学习和创新

---
:::

## 总结

::: details 学习路线
1. **基础阶段**
   - 了解 AI 基本概念
   - 学习 Prompt Engineering
   - 熟悉主流 LLM API

2. **实践阶段**
   - 集成 ChatGPT API
   - 实现智能聊天机器人
   - 尝试 RAG 应用

3. **进阶阶段**
   - 学习 LangChain.js
   - 使用向量数据库
   - 构建复杂 AI 应用
:::

::: details 推荐资源
**官方文档**
- [OpenAI API 文档](https://platform.openai.com/docs)
- [Anthropic Claude 文档](https://docs.anthropic.com)
- [LangChain.js 文档](https://js.langchain.com)
- [Vercel AI SDK 文档](https://sdk.vercel.ai/docs)

**学习网站**
- [Prompt Engineering Guide](https://www.promptingguide.ai)
- [Learn Prompting](https://learnprompting.org)

**实践项目**
- 智能聊天机器人
- 文档问答系统
- AI 代码助手
- 智能搜索引擎
:::

::: details 关键要点
1. AI 正在改变前端开发，但不会取代开发者
2. 掌握 Prompt Engineering 是核心技能
3. 理解 RAG 等技术原理很重要
4. 实践是最好的学习方式
5. 关注 AI 安全和隐私问题
:::
