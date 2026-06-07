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
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#161925] border border-white/[0.08] hover:border-blue-500/40 transition-colors text-sm"
      >
        <Cloud size={14} className="text-blue-400" />
        <span className="text-slate-200 font-medium">{current.label}</span>
        <span className="text-slate-600 text-xs">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 z-50 bg-modal border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden">
            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider px-3 pt-3 pb-1.5">
              Chọn Cloud Provider
            </p>
            {PROVIDERS.map((p) => (
              <button
                key={p.value}
                onClick={() => { onSelect(p.value); setOpen(false); }}
                className={`w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors ${
                  p.value === provider ? "bg-blue-600/10" : ""
                }`}
              >
                <Cloud
                  size={14}
                  className={`mt-0.5 flex-shrink-0 ${p.value === provider ? "text-blue-400" : "text-slate-500"}`}
                />
                <div>
                  <p className={`text-sm font-medium ${p.value === provider ? "text-blue-300" : "text-slate-200"}`}>
                    {p.label}
                    {p.value === provider && (
                      <span className="ml-2 text-[10px] text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded-full">
                        đang dùng
                      </span>
                    )}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">{p.desc}</p>
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
