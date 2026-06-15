export const PACKORA_USER_TYPES = {
  CUSTOMER: "CUSTOMER",
  MERCHANT: "MERCHANT",
  ADMIN: "ADMIN",
} as const;

export const AUTH_ROLES = {
  customer: "customer",
  merchant: "merchant",
  admin: "admin",
} as const;

export type AuthRole = (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES];
export type PackoraUserType =
  (typeof PACKORA_USER_TYPES)[keyof typeof PACKORA_USER_TYPES];

export function roleToUserType(role?: string | null): PackoraUserType | null {
  if (role === AUTH_ROLES.customer) {
    return PACKORA_USER_TYPES.CUSTOMER;
  }

  if (role === AUTH_ROLES.merchant) {
    return PACKORA_USER_TYPES.MERCHANT;
  }

  if (role === AUTH_ROLES.admin) {
    return PACKORA_USER_TYPES.ADMIN;
  }

  return null;
}
