import { NextRequest, NextResponse } from "next/server";
import { HARDCODED_USERS, SESSION_COOKIE_NAME } from "@/lib/auth/config";
import { createSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { status: "error", error: "用户名和密码不能为空" },
        { status: 400 },
      );
    }

    // 查找用户
    const user = HARDCODED_USERS.find(
      (u) => u.username === username && u.password === password,
    );

    if (!user) {
      return NextResponse.json(
        { status: "error", error: "用户名或密码错误" },
        { status: 401 },
      );
    }

    // 创建 Session
    const sessionId = createSession({
      username: user.username,
      role: user.role,
      name: user.name,
    });

    // 设置 Cookie
    const response = NextResponse.json({
      status: "ok",
      data: {
        username: user.username,
        role: user.role,
        name: user.name,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 60, // 30分钟
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { status: "error", error: "登录失败" },
      { status: 500 },
    );
  }
}
