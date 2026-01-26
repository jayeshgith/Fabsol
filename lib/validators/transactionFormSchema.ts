import { addDays } from "date-fns";
import z from "zod";

export const transactionFormSchema = z.object({
  transactionType: z.enum(["income", "expense"]),
  categoryId: z.string().min(1, "Please select a valid category"),

  transactionDate: z.coerce
    .date()
    .max(
      Number(addDays(new Date(), 1)),
      "Transaction date cannot be in the future.",
    ),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters long.")
    .max(255, "Description must be at most 255 characters long."),
});
