import { useEffect, useState } from "react";
import WorkflowListInner from "../WorkflowListInner";
import { type IWorkflow, WorkflowStatus } from "../WorkflowListInner/columns";
import { sleep } from "@aevatar-react-sdk/utils";

export interface IWorkflowListProps {
  className?: string;
}

export default function WorkflowList({ className }: IWorkflowListProps) {
  const [workflows, setWorkflows] = useState<IWorkflow[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    sleep(2000)
      .then(() =>
        setWorkflows([
          {
            name: "Workflow 1",
            created: "2021-01-01",
            createdBy: "John Doe",
            lastUpdated: "2021-01-01",
            lastRan: "2021-01-01",
            status: WorkflowStatus.success,
          },
          {
            name: "Workflow 2",
            created: "2021-01-01",
            createdBy: "John Doe",
            lastUpdated: "2021-01-01",
            lastRan: "2021-01-01",
            status: WorkflowStatus.running,
          },
          {
            name: "Workflow 3",
            created: "2021-01-01",
            createdBy: "John Doe",
            lastUpdated: "2021-01-01",
            lastRan: "2021-01-01",
            status: WorkflowStatus.failed,
          },
          {
            name: "Workflow 4",
            created: "2021-01-01",
            createdBy: "John Doe",
            lastUpdated: "2021-01-01",
            lastRan: "2021-01-01",
            status: WorkflowStatus.pending,
          },
        ])
      )
      .finally(() => setLoading(false));
  }, []);

  const onNewWorkflow = () => {
    console.log("new workflow");
  };

  const onEditWorkflow = (workflow: IWorkflow) => {
    console.log(workflow);
  };

  const onDeleteWorkflow = (workflow: IWorkflow) => {
    console.log(workflow);
  };

  return (
    <WorkflowListInner
      className={className}
      loading={loading}
      workflowsList={workflows}
      onNewWorkflow={onNewWorkflow}
      onEditWorkflow={onEditWorkflow}
      onDeleteWorkflow={onDeleteWorkflow}
    />
  );
}
