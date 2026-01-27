import { NextRequest, NextResponse } from "next/server";
import { handleCandidateAnswer, getInterviewSession } from "@/lib/interview";
import { requireAuth } from "@/lib/auth/middleware";

export async function POST(request: NextRequest) {
  // 认证检查
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { sessionId, answer } = body;

    if (!sessionId || !answer) {
      return NextResponse.json(
        { status: "error", error: "缺少必要参数" },
        { status: 400 },
      );
    }

    // 检查会话是否存在
    const session = getInterviewSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { status: "error", error: "会话不存在或已过期" },
        { status: 404 },
      );
    }

    // 处理回答
    const result = await handleCandidateAnswer(sessionId, answer);

    // 获取更新后的会话
    const updatedSession = getInterviewSession(sessionId);

    return NextResponse.json({
      status: "ok",
      data: {
        response: result.response,
        stage: updatedSession?.stage,
        isComplete: result.isComplete,
        report: result.isComplete ? updatedSession?.report : undefined,
      },
    });
  } catch (error) {
    console.error("Interview answer error:", error);
    return NextResponse.json(
      { status: "error", error: "处理回答失败" },
      { status: 500 },
    );
  }
}
