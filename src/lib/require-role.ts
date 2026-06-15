import { redirect } from "next/navigation";
import {
  getAdminUser,
  getCustomerUser,
  getMerchantUser,
} from "@/lib/merchant-auth";
import { AUTH_ROLES, type AuthRole } from "@/lib/roles";

export async function requireRole(role: AuthRole) {
  const user =
    role === AUTH_ROLES.merchant
      ? await getMerchantUser()
      : role === AUTH_ROLES.admin
        ? await getAdminUser()
        : await getCustomerUser();

  if (!user) {
    if (role === AUTH_ROLES.admin) {
      redirect("/admin-login");
    }

    redirect(role === AUTH_ROLES.customer ? "/login" : "/merchant-login");
  }

  if (role === AUTH_ROLES.merchant && user.isActive === false) {
    redirect("/account-disabled");
  }

  return user;
}
