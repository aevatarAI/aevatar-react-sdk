import { render, screen } from "@testing-library/react";
import Background from "./background";
import React from "react";
import { vi, describe, it, expect } from "vitest";
import "@testing-library/jest-dom";

// Mock SVG Icon
vi.mock("../../assets/svg/empty-gaevatar.svg?react", () => ({
  __esModule: true,
  default: ({ width, hanging }: { width: number; hanging: number }) => (
    <svg data-testid="empty-icon" width={width} hanging={hanging} />
  ),
}));

describe("Background Component", () => {
  it("should render the Background component with text and SVG icon", () => {
    render(<Background />);

    // Check if SVG icon is rendered
    const svgIcon = screen.getByTestId("empty-icon");
    expect(svgIcon).toBeInTheDocument();
    expect(svgIcon).toHaveAttribute("width", "86");
    expect(svgIcon).toHaveAttribute("hanging", "67");

    // Check if instructional text is rendered
    const textElement = screen.getByText(
      /begin by dragging and dropping or adding a card from the sidebar on the left!/i
    );
    expect(textElement).toBeInTheDocument();
    expect(textElement).toHaveClass("sdk:text-center");
  });

  it("should have correct container structure and classes", () => {
    const { container } = render(<Background />);

    // Validate the top-level container has the right classes
    const topLevelDiv = container.querySelector("div.sdk\\:w-full");
    expect(topLevelDiv).toBeInTheDocument();
    expect(topLevelDiv).toHaveClass(
      "sdk:flex sdk:justify-center sdk:items-center sdk:absolute sdk:top-0 sdk:bottom-0 sdk:left-0 sdk:right-0 sdk:flex-col"
    );

    // Validate the inner container has the right classes
    const innerDiv = container.querySelector("div.sdk\\:w-\\[288px\\]");
    expect(innerDiv).toBeInTheDocument();
    expect(innerDiv).toHaveClass(
      "sdk:flex sdk:gap-6 sdk:flex-col sdk:justify-center sdk:items-center sdk:workflow-reactflow-background"
    );
  });
});
