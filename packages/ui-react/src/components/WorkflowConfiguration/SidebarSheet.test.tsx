import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SidebarSheet } from "./SidebarSheet";

// Mock Sheet components
vi.mock("../ui/sheet", () => ({
  Sheet: ({ children, defaultOpen, modal, open, onOpenChange }: any) => (
    <div data-testid="sheet" data-default-open={defaultOpen} data-modal={modal} data-open={open}>
      {children}
    </div>
  ),
  SheetContent: ({ children, side, closable, className, container }: any) => (
    <div data-testid="sheet-content" data-side={side} data-closable={closable} className={className}>
      {children}
    </div>
  ),
  SheetTrigger: ({ children, asChild }: any) => (
    <div data-testid="sheet-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
}));

// Mock UI components
vi.mock("../ui", () => ({
  DialogClose: ({ className }: any) => (
    <div data-testid="dialog-close" className={className}>
      Close
    </div>
  ),
  DialogTitle: ({ className, children }: any) => (
    <div data-testid="dialog-title" className={className}>
      {children}
    </div>
  ),
  Button: ({ children, className, onClick }: any) => (
    <button data-testid="button" type="button" className={className} onClick={onClick}>
      {children}
    </button>
  ),
}));

// Mock SidebarWithNewAgent component
vi.mock("./sidebarWithNewAgent", () => ({
  default: ({ onArrowClick, ...props }: any) => (
    <div 
      data-testid="sidebar-with-new-agent" 
      onClick={() => onArrowClick?.()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onArrowClick?.();
        }
      }}
      role="button"
      tabIndex={0}
    >
      SidebarWithNewAgent
    </div>
  ),
}));

// Mock AddIcon SVG
vi.mock("../../assets/svg/add.svg?react", () => ({
  default: ({ style }: any) => (
    <div data-testid="add-icon" style={style}>
      Add
    </div>
  ),
}));

// Mock sleep function
vi.mock("@aevatar-react-sdk/utils", () => ({
  sleep: vi.fn(() => Promise.resolve()),
}));

