import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { getTransactionsByMonth } from "@/data/getTransactionsByMonth";
import { format } from "date-fns";
import { PencilIcon } from "lucide-react";
import Link from "next/link";
import z from "zod";
import numeral from "numeral";
import { Badge } from "@/components/ui/badge";
import Filters from "./filters";
import { getTransactionYearsRange } from "@/data/getTransactionYearsRange";

const today = new Date();
const searchSchema = z.object({
  year: z.coerce
    .number()
    .min(today.getFullYear() - 100)
    .max(today.getFullYear() + 1)
    .catch(today.getFullYear()),
  month: z.coerce
    .number()
    .min(1)
    .max(12)
    .catch(today.getMonth() + 1),
});
const TransactionsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
}) => {
  const searchParamsData = await searchParams;
  const { month, year } = searchSchema.parse(searchParamsData);
  const selectedDate = new Date(year, month - 1, 1);

  const transactions = await getTransactionsByMonth({ year, month });
  const yearsRange = await getTransactionYearsRange();

  return (
    <div className="max-w-7xl mx-auto py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Transactions</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card className="mt-8 p-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{format(selectedDate, "MMM yyyy")} Transactions</span>
            <Filters year={year} month={month} yearsRange={yearsRange} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/transactions/new">New Transaction</Link>
          </Button>
          {transactions?.length === 0 && (
            <p className="text-center py-10 text-lg text-muted-foreground">
              No transactions found for this month.
            </p>
          )}
          {!!transactions?.length && (
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {transaction.transactionDate
                        ? format(
                            new Date(transaction.transactionDate),
                            "do MMM yyyy"
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
                        }>
                        {transaction.transactionType}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>
                      {"₹" + numeral(transaction.amount).format("0,0[.]00")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        asChild
                        size="icon"
                        aria-label="Edit Transaction">
                        <Link
                          href={`/dashboard/transactions/${transaction.id}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPage;
