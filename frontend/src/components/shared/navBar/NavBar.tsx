import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookBookmark } from "@fortawesome/free-solid-svg-icons";
// import DatePickerWrapper from "@components/datePickerWrapper/DatePickerWrapper";
// import useGlobalStore from "@components/shared/globalStore";
import UserMenu from "@components/shared/navBar/userMenu/UserMenu";
import useIsWindowResponsive from "@components/shared/helpers/useIsWindowResponsive";
import { ROUTES } from "@components/shared/config/constants";
import { useAuthStore } from "@auth/store/authStore";

import type { AuthType } from "@auth/store/authStore";

const NavBar = () => {
  const token = useAuthStore((state: AuthType) => state.token);
  // const { isCalendarVisible } = useGlobalStore();
  const router = useRouter();
  const isWindowResponsive = useIsWindowResponsive();

  const getActivePath = (route: string) => route === router.pathname ? "bg-spendingItemHover rounded text-blueNavy" : "";
  const getLinkItem = (route: any) => {
    return (
      <a href={route.path}>
        <p className={`outline-hidden p-1 ${getActivePath(route.path)} hover:cursor-pointer hover:bg-spendingItemHover hover:text-blueNavy hover:rounded`}>
          {route.label}
        </p>
      </a>
    )
  }

  return (
    <div className={`flex md:flex-row fixed ${token ? "h-32" : "h-14"} md:h-14 w-screen items-center justify-start bg-blueNavy text-white z-50`}>
      {isWindowResponsive &&
        <div className="mx-4">
          <FontAwesomeIcon icon={faBookBookmark} size="xl" color="lime"/>
        </div>
      }
      {token ? (
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-5 items-center justify-between font-ubuntu w-full">
          <div className="flex space-x-4">
            {isWindowResponsive && getLinkItem(ROUTES.bookmarks)}
            {isWindowResponsive && getLinkItem(ROUTES.bookmarksCreation)}
            {isWindowResponsive && getLinkItem(ROUTES.bookmarksBtachUpload)}
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
  );
};

export default NavBar;
