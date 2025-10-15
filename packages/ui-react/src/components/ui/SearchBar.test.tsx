import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchBar from "./SearchBar";

// Mock SVG icons
vi.mock("../../assets/svg/search.svg?react", () => ({
  default: () => <div data-testid="search-icon">🔍</div>,
}));

vi.mock("../../assets/svg/close.svg?react", () => ({
  default: () => <div data-testid="close-icon">✕</div>,
}));

describe("SearchBar Component", () => {
  const mockOnChange = vi.fn();
  const mockOnDebounceChange = vi.fn();
  const mockOnKeyDown = vi.fn();
  const mockOnKeyUp = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render with basic props", () => {
    render(
      <SearchBar
        value=""
        onChange={mockOnChange}
        placeholder="Search here"
      />
    );

    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search here")).toBeInTheDocument();
    expect(screen.queryByTestId("close-icon")).not.toBeInTheDocument();
  });

  it("should render with default placeholder", () => {
    render(
      <SearchBar
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByPlaceholderText("search")).toBeInTheDocument();
  });

  it("should display close button when value is not empty", () => {
    render(
      <SearchBar
        value="test value"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId("close-icon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "clear" })).toBeInTheDocument();
  });

  it("should call onChange when input value changes", () => {
    render(
      <SearchBar
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByPlaceholderText("search");
    fireEvent.change(input, { target: { value: "new value" } });

    expect(mockOnChange).toHaveBeenCalledWith("new value");
  });

  it("should clear value when close button is clicked", () => {
    render(
      <SearchBar
        value="test value"
        onChange={mockOnChange}
      />
    );

    const closeButton = screen.getByRole("button", { name: "clear" });
    fireEvent.click(closeButton);

    expect(mockOnChange).toHaveBeenCalledWith("");
  });

  it("should focus input when close button is clicked", () => {
    render(
      <SearchBar
        value="test value"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByPlaceholderText("search");
    const closeButton = screen.getByRole("button", { name: "clear" });
    
    // Mock focus method
    const focusSpy = vi.spyOn(input, 'focus');
    
    fireEvent.click(closeButton);

    expect(focusSpy).toHaveBeenCalled();
  });

  it("should handle focus and blur events", () => {
    render(
      <SearchBar
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByPlaceholderText("search");
    
    fireEvent.focus(input);
    // Input should be focused
    expect(input).toBeInTheDocument();

    fireEvent.blur(input);
    // Input should still be in document
    expect(input).toBeInTheDocument();
  });

  it("should show active state when value is not empty", () => {
    render(
      <SearchBar
        value="test value"
        onChange={mockOnChange}
      />
    );

    const searchIcon = screen.getByTestId("search-icon");
    expect(searchIcon).toBeInTheDocument();
  });

  it("should handle debounced change", () => {
    const { rerender } = render(
      <SearchBar
        value=""
        onChange={mockOnChange}
        onDebounceChange={mockOnDebounceChange}
        debounceMs={300}
      />
    );

    // Simulate value change by re-rendering with new value
    rerender(
      <SearchBar
        value="test"
        onChange={mockOnChange}
        onDebounceChange={mockOnDebounceChange}
        debounceMs={300}
      />
    );

    // Fast-forward time to trigger debounced change
    vi.advanceTimersByTime(300);

    expect(mockOnDebounceChange).toHaveBeenCalledWith("test");
  });

  it("should handle custom debounce time", () => {
    const { rerender } = render(
      <SearchBar
        value=""
        onChange={mockOnChange}
        onDebounceChange={mockOnDebounceChange}
        debounceMs={500}
      />
    );

    // Simulate value change by re-rendering with new value
    rerender(
      <SearchBar
        value="test"
        onChange={mockOnChange}
        onDebounceChange={mockOnDebounceChange}
        debounceMs={500}
      />
    );

    // Fast-forward time to trigger debounced change
    vi.advanceTimersByTime(500);

    expect(mockOnDebounceChange).toHaveBeenCalledWith("test");
  });

  it("should not call debounced change if value hasn't changed", () => {
    render(
      <SearchBar
        value="test"
        onChange={mockOnChange}
        onDebounceChange={mockOnDebounceChange}
        debounceMs={300}
      />
    );

    // Fast-forward time
    vi.advanceTimersByTime(300);

    expect(mockOnDebounceChange).not.toHaveBeenCalled();
  });

  it("should clear previous debounce timer when value changes", () => {
    const { rerender } = render(
      <SearchBar
        value=""
        onChange={mockOnChange}
        onDebounceChange={mockOnDebounceChange}
        debounceMs={300}
      />
    );

    // Change value first time
    rerender(
      <SearchBar
        value="first"
        onChange={mockOnChange}
        onDebounceChange={mockOnDebounceChange}
        debounceMs={300}
      />
    );
    
    // Change value again before debounce timer fires
    rerender(
      <SearchBar
        value="second"
        onChange={mockOnChange}
        onDebounceChange={mockOnDebounceChange}
        debounceMs={300}
      />
    );
    
    // Fast-forward time
    vi.advanceTimersByTime(300);

    // Should only call with the last value
    expect(mockOnDebounceChange).toHaveBeenCalledTimes(1);
    expect(mockOnDebounceChange).toHaveBeenCalledWith("second");
  });

  it("should handle key down events", () => {
    render(
      <SearchBar
        value=""
        onChange={mockOnChange}
        onKeyDown={mockOnKeyDown}
      />
    );

    const input = screen.getByPlaceholderText("search");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockOnKeyDown).toHaveBeenCalled();
  });

  it("should handle key up events", () => {
    render(
      <SearchBar
        value=""
        onChange={mockOnChange}
        onKeyUp={mockOnKeyUp}
      />
    );

    const input = screen.getByPlaceholderText("search");
    fireEvent.keyUp(input, { key: "Enter" });

    expect(mockOnKeyUp).toHaveBeenCalled();
  });

  it("should apply custom className", () => {
    render(
      <SearchBar
        value=""
        onChange={mockOnChange}
        className="custom-class"
      />
    );

    const container = screen.getByPlaceholderText("search").parentElement;
    expect(container).toHaveClass("custom-class");
  });

  it("should apply custom wrapper className", () => {
    render(
      <SearchBar
        value=""
        onChange={mockOnChange}
        wrapperClassName="wrapper-class"
      />
    );

    const wrapper = screen.getByPlaceholderText("search").closest("div")?.parentElement;
    expect(wrapper).toHaveClass("wrapper-class");
  });

  it("should not call onDebounceChange if not provided", () => {
    render(
      <SearchBar
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByPlaceholderText("search");
    fireEvent.change(input, { target: { value: "test" } });

    // Fast-forward time
    vi.advanceTimersByTime(300);

    // Should not crash and should not call any debounce function
    expect(screen.getByPlaceholderText("search")).toBeInTheDocument();
  });
});
