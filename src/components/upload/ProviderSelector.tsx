import { useState } from "react";
import { Cloud } from "lucide-react";
import { CloudProvider } from "@/core/redux/upload";

const PROVIDERS: { value: CloudProvider; label: string; desc: string }[] = [
  { value: "default", label: "Default", desc: "Backend lưu trữ mặc định" },
  { value: "cloudinary", label: "Cloudinary", desc: "Cloudinary CDN (ảnh, video)" },
];

interface Props {
  provider: CloudProvider;
  onSelect: (p: CloudProvider) => void;
}

export default function ProviderSelector({ provider, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const current = PROVIDERS.find((p) => p.value === provider)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-raised border border-border hover:border-accent/40 transition-colors text-sm"
      >
        <Cloud size={14} className="text-accent-text" />
        <span className="text-text-primary font-medium">{current.label}</span>
        <span className="text-text-muted text-xs">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 z-50 bg-modal border border-border rounded-xl shadow-2xl overflow-hidden">
            <p className="text-text-muted text-[10px] font-semibold uppercase tracking-wider px-3 pt-3 pb-1.5">
              Chọn Cloud Provider
            </p>
            {PROVIDERS.map((p) => (
              <button
                key={p.value}
                onClick={() => { onSelect(p.value); setOpen(false); }}
                className={`w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-surface-raised transition-colors ${
                  p.value === provider ? "bg-accent/10" : ""
                }`}
              >
                <Cloud
                  size={14}
                  className={`mt-0.5 flex-shrink-0 ${p.value === provider ? "text-accent-text" : "text-text-muted"}`}
                />
                <div>
                  <p className={`text-sm font-medium ${p.value === provider ? "text-accent-text" : "text-text-primary"}`}>
                    {p.label}
                    {p.value === provider && (
                      <span className="ml-2 text-[10px] text-accent-text bg-accent/20 px-1.5 py-0.5 rounded-full">
                        đang dùng
                      </span>
                    )}
                  </p>
                  <p className="text-text-muted text-xs mt-0.5">{p.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export { PROVIDERS };
