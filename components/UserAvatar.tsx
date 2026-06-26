"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  avatar: string;
  name: string;
  className?: string;
  imageClassName?: string;
};

export default function UserAvatar({ avatar, name, className, imageClassName }: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const isImage = avatar.startsWith("http") || avatar.startsWith("/") || avatar.startsWith("data:image/");
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "BB";

  useEffect(() => {
    setImageFailed(false);
  }, [avatar]);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-amber-200 to-indigo-500 font-bold text-white",
        className,
      )}
    >
      {isImage && !imageFailed ? (
        <img
          src={avatar}
          alt={`${name} avatar`}
          className={cn("h-full w-full object-cover", imageClassName)}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="text-xs font-extrabold tracking-wide">{initials}</span>
      )}
    </div>
  );
}
