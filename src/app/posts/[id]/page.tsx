"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, CalendarDays, Eye, Pencil } from "lucide-react";

import { RootState } from "@/core/redux/store";
import { useGetPostById } from "@/core/services/client/posts";
import { useQuery } from "@/core/plugins/reactQuery";
import { apiGetPosts, apiViewPost } from "@/core/services/api/posts";
import { FetchQueryKeys } from "@/core/services/endpoints";
import { Post, PostCategoryObject, PostTag } from "@/core/types/post";
import { timeAgo } from "@/core/lib/timeAgo";
import CommentSection from "@/components/posts/CommentSection";
import ReactionButton from "@/components/posts/ReactionButton";
import UserAvatar from "@/components/ui/UserAvatar";

// ─── constants ────────────────────────────────────────────────────────────────

const HERO_GRADIENTS = [
  "from-indigo-950 via-slate-900 to-slate-900",
  "from-blue-950 via-slate-900 to-slate-900",
  "from-violet-950 via-slate-900 to-slate-900",
  "from-slate-800 via-zinc-900 to-slate-900",
  "from-teal-950 via-slate-900 to-slate-900",
  "from-sky-950 via-slate-900 to-slate-900",
  "from-purple-950 via-slate-900 to-slate-900",
  "from-cyan-950 via-slate-900 to-slate-900",
];

const TITLE_PLACEHOLDERS = [
  "Untitled",
  "A thought, unfinished",
  "Something worth reading",
  "Notes to myself",
  "A quiet moment",
  "Thinking out loud",
  "Draft — still thinking",
  "No title needed",
];

// ─── related post card ────────────────────────────────────────────────────────

