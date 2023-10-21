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
    headers: null,
  }),
);

// export type definition of API
export type AppRouter = typeof appRouter;
