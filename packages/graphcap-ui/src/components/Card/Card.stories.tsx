import { Button } from "@graphcap/ui/components/Button";
import type { Meta, StoryObj } from "@storybook/react";
import { MoreHorizontalIcon } from "lucide-react";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from ".";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the card",
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "w-[350px]",
    children: (
      <>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description goes here</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the main content of the card.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Action</Button>
        </CardFooter>
      </>
    ),
  },
};

export const WithAction: Story = {
  args: {
    className: "w-[350px]",
    children: (
      <>
        <CardHeader>
          <CardTitle>Card with Action</CardTitle>
          <CardDescription>
            Card with an action button in the header
          </CardDescription>
          <CardAction>
            <Button variant="ghost" size="icon" colorscheme="secondary">
              <MoreHorizontalIcon className="h-5 w-5" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p>This card has an action button in the header.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Action</Button>
        </CardFooter>
      </>
    ),
  },
};

export const ContentOnly: Story = {
  args: {
    className: "w-[350px]",
    children: (
      <CardContent>
        <p>This card has only content without header or footer.</p>
      </CardContent>
    ),
  },
};

export const HeaderAndContent: Story = {
  args: {
    className: "w-[350px]",
    children: (
      <>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card with header and content</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This card has a header and content but no footer.</p>
        </CardContent>
      </>
    ),
  },
};

export const ContentAndFooter: Story = {
  args: {
    className: "w-[350px]",
    children: (
      <>
        <CardContent>
          <p>This card has content and a footer but no header.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Action</Button>
        </CardFooter>
      </>
    ),
  },
};

export const CardSizes: Story = {
  render: () => (
    <div className="flex flex-col space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-2">Small Card (w-64)</p>
        <Card className="w-64">
          <CardHeader>
            <CardTitle>Small Card</CardTitle>
            <CardDescription>A card with small width</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is a small card.</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Medium Card (w-80)</p>
        <Card className="w-80">
          <CardHeader>
            <CardTitle>Medium Card</CardTitle>
            <CardDescription>A card with medium width</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is a medium-sized card.</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Large Card (w-96)</p>
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Large Card</CardTitle>
            <CardDescription>A card with large width</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is a large card with more space for content.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
};

export const ComplexCard: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Complex Card Example</CardTitle>
        <CardDescription>
          A more complex card layout with multiple sections
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon" colorscheme="secondary">
            <MoreHorizontalIcon className="h-5 w-5" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-secondary/20 p-4">
          <h3 className="font-medium mb-2">Featured Content</h3>
          <p className="text-sm">
            This is a highlighted section within the card content area.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium">Details</h3>
          <ul className="text-sm space-y-1">
            <li>First item details</li>
            <li>Second item with more information</li>
            <li>Third item with extra details</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" size="sm">
          Cancel
        </Button>
        <Button size="sm">Continue</Button>
      </CardFooter>
    </Card>
  ),
};
