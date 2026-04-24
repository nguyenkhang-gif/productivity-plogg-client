"use client";
import PortfolioUserOverview from "@/components/portfolio/PortfolioUserOverview";
import AboutMeSection from "@/components/portfolio/AboutMeSection";
import ExperienceSection from "@/components/portfolio/ExperienceSection";
import EducationSection from "@/components/portfolio/EducationSection";
import ProjectsSection from "@/components/portfolio/ProjectsSection";
import SkillsSection from "@/components/portfolio/SkillsSection";

const portfolioData = {
  header: {
    name: "Nguyễn Nguyên Khang",
    role: "Full-Stack Developer",
    location: "Hóc Môn, Hồ Chí Minh",
    email: "nguyennguyenkhang915@gmail.com",
    phone: "0902932998",
    linkedin: "https://www.linkedin.com/in/khang-nguyễn-nguyên-46456b246/",
    github: "https://github.com/nguyenkhang-gif",
    avatar: "https://lh3.googleusercontent.com/a/ACg8ocJdWiIXRbvDWMs5aTL4nBQ3iKHTD_cR5fQd4f3YGVb86MvjmzBP=s1000",
  },
  summary: "A full-stack developer with hands-on experience in modern JavaScript frameworks. Passionate about delivering scalable, data-driven, and intuitive user experiences. I specialize in building interactive web applications and optimizing bundler performance to ensure lightning-fast load times. Seeking to join a dynamic team where I can grow my technical expertise and contribute to impactful software solutions.",
  aboutMeImg: "https://storage.googleapis.com/productivity-blog-a.appspot.com/files%2Ftanaka-kun-english-dub-cast-list.png",
  education: [
    {
      school: "Ho Chi Minh City University of Education",
      major: "Software Engineering",
      period: "August 2021 – June 2025",
    }
  ],
  experience: [
    {
      role: "Front End Developer - Three Developer",
      company: "PloggVN",
      location: "Tân Phú, HCM",
      period: "July 2024 – April 2025",
      projects: [
        {
          name: "Synode",
          link: "https://www.synode.ai",
          description: "A 3D product learning platform featuring interactive 3D models and built-in quizzes to help users understand and operate products effectively.",
          highlights: [
            "Developed and maintained scalable web applications using Vue.js & Nuxt.js.",
            "Built a quiz system to assess and reinforce user understanding of product usage.",
            "Optimized API calls and data fetching strategies, reducing page load time by 30%.",
            "Translated Figma prototypes into pixel-perfect, fully responsive UI components.",
            "Implemented state management with Vuex to manage user progress and interactions.",
            "Collaborated with backend developers to integrate RESTful APIs efficiently.",
          ]
        },
        {
          name: "Saby Restaurant Ordering Website",
          link: "https://saby-restaurant-rs5gdrzboq-uc.a.run.app",
          description: "An online food ordering platform for Saby restaurant, enabling customers to browse the menu, customize dishes, and place orders seamlessly across devices.",
          highlights: [
            "Built a responsive and user-friendly interface using NextJS and Tailwind CSS for optimal mobile and desktop experience.",
            "Implemented the cart and order interface with seamless real-time state updates via Redux, WebSocket and API integration.",
            "Integrated RESTful APIs for dynamic menu data, order processing, and user authentication.",
            "Implemented login, signup interface and integrated with token-based authentication APIs for secure user access.",
          ]
        }
      ]
    },
    {
      role: "Front End Developer",
      company: "IES",
      location: "Tân Phú, HCM",
      period: "July 2024 – April 2025",
      projects: [
         {
          name: "Synode",
          link: "https://www.synode.ai",
          description: "A 3D product learning platform featuring interactive 3D models and built-in quizzes to help users understand and operate products effectively.",
          highlights: [
            "Developed and maintained scalable web applications using Vue.js & Nuxt.js.",
            "Built a quiz system to assess and reinforce user understanding of product usage.",
            "Optimized API calls and data fetching strategies, reducing page load time by 30%.",
            "Translated Figma prototypes into pixel-perfect, fully responsive UI components.",
            "Implemented state management with Vuex to manage user progress and interactions.",
            "Collaborated with backend developers to integrate RESTful APIs efficiently.",
          ]
        }
      ]
    }
  ],
  projects: [
    {
      name: "Productivity Blog",
      status: "In Process",
      description: "Productivity and Feature Showcase Platform",
      teamSize: 1,
      role: "Full-Stack Developer",
      techStack: "ReactJS, TypeScript, Node.js, Express, Socket.IO, MongoDB",
      links: [
        { label: "Website", url: "https://productivity-blog.onrender.com" },
        { label: "New Version", url: "https://productivity-plogg-client.vercel.app/auth" }
      ],
      highlights: [
        "Designed to enhance user productivity and demonstrate new features under development.",
        "Developed backend with Node.js and Express, and persisted data using MongoDB.",
        "Created frontend with React and TypeScript for type safety and maintainability.",
        "Working on new features and improvements in a separate version hosted on Vercel.",
      ]
    }
  ],
  skills: {
    languages: [
      "JavaScript (Advanced)", 
      "TypeScript (Advanced)", 
      "Intermediate English reading and communication"
    ],
    frontend: [
      "ReactJS", 
      "NextJS", 
      "VueJS", 
      "NuxtJS", 
      "Three.js", 
      "Chart.js"
    ],
    backend: ["NestJS", "ExpressJS"],
    database: ["MySQL", "MongoDB"],
    tools: [
      "Git", 
      "REST API", 
      "WebSocket", 
      "Optimize Bundler Performance (Webpack/Vite)", 
      "Chrome DevTools Profiling"
    ]
  }
};

export default function Page() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10 space-y-10">
      <PortfolioUserOverview user={portfolioData.header} />
      
      <AboutMeSection
        descriptions={portfolioData.summary}
        imgUrl={portfolioData.aboutMeImg}
      />

      <EducationSection education={portfolioData.education} />
      
      <SkillsSection skills={portfolioData.skills} />
      
      <ExperienceSection experiences={portfolioData.experience} />
      
      <ProjectsSection projects={portfolioData.projects} />
    </div>
  );
}