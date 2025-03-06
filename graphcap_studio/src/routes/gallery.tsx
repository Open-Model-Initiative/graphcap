// SPDX-License-Identifier: Apache-2.0
import { createFileRoute } from '@tanstack/react-router'
import { EditorContainer } from '../features/editor/containers/EditorContainer'

export const Route = createFileRoute('/gallery')({
  component: Gallery,
})

export default function Gallery() {
  return (
    <div className="h-full w-full overflow-hidden">
      <EditorContainer />
    </div>
  );
}
