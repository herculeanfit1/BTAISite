import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react"
import { screen } from "@testing-library/dom"
import { fireEvent } from "@testing-library/dom"
import { waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { Route } from "next";

// Mock necessary dependencies
vi.mock("next/navigation", () => ({
  usePathname: () => "/todo",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
    resolvedTheme: "light",
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

// Mock the useTranslation hook
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

// Mock random UUID to generate different IDs for each call
vi.stubGlobal("crypto", {
  randomUUID: (() => {
    let count = 0;
    return () => `123e4567-e89b-12d3-a456-42661417400${count++}`;
  })(),
});

// Import the Todo component directly
import { Todo } from '../../app/components/Todo';

// Mock component imports
vi.mock("@/app/components/PageHeader", () => ({
  PageHeader: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => (
    <header data-testid="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  ),
}));

describe("Todo Page Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows adding and managing todo items", async () => {
    const user = userEvent.setup();

    // Render the Todo component directly
    render(<Todo />);

    // Check that the todo list title is displayed
    expect(screen.getByText("Todo List")).toBeInTheDocument();

    // Add a new todo item
    const input = screen.getByTestId("new-todo-input");
    await user.type(input, "Integration test todo{Enter}");

    // Check that the todo was added
    const todoItem = screen.getByTestId("todo-title");
    expect(todoItem).toHaveTextContent("Integration test todo");

    // Check that the todo count is updated
    expect(screen.getByTestId("todo-count")).toHaveTextContent("1 item left");

    // Toggle the todo completion status
    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    // Check that the todo is now marked as completed
    expect(todoItem).toHaveClass("line-through");
    expect(screen.getByTestId("todo-count")).toHaveTextContent("0 items left");

    // Add another todo
    await user.clear(input);
    await user.type(input, "Another test todo{Enter}");

    // Check that both todos are now displayed
    const todoItems = screen.getAllByTestId("todo-item");
    expect(todoItems).toHaveLength(2);

    // Clear completed todos
    const clearButton = screen.getByText("Clear completed");
    await user.click(clearButton);

    // Check that only the incomplete todo remains
    expect(screen.getAllByTestId("todo-item")).toHaveLength(1);
    expect(screen.getByTestId("todo-title")).toHaveTextContent(
      "Another test todo",
    );

    // Delete the remaining todo
    const deleteButton = screen.getByLabelText(/Delete "Another test todo"/);
    await user.click(deleteButton);

    // Check that no todos remain
    expect(screen.queryByTestId("todo-item")).not.toBeInTheDocument();
  });
});
