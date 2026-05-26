import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../server/src/appRouter";

// Create a TRPC React client that can be used throughout the app to make API calls to the server.
// The AppRouter type is imported from the server's appRouter file, which defines the API routes and their types.
export const trpc = createTRPCReact<AppRouter>();
