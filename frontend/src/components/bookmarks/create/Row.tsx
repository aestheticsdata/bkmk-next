interface RowProps {
  label: string;
  children: JSX.Element;
  childrenWidth?: string;
}

const Row = ({ label, children, childrenWidth = "xl" }: RowProps) => {
  let width;
  if (childrenWidth === "xl") {
    width = "w-[900px]";
  }
  if (childrenWidth === "sm") {
    width = "w-[120px]";
  }

  return (
      <div className="flex justify-start items-center">
        <div className="w-[100px]">
          {label}
        </div>
        <div className={`${width} flex justify-start`}>
          {children}
        </div>
      </div>
    )
  }
;

export default Row;
