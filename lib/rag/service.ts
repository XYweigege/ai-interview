import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Document } from "@langchain/core/documents";
import { getGLMInstance, getVectorStoreManager } from "../ai";
import { ragQAPrompt, queryRewritePrompt } from "./prompts";
import {
  RAGSearchResult,
  QuestionDocument,
  RetrievedDocument,
  SourceReference,
} from "@/types";

// 面试题库数据
const interviewQuestionBank: QuestionDocument[] = [
  // JavaScript 基础
  {
    id: "js-001",
    question: "什么是闭包？闭包的应用场景有哪些？",
    companies: ["阿里巴巴", "腾讯", "字节跳动", "美团"],
    relatedQuestions: ["js-002", "js-003"],
    answer: `闭包是指有权访问另一个函数作用域中变量的函数。当内部函数被保存到外部时，就形成了闭包。

**应用场景：**
1. 数据私有化：模块模式中隐藏内部状态
2. 函数柯里化：创建预设参数的函数
3. 防抖和节流：保存定时器引用
4. 事件处理：保存循环变量的值

**示例代码：**
\`\`\`javascript
function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    getCount: () => count
  };
}
const counter = createCounter();
counter.increment(); // 1
\`\`\`

**注意事项：**
- 闭包会导致变量常驻内存，可能造成内存泄漏
- 合理使用闭包，及时解除引用`,
    category: "JavaScript",
    tags: ["闭包", "作用域", "基础"],
    difficulty: "medium",
  },
  {
    id: "js-002",
    question: "解释 JavaScript 的事件循环（Event Loop）机制",
    companies: ["字节跳动", "阿里巴巴", "滴滴"],
    relatedQuestions: ["js-001"],
    answer: `JavaScript 采用单线程执行模型，通过事件循环实现异步操作。

**执行流程：**
1. 执行同步代码（调用栈）
2. 当调用栈为空时，检查微任务队列
3. 执行所有微任务
4. 执行一个宏任务
5. 回到步骤2

**任务类型：**
- 宏任务：setTimeout、setInterval、I/O、UI渲染
- 微任务：Promise.then、MutationObserver、queueMicrotask

\`\`\`javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// 输出顺序: 1, 4, 3, 2
\`\`\``,
    category: "JavaScript",
    tags: ["事件循环", "异步", "高级"],
    difficulty: "hard",
  },
  {
    id: "js-003",
    question: "说说原型链和继承的实现方式",
    companies: ["腾讯", "美团", "百度"],
    relatedQuestions: ["js-001"],
    answer: `JavaScript 通过原型链实现继承。每个对象都有一个 __proto__ 指向其构造函数的 prototype。

**原型链查找：**
对象 -> 对象.__proto__ -> 构造函数.prototype -> Object.prototype -> null

**继承实现方式：**

1. **原型链继承**
\`\`\`javascript
Child.prototype = new Parent();
\`\`\`

2. **构造函数继承**
\`\`\`javascript
function Child() {
  Parent.call(this);
}
\`\`\`

3. **组合继承**（最常用）
\`\`\`javascript
function Child() {
  Parent.call(this);
}
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;
\`\`\`

4. **ES6 Class**
\`\`\`javascript
class Child extends Parent {
  constructor() {
    super();
  }
}
\`\`\``,
    category: "JavaScript",
    tags: ["原型链", "继承", "面向对象"],
    difficulty: "medium",
  },
  // React 相关
  {
    id: "react-001",
    question: "React Fiber 架构是什么？解决了什么问题？",
    companies: ["字节跳动", "阿里巴巴", "腾讯"],
    relatedQuestions: ["react-002"],
    answer: `Fiber 是 React 16 引入的新协调引擎，重新实现了核心算法。

**解决的问题：**
- 旧架构（Stack Reconciler）同步渲染，大型更新会阻塞主线程
- 用户交互无法及时响应
- 动画卡顿

**Fiber 特性：**
1. **可中断渲染**：将渲染工作分成小单元
2. **优先级调度**：高优先级任务优先执行
3. **时间切片**：利用 requestIdleCallback 在空闲时执行

**Fiber 节点结构：**
\`\`\`javascript
{
  type: 组件类型,
  key: 唯一标识,
  child: 第一个子节点,
  sibling: 兄弟节点,
  return: 父节点,
  alternate: 对应的旧 Fiber,
  effectTag: 副作用标记
}
\`\`\`

**双缓冲机制：**
current Fiber 树 ←→ workInProgress Fiber 树`,
    category: "React",
    tags: ["Fiber", "架构", "原理"],
    difficulty: "hard",
  },
  {
    id: "react-002",
    question: "React Hooks 的原理是什么？",
    companies: ["字节跳动", "美团", "滴滴", "小红书"],
    relatedQuestions: ["react-001"],
    answer: `Hooks 让函数组件拥有状态和生命周期功能。

**核心原理：**
1. **链表存储**：每个组件的 hooks 按调用顺序存储在链表中
2. **闭包保存**：每次渲染创建新闭包捕获当前状态

**为什么不能在条件语句中使用？**
因为 hooks 依赖调用顺序，条件语句会打乱顺序。

\`\`\`javascript
// 简化的 useState 实现
let state = [];
let index = 0;

function useState(initialValue) {
  const currentIndex = index;
  state[currentIndex] = state[currentIndex] ?? initialValue;
  
  const setState = (newValue) => {
    state[currentIndex] = newValue;
    render();
  };
  
  index++;
  return [state[currentIndex], setState];
}
\`\`\`

**常用 Hooks：**
- useState：状态管理
- useEffect：副作用处理
- useCallback/useMemo：性能优化
- useRef：持久化引用
- useContext：上下文访问`,
    category: "React",
    tags: ["Hooks", "原理", "函数组件"],
    difficulty: "medium",
  },
  // Vue 相关
  {
    id: "vue-001",
    question: "Vue 3 的响应式原理是什么？",
    answer: `Vue 3 使用 Proxy 替代 Vue 2 的 Object.defineProperty 实现响应式。

**Proxy 优势：**
1. 可以监听数组索引变化
2. 可以监听对象属性的添加和删除
3. 性能更好，惰性代理

**核心实现：**
\`\`\`javascript
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key); // 依赖收集
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key); // 触发更新
      return result;
    }
  });
}
\`\`\`

**依赖收集：**
- effect 执行时，访问响应式数据触发 get
- 将当前 effect 收集到该属性的依赖集合

**触发更新：**
- 修改数据触发 set
- 执行该属性依赖集合中的所有 effect`,
    category: "Vue",
    tags: ["响应式", "Proxy", "Vue3"],
    difficulty: "medium",
  },
  // 计算机网络
  {
    id: "network-001",
    question: "HTTP/2 有哪些新特性？",
    answer: `HTTP/2 是 HTTP 协议的第二个主要版本，带来显著性能提升。

**核心特性：**

1. **二进制分帧**
   - 数据分割为更小的帧
   - 二进制格式更高效

2. **多路复用**
   - 单一连接并行请求
   - 解决队头阻塞问题

3. **头部压缩（HPACK）**
   - 静态表和动态表
   - 减少重复头部传输

4. **服务器推送**
   - 主动推送资源
   - 减少请求往返

5. **请求优先级**
   - 客户端指定优先级
   - 优化资源加载顺序

**与 HTTP/1.1 对比：**
| 特性 | HTTP/1.1 | HTTP/2 |
|------|----------|--------|
| 连接 | 多个并行 | 单一多路复用 |
| 头部 | 文本重复 | 二进制压缩 |
| 推送 | 不支持 | 支持 |`,
    category: "计算机网络",
    tags: ["HTTP", "协议", "性能"],
    difficulty: "medium",
  },
  {
    id: "network-002",
    question: "说说浏览器从输入 URL 到页面渲染的完整过程",
    answer: `这是一个经典的面试题，涉及网络、渲染、安全等多个方面。

**完整流程：**

1. **URL 解析**
   - 解析协议、域名、端口、路径
   - 编码特殊字符

2. **DNS 解析**
   - 浏览器缓存 → 系统缓存 → hosts → DNS服务器
   - 递归查询和迭代查询

3. **建立 TCP 连接**
   - 三次握手
   - HTTPS 还需 TLS 握手

4. **发送 HTTP 请求**
   - 请求行、请求头、请求体
   - Cookie 等信息

5. **服务器处理并响应**
   - 状态码、响应头、响应体

6. **浏览器解析渲染**
   - 解析 HTML → DOM 树
   - 解析 CSS → CSSOM 树
   - 合并 → 渲染树
   - 布局（Layout）
   - 绘制（Paint）
   - 合成（Composite）

7. **断开连接**
   - 四次挥手
   - keep-alive 复用`,
    category: "计算机网络",
    tags: ["浏览器", "渲染", "网络"],
    difficulty: "medium",
  },
  // 性能优化
  {
    id: "perf-001",
    question: "前端性能优化有哪些方法？",
    answer: `前端性能优化是提升用户体验的关键，可以从多个维度进行。

**1. 加载优化**
- 资源压缩（Gzip/Brotli）
- 代码分割和懒加载
- 图片优化（WebP、懒加载、CDN）
- 预加载（preload/prefetch）
- HTTP/2 多路复用

**2. 渲染优化**
- 减少重排重绘
- 使用 CSS3 硬件加速
- 虚拟列表处理大数据
- requestAnimationFrame 动画

**3. 代码优化**
- 减少 DOM 操作
- 事件委托
- 防抖节流
- Web Worker 处理计算

**4. 缓存策略**
- 强缓存和协商缓存
- Service Worker
- IndexedDB 本地存储

**5. 构建优化**
- Tree Shaking
- 依赖优化
- 按需加载

**核心指标：**
- FCP（First Contentful Paint）
- LCP（Largest Contentful Paint）
- FID（First Input Delay）
- CLS（Cumulative Layout Shift）`,
    category: "性能优化",
    tags: ["性能", "优化", "用户体验"],
    difficulty: "medium",
  },
];

