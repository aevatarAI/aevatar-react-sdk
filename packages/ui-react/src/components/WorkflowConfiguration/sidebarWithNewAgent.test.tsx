import { describe, it, expect, vi } from 'vitest';
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SidebarWithNewAgent from "./sidebarWithNewAgent";

// Mock SearchBar component
vi.mock("../ui", () => ({
  SearchBar: ({ value, onChange, placeholder, className, onDebounceChange }: any) => (
    <div data-testid="search-bar" className={className}>
      <input
        data-testid="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <button
        data-testid="debounce-button"
        onClick={() => onDebounceChange && onDebounceChange(value)}
      >
        Search
      </button>
    </div>
  ),
}));

// Mock AevatarTypeItem component
vi.mock("./aevatarTypeItem", () => ({
  default: ({ agentType, disabled, description }: any) => (
    <div data-testid={`aevatar-type-item-${agentType}`} data-disabled={disabled}>
      {description}
    </div>
  ),
}));

// Mock PanelsArrow SVG
vi.mock("../../assets/svg/panels-arrow.svg?react", () => ({
  default: ({ className }: any) => (
    <div data-testid="panels-arrow" className={className}>
      Arrow
    </div>
  ),
}));

describe("SidebarWithNewAgent", () => {
  const mockGaevatarTypeList = [
    {
      agentType: "agent1",
      fullName: "Agent One",
      description: "First agent description",
      defaultValues: {},
      propertyJsonSchema: {},
    },
    {
      agentType: "agent2",
      fullName: "Agent Two",
      description: "Second agent description",
      defaultValues: {},
      propertyJsonSchema: {},
    },
    {
      agentType: "agent3",
      fullName: "Agent Three",
      description: "Third agent description",
      defaultValues: {},
      propertyJsonSchema: {},
    },
  ];

  const defaultProps = {
    gaevatarTypeList: mockGaevatarTypeList,
    hiddenGAevatarType: [],
    disabled: false,
    onArrowClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders SidebarWithNewAgent component", () => {
    render(<SidebarWithNewAgent {...defaultProps} />);
    
    expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    expect(screen.getByTestId("panels-arrow")).toBeInTheDocument();
  });

  it("renders all agent type items when no filtering", () => {
    render(<SidebarWithNewAgent {...defaultProps} />);
    
    expect(screen.getByTestId("aevatar-type-item-agent1")).toBeInTheDocument();
    expect(screen.getByTestId("aevatar-type-item-agent2")).toBeInTheDocument();
    expect(screen.getByTestId("aevatar-type-item-agent3")).toBeInTheDocument();
  });

  it("renders search bar with correct props", () => {
    render(<SidebarWithNewAgent {...defaultProps} />);
    
    const searchInput = screen.getByTestId("search-input");
    expect(searchInput).toHaveAttribute("placeholder", "search");
    expect(searchInput).toHaveValue("");
  });

  it("filters agent type items based on search", () => {
    render(<SidebarWithNewAgent {...defaultProps} />);
    
    const searchInput = screen.getByTestId("search-input");
    const debounceButton = screen.getByTestId("debounce-button");
    
    // Type in search input
    fireEvent.change(searchInput, { target: { value: "One" } });
    
    // Trigger debounce change
    fireEvent.click(debounceButton);
    
    // Should only show agent1
    expect(screen.getByTestId("aevatar-type-item-agent1")).toBeInTheDocument();
    expect(screen.queryByTestId("aevatar-type-item-agent2")).not.toBeInTheDocument();
    expect(screen.queryByTestId("aevatar-type-item-agent3")).not.toBeInTheDocument();
  });

  it("filters by description case-insensitive", () => {
    render(<SidebarWithNewAgent {...defaultProps} />);
    
    const searchInput = screen.getByTestId("search-input");
    const debounceButton = screen.getByTestId("debounce-button");
    
    // Search with uppercase
    fireEvent.change(searchInput, { target: { value: "SECOND" } });
    fireEvent.click(debounceButton);
    
    // Should only show agent2
    expect(screen.queryByTestId("aevatar-type-item-agent1")).not.toBeInTheDocument();
    expect(screen.getByTestId("aevatar-type-item-agent2")).toBeInTheDocument();
    expect(screen.queryByTestId("aevatar-type-item-agent3")).not.toBeInTheDocument();
  });

  it("filters by fullName case-insensitive", () => {
    render(<SidebarWithNewAgent {...defaultProps} />);
    
    const searchInput = screen.getByTestId("search-input");
    const debounceButton = screen.getByTestId("debounce-button");
    
    // Search by fullName
    fireEvent.change(searchInput, { target: { value: "three" } });
    fireEvent.click(debounceButton);
    
    // Should only show agent3
    expect(screen.queryByTestId("aevatar-type-item-agent1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("aevatar-type-item-agent2")).not.toBeInTheDocument();
    expect(screen.getByTestId("aevatar-type-item-agent3")).toBeInTheDocument();
  });

  it("hides agent type items when in hiddenGAevatarType", () => {
    const propsWithHidden = {
      ...defaultProps,
      hiddenGAevatarType: ["agent2"],
    };
    
    render(<SidebarWithNewAgent {...propsWithHidden} />);
    
    expect(screen.getByTestId("aevatar-type-item-agent1")).toBeInTheDocument();
    expect(screen.queryByTestId("aevatar-type-item-agent2")).not.toBeInTheDocument();
    expect(screen.getByTestId("aevatar-type-item-agent3")).toBeInTheDocument();
  });

  it("passes disabled prop to agent type items", () => {
    const propsWithDisabled = {
      ...defaultProps,
      disabled: true,
    };
    
    render(<SidebarWithNewAgent {...propsWithDisabled} />);
    
    const agent1Item = screen.getByTestId("aevatar-type-item-agent1");
    const agent2Item = screen.getByTestId("aevatar-type-item-agent2");
    const agent3Item = screen.getByTestId("aevatar-type-item-agent3");
    
    expect(agent1Item).toHaveAttribute("data-disabled", "true");
    expect(agent2Item).toHaveAttribute("data-disabled", "true");
    expect(agent3Item).toHaveAttribute("data-disabled", "true");
  });

  it("calls onArrowClick when arrow is clicked", () => {
    const onArrowClick = vi.fn();
    const propsWithArrowClick = {
      ...defaultProps,
      onArrowClick,
    };
    
    render(<SidebarWithNewAgent {...propsWithArrowClick} />);
    
    const arrowButton = screen.getByTestId("panels-arrow").closest("div");
    fireEvent.click(arrowButton!);
    
    expect(onArrowClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onArrowClick when not provided", () => {
    const propsWithoutArrowClick = {
      ...defaultProps,
      onArrowClick: undefined,
    };
    
    render(<SidebarWithNewAgent {...propsWithoutArrowClick} />);
    
    const arrowButton = screen.getByTestId("panels-arrow").closest("div");
    fireEvent.click(arrowButton!);
    
    // Should not throw error
    expect(arrowButton).toBeInTheDocument();
  });

  it("renders with empty gaevatarTypeList", () => {
    const propsWithEmptyList = {
      ...defaultProps,
      gaevatarTypeList: [],
    };
    
    render(<SidebarWithNewAgent {...propsWithEmptyList} />);
    
    expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    expect(screen.getByTestId("panels-arrow")).toBeInTheDocument();
    expect(screen.queryByTestId("aevatar-type-item-agent1")).not.toBeInTheDocument();
  });

  it("renders with undefined gaevatarTypeList", () => {
    const propsWithUndefinedList = {
      ...defaultProps,
      gaevatarTypeList: undefined,
    };
    
    render(<SidebarWithNewAgent {...propsWithUndefinedList} />);
    
    expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    expect(screen.getByTestId("panels-arrow")).toBeInTheDocument();
    expect(screen.queryByTestId("aevatar-type-item-agent1")).not.toBeInTheDocument();
  });

  it("handles search with empty string", () => {
    render(<SidebarWithNewAgent {...defaultProps} />);
    
    const searchInput = screen.getByTestId("search-input");
    const debounceButton = screen.getByTestId("debounce-button");
    
    // Search with empty string
    fireEvent.change(searchInput, { target: { value: "" } });
    fireEvent.click(debounceButton);
    
    // Should show all agents
    expect(screen.getByTestId("aevatar-type-item-agent1")).toBeInTheDocument();
    expect(screen.getByTestId("aevatar-type-item-agent2")).toBeInTheDocument();
    expect(screen.getByTestId("aevatar-type-item-agent3")).toBeInTheDocument();
  });

  it("handles search with no matches", () => {
    render(<SidebarWithNewAgent {...defaultProps} />);
    
    const searchInput = screen.getByTestId("search-input");
    const debounceButton = screen.getByTestId("debounce-button");
    
    // Search with no matches
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });
    fireEvent.click(debounceButton);
    
    // Should show no agents
    expect(screen.queryByTestId("aevatar-type-item-agent1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("aevatar-type-item-agent2")).not.toBeInTheDocument();
    expect(screen.queryByTestId("aevatar-type-item-agent3")).not.toBeInTheDocument();
  });

  it("handles agent with missing description", () => {
    const mockListWithMissingDescription = [
      {
        agentType: "agent4",
        fullName: "Agent Four",
        description: undefined,
        defaultValues: {},
        propertyJsonSchema: {},
      },
    ];
    
    const propsWithMissingDescription = {
      ...defaultProps,
      gaevatarTypeList: mockListWithMissingDescription,
    };
    
    render(<SidebarWithNewAgent {...propsWithMissingDescription} />);
    
    expect(screen.getByTestId("aevatar-type-item-agent4")).toBeInTheDocument();
    expect(screen.getByTestId("aevatar-type-item-agent4")).toHaveTextContent("Agent Four");
  });

  it("handles agent with missing fullName", () => {
    const mockListWithMissingFullName = [
      {
        agentType: "agent5",
        fullName: undefined,
        description: "Agent Five Description",
        defaultValues: {},
        propertyJsonSchema: {},
      },
    ];
    
    const propsWithMissingFullName = {
      ...defaultProps,
      gaevatarTypeList: mockListWithMissingFullName,
    };
    
    render(<SidebarWithNewAgent {...propsWithMissingFullName} />);
    
    expect(screen.getByTestId("aevatar-type-item-agent5")).toBeInTheDocument();
    expect(screen.getByTestId("aevatar-type-item-agent5")).toHaveTextContent("Agent Five Description");
  });

  it("handles empty hiddenGAevatarType array", () => {
    const propsWithEmptyHidden = {
      ...defaultProps,
      hiddenGAevatarType: [],
    };
    
    render(<SidebarWithNewAgent {...propsWithEmptyHidden} />);
    
    expect(screen.getByTestId("aevatar-type-item-agent1")).toBeInTheDocument();
    expect(screen.getByTestId("aevatar-type-item-agent2")).toBeInTheDocument();
    expect(screen.getByTestId("aevatar-type-item-agent3")).toBeInTheDocument();
  });

  it("handles undefined hiddenGAevatarType", () => {
    const propsWithUndefinedHidden = {
      ...defaultProps,
      hiddenGAevatarType: undefined,
    };
    
    render(<SidebarWithNewAgent {...propsWithUndefinedHidden} />);
    
    expect(screen.getByTestId("aevatar-type-item-agent1")).toBeInTheDocument();
    expect(screen.getByTestId("aevatar-type-item-agent2")).toBeInTheDocument();
    expect(screen.getByTestId("aevatar-type-item-agent3")).toBeInTheDocument();
  });
}); 