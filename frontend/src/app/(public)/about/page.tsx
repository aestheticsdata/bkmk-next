import { getServerSession } from "@auth/server/getServerSession";
import { Card } from "@components/ds/Card";
import { KeyValueTable } from "@components/ds/KeyValueTable";
import { Overline } from "@components/ds/Overline";
import { ROUTES } from "@components/shared/config/constants";
import { AppShell } from "@components/shared/shell/AppShell";
import { AuthShell } from "@components/shared/shell/AuthShell";
import { ABOUT_TEXT } from "@text/about";
import Link from "next/link";

/* About (COS-305) — the legal notice, repainted in GRAPHITE.
 *
 * The same 480px block as the sign-in screen, in the same order: overline, title, card, and the way
 * back. What changes with the visitor is the **frame around it and where "back" goes**.
 *
 * ⚠️ **The page is reached from two places, and one of them has a session.** The sign-in and sign-up
 * screens link here (`about bkmk →`), and so does the chrome's meta row on every application screen.
 * Framing it as auth-only sent anyone signed in to `/login` on the way out — out of the app, from a
 * page they opened to read four lines. So the session decides: `AppShell` and back to the index when
 * there is one, `AuthShell` and back to sign-in when there is not.
 *
 * The shell was already expecting this — `useShellRoute` maps `/about` to a screen with no tab lit,
 * and `SHELL_STATUS` has carried its entry since DS 03.
 *
 * It stays in `(public)` rather than moving to `(private)`: that group's layout redirects anyone
 * without a session, which is exactly what this page must not do.
 *
 * The way back is a `<Link>` rather than `router.back()`: `/about` can be opened from an address
 * bar, and a history with nothing behind it makes a dead control. */
export default async function AboutPage() {
  const session = await getServerSession().catch(() => null);
  const signedIn = Boolean(session?.user);

  const notice = (
    <div className="w-120 max-w-full">
      <Overline className="mb-1.5 block">{ABOUT_TEXT.overline}</Overline>
      <h1 className="mb-5 text-2xl font-semibold tracking-snug text-gr-fg-2">{ABOUT_TEXT.title}</h1>

      <Card className="p-5.5 @max-3xl:p-4">
        <KeyValueTable rows={ABOUT_TEXT.rows.map((row) => ({ ...row }))} />
      </Card>

      <Overline
        asChild
        className="mt-3.5 inline-block text-gr-accent hover:text-gr-fg-2"
      >
        <Link href={signedIn ? ROUTES.bookmarks.path : ROUTES.login.path}>
          {signedIn ? ABOUT_TEXT.backToIndex : ABOUT_TEXT.back}
        </Link>
      </Overline>
    </div>
  );

  /* Centred on the desk, the way `AuthShell` centres it on the field: it is the same block, and it
     should not jump to the top-left corner because the visitor happens to have a session. The desk
     is a flex column, so the grid takes the leftover height and `place-items-center` does the rest —
     and on a window too short for the block, grid centring still lets it scroll in both directions
     where a centred flex child would be clipped at the top.

     `grid-cols-1` for the reason `AuthShell` writes out at length (COS-311): an implicit `auto`
     track is sized by the block, so the block's own 100% ceiling measures itself and never folds. */
  if (signedIn) {
    return (
      <AppShell>
        <div className="grid min-h-0 flex-1 grid-cols-1 place-items-center">{notice}</div>
      </AppShell>
    );
  }

  return (
    <AuthShell
      screen={ABOUT_TEXT.screen}
      hints={[]}
    >
      {notice}
    </AuthShell>
  );
}
