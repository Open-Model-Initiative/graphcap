/**
 * @license Apache-2.0
 * 
 * Job status display component
 */

import { useQuery } from '@tanstack/react-query'
import { API_BASE_URL } from '../../../services/api'

interface JobStatusProps {
  jobId: string
}

export function JobStatus({ jobId }: JobStatusProps) {
  const { data: status, error, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/pipeline/job/${jobId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch job status')
      }
      return response.json()
    },
    // Poll every 2 seconds while job is running
    refetchInterval: (data) => 
      data?.status === 'PENDING' || data?.status === 'RUNNING' ? 2000 : false,
  })

  if (isLoading) {
    return <div className="animate-pulse">Loading job status...</div>
  }

  if (error) {
    return <div className="text-red-600">Error: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Job Status
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${status.status === 'COMPLETED' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : status.status === 'FAILED'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
              {status.status}
            </span>
          </div>

          {status.error_message && (
            <div className="text-red-600 dark:text-red-400">
              Error: {status.error_message}
            </div>
          )}

          {status.results && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Results
              </h3>
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-96">
                {JSON.stringify(status.results, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 