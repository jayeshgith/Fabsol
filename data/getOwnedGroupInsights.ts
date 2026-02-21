import "server-only";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Group } from "@/models/Group";
import { Transaction } from "@/models/Transaction";
import { User } from "@/models/User";

type GroupOption = {
  id: string;
  name: string;
};

type AnnualCashflowItem = {
  month: number;
  totalIncome: number;
  totalExpenses: number;
};

type MemberSummary = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalIncome: number;
  totalExpenses: number;
};

type RecentTransactionItem = {
  id: string;
  memberName: string;
  memberEmail: string;
  description: string;
  amount: number;
  transactionDate: Date | null;
  category: string;
  transactionType: string;
};

type GroupInsightsResult = {
  ownerName: string;
  ownerEmail: string;
  isMemberOnly: boolean;
  groups: GroupOption[];
  selectedGroupId: string;
  selectedGroupName: string;
  year: number;
  yearsRange: number[];
  personalAnnualCashflow: AnnualCashflowItem[];
  groupAnnualCashflow: AnnualCashflowItem[];
  personalRecentTransactions: RecentTransactionItem[];
  groupRecentTransactions: RecentTransactionItem[];
  memberSummaries: MemberSummary[];
};

type AggregateRow = {
  _id: {
    month?: number;
    type?: string;
    userId?: string;
  };
  total: number;
};

function buildAnnualCashflow(rows: AggregateRow[]) {
  const result: AnnualCashflowItem[] = [];

  for (let month = 1; month <= 12; month++) {
    const totalIncome =
      rows.find((row) => row._id.month === month && row._id.type === "income")
        ?.total ?? 0;

    const totalExpenses =
      rows.find((row) => row._id.month === month && row._id.type === "expense")
        ?.total ?? 0;

    result.push({
      month,
      totalIncome: Number(totalIncome),
      totalExpenses: Number(totalExpenses),
    });
  }

  return result;
}

