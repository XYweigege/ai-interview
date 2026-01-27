// 简历相关类型
export interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
  summary?: string;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
}

export interface Education {
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  achievements?: string[];
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string[];
  achievements: string[];
}

export interface Project {
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  techStack: string[];
  description: string;
  highlights: string[]; // STAR 法则中的成果
  metrics?: string[]; // 量化指标
}

export interface Skill {
  category: string; // 如 "前端", "后端", "工具"
  items: string[];
}

// 简历分析结果
export interface ResumeAnalysisResult {
  status: "ok" | "error";
  data: {
    score: number;
    problems: string[];
    suggestions: ResumeAnalysisSuggestion[];
    optimized_resume: string; // Markdown 格式
    structured_data?: ResumeData;
  };
}

export interface ResumeAnalysisSuggestion {
  section: string;
  issue: string;
  original?: string;
  suggested: string;
  priority: "high" | "medium" | "low";
}

// 面试相关类型
export interface InterviewSession {
  id: string;
  position: string;
  level: "junior" | "mid" | "senior";
  stage: InterviewStage;
  messages: InterviewMessage[];
  startedAt: Date;
  completedAt?: Date;
  report?: InterviewReport;
}

export type InterviewStage =
  | "introduction" // 自我介绍
  | "tech_basics" // 技术基础
  | "framework" // 框架原理
  | "project_deep_dive" // 项目深挖
  | "coding" // 手撕代码
  | "cs_fundamentals" // 计算机基础
  | "questions" // 提问环节
  | "summary"; // 总结

export interface InterviewMessage {
  id: string;
  role: "interviewer" | "candidate";
  content: string;
  stage: InterviewStage;
  timestamp: Date;
  evaluation?: MessageEvaluation;
}

export interface MessageEvaluation {
  score: number; // 0-10
  strengths: string[];
  weaknesses: string[];
  followUp?: string; // 追问建议
}

export interface InterviewReport {
  overallScore: number;
  stageScores: Record<InterviewStage, number>;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  positionFit: number; // 岗位匹配度 0-100
  recommendations: string[];
  detailedFeedback: string; // Markdown 格式
}

// RAG 相关类型
export interface QuestionDocument {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  difficulty: "easy" | "medium" | "hard";
  companies?: string[]; // 常见公司
  source?: string;
  relatedQuestions?: string[]; // 关联题目ID
}

export interface RAGSearchResult {
  documents: RetrievedDocument[];
  answer: string;
  sources: SourceReference[];
}

export interface RetrievedDocument {
  content: string;
  metadata: {
    id: string;
    category: string;
    difficulty: string;
    score: number;
  };
}

export interface SourceReference {
  id: string;
  title: string;
  relevance: number;
}

// API 响应类型
export interface ApiResponse<T> {
  status: "ok" | "error";
  data?: T;
  error?: string;
  message?: string;
}

// 流式响应类型
export interface StreamChunk {
  type: "content" | "status" | "error" | "done";
  content?: string;
  status?: string;
  error?: string;
}
