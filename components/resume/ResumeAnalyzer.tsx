"use client";

import { useState } from "react";
import {
  Card,
  Upload,
  Button,
  Select,
  Space,
  message,
  Progress,
  Tabs,
  List,
  Tag,
  Typography,
  Input,
} from "antd";
import {
  UploadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import { MarkdownRenderer } from "../common";
import { ResumeAnalysisResult, ResumeAnalysisSuggestion } from "@/types";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

export default function ResumeAnalyzer() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [textContent, setTextContent] = useState("");
  const [position, setPosition] = useState("前端工程师");
  const [level, setLevel] = useState("mid");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const [inputMode, setInputMode] = useState<"file" | "text">("text");

  const handleAnalyze = async () => {
    if (inputMode === "file" && fileList.length === 0) {
      message.error("请上传简历文件");
      return;
    }
    if (inputMode === "text" && !textContent.trim()) {
      message.error("请输入简历内容");
      return;
    }

    setLoading(true);
    try {
      let response;

      if (inputMode === "file") {
        const formData = new FormData();
        formData.append("file", fileList[0].originFileObj as File);
        formData.append("position", position);
        formData.append("level", level);

        response = await fetch("/api/resume/analyze", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/resume/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: textContent,
            position,
            level,
          }),
        });
      }

      const data = await response.json();
      if (data.status === "ok") {
        setResult(data);
        message.success("分析完成！");
      } else {
        message.error(data.error || "分析失败");
      }
    } catch (error) {
      message.error("请求失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "green";
      default:
        return "default";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "高优先级";
      case "medium":
        return "中优先级";
      case "low":
        return "低优先级";
      default:
        return priority;
    }
  };

  const tabItems = [
    {
      key: "input",
      label: "上传简历",
      children: (
        <Card>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Space>
              <Button
                type={inputMode === "text" ? "primary" : "default"}
                onClick={() => setInputMode("text")}
              >
                文本输入
              </Button>
              <Button
                type={inputMode === "file" ? "primary" : "default"}
                onClick={() => setInputMode("file")}
              >
                文件上传
              </Button>
            </Space>

            {inputMode === "file" ? (
              <Upload.Dragger
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false}
                accept=".pdf,.doc,.docx,.txt"
                maxCount={1}
              >
                <p className="ant-upload-drag-icon">
                  <FileTextOutlined
                    style={{ fontSize: 48, color: "#1677ff" }}
                  />
                </p>
                <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                <p className="ant-upload-hint">支持 PDF、Word、TXT 格式</p>
              </Upload.Dragger>
            ) : (
              <TextArea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="请粘贴您的简历内容..."
                rows={12}
              />
            )}

            <Space size="large">
              <Space>
                <Text>目标岗位：</Text>
                <Select
                  value={position}
                  onChange={setPosition}
                  style={{ width: 150 }}
                >
                  <Option value="前端工程师">前端工程师</Option>
                  <Option value="后端工程师">后端工程师</Option>
                  <Option value="全栈工程师">全栈工程师</Option>
                </Select>
              </Space>
              <Space>
                <Text>岗位级别：</Text>
                <Select
                  value={level}
                  onChange={setLevel}
                  style={{ width: 120 }}
                >
                  <Option value="junior">初级</Option>
                  <Option value="mid">中级</Option>
                  <Option value="senior">高级</Option>
                </Select>
              </Space>
            </Space>

            <Button
              type="primary"
              onClick={handleAnalyze}
              loading={loading}
              size="large"
              icon={<CheckCircleOutlined />}
            >
              开始分析
            </Button>
          </Space>
        </Card>
      ),
    },
    {
      key: "result",
      label: "分析结果",
      disabled: !result,
      children: result?.data && (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* 评分卡片 */}
          <Card>
            <Space size="large" align="center">
              <div style={{ textAlign: "center" }}>
                <Progress
                  type="circle"
                  percent={result.data.score}
                  format={(percent) => (
                    <span style={{ fontSize: 24, fontWeight: "bold" }}>
                      {percent}
                    </span>
                  )}
                  strokeColor={{
                    "0%": "#108ee9",
                    "100%": "#87d068",
                  }}
                />
                <div style={{ marginTop: 8 }}>
                  <Text strong>综合评分</Text>
                </div>
              </div>
              <div>
                <Title level={4}>主要问题</Title>
                <List
                  dataSource={result.data.problems}
                  renderItem={(item) => (
                    <List.Item>
                      <Tag color="red">问题</Tag> {item}
                    </List.Item>
                  )}
                />
              </div>
            </Space>
          </Card>

          {/* 修改建议 */}
          <Card title="修改建议">
            <List
              dataSource={result.data.suggestions}
              renderItem={(item: ResumeAnalysisSuggestion) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Tag color="blue">{item.section}</Tag>
                        <Tag color={getPriorityColor(item.priority)}>
                          {getPriorityText(item.priority)}
                        </Tag>
                        {item.issue}
                      </Space>
                    }
                    description={
                      <div style={{ marginTop: 8 }}>
                        {item.original && (
                          <div style={{ marginBottom: 8 }}>
                            <Text type="secondary">原文：</Text>
                            <Text delete>{item.original}</Text>
                          </div>
                        )}
                        <div>
                          <Text type="success">建议：</Text>
                          <Text strong>{item.suggested}</Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* 优化后的简历 */}
          <Card title="优化后的简历">
            <MarkdownRenderer content={result.data.optimized_resume} />
          </Card>
        </Space>
      ),
    },
  ];

  return <Tabs items={tabItems} />;
}
