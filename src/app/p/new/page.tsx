"use client";
import { useState } from "react";
import { api } from "@/trpc/react";
import { CodeSnippet } from "@/components/code-snippet";

export default function NewCodePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");

  const mutation = api.post.add.useMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { id } = await mutation.mutateAsync({ title, content, password });
    setTitle("");
    setContent("");
    setPassword("");
    alert("Code snippet added! id: " + id);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-slate-700 p-8 dark:text-white"
    >
      <div className="mb-4 flex flex-col">
        <label htmlFor="title" className="mb-2">
          Title:
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          className="rounded-lg border border-gray-400 px-3 py-2"
        />
      </div>
      <div className="mb-4 flex flex-col">
        <label htmlFor="content" className="mb-2">
          Code:
        </label>
        <textarea
          id="content"
          className="rounded-lg border border-gray-400 px-3 py-2 font-mono"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Code"
          required
        />
      </div>
      <div className="mb-4 flex flex-col">
        <label htmlFor="password" className="mb-2">
          Password:
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="rounded-lg border border-gray-400 px-3 py-2"
        />
      </div>
      <CodeSnippet code={content} fixed title={title} />
      <button
        type="submit"
        className="rounded bg-blue-500 px-4 py-2 text-white"
      >
        Submit
      </button>
    </form>
  );
}
