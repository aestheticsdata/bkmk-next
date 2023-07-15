module.exports = (rows) => {
  rows.forEach(entry => {
    entry.categories = [];
    if (entry.categories_names) {
      const categories_names = entry.categories_names.split(",");
      const categories_colors = entry.categories_colors.split(",");
      const categories_id = entry.categories_id.length > 1 ? entry.categories_id.split(",") : entry.categories_id;

      entry.categories = categories_names.map((c, i) => {
        return {
          name: c,
          color: categories_colors[i],
          id: categories_id[i],
        }
      })
    }
    delete entry.categories_names;
    delete entry.categories_colors;
  });

  return rows;
}
