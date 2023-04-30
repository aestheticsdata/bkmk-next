import NavBar from "@src/components/shared/navBar/NavBar";

interface LayoutProps {
  isLogin?: boolean;
  children: React.ReactNode;
}

const Layout = ({ isLogin, children }: LayoutProps) => {
  return (
    <div className={`flex flex-col ${isLogin ? "items-center" : "items-start"} bg-grey1`}>
      <NavBar />
      {children}
    </div>
  );
};

export default Layout;
