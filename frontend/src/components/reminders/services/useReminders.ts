import { useAuth } from "@auth/context/AuthContext";
import { QUERY_KEYS } from "@components/bookmarks/config/constants";
import useRequestHelper from "@helpers/useRequestHelper";
import { ReminderListSchema } from "@src/schemas/reminders";
import { useQuery } from "@tanstack/react-query";

const useReminders = () => {
  const { privateRequest } = useRequestHelper();
  const userID = useAuth().user?.id;

  const getReminders = async () => {
    const response = await privateRequest(`/reminders?userID=${userID}`);
    // The boundary: the service returns validated reminders, not an axios response.
    return ReminderListSchema.parse(response.data);
  };

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.REMINDERS],
    queryFn: () => getReminders(),
  });

  return {
    data,
    isLoading,
  };
};

export default useReminders;
