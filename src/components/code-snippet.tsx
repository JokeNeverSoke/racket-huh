import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { langs } from "@uiw/codemirror-extensions-langs";

import { useScheme } from "@/lib/scheme";

export const CodeSnippet = ({
  code,
  fixed: f,
  title,
}: {
  code: string;
  fixed?: boolean;
  title: string;
}) => {
  const fixed = f ?? false;
  const [newCode, setNewCode] = useState(code);
  const { scheme, error } = useScheme({ code: fixed ? code : newCode });

  console.log({ scheme, error });
  return (
    <div className="rounded-3xl bg-sky-500 p-4">
      <div className="text-l mb-4 rounded-xl bg-white px-8 py-3 font-bold text-black">
        {title}
      </div>
      <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="h-auto flex-1 overflow-scroll rounded-xl bg-white shadow-md transition-shadow hover:shadow-lg">
          <div className="border-b-[1px] border-sky-950 px-5 py-2 text-sm font-bold text-sky-800">
            Source
          </div>
          <CodeMirror
            value={fixed ? code : newCode}
            onChange={(value) => setNewCode(value)}
            height="auto"
            extensions={[langs.scheme()]}
            editable={!fixed}
          />
        </div>
        <div className="h-auto flex-1 overflow-scroll rounded-xl bg-white shadow-md transition-shadow hover:shadow-lg focus-within:shadow-lg">
          <div className="border-b-[1px] border-sky-950 px-5 py-2 text-sm font-bold text-sky-800">
            Output
          </div>
          <CodeMirror
            value={scheme
              .filter((line) => line !== undefined)
              .map((line) => (line as string).toString())
              .join("\n")}
            height="auto"
            extensions={[langs.scheme()]}
            editable={false}
          />
        </div>
      </div>
    </div>
  );
};
