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

const EditTransactionPage = async ({
  params,
}: {
  params: { transactionId: string } | Promise<{ transactionId: string }>;
}) => {
  const resolvedParams = await Promise.resolve(params);
  const transactionId = resolvedParams.transactionId;

  if (!transactionId) return notFound();
  const session = await auth();
  if (!session?.user?.email) return notFound();

  await connectDB();

  const tx = await Transaction.findOne({
    _id: transactionId,
    userId: session.user.email,
  })
    .lean();

  if (!tx) return notFound();

  const currentUser = await User.findOne({ email: session.user.email })
    .select("_id")
    .lean();

  const familyGroupsRaw = currentUser?._id
    ? await Group.find({ memberIds: String(currentUser._id) })
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
