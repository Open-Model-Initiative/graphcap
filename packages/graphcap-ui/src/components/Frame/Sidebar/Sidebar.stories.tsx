import type { Meta, StoryObj } from "@storybook/react";
import { FileTextIcon, HomeIcon, SettingsIcon, UsersIcon } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from ".";

// Common sidebar content to reuse across stories
const SidebarMenuContent = () => (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton isActive tooltip="Home">
            <HomeIcon />
            <span>Home</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Documents">
            <FileTextIcon />
            <span>Documents</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Users">
            <UsersIcon />
            <span>Users</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Settings">
            <SettingsIcon />
            <span>Settings</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
);

// Demo content for the main area
const DemoContent = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Main Content</h1>
    <p className="text-gray-700 mb-4">
      This is the main content area that appears next to the sidebar.
    </p>
    <div className="p-4 border rounded-md bg-gray-50">
      <p>Try toggling the sidebar using the button in the top left.</p>
    </div>
  </div>
);

const meta: Meta<typeof Sidebar> = {
  title: "Components/Frame/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    side: {
      control: "select",
      options: ["left", "right"],
      description: "Which side the sidebar appears on",
    },
    variant: {
      control: "select", 
      options: ["sidebar", "floating", "inset"],
      description: "Visual variant of the sidebar",
    },
    collapsible: {
      control: "select",
      options: ["offcanvas", "icon-only", "none"],
      description: "How the sidebar collapses",
    },
  },
  decorators: [
    (Story) => (
      <div className="h-screen">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Base story with SidebarProvider wrapper
const SidebarTemplate: Story = {
  render: ({ side, variant, collapsible }) => {
    return (
      <SidebarProvider>
        <Sidebar side={side} variant={variant} collapsible={collapsible}>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <SidebarTrigger />
              <h1 className="font-semibold">My App</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenuContent />
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-xs text-gray-500">v1.0.0</span>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <DemoContent />
        </SidebarInset>
      </SidebarProvider>
    );
  },
};

// Standard left sidebar (default)
export const Default: Story = {
  ...SidebarTemplate,
  args: {
    side: "left",
    variant: "sidebar",
    collapsible: "icon-only",
  },
};

// Right-side sidebar
export const RightSidebar: Story = {
  ...SidebarTemplate,
  args: {
    side: "right",
  },
};

// Floating variant
export const FloatingSidebar: Story = {
  ...SidebarTemplate,
  args: {
    side: "left",
  },
};

// Inset variant
export const InsetSidebar: Story = {
  ...SidebarTemplate,
  args: {
    variant: "inset",
  },
};


// Icon-only collapsible behavior
export const IconOnlyCollapsible: Story = {
  ...SidebarTemplate,
  args: {
    collapsible: "icon-only",
  },
};

// Non-collapsible sidebar
export const NonCollapsible: Story = {
  ...SidebarTemplate,
  args: {
    collapsible: "none",
  },
};

// Show all variants in one story
export const DoubleSidebar: Story = {
  render: () => {
    const variants: Array<{
      side: "left" | "right";
    }> = [
      { side: "left" },
      { side: "right" },
    
    ];

    return (
      <div className="grid grid-cols-2 gap-4 p-4">
        {variants.map((variant, i) => (
          <div key={i} className="border rounded-lg overflow-hidden h-96">
            <div className="p-2 border-b bg-gray-50">
              <h3 className="font-semibold">{variant.side}</h3>
            </div>
            <div className="h-[calc(100%-2.5rem)]">
              <SidebarProvider>
                <Sidebar
                  side={variant.side}
                >
                  <SidebarHeader>
                    <div className="flex items-center gap-2 px-2">
                      <SidebarTrigger />
                      <h1 className="font-semibold">My App</h1>
                    </div>
                  </SidebarHeader>
                  <SidebarContent>
                    <SidebarMenuContent />
                  </SidebarContent>
                </Sidebar>
                <SidebarInset className="bg-white">
                  <div className="p-4 text-sm">
                    <p>Main content area</p>
                  </div>
                </SidebarInset>
              </SidebarProvider>
            </div>
          </div>
        ))}
      </div>
    );
  },
}; 