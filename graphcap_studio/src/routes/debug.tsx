import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { healthQuery } from '../services/health'

export const Route = createFileRoute('/debug')({
  component: Debug,
})

function Debug() {
  const {
    data: health,
    error,
    isLoading,
    dataUpdatedAt,
    isFetching,
  } = useQuery(healthQuery)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Debug Information
        </h2>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Server Health
            </h3>
            {isFetching && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Refreshing...
              </span>
            )}
          </div>

          {isLoading ? (
            <p className="text-gray-600 dark:text-gray-400">
              Checking server status...
            </p>
          ) : error ? (
            <div className="text-red-600 dark:text-red-400">
              Error checking server status:{' '}
              {error instanceof Error ? error.message : 'Unknown error'}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Status:
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${
                    health?.status === 'healthy'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {health?.status}
                </span>
              </div>

              {/* Connection Details */}
              {health?.connectionDetails && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Connection Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500 dark:text-gray-400">
                      Endpoint:
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {health.connectionDetails.endpoint}
                    </div>

                    <div className="text-gray-500 dark:text-gray-400">
                      Response Time:
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {health.connectionDetails.responseTime}ms
                    </div>

                    <div className="text-gray-500 dark:text-gray-400">
                      Status Code:
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {health.connectionDetails.statusCode}
                    </div>
                  </div>
                </div>
              )}

              {/* Server Info */}
              {health?.serverInfo && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Server Information
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {health.serverInfo.version && (
                      <>
                        <div className="text-gray-500 dark:text-gray-400">
                          Version:
                        </div>
                        <div className="text-gray-900 dark:text-white">
                          {health.serverInfo.version}
                        </div>
                      </>
                    )}
                    {health.serverInfo.environment && (
                      <>
                        <div className="text-gray-500 dark:text-gray-400">
                          Environment:
                        </div>
                        <div className="text-gray-900 dark:text-white">
                          {health.serverInfo.environment}
                        </div>
                      </>
                    )}
                    <div className="text-gray-500 dark:text-gray-400">
                      Last Updated:
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {new Date(dataUpdatedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
