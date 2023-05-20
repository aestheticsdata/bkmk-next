import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";

const StarsSelector = ({ setValue }: { setValue: any }) => {
  return (
    <>
      <div className="hover:cursor-pointer mx-0.5" onClick={() => {setValue("stars", 1)}}>
        <FontAwesomeIcon icon={faStarRegular} />
      </div>
      <div className="hover:cursor-pointer mx-0.5" onClick={() => {setValue("stars", 2)}}>
        <FontAwesomeIcon icon={faStarRegular} />
      </div>
      <div className="hover:cursor-pointer mx-0.5" onClick={() => {setValue("stars", 3)}}>
        <FontAwesomeIcon icon={faStarRegular} />
      </div>
      <div className="hover:cursor-pointer mx-0.5" onClick={() => {setValue("stars", 4)}}>
        <FontAwesomeIcon icon={faStarRegular} />
      </div>
      <div className="hover:cursor-pointer mx-0.5" onClick={() => {setValue("stars", 5)}}>
        <FontAwesomeIcon icon={faStarRegular} />
      </div>
    </>
  );
}

export default StarsSelector;
