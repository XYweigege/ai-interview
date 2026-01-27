"use client";

import { Card, Row, Col, Typography, Space, Button, Statistic } from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  SearchOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import AuthGuard from "@/components/auth/AuthGuard";

const { Title, Paragraph, Text } = Typography;

const features = [
  {
    icon: <FileTextOutlined style={{ fontSize: 48, color: "#1677ff" }} />,
    title: "简历生成",
    description: "根据你的信息，使用 STAR 法则生成专业简历，自动量化成果",
    link: "/resume/builder",
    color: "#e6f4ff",
  },
  {
    icon: <CheckCircleOutlined style={{ fontSize: 48, color: "#52c41a" }} />,
    title: "简历分析",
    description: "上传简历，AI 分析问题并给出具体修改建议和优化版本",
    link: "/resume/analyzer",
    color: "#f6ffed",
  },
  {
    icon: <UserOutlined style={{ fontSize: 48, color: "#722ed1" }} />,
    title: "模拟面试",
    description: "完整的面试流程模拟，从自我介绍到技术深挖，最终生成面试报告",
    link: "/interview",
    color: "#f9f0ff",
  },
  {
    icon: <SearchOutlined style={{ fontSize: 48, color: "#fa8c16" }} />,
    title: "题库问答",
    description: "基于 RAG 的智能问答，检索相关面试题并生成详细解答",
    link: "/questions",
    color: "#fff7e6",
  },
];

function Home() {
  return (
    <MainLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Hero Section */}
        <Card
          style={{
            marginBottom: 24,
            background: "linear-gradient(135deg, #1677ff 0%, #722ed1 100%)",
            border: "none",
          }}
        >
          <div
            style={{ textAlign: "center", padding: "40px 0", color: "#fff" }}
          >
            <Space direction="vertical" size="large">
              <RocketOutlined style={{ fontSize: 64 }} />
              <Title style={{ color: "#fff", marginBottom: 0 }}>
                AI 简历面试助手
              </Title>
              <Paragraph
                style={{ color: "rgba(255,255,255,0.85)", fontSize: 18 }}
              >
                基于 LangChain + 智谱 GLM + RAG 技术的智能简历优化与面试系统
              </Paragraph>
              <Space size="large">
                <Link href="/resume/builder">
                  <Button type="primary" size="large" ghost>
                    开始使用
                  </Button>
                </Link>
                <Link href="/interview">
                  <Button size="large" style={{ background: "#fff" }}>
                    模拟面试
                  </Button>
                </Link>
              </Space>
            </Space>
          </div>
        </Card>

        {/* 统计数据 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="支持的岗位"
                value={3}
                suffix="个"
                prefix={<ThunderboltOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="面试题库"
                value={50}
                suffix="+"
                prefix={<SearchOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="面试阶段"
                value={8}
                suffix="个"
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="AI 模型"
                value="GLM-4.7-flash"
                prefix={<RocketOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 功能卡片 */}
        <Title level={3}>核心功能</Title>
        <Row gutter={16}>
          {features.map((feature) => (
            <Col span={12} key={feature.title}>
              <Link href={feature.link}>
                <Card
                  hoverable
                  style={{ marginBottom: 16, background: feature.color }}
                >
                  <Space size="large">
                    {feature.icon}
                    <div>
                      <Title level={4} style={{ marginBottom: 8 }}>
                        {feature.title}
                      </Title>
                      <Text type="secondary">{feature.description}</Text>
                    </div>
                  </Space>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>

        {/* 技术栈 */}
        <Card title="技术栈" style={{ marginTop: 24 }}>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Card size="small" style={{ textAlign: "center" }}>
                <Title level={5}>Next.js 14</Title>
                <Text type="secondary">App Router</Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign: "center" }}>
                <Title level={5}>LangChain.js</Title>
                <Text type="secondary">AI 编排框架</Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign: "center" }}>
                <Title level={5}>智谱 GLM-4</Title>
                <Text type="secondary">大语言模型</Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign: "center" }}>
                <Title level={5}>RAG</Title>
                <Text type="secondary">检索增强生成</Text>
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    </MainLayout>
  );
}

export default function HomePage() {
  return (
    <AuthGuard>
      <Home />
    </AuthGuard>
  );
}
