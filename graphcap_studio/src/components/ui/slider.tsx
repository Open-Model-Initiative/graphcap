import { Slider as ChakraSlider, For, HStack } from "@chakra-ui/react"
import * as React from "react"

export interface SliderProps extends ChakraSlider.RootProps {
  marks?: ReadonlyArray<number | { value: number; label: React.ReactNode }>
  label?: React.ReactNode
  showValue?: boolean
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  function Slider(props, ref) {
    const { marks: marksProp, label, showValue, ...rest } = props
    const value = props.defaultValue ?? props.value

    const marks = marksProp?.map((mark): { value: number; label: React.ReactNode | undefined } => {
      if (typeof mark === "number") return { value: mark, label: undefined }
      return mark
    })

    const hasMarkLabel = marks ? marks.some((mark) => Boolean(mark.label)) : false

    return (
      <ChakraSlider.Root ref={ref} thumbAlignment="center" {...rest}>
        {label && !showValue && (
          <ChakraSlider.Label>{label}</ChakraSlider.Label>
        )}
        {label && showValue && (
          <HStack justify="space-between">
            <ChakraSlider.Label>{label}</ChakraSlider.Label>
            <ChakraSlider.ValueText />
          </HStack>
        )}
        <ChakraSlider.Control data-has-mark-label={hasMarkLabel || undefined}>
          <ChakraSlider.Track>
            <ChakraSlider.Range />
          </ChakraSlider.Track>
          <SliderThumbs value={value} />
          <SliderMarks marks={marks} />
        </ChakraSlider.Control>
      </ChakraSlider.Root>
    )
  },
)

function SliderThumbs(props: { readonly value?: readonly number[] }) {
  const { value } = props
  return (
    <For each={value}>
      {(val, index) => (
        <ChakraSlider.Thumb key={`thumb-${val}-${index}`} index={index}>
          <ChakraSlider.HiddenInput />
        </ChakraSlider.Thumb>
      )}
    </For>
  )
}

interface SliderMarksProps {
  marks?: ReadonlyArray<{ value: number; label: React.ReactNode | undefined }>
}

const SliderMarks = React.forwardRef<HTMLDivElement, SliderMarksProps>(
  function SliderMarks(props, ref) {
    const { marks } = props
    if (!marks?.length) return null

    return (
      <ChakraSlider.MarkerGroup ref={ref}>
        {marks.map((mark) => {
          const { value, label } = mark
          return (
            <ChakraSlider.Marker key={`marker-${value}`} value={value}>
              <ChakraSlider.MarkerIndicator />
              {label}
            </ChakraSlider.Marker>
          )
        })}
      </ChakraSlider.MarkerGroup>
    )
  },
)
