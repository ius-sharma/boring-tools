"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "boring_tools_todo_list";

const defaultTodos = [];

export default function ToDoList() {
  const [todos, setTodos] = useState(defaultTodos);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTodos(parsed);
        }
      }
    } catch {
      setTodos(defaultTodos);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const stats = useMemo(() => {
    const completed = todos.filter((todo) => todo.done).length;
    return {
      total: todos.length,
      completed,
      active: todos.length - completed,
    };
  }, [todos]);

  const filteredTodos = useMemo(() => {
    if (filter === "active") {
      return todos.filter((todo) => !todo.done);
    }
    if (filter === "completed") {
      return todos.filter((todo) => todo.done);
    }
    return todos;
  }, [filter, todos]);

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    setTodos((currentTodos) => [
      {
        id: Date.now(),
        text: trimmed,
        done: false,
      },
      ...currentTodos,
    ]);
    setInput("");
  };

  const handleToggle = (id) => {
    setTodos((currentTodos) => currentTodos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)));
  };

  const handleDelete = (id) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  };

  const handleClearCompleted = () => {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.done));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-5xl border border-slate-200 flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">To-Do List</h1>
          <p className="text-slate-500 text-base">A clean local-storage task board that keeps your list on this device.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900">Add task</h2>
              <span className="text-xs text-slate-500">Saved locally</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleAdd();
                  }
                }}
                placeholder="Add a task and press Enter"
                className="flex-1 border border-slate-300 rounded-lg p-3 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                type="button"
                onClick={handleAdd}
                className="border border-slate-900 text-slate-900 rounded-lg px-4 py-3 font-semibold hover:bg-slate-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                Add
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-xl font-semibold text-slate-900">{stats.total}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <p className="text-xs text-slate-500">Active</p>
                <p className="text-xl font-semibold text-slate-900">{stats.active}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <p className="text-xs text-slate-500">Done</p>
                <p className="text-xl font-semibold text-slate-900">{stats.completed}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "completed", label: "Completed" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-900 ${filter === item.value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClearCompleted}
                disabled={!stats.completed}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-900 ${stats.completed ? "border-slate-300 text-slate-700 hover:bg-slate-100" : "border-slate-200 text-slate-300 cursor-not-allowed"}`}
              >
                Clear completed
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900">Task board</h2>
              <span className="text-xs text-slate-500">{filteredTodos.length} visible</span>
            </div>

            {!filteredTodos.length ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-500">No tasks yet. Add something small and keep it local.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredTodos.map((todo) => (
                  <div key={todo.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={todo.done}
                      onChange={() => handleToggle(todo.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${todo.done ? "text-slate-400 line-through" : "text-slate-900"}`}>
                        {todo.text}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(todo.id)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">Tasks persist in local storage and follow the same neutral card style as the rest of the app.</p>
      </div>

      <style jsx global>{`
        html { font-family: 'Inter', 'Helvetica Neue', Arial, 'system-ui', sans-serif; }
      `}</style>
    </div>
  );
}


