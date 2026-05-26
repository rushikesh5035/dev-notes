import { initTRPC } from "@trpc/server";
import superjson from "superjson";

const t = initTRPC.create({
  transformer: superjson,
});

// create trpc router fron the initialized tRPC instance
export const createTRPCRouter = t.router;

// create trpc procedure fron the initialized tRPC instance
export const publicProcedure = t.procedure;
