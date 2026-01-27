import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/config";
import { validateSession } from "@/lib/auth/session";

// 需要认证的 API 路径
const PROTECTED_API_PATHS = ["/api/interview", "/api/resume", "/api/rag"];

// 公开的 API 路径
const PUBLIC_API_PATHS = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/me",
];

export function checkAuth(request: NextRequest): {
  isAuthenticated: boolean;
  session: any | null;
} {
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = validateSession(sessionId);

  return {
    isAuthenticated: !!session,
    session,
  };
}

export function requireAuth(request: NextRequest): NextResponse | null {
  const pathname = new URL(request.url).pathname;

  // 检查是否是公开路径
  if (PUBLIC_API_PATHS.some((path) => pathname.startsWith(path))) {
    return null;
  }

  // 检查是否需要保护
  const needsAuth = PROTECTED_API_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  if (!needsAuth) {
    return null;
  }

  // 验证认证
  const { isAuthenticated } = checkAuth(request);

  if (!isAuthenticated) {
    return NextResponse.json(
      { status: "error", error: "未登录或会话已过期，请重新登录" },
      { status: 401 },
    );
  }

  return null;
}
