import { redirect } from "next/navigation";
import { getCurrentUserOnServer } from "@/core/auth/server-auth";
import {
  getDefaultPageForRole,
  getRolePathFromNumber,
} from "@/core/lib/role-utils";
import { DashboardShell } from "./_components/dashboard-shell";

/**
 * Dashboard layout — Server Component.
 *
 * Runs on the server before any HTML reaches the browser:
 *   1. Forwards the request's session cookie to the backend /me endpoint.
 *   2. If unauthenticated → redirect to /login (no flash of the dashboard).
 *   3. If the user's actual role doesn't match the URL's role segment
 *      (e.g. a Dean visiting /admin/...) → redirect to their correct
 *      role's default page (no flash of the wrong dashboard).
 *
 * The interactive shell (sidebar, header, overlays, role guard for in-role
 * page permissions, token refresh, activity tracking) lives in
 * `_components/dashboard-shell.tsx` as a Client Component and receives the
 * already-fetched user as a prop so it renders with correct identity on
 * first paint.
 */

const PATH_ROLE_MAP: Record<string, number> = {
  dean: 1,
  staff: 2,
  admin: 3,
  "student-director": 4,
  "campus-director": 5,
  vpaa: 6,
  vpsas: 7,
  vpaf: 8,
  vprde: 9,
  head: 10,
  multimedia: 11,
  "university-president": 12,
};

interface RoleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ role: string }>;
}

export default async function RoleLayout({
  children,
  params,
}: RoleLayoutProps) {
  const { role: roleSegment } = await params;

  const user = await getCurrentUserOnServer();
  if (!user) {
    redirect("/login");
  }

  const expectedRoleNumber = PATH_ROLE_MAP[roleSegment];
  if (
    expectedRoleNumber !== undefined &&
    expectedRoleNumber !== user.role
  ) {
    const correctPath = getRolePathFromNumber(user.role);
    // Never redirect to the segment we're already on — if the "correct" path
    // equals the current one, the mismatch is a data artifact (e.g. the
    // backend serialized the role as a string) and redirecting would loop
    // forever (ERR_TOO_MANY_REDIRECTS).
    if (correctPath !== roleSegment) {
      const defaultPage = getDefaultPageForRole(user.role);
      redirect(`/${correctPath}/${defaultPage}`);
    }
  }

  return (
    <DashboardShell
      initialUser={{
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      }}
    >
      {children}
    </DashboardShell>
  );
}
