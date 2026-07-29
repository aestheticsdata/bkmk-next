interface ToolbarButtonProps {
  children: React.JSX.Element;
  onClick: () => void;
}

const ToolbarButton = ({ children, onClick }: ToolbarButtonProps) => (
  <div
    className="flex items-center cursor-pointer hover:bg-grey1 hover:text-white space-x-1 text-sm px-1 mx-1 rounded-sm"
    onClick={onClick}
  >
    {children}
  </div>
);

export default ToolbarButton;
