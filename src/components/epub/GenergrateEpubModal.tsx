"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { useGenerateEpub } from "@/core/hooks/epub/use-generate-epub";
import { Card } from "../ui/card";
import { Trash2 } from "lucide-react";
import { useToast } from "@/core/hooks/use-toast";

// interface Chapter {
//   title: string;
//   data: string;
// }

// interface BookDialogProps {
//   chapters: Chapter[];
// }

export default function GenerateEpubModal() {
  const [authorName, setAuthorName] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const chapters = useSelector((state: RootState) => state.chapters.items);
  const {
    generateEpub,
    isPending: loading,
    // isError: error,
  } = useGenerateEpub();
  const { toast } = useToast();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission here
    const data = {
      options: {
        title: bookTitle,
        author: authorName,
        content: chapters.map((chapter) => ({
          title: chapter.info.title,
          data: chapter.info.content,
        })),
      },
    };
    generateEpub(data, {
      onSuccess: (url: string) => {
        try {
          toast({
            title: "Successfully",
            description: "Successfully generate epub redirect to download",
          });
          window.open(url, "_blank"); // Mở link trong tab mới
        } catch (e) {
          // console.log("errrr or taos", e);
        }
        // console.log("Success fully generate Epub:", url);
      },
      onError: (error) => {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "Error when generate epub",
        });
      },
      throwError: true,
    });
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Generate Epub</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Book</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="author-name" className="text-right">
              Author Name
            </Label>
            <Input
              id="author-name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="book-title" className="text-right">
              Book Title
            </Label>
            <Input
              id="book-title"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Chapters</Label>
            <div className="col-span-3">
              <ul
                className="space-y-1 overflow-x-auto"
                style={{ maxHeight: "200px" }}
              >
                {chapters.map((chapter, index) => (
                  <li key={index} className="flex justify-between items-center">
                    {/* <span className="font-medium BI">{chapter.info.title}</span> */}
                    <Card className="p-2 flex ">
                      {chapter.info.title}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn sự kiện lan lên form
                          e.preventDefault(); // Ngăn việc submit form
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Card>
                    {/* <span className="text-sm text-gray-500">
                      {chapter.con}
                    </span> */}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Button type="submit" className="ml-auto" disabled={loading}>
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
