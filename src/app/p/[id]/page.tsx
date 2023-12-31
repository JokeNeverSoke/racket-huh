import type { Metadata } from "next";

// import { api } from "@/trpc/server";
import { caller } from "@/server/api/root";

import { Resizer } from "@/components/resizer";
import { CodeSnippet } from "@/components/code-snippet";

// hide body scrollbar in iframe
// nextjs does not expose a good way to modify
// parent tags inside server elements
import "./iframe.css";

type Props = {
  params: { id: string };
};

export default async function CodePage({ params }: Props) {
  let res;
  try {
    res = await caller.post.get({ id: parseInt(params.id) });
  } catch (e) {
    console.error(e);
  }

  if (!res) {
    return <div>Post not found</div>;
  }

  const { title, content, presetList } = res;
  //console.log({ presetList });

  return (
    <div>
      <Resizer />
      <CodeSnippet code={content} title={title} presetList={presetList} />
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const res = await caller.post.get({ id: parseInt(params.id) });
  if (!res) {
    return {
      title: "Post not found",
    };
  }

  const { title } = res;

  return {
    title: title,
  };
}
export async function generateStaticParams() {
  const posts = await caller.post.list();

  return posts.map((post) => ({
    id: post.id.toString(),
  }));
}
