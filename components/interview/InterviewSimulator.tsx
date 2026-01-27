"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  Select,
  Space,
  message,
  Steps,
  Typography,
  Divider,
  Avatar,
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  RobotOutlined,
  PlayCircleOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import { MarkdownRenderer } from "../common";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface Message {
  role: "interviewer" | "candidate";
  content: string;
  stage?: string;
}

const stageLabels: Record<string, string> = {
  introduction: "自我介绍",
  tech_basics: "技术基础",
  framework: "框架原理",
  project_deep_dive: "项目深挖",
  coding: "手撕代码",
  cs_fundamentals: "计算机基础",
  questions: "提问环节",
  summary: "总结",
};

const stageItems = Object.entries(stageLabels).map(([key, title]) => ({
  title,
  key,
}));

export default function InterviewSimulator() {
  const [position, setPosition] = useState("前端工程师");
  const [level, setLevel] = useState<"junior" | "mid" | "senior">("mid");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStage, setCurrentStage] = useState("introduction");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;

      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = "zh-CN";
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsRecording(false);
        };

        recognitionRef.current.onerror = () => {
          message.error("语音识别失败，请重试");
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleStartInterview = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position, level }),
      });

      const data = await response.json();
      if (data.status === "ok") {
        setSessionId(data.data.sessionId);
        setCurrentStage(data.data.stage);
        setMessages([
          {
            role: "interviewer",
            content: data.data.message,
            stage: data.data.stage,
          },
        ]);
        message.success("面试开始！");
      } else {
        message.error(data.error || "启动失败");
      }
    } catch (error) {
      message.error("请求失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage: Message = {
      role: "candidate",
      content: input,
      stage: currentStage,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answer: input }),
      });

      const data = await response.json();
      if (data.status === "ok") {
        setCurrentStage(data.data.stage);
        const interviewerMessage = {
          role: "interviewer" as const,
          content: data.data.response,
          stage: data.data.stage,
        };
        setMessages((prev) => [...prev, interviewerMessage]);

        // 语音模式下自动播报面试官的回答
        if (isVoiceMode && synthRef.current) {
          speakText(data.data.response);
        }

        if (data.data.isComplete) {
          setIsComplete(true);
          message.success("面试结束！");
        }
      } else {
        message.error(data.error || "处理失败");
      }
    } catch (error) {
      message.error("请求失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getCurrentStageIndex = () => {
    return Object.keys(stageLabels).indexOf(currentStage);
  };

  const startRecording = () => {
    if (!recognitionRef.current) {
      message.warning("您的浏览器不支持语音识别，请使用 Chrome 或 Edge 浏览器");
      return;
    }
    try {
      setIsRecording(true);
      recognitionRef.current.start();
    } catch (error) {
      message.error("启动语音识别失败");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const speakText = (text: string) => {
    if (!synthRef.current) return;

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  if (!sessionId) {
    return (
      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={4}>开始模拟面试</Title>
          <Text type="secondary">
            选择目标岗位和级别，开始一场完整的技术面试模拟。面试将包括自我介绍、技术基础、框架原理、项目深挖、计算机基础等环节。
          </Text>

          <Divider />

          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Space size="large" wrap>
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
                  <Option value="junior">初级 (1-3年)</Option>
                  <Option value="mid">中级 (3-5年)</Option>
                  <Option value="senior">高级 (5年+)</Option>
                </Select>
              </Space>
              <Space>
                <Text>交互模式：</Text>
                <Select
                  value={isVoiceMode ? "voice" : "text"}
                  onChange={(val) => setIsVoiceMode(val === "voice")}
                  style={{ width: 120 }}
                >
                  <Option value="text">文字输入</Option>
                  <Option value="voice">语音对话</Option>
                </Select>
              </Space>
            </Space>
            {isVoiceMode && (
              <Text type="warning" style={{ fontSize: 12 }}>
                💡 语音模式需要使用 Chrome 或 Edge 浏览器，并授予麦克风权限
              </Text>
            )}
          </Space>

          <Button
            type="primary"
            size="large"
            icon={<PlayCircleOutlined />}
            onClick={handleStartInterview}
            loading={loading}
          >
            开始面试
          </Button>
        </Space>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", gap: 16, height: "calc(100vh - 180px)" }}>
      {/* 左侧进度 */}
      <Card style={{ width: 200, flexShrink: 0 }}>
        <Title level={5}>面试进度</Title>
        <Steps
          direction="vertical"
          size="small"
          current={getCurrentStageIndex()}
          items={stageItems}
        />
      </Card>

      {/* 右侧聊天区域 */}
      <Card style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            marginBottom: 16,
            padding: "0 8px",
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent:
                  msg.role === "candidate" ? "flex-end" : "flex-start",
                marginBottom: 16,
              }}
            >
              <Space align="start">
                {msg.role === "interviewer" && (
                  <Avatar
                    icon={<RobotOutlined />}
                    style={{ backgroundColor: "#1677ff" }}
                  />
                )}
                <div
                  className={`chat-bubble ${msg.role}`}
                  style={{
                    maxWidth: 600,
                    background:
                      msg.role === "candidate" ? "#e6f4ff" : "#f5f5f5",
                    padding: "12px 16px",
                    borderRadius: 12,
                  }}
                >
                  <MarkdownRenderer content={msg.content} />
                </div>
                {msg.role === "candidate" && (
                  <Avatar
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#52c41a" }}
                  />
                )}
              </Space>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", marginBottom: 16 }}>
              <Avatar
                icon={<RobotOutlined />}
                style={{ backgroundColor: "#1677ff" }}
              />
              <div className="typing-indicator" style={{ marginLeft: 8 }}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        {!isComplete ? (
          <div>
            {isVoiceMode && (
              <div
                style={{
                  marginBottom: 8,
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <Button
                  type={isRecording ? "primary" : "default"}
                  danger={isRecording}
                  icon={
                    isRecording ? <AudioMutedOutlined /> : <AudioOutlined />
                  }
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={loading}
                >
                  {isRecording ? "停止录音" : "开始录音"}
                </Button>
                {isSpeaking && (
                  <Button
                    type="default"
                    icon={<SoundOutlined />}
                    onClick={stopSpeaking}
                  >
                    停止播报
                  </Button>
                )}
                {isRecording && <Text type="danger">● 正在录音...</Text>}
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isVoiceMode
                    ? "点击上方按钮开始录音，或手动输入..."
                    : "输入你的回答... (Enter 发送，Shift+Enter 换行)"
                }
                autoSize={{ minRows: 2, maxRows: 6 }}
                disabled={loading}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                loading={loading}
                disabled={!input.trim()}
              >
                发送
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 16 }}>
            <Text type="success">面试已结束，请查看上方的面试报告。</Text>
          </div>
        )}
      </Card>
    </div>
  );
}
