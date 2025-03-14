// SPDX-License-Identifier: Apache-2.0
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  Textarea,
  createListCollection,
  Tag as ChakraTag,
} from "@chakra-ui/react"
import { ImagePropertiesData } from '../hooks/useImageProperties'
import { Field } from "../../../components/ui/field"
import { useColorModeValue } from "../../../components/ui/color-mode"
import { SelectRoot, SelectTrigger, SelectContent, SelectItem } from "../../../components/ui/select"
import type { SelectValueChangeDetails } from "@chakra-ui/react"

interface BasicInformationProps {
  readonly properties: ImagePropertiesData
  readonly isEditing: boolean
  readonly newTag: string
  readonly onPropertyChange: (key: keyof ImagePropertiesData, value: any) => void
  readonly onNewTagChange: (value: string) => void
  readonly onAddTag: () => void
  readonly onRemoveTag: (tag: string) => void
  readonly onSave: () => void
  readonly onToggleEdit: () => void
}

/**
 * Component for displaying and editing basic image information
 */
export function BasicInformation({
  properties,
  isEditing,
  newTag,
  onPropertyChange,
  onNewTagChange,
  onAddTag,
  onRemoveTag,
  onSave,
  onToggleEdit
}: BasicInformationProps) {
  const bgColor = useColorModeValue("gray.50", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const labelColor = useColorModeValue("gray.600", "gray.400")
  const textColor = useColorModeValue("gray.800", "gray.200")

  const ratingItems = [
    { label: "Not rated", value: "0" },
    { label: "★", value: "1" },
    { label: "★★", value: "2" },
    { label: "★★★", value: "3" },
    { label: "★★★★", value: "4" },
    { label: "★★★★★", value: "5" },
  ]

  const ratingCollection = createListCollection({
    items: ratingItems,
  })

  const handleRatingChange = (details: SelectValueChangeDetails<typeof ratingItems[0]>) => {
    onPropertyChange('rating', Number(details.value[0]))
  }

  return (
    <Box borderRadius="lg" bg={bgColor} p={4} shadow="sm" borderWidth="1px" borderColor={borderColor}>
      <Flex mb={2} alignItems="center" justifyContent="space-between">
        <Heading size="sm" color={textColor}>Basic Information</Heading>
        <Button
          variant="ghost"
          size="sm"
          colorScheme="blue"
          onClick={onToggleEdit}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </Flex>
      
      {isEditing ? (
        <Box>
          <Field label="Title">
            <Input
              value={properties.title}
              onChange={(e) => onPropertyChange('title', e.target.value)}
              size="sm"
            />
          </Field>

          <Field label="Description" mt={3}>
            <Textarea
              value={properties.description}
              onChange={(e) => onPropertyChange('description', e.target.value)}
              size="sm"
              rows={3}
            />
          </Field>

          <Field label="Rating" mt={3}>
            <SelectRoot
              value={[properties.rating.toString()]}
              onValueChange={handleRatingChange}
              collection={ratingCollection}
            >
              <SelectTrigger>
                {properties.rating ? '★'.repeat(properties.rating) : 'Not rated'}
              </SelectTrigger>
              <SelectContent>
                {ratingItems.map((item) => (
                  <SelectItem key={item.value} item={item}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Field>

          <Field label="Tags" mt={3}>
            <Flex>
              <Input
                value={newTag}
                onChange={(e) => onNewTagChange(e.target.value)}
                placeholder="Add a tag"
                size="sm"
                onKeyDown={(e) => e.key === 'Enter' && onAddTag()}
                borderEndRadius={0}
              />
              <Button
                onClick={onAddTag}
                size="sm"
                colorScheme="blue"
                borderStartRadius={0}
              >
                Add
              </Button>
            </Flex>
            <Flex mt={2} gap={2} flexWrap="wrap">
              {properties.tags.map((tag: string) => (
                <ChakraTag.Root
                  key={tag}
                  size="sm"
                  variant="subtle"
                  colorScheme="blue"
                >
                  <ChakraTag.Label>{tag}</ChakraTag.Label>
                  <ChakraTag.EndElement>
                    <ChakraTag.CloseTrigger onClick={() => onRemoveTag(tag)} />
                  </ChakraTag.EndElement>
                </ChakraTag.Root>
              ))}
            </Flex>
          </Field>

          <Button
            onClick={onSave}
            colorScheme="blue"
            width="full"
            mt={4}
            size="sm"
          >
            Save Changes
          </Button>
        </Box>
      ) : (
        <Box>
          <Box mb={2}>
            <Text fontSize="sm" fontWeight="medium" color={labelColor}>Title:</Text>
            <Text fontSize="sm" color={textColor}>{properties.title || 'No title'}</Text>
          </Box>
          <Box mb={2}>
            <Text fontSize="sm" fontWeight="medium" color={labelColor}>Description:</Text>
            <Text fontSize="sm" color={textColor}>{properties.description || 'No description'}</Text>
          </Box>
          <Box mb={2}>
            <Text fontSize="sm" fontWeight="medium" color={labelColor}>Rating:</Text>
            <Text fontSize="sm" color={textColor}>
              {properties.rating ? '★'.repeat(properties.rating) : 'Not rated'}
            </Text>
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="medium" color={labelColor}>Tags:</Text>
            <Flex mt={1} gap={1} flexWrap="wrap">
              {properties.tags.length > 0 ? (
                properties.tags.map((tag: string) => (
                  <ChakraTag.Root
                    key={tag}
                    size="sm"
                    variant="subtle"
                    colorScheme="blue"
                  >
                    <ChakraTag.Label>{tag}</ChakraTag.Label>
                  </ChakraTag.Root>
                ))
              ) : (
                <Text fontSize="sm" color="gray.500">No tags</Text>
              )}
            </Flex>
          </Box>
        </Box>
      )}
    </Box>
  )
}