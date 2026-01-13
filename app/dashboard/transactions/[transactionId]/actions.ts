"use server";

import { db } from "@/db";
import { transactionsTable } from "@/db/schema";
import { transactionSchema } from "@/lib/validators/transactionSchema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

const updateTransactionSchema = transactionSchema.and(
  z.object({
    id: z.number(),
  })
);

export async function updateTransactionAction(data: {
  id: number;
  amount: number;
  categoryId: number;
  transactionDate: string;
  description: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      message: "User not authenticated.",
    };
  }

  const parsedData = updateTransactionSchema.safeParse(data);

  console.log("Parsed data for update:", parsedData);

  if (!parsedData.success) {
    return {
      success: false,
      message: parsedData.error.issues[0].message,
    };
  }

  console.log("Updating transaction with data:", parsedData.data);

  await db
    .update(transactionsTable)
    .set({
      description: parsedData.data.description,
      amount: parsedData.data.amount.toString(),
      categoryId: parsedData.data.categoryId,
      transactionDate: new Date(parsedData.data.transactionDate).toISOString(),
    })
    .where(
      and(
        eq(transactionsTable.id, parsedData.data.id),
        eq(transactionsTable.userId, userId)
      )
    );

  console.log("Transaction updated successfully:", parsedData.data.id);

  return {
    success: true,
    message: "Transaction updated successfully.",
  };
}

export async function deleteTransactionAction(transactionId: number) {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      message: "User not authenticated.",
    };
  }

  await db
    .delete(transactionsTable)
    .where(
      and(
        eq(transactionsTable.id, transactionId),
        eq(transactionsTable.userId, userId)
      )
    );

  return {
    success: true,
    message: "Transaction deleted successfully.",
  };
}
