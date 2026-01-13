import { db } from "@/db";
import { categoriesTable, transactionsTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, sql, sum } from "drizzle-orm";
import "server-only";

export async function getAnnualCashflow(year: number) {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const month = sql`EXTRACT(MONTH FROM ${transactionsTable.transactionDate})`;

  const cashflow = await db
    .select({
      month,
      totalIncome: sum(
        sql`CASE WHEN ${categoriesTable.type} = 'income' THEN ${transactionsTable.amount} ELSE 0 END`
      ),
      totalExpense: sum(
        sql`CASE WHEN ${categoriesTable.type} = 'expense' THEN ${transactionsTable.amount} ELSE 0 END`
      ),
    })
    .from(transactionsTable)
    .leftJoin(
      categoriesTable,
      eq(transactionsTable.categoryId, categoriesTable.id)
    )
    .where(
      and(
        eq(transactionsTable.userId, userId),
        sql`EXTRACT(YEAR FROM ${transactionsTable.transactionDate}) = ${year}`
      )
    )
    .groupBy(month)
    .orderBy(month);

  const annualCashflow: {
    month: number;
    totalIncome: number;
    totalExpenses: number;
  }[] = [];

  for (let m = 1; m <= 12; m++) {
    const monthlyCashflow = cashflow.find((c) => Number(c.month) === m);
    annualCashflow.push({
      month: m,
      totalIncome: Number(monthlyCashflow?.totalIncome) || 0,
      totalExpenses: Number(monthlyCashflow?.totalExpense) || 0,
    });
  }

  return annualCashflow;
}
