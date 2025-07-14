import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ArrayField from "./ArrayField";

vi.mock("../ui", () => ({
  Button: (props: any) => <button {...props}>{props.children}</button>,
  FormLabel: (props: any) => <span {...props} />,
}));
vi.mock("../../assets/svg/add.svg?react", () => ({ default: () => <svg data-testid="add-icon" /> }));
vi.mock("../../assets/svg/delete_agent.svg?react", () => ({ default: () => <svg data-testid="delete-icon" /> }));
vi.mock("../../assets/svg/arrow_up.svg?react", () => ({ default: (props: any) => <svg data-testid="arrow-up" {...props} /> }));

describe("ArrayField", () => {
  const renderItem = vi.fn((item, idx, onItemChange, onDelete) => (
    <div data-testid={`item-${idx}`}>{item}</div>
  ));

  it("renders add button when value is empty and triggers onChange", () => {
    const onChange = vi.fn();
    render(
      <ArrayField name="arr" schema={{}} value={[]} onChange={onChange} renderItem={() => null} label="TestArr" />
    );
    expect(screen.getByText("Add item")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Add item"));
    expect(onChange).toHaveBeenCalledWith([undefined], "add");
  });

  it("renders add button when value is undefined and triggers onChange", () => {
    const onChange = vi.fn();
    render(
      <ArrayField name="arr" schema={{}} value={undefined as any} onChange={onChange} renderItem={() => null} label="TestArr" />
    );
    expect(screen.getByText("Add item")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Add item"));
    expect(onChange).toHaveBeenCalledWith([undefined], "add");
  });

  it("renders single item, add and delete buttons, triggers onChange", () => {
    const onChange = vi.fn();
    render(
      <ArrayField name="arr" schema={{}} value={["foo"]} onChange={onChange} renderItem={(item, idx) => <div data-testid={`item-${idx}`}>{item}</div>} label="TestArr" />
    );
    expect(screen.getByTestId("item-0")).toHaveTextContent("foo");
    fireEvent.click(screen.getAllByText("Add item")[0]);
    expect(onChange).toHaveBeenCalledWith(["foo", undefined], "add");
    const delBtn = screen.getAllByRole("button").find(btn => btn.innerHTML.includes("delete-icon"));
    expect(delBtn).toBeDefined();
    if (delBtn) fireEvent.click(delBtn);
    expect(onChange).toHaveBeenCalledWith([], "delete");
  });

  it("renders multiple items, supports move up/down, delete, add", () => {
    function TestWrapper() {
      const [value, setValue] = React.useState(["a", "b", "c"]);
      return (
        <ArrayField
          name="arr"
          schema={{}}
          value={value}
          onChange={setValue}
          renderItem={(item, idx, onItemChange, onDelete) => (
            <div data-testid={`item-${idx}`} key={item + idx}>{item}</div>
          )}
          label="TestArr"
        />
      );
    }
    render(<TestWrapper />);
    expect(screen.getByTestId("item-0")).toHaveTextContent("a");
    expect(screen.getByTestId("item-1")).toHaveTextContent("b");
    expect(screen.getByTestId("item-2")).toHaveTextContent("c");
    // move b up (idx=1)
    fireEvent.click(screen.getAllByTestId("arrow-up")[1]);
    expect(screen.getByTestId("item-0")).toHaveTextContent("b");
    expect(screen.getByTestId("item-1")).toHaveTextContent("a");
    expect(screen.getByTestId("item-2")).toHaveTextContent("c");
    // move a down (idx=1)
    const moveDownBtn = screen.getAllByTestId("arrow-up")[3];
    expect(moveDownBtn.disabled).toBeFalsy();
    fireEvent.click(moveDownBtn);
    expect(screen.getByTestId("item-0")).toHaveTextContent("b");
    expect(screen.getByTestId("item-1")).toHaveTextContent("c");
    expect(screen.getByTestId("item-2")).toHaveTextContent("a");
    // delete a
    const delBtn = screen.getAllByTestId("delete-icon")[2]?.parentElement;
    expect(delBtn).toBeDefined();
    if (delBtn) fireEvent.click(delBtn);
    expect(screen.getByTestId("item-0")).toHaveTextContent("b");
    expect(screen.getByTestId("item-1")).toHaveTextContent("c");
    // add item
    fireEvent.click(screen.getByText("Add item"));
    expect(screen.getAllByTestId(/item-/)).toHaveLength(3);
  });

  it("move up/down buttons disabled at edges", () => {
    render(
      <ArrayField
        name="arr"
        schema={{}}
        value={["a", "b", "c"]}
        onChange={() => {}}
        renderItem={(item, idx) => <div data-testid={`item-${idx}`}>{item}</div>}
        label="TestArr"
      />
    );
    // The first move up button should be disabled
    expect(screen.getAllByTestId("arrow-up")[0].closest("button")).toBeDisabled();
    // The last move down button should be disabled
    expect(screen.getAllByTestId("arrow-up")[5].closest("button")).toBeDisabled();
  });
}); 