/**
 * @license Apache-2.0
 * 
 * Workflow detail component with interactive view
 */

import { toast } from 'sonner'
import { useWorkflow } from '../../../services/workflows'
import { WorkflowHeader } from './WorkflowHeader'
import { WorkflowConfig } from './WorkflowConfig'

interface WorkflowDetailProps {
  id: string
}

export function WorkflowDetail({ id }: WorkflowDetailProps) {
  const { data: workflow, isLoading, error } = useWorkflow(id)

  const handleRunWorkflow = () => {
    // TODO: Implement workflow execution
    toast.info('Workflow execution not implemented yet')
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="text-red-600 dark:text-red-400">
          Error: {error instanceof Error ? error.message : 'Failed to load workflow'}
        </div>
      </div>
    )
  }

  if (!workflow) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="text-yellow-600 dark:text-yellow-400">
          Workflow not found
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <WorkflowHeader workflow={workflow} onRun={handleRunWorkflow} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <WorkflowConfig config={workflow.config} />
        
        {workflow.workflow_metadata && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Metadata
              </h2>
            </div>
            <div className="p-4">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Name
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {workflow.workflow_metadata.name}
                  </dd>
                </div>
                {workflow.workflow_metadata.description && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Description
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {workflow.workflow_metadata.description}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Version
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {workflow.workflow_metadata.version}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 