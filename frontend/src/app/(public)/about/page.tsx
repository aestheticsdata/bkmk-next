import { Card } from "@components/ds/Card";
import { KeyValueTable } from "@components/ds/KeyValueTable";
import { Overline } from "@components/ds/Overline";
import { ROUTES } from "@components/shared/config/constants";
import { AuthShell } from "@components/shared/shell/AuthShell";
import { ABOUT_TEXT } from "@text/about";
import Link from "next/link";

/* About (COS-305) — the legal notice, repainted in GRAPHITE.
 *
 * It is the same 480px block as the sign-in screen, in the same frame, in the same order: overline,
 * title, card, and the way back. The page is public and has no session, so `AuthShell` is the frame
 * — the application chrome carries the modules, the counters and the account email, none of which
 * exists here — and it takes `about` as its screen label.
 *
 * The way back is a `<Link>` rather than `router.back()`: `/about` can be opened from an address
 * bar, and a history with nothing behind it makes a dead control. */
export default function AboutPage() {
  return (
    <AuthShell
      screen={ABOUT_TEXT.screen}
      hints={[]}
    >
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
          <Link href={ROUTES.login.path}>{ABOUT_TEXT.back}</Link>
        </Overline>
      </div>
    </AuthShell>
  );
}
