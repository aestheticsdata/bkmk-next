import NavBar from "@src/components/shared/navBar/NavBar";
import ToolsBar from "@components/shared/toolsBar/ToolsBar";
import SortBar from "@components/shared/sortBar/SortBar";

interface LayoutProps {
  isLogin?: boolean;
  displayTools?: boolean;
  backButton?: boolean;
  editButton?: boolean;
  filters?: boolean;
  children: React.ReactNode;
}

const Layout = ({
  isLogin,
  displayTools = true,
  backButton = false,
  editButton = false,
  filters = false,
  children,
}: LayoutProps) => {
  return (
    <div className={`flex flex-col ${isLogin ? "items-center" : "items-start"} bg-grey1`}>
      <NavBar />
      {displayTools &&
        <>
          <div className="">
            <ToolsBar
              backButton={backButton}
              editButton={editButton}
              filters={filters}
            />
          </div>
          <SortBar />
        </>
      }
      {children}
    </div>
  );
};

export default Layout;
