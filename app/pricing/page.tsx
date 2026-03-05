import Link from "next/link";
import { LandmarkIcon, Check, UserRound } from "lucide-react";
import { auth } from "@/auth";
import { BILLING_PLANS } from "@/lib/billing-plans";
import PricingCheckoutButton from "./pricing-checkout-button";
import PricingStatusBanner from "./pricing-status-banner";
import PricingBackButton from "./pricing-back-button";

export default async function PricingPage() {
  const session = await auth();
  const dashboardHref = session?.user ? "/dashboard" : "/login?callbackUrl=%2Fpricing";
  const dashboardLabel = session?.user ? "Go to Dashboard" : "Sign In";

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute -left-16 top-16 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-64 h-96 w-96 rounded-full bg-lime-500/15 blur-3xl" />

      <nav className="relative z-40 mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 sm:px-10">
        <Link href="/" className="flex items-center gap-2 text-3xl font-bold">
          <LandmarkIcon className="text-lime-500" />
          PinTrust
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
          >
            Home
          </Link>
          <Link
            href={dashboardHref}
            className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
          >
            {dashboardLabel}
          </Link>
        </div>
      </nav>
      <PricingBackButton />

      <section className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-10">
        <div className="text-center">
          <p className="inline-flex rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200">
            Pricing
          </p>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-tight sm:text-6xl">
            Plans for Individuals and Societies
          </h1>
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          <PricingStatusBanner />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {BILLING_PLANS.map((plan) => {
            const isPro = plan.id === "pro";

            return (
              <article
                key={plan.id}
                className={`rounded-2xl border p-6 backdrop-blur-xl ${
                  isPro
                    ? "border-emerald-300/50 bg-gradient-to-b from-emerald-400/10 to-slate-900/70 shadow-[0_0_80px_-35px_rgba(52,211,153,0.45)]"
                    : "border-white/20 bg-slate-900/75"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-4xl font-bold">{plan.name}</h2>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      isPro
                        ? "border-emerald-300/50 bg-emerald-400/20 text-emerald-100"
                        : "border-white/20 bg-white/10 text-white"
                    }`}
                  >
                    {plan.tag}
                  </span>
                </div>

                <p className="mt-4 text-lg text-slate-200">{plan.description}</p>

                <div className="mt-5 rounded-xl border border-white/15 bg-slate-950/70 p-5">
                  <p className="text-5xl font-bold">{plan.amountLabel}</p>
                  <p className="mt-2 text-sm uppercase tracking-[0.22em] text-slate-400">
                    Billed Monthly
                  </p>
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-slate-100"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-300/20 text-emerald-200">
                        <Check className="h-4 w-4" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <PricingCheckoutButton planId={plan.id} cta={plan.cta} />
                <p className="mt-3 text-center text-sm text-slate-300">{plan.note}</p>
              </article>
            );
          })}
        </div>

        <p className="mt-12 flex items-center justify-center gap-2 text-center text-base text-slate-200/90">
          <UserRound className="h-5 w-5 text-emerald-300" />
          After payment, your plan is activated immediately in your account.
        </p>
      </section>
    </main>
  );
}
