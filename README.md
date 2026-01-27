# AI 简历面试助手

基于 Next.js + LangChain.js + 智谱 GLM + RAG 技术的智能简历优化与面试系统。

## 功能特性

### 1. 📝 简历生成 (Resume Builder)

- 根据用户提供的信息生成专业简历
- 采用 STAR 法则（Situation / Task / Action / Result）
- 内容自动量化（如"性能提升 30%"）
- 支持前端/后端/全栈岗位优化
- 输出结构化 JSON 和 Markdown

### 2. 🔍 简历分析 (Resume Analyzer)

- 上传 PDF 或粘贴文本进行分析
- 识别结构问题和内容不足
- 逐条修改建议（含可替换文案）
- 输出总体评分和优化后版本

### 3. 🎤 模拟面试 (Interview Simulation)

- 完整面试流程模拟
- 包含自我介绍、技术基础、框架原理、项目深挖等环节
- 实时评估和追问
- 生成详细面试报告和岗位匹配度

### 4. 📚 题库问答 (RAG-based Q&A)

- 基于向量检索的智能问答
- 内置前端面试题库
- 支持多轮追问
- 输出引用来源

## 技术栈

- **框架**: Next.js 14 (App Router)
- **AI**: LangChain.js + 智谱 GLM-4
- **向量库**: 内存向量存储（可扩展至 ChromaDB）
- **UI**: Ant Design 5 + Tailwind CSS
- **语言**: TypeScript

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── resume/        # 简历相关 API
│   │   ├── interview/     # 面试相关 API
│   │   └── rag/           # RAG 搜索 API
│   ├── resume/            # 简历页面
│   ├── interview/         # 面试页面
│   └── questions/         # 题库页面
├── components/            # React 组件
│   ├── common/           # 通用组件
│   ├── layout/           # 布局组件
│   ├── resume/           # 简历组件
│   ├── interview/        # 面试组件
│   └── questions/        # 题库组件
├── lib/                   # 核心逻辑
│   ├── ai/               # AI 封装（GLM、向量库）
│   ├── resume/           # 简历模块
│   ├── interview/        # 面试模块
│   └── rag/              # RAG 模块
└── types/                # TypeScript 类型定义
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local` 文件并填入智谱 API Key：

```env
ZHIPU_API_KEY=your_zhipu_api_key_here
```

获取 API Key: https://open.bigmodel.cn/

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## API 接口

### 简历生成

```
POST /api/resume/generate
Body: { personalInfo, education, experience, projects, skills, position }
```

### 简历分析

```
POST /api/resume/analyze
Body: { content, position, level }
或 multipart/form-data: { file, position, level }
```

### 开始面试

```
POST /api/interview/start
Body: { position, level }
```

### 面试回答

```
POST /api/interview/answer
Body: { sessionId, answer }
```

### RAG 搜索

```
POST /api/rag/search
Body: { question, topK }
```

## 扩展指南

### 添加更多面试题

编辑 `lib/rag/service.ts` 中的 `interviewQuestionBank` 数组。

### 自定义 Prompt

修改 `lib/resume/prompts.ts`、`lib/interview/prompts.ts` 和 `lib/rag/prompts.ts`。

### 使用 ChromaDB

1. 安装并启动 ChromaDB
2. 修改 `lib/ai/vector-store.ts` 使用 ChromaDB 客户端

## 许可证

MIT
