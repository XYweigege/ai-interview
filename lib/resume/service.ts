import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getGLMInstance } from "../ai";
import { resumeBuilderPrompt, resumeAnalyzerPrompt } from "./prompts";
import { ResumeData, ResumeAnalysisResult, ApiResponse } from "@/types";

// 解析 PDF 文本（简化版本，实际项目中需要使用 pdf-parse）
export async function parsePdfText(buffer: ArrayBuffer): Promise<string> {
  // 动态导入 pdf-parse
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(Buffer.from(buffer));
  return data.text;
}

// 简历生成服务
export async function generateResume(
  personalInfo: string,
  education: string,
  experience: string,
  projects: string,
  skills: string,
  position: string,
): Promise<ApiResponse<{ markdown: string; data: ResumeData }>> {
  try {
    const model = getGLMInstance();

    const chain = RunnableSequence.from([
      resumeBuilderPrompt,
      model,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke({
      personalInfo,
      education,
      experience,
      projects,
      skills,
      position,
    });

    // 解析 JSON 结果
    const jsonMatch = result.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      return {
        status: "ok",
        data: {
          markdown: parsed.markdown,
          data: parsed.data,
        },
      };
    }

    // 如果没有 JSON 格式，返回原始 Markdown
    return {
      status: "ok",
      data: {
        markdown: result,
        data: {} as ResumeData,
      },
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "简历生成失败",
    };
  }
}

// 简历分析服务
export async function analyzeResume(
  resumeContent: string,
  position: string = "前端工程师",
  level: string = "mid",
): Promise<ResumeAnalysisResult> {
  try {
    const model = getGLMInstance();

    const chain = RunnableSequence.from([
      resumeAnalyzerPrompt,
      model,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke({
      resumeContent,
      position,
      level,
    });

    // 解析 JSON 结果
    const jsonMatch = result.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      return parsed;
    }

    // 返回默认结构
    return {
      status: "error",
      data: {
        score: 0,
        problems: ["无法解析分析结果"],
        suggestions: [],
        optimized_resume: resumeContent,
      },
    };
  } catch (error) {
    return {
      status: "error",
      data: {
        score: 0,
        problems: [error instanceof Error ? error.message : "分析失败"],
        suggestions: [],
        optimized_resume: "",
      },
    };
  }
}

// 简历模板
export const resumeTemplates = {
  frontend: `
# 个人信息
- 姓名：
- 电话：
- 邮箱：
- GitHub：

# 教育背景
- 学校名称 | 专业 | 学历 | 毕业时间

# 专业技能
- 前端框架：React、Vue、Next.js
- 编程语言：JavaScript、TypeScript
- 工具链：Webpack、Vite、Git

# 工作经历
## 公司名称 | 岗位 | 时间
- 负责xxx系统的前端开发，使用React技术栈
- 实现了xxx功能，性能提升xx%

# 项目经验
## 项目名称 | 角色 | 时间
**技术栈**：React、TypeScript、Ant Design
**项目描述**：
**主要成果**：
- 优化了xxx，提升了xx%的性能
`,
  backend: `
# 个人信息
- 姓名：
- 电话：
- 邮箱：
- GitHub：

# 教育背景
- 学校名称 | 专业 | 学历 | 毕业时间

# 专业技能
- 后端框架：Node.js、Express、NestJS
- 数据库：MySQL、PostgreSQL、MongoDB、Redis
- 中间件：RabbitMQ、Kafka

# 工作经历
## 公司名称 | 岗位 | 时间
- 负责xxx系统的后端架构设计与开发
- 优化了数据库查询，响应时间降低xx%

# 项目经验
## 项目名称 | 角色 | 时间
**技术栈**：Node.js、MySQL、Redis
**项目描述**：
**主要成果**：
- 设计并实现了高并发处理方案，QPS 提升至 xxx
`,
  fullstack: `
# 个人信息
- 姓名：
- 电话：
- 邮箱：
- GitHub：

# 教育背景
- 学校名称 | 专业 | 学历 | 毕业时间

# 专业技能
- 前端：React、Vue、Next.js、TypeScript
- 后端：Node.js、Python、Go
- 数据库：MySQL、MongoDB、Redis
- DevOps：Docker、K8s、CI/CD

# 工作经历
## 公司名称 | 岗位 | 时间
- 独立负责xxx产品的全栈开发
- 搭建了完整的 CI/CD 流程

# 项目经验
## 项目名称 | 角色 | 时间
**技术栈**：Next.js、Node.js、PostgreSQL
**项目描述**：
**主要成果**：
- 从0到1完成产品开发，上线后用户增长xxx%
`,
};
