import { useState, type FormEvent } from "react";
import { trpc } from "./trpc";

function App() {
  const [title, setTitle] = useState("");

  const utils = trpc.useUtils();

  // GET TODOS
  const { data: todos, isLoading } = trpc.todo.getTodos.useQuery();

  // CREATE TODO
  const createTodo = trpc.todo.createTodo.useMutation({
    onSuccess: () => {
      // refetch todos
      utils.todo.getTodos.invalidate();

      setTitle("");
    },
  });

  // TOGGLE TODO
  const toggleTodo = trpc.todo.updateTodo.useMutation({
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

  const handleCreateTodo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    createTodo.mutate({ title: trimmedTitle });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-zinc-100">
        <div className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-10">
          <p className="text-sm text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  const todoList = todos ?? [];

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-white">
          Your To Do
        </h1>

        <form
          onSubmit={handleCreateTodo}
          className="mb-5 flex items-center gap-3"
        >
          <label className="sr-only" htmlFor="todo-title">
            Add new task
          </label>
          <input
            id="todo-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add new task"
            className="h-10 flex-1 border-0 border-b border-zinc-500 bg-transparent px-0 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-200"
          />
          <button
            type="submit"
            disabled={createTodo.isPending || !title.trim()}
            className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-500 text-xl leading-none text-zinc-100 transition hover:border-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Add task"
          >
            +
          </button>
        </form>

        <ul className="space-y-4">
          {todoList.length === 0 ? (
            <li className="rounded-2xl border border-zinc-700 px-4 py-4 text-sm text-zinc-500">
              No tasks yet.
            </li>
          ) : (
            todoList.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 rounded-2xl border border-zinc-700 px-4 py-4"
              >
                <button
                  type="button"
                  onClick={() => toggleTodo.mutate(todo.id)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center border border-zinc-400 text-[10px] text-zinc-100"
                  aria-label={
                    todo.completed
                      ? "Mark task as not complete"
                      : "Mark task as complete"
                  }
                >
                  {todo.completed ? "✓" : ""}
                </button>

                <button
                  type="button"
                  onClick={() => toggleTodo.mutate(todo.id)}
                  className={`min-w-0 flex-1 truncate text-left text-sm ${
                    todo.completed
                      ? "text-zinc-500 line-through"
                      : "text-zinc-100"
                  }`}
                >
                  {todo.title}
                </button>

                <button
                  type="button"
                  onClick={() => deleteTodo.mutate(todo.id)}
                  disabled={deleteTodo.isPending}
                  className="shrink-0 text-xl leading-none text-zinc-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Delete task"
                >
                  ×
                </button>
              </li>
            ))
          )}
        </ul>
      </main>
    </div>
  );
}

export default App;
