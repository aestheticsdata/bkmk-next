import { useQuery } from "@tanstack/react-query";
import useRequestHelper from "@helpers/useRequestHelper";
import { useUserStore } from "@auth/store/userStore";
import { QUERY_KEYS } from "@components/bookmarks/config/constants";

import type {UserStore}  from "@auth/store/userStore";

const useReminders = () => {
  const { privateRequest } = useRequestHelper();
  const userID = useUserStore((state: UserStore) => state.user?.id);

  const getReminders = () => {
    try {
      return privateRequest(`/reminders?userID=${userID}`);
    } catch (e) {
      console.log("get reminders error : ", e);
    }
  }

  const {data, isLoading} = useQuery({
    queryKey: [QUERY_KEYS.REMINDERS],
    queryFn: () => getReminders(),
  });

  return {
    data,
    isLoading,
  }
}

export default useReminders;
