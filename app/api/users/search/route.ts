import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getGroupAccessByEmail } from "@/lib/group-access";
import { normalizePhoneNumber } from "@/lib/profile";
import { Group } from "@/models/Group";
import { User } from "@/models/User";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const groupId = String(searchParams.get("groupId") ?? "").trim();

  const groupAccess = await getGroupAccessByEmail(session.user.email);
  if (!groupAccess) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (!groupAccess.canCreateGroup) {
    if (!groupId) {
      return NextResponse.json(
        { error: "Only group creators can add/search members." },
        { status: 403 },
      );
    }

    const ownedGroup = await Group.findOne({
      _id: groupId,
      ownerId: groupAccess.userId,
    })
      .select("_id")
      .lean();

    if (!ownedGroup) {
      return NextResponse.json(
        { error: "Only group creators can add/search members." },
        { status: 403 },
      );
    }
  }
  
  const query = normalizePhoneNumber(searchParams.get("query") ?? "");

  if (!query) {
    return NextResponse.json({ users: [] });
  }

  const currentUser = await User.findOne({ email: session.user.email })
    .select("_id")
    .lean();

  const groupedMemberIds = await Group.distinct("memberIds");

  const escapedQuery = escapeRegex(query);
  const phonePattern = query.startsWith("+")
    ? `^${escapedQuery}`
    : `^\\+?${escapedQuery}`;

  const idFilter: { $nin: unknown[]; $ne?: unknown } = {
    $nin: groupedMemberIds,
  };
  if (currentUser?._id) {
    idFilter.$ne = currentUser._id;
  }

  const users = await User.find({
    phone: { $regex: phonePattern },
    _id: idFilter,
  })
    .select("_id name email phone image")
    .limit(10)
    .lean();

  return NextResponse.json({
    users: users.map((user) => ({
      id: String(user._id),
      name: user.name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      image: user.image ?? "",
    })),
  });
}
