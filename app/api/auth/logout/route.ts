import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/config";
import { deleteSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (sessionId) {
      deleteSession(sessionId);
    }

    const response = NextResponse.json({
      status: "ok",
      message: "登出成功",
    });

    // 清除 Cookie
    response.cookies.delete(SESSION_COOKIE_NAME);

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { status: "error", error: "登出失败" },
      { status: 500 },
    );
  }
}
