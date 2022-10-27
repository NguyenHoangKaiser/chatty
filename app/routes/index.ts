import type { LoaderFunction} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { requireUserId } from '~/ultis/auth.server';

/**
 * This loader function will handle the GET request to the (/) main route  
 * @param param0 the request object  
 * @returns redirect the user to the home page  
 */
export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request); // <-- if the user is not logged in, redirect them to the login page
  return redirect('/home');
};
