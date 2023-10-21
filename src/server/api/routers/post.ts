import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const postRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const code = await ctx.db.racketCode.findUnique({
        where: { id: input.id },
      });
      if (!code) {
        return;
      }
      return {
        title: code.title,
        content: code.code,
      };
    }),

  add: publicProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.password !== process.env.ADMIN_PASS) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to add code",
        });
      }
      const code = await ctx.db.racketCode.create({
        data: {
          title: input.title,
          code: input.content,
        },
      });
      return {
        id: code.id,
      };
    }),

  list: publicProcedure.query(async ({ ctx }) => {
    const codes = await ctx.db.racketCode.findMany({
      orderBy: { id: "desc" },
    });
    
    return codes
  }),
});
