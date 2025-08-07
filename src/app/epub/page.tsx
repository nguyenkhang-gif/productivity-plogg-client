"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot, Search, Loader2 } from "lucide-react";
import { Chapter, addChapter, chapterFormatI } from "@/redux/epub";
import { RootState } from "@/redux/store";
import { ChapterListItem } from "@/components/epub/Chapter/ChapterListItem";
import { useAskAiWithUrl } from "@/hooks/epub/use-ask-ai-with-url";
import AskAiPopup from "@/components/epub/AskAIPopup";
import { useCreateEpub } from "@/hooks/epub/use-create-epub";
import { useGetEpubFormatList } from "@/hooks/epub/use-get-epub-format-list";
import { useParseChapter } from "@/hooks/epub/use-parse-chapter";
import ChapterDetailModel from "@/components/epub/Chapter/ChapterDetailModel";
import GenerateEpubModal from "@/components/epub/GenergrateEpubModal";

type Format = "web" | "phone" | "ebook" | "print" | string;

export default function ChapterList() {
  // store related
  const dispatch = useDispatch();
  const formatedArray = useSelector(
    (state: RootState) => state.chapters.formatArray
  );
  const chapters = useSelector((state: RootState) => state.chapters.items);
  const aiResponse = useSelector(
    (state: RootState) => state.chapters.aiResponse
  );

  // hook related
  const { askAiWithUrl } = useAskAiWithUrl();
  const { create: createEpubFormat } = useCreateEpub();
  const { getAll } = useGetEpubFormatList();
  const { parse: parseChapter } = useParseChapter();
  // state related
  const [newChapter, setNewChapter] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<Format>("web");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenDetailChapter, setIsOpenDetailChapter] = useState(false);
  const [selectedDetailChapter, setSelectedDetailChapter] =
    useState<Chapter | null>(null);
  // useEffect related

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
  const handleCreateEpub = async () => {
    setIsLoading(true);

    const data = {
      sampleUrl: newChapter,
      properties: {
        format: aiResponse?.format || null,
      },
    };
    await createEpubFormat(data, {
      onSuccess: (data: { properties?: { format?: string } }) => {
        if (data.properties?.format) {
          dispatch({
            type: "chapters/editFormatArray",
            payload: [...formatedArray, JSON.stringify(data.properties.format)],
          });
        }
      },
      onError: (error) => {
        console.error("error created epub data:", error);
      },
      onSettled: () => {
        setIsLoading(false);
      },
    });
  };
  // callback related
  const handleAddChapter = async () => {
    if (newChapter.trim() !== "" && !isLoading) {
      setIsLoading(true);
      try {
        // await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log("Adding chapter wiht format:", JSON.parse(selectedFormat));
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
              // if (data) {
              //   dispatch({
              //     type: "chapters/editAIResponse",
              //     payload: data,
              //   });
              // }
              // dispatch(editAIResponse(data));
              // console.log("AI response:", aiRespoponse);
            },
            onSettled: () => {
              console.log("Settled");
              setIsLoading(false);
            },
          }
        );

        // dispatch(addChapter(newChapter));

        setNewChapter("");
      } catch (error) {
        console.error("Error adding chapter:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  const askAI = useCallback(async () => {
    setIsLoading(true);
    await askAiWithUrl(newChapter, {
      onError: (error) => {
        console.log(error);
      },
      onSuccess: (data) => {
        console.log(data, "data");
        if (data) {
          dispatch({
            type: "chapters/editAIResponse",
            payload: data,
          });
        }
        // dispatch(editAIResponse(data));
        // console.log("AI response:", aiRespoponse);
      },
      onSettled: () => {
        setIsLoading(false);
      },
    });
  }, [newChapter, selectedFormat]);

  const filteredChapters = useMemo(() => {
    return chapters.filter(
      (chapter) =>
        chapter.info.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.info.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chapters, searchQuery]);

  const handleCancelCreateEpub = () => {
    dispatch({
      type: "chapters/editAIResponse",
      payload: null,
    });
  };

  const handleEditChapter = (chapter: Chapter) => {
    // dispatch(deleteChapter(index));
    console.log("edit chapter", chapter);
    setSelectedDetailChapter(chapter);
    setIsOpenDetailChapter(true);
  };



  useEffect(() => {
    handleFetch();
  }, []);


  return (
    <>
      <ChapterDetailModel
        title={selectedDetailChapter?.info.title ?? "Chapter 1: The Beginning"}
        content={
          selectedDetailChapter?.info.content ??
          "In a world where technology and magic intertwine, a young programmer discovers an ancient artifact that changes everything..."
        }
        isOpen={isOpenDetailChapter}
        isLoading={isLoading}
        isNotFound={false}
        // buttonOneText={"cancel"}
        // buttonTwoText={"add"}
        // onclickButtonOne={handleCancelCreateEpub}
        // onclickButtonTwo={handleCreateEpub}
        onClose={() => {
          setIsOpenDetailChapter(false);
        }}
      />
      
      <div className="w-[90%] mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Chapter List</h1>
        <div className="flex flex-col mb-4">
          <Input
            type="text"
            value={newChapter}
            onChange={(e) => setNewChapter(e.target.value)}
            placeholder="Paste your URL here"
            className="mb-2"
            onKeyPress={(e) => e.key === "Enter" && handleAddChapter()}
            disabled={isLoading}
          />
          <Select
            value={selectedFormat}
            onValueChange={(value: Format) => setSelectedFormat(value)}
            disabled={isLoading}
          >
            <SelectTrigger className="mb-2">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {formatedArray.map((item, index) => (
                <SelectItem value={item} key={index}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-between">
            <Button
              onClick={handleAddChapter}
              className="flex-1 mr-2"
              disabled={isLoading || newChapter.trim() === ""}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add"
              )}
            </Button>
            <AskAiPopup
              title={
                aiResponse?.chapterInfo?.title ?? "Chapter 1: The Beginning"
              }
              content={
                aiResponse?.chapterInfo?.content ??
                "In a world where technology and magic intertwine, a young programmer discovers an ancient artifact that changes everything..."
              }
              isLoading={isLoading}
              isNotFound={false}
              buttonOneText={"cancel"}
              buttonTwoText={"add"}
              onclickButtonOne={handleCancelCreateEpub}
              onclickButtonTwo={handleCreateEpub}
              onClose={() => {
                console.log("close dasljlkdsajlkdajlkdsalkjdlaskjdasdj");
              }}
              triggerButton={
                <Button
                  onClick={askAI}
                  className="flex-1 mx-2"
                  disabled={isLoading}
                >
                  <Bot className="mr-2 h-4 w-4" />
                  Ask AI
                </Button>
              }
            ></AskAiPopup>

            {/* <Button onClick={handleGenergrateEpub}>generate Epub</Button> */}
            <GenerateEpubModal></GenerateEpubModal>
          </div>
        </div>
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="Search chapters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <ul className="space-y-1 overflow-auto " style={{ maxHeight: "500px" }}>
          {filteredChapters.map((chapter, index) => (
            <ChapterListItem
              key={chapter.id}
              chapter={chapter}
              index={index + 1}
              onEdit={handleEditChapter}
            />
          ))}
        </ul>
      </div>
    </>
  );
}
