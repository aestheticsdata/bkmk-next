// @ts-nocheck
export const selectOptionsCSS = (width) => ({
  // voir https://react-select.com/styles#inner-components
  option: (baseStyles) => ({
    ...baseStyles,
    cursor: "pointer",
  }),
  control: (baseStyles, state) => ({
    ...baseStyles,
    cursor: "pointer",
    width,
    backgroundColor: "transparent",
    borderColor: "rgb(73,73,73)",
    boxShadow: "none",
    ":hover": {
      borderColor: "rgb(5, 5, 5)",
    },
  }),
  indicatorSeparator: (baseStyles) => ({
    ...baseStyles,
    color: "red",
  }),
  menuList: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: "grey",
    color: "#333",
  }),
});
