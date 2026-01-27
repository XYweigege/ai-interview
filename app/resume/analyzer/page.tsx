"use client";
import MainLayout from "@/components/layout/MainLayout";
import { ResumeAnalyzer } from "@/components/resume";
import { Typography } from "antd";
import AuthGuard from "@/components/auth/AuthGuard";

const { Title, Paragraph } = Typography;

function ResumeAnalyzerPage() {
  return (
    <MainLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Title level={2}>🔍 简历分析</Title>
        <Paragraph type="secondary">
          上传你的简历或粘贴内容，AI 将分析问题并给出具体的修改建议和优化版本。
        </Paragraph>
        <ResumeAnalyzer />
      </div>
    </MainLayout>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <ResumeAnalyzerPage />
    </AuthGuard>
  );
}
