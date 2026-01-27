"use client";
import MainLayout from "@/components/layout/MainLayout";
import { QuestionSearch } from "@/components/questions";
import { Typography } from "antd";
import AuthGuard from "@/components/auth/AuthGuard";

const { Title, Paragraph } = Typography;

function QuestionsPage() {
  return (
    <MainLayout>
      <div>
        <Title level={2}>📚 题库问答</Title>
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          基于 RAG 技术的智能问答系统，检索面试题库并生成详细解答。
        </Paragraph>
        <QuestionSearch />
      </div>
    </MainLayout>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <QuestionsPage />
    </AuthGuard>
  );
}
