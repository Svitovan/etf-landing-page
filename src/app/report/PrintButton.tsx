"use client";

import React from "react";

export const PrintButton: React.FC = () => {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn-primary"
      style={{ fontSize: "0.85rem", padding: "0.45rem 1rem", minHeight: "40px" }}
      id="print-report-button"
    >
      🖨️ Vytisknout / Uložit do PDF
    </button>
  );
};
