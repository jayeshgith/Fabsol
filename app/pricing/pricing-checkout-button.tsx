"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type PricingCheckoutButtonProps = {
  planId: "base" | "pro";
  cta: string;
};

type CheckoutResponse = {
  url?: string;
  error?: string;
  loginUrl?: string;
};

export default function PricingCheckoutButton({
  planId,
  cta,
}: PricingCheckoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleCheckout() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      const data = (await res.json().catch(() => ({}))) as CheckoutResponse;

      if (res.status === 401 && data.loginUrl) {
        router.push(data.loginUrl);
        return;
      }

      if (!res.ok || !data.url) {
        toast.error(data.error || "Could not start checkout.");
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error("Could not start checkout.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={isLoading}
      className="mt-7 w-full rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? "Redirecting..." : cta}
    </button>
  );
}
