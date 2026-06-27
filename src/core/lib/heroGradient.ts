// Gradient nền "hero" suy ra ổn định từ id (cùng id luôn ra cùng gradient).
export const HERO_GRADIENTS = [
  "from-indigo-950 via-slate-900 to-slate-900",
  "from-blue-950 via-slate-900 to-slate-900",
  "from-violet-950 via-slate-900 to-slate-900",
  "from-slate-800 via-zinc-900 to-slate-900",
  "from-teal-950 via-slate-900 to-slate-900",
  "from-sky-950 via-slate-900 to-slate-900",
  "from-purple-950 via-slate-900 to-slate-900",
  "from-cyan-950 via-slate-900 to-slate-900",
];

export function getHeroGradient(id: string): string {
  return HERO_GRADIENTS[id.charCodeAt(0) % HERO_GRADIENTS.length];
}
