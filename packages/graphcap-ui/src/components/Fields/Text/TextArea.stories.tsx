import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Textarea } from ".";

const meta: Meta<typeof Textarea> = {
  title: "Components/Fields/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
      description: "Placeholder text when the textarea is empty",
    },
    disabled: {
      control: "boolean",
      description: "Whether the textarea is disabled",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply",
    },
    defaultValue: {
      control: "text",
      description: "Default value for the textarea",
    },
    maxLength: {
      control: "number",
      description: "Maximum number of characters allowed",
    },
    rows: {
      control: "number",
      description: "Number of visible text lines",
    },
    autoGrow: {
      control: "boolean",
      description:
        "Whether the textarea should automatically grow with content",
      defaultValue: false,
    },
    width: {
      control: "select",
      options: ["sm", "md", "lg", "full"],
      description: "Predefined width of the textarea",
      defaultValue: "full",
    },
    height: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Predefined height of the textarea",
      defaultValue: "md",
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Default empty textarea
export const Default: Story = {
  args: {
    placeholder: "Type something...",
    width: "full",
    height: "md",
  },
};

// Different width options
export const Widths: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <div>
        <p className="text-sm text-gray-500 mb-1">Small width (w-32)</p>
        <Textarea placeholder="Small width" width="sm" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">Medium width (w-64)</p>
        <Textarea placeholder="Medium width" width="md" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">Large width (w-96)</p>
        <Textarea placeholder="Large width" width="lg" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">Full width (w-full)</p>
        <Textarea placeholder="Full width" width="full" />
      </div>
    </div>
  ),
};

// Different height options
export const Heights: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <div>
        <p className="text-sm text-gray-500 mb-1">Small height (min-h-12)</p>
        <Textarea placeholder="Small height" height="sm" width="lg" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">Medium height (min-h-16)</p>
        <Textarea placeholder="Medium height" height="md" width="lg" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">Large height (min-h-32)</p>
        <Textarea placeholder="Large height" height="lg" width="lg" />
      </div>
    </div>
  ),
};

// Disabled textarea
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "This textarea is disabled",
    defaultValue: "Cannot edit this content",
  },
};

// Textarea with error state
export const WithError: Story = {
  args: {
    placeholder: "This has an error",
    defaultValue: "This content has some validation error",
    "aria-invalid": "true",
  },
};

// Resizable textarea
export const Resizable: Story = {
  args: {
    placeholder: "This textarea can be resized by the user...",
    className: "resize",
  },
};

// Auto-growing textarea example
export const AutoGrowing: Story = {
  args: {
    placeholder: "Start typing to see me grow...",
    autoGrow: true,
    rows: 1,
    defaultValue: "",
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <p className="text-sm text-gray-500 mb-2">
          This textarea automatically grows with content
        </p>
        <Story />
      </div>
    ),
  ],
};

// Interactive textarea with character count
const TextareaWithCharacterCount = () => {
  const maxLength = 100;
  const [value, setValue] = useState("");
  const charCount = value.length;

  return (
    <div className="space-y-2 max-w-md">
      <Textarea
        placeholder="Start typing..."
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setValue(e.target.value)
        }
        maxLength={maxLength}
        autoGrow
      />
      <div className="text-xs text-right text-gray-500">
        {charCount}/{maxLength} characters
      </div>
    </div>
  );
};

export const WithCharacterCount: Story = {
  render: () => <TextareaWithCharacterCount />
};
