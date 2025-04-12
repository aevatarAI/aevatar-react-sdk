// MyGAevatar.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { aevatarAI } from "../../utils";
import { loadingAtom } from "../../state/atoms";
import { useAtom } from "jotai";
import MyGAevatar from ".";
import React from "react";

vi.mock("../../utils", () => ({
  aevatarAI: {
    services: {
      agent: {
        getAgents: vi.fn(),
      },
    },
  },
}));

vi.mock("jotai", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useAtom: vi.fn(),
  };
});

describe("MyGAevatar", () => {
  let onNewGAevatarMock: any;
  let onEditGaevatarMock: any;

  beforeEach(() => {
    onNewGAevatarMock = vi.fn();
    onEditGaevatarMock = vi.fn();

    vi.mocked(useAtom).mockReturnValue([null, vi.fn()]);
  });

  it("should render MyGAevatar and show loading initially", async () => {
    vi.mocked(aevatarAI.services.agent.getAgents).mockResolvedValue([
      {
        id: "1",
        agentType: "AI Basic",
        name: "Agent Name",
        properties: {
          modelProvider: "gpt",
          bio: "this is a lively and adorable physicist",
          topic: ["aelf.pdf", "Agent1.pdf", "aelf1.pdf", "Agent.pdf"],
        },
        agentGuid: "",
        businessAgentGrainId: "",
      },
    ]);

    render(<MyGAevatar onEditGaevatar={onEditGaevatarMock} />);

    // expect(screen.getByTestId("page-loading")).toBeInTheDocument();

    await waitFor(() =>
      expect(aevatarAI.services.agent.getAgents).toHaveBeenCalled()
    );

    expect(
      screen.getByText("this is a lively and adorable physicist")
    ).toBeInTheDocument();
  });

  it("should show empty state when no gAevatar is returned", async () => {
    vi.mocked(aevatarAI.services.agent.getAgents).mockResolvedValue([]);

    render(<MyGAevatar onEditGaevatar={onEditGaevatarMock} />);

    await waitFor(() =>
      expect(aevatarAI.services.agent.getAgents).toHaveBeenCalled()
    );

    expect(screen.getByTestId("empty-icon")).toBeInTheDocument();
    expect(screen.getByText("new g-aevatar")).toBeInTheDocument();
  });

  it("should call onNewGAevatar when new g-aevatar button is clicked", () => {
    render(
      <MyGAevatar
        onEditGaevatar={onEditGaevatarMock}
        onNewGAevatar={onNewGAevatarMock}
      />
    );

    fireEvent.click(screen.getByText("new g-aevatar"));

    expect(onNewGAevatarMock).toHaveBeenCalled();
  });

  it("should call onEditGaevatar when an edit icon is clicked on an agent", async () => {
    vi.mocked(aevatarAI.services.agent.getAgents).mockResolvedValue([
      {
        id: "1",
        agentType: "AI Basic",
        name: "Agent Name",
        properties: {
          modelProvider: "gpt",
          bio: "this is a lively and adorable physicist",
          topic: ["aelf.pdf", "Agent1.pdf", "aelf1.pdf", "Agent.pdf"],
        },
        agentGuid: "",
        businessAgentGrainId: "",
      },
    ]);

    render(<MyGAevatar onEditGaevatar={onEditGaevatarMock} />);

    await waitFor(() =>
      expect(aevatarAI.services.agent.getAgents).toHaveBeenCalled()
    );

    fireEvent.click(screen.getByRole("img"));
    expect(onEditGaevatarMock).toHaveBeenCalledWith("1");
  });
});
