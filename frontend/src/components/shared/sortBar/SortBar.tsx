import Cell from "@components/shared/sortBar/Cell";

const SortBar = () => {
  return (
    <div className="flex w-full mt-24 bg-grey0 text-xxs select-none">
      <Cell width="w-[20px]" />
      <Cell width="w-[400px]" label="title" />
      <Cell width="w-[78px]" label="stars" />
      <Cell width="w-[300px]" label="notes" />
      <Cell width="w-[80px]" label="priority" />
      <div className="flex w-[240px]" />
      <Cell width="w-[120px]" label="screenshot" justify="justify-start" />
      <Cell width="w-[120px]" label="alarm" justify="justify-start" />
      <Cell width="w-[160px]" label="date added" />
    </div>
  )
}

export default SortBar;
