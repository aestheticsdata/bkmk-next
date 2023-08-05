import { useRouter } from "next/router";
import queryString from "query-string";
import Cell from "@components/shared/sortBar/Cell";
import { COLUMN_WIDTH } from "@components/shared/config/constants";

const SortBar = () => {
  const router = useRouter();

  const onClick = (property: string) => {
    let search = queryString.parse(window.location.search);
    let qs: string;

    if (!search.sort) {
      qs = queryString.stringify({ ...search, sort: property });
    } else {
      const sortProperties = (search.sort as String).split(',');
      const propertyIndex = sortProperties.indexOf(property);

      if (propertyIndex !== -1) {
        sortProperties.splice(propertyIndex, 1);
      } else {
        sortProperties.push(property);
      }

      if (sortProperties.length > 0) {
        qs = queryString.stringify({ ...search, sort: sortProperties.join(',') });
      } else {
        delete search.sort;
        qs = queryString.stringify(search);
      }
    }

    router.push({ query: qs });
  };


  return (
    <div className="flex w-full mt-24 bg-grey0 text-xxs select-none">
      <Cell width={COLUMN_WIDTH.linkIcon} label="link" onClick={onClick} displayLabel={false} />
      <Cell width={COLUMN_WIDTH.title} label="title" onClick={onClick} />
      <Cell width={COLUMN_WIDTH.stars} label="stars" onClick={onClick} />
      <Cell width={COLUMN_WIDTH.notes} label="notes" onClick={onClick} />
      <Cell width={COLUMN_WIDTH.priority} label="priority" onClick={onClick} />
      <div className={`flex ${COLUMN_WIDTH.categories}`} />
      <Cell width={COLUMN_WIDTH.screenshot} label="screenshot" justify="justify-start" onClick={onClick} />
      <Cell width={COLUMN_WIDTH.alarm} label="alarm" justify="justify-start" onClick={onClick} />
      <Cell width={COLUMN_WIDTH.dateAdded} label="date added" onClick={onClick} />
    </div>
  )
}

export default SortBar;
