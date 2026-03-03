"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function PricingBackButton() {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <div className="border-b border-white/10 bg-slate-950/65">
      <div className="mx-auto w-full max-w-7xl px-6 py-3 sm:px-10">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          title="Go back"
          className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
