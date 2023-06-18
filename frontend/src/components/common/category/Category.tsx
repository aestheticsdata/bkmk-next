import adjustFontColor from "@components/common/helpers/adjustFontColor";

import type { Category } from "@components/bookmarks/interfaces/bookmark";


const getCategoryComponent = (item: Category) => {
  return (
    <div
      key={`${item.name}-${item.color}`}
      className="flex justify-center rounded uppercase mx-1 px-1"
      style={{
        color: `${adjustFontColor(item.color)}`,
        backgroundColor: `${item.color}`,
      }}
    >
      {item.name}
    </div>
  );
};



export default getCategoryComponent;