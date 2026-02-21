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

export default async function GroupDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ groupId?: string; year?: string }>;
}) {
  const params = await searchParams;
  const parsedYear = Number(params.year);
  const year = Number.isFinite(parsedYear) ? parsedYear : new Date().getFullYear();

  const data = await getOwnedGroupInsights({
    year,
    groupId: params.groupId,
  });

  if (!data) {
    redirect("/login");
  }
  if (data.isMemberOnly) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Group Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Personal + family transactions overview for group admins.
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
            <CardTitle>No Groups Yet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600">
              You have not created a family group yet. Create a group to start
              tracking family member transactions together.
            </p>
            <Button asChild>
              <Link href="/groups/new">Create Group</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">Selected Group</p>
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

          <CashflowChart
            title={`My Personal Cashflow (${data.year})`}
            annualCashflow={data.personalAnnualCashflow}
          />

          <Card>
            <CardHeader>
              <CardTitle>My Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {data.personalRecentTransactions.length === 0 ? (
                <p className="text-sm text-slate-600">
                  No personal transactions found.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.personalRecentTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          {tx.transactionDate
                            ? format(new Date(tx.transactionDate), "dd MMM yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell>{tx.description || "-"}</TableCell>
                        <TableCell>{tx.category}</TableCell>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <CashflowChart
            title={`Group Cashflow (${data.year})`}
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
                          <div className="flex flex-col">
                            <span className="font-medium">{member.name}</span>
                            <span className="text-xs text-slate-500">
                              {member.email}
                            </span>
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
              <CardTitle>Group Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {data.groupRecentTransactions.length === 0 ? (
                <p className="text-sm text-slate-600">
                  No transactions found for this group.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
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
