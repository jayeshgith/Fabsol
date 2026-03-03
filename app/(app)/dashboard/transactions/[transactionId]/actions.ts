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

async function canManageAsGroupOwner(params: {
  actorId: string;
  groupId: string;
  transactionUserEmail: string;
}) {
  const group = await Group.findOne({
    _id: params.groupId,
    ownerId: params.actorId,
  })
    .select("ownerId memberIds")
    .lean();

  if (!group) return false;

  const allowedUserIds = [
    String(group.ownerId ?? "").trim(),
    ...(Array.isArray(group.memberIds)
      ? group.memberIds.map((id: unknown) => String(id).trim())
      : []),
  ].filter(Boolean);

  if (allowedUserIds.length === 0) return false;

  const allowedUsers = await User.find({ _id: { $in: allowedUserIds } })
    .select("email")
    .lean();

  const allowedEmails = new Set(
    allowedUsers
      .map((user) => String(user.email ?? "").trim())
      .filter(Boolean),
  );

  return allowedEmails.has(params.transactionUserEmail);
}

export async function updateTransactionAction(data: unknown) {
  try {
    const session = await auth();
    const actorEmail = String(session?.user?.email ?? "").trim();
    if (!actorEmail) {
      return { success: false, message: "User not authenticated." };
    }

    const parsed = updateSchema.parse(data);

    await connectDB();

    const actor = await User.findOne({ email: actorEmail }).select("_id").lean();
    if (!actor?._id) {
      return { success: false, message: "User not found." };
    }

    const existingTransaction = await Transaction.findById(parsed.id)
      .select("userId accountScope groupId")
      .lean();

    if (!existingTransaction) {
      return { success: false, message: "Transaction not found." };
    }

    const transactionUserEmail = String(existingTransaction.userId ?? "").trim();
    const isSelfTransaction = transactionUserEmail === actorEmail;
    const canManageByGroupOwnership =
      !isSelfTransaction &&
      existingTransaction.accountScope === "family" &&
      Boolean(existingTransaction.groupId) &&
      (await canManageAsGroupOwner({
        actorId: String(actor._id),
        groupId: String(existingTransaction.groupId),
        transactionUserEmail,
      }));

    if (!isSelfTransaction && !canManageByGroupOwnership) {
      return {
        success: false,
        message: "You do not have permission to update this transaction.",
      };
    }

    let groupId: string | null = null;
    const nextAccountScope = canManageByGroupOwnership
      ? "family"
      : parsed.accountScope;

    if (nextAccountScope === "family") {
      if (canManageByGroupOwnership) {
        groupId = String(existingTransaction.groupId);
      } else {
        const memberGroups = await Group.find({
          memberIds: String(actor._id),
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
    }

    const updated = await Transaction.findOneAndUpdate(
      { _id: parsed.id },
      {
        description: parsed.description,
        amount: parsed.amount,
        transactionDate: parsed.transactionDate,
        category: parsed.category,
        transactionType: parsed.transactionType,
        accountScope: nextAccountScope,
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
    const actorEmail = String(session?.user?.email ?? "").trim();
    if (!actorEmail) {
      return { success: false, message: "User not authenticated." };
    }

    await connectDB();

    const actor = await User.findOne({ email: actorEmail }).select("_id").lean();
    if (!actor?._id) {
      return { success: false, message: "User not found." };
    }

    const existingTransaction = await Transaction.findById(transactionId)
      .select("userId accountScope groupId")
      .lean();
    if (!existingTransaction) {
      return { success: false, message: "Transaction not found." };
    }

    const transactionUserEmail = String(existingTransaction.userId ?? "").trim();
    const isSelfTransaction = transactionUserEmail === actorEmail;
    const canManageByGroupOwnership =
      !isSelfTransaction &&
      existingTransaction.accountScope === "family" &&
      Boolean(existingTransaction.groupId) &&
      (await canManageAsGroupOwner({
        actorId: String(actor._id),
        groupId: String(existingTransaction.groupId),
        transactionUserEmail,
      }));

    if (!isSelfTransaction && !canManageByGroupOwnership) {
      return {
        success: false,
        message: "You do not have permission to delete this transaction.",
      };
    }

    const deleted = await Transaction.findByIdAndDelete(transactionId);

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
