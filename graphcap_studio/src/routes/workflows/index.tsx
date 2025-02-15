/**
 * @license Apache-2.0
 * 
 * Workflows list route
 */

import { createFileRoute, Link } from '@tanstack/react-router'
import { useWorkflows } from '../../services/workflows'

export const Route = createFileRoute('/workflows/')({
  component: WorkflowsPage,
})

function WorkflowsPage() {
  const { data: workflows, isLoading, error } = useWorkflows()

  if (isLoading) {
    return <div className="animate-pulse">Loading workflows...</div>
  }

  if (error) {
    return <div className="text-red-600">Error: {error.message}</div>
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Workflows
        </h1>
        <Link
          to="/workflows/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          New Workflow
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {workflows?.map((workflow) => (
          <Link
            key={workflow.id}
            to="/workflows/$workflowId"
            params={{ workflowId: workflow.id }}
            className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {workflow.name}
              </h2>
              {workflow.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {workflow.description}
                </p>
              )}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Updated: {new Date(workflow.updated_at).toLocaleDateString()}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
} 