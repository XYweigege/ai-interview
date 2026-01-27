"use client";

import { Layout, Menu, Typography, Button, Space, Dropdown } from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  SearchOutlined,
  HomeOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../auth/AuthProvider";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    key: "/",
    icon: <HomeOutlined />,
    label: <Link href="/">首页</Link>,
  },
  {
    key: "/resume",
    icon: <FileTextOutlined />,
    label: "简历助手",
    children: [
      {
        key: "/resume/builder",
        label: <Link href="/resume/builder">简历生成</Link>,
      },
      {
        key: "/resume/analyzer",
        label: <Link href="/resume/analyzer">简历分析</Link>,
      },
    ],
  },
  {
    key: "/interview",
    icon: <UserOutlined />,
    label: <Link href="/interview">模拟面试</Link>,
  },
  {
    key: "/questions",
    icon: <SearchOutlined />,
    label: <Link href="/questions">题库问答</Link>,
  },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Title level={4} style={{ margin: 0, color: "#1677ff" }}>
          🤖 AI 简历面试助手
        </Title>
        <Space>
          <Dropdown
            menu={{
              items: [
                {
                  key: "logout",
                  icon: <LogoutOutlined />,
                  label: "退出登录",
                  onClick: logout,
                },
              ],
            }}
          >
            <Button type="text">
              <Space>
                <UserOutlined />
                <Text>{user?.name || user?.username}</Text>
              </Space>
            </Button>
          </Dropdown>
        </Space>
      </Header>
      <Layout>
        <Sider
          width={220}
          style={{
            background: "#fff",
            borderRight: "1px solid #f0f0f0",
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            defaultOpenKeys={["/resume"]}
            style={{ height: "100%", borderRight: 0, paddingTop: 16 }}
            items={menuItems}
          />
        </Sider>
        <Content
          style={{
            padding: 24,
            minHeight: 280,
            background: "#f5f7fa",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
