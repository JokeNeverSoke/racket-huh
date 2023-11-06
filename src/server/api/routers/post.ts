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
      const presetList = [];
      let presetId = code.presetId;
      while (presetId != null) {
        const preset = await ctx.db.racketCode.findUnique({
          where: { id: presetId },
        });
        if (!preset) {
          break;
        }
        presetList.push(preset);
        presetId = preset.presetId;
      }
      return {
        title: code.title,
        content: code.code,
        presetList: presetList,
      };
    }),

  add: publicProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        password: z.string(),
        presetId: z.number().optional(),
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
          presetId: input.presetId,
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

    return codes;
  }),
});
