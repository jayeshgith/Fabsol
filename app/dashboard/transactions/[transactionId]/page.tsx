import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EditTransactionForm from "./edit-transaction-form";
import DeleteTransactionDialog from "./delete-transaction-dialog";
import { format } from "date-fns";
import { notFound } from "next/navigation";

import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { Transaction } from "@/models/Transaction";

const EditTransactionPage = async ({
  params,
}: {
  params: { transactionId: string } | Promise<{ transactionId: string }>;
}) => {
  const resolvedParams = await Promise.resolve(params);
  const transactionId = resolvedParams.transactionId;

  if (!transactionId) return notFound();
  await connectDB();

  const categoriesRaw = await Category.find().lean();
  const categories = categoriesRaw.map((c: any) => ({
    _id: c._id.toString(),
    name: c.name,
    type: c.type,
  }));

  const tx = await Transaction.findById(transactionId)
    .populate("category", "name type")
    .lean();

  if (!tx) return notFound();

  const transaction = {
    id: tx._id.toString(),
    amount: tx.amount,
    description: tx.description,
    transactionDate: tx.transactionDate,
    categoryId: tx.category?._id?.toString() ?? "",
    transactionType: tx.transactionType, // if present in schema
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
            categories={categories}
            transaction={transaction}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditTransactionPage;
