import type { Category } from "@/types/Category";

type CategorySeed = Omit<Category, "_id">;

const DEFAULT_CATEGORY_SEEDS: CategorySeed[] = [
  { name: "Salary", type: "income", scope: "personal" },
  { name: "Business", type: "income", scope: "personal" },
  { name: "Interest", type: "income", scope: "personal" },
  { name: "Gift", type: "income", scope: "personal" },
  { name: "Refund", type: "income", scope: "personal" },
  { name: "Rent", type: "expense", scope: "personal" },
  { name: "Food", type: "expense", scope: "personal" },
  { name: "Groceries", type: "expense", scope: "personal" },
  { name: "Utilities", type: "expense", scope: "personal" },
  { name: "Transport", type: "expense", scope: "personal" },
  { name: "Healthcare", type: "expense", scope: "personal" },
  { name: "Education", type: "expense", scope: "personal" },
  { name: "Entertainment", type: "expense", scope: "personal" },
  { name: "Maintenance Collection", type: "income", scope: "family" },
  { name: "Penalty", type: "income", scope: "family" },
  { name: "Donation", type: "income", scope: "family" },
  { name: "Interest", type: "income", scope: "family" },
  { name: "Security Salary", type: "expense", scope: "family" },
  { name: "Electricity Bill", type: "expense", scope: "family" },
  { name: "Water Bill", type: "expense", scope: "family" },
  { name: "Cleaning", type: "expense", scope: "family" },
  { name: "Repairs", type: "expense", scope: "family" },
  { name: "Lift Maintenance", type: "expense", scope: "family" },
];

function toIdToken(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const DEFAULT_TRANSACTION_CATEGORIES: Category[] =
  DEFAULT_CATEGORY_SEEDS.map((category, index) => ({
    ...category,
    _id: `default-${category.scope}-${category.type}-${toIdToken(category.name) || index}`,
  }));
