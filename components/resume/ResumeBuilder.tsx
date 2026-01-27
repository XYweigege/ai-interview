"use client";

import { useRef, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Space,
  Divider,
  message,
  Tabs,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  SendOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { MarkdownRenderer } from "../common";

const { TextArea } = Input;
const { Option } = Select;

interface ResumeFormData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    github?: string;
    location?: string;
  };
  education: Array<{
    school: string;
    degree: string;
    major: string;
    startDate: string;
    endDate: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  projects: Array<{
    name: string;
    role: string;
    techStack: string;
    description: string;
    highlights: string;
  }>;
  skills: string;
  position: string;
}

export default function ResumeBuilder() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("form");
  const resultRef = useRef<HTMLDivElement | null>(null);

  const onFinish = async (values: ResumeFormData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalInfo: JSON.stringify(values.personalInfo),
          education: JSON.stringify(values.education || []),
          experience: JSON.stringify(values.experience || []),
          projects: JSON.stringify(values.projects || []),
          skills: values.skills,
          position: values.position,
        }),
      });

      const data = await response.json();
      if (data.status === "ok") {
        const markdown = data?.data?.markdown || "";
        if (!markdown.trim()) {
          message.error("生成失败：返回内容为空");
          return;
        }
        setResult(markdown);
        setActiveTab("result");
        message.success("简历生成成功！");
      } else {
        message.error(data.error || "生成失败");
      }
    } catch (error) {
      message.error("请求失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!resultRef.current) {
      message.warning("请先生成简历");
      return;
    }

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const name = form.getFieldValue(["personalInfo", "name"]) || "简历";
      const filename = `${name}-简历.pdf`;

      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(resultRef.current)
        .save();
    } catch (error) {
      message.error("导出失败，请重试");
    }
  };

  const tabItems = [
    {
      key: "form",
      label: "填写信息",
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            position: "前端工程师",
            education: [{}],
            experience: [{}],
            projects: [{}],
          }}
        >
          {/* 个人信息 */}
          <Card title="个人信息" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name={["personalInfo", "name"]}
                  label="姓名"
                  rules={[{ required: true, message: "请输入姓名" }]}
                >
                  <Input placeholder="请输入姓名" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name={["personalInfo", "email"]}
                  label="邮箱"
                  rules={[
                    {
                      required: true,
                      type: "email",
                      message: "请输入有效邮箱",
                    },
                  ]}
                >
                  <Input placeholder="请输入邮箱" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name={["personalInfo", "phone"]}
                  label="电话"
                  rules={[{ required: true, message: "请输入电话" }]}
                >
                  <Input placeholder="请输入电话" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name={["personalInfo", "github"]} label="GitHub">
                  <Input placeholder="GitHub 链接" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name={["personalInfo", "location"]} label="所在地">
                  <Input placeholder="城市" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="position"
                  label="目标岗位"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Option value="前端工程师">前端工程师</Option>
                    <Option value="后端工程师">后端工程师</Option>
                    <Option value="全栈工程师">全栈工程师</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* 教育背景 */}
          <Card title="教育背景" size="small" style={{ marginBottom: 16 }}>
            <Form.List name="education">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} style={{ marginBottom: 16 }}>
                      <Row gutter={16} align="middle">
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, "school"]}
                            label="学校"
                          >
                            <Input placeholder="学校名称" />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "degree"]}
                            label="学历"
                          >
                            <Select placeholder="选择学历">
                              <Option value="本科">本科</Option>
                              <Option value="硕士">硕士</Option>
                              <Option value="博士">博士</Option>
                              <Option value="大专">大专</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            {...restField}
                            name={[name, "major"]}
                            label="专业"
                          >
                            <Input placeholder="专业" />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "startDate"]}
                            label="入学时间"
                          >
                            <Input placeholder="2020-09" />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "endDate"]}
                            label="毕业时间"
                          >
                            <Input placeholder="2024-06" />
                          </Form.Item>
                        </Col>
                        <Col span={1}>
                          {fields.length > 1 && (
                            <MinusCircleOutlined onClick={() => remove(name)} />
                          )}
                        </Col>
                      </Row>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                  >
                    添加教育经历
                  </Button>
                </>
              )}
            </Form.List>
          </Card>

          {/* 工作经历 */}
          <Card title="工作经历" size="small" style={{ marginBottom: 16 }}>
            <Form.List name="experience">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div
                      key={key}
                      style={{
                        marginBottom: 16,
                        padding: 16,
                        background: "#fafafa",
                        borderRadius: 8,
                      }}
                    >
                      <Row gutter={16}>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, "company"]}
                            label="公司"
                          >
                            <Input placeholder="公司名称" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, "position"]}
                            label="职位"
                          >
                            <Input placeholder="职位名称" />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            {...restField}
                            name={[name, "startDate"]}
                            label="开始时间"
                          >
                            <Input placeholder="2022-07" />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            {...restField}
                            name={[name, "endDate"]}
                            label="结束时间"
                          >
                            <Input placeholder="至今" />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          {fields.length > 1 && (
                            <MinusCircleOutlined onClick={() => remove(name)} />
                          )}
                        </Col>
                      </Row>
                      <Form.Item
                        {...restField}
                        name={[name, "description"]}
                        label="工作描述"
                      >
                        <TextArea
                          rows={3}
                          placeholder="描述你的工作职责和成果，使用 STAR 法则，包含量化数据..."
                        />
                      </Form.Item>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                  >
                    添加工作经历
                  </Button>
                </>
              )}
            </Form.List>
          </Card>

          {/* 项目经验 */}
          <Card title="项目经验" size="small" style={{ marginBottom: 16 }}>
            <Form.List name="projects">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div
                      key={key}
                      style={{
                        marginBottom: 16,
                        padding: 16,
                        background: "#fafafa",
                        borderRadius: 8,
                      }}
                    >
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "name"]}
                            label="项目名称"
                          >
                            <Input placeholder="项目名称" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, "role"]}
                            label="担任角色"
                          >
                            <Input placeholder="如：前端负责人" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "techStack"]}
                            label="技术栈"
                          >
                            <Input placeholder="React, TypeScript, Node.js" />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          {fields.length > 1 && (
                            <MinusCircleOutlined onClick={() => remove(name)} />
                          )}
                        </Col>
                      </Row>
                      <Form.Item
                        {...restField}
                        name={[name, "description"]}
                        label="项目描述"
                      >
                        <TextArea
                          rows={2}
                          placeholder="简要描述项目背景和目标..."
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "highlights"]}
                        label="项目亮点"
                      >
                        <TextArea
                          rows={3}
                          placeholder="你的贡献和成果，使用 STAR 法则，包含量化数据（如性能提升30%）..."
                        />
                      </Form.Item>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                  >
                    添加项目经验
                  </Button>
                </>
              )}
            </Form.List>
          </Card>

          {/* 技能列表 */}
          <Card title="专业技能" size="small" style={{ marginBottom: 16 }}>
            <Form.Item name="skills">
              <TextArea
                rows={4}
                placeholder="列出你的技术技能，如：
- 前端框架：React、Vue、Next.js
- 编程语言：JavaScript、TypeScript、HTML、CSS
- 工具链：Webpack、Vite、Git
- 其他：Node.js、MySQL、Docker"
              />
            </Form.Item>
          </Card>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SendOutlined />}
              size="large"
            >
              生成简历
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "result",
      label: "生成结果",
      disabled: !result,
      children: result ? (
        <Card>
          <Space style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportPdf}
            >
              导出 PDF
            </Button>
          </Space>
          <div ref={resultRef} style={{ padding: 16, background: "#fff" }}>
            <MarkdownRenderer content={result} />
          </div>
        </Card>
      ) : null,
    },
  ];

  return (
    <div>
      <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} />
    </div>
  );
}
