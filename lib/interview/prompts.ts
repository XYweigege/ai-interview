import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

// 面试官系统提示词
export const interviewerSystemPrompt =
  SystemMessagePromptTemplate.fromTemplate(`
你是一位经验丰富的技术面试官，正在面试一位{level}级别的{position}候选人。

## 你的角色特点

- 专业但友好，能够创造舒适的面试氛围
- 善于引导候选人展现真实能力
- 能够根据回答质量动态调整问题难度
- 注重考察实际解决问题的能力

## 当前面试阶段：{stage}

### 各阶段说明

1. **introduction（自我介绍）**
   - 引导候选人做自我介绍
   - 了解背景、经历、求职动机
   - 寻找后续深挖的点

2. **tech_basics（技术基础）**
   - JavaScript/TypeScript 核心概念
   - HTML/CSS 基础知识
   - ES6+ 新特性

3. **framework（框架原理）**
   - React/Vue 核心原理
   - 状态管理
   - 性能优化策略
   - Next.js/Nuxt.js 等框架

4. **project_deep_dive（项目深挖）**
   - 技术选型原因
   - 遇到的难点及解决方案
   - 个人贡献与成长
   - 如果重来会怎么做

5. **coding（手撕代码）**
   - 算法与数据结构
   - 实际编程问题
   - 代码质量与规范

6. **cs_fundamentals（计算机基础）**
   - 网络协议（HTTP/HTTPS、TCP/IP）
   - 浏览器原理
   - 性能优化
   - 安全相关

7. **questions（提问环节）**
   - 回答候选人的问题
   - 介绍公司/团队情况

8. **summary（总结）**
   - 给出整体评价
   - 生成面试报告

## 输出要求

每次回复需要包含：
1. 面试官的话（对上一个回答的反馈 + 下一个问题）
2. 隐藏的评估（JSON 格式，用于系统记录）

格式示例：
\`\`\`
【面试官】：
您刚才提到了 React Hooks，能详细说说 useEffect 的执行时机和清理机制吗？

---EVALUATION---
{{
  "score": 7,
  "strengths": ["对虚拟 DOM 理解准确"],
  "weaknesses": ["没有提到 Fiber 架构"],
  "followUp": "可以追问 React 18 新特性"
}}
\`\`\`
`);

export const interviewerHumanPrompt = HumanMessagePromptTemplate.fromTemplate(`
候选人回答：{answer}

请作为面试官继续面试。
`);

export const interviewPrompt = ChatPromptTemplate.fromMessages([
  interviewerSystemPrompt,
  new MessagesPlaceholder("history"),
  interviewerHumanPrompt,
]);

// 面试开场提示词
export const interviewStartPrompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(`
你是一位经验丰富的技术面试官，正在开始面试一位{level}级别的{position}候选人。

请用友好专业的方式开场，包含：
1. 自我介绍（作为面试官）
2. 简单介绍面试流程
3. 请候选人做自我介绍

保持简洁，不要太长。
  `),
  HumanMessagePromptTemplate.fromTemplate("请开始面试。"),
]);

// 面试报告生成提示词
export const interviewReportPrompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(`
你是一位专业的技术面试评估专家。请根据以下面试记录生成详细的面试报告。

## 评估维度

1. **技术能力**（30分）
2. **项目经验**（25分）
3. **沟通表达**（15分）
4. **学习能力**（15分）
5. **文化匹配**（15分）

## 报告要求

- 客观公正，有理有据
- 指出具体的优点和问题
- 给出明确的建议
  `),
  HumanMessagePromptTemplate.fromTemplate(`
## 面试信息
- 岗位：{position}
- 级别：{level}
- 时长：{duration}分钟

## 面试记录
{transcript}

## 各阶段评分
{stageScores}

请生成面试报告，格式如下：

\`\`\`json
{{
  "overallScore": 75,
  "stageScores": {{
    "introduction": 8,
    "tech_basics": 7,
    "framework": 6,
    "project_deep_dive": 8,
    "coding": 7,
    "cs_fundamentals": 6,
    "questions": 8
  }},
  "strengths": ["优点1", "优点2"],
  "weaknesses": ["缺点1", "缺点2"],
  "risks": ["风险点1"],
  "positionFit": 70,
  "recommendations": ["建议1", "建议2"],
  "detailedFeedback": "详细的 Markdown 格式反馈..."
}}
\`\`\`
  `),
]);

// 面试题目库
export const interviewQuestions = {
  tech_basics: {
    junior: [
      "请解释一下 JavaScript 中的闭包是什么？能举个例子吗？",
      "说说 var、let、const 的区别？",
      "CSS 中的盒模型是什么？标准盒模型和 IE 盒模型有什么区别？",
      "什么是事件冒泡和事件捕获？",
      "请解释一下 Promise 是什么，以及它解决了什么问题？",
    ],
    mid: [
      "请详细解释 JavaScript 的事件循环机制（Event Loop）？",
      "说说原型链和继承的实现方式？",
      "TypeScript 中 interface 和 type 有什么区别？",
      "什么是 CSS-in-JS？它有什么优缺点？",
      "解释一下 WeakMap 和 WeakSet 的使用场景？",
    ],
    senior: [
      "深入讲讲 V8 引擎的垃圾回收机制？",
      "如何设计一个高性能的前端状态管理方案？",
      "说说你对微前端架构的理解和实践经验？",
      "如何实现一个可靠的前端监控系统？",
      "讲讲你对函数式编程在前端的应用理解？",
    ],
  },
  framework: {
    junior: [
      "React 中为什么需要 key 属性？",
      "说说 React 组件的生命周期？",
      "Vue 的响应式原理是什么？",
      "什么是虚拟 DOM？它有什么优势？",
      "如何在 React 中进行条件渲染？",
    ],
    mid: [
      "详细讲讲 React Fiber 架构及其优势？",
      "React Hooks 的原理是什么？为什么不能在条件语句中使用？",
      "Vue3 的 Composition API 解决了什么问题？",
      "如何优化 React 应用的性能？",
      "说说 SSR 和 SSG 的区别及使用场景？",
    ],
    senior: [
      "如何从零设计一个前端框架？需要考虑哪些核心问题？",
      "讲讲你对 React Server Components 的理解？",
      "如何设计一个可扩展的组件库架构？",
      "说说你对前端编译工具链的理解和优化经验？",
      "如何实现一个高效的列表虚拟化方案？",
    ],
  },
  cs_fundamentals: {
    junior: [
      "HTTP 和 HTTPS 有什么区别？",
      "什么是跨域？如何解决跨域问题？",
      "说说浏览器的缓存机制？",
      "TCP 三次握手的过程是什么？",
      "什么是 XSS 攻击？如何防范？",
    ],
    mid: [
      "详细讲讲 HTTP/2 的新特性？",
      "说说浏览器从输入 URL 到页面渲染的完整过程？",
      "WebSocket 的原理是什么？和 HTTP 长轮询有什么区别？",
      "如何实现前端性能监控？需要关注哪些指标？",
      "说说你对 CDN 的理解和使用经验？",
    ],
    senior: [
      "如何设计一个高可用的前端架构？",
      "讲讲你对 HTTP/3 和 QUIC 协议的理解？",
      "如何保障前端应用的安全性？有哪些安全实践？",
      "说说你对 Service Worker 和 PWA 的实践经验？",
      "如何进行前端容灾设计？",
    ],
  },
};
