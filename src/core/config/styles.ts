/**
 * Global style constants. Update these to retheme the whole app.
 * For color primitives, edit the CSS variables in globals.css instead.
 */

export const styles = {
  // Interactive text (links, active icons, counts)
  link: "text-accent-text hover:text-accent-hover transition-colors",

  // Muted / secondary text
  muted: "text-text-muted",
  secondary: "text-text-secondary",

  // Tag chip (e.g. #typescript in PostCard)
  tag: "text-xs px-2 py-0.5 rounded-full bg-accent-subtle text-accent-text hover:bg-accent-subtle-hover transition-colors",

  // Primary action button (e.g. Viết bài, Xuất bản)
  btnPrimary: "flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition-colors",

  // Ghost/outline button
  btnGhost: "px-4 py-2 rounded-xl border border-white/[0.08] hover:border-white/20 text-text-muted hover:text-text-primary text-sm transition-colors",

  // Card container
  card: "bg-card border border-border rounded-2xl overflow-hidden shadow-lg",

  // Divider
  divider: "border-border-muted",

  // Category badge base (combine with category-specific color)
  badge: "inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-medium",

  // Footer action button inside cards (like, comment, share)
  footerAction: "flex items-center gap-1.5 text-text-muted text-sm hover:text-accent-text transition-colors",
} as const;
