export type UserRole = "owner" | "client";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
};
