import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@components/shared/toolsBar/pagination/Pagination";

interface ToolBarProps {
  backButton: boolean;
}

const ToolsBar = ({ backButton }: ToolBarProps) => {
  const router = useRouter();
  return (
    <div className="fixed flex w-full py-2 mt-14 bg-grey01 h-[40px]">
      {backButton ? (
        <div
          className="flex items-center cursor-pointer hover:bg-grey1 hover:text-white space-x-1 text-sm px-1 mx-1 rounded"
          onClick={() => { router.back() }}
        >
          <FontAwesomeIcon icon={faAngleLeft} />
          <div>Back</div>
        </div>
      )
      :
        <Pagination />
      }
    </div>
  )
}

export default ToolsBar;
