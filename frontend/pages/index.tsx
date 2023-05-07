import { useRouter } from "next/router";
import { useEffect } from "react";

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/bookmarks");
  }, []);
};

Home.auth = true;

export default Home;
