const SOCIETY_ACCOUNT_SCOPES = ["family", "society"] as const;

export const CANONICAL_SOCIETY_ACCOUNT_SCOPE = "society" as const;

export function isSocietyAccountScope(scope: unknown): boolean {
  if (typeof scope !== "string") return false;
  const normalized = scope.trim().toLowerCase();
  return normalized === "family" || normalized === "society";
}

export function getSocietyAccountScopeFilter() {
  return {
    accountScope: { $in: [...SOCIETY_ACCOUNT_SCOPES] },
  };
}

export function getPersonalAccountScopeFilter() {
  return {
    $or: [{ accountScope: "personal" }, { accountScope: { $exists: false } }],
  };
}

export function toFormAccountScope(scope: unknown): "personal" | "family" {
  return isSocietyAccountScope(scope) ? "family" : "personal";
}

export function toAccountScopeLabel(scope: unknown): "Society" | "Personal" {
  return isSocietyAccountScope(scope) ? "Society" : "Personal";
}

export function toCanonicalStoredAccountScope(
  scope: unknown,
): "personal" | typeof CANONICAL_SOCIETY_ACCOUNT_SCOPE {
  return isSocietyAccountScope(scope) ? CANONICAL_SOCIETY_ACCOUNT_SCOPE : "personal";
}
