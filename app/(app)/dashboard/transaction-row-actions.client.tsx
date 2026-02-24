"use client";

import dynamic from "next/dynamic";

const TransactionRowActionsNoSSR = dynamic(
  () => import("./transaction-row-actions"),
  { ssr: false },
);

type Props = {
  transactionId: string;
};

const TransactionRowActionsClient = ({ transactionId }: Props) => {
  return <TransactionRowActionsNoSSR transactionId={transactionId} />;
};

export default TransactionRowActionsClient;