export async function getOwnedGroupInsights(params: {
  year: number;
  groupId?: string;
}): Promise<GroupInsightsResult | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  await connectDB();

  const owner = await User.findOne({ email: session.user.email })
    .select("_id name email")
    .lean();

  if (!owner?._id || !owner.email) return null;

  const ownerId = String(owner._id);
  const ownerName =
    (typeof owner.name === "string" && owner.name.trim()) || owner.email;

  const ownedGroups = await Group.find({ ownerId })
    .select("_id name memberIds")
    .sort({ createdAt: -1 })
    .lean();

  const isMemberInOtherGroup = Boolean(
    await Group.exists({
      ownerId: { $ne: ownerId },
      memberIds: ownerId,
    }),
  );

  const groups: GroupOption[] = ownedGroups.map((group) => ({
    id: String(group._id),
    name: String(group.name ?? "Unnamed Group"),
  }));

  if (groups.length === 0) {
    const currentYear = new Date().getFullYear();
    return {
      ownerName,
      ownerEmail: owner.email,
      isMemberOnly: isMemberInOtherGroup,
      groups: [],
      selectedGroupId: "",
      selectedGroupName: "",
      year: currentYear,
      yearsRange: [currentYear],
      personalAnnualCashflow: buildAnnualCashflow([]),
      groupAnnualCashflow: buildAnnualCashflow([]),
      personalRecentTransactions: [],
      groupRecentTransactions: [],
      memberSummaries: [],
    };
  }

  const requestedGroup = ownedGroups.find(
    (group) => String(group._id) === params.groupId,
  );
  const selectedGroup = requestedGroup ?? ownedGroups[0];

  const selectedGroupId = String(selectedGroup._id);
  const selectedGroupName = String(selectedGroup.name ?? "Unnamed Group");

  const memberIds = Array.isArray(selectedGroup.memberIds)
    ? selectedGroup.memberIds.map((id: unknown) => String(id))
    : [];

  const members = await User.find({ _id: { $in: memberIds } })
    .select("_id name email phone")
    .lean();

  const memberEmailMap = new Map<string, string>();
  const memberNameMap = new Map<string, string>();
  const memberIdMap = new Map<string, string>();
  const memberPhoneMap = new Map<string, string>();

  members.forEach((member) => {
    const email = String(member.email ?? "");
    const memberId = String(member._id);
    if (!email) return;
    memberEmailMap.set(memberId, email);
    memberNameMap.set(email, String(member.name ?? member.email ?? "Member"));
    memberIdMap.set(email, memberId);
    memberPhoneMap.set(email, String(member.phone ?? ""));
  });

  const groupEmails = members
    .map((member) => String(member.email ?? ""))
    .filter(Boolean);

  if (!groupEmails.includes(owner.email)) {
    groupEmails.push(owner.email);
    memberNameMap.set(owner.email, ownerName);
    memberIdMap.set(owner.email, ownerId);
  }

  const currentYear = new Date().getFullYear();

  const earliestGroupTransaction = await Transaction.findOne({
    userId: { $in: groupEmails },
  })
    .sort({ transactionDate: 1 })
    .select("transactionDate")
    .lean();

  const earliestYear = earliestGroupTransaction?.transactionDate
    ? new Date(earliestGroupTransaction.transactionDate).getFullYear()
    : currentYear;

  const yearsRange = Array.from(
    { length: currentYear - earliestYear + 1 },
    (_, index) => currentYear - index,
  );

  const year = yearsRange.includes(params.year) ? params.year : currentYear;
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const personalAnnualRows = await Transaction.aggregate<AggregateRow>([
    {
      $match: {
        userId: owner.email,
        transactionDate: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$transactionDate" },
          type: "$transactionType",
        },
        total: { $sum: "$amount" },
      },
    },
  ]);

  const groupAnnualRows = await Transaction.aggregate<AggregateRow>([
    {
      $match: {
        userId: { $in: groupEmails },
        transactionDate: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$transactionDate" },
          type: "$transactionType",
        },
        total: { $sum: "$amount" },
      },
    },
  ]);

  const memberSummaryRows = await Transaction.aggregate<AggregateRow>([
    {
      $match: {
        userId: { $in: groupEmails },
        transactionDate: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: {
          userId: "$userId",
          type: "$transactionType",
        },
        total: { $sum: "$amount" },
      },
    },
  ]);

  const groupRecentRows = await Transaction.find({
    userId: { $in: groupEmails },
  })
    .populate("category", "name type")
    .sort({ transactionDate: -1 })
    .limit(25)
    .lean();

  const personalRecentRows = await Transaction.find({
    userId: owner.email,
  })
    .populate("category", "name type")
    .sort({ transactionDate: -1 })
    .limit(10)
    .lean();

  const memberSummaries: MemberSummary[] = groupEmails.map((email) => {
    const income =
      memberSummaryRows.find(
        (row) => row._id.userId === email && row._id.type === "income",
      )?.total ?? 0;

    const expenses =
      memberSummaryRows.find(
        (row) => row._id.userId === email && row._id.type === "expense",
      )?.total ?? 0;

    return {
      id: memberIdMap.get(email) ?? email,
      name: memberNameMap.get(email) ?? email,
      email,
      phone: memberPhoneMap.get(email) ?? "",
      totalIncome: Number(income),
      totalExpenses: Number(expenses),
    };
  });

  const groupRecentTransactions: RecentTransactionItem[] = groupRecentRows.map(
    (transaction) => {
      const categoryObj =
        transaction.category &&
        typeof transaction.category === "object" &&
        "name" in transaction.category
          ? (transaction.category as { name?: string; type?: string })
          : undefined;

      const memberEmail = String(transaction.userId ?? "");

      return {
        id: String(transaction._id),
        memberName: memberNameMap.get(memberEmail) ?? memberEmail,
        memberEmail,
        description: String(transaction.description ?? ""),
        amount: Number(transaction.amount ?? 0),
        transactionDate: transaction.transactionDate
          ? new Date(transaction.transactionDate)
          : null,
        category: String(categoryObj?.name ?? "Unknown"),
        transactionType: String(
          transaction.transactionType ?? categoryObj?.type ?? "expense",
        ),
      };
    },
  );

  const personalRecentTransactions: RecentTransactionItem[] = personalRecentRows.map(
    (transaction) => {
      const categoryObj =
        transaction.category &&
        typeof transaction.category === "object" &&
        "name" in transaction.category
          ? (transaction.category as { name?: string; type?: string })
          : undefined;

      return {
        id: String(transaction._id),
        memberName: ownerName,
        memberEmail: owner.email,
        description: String(transaction.description ?? ""),
        amount: Number(transaction.amount ?? 0),
        transactionDate: transaction.transactionDate
          ? new Date(transaction.transactionDate)
          : null,
        category: String(categoryObj?.name ?? "Unknown"),
        transactionType: String(
          transaction.transactionType ?? categoryObj?.type ?? "expense",
        ),
      };
    },
  );

  return {
    ownerName,
    ownerEmail: owner.email,
    isMemberOnly: false,
    groups,
    selectedGroupId,
    selectedGroupName,
    year,
    yearsRange: yearsRange.length > 0 ? yearsRange : [currentYear],
    personalAnnualCashflow: buildAnnualCashflow(personalAnnualRows),
    groupAnnualCashflow: buildAnnualCashflow(groupAnnualRows),
    personalRecentTransactions,
    groupRecentTransactions,
    memberSummaries,
  };
}
