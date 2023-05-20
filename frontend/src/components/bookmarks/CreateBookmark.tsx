import { useForm, Controller } from "react-hook-form";
import Select from "react-select";


const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'highest', label: 'Highest' },
];

const CreateBookmark = () => {
  const { register, handleSubmit, control, formState: { errors, isDirty, isValid} } = useForm({ mode: "onChange" });

  const onSubmit = (e) => {
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
              name="select"
              control={control}
              render={({ field }) =>
                <Select
                  {...field}
                  options={priorityOptions}
                />
              }
            />
          </div>
        </div>

        <button
          disabled={!isDirty || !isValid}
          className="h-8 w-11/12 rounded border border-formsGlobalColor bg-transparent bg-grey01alpha text-2xl
            font-medium uppercase text-formsGlobalColor transition-all hover:text-formsGlobalColorHover
            hover:shadow-login focus:outline-none"
        >
          submit
        </button>

      </form>
    </div>
  )
};

export default CreateBookmark;
