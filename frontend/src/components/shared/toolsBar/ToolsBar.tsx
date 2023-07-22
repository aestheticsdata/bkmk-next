import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@components/shared/toolsBar/pagination/Pagination";
import { ROUTES } from "@components/shared/config/constants";
import Filters from "@components/shared/toolsBar/filters/Filters";

interface ToolBarProps {
  backButton: boolean;
  editButton?: boolean;
  filters?: boolean;
}

const ToolsBar = ({ backButton, editButton = false, filters = false }: ToolBarProps) => {
  const router = useRouter();
  return (
    <div className="fixed flex w-full py-2 mt-14 bg-grey01 h-[40px]">
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
