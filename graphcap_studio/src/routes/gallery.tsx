// SPDX-License-Identifier: Apache-2.0
import { createFileRoute } from '@tanstack/react-router'
import { EditorContainer } from '../features/editor/containers/EditorContainer'

export const Route = createFileRoute('/gallery')({
  component: ImageEditorWrapper,
})

function ImageEditorWrapper() {
  return <EditorContainer />
}
