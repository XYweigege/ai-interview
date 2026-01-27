# 模型切换指南

本项目支持多种 AI 模型，可以轻松切换。

## 支持的模型

| 模型           | 聊天 API | Embedding API | 价格 | 特点                   |
| -------------- | -------- | ------------- | ---- | ---------------------- |
| **智谱 GLM-4** | ✅       | ✅            | 低   | 国产，免费额度，速度快 |
| **通义千问**   | ✅       | ✅            | 低   | 阿里云，性价比高       |
| **DeepSeek**   | ✅       | ❌            | 极低 | 超高性价比，技术能力强 |
| OpenAI GPT-4   | ✅       | ✅            | 高   | 效果好，需翻墙         |
| Claude 3       | ✅       | ❌            | 中   | 长文本能力强           |

## 切换方法

### 1️⃣ 切换到通义千问（推荐）

**步骤 1**: 获取 API Key

- 访问：https://dashscope.aliyun.com/
- 注册并开通服务
- 创建 API Key

**步骤 2**: 修改 `.env.local`

```env
MODEL_PROVIDER=qwen
QWEN_API_KEY=sk-your-qwen-api-key
```

**步骤 3**: 重启服务

```bash
pnpm dev
```

**可选模型**：

- `qwen-turbo` - 速度快，免费（默认）
- `qwen-plus` - 平衡
- `qwen-max` - 效果最好

修改模型：编辑 `lib/ai/model-factory.ts`

```typescript
case 'qwen':
  return new ChatQwen({
    apiKey: process.env.QWEN_API_KEY,
    model: 'qwen-max', // 改这里
  });
```

---

### 2️⃣ 切换到 DeepSeek（超高性价比）

**步骤 1**: 获取 API Key

- 访问：https://platform.deepseek.com/
- 注册并充值（超便宜，1元能用很久）
- 创建 API Key

**步骤 2**: 修改 `.env.local`

```env
MODEL_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
# DeepSeek 没有 Embedding，需要配置智谱的
ZHIPU_API_KEY=your-zhipu-key
```

**步骤 3**: 重启服务

**可选模型**：

- `deepseek-chat` - 通用对话（默认）
- `deepseek-coder` - 代码能力强

---

### 3️⃣ 继续使用智谱 GLM（默认）

```env
MODEL_PROVIDER=zhipu
ZHIPU_API_KEY=your-zhipu-api-key
```

---

## 模型对比

### 通义千问 vs DeepSeek vs 智谱

| 维度      | 通义千问 | DeepSeek  | 智谱 GLM |
| --------- | -------- | --------- | -------- |
| 价格      | 💰 低    | 💰 极低   | 💰 低    |
| 速度      | ⚡ 快    | ⚡⚡ 很快 | ⚡ 快    |
| 效果      | ⭐⭐⭐⭐ | ⭐⭐⭐⭐  | ⭐⭐⭐   |
| 代码能力  | 好       | **很强**  | 一般     |
| 中文理解  | **很强** | 强        | 强       |
| Embedding | ✅       | ❌        | ✅       |
| 免费额度  | 有       | 无        | 有       |

### 推荐选择

1. **预算有限** → **DeepSeek**（最便宜）
2. **需要免费** → **通义千问 Turbo**（免费）
3. **看重效果** → **通义千问 Max** 或 **智谱 GLM-4**
4. **代码场景** → **DeepSeek Coder**

---

## 高级配置

### 混合使用（不同功能用不同模型）

编辑 `lib/ai/model-factory.ts`：

```typescript
// 简历生成用 qwen-max（效果好）
export function getResumeModel() {
  return new ChatQwen({
    apiKey: process.env.QWEN_API_KEY,
    model: "qwen-max",
  });
}

// 面试用 deepseek（速度快）
export function getInterviewModel() {
  return new ChatDeepSeek({
    apiKey: process.env.DEEPSEEK_API_KEY,
    model: "deepseek-chat",
  });
}
```

然后在对应模块中使用不同的模型。

---

## 常见问题

### Q: DeepSeek 没有 Embedding 怎么办？

A: 系统会自动使用智谱的 Embedding，需要同时配置 `DEEPSEEK_API_KEY` 和 `ZHIPU_API_KEY`

### Q: 如何查看当前使用的模型？

A: 查看 `.env.local` 中的 `MODEL_PROVIDER` 变量

### Q: 可以同时使用多个模型吗？

A: 可以！参考"高级配置"部分

### Q: 切换模型需要改代码吗？

A: 不需要！只需修改 `.env.local` 即可

---

## API Key 获取地址

- **智谱 GLM**: https://open.bigmodel.cn/
- **通义千问**: https://dashscope.aliyun.com/
- **DeepSeek**: https://platform.deepseek.com/
- **OpenAI**: https://platform.openai.com/
