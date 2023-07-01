import NavBar from "@src/components/shared/navBar/NavBar";
import ToolsBar from "@components/shared/toolsBar/ToolsBar";
import { useUserStore } from "@auth/store/userStore";

import type { UserStore } from "@auth/store/userStore";

interface LayoutProps {
  isLogin?: boolean;
  children: React.ReactNode;
}

const Layout = ({ isLogin, children }: LayoutProps) => {
  const user = useUserStore((state: UserStore) => state.user);
  return (
    <div className={`flex flex-col ${isLogin ? "items-center" : "items-start"} bg-grey1`}>
      <NavBar />
      {user && <ToolsBar />}
      {children}
    </div>
  );
};

export default Layout;
