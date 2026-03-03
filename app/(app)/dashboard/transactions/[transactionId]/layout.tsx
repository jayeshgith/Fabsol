import TransactionBackButton from "../transaction-back-button";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-7xl mx-auto py-10">
      <TransactionBackButton fallbackHref="/dashboard/transactions" />
      {children}
    </div>
  );
};

export default Layout;
