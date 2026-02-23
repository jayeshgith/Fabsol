import RecentTransactions from "./recent-transactions";
import CashFlow from "./transactions/cashflow";
import Link from "next/link";
import { UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { getGroupAccessByEmail } from "@/lib/group-access";

const DashboardPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ cfyear: string }>;
}) => {
  const today = new Date();
  let cfyear = Number(
    (await searchParams).cfyear || today.getFullYear().toString()
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

  return (
    <div className="max-w-7xl mx-auto py-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
        <h1 className="text-4xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
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
        scope="personal"
        title="My Personal Cash Flow"
        showFilters
      />
      <RecentTransactions
        scope="personal"
        title="My Personal Recent Transactions"
        showActions
      />

      {hasFamilyMembership ? (
        <>
          <CashFlow
            year={cfyear}
            scope="family"
            title="My Family Transaction Cash Flow"
            showFilters={false}
          />
          <RecentTransactions
            scope="family"
            title="My Family Transaction History"
            showActions={false}
            showRowActions
          />
        </>
      ) : null}
    </div>
  );
};

export default DashboardPage;
