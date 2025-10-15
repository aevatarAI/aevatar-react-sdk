import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, expect } from "vitest";
import WorkflowSaveFailedModal, {
  SaveFailedError,
  type IWorkflowSaveFailedModalProps,
} from "./";
import React from "react";
import "@testing-library/jest-dom";

// Mock SVG imports
vi.mock("../../assets/svg/close.svg?react", () => ({
  __esModule: true,
  default: (props: any) => <svg {...props} data-testid="close-icon" />,
}));
vi.mock("../../assets/svg/save-error-tip.svg?react", () => ({
  __esModule: true,
  default: (props: any) => <svg {...props} data-testid="save-error-icon" />,
}));

describe("WorkflowSaveFailedModal", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSaveFailed = vi.fn();

  const renderComponent = (props: Partial<IWorkflowSaveFailedModalProps>) => {
    render(
      <WorkflowSaveFailedModal
        saveFailed={props.saveFailed}
        onOpenChange={props.onOpenChange || mockOnOpenChange}
        onSaveFailed={props.onSaveFailed || mockOnSaveFailed}
      />
    );
  };

  it("renders correctly when 'insufficientQuota' error occurs", () => {
    renderComponent({ saveFailed: SaveFailedError.insufficientQuota });

    // Verify SaveFailedTip icon renders
    expect(screen.getByTestId("save-error-icon")).toBeInTheDocument();

    // Verify the error message
    expect(
      screen.getByText("saving failed :( Please purchase more quota", {
        exact: false,
      })
    ).toBeInTheDocument();

    // Verify the action button text
    expect(screen.getByText("Purchase now")).toBeInTheDocument();
  });

  it("renders correctly when 'maxAgents' error occurs", () => {
    renderComponent({ saveFailed: SaveFailedError.maxAgents });

    // Verify SaveFailedTip icon renders
    expect(screen.getByTestId("save-error-icon")).toBeInTheDocument();

    // Verify the error message
    expect(
      screen.getByText("Maximum agent creation count reached")
    ).toBeInTheDocument();

    // Verify the action button text
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("calls 'onOpenChange' with false when the close icon is clicked", () => {
    renderComponent({ saveFailed: true });

    // Simulate clicking the close icon
    fireEvent.click(screen.getByTestId("close-icon"));

    // Verify onOpenChange was called with false
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls 'onSaveFailed' and 'onOpenChange' when action button is clicked", () => {
    renderComponent({ saveFailed: SaveFailedError.insufficientQuota });

    // Simulate clicking the action button
    fireEvent.click(screen.getByText("Purchase now"));

    // Verify onSaveFailed is called with the correct error type
    expect(mockOnSaveFailed).toHaveBeenCalledWith(
      SaveFailedError.insufficientQuota
    );

    // Verify onOpenChange is called to close the modal
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not show modal when 'saveFailed' is falsy", () => {
    renderComponent({ saveFailed: false });

    // The modal content should not appear in the DOM when saveFailed is falsy
    expect(
      screen.queryByText("saving failed :(", { exact: false })
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("save-error-icon")).not.toBeInTheDocument();
  });
});
