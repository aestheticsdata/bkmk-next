import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import type { UseFormSetValue, FieldValues } from "react-hook-form";

const StarsSelector = ({ setValue, watch }: { setValue: UseFormSetValue<FieldValues>, watch: any }) => {
  const [starsNumberHover, setStarsNumberHover] = useState<number>(0);
  const [starsNumberClicked, setStarsNumberClicked] = useState<number>(0);
  const [mouseOut, setMouseOut] = useState<boolean>(true);
  const [isClearVisible, setIsClearVisible] = useState<boolean>(false);
  const watchStarsChange = watch("stars");

  useEffect(() => {
    setValue("stars", 0);
  }, []);

  useEffect(() => {
    watchStarsChange && setStarsNumberClicked(watchStarsChange);
  }, [watchStarsChange]);

  return (
    <div
      className="flex h-6 items-center"
      onMouseLeave={() => {
        !starsNumberClicked && setStarsNumberHover(0);
        setIsClearVisible(false);
      }}
      onMouseOver={() => {setIsClearVisible(true)}}
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
      {
        isClearVisible &&
          <div
            className="ml-2 cursor-pointer hover:text-grey2"
            onClick={() => {
              setStarsNumberClicked(0);
              setValue("stars", 0);
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </div>
      }
    </div>
  );
}

export default StarsSelector;
