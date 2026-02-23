"use server";

import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { transactionFormSchema } from "@/lib/validators/transactionFormSchema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import z from "zod";
import { Group } from "@/models/Group";
import { User } from "@/models/User";

const updateSchema = transactionFormSchema.safeExtend({
  id: z.string().min(1, "Missing transaction id"),
});

export async function updateTransactionAction(data: unknown) {
  try {
   
    const session = await auth();

    if (!session?.user) {
      return { success: false, message: "User not authenticated." };
    }

    const userId = session.user.email!;

    const parsed = updateSchema.parse(data);

    await connectDB();

    let groupId: string | null = null;
    if (parsed.accountScope === "family") {
      const currentUser = await User.findOne({ email: session.user.email })
        .select("_id")
        .lean();
      if (!currentUser?._id) {
        return { success: false, message: "User not found." };
      }

      const memberGroups = await Group.find({
        memberIds: String(currentUser._id),
      })
        .select("_id")
        .sort({ createdAt: 1 })
        .lean();

      if (memberGroups.length === 0) {
        return {
          success: false,
          message: "No family found for this account.",
        };
      }

      const requestedGroupId = String(parsed.groupId ?? "").trim();
      const selectedGroup =
        memberGroups.find((group) => String(group._id) === requestedGroupId) ??
        memberGroups[0];
      groupId = String(selectedGroup._id);
    }

    const updated = await Transaction.findOneAndUpdate(
      { _id: parsed.id, userId },
      {
        description: parsed.description,
        amount: parsed.amount,
        transactionDate: parsed.transactionDate,
        category: parsed.category,
        transactionType: parsed.transactionType,
        accountScope: parsed.accountScope,
        groupId,
      },
      { new: true },
    );

    if (!updated) {
      return { success: false, message: "Transaction not found." };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/transactions");
    revalidatePath("/groups/dashboard");

    return { success: true, message: "Transaction updated successfully." };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    console.error("Update transaction error:", error);
    return {
      success: false,
      message,
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
    revalidatePath("/groups/dashboard");

    return { success: true, message: "Transaction deleted successfully." };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    console.error("Delete transaction error:", error);
    return {
      success: false,
      message,
    };
  }
}
