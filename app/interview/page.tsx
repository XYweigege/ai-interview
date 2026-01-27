"use client";
import MainLayout from "@/components/layout/MainLayout";
import { InterviewSimulator } from "@/components/interview";
import { Typography } from "antd";
import AuthGuard from "@/components/auth/AuthGuard";

const { Title, Paragraph } = Typography;

function InterviewPage() {
  return (
    <MainLayout>
      <div>
        <Title level={2}>🎤 模拟面试</Title>
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          选择目标岗位和级别，开始一场完整的技术面试模拟。
        </Paragraph>
        <InterviewSimulator />
      </div>
    </MainLayout>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <InterviewPage />
    </AuthGuard>
  );
}
