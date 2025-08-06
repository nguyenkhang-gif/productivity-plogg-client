import { useDispatch } from "react-redux";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
// import { toggleChapter, deleteChapter } from '../features/chapters/chaptersSlice'
import { toggleChapter, deleteChapter } from "@/redux/epub";
import { Chapter } from "@/redux/epub";
// interface Chapter {
//   id: number;
//   text?: string;
//   title?: string;
//   url?: string;
//   completed: boolean;
// }

interface ChapterListItemProps {
  chapter: Chapter;
  index: number;
  onEdit: (chapter: Chapter) => void;
}

export function ChapterListItem({ chapter, index,onEdit }: ChapterListItemProps) {
  const dispatch = useDispatch();

  return (
    <>
      <li className="flex items-center justify-between mb-2 p-2 border rounded">
        <div className="flex items-center">
          <Checkbox
            id={`chapter-${chapter.id}`}
            checked={chapter.completed}
            onCheckedChange={() => dispatch(toggleChapter(chapter.id))}
            className="mr-2"
          />
          <label
            htmlFor={`chapter-${chapter.id}`}
            className={` whitespace-nowrap overflow-x-auto ${
              chapter.completed ? "line-through text-gray-500" : ""
            }`}
            style={{ width: "100%" }}
          >
            {chapter.info.title.length?chapter.info.title: index}
          </label>
        </div>
        <div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(deleteChapter(chapter.id))}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              onEdit?.(chapter);
            }}
            className="text-blue-500 hover:text-blue-700"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </li>
    </>
  );
}