function RelatedPostCard({ post }: { post: Post }) {
  const heroGradient = HERO_GRADIENTS[post.id.charCodeAt(0) % HERO_GRADIENTS.length];
  const category =
    post.category && typeof post.category === "object"
      ? (post.category as PostCategoryObject).name
      : typeof post.category === "string"
      ? post.category
      : null;

  return (
    <Link
      href={`/posts/${post.id}`}
      className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/40 transition-colors"
    >
      {/* thumbnail */}
      <div className="relative h-32 overflow-hidden bg-surface">
        {post.imageUrls?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.imageUrls[0]}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${heroGradient} dark:opacity-60 opacity-15`}
          />
        )}
        {category && (
          <span className="absolute top-2.5 left-2.5 text-[10px] px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-white border border-white/10">
            {category}
          </span>
        )}
      </div>

      {/* text */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-text-primary text-sm font-medium leading-snug line-clamp-2 group-hover:text-accent transition-colors mb-auto">
          {post.title ?? "Untitled"}
        </p>
        <p className="text-text-muted text-xs mt-3">{timeAgo(post.createdAt)}</p>
      </div>
    </Link>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { profile } = useSelector((state: RootState) => state.user);
  const { data: post, isLoading, isError } = useGetPostById(id);

  // Build filter params once post is available: prefer category+tags, fall back to tags-only
  const categoryId =
    post?.category && typeof post.category === "object"
      ? (post.category as PostCategoryObject).id
      : undefined;
  const tagSlugs = post?.tags
    ?.map((t) => (typeof t === "string" ? t : (t as PostTag).slug))
    .filter(Boolean)
    .join(",");
  const hasFilters = !!categoryId || !!tagSlugs;

  const { data: relatedData } = useQuery({
    queryKey: [FetchQueryKeys.POST_GET_ALL, "related", id, categoryId, tagSlugs],
    queryFn: () =>
      apiGetPosts({
        page: 1,
        limit: 5,
        ...(categoryId ? { categoryId } : {}),
        ...(tagSlugs ? { tags: tagSlugs } : {}),
        excludeId: id,
      }),
    enabled: hasFilters,
  });

  const relatedPosts = (relatedData?.items ?? []).slice(0, 3);

  useEffect(() => {
    if (!post) return;
    const key = `viewed_${post.id}`;
    if (sessionStorage.getItem(key)) return;
    if (post.author?.id === profile.id || post.authorId === profile.id) return;
    apiViewPost(post.id).catch(() => {});
    sessionStorage.setItem(key, "1");
  }, [post?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <Skeleton />;
  if (isError || !post) return <NotFound />;

  const isOwner =
    post.author?.id === profile.id || post.authorId === profile.id;

  const heroGradient = HERO_GRADIENTS[post.id.charCodeAt(0) % HERO_GRADIENTS.length];
  const displayTitle =
    post.title ?? TITLE_PLACEHOLDERS[post.id.charCodeAt(1) % TITLE_PLACEHOLDERS.length];
  const hasImage = post.imageUrls?.length > 0;
  const category =
    post.category && typeof post.category === "object"
      ? (post.category as PostCategoryObject)
      : null;

  return (
    <div className="min-h-screen bg-page">

      {/* ── hero ── */}
      <div className="relative w-full min-h-[42vh] flex items-center justify-center overflow-hidden">

        {/* background */}
        {hasImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrls[0]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-md opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-page via-page/65 to-page/10" />
          </>
        ) : (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${heroGradient} dark:opacity-70 opacity-20`} />
            <div className="absolute inset-0 bg-gradient-to-t from-page via-transparent to-transparent" />
          </>
        )}

        {/* scattered decorative quotes (non-sepia) */}
        <span className="sepia-hide absolute top-10 left-8 text-5xl font-serif text-text-muted/10 select-none leading-none rotate-6">&#8220;</span>
        <span className="sepia-hide absolute top-16 right-12 text-3xl font-serif text-text-muted/10 select-none leading-none -rotate-6">&#8221;</span>
        <span className="sepia-hide absolute bottom-12 left-16 text-2xl font-serif text-text-muted/10 select-none leading-none rotate-3">&#8220;</span>
        <span className="sepia-hide absolute bottom-8 right-8 text-4xl font-serif text-text-muted/10 select-none leading-none -rotate-3">&#8221;</span>

        {/* sakura petals (sepia theme only) */}
        <span className="sakura-petal absolute top-8   left-10  w-3 h-5 rounded-full opacity-30 rotate-12"  />
        <span className="sakura-petal absolute top-20  left-5   w-2 h-3 rounded-full opacity-20 -rotate-20" />
        <span className="sakura-petal absolute top-10  right-14 w-3 h-5 rounded-full opacity-25 rotate-45" />
        <span className="sakura-petal absolute top-28  right-8  w-2 h-4 rounded-full opacity-20 -rotate-12" />
        <span className="sakura-petal absolute bottom-10 left-8  w-3 h-5 rounded-full opacity-25 rotate-6"  />
        <span className="sakura-petal absolute bottom-6  left-20 w-2 h-3 rounded-full opacity-15 rotate-30" />
        <span className="sakura-petal absolute bottom-8  right-10 w-3 h-5 rounded-full opacity-30 -rotate-15"/>
        <span className="sakura-petal absolute bottom-16 right-4  w-2 h-4 rounded-full opacity-20 rotate-20" />

        {/* hero content */}
        <div className="relative z-10 w-full max-w-2xl mx-auto px-6 md:px-10 py-12 text-center">

          {category && (
            <span className="inline-block text-[10px] tracking-[0.18em] uppercase px-4 py-1.5 rounded-full border border-border text-text-muted mb-8">
              {category.name}
            </span>
          )}

          {/* title with flanking quotes */}
          <div className="relative inline-block w-full">
            <span className="absolute -top-3 left-0 text-5xl font-serif leading-none text-text-muted/30 select-none">&ldquo;</span>
            <h1
              className={`font-serif text-4xl md:text-5xl lg:text-[3.4rem] italic leading-[1.15] tracking-tight px-8 ${
                post.title ? "text-text-primary" : "text-text-muted"
              }`}
            >
              {displayTitle}
            </h1>
            <span className="absolute -bottom-5 right-0 text-5xl font-serif leading-none text-text-muted/30 select-none">&rdquo;</span>
          </div>

          {/* divider */}
          <div className="flex items-center justify-center gap-3 mt-8 mb-8">
            <span className="h-px w-10 bg-border" />
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="h-px w-10 bg-border" />
          </div>

          {/* author + meta */}
          <div className="flex items-center justify-center gap-3">
            <UserAvatar src={post.author?.profilePic} name={post.author?.fullName} size="md" />
            <div className="text-left">
              <p className="text-text-secondary text-sm font-medium leading-tight">
                {post.author?.fullName ?? "Unknown"}
              </p>
              <div className="flex items-center gap-2 text-text-muted text-xs mt-1">
                <span title={new Date(post.createdAt).toLocaleString("vi-VN")}>
                  {timeAgo(post.createdAt)}
                </span>
                {post.viewCount != null && (
                  <>
                    <span className="opacity-40">·</span>
                    <span>{post.viewCount.toLocaleString()} views</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── body ── */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-14">

        {/* secondary images */}
        {post.imageUrls?.length > 1 && (
          <div className="grid grid-cols-2 gap-1 mb-10 rounded-2xl overflow-hidden">
            {post.imageUrls.slice(1).map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt="" className="w-full" />
            ))}
          </div>
        )}

        {/* markdown body */}
        <article
          className="prose prose-sm max-w-none
            [&_p]:text-text-secondary [&_p]:leading-[1.9] [&_p]:my-4
            [&_h1]:text-text-primary [&_h2]:text-text-primary [&_h3]:text-text-secondary
            [&_h1]:font-bold [&_h2]:font-semibold [&_h3]:font-medium
            [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg
            [&_h1]:mt-10 [&_h1]:mb-4 [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:mt-6 [&_h3]:mb-2
            [&_strong]:text-text-primary
            [&_em]:text-text-secondary [&_em]:italic
            [&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline
            [&_code]:text-accent [&_code]:bg-surface-raised [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs
            [&_pre]:bg-surface-raised [&_pre]:border [&_pre]:border-border [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:my-5
            [&_blockquote]:border-l-2 [&_blockquote]:border-accent/40 [&_blockquote]:pl-5 [&_blockquote]:text-text-muted [&_blockquote]:italic [&_blockquote]:my-6
            [&_ul]:text-text-secondary [&_ol]:text-text-secondary
            [&_li]:my-1.5 [&_li]:marker:text-text-muted
            [&_hr]:border-border [&_hr]:my-10"
        >
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>

        {/* tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-7 border-t border-border">
            {post.tags.map((tag, i) => {
              const t = tag as string | PostTag;
              const label = typeof t === "string" ? t : t.slug;
              return (
                <span
                  key={i}
                  className="text-xs px-3 py-1 rounded-full bg-surface text-text-muted border border-border tracking-wide"
                >
                  #{label}
                </span>
              );
            })}
          </div>
        )}

        {/* reactions */}
        <div className="mt-7 pb-10 border-b border-border">
          <ReactionButton post={post} />
        </div>

        {/* comments */}
        <div className="mt-10">
          <CommentSection postId={post.id} />
        </div>

        {/* ── more from author ── */}
        {relatedPosts.length > 0 && (
          <section className="mt-14 pt-10 border-t border-border">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-text-primary">
                More from{" "}
                <span className="text-accent">{post.author?.fullName ?? "this author"}</span>
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((rp) => (
                <RelatedPostCard key={rp.id} post={rp} />
              ))}
            </div>
          </section>
        )}

        {/* ── bottom nav ── */}
        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
          <Link
            href="/posts"
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to feed
          </Link>
          {isOwner && (
            <button
              onClick={() => router.push(`/create-post?edit=${post.id}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border hover:border-accent text-text-muted hover:text-accent transition-colors"
            >
              <Pencil size={13} />
              Edit post
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── loading skeleton ─────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="min-h-screen bg-page animate-pulse">
      <div className="min-h-[48vh] bg-surface flex items-end">
        <div className="max-w-3xl mx-auto px-4 md:px-6 pb-12 pt-20 w-full space-y-4">
          <div className="h-5 w-20 bg-surface-raised rounded-full" />
          <div className="h-10 w-3/4 bg-surface-raised rounded-xl" />
          <div className="h-8 w-1/2 bg-surface rounded-xl" />
          <div className="flex items-center gap-3 mt-5">
            <div className="w-9 h-9 rounded-full bg-surface-raised" />
            <div className="space-y-2">
              <div className="h-3 w-28 bg-surface-raised rounded" />
              <div className="h-3 w-20 bg-surface rounded" />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-surface-raised rounded ${i % 3 === 2 ? "w-2/3" : "w-full"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── 404 ─────────────────────────────────────────────────────────────────────

function NotFound() {
  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-6xl font-bold text-text-muted/20 select-none">404</p>
      <p className="text-text-muted">
        This post doesn&apos;t exist or isn&apos;t published.
      </p>
      <Link
        href="/posts"
        className="flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition-colors mt-2"
      >
        <ArrowLeft size={14} />
        Back to feed
      </Link>
    </div>
  );
}
