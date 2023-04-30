import { useEffect, useState } from "react";

const useIsWindowResponsive = () => {
  const [isWindowResponsive, setIsWindowResponsive] = useState(false);
  useEffect(() => {
    setIsWindowResponsive(typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches);
  }, []);

  return isWindowResponsive;
}

export default useIsWindowResponsive;
