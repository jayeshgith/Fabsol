"use client";

import Link from "next/link";
import { Fragment } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const PATH_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  groups: "Groups",
  new: "New",
  edit: "Edit",
  account: "Account",
  profile: "Profile",
  pricing: "Pricing",
  "complete-profile": "Complete Profile",
  login: "Login",
  signup: "Sign Up",
  "forgot-password": "Forgot Password",
  "reset-password": "Reset Password",
  notification: "Notifications",
};

function formatSegment(segment: string) {
  const decoded = decodeURIComponent(segment);

  if (PATH_LABELS[decoded]) {
    return PATH_LABELS[decoded];
  }

  // Hide technical ids from breadcrumbs and present a user-friendly label.
  if (/^[0-9a-f]{16,}$/i.test(decoded)) {
    return "Details";
  }

  return decoded
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function AppBreadcrumbs() {
  const pathname = usePathname();
  const router = useRouter();

  // These routes already have detailed page-level breadcrumbs.
  if (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/transactions") ||
    pathname === "/groups/dashboard"
  ) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  const crumbs = [{ href: "/", label: "Home" }];
  let currentPath = "";

  for (const segment of segments) {
    currentPath += `/${segment}`;
    crumbs.push({
      href: currentPath,
      label: formatSegment(segment),
    });
  }

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <div className="border-b border-white/10 bg-slate-950/65">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-6 py-3 text-white sm:px-8">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          title="Go back"
          className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm font-semibold transition hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;

              return (
                <Fragment key={crumb.href}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="text-white">{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href} className="text-slate-200 hover:text-white">
                          {crumb.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast ? <BreadcrumbSeparator /> : null}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
