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
 * client has its CSRF token on the very first render, with no round trip of its own.
 *
 * ⚠️ **`modal` is a parallel slot** (COS-319), and it is a prop because `app/(private)/@modal/`
 * exists — Next hands every `@folder` under a layout to it by name. It renders **outside** `AppShell`
 * on purpose: a dialog portals itself to `document.body` anyway, and putting the slot inside the
 * shell would only suggest a nesting that does not survive the portal.
 *
 * What is in it is the edit modal, and what makes it work is the three files beside it: the
 * interception, `default.tsx` for a fresh load, and the catch-all that empties the slot when you
 * navigate away. Each of the three says what it is for. */
export default async function PrivateLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
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
      {modal}
    </AuthProvider>
  );
}
