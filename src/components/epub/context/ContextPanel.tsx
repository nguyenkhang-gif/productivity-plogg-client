"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Eye, Save, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContextPreviewDialog } from "../dialogs/ContextPreviewDialog";
import { SaveContextForm } from "./SaveContextForm";

interface ContextPanelProps {
  context: string;
  onCopy: () => void;
  onDownload: () => void;
  onSave?: (data: { title: string; author: string }) => Promise<void>;
  isSaving?: boolean;
}

export function ContextPanel({ context, onCopy, onDownload, onSave, isSaving = false }: ContextPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);

  const preview = expanded ? context : context.slice(0, 800) + (context.length > 800 ? "..." : "");

  return (
    <>
      <ContextPreviewDialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        contextJson={context}
        title="Accumulated Context"
      />
      <div className="bg-surface-raised rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Accumulated Context</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowPreview(true)} className="text-text-muted hover:text-text-primary h-7 px-2">
              <Eye className="h-3.5 w-3.5 mr-1" />Preview
            </Button>
            {onSave && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowSaveForm((v) => !v); }}
                className="text-text-muted hover:text-text-primary h-7 px-2"
              >
                <Save className="h-3.5 w-3.5 mr-1" />Save
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onCopy} className="text-text-muted hover:text-text-primary h-7 px-2">
              <Copy className="h-3.5 w-3.5 mr-1" />Copy
            </Button>
            <Button variant="ghost" size="sm" onClick={onDownload} className="text-text-muted hover:text-text-primary h-7 px-2">
              <Download className="h-3.5 w-3.5 mr-1" />.json
            </Button>
          </div>
        </div>

        {showSaveForm && onSave && (
          <SaveContextForm
            contextJson={context}
            isSaving={isSaving}
            onSave={async (data) => {
              await onSave(data);
              setShowSaveForm(false);
            }}
            onCancel={() => setShowSaveForm(false)}
          />
        )}

        <pre className="text-xs text-text-secondary bg-surface rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-words max-h-80 overflow-y-auto">
          {preview}
        </pre>
        {context.length > 800 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-xs text-accent hover:underline flex items-center gap-1"
          >
            {expanded
              ? <><ChevronUp className="h-3 w-3" />Show less</>
              : <><ChevronDown className="h-3 w-3" />Show more</>
            }
          </button>
        )}
      </div>
    </>
  );
}
