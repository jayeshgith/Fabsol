"use client";

import TransactionForm from "@/components/transaction-form";
import { transactionFormSchema } from "@/lib/validators/transactionFormSchema";
import { type Category } from "@/types/Category";
import z from "zod";
import { createTransactionAction } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const NewTransactionForm = ({ categories }: { categories: Category[] }) => {
  const router = useRouter();

  const handleSubmit = async (data: z.input<typeof transactionFormSchema>) => {
    const result = await createTransactionAction({
      transactionType: data.transactionType,
      amount: Number(data.amount),
      categoryId: Number(data.categoryId),
      transactionDate: (data.transactionDate as Date).toISOString(),
      description: data.description,
    });

    if (result.success) {
      toast.success("Transaction created successfully.", {
        duration: 4000,
      });
      router.push(
        "/dashboard/transactions?month=" +
          (new Date().getMonth() + 1) +
          "&year=" +
          new Date().getFullYear()
      );
    } else {
      console.log("Transaction creation failed:", result.message);
      toast.error("Failed to create transaction.", {
        description: result.message,
        duration: 4000,
      });
    }
  };
  return <TransactionForm categories={categories} onsubmit={handleSubmit} />;
};

export default NewTransactionForm;
