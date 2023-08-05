import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";

interface Cell {
  width: string;
  onClick: (property: string) => void;
  label: string;
  justify?: string;
  displayLabel?: boolean;
}

const Cell = ({ width, label, onClick, justify="justify-center", displayLabel=true }: Cell) => {
  return (
    <div
      className={`flex ${justify} items-center space-x-2 ${width} hover:bg-white py-1 cursor-pointer active:bg-grey0`}
      onClick={() => {onClick(label)}}
    >
      {displayLabel &&
        <div className="uppercase">{label}</div>
      }
      <div>
        <FontAwesomeIcon icon={faSort} />
      </div>
    </div>
  )
}

export default Cell;
