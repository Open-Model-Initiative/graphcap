/**
 * @license Apache-2.0
 *
 * Jobs layout route
 */

import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/workflows/$workflowId/jobs/')({
  component: JobsLayout,
})

function JobsLayout() {
  return <Outlet />
}
