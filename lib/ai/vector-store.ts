import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { Embeddings } from "@langchain/core/embeddings";

// 智谱 Embedding 封装
class ZhipuEmbeddings extends Embeddings {
  private apiKey: string;
  private model: string;
  private baseUrl = "https://open.bigmodel.cn/api/paas/v4/embeddings";

  constructor() {
    super({});
    this.apiKey = process.env.ZHIPU_API_KEY || "";
    this.model = "embedding-2";
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
      throw new Error(
        "ZHIPU_API_KEY is not configured. Please set it in .env.local",
      );
    }

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Zhipu Embedding API error:", errorText);
      throw new Error(
        `Zhipu Embedding API error: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      throw new Error("Invalid response format from Zhipu Embedding API");
    }
    return data.data[0].embedding;
  }
}

// 向量存储管理器
class VectorStoreManager {
  private vectorStore: MemoryVectorStore | null = null;
  private embeddings: ZhipuEmbeddings;
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor() {
    this.embeddings = new ZhipuEmbeddings();
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
      separators: ["\n\n", "\n", "。", "！", "？", ".", "!", "?", " "],
    });
  }

  async initialize(
    documents: Array<{ content: string; metadata: Record<string, unknown> }>,
  ) {
    const docs: Document[] = [];

    for (const doc of documents) {
      const chunks = await this.textSplitter.splitText(doc.content);
      for (const chunk of chunks) {
        docs.push(
          new Document({
            pageContent: chunk,
            metadata: doc.metadata,
          }),
        );
      }
    }

    this.vectorStore = await MemoryVectorStore.fromDocuments(
      docs,
      this.embeddings,
    );
    return this.vectorStore;
  }

  async addDocuments(
    documents: Array<{ content: string; metadata: Record<string, unknown> }>,
  ) {
    if (!this.vectorStore) {
      return this.initialize(documents);
    }

    const docs: Document[] = [];
    for (const doc of documents) {
      const chunks = await this.textSplitter.splitText(doc.content);
      for (const chunk of chunks) {
        docs.push(
          new Document({
            pageContent: chunk,
            metadata: doc.metadata,
          }),
        );
      }
    }

    await this.vectorStore.addDocuments(docs);
    return this.vectorStore;
  }

  async search(query: string, k: number = 5): Promise<Document[]> {
    if (!this.vectorStore) {
      throw new Error("Vector store not initialized");
    }

    return this.vectorStore.similaritySearch(query, k);
  }

  async searchWithScores(
    query: string,
    k: number = 5,
  ): Promise<Array<[Document, number]>> {
    if (!this.vectorStore) {
      throw new Error("Vector store not initialized");
    }

    return this.vectorStore.similaritySearchWithScore(query, k);
  }

  getVectorStore(): MemoryVectorStore | null {
    return this.vectorStore;
  }
}

// 单例实例
let vectorStoreManager: VectorStoreManager | null = null;

export function getVectorStoreManager(): VectorStoreManager {
  if (!vectorStoreManager) {
    vectorStoreManager = new VectorStoreManager();
  }
  return vectorStoreManager;
}

export { ZhipuEmbeddings, VectorStoreManager };
