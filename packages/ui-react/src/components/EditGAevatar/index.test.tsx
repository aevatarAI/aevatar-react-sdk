import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import EditGAevatar from "./index";
import "@testing-library/jest-dom";

// Mock jotai
vi.mock("jotai", () => ({
  useAtom: () => [false, vi.fn()],
  atom: (init: any) => init,
}));

// Mock useAevatar
vi.mock("../context/AevatarProvider", () => {
  const useAevatarMock: any = vi.fn(() => [{ hiddenGAevatarType: [] }]);
  return { useAevatar: useAevatarMock, useAevatarMock };
});

// Mock useToast
vi.mock("../../hooks/use-toast", () => {
  const toastMock = vi.fn();
  return { useToast: () => ({ toast: toastMock }), toastMock };
});

// Mock aevatarAI
vi.mock("../../utils", () => {
  const getAllAgentsConfigurationMock = vi.fn();
  return {
    aevatarAI: {
      services: {
        agent: {
          getAllAgentsConfiguration: getAllAgentsConfigurationMock,
        },
      },
    },
    getAllAgentsConfigurationMock,
  };
});

// Mock handleErrorMessage
vi.mock("../../utils/error", () => ({
  handleErrorMessage: (e: any, d: string) => d,
}));

// Mock EditGAevatarInner
vi.mock("../EditGAevatarInner", () => {
  const EditGAevatarInnerMock = vi.fn(() => <div data-testid="edit-gaevatar-inner" />);
  return { __esModule: true, default: EditGAevatarInnerMock, EditGAevatarInnerMock };
});

// Mock PageLoading
vi.mock("../PageLoading", () => ({
  __esModule: true,
  default: () => <div data-testid="page-loading" />, 
}));

// Helper to get mocks
async function getMocks() {
  const { useAevatarMock } = await import("../context/AevatarProvider");
  const { toastMock } = await import("../../hooks/use-toast");
  const { getAllAgentsConfigurationMock } = await import("../../utils");
  const { EditGAevatarInnerMock } = await import("../EditGAevatarInner");
  return { useAevatarMock, toastMock, getAllAgentsConfigurationMock, EditGAevatarInnerMock };
}

describe("EditGAevatar", () => {
  beforeEach(async () => {
    const { getAllAgentsConfigurationMock, toastMock, useAevatarMock, EditGAevatarInnerMock } = await getMocks();
    getAllAgentsConfigurationMock.mockReset();
    toastMock.mockReset();
    useAevatarMock.mockReturnValue([{ hiddenGAevatarType: [] }]);
    EditGAevatarInnerMock.mockClear();
  });

  it("renders and handles loading state", async () => {
    const { getAllAgentsConfigurationMock, EditGAevatarInnerMock } = await getMocks();
    getAllAgentsConfigurationMock.mockResolvedValue([
      { agentType: "A", propertyJsonSchema: "{}" },
      { agentType: "B", propertyJsonSchema: "{}" },
    ]);
    render(<EditGAevatar onBack={vi.fn()} />);
    expect(screen.getByTestId("page-loading")).toBeInTheDocument();
    await waitFor(() => expect(EditGAevatarInnerMock).toHaveBeenCalled());
  });

  it("filters agent types by hiddenGAevatarType", async () => {
    const { getAllAgentsConfigurationMock, useAevatarMock, EditGAevatarInnerMock } = await getMocks();
    useAevatarMock.mockReturnValue([{ hiddenGAevatarType: ["A"] }]);
    getAllAgentsConfigurationMock.mockResolvedValue([
      { agentType: "A", propertyJsonSchema: "{}" },
      { agentType: "B", propertyJsonSchema: "{}" },
    ]);
    render(<EditGAevatar onBack={vi.fn()} />);
    await waitFor(() => expect(EditGAevatarInnerMock).toHaveBeenCalled());
    const call = EditGAevatarInnerMock.mock.calls[0]?.[0] as any;
    expect(call?.agentTypeList).toEqual(["B"]);
  });

  it("handles getAllAgentsConfiguration error", async () => {
    const { getAllAgentsConfigurationMock, toastMock } = await getMocks();
    getAllAgentsConfigurationMock.mockRejectedValue(new Error("fail"));
    render(<EditGAevatar onBack={vi.fn()} />);
    await waitFor(() => expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "error" })
    ));
  });

  it("calls onBack and onSuccess", async () => {
    const { getAllAgentsConfigurationMock, EditGAevatarInnerMock } = await getMocks();
    getAllAgentsConfigurationMock.mockResolvedValue([
      { agentType: "A", propertyJsonSchema: "{}" },
    ]);
    const onBack = vi.fn();
    const onSuccess = vi.fn();
    render(<EditGAevatar onBack={onBack} onSuccess={onSuccess} />);
    await waitFor(() => expect(EditGAevatarInnerMock).toHaveBeenCalled());
    const call = EditGAevatarInnerMock.mock.calls[0]?.[0] as any;
    call?.onBack();
    call?.onSuccess();
    expect(onBack).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it("shows PageLoading when agentConfiguration is undefined", async () => {
    const { getAllAgentsConfigurationMock } = await getMocks();
    getAllAgentsConfigurationMock.mockReturnValue(new Promise(() => {})); // never resolves
    render(<EditGAevatar onBack={vi.fn()} />);
    expect(screen.getByTestId("page-loading")).toBeInTheDocument();
  });

  it("handles empty agent configuration", async () => {
    const { getAllAgentsConfigurationMock, EditGAevatarInnerMock } = await getMocks();
    getAllAgentsConfigurationMock.mockResolvedValue([]);
    render(<EditGAevatar onBack={vi.fn()} />);
    await waitFor(() => expect(EditGAevatarInnerMock).not.toHaveBeenCalled());
    expect(screen.getByTestId("page-loading")).toBeInTheDocument();
  });

  it("handles agentTypeList with only hidden types (edge case)", async () => {
    const { getAllAgentsConfigurationMock, useAevatarMock, EditGAevatarInnerMock } = await getMocks();
    useAevatarMock.mockReturnValue([{ hiddenGAevatarType: ["A", "B"] }]);
    getAllAgentsConfigurationMock.mockResolvedValue([
      { agentType: "A", propertyJsonSchema: "{}" },
      { agentType: "B", propertyJsonSchema: "{}" },
    ]);
    render(<EditGAevatar onBack={vi.fn()} />);
    await waitFor(() => expect(EditGAevatarInnerMock).not.toHaveBeenCalled());
    expect(screen.getByTestId("page-loading")).toBeInTheDocument();
  });
});
