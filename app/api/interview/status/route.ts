import { NextRequest, NextResponse } from "next/server";
import { getInterviewSession } from "@/lib/interview";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { status: "error", error: "缺少 sessionId 参数" },
        { status: 400 },
      );
    }

    const session = getInterviewSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { status: "error", error: "会话不存在或已过期" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: "ok",
      data: {
        id: session.id,
        position: session.position,
        level: session.level,
        stage: session.stage,
        messageCount: session.messages.length,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        hasReport: !!session.report,
      },
    });
  } catch (error) {
    console.error("Interview status error:", error);
    return NextResponse.json(
      { status: "error", error: "获取状态失败" },
      { status: 500 },
    );
  }
}
