import { Schema, model, models } from "mongoose";

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["income", "expense"], required: true },
  },
  { timestamps: true },
);

export const Category = models.Category || model("Category", CategorySchema);
