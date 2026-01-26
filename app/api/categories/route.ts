import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { NextResponse } from "next/server";
export async function GET() {
  await connectDB();
  const categories = await Category.find().lean();
  return NextResponse.json(categories);
}
