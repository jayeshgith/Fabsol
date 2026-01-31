"use server";

import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { transactionFormSchema } from "@/lib/validators/transactionFormSchema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import z from "zod";

const updateSchema = transactionFormSchema.extend({
  id: z.string().min(1, "Missing transaction id"),
});

export async function updateTransactionAction(data: unknown) {
  try {
   
    const session = await auth();

    if (!session?.user) {
      return { success: false, message: "User not authenticated." };
    }

    const userId = (session.user as any).id;

    const parsed = updateSchema.parse(data);

    await connectDB();

    const updated = await Transaction.findOneAndUpdate(
      { _id: parsed.id, userId },
      {
        description: parsed.description,
        amount: parsed.amount,
        transactionDate: parsed.transactionDate,
        category: parsed.categoryId,
        transactionType: parsed.transactionType,
      },
      { new: true },
    );

    if (!updated) {
      return { success: false, message: "Transaction not found." };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/transactions");

    return { success: true, message: "Transaction updated successfully." };
  } catch (error: any) {
    console.error("Update transaction error:", error);
    return {
      success: false,
      message: error?.message ?? "Something went wrong",
    };
  }
}

export async function deleteTransactionAction(transactionId: string) {
  try {
  
    const session = await auth();

    if (!session?.user) {
      return { success: false, message: "User not authenticated." };
    }

    const userId = session.user.email!;


    await connectDB();

    const deleted = await Transaction.findOneAndDelete({
      _id: transactionId,
      userId,
    });

    if (!deleted) {
      return { success: false, message: "Transaction not found." };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/transactions");

    return { success: true, message: "Transaction deleted successfully." };
  } catch (error: any) {
    console.error("Delete transaction error:", error);
    return {
      success: false,
      message: error?.message ?? "Something went wrong",
    };
  }
}