// 初始化知识库
let isInitialized = false;

export async function initializeKnowledgeBase(): Promise<void> {
  if (isInitialized) return;

  try {
    console.log("Initializing knowledge base...");
    const manager = getVectorStoreManager();

    const documents = interviewQuestionBank.map((q) => ({
      content: `问题：${q.question}\n\n答案：${q.answer}`,
      metadata: {
        id: q.id,
        category: q.category,
        difficulty: q.difficulty,
        tags: q.tags.join(","),
      },
    }));

    await manager.initialize(documents);
    isInitialized = true;
    console.log("Knowledge base initialized successfully");
  } catch (error) {
    console.error("Failed to initialize knowledge base:", error);
    throw new Error(
      `知识库初始化失败: ${error instanceof Error ? error.message : "未知错误"}`,
    );
  }
}

// 添加自定义问题到知识库
export async function addQuestionsToKnowledgeBase(
  questions: QuestionDocument[],
): Promise<void> {
  const manager = getVectorStoreManager();

  const documents = questions.map((q) => ({
    content: `问题：${q.question}\n\n答案：${q.answer}`,
    metadata: {
      id: q.id,
      category: q.category,
      difficulty: q.difficulty,
      tags: q.tags.join(","),
    },
  }));

  await manager.addDocuments(documents);
}

