"use client";

import { useSearchParams } from "next/navigation";

export default function PricingStatusBanner() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const plan = searchParams.get("plan");

  if (status !== "success" && status !== "cancelled") {
    return null;
  }

  if (status === "success") {
    return (
      <div className="mb-8 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
        Payment successful. Your {plan === "pro" ? "Pro" : "Base"} plan is now
        active.
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-xl border border-amber-300/35 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
      Checkout was cancelled. You can select a plan anytime.
    </div>
  );
}
