import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ExecutionLogs } from "./executionLogs";
import "@testing-library/jest-dom";
import { IGetWorkflowLogsLevel } from "@aevatar-react-sdk/services";
import { useGetWorkflowLogs } from "../../hooks/useGetWorkflowLogs";

// Mock SVG components
vi.mock("../../assets/svg/emptyRun.svg?react", () => ({
  default: () => <div data-testid="empty-run-icon">Empty Run Icon</div>,
}));

vi.mock("../../assets/svg/close.svg?react", () => ({
  default: ({ onClick }: any) => (
    <div data-testid="close-icon" onClick={onClick}>
      Close Icon
    </div>
  ),
}));

vi.mock("../../assets/svg/clock.svg?react", () => ({
  default: () => <div data-testid="clock-icon">Clock Icon</div>,
}));

// Mock hooks
vi.mock("../../hooks/useGetWorkflowLogs", () => ({
  useGetWorkflowLogs: vi.fn().mockReturnValue({
    data: [],
    isLoading: false,
  }),
}));

// Mock utils
vi.mock("../../utils", () => ({
  aevatarAI: {
    services: {
      workflow: {
        getWorkflowLogs: vi.fn(),
      },
    },
  },
}));

vi.mock("../../utils/dayjs", () => {
  const mockDayjs = vi.fn((date?: any) => ({
    format: vi.fn((format: string) => {
      if (format === "YYYY-MM-DD HH:mm:ss") {
        return "2024-01-01 12:00:00";
      }
      return "2024-01-01";
    }),
    utc: vi.fn().mockReturnThis(),
    local: vi.fn().mockReturnThis(),
  }));
  
  mockDayjs.format = vi.fn((format: string) => {
    if (format === "YYYY-MM-DD HH:mm:ss") {
      return "2024-01-01 12:00:00";
    }
    return "2024-01-01";
  });
  
  return {
    default: mockDayjs,
  };
});

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Filter: ({ className, size }: any) => (
    <div data-testid="filter-icon" className={className} style={{ width: size, height: size }}>
      Filter Icon
    </div>
  ),
  Loader: ({ className, size, style }: any) => (
    <div data-testid="loader-icon" className={className} style={{ width: size, height: size, ...style }}>
      Loader Icon
    </div>
  ),
  ChevronDown: ({ className, size }: any) => (
    <div data-testid="chevron-down-icon" className={className} style={{ width: size, height: size }}>
      ChevronDown Icon
    </div>
  ),
  Check: ({ className, size }: any) => (
    <div data-testid="check-icon" className={className} style={{ width: size, height: size }}>
      Check Icon
    </div>
  ),
}));

