/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { langs } from "@uiw/codemirror-extensions-langs";

import { useScheme } from "@/lib/scheme";

type SchemeLine =
  | {
      __type__: "bigint";
      __value__: bigint;
    }
  | boolean
  | {
      __string__: string;
    }
  | {
      // @ts-expect-error
      _ctype: string;
      // @ts-expect-error
      _order: string[];
      [key: string]: SchemeLine;
    }
  | SchemeList;

type SchemeList = {
  car: SchemeLine;
  cdr: SchemeList | Record<string, never> | undefined | null;
};

function schemeToString(scheme: SchemeLine, startList = true): string {
  const line = scheme;

  if (
    (typeof line === "object" || typeof line === "boolean") &&
    line !== null
  ) {
    const lineObj = line as SchemeLine;
    if (typeof lineObj === "object" && "_ctype" in lineObj) {
      return (
        `(make-${lineObj._ctype} ` +
        lineObj._order
          .map((key) => {
            return schemeToString(lineObj[key]!);
          })
          .join(" ") +
        ")"
      );
    } else if (typeof lineObj === "boolean") {
      return "#" + lineObj.toString();
    } else if ("__type__" in lineObj) {
      return lineObj.__value__.toString();
    } else if ("__string__" in lineObj && lineObj.__string__ !== undefined) {
      return '"' + lineObj.__string__.replace('"', '\\"') + '"';
    } else if ("car" in lineObj) {
      const list = lineObj;

      let listString = "";
      if (startList) {
        listString += "(list ";
      }
      listString += schemeToString(list.car);
      if (list.cdr !== undefined && list.cdr !== null) {
        if (list.cdr === null || list.cdr.cdr === undefined) {
        } else {
          listString += " " + schemeToString(list.cdr as SchemeList, false);
        }
      }
      if (startList) {
        listString += ")";
      }
      return listString;
    }
  }
  return (line as unknown as string).toString();
}

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
  const { scheme, error, onRun, status } = useScheme({
    code: fixed ? code : newCode,
  });

  return (
    <div className="rounded-3xl bg-sky-500 p-4">
      <div className="text-l mb-4 flex items-center rounded-xl bg-white px-8 py-3 font-bold text-black">
        <div>{title}</div>
        <div className="flex-1"></div>
        <button
          className="ml-4 rounded-md bg-sky-800 px-4 py-1 text-white shadow-md transition-shadow hover:shadow-lg"
          onClick={onRun}
          disabled={status === "loading"}
        >
          {status !== "loading" ? "Execute" : "Running..."}
        </button>
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
        <div className="h-auto flex-1 overflow-scroll rounded-xl bg-white shadow-md transition-shadow focus-within:shadow-lg hover:shadow-lg">
          <div className="border-b-[1px] border-sky-950 px-5 py-2 text-sm font-bold text-sky-800">
            Output
          </div>
          <CodeMirror
            value={
              status === "ready"
                ? scheme
                    .filter((line) => line !== undefined)
                    .map((line) => schemeToString(line as SchemeLine))
                    .join("\n")
                : status === "loading"
                ? "Running..."
                : error
                ? // eslint-disable-next-line @typescript-eslint/no-base-to-string
                  error.toString()
                : "Error: unknown error"
            }
            height="auto"
            extensions={[langs.scheme()]}
            editable={false}
          />
        </div>
      </div>
    </div>
  );
};
