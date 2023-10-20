import { useState } from "react";
import { useScheme } from "@/lib/scheme";

export const CodeSnippet = ({
  code,
  fixed: f,
}: {
  code: string;
  fixed?: boolean;
}) => {
  const fixed = f ?? false;
  const [newCode, setNewCode] = useState(code);
  const { scheme, error } = useScheme({ code: fixed ? code : newCode });

  console.log({ scheme, error });
  return (
    <div className="font-mono">
      <pre className="mb-4 bg-gray-900 p-2">
        {fixed ? (
          <code>{code}</code>
        ) : (
          <textarea
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
          />
        )}
      </pre>
      <pre className="bg-gray-900 p-2">{scheme.toString()}</pre>
    </div>
  );
};
