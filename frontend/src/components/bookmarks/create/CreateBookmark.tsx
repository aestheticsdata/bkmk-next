// @ts-nocheck
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import StarsSelector from "@components/common/stars/StarsSelector";
import useCategories from "@components/common/category/services/useCategories";
import Row from "@components/bookmarks/create/Row";
import useBookmarks from "@components/bookmarks/services/useBookmarks";
import useBookmark from "@components/bookmark/services/useBookmark";
import { ROUTES } from "@components/shared/config/constants";

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


const CreateBookmark = ({ id }) => {
  const router = useRouter();
  const { register, handleSubmit, control, setValue,reset, watch, formState: { errors, isDirty, isValid} } = useForm({
    mode: "onChange",
    defaultValues: {
      categories: [],
      priority: null,
      reminder: null,
    },
  });
  const watchImageFile: unknown = watch("screenshot");
  const { categories } = useCategories();
  const { createBookmark, editBookmark } = useBookmarks();
  const { bookmark } = useBookmark(id);
  const [initialCategories, setinitialCategories] = useState();
  const [initialPriority, setInitialPriority] = useState();
  const [initialReminder, setInitialReminder] = useState();
  const [screenshotFile, setScreenshotFile] = useState<string>("");

  useEffect(() => {
    console.log("oh yeah bookmark !!!", bookmark);
    if (bookmark) {
      reset({
        title: bookmark.title,
        url: bookmark.original_url,
        notes: decodeURIComponent(bookmark.notes ?? ""),
      });
      setValue("stars", bookmark.stars);

      let tempCategories = [];
      if (bookmark.categories.length > 0) {
        bookmark.categories.forEach((category) => {
          tempCategories.push({
            label: category.name,
            value: category.id,
          });
        })
        setinitialCategories(tempCategories);

      }

      if (bookmark.priority) {
        const tempPriority = {
          value: bookmark.priority,
          label: `${bookmark.priority[0].toUpperCase()}${bookmark.priority.slice(1)}`
        };
        setInitialPriority(tempPriority);
      }

      if (bookmark.alarm_frequency) {
        const tempAlarmFrequency = {
          value: bookmark.alarm_frequency,
          label: alarmOptions.find((o)=> o.value === bookmark.alarm_frequency).label,
        }
        setInitialReminder(tempAlarmFrequency);
      }
    }
  }, [bookmark, setValue]);

  useEffect(() => {
    console.log("initialPriority : ", initialPriority);
  }, [initialPriority]);

  useEffect(() => {
    if (watchImageFile && watchImageFile.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotFile(reader.result!.toString());
      }
      reader.readAsDataURL(watchImageFile[0]);
    }
  }, [watchImageFile]);

  const onSubmit = (e: FieldValues) => {
    const formData = new FormData();
    for (const name in e) {
      if (name === "screenshot" && name.length > 1) {
        formData.append("screenshot", e[name].length > 0 ? e[name][0] : "");
      } else if (name === "categories") {
        formData.append(name, JSON.stringify(e[name]));
      } else if (name === "priority") {
        formData.append(name, e[name] ? e[name].value : "");
      } else if (name === "notes") {
        formData.append(name, encodeURIComponent(e[name]));
      } else if (name === "reminder") {
        e[name] && formData.append(name, e[name].value)
      } else {
        formData.append(name, e[name]);
      }

      if (id) {
        formData.append("id", id);
      }
    }
    const entries = formData.entries();
    const data = Object.fromEntries(entries);
    id ? editBookmark.mutate(data) : createBookmark.mutate(data);
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
                  value={id && initialCategories}
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
            <StarsSelector setValue={setValue} watch={watch} />
          </Row>
        </div>

        <div className="w-11/12 flex flex-col">
          <Row label="Priority">
            <Controller
              name="priority"
              control={control}
              render={({ field }) =>
                <Select
                  isClearable={true}
                  styles={selectOptionsCSS("170px")}
                  {...field}
                  options={priorityOptions}
                  value={id && initialPriority}
                  onChange={(selectedOption) => {
                    setInitialPriority(selectedOption);
                    field.onChange(selectedOption);
                  }}
                />
              }
            />
          </Row>
        </div>

        <div className="w-11/12 flex flex-col">
          <Row label="Reminder">
            <Controller
              name="reminder"
              control={control}
              render={({ field }) =>
                <Select
                  isClearable={true}
                  styles={selectOptionsCSS("170px")}
                  {...field}
                  options={alarmOptions}
                  value={id && initialReminder}
                  onChange={(selectedOption) => {
                    setInitialReminder(selectedOption);
                    field.onChange(selectedOption);
                  }}
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
                accept="image/jpeg, image/png"
                {...register("screenshot")}
              />
              {screenshotFile && <img src={screenshotFile} width="320" />}
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
            <div className="flex w-[240px] space-x-4 mb-2">
              <button
                type="submit"
                disabled={!id && (!isDirty || !isValid)}
                className={`h-8 rounded border border-formsGlobalColor bg-transparent bg-grey01alpha text-sm
                  font-medium uppercase text-formsGlobalColor transition-all hover:text-formsGlobalColorHover
                  hover:shadow-login focus:outline-none p-1
                  ${!id && (!isDirty || !isValid) && "pointer-events-none text-grey01 border-grey01"}`
                }
              >
                Submit
              </button>
              {id &&
                <button
                  className="h-8 rounded border border-formsGlobalColor bg-transparent bg-grey01alpha text-sm
                    font-medium uppercase text-formsGlobalColor transition-all hover:text-formsGlobalColorHover
                    hover:shadow-login focus:outline-none p-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(ROUTES.bookmarks.path);
                  }}
                >
                  Cancel
                </button>
              }
            </div>
          </Row>
        </div>

      </form>
    </div>
  )
};

export default CreateBookmark;
