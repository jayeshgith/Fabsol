import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).lean();

  return NextResponse.json({
    email: session.user.email,
    name: user?.name ?? "",
    image: user?.image ?? "",
    bio: user?.bio ?? "",
    phone: user?.phone ?? "",
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  await connectDB();
  await User.updateOne(
    { email: session.user.email },
    {
      $set: {
        name: body.name ?? "",
        image: body.image ?? "",
        bio: body.bio ?? "",
        phone: body.phone ?? "",
      },
    },
  );

  return NextResponse.json({ ok: true });
}
