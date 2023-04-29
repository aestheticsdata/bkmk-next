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
      const res = await request("/users/hello");
      setHello(res.data);
    }
    getHello();
  }, []);

  useEffect(() => {
    console.log("hello value from api", hello);
  }, [hello]);

  return (
    <div>ABC  {hello}  DEF</div>
  )
}

export default Hello;
