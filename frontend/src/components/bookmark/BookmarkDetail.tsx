import fr from "date-fns/locale/fr";
import format from "date-fns/format";
import useBookmark from "@components/bookmark/services/useBookmark";
import StarsDisplay from "@components/common/stars/StarsDisplay";
import PriorityDisplay from "@components/common/priority/PriorityDisplay";
import Categories from "@components/common/category/Categories";
import useGetScreenshot from "@helpers/getScreenshot";
import { alarmOptions } from "@components/common/alarm/constants";

const BookmarkDetail = ({ id } : { id: string }) => {
  const { isLoading, bookmark } = useBookmark(id);
  const imageUrl = useGetScreenshot(bookmark);

  const getHTML = (notes: string) => {
    let decodedNotes = decodeURIComponent(notes);
    const regex = /https?:\/\/[^\s/$.?#].\S*/g;
    const matches = decodedNotes.match(regex);
    if (matches) {
      for (const link of matches) {
        decodedNotes = decodedNotes.replace(
          link,
          `<a
              href="${link}"
              target='_blank'
              class="cursor-pointer hover:bg-lime-300 underline hover:no-underline text-xs whitespace-nowrap"
            >
            ${link}
          </a>`
        );
      }
    }

    console.log(decodedNotes);
    return decodedNotes;
  }

  return (
    <div className="flex flex-col pl-2">
      {bookmark &&
        <>
          <div className="font-semibold py-2">
            {decodeURIComponent(bookmark.title)}
          </div>

          {bookmark.original_url &&
            <div className="text-sm">
              <a
                href={bookmark.original_url}
                className="hover:text-white hover:underline transition-colors ease-linear duration-50"
                target="_blank"
                onClick={(e) => {e.stopPropagation()}}
              >

                {bookmark.original_url}
              </a>
            </div>
          }

          {bookmark.stars > 0 &&
            <div className="py-2 text-sm">
              <StarsDisplay count={bookmark.stars} />
            </div>
          }

          {bookmark.screenshot &&
            <div className="py-2">
              <img
                className="border-8 rounded border-grey2"
                src={imageUrl}
                width="50%"
                alt="screenshot"
              />
            </div>
          }

          {bookmark.notes &&
            <div className="text-sm py-2 w-[550px] whitespace-pre-wrap italic">
              <div dangerouslySetInnerHTML={{__html: getHTML(bookmark.notes) }} />

            </div>
          }

          {bookmark.priority &&
            <div className="text-sm py-2">
              Priorité : <PriorityDisplay priorityLevel={bookmark.priority} />
            </div>
          }

          {bookmark.categories.length > 0 &&
            <div className="text-sm py-2">
              <Categories categories={bookmark.categories} />
            </div>
          }

          {!!bookmark.alarm_frequency &&
            <div className="text-sm py-2">
              Reminder: { (alarmOptions.find(o => o.value === bookmark.alarm_frequency))!.label }
            </div>
          }

          <div className="text-xs py-2">
            Ajouté le: {format(new Date(bookmark.date_added!), "dd MMM yyyy", { locale: fr })}
          </div>
        </>
      }
    </div>
  )
}

export default BookmarkDetail;
