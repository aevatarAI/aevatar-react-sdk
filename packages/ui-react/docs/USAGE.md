# @aevatar-react-sdk/ui-react Usage Guide

> React UI components for Aevatar SDK, built with Radix UI, Tailwind CSS, and Jotai.

## Introduction

This package provides reusable React UI components for building applications with the Aevatar SDK. It leverages Radix UI primitives, Tailwind CSS for styling, and Jotai for state management.

## Installation

```bash
npm install @aevatar-react-sdk/ui-react
# or
yarn add @aevatar-react-sdk/ui-react
```

## Provider Setup

Wrap your app with `AevatarProvider` to provide context for all components:

```tsx
import { AevatarProvider } from '@aevatar-react-sdk/ui-react';

function App() {
  return (
    <AevatarProvider>
      {/* your app */}
    </AevatarProvider>
  );
}
```

### Props

| Name              | Type         | Default | Description                        |
|-------------------|--------------|---------|------------------------------------|
| children          | ReactNode    | —       | React children                     |
| hiddenGAevatarType| string[]     | [see src] | Types to hide from g-agent lists   |

---

## Components

### 1. MyGAevatar

Displays a list of g-agents, supports creation and editing.

**Import:**
```tsx
import { MyGAevatar } from '@aevatar-react-sdk/ui-react';
```

**Props:**

| Name             | Type                | Default   | Description                       |
|------------------|---------------------|-----------|-----------------------------------|
| height           | number \| string    | "100vh"   | Container height                  |
| width            | number \| string    | —         | Container width                   |
| className        | string              | —         | Custom className                  |
| maxGAevatarCount | number              | —         | Max number of g-agents            |
| onNewGAevatar    | () => void          | —         | Callback for creating new g-agent |
| onEditGaevatar   | (id: string) => void| required  | Callback for editing g-agent      |

**Example:**
```tsx
<MyGAevatar
  onNewGAevatar={() => { /* open create dialog */ }}
  onEditGaevatar={id => { /* open edit dialog for id */ }}
/>
```

---

### 2. EditGAevatar / CreateGAevatar

Form for editing or creating a g-agent. `CreateGAevatar` is an alias for `EditGAevatar`.

**Import:**
```tsx
import { EditGAevatar, CreateGAevatar } from '@aevatar-react-sdk/ui-react';
```

**Props:**

| Name      | Type         | Default | Description                  |
|-----------|--------------|---------|------------------------------|
| className | string       | —       | Custom className             |
| onBack    | () => void   | —       | Callback for back action     |
| onSuccess | () => void   | —       | Callback after success       |

**Example:**
```tsx
<EditGAevatar
  onBack={() => { /* go back */ }}
  onSuccess={() => { /* refresh list */ }}
/>
```

---

### 3. EditGAevatarInner

Low-level form component for g-agent editing/creation, used internally.

**Import:**
```tsx
import { EditGAevatarInner } from '@aevatar-react-sdk/ui-react';
```

**Props:**  
See source code for advanced usage and customization.

---

### 4. Workflow

Visual editor for workflow configuration.

**Import:**
```tsx
import { Workflow } from '@aevatar-react-sdk/ui-react';
```

**Props:**

| Name           | Type        | Description                                 |
|----------------|-------------|---------------------------------------------|
| gaevatarList   | IAgentInfoDetail[] | List of g-agents for workflow         |
| editWorkflow   | { workflowAgentId, workflowName, workUnitRelations } | Workflow data for editing |
| onCardClick    | (data, isNew, nodeId) => void | Card click handler         |
| onNodesChanged | (nodes) => void | Callback when nodes change                |

**Example:**
```tsx
<Workflow
  gaevatarList={agents}
  editWorkflow={workflowData}
  onCardClick={(data, isNew, nodeId) => { /* open agent dialog */ }}
  onNodesChanged={nodes => { /* sync nodes */ }}
/>
```

---

### 5. WorkflowConfiguration

Full-featured workflow configuration page, includes sidebar, workflow editor, dialogs.

**Import:**
```tsx
import WorkflowConfiguration from '@aevatar-react-sdk/ui-react';
```

**Props:**

| Name           | Type        | Description                                 |
|----------------|-------------|---------------------------------------------|
| sidebarConfig  | { gaevatarList, gaevatarTypeList, isNewGAevatar } | Sidebar data |
| editWorkflow   | { workflowAgentId, workflowName, workUnitRelations } | Workflow data for editing |
| onBack         | () => void  | Callback for back action                    |
| onSave         | (workflowAgentId: string) => void | Callback after save      |
| onGaevatarChange | (data, isNew, nodeId) => Promise | Handler for agent change |

**Example:**
```tsx
<WorkflowConfiguration
  sidebarConfig={{ gaevatarList, gaevatarTypeList }}
  editWorkflow={workflowData}
  onBack={() => { /* go back */ }}
  onSave={id => { /* after save */ }}
  onGaevatarChange={async (data, isNew, nodeId) => { /* update agent */ }}
/>
```

---

## Dependencies

- React 18+
- Radix UI (Dialog, Popover, Select, etc.)
- Tailwind CSS
- Jotai
- @aevatar-react-sdk/core, services, types, utils

## Development

1. Clone the repository
2. Install dependencies with `pnpm install`
3. Run `pnpm dev` to start development

## Testing

Run tests with:
```bash
pnpm test
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

All comments and explanations are in English. Examples are runnable and the structure is clear. For more advanced usage, see the source code or open an issue for help. 