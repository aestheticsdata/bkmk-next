import { useRouter } from "next/router";
import queryString from "query-string";
import Cell from "@components/shared/sortBar/Cell";
import { COLUMN_WIDTH } from "@components/shared/config/constants";
import { useState } from "react";

const SortBar = () => {
  const router = useRouter();
  const [propertyActive, setPropertyActive] = useState<string>("");

  const onClick = (property: string) => {
    setPropertyActive(property);
    let search = queryString.parse(window.location.search);
    let qs: string;

    if (!search.sort) {
      qs = queryString.stringify({ ...search, sort: property });
    } else {
      const currentSort = search.sort as string;
      const currentSortProperty = currentSort.startsWith("-") ? currentSort.substring(1) : currentSort;

      if (currentSortProperty === property) {
        if (currentSort.startsWith("-")) {
          // Remove sort property from URL
          delete search.sort;
          qs = queryString.stringify(search);
        } else {
          // Change to descending sort
          qs = queryString.stringify({ ...search, sort: `-${property}` });
        }
      } else {
        // Change to a different sort property
        qs = queryString.stringify({ ...search, sort: property });
      }
    }

    router.push({ query: qs });
  };

  return (
    <div className="flex w-full mt-24 bg-grey0 text-xxs select-none">
      <Cell width={COLUMN_WIDTH.linkIcon} label="link" value="link" onClick={onClick} displayLabel={false} propertyActive={propertyActive} />
      <Cell width={COLUMN_WIDTH.title} label="title" value="title" onClick={onClick} propertyActive={propertyActive} />
      <Cell width={COLUMN_WIDTH.stars} label="stars" value="stars" onClick={onClick} propertyActive={propertyActive} />
      <Cell width={COLUMN_WIDTH.notes} label="notes" value="notes" onClick={onClick} propertyActive={propertyActive} />
      <Cell width={COLUMN_WIDTH.priority} label="priority" value="priority" onClick={onClick} propertyActive={propertyActive} />
      <div className={`flex ${COLUMN_WIDTH.categories}`} />
      <Cell width={COLUMN_WIDTH.screenshot} label="screenshot" value="screenshot" justify="justify-start" onClick={onClick} propertyActive={propertyActive} />
      <Cell width={COLUMN_WIDTH.alarm} label="alarm" value="alarm" justify="justify-start" onClick={onClick} propertyActive={propertyActive} />
      <Cell width={COLUMN_WIDTH.dateAdded} label="date added" value="date" onClick={onClick} propertyActive={propertyActive} />
    </div>
  )
}

export default SortBar;
