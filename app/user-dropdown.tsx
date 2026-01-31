// "use client";

// import { signOut, useSession } from "next-auth/react";
// import { ChartColumnBigIcon, LogOutIcon } from "lucide-react";
// import { useRouter } from "next/navigation";

// const UserDropdown = () => {
//   const router = useRouter();
//   const { data: session } = useSession();

//   if (!session?.user) return null;

//   return (
//     <div className="relative flex items-center gap-3">
//       {/* User name */}
//       <span className="text-sm font-medium text-white">
//         {session.user.name}
//       </span>

//       {/* Dropdown */}
//       <div className="group relative">
//         <button className="rounded-full border px-3 py-1 text-sm text-white">
//           Menu
//         </button>

//         <div className="invisible absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border bg-white shadow-md group-hover:visible">
//           <button
//             onClick={() => router.push("/dashboard")}
//             className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
//           >
//             <ChartColumnBigIcon size={16} />
//             Dashboard
//           </button>

//           <button
//             onClick={() => signOut({ callbackUrl: "/login" })}
//             className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
//           >
//             <LogOutIcon size={16} />
//             Logout
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserDropdown;

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  ChartColumnBigIcon,
  Settings2Icon,
  UserIcon,
  LogOutIcon,
} from "lucide-react";

export default function UserDropdown() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!session?.user) return null;

  return (
    <div ref={boxRef} className="relative flex items-center gap-3">
      <span className="text-sm font-medium text-white">
        {session.user.name ?? "User"}
      </span>

      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border px-3 py-1 text-sm text-white"
        aria-expanded={open}
      >
        Menu
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            <ChartColumnBigIcon size={16} className="text-slate-600" />
            Dashboard
          </Link>

          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            <Settings2Icon size={16} className="text-slate-600" />
            Account Settings
          </Link>

          <Link
            href="/account/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            <UserIcon size={16} className="text-slate-600" />
            Profile
          </Link>

          <div className="my-1 h-px bg-slate-200" />

          <button
            onClick={async () => {
              setOpen(false);
              await signOut({ redirect: false });
              window.location.href = "/login";
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOutIcon size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
