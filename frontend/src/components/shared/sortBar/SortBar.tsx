import Cell from "@components/shared/sortBar/Cell";
import { COLUMN_WIDTH } from "@components/shared/config/constants";

const SortBar = () => {
  return (
    <div className="flex w-full mt-24 bg-grey0 text-xxs select-none">
      <Cell width={COLUMN_WIDTH.linkIcon} />
      <Cell width={COLUMN_WIDTH.title} label="title" />
      <Cell width={COLUMN_WIDTH.stars} label="stars" />
      <Cell width={COLUMN_WIDTH.notes} label="notes" />
      <Cell width={COLUMN_WIDTH.priority} label="priority" />
      <div className={`flex ${COLUMN_WIDTH.categories}`} />
      <Cell width={COLUMN_WIDTH.screenshot} label="screenshot" justify="justify-start" />
      <Cell width={COLUMN_WIDTH.alarm} label="alarm" justify="justify-start" />
      <Cell width={COLUMN_WIDTH.dateAdded} label="date added" />
    </div>
  )
}

export default SortBar;
