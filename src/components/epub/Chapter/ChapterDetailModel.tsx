"use client";

import React, {  memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface ChapterDialogProps {
  title: string;
  content: string;
  isLoading?: boolean;
  isNotFound?: boolean;
  isOpen?: boolean;
  buttonOneText?: string;
  buttonTwoText?: string;
  onclickButtonOne?: () => void;
  onclickButtonTwo?: () => void;
  onClose?: () => void;
}

const ChapterDetailModel = memo(function ChapterDetailModel({
  title,
  content,
  isLoading = false,
  isNotFound = false,
  isOpen = false,
  buttonOneText = "",
  buttonTwoText = "",
  onclickButtonOne,
  onclickButtonTwo,
  onClose,
}: ChapterDialogProps) {
  //   const [isOpen, setIsOpen] = useState(false);

  // console.log("Rendering AskAiPopup");

  const handleConfirm = () => {
    console.log("Confirmed");
    onclickButtonTwo?.();
    // setIsOpen(false);
  };
  const handleOpenChange = (open: boolean) => {
    // setIsOpen(open);
    if (!open && onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    onclickButtonOne?.();
    // setIsOpen(false);
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {/* <DialogTrigger asChild>{triggerButton}</DialogTrigger> */}
      <DialogContent className="sm:max-w-[80vw]">
        <DialogHeader>
          <DialogTitle>
            {isLoading
              ? "Loading..."
              : isNotFound
              ? "Chapter Not Found"
              : title}
          </DialogTitle>
          <DialogDescription className="max-h-[50vh] overflow-y-auto pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : isNotFound ? (
              <p>{"Sorry, we couldn't find the requested chapter."}</p>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: content }}></div>
            )}
          </DialogDescription>
        </DialogHeader>

        {(buttonOneText.length || buttonTwoText.length) && (
          <DialogFooter>
            {buttonOneText?.length && (
              <Button variant="outline" onClick={handleCancel}>
                {buttonOneText}
              </Button>
            )}
            {buttonTwoText?.length && (
              <Button
                onClick={handleConfirm}
                disabled={isLoading || isNotFound}
              >
                {buttonTwoText}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
});

export default ChapterDetailModel;
