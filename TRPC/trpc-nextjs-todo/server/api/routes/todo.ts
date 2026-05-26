import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

let todos: Todo[] = [
  { id: 1, title: "Learn tRPC", completed: false },
  { id: 2, title: "Build a tRPC app", completed: false },
];

export const todoRouter = createTRPCRouter({
  // GET TODOs
  getTodos: publicProcedure.query(() => {
    return todos;
  }),

  // CREATE TODO
  createTodo: publicProcedure
    .input(
      z.object({
        title: z.string(),
      }),
    )
    .mutation(({ input }) => {
      const newTodo: Todo = {
        id: todos.length + 1,
        title: input.title,
        completed: false,
      };

      todos.push(newTodo);

      return newTodo;
    }),

  // TOGGLE TODO
  toggleTodo: publicProcedure.input(z.number()).mutation(({ input }) => {
    todos = todos.map((todo) =>
      todo.id === input
        ? {
            ...todo,
            completed: !todo.completed,
          }
        : todo,
    );

    return {
      success: true,
    };
  }),

  // Delete a todo by id
  deleteTodo: publicProcedure.input(z.number()).mutation(({ input }) => {
    todos = todos.filter((todo) => todo.id !== input);

    return {
      success: true,
    };
  }),
});
