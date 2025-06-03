import { render, screen, act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { aevatarAI } from "../../../utils";
import { ConfigProvider } from "../../config-provider";
import Provider, { useAevatar } from ".";
import "@testing-library/jest-dom";

// Mocking dependencies
vi.mock("../../../utils", () => ({
  aevatarAI: {
    config: {
      storageMethod: true,
    },
  },
}));
vi.mock("../../config-provider", () => ({
  ConfigProvider: {
    setConfig: vi.fn(),
  },
}));

describe("Provider", () => {
  it("should provide initial state and dispatch function via context", () => {
    const TestComponent = () => {
      const [{ theme }, { dispatch }] = useAevatar();

      return (
        <>
          <div data-testid="theme">{theme}</div>
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button
            onClick={() =>
              dispatch({ type: "SET_THEME", payload: { theme: "light" } })
            }>
            Change Theme
          </button>
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button onClick={() => dispatch({ type: "DESTROY", payload: {} })}>
            DESTROY
          </button>
        </>
      );
    };

    render(
      <Provider theme="dark">
        <TestComponent />
      </Provider>
    );

    // Check if initial theme is provided
    expect(screen.getByTestId("theme").textContent).toBe("dark");

    // Simulate a dispatch action to change the theme
    act(() => {
      screen.getByText("Change Theme").click();
    });
    console.log(screen.getByTestId("theme").textContent, "textContent====");
    waitFor(
      () => {
        // Verify that the dispatch works as expected (you can mock the dispatch function behavior for further testing)
        expect(screen.getByTestId("theme").textContent).toBe("light");
      },
      { timeout: 500 }
    );

    act(() => {
      screen.getByText("DESTROY").click();
    });
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  it("should call ConfigProvider.setConfig on mount", () => {
    render(
      <Provider theme="dark">
        <div>Test</div>
      </Provider>
    );

    // Verify that ConfigProvider.setConfig was called once when the provider mounts
    expect(ConfigProvider.setConfig).toHaveBeenCalledTimes(1);
  });
});
