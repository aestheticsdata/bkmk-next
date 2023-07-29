import useReminders from "@components/reminders/services/useReminders";
import { useEffect } from "react";

const Reminders = () => {
  const { data, isLoading } = useReminders();

  useEffect(() => {
    data && console.log("data : ", data);
  }, [data]);

  return (
    <>
    {!isLoading &&
      <div className="flex mt-28">
        Reminders
        Reminders
        Reminders
        Reminders
        Reminders
      </div>
    }
    </>
  )
}

export default Reminders;
