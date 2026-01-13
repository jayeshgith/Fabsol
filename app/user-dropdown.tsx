"use client";

import { UserButton } from "@clerk/nextjs";
import { ChartColumnBigIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const UserDropdown = () => {
  const router = useRouter();
  return (
    <UserButton
      showName
      appearance={{
        elements: {
          userButtonOuterIdentifier: {
            color: "white",
            padding: "4px",
            margin: "4px",
          },
        },
      }}>
      <UserButton.MenuItems>
        <UserButton.Action
          label="Dashboard"
          labelIcon={<ChartColumnBigIcon size={16} />}
          onClick={() => {
            router.push("/dashboard");
          }}
        />
      </UserButton.MenuItems>
    </UserButton>
  );
};

export default UserDropdown;
