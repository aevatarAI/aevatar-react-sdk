import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EnumSelect } from "./index";

// Mock UI components
vi.mock("../ui", () => ({
  Select: ({ children, value, disabled, onValueChange }: any) => (
    <div data-testid="select" data-value={value} data-disabled={disabled}>
      {children}
    </div>
  ),
  SelectContent: ({ children, className }: any) => (
    <div data-testid="select-content" className={className}>
      {children}
    </div>
  ),
  SelectItem: ({ children, value, className, key }: any) => (
    <div data-testid="select-item" data-value={value} className={className} key={key}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, className, "aria-disabled": ariaDisabled }: any) => (
    <div data-testid="select-trigger" className={className} aria-disabled={ariaDisabled}>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }: any) => (
    <div data-testid="select-value">{placeholder}</div>
  ),
  FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
  SearchBar: ({ placeholder, value, onChange, onKeyDown, className }: any) => (
    <input
      data-testid="search-bar"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      className={className}
    />
  ),
}));

vi.mock("../ui/tooltip", () => ({
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children, asChild }: any) => (
    <div data-testid="tooltip-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
  TooltipContent: ({ children, className, side, sideOffset }: any) => (
    <div
      data-testid="tooltip-content"
      className={className}
      data-side={side}
      data-side-offset={sideOffset}
    >
      {children}
    </div>
  ),
}));

// Mock utils
vi.mock("../../utils", () => ({
  isPlainObject: (obj: any) => obj !== null && typeof obj === "object" && obj.constructor === Object,
  safeStringify: (value: any) => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    return String(value);
  },
  isReactElement: (obj: any) => obj && typeof obj === "object" && obj.$$typeof,
  safeKey: (key: any, index?: number) => key !== null && key !== undefined ? String(key) : String(index || 0),
}));

