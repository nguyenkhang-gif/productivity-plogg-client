interface UserAvatarProps {
  name?: string | null;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
}

const SIZE_CLASS: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  xs: "w-7 h-7 text-xs",
  sm: "w-8 h-8 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-10 h-10 text-sm",
  xl: "w-20 h-20 text-2xl",
};

export default function UserAvatar({ name, src, size = "lg", className = "", onClick }: UserAvatarProps) {
  const letter = name?.[0]?.toUpperCase() ?? "?";
  const clickable = !!onClick && !!src;

  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={`rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden ${SIZE_CLASS[size]} ${clickable ? "cursor-pointer hover:opacity-90 transition-opacity" : ""} ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ?? ""} className="w-full h-full object-cover" />
      ) : (
        letter
      )}
    </div>
  );
}
