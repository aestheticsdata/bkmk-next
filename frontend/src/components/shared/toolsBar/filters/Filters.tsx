import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import useCategories from "@components/common/category/services/useCategories";
import Row from "@components/bookmarks/create/Row";
import { selectOptionsCSS } from "@components/common/form/css";
import { alarmOptions } from "@components/common/alarm/constants";

import type { FieldValues } from "react-hook-form";

const Filters = () => {
  const { control, register, handleSubmit } = useForm();
  const { categories } = useCategories();
  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = (e: FieldValues) => {
    console.log("field values : ", e);
  }

  return (
    <div className="flex relative mx-8 select-none cursor-pointer">

      <div
        className="
          flex justify-center items-center w-[50px] bg-grey1 rounded p-1 hover:bg-grey0 hover:text-grey3 text-sm font-bold
          transition-colors ease-linear duration-50"
        onClick={() => {setIsOpen(!isOpen)}}
      >
        Filters
      </div>

      {isOpen &&
        <div className="absolute w-[800px] top-[30px] p-4 bg-grey01 rounded shadow-dashboard text-xs">
          <form
            className="flex flex-col"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col space-y-4">

              <div className="w-11/12 flex flex-col">
                <Row label="Categories">
                  <Controller
                    name="categories"
                    control={control}
                    render={({ field }) =>
                      <CreatableSelect
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

              <div className="w-11/12 flex flex-col">
                <Row label="Title">
                  <input
                    type="text"
                    placeholder="title contains"
                    className="w-full border-b border-b-formsGlobalColor bg-transparent pl-0.5 text-xs placeholder-grey2
                      outline-none focus:border-b-2"
                    {...register("title", { required: true })}
                  />
                </Row>
              </div>

              <div className="w-11/12 flex flex-col">
                <Row label="Stars">
                  <input
                    type="text"
                    placeholder="stars"
                    className="w-full border-b border-b-formsGlobalColor bg-transparent pl-0.5 text-xs placeholder-grey2
                      outline-none focus:border-b-2"
                    {...register("stars", { required: true })}
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

            </div>
          </form>
        </div>
      }


    </div>
  );
}

export default Filters;
