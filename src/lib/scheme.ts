import { useEffect, useState } from "react";
import { useDebounce, useScript } from "@uidotdev/usehooks";

type Exec = (
  code: string,
  dynamic?: boolean,
  env?: Record<string, unknown>,
) => Promise<Array<unknown>>;

export const useScheme = ({ code }: { code: string }) => {
  const status = useScript(
    "https://cdn.jsdelivr.net/npm/@jcubic/lips@beta/dist/lips.min.js",
  );
  const [scheme, setScheme] = useState<unknown[]>([]);
  const [error, setError] = useState<unknown>(null);

  const debouncedCode = useDebounce(code, 1000);

  useEffect(() => {
    void (async () => {
      if (status !== "ready") {
        return;
      }
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { exec } = global.lips as { exec: Exec };

        const scheme = await exec(debouncedCode);
        setScheme(scheme);
      } catch (err: unknown) {
        setError(err);
      }
    })();
  }, [status, debouncedCode]);

  return { scheme, error };
};
