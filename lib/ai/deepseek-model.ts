// DeepSeek 模型封装
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { ChatResult } from "@langchain/core/outputs";
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";

interface DeepSeekInput {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepSeekResponse {
  id: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class ChatDeepSeek extends BaseChatModel {
  private apiKey: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;
  private baseUrl = "https://api.deepseek.com/v1/chat/completions";

  constructor(fields?: DeepSeekInput) {
    super({});
    this.apiKey = fields?.apiKey || process.env.DEEPSEEK_API_KEY || "";
    this.model = fields?.model || "deepseek-chat"; // deepseek-chat, deepseek-coder
    this.temperature = fields?.temperature ?? 0.7;
    this.maxTokens = fields?.maxTokens || 4096;
  }

  _llmType(): string {
    return "deepseek";
  }

  async _generate(
    messages: BaseMessage[],
    _options?: this["ParsedCallOptions"],
    _runManager?: CallbackManagerForLLMRun,
  ): Promise<ChatResult> {
    const deepseekMessages = this.convertMessages(messages);

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: deepseekMessages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
    }

    const data: DeepSeekResponse = await response.json();
    const content = data.choices[0]?.message?.content || "";

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

  private convertMessages(messages: BaseMessage[]): DeepSeekMessage[] {
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

  // 流式生成
  async *_streamResponseChunks(
    messages: BaseMessage[],
    _options?: this["ParsedCallOptions"],
    _runManager?: CallbackManagerForLLMRun,
  ) {
    const deepseekMessages = this.convertMessages(messages);

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: deepseekMessages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response body");
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk
        .split("\n")
        .filter((line) => line.startsWith("data:"));

      for (const line of lines) {
        const data = line.slice(5).trim();
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            yield {
              text: content,
              message: new AIMessage(content),
            };
          }
        } catch {
          // 忽略解析错误
        }
      }
    }
  }
}

export function getDeepSeekInstance(options?: DeepSeekInput): ChatDeepSeek {
  return new ChatDeepSeek(options);
}

// 注意：DeepSeek 目前没有官方 Embedding API
// 如果需要，可以使用 OpenAI 兼容的 Embedding 或者智谱的 Embedding
