# Data Table components

Reusable table + filter bar for admin-style list pages (search, select filters,
paginated table, row actions). Built for `admin/posts`; designed to be dropped
into any page with the same shape (paginated list + filters + row actions).

## When to use this

- You have a paginated list from a React Query hook (`{ items, pagination }`).
- You need search/select filters above the table.
- Each row needs 0+ action buttons (approve/reject/delete/etc).

If your table doesn't paginate, or needs heavy custom layout per row, it may be
simpler to write plain JSX instead of forcing it into this API.

## What's included

| File | Purpose |
|---|---|
| `AppDataTable.tsx` | The table itself — columns, rows, actions column, pagination footer |
| `AppFilterBar.tsx` | Renders `text` / `select` filters from a config array |
| `Pagination.tsx` | Rows-per-page selector + page number pills (used internally by `AppDataTable`) |
| `ActionsCell.tsx` | Wraps a row's action buttons — `inline` (buttons in the row) or `dropdown` (behind a "⋮" trigger) |
| `types.ts` | `ColumnConfig`, `FilterConfig`, `RowActionConfig`, `PaginationInfo`, `getNestedValue()` |
| `useTableState.ts` (`src/core/hooks/`) | `page` / `limit` / debounced `search` state, so pages don't hand-roll it |

Import everything from the barrel:

```ts
import { AppDataTable, AppFilterBar, ColumnConfig, FilterConfig } from "@/components/ui/data-table";
import { useTableState } from "@/core/hooks/useTableState";
```

## Quick start

```tsx
const { page, setPage, limit, setLimit, searchInput, search, setSearch } = useTableState();
const [status, setStatus] = useState("");

const { data, isLoading } = useGetThings({ page, limit, search: search || undefined, status: status || undefined });
const items = data?.items ?? [];
const pagination = data?.pagination;

const columns: ColumnConfig<Thing>[] = [
  { key: "name", header: "Name" },
  { key: "status", header: "Status", format: "badge", badgeMap: STATUS_BADGE },
  { key: "createdAt", header: "Created", format: "date" },
];

const filtersConfig: FilterConfig[] = [
  { key: "search", type: "text", placeholder: "Search...", value: searchInput, onChange: setSearch },
  {
    key: "status",
    type: "select",
    value: status,
    options: [{ label: "All", value: "" }, { label: "Active", value: "active" }],
    onChange: (v) => { setStatus(v); setPage(1); },
  },
];

return (
  <>
    <AppFilterBar filters={filtersConfig} />
    <AppDataTable
      columns={columns}
      items={items}
      loading={isLoading}
      rowKey={(t) => t.id}
      pagination={pagination}
      onPageChange={setPage}
      onLimitChange={setLimit}
    />
  </>
);
```

That's it for a table with no row actions. Read on for actions, custom cells, etc.

## `ColumnConfig<T>`

```ts
{
  key: string;                 // supports dot-path: "author.fullName"
  header: string;
  format?: "text" | "badge" | "date";   // default "text"
  render?: (row: T) => ReactNode;       // full override, ignores `format`
  badgeMap?: Record<string, string>;    // format:"badge" — value -> Tailwind classes
  dateFormat?: (value: unknown) => string; // format:"date" — default: toLocaleDateString()
  className?: string | ((row: T) => string);
  align?: "left" | "center" | "right";
  nowrap?: boolean;
  onCellClick?: (row: T) => void;       // makes the cell clickable (adds cursor + hover color)
}
```

- Use `format: "badge"` / `"date"` for the common cases (status pills, dates).
- Use `render` when the cell needs custom markup (e.g. a truncated title with a
  fallback for empty values) — this is the escape hatch, `format` is ignored
  when `render` is set. Example from `admin/posts`:

```tsx
{
  key: "title",
  header: "Title",
  className: "max-w-[240px] truncate text-text-primary",
  onCellClick: (post) => setPreviewPostId(post.id),
  render: (post) => post.title || <span className="text-text-muted italic">Untitled</span>,
}
```

## `FilterConfig`

```ts
{ key: string; type: "text" | "select"; label?: string; placeholder?: string;
  value: string; options?: { label: string; value: string }[]; onChange: (value: string) => void }
```

