"use client";

import useBookmarks from "@components/bookmarks/services/useBookmarks";
import DeleteConfirm from "@components/common/deleteConfirm/DeleteConfirm";
import { PAGES, ROUTES } from "@components/shared/config/constants";
import Pagination from "@components/shared/toolsBar/pagination/Pagination";
import ToolbarButton from "@components/shared/toolsBar/ToolbarButton";
import { faAngleLeft, faPencilAlt, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

/* ⚠️ **No `filters` any more** (COS-300). This bar used to be able to render the inline filter
 * panel; the GRAPHITE filter modal replaces it, it lives on the index screen, and no page had
 * passed `filters` since UI 03 took that screen over — so the panel had been unreachable for a
 * ticket already. The flag went with it rather than being left as a switch with nothing behind it. */
interface ToolBarProps {
  backButton: boolean;
  editButton?: boolean;
  deleteButton?: boolean;
  editionType?: string;
}

const ToolsBar = ({ backButton, editButton = false, deleteButton = false }: ToolBarProps) => {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const { deleteBookmark } = useBookmarks(PAGES.BOOKMARKS);
  const [displayDeleteConfirm, setDisplayDeleteConfirm] = useState<boolean>(false);

  return (
    <div className="fixed flex w-full py-2 mt-14 bg-grey01">
      {backButton ? (
        <>
          <ToolbarButton
            onClick={() => {
              router.back();
            }}
          >
            <>
              <FontAwesomeIcon icon={faAngleLeft} />
              <div>Back</div>
            </>
          </ToolbarButton>
          {editButton && (
            <ToolbarButton
              onClick={() => {
                router.push(`${ROUTES.bookmarksEdition.path}/${params.id}`);
              }}
            >
              <>
                <FontAwesomeIcon icon={faPencilAlt} />
                <div>Edit</div>
              </>
            </ToolbarButton>
          )}
          {deleteButton && displayDeleteConfirm ? (
            <DeleteConfirm
              closeCB={() => {
                setDisplayDeleteConfirm(false);
              }}
              deleteCB={() => {
                deleteBookmark.mutate(Number(params.id));
              }}
              invertHover={true}
            />
          ) : (
            <ToolbarButton
              onClick={() => {
                setDisplayDeleteConfirm(true);
              }}
            >
              <>
                <FontAwesomeIcon icon={faTrashAlt} />
                <div>Delete</div>
              </>
            </ToolbarButton>
          )}
        </>
      ) : (
        <div className="flex">
          <Pagination />
        </div>
      )}
    </div>
  );
};

export default ToolsBar;
