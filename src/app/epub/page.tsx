"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { ChapterListItem } from "@/components/epub/Chapter/ChapterListItem";
import ChapterDetailModel from "@/components/epub/Chapter/ChapterDetailModel";
import GenerateEpubModal from "@/components/epub/GenergrateEpubModal";
import { useEpubChapterList } from "@/core/hooks/epub/use-epub-chapter-list";

export default function ChapterList() {
  const {
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
  } = useEpubChapterList();

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
        onClose={handleCloseDetailChapter}
      />

      <div className="w-[90%] mx-auto p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
          Chapter List
        </h1>
        <div className="flex flex-col mb-4">
          <Input
            type="text"
            value={newChapter}
            onChange={(e) => setNewChapter(e.target.value)}
            placeholder="Paste your URL here"
            className="mb-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
            onKeyDown={(e) => e.key === "Enter" && handleAddChapter()}
            disabled={isLoading}
          />
          <Select
            value={selectedFormat}
            onValueChange={(value) => setSelectedFormat(value)}
            disabled={isLoading}
          >
            <SelectTrigger className="mb-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700">
              {formatedArray.map((item, index) => (
                <SelectItem
                  value={item}
                  key={index}
                  className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {item} {JSON.stringify(formatedArray)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-between">
            <Button
              onClick={handleAddChapter}
              className="flex-1 mr-2 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white"
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
            <GenerateEpubModal></GenerateEpubModal>
          </div>
        </div>
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="Search chapters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
        <ul className="space-y-1 overflow-auto" style={{ maxHeight: "500px" }}>
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
