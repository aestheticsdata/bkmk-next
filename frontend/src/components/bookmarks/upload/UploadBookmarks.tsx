import { useForm } from "react-hook-form";
import useBookmarks from "@components/bookmarks/services/useBookmarks";

import type { FieldValues } from "react-hook-form";

const doc = `
le format est le suivant:
en faisant sed -n 'l' session_buddy_export_2023_02_11_15_45_34.txt, on a:

\\357\\273\\277\\357\\273\\277huge-session-07-01-23--3$
$
   Framework reimagined for the edge! - Qwik$
   https://qwik.builder.io/?ck_subscriber_id=887768181$
$
   Send Email using Yahoo in JavaScript from Windows Store Apps - HTML5 - UWP$
   https://www.emailarchitect.net/easendmail/kb/javascript_xaml.aspx?cat=3$
$
   Optimizing React performance without refs and memo | Alex Sidorenko$
   https://alexsidorenko.com/blog/react-optimize-rerenders-without-refs-memo/$
$
   useEffect$
   https://beta.reactjs.org/reference/react/useEffect$
$
   How To Develop and Build Next.js App with NodeJS Backend | by Bhargav Bachina | Bachina Labs | Medium$
   https://medium.com/bb-tutorials-and-thoughts/how-to-develop-and-build-next-js-app-with-nodejs-backend-7ff91841bd3$

où "$" est la caractère de fin de ligne.

`;

const UploadBookmarks = () => {
  const { register, handleSubmit, formState: { isSubmitted } } = useForm();
  const { uploadBookmarks } = useBookmarks();

  const onSubmit = (e: FieldValues) => {
    const formData = new FormData();
    formData.append("bookmark_file", e["bookmark_file"].length > 0 ? e["bookmark_file"][0] : "");
    const entries = formData.entries();
    const data = Object.fromEntries(entries);
    uploadBookmarks.mutate(data);
  }

  return (
    <div className="flex flex-col w-full pt-14 m-2 text-sm space-y-2">
      <div className="italic">Le format doit être un fichier .txt exporté par le plugin Chrome Session Buddy</div>
      <a
        className="hover:text-white italic"
        href="https://chrome.google.com/webstore/detail/session-buddy/edacconmaakjimmfgnblocblbcdcpbko"
        target="_blank"
      >
        https://chrome.google.com/webstore/detail/session-buddy/edacconmaakjimmfgnblocblbcdcpbko
      </a>
      <pre className="text-tiny leading-3">
        {doc}
      </pre>
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
            hover:shadow-login focus:outline-none p-1
            ${isSubmitted && "pointer-events-none text-grey01 border-grey01"}
          `}
          type="submit"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default UploadBookmarks;
