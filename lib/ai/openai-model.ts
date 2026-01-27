// OpenAI 模型示例（需安装：npm install @langchain/openai）
import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";

// 聊天模型
export function getOpenAIInstance() {
  return new ChatOpenAI({
    modelName: "gpt-4-turbo-preview",
    temperature: 0.7,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
}

// Embedding 模型
export function getOpenAIEmbeddings() {
  return new OpenAIEmbeddings({
    modelName: "text-embedding-3-small",
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
}

// 使用方法：
// 1. 在 lib/ai/index.ts 中导出这些函数
// 2. 将所有 getGLMInstance() 替换为 getOpenAIInstance()
// 3. 在 vector-store.ts 中将 ZhipuEmbeddings 替换为 getOpenAIEmbeddings()
// 4. .env.local 添加 OPENAI_API_KEY=your_key
