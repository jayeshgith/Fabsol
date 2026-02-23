"use server";

import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { transactionFormSchema } from "@/lib/validators/transactionFormSchema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Group } from "@/models/Group";
import { User } from "@/models/User";

export const createTransactionAction = async (data: unknown) => {
  try {
    
    const session = await auth();

    if (!session?.user) {
      return { success: false, message: "User not authenticated." };
    }

    const userId = session.user.email!;

    const parsed = transactionFormSchema.parse(data);

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

    const transaction = await Transaction.create({
      userId,
      accountScope: parsed.accountScope,
      groupId,
      transactionType: parsed.transactionType,
      amount: parsed.amount,
      description: parsed.description,
      transactionDate: parsed.transactionDate,
      category: parsed.category,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/transactions");
    revalidatePath("/groups/dashboard");

    return {
      success: true,
      transactionId: transaction._id.toString(),
      message: "Transaction created successfully.",
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    console.error("Create transaction error:", error);
    return {
      success: false,
      message,
    };
  }
};
