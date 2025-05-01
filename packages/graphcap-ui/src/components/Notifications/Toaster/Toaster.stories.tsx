import type { Meta, StoryObj } from "@storybook/react";
import { toast } from "sonner";
import { Toaster } from ".";

const meta: Meta<typeof Toaster> = {
  title: "Components/Notifications/Toaster",
  component: Toaster,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

const Template = () => (
  <div className="flex flex-col items-center gap-4">
    {/* Render the Toaster once per story */}
    <Toaster richColors />
    <button
      className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      type="button"
      onClick={() => toast.success("This is a success toast!")}
    >
      Trigger Success Toast
    </button>
    <button
      className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      type="button"
      onClick={() => toast.info("This is an info toast!")}
    >
      Trigger Info Toast
    </button>
    <button
      className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      type="button"
      onClick={() => toast.error("This is an error toast!")}
    >
      Trigger Error Toast
    </button>
  </div>
);

export const Playground: Story = {
  render: Template,
};
