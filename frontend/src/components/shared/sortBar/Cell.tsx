import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";

interface Cell {
  width: string;
  label?: string;
  justify?: string;
}

const Cell = ({ width, label, justify="justify-center" }: Cell) => {
  return (
    <div
      className={`flex ${justify} items-center space-x-2 ${width} hover:bg-white py-1 cursor-pointer active:bg-grey0`}
      onClick={() => {}}
    >
      {label && <div className="uppercase">{label}</div>}
      <div>
        <FontAwesomeIcon icon={faSort} />
      </div>
    </div>
  )
}

export default Cell;
