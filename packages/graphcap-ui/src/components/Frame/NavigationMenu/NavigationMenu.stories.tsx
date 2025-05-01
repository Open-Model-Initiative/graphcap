import type { Meta, StoryObj } from "@storybook/react";
import { CalendarIcon, FolderIcon, HomeIcon, SettingsIcon } from "lucide-react";

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger
} from "./NavigationMenu";

const meta: Meta<typeof NavigationMenu> = {
  title: "Components/Frame/NavigationMenu",
  component: NavigationMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    viewport: {
      control: "boolean",
      description: "Whether to show the navigation menu viewport",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full h-screen flex items-start justify-center pt-20">
        <div className="w-full max-w-4xl">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic navigation menu with dropdown
export const Default: Story = {
  render: (args) => (
    <NavigationMenu {...args} className="max-w-none w-full justify-start">
      <NavigationMenuList className="justify-start space-x-4">
        <NavigationMenuItem>
          <NavigationMenuLink layout="inline" icon={<HomeIcon />}>
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-4 w-[500px] lg:grid-cols-[.75fr_1fr]">
              <div className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Documentation
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Learn how to use our platform with comprehensive guides
                    </p>
                  </a>
                </NavigationMenuLink>
              </div>
              <NavigationMenuLink asChild>
                <a
                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  href="/"
                >
                  <div className="text-sm font-medium leading-none">Introduction</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Learn the basics of our platform
                  </p>
                </a>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <a
                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  href="/"
                >
                  <div className="text-sm font-medium leading-none">Quick Start</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Get up and running in minutes
                  </p>
                </a>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Features</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-2">
              {features.map((feature) => (
                <li key={feature.title}>
                  <NavigationMenuLink asChild>
                    <a
                      className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      href={feature.href}
                    >
                      <div className="flex items-center">
                        {feature.icon}
                        <div className="text-sm font-medium leading-none ml-2">{feature.title}</div>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {feature.description}
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink layout="inline" icon={<SettingsIcon />}>
            Settings
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
  args: {
    viewport: true,
  },
};

// Basic horizontal navigation menu without dropdown
export const SimpleMenu: Story = {
  render: (args) => (
    <NavigationMenu {...args} className="max-w-none w-full justify-start">
      <NavigationMenuList className="justify-start space-x-4">
        <NavigationMenuItem>
          <NavigationMenuLink layout="inline" icon={<HomeIcon />}>
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink layout="inline" icon={<FolderIcon />}>
            Projects
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink layout="inline" icon={<CalendarIcon />}>
            Schedule
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink layout="inline" icon={<SettingsIcon />}>
            Settings
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
  args: {
    viewport: false,
  },
};

// Menu with indicator
export const WithIndicator: Story = {
  render: (args) => (
    <NavigationMenu {...args} className="max-w-none w-full justify-start">
      <NavigationMenuList className="justify-start space-x-4">
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Featured Products
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Check out our latest product offerings
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <a
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    href="/"
                  >
                    <div className="text-sm font-medium leading-none">Product A</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Our flagship product
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <a
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    href="/"
                  >
                    <div className="text-sm font-medium leading-none">Product B</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Our newest offering
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Services</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[500px] gap-3 p-4 md:grid-cols-2">
              {services.map((service) => (
                <li key={service.title}>
                  <NavigationMenuLink asChild>
                    <a
                      className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      href="/"
                    >
                      <div className="text-sm font-medium leading-none">{service.title}</div>
                      <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {service.description}
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink layout="inline" icon={<SettingsIcon />}>
            Contact
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuIndicator />
    </NavigationMenu>
  ),
  args: {
    viewport: true,
  },
};

// Without viewport
export const NoViewport: Story = {
  ...Default,
  args: {
    viewport: false,
  },
};

// Sample data for the stories
const features = [
  {
    title: "Dashboard",
    description: "View your analytics and monitor key metrics",
    href: "/",
    icon: <HomeIcon className="h-4 w-4" />,
  },
  {
    title: "Documents",
    description: "Manage and organize your documents",
    href: "/",
    icon: <FolderIcon className="h-4 w-4" />,
  },
  {
    title: "Calendar",
    description: "Schedule and manage your events",
    href: "/",
    icon: <CalendarIcon className="h-4 w-4" />,
  },
  {
    title: "Settings",
    description: "Configure your account and application settings",
    href: "/",
    icon: <SettingsIcon className="h-4 w-4" />,
  },
];

const services = [
  {
    title: "Consulting",
    description: "Expert advice to help grow your business",
  },
  {
    title: "Implementation",
    description: "Professional setup and integration services",
  },
  {
    title: "Training",
    description: "Learn how to get the most from our platform",
  },
  {
    title: "Support",
    description: "24/7 assistance for all your needs",
  },
];
