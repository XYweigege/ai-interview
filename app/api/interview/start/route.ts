import { NextRequest, NextResponse } from "next/server";
import { createInterviewSession, startInterview } from "@/lib/interview";
import { requireAuth } from "@/lib/auth/middleware";

export async function POST(request: NextRequest) {
  // 认证检查
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { position = "前端工程师", level = "mid" } = body;

    // 验证参数
    if (!["junior", "mid", "senior"].includes(level)) {
      return NextResponse.json(
        { status: "error", error: "无效的级别参数" },
        { status: 400 },
      );
    }

    // 创建会话
    const session = createInterviewSession(position, level);

    // 开始面试，获取开场白
    const openingMessage = await startInterview(session);

    return NextResponse.json({
      status: "ok",
      data: {
        sessionId: session.id,
        position: session.position,
        level: session.level,
        stage: session.stage,
        message: openingMessage,
      },
    });
  } catch (error) {
    console.error("Interview start error:", error);
    return NextResponse.json(
      { status: "error", error: "面试启动失败" },
      { status: 500 },
    );
  }
}
