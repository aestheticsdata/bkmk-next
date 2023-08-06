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
      const sortProperties = (search.sort as string).split(',');
      const propertyIndex = sortProperties.findIndex(item => item === property || item === "-" + property);

      if (propertyIndex !== -1) {
        if (!sortProperties[propertyIndex].startsWith("-")) {
          sortProperties.splice(propertyIndex, 1);
          sortProperties.push("-"+property);
        } else {
          sortProperties.splice(propertyIndex, 1);
        }
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
      <Cell width={COLUMN_WIDTH.linkIcon} label="link" value="link" onClick={onClick} displayLabel={false} />
      <Cell width={COLUMN_WIDTH.title} label="title" value="title" onClick={onClick} />
      <Cell width={COLUMN_WIDTH.stars} label="stars" value="stars" onClick={onClick} />
      <Cell width={COLUMN_WIDTH.notes} label="notes" value="notes" onClick={onClick} />
      <Cell width={COLUMN_WIDTH.priority} label="priority" value="priority" onClick={onClick} />
      <div className={`flex ${COLUMN_WIDTH.categories}`} />
      <Cell width={COLUMN_WIDTH.screenshot} label="screenshot" value="screenshot" justify="justify-start" onClick={onClick} />
      <Cell width={COLUMN_WIDTH.alarm} label="alarm" value="alarm" justify="justify-start" onClick={onClick} />
      <Cell width={COLUMN_WIDTH.dateAdded} label="date added" value="date" onClick={onClick} />
    </div>
  )
}

export default SortBar;
