"use client";
import { Suspense } from "react";
import CreateBatchSoalInner from "./CreateBatchSoalInner";

export default function CreateBatchSoalPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-600">Loading...</div>}>
      <CreateBatchSoalInner />
    </Suspense>
  );
}
