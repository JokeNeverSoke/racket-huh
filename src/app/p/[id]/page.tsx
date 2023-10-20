"use client";
import { useState, useEffect } from "react";
import { api } from "@/trpc/react";

import { useScheme } from "@/lib/scheme";

const CodeSnippet = ({ code }: { code: string }) => {
  const [newCode, setNewCode] = useState(code);
  const { scheme, error } = useScheme({ code: newCode });

  console.log({ scheme, error });
  return (
    <div className="font-mono">
      <pre className="mb-4 bg-gray-900 p-2">
        <textarea value={newCode} onChange={(e) => setNewCode(e.target.value)} />
      </pre>
      <pre className="bg-gray-900 p-2">{scheme.toString()}</pre>
    </div>
  );
};

export default function CodePage({ params }: { params: { id: string } }) {
  const res = api.post.get.useQuery({ id: parseInt(params.id) });
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
