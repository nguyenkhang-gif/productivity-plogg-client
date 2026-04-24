\documentclass[16pt, letterpaper]{article}
\usepackage[vietnamese]{babel}
% Packages:
\usepackage[
    ignoreheadfoot, % set margins without considering header and footer
    top=2 cm, % seperation between body and page edge from the top
    bottom=2 cm, % seperation between body and page edge from the bottom
    left=2 cm, % seperation between body and page edge from the left
    right=2 cm, % seperation between body and page edge from the right
    footskip=1.0 cm, % seperation between body and footer
    % showframe % for debugging 
]{geometry} % for adjusting page geometry
\usepackage{titlesec} % for customizing section titles
\usepackage{tabularx} % for making tables with fixed width columns
\usepackage{array} % tabularx requires this
\usepackage[dvipsnames]{xcolor} % for coloring text
\definecolor{primaryColor}{RGB}{0, 0, 0} % define primary color
\usepackage{enumitem} % for customizing lists
\usepackage{fontawesome5} % for using icons
\usepackage{amsmath} % for math
\usepackage[
    pdftitle={John Doe's CV},
    pdfauthor={John Doe},
    pdfcreator={LaTeX with RenderCV},
    colorlinks=true,
    urlcolor=primaryColor
]{hyperref} % for links, metadata and bookmarks
\usepackage[pscoord]{eso-pic} % for floating text on the page
\usepackage{calc} % for calculating lengths
\usepackage{bookmark} % for bookmarks
\usepackage{lastpage} % for getting the total number of pages
\usepackage{changepage} % for one column entries (adjustwidth environment)
\usepackage{paracol} % for two and three column entries
\usepackage{ifthen} % for conditional statements
\usepackage{needspace} % for avoiding page brake right after the section title
\usepackage{iftex} % check if engine is pdflatex, xetex or luatex
\usepackage{enumitem}
\usepackage{changepage}
% Ensure that generate pdf is machine readable/ATS parsable:
\ifPDFTeX
    \input{glyphtounicode}
    \pdfgentounicode=1
    \usepackage[T1]{fontenc}
    \usepackage[utf8]{inputenc}
    \usepackage{lmodern}
\fi

\usepackage{charter}
\usepackage{xcolor}
% Some settings:
\raggedright
\AtBeginEnvironment{adjustwidth}{\partopsep0pt} % remove space before adjustwidth environment
\pagestyle{empty} % no header or footer
\setcounter{secnumdepth}{0} % no section numbering
\setlength{\parindent}{0pt} % no indentation
\setlength{\topskip}{0pt} % no top skip
\setlength{\columnsep}{0.15cm} % set column seperation
\pagenumbering{gobble} % no page numbering

\titleformat{\section}{\needspace{4\baselineskip}\bfseries\large}{}{0pt}{}[\vspace{1pt}\titlerule]

\titlespacing{\section}{
    % left space:
    -1pt
}{
    % top space:
    0.3 cm
}{
    % bottom space:
    0.2 cm
} % section title spacing

\renewcommand\labelitemi{$\vcenter{\hbox{\small$\bullet$}}$} % custom bullet points
\newenvironment{highlights}{
    \begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=0 cm + 10pt
    ]
}{
    \end{itemize}
} % new environment for highlights


\newenvironment{highlightsforbulletentries}{
    \begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=10pt
    ]
}{
    \end{itemize}
} % new environment for highlights for bullet entries

\newenvironment{onecolentry}{
    \begin{adjustwidth}{
        0 cm + 0.00001 cm
    }{
        0 cm + 0.00001 cm
    }
}{
    \end{adjustwidth}
} % new environment for one column entries

