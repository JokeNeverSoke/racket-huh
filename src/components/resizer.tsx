"use client";
import { useEffect } from "react";

export function Resizer() {
  useEffect(() => {
    window.addEventListener("message", (e) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (e.data?.type === "getHeight") {
        const height = document.body.scrollHeight;
        window.parent.postMessage(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          { height, type: "setHeight", id: e.data.id },
          "*",
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (e.data?.type === "setBodyBackground") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        document.body.style.backgroundColor = e.data.color;
      }
    });
  });
  return null;
}
