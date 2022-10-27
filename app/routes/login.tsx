import { useState } from "react";
import FormFields from "~/components/form-fields";
import { Layout } from "~/components/layout";
import type { ActionFunction, LoaderFunction } from "@remix-run/node"; // <--- Remix looks for an exported function named action to set up a POST request on the route
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { useRef, useEffect } from "react";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "~/ultis/validators.server";
import { login, register, getUser } from "~/ultis/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  // If there's already a user in the session, redirect to the home page
  return (await getUser(request)) ? redirect("/") : null;
};

export const action: ActionFunction = async ({ request }) => {
  // Get the form data from the request
  const form = await request.formData();
  const action = form.get("_action");
  const email = form.get("email");
  const password = form.get("password");
  let firstName = form.get("firstName");
  let lastName = form.get("lastName");

  // Validate the form data
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

  // Returns an error along with the form field values if any problems occur
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

  // If there are any errors, return them
  if (Object.values(errors).some(Boolean))
    return json(
      {
        errors,
        fields: { email, password, firstName, lastName },
        form: action,
      },
      { status: 400 }
    );

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
  const actionData = useActionData(); // <--- This is where the data from the action function is stored
  const firstLoad = useRef(true);
  const [action, setAction] = useState("login");

  // Sets up an errors variable which will hold field-specific errors, such as "Invalid Email", in an object.
  const [errors, setErrors] = useState(actionData?.errors || {});
  // Sets up a formError variable which will hold error messages to display form messages such as "Incorrect Login".
  const [formError, setFormError] = useState(actionData?.error || "");

  // Updates the formData state variables to default to any values returned by the action function if available.
  const [formData, setFormData] = useState({
    email: actionData?.fields?.email || "",
    password: actionData?.fields?.password || "",
    firstName: actionData?.fields?.lastName || "",
    lastName: actionData?.fields?.firstName || "",
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setFormData((form) => ({ ...form, [field]: event.target.value }));
  };

  // Clear out the form and any errors being shown when the user is shown an error and switches forms.
  useEffect(() => {
    if (!firstLoad.current) {
      const newState = {
        email: "",
        password: "",
        firstName: "",
        lastName: "",
      };
      setErrors(newState);
      setFormError("");
      setFormData(newState);
    }
  }, [action]);

  useEffect(() => {
    if (!firstLoad.current) {
      setFormError("");
    }
  }, [formData]);

  // Bug here
  /* useEffect(() => {
    // We don't want to reset errors on page load because we want to see them
    firstLoad.current = false;
  }, []); */

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
          <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full">
            {formError}
          </div>
          <FormFields
            htmlFor="email"
            label="Email"
            value={formData.email}
            onChange={(e) => handleInputChange(e, "email")}
            error={errors?.email}
          />
          <FormFields
            htmlFor="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={(e) => handleInputChange(e, "password")}
            error={errors?.password}
          />

          {action === "register" && (
            <>
              {/* First Name */}
              <FormFields
                htmlFor="firstName"
                label="First Name"
                onChange={(e) => handleInputChange(e, "firstName")}
                value={formData.firstName}
                error={errors?.firstName}
              />
              {/* Last Name */}
              <FormFields
                htmlFor="lastName"
                label="Last Name"
                onChange={(e) => handleInputChange(e, "lastName")}
                value={formData.lastName}
                error={errors?.lastName}
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
