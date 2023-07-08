import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import type { UseFormSetValue, FieldValues } from "react-hook-form";

const StarsSelector = ({ setValue, watch }: { setValue: UseFormSetValue<FieldValues>, watch: any }) => {
  const [starsNumberHover, setStarsNumberHover] = useState<number>(0);
  const [starsNumberClicked, setStarsNumberClicked] = useState<number>(0);
  const [mouseOut, setMouseOut] = useState<boolean>(true);
  const watchStarsChange = watch("stars");

  useEffect(() => {
    setValue("stars", 0);
  }, []);

  useEffect(() => {
    watchStarsChange && setStarsNumberClicked(watchStarsChange);
  }, [watchStarsChange]);

  return (
    <div
      className="flex h-6"
      onMouseLeave={() => !starsNumberClicked && setStarsNumberHover(0)}
    >
      {
        [1,2,3,4,5].map(i => {
          return (
            <div
              key={`star-${i}`}
              className="hover:cursor-pointer mx-0.5 text-pink-600"
              onMouseOver={() => {setMouseOut(false); setStarsNumberHover(i)}}
              onMouseOut={() => {setMouseOut(true)}}
              onClick={() => {
                setStarsNumberClicked(i);
                setValue("stars", i);
              }}
            >
              {starsNumberClicked >= i ?
                <FontAwesomeIcon icon={faStar} />
                :
                !mouseOut && starsNumberHover >= i ?
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
