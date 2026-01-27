// 硬编码的测试账号
export const HARDCODED_USERS = [
  {
    username: "admin",
    password: "admin123",
    role: "admin",
    name: "管理员",
  },
  {
    username: "test",
    password: "test123",
    role: "user",
    name: "测试用户",
  },
  {
    username: "demo",
    password: "demo123",
    role: "user",
    name: "演示账号",
  },
];

// Session 密钥（生产环境应使用环境变量）
export const SESSION_SECRET = "ai-interview-secret-key-2024";
export const SESSION_COOKIE_NAME = "ai_interview_session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7天
