import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, expect } from "vitest";
import WorkflowUnsaveModal from "./index";
import React from "react";

vi.mock("../../assets/svg/close.svg?react", () => ({
  __esModule: true,
  default: (props: any) => <svg {...props} data-testid="close-icon" />,
}));

vi.mock("../../assets/svg/unsaved.svg?react", () => ({
  __esModule: true,
  default: (props: any) => <svg {...props} data-testid="unsaved-icon" />,
}));

describe("WorkflowUnsaveModal", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSaveHandler = vi.fn();

  const renderComponent = (open: boolean) =>
    render(
      <WorkflowUnsaveModal
        open={open}
        onOpenChange={mockOnOpenChange}
        onSaveHandler={mockOnSaveHandler}
      />
    );

  it("renders the modal when open is true", () => {
    renderComponent(true);

    // Verify modal content is rendered
    expect(screen.getByTestId("unsaved-icon")).toBeInTheDocument();
    // Only assert the main content to avoid duplication with DialogTitle
    expect(screen.getByText(/you've made changes that haven't been saved/i)).toBeInTheDocument();
    // Verify buttons are present
    expect(screen.getByText("Close without saving")).toBeInTheDocument();
    expect(screen.getByText("Save and close")).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    renderComponent(false);

    // Ensure modal content is not rendered
    expect(screen.queryByTestId("unsaved-icon")).not.toBeInTheDocument();
    expect(screen.queryByText("Unsaved Changes")).not.toBeInTheDocument();
  });

  it("closes the modal when the close icon is clicked", () => {
    renderComponent(true);

    // Click the close icon
    const closeIcon = screen.getByTestId("close-icon");
    fireEvent.click(closeIcon);

    // Verify onOpenChange is called with false
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('fires "onSaveHandler(false)" and closes the modal when "Close without saving" is clicked', () => {
    renderComponent(true);

    // Click the "Close without saving" button
    const closeWithoutSavingBtn = screen.getByText("Close without saving");
    fireEvent.click(closeWithoutSavingBtn);

    // Verify "onSaveHandler" is called with false
    expect(mockOnSaveHandler).toHaveBeenCalledWith(false);

    // Verify "onOpenChange" is called with false
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('fires "onSaveHandler(true)" and closes the modal when "Save and close" is clicked', () => {
    renderComponent(true);

    // Click the "Save and close" button
    const saveAndCloseBtn = screen.getByText("Save and close");
    fireEvent.click(saveAndCloseBtn);

    // Verify "onSaveHandler" is called with true
    expect(mockOnSaveHandler).toHaveBeenCalledWith(true);

    // Verify "onOpenChange" is called with false
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
