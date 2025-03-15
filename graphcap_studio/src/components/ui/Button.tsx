import { Button, ButtonGroup } from "@chakra-ui/react"
/**
 * Button Component
 *
 * A Button is used to trigger an action or event.
 *
 * ## Source
 * - Storybook
 * - Recipe
 *
 * ## Usage
 * ```jsx
 * import { Button, ButtonGroup } from "@chakra-ui/react";
 * 
 * <Button>Click me</Button>
 * ```
 *
 * ## Examples
 *
 * ### Sizes
 * Use the `size` prop to change the size of the button.
 *
 * ```jsx
 * <Button size="sm">Small Button</Button>
 * <Button size="lg">Large Button</Button>
 * ```
 *
 * ### Variants
 * Use the `variant` prop to change the visual style of the Button.
 *
 * ```jsx
 * <Button variant="outline">Outline Button</Button>
 * <Button variant="ghost">Ghost Button</Button>
 * ```
 *
 * ### Icon
 * Place icons within a button.
 *
 * ```jsx
 * <Button>
 *   <Icon name="check" />
 *   Click me
 * </Button>
 * ```
 *
 * ### Color
 * Use the `colorPalette` prop to change the button's color. Available options include:
 * 'gray', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'cyan', 'purple', 'pink'
 *
 * ```jsx
 * <Button colorPalette="blue">Blue Button</Button>
 * ```
 *
 * ### Disabled
 * Disable the button using the `disabled` prop.
 *
 * ```jsx
 * <Button disabled>Disabled Button</Button>
 * ```
 *
 * ### Disabled Link
 * When using `disabled` with a link, prevent the default behavior and add the `data-disabled` attribute.
 *
 * ```jsx
 * <Button as="a" href="https://example.com" disabled data-disabled>
 *   Disabled Link
 * </Button>
 * ```
 *
 * ### Loading
 * Show a loading spinner with optional loading text using the `loading` and `loadingText` props.
 *
 * ```jsx
 * <Button loading loadingText="Submitting...">Submit</Button>
 * ```
 *
 * To toggle the loading state while keeping the button width consistent, use state management.
 *
 * ### Spinner Placement
 * Use the `spinnerPlacement` prop to change the spinner's placement (e.g., "start" or "end").
 *
 * ```jsx
 * <Button loading spinnerPlacement="start">Submit</Button>
 * ```
 *
 * ### Custom Spinner
 * Customize the spinner by passing a custom element to the `spinner` prop.
 *
 * ```jsx
 * <Button loading spinner={<CustomSpinner />}>Submit</Button>
 * ```
 *
 * ### Group
 * Group buttons together using the `ButtonGroup` component.
 *
 * ```jsx
 * <ButtonGroup>
 *   <Button>One</Button>
 *   <Button>Two</Button>
 * </ButtonGroup>
 * ```
 *
 * To flush the buttons (remove spacing between them), pass the `attached` prop to ButtonGroup.
 *
 * ### Radius
 * Change the button's border radius using the `rounded` prop. This supports both semantic and core radius values.
 *
 * ```jsx
 * <Button rounded="full">Rounded Button</Button>
 * ```
 *
 * ### As Link
 * Render the button as a different element (like a link) using the `asChild` prop.
 *
 * ```jsx
 * <Button asChild>
 *   <a href="https://example.com">Link Button</a>
 * </Button>
 * ```
 *
 * ### Ref
 * Access the underlying button element using a ref.
 *
 * ```jsx
 * import { useRef } from "react";
 * 
 * const Demo = () => {
 *   const ref = useRef<HTMLButtonElement | null>(null);
 *   return <Button ref={ref}>Click me</Button>;
 * };
 * ```
 *
 * ## Props
 *
 * @property {('gray' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'cyan' | 'purple' | 'pink')} [colorPalette='gray']
 *   The color palette of the component.
 *
 * @property {('2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl')} [size='md']
 *   The size of the component.
 *
 * @property {('solid' | 'subtle' | 'surface' | 'outline' | 'ghost' | 'plain')} [variant='solid']
 *   The variant of the component.
 *
 * @property {boolean} [loading]
 *   If true, displays a loading spinner.
 *
 * @property {React.ReactNode} [loadingText]
 *   Text to display when the button is loading.
 *
 * @property {boolean} [disabled]
 *   If true, disables the button.
 *
 * @property {React.ReactNode} [spinner]
 *   Custom spinner element.
 *
 * @property {string} [spinnerPlacement]
 *   The placement of the spinner. Typically "start" or "end".
 *
 * @property {boolean} [asChild]
 *   Renders the button as a child element (e.g., as a link).
 *
 * @see {@link https://chakra-ui.com/docs/components/button Button Documentation}
 */


export { Button, ButtonGroup }
