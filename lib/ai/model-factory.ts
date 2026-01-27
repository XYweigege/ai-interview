// 统一模型配置 - 支持多种模型切换
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { Embeddings } from "@langchain/core/embeddings";
import { ChatZhipuGLM } from "./zhipu-glm";
import { ChatQwen, QwenEmbeddings } from "./qwen-model";
import { ChatDeepSeek } from "./deepseek-model";

// 根据环境变量选择模型类型
type ModelProvider =
  | "zhipu"
  | "openai"
  | "azure"
  | "claude"
  | "qwen"
  | "deepseek";

const MODEL_PROVIDER = (process.env.MODEL_PROVIDER || "zhipu") as ModelProvider;

// 聊天模型工厂
export function getChatModel(): BaseChatModel {
  switch (MODEL_PROVIDER) {
    case "zhipu":
      return new ChatZhipuGLM({
        apiKey: process.env.ZHIPU_API_KEY,
        model: "glm-4.7-flash",
      });

    case "qwen":
      return new ChatQwen({
        apiKey: process.env.QWEN_API_KEY,
        model: "qwen-turbo", // 可选：qwen-plus, qwen-max
      });

    case "deepseek":
      return new ChatDeepSeek({
        apiKey: process.env.DEEPSEEK_API_KEY,
        model: "deepseek-chat", // 可选：deepseek-coder
      });

    // case 'openai':
    //   const { ChatOpenAI } = require('@langchain/openai');
    //   return new ChatOpenAI({
    //     modelName: 'gpt-4-turbo-preview',
    //     openAIApiKey: process.env.OPENAI_API_KEY,
    //   });

    // case 'claude':
    //   const { ChatAnthropic } = require('@langchain/anthropic');
    //   return new ChatAnthropic({
    //     modelName: 'claude-3-sonnet-20240229',
    //     anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    //   });

    default:
      throw new Error(`Unsupported model provider: ${MODEL_PROVIDER}`);
  }
}

// Embedding 模型工厂
export function getEmbeddings(): Embeddings {
  switch (MODEL_PROVIDER) {
    case "zhipu":
      const { ZhipuEmbeddings } = require("./vector-store");
      return new ZhipuEmbeddings();

    case "qwen":
      return new QwenEmbeddings();

    case "deepseek":
      // DeepSeek 没有 Embedding API，使用智谱的
      console.warn(
        "DeepSeek does not have Embedding API, falling back to Zhipu",
      );
      const { ZhipuEmbeddings: ZhipuEmbed } = require("./vector-store");
      return new ZhipuEmbed();

    // case 'openai':
    //   const { OpenAIEmbeddings } = require('@langchain/openai');
    //   return new OpenAIEmbeddings({
    //     modelName: 'text-embedding-3-small',
    //     openAIApiKey: process.env.OPENAI_API_KEY,
    //   });

    default:
      throw new Error(`Unsupported model provider: ${MODEL_PROVIDER}`);
  }
}

// 向后兼容
export const getGLMInstance = getChatModel;

// 使用示例：
// .env.local 中设置：
// MODEL_PROVIDER=zhipu     # 或 openai、azure、claude、qwen、deepseek
// ZHIPU_API_KEY=xxx        # 智谱 API Key
// QWEN_API_KEY=xxx         # 通义千问 API Key
// DEEPSEEK_API_KEY=xxx     # DeepSeek API Key
