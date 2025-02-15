/**
 * @license Apache-2.0
 * 
 * Workflow detail route
 */

import { createFileRoute } from '@tanstack/react-router'
import { WorkflowDetail } from '../../features/workflows/components/WorkflowDetail'

export const Route = createFileRoute('/workflows/$workflowId')({
  component: WorkflowDetailPage,
})

function WorkflowDetailPage() {
  const { workflowId } = Route.useParams()
  
  return <WorkflowDetail id={workflowId} />
} 