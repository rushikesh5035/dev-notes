import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

// create a router from TRPC and export it
export const router = t.router;

// create a procedure and export it
export const publicProcedure = t.procedure;