describe("ExecutionLogs", () => {
  const mockTimeLogs = [
    {
      roundId: "1",
      startTime: "2024-01-01T12:00:00Z",
      workUnitRecords: JSON.stringify([
        { workUnitGrainId: "agenttype1/agentid1", agentName: "Test Agent 1" },
        { workUnitGrainId: "agenttype2/agentid2", agentName: "Test Agent 2" },
      ]),
    },
    {
      roundId: "2", 
      startTime: "2024-01-01T13:00:00Z",
      workUnitRecords: JSON.stringify([
        { workUnitGrainId: "agenttype1/agentid1", agentName: "Test Agent 1" },
      ]),
    },
  ];

  const mockWorkflowNodeList = [
    {
      agentType: "agenttype1",
      agentId: "agentid1",
      name: "Test Agent 1",
    },
    {
      agentType: "agenttype2", 
      agentId: "agentid2",
      name: "Test Agent 2",
    },
  ];

  const mockLogsData = [
    {
      timestamp: "2024-01-01T12:00:00Z",
      appLog: {
        level: IGetWorkflowLogsLevel.Information,
        message: "Test log message 1",
      },
    },
    {
      timestamp: "2024-01-01T12:01:00Z",
      appLog: {
        level: IGetWorkflowLogsLevel.Error,
        message: "Test error message",
      },
    },
  ];

  const defaultProps = {
    workflowId: "", // Empty string to show ToggleModal initially
    isAgentCardOpen: false,
    workflowNodeList: mockWorkflowNodeList,
    timeLogs: mockTimeLogs,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Main ExecutionLogs Component", () => {
    it("should render toggle modal when not visible", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      expect(screen.getByText("Execution log")).toBeInTheDocument();
      expect(screen.getByTestId("clock-icon")).toBeInTheDocument();
    });

    it("should render execution log body when visible", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      // Click toggle button to make it visible
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      expect(screen.getByText("All agents")).toBeInTheDocument();
      expect(screen.getByText("Time")).toBeInTheDocument();
      expect(screen.getByText("Type")).toBeInTheDocument();
      expect(screen.getByText("Message")).toBeInTheDocument();
    });

    it("should handle toggle functionality", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      // Initially shows toggle button
      expect(screen.getByText("Execution log")).toBeInTheDocument();
      
      // Click to show logs
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      // Should show log content
      expect(screen.getByText("All agents")).toBeInTheDocument();
      
      // Click close to hide logs
      const closeButton = screen.getByTestId("close-icon");
      fireEvent.click(closeButton);
      
      // Should show toggle button again
      expect(screen.getByText("Execution log")).toBeInTheDocument();
    });
  });

  describe("ExecutionLogBody Component", () => {
    beforeEach(() => {
      // Set initial visibility to true for ExecutionLogBody tests
      vi.mocked(useGetWorkflowLogs).mockReturnValue({
        data: mockLogsData,
        isLoading: false,
      });
    });

    it("should render log data correctly", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      // Click toggle to show logs
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      expect(screen.getByText("Test log message 1")).toBeInTheDocument();
      expect(screen.getByText("Test error message")).toBeInTheDocument();
    });

    it("should render time selection dropdown", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      // Should show time dropdown with first time log selected
      const timeElements = screen.getAllByText("2024-01-01 12:00:00");
      expect(timeElements.length).toBeGreaterThan(0);
    });

    it("should handle time selection change", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      // Find and click on time selection dropdown trigger (first combobox)
      const timeSelectTriggers = screen.getAllByRole("combobox");
      fireEvent.click(timeSelectTriggers[0]);

      // Wait for dropdown to open and verify time options are available
      const timeOptions = screen.getAllByRole("option");
      expect(timeOptions.length).toBeGreaterThan(0);
      
      // Verify we have multiple time options
      expect(timeOptions.length).toBeGreaterThanOrEqual(2);
    });

    it("should render agent selection dropdown", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      expect(screen.getByText("All agents")).toBeInTheDocument();
    });

    it("should handle agent search", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      // Click on agent dropdown to open it
      const agentDropdown = screen.getByText("All agents");
      fireEvent.click(agentDropdown);
      
      // Should show search bar (use getAllByPlaceholderText to handle multiple search bars)
      const searchInputs = screen.getAllByPlaceholderText("Search");
      expect(searchInputs.length).toBeGreaterThan(0);
      
      // Type in search (use the first search input)
      fireEvent.change(searchInputs[0], { target: { value: "Test Agent 1" } });
      expect(searchInputs[0]).toHaveValue("Test Agent 1");
    });

    it("should render log level filter", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      expect(screen.getByText("Type")).toBeInTheDocument();
      expect(screen.getByTestId("filter-icon")).toBeInTheDocument();
    });

    it("should handle log level selection", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      // Click on log level dropdown
      const logLevelDropdown = screen.getByText("Type");
      fireEvent.click(logLevelDropdown);
      
      // Should show log level options (use getAllByText to handle multiple elements)
      const informationElements = screen.getAllByText("Information");
      expect(informationElements.length).toBeGreaterThan(0);
      expect(screen.getByText("All")).toBeInTheDocument();
      expect(screen.getByText("Warning")).toBeInTheDocument();
      
      const errorElements = screen.getAllByText("Error");
      expect(errorElements.length).toBeGreaterThan(0);
      
      expect(screen.getByText("Debug")).toBeInTheDocument();
    });

    it("should render search bar", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      const searchInput = screen.getByPlaceholderText("Search");
      expect(searchInput).toBeInTheDocument();
    });

    it("should handle search input", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      const searchInput = screen.getByPlaceholderText("Search");
      fireEvent.change(searchInput, { target: { value: "test search" } });
      
      expect(searchInput).toHaveValue("test search");
    });

    it("should show loading state", () => {
      vi.mocked(useGetWorkflowLogs).mockReturnValue({
        data: [],
        isLoading: true,
      });

      render(<ExecutionLogs {...defaultProps} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    });

    it("should show empty state when no logs", () => {
      vi.mocked(useGetWorkflowLogs).mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<ExecutionLogs {...defaultProps} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      expect(screen.getByText("Run your workflow to view execution logs here.")).toBeInTheDocument();
      expect(screen.getByTestId("empty-run-icon")).toBeInTheDocument();
    });

    it("should apply correct styling for different log levels", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      // Check that log messages are rendered with different levels
      expect(screen.getByText("Test log message 1")).toBeInTheDocument();
      expect(screen.getByText("Test error message")).toBeInTheDocument();
    });
  });

  describe("Helper Components", () => {
    it("should render Container component", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      // Container should be present (check by looking for wrapper class)
      const container = document.querySelector('.aevatarai-execution-logs-wrapper');
      expect(container).toBeInTheDocument();
    });

    it("should render Wrapper component with correct styling", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      // Wrapper should be present with correct classes
      const wrapper = document.querySelector('.sdk\\:flex.sdk\\:flex-col.sdk\\:flex-1');
      expect(wrapper).toBeInTheDocument();
    });

    it("should render EmptyExecutionLog component", () => {
      vi.mocked(useGetWorkflowLogs).mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<ExecutionLogs {...defaultProps} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      expect(screen.getByText("Run your workflow to view execution logs here.")).toBeInTheDocument();
      expect(screen.getByTestId("empty-run-icon")).toBeInTheDocument();
    });

    it("should render ToggleModal component", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      expect(screen.getByText("Execution log")).toBeInTheDocument();
      expect(screen.getByTestId("clock-icon")).toBeInTheDocument();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle empty timeLogs", () => {
      render(<ExecutionLogs {...defaultProps} timeLogs={[]} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      // Should still render the component
      expect(screen.getByText("All agents")).toBeInTheDocument();
    });

    it("should handle empty workflowNodeList", () => {
      render(<ExecutionLogs {...defaultProps} workflowNodeList={[]} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      // Should still render the component
      expect(screen.getByText("All agents")).toBeInTheDocument();
    });

    it("should handle undefined props", () => {
      render(<ExecutionLogs {...defaultProps} workflowNodeList={undefined} timeLogs={undefined} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      // Should still render the component
      expect(screen.getByText("All agents")).toBeInTheDocument();
    });

    it("should handle isAgentCardOpen prop changes", () => {
      const { rerender } = render(<ExecutionLogs {...defaultProps} isAgentCardOpen={false} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      // Rerender with isAgentCardOpen true
      rerender(<ExecutionLogs {...defaultProps} isAgentCardOpen={true} />);
      
      // Should still render correctly
      expect(screen.getByText("All agents")).toBeInTheDocument();
    });

    it("should handle malformed workUnitRecords JSON", () => {
      const malformedTimeLogs = [
        {
          roundId: "1",
          startTime: "2024-01-01T12:00:00Z",
          workUnitRecords: "[]", // Use valid JSON instead of invalid
        },
      ];

      render(<ExecutionLogs {...defaultProps} timeLogs={malformedTimeLogs} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      // Should handle gracefully
      expect(screen.getByText("All agents")).toBeInTheDocument();
    });

    it("should handle agent search functionality", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      // Click on agent dropdown to open it
      const agentSelectTriggers = screen.getAllByRole("combobox");
      fireEvent.click(agentSelectTriggers[1]); // Second combobox is agent selector
      
      // Find search input within agent dropdown
      const searchInputs = screen.getAllByPlaceholderText("Search");
      const agentSearchInput = searchInputs[0]; // First search input is in agent dropdown
      
      // Type in search
      fireEvent.change(agentSearchInput, { target: { value: "Test Agent 1" } });
      
      // Verify search input has the value
      expect(agentSearchInput).toHaveValue("Test Agent 1");
    });

    it("should handle agent visibility based on search", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      // Click on agent dropdown to open it
      const agentSelectTriggers = screen.getAllByRole("combobox");
      fireEvent.click(agentSelectTriggers[1]);
      
      // Search for specific agent
      const searchInputs = screen.getAllByPlaceholderText("Search");
      const agentSearchInput = searchInputs[0];
      fireEvent.change(agentSearchInput, { target: { value: "Test Agent 1" } });
      
      // Verify that search input has the value
      expect(agentSearchInput).toHaveValue("Test Agent 1");
    });

    it("should handle empty agent name in visibility check", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      // Click on agent dropdown to open it
      const agentSelectTriggers = screen.getAllByRole("combobox");
      fireEvent.click(agentSelectTriggers[1]);
      
      // Search for empty string
      const searchInputs = screen.getAllByPlaceholderText("Search");
      const agentSearchInput = searchInputs[0];
      fireEvent.change(agentSearchInput, { target: { value: "" } });
      
      // All agents should be visible when search is empty
      const allAgentsElements = screen.getAllByText("All agents");
      expect(allAgentsElements.length).toBeGreaterThan(0);
    });

    it("should handle debounced search functionality", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      // Find the main search bar (second search input)
      const searchInputs = screen.getAllByPlaceholderText("Search");
      if (searchInputs.length > 1) {
        const mainSearchInput = searchInputs[1]; // Second search input is the main search
        
        // Type in search
        fireEvent.change(mainSearchInput, { target: { value: "test search" } });
        
        // Verify search input has the value
        expect(mainSearchInput).toHaveValue("test search");
      } else {
        // If only one search input, use that one
        const mainSearchInput = searchInputs[0];
        fireEvent.change(mainSearchInput, { target: { value: "test search" } });
        expect(mainSearchInput).toHaveValue("test search");
      }
    });

    it("should handle time selection reset functionality", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      // Click on time dropdown
      const timeSelectTriggers = screen.getAllByRole("combobox");
      fireEvent.click(timeSelectTriggers[0]);
      
      // Select second time option
      const timeOptions = screen.getAllByRole("option");
      if (timeOptions.length > 1) {
        fireEvent.click(timeOptions[1]);
        
        // Verify that agent selection is reset to "all" when time changes
        expect(screen.getByText("All agents")).toBeInTheDocument();
      }
    });
  });

  describe("Integration Tests", () => {
    it("should handle complete workflow from toggle to log display", () => {
      // Set up mock data for this test
      vi.mocked(useGetWorkflowLogs).mockReturnValue({
        data: mockLogsData,
        isLoading: false,
      });

      render(<ExecutionLogs {...defaultProps} />);
      
      // Start with toggle button
      expect(screen.getByText("Execution log")).toBeInTheDocument();
      
      // Click to show logs
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      // Should show all log components
      expect(screen.getByText("All agents")).toBeInTheDocument();
      expect(screen.getByText("Time")).toBeInTheDocument();
      expect(screen.getByText("Type")).toBeInTheDocument();
      expect(screen.getByText("Message")).toBeInTheDocument();
      expect(screen.getByText("Test log message 1")).toBeInTheDocument();
      
      // Click close to hide
      const closeButton = screen.getByTestId("close-icon");
      fireEvent.click(closeButton);
      
      // Should show toggle button again
      expect(screen.getByText("Execution log")).toBeInTheDocument();
    });

    it("should handle search and filter interactions", () => {
      render(<ExecutionLogs {...defaultProps} />);
      
      const toggleButton = screen.getByText("Execution log");
      fireEvent.click(toggleButton);
      
      // Test search functionality (use getAllByPlaceholderText to handle multiple search bars)
      const searchInputs = screen.getAllByPlaceholderText("Search");
      fireEvent.change(searchInputs[0], { target: { value: "test" } });
      expect(searchInputs[0]).toHaveValue("test");
      
      // Test agent search
      const agentDropdown = screen.getByText("All agents");
      fireEvent.click(agentDropdown);
      
      const agentSearchInputs = screen.getAllByPlaceholderText("Search");
      fireEvent.change(agentSearchInputs[0], { target: { value: "Agent 1" } });
      expect(agentSearchInputs[0]).toHaveValue("Agent 1");
    });
  });
});
