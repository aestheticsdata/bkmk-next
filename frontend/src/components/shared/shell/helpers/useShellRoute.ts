"use client";

import { ROUTES } from "@components/shared/config/constants";
import { usePathname } from "next/navigation";

import type { ShellScreen, ShellTab } from "@components/shared/shell/interfaces/shell";

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
 * modules. */
const useShellRoute = (): { screen: ShellScreen; tab: ShellTab | null } => {
  const path = normalise(usePathname() ?? "");

  if (path === CREATE) return { screen: "create", tab: "create" };
  if (path === UPLOAD) return { screen: "upload", tab: "upload" };
  if (path === REMINDERS) return { screen: "reminders", tab: "reminders" };
  if (path === ABOUT) return { screen: "about", tab: null };
  if (path.startsWith(`${LIST}/`)) return { screen: "detail", tab: "list" };
  if (path === LIST) return { screen: "list", tab: "list" };

  return { screen: "list", tab: null };
};

export default useShellRoute;
