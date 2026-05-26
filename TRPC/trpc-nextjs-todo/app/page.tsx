"use client";

import { useState } from "react";

import { trpc } from "@/trpc/client";

export default function HomePage() {
  const [title, setTitle] = useState("");

  const utils = trpc.useUtils();

  // GET TODOS
  const { data: todos, isLoading } = trpc.todo.getTodos.useQuery();

  // CREATE TODO
  const createTodo = trpc.todo.createTodo.useMutation({
    onSuccess: () => {
      utils.todo.getTodos.invalidate();

      setTitle("");
    },
  });

  // TOGGLE TODO
  const toggleTodo = trpc.todo.toggleTodo.useMutation({
    onSuccess: () => {
      utils.todo.getTodos.invalidate();
    },
  });

  // DELETE TODO
  const deleteTodo = trpc.todo.deleteTodo.useMutation({
    onSuccess: () => {
      utils.todo.getTodos.invalidate();
    },
  });

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  return (
    <main className="flex justify-center items-center">
      <div className="h-full">
        <h1 className="text-3xl font-bold">Next.js + tRPC</h1>

        <div className="mt-5 flex gap-2">
          <input
            className="border p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter todo"
          />

          <button
            className="bg-black text-white px-4"
            onClick={() =>
              createTodo.mutate({
                title,
              })
            }
          >
            Add
          </button>
        </div>

        <ul className="mt-6 space-y-2">
          {todos?.map((todo) => (
            <li key={todo.id} className="flex gap-3">
              <span
                className="cursor-pointer"
                style={{
                  textDecoration: todo.completed ? "line-through" : "none",
                }}
                onClick={() => toggleTodo.mutate(todo.id)}
              >
                {todo.title}
              </span>

              <button onClick={() => deleteTodo.mutate(todo.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
