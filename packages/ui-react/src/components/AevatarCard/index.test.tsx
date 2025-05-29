// AevatarCard.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import AevatarCard from "./index";
import React from "react";
import '@testing-library/jest-dom';

const mockAgentInfo: IAgentInfoDetail = {
  id: "123",
  properties: {
    name: "Test Agent",
    status: "Active",
  },
  agentGuid: "",
  agentType: "",
  name: "Test Agent",
  businessAgentGrainId: ""
};

const mockOnEditGaevatar = vi.fn();

describe("AevatarCard", () => {
  it("should render CardLoading when loading is true", () => {
    render(
      <AevatarCard
        loading={true}
        agentInfo={mockAgentInfo}
        onEditGaevatar={mockOnEditGaevatar}
      />
    );

    // Check if CardLoading is rendered
    const cardLoadingElement = screen.getByTestId("card-loading");
    expect(cardLoadingElement).toBeInTheDocument();
  });

  it("should render AevatarCardInner when loading is false", () => {
    render(
      <AevatarCard
        loading={false}
        agentInfo={mockAgentInfo}
        onEditGaevatar={mockOnEditGaevatar}
      />
    );

    // Check if AevatarCardInner is rendered
    expect(screen.getByText(/Test Agent/i)).toBeInTheDocument();
  });

  it("should call onEditGaevatar when setting icon is clicked", () => {
    render(
      <AevatarCard
        loading={false}
        agentInfo={mockAgentInfo}
        onEditGaevatar={mockOnEditGaevatar}
      />
    );

    const settingIcon = screen.getByRole("img");
    fireEvent.click(settingIcon);

    expect(mockOnEditGaevatar).toHaveBeenCalledWith(mockAgentInfo.id);
  });
});