\newenvironment{twocolentry}[2][]{
    \onecolentry
    \def\secondColumn{#2}
    \setcolumnwidth{\fill, 4.5 cm}
    \begin{paracol}{2}
}{
    \switchcolumn \raggedleft \secondColumn
    \end{paracol}
    \endonecolentry
} % new environment for two column entries

\newenvironment{threecolentry}[3][]{
    \onecolentry
    \def\thirdColumn{#3}
    \setcolumnwidth{, \fill, 4.5 cm}
    \begin{paracol}{3}
    {\raggedright #2} \switchcolumn
}{
    \switchcolumn \raggedleft \thirdColumn
    \end{paracol}
    \endonecolentry
} % new environment for three column entries

\newenvironment{header}{
    \setlength{\topsep}{0pt}\par\kern\topsep\centering\linespread{1.5}
}{
    \par\kern\topsep
} % new environment for the header

\newcommand{\placelastupdatedtext}{% \placetextbox{<horizontal pos>}{<vertical pos>}{<stuff>}
  \AddToShipoutPictureFG*{% Add <stuff> to current page foreground
    \put(
        \LenToUnit{\paperwidth-2 cm-0 cm+0.05cm},
        \LenToUnit{\paperheight-1.0 cm}
    ){\vtop{{\null}\makebox[0pt][c]{
        \small\color{gray}\textit{Last updated in September 2024}\hspace{\widthof{Last updated in September 2024}}
    }}}%
  }%
}%

% save the original href command in a new command:
\let\hrefWithoutArrow\href

% new command for external links:


\begin{document}
    \newcommand{\AND}{\unskip
        \cleaders\copy\ANDbox\hskip\wd\ANDbox
        \ignorespaces
    }
    \newsavebox\ANDbox
    \sbox\ANDbox{$|$}

    \begin{header}
        \fontsize{25 pt}{25 pt}\selectfont Nguyễn Nguyên Khang
        \vspace{1 pt}

        \fontsize{14pt}{14pt}\selectfont Full-Stack Developer

        \vspace{5 pt}

        \normalsize
        \mbox{Hóc Môn, Hồ Chí Minh}%
        \kern 5.0 pt%
        \AND%
        \kern 5.0 pt%
        \mbox{\hrefWithoutArrow{nguyennguyenkhang915@gmail.com}{nguyennguyenkhang915@gmail.com}}%
        \kern 5.0 pt%
        \AND%
        \kern 5.0 pt%
        \mbox{\hrefWithoutArrow{tel:+89-68-751-248}{0902932998}}%
        \kern 5.0 pt%
        \AND%
        \kern 5.0 pt%
        \mbox{\hrefWithoutArrow{https://www.linkedin.com/in/khang-nguyễn-nguyên-46456b246/}{https://www.linkedin.com/in/khang-nguyễn-nguyên-46456b246/}}%
        \kern 5.0 pt%
        \AND%
        \kern 5.0 pt%
        \mbox{\hrefWithoutArrow{https://github.com/nguyenkhang-gif}{https://github.com/nguyenkhang-gif}}%
    \end{header}

    \vspace{5 pt - 0.3 cm}


    \section{SUMMARY}

        
        \begin{onecolentry}
            A full-stack developer with hands-on experience in modern JavaScript frameworks. Passionate about delivering scalable and intuitive user experiences. I’m always eager to adapt to new technologies and master them as quickly as possible. Seeking to join a dynamic team where I can grow my technical expertise and contribute to impactful software solutions.
        \end{onecolentry}
    \section{Education}

        
       \begin{twocolentry}{
            August 2021 – Present
        }
            \textbf{Ho Chi Minh City University of Education} \\
            \textbf{Major}: Software Engineering
        \end{twocolentry}
        
        \vspace{0.10 cm}
    
    \section{Experience}



        
       \begin{twocolentry}{
            July 2024 – April 2025
        }
            \textbf{Front End Developer - Three Developer}, PloggVN -- Tân Phú, HCM
        \end{twocolentry}
        
        \vspace{0.10 cm}
        \begin{onecolentry}
            \textbf{Project: Synode} – \textbf{\href{https://www.synode.ai}{https://www.synode.ai}}
        
            A 3D product learning platform featuring interactive 3D models and built-in quizzes to help users understand and operate products effectively.
            \begin{adjustwidth}{5mm}{0pt}
            
                \begin{highlights}
                    \item Developed and maintained scalable web applications using Vue.js \& Nuxt.js.
                    \item Built a quiz system to assess and reinforce user understanding of product usage.
                    \item Optimized API calls and data fetching strategies, reducing page load time by 30\%.
                    \item Translated Figma prototypes into pixel-perfect, fully responsive UI components.
                    \item Implemented state management with Vuex to manage user progress and interactions.
                    \item Collaborated with backend developers to integrate RESTful APIs efficiently.
                \end{highlights}
            \end{adjustwidth}
        \end{onecolentry}
        \vspace{0.2 cm}
        
        \begin{onecolentry}
            \textbf{Project: Saby Restaurant Ordering Website} – \textbf{\href{https://saby-restaurant-rs5gdrzboq-uc.a.run.app/order/686764e3b609a9665ef11863?org=683560c99e39e629f1973017}{https://saby-restaurant-rs5gdrzboq-uc.a.run.app}}
        
            An online food ordering platform for Saby restaurant, enabling customers to browse the menu, customize dishes, and place orders seamlessly across devices.
        
            \begin{adjustwidth}{5mm}{0pt}
                \begin{highlights}
                    \item Built a responsive and user-friendly interface using NextJS and Tailwind CSS for optimal mobile and desktop experience.
                    \item Implemented the cart and order interface with seamless real-time state updates via Redux, WebSocket and API integration.
                    \item Integrated RESTful APIs for dynamic menu data, order processing, and user authentication.
                    \item Implemented login, signup interface and integrated with token-based authentication APIs for secure user access.
                \end{highlights}
            \end{adjustwidth}
        \end{onecolentry}
        \begin{twocolentry}{
            July 2024 – April 2025
        }
            \textbf{Front End Developer },IES -- Tân Phú, HCM
        \end{twocolentry}
        
        \vspace{0.10 cm}
        \begin{onecolentry}
            \textbf{Project: Synode} – \textbf{\href{https://www.synode.ai}{https://www.synode.ai}}
        
            A 3D product learning platform featuring interactive 3D models and built-in quizzes to help users understand and operate products effectively.
            \begin{adjustwidth}{5mm}{0pt}
            
                \begin{highlights}
                    \item Developed and maintained scalable web applications using Vue.js \& Nuxt.js.
                    \item Built a quiz system to assess and reinforce user understanding of product usage.
                    \item Optimized API calls and data fetching strategies, reducing page load time by 30\%.
                    \item Translated Figma prototypes into pixel-perfect, fully responsive UI components.
                    \item Implemented state management with Vuex to manage user progress and interactions.
                    \item Collaborated with backend developers to integrate RESTful APIs efficiently.
                \end{highlights}
            \end{adjustwidth}
        \end{onecolentry}
        \vspace{0.2 cm}
   
    \section{Projects}

       \textbf{Productivity Blog --- In Process} – Productivity and Feature Showcase Platform \\
\textbf{Team size:} 1 \quad
\textbf{Role:} Full-Stack Developer \\
\textbf{Tech Stack:} ReactJS, TypeScript, Node.js, Express, Socket.IO, MongoDB \\
\textbf{Link Website: } \href{https://productivity-blog.onrender.com}{https://productivity-blog.onrender.com} \\
\textbf{New Version: } \href{https://productivity-plogg-client.vercel.app/auth}{https://productivity-plogg-client.vercel.app/auth}

\begin{highlights}
    \item Designed to enhance user productivity and demonstrate new features under development.
    \item Developed backend with Node.js and Express, and persisted data using MongoDB.
    \item Created frontend with React and TypeScript for type safety and maintainability.
    \item Working on new features and improvements in a separate version hosted on Vercel.
\end{highlights}



        
    \section{SKILLS}
        \textbf{Languages:} JavaScript (Advanced), TypeScript (Advanced) \\
        \textbf{Frontend:} ReactJS, NextJS, VueJS, NuxtJS, Threejs \\
        \textbf{Backend:} NestJS, ExpressJS \\
        \textbf{Database:} MySQL, MongoDB \\
        \textbf{Tools/Other:} Git, REST API, WebSocket\\
        \textbf{Languages:} Intermediate English reading and communication
\end{document}