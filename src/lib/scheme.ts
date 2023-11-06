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
  λ: "lambda",
};

function readToken(token: string): AllToken {
  if (token === "(") {
    return {
      type: "OPENING_PARENS",
    };
  } else if (token === ")") {
    return {
      type: "CLOSING_PARENS",
    };
  } else if (token.match(/^\d+$/)) {
    return {
      type: "INTEGER",
      value: parseInt(token),
    };
  } else {
    return {
      type: "SYMBOL",
      value: token,
    };
  }
}

type AllToken =
  | {
      type: "OPENING_PARENS";
    }
  | {
      type: "CLOSING_PARENS";
    }
  | Token;
type Token =
  | {
      type: "INTEGER";
      value: number;
    }
  | {
      type: "SYMBOL";
      value: string;
    };

function tokenize(expression: string) {
  return expression
    .replace(/\(/g, " ( ")
    .replace(/\)/g, " ) ")
    .trim()
    .split(/\s+/)
    .map(readToken);
}

type AST = Token[] | AST[];

function buildAST(tokens: AllToken[]) {
  return tokens.reduce(
    (ast: AST[], token) => {
      if (token.type === "OPENING_PARENS") {
        ast.push([]);
      } else if (token.type === "CLOSING_PARENS") {
        const current_expression = ast.pop()!;
        // @ts-ignore
        ast[ast.length - 1]!.push(current_expression);
      } else {
        const current_expression = ast.pop() as Token[];
        current_expression.push(token);
        ast.push(current_expression);
      }
      return ast;
    },
    [[]],
  )[0]![0] as AST;
}

function parse(expression: string) {
  return buildAST(tokenize(expression));
}
function build(ast: AST): string {
  return ast
    .map((node) => {
      if (Array.isArray(node)) {
        return `(${build(node)})`;
      } else {
        return node.value;
      }
    })
    .join(" ");
}

/** finds the corresponding closing ) or ] */
function corresponding(str: string, index: number): number {
  const stack = [];
  for (let i = index; i < str.length; i++) {
    const c = str[i];
    if (c === "(" || c === "[") {
      stack.push(c);
    } else if (c === ")" || c === "]") {
      stack.pop();
      if (stack.length === 0) {
        return i;
      }
    }
  }
  return -1;
}

function remove_comments(code: string): string {
  // comments can be line start of ";"
  // or multiline with "#|" and "|#"

  // remove line comments
  const line_comment_re = /;.*$/gm;
  const no_line_comments = code.replace(line_comment_re, "");

  // remove multiline comments
  const multiline_comment_re = /#\|[\s\S]*?\|#/g;
  const no_multiline_comments = no_line_comments.replace(
    multiline_comment_re,
    "",
  );
  return no_multiline_comments;
}

function bracket_to_parenthesis(code: string): string {
  // we need to transform [define-statements ...] into (define-statements ...)
  // because lips doesn't support brackets
  const r = /\[([^\]]+)\]/g;
  return code.replace(r, "($1)");
}

function remap_locals(code: string): string {
  // locals -> let
  // we need to transform (local (define-statements ...) ...) into (let ((assignment statements) ...) ...)
  // because lips doesn't support local
  // example:
  // (local (define (f x) x) (f 1)) -> (let ((f (lambda (x) x))) (f 1))

  // find all "(local"
  const local_re = /\(local/g;
  const local = [];
  let m;
  while ((m = local_re.exec(code)) !== null) {
    if (m.index === local_re.lastIndex) {
      local_re.lastIndex++;
    }
    local.push(m.index);
  }
  // find their corresponding range
  const ranges = local.map((index) => {
    const end = corresponding(code, index);
    return [index, end] as const;
  });

  // remove nested ranges
  const filtered_ranges = ranges.filter(
    ([start, end]) =>
      !ranges.some(([start2, end2]) => start2 < start && end < end2),
  );

  const definitions = filtered_ranges.map(([start, end]) => {
    // find all define-statement and the single body
    const ast = parse(code.slice(start, end + 1));
    const [_local, statements, body] = ast as AST[];
    const assignments = statements!.map((statement) => {
      const [_define, definition, body] = statement as AST;
      console.log({ definition, body });
      if (Array.isArray(definition)) {
        // function
        const [name, ...params] = definition;
        const k = [name, [{ type: "SYMBOL", value: "lambda" }, params, body]];
        console.log({ k });
        return k;
      } else if (definition) {
        return [{ type: "SYMBOL", value: definition.value }, body];
      } else {
        throw new Error("Unexpected");
      }
    });
    console.log({ assignments });
    return {
      start,
      end,
      assignments,
      body,
    };
  });
  console.log({ definitions });
  // replace all local with let
  let new_code = code;
  definitions.reverse().forEach(({ start, end, assignments, body }) => {
    const let_statement = [{ type: "SYMBOL", value: "let" }, assignments, body];
    const k = build(let_statement as AST);
    new_code =
      new_code.slice(0, start) + "(" + k + ")" + new_code.slice(end + 1);
  });
  console.log({ code, new_code });
  return new_code;
}

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

  const with_no_brackets = bracket_to_parenthesis(s);

  const with_no_comments = remove_comments(with_no_brackets);

  // remove structs from code
  const no_struct = with_no_comments.replace(r, "");

  // remap function aliases - starts with '('
  const with_alias = Object.entries(with_no_brackets).reduce(
    (acc, [key, value]) =>
      acc.replace(new RegExp("\\(s*" + key, "g"), "(" + value),
    no_struct,
  );

  const with_no_local = remap_locals(with_alias);

  const with_std =
    `(load "https://unpkg.com/@jcubic/lips@beta/dist/std.scm" lips.env.__parent__)\n` +
    with_no_local;

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
      //console.log("Starting execution");
      try {
        /* eslint-disable */
        // @ts-ignore
        const { exec, env } = global.lips as { exec: Exec };
        //console.log("Preprocessing");
        const stdenv = env.inherit("name", std_functions);
        const [s, lenv] = preprocess(debouncedCode, stdenv);
        //console.log("Executing");
        const scheme = await exec(s, lenv);
        //console.log("Done");
        setScheme(scheme);
        setStatus("ready");
      } catch (err: unknown) {
        setError(err);
        setStatus("error");
        //console.log(err);
      }
    })();
  }, [cstatus, trigger]);

  const onRun = () => {
    setTrigger((t) => t + 1);
  };
  return { scheme, error, onRun, status };
};
