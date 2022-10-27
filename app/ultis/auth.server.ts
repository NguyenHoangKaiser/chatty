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

/**
 * Validate the user on email & password
 * @returns a new session with the user's id and redirect to the home page if the user is valid 
 */
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
    name: "chatty-session",
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

/**
 * Check for a user session and return the userId if it exists. 
 * @param request the request object 
 * @param redirectTo redirect the user to this specific route if they are not logged in 
 * @returns the userId if they are logged in, otherwise redirect to the given url 
 */
export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

/**
 * Grab the current user's session based on the request's cookie. 
 * @param request the request object 
 * @returns the current user's session from the session storage. 
 */
function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

/**
 *  
 * @param request the request object
 * @returns the current user's id from the session storage. 
 */
async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    return null;
  }
  return userId;
}

/**
 * Return the whole user document associated with the current session. If one is not found, the user is logged out.
 * @param request the request object
 * @returns the user document associated with the current session if found.
 */
export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== "string") {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, profile: true },
    });
    return user;
  } catch {
    throw logout(request);
  }
}

/**
 * Log the user out by clearing the session cookie. 
 * @param request the request object
 * @returns a redirect to the homepage with the session cookie cleared. 
 */
export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}
