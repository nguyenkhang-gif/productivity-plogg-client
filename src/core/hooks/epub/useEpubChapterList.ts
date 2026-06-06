import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Chapter, addChapter, chapterFormatI } from "@/core/redux/epub";
import { RootState } from "@/core/redux/store";
import { useGetEpubFormatList } from "@/core/hooks/epub/useGetEpubFormatList";
import { useParseChapter } from "@/core/hooks/epub/useParseChapter";
import { useGetAllEpub } from "@/core/services/client/epub";

type Format = "web" | "phone" | "ebook" | "print" | string;

export const useEpubChapterList = () => {
  // Redux store selectors
  const dispatch = useDispatch();
  const formatedArray = useSelector(
    (state: RootState) => state.chapters.formatArray
  );
  const chapters = useSelector((state: RootState) => state.chapters.items);
  // Custom hooks
  const { getAll } = useGetEpubFormatList();
  const { parse: parseChapter } = useParseChapter();
  const { data: queryChapters } = useGetAllEpub();

  // Local state
  const [newChapter, setNewChapter] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<Format>("web");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenDetailChapter, setIsOpenDetailChapter] = useState(false);
  const [selectedDetailChapter, setSelectedDetailChapter] =
    useState<Chapter | null>(null);

  // Fetch all epub formats
  const handleFetch = async () => {
    await getAll({
      onSuccess: (data: { properties?: { format?: chapterFormatI } }[]) => {
        dispatch({
          type: "chapters/editFormatArray",
          payload: data.map((item) => {
            return JSON.stringify(item.properties?.format);
          }),
        });
      },
      onError: (error) => {
        console.error("error getting formated data", error);
      },
      onSettled: () => {
        console.log("get all epub formated data");
      },
    });
  };

  // Add new chapter
  const handleAddChapter = async () => {
    if (newChapter.trim() !== "" && !isLoading) {
      setIsLoading(true);
      try {
        console.log("Adding chapter with format:", JSON.parse(selectedFormat));
        const formated = JSON.parse(selectedFormat);
        if (!formated) {
          throw new Error("No format selected");
        }

        await parseChapter(
          { formated, url: newChapter, html: "" },
          {
            onError: (error) => {
              console.log(error);
            },
            onSuccess: (data: { title?: string; content?: string }) => {
              console.log("dta", data);
              console.log("dtatattataa", {
                title: data.title ?? "",
                content: data.content ?? "",
              });

              if (data.title && data.content) {
                console.log("add this data to the list", data);
              }

              dispatch(
                addChapter({
                  title: data.title ?? "",
                  content: data.content ?? "",
                })
              );
            },
            onSettled: () => {
              console.log("Settled");
              setIsLoading(false);
            },
          }
        );

        setNewChapter("");
      } catch (error) {
        console.error("Error adding chapter:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Filter chapters based on search query
  const filteredChapters = useMemo(() => {
    return chapters.filter(
      (chapter) =>
        chapter.info.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.info.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chapters, searchQuery]);

  // Edit chapter
  const handleEditChapter = (chapter: Chapter) => {
    console.log("edit chapter", chapter);
    setSelectedDetailChapter(chapter);
    setIsOpenDetailChapter(true);
  };

  // Close chapter detail modal
  const handleCloseDetailChapter = () => {
    setIsOpenDetailChapter(false);
  };

  // Load chapters from query on mount
  useEffect(() => {
    if (queryChapters?.length) {
      dispatch({
        type: "chapters/setChapters",
        payload: queryChapters,
      });
      console.log("queryChapters", queryChapters);

      dispatch({
        type: "chapters/editFormatArray",
        payload: queryChapters.map((item: { properties?: { format?: unknown } }) => {
          return JSON.stringify(item.properties?.format);
        }),
      });
    }
  }, [queryChapters, dispatch]);

  return {
    // State
    newChapter,
    selectedFormat,
    searchQuery,
    isLoading,
    isOpenDetailChapter,
    selectedDetailChapter,
    formatedArray,
    filteredChapters,

    // State setters
    setNewChapter,
    setSelectedFormat,
    setSearchQuery,

    // Actions
    handleAddChapter,
    handleEditChapter,
    handleCloseDetailChapter,
    handleFetch,
  };
};
