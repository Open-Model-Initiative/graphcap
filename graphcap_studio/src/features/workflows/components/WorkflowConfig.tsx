/**
 * @license Apache-2.0
 * 
 * Workflow configuration display component
 */

interface WorkflowConfigProps {
  config: Record<string, unknown>
}

export function WorkflowConfig({ config }: WorkflowConfigProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Configuration
        </h2>
      </div>
      <div className="p-4 overflow-auto max-h-[500px]">
        <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
    </div>
  )
} 