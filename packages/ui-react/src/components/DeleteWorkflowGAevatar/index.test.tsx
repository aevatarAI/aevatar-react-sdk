import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, expect } from "vitest";
import DeleteWorkflowGAevatar from "./index";
import React from "react";

// Mock asset imports
vi.mock("../../assets/svg/delete.svg?react", () => ({
  __esModule: true,
  default: (props: any) => <svg {...props} data-testid="delete-icon" />,
}));

vi.mock("../../assets/svg/delete-tip-logo.svg?react", () => ({
  __esModule: true,
  default: (props: any) => <svg {...props} data-testid="delete-tip-icon" />,
}));

vi.mock("../../assets/svg/close.svg?react", () => ({
  __esModule: true,
  default: (props: any) => <svg {...props} data-testid="close-icon" />,
}));

describe("DeleteWorkflowGAevatar Component", () => {
  const mockHandleDeleteClick = vi.fn();

  const renderComponent = () =>
    render(
      <DeleteWorkflowGAevatar handleDeleteClick={mockHandleDeleteClick} />
    );

  it("renders the delete icon successfully", () => {
    renderComponent();

    // Ensure the delete icon is visible
    expect(screen.getByTestId("delete-icon")).toBeInTheDocument();
  });

  it("opens the dialog when the delete icon is clicked", () => {
    renderComponent();

    // Simulate clicking the delete icon
    fireEvent.click(screen.getByTestId("delete-icon"));

    // Ensure the dialog content is visible
    expect(
      screen.getByText("Are you sure you want to delete this g-aevatar?")
    ).toBeInTheDocument();
  });

  it("closes the dialog when the close icon is clicked", () => {
    renderComponent();

    // Open the dialog
    fireEvent.click(screen.getByTestId("delete-icon"));

    // Ensure the dialog content is visible
    expect(
      screen.getByText("Are you sure you want to delete this g-aevatar?")
    ).toBeInTheDocument();

    // Click the close icon
    fireEvent.click(screen.getByTestId("close-icon"));

    // Ensure the dialog content is no longer visible
    expect(
      screen.queryByText("Are you sure you want to delete this g-aevatar?")
    ).not.toBeInTheDocument();
  });

  it("closes the dialog when the cancel button is clicked", () => {
    renderComponent();

    // Open the dialog
    fireEvent.click(screen.getByTestId("delete-icon"));

    // Ensure the dialog content is visible
    expect(
      screen.getByText("Are you sure you want to delete this g-aevatar?")
    ).toBeInTheDocument();

    // Click the cancel button
    fireEvent.click(screen.getByText("cancel"));

    // Ensure the dialog content is no longer visible
    expect(
      screen.queryByText("Are you sure you want to delete this g-aevatar?")
    ).not.toBeInTheDocument();
  });

  it("invokes handleDeleteClick when the confirm button is clicked", () => {
    renderComponent();

    // Open the dialog
    fireEvent.click(screen.getByTestId("delete-icon"));

    // Click the "yes" button
    fireEvent.click(screen.getByText("yes"));

    // Ensure the callback function is called
    expect(mockHandleDeleteClick).toHaveBeenCalledTimes(1);
  });

//   it("closes the dialog after clicking the confirm button", () => {
//     renderComponent();

//     // Open the dialog
//     fireEvent.click(screen.getByTestId("delete-icon"));

//     // Click the "yes" button
//     fireEvent.click(screen.getByText("yes"));
//     screen.debug();
//     // Ensure the dialog content is no longer visible
//     expect(
//       screen.queryByText("Are you sure you want to delete this g-aevatar?")
//     ).not.toBeInTheDocument();
//   });
});
