import RecentTransactions from "./recent-transactions";
import CashFlow from "./transactions/cashflow";

const DashboardPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ cfyear: string }>;
}) => {
  const today = new Date();
  let cfyear = Number(
    (await searchParams).cfyear || today.getFullYear().toString()
  );
  if (!cfyear || isNaN(cfyear)) {
    cfyear = today.getFullYear();
  }

  return (
    <div className="max-w-7xl mx-auto py-5">
      <h1 className="text-4xl font-semibold pb-5">Dashboard</h1>
      <CashFlow year={cfyear} />
      <RecentTransactions />
    </div>
  );
};

export default DashboardPage;
