import { z } from "zod";
import { router, publicProcedure } from "../trpc";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

let todos: Todo[] = [
  {
    id: 1,
    title: "Learn TRPC",
    completed: false,
  },
];

// create a router for the todo API which has functions/procedures to get all todos, add a todo, update a todo and delete a todo
export const todoRouter = router({
  // Get all todos
  getTodos: publicProcedure.query(() => {
    return todos;
  }),

  // Add a new todo
  createTodo: publicProcedure
    .input(
      z.object({
        title: z.string(),
      }),
    )
    .mutation(({ input }) => {
      const newTodo = {
        id: Date.now(),
        title: input.title,
        completed: false,
      };

      todos.push(newTodo);

      return newTodo;
    }),

  // Update a todo by id
  updateTodo: publicProcedure.input(z.number()).mutation(({ input }) => {
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
