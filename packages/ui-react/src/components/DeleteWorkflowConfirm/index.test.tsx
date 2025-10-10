import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DeleteWorkflowConfirm from "./index";
import "@testing-library/jest-dom";

// Mock SVG components
vi.mock("../../assets/svg/delete-tip-logo.svg?react", () => ({
  default: () => <div data-testid="delete-tip-logo">Delete Tip Logo</div>,
}));

vi.mock("../../assets/svg/close.svg?react", () => ({
  default: ({ onClick }: any) => (
    <div data-testid="close-icon" onClick={onClick}>
      Close Icon
    </div>
  ),
}));

describe("DeleteWorkflowConfirm", () => {
  const mockHandleConfirm = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render dialog when open is true", () => {
    render(
      <DeleteWorkflowConfirm 
        open={true} 
        handleConfirm={mockHandleConfirm} 
        onOpenChange={mockOnOpenChange}
      />
    );

    // Check if dialog content is rendered
    expect(screen.getByText("Are you sure you want to delete this workflow?")).toBeInTheDocument();
    expect(screen.getByTestId("delete-tip-logo")).toBeInTheDocument();
    expect(screen.getByTestId("close-icon")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it("should not render dialog when open is false", () => {
    render(
      <DeleteWorkflowConfirm 
        open={false} 
        handleConfirm={mockHandleConfirm} 
        onOpenChange={mockOnOpenChange}
      />
    );

    // Check if dialog content is not rendered
    expect(screen.queryByText("Are you sure you want to delete this workflow?")).not.toBeInTheDocument();
  });

  it("should close dialog when close icon is clicked", () => {
    render(
      <DeleteWorkflowConfirm 
        open={true} 
        handleConfirm={mockHandleConfirm} 
        onOpenChange={mockOnOpenChange}
      />
    );

    const closeButton = screen.getByTestId("close-icon");
    fireEvent.click(closeButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("should close dialog when Cancel button is clicked", () => {
    render(
      <DeleteWorkflowConfirm 
        open={true} 
        handleConfirm={mockHandleConfirm} 
        onOpenChange={mockOnOpenChange}
      />
    );

    const CancelButton = screen.getByText("Cancel");
    fireEvent.click(CancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockHandleConfirm).not.toHaveBeenCalled();
  });

  it("should call handleConfirm and close dialog when Yes button is clicked", () => {
    render(
      <DeleteWorkflowConfirm 
        open={true} 
        handleConfirm={mockHandleConfirm} 
        onOpenChange={mockOnOpenChange}
      />
    );

    const YesButton = screen.getByText("Yes");
    fireEvent.click(YesButton);

    expect(mockHandleConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("should render buttons with correct styling", () => {
    render(
      <DeleteWorkflowConfirm 
        open={true} 
        handleConfirm={mockHandleConfirm} 
        onOpenChange={mockOnOpenChange}
      />
    );

    const CancelButton = screen.getByText("Cancel");
    const YesButton = screen.getByText("Yes");

    expect(CancelButton).toHaveClass("sdk:text-[12px]", "sdk:py-[7px]");
    expect(YesButton).toHaveClass("sdk:text-[12px]", "sdk:py-[7px]");
  });

  it("should render dialog content with correct styling", () => {
    render(
      <DeleteWorkflowConfirm 
        open={true} 
        handleConfirm={mockHandleConfirm} 
        onOpenChange={mockOnOpenChange}
      />
    );

    // Check if dialog content is rendered
    expect(screen.getByText("Are you sure you want to delete this workflow?")).toBeInTheDocument();
    expect(screen.getByTestId("delete-tip-logo")).toBeInTheDocument();
  });
});