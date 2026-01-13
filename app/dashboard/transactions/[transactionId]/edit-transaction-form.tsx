"use client";

import TransactionForm from "@/components/transaction-form";
import { transactionFormSchema } from "@/lib/validators/transactionFormSchema";
import { Category } from "@/types/Category";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";
import { updateTransactionAction } from "./actions";

const EditTransactionForm = ({
  categories,
  transaction,
}: {
  categories: Category[];
  transaction: {
    id: number;
    categoryId: number;
    amount: string;
    description: string;
    transactionDate: string;
  };
}) => {
  const router = useRouter();

  const handleSubmit = async (data: z.input<typeof transactionFormSchema>) => {
    const result = await updateTransactionAction({
      id: transaction.id,
      amount: Number(data.amount),
      categoryId: Number(data.categoryId),
      transactionDate: (data.transactionDate as Date).toISOString(),
      description: data.description,
    });

    if (result.success) {
      toast.success("Transaction updated successfully.", {
        duration: 4000,
      });
      router.push(
        "/dashboard/transactions?month=" +
          (new Date().getMonth() + 1) +
          "&year=" +
          new Date().getFullYear()
      );
    } else {
      console.log("Transaction update failed:", result.message);
      toast.error("Failed to update transaction.", {
        description: result.message,
        duration: 4000,
      });
    }
  };
  return (
    <TransactionForm
      categories={categories}
      onsubmit={handleSubmit}
      defaultValues={{
        transactionType:
          categories.find((category) => category.id === transaction.categoryId)
            ?.type || "income",
        amount: Number(transaction.amount),
        categoryId: transaction.categoryId,
        description: transaction.description,
        transactionDate: new Date(transaction.transactionDate),
      }}
    />
  );
};

export default EditTransactionForm;
