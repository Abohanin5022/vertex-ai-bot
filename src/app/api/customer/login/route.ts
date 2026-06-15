import { loginWithRole } from "@/src/app/api/login/route";
import { AUTH_ROLES } from "@/lib/roles";

export async function POST(req: Request) {
  return loginWithRole(req, AUTH_ROLES.customer);
}
