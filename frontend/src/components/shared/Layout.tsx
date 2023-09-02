import NavBar from "@src/components/shared/navBar/NavBar";
import ToolsBar from "@components/shared/toolsBar/ToolsBar";
import SortBar from "@components/shared/sortBar/SortBar";

interface LayoutProps {
  isLogin?: boolean;
  displayTools?: boolean;
  backButton?: boolean;
  editButton?: boolean;
  deleteButton?: boolean;
  filters?: boolean;
  sortbar?: boolean;
  children: React.ReactNode;
}

const Layout = ({
  isLogin,
  displayTools = true,
  backButton = false,
  editButton = false,
  deleteButton = false,
  filters = false,
  sortbar = false,
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
              deleteButton={deleteButton}
              filters={filters}
            />
          </div>
          {sortbar && <SortBar />}
        </>
      }
      {children}
    </div>
  );
};

export default Layout;
