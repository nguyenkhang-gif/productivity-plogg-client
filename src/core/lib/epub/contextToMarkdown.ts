interface ContextJson {
  title?: string;
  genre?: string;
  setting?: string;
  targetTone?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  characters?: Array<{
    name?: string;
    vietnameseName?: string;
    role?: string;
    personality?: string;
    speechStyle?: string;
    honorific?: string;
    note?: string;
  }>;
  glossary?: Array<{
    original?: string;
    translation?: string;
    note?: string;
  }>;
  styleGuide?: {
    formality?: string;
    keepHonorifics?: boolean;
    keepOriginalNames?: boolean;
    chapterLabel?: string;
    extraNotes?: string;
  };
  chapterSummaries?: Array<{
    chapterNumber?: string | number;
    summary?: string;
  }>;
}

export function contextToMarkdown(json: string): string {
  let ctx: ContextJson;
  try {
    ctx = JSON.parse(json);
  } catch {
    return "```json\n" + json + "\n```";
  }

  const lines: string[] = [];

  if (ctx.title) lines.push(`# ${ctx.title}\n`);

  const meta: string[] = [];
  if (ctx.genre) meta.push(`**Genre:** ${ctx.genre}`);
  if (ctx.sourceLanguage && ctx.targetLanguage)
    meta.push(`**Language:** ${ctx.sourceLanguage} → ${ctx.targetLanguage}`);
  if (meta.length) lines.push(meta.join(" · ") + "\n");

  if (ctx.setting) {
    lines.push(`## Setting\n`);
    lines.push(ctx.setting + "\n");
  }

  if (ctx.targetTone) {
    lines.push(`## Target Tone\n`);
    lines.push(ctx.targetTone + "\n");
  }

  if (ctx.characters?.length) {
    lines.push(`## Characters\n`);
    lines.push("| Name | Vietnamese | Role | Honorific | Notes |");
    lines.push("|---|---|---|---|---|");
    for (const ch of ctx.characters) {
      lines.push(
        `| ${ch.name ?? ""} | ${ch.vietnameseName ?? ""} | ${ch.role ?? ""} | ${ch.honorific ?? ""} | ${ch.note ?? ""} |`
      );
    }
    lines.push("");
  }

  if (ctx.glossary?.length) {
    lines.push(`## Glossary\n`);
    lines.push("| Original | Translation | Notes |");
    lines.push("|---|---|---|");
    for (const g of ctx.glossary) {
      lines.push(`| ${g.original ?? ""} | ${g.translation ?? ""} | ${g.note ?? ""} |`);
    }
    lines.push("");
  }

  if (ctx.styleGuide) {
    const sg = ctx.styleGuide;
    lines.push(`## Style Guide\n`);
    if (sg.formality) lines.push(`- **Formality:** ${sg.formality}`);
    if (sg.keepHonorifics !== undefined)
      lines.push(`- **Keep Honorifics:** ${sg.keepHonorifics}`);
    if (sg.keepOriginalNames !== undefined)
      lines.push(`- **Keep Original Names:** ${sg.keepOriginalNames}`);
    if (sg.chapterLabel) lines.push(`- **Chapter Label:** ${sg.chapterLabel}`);
    if (sg.extraNotes) lines.push(`- **Extra Notes:** ${sg.extraNotes}`);
    lines.push("");
  }

  if (ctx.chapterSummaries?.length) {
    lines.push(`## Chapter Summaries\n`);
    for (const cs of ctx.chapterSummaries) {
      lines.push(`### Chapter ${cs.chapterNumber}`);
      lines.push((cs.summary ?? "") + "\n");
    }
  }

  return lines.join("\n");
}
