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
  PAGES,
  ROUTES
} from "@components/shared/config/constants";
import ToolbarButton from "@components/shared/toolsBar/ToolbarButton";

interface ToolBarProps {
  backButton: boolean;
  editButton?: boolean;
  deleteButton?: boolean;
  filters?: boolean;
  editionType?: string;
}

const ToolsBar = ({ backButton, editButton = false, deleteButton = false, filters = false }: ToolBarProps) => {
  const router = useRouter();
  const { deleteBookmark } = useBookmarks(PAGES.BOOKMARKS);
  const [displayDeleteConfirm, setDisplayDeleteConfirm] = useState<boolean>(false);

  return (
    <div className="fixed flex w-full py-2 mt-14 bg-grey01">
      {backButton ? (
        <>
          <ToolbarButton
            onClick={() => { router.back() }}
          >
            <>
              <FontAwesomeIcon icon={faAngleLeft} />
              <div>Back</div>
            </>
          </ToolbarButton>
          {editButton &&
            <ToolbarButton
              onClick={() => {router.push(`${ROUTES.bookmarksEdition.path}/${router.query.id}`)}}
            >
              <>
                <FontAwesomeIcon icon={faPencilAlt} />
                <div>Edit</div>
              </>
            </ToolbarButton>
          }
          {deleteButton &&
            displayDeleteConfirm ?
            <DeleteConfirm
              closeCB={() => { setDisplayDeleteConfirm(false) }}
              deleteCB={() => { deleteBookmark.mutate(+router.query.id!) }}
            />
            :
            <ToolbarButton
              onClick={() => {setDisplayDeleteConfirm(true)}}
            >
              <>
                <FontAwesomeIcon icon={faTrashAlt} />
                <div>Delete</div>
              </>
            </ToolbarButton>
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
