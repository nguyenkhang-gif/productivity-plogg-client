export interface ProjectLink {
  label: string;
  url: string;
  external: boolean;
}

export interface Project {
  number: string;
  name: string;
  tag: string;
  description: string;
  highlights: string[];
  techStack: string[];
  links: ProjectLink[];
  image: string | null;
  imageAlt: string;
}

export const PROJECTS: Project[] = [
  {
    number: "01",
    name: "KPro — Productivity Blog",
    tag: "Full-Stack App",
    description:
      "A productivity platform that started as a simple blog and evolved into a multi-feature app — real-time chat, AI tools, manga reader, file management, friend system, and more. Fully self-hosted on AWS EC2.",
    highlights: [
      "Real-time chat powered by Socket.IO with persistent message history",
      "AI-assisted EPUB generator that extracts and packages novel chapters",
      "Dual-provider file upload (Cloudinary + backend) with CDN delivery",
    ],
    techStack: ["Next.js 15", "Node.js", "Socket.IO", "MongoDB", "AWS EC2", "Nginx", "Redux", "OAuth"],
    links: [
      { label: "Live Site ↗", url: "http://knnpb.duckdns.org/posts", external: true },
      { label: "Explore →", url: "/projects", external: false },
    ],
    image: null,
    imageAlt: "KPro productivity platform",
  },
  {
    number: "02",
    name: "Novel Translator",
    tag: "AI Tool",
    description:
      "An AI-powered wrapper over Google Gemini that removes the friction from translating novels. Paste the first chapter — the AI generates translation context automatically, then keeps updating it after every chapter so the language and tone stay consistent across an entire series.",
    highlights: [
      "Auto-generates and persists context window per chapter — no copy-pasting into ChatGPT",
      "Supports full-series translation with consistent character names and tone",
      "Currently supports English → Vietnamese with clean plain-text output",
    ],
    techStack: ["Node.js", "TypeScript", "Google Gemini AI"],
    links: [
      {
        label: "GitHub ↗",
        url: "https://github.com/nguyenkhang-gif/witchculttranslation-VN-version",
        external: true,
      },
    ],
    image: "https://res.cloudinary.com/dsr4rajwm/image/upload/v1780738565/218cafc6-5977-4626-891b-19b97e94646c_1_gz00v5.jpg",
    imageAlt: "Novel Translator tool screenshot",
  },
  {
    number: "03",
    name: "Manga Downloader & CBZ/EPUB Converter",
    tag: "CLI + Web UI",
    description:
      "A full-stack scraping tool that downloads manga chapters using Puppeteer and packages them into EPUB or CBZ files. Comes with a web UI showing real-time progress logs and a built-in in-browser CBZ reader — no third-party app needed.",
    highlights: [
      "Headless browser scraping with scroll-based lazy-load handling and auto chapter URL parsing",
      "Real-time progress bar and color-coded live logs streamed from the running process",
      "In-browser CBZ reader with fit-width, fit-height, webtoon modes and touch/keyboard nav",
    ],
    techStack: ["Node.js", "Puppeteer", "Express", "Sharp", "epub-gen"],
    links: [
      {
        label: "GitHub ↗",
        url: "https://github.com/nguyenkhang-gif/wattpad-to-epub-converter",
        external: true,
      },
    ],
    image: "https://res.cloudinary.com/dsr4rajwm/image/upload/v1779000061/b05ac127-12dd-49dd-8169-1024bc9b54a2.png",
    imageAlt: "Manga Downloader web UI screenshot",
  },
  {
    number: "04",
    name: "Robot Fleet Dashboard",
    tag: "Dashboard",
    description:
      "An IoT-style fleet audit UI built inside KPro. Visualizes robot connectivity, battery levels, error rates, and fleet topology with interactive Mermaid diagrams. Designed for monitoring and anomaly review at a glance.",
    highlights: [
      "Interactive Mermaid diagrams for real-time fleet topology visualization",
      "Per-robot audit cards showing battery, connectivity status, and error rate",
      "Integrated directly into KPro as a standalone management module",
    ],
    techStack: ["Next.js", "TypeScript", "Mermaid", "Tailwind CSS"],
    links: [{ label: "View in App →", url: "/projects", external: false }],
    image: "https://res.cloudinary.com/dsr4rajwm/image/upload/v1780738631/1dfb7fd9-a0ad-4766-9d23-978fde54cd74_zhzg6r.jpg",
    imageAlt: "Robot Fleet Dashboard screenshot",
  },
];
