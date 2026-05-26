import { router } from "./trpc";
import { todoRouter } from "./routers/todo";

export const appRouter = router({
  todo: todoRouter,
});

export type AppRouter = typeof appRouter; // this line is the MAGIC
// Frontend import this types to get type safety and autocompletion
// That's how type safety works in tRPC, you export the type of your router and use it in the frontend
