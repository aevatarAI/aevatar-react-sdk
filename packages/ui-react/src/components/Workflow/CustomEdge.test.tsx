import { describe, it, expect, vi } from 'vitest';
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CustomEdge from "./CustomEdge";

// Mock @xyflow/react
vi.mock("@xyflow/react", () => ({
  getBezierPath: vi.fn(() => ["M 0 0 L 100 100", 50, 50]),
  BaseEdge: ({ path, style, markerEnd }: any) => (
    <div data-testid="base-edge" style={style}>
      <path d={path} />
      {markerEnd && <div data-testid="marker-end">{markerEnd}</div>}
    </div>
  ),
}));

// Mock DeleteIcon SVG
vi.mock("../../assets/svg/delete_agent.svg?react", () => ({
  default: ({ width, height }: any) => (
    <div data-testid="delete-icon" style={{ width, height }}>
      Delete
    </div>
  ),
}));

describe("CustomEdge", () => {
  const defaultProps = {
    id: "edge-1",
    sourceX: 0,
    sourceY: 0,
    targetX: 100,
    targetY: 100,
    sourcePosition: "bottom" as any,
    targetPosition: "top" as any,
            style: { stroke: "var(--sdk-bg-black-light)" },
    markerEnd: "arrow",
    setEdges: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders CustomEdge component", () => {
    render(<CustomEdge {...defaultProps} />);
    
    expect(screen.getByTestId("base-edge")).toBeInTheDocument();
    expect(screen.getByTestId("delete-icon")).toBeInTheDocument();
  });

  it("renders delete button with correct styling", () => {
    render(<CustomEdge {...defaultProps} />);
    
    const deleteButton = screen.getByRole("button");
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("sdk:bg-[var(--sdk-color-bg-primary)]");
    expect(deleteButton).toHaveClass("sdk:text-[var(--sdk-color-text-secondary)]");
    expect(deleteButton).toHaveClass("sdk:border");
    expect(deleteButton).toHaveClass("sdk:border-[var(--sdk-color-border-primary)]");
  });

  it("calls setEdges when delete button is clicked", () => {
    const setEdges = vi.fn();
    render(<CustomEdge {...defaultProps} setEdges={setEdges} />);
    
    const deleteButton = screen.getByRole("button");
    fireEvent.click(deleteButton);
    
    expect(setEdges).toHaveBeenCalledTimes(1);
    expect(setEdges).toHaveBeenCalledWith(expect.any(Function));
  });

  it("filters out the correct edge when delete is clicked", () => {
    const setEdges = vi.fn();
    render(<CustomEdge {...defaultProps} setEdges={setEdges} />);
    
    const deleteButton = screen.getByRole("button");
    fireEvent.click(deleteButton);
    
    const filterFunction = setEdges.mock.calls[0][0];
    const mockEdges = [
      { id: "edge-1", source: "node-1", target: "node-2" },
      { id: "edge-2", source: "node-2", target: "node-3" },
    ];
    
    const filteredEdges = filterFunction(mockEdges);
    expect(filteredEdges).toEqual([
      { id: "edge-2", source: "node-2", target: "node-3" },
    ]);
  });

  it("stops event propagation when delete button is clicked", () => {
    const setEdges = vi.fn();
    const stopPropagation = vi.fn();
    
    render(<CustomEdge {...defaultProps} setEdges={setEdges} />);
    
    const deleteButton = screen.getByRole("button");
    fireEvent.click(deleteButton, { stopPropagation });
    
    expect(setEdges).toHaveBeenCalled();
  });

  it("renders with custom style", () => {
    const customStyle = { stroke: "var(--sdk-warning-color)", strokeWidth: 2 };
    render(<CustomEdge {...defaultProps} style={customStyle} />);
    
    const baseEdge = screen.getByTestId("base-edge");
    expect(baseEdge.style.stroke).toBe("var(--sdk-warning-color)");
    expect(baseEdge.style.strokeWidth).toBe("2");
  });

  it("renders with marker end", () => {
    render(<CustomEdge {...defaultProps} markerEnd="arrow" />);
    
    expect(screen.getByTestId("marker-end")).toBeInTheDocument();
    expect(screen.getByTestId("marker-end")).toHaveTextContent("arrow");
  });

  it("renders without marker end", () => {
    render(<CustomEdge {...defaultProps} markerEnd={undefined} />);
    
    expect(screen.queryByTestId("marker-end")).not.toBeInTheDocument();
  });

  it("renders foreignObject with correct positioning", () => {
    render(<CustomEdge {...defaultProps} />);
    
    const foreignObject = screen.getByTestId("base-edge").parentElement?.querySelector("foreignObject");
    expect(foreignObject).toBeInTheDocument();
    expect(foreignObject).toHaveClass("aevatar-edge-delete-btn");
  });

  it("renders delete icon with correct dimensions", () => {
    render(<CustomEdge {...defaultProps} />);
    
    const deleteIcon = screen.getByTestId("delete-icon");
    expect(deleteIcon).toHaveStyle({ width: "16px", height: "16px" });
  });

  it("handles different edge positions", () => {
    const propsWithDifferentPositions = {
      ...defaultProps,
      sourcePosition: "right" as any,
      targetPosition: "left" as any,
    };
    
    render(<CustomEdge {...propsWithDifferentPositions} />);
    
    expect(screen.getByTestId("base-edge")).toBeInTheDocument();
    expect(screen.getByTestId("delete-icon")).toBeInTheDocument();
  });

  it("renders with default style when no style provided", () => {
    const propsWithoutStyle = {
      ...defaultProps,
      style: undefined,
    };
    
    render(<CustomEdge {...propsWithoutStyle} />);
    
    expect(screen.getByTestId("base-edge")).toBeInTheDocument();
  });

  it("renders with different edge ID", () => {
    const propsWithDifferentId = {
      ...defaultProps,
      id: "custom-edge-id",
    };
    
    const setEdges = vi.fn();
    render(<CustomEdge {...propsWithDifferentId} setEdges={setEdges} />);
    
    const deleteButton = screen.getByRole("button");
    fireEvent.click(deleteButton);
    
    const filterFunction = setEdges.mock.calls[0][0];
    const mockEdges = [
      { id: "custom-edge-id", source: "node-1", target: "node-2" },
      { id: "edge-2", source: "node-2", target: "node-3" },
    ];
    
    const filteredEdges = filterFunction(mockEdges);
    expect(filteredEdges).toEqual([
      { id: "edge-2", source: "node-2", target: "node-3" },
    ]);
  });
}); 