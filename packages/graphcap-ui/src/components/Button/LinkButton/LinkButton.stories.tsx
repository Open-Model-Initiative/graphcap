import type { Meta, StoryObj } from "@storybook/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";
import React from "react";
import { LinkButton } from ".";

// Define the wrapper component
const StorybookRouterWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Create root route that renders children directly
  const rootRoute = createRootRoute({
    component: () => children,
  });

  // Use React.useMemo to prevent router recreation on re-renders within Storybook
  const router = React.useMemo(
    () =>
      createRouter({
        routeTree: rootRoute,
        history: createMemoryHistory({ initialEntries: ["/"] }),
      }),
    [rootRoute]
  );

  return <RouterProvider router={router} />;
};

const meta: Meta<typeof LinkButton> = {
  title: "Components/Button/LinkButton",
  component: LinkButton,
  parameters: {
    layout: "centered",
  },
  // Decorate all stories with the RouterProvider
  // Use the wrapper component for cleaner context setup
  decorators: [
    (Story, context) => {
      // Use JSON.stringify on args for a simple key to force remount on arg change
      const key = JSON.stringify(context.args);
      return (
        <StorybookRouterWrapper key={key}>
          <Story />
        </StorybookRouterWrapper>
      );
    },
  ],
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
    to: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "solid",
    colorscheme: "primary",
    children: "Primary Link Button",
    to: "/",
  },
};

export const Secondary: Story = {
  args: {
    variant: "solid",
    colorscheme: "secondary",
    children: "Secondary Link Button",
    to: "/about",
  },
};

export const Accent: Story = {
  args: {
    variant: "solid",
    colorscheme: "accent",
    children: "Accent Link Button",
    to: "/about",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    colorscheme: "primary",
    children: "Outline Link Button",
    to: "/about",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    colorscheme: "primary",
    children: "Ghost Link Button",
    to: "/about",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "Small Link Button",
    to: "/",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large Link Button",
    to: "/",
  },
};

export const Icon: Story = {
  args: {
    size: "icon",
    variant: "ghost",
    colorscheme: "primary",
    children: <SearchIcon className="h-5 w-5" />,
    to: "/",
  },
};

export const AllIconButtons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <LinkButton size="icon" variant="solid" colorscheme="primary" to="/">
        <SearchIcon className="h-5 w-5" />
      </LinkButton>
      <LinkButton
        size="icon"
        variant="outline"
        colorscheme="primary"
        to="/about"
      >
        <SearchIcon className="h-5 w-5" />
      </LinkButton>
      <LinkButton size="icon" variant="ghost" colorscheme="primary" to="/about">
        <SearchIcon className="h-5 w-5" />
      </LinkButton>
    </div>
  ),
};
