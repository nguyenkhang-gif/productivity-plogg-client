export interface EpubBuildOptions {
  title: string;
  author: string;
  language?: string;
  chapters: { title: string; text: string }[];
}


function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function chapterId(i: number): string {
  return `chapter_${String(i + 1).padStart(3, "0")}`;
}

function buildContainerXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
}

function buildContentOpf(
  chapters: { title: string }[],
  meta: { title: string; author: string; language: string; uid: string }
): string {
  const manifestItems = chapters
    .map(
      (_, i) =>
        `    <item id="${chapterId(i)}" href="chapters/${chapterId(i)}.xhtml" media-type="application/xhtml+xml"/>`
    )
    .join("\n");

  const spineItems = chapters
    .map((_, i) => `    <itemref idref="${chapterId(i)}"/>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="book-id" xml:lang="${meta.language}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">${escapeXml(meta.uid)}</dc:identifier>
    <dc:title>${escapeXml(meta.title)}</dc:title>
    <dc:creator>${escapeXml(meta.author)}</dc:creator>
    <dc:language>${meta.language}</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, "Z")}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="css" href="style.css" media-type="text/css"/>
${manifestItems}
  </manifest>
  <spine>
${spineItems}
  </spine>
</package>`;
}

function buildNavXhtml(
  chapters: { title: string }[],
  meta: { title: string; language: string }
): string {
  const items = chapters
    .map(
      (ch, i) =>
        `      <li><a href="chapters/${chapterId(i)}.xhtml">${escapeXml(ch.title)}</a></li>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${meta.language}">
<head>
  <meta charset="UTF-8"/>
  <title>${escapeXml(meta.title)}</title>
  <link rel="stylesheet" href="style.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Mục lục</h1>
    <ol>
${items}
    </ol>
  </nav>
</body>
</html>`;
}

function buildChapterXhtml(title: string, text: string, language: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const lines = p.split("\n").map((l) => escapeXml(l)).join("<br/>");
      return `  <p>${lines}</p>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${language}">
<head>
  <meta charset="UTF-8"/>
  <title>${escapeXml(title)}</title>
  <link rel="stylesheet" href="../style.css"/>
</head>
<body>
  <h1>${escapeXml(title)}</h1>
${paragraphs}
</body>
</html>`;
}

function buildCss(): string {
  return `body {
  font-family: Georgia, serif;
  font-size: 1em;
  line-height: 1.8;
  margin: 1.5em 2em;
  color: #222;
}
h1 {
  font-size: 1.4em;
  margin-bottom: 1.2em;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.4em;
}
p {
  margin: 0 0 0.8em 0;
  text-indent: 1.5em;
}
nav ol {
  padding-left: 1.2em;
}
nav li {
  margin: 0.4em 0;
}
`;
}

export async function buildEpub(options: EpubBuildOptions): Promise<Blob> {
  const { title, author, language = "vi", chapters } = options;

  const uid = `epub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const meta = { title, author, language, uid };

  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  // mimetype MUST be first and MUST NOT be compressed (EPUB spec requirement)
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  zip.file("META-INF/container.xml", buildContainerXml());

  zip.file("OEBPS/content.opf", buildContentOpf(chapters, meta));
  zip.file("OEBPS/nav.xhtml", buildNavXhtml(chapters, { title, language }));
  zip.file("OEBPS/style.css", buildCss());

  chapters.forEach((ch, i) => {
    zip.file(
      `OEBPS/chapters/${chapterId(i)}.xhtml`,
      buildChapterXhtml(ch.title, ch.text, language)
    );
  });

  return zip.generateAsync({ type: "blob", mimeType: "application/epub+zip" });
}
