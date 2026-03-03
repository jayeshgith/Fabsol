import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EditTransactionForm from "./edit-transaction-form";
import DeleteTransactionDialog from "./delete-transaction-dialog";
import { format } from "date-fns";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Group } from "@/models/Group";
import { Transaction } from "@/models/Transaction";
import { User } from "@/models/User";

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

const EditTransactionPage = async ({
  params,
}: {
  params: { transactionId: string } | Promise<{ transactionId: string }>;
}) => {
  const resolvedParams = await Promise.resolve(params);
  const transactionId = resolvedParams.transactionId;

  if (!transactionId) return notFound();
  const session = await auth();
  const actorEmail = String(session?.user?.email ?? "").trim();
  if (!actorEmail) return notFound();

  await connectDB();

  const currentUser = await User.findOne({ email: actorEmail })
    .select("_id")
    .lean();
  if (!currentUser?._id) return notFound();

  const tx = await Transaction.findById(transactionId).lean();
  if (!tx) return notFound();

  const transactionUserEmail = String(tx.userId ?? "").trim();
  const isSelfTransaction = transactionUserEmail === actorEmail;
  const canManageByGroupOwnership =
    !isSelfTransaction &&
    tx.accountScope === "family" &&
    Boolean(tx.groupId) &&
    (await canManageAsGroupOwner({
      actorId: String(currentUser._id),
      groupId: String(tx.groupId),
      transactionUserEmail,
    }));

  if (!isSelfTransaction && !canManageByGroupOwnership) return notFound();

  const familyGroupsRaw = currentUser?._id
    ? await Group.find({
        $or: [
          { memberIds: String(currentUser._id) },
          { ownerId: String(currentUser._id) },
        ],
      })
        .select("_id name")
        .sort({ name: 1 })
        .lean()
    : [];

  const familyGroups = familyGroupsRaw.map((group) => ({
    id: String(group._id),
    name: String(group.name ?? "Unnamed Family"),
  }));

  const transaction = {
    id: tx._id.toString(),
    amount: tx.amount,
    description: tx.description,
    transactionDate: tx.transactionDate,
    accountScope:
      tx.accountScope === "family" ? ("family" as const) : ("personal" as const),
    groupId: tx.groupId ? String(tx.groupId) : "",
    category:
      typeof tx.category === "string" && tx.category.trim()
        ? tx.category.trim()
        : tx.category && typeof tx.category === "object" && "name" in tx.category
          ? String((tx.category as { name?: string }).name ?? "")
          : "",
    transactionType: tx.transactionType,
  };

  return (
    <div className="max-w-7xl mx-auto py-10">
      <Card className="mt-8 p-6 max-w-3xl">
        <CardHeader className="text-2xl font-bold">
          <CardTitle className="flex justify-between items-center">
            <span>Edit Transaction</span>
            <DeleteTransactionDialog
              transactionId={transaction.id}
              transactionDate={format(
                transaction.transactionDate,
                "yyyy-MM-dd",
              )}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EditTransactionForm
            familyGroups={familyGroups}
            transaction={transaction}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditTransactionPage;
