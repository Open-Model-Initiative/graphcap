import type { Meta, StoryObj } from "@storybook/react";
import { SearchIcon } from "lucide-react";
import { Button } from ".";

const meta: Meta<typeof Button> = {
  title: "Components/Button/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "outline", "ghost"],
    },
    colorscheme: {
      control: "select",
      options: ["primary", "secondary", "accent"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "icon"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "solid",
    colorscheme: "primary",
    children: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "solid",
    colorscheme: "secondary",
    children: "Secondary Button",
  },
};

export const Accent: Story = {
  args: {
    variant: "solid",
    colorscheme: "accent",
    children: "Accent Button",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    colorscheme: "primary",
    children: "Outline Button",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    colorscheme: "primary",
    children: "Ghost Button",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "Small Button",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large Button",
  },
};

export const Icon: Story = {
  args: {
    size: "icon",
    variant: "ghost",
    colorscheme: "primary",
    children: <SearchIcon className="h-5 w-5" />,
  },
};

export const AllIconButtons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button size="icon" variant="solid" colorscheme="primary">
        <SearchIcon className="h-5 w-5" />
      </Button>
      <Button size="icon" variant="outline" colorscheme="primary">
        <SearchIcon className="h-5 w-5" />
      </Button>
      <Button size="icon" variant="ghost" colorscheme="primary">
        <SearchIcon className="h-5 w-5" />
      </Button>

      <Button size="icon" variant="solid" colorscheme="secondary">
        <SearchIcon className="h-5 w-5" />
      </Button>
      <Button size="icon" variant="outline" colorscheme="secondary">
        <SearchIcon className="h-5 w-5" />
      </Button>
      <Button size="icon" variant="ghost" colorscheme="secondary">
        <SearchIcon className="h-5 w-5" />
      </Button>

      <Button size="icon" variant="solid" colorscheme="accent">
        <SearchIcon className="h-5 w-5" />
      </Button>
      <Button size="icon" variant="outline" colorscheme="accent">
        <SearchIcon className="h-5 w-5" />
      </Button>
      <Button size="icon" variant="ghost" colorscheme="accent">
        <SearchIcon className="h-5 w-5" />
      </Button>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64">
      <Button variant="solid" colorscheme="primary">
        Primary Solid
      </Button>
      <Button variant="outline" colorscheme="primary">
        Primary Outline
      </Button>
      <Button variant="ghost" colorscheme="primary">
        Primary Ghost
      </Button>

      <Button variant="solid" colorscheme="secondary">
        Secondary Solid
      </Button>
      <Button variant="outline" colorscheme="secondary">
        Secondary Outline
      </Button>
      <Button variant="ghost" colorscheme="secondary">
        Secondary Ghost
      </Button>

      <Button variant="solid" colorscheme="accent">
        Accent Solid
      </Button>
      <Button variant="outline" colorscheme="accent">
        Accent Outline
      </Button>
      <Button variant="ghost" colorscheme="accent">
        Accent Ghost
      </Button>
    </div>
  ),
};
