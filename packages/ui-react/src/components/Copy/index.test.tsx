import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Copy from "./index";

// Mock useToast hook
const mockToast = vi.fn();
vi.mock("../../hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock react-use
const mockSetCopied = vi.fn();
vi.mock("react-use", () => ({
  useCopyToClipboard: () => [vi.fn(), mockSetCopied],
}));

// Mock TickIcon
vi.mock("../../assets/svg/tick.svg?react", () => ({
  default: () => <div data-testid="tick-icon">✓</div>,
}));

describe("Copy Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with children", () => {
    render(
      <Copy toCopy="test-text" description="Test description">
        <span>Copy me</span>
      </Copy>
    );

    expect(screen.getByText("Copy me")).toBeInTheDocument();
    expect(screen.getByTestId("copy-span")).toBeInTheDocument();
  });

  it("should render with icon", () => {
    render(
      <Copy
        toCopy="test-text"
        description="Test description"
        icon={<span data-testid="custom-icon">📋</span>}
      />
    );

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("should handle click event", async () => {
    render(
      <Copy toCopy="test-text" description="Test description">
        <span>Copy me</span>
      </Copy>
    );

    const copySpan = screen.getByTestId("copy-span");
    fireEvent.click(copySpan);

    expect(mockToast).toHaveBeenCalledWith({ description: "Test description" });
    expect(mockSetCopied).toHaveBeenCalledWith("test-text");
  });

  it("should handle keyboard events", async () => {
    render(
      <Copy toCopy="test-text" description="Test description">
        <span>Copy me</span>
      </Copy>
    );

    const copySpan = screen.getByTestId("copy-span");
    
    // Test Enter key
    fireEvent.keyDown(copySpan, { key: "Enter" });
    expect(mockToast).toHaveBeenCalledWith({ description: "Test description" });
    expect(mockSetCopied).toHaveBeenCalledWith("test-text");

    // Test Space key
    fireEvent.keyDown(copySpan, { key: " " });
    expect(mockToast).toHaveBeenCalledTimes(2);
    expect(mockSetCopied).toHaveBeenCalledTimes(2);
  });

  it("should not handle other keyboard events", () => {
    render(
      <Copy toCopy="test-text" description="Test description">
        <span>Copy me</span>
      </Copy>
    );

    const copySpan = screen.getByTestId("copy-span");
    
    // Test other key
    fireEvent.keyDown(copySpan, { key: "Escape" });
    expect(mockToast).not.toHaveBeenCalled();
    expect(mockSetCopied).not.toHaveBeenCalled();
  });

  it("should show tick icon when clicked", async () => {
    render(
      <Copy toCopy="test-text" description="Test description">
        <span>Copy me</span>
      </Copy>
    );

    const copySpan = screen.getByTestId("copy-span");
    fireEvent.click(copySpan);

    await waitFor(() => {
      expect(screen.getByTestId("tick-icon")).toBeInTheDocument();
    });
  });

  it("should apply custom className", () => {
    render(
      <Copy
        toCopy="test-text"
        description="Test description"
        className="custom-class"
      >
        <span>Copy me</span>
      </Copy>
    );

    const copySpan = screen.getByTestId("copy-span");
    expect(copySpan).toHaveClass("custom-class");
  });

  it("should apply icon className", () => {
    render(
      <Copy
        toCopy="test-text"
        description="Test description"
        icon={<span>📋</span>}
        iconClassName="icon-class"
      >
        <span>Copy me</span>
      </Copy>
    );

    const iconSpan = screen.getByText("📋");
    expect(iconSpan.parentElement).toHaveClass("icon-class");
  });

  it("should work without description", () => {
    render(
      <Copy toCopy="test-text">
        <span>Copy me</span>
      </Copy>
    );

    const copySpan = screen.getByTestId("copy-span");
    fireEvent.click(copySpan);

    expect(mockToast).toHaveBeenCalledWith({ description: undefined });
    expect(mockSetCopied).toHaveBeenCalledWith("test-text");
  });

  it("should work without children", () => {
    render(
      <Copy
        toCopy="test-text"
        description="Test description"
        icon={<span>📋</span>}
      />
    );

    expect(screen.getByTestId("copy-span")).toBeInTheDocument();
    expect(screen.getByText("📋")).toBeInTheDocument();
  });
});
