/**
 * @license Apache-2.0
 * 
 * Workflow header component with metadata and actions
 */

import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { Workflow } from '../../../services/workflows'
import { useRunWorkflow } from '../hooks/useRunWorkflow'

interface WorkflowHeaderProps {
  workflow: Workflow
}

export function WorkflowHeader({ workflow }: WorkflowHeaderProps) {
  const navigate = useNavigate()
  const [isRunning, setIsRunning] = useState(false)
  const { mutate: runWorkflow } = useRunWorkflow()

  const handleRun = async () => {
    setIsRunning(true)
    try {
      runWorkflow(
        { workflowId: workflow.id },
        {
          onSuccess: (data) => {
            toast.success('Workflow started successfully')
            // Navigate to job status page
            navigate({ 
              to: '/workflows/$workflowId/jobs/$jobId',
              params: { 
                workflowId: workflow.id,
                jobId: data.job_id 
              }
            })
          },
          onError: (error) => {
            toast.error(`Failed to start workflow: ${error.message}`)
          },
          onSettled: () => setIsRunning(false)
        }
      )
    } catch (error) {
      setIsRunning(false)
      toast.error('Failed to start workflow')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {workflow.name}
          </h1>
          {workflow.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {workflow.description}
            </p>
          )}
          <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div>Created: {new Date(workflow.created_at).toLocaleString()}</div>
            <div>Updated: {new Date(workflow.updated_at).toLocaleString()}</div>
            {workflow.workflow_metadata?.version && (
              <div>Version: {workflow.workflow_metadata.version}</div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate({ to: '/workflows' })}
            className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Back
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={`px-4 py-2 bg-primary-600 text-white rounded-md ${
              isRunning 
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-primary-700'
            }`}
          >
            {isRunning ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Running...
              </span>
            ) : (
              'Run Workflow'
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 