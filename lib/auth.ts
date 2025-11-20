export interface NormalizedUser {
  fullName: string;
  email: string;
  role: string;
}

export function normalizeUser(data: unknown): NormalizedUser | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const pick = (key: string): string => {
    const val = record[key];
    return typeof val === "string" ? val : "";
  };

  const fullName =
    pick("fullName") ||
    pick("full_name") ||
    pick("name") ||
    `${pick("firstName") || pick("first")} ${pick("lastName") || pick("last")}`.trim();
  const email = pick("email") || pick("emailAddress") || pick("username");
  const roleSource = record["role"];
  const rolesValue = record["roles"];
  const role =
    typeof roleSource === "string"
      ? roleSource
      : Array.isArray(rolesValue) && typeof rolesValue[0] === "string"
      ? rolesValue[0]
      : "";

  if (!fullName && !email && !role) return null;
  return { fullName, email, role };
}
