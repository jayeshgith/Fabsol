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
import { getRecentTransactions } from "@/data/getRecentTransactions";
import { format } from "date-fns";
import Link from "next/link";
import numeral from "numeral";
import TransactionRowActions from "./transaction-row-actions";

const RecentTransactions = async ({
  scope = "personal",
  title = "Recent Transactions",
  showActions = true,
  showRowActions = false,
}: {
  scope?: "personal" | "family";
  title?: string;
  showActions?: boolean;
  showRowActions?: boolean;
}) => {
  const recentTransactions = await getRecentTransactions({ scope });
  const emptyMessage =
    scope === "family"
      ? "You have no family transactions yet. Start by creating a new family transaction."
      : "You have no transactions yet. Start by creating a new transaction.";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {showActions ? (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/transactions">View All</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/transactions/new">Create New</Link>
              </Button>
            </div>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentTransactions?.length === 0 && (
          <p className="py-10 text-center text-lg text-muted-foreground">
            {emptyMessage}
          </p>
        )}
        {!!recentTransactions?.length && (
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                {showRowActions ? (
                  <TableHead className="text-right">Actions</TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions?.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {transaction.transactionDate
                      ? format(
                          new Date(transaction.transactionDate),
                          "do MMM yyyy",
                        )
                      : "-"}
                  </TableCell>
                  <TableCell>{transaction.description || "-"}</TableCell>
                  <TableCell className="capitalize">
                    <Badge
                      className={
                        transaction.transactionType === "income"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }
                    >
                      {transaction.transactionType}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>
                    INR {numeral(transaction.amount).format("0,0[.]00")}
                  </TableCell>
                  {showRowActions ? (
                    <TableCell className="text-right">
                      <TransactionRowActions transactionId={transaction.id} />
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
