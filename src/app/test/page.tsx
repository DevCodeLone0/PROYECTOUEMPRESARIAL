"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import TestWizard from "@/components/test/TestWizard";
import LeadFormStep from "@/components/lead/LeadFormStep";

function TestPageContent() {
  const searchParams = useSearchParams();
  const step = searchParams.get("step");

  if (step === "form") {
    return <LeadFormStep />;
  }

  return <TestWizard />;
}

export default function TestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#111111]" />}>
      <TestPageContent />
    </Suspense>
  );
}
