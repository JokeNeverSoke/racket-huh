import { postRouter } from "@/server/api/routers/post";
import { createTRPCRouter, createInnerTRPCContext } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
});

export const caller = appRouter.createCaller(
  createInnerTRPCContext({
    headers: {
      append: function (name: string, value: string): void {
        throw new Error("Function not implemented.");
      },
      delete: function (name: string): void {
        throw new Error("Function not implemented.");
      },
      get: function (name: string): string | null {
        throw new Error("Function not implemented.");
      },
      getSetCookie: function (): string[] {
        throw new Error("Function not implemented.");
      },
      has: function (name: string): boolean {
        throw new Error("Function not implemented.");
      },
      set: function (name: string, value: string): void {
        throw new Error("Function not implemented.");
      },
      forEach: function (
        callbackfn: (value: string, key: string, parent: Headers) => void,
        thisArg?: unknown,
      ): void {
        throw new Error("Function not implemented.");
      },
      entries: function (): IterableIterator<[string, string]> {
        throw new Error("Function not implemented.");
      },
      keys: function (): IterableIterator<string> {
        throw new Error("Function not implemented.");
      },
      values: function (): IterableIterator<string> {
        throw new Error("Function not implemented.");
      },
      [Symbol.iterator]: function (): IterableIterator<[string, string]> {
        throw new Error("Function not implemented.");
      },
    },
  }),
);

// export type definition of API
export type AppRouter = typeof appRouter;
