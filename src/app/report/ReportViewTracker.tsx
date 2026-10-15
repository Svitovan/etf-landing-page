"use client";

import React, { useEffect, useRef } from "react";
import { trackEvent } from "../../lib/analytics-client";

interface ReportViewTrackerProps {
  amount: number;
  etfs: string;
}

export const ReportViewTracker: React.FC<ReportViewTrackerProps> = ({ amount, etfs }) => {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current) {
      trackedRef.current = true;
      trackEvent("report_opened", { amount, etfs });
    }
  }, [amount, etfs]);

  return null;
};
