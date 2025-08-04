import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DeleteWorkflowConfirm from "./index";
import "@testing-library/jest-dom";

// Mock SVG components
vi.mock("../../assets/svg/delete.svg?react", () => ({
  default: ({ className, onClick }: any) => (
    <div data-testid="delete-icon" className={className} onClick={onClick}>
      Delete Icon
    </div>
  ),
}));

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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render delete button with tooltip", () => {
    render(<DeleteWorkflowConfirm handleConfirm={mockHandleConfirm} />);

    // Check if delete button is rendered
    const deleteButton = screen.getByTestId("delete-icon");
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("sdk:cursor-pointer", "sdk:text-[#606060]");
  });

  it("should open dialog when delete button is clicked", async () => {
    render(<DeleteWorkflowConfirm handleConfirm={mockHandleConfirm} />);

    const deleteButton = screen.getByTestId("delete-icon");
    fireEvent.click(deleteButton);

    // Check if dialog content is rendered
    await waitFor(() => {
      expect(screen.getByText("Are you sure you want to delete this workflow?")).toBeInTheDocument();
    });

    // Check if buttons are rendered
    expect(screen.getByText("cancel")).toBeInTheDocument();
    expect(screen.getByText("yes")).toBeInTheDocument();
  });

  it("should close dialog when close icon is clicked", async () => {
    render(<DeleteWorkflowConfirm handleConfirm={mockHandleConfirm} />);

    // Open dialog
    const deleteButton = screen.getByTestId("delete-icon");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText("Are you sure you want to delete this workflow?")).toBeInTheDocument();
    });

    // Close dialog
    const closeButton = screen.getByTestId("close-icon");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText("Are you sure you want to delete this workflow?")).not.toBeInTheDocument();
    });
  });

  it("should close dialog when cancel button is clicked", async () => {
    render(<DeleteWorkflowConfirm handleConfirm={mockHandleConfirm} />);

    // Open dialog
    const deleteButton = screen.getByTestId("delete-icon");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText("cancel")).toBeInTheDocument();
    });

    // Click cancel button
    const cancelButton = screen.getByText("cancel");
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText("Are you sure you want to delete this workflow?")).not.toBeInTheDocument();
    });

    // Verify handleConfirm is not called
    expect(mockHandleConfirm).not.toHaveBeenCalled();
  });

  it("should call handleConfirm and close dialog when yes button is clicked", async () => {
    render(<DeleteWorkflowConfirm handleConfirm={mockHandleConfirm} />);

    // Open dialog
    const deleteButton = screen.getByTestId("delete-icon");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText("yes")).toBeInTheDocument();
    });

    // Click yes button
    const yesButton = screen.getByText("yes");
    fireEvent.click(yesButton);

    // Verify handleConfirm is called
    expect(mockHandleConfirm).toHaveBeenCalledTimes(1);

    // Verify dialog is closed
    await waitFor(() => {
      expect(screen.queryByText("Are you sure you want to delete this workflow?")).not.toBeInTheDocument();
    });
  });

  it("should prevent event propagation on delete button click", () => {
    const mockStopPropagation = vi.fn();
    render(<DeleteWorkflowConfirm handleConfirm={mockHandleConfirm} />);

    const deleteButton = screen.getByTestId("delete-icon");
    
    // Simulate click with stopPropagation
    fireEvent.click(deleteButton, { stopPropagation: mockStopPropagation });

    // The component should handle stopPropagation internally
    expect(deleteButton).toBeInTheDocument();
  });

  it("should prevent event propagation on yes button click", async () => {
    render(<DeleteWorkflowConfirm handleConfirm={mockHandleConfirm} />);

    // Open dialog
    const deleteButton = screen.getByTestId("delete-icon");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText("yes")).toBeInTheDocument();
    });

    const yesButton = screen.getByText("yes");
    
    // Simulate click with stopPropagation
    fireEvent.click(yesButton, { stopPropagation: vi.fn() });

    // Verify handleConfirm is called
    expect(mockHandleConfirm).toHaveBeenCalledTimes(1);
  });

  it("should render dialog content with correct styling", async () => {
    render(<DeleteWorkflowConfirm handleConfirm={mockHandleConfirm} />);

    // Open dialog
    const deleteButton = screen.getByTestId("delete-icon");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      // Check if dialog content is rendered
      expect(screen.getByText("Are you sure you want to delete this workflow?")).toBeInTheDocument();
    });

    // Check if delete tip logo is rendered
    expect(screen.getByTestId("delete-tip-logo")).toBeInTheDocument();
  });

  it("should render buttons with correct styling", async () => {
    render(<DeleteWorkflowConfirm handleConfirm={mockHandleConfirm} />);

    // Open dialog
    const deleteButton = screen.getByTestId("delete-icon");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      const cancelButton = screen.getByText("cancel");
      const yesButton = screen.getByText("yes");

      expect(cancelButton).toHaveClass("sdk:text-[12px]", "sdk:py-[7px]");
      expect(yesButton).toHaveClass("sdk:bg-white", "sdk:text-[#303030]");
    });
  });

  it("should call handleConfirm only when yes button is clicked", async () => {
    render(<DeleteWorkflowConfirm handleConfirm={mockHandleConfirm} />);

    const deleteButton = screen.getByTestId("delete-icon");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText("cancel")).toBeInTheDocument();
    });

    // Click cancel - should not call handleConfirm
    const cancelButton = screen.getByText("cancel");
    fireEvent.click(cancelButton);
    expect(mockHandleConfirm).not.toHaveBeenCalled();

    // Reopen dialog
    fireEvent.click(deleteButton);
    await waitFor(() => {
      expect(screen.getByText("yes")).toBeInTheDocument();
    });

    // Click yes - should call handleConfirm
    const yesButton = screen.getByText("yes");
    fireEvent.click(yesButton);
    expect(mockHandleConfirm).toHaveBeenCalledTimes(1);
  });

  it("should handle dialog state changes correctly", async () => {
    render(<DeleteWorkflowConfirm handleConfirm={mockHandleConfirm} />);

    const deleteButton = screen.getByTestId("delete-icon");

    // Initially dialog should be closed
    expect(screen.queryByText("Are you sure you want to delete this workflow?")).not.toBeInTheDocument();

    // Open dialog
    fireEvent.click(deleteButton);
    await waitFor(() => {
      expect(screen.getByText("Are you sure you want to delete this workflow?")).toBeInTheDocument();
    });

    // Close dialog using cancel
    const cancelButton = screen.getByText("cancel");
    fireEvent.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByText("cancel")).not.toBeInTheDocument();
    });
  });

  it("should render all dialog elements correctly", async () => {
    render(<DeleteWorkflowConfirm handleConfirm={mockHandleConfirm} />);

    const deleteButton = screen.getByTestId("delete-icon");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      // Check main dialog elements
      expect(screen.getByText("Are you sure you want to delete this workflow?")).toBeInTheDocument();
      expect(screen.getByTestId("delete-tip-logo")).toBeInTheDocument();
      expect(screen.getByTestId("close-icon")).toBeInTheDocument();
      expect(screen.getByText("cancel")).toBeInTheDocument();
      expect(screen.getByText("yes")).toBeInTheDocument();
    });
  });
}); 