import type { Profile } from "@prisma/client";

interface props {
  profile: Profile;
  className?: string;
  onClick?: (...args: any) => any;
}

/**
 * A component that renders a circle with the first letter of the user's first and last names
 * @param param0 profile data and optional className and onClick functions 
 * @returns The circle with the first letter of the user's first and last names 
 */
export function UserCircle({ profile, className, onClick }: props) {
  return (
    <div
      className={`${className} cursor-pointer bg-gray-400 rounded-full flex justify-center items-center`}
      onClick={onClick}
    >
      <h2>
        {profile.firstName.charAt(0).toUpperCase()}
        {profile.lastName.charAt(0).toUpperCase()}
      </h2>
    </div>
  );
}
