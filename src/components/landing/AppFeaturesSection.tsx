import { LANDING_THEME } from "./landingTheme";

interface Feature {
  symbol: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    symbol: "//",
    title: "Blog & Posts",
    description: "Write, share, and explore markdown-formatted posts.",
  },
  {
    symbol: ">_",
    title: "Real-time Chat",
    description: "Instant messaging between users powered by Socket.IO.",
  },
  {
    symbol: "[]",
    title: "EPUB Generator",
    description: "AI-powered novel and manga reader with chapter extraction.",
  },
  {
    symbol: "↑",
    title: "File Upload",
    description: "Cloudinary and backend dual-provider file management.",
  },
  {
    symbol: "@",
    title: "Friend System",
    description: "Send requests, accept connections, and manage your network.",
  },
  {
    symbol: "~",
    title: "AI Chat",
    description: "Contextual AI assistant that remembers your conversation.",
  },
  {
    symbol: "▣",
    title: "CBZ Reader",
    description: "In-browser manga reader with swipe, keyboard, and webtoon modes.",
  },
  {
    symbol: "⬡",
    title: "Robot Fleet",
    description: "IoT-style robot fleet audit and anomaly tracking dashboard.",
  },
];

export default function AppFeaturesSection() {
  return (
    <section
      className="py-20 px-6"
      style={{ borderTop: `1px solid ${LANDING_THEME.sectionDivider}` }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <p className="font-mono text-xs mb-3" style={{ color: LANDING_THEME.terminal }}>
            <span style={{ opacity: 0.5 }}>&gt;</span> ls ./features
          </p>
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: LANDING_THEME.textPrimary }}>
            What&apos;s inside KPro
          </h2>
          <p className="mt-2 text-sm" style={{ color: LANDING_THEME.textMuted }}>
            A productivity platform built feature by feature.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="p-4 rounded-lg border transition-colors group"
              style={{
                backgroundColor: LANDING_THEME.cardBg,
                borderColor: LANDING_THEME.cardBorder,
              }}
            >
              <p
                className="font-mono text-xl font-bold mb-3"
                style={{ color: LANDING_THEME.accent }}
              >
                {feature.symbol}
              </p>
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: LANDING_THEME.textPrimary }}
              >
                {feature.title}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: LANDING_THEME.textMuted }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
