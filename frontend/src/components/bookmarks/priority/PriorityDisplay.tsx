import getPriorityNumber from "@helpers/getPriorityNumber";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpLong } from "@fortawesome/free-solid-svg-icons";

import type { Priority } from "@helpers/getPriorityNumber";

interface PriorityDisplayProps {
  priorityLevel: Priority;
}

const PriorityDisplay = ({ priorityLevel }: PriorityDisplayProps) => {
  return (
    <>
      {(new Array(getPriorityNumber(priorityLevel))
          .fill(0))
          .map((_, idx) =>
            <FontAwesomeIcon
              icon={faArrowUpLong}
              key={`${idx}-${priorityLevel}`}
            />
        )
      }
    </>
  )


}

export default PriorityDisplay;
