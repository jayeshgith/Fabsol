import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOwnedGroupInsights } from "@/data/getOwnedGroupInsights";
import { format } from "date-fns";
import numeral from "numeral";
import CashflowChart from "./cashflow-chart";
import GroupFilters from "./filters";
import GroupManagement from "./group-management";
import RecentTransactionsFilters from "./recent-transactions-filters";
import TransactionRowActionsClient from "../../dashboard/transaction-row-actions.client";

export default async function GroupDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    groupId?: string;
    year?: string;
    txScope?: string;
    txMonth?: string;
    txYear?: string;
    txDate?: string;
    txRange?: string;
  }>;
}) {
  const params = await searchParams;
  const parsedYear = Number(params.year);
  const year = Number.isFinite(parsedYear) ? parsedYear : new Date().getFullYear();
  const parsedTxMonth = Number(params.txMonth);
  const txScope = params.txScope === "family" ? "family" : "all";
  const txMonth =
    Number.isInteger(parsedTxMonth) && parsedTxMonth >= 1 && parsedTxMonth <= 12
      ? parsedTxMonth
      : undefined;
  const parsedTxYear = Number(params.txYear);
  const txYear = Number.isInteger(parsedTxYear) && parsedTxYear > 1900 ? parsedTxYear : undefined;
  const txDate =
    typeof params.txDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.txDate)
      ? params.txDate
      : undefined;
  const txRange = params.txRange === "all" ? "all" : undefined;

  const data = await getOwnedGroupInsights({
    year,
    groupId: params.groupId,
    recentScope: txScope,
    recentMonth: txMonth,
    recentYear: txYear,
    recentDate: txDate,
    recentRange: txRange,
  });

  if (!data) {
    redirect("/login");
  }
  if (data.isMemberOnly) {
    redirect("/dashboard");
  }

  const familyIncome = data.groupAnnualCashflow.reduce(
    (sum, item) => sum + item.totalIncome,
    0,
  );
  const familyExpenses = data.groupAnnualCashflow.reduce(
    (sum, item) => sum + item.totalExpenses,
    0,
  );
  const familyBalance = familyIncome - familyExpenses;

  return (
    <div className="mx-auto max-w-7xl space-y-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Society Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Society transactions overview for society heads/admins.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Main Dashboard</Link>
          </Button>
        </div>
      </div>

      {data.groups.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Society Yet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600">
              You have not created a society yet. Create a society to start
              tracking society member transactions together.
            </p>
            <Button asChild>
              <Link href="/groups/new">Create Society</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">Selected Society</p>
                <h2 className="text-xl font-semibold">{data.selectedGroupName}</h2>
              </div>
              <GroupFilters
                groups={data.groups}
                selectedGroupId={data.selectedGroupId}
                year={data.year}
                yearsRange={data.yearsRange}
              />
            </div>
            <GroupManagement
              groupId={data.selectedGroupId}
              groupName={data.selectedGroupName}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Society A/C ({data.year})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-700">Income</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-800">
                    INR {numeral(familyIncome).format("0,0[.]00")}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-300 bg-white p-4 text-center">
                  <p className="text-sm text-slate-600">Remaining Amount</p>
                  <p
                    className={
                      familyBalance >= 0
                        ? "mt-1 text-2xl font-bold text-green-700"
                        : "mt-1 text-2xl font-bold text-red-700"
                    }
                  >
                    INR {numeral(familyBalance).format("0,0[.]00")}
                  </p>
                </div>

                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm text-rose-700">Expenses</p>
                  <p className="mt-1 text-2xl font-bold text-rose-800">
                    INR {numeral(familyExpenses).format("0,0[.]00")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <CashflowChart
            title={`Society Cashflow (${data.year})`}
            annualCashflow={data.groupAnnualCashflow}
          />

          <Card>
            <CardHeader>
              <CardTitle>Member Summary ({data.year})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Income</TableHead>
                    <TableHead>Expenses</TableHead>
                    <TableHead>Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.memberSummaries.map((member) => {
                    const balance = member.totalIncome - member.totalExpenses;
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {member.image ? (
                              <img
                                src={member.image}
                                alt={member.name || "Member"}
                                className="h-9 w-9 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-semibold border border-slate-300">
                                {member.name?.trim()?.charAt(0)?.toUpperCase() || "M"}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-medium">{member.name}</span>
                              <span className="text-xs text-slate-500">
                                {member.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{member.phone || "-"}</TableCell>
                        <TableCell>
                          INR {numeral(member.totalIncome).format("0,0[.]00")}
                        </TableCell>
                        <TableCell>
                          INR {numeral(member.totalExpenses).format("0,0[.]00")}
                        </TableCell>
                        <TableCell
                          className={
                            balance >= 0 ? "text-green-600" : "text-red-600"
                          }
                        >
                          INR {numeral(balance).format("0,0[.]00")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <CardTitle>Society Recent Transactions</CardTitle>
                <RecentTransactionsFilters
                  yearsRange={data.yearsRange}
                  scope={txScope}
                  month={txMonth}
                  year={txYear}
                  date={txDate}
                />
              </div>
            </CardHeader>
            <CardContent>
              {data.groupRecentTransactions.length === 0 ? (
                <p className="text-sm text-slate-600">
                  No transactions found for this society.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>History</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.groupRecentTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          {tx.transactionDate
                            ? format(new Date(tx.transactionDate), "dd MMM yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{tx.memberName}</span>
                            <span className="text-xs text-slate-500">
                              {tx.memberEmail}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{tx.description || "-"}</TableCell>
                        <TableCell>{tx.category}</TableCell>
                        <TableCell className="capitalize">
                          <Badge
                            variant={
                              tx.accountScope === "family"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {tx.accountScope === "family" ? "Society" : "Personal"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              tx.transactionType === "income"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }
                          >
                            {tx.transactionType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          INR {numeral(tx.amount).format("0,0[.]00")}
                        </TableCell>
                        <TableCell className="text-right">
                          {tx.accountScope === "family" ? (
                            <TransactionRowActionsClient transactionId={tx.id} />
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
