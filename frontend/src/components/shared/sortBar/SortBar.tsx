import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";

const SortBar = () => {
  return (
    <div className="flex w-full mt-24 bg-grey0 text-xxs select-none">
      <div
        className="flex justify-center items-center w-[20px] hover:bg-white py-1 cursor-pointer active:bg-grey0"
        onClick={() => {}}
      >
        <FontAwesomeIcon icon={faSort} />
      </div>
      <div
        className="flex justify-center items-center space-x-2 w-[400px] hover:bg-white py-1 cursor-pointer active:bg-grey0"
        onClick={() => {}}
      >
        <div className="uppercase">title</div>
        <div>
          <FontAwesomeIcon icon={faSort} />
        </div>
      </div>

      <div
        className="flex justify-center items-center space-x-2 hover:bg-white py-1 w-[78px] cursor-pointer active:bg-grey0"
        onClick={() => {}}
      >
        <div className="uppercase">stars</div>
        <div>
          <FontAwesomeIcon icon={faSort} />
        </div>
      </div>

      <div
        className="flex justify-center items-center space-x-2 hover:bg-white w-[300px] cursor-pointer active:bg-grey0"
        onClick={() => {}}
      >
        <div className="uppercase">notes</div>
        <div>
          <FontAwesomeIcon icon={faSort} />
        </div>
      </div>

      <div
        className="flex justify-center items-center space-x-2 hover:bg-white w-[80px] cursor-pointer active:bg-grey0"
        onClick={() => {}}
      >
        <div className="uppercase">priority</div>
        <div>
          <FontAwesomeIcon icon={faSort} />
        </div>
      </div>

      <div className="flex w-[240px]" />

      <div
        className="flex justify-start items-center space-x-2 hover:bg-white w-[120px] cursor-pointer active:bg-grey0"
        onClick={() => {}}
      >
        <div className="uppercase">screenshot</div>
        <div>
          <FontAwesomeIcon icon={faSort} />
        </div>
      </div>

      <div
        className="flex justify-start items-center space-x-2 hover:bg-white w-[120px] cursor-pointer active:bg-grey0"
        onClick={() => {}}
      >
        <div className="uppercase">alarm</div>
        <div>
          <FontAwesomeIcon icon={faSort} />
        </div>
      </div>

      <div
        className="flex justify-center items-center space-x-2 hover:bg-white w-[160px] cursor-pointer active:bg-grey0"
        onClick={() => {}}
      >
        <div className="uppercase">date added</div>
        <div>
          <FontAwesomeIcon icon={faSort} />
        </div>
      </div>
    </div>
  )
}

export default SortBar;
