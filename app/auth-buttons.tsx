// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { useEffect, useRef, useState } from "react";
// import { signOut, useSession } from "next-auth/react";

// export default function AuthButtons() {
//   const { data: session, status } = useSession();
//   const [open, setOpen] = useState(false);
//   const ref = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     function onClickOutside(e: MouseEvent) {
//       if (!ref.current) return;
//       if (!ref.current.contains(e.target as Node)) setOpen(false);
//     }
//     document.addEventListener("mousedown", onClickOutside);
//     return () => document.removeEventListener("mousedown", onClickOutside);
//   }, []);

//   if (status === "loading") return null;

//   // Not logged in
//   if (!session?.user) {
//     return (
//       <div className="flex items-center gap-3">
//         <Link
//           href="/login"
//           className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-white/10"
//         >
//           Sign in
//         </Link>
//         <Link
//           href="/signup"
//           className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
//         >
//           Sign up
//         </Link>
//       </div>
//     );
//   }

//   const name = session.user.name ?? "User";
//   const image = session.user.image;

//   return (
//     <div ref={ref} className="relative">
//       {/* Menu Button */}
//       <button
//         onClick={() => setOpen((v) => !v)}
//         className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2 hover:bg-white/20"
//       >
//         <div className="h-8 w-8 overflow-hidden rounded-full bg-white/10">
//           {image ? (
//             <Image
//               src={image}
//               alt={name}
//               width={32}
//               height={32}
//               className="h-8 w-8 object-cover"
//             />
//           ) : null}
//         </div>

//         <div className="hidden sm:flex flex-col items-start leading-tight">
//           <span className="text-sm font-semibold">{name}</span>
//           <span className="text-xs text-white/70">Menu</span>
//         </div>

//         <span className="text-xs text-white/70">▾</span>
//       </button>

//       {/* Dropdown */}
//       {open && (
//         <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0f] shadow-xl">
//           <Link
//             href="/account"
//             onClick={() => setOpen(false)}
//             className="block px-4 py-3 text-sm hover:bg-white/10"
//           >
//             Manage Account
//           </Link>

//           <Link
//             href="/dashboard"
//             onClick={() => setOpen(false)}
//             className="block px-4 py-3 text-sm hover:bg-white/10"
//           >
//             Dashboard
//           </Link>

//           <Link
//             href="/account/profile"
//             onClick={() => setOpen(false)}
//             className="block px-4 py-3 text-sm hover:bg-white/10"
//           >
//             Profile
//           </Link>

//           <div className="h-px bg-white/10" />

//           <button
//             onClick={() => signOut({ callbackUrl: "/login" })}
//             className="w-full px-4 py-3 text-left text-sm hover:bg-white/10"
//           >
//             Sign out
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";

export default function AuthButtons({
  showGroupDashboard = false,
}: {
  showGroupDashboard?: boolean;
}) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (status === "loading") return null;

  
  if (!session?.user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-white/10"
        >
          Sign in
        </Link>

        <Link
          href="/signup"
          className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
        >
          Sign up
        </Link>
      </div>
    );
  }

 
  const name = session.user.name ?? "User";
  const image = session.user.image;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2 hover:bg-white/20"
      >
        <div className="h-9 w-9 overflow-hidden rounded-full bg-white/10">
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-9 w-9 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-9 w-9 flex items-center justify-center text-sm font-bold">
              {name.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-sm font-semibold">{name}</span>
          <span className="text-xs text-white/70">Account</span>
        </div>

        <span className="text-xs text-white/70">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0f] shadow-xl">
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm hover:bg-white/10"
          >
            Manage Account
          </Link>

          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm hover:bg-white/10"
          >
            Dashboard
          </Link>

          <Link
            href="/account/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm hover:bg-white/10"
          >
            Profile
          </Link>

          {showGroupDashboard ? (
            <Link
              href="/groups/dashboard"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm hover:bg-white/10"
            >
              Group Dashboard
            </Link>
          ) : null}

          <div className="h-px bg-white/10" />

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full px-4 py-3 text-left text-sm hover:bg-white/10"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