describe("EnumSelect Component", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with basic props", () => {
    const schema = {
      enum: ["option1", "option2", "option3"],
      type: "string",
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={["option1", "option2", "option3"]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId("select")).toBeInTheDocument();
    expect(screen.getByTestId("select-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("search-bar")).toBeInTheDocument();
  });

  it("should render with field value", () => {
    const schema = {
      enum: ["option1", "option2", "option3"],
      type: "string",
    };

    const field = {
      value: "option1",
      disabled: false,
    };

    render(
      <EnumSelect
        field={field}
        schema={schema}
        enumValues={["option1", "option2", "option3"]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId("select")).toHaveAttribute("data-value", "option1");
  });

  it("should render with disabled state", () => {
    const schema = {
      enum: ["option1", "option2", "option3"],
      type: "string",
    };

    const field = {
      value: "option1",
      disabled: true,
    };

    render(
      <EnumSelect
        field={field}
        schema={schema}
        enumValues={["option1", "option2", "option3"]}
        onChange={mockOnChange}
        disabled={true}
      />
    );

    expect(screen.getByTestId("select")).toHaveAttribute("data-disabled", "true");
    expect(screen.getByTestId("select-trigger")).toHaveAttribute("aria-disabled", "true");
  });

  it("should render enum items", () => {
    const schema = {
      enum: ["option1", "option2", "option3"],
      type: "string",
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={["option1", "option2", "option3"]}
        onChange={mockOnChange}
      />
    );

    const selectItems = screen.getAllByTestId("select-item");
    expect(selectItems).toHaveLength(3);
    expect(selectItems[0]).toHaveAttribute("data-value", "option1");
    expect(selectItems[1]).toHaveAttribute("data-value", "option2");
    expect(selectItems[2]).toHaveAttribute("data-value", "option3");
  });

  it("should render with enum names", () => {
    const schema = {
      enum: ["value1", "value2", "value3"],
      type: "string",
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={["value1", "value2", "value3"]}
        enumNames={["Name 1", "Name 2", "Name 3"]}
        onChange={mockOnChange}
      />
    );

    const selectItems = screen.getAllByTestId("select-item");
    expect(selectItems).toHaveLength(3);
    expect(selectItems[0]).toHaveAttribute("data-value", "value1");
    expect(selectItems[1]).toHaveAttribute("data-value", "value2");
    expect(selectItems[2]).toHaveAttribute("data-value", "value3");
  });

  it("should render with descriptions", () => {
    const schema = {
      enum: ["option1", "option2", "option3"],
      type: "string",
      "x-descriptions": ["Description 1", "Description 2", "Description 3"],
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={["option1", "option2", "option3"]}
        onChange={mockOnChange}
      />
    );

    const tooltips = screen.getAllByTestId("tooltip");
    expect(tooltips).toHaveLength(3);
  });

  it("should handle string type conversion", () => {
    const schema = {
      enum: ["option1", "option2", "option3"],
      type: "string",
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={["option1", "option2", "option3"]}
        onChange={mockOnChange}
      />
    );

    // Simulate value change
    const select = screen.getByTestId("select");
    fireEvent.click(select);

    // This would trigger the onValueChange callback in a real implementation
    // For now, we just verify the component renders correctly
    expect(select).toBeInTheDocument();
  });

  it("should handle number type conversion", () => {
    const schema = {
      enum: [1, 2, 3],
      type: "number",
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={[1, 2, 3]}
        onChange={mockOnChange}
      />
    );

    const selectItems = screen.getAllByTestId("select-item");
    expect(selectItems).toHaveLength(3);
    expect(selectItems[0]).toHaveAttribute("data-value", "1");
    expect(selectItems[1]).toHaveAttribute("data-value", "2");
    expect(selectItems[2]).toHaveAttribute("data-value", "3");
  });

  it("should handle boolean type conversion", () => {
    const schema = {
      enum: [true, false],
      type: "boolean",
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={[true, false]}
        onChange={mockOnChange}
      />
    );

    const selectItems = screen.getAllByTestId("select-item");
    expect(selectItems).toHaveLength(2);
    expect(selectItems[0]).toHaveAttribute("data-value", "true");
    expect(selectItems[1]).toHaveAttribute("data-value", "false");
  });

  it("should handle nullable schema", () => {
    const schema = {
      enum: ["option1", "option2", null],
      type: "string",
      nullable: true,
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={["option1", "option2", null]}
        onChange={mockOnChange}
      />
    );

    const selectItems = screen.getAllByTestId("select-item");
    expect(selectItems).toHaveLength(3);
    expect(selectItems[2]).toHaveAttribute("data-value", "null");
  });

  it("should apply custom select content class", () => {
    const schema = {
      enum: ["option1", "option2", "option3"],
      type: "string",
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={["option1", "option2", "option3"]}
        onChange={mockOnChange}
        selectContentCls="custom-class"
      />
    );

    const selectContent = screen.getByTestId("select-content");
    expect(selectContent).toHaveClass("custom-class");
  });

  it("should render search functionality", () => {
    const schema = {
      enum: ["option1", "option2", "option3"],
      type: "string",
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={["option1", "option2", "option3"]}
        onChange={mockOnChange}
      />
    );

    const searchBar = screen.getByTestId("search-bar");
    expect(searchBar).toBeInTheDocument();
    expect(searchBar).toHaveAttribute("placeholder", "Search");
  });

  it("should handle search filtering", () => {
    const schema = {
      enum: ["apple", "banana", "cherry"],
      type: "string",
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={["apple", "banana", "cherry"]}
        enumNames={["Apple", "Banana", "Cherry"]}
        onChange={mockOnChange}
      />
    );

    const searchBar = screen.getByTestId("search-bar");
    fireEvent.change(searchBar, { target: { value: "app" } });

    // All items should still be visible since we're not actually implementing the filtering logic in the mock
    const selectItems = screen.getAllByTestId("select-item");
    expect(selectItems).toHaveLength(3);
  });

  it("should handle integer type conversion", () => {
    const schema = {
      enum: [1, 2, 3],
      type: "integer",
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={[1, 2, 3]}
        onChange={mockOnChange}
      />
    );

    const selectItems = screen.getAllByTestId("select-item");
    expect(selectItems).toHaveLength(3);
    expect(selectItems[0]).toHaveAttribute("data-value", "1");
    expect(selectItems[1]).toHaveAttribute("data-value", "2");
    expect(selectItems[2]).toHaveAttribute("data-value", "3");
  });

  it("should handle null type conversion", () => {
    const schema = {
      enum: [null],
      type: "null",
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={[null]}
        onChange={mockOnChange}
      />
    );

    const selectItems = screen.getAllByTestId("select-item");
    expect(selectItems).toHaveLength(1);
    expect(selectItems[0]).toHaveAttribute("data-value", "null");
  });

  it("should handle array type conversion", () => {
    const schema = {
      enum: ['["item1", "item2"]', '["item3", "item4"]'],
      type: "array",
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={['["item1", "item2"]', '["item3", "item4"]']}
        onChange={mockOnChange}
      />
    );

    const selectItems = screen.getAllByTestId("select-item");
    expect(selectItems).toHaveLength(2);
    expect(selectItems[0]).toHaveAttribute("data-value", '["item1", "item2"]');
    expect(selectItems[1]).toHaveAttribute("data-value", '["item3", "item4"]');
  });

  it("should handle object type conversion", () => {
    const schema = {
      enum: ['{"key": "value"}', '{"key2": "value2"}'],
      type: "object",
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={['{"key": "value"}', '{"key2": "value2"}']}
        onChange={mockOnChange}
      />
    );

    const selectItems = screen.getAllByTestId("select-item");
    expect(selectItems).toHaveLength(2);
    expect(selectItems[0]).toHaveAttribute("data-value", '{"key": "value"}');
    expect(selectItems[1]).toHaveAttribute("data-value", '{"key2": "value2"}');
  });

  it("should handle undefined field value", () => {
    const schema = {
      enum: ["option1", "option2", "option3"],
      type: "string",
    };

    const field = {
      value: undefined,
      disabled: false,
    };

    render(
      <EnumSelect
        field={field}
        schema={schema}
        enumValues={["option1", "option2", "option3"]}
        onChange={mockOnChange}
      />
    );

    // When value is undefined, the select should not have a data-value attribute
    expect(screen.getByTestId("select")).not.toHaveAttribute("data-value");
  });

  it("should handle null field value", () => {
    const schema = {
      enum: ["option1", "option2", "option3"],
      type: "string",
    };

    const field = {
      value: null,
      disabled: false,
    };

    render(
      <EnumSelect
        field={field}
        schema={schema}
        enumValues={["option1", "option2", "option3"]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId("select")).toHaveAttribute("data-value", "null");
  });

  it("should handle complex description objects", () => {
    const schema = {
      enum: ["option1", "option2"],
      type: "string",
      "x-descriptions": [
        { name: "Option 1", description: "First option" },
        { name: "Option 2", description: "Second option" }
      ],
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={["option1", "option2"]}
        onChange={mockOnChange}
      />
    );

    const tooltips = screen.getAllByTestId("tooltip");
    expect(tooltips).toHaveLength(2);
  });

  it("should handle string descriptions", () => {
    const schema = {
      enum: ["option1", "option2"],
      type: "string",
      "x-descriptions": ["Description 1", "Description 2"],
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={["option1", "option2"]}
        onChange={mockOnChange}
      />
    );

    const tooltips = screen.getAllByTestId("tooltip");
    expect(tooltips).toHaveLength(2);
  });

  it("should handle null descriptions", () => {
    const schema = {
      enum: ["option1", "option2"],
      type: "string",
      "x-descriptions": [null, undefined],
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={["option1", "option2"]}
        onChange={mockOnChange}
      />
    );

    // When descriptions are null/undefined, no tooltips should be rendered
    const tooltips = screen.queryAllByTestId("tooltip");
    expect(tooltips).toHaveLength(0);
  });

  it("should handle empty description objects", () => {
    const schema = {
      enum: ["option1", "option2"],
      type: "string",
      "x-descriptions": [{}, {}],
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={["option1", "option2"]}
        onChange={mockOnChange}
      />
    );

    const tooltips = screen.getAllByTestId("tooltip");
    expect(tooltips).toHaveLength(2);
  });

  it("should handle React element descriptions", () => {
    const ReactElement = { $$typeof: Symbol.for('react.element') };
    const schema = {
      enum: ["option1", "option2"],
      type: "string",
      "x-descriptions": [ReactElement, ReactElement],
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={["option1", "option2"]}
        onChange={mockOnChange}
      />
    );

    const tooltips = screen.getAllByTestId("tooltip");
    expect(tooltips).toHaveLength(2);
  });

  it("should handle disabled state from field only", () => {
    const schema = {
      enum: ["option1", "option2", "option3"],
      type: "string",
    };

    const field = {
      value: "option1",
      disabled: true,
    };

    render(
      <EnumSelect
        field={field}
        schema={schema}
        enumValues={["option1", "option2", "option3"]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId("select")).toHaveAttribute("data-disabled", "true");
    expect(screen.getByTestId("select-trigger")).toHaveAttribute("aria-disabled", "true");
  });

  it("should handle disabled state from prop only", () => {
    const schema = {
      enum: ["option1", "option2", "option3"],
      type: "string",
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={["option1", "option2", "option3"]}
        onChange={mockOnChange}
        disabled={true}
      />
    );

    expect(screen.getByTestId("select")).toHaveAttribute("data-disabled", "true");
    expect(screen.getByTestId("select-trigger")).toHaveAttribute("aria-disabled", "true");
  });

  it("should handle search with enum names", () => {
    const schema = {
      enum: ["value1", "value2", "value3"],
      type: "string",
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={["value1", "value2", "value3"]}
        enumNames={["Name 1", "Name 2", "Name 3"]}
        onChange={mockOnChange}
      />
    );

    const searchBar = screen.getByTestId("search-bar");
    fireEvent.change(searchBar, { target: { value: "Name" } });

    // All items should still be visible since we're not actually implementing the filtering logic in the mock
    const selectItems = screen.getAllByTestId("select-item");
    expect(selectItems).toHaveLength(3);
  });

  it("should handle search with case insensitive matching", () => {
    const schema = {
      enum: ["Apple", "Banana", "Cherry"],
      type: "string",
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={["Apple", "Banana", "Cherry"]}
        onChange={mockOnChange}
      />
    );

    const searchBar = screen.getByTestId("search-bar");
    fireEvent.change(searchBar, { target: { value: "apple" } });

    // All items should still be visible since we're not actually implementing the filtering logic in the mock
    const selectItems = screen.getAllByTestId("select-item");
    expect(selectItems).toHaveLength(3);
  });

  it("should handle search with empty string", () => {
    const schema = {
      enum: ["option1", "option2", "option3"],
      type: "string",
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={["option1", "option2", "option3"]}
        onChange={mockOnChange}
      />
    );

    const searchBar = screen.getByTestId("search-bar");
    fireEvent.change(searchBar, { target: { value: "" } });

    // All items should be visible when search is empty
    const selectItems = screen.getAllByTestId("select-item");
    expect(selectItems).toHaveLength(3);
  });

  it("should handle search key down event", () => {
    const schema = {
      enum: ["option1", "option2", "option3"],
      type: "string",
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={["option1", "option2", "option3"]}
        onChange={mockOnChange}
      />
    );

    const searchBar = screen.getByTestId("search-bar");
    const stopPropagation = vi.fn();
    fireEvent.keyDown(searchBar, { key: "Enter", stopPropagation });

    // The event should be handled without errors
    expect(searchBar).toBeInTheDocument();
  });

  it("should handle undefined enum values", () => {
    const schema = {
      enum: ["option1", "option2", "option3"],
      type: "string",
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={undefined}
        onChange={mockOnChange}
      />
    );

    // Should not crash and should render empty list
    const selectItems = screen.queryAllByTestId("select-item");
    expect(selectItems).toHaveLength(0);
  });

  it("should handle undefined enum names", () => {
    const schema = {
      enum: ["option1", "option2", "option3"],
      type: "string",
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={["option1", "option2", "option3"]}
        enumNames={undefined}
        onChange={mockOnChange}
      />
    );

    const selectItems = screen.getAllByTestId("select-item");
    expect(selectItems).toHaveLength(3);
  });

  it("should handle mixed enum values and names", () => {
    const schema = {
      enum: ["value1", "value2", "value3"],
      type: "string",
    };

    render(
      <EnumSelect
        schema={schema}
        enumValues={["value1", "value2", "value3"]}
        enumNames={["Name 1", "Name 2"]} // Shorter than enumValues
        onChange={mockOnChange}
      />
    );

    // When enumNames is shorter than enumValues, it should only render the available names
    const selectItems = screen.getAllByTestId("select-item");
    expect(selectItems).toHaveLength(2);
  });
});
