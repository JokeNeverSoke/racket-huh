"use client";

import { api } from "@/trpc/react";

import { CodeSnippet } from "@/components/code-snippet";
import { useEffect } from "react";

export default function CodePage({ params }: { params: { id: string } }) {
  const res = api.post.get.useQuery({ id: parseInt(params.id) });
  useEffect(() => {
    window.addEventListener("message", (e) => {
      if (e.data === "getHeight") {
        const height = document.body.scrollHeight;
        window.parent.postMessage({ height }, "*");
      }
    });
  });
  if (res.isLoading) {
    return <div>Loading...</div>;
  }
  if (!res.data) {
    return <div>Post not found</div>;
  }

  const { title, content } = res.data;
  return (
    <div>
      <CodeSnippet code={content} title={title} />
    </div>
  );
}
