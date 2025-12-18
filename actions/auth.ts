"use server";

import { cookies } from "next/headers";

export async function loginAction(token: string) {
  (await cookies()).set({
    name: "admin-token",
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function logoutAction() {
  (await cookies()).delete("admin-token");
}
