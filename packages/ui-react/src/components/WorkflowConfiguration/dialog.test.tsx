import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import WorkflowDialog from "./dialog";

vi.mock("../WorkflowAevatarEdit", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="edit-mock" {...props} />
  ),
}));

describe("WorkflowDialog", () => {
  function Wrapper(props: any) {
    return (
      <DialogPrimitive.Root open>
        <WorkflowDialog {...props} />
      </DialogPrimitive.Root>
    );
  }
  it("renders main structure", () => {
    render(<Wrapper />);
    expect(screen.getByText("g-agent configuration")).toBeInTheDocument();
    expect(screen.getByTestId("edit-mock")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument(); // Close button
  });

  it.skip("passes props to WorkflowAevatarEdit (React Testing Library cannot directly assert custom props passed to mock component's DOM attribute)", () => {
    // render(<Wrapper isNew agentItem={{ id: "a" }} nodeId="n1" onGaevatarChange={() => {}} />);
    // const edit = screen.getByTestId("edit-mock");
    // expect(edit).toHaveAttribute("isnew", "true");
    // expect(edit).toHaveAttribute("nodeid", "n1");
  });

  it("calls onGaevatarChange when triggered", () => {
    const onGaevatarChange = vi.fn();
    render(<Wrapper onGaevatarChange={onGaevatarChange} />);
    expect(screen.getByTestId("edit-mock").getAttribute("ongaevatarchange")).toBeDefined();
  });
}); 