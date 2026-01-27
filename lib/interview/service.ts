import { v4 as uuidv4 } from "uuid";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { getGLMInstance } from "../ai";
import {
  interviewPrompt,
  interviewStartPrompt,
  interviewReportPrompt,
  interviewQuestions,
} from "./prompts";
import {
  InterviewSession,
  InterviewStage,
  InterviewMessage,
  InterviewReport,
  MessageEvaluation,
} from "@/types";

// 面试阶段顺序
const stageOrder: InterviewStage[] = [
  "introduction",
  "tech_basics",
  "framework",
  "project_deep_dive",
  "coding",
  "cs_fundamentals",
  "questions",
  "summary",
];

// 每个阶段的问题数量
const questionsPerStage: Record<InterviewStage, number> = {
  introduction: 1,
  tech_basics: 3,
  framework: 3,
  project_deep_dive: 2,
  coding: 1,
  cs_fundamentals: 2,
  questions: 1,
  summary: 1,
};

// 面试会话存储（生产环境应使用数据库）
const sessions = new Map<string, InterviewSession>();

// 创建新的面试会话
export function createInterviewSession(
  position: string,
  level: "junior" | "mid" | "senior",
): InterviewSession {
  const session: InterviewSession = {
    id: uuidv4(),
    position,
    level,
    stage: "introduction",
    messages: [],
    startedAt: new Date(),
  };

  sessions.set(session.id, session);
  return session;
}

// 获取面试会话
export function getInterviewSession(
  sessionId: string,
): InterviewSession | undefined {
  return sessions.get(sessionId);
}

// 开始面试
export async function startInterview(
  session: InterviewSession,
): Promise<string> {
  const model = getGLMInstance();

  const chain = RunnableSequence.from([
    interviewStartPrompt,
    model,
    new StringOutputParser(),
  ]);

  const result = await chain.invoke({
    position: session.position,
    level: getLevelLabel(session.level),
  });

  // 记录开场白
  const message: InterviewMessage = {
    id: uuidv4(),
    role: "interviewer",
    content: result,
    stage: "introduction",
    timestamp: new Date(),
  };

  session.messages.push(message);
  sessions.set(session.id, session);

  return result;
}

// 处理候选人回答
export async function handleCandidateAnswer(
  sessionId: string,
  answer: string,
): Promise<{
  response: string;
  evaluation?: MessageEvaluation;
  isComplete: boolean;
}> {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  // 记录候选人回答
  const candidateMessage: InterviewMessage = {
    id: uuidv4(),
    role: "candidate",
    content: answer,
    stage: session.stage,
    timestamp: new Date(),
  };
  session.messages.push(candidateMessage);

  // 检查是否需要切换阶段
  const stageQuestionCount = session.messages.filter(
    (m) => m.stage === session.stage && m.role === "interviewer",
  ).length;

  if (stageQuestionCount >= questionsPerStage[session.stage]) {
    const currentIndex = stageOrder.indexOf(session.stage);
    if (currentIndex < stageOrder.length - 1) {
      session.stage = stageOrder[currentIndex + 1];
    }
  }

  // 如果进入总结阶段，生成报告
  if (session.stage === "summary") {
    const report = await generateInterviewReport(session);
    session.report = report;
    session.completedAt = new Date();
    sessions.set(sessionId, session);

    return {
      response: formatReportAsMessage(report),
      isComplete: true,
    };
  }

  // 构建对话历史
  const history = session.messages
    .slice(-10)
    .map((m) =>
      m.role === "interviewer"
        ? new AIMessage(m.content)
        : new HumanMessage(m.content),
    );

  const model = getGLMInstance();

  const chain = RunnableSequence.from([
    interviewPrompt,
    model,
    new StringOutputParser(),
  ]);

  const result = await chain.invoke({
    position: session.position,
    level: getLevelLabel(session.level),
    stage: getStageLabel(session.stage),
    history,
    answer,
  });

  // 解析响应和评估
  const { response, evaluation } = parseInterviewerResponse(result);

  // 记录面试官回复
  const interviewerMessage: InterviewMessage = {
    id: uuidv4(),
    role: "interviewer",
    content: response,
    stage: session.stage,
    timestamp: new Date(),
    evaluation,
  };
  session.messages.push(interviewerMessage);
  sessions.set(sessionId, session);

  return { response, evaluation, isComplete: false };
}

