import { LANDING_THEME } from "./landingTheme";

interface SocialLink {
  label: string;
  handle: string;
  url: string;
  svgPath: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "GitHub",
    handle: "nguyenkhang-gif",
    url: "https://github.com/nguyenkhang-gif",
    svgPath:
      "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z",
  },
  {
    label: "LinkedIn",
    handle: "khang-nguyễn-nguyên",
    url: "https://www.linkedin.com/in/khang-nguy%E1%BB%85n-nguy%C3%AAn-46456b246/",
    svgPath:
      "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    label: "Email",
    handle: "nguyennguyenkhang915@gmail.com",
    url: "mailto:nguyennguyenkhang915@gmail.com",
    svgPath:
      "M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z",
  },
  {
    label: "Facebook",
    handle: "khang.nguyen.225994",
    url: "https://www.facebook.com/khang.nguyen.225994/",
    svgPath:
      "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
];

export default function ContactSection() {
  return (
    <section
      className="py-20 px-6"
      style={{ borderTop: `1px solid ${LANDING_THEME.sectionDivider}` }}
    >
      <div className="max-w-5xl mx-auto text-center">
        <p className="font-mono text-xs mb-3" style={{ color: LANDING_THEME.terminal }}>
          <span style={{ opacity: 0.5 }}>&gt;</span> echo $CONTACT
        </p>
        <h2
          className="text-2xl md:text-3xl font-bold mb-3"
          style={{ color: LANDING_THEME.textPrimary }}
        >
          Get in Touch
        </h2>
        <p className="text-sm mb-12" style={{ color: LANDING_THEME.textMuted }}>
          Open to opportunities, collaborations, or just a chat.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target={link.url.startsWith("mailto") ? undefined : "_blank"}
              rel={link.url.startsWith("mailto") ? undefined : "noopener noreferrer"}
              className="flex flex-col items-center gap-3 p-4 rounded-lg border transition-colors group"
              style={{
                backgroundColor: LANDING_THEME.cardBg,
                borderColor: LANDING_THEME.cardBorder,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 transition-colors"
                style={{ color: LANDING_THEME.textMuted }}
              >
                <path d={link.svgPath} />
              </svg>
              <div>
                <p
                  className="text-xs font-semibold"
                  style={{ color: LANDING_THEME.textPrimary }}
                >
                  {link.label}
                </p>
                <p
                  className="font-mono text-[10px] mt-0.5 truncate max-w-[100px]"
                  style={{ color: LANDING_THEME.textMuted }}
                >
                  {link.handle}
                </p>
              </div>
            </a>
          ))}
        </div>

        <p
          className="font-mono text-xs mt-16 pb-4"
          style={{ color: LANDING_THEME.textMuted, opacity: 0.4 }}
        >
          © {new Date().getFullYear()} Nguyen Nguyen Khang
        </p>
      </div>
    </section>
  );
}