// RAG 问答
export async function ragSearch(
  question: string,
  topK: number = 5,
): Promise<RAGSearchResult> {
  try {
    // 确保知识库已初始化
    await initializeKnowledgeBase();

    const manager = getVectorStoreManager();
    const model = getGLMInstance();

    // 向量检索
    const results = await manager.searchWithScores(question, topK);

    if (!results || results.length === 0) {
      throw new Error("未找到相关内容");
    }

    // 构建上下文
    const context = results
      .map(([doc, score], index) => {
        const id = doc.metadata.id as string;
        return `[${index + 1}] (相关度: ${(1 - score).toFixed(2)}) 
来源: ${doc.metadata.category} | ID: ${id}
${doc.pageContent}
---`;
      })
      .join("\n\n");

    // 生成回答
    const chain = RunnableSequence.from([
      ragQAPrompt,
      model,
      new StringOutputParser(),
    ]);

    const answer = await chain.invoke({
      question,
      context,
    });

    // 构建返回结果
    const documents: RetrievedDocument[] = results.map(([doc, score]) => ({
      content: doc.pageContent,
      metadata: {
        id: doc.metadata.id as string,
        category: doc.metadata.category as string,
        difficulty: doc.metadata.difficulty as string,
        score: 1 - score,
      },
    }));

    const sources: SourceReference[] = results.map(([doc, score], index) => ({
      id: doc.metadata.id as string,
      title: `[${index + 1}] ${doc.metadata.category}`,
      relevance: 1 - score,
    }));

    return {
      documents,
      answer,
      sources,
    };
  } catch (error) {
    console.error("RAG search failed:", error);
    throw error;
  }
}

