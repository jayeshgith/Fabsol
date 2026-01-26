import { Schema, model, models, Types } from "mongoose";

const TransactionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true, // Clerk userId
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionDate: {
      type: Date,
      required: true,
    },
    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["income", "expense"],
      required: false,
    },
  },

  { timestamps: true },
);

export const Transaction =
  models.Transaction || model("Transaction", TransactionSchema);

  