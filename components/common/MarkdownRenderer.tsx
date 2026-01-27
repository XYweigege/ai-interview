"use client";

import ReactMarkdown from "react-markdown";
import { Typography } from "antd";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <Typography>
      <div className={`markdown-body ${className}`}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </Typography>
  );
}
