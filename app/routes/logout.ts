import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { logout } from "~/ultis/auth.server";

/**
 * This action function will handle the POST request to the logout route 
 * @param param0 the request object 
 * @returns trigger the logout function and redirect the user to the home page
 */
export const action: ActionFunction = async ({ request }) => logout(request);

/**
 * This loader function will handle the GET request to the logout route 
 * @returns redirect the user to the home page
 */
export const loader: LoaderFunction = async () => redirect("/");
