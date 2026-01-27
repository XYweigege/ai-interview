// 通义千问模型封装
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { ChatResult } from "@langchain/core/outputs";
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";

interface QwenInput {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface QwenMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface QwenResponse {
  output: {
    text: string;
    finish_reason: string;
  };
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class ChatQwen extends BaseChatModel {
  private apiKey: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;
  private baseUrl =
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";

  constructor(fields?: QwenInput) {
    super({});
    this.apiKey = fields?.apiKey || process.env.QWEN_API_KEY || "";
    this.model = fields?.model || "qwen-turbo"; // qwen-turbo, qwen-plus, qwen-max
    this.temperature = fields?.temperature ?? 0.7;
    this.maxTokens = fields?.maxTokens || 4096;
  }

  _llmType(): string {
    return "qwen";
  }

  async _generate(
    messages: BaseMessage[],
    _options?: this["ParsedCallOptions"],
    _runManager?: CallbackManagerForLLMRun,
  ): Promise<ChatResult> {
    const qwenMessages = this.convertMessages(messages);

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: {
          messages: qwenMessages,
        },
        parameters: {
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          result_format: "message",
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Qwen API error: ${response.status} - ${error}`);
    }

    const data: QwenResponse = await response.json();
    const content = data.output.text || "";

    return {
      generations: [
        {
          text: content,
          message: new AIMessage(content),
        },
      ],
      llmOutput: {
        tokenUsage: data.usage,
      },
    };
  }

  private convertMessages(messages: BaseMessage[]): QwenMessage[] {
    return messages.map((msg) => {
      if (msg instanceof SystemMessage) {
        return { role: "system", content: msg.content as string };
      } else if (msg instanceof HumanMessage) {
        return { role: "user", content: msg.content as string };
      } else if (msg instanceof AIMessage) {
        return { role: "assistant", content: msg.content as string };
      }
      return { role: "user", content: msg.content as string };
    });
  }
}

// 通义 Embedding
export class QwenEmbeddings {
  private apiKey: string;
  private model: string;
  private baseUrl =
    "https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding";

  constructor() {
    this.apiKey = process.env.QWEN_API_KEY || "";
    this.model = "text-embedding-v1";
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];

    for (const text of texts) {
      const embedding = await this.embedQuery(text);
      embeddings.push(embedding);
    }

    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    if (!this.apiKey) {
      throw new Error("QWEN_API_KEY is not configured");
    }

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: {
          texts: [text],
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Qwen Embedding API error: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();
    return data.output.embeddings[0].embedding;
  }
}

export function getQwenInstance(options?: QwenInput): ChatQwen {
  return new ChatQwen(options);
}
