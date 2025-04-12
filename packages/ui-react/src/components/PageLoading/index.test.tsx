import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PageLoading from "../PageLoading";
import { useAtom } from "jotai";
import React from "react";

vi.mock("jotai", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useAtom: vi.fn(),
  };
});

describe("PageLoading", () => {
  it("should render the loading spinner when loadingAtom is true", () => {
    vi.mocked(useAtom).mockReturnValue([true, vi.fn()]);

    render(<PageLoading />);

    expect(screen.getByTestId("page-loading")).toBeInTheDocument();
    expect(screen.getByText("Scanning......")).toBeInTheDocument();
  });

  it("should not render the loading spinner when loadingAtom is false", () => {
    vi.mocked(useAtom).mockReturnValue([false, vi.fn()]);

    render(<PageLoading />);

    expect(screen.queryByTestId("page-loading")).not.toBeInTheDocument();
  });
});
