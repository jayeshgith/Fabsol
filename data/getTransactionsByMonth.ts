import { db } from "@/db";
import { categoriesTable, transactionsTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import "server-only";

export async function getTransactionsByMonth({
  year,
  month,
}: {
  year: number;
  month: number;
}) {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const earliestDate = new Date(year, month - 1, 1).toISOString();
  const latestDate = new Date(year, month, 0).toISOString();

  const transactions = await db
    .select({
      id: transactionsTable.id,
      description: transactionsTable.description,
      amount: transactionsTable.amount,
      transactionDate: transactionsTable.transactionDate,
      category: categoriesTable.name,
      transactionType: categoriesTable.type,
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.userId, userId),
        gte(transactionsTable.transactionDate, earliestDate),
        lte(transactionsTable.transactionDate, latestDate)
      )
    )
    .orderBy(desc(transactionsTable.transactionDate))
    .leftJoin(
      categoriesTable,
      eq(transactionsTable.categoryId, categoriesTable.id)
    );

  return transactions;
}
