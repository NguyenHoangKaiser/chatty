import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUserById } from "~/ultis/user.server";
import { Portal } from "~/components/portal";

export const loader: LoaderFunction = async ({ request, params }) => {
  const { userId } = params;

  if (typeof userId !== "string") {
    return redirect("/home");
  };

  const recipient = await getUserById(userId);
  return json({ recipient });
};

export default function ChattyModal() {
  const {recipient} = useLoaderData();
  return <Portal wrapperId="chatty-modal">
    <h2>User: {recipient.profile.firstName}</h2>
  </Portal>;
}