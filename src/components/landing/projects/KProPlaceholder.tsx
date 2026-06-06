import { LANDING_THEME } from "../landingTheme";

const FEATURES = [
  "Blog & Posts",
  "Real-time Chat",
  "EPUB Generator",
  "File Upload",
  "AI Chat",
  "CBZ Reader",
];

export default function KProPlaceholder() {
  return (
    <div
      className="w-full h-full min-h-[300px] rounded-xl border p-6 flex flex-col justify-between"
      style={{ backgroundColor: LANDING_THEME.cardBgStrong, borderColor: LANDING_THEME.cardBorder }}
    >
      <div className="flex items-center gap-2 mb-5">
        <span className="font-bold text-lg" style={{ color: LANDING_THEME.textPrimary }}>
          KPro
        </span>
        <span
          className="font-mono text-[10px] px-2 py-0.5 rounded border"
          style={{
            color: LANDING_THEME.accent,
            borderColor: LANDING_THEME.accentBorder,
            backgroundColor: LANDING_THEME.accentMuted,
          }}
        >
          v2.0
        </span>
        <span className="ml-auto font-mono text-[10px]" style={{ color: LANDING_THEME.terminal }}>
          ● live
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 flex-1">
        {FEATURES.map((f) => (
          <div
            key={f}
            className="px-3 py-2 rounded-lg border text-xs font-mono"
            style={{
              borderColor: LANDING_THEME.cardBorder,
              backgroundColor: LANDING_THEME.cardBgSubtle,
              color: LANDING_THEME.textMuted,
            }}
          >
            {f}
          </div>
        ))}
      </div>

      <div
        className="mt-5 pt-4 border-t font-mono text-[11px]"
        style={{ borderColor: LANDING_THEME.sectionDivider, color: LANDING_THEME.textMuted }}
      >
        <span style={{ color: LANDING_THEME.terminal }}>❯</span>
        <span className="ml-2">knnpb.duckdns.org</span>
        <span
          className="ml-2 inline-block w-1.5 h-3 align-middle animate-pulse"
          style={{ backgroundColor: LANDING_THEME.terminal }}
        />
      </div>
    </div>
  );
}