// 获取题库列表
export function getQuestionBank(): QuestionDocument[] {
  return interviewQuestionBank;
}

// 按分类获取题目
export function getQuestionsByCategory(category: string): QuestionDocument[] {
  return interviewQuestionBank.filter((q) => q.category === category);
}

// 按难度获取题目
export function getQuestionsByDifficulty(
  difficulty: "easy" | "medium" | "hard",
): QuestionDocument[] {
  return interviewQuestionBank.filter((q) => q.difficulty === difficulty);
}

// 精确搜索题目（关键词匹配）
export function searchQuestionsExact(query: string): QuestionDocument[] {
  const keywords = query.toLowerCase().trim();
  return interviewQuestionBank.filter(
    (q) =>
      q.question.toLowerCase().includes(keywords) ||
      q.answer.toLowerCase().includes(keywords) ||
      q.tags.some((tag) => tag.toLowerCase().includes(keywords)),
  );
}

// 混合搜索：先精确匹配，再 RAG
export async function hybridSearch(
  question: string,
  topK: number = 5,
): Promise<{
  exactMatches: QuestionDocument[];
  ragResult: RAGSearchResult | null;
  searchType: "exact" | "rag" | "hybrid";
}> {
  // 1. 先尝试精确匹配
  const exactMatches = searchQuestionsExact(question);

  // 2. 如果有精确匹配且相关性高，直接返回
  if (exactMatches.length > 0 && exactMatches.length <= 3) {
    return {
      exactMatches,
      ragResult: null,
      searchType: "exact",
    };
  }

  // 3. 否则使用 RAG 搜索
  try {
    const ragResult = await ragSearch(question, topK);
    return {
      exactMatches: exactMatches.slice(0, 3),
      ragResult,
      searchType: exactMatches.length > 0 ? "hybrid" : "rag",
    };
  } catch (error) {
    // RAG 失败，返回精确匹配结果
    return {
      exactMatches,
      ragResult: null,
      searchType: "exact",
    };
  }
}

// 按公司筛选题目
export function getQuestionsByCompany(company: string): QuestionDocument[] {
  return interviewQuestionBank.filter(
    (q) => q.companies && q.companies.includes(company),
  );
}

// 获取所有公司列表
export function getAllCompanies(): string[] {
  const companies = new Set<string>();
  interviewQuestionBank.forEach((q) => {
    q.companies?.forEach((c) => companies.add(c));
  });
  return Array.from(companies).sort();
}
