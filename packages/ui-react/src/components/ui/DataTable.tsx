import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import CardLoading from "../CardLoading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import clsx from "clsx";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className?: string;
  tableHeadClassName?: string;
  loading?: boolean;
  emptyNode?: React.ReactNode;
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  className,
  tableHeadClassName,
  loading,
  emptyNode,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full">
      <Table className={className}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="sdk:first:pl-[15px] sdk:hover:bg-transparent sdk:text-[var(--sdk-muted-foreground)]">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead className={tableHeadClassName} key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody className={clsx(loading && "sdk:h-[394px]")}>
          {loading && (
            <div className="sdk:absolute sdk:top-0 sdk:h-[394px] sdk:w-full">
              <CardLoading />
            </div>
          )}

          {!loading &&
            (table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="sdk:border-b-0">
                <TableCell
                  colSpan={columns.length}
                  className="sdk:h-[394px] sdk:text-center">
                  {emptyNode ? emptyNode : "No results."}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
