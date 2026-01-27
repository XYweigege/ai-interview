"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  List,
  Tag,
  Space,
  message,
  Typography,
  Divider,
  Collapse,
  Spin,
  Select,
  Dropdown,
  Tabs,
} from "antd";
import {
  SearchOutlined,
  BookOutlined,
  TagOutlined,
  StarOutlined,
  StarFilled,
  HistoryOutlined,
  DeleteOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { MarkdownRenderer } from "../common";
import { QuestionDocument } from "@/types";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  getSearchHistory,
  addSearchHistory,
  removeSearchHistoryItem,
  clearSearchHistory,
} from "@/lib/storage/localStorage";

const { Search } = Input;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface Question {
  id: string;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  companies?: string[];
}

interface HybridSearchResult {
  exactMatches: QuestionDocument[];
  ragResult: {
    documents: any[];
    answer: string;
    sources: any[];
  } | null;
  searchType: "exact" | "rag" | "hybrid";
}

export default function QuestionSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchResult, setSearchResult] = useState<HybridSearchResult | null>(
    null,
  );
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [companies, setCompanies] = useState<string[]>([]);
  const [favorites, setFavorites] = useState(getFavorites());
  const [searchHistory, setSearchHistory] = useState(getSearchHistory());

  // 筛选状态
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null,
  );
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 加载题库列表和公司列表
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch("/api/rag/search");
        const data = await response.json();
        if (data.status === "ok") {
          setQuestions(data.data.questions);
        }

        // 加载公司列表
        const companyRes = await fetch("/api/rag/search?action=companies");
        const companyData = await companyRes.json();
        if (companyData.status === "ok") {
          setCompanies(companyData.data.companies);
        }
      } catch (error) {
        console.error("Failed to load questions:", error);
      } finally {
        setLoadingQuestions(false);
      }
    };
    loadQuestions();
  }, []);

  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      message.warning("请输入搜索内容");
      return;
    }

    setLoading(true);
    setSearchResult(null);

    // 添加到搜索历史
    addSearchHistory(value);
    setSearchHistory(getSearchHistory());

    try {
      const response = await fetch("/api/rag/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: value, topK: 5 }),
      });

      const data = await response.json();
      if (data.status === "ok") {
        setSearchResult(data.data);
        message.success(
          data.data.searchType === "exact"
            ? "找到精确匹配"
            : data.data.searchType === "hybrid"
              ? "混合搜索结果"
              : "AI智能回答",
        );
      } else {
        message.error(data.error || "搜索失败");
      }
    } catch (error) {
      message.error("请求失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = (q: Question) => {
    if (isFavorite(q.id)) {
      removeFavorite(q.id);
      message.success("已取消收藏");
    } else {
      addFavorite(q);
      message.success("已添加收藏");
    }
    setFavorites(getFavorites());
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "green";
      case "medium":
        return "orange";
      case "hard":
        return "red";
      default:
        return "default";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "简单";
      case "medium":
        return "中等";
      case "hard":
        return "困难";
      default:
        return difficulty;
    }
  };

  // 按分类分组题目
  const groupedQuestions = questions.reduce(
    (acc, q) => {
      if (!acc[q.category]) {
        acc[q.category] = [];
      }
      acc[q.category].push(q);
      return acc;
    },
    {} as Record<string, Question[]>,
  );

  // 应用筛选
  const filteredQuestions = questions.filter((q) => {
    if (selectedDifficulty && q.difficulty !== selectedDifficulty) return false;
    if (selectedCompany && !q.companies?.includes(selectedCompany))
      return false;
    if (selectedCategory && q.category !== selectedCategory) return false;
    return true;
  });

  const filteredGrouped = filteredQuestions.reduce(
    (acc, q) => {
      if (!acc[q.category]) {
        acc[q.category] = [];
      }
      acc[q.category].push(q);
      return acc;
    },
    {} as Record<string, Question[]>,
  );

  return (
    <div style={{ display: "flex", gap: 24, height: "calc(100vh - 180px)" }}>
      {/* 左侧题库列表 */}
      <Card
        title={
          <Space>
            <BookOutlined />
            <span>题库</span>
            <Tag>{filteredQuestions.length} 题</Tag>
          </Space>
        }
        extra={
          <Dropdown
            menu={{
              items: [
                {
                  key: "clear",
                  label: "清除筛选",
                  onClick: () => {
                    setSelectedDifficulty(null);
                    setSelectedCompany(null);
                    setSelectedCategory(null);
                  },
                },
              ],
            }}
          >
            <Button size="small" icon={<FilterOutlined />}>
              筛选
            </Button>
          </Dropdown>
        }
        style={{ width: 380, overflowY: "auto" }}
      >
        {/* 筛选器 */}
        <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
          <Select
            placeholder="按难度筛选"
            allowClear
            style={{ width: "100%" }}
            value={selectedDifficulty}
            onChange={setSelectedDifficulty}
          >
            <Option value="easy">简单</Option>
            <Option value="medium">中等</Option>
            <Option value="hard">困难</Option>
          </Select>
          <Select
            placeholder="按公司筛选"
            allowClear
            style={{ width: "100%" }}
            value={selectedCompany}
            onChange={setSelectedCompany}
            showSearch
          >
            {companies.map((c) => (
              <Option key={c} value={c}>
                {c}
              </Option>
            ))}
          </Select>
        </Space>

        <Divider />

        {loadingQuestions ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin tip="加载题库中..." />
          </div>
        ) : (
          <Tabs
            items={[
              {
                key: "all",
                label: "全部",
                children: (
                  <Collapse
                    items={Object.entries(filteredGrouped).map(
                      ([category, qs]) => ({
                        key: category,
                        label: (
                          <Space>
                            {category}
                            <Tag>{qs.length}</Tag>
                          </Space>
                        ),
                        children: (
                          <List
                            size="small"
                            dataSource={qs}
                            renderItem={(item) => (
                              <List.Item
                                style={{ cursor: "pointer" }}
                                extra={
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={
                                      isFavorite(item.id) ? (
                                        <StarFilled
                                          style={{ color: "#faad14" }}
                                        />
                                      ) : (
                                        <StarOutlined />
                                      )
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFavoriteToggle(item);
                                    }}
                                  />
                                }
                                onClick={() => {
                                  setSearchQuery(item.question);
                                  handleSearch(item.question);
                                }}
                              >
                                <Space direction="vertical" size={4}>
                                  <Text ellipsis style={{ maxWidth: 240 }}>
                                    {item.question}
                                  </Text>
                                  <Space size={4}>
                                    <Tag
                                      color={getDifficultyColor(
                                        item.difficulty,
                                      )}
                                      // size="small"
                                    >
                                      {getDifficultyText(item.difficulty)}
                                    </Tag>
                                    {item.companies?.slice(0, 2).map((c) => (
                                      <Tag key={c}>{c}</Tag>
                                    ))}
                                  </Space>
                                </Space>
                              </List.Item>
                            )}
                          />
                        ),
                      }),
                    )}
                  />
                ),
              },
              {
                key: "favorites",
                label: (
                  <Space>
                    <StarOutlined />
                    收藏({favorites.length})
                  </Space>
                ),
                children: (
                  <List
                    size="small"
                    dataSource={favorites}
                    renderItem={(item) => (
                      <List.Item
                        style={{ cursor: "pointer" }}
                        extra={
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFavorite(item.id);
                              setFavorites(getFavorites());
                            }}
                          />
                        }
                        onClick={() => {
                          setSearchQuery(item.question);
                          handleSearch(item.question);
                        }}
                      >
                        <Space direction="vertical" size={4}>
                          <Text ellipsis style={{ maxWidth: 260 }}>
                            {item.question}
                          </Text>
                          <Tag>{item.category}</Tag>
                        </Space>
                      </List.Item>
                    )}
                  />
                ),
              },
              {
                key: "history",
                label: (
                  <Space>
                    <HistoryOutlined />
                    历史({searchHistory.length})
                  </Space>
                ),
                children: (
                  <div>
                    {searchHistory.length > 0 && (
                      <Button
                        size="small"
                        danger
                        type="link"
                        onClick={() => {
                          clearSearchHistory();
                          setSearchHistory([]);
                        }}
                        style={{ marginBottom: 8 }}
                      >
                        清空历史
                      </Button>
                    )}
                    <List
                      size="small"
                      dataSource={searchHistory}
                      renderItem={(item) => (
                        <List.Item
                          style={{ cursor: "pointer" }}
                          extra={
                            <Button
                              type="text"
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSearchHistoryItem(item.id);
                                setSearchHistory(getSearchHistory());
                              }}
                            />
                          }
                          onClick={() => {
                            setSearchQuery(item.query);
                            handleSearch(item.query);
                          }}
                        >
                          <Text ellipsis style={{ maxWidth: 280 }}>
                            {item.query}
                          </Text>
                        </List.Item>
                      )}
                    />
                  </div>
                ),
              },
            ]}
          />
        )}
      </Card>

      {/* 右侧搜索和结果 */}
      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}
      >
        {/* 搜索框 */}
        <Card>
          <Search
            placeholder="输入你的技术问题，如：什么是闭包？React Hooks 原理..."
            allowClear
            enterButton={
              <Button type="primary" icon={<SearchOutlined />}>
                智能搜索
              </Button>
            }
            size="large"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
            loading={loading}
          />
        </Card>

        {/* 搜索结果 */}
        {loading ? (
          <Card style={{ flex: 1 }}>
            <div style={{ textAlign: "center", padding: 60 }}>
              <Spin size="large" tip="正在检索和生成答案..." />
            </div>
          </Card>
        ) : searchResult ? (
          <Card
            style={{ flex: 1, overflowY: "auto" }}
            title={
              <Space>
                <TagOutlined />
                <span>搜索结果</span>
                {searchResult.searchType === "exact" && (
                  <Tag color="green">精确匹配</Tag>
                )}
                {searchResult.searchType === "rag" && (
                  <Tag color="blue">AI智能回答</Tag>
                )}
                {searchResult.searchType === "hybrid" && (
                  <Tag color="orange">混合结果</Tag>
                )}
              </Space>
            }
          >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* 精确匹配结果 */}
              {searchResult.exactMatches &&
                searchResult.exactMatches.length > 0 && (
                  <div>
                    <Title level={5}>📌 精确匹配</Title>
                    <List
                      dataSource={searchResult.exactMatches}
                      renderItem={(item) => (
                        <List.Item
                          extra={
                            <Button
                              type={isFavorite(item.id) ? "primary" : "default"}
                              icon={
                                isFavorite(item.id) ? (
                                  <StarFilled />
                                ) : (
                                  <StarOutlined />
                                )
                              }
                              onClick={() => handleFavoriteToggle(item)}
                            >
                              {isFavorite(item.id) ? "已收藏" : "收藏"}
                            </Button>
                          }
                        >
                          <List.Item.Meta
                            title={
                              <Space>
                                <Text strong>{item.question}</Text>
                                <Tag
                                  color={getDifficultyColor(item.difficulty)}
                                >
                                  {getDifficultyText(item.difficulty)}
                                </Tag>
                                {item.companies?.map((c) => (
                                  <Tag key={c}>{c}</Tag>
                                ))}
                              </Space>
                            }
                            description={
                              <div
                                style={{
                                  marginTop: 12,
                                  padding: 16,
                                  background: "#f6ffed",
                                  borderRadius: 8,
                                  border: "1px solid #b7eb8f",
                                }}
                              >
                                <MarkdownRenderer content={item.answer} />
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                    {searchResult.ragResult && <Divider />}
                  </div>
                )}

              {/* AI 回答 */}
              {searchResult.ragResult && (
                <>
                  <div>
                    <Title level={5}>🤖 AI 综合回答</Title>
                    <div
                      style={{
                        background: "#e6f7ff",
                        padding: 16,
                        borderRadius: 8,
                        border: "1px solid #91d5ff",
                      }}
                    >
                      <MarkdownRenderer
                        content={searchResult.ragResult.answer}
                      />
                    </div>
                  </div>

                  <Divider />

                  {/* 参考来源 */}
                  <div>
                    <Title level={5}>📚 参考来源</Title>
                    <List
                      dataSource={searchResult.ragResult.sources}
                      renderItem={(source, index) => (
                        <List.Item>
                          <Space>
                            <Tag color="blue">[{index + 1}]</Tag>
                            <Text>{source.title}</Text>
                            <Tag color="green">
                              相关度: {(source.relevance * 100).toFixed(0)}%
                            </Tag>
                          </Space>
                        </List.Item>
                      )}
                    />
                  </div>

                  {/* 相关文档 */}
                  <div>
                    <Title level={5}>📄 相关文档</Title>
                    <Collapse
                      items={searchResult.ragResult.documents.map(
                        (doc, index) => ({
                          key: index,
                          label: (
                            <Space>
                              <Tag color="purple">{doc.metadata.category}</Tag>
                              <Tag
                                color={getDifficultyColor(
                                  doc.metadata.difficulty,
                                )}
                              >
                                {getDifficultyText(doc.metadata.difficulty)}
                              </Tag>
                              <Text type="secondary">
                                相关度: {(doc.metadata.score * 100).toFixed(0)}%
                              </Text>
                            </Space>
                          ),
                          children: (
                            <Paragraph
                              style={{
                                whiteSpace: "pre-wrap",
                                background: "#fafafa",
                                padding: 12,
                                borderRadius: 4,
                              }}
                            >
                              {doc.content}
                            </Paragraph>
                          ),
                        }),
                      )}
                    />
                  </div>
                </>
              )}
            </Space>
          </Card>
        ) : (
          <Card style={{ flex: 1 }}>
            <div style={{ textAlign: "center", padding: 60 }}>
              <SearchOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
              <Title level={4} type="secondary" style={{ marginTop: 16 }}>
                输入问题开始搜索
              </Title>
              <Text type="secondary">
                支持自然语言提问，如"React Hooks 原理是什么？"
              </Text>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
