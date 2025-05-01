import type { Meta, StoryObj } from "@storybook/react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from ".";

const meta: Meta<typeof Table> = {
  title: "Components/Table",
  component: Table,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the table",
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Simple example using args pattern
export const Default: Story = {
  args: {
    className: "w-full max-w-md",
    children: (
      <>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>john@example.com</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Jane Smith</TableCell>
            <TableCell>jane@example.com</TableCell>
            <TableCell>Pending</TableCell>
          </TableRow>
        </TableBody>
      </>
    ),
  },
};

export const WithCaption: Story = {
  args: {
    className: "w-full max-w-md",
    children: (
      <>
        <TableCaption>A basic table example</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>john@example.com</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Jane Smith</TableCell>
            <TableCell>jane@example.com</TableCell>
            <TableCell>Pending</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Bob Johnson</TableCell>
            <TableCell>bob@example.com</TableCell>
            <TableCell>Inactive</TableCell>
          </TableRow>
        </TableBody>
      </>
    ),
  },
};

export const WithFooter: Story = {
  render: () => (
    <Table className="w-full max-w-md">
      <TableCaption>Table with footer</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Product A</TableCell>
          <TableCell>2</TableCell>
          <TableCell>$20.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Product B</TableCell>
          <TableCell>1</TableCell>
          <TableCell>$30.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Product C</TableCell>
          <TableCell>3</TableCell>
          <TableCell>$15.00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell>$95.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <Table className="border border-gray-200 rounded-md w-full max-w-md">
      <TableCaption>Table with custom styling</TableCaption>
      <TableHeader>
        <TableRow className="bg-gray-100">
          <TableHead className="font-bold">Name</TableHead>
          <TableHead className="font-bold">Role</TableHead>
          <TableHead className="font-bold">Department</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Sarah Connor</TableCell>
          <TableCell>Senior Developer</TableCell>
          <TableCell>Engineering</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Michael Scott</TableCell>
          <TableCell>Manager</TableCell>
          <TableCell>Sales</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Jim Halpert</TableCell>
          <TableCell>Sales Rep</TableCell>
          <TableCell>Sales</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const ComplexTable: Story = {
  render: () => (
    <Table className="w-full max-w-lg">
      <TableCaption>Complex table with merged cells</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Quarter</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Revenue</TableHead>
          <TableHead>Growth</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell rowSpan={3}>Q1 2023</TableCell>
          <TableCell>Product A</TableCell>
          <TableCell>$10,000</TableCell>
          <TableCell>+5%</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Product B</TableCell>
          <TableCell>$15,000</TableCell>
          <TableCell>+8%</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Product C</TableCell>
          <TableCell>$8,000</TableCell>
          <TableCell>+3%</TableCell>
        </TableRow>
        <TableRow>
          <TableCell rowSpan={3}>Q2 2023</TableCell>
          <TableCell>Product A</TableCell>
          <TableCell>$12,000</TableCell>
          <TableCell>+20%</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Product B</TableCell>
          <TableCell>$18,000</TableCell>
          <TableCell>+20%</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Product C</TableCell>
          <TableCell>$9,500</TableCell>
          <TableCell>+18.75%</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell>$72,500</TableCell>
          <TableCell>+12.5%</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const AllTableElements: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="text-lg font-medium mb-2">Basic Table</h3>
        <Table className="w-full max-w-md">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Table with Caption</h3>
        <Table className="w-full max-w-md">
          <TableCaption>Table with caption example</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Table with Footer</h3>
        <Table className="w-full max-w-md">
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Item A</TableCell>
              <TableCell>$50</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Item B</TableCell>
              <TableCell>$25</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell>$75</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  ),
};
