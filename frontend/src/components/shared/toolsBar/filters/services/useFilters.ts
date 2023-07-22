import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import useRequestHelper from "@helpers/useRequestHelper";

const useFilters = () => {
  const { privateRequest } = useRequestHelper();
  const filterBookmarksService = async () => {
    try {
      return privateRequest()
    } catch (e) {

    }
  }

  const filterBookmarks = () => {

  }
}

export default useFilters();
