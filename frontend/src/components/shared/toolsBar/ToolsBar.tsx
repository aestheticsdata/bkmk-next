import { useState } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faPencilAlt,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@components/shared/toolsBar/pagination/Pagination";
import Filters from "@components/shared/toolsBar/filters/Filters";
import DeleteConfirm from "@components/common/deleteConfirm/DeleteConfirm";
import useBookmarks from "@components/bookmarks/services/useBookmarks";
import {
  EDITION_TYPES, PAGES,
  ROUTES
} from "@components/shared/config/constants";

interface ToolBarProps {
  backButton: boolean;
  editButton?: boolean;
  deleteButton?: boolean;
  filters?: boolean;
  editionType?: string;
}

const ToolsBar = ({ backButton, editButton = false, deleteButton = false, filters = false, editionType = "" }: ToolBarProps) => {
  const router = useRouter();
  const { deleteBookmark } = useBookmarks(PAGES.BOOKMARKS);
  const [displayDeleteConfirm, setDisplayDeleteConfirm] = useState<boolean>(false);

  return (
    <div className="fixed flex w-full py-2 mt-14 bg-grey01">
      {backButton ? (
        <>
          <div
            className="flex items-center cursor-pointer hover:bg-grey1 hover:text-white space-x-1 text-sm px-1 mx-1 rounded"
            onClick={() => { router.back() }}
          >
            <FontAwesomeIcon icon={faAngleLeft} />
            <div>Back</div>
          </div>
          {editButton &&
            <div
              className="flex items-center cursor-pointer hover:bg-grey1 hover:text-white space-x-1 text-sm px-1 mx-1 rounded"
              onClick={() => {router.push(`${ROUTES.bookmarksEdition.path}/${router.query.id}`)}}
            >
              <FontAwesomeIcon icon={faPencilAlt} />
              <div>Edit</div>
            </div>
          }
          {deleteButton &&
            displayDeleteConfirm ?
            <DeleteConfirm
              closeCB={() => { setDisplayDeleteConfirm(false) }}
              deleteCB={() => { deleteBookmark.mutate(+router.query.id!) }}
            />
            :
            <div
              className="flex items-center cursor-pointer hover:bg-grey1 hover:text-white space-x-1 text-sm px-1 mx-1 rounded"
              onClick={() => {setDisplayDeleteConfirm(true)}}
            >
              <FontAwesomeIcon icon={faTrashAlt} />
              <div>Delete</div>
            </div>
          }
        </>
      )
      :
        <div className="flex">
          <Pagination />
          {filters &&
           <Filters />
          }
        </div>
      }
    </div>
  )
}

export default ToolsBar;
