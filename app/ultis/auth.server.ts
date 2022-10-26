import bcrypt from "bcryptjs";
import type { RegisterForm, LoginForm } from "./types.server";
import { prisma } from "./prisma.server";
import { redirect, json, createCookieSessionStorage } from "@remix-run/node";
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
  if (!newUser) {
    return json(
      {
        error: `Something went wrong trying to create a new user, please try again later`,
        fields: { email: user.email, password: user.password },
      },
      { status: 400 }
    );
  }
  return createUserSession(newUser.id, "/");
}

export async function login({ email, password }: LoginForm) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return json({ error: `Email or password is incorrect` }, { status: 400 });
  }

  return createUserSession(user.id, "/");
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("Please set the SESSION_SECRET environment variable");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
});

/**
 * Create a new session for the user and redirect to the given url.
 * @param userId set to the id of the logged in user
 * @param redirectTo redirect the user to this specific route
 * @returns commit the session when setting the cookie header
 */
export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: { "Set-Cookie": await storage.commitSession(session) },
  });
}