// 解析面试官响应
function parseInterviewerResponse(response: string): {
  response: string;
  evaluation?: MessageEvaluation;
} {
  const evalMatch = response.match(/---EVALUATION---\s*(\{[\s\S]*?\})/);

  if (evalMatch) {
    try {
      const evaluation = JSON.parse(evalMatch[1]) as MessageEvaluation;
      const cleanResponse = response
        .replace(/---EVALUATION---[\s\S]*$/, "")
        .trim();
      return { response: cleanResponse, evaluation };
    } catch {
      // 解析失败，返回原始响应
    }
  }

  return { response };
}

// 生成面试报告
async function generateInterviewReport(
  session: InterviewSession,
): Promise<InterviewReport> {
  const model = getGLMInstance();

  const chain = RunnableSequence.from([
    interviewReportPrompt,
    model,
    new StringOutputParser(),
  ]);

  // 构建面试记录
  const transcript = session.messages
    .map(
      (m) =>
        `[${m.role === "interviewer" ? "面试官" : "候选人"}]: ${m.content}`,
    )
    .join("\n\n");

  // 计算各阶段评分
  const stageScores = calculateStageScores(session);

  const duration = session.completedAt
    ? Math.round(
        (session.completedAt.getTime() - session.startedAt.getTime()) / 60000,
      )
    : Math.round((Date.now() - session.startedAt.getTime()) / 60000);

  const result = await chain.invoke({
    position: session.position,
    level: getLevelLabel(session.level),
    duration,
    transcript,
    stageScores: JSON.stringify(stageScores),
  });

  // 解析报告
  const jsonMatch = result.match(/```json\n?([\s\S]*?)\n?```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }

  // 返回默认报告
  return {
    overallScore: 60,
    stageScores: stageScores as Record<InterviewStage, number>,
    strengths: [],
    weaknesses: [],
    risks: [],
    positionFit: 50,
    recommendations: [],
    detailedFeedback: result,
  };
}

// 计算各阶段评分
function calculateStageScores(
  session: InterviewSession,
): Record<string, number> {
  const scores: Record<string, number[]> = {};

  for (const message of session.messages) {
    if (message.evaluation) {
      if (!scores[message.stage]) {
        scores[message.stage] = [];
      }
      scores[message.stage].push(message.evaluation.score);
    }
  }

  const result: Record<string, number> = {};
  for (const [stage, stageScores] of Object.entries(scores)) {
    result[stage] = Math.round(
      stageScores.reduce((a, b) => a + b, 0) / stageScores.length,
    );
  }

  return result;
}

// 格式化报告为消息
function formatReportAsMessage(report: InterviewReport): string {
  return `
## 面试结束 - 感谢您的参与！

### 整体评分：${report.overallScore}/100

### 岗位匹配度：${report.positionFit}%

### 优势亮点
${report.strengths.map((s) => `- ${s}`).join("\n")}

### 待提升领域
${report.weaknesses.map((w) => `- ${w}`).join("\n")}

### 发展建议
${report.recommendations.map((r) => `- ${r}`).join("\n")}

---
${report.detailedFeedback}
  `.trim();
}

// 获取随机面试题
export function getRandomQuestion(
  stage: InterviewStage,
  level: "junior" | "mid" | "senior",
): string | null {
  const stageQuestions =
    interviewQuestions[stage as keyof typeof interviewQuestions];
  if (!stageQuestions) return null;

  const levelQuestions = stageQuestions[level];
  if (!levelQuestions || levelQuestions.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * levelQuestions.length);
  return levelQuestions[randomIndex];
}

// 辅助函数
function getLevelLabel(level: "junior" | "mid" | "senior"): string {
  const labels = {
    junior: "初级",
    mid: "中级",
    senior: "高级",
  };
  return labels[level];
}

function getStageLabel(stage: InterviewStage): string {
  const labels: Record<InterviewStage, string> = {
    introduction: "自我介绍",
    tech_basics: "技术基础",
    framework: "框架原理",
    project_deep_dive: "项目深挖",
    coding: "手撕代码",
    cs_fundamentals: "计算机基础",
    questions: "提问环节",
    summary: "总结",
  };
  return labels[stage];
}

export { stageOrder, getLevelLabel, getStageLabel };
