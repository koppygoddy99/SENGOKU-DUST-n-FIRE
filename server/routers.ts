import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { buildAdminOperationsFacts, buildAdminOverview } from "./admin";
import { getUserTrialCredits, spendUserTrialCredits } from "./db";
import { analyzeWithGM, analyzeInputSchema, resolveInputSchema, resolveWithGM } from "./gm";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { buildHistoricalTimeline, buildTimelineOperationsFacts } from "./timeline";

async function requireGMTrialCredit(userId: number) {
  const credits = await getUserTrialCredits(userId);
  if (credits < 1) throw new TRPCError({ code: "BAD_REQUEST", message: "No AI GM credits remain" });
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  gm: router({
    analyze: protectedProcedure.input(analyzeInputSchema).mutation(async ({ ctx, input }) => {
      await requireGMTrialCredit(ctx.user.id);
      return { mode: "ai" as const, ...(await analyzeWithGM(input)) };
    }),
    resolve: protectedProcedure.input(resolveInputSchema).mutation(async ({ ctx, input }) => {
      await requireGMTrialCredit(ctx.user.id);
      return { mode: "ai" as const, ...(await resolveWithGM(input)) };
    }),
  }),
  profile: router({
    credits: protectedProcedure.query(async ({ ctx }) => ({ credits: await getUserTrialCredits(ctx.user.id) })),
    spendCredit: protectedProcedure.input(z.object({ amount: z.number().int().min(1).max(5) })).mutation(async ({ ctx, input }) => {
      const credits = await spendUserTrialCredits(ctx.user.id, input.amount);
      if (credits === null) throw new TRPCError({ code: "BAD_REQUEST", message: "No AI GM credits remain" });
      return { credits };
    }),
  }),
  timeline: router({
    forCampaign: publicProcedure.input(z.object({ year: z.number().int().min(1467).max(1615), region: z.string().min(1).max(80) })).query(({ input }) => buildHistoricalTimeline(input.year, input.region)),
  }),
  admin: router({
    overview: adminProcedure.query(() => buildAdminOverview()),
    timeline: adminProcedure.query(() => buildTimelineOperationsFacts()),
    operations: adminProcedure.query(() => buildAdminOperationsFacts()),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
