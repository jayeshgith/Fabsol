"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  value: "personal" | "family";
};

export default function TransactionTypeFilter({ value }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onValueChange(nextValue: "personal" | "family") {
    const params = new URLSearchParams(searchParams.toString());

    if (nextValue === "personal") {
      params.delete("scope");
    } else {
      params.set("scope", nextValue);
    }

    const query = params.toString();
    router.push(query ? `/dashboard?${query}` : "/dashboard");
  }

  return (
    <div className="w-[180px]">
      <p className="mb-1 text-xs text-slate-500">Transaction Type</p>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="personal">Personal</SelectItem>
          <SelectItem value="family">Family</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
