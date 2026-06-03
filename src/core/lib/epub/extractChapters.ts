import JSZip from "jszip";
import { stripHtml } from "./textUtils";

export interface ExtractedChapter {
  index: number;
  title: string;
  text: string;
  wordCount: number;
}

function getOpfPath(containerXml: string): string {
  const doc = new DOMParser().parseFromString(containerXml, "application/xml");
  const path = doc.querySelector("rootfile")?.getAttribute("full-path");
  if (!path) throw new Error("Cannot find OPF path in container.xml");
  return path;
}

interface OpfData {
  hrefs: string[];
  ncxHref: string | null;
}

function parseOpf(opfXml: string, opfDir: string): OpfData {
  const doc = new DOMParser().parseFromString(opfXml, "application/xml");

  const manifestMap = new Map<string, string>();
  let ncxHref: string | null = null;

  doc.querySelectorAll("manifest item").forEach((item) => {
    const id = item.getAttribute("id");
    const href = item.getAttribute("href");
    const mediaType = item.getAttribute("media-type");
    if (!id || !href) return;

    const resolved = opfDir ? `${opfDir}/${href}` : href;
    manifestMap.set(id, resolved);

    if (mediaType === "application/x-dtbncx+xml") {
      ncxHref = resolved;
    }
  });

  // Also find NCX via spine toc attribute if not found in manifest
  if (!ncxHref) {
    const spineEl = doc.querySelector("spine");
    const tocId = spineEl?.getAttribute("toc");
    if (tocId && manifestMap.has(tocId)) ncxHref = manifestMap.get(tocId)!;
  }

  const hrefs: string[] = [];
  doc.querySelectorAll("spine itemref").forEach((itemref) => {
    const idref = itemref.getAttribute("idref");
    if (idref && manifestMap.has(idref)) hrefs.push(manifestMap.get(idref)!);
  });

  return { hrefs, ncxHref };
}

// Parses toc.ncx → Map<normalized-href, title>
function parseNcx(ncxXml: string, ncxDir: string): Map<string, string> {
  const doc = new DOMParser().parseFromString(ncxXml, "application/xml");
  const map = new Map<string, string>();

  doc.querySelectorAll("navPoint").forEach((navPoint) => {
    const label = navPoint.querySelector("navLabel text")?.textContent?.trim();
    const src = navPoint.querySelector("content")?.getAttribute("src");
    if (!label || !src) return;

    // Strip fragment (#anchor) and resolve relative to NCX dir
    const cleanSrc = src.split("#")[0];
    const resolved = ncxDir ? `${ncxDir}/${cleanSrc}` : cleanSrc;
    // Don't overwrite — first entry for a file wins (split_000 label applies)
    if (!map.has(resolved)) map.set(resolved, label);
  });

  return map;
}

const PLACEHOLDER_TITLES = new Set(["unknown", "untitled", ""]);
const RANGE_LABEL_RE = /\(\d+[-–]\d+\)/;

function extractTitleFromHtml(html: string): string {
  // 1. <title> tag — skip if placeholder
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const titleTag = titleMatch?.[1].trim() ?? "";
  if (titleTag && !PLACEHOLDER_TITLES.has(titleTag.toLowerCase())) {
    return titleTag;
  }

  // 2. h1–h5, skip h6 (metadata) and section-range labels like "Web Novel(100-213)"
  const headingMatches = html.matchAll(/<h[1-5][^>]*>([\s\S]*?)<\/h[1-5]>/gi);
  for (const m of headingMatches) {
    const text = stripHtml(m[1]).trim();
    if (text && !PLACEHOLDER_TITLES.has(text.toLowerCase()) && !RANGE_LABEL_RE.test(text)) {
      return text;
    }
  }

  return "";
}

export async function extractEpub(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<ExtractedChapter[]> {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);

  const containerFile = zip.file("META-INF/container.xml");
  if (!containerFile) throw new Error("Invalid EPUB: missing META-INF/container.xml");

  const containerXml = await containerFile.async("string");
  const opfPath = getOpfPath(containerXml);

  const opfFile = zip.file(opfPath);
  if (!opfFile) throw new Error(`Invalid EPUB: cannot find OPF at ${opfPath}`);

  const opfXml = await opfFile.async("string");
  const opfDir = opfPath.includes("/") ? opfPath.substring(0, opfPath.lastIndexOf("/")) : "";
  const { hrefs, ncxHref } = parseOpf(opfXml, opfDir);

  // Build NCX title map if available
  let ncxTitles = new Map<string, string>();
  if (ncxHref) {
    const ncxFile = zip.file(ncxHref) ?? zip.file(ncxHref.replace(/^\//, ""));
    if (ncxFile) {
      const ncxXml = await ncxFile.async("string");
      const ncxDir = ncxHref.includes("/") ? ncxHref.substring(0, ncxHref.lastIndexOf("/")) : "";
      ncxTitles = parseNcx(ncxXml, ncxDir);
    }
  }

  const chapters: ExtractedChapter[] = [];

  for (let i = 0; i < hrefs.length; i++) {
    onProgress?.(i + 1, hrefs.length);
    const href = hrefs[i];
    const zipFile = zip.file(href) ?? zip.file(href.replace(/^\//, ""));
    if (!zipFile) continue;

    try {
      const html = await zipFile.async("string");
      const text = stripHtml(html);
      if (text.length > 100) {
        // NCX is the authoritative source; fall back to HTML heading extraction
        const title =
          ncxTitles.get(href) ??
          (extractTitleFromHtml(html) || `Chapter ${chapters.length + 1}`);

        chapters.push({
          index: chapters.length + 1,
          title,
          text,
          wordCount: text.split(/\s+/).filter(Boolean).length,
        });
      }
    } catch {
      // skip unreadable entries
    }
  }

  return chapters;
}