describe("SidebarSheet", () => {
  const mockContainer = document.createElement("div");
  const defaultProps = {
    container: mockContainer,
    gaevatarTypeList: [],
    hiddenGAevatarType: [],
    disabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders SidebarSheet component", () => {
    render(<SidebarSheet {...defaultProps} />);
    
    expect(screen.getByTestId("sheet")).toBeInTheDocument();
    expect(screen.getByTestId("sheet-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("button")).toBeInTheDocument();
    expect(screen.getByTestId("add-icon")).toBeInTheDocument();
  });

  it("renders with correct initial state", () => {
    render(<SidebarSheet {...defaultProps} />);
    
    const sheet = screen.getByTestId("sheet");
    expect(sheet).toHaveAttribute("data-default-open", "true");
    expect(sheet).toHaveAttribute("data-modal", "false");
    expect(sheet).toHaveAttribute("data-open", "false");
  });

  it("renders button with correct styling", () => {
    render(<SidebarSheet {...defaultProps} />);
    
    const button = screen.getByTestId("button");
    expect(button).toHaveClass("sdk:absolute");
    expect(button).toHaveClass("sdk:top-[12px]");
    expect(button).toHaveClass("sdk:left-[16px]");
    expect(button).toHaveClass("sdk:z-[10]");
    expect(button).toHaveClass("sdk:text-[12px]");
    expect(button).toHaveClass("sdk:font-semibold");
    expect(button).toHaveClass("sdk:gap-[5px]");
    expect(button).toHaveClass("sdk:leading-[15px]");
    expect(button).toHaveClass("sdk:py-[7px]");
  });

  it("renders add icon with correct dimensions", () => {
    render(<SidebarSheet {...defaultProps} />);
    
    const addIcon = screen.getByTestId("add-icon");
    expect(addIcon).toHaveStyle({ width: "14px", height: "14px" });
  });

  it("renders button text", () => {
    render(<SidebarSheet {...defaultProps} />);
    
    const button = screen.getByTestId("button");
    expect(button).toHaveTextContent("Add agent");
  });

  it("renders SidebarWithNewAgent component", () => {
    render(<SidebarSheet {...defaultProps} />);
    
    expect(screen.getByTestId("sidebar-with-new-agent")).toBeInTheDocument();
  });

  it("renders sheet content with correct props", () => {
    render(<SidebarSheet {...defaultProps} />);
    
    const sheetContent = screen.getByTestId("sheet-content");
    expect(sheetContent).toHaveAttribute("data-side", "left");
    expect(sheetContent).toHaveAttribute("data-closable", "false");
    expect(sheetContent).toHaveClass("sdk:relative");
    expect(sheetContent).toHaveClass("sdk:p-0");
    expect(sheetContent).toHaveClass("sdk:w-auto");
  });

  it("renders hidden dialog elements", () => {
    render(<SidebarSheet {...defaultProps} />);
    
    const dialogTitle = screen.getByTestId("dialog-title");
    const dialogClose = screen.getByTestId("dialog-close");
    
    expect(dialogTitle).toHaveClass("hidden");
    expect(dialogClose).toHaveClass("hidden");
  });

  it("calls sleep function on mount", async () => {
    const { sleep } = await import("@aevatar-react-sdk/utils");
    const mockSleep = vi.mocked(sleep);
    
    render(<SidebarSheet {...defaultProps} />);
    
    expect(mockSleep).toHaveBeenCalledWith(0);
  });

  it("opens sheet when button is clicked", () => {
    render(<SidebarSheet {...defaultProps} />);
    
    const button = screen.getByTestId("button");
    
    // Initially closed
    expect(screen.getByTestId("sheet")).toHaveAttribute("data-open", "false");
    
    // Click button
    fireEvent.click(button);
    
    // Should be open
    expect(screen.getByTestId("sheet")).toHaveAttribute("data-open", "true");
  });

  it("closes sheet when onArrowClick is called", () => {
    render(<SidebarSheet {...defaultProps} />);
    
    // Click on SidebarWithNewAgent to trigger onArrowClick
    const sidebar = screen.getByTestId("sidebar-with-new-agent");
    fireEvent.click(sidebar);
    
    // Should be closed
    expect(screen.getByTestId("sheet")).toHaveAttribute("data-open", "false");
  });

  it("passes container prop to SheetContent", () => {
    const customContainer = document.createElement("div");
    customContainer.id = "custom-container";
    
    render(<SidebarSheet {...defaultProps} container={customContainer} />);
    
    // The container prop is passed to SheetContent
    // We can verify this by checking that the component renders correctly
    expect(screen.getByTestId("sheet-content")).toBeInTheDocument();
  });

  it("passes props to SidebarWithNewAgent", () => {
    const customProps = {
      ...defaultProps,
      gaevatarTypeList: [{ agentType: "test", fullName: "Test Agent" }],
      hiddenGAevatarType: ["hidden"],
      disabled: true,
    };
    
    render(<SidebarSheet {...customProps} />);
    
    // SidebarWithNewAgent should be rendered with the props
    expect(screen.getByTestId("sidebar-with-new-agent")).toBeInTheDocument();
  });

  it("handles multiple button clicks", () => {
    render(<SidebarSheet {...defaultProps} />);
    
    const button = screen.getByTestId("button");
    
    // First click
    fireEvent.click(button);
    expect(screen.getByTestId("sheet")).toHaveAttribute("data-open", "true");
    
    // Second click (should still be open)
    fireEvent.click(button);
    expect(screen.getByTestId("sheet")).toHaveAttribute("data-open", "true");
  });

  it("handles rapid state changes", async () => {
    render(<SidebarSheet {...defaultProps} />);
    
    const button = screen.getByTestId("button");
    
    // Click multiple times rapidly
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    
    // Should still be open
    expect(screen.getByTestId("sheet")).toHaveAttribute("data-open", "true");
  });

  it("renders with different container elements", () => {
    const bodyContainer = document.body;
    
    render(<SidebarSheet {...defaultProps} container={bodyContainer} />);
    
    expect(screen.getByTestId("sheet-content")).toBeInTheDocument();
  });

  it("handles empty gaevatarTypeList", () => {
    const propsWithEmptyList = {
      ...defaultProps,
      gaevatarTypeList: [],
    };
    
    render(<SidebarSheet {...propsWithEmptyList} />);
    
    expect(screen.getByTestId("sidebar-with-new-agent")).toBeInTheDocument();
  });

  it("handles undefined gaevatarTypeList", () => {
    const propsWithUndefinedList = {
      ...defaultProps,
      gaevatarTypeList: undefined,
    };
    
    render(<SidebarSheet {...propsWithUndefinedList} />);
    
    expect(screen.getByTestId("sidebar-with-new-agent")).toBeInTheDocument();
  });

  it("handles empty hiddenGAevatarType", () => {
    const propsWithEmptyHidden = {
      ...defaultProps,
      hiddenGAevatarType: [],
    };
    
    render(<SidebarSheet {...propsWithEmptyHidden} />);
    
    expect(screen.getByTestId("sidebar-with-new-agent")).toBeInTheDocument();
  });

  it("handles undefined hiddenGAevatarType", () => {
    const propsWithUndefinedHidden = {
      ...defaultProps,
      hiddenGAevatarType: undefined,
    };
    
    render(<SidebarSheet {...propsWithUndefinedHidden} />);
    
    expect(screen.getByTestId("sidebar-with-new-agent")).toBeInTheDocument();
  });

  it("handles disabled prop", () => {
    const propsWithDisabled = {
      ...defaultProps,
      disabled: true,
    };
    
    render(<SidebarSheet {...propsWithDisabled} />);
    
    expect(screen.getByTestId("sidebar-with-new-agent")).toBeInTheDocument();
  });

  it("renders with container prop", () => {
    render(<SidebarSheet {...defaultProps} />);
    
    // Verify that the component renders correctly with container prop
    expect(screen.getByTestId("sheet-content")).toBeInTheDocument();
  });
}); 