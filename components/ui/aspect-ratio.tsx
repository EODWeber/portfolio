import * as React from "react";

export function AspectRatio({
  ratio = 16 / 9,
  children,
  className,
}: {
  ratio?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const paddingTop = `${100 / ratio}%`;
  return (
    <div className={className} style={{ position: "relative", width: "100%" }}>
      <div style={{ paddingTop }} />
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
    </div>
  );
}
