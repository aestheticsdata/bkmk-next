import SortBar from "@components/shared/sortBar/SortBar";
import ToolsBar from "@components/shared/toolsBar/ToolsBar";

/* ⚠️ **What is left of this file is legacy.** DS 03 (COS-292) took its chrome away: the
 * navigation bar is gone for good — the shell's top chrome and tab bar do that job now —
 * and every private screen is already wrapped by `AppShell` from
 * `app/(private)/layout.tsx`.
 *
 * All that remains is the old tool bar and sort bar, kept because nothing replaces them
 * yet: removing them here would cost the legacy screens their pagination, filters, back,
 * edit and delete controls several tickets before the GRAPHITE command bar arrives. They
 * leave screen by screen with the UI lot, and this file leaves with the last of them.
 *
 * The `mt-*` offsets inside the legacy screens still clear a navigation bar that no longer
 * exists, so their content sits lower in the desk than it needs to. Not worth fixing on
 * files that are being deleted. */
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
      {displayTools && (
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
      )}
      {children}
    </div>
  );
};

export default Layout;
