import NavBar from "@src/components/shared/navBar/NavBar";
import ToolsBar from "@components/shared/toolsBar/ToolsBar";

interface LayoutProps {
  isLogin?: boolean;
  displayTools?: boolean;
  backButton?: boolean;
  editButton?: boolean;
  children: React.ReactNode;
}

const Layout = ({
  isLogin,
  displayTools = true,
  backButton = false,
  editButton = false,
  children,
}: LayoutProps) => {
  return (
    <div className={`flex flex-col ${isLogin ? "items-center" : "items-start"} bg-grey1`}>
      <NavBar />
      {displayTools &&
        <ToolsBar
          backButton={backButton}
          editButton={editButton}
        />
      }
      {children}
    </div>
  );
};

export default Layout;
