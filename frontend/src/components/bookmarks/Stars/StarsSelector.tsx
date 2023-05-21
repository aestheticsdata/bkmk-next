import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import type { UseFormSetValue, FieldValues } from "react-hook-form";

const StarsSelector = ({ setValue }: { setValue: UseFormSetValue<FieldValues> }) => {
  const [starsNumberHover, setStarsNumberHover] = useState<number>(0);
  const [starsNumberClicked, setStarsNumberClicked] = useState<number>(0);

  useEffect(() => {
    setValue("stars", 0);
  }, []);

  return (
    <div
      className="flex items-center h-6"
      onMouseLeave={() => !starsNumberClicked && setStarsNumberHover(0)}
    >
      {
        [1,2,3,4,5].map(i => {
          return (
            <div
              key={`star-${i}`}
              className="hover:cursor-pointer mx-0.5 text-pink-600"
              onMouseOver={() => !starsNumberClicked && setStarsNumberHover(i)}
              onClick={() => {
                if (!starsNumberClicked) {
                  setStarsNumberClicked(i);
                  setValue("stars", i);
                }}
              }
            >
              {starsNumberClicked >= i ?
                <FontAwesomeIcon icon={faStar} />
                :
                starsNumberHover >= i ?
                  <FontAwesomeIcon icon={faStar} />
                  :
                  <FontAwesomeIcon icon={faStarRegular} />
              }
            </div>
          )
        })
      }
    </div>
  );
}

export default StarsSelector;
