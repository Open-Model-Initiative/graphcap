import type { Meta, StoryObj } from "@storybook/react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from ".";

const meta: Meta<typeof Select> = {
  title: "Components/Fields/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: "text",
      description: "The default selected value",
    },
    disabled: {
      control: "boolean",
      description: "Whether the select is disabled",
    },
    required: {
      control: "boolean",
      description: "Whether the select is required",
    },
    name: {
      control: "text",
      description: "The name of the select field",
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-52">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithDefaultValue: Story = {
  render: () => (
    <Select defaultValue="option2">
      <SelectTrigger className="w-52">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-52">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-52">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="carrot">Carrot</SelectItem>
          <SelectItem value="broccoli">Broccoli</SelectItem>
          <SelectItem value="spinach">Spinach</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const WithDisabledItems: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-52">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2" disabled>
          Option 2 (Disabled)
        </SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const SmallSize: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-40" size="sm">
        <SelectValue placeholder="Small select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const DefaultSize: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-52" size="default">
        <SelectValue placeholder="Default size" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithError: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-52" aria-invalid="true">
        <SelectValue placeholder="Select with error" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithLongOptions: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-52">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">
          Option with a very long text that might truncate
        </SelectItem>
        <SelectItem value="option2">
          Another long option that demonstrates text overflow handling
        </SelectItem>
        <SelectItem value="option3">A reasonably sized option</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-2">Small Size</p>
        <Select>
          <SelectTrigger className="w-40" size="sm">
            <SelectValue placeholder="Small select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Default Size</p>
        <Select>
          <SelectTrigger className="w-52" size="default">
            <SelectValue placeholder="Default size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const Widths: Story = {
  render: () => (
    <div className="flex flex-col space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-2">Narrow (w-32)</p>
        <Select>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Narrow" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Medium (w-64)</p>
        <Select>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Medium width" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Wide (w-96)</p>
        <Select>
          <SelectTrigger className="w-96">
            <SelectValue placeholder="Wide select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const IconsInOptions: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select with icons" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-red-500" />
            Apple
          </span>
        </SelectItem>
        <SelectItem value="banana">
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-yellow-500" />
            Banana
          </span>
        </SelectItem>
        <SelectItem value="blueberry">
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-blue-500" />
            Blueberry
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  ),
};
