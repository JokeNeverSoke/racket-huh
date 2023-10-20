"use client";

import { api } from "@/trpc/react";

import { CodeSnippet } from "@/components/code-snippet";

export default function CodePage({ params }: { params: { id: string } }) {
  const res = api.post.get.useQuery({ id: parseInt(params.id) });
  if (res.isLoading) {
    return <div>Loading...</div>;
  }
  if (!res.data) {
    return <div>Post not found</div>;
  }

  const { title, content } = res.data;
  return (
    <div className="rounded-3xl bg-slate-700 p-8">
      <h1 className="mb-5 text-3xl text-white">{title}</h1>
      <CodeSnippet code={content} />
    </div>
  );
}
