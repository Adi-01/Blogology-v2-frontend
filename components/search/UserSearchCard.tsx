import Link from "next/link";
import type { SearchUserItem } from "@/types/search";

interface UserSearchCardProps {
  user: SearchUserItem;
}

export function UserSearchCard({ user }: UserSearchCardProps) {
  return (
    <article className="py-5">
      <Link
        href={`/users/${user.username}`}
        className="flex items-start gap-4 min-w-0 group hover:opacity-85 transition-opacity"
      >
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover border border-border shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-semibold text-sm text-foreground uppercase border border-border shrink-0">
            {user.name.charAt(0)}
          </div>
        )}

        <div className="min-w-0 space-y-1 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-semibold tracking-tight text-foreground group-hover:underline truncate">
              {user.name}
            </h2>
          </div>

          <p className="text-xs text-muted-foreground font-sans">
            @{user.username}
          </p>

          {user.bio && (
            <p className="font-serif text-sm text-muted-foreground line-clamp-2 pt-0.5">
              {user.bio}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
            <span>
              {user.followersCount}{" "}
              {user.followersCount === 1 ? "follower" : "followers"}
            </span>
            <span>·</span>
            <span>
              {user.postsCount} {user.postsCount === 1 ? "story" : "stories"}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
