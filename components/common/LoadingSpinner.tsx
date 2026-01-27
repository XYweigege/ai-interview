"use client";

import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

interface LoadingSpinnerProps {
  tip?: string;
  size?: "small" | "default" | "large";
}

export default function LoadingSpinner({
  tip = "加载中...",
  size = "default",
}: LoadingSpinnerProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 0",
      }}
    >
      <Spin
        indicator={
          <LoadingOutlined
            style={{ fontSize: size === "large" ? 48 : 24 }}
            spin
          />
        }
        tip={tip}
        size={size}
      />
    </div>
  );
}
