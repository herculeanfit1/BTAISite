import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react"
import { screen } from "@testing-library/dom"
import { fireEvent } from "@testing-library/dom"
import { waitFor } from "@testing-library/dom";
import { Todo } from '../../app/components/Todo';
import userEvent from "@testing-library/user-event";

// Mock crypto.randomUUID
vi.stubGlobal("crypto", {
  randomUUID: () => "123e4567-e89b-12d3-a456-426614174000",
});

describe("Todo Component", () => {
  it("renders without crashing", () => {
    render(<Todo />);
    expect(screen.getByText("Todo List")).toBeInTheDocument();
  });

  it("allows adding a new todo item", () => {
    render(<Todo />);

    // Get the input field and add button
    const input = screen.getByTestId("new-todo-input");

    // Type a new todo
    fireEvent.change(input, { target: { value: "Test new todo" } });

    // Click the add button
    fireEvent.click(screen.getByText("Add"));

    // Check if the new todo appears in the list
    expect(screen.getByTestId("todo-title")).toHaveTextContent("Test new todo");
  });

  it("allows adding a todo by pressing Enter", async () => {
    const user = userEvent.setup();

    render(<Todo />);

    // Get the input field
    const input = screen.getByTestId("new-todo-input");

    // Type a new todo and press Enter
    await user.type(input, "Test todo with Enter{Enter}");

    // Check if the new todo appears in the list
    expect(screen.getByTestId("todo-title")).toHaveTextContent(
      "Test todo with Enter",
    );
  });

  it("displays initial todos if provided", () => {
    const initialTodos = [
      { id: "1", title: "Test todo 1", completed: false },
      { id: "2", title: "Test todo 2", completed: true },
    ];

    render(<Todo initialTodos={initialTodos} />);

    // Check if both todos are rendered
    expect(screen.getAllByTestId("todo-item")).toHaveLength(2);

    // Check if one item is marked as completed
    const todoItems = screen.getAllByTestId("todo-title");
    expect(todoItems[1]).toHaveClass("line-through");
  });

  it("can toggle todo completion status", () => {
    const initialTodos = [
      { id: "1", title: "Test toggleable todo", completed: false },
    ];

    render(<Todo initialTodos={initialTodos} />);

    // Find the checkbox and click it
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    // Check if the todo is now marked as completed
    expect(screen.getByTestId("todo-title")).toHaveClass("line-through");
  });

  it("can delete a todo item", () => {
    const initialTodos = [
      { id: "1", title: "Test deletable todo", completed: false },
    ];

    render(<Todo initialTodos={initialTodos} />);

    // Find the delete button and click it
    const deleteButton = screen.getByLabelText(/Delete "Test deletable todo"/);
    fireEvent.click(deleteButton);

    // Check if the todo is removed
    expect(screen.queryByTestId("todo-item")).not.toBeInTheDocument();
  });

  it("shows the correct count of incomplete items", () => {
    const initialTodos = [
      { id: "1", title: "Todo 1", completed: false },
      { id: "2", title: "Todo 2", completed: true },
      { id: "3", title: "Todo 3", completed: false },
    ];

    render(<Todo initialTodos={initialTodos} />);

    // Check if the count shows 2 items left
    expect(screen.getByTestId("todo-count")).toHaveTextContent("2 items left");
  });

  it("allows clearing completed todos", () => {
    const initialTodos = [
      { id: "1", title: "Incomplete todo", completed: false },
      { id: "2", title: "Completed todo", completed: true },
    ];

    render(<Todo initialTodos={initialTodos} />);

    // Find and click the "Clear completed" button
    fireEvent.click(screen.getByText("Clear completed"));

    // Check if only the incomplete todo remains
    expect(screen.getAllByTestId("todo-item")).toHaveLength(1);
    expect(screen.getByTestId("todo-title")).toHaveTextContent(
      "Incomplete todo",
    );
  });

  it("does not show clear completed button when no todos are completed", () => {
    const initialTodos = [
      { id: "1", title: "Incomplete todo 1", completed: false },
      { id: "2", title: "Incomplete todo 2", completed: false },
    ];

    render(<Todo initialTodos={initialTodos} />);

    // Check that the "Clear completed" button is not present
    expect(screen.queryByText("Clear completed")).not.toBeInTheDocument();
  });

  it('shows singular form of "item" when only one todo remains', () => {
    const initialTodos = [{ id: "1", title: "Single todo", completed: false }];

    render(<Todo initialTodos={initialTodos} />);

    // Check if the count shows the singular form
    expect(screen.getByTestId("todo-count")).toHaveTextContent("1 item left");
  });

  it("prevents adding empty todos", () => {
    render(<Todo />);

    // Get the input field and button
    const input = screen.getByTestId("new-todo-input");
    const addButton = screen.getByText("Add");

    // Try to add an empty todo
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.click(addButton);

    // Try to add a whitespace-only todo
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(addButton);

    // Check that no todo items were added
    expect(screen.queryByTestId("todo-item")).not.toBeInTheDocument();
  });
});
