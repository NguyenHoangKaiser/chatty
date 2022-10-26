// app/routes/login.tsx
import { useState } from "react";
import FormFields from "~/components/form-fields";
import { Layout } from "~/components/layout";
import type { ActionFunction } from "@remix-run/node";  // <--- Remix looks for an exported function named action to set up a POST request on the route
import { json } from "@remix-run/node";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "~/ultis/validators.server";
import { login, register } from "~/ultis/auth.server";

export const action: ActionFunction = async ({ request }) => {
  /**
   * 1. Get the form data from the request
   */
  const form = await request.formData();
  const action = form.get("_action");
  const email = form.get("email");
  const password = form.get("password");
  let firstName = form.get("firstName");
  let lastName = form.get("lastName");

  /**
   * 2. Validate the form data
   */
  if (
    typeof action !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return json({ error: "Invalid form data" }, { status: 400 });
  }

  if (
    action === "register" &&
    (typeof firstName !== "string" || typeof lastName !== "string")
  ) {
    return json({ error: "Invalid form data" }, { status: 400 });
  }

  /**
   * 3. Returns an error along with the form field values if any problems occur
   */
  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
    ...(action === "register"
      ? {
          firstName: validateName((firstName as string) || ""),
          lastName: validateName((lastName as string) || ""),
        }
      : {}),
  };

  /**
   * If there are any errors, return them
   */
  if (Object.values(errors).some(Boolean))
    return json({ errors }, { status: 400 });

  switch (action) {
    case "login": {
      return await login({ email, password });
    }
    case "register": {
      firstName = firstName as string;
      lastName = lastName as string;
      return await register({ email, password, firstName, lastName });
    }
    default:
      return json({ error: "Invalid form data" }, { status: 400 });
  }
};

export default function Login() {
  const [action, setAction] = useState("login");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setFormData((form) => ({ ...form, [field]: event.target.value }));
  };

  return (
    <Layout>
      <div className="h-full justify-center items-center flex flex-col gap-y-4">
        <button
          onClick={() => setAction(action == "login" ? "register" : "login")}
          className="absolute top-8 right-8 rounded-xl bg-yellow-300 font-semibold text-blue-600 px-3 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
        >
          {action === "login" ? "Sign Up" : "Sign In"}
        </button>

        <h2 className="text-yellow-300 font-extrabold text-5xl">
          Welcome to Chatty!
        </h2>
        <p className="font-semibold text-slate-300">
          {action === "login" ? "Sign in to continue!" : "Sign up to continue!"}
        </p>

        <form method="POST" className="rounded-2xl bg-gray-200 p-6 w-96">
          <FormFields
            htmlFor="email"
            label="Email"
            value={formData.email}
            onChange={(e) => handleInputChange(e, "email")}
          />
          <FormFields
            htmlFor="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={(e) => handleInputChange(e, "password")}
          />

          {action === "register" && (
            <>
              <FormFields
                htmlFor="firstName"
                label="First Name"
                onChange={(e) => handleInputChange(e, "firstName")}
                value={formData.firstName}
              />
              <FormFields
                htmlFor="lastName"
                label="Last Name"
                onChange={(e) => handleInputChange(e, "lastName")}
                value={formData.lastName}
              />
            </>
          )}

          <div className="w-full text-center">
            <button
              type="submit"
              name="_action"
              value={action}
              className="rounded-xl mt-2 bg-yellow-300 px-3 py-2 text-blue-600 font-semibold transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
            >
              {action === "login" ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
