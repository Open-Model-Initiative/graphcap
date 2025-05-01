import { Button } from "@graphcap/ui/components/Button";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from ".";

const meta: Meta<typeof AlertDialog> = {
  title: "Components/Notifications/AlertDialog",
  component: AlertDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

const Template = () => {
  const [result, setResult] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Open Alert Dialog</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setResult("Cancelled")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => setResult("Confirmed")}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {result && (
        <div className="mt-4 rounded border p-3">
          <p>
            Last action: <strong>{result}</strong>
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setResult(null)}
            className="mt-2"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
};

// Basic usage example
export const Default: Story = {
  render: Template,
};

// Example with custom button variants
export const CustomButtons: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button colorscheme="accent">Custom Alert Dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Custom Styled Alert</AlertDialogTitle>
          <AlertDialogDescription>
            This alert dialog uses custom button styling to match your
            application's design.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="ghost" colorscheme="secondary">
            Dismiss
          </AlertDialogCancel>
          <AlertDialogAction colorscheme="accent">Accept</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};
