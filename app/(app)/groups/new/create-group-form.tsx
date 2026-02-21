"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, UserPlus, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type SearchUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
};

export default function CreateGroupForm() {
  const router = useRouter();

  const [groupName, setGroupName] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  const selectedMemberIdSet = useMemo(
    () => new Set(selectedMembers.map((member) => member.id)),
    [selectedMembers],
  );

  async function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const trimmedQuery = query.trim();

    setSearching(true);

    try {
      const res = await fetch(
        `/api/users/search?query=${encodeURIComponent(trimmedQuery)}`,
        { cache: "no-store" },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data?.error ?? "Unable to search users right now.");
        setResults([]);
        setSearching(false);
        return;
      }

      const foundUsers = Array.isArray(data?.users) ? data.users : [];
      setResults(foundUsers);
      if (foundUsers.length === 0) {
        setMessage(
          trimmedQuery
            ? "No users found for this name or phone number."
            : "No available users found right now.",
        );
      }
    } catch {
      setResults([]);
      setMessage("Something went wrong while searching users.");
    } finally {
      setSearching(false);
    }
  }

  function addMember(user: SearchUser) {
    if (selectedMemberIdSet.has(user.id)) return;
    setSelectedMembers((current) => [...current, user]);
  }

  function removeMember(memberId: string) {
    setSelectedMembers((current) =>
      current.filter((member) => member.id !== memberId),
    );
  }

  async function onCreateGroup() {
    setMessage("");

    const trimmedGroupName = groupName.trim();
    if (!trimmedGroupName) {
      setMessage("Group name is required.");
      return;
    }

    if (selectedMembers.length === 0) {
      setMessage("Add at least one family member to create group.");
      return;
    }

    setCreating(true);

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedGroupName,
          memberIds: selectedMembers.map((member) => member.id),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data?.error ?? "Unable to create group.");
        setCreating(false);
        return;
      }

      router.push("/groups/dashboard");
      router.refresh();
    } catch {
      setMessage("Something went wrong while creating group.");
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Group</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create your family group and add members by name or phone number.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back</Link>
        </Button>
      </div>

      <div className="space-y-6 rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Group / Family Name
          </label>
          <Input
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            placeholder="Example: Sharma Family"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">
            Search Member By Name or Phone
          </p>
          <form onSubmit={onSearch}>
            <div className="flex w-full max-w-xl items-center space-x-2">
              <Input
                name="query"
                placeholder="Name or phone number"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="md:w-60 lg:w-[420px]"
              />
              <Button type="submit" disabled={searching} className="px-4">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
          <p className="mt-2 text-xs text-slate-500">
            Leave empty and click search to view all available members.
          </p>
        </div>

        <div className="space-y-3">
          {results.map((user) => {
            const isAdded = selectedMemberIdSet.has(user.id);

            return (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user.name || "User"}
                  </p>
                  <p className="truncate text-xs text-slate-600">{user.phone}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={isAdded ? "secondary" : "default"}
                  disabled={isAdded}
                  onClick={() => addMember(user)}
                  className="gap-1.5"
                >
                  <UserPlus className="h-4 w-4" />
                  {isAdded ? "Added" : "Add Member"}
                </Button>
              </div>
            );
          })}

          {results.length === 0 && !searching ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              Search results will appear here.
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                Selected Members ({selectedMembers.length})
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-900">
                  Added Members
                </p>
                {selectedMembers.length === 0 ? (
                  <p className="text-sm text-slate-500">No members added yet.</p>
                ) : (
                  selectedMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-2 py-1.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {member.name || "User"}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {member.phone}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeMember(member.id)}
                        aria-label="Remove member"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            type="button"
            onClick={onCreateGroup}
            disabled={creating}
            className="ml-auto"
          >
            {creating ? "Creating Group..." : "Create Group"}
          </Button>
        </div>

        {message ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {message}
          </div>
        ) : null}
      </div>
    </div>
  );
}
