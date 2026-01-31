// 简单的内存 Session 存储
// 生产环境应使用 Redis 或数据库

interface Session {
  id: string;
  username: string;
  role: string;
  name: string;
  createdAt: Date;
  expiresAt: Date;
}

const sessions = new Map<string, Session>();

// 生成随机 Session ID
function generateSessionId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

// 创建 Session
export function createSession(user: {
  username: string;
  role: string;
  name: string;
}): string {
  const sessionId = generateSessionId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30分钟

  sessions.set(sessionId, {
    id: sessionId,
    username: user.username,
    role: user.role,
    name: user.name,
    createdAt: now,
    expiresAt,
  });

  // 清理过期 Session
  cleanupExpiredSessions();

  return sessionId;
}

// 获取 Session
export function getSession(sessionId: string): Session | null {
  const session = sessions.get(sessionId);
  if (!session) return null;

  // 检查是否过期
  if (new Date() > session.expiresAt) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
}

// 删除 Session
export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

// 清理过期 Session
function cleanupExpiredSessions(): void {
  const now = new Date();
  for (const [id, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(id);
    }
  }
}

// 验证 Session
export function validateSession(sessionId: string | undefined): Session | null {
  if (!sessionId) return null;
  return getSession(sessionId);
}

// 定期清理（每小时执行一次）
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
