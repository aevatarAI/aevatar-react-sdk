import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EditGAevatar from "../EditGAevatar";
import { useAtom } from "jotai";
import React from "react";

vi.mock("../../utils", () => ({
  aevatarAI: {
    services: {
      agent: {
        getAllAgentsConfiguration: vi.fn().mockResolvedValue([
          { agentType: "InvestmentContent", agentParams: [] },
          { agentType: "XWorkerGAgent", agentParams: [] },
        ]),
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

describe("EditGAevatar", () => {
  let setShow: any;

  beforeEach(() => {
    setShow = vi.fn();
    vi.mocked(useAtom).mockImplementation(() => [false, setShow]);
  });

  it("should render EditGAevatar component and handle loading state", async () => {
    render(<EditGAevatar onBack={vi.fn()} />);
    // expect(screen.getByTestId('page-loading')).toBeInTheDocument();

    await waitFor(() => expect(setShow).toHaveBeenCalledWith(false));

    expect(screen.getByTestId("edit-gaevatar-inner")).toBeInTheDocument();

    // expect(setShow).toHaveBeenCalledTimes(1);
  });

  //   it("should show PageLoading while fetching agent configurations", async () => {
  //     render(<EditGAevatar onBack={vi.fn()} />);

  //     expect(screen.getByText(/scanning/i)).toBeInTheDocument();
  //   });

  it("should hide PageLoading after fetching agent configurations", async () => {
    render(<EditGAevatar onBack={vi.fn()} />);

    await waitFor(() =>
      expect(screen.queryByText(/scanning/i)).not.toBeInTheDocument()
    );
  });
});
