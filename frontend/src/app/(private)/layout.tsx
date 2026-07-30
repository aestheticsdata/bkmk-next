import { AuthProvider } from "@auth/context/AuthContext";
import { getServerSession } from "@auth/server/getServerSession";
import { AppShell } from "@components/shared/shell/AppShell";
import { redirect } from "next/navigation";

/* Every private screen renders inside the GRAPHITE shell, and the shell renders only once the
 * session is known.
 *
 * The check is now **server-side** (COS-296): `getServerSession` asks `GET /users/me` with the
 * request's cookie, and a visitor without a session is redirected before anything is sent to
 * the browser. `RequireAuth` is gone with it — it read a JWT from `localStorage`, which the
 * server cannot see, so it had to paint "Loading …" and let children mount and fire
 * unauthenticated requests while it waited for zustand to rehydrate.
 *
 * The provider is seeded from that same answer, so the chrome has the account email and the
 * client has its CSRF token on the very first render, with no round trip of its own. */
export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <AuthProvider
      initialUser={session.user}
      initialCsrfToken={session.csrfToken}
    >
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
