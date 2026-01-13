"use server";

import { db } from "@/db";
import { transactionsTable } from "@/db/schema";
import { transactionSchema } from "@/lib/validators/transactionSchema";
import { auth } from "@clerk/nextjs/server";

export const createTransactionAction = async (data: {
  transactionType: string;
  amount: number;
  categoryId: number;
  transactionDate: string;
  description: string;
}) => {
  console.log("Data received in action:", data);
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      message: "User not authenticated.",
    };
  }

  const parsedData = transactionSchema.safeParse(data);

  if (!parsedData.success) {
    return {
      success: false,
      message: parsedData.error.issues[0].message,
    };
  }

  console.log("Parsed data:", parsedData.data);

  const [transaction] = await db
    .insert(transactionsTable)
    .values({
      userId,
      amount: parsedData.data.amount.toString(),
      categoryId: parsedData.data.categoryId,
      transactionDate: parsedData.data.transactionDate.toISOString(),
      description: parsedData.data.description,
    })
    .returning();

  console.log("Inserted transaction:", transaction);

  return {
    success: true,
    transactionId: transaction.id,
    message: "Transaction created successfully.",
  };
};
