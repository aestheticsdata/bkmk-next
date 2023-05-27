import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import CreatableSelect from 'react-select/creatable';
import StarsSelector from "@components/bookmarks/Stars/StarsSelector";
import useCategories from "@components/common/category/services/useCategories";
import Row from "@components/bookmarks/create/Row";

import type { FieldValues } from "react-hook-form";

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "highest", label: "Highest" },
];

const alarmOptions = [
  { value: 1, label: "1 jour"},
  { value: 2, label: "2 jours"},
  { value: 5, label: "5 jours"},
  { value: 10, label: "10 jours"},
  { value: 15, label: "2 semaines"},
  { value: 30, label: "1 mois"},
]

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
  const { register, handleSubmit, control, setValue, watch, formState: { errors, isDirty, isValid} } = useForm({ mode: "onChange" });
  const watchImageFile = watch("screenshot");
  const { categories } = useCategories();

  const [screenshotFile, setScreenshotFile] = useState<string>("");
  // const onFileInputChange = (e) => { setInvoicefile(e.target.files[0]) };
  useEffect(() => {
    console.log("screenshotFile", screenshotFile);
  }, [screenshotFile]);

  useEffect(() => {
    categories.length > 0 && console.log("categories", categories);
  }, [categories]);

  useEffect(() => {
    // console.log("watchImageFile", watchImageFile);
    if (watchImageFile && watchImageFile.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotFile(reader.result.toString());
      }
      console.log("watchImageFile", watchImageFile[0])
      reader.readAsDataURL(watchImageFile[0]);
    }
  }, [watchImageFile]);

  const onSubmit = (e: FieldValues) => {
    console.log("onSubmit ", e);
  }

  return (
    <div className="flex w-full pt-14 text-sm">
      <form
        className="flex flex-col pl-4 pt-4 space-y-4 w-full text-formsGlobalColor"
        onSubmit={handleSubmit(onSubmit)}
      >

        <div className=" w-11/12 flex flex-col">
          <Row label="Title">
            <input
              type="text"
              placeholder="title"
              className="w-full border-b border-b-formsGlobalColor bg-transparent px-2 text-sm placeholder-grey2
                outline-none focus:border-b-2"
              {...register("title", { required: true })}
            />
          </Row>
          {errors.title &&
            <div className="flex text-red-500 justify-start">titre obligatoire</div>
          }
        </div>

        <div className="w-11/12 flex flex-col">
          <Row label="Url">
            <input
              type="text"
              placeholder="url"
              className="w-full border-b border-b-formsGlobalColor bg-transparent px-2 text-sm placeholder-grey2
                outline-none focus:border-b-2"
              {...register("url")}
            />
          </Row>
        </div>

        <div className="w-11/12 flex flex-col">
          <Row label="Categories">
            <Controller
              name="categories"
              control={control}
              render={({ field }) =>
                <CreatableSelect
                  isMulti
                  styles={selectOptionsCSS("500px")}
                  {...field}
                  options={categories}
                />
            }
            />
          </Row>
        </div>

        <div className="w-11/12 flex flex-col">
          <Row label="Notes">
            <textarea
              cols={80}
              rows={10}
              className="bg-transparent border rounded border-formsGlobalColor
                outline-gray-600 focus:border-none focus:outline-none focus:outline-formsGlobalColorHover
                focus:border-none"
              {...register("notes")}
            />
          </Row>
        </div>

        <div className="w-11/12 flex flex-col">
          <Row label="Stars">
            <StarsSelector setValue={setValue} />
          </Row>
        </div>

        <div className="w-11/12 flex flex-col">
          <Row label="Priority">
            <Controller
              name="Priority"
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
          </Row>
        </div>

        <div className="w-11/12 flex flex-col">
          <Row label="Reminder">
            <Controller
              name="Reminder"
              control={control}
              render={({ field }) =>
                <Select
                  isClearable={true}
                  styles={selectOptionsCSS("170px")}
                  {...field}
                  options={alarmOptions}
                />
              }
            />
          </Row>
        </div>

        <div className="w-11/12 flex flex-col">
          <Row label="Screenshot">
            <>
              <input
                type="file"
                id="screnshotFileInputID"
                accept="image/jpeg"
                {...register("screenshot")}
              />
              {screenshotFile && <img src={screenshotFile} />}
            </>
          </Row>
        </div>

        <div className="w-11/12 flex flex-col">
          <Row label="Group">
            <div>group</div>
          </Row>
        </div>

        <div className="w-11/12 flex flex-col">
          <Row label="">
            <div className="w-[120px]">
              <button
                disabled={!isDirty || !isValid}
                className={`h-8 rounded border border-formsGlobalColor bg-transparent bg-grey01alpha text-sm
                  font-medium uppercase text-formsGlobalColor transition-all hover:text-formsGlobalColorHover
                  hover:shadow-login focus:outline-none p-1
                  ${(!isDirty || !isValid) && "pointer-events-none text-grey01 border-grey01"}`
                }
              >
                Submit
              </button>
            </div>
          </Row>
        </div>

      </form>
    </div>
  )
};

export default CreateBookmark;
