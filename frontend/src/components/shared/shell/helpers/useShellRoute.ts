"use client";

import { ROUTES } from "@components/shared/config/constants";
import { usePathname } from "next/navigation";

import type { ShellRoute } from "@components/shared/shell/interfaces/shell";

/** `trailingSlash: true` makes every path end with a slash, and `ROUTES.bookmarks` carries
 *  a query string. Normalise both sides before comparing them — the same helper the old
 *  NavBar needed. */
const normalise = (path: string): string => path.split("?")[0].replace(/\/+$/, "") || "/";

const CREATE = normalise(ROUTES.bookmarksCreation.path);
const UPLOAD = normalise(ROUTES.bookmarksBatchUpload.path);
const REMINDERS = normalise(ROUTES.bookmarksReminders.path);
const ABOUT = normalise(ROUTES.about.path);
const LIST = normalise(ROUTES.bookmarks.path);

/* Which screen is on, and which tab is lit for it.
 *
 * Order matters: the three static children of `/bookmarks` have to be matched **before**
 * the catch-all, or `/bookmarks/create` would read as a record whose id is "create".
 *
 * Everything under `/bookmarks/` that is not one of them is a record — the fiche today,
 * and `/bookmarks/edit/<id>` until COS-319 turns it into an interception. All of them keep
 * `index` lit, which is the handoff's behaviour.
 *
 * `about` lights no tab: it is reachable from the chrome's meta row, not from the four
 * modules.
 *
 * **The record's id comes from here too** (COS-301), because the status bar prints `record <id>` and
 * a layout cannot be handed anything by the page it renders. The path already carries it, so reading
 * it off the address bar costs nothing and cannot go stale. The pattern is what keeps
 * `/bookmarks/edit/12` — a `detail` screen whose next segment is a word — from printing `record
 * edit`; it falls back to the index counter, which is what that screen showed before. */
const RECORD_ID = /^\d+$/;

const useShellRoute = (): ShellRoute => {
  const path = normalise(usePathname() ?? "");

  if (path === CREATE) return { screen: "create", tab: "create", recordId: null };
  if (path === UPLOAD) return { screen: "upload", tab: "upload", recordId: null };
  if (path === REMINDERS) return { screen: "reminders", tab: "reminders", recordId: null };
  if (path === ABOUT) return { screen: "about", tab: null, recordId: null };
  if (path.startsWith(`${LIST}/`)) {
    const segment = path.slice(LIST.length + 1);
    return { screen: "detail", tab: "list", recordId: RECORD_ID.test(segment) ? segment : null };
  }
  if (path === LIST) return { screen: "list", tab: "list", recordId: null };

  return { screen: "list", tab: null, recordId: null };
};

export default useShellRoute;
