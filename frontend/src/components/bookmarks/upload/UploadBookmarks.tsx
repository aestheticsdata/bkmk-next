import { useForm } from "react-hook-form";
import useBookmarks from "@components/bookmarks/services/useBookmarks";

import type { FieldValues } from "react-hook-form";

const UploadBookmarks = () => {
  const { register, handleSubmit } = useForm();
  const { uploadBookmarks } = useBookmarks();

  const onSubmit = (e: FieldValues) => {
    const formData = new FormData();
    console.log("e", e);
    formData.append("bookmark_file", e["bookmark_file"].length > 0 ? e["bookmark_file"][0] : "");
    const entries = formData.entries();
    const data = Object.fromEntries(entries);
    uploadBookmarks.mutate(data);
  }

  return (
    <div className="flex flex-col w-full pt-14 m-2 text-sm space-y-2">
      <div>Upload bookmarks</div>
      <div>Le format doit être un fichier txt exporté par le plugin Chrome Session Buddy</div>
      <a
        className="hover:text-white"
        href="https://chrome.google.com/webstore/detail/session-buddy/edacconmaakjimmfgnblocblbcdcpbko"
        target="_blank"
      >
        https://chrome.google.com/webstore/detail/session-buddy/edacconmaakjimmfgnblocblbcdcpbko
      </a>
      <form
        className="flex flex-col space-y-2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <input
          type="file"
          id="bookmarksUploadID"
          accept="text/plain"
          {...register("bookmark_file")}
        />
        <button
          className={`
            w-[80px] h-8 rounded border border-formsGlobalColor bg-transparent bg-grey01alpha text-sm
            font-medium uppercase text-formsGlobalColor transition-all hover:text-formsGlobalColorHover
            hover:shadow-login focus:outline-none p-1`
          }
          type="submit"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default UploadBookmarks;
