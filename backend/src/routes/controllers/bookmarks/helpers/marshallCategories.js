module.exports = (rows) => {
  rows.forEach(entry => {
    entry.categories = [];
    if (entry.categories_names) {
      const categories_names = entry.categories_names.split(",");
      const categories_colors = entry.categories_colors.split(",");
      entry.categories = categories_names.map((c, i) => {
        return {
          name: c,
          color: categories_colors[i],
        }
      })
    }
    delete entry.categories_names;
    delete entry.categories_colors;
  });

  return rows;
}
