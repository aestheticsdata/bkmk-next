import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortDown,
  faSortUp
} from "@fortawesome/free-solid-svg-icons";

interface Cell {
  width: string;
  onClick: (property: string) => void;
  propertyActive: string;
  label: string;
  value: string;
  justify?: string;
  displayLabel?: boolean;
  textSmall?: boolean;
}

const Cell = ({ width, label, value, textSmall = false, onClick, propertyActive, justify="justify-center", displayLabel=true }: Cell) => {
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    if (propertyActive !== value) {
      setClickCount(0);
    }
  }, [propertyActive]);

  const getIcon = () => {
    if (clickCount === 0) {
      return (
        <div>
          <FontAwesomeIcon icon={faSort}/>
        </div>
      );
    }
    if (clickCount === 1) {
      return (
        <div>
          <FontAwesomeIcon icon={faSortUp}/>
        </div>
      );
    }
    if (clickCount === 2) {
      return (
        <div>
          <FontAwesomeIcon icon={faSortDown}/>
        </div>
      );
    }
  }

  return (
    <div
      className={`flex ${justify} ${textSmall && "text-tiny"} items-center space-x-2 ${width} hover:bg-white py-1 cursor-pointer active:bg-grey0 ${clickCount !== 0 && "bg-lime-300 font-bold"}`}
      onClick={() => {
        onClick(value);
        setClickCount((clickCount + 1)%3)
      }}
    >
      {displayLabel &&
        <div className="uppercase">{label}</div>
      }
      {getIcon()}

    </div>
  )
}

export default Cell;
