"use client";
import MainLayout from "@/components/layout/MainLayout";
import { ResumeBuilder } from "@/components/resume";
import { Typography } from "antd";
import AuthGuard from "@/components/auth/AuthGuard";

const { Title, Paragraph } = Typography;

function ResumeBuilderPage() {
  return (
    <MainLayout>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Title level={2}>📝 简历生成</Title>
        <Paragraph type="secondary">
          填写你的个人信息、教育背景、工作经历和项目经验，AI 将使用 STAR
          法则为你生成专业的简历。
        </Paragraph>
        <ResumeBuilder />
      </div>
    </MainLayout>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <ResumeBuilderPage />
    </AuthGuard>
  );
}
