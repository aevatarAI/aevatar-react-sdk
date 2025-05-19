import { render, screen, fireEvent } from "@testing-library/react";

import { describe, expect, it, vi } from "vitest";
import AevatarCardInner, {
  type IAevatarCardInnerProps,
} from "./AevatarCardInner";
import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import React from "react";
import "@testing-library/jest-dom";

describe("AevatarCardInner", () => {
  const mockOnEditGaevatar = vi.fn();

  const defaultProps: IAevatarCardInnerProps & IAgentInfoDetail = {
    className: "test-class",
    onEditGaevatar: mockOnEditGaevatar,
    id: "123",
    businessAgentGrainId: "",
    agentGuid: "agent-123", // Added missing property
    agentType: "type-1", // Added missing property
    name: "AI-123", // Added missing property
    properties: {
      name: "AI-123-properties",
      type: "Type-A",
    },
  };

  it("should render the component with correct className and elements", () => {
    render(<AevatarCardInner {...defaultProps} />);
    const card = screen.getByText("AI-123");
    expect(card).toBeInTheDocument();

    expect(screen.getByText("AI-123-properties")).toBeInTheDocument();
  });

  it("should trigger onEditGaevatar when setting icon is clicked", () => {
    render(<AevatarCardInner {...defaultProps} />);

    const settingIcon = screen.getByRole("img"); // Assuming it's an SVG element
    fireEvent.click(settingIcon);

    expect(mockOnEditGaevatar).toHaveBeenCalledWith("123");
  });

  it("should correctly display properties", () => {
    render(<AevatarCardInner {...defaultProps} />);

    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText("AI-123")).toBeInTheDocument();
    expect(screen.getByText("type")).toBeInTheDocument();
    expect(screen.getByText("Type-A")).toBeInTheDocument();
  });

  it("should handle properties as arrays and display them correctly", () => {
    const propsWithArray = {
      ...defaultProps,
      properties: {
        name: ["AI-123-properties", "AI-124-properties"],
      },
    };

    render(<AevatarCardInner {...propsWithArray} />);

    expect(screen.getByText("AI-123-properties")).toBeInTheDocument();
    expect(screen.getByText("AI-124-properties")).toBeInTheDocument();
  });

  it("should call useCallback's propertiesValue correctly", () => {
    const propsWithSingleValue = {
      ...defaultProps,
      properties: {
        name: "AI-123-properties",
      },
    };

    render(<AevatarCardInner {...propsWithSingleValue} />);

    expect(screen.getByText("AI-123-properties")).toBeInTheDocument();
  });

  it("should not render anything when properties is empty", () => {
    const propsWithEmptyProperties = {
      ...defaultProps,
      properties: {},
    };

    render(<AevatarCardInner {...propsWithEmptyProperties} />);

    const elements = screen.queryAllByText(/name|type/i);
    expect(elements.length).toBe(0);
  });
});
