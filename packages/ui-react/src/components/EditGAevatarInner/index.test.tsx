import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EditGAevatarInner from "../EditGAevatarInner";
import { sleep } from "@aevatar-react-sdk/utils";
// biome-ignore lint/style/useImportType: <explanation>
import React from "react";
import { aevatarAI } from "../../utils";
import { useToast } from "../../hooks/use-toast";
import "@testing-library/jest-dom";

vi.mock("../../utils", () => ({
  aevatarAI: {
    services: {
      agent: {
        deleteAgent: vi.fn(),
      },
    },
  },
}));

vi.mock("../../hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

vi.mock("react-hook-form", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useForm: vi.fn().mockReturnValue({
      handleSubmit: (fn: any) => fn,
      control: {},
      setValue: vi.fn(),
      getValues: vi.fn(),
      setError: vi.fn(),
      reset: vi.fn(),
    }),
    // Mock FormProvider to avoid errors in the test
    FormProvider: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    useFormContext: vi.fn().mockReturnValue({
      getFieldState: vi.fn(),
      formState: {
        isDirty: false,
        isSubmitting: false,
        isValid: true,
      },
    }),
    Controller: ({ render }: any) => render({ value: "", onChange: vi.fn() }), // mock Controller for testing
  };
});

vi.mock("@aevatar-react-sdk/utils", () => ({
  sleep: vi.fn().mockResolvedValue(undefined),
}));

describe("EditGAevatarInner", () => {
  const mockOnBack = vi.fn();
  const mockOnGagentChange = vi.fn();
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useToast).mockReturnValue({
      toast: mockToast,
      dismiss: vi.fn(),
      toasts: [],
    });
  });

  const configuarationParams = [
    { name: "param1", type: "System.String", value: "value1" },
    { name: "param2", type: "System.Int32", value: "10" },
  ];
  const defaultProps = {
    agentTypeList: ["AI Basic", "Telegram", "Twitter"],
    agentName: "Test Agent",
    agentId: "test-agent-id",
    onBack: mockOnBack,
    onGagentChange: mockOnGagentChange,
    configuarationParams,
  };

  it("should render the form and initial elements correctly", () => {
    render(<EditGAevatarInner {...defaultProps} />);

    expect(screen.getByText("g-agents configuration")).toBeInTheDocument();
    expect(screen.getByText("create")).toBeInTheDocument();

    expect(screen.getByLabelText("*Atomic-aevatars Type")).toBeInTheDocument();
    expect(screen.getByLabelText("*atomic-aevatar name")).toBeInTheDocument();

    const saveButton = screen.getByText("create");
    expect(saveButton).toBeInTheDocument();
  });

  // it("should change the text of the button when saving", async () => {
  //   render(<EditGAevatarInner {...defaultProps} />);

  //   const saveButton = screen.getByText("create");
  //   fireEvent.click(saveButton);

  // //   await waitFor(() => {
  //     expect(screen.getByText("creating")).toBeInTheDocument();
  // //   });
  // });

  it("should call onBack when back arrow is clicked", () => {
    render(<EditGAevatarInner {...defaultProps} />);

    const backButton = screen.getByRole("img");
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  //   it("should handle form submission correctly", async () => {
  //     render(<EditGAevatarInner {...defaultProps} />);

  //     const agentNameInput = screen.getByLabelText("*atomic-aevatar name");
  //     const agentTypeSelect = screen.getByLabelText("*Atomic-aevatars Type");

  //     fireEvent.change(agentNameInput, { target: { value: "New Agent" } });
  //     fireEvent.change(agentTypeSelect, { target: { value: "Telegram" } });

  //     const saveButton = screen.getByText("create");
  //     fireEvent.click(saveButton);

  //     await waitFor(() => {
  //       expect(screen.getByText("saving")).toBeInTheDocument();
  //     });

  //   });

  // it("should call onGagentChange when agentType is changed", () => {
  //   render(<EditGAevatarInner {...defaultProps} />);

  //   const agentTypeSelect = screen.getByLabelText("*Atomic-aevatars Type");

  //   fireEvent.change(agentTypeSelect, { target: { value: "Telegram" } });

  //   expect(mockOnGagentChange).toHaveBeenCalledWith("Telegram");
  // });

  it("should handle deletion correctly", async () => {
    render(<EditGAevatarInner {...defaultProps} type="edit" />);

    const deleteButton = screen.getByText("delete");
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);
    vi.mocked(aevatarAI.services.agent.deleteAgent).mockResolvedValue();

    //   await waitFor(() => {
    //     expect(screen.getByText("deleting")).toBeInTheDocument();
    //   });
    await waitFor(() => {
      sleep(2000);
    });

    expect(aevatarAI.services.agent.deleteAgent).toHaveBeenCalled();
  });

  it("should handle deletion error", async () => {
    render(<EditGAevatarInner {...defaultProps} type="edit" />);

    const deleteButton = screen.getByText("delete");
    expect(deleteButton).toBeInTheDocument();

    vi.mocked(aevatarAI.services.agent.deleteAgent).mockRejectedValue(
      new Error("delete error")
    );

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(aevatarAI.services.agent.deleteAgent).toHaveBeenCalled();
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: "error",
      description: "delete error",
      duration: 3000,
    });
  });
});
