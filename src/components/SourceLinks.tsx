import React from "react";
import type { Evidence } from "../types/etf";

export function SourceLinks({ evidence }: { evidence: Evidence[] }) {
  const unique = evidence.filter((source, index) => evidence.findIndex(other => other.url === source.url) === index);
  return (
    <span style={{ display: "block", fontSize: "0.8rem", marginTop: "0.4rem", overflowWrap: "anywhere" }}>
      Zdroje: {unique.map((source, index) => (
        <span key={source.url}>
          {index > 0 && " · "}
          <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>
        </span>
      ))}
    </span>
  );
}
