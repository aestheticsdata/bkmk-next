import { AuthProvider } from "@auth/context/AuthContext";
import { getServerSession } from "@auth/server/getServerSession";

/* The public tree gets a provider too (COS-296), unseeded when there is no session.
 *
 * It is not decoration: `/login` and `/signup` call `setCredentials`, which writes the CSRF
 * token into the context, and `/logout` needs to read that token to send its `POST`. Both
 * would throw outside a provider.
 *
 * Unlike the private layout this one never redirects — it has nowhere to send anyone — and it
 * **swallows a failing session lookup**. A visitor arriving at `/login` while the API is down
 * still has to get a form to look at; treating the outage as "not signed in" is exactly right
 * here, where it would be wrong on a private screen. */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession().catch(() => null);

  return (
    <AuthProvider
      initialUser={session?.user ?? null}
      initialCsrfToken={session?.csrfToken ?? null}
    >
      {children}
    </AuthProvider>
  );
}
