/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useState } from "react";
import { useScript } from "@uidotdev/usehooks";

const std_functions = {
  "string-upcase": (s: string) => s.toUpperCase(),
  "string-downcase": (s: string) => s.toLowerCase(),
};

const std_aliases = {
  foldr: "fold-right",
  foldl: "fold",
  "λ": "lambda",
};

type Struct = {
  name: string;
  fields: string[];
};
// []
function preprocess(s: string, env: unknown): [string, unknown] {
  const r =
    /[\(\[]define-struct\s+([a-zA-Z!$%&*/:<>?~_^][a-zA-Z0-9.+-@]*)\s+[\(\[]([^\]\[\(\)]+)[\]\)][\]\)]/g;
  const structs: Struct[] = [];
  let m;
  while ((m = r.exec(s)) !== null) {
    if (m.index === r.lastIndex) {
      r.lastIndex++;
    }
    const [, name, fields] = m;
    structs.push({
      name: name!,
      fields: fields!.split(/\s+/),
    });
  }
  // remove structs from code
  const no_struct = s.replace(r, "");
  const with_alias = Object.entries(std_aliases).reduce(
    (acc, [key, value]) =>
      acc.replace(new RegExp("\\(s*" + key, "g"), "(" + value),
    no_struct,
  );
  const with_std =
    `(load "https://unpkg.com/@jcubic/lips@beta/dist/std.scm" lips.env.__parent__)\n` +
    with_alias;

  const functions: Record<string, CallableFunction> = {};
  structs.forEach((struct) => {
    const { name, fields } = struct;
    if (`make-${name}` in functions) {
      throw new Error(`struct ${name} already defined`);
    }
    functions[`make-${name}`] = (...args: unknown[]) => {
      const obj: Record<string, unknown> = { _ctype: name, _order: fields };
      fields.forEach((field, i) => {
        obj[field] = args[i];
      });
      return obj;
    };
    if (`${name}?` in functions) {
      throw new Error(`${name}?: this name is already defined`);
    }
    functions[`${name}?`] = (obj: unknown) => {
      return (
        typeof obj === "object" &&
        obj !== null &&
        "_ctype" in obj &&
        obj._ctype === name
      );
    };
    fields.forEach((field) => {
      if (`${name}-${field}` in functions) {
        throw new Error(`${name}-${field}: this name is already defined`);
      }
      functions[`${name}-${field}`] = (obj: unknown) => {
        if (
          typeof obj === "object" &&
          obj !== null &&
          "_ctype" in obj &&
          obj._ctype === name
        ) {
          return (obj as Record<string, unknown>)[field];
        }
        throw new Error(`Expected ${name} got ${obj as string}`);
      };
    });
  });

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return [with_std, env.inherit("name", functions)];
}

export const useScheme = ({ code }: { code: string }) => {
  const cstatus = useScript(
    "https://cdn.jsdelivr.net/npm/@jcubic/lips@beta/dist/lips.min.js",
  );
  const [scheme, setScheme] = useState<unknown[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [status, setStatus] = useState<"ready" | "loading" | "error">("ready");
  const [trigger, setTrigger] = useState(0);

  const debouncedCode = code;

  useEffect(() => {
    void (async () => {
      if (cstatus !== "ready") {
        return;
      }
      setStatus("loading");
      console.log("Starting execution");
      try {
        /* eslint-disable */
        // @ts-ignore
        const { exec, env } = global.lips as { exec: Exec };
        console.log("Preprocessing");
        const stdenv = env.inherit("name", std_functions);
        const [s, lenv] = preprocess(debouncedCode, stdenv);
        console.log("Executing");
        const scheme = await exec(s, lenv);
        console.log("Done");
        setScheme(scheme);
        setStatus("ready");
      } catch (err: unknown) {
        setError(err);
        setStatus("error");
        console.log(err);
      }
    })();
  }, [cstatus, trigger]);

  const onRun = () => {
    setTrigger((t) => t + 1);
  };
  return { scheme, error, onRun, status };
};
