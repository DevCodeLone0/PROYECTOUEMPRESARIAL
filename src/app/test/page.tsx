"use client";

import TestWizard from "@/components/test/TestWizard";
import LeadFormStep from "@/components/lead/LeadFormStep";

export default function TestPage() {
  // Check if we're on the form step
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("step") === "form") {
      return <LeadFormStep />;
    }
  }

  return <TestWizard />;
}
