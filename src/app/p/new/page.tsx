"use client";
import { useState, useMemo } from "react";
import { api } from "@/trpc/react";
import { CodeSnippet } from "@/components/code-snippet";

export default function NewCodePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [preset, setPreset] = useState<number | "null">("null");

  const { data: availablePresets } = api.post.list.useQuery();

  const presetList = useMemo(() => {
    const list = [];
    let presetId = preset === "null" ? null : preset;
    while (presetId) {
      const preset = availablePresets?.find((p) => p.id === presetId);
      if (!preset) break;
      list.push(preset);
      presetId = preset.presetId;
    }
    return list;
  }, [preset, availablePresets]);

  const mutation = api.post.add.useMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { id } = await mutation.mutateAsync({
      title,
      content,
      password,
      presetId: preset === "null" ? undefined : preset,
    });
    setTitle("");
    setContent("");
    setPassword("");
    setPreset("null");
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
        <label htmlFor="countries" className="mb-2">
          Select an option
        </label>
        <select
          id="countries"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          value={preset}
          onChange={(e) => setPreset(parseInt(e.target.value))}
        >
          <option value={"null"}>No Preset</option>
          {availablePresets?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
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
      <CodeSnippet code={content} fixed title={title} presetList={presetList} />
      <button
        type="submit"
        className="rounded bg-blue-500 px-4 py-2 text-white"
      >
        Submit
      </button>
    </form>
  );
}
