interface RowProps {
  label: string;
  children: JSX.Element;
  childrenWidth?: string;
}

const Row = ({ label, children, childrenWidth = "900px" }: RowProps) =>
  <div className="flex justify-start items-center">
    <div className="w-[100px]">
      {label}
    </div>
    <div className={`w-[${childrenWidth}] flex justify-start`}>
      {children}
    </div>
  </div>
;

export default Row;