`AppFilterBar` is fully controlled — it doesn't own state or debounce anything.
Wire `value`/`onChange` to your own state (or `useTableState`'s `searchInput`/
`setSearch`, which already resets to page 1 and debounces `search` for you).

Only `text` and `select` exist today (no date-range, no multi-select) — add a
new branch in `AppFilterBar.tsx` if a page needs one; don't build it speculatively.

## Row actions — two ways

### 1. `rowActions` — generic icon buttons

Use this when every action is just an icon button with a click handler.

```tsx
const rowActions: RowActionConfig<Thing>[] = [
  { key: "edit", icon: Pencil, tooltip: "Edit", onClick: (t) => openEdit(t) },
  {
    key: "delete", icon: Trash2, tooltip: "Delete", variant: "danger",
    onClick: (t) => setDeleteTarget(t),
    show: (t) => t.canDelete,       // optional — hide conditionally
    disabled: (t) => t.isBusy,      // optional
  },
];

<AppDataTable ... rowActions={rowActions} />
```

`variant` is `"default" | "success" | "danger"` and maps to the same button
colors used across the admin pages.

### 2. `renderActions` — full override

Use this when the actions cell needs more than icon buttons — conditional
groups, an inline text input, etc. (`admin/posts`'s reject-with-reason flow is
exactly this case; forcing it into `rowActionsConfig` would make the config
harder to read than plain JSX). Pull the JSX into its own component and pass
data in as props — don't inline a large render function:

```tsx
// components/admin/PostRowActions.tsx
export default function PostRowActions({ busy, isPending, rejectReason, onReasonChange, onApprove, onReject, onDelete }) { ... }

// page.tsx
<AppDataTable
  ...
  renderActions={(post) => (
    <PostRowActions
      busy={approvingId === post.id || rejectingId === post.id}
      isPending={post.moderationStatus === PostModerationStatus.Pending}
      rejectReason={rejectReasons[post.id] ?? ""}
      onReasonChange={(v) => setRejectReasons((r) => ({ ...r, [post.id]: v }))}
      onApprove={() => handleApprove(post.id)}
      onReject={() => handleReject(post.id)}
      onDelete={() => setDeleteTarget({ id: post.id, title: post.title })}
    />
  )}
/>
```

If both `rowActions` and `renderActions` are passed, `renderActions` wins.

### `actionsVariant`: inline vs dropdown

```tsx
<AppDataTable ... actionsVariant="dropdown" />   // default is "inline"
```

- `"inline"` (default) — buttons render directly in the row, like the current
  `admin/posts` table.
- `"dropdown"` — the same content (from `rowActions` or `renderActions`) is
  collapsed behind a "⋮" trigger, useful once a row has more actions than
  comfortably fit inline. No extra wiring needed — just flip the prop.

## Pagination

Pass `pagination` (`{ page, limit, total, totalPages }`) + `onPageChange` +
`onLimitChange` and `AppDataTable` renders the footer (rows-per-page select,
page pills, first/prev/next/last) automatically. Omit `pagination` entirely to
render the table with no pagination footer.

## `useTableState()`

```ts
const { page, setPage, limit, setLimit, searchInput, search, setSearch, resetPage } =
  useTableState({ initialLimit: 20, searchDebounceMs: 400 }); // both optional, these are the defaults
```

- `searchInput` — raw input value, update it on every keystroke via `setSearch`.
- `search` — debounced value; pass this to your query, not `searchInput`.
- `setSearch` / `setLimit` both call `resetPage()` internally (page 1 on filter/limit change) — mirrors what every existing admin table already did by hand.
- Filters outside of search (selects, etc.) are **not** covered — keep those as
  plain `useState` in the page and call `setPage(1)` yourself on change (see
  `moderationStatus`/`visibility` in `admin/posts/page.tsx`).

## Not included (by design)

Kept out to avoid building speculative capability — add if/when a real page
needs it, not before:

- Date-range filters, sorting, multi-select filters
- Auto-generated index/STT column
- Toolbar actions (e.g. a "+ Add" button above the table)
- Responsive per-breakpoint column sets (mobile/tablet/desktop column lists)

## Reference implementation

`src/app/admin/posts/page.tsx` + `src/components/admin/PostRowActions.tsx` is
the canonical example — copy its shape for the next migration (e.g.
`admin/users`).
