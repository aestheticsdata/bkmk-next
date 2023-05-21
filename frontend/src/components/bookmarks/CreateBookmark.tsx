import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import CreatableSelect from 'react-select/creatable';
import StarsSelector from "@components/bookmarks/Stars/StarsSelector";

import type { FieldValues } from "react-hook-form";

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'highest', label: 'Highest' },
];

const categoriesList = [
  { value: 'ocean', label: 'Ocean', color: '#00B8D9' },
  { value: 'blue', label: 'Blue', color: '#0052CC' },
  { value: 'purple', label: 'Purple', color: '#5243AA' },
  { value: 'red', label: 'Red', color: '#FF5630'},
  { value: 'orange', label: 'Orange', color: '#FF8B00' },
  { value: 'yellow', label: 'Yellow', color: '#FFC400' },
  { value: 'green', label: 'Green', color: '#36B37E' },
  { value: 'forest', label: 'Forest', color: '#00875A' },
  { value: 'slate', label: 'Slate', color: '#253858' },
  { value: 'silver', label: 'Silver', color: '#666666' },
];

const selectOptionsCSS = (width) => ({
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
  })
});

const CreateBookmark = () => {
  const { register, handleSubmit, control, setValue, formState: { errors, isDirty, isValid} } = useForm({ mode: "onChange" });

  const onSubmit = (e: FieldValues) => {
    console.log("onSubmit ", e);
  }

  return (
    <div className="pt-14">
      <form
        className="flex flex-col items-center space-y-8 w-full text-formsGlobalColor"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="relative w-11/12 flex flex-col justify-center">
          <div className="flex">
            <div>Title</div>
            <input
              type="text"
              placeholder="title"
              className="w-full border-b border-b-formsGlobalColor bg-transparent px-2 text-xl placeholder-grey2
                outline-none focus:border-b-2"
              {...register("title", { required: true })}
            />
          </div>
          {errors.title &&
            <div className="flex text-red-500 justify-start">titre obligatoire</div>
          }
        </div>

        <div className="relative w-11/12 flex flex-col justify-center">
          <div className="flex">
            <div>url</div>
            <input
              type="text"
              placeholder="url"
              className="w-full border-b border-b-formsGlobalColor bg-transparent px-2 text-xl placeholder-grey2
                outline-none focus:border-b-2"
              {...register("url")}
            />
          </div>
        </div>

        <div className="relative w-11/12 flex flex-col justify-center">
          <div className="flex">
            <div>Notes</div>
            <textarea
              cols={80}
              rows={10}
              className="bg-transparent border rounded border-formsGlobalColor
                outline-gray-600 focus:border-none focus:outline-none focus:outline-formsGlobalColorHover
                focus:border-none"
              {...register("notes")}
            />
          </div>
        </div>

        <div className="relative w-11/12 flex flex-col justify-center">
          <div className="flex">
            <div>Priority</div>
            <Controller
              name="priority"
              control={control}
              render={({ field }) =>
                <Select
                  isClearable={true}
                  styles={selectOptionsCSS("170px")}
                  {...field}
                  options={priorityOptions}
                />
              }
            />
          </div>
        </div>

        <div className="relative w-11/12 flex flex-col justify-center">
          <div className="flex">
            <div>catégories</div>
            <Controller
              name="categories"
              control={control}
              render={({ field }) =>
                <CreatableSelect
                  isMulti
                  styles={selectOptionsCSS("500px")}
                  {...field}
                  options={categoriesList}
                />
            }
            />
          </div>
        </div>

        <div className="relative w-11/12 flex flex-col justify-center">
          <div className="flex">
            <div>stars</div>
            <StarsSelector setValue={setValue} />
          </div>
        </div>

        <button
          disabled={!isDirty || !isValid}
          className={`h-8 w-11/12 rounded border border-formsGlobalColor bg-transparent bg-grey01alpha text-2xl
            font-medium uppercase text-formsGlobalColor transition-all hover:text-formsGlobalColorHover
            hover:shadow-login focus:outline-none
            ${(!isDirty || !isValid) && "pointer-events-none text-grey01 border-grey01"}`
          }
        >
          submit
        </button>

      </form>
    </div>
  )
};

export default CreateBookmark;
