import RequireAuth from "@auth/guards/RequireAuth";
import { AppShell } from "@components/shared/shell/AppShell";

/* Every private screen renders inside the GRAPHITE shell. It sits **inside** the guard, not
 * outside it: the chrome shows the account email and the real index counters, so it has no
 * business rendering before the session is known.
 *
 * AUTH 04 (COS-296) replaces `RequireAuth` with a server-side session check here; the shell
 * stays exactly where it is. */
export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
