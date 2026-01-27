import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/config";
import { validateSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = validateSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { status: "error", error: "未登录" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      status: "ok",
      data: {
        username: session.username,
        role: session.role,
        name: session.name,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { status: "error", error: "获取用户信息失败" },
      { status: 500 },
    );
  }
}
