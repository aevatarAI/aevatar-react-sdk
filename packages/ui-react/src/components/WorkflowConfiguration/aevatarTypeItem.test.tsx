import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AevatarTypeItem from "./aevatarTypeItem";

// Mock Tooltip components
vi.mock("../ui/tooltip", () => ({
  TooltipProvider: ({ children }: any) => <div data-testid="tooltip-provider">{children}</div>,
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children }: any) => <div data-testid="tooltip-trigger">{children}</div>,
  TooltipContent: ({ children, ...props }: any) => <div data-testid="tooltip-content" {...props}>{children}</div>,
}));

// Mock SVG icons
vi.mock("../../assets/svg/new-aevatarItem.svg?react", () => ({
  default: (props: any) => <div data-testid="new-aevatar-item-icon" {...props}>NewIcon</div>,
}));
vi.mock("../../assets/svg/new-aevatarItem-hover.svg?react", () => ({
  default: (props: any) => <div data-testid="new-aevatar-item-hover-icon" {...props}>HoverIcon</div>,
}));
vi.mock("../../assets/svg/aevatarItem.svg?react", () => ({
  default: (props: any) => <div data-testid="aevatar-item-icon" {...props}>AevatarIcon</div>,
}));

// Mock useDnD
const setDragItemMock = vi.fn();
vi.mock("../Workflow/DnDContext", () => ({
  useDnD: () => [null, setDragItemMock],
}));

// Mock useDrag
const useDragMock = vi.fn();
vi.mock("react-dnd", () => ({
  useDrag: (...args: any[]) => useDragMock(...args),
}));

// Mock useToast
const toastMock = vi.fn();
vi.mock("../../hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

describe("AevatarTypeItem", () => {
  const defaultProps = {
    agentType: "test.agentType",
    description: "desc",
    className: "custom-class",
    disabled: false,
    propertyJsonSchema: "{}",
    defaultValues: { foo: [1, 2] },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useDragMock.mockImplementation(() => [{ isDragging: false }, vi.fn()]);
  });

  it("renders with agentType and description", () => {
    render(<AevatarTypeItem {...defaultProps} />);
    expect(screen.getByText("agentType")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip-content")).toHaveTextContent("desc");
  });

  it("applies custom className", () => {
    render(<AevatarTypeItem {...defaultProps} />);
    const mainDiv = screen.getByTestId("aevatar-type-item-root");
    expect(mainDiv).toHaveClass("custom-class");
  });

  it("renders all icons", () => {
    render(<AevatarTypeItem {...defaultProps} />);
    expect(screen.getByTestId("new-aevatar-item-icon")).toBeInTheDocument();
    expect(screen.getByTestId("new-aevatar-item-hover-icon")).toBeInTheDocument();
    expect(screen.getByTestId("aevatar-item-icon")).toBeInTheDocument();
  });

  it("shows disabled style and disables drag", () => {
    useDragMock.mockImplementation(() => [{ isDragging: false }, vi.fn()]);
    render(<AevatarTypeItem {...defaultProps} disabled={true} />);
    const mainDiv = screen.getByTestId("aevatar-type-item-root");
    expect(mainDiv).toHaveClass("sdk:cursor-not-allowed");
  });

  it("shows dragging style", () => {
    useDragMock.mockImplementation(() => [{ isDragging: true }, vi.fn()]);
    render(<AevatarTypeItem {...defaultProps} />);
    const mainDiv = screen.getByTestId("aevatar-type-item-root");
    expect(mainDiv).toHaveClass("sdk:opacity-50");
  });

  it("calls toast on click", () => {
    render(<AevatarTypeItem {...defaultProps} />);
    const mainDiv = screen.getByTestId("aevatar-type-item-root");
    fireEvent.click(mainDiv);
    expect(toastMock).toHaveBeenCalledWith({ description: expect.stringContaining("drag and drop") });
  });

  it("sets drag item on drag start and end", () => {
    let dragEnd;
    useDragMock.mockImplementation((opts) => {
      dragEnd = opts.end;
      return [{ isDragging: false }, vi.fn()];
    });
    render(<AevatarTypeItem {...defaultProps} />);
    // Simulate drag end
    dragEnd && dragEnd();
    expect(setDragItemMock).toHaveBeenCalledWith(null);
  });

  it("sets drag item when isDragging", () => {
    useDragMock.mockImplementation(() => [{ isDragging: true }, vi.fn()]);
    render(<AevatarTypeItem {...defaultProps} />);
    expect(setDragItemMock).toHaveBeenCalled();
  });

  it("renders empty agentType and description", () => {
    render(<AevatarTypeItem />);
    expect(screen.getByTestId("tooltip-content")).toHaveTextContent("");
  });

  it("renders with different agentType format", () => {
    render(<AevatarTypeItem agentType="foo.bar.baz" />);
    expect(screen.getByText("baz")).toBeInTheDocument();
  });
}); 