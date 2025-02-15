/**
 * @license Apache-2.0
 *
 * Job status route
 */

import { createFileRoute } from '@tanstack/react-router'
import { JobStatus } from '../../../../../features/workflows/components/JobStatus'

export const Route = createFileRoute('/workflows/$workflowId/jobs/$jobId/')({
  component: JobStatusPage,
})

function JobStatusPage() {
  const { jobId } = Route.useParams()

  return <JobStatus jobId={jobId} />
}
