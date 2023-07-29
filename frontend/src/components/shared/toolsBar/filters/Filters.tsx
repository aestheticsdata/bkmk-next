import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useForm, Controller } from "react-hook-form";
import queryString from "query-string";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import useCategories from "@components/common/category/services/useCategories";
import Row from "@components/bookmarks/create/Row";
import { selectOptionsCSS } from "@components/common/form/css";
import { alarmOptions } from "@components/common/alarm/constants";

import type { FieldValues } from "react-hook-form";

const starsOptions = [
  { value: 1, label: "1 étoile"},
  { value: 2, label: "2 étoiles"},
  { value: 3, label: "3 étoiles"},
  { value: 4, label: "4 étoiles"},
  { value: 5, label: "5 étoiles"},
];

const Filters = () => {
  const {
    control,
    register,
    handleSubmit,
    // reset,
  } = useForm();
  const router = useRouter();
  const { categories } = useCategories();
  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = (e: FieldValues) => {
    console.log("field values : ", e);
    let filters: any = {};
    filters["page"] = 0;
    e.title?.length > 0 && (filters["title"] = e.title.split(" ").join(","));
    e.screenshot && (filters["screenshot"] = 1);
    e.url && (filters["url"] = 1);
    e.notes && (filters["notes"] = 1);
    e.categories?.length > 0 && (filters["categories_id"] = e.categories.map((category: any) => category.id).join(","));
    e.reminder && (filters["reminder"] = e.reminder.value);
    e.stars && (filters["stars"] = e.stars.value);
    console.log("filters : ", queryString.stringify(filters));

    // go to /?page=0 before applying filters //////
    const search = queryString.parse(window.location.search);
    if (Object.keys(search).length === 1 && Number(search.page) > 0) {
      router.push({ query: { page: 0 } });
    }
    // //////////////////////////////////////////////

    router.push({ query: filters});
    setIsOpen(false);
  }

  return (
    <div className="flex relative mx-8 select-none cursor-pointer">

      <div
        className="
          flex justify-center items-center w-[55px] bg-grey1 rounded p-1 hover:bg-grey0 hover:text-grey3 text-xxs font-semibold
          transition-colors ease-linear duration-50"
        onClick={() => { setIsOpen(!isOpen) }}
      >
        FILTERS
      </div>

      {isOpen &&
        <div className="absolute w-[800px] top-[30px] p-4 bg-grey01 rounded shadow-dashboard text-xs space-y-2">
          <form
            className="flex flex-col"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col space-y-4">

              <div className="w-11/12">
                <Row label="Categories">
                  <Controller
                    name="categories"
                    control={control}
                    render={({ field }) =>
                      <Select
                        isMulti
                        styles={selectOptionsCSS("630px")}
                        {...field}
                        options={categories}
                        // value={initialCategories}
                        onChange={(selectedOptions) => {
                          // setinitialCategories(selectedOptions);
                          field.onChange(selectedOptions);
                        }}
                      />
                    }
                  />
                </Row>
              </div>

              <div className="w-11/12">
                <Row label="Title"  childrenWidth="xl">
                  <input
                    type="text"
                    placeholder="title contains"
                    className="w-full border-b border-b-formsGlobalColor bg-transparent pl-0.5 text-xs placeholder-grey2
                      outline-none focus:border-b-2"
                    {...register("title")}
                  />
                </Row>
              </div>

              <div className="w-11/12">
                <Row label="Stars">
                  <Controller
                    name="stars"
                    control={control}
                    render={({ field }) =>
                      <Select
                        isClearable={true}
                        styles={selectOptionsCSS("170px")}
                        {...field}
                        options={starsOptions}
                        // value={initialReminder}
                        onChange={(selectedOption) => {
                          // setInitialReminder(selectedOption);
                          field.onChange(selectedOption);
                        }}
                      />
                    }
                  />
                </Row>
              </div>

              <div className="w-11/12">
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
                        // value={initialReminder}
                        onChange={(selectedOption) => {
                          // setInitialReminder(selectedOption);
                          field.onChange(selectedOption);
                        }}
                      />
                    }
                  />
                </Row>
              </div>

              <div className="w-11/12 flex flex-col">
                <Row label="Contains">
                  <div className="flex space-x-2">

                    <div className="flex space-x-1">
                      <label htmlFor="image">Screenshot</label>
                      <input
                        id="image"
                        type="checkbox"
                        {...register("screenshot")}
                      />
                    </div>

                    <div className="flex space-x-1">
                      <label htmlFor="notes">Notes</label>
                      <input
                        id="notes"
                        type="checkbox"
                        {...register("notes")}
                      />
                    </div>

                    <div className="flex space-x-1">
                      <label htmlFor="url">URL</label>
                      <input
                        id="url"
                        type="checkbox"
                        {...register("url")}
                      />
                    </div>

                  </div>
                </Row>
              </div>

              <div className="w-11/12">
                <Row label="">
                  <div className="flex w-[240px] space-x-4">
                    <button type="submit" className="h-6 rounded border border-formsGlobalColor bg-transparent bg-grey01alpha text-sm
                            font-medium uppercase text-formsGlobalColor transition-all hover:text-formsGlobalColorHover
                            hover:shadow-login focus:outline-none px-1">
                      Filter
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        // reset({
                        //   categories: [],
                        //   title: "",
                        //   stars: null,
                        //   reminder: null,
                        //   screenshot: false,
                        //   notes: false,
                        //   url: false,
                        // });

                        location.href = "/bookmarks?page=0";
                      }}
                      className="
                        h-6 rounded border border-formsGlobalColor bg-transparent bg-grey01alpha text-sm
                        font-medium uppercase text-formsGlobalColor transition-all hover:text-formsGlobalColorHover
                        hover:shadow-login focus:outline-none px-1"
                    >
                      Reset
                    </button>
                  </div>
                </Row>
              </div>


            </div>
          </form>


        </div>
      }


    </div>
  );
}

export default Filters;
