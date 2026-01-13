import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategories } from "@/data/getCategories";
import EditTransactionForm from "./edit-transaction-form";
import { getTransaction } from "@/data/getTransaction";
import DeleteTransactionDialog from "./delete-transaction-dialog";
import { format } from "date-fns";
import { notFound } from "next/navigation";

const EditTransactionPage = async ({
  params,
}: {
  params: Promise<{ transactionId: string }>;
}) => {
  const paramValues = await params;
  const transactionId = Number(paramValues.transactionId);

  if (isNaN(transactionId)) {
    return notFound();
  }

  const categories = await getCategories();
  const transaction = await getTransaction(transactionId);

  if (!transaction) {
    return notFound();
  }

  return (
    <div className="max-w-7xl mx-auto py-10">
      <Card className="mt-8 p-6 max-w-3xl">
        <CardHeader className="text-2xl font-bold">
          <CardTitle className="flex justify-between">
            <span>Edit Transaction</span>
            <DeleteTransactionDialog
              transactionId={transaction.id}
              transactionDate={format(
                transaction.transactionDate,
                "yyyy-MM-dd"
              )}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EditTransactionForm
            categories={categories}
            transaction={{
              id: transaction?.id as number,
              amount: transaction?.amount as string,
              categoryId: transaction?.categoryId as number,
              description: transaction?.description as string,
              transactionDate: transaction?.transactionDate as string,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditTransactionPage;
