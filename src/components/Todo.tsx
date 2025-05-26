"use client";

import { useState } from "react";
import { Button } from "./Button";

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
}

interface TodoProps {
  initialTodos?: TodoItem[];
}

export const Todo = ({ initialTodos = [] }: TodoProps) => {
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (!newTodo.trim()) return;

    const todo: TodoItem = {
      id: crypto.randomUUID(),
      title: newTodo.trim(),
      completed: false,
    };

    setTodos([...todos, todo]);
    setNewTodo("");
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  const remainingCount = todos.filter((todo) => !todo.completed).length;

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">
        Todo List
      </h1>

      <div className="mb-4 flex">
        <input
          type="text"
          className="flex-grow rounded-l-lg border p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="What needs to be done?"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          data-testid="new-todo-input"
        />
        <Button onClick={addTodo} className="rounded-l-none">
          Add
        </Button>
      </div>

      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={`flex items-center justify-between py-3 ${todo.completed ? "completed" : ""}`}
            data-testid="todo-item"
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                className="mr-2 h-5 w-5 text-blue-600"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
              />
              <span
                data-testid="todo-title"
                className={`text-gray-800 dark:text-gray-200 ${todo.completed ? "text-gray-500 line-through dark:text-gray-400" : ""}`}
              >
                {todo.title}
              </span>
            </div>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              aria-label={`Delete "${todo.title}"`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      {todos.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <span data-testid="todo-count">
            {remainingCount} {remainingCount === 1 ? "item" : "items"} left
          </span>

          {todos.some((todo) => todo.completed) && (
            <button
              onClick={clearCompleted}
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear completed
            </button>
          )}
        </div>
      )}
    </div>
  );
};
