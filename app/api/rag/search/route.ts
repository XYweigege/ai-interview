import { NextRequest, NextResponse } from "next/server";
import {
  hybridSearch,
  getQuestionBank,
  getQuestionsByCategory,
  getQuestionsByDifficulty,
  getQuestionsByCompany,
  getAllCompanies,
} from "@/lib/rag";
import { requireAuth } from "@/lib/auth/middleware";

export async function POST(request: NextRequest) {
  // 认证检查
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { question, topK = 5 } = body;

    if (!question) {
      return NextResponse.json(
        { status: "error", error: "请提供问题内容" },
        { status: 400 },
      );
    }

    // 检查 API Key
    if (!process.env.ZHIPU_API_KEY) {
      console.error("ZHIPU_API_KEY is not configured");
      return NextResponse.json(
        {
          status: "error",
          error: "未配置 API Key，请在 .env.local 中设置 ZHIPU_API_KEY",
        },
        { status: 500 },
      );
    }

    // 使用混合搜索
    const result = await hybridSearch(question, topK);

    return NextResponse.json({
      status: "ok",
      data: result,
    });
  } catch (error) {
    console.error("RAG search error:", error);
    const errorMessage = error instanceof Error ? error.message : "搜索失败";
    return NextResponse.json(
      { status: "error", error: `搜索失败: ${errorMessage}` },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty") as
      | "easy"
      | "medium"
      | "hard"
      | null;
    const company = searchParams.get("company");
    const action = searchParams.get("action");

    // 获取公司列表
    if (action === "companies") {
      const companies = getAllCompanies();
      return NextResponse.json({
        status: "ok",
        data: { companies },
      });
    }

    let questions;
    if (category) {
      questions = getQuestionsByCategory(category);
    } else if (difficulty) {
      questions = getQuestionsByDifficulty(difficulty);
    } else if (company) {
      questions = getQuestionsByCompany(company);
    } else {
      questions = getQuestionBank();
    }

    return NextResponse.json({
      status: "ok",
      data: {
        total: questions.length,
        questions: questions.map((q) => ({
          id: q.id,
          question: q.question,
          category: q.category,
          difficulty: q.difficulty,
          tags: q.tags,
          companies: q.companies || [],
        })),
      },
    });
  } catch (error) {
    console.error("Get questions error:", error);
    return NextResponse.json(
      { status: "error", error: "获取题库失败" },
      { status: 500 },
    );
  }
}
