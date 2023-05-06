import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";

import type { SharedLoginFormProps } from "@src/components/shared/sharedLoginForm/interfaces";

const SharedLoginForm = ({
  onSubmit,
  buttonTitle,
  displayEmailField,
  displayPasswordField,
}: SharedLoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty, isValid } } = useForm({ mode: "onChange" });

  return (
    <div className="flex w-full flex-col items-center space-y-8 text-formsGlobalColor">
      <div className="text-4xl font-thin">Bookmark Advanced</div>

      <form className="flex w-full flex-col items-center space-y-8" onSubmit={handleSubmit(onSubmit)}>
        {displayEmailField && (
          <div className="relative w-11/12 flex flex-col justify-center">
            <input
              type="email"
              placeholder="email"
              className="w-full border-b border-b-formsGlobalColor bg-transparent px-2 text-xl placeholder-grey2
              outline-none focus:border-b-2"
              {...register("email", { required: true })}
            />
            {errors.email &&
              <div className="flex text-red-500 justify-start">Email obligatoire</div>
            }
          </div>
        )}
        {displayPasswordField && (
          <div className="relative w-11/12">
            <div className="flex flex-row">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="password"
                className="w-full border-b border-b-formsGlobalColor bg-transparent px-2 text-xl placeholder-grey2
                outline-none focus:border-b-2"
                {...register("password", { required: true })}
              />
              <div
                className="bottom-1 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FontAwesomeIcon icon={faEyeSlash} />
                ) : (
                  <FontAwesomeIcon icon={faEye} />
                )}
              </div>
            </div>
            {errors.password &&
              <div className="flex text-red-500 justify-start">password obligatoire</div>
            }
          </div>
        )}


        <button
          disabled={!isDirty || !isValid}
          className="h-8 w-11/12 rounded border border-formsGlobalColor bg-transparent bg-grey01alpha text-2xl
            font-medium uppercase text-formsGlobalColor transition-all hover:text-formsGlobalColorHover
            hover:shadow-login focus:outline-none"
        >
          {buttonTitle}
        </button>


      </form>
    </div>
  );
};

export default SharedLoginForm;
