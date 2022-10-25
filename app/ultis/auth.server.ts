import type { RegisterForm } from "./types.server";
import { prisma } from "./prisma.server";
import { json } from "@remix-run/node";
import { createUser } from "./user.server";

export async function register(user: RegisterForm) {
  const exists = await prisma.user.count({ where: { email: user.email } });
  if (exists) {
    return json(
      { error: `User already exists with that email` },
      { status: 400 }
    );
  }

  const newUser = await createUser(user);
  if (newUser) {
    return json(
      {
        error: `Something went wrong trying to create a new user, please try again later`,
        fields: { email: user.email, password: user.password },
      },
      { status: 400 }
    );
  }
}
