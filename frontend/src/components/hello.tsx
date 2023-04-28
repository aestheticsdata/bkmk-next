"use client";

import {
  useEffect,
  useState
} from "react";
import useRequestHelper from "@/helpers/useRequestHelper";


const Hello = () => {
  const { request } = useRequestHelper();
  const [hello, setHello] = useState("");

  useEffect(() => {
    const getHello = async () => {
      const res = await request("/hello");
      setHello(res.data.hello);
    }
    getHello();
  }, []);

  return (
    <div>{hello}</div>
  )
}

export default Hello;