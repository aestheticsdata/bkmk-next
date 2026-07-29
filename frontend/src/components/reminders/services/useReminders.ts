import { useUserStore } from "@auth/store/userStore";
import { QUERY_KEYS } from "@components/bookmarks/config/constants";
import useRequestHelper from "@helpers/useRequestHelper";
import { ReminderListSchema } from "@src/schemas/reminders";
import { useQuery } from "@tanstack/react-query";

import type { UserStore } from "@auth/store/userStore";

const useReminders = () => {
  const { privateRequest } = useRequestHelper();
  const userID = useUserStore((state: UserStore) => state.user?.id);

  const getReminders = async () => {
    const response = await privateRequest(`/reminders?userID=${userID}`);
    // La frontière : le service rend des rappels validés, pas une réponse axios.
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
