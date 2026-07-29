"use client";

import { useAuthStore } from "@auth/store/authStore";
import { ROUTES } from "@components/shared/config/constants";
import useIsWindowResponsive from "@components/shared/helpers/useIsWindowResponsive";
// import DatePickerWrapper from "@components/datePickerWrapper/DatePickerWrapper";
// import useGlobalStore from "@components/shared/globalStore";
import UserMenu from "@components/shared/navBar/userMenu/UserMenu";
import { faBookBookmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { AuthType } from "@auth/store/authStore";

const NavBar = () => {
  const token = useAuthStore((state: AuthType) => state.token);
  // const { isCalendarVisible } = useGlobalStore();
  const pathname = usePathname();
  const isWindowResponsive = useIsWindowResponsive();

  // `trailingSlash: true` fait finir les chemins par "/", et ROUTES.bookmarks porte
  // sa query string : on compare des chemins normalisés des deux côtés.
  const normalize = (path: string) => path.split("?")[0].replace(/\/+$/, "") || "/";
  const getActivePath = (route: string) =>
    normalize(route) === normalize(pathname ?? "") ? "bg-spendingItemHover rounded-sm text-blueNavy" : "";
  const getLinkItem = (route: any) => {
    return (
      <a href={route.path}>
        <p
          className={`outline-hidden p-1 ${getActivePath(route.path)} hover:cursor-pointer hover:bg-spendingItemHover hover:text-blueNavy hover:rounded-sm`}
        >
          {route.label}
        </p>
      </a>
    );
  };

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient && token && (
        <div
          className={`flex md:flex-row fixed ${token ? "h-32" : "h-14"} md:h-14 w-screen items-center justify-start bg-blueNavy text-white z-50`}
        >
          {isWindowResponsive && (
            <div className="mx-4">
              <FontAwesomeIcon
                icon={faBookBookmark}
                size="xl"
                color="lime"
              />
            </div>
          )}
          {token ? (
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-5 items-center justify-between font-ubuntu w-full">
              <div className="flex space-x-4">
                {isWindowResponsive && getLinkItem(ROUTES.bookmarks)}
                {isWindowResponsive && getLinkItem(ROUTES.bookmarksCreation)}
                {isWindowResponsive && getLinkItem(ROUTES.bookmarksBatchUpload)}
                {isWindowResponsive && getLinkItem(ROUTES.bookmarksReminders)}
                {/*{isCalendarVisible && <DatePickerWrapper />}*/}
              </div>
              <div className="flex">
                <UserMenu />
              </div>
            </div>
          ) : (
            <div className="flex space-x-5 font-ubuntu">
              {getLinkItem(ROUTES.login)}
              {getLinkItem(ROUTES.signup)}
              {getLinkItem(ROUTES.about)}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default NavBar;
