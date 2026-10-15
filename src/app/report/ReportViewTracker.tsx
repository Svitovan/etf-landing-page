"use client";

import React, { useEffect, useRef } from "react";
import { trackEvent } from "../../lib/analytics-client";

interface ReportViewTrackerProps {
  selectedEtfs: string;
}

export const ReportViewTracker: React.FC<ReportViewTrackerProps> = ({ selectedEtfs }) => {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current) {
      trackedRef.current = true;
      trackEvent("report_opened", { selectedEtfs });
    }
  }, [selectedEtfs]);

  return null;
};
