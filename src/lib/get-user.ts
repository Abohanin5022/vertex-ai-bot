import { getAnySessionUser } from "@/lib/merchant-auth";

export async function getUser() {
  return getAnySessionUser();
}
