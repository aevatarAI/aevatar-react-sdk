import { render, fireEvent, screen } from "@testing-library/react";
import { describe, it, vi, expect } from "vitest";
import AevatarItem from "./aevatarItemMini";
import React from "react";
import "@testing-library/jest-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// Mock SVG imports
vi.mock("../../assets/svg/aevatarItem.svg?react", () => ({
  __esModule: true,
  default: () => <svg data-testid="aevatar-item-icon" />,
}));
vi.mock("../../assets/svg/aevatarItem-hover.svg?react", () => ({
  __esModule: true,
  default: () => <svg data-testid="aevatar-item-hover-icon" />,
}));
vi.mock("../../assets/svg/new-aevatarItem.svg?react", () => ({
  __esModule: true,
  default: () => <svg data-testid="new-aevatar-item-icon" />,
}));
vi.mock("../../assets/svg/new-aevatarItem-hover.svg?react", () => ({
  __esModule: true,
  default: () => <svg data-testid="new-aevatar-item-hover-icon" />,
}));

// Mock useDnD hook
vi.mock("../Workflow/DnDContext", () => ({
  useDnD: () => [null, vi.fn()],
}));

// Mock useToast hook
vi.mock("../../hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("AevatarItem Component", () => {
  const renderWithDnD = (component: React.ReactElement) => {
    return render(
      <DndProvider backend={HTML5Backend}>
        {component}
      </DndProvider>
    );
  };

  it("renders as a 'new agent' when isnew is true", () => {
    renderWithDnD(<AevatarItem isnew name="New Aevatar" />);
    screen.debug();
    // Check that the new aevatar icons render
    expect(screen.getByTestId("new-aevatar-item-icon")).toBeInTheDocument();
    expect(
      screen.getByTestId("new-aevatar-item-hover-icon")
    ).toBeInTheDocument();

    // Check that the "new agent" text renders
    expect(screen.getByText("+ new agent")).toBeInTheDocument();
  });

  it("renders name and agentType when isnew is false", () => {
    renderWithDnD(
      <AevatarItem
        isnew={false}
        name="Test Aevatar"
        agentType="Test Agent Type"
      />
    );

    // Check that the regular icons render
    expect(screen.getByTestId("aevatar-item-icon")).toBeInTheDocument();
    expect(screen.getByTestId("aevatar-item-hover-icon")).toBeInTheDocument();

    // Check that name and agentType are rendered
    expect(screen.getByText("Test Aevatar")).toBeInTheDocument();
    expect(screen.getByText("Test Agent Type")).toBeInTheDocument();
  });
});
