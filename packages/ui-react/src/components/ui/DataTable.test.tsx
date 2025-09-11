import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DataTable from "./DataTable";
import { ColumnDef } from "@tanstack/react-table";

// Mock CardLoading component
vi.mock("../CardLoading", () => ({
  default: () => <div data-testid="card-loading">Loading...</div>,
}));

// Mock table components
vi.mock("./table", () => ({
  Table: ({ children, className }: any) => (
    <table data-testid="table" className={className}>
      {children}
    </table>
  ),
  TableHeader: ({ children }: any) => (
    <thead data-testid="table-header">{children}</thead>
  ),
  TableBody: ({ children, className }: any) => (
    <tbody data-testid="table-body" className={className}>
      {children}
    </tbody>
  ),
  TableRow: ({ children, className, key, "data-state": dataState }: any) => (
    <tr data-testid="table-row" className={className} key={key} data-state={dataState}>
      {children}
    </tr>
  ),
  TableHead: ({ children, className, key }: any) => (
    <th data-testid="table-head" className={className} key={key}>
      {children}
    </th>
  ),
  TableCell: ({ children, className, colSpan, key }: any) => (
    <td data-testid="table-cell" className={className} colSpan={colSpan} key={key}>
      {children}
    </td>
  ),
}));

// Mock @tanstack/react-table
vi.mock("@tanstack/react-table", () => ({
  flexRender: (component: any, context: any) => {
    if (typeof component === 'function') {
      return component(context);
    }
    return component;
  },
  getCoreRowModel: () => vi.fn(),
  useReactTable: (config: any) => {
    const columns = config.columns || [];
    const data = config.data || [];
    
    return {
      getHeaderGroups: () => [
        {
          id: "header-group-1",
          headers: columns.map((col: any, index: number) => ({
            id: `header-${index}`,
            isPlaceholder: false,
            column: {
              columnDef: {
                header: col.header,
              },
            },
            getContext: () => ({}),
          })),
        },
      ],
      getRowModel: () => ({
        rows: data.map((item: any, index: number) => ({
          id: `row-${index}`,
          getIsSelected: () => false,
          getVisibleCells: () => columns.map((col: any, colIndex: number) => ({
            id: `cell-${index}-${colIndex}`,
            column: {
              columnDef: {
                cell: (props: any) => props.getValue(),
              },
            },
            getContext: () => ({ getValue: () => item[col.accessorKey] }),
          })),
        })),
      }),
    };
  },
}));

describe("DataTable Component", () => {
  const mockColumns: ColumnDef<any, any>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "age",
      header: "Age",
    },
  ];

  const mockData = [
    { name: "John", age: 25 },
    { name: "Jane", age: 30 },
  ];

  it("should render with basic props", () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
      />
    );

    expect(screen.getByTestId("table")).toBeInTheDocument();
    expect(screen.getByTestId("table-header")).toBeInTheDocument();
    expect(screen.getByTestId("table-body")).toBeInTheDocument();
  });

  it("should render table headers", () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
      />
    );

    const tableHeads = screen.getAllByTestId("table-head");
    expect(tableHeads).toHaveLength(2);
    expect(tableHeads[0]).toHaveTextContent("Name");
    expect(tableHeads[1]).toHaveTextContent("Age");
  });

  it("should render table rows with data", () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
      />
    );

    const tableRows = screen.getAllByTestId("table-row");
    // 1 header row + 2 data rows
    expect(tableRows).toHaveLength(3);
  });

  it("should render loading state", () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        loading={true}
      />
    );

    expect(screen.getByTestId("card-loading")).toBeInTheDocument();
    expect(screen.getByTestId("table-body")).toHaveClass("sdk:h-[394px]");
  });

  it("should render empty state with default message", () => {
    render(
      <DataTable
        columns={mockColumns}
        data={[]}
      />
    );

    const tableCells = screen.getAllByTestId("table-cell");
    const emptyCell = tableCells.find(cell => cell.textContent === "No results.");
    expect(emptyCell).toBeInTheDocument();
    expect(emptyCell).toHaveAttribute("colSpan", "2");
  });

  it("should render empty state with custom empty node", () => {
    const customEmptyNode = <div data-testid="custom-empty">Custom empty message</div>;
    
    render(
      <DataTable
        columns={mockColumns}
        data={[]}
        emptyNode={customEmptyNode}
      />
    );

    expect(screen.getByTestId("custom-empty")).toBeInTheDocument();
    expect(screen.getByText("Custom empty message")).toBeInTheDocument();
  });

  it("should apply custom className to table", () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        className="custom-table-class"
      />
    );

    expect(screen.getByTestId("table")).toHaveClass("custom-table-class");
  });

  it("should apply custom tableHeadClassName", () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        tableHeadClassName="custom-head-class"
      />
    );

    const tableHeads = screen.getAllByTestId("table-head");
    tableHeads.forEach(head => {
      expect(head).toHaveClass("custom-head-class");
    });
  });

  it("should handle empty data array", () => {
    render(
      <DataTable
        columns={mockColumns}
        data={[]}
      />
    );

    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("should handle undefined data", () => {
    render(
      <DataTable
        columns={mockColumns}
        data={undefined as any}
      />
    );

    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("should render with single column", () => {
    const singleColumn: ColumnDef<any, any>[] = [
      {
        accessorKey: "name",
        header: "Name",
      },
    ];

    render(
      <DataTable
        columns={singleColumn}
        data={[{ name: "John" }]}
      />
    );

    const tableHeads = screen.getAllByTestId("table-head");
    expect(tableHeads).toHaveLength(1);
    expect(tableHeads[0]).toHaveTextContent("Name");
  });

  it("should render with no columns", () => {
    render(
      <DataTable
        columns={[]}
        data={mockData}
      />
    );

    const tableHeads = screen.queryAllByTestId("table-head");
    expect(tableHeads).toHaveLength(0);
  });
});
