import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";

const Stars = ({ count }: { count: number }) => {
  const MAX_STARS = 5;
  const getStars = (starType: "solid" | "empty", i: number) => (
    <div className="text-pink-600" key={i+200}>
      <FontAwesomeIcon icon={starType === "solid" ? faStar : faStarRegular} />
    </div>
  )

  return (
    <div className="flex">
      {[...Array(count)].map((_, i) => (getStars("solid", i)))}
      {[...Array(MAX_STARS - count)].map((_, i) => (getStars("empty", i)))}
    </div>
  )
}

export default Stars;
