"use client";

import * as React from "react";

export function ViewIncrement({ postId }: { postId: string }) {
  React.useEffect(() => {
    // Fire and forget via same-origin proxy route so HttpOnly session cookie is forwarded
    fetch(`/api/posts/${encodeURIComponent(postId)}/view`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {
      // Ignore background view increment errors
    });
  }, [postId]);

  return null;
}
