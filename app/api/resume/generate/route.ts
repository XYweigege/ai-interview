import { NextRequest, NextResponse } from "next/server";
import { generateResume } from "@/lib/resume";
import { requireAuth } from "@/lib/auth/middleware";

export async function POST(request: NextRequest) {
  // 认证检查
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { personalInfo, education, experience, projects, skills, position } =
      body;

    if (!personalInfo || !position) {
      return NextResponse.json(
        { status: "error", error: "缺少必要参数" },
        { status: 400 },
      );
    }

    const result = await generateResume(
      typeof personalInfo === "string"
        ? personalInfo
        : JSON.stringify(personalInfo),
      typeof education === "string"
        ? education
        : JSON.stringify(education || []),
      typeof experience === "string"
        ? experience
        : JSON.stringify(experience || []),
      typeof projects === "string" ? projects : JSON.stringify(projects || []),
      typeof skills === "string" ? skills : JSON.stringify(skills || []),
      position,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Resume generation error:", error);
    return NextResponse.json(
      { status: "error", error: "简历生成失败" },
      { status: 500 },
    );
  }
}
