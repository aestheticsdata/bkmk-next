"use client";

import useSignOut from "@auth/useSignOut";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { SHELL_TEXT } from "@text/shell";
import { GlobeIcon, KeyRoundIcon, LogOutIcon, ShieldIcon } from "lucide-react";

/* The account menu (COS-321): what the chrome's e-mail opens.
 *
 * **It exists because that e-mail used to sign you out on the first click** — a link to `/logout`,
 * no menu, no confirmation, one pixel away from the module tabs. DS 03 left it deliberately: the
 * legacy menu it deleted was the only way out of a session, and a link kept that way open for a
 * ticket. This is the ticket.
 *
 * **The e-mail is the trigger's accessible name, and nothing overrides it.** Radix marks the button
 * `aria-haspopup="menu"`, which is what says a menu opens; an `aria-label` here would replace the
 * address with a phrase and take the one piece of information the row carries — *which* account is
 * signed in — away from anyone not reading the screen.
 *
 * **Three entries are drawn disabled.** `change password` needs a route that died before DS 03,
 * the recovery passphrase needs a column read and a form that asks for the current password, and
 * `language` needs a translation layer that does not exist. What is *not* drawn is the chevron the
 * design puts on `language`: a chevron is a promise that a submenu opens, and it would not.
 *
 * The lit row is `focus:`, never `hover:` — see `ui/dropdown-menu`, where Radix's pointer-follows-
 * focus behaviour makes one rule cover both. */
function UserMenu({ email }: { email: string }) {
  const signOut = useSignOut();

  return (
    <DropdownMenu>
      {/* **The hover is the chrome's own, not a shade of ink.** A 10px label going from `fg-3` to
          `fg` is a change you find after you have already clicked; the module tabs light a
          `white/22` wash inside a 24px box, and the two controls in the meta row — this one and
          `about` — are spaced to match (see `TopChrome`). The wash stays while the menu is open: the
          trigger of an open surface should read as held down. */}
      <DropdownMenuTrigger className="flex h-6 items-center rounded-md px-2 text-3xs text-gr-fg-3 transition-colors duration-120 outline-none hover:bg-white/22 hover:text-gr-fg focus-visible:ring-3 focus-visible:ring-gr-ring data-[state=open]:bg-white/22 data-[state=open]:text-gr-fg-2">
        {email}
      </DropdownMenuTrigger>

      {/* Anchored to the right edge of the trigger, which is the right edge of the chrome: the menu
          grows leftwards into the desk instead of off the screen. */}
      <DropdownMenuContent
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel>{SHELL_TEXT.menu.caption}</DropdownMenuLabel>

        <DropdownMenuItem disabled>
          <KeyRoundIcon />
          {SHELL_TEXT.menu.password}
        </DropdownMenuItem>

        <DropdownMenuItem disabled>
          <ShieldIcon />
          {SHELL_TEXT.menu.passphrase}
        </DropdownMenuItem>

        <DropdownMenuItem disabled>
          <GlobeIcon />
          {SHELL_TEXT.menu.language}
          <span className="ml-auto text-gr-fg-4">{SHELL_TEXT.menu.languageValue}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* `onSelect` rather than `onClick`: Radix fires it for the pointer and for `↵` alike, and
            closes the menu itself. The oxide ink is the `destructive` variant — this is the one
            control in the chrome that ends something. */}
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => void signOut()}
        >
          <LogOutIcon />
          {SHELL_TEXT.menu.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { UserMenu };
