import RecentTransactions from "./recent-transactions";
import CashFlow from "./transactions/cashflow";
import Link from "next/link";
import { UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { getGroupAccessByEmail } from "@/lib/group-access";
import TransactionTypeFilter from "./transaction-type-filter";

const DashboardPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ cfyear?: string; scope?: string }>;
}) => {
  const params = await searchParams;
  const today = new Date();
  let cfyear = Number(
    params.cfyear || today.getFullYear().toString()
  );
  if (!cfyear || isNaN(cfyear)) {
    cfyear = today.getFullYear();
  }

  const session = await auth();
  let hasOwnedGroups = false;
  let hasFamilyMembership = false;

  if (session?.user?.email) {
    const groupAccess = await getGroupAccessByEmail(session.user.email);
    hasOwnedGroups = groupAccess?.hasOwnedGroups ?? false;
    hasFamilyMembership =
      (groupAccess?.hasOwnedGroups ?? false) ||
      (groupAccess?.isMemberInOtherGroup ?? false);
  }

  const selectedScope: "personal" | "family" =
    params.scope === "family" && hasFamilyMembership ? "family" : "personal";
  const isFamilyScope = selectedScope === "family";

  return (
    <div className="max-w-7xl mx-auto py-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
        <h1 className="text-4xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          {hasFamilyMembership ? (
            <TransactionTypeFilter value={selectedScope} />
          ) : null}
          {hasOwnedGroups ? (
            <Button variant="outline" asChild className="gap-2">
              <Link href="/groups/dashboard">
                <UsersRound className="h-4 w-4" />
                Group Dashboard
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
      <CashFlow
        year={cfyear}
        scope={selectedScope}
        title={
          isFamilyScope ? "Family Transaction Cash Flow" : "Personal Cash Flow"
        }
        showFilters={!isFamilyScope}
      />
      <RecentTransactions
        scope={selectedScope}
        title={
          isFamilyScope
            ? "Family Recent Transactions"
            : "Personal Recent Transactions"
        }
        showActions
        showRowActions
        viewAllHref={
          isFamilyScope
            ? "/dashboard/transactions?scope=family"
            : "/dashboard/transactions"
        }
        createHref={
          isFamilyScope
            ? "/dashboard/transactions/new?scope=family"
            : "/dashboard/transactions/new"
        }
      />
    </div>
  );
};

export default DashboardPage;
