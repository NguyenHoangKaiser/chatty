import type { LoaderFunction } from "@remix-run/node"; // <-- Remix runs the loader function before serving your page. This means any redirects in a loader will trigger before your page can be served.
import { requireUserId } from "~/ultis/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  // Not logged in user try to navigate to the base route (/) should be redirected to the login screen with a redirectTo param in the URL.
  await requireUserId(request);
  return null;
};

export default function Index() {
  return (
    <div className="h-screen bg-slate-700 flex justify-center items-center">
      <h2 className="text-blue-600 font-extrabold text-5xl">
        TailwindCSS Is Working!
      </h2>
    </div>
  );
}
