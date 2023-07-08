interface RowProps {
  label: string;
  children: JSX.Element;
}

const Row = ({ label, children }: RowProps) =>
  <div className="flex justify-start items-center">
    <div className="w-[100px]">
      {label}
    </div>
    <div className="w-[900px]">
      {children}
    </div>
  </div>
;

export default Row;
