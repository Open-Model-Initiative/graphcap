/**
 * @license Apache-2.0
 * 
 * Workflow list component
 */

import { useWorkflows, useDeleteWorkflow } from '../../../services/workflows'
import { Link } from '@tanstack/react-router'

export function WorkflowList() {
  const { data: workflows, isLoading, error } = useWorkflows()
  const { mutate: deleteWorkflow } = useDeleteWorkflow()

  if (isLoading) {
    return <div className="text-gray-600 dark:text-gray-400">Loading workflows...</div>
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400">Error: {error.message}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Workflows</h2>
        <Link 
          to="/workflows/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Create Workflow
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workflows?.map((workflow) => (
          <div 
            key={workflow.id}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow space-y-3"
          >
            <div className="flex justify-between items-start">
              <Link 
                to="/workflows/$id" 
                params={{ id: workflow.id }}
                className="text-lg font-medium text-gray-900 dark:text-white hover:text-primary-600"
              >
                {workflow.name}
              </Link>
              <button
                onClick={() => deleteWorkflow(workflow.id)}
                className="text-red-600 hover:text-red-700"
                aria-label="Delete workflow"
              >
                <span className="sr-only">Delete</span>
                {/* Add delete icon */}
              </button>
            </div>
            
            {workflow.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {workflow.description}
              </p>
            )}
            
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Last updated: {new Date(workflow.updated_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 