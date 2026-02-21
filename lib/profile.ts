function hasValue(value: string | null | undefined) {
  return Boolean(value && value.trim().length > 0);
}

export function normalizePhoneNumber(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/[\s()-]/g, "");
}

export function isValidInternationalPhoneNumber(value: string) {
  return /^\+[1-9]\d{7,14}$/.test(value);
}

export function isProfileComplete(profile: {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  image?: string | null;
}) {
  const normalizedPhone = normalizePhoneNumber(profile.phone ?? "");
  return (
    hasValue(profile.name) &&
    hasValue(profile.email) &&
    isValidInternationalPhoneNumber(normalizedPhone) &&
    hasValue(profile.image)
  );
}
