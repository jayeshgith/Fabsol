"use server";

import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { transactionFormSchema } from "@/lib/validators/transactionFormSchema";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const createTransactionAction = async (data: unknown) => {
  try {
    const { userId } = await auth(); 

    if (!userId) {
      return { success: false, message: "User not authenticated." };
    }

    const parsed = transactionFormSchema.parse(data);

    await connectDB();

    const transaction = await Transaction.create({
      userId,
      transactionType: parsed.transactionType,
      amount: parsed.amount,
      description: parsed.description,
      transactionDate: parsed.transactionDate,
      category: parsed.categoryId,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/transactions");

    return {
      success: true,
      transactionId: transaction._id.toString(),
      message: "Transaction created successfully.",
    };
  } catch (error: any) {
    console.error("Create transaction error:", error);
    return {
      success: false,
      message: error?.message ?? "Something went wrong",
    };
  }
};
