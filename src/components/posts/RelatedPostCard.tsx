import Link from "next/link";
import { Post, PostCategoryObject } from "@/core/types/post";
import { timeAgo } from "@/core/lib/timeAgo";
import { getHeroGradient } from "@/core/lib/heroGradient";

export default function RelatedPostCard({ post }: { post: Post }) {
  const heroGradient = getHeroGradient(post.id);
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
