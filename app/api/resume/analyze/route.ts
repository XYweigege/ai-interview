import { NextRequest, NextResponse } from "next/server";
import { analyzeResume, parsePdfText } from "@/lib/resume";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let resumeContent: string;
    let position = "前端工程师";
    let level = "mid";

    if (contentType.includes("multipart/form-data")) {
      // 处理文件上传
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      position = (formData.get("position") as string) || position;
      level = (formData.get("level") as string) || level;

      if (!file) {
        return NextResponse.json(
          { status: "error", error: "请上传简历文件" },
          { status: 400 },
        );
      }

      // 解析 PDF
      const buffer = await file.arrayBuffer();
      resumeContent = await parsePdfText(buffer);
    } else {
      // 处理 JSON 请求
      const body = await request.json();
      resumeContent = body.content;
      position = body.position || position;
      level = body.level || level;

      if (!resumeContent) {
        return NextResponse.json(
          { status: "error", error: "请提供简历内容" },
          { status: 400 },
        );
      }
    }

    const result = await analyzeResume(resumeContent, position, level);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      { status: "error", error: "简历分析失败" },
      { status: 500 },
    );
  }
}
